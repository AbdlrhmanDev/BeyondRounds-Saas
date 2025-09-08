interface UserProfile {
  id: string
  first_name: string
  last_name: string
  specialty: string
  city: string
  gender: string
  gender_preference: string
  interests: string[]
  availability_slots: string[]
  email: string
}

interface MatchScore {
  userId1: string
  userId2: string
  score: number
  breakdown: {
    specialty: number
    interests: number
    proximity: number
    availability: number
  }
}

interface MatchGroup {
  members: UserProfile[]
  averageScore: number
  groupId: string
}

export class MatchingAlgorithm {
  private readonly SPECIALTY_WEIGHT = 0.3
  private readonly INTERESTS_WEIGHT = 0.4
  private readonly PROXIMITY_WEIGHT = 0.2
  private readonly AVAILABILITY_WEIGHT = 0.1
  private readonly MIN_GROUP_SCORE = 0.55
  private readonly WEEKS_BEFORE_REMATCH = 6

  /**
   * Calculate compatibility score between two users
   */
  private calculatePairScore(user1: UserProfile, user2: UserProfile): MatchScore {
    // Specialty similarity (0-1)
    const specialtyScore = user1.specialty === user2.specialty ? 1.0 : 0.3

    // Interest overlap (0-1)
    const commonInterests = user1.interests.filter((interest) => user2.interests.includes(interest)).length
    const totalUniqueInterests = new Set([...user1.interests, ...user2.interests]).size
    const interestsScore =
      totalUniqueInterests > 0 ? commonInterests / Math.min(user1.interests.length, user2.interests.length) : 0

    // Proximity (same city = 1.0, different city = 0.0)
    const proximityScore = user1.city === user2.city ? 1.0 : 0.0

    // Availability overlap (0-1)
    const commonSlots = user1.availability_slots.filter((slot) => user2.availability_slots.includes(slot)).length
    const availabilityScore =
      commonSlots > 0 ? commonSlots / Math.min(user1.availability_slots.length, user2.availability_slots.length) : 0

    // Weighted total score
    const totalScore =
      specialtyScore * this.SPECIALTY_WEIGHT +
      interestsScore * this.INTERESTS_WEIGHT +
      proximityScore * this.PROXIMITY_WEIGHT +
      availabilityScore * this.AVAILABILITY_WEIGHT

    return {
      userId1: user1.id,
      userId2: user2.id,
      score: totalScore,
      breakdown: {
        specialty: specialtyScore,
        interests: interestsScore,
        proximity: proximityScore,
        availability: availabilityScore,
      },
    }
  }

  /**
   * Calculate average group score for multiple users
   */
  private calculateGroupScore(users: UserProfile[]): number {
    if (users.length < 2) return 0

    let totalScore = 0
    let pairCount = 0

    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const pairScore = this.calculatePairScore(users[i], users[j])
        totalScore += pairScore.score
        pairCount++
      }
    }

    return pairCount > 0 ? totalScore / pairCount : 0
  }

  /**
   * Check if group has good gender balance
   */
  private hasGoodGenderBalance(users: UserProfile[]): boolean {
    const genderCounts = users.reduce(
      (acc, user) => {
        acc[user.gender] = (acc[user.gender] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const genders = Object.keys(genderCounts)

    // Check if anyone has gender preferences that would be violated
    for (const user of users) {
      if (user.gender_preference === "same") {
        // All members should be same gender
        if (genders.length > 1) return false
      } else if (user.gender_preference === "mixed") {
        // Should have mixed genders (at least 2 different genders)
        if (genders.length < 2) return false
      }
      // 'no-preference' is always okay
    }

    // For 4-person groups, aim for 2/2 split when possible
    if (users.length === 4 && genders.length === 2) {
      const counts = Object.values(genderCounts)
      return counts.every((count) => count === 2)
    }

    // For 3-person groups, aim for 2/1 split when possible
    if (users.length === 3 && genders.length === 2) {
      const counts = Object.values(genderCounts).sort((a, b) => b - a)
      return counts[0] === 2 && counts[1] === 1
    }

    return true
  }

  /**
   * Get users who haven't been matched together in the last 6 weeks
   */
  private async getEligibleUsers(supabase: any): Promise<UserProfile[]> {
    const sixWeeksAgo = new Date()
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - this.WEEKS_BEFORE_REMATCH * 7)

    const { data: users, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_verified", true)
      .eq("is_paid", true)
      .not("interests", "is", null)
      .not("availability_slots", "is", null)
      .gte("created_at", sixWeeksAgo.toISOString())

    if (error) {
      console.error("Error fetching eligible users:", error)
      return []
    }

    return users || []
  }

  /**
   * Get recent matches to avoid re-matching same people
   */
  private async getRecentMatches(supabase: any): Promise<Set<string>> {
    const sixWeeksAgo = new Date()
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - this.WEEKS_BEFORE_REMATCH * 7)

    const { data: recentMatches, error } = await supabase
      .from("match_members")
      .select(`
        user_id,
        matches!inner(
          id,
          match_week
        )
      `)
      .gte("matches.match_week", sixWeeksAgo.toISOString().split("T")[0])

    if (error) {
      console.error("Error fetching recent matches:", error)
      return new Set()
    }

    // Create set of user pair combinations that shouldn't be matched again
    const recentPairs = new Set<string>()
    const matchGroups: Record<string, string[]> = {}

    // Group users by match ID
    recentMatches?.forEach((member) => {
      const matchId = member.matches.id
      if (!matchGroups[matchId]) {
        matchGroups[matchId] = []
      }
      matchGroups[matchId].push(member.user_id)
    })

    // Create pair combinations for each match group
    Object.values(matchGroups).forEach((group) => {
      for (let i = 0; i < group.length; i++) {
        for (let j = i + 1; j < group.length; j++) {
          const pair = [group[i], group[j]].sort().join("-")
          recentPairs.add(pair)
        }
      }
    })

    return recentPairs
  }

  /**
   * Main matching algorithm using greedy approach
   */
  async createMatches(supabase: any): Promise<MatchGroup[]> {
    console.log("Starting matching algorithm...")

    // Get eligible users
    const eligibleUsers = await this.getEligibleUsers(supabase)
    console.log(`Found ${eligibleUsers.length} eligible users`)

    if (eligibleUsers.length < 3) {
      console.log("Not enough eligible users for matching")
      return []
    }

    // Get recent matches to avoid
    const recentPairs = await this.getRecentMatches(supabase)
    console.log(`Avoiding ${recentPairs.size} recent pair combinations`)

    // Calculate all possible pair scores
    const pairScores: MatchScore[] = []
    for (let i = 0; i < eligibleUsers.length; i++) {
      for (let j = i + 1; j < eligibleUsers.length; j++) {
        const user1 = eligibleUsers[i]
        const user2 = eligibleUsers[j]

        // Skip if this pair was matched recently
        const pairKey = [user1.id, user2.id].sort().join("-")
        if (recentPairs.has(pairKey)) {
          continue
        }

        const score = this.calculatePairScore(user1, user2)
        pairScores.push(score)
      }
    }

    // Sort pairs by score (highest first)
    pairScores.sort((a, b) => b.score - a.score)

    const matchedUsers = new Set<string>()
    const groups: MatchGroup[] = []

    // Greedy matching: start with best pairs and try to expand to groups
    for (const pairScore of pairScores) {
      if (matchedUsers.has(pairScore.userId1) || matchedUsers.has(pairScore.userId2)) {
        continue
      }

      const user1 = eligibleUsers.find((u) => u.id === pairScore.userId1)!
      const user2 = eligibleUsers.find((u) => u.id === pairScore.userId2)!

      let currentGroup = [user1, user2]

      // Try to add a third member
      const remainingUsers = eligibleUsers.filter(
        (u) => !matchedUsers.has(u.id) && u.id !== user1.id && u.id !== user2.id,
      )

      for (const candidate of remainingUsers) {
        const testGroup = [...currentGroup, candidate]
        const groupScore = this.calculateGroupScore(testGroup)

        if (groupScore >= this.MIN_GROUP_SCORE && this.hasGoodGenderBalance(testGroup)) {
          currentGroup = testGroup
          break
        }
      }

      // Try to add a fourth member if we have 3
      if (currentGroup.length === 3) {
        const remainingUsers = eligibleUsers.filter(
          (u) => !matchedUsers.has(u.id) && !currentGroup.some((member) => member.id === u.id),
        )

        for (const candidate of remainingUsers) {
          const testGroup = [...currentGroup, candidate]
          const groupScore = this.calculateGroupScore(testGroup)

          if (groupScore >= this.MIN_GROUP_SCORE && this.hasGoodGenderBalance(testGroup)) {
            currentGroup = testGroup
            break
          }
        }
      }

      // Only create group if it meets minimum requirements
      const finalScore = this.calculateGroupScore(currentGroup)
      if (finalScore >= this.MIN_GROUP_SCORE && this.hasGoodGenderBalance(currentGroup)) {
        const groupId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        groups.push({
          members: currentGroup,
          averageScore: finalScore,
          groupId,
        })

        // Mark users as matched
        currentGroup.forEach((user) => matchedUsers.add(user.id))

        console.log(`Created group of ${currentGroup.length} with score ${finalScore.toFixed(3)}`)
      }
    }

    console.log(`Created ${groups.length} total groups`)
    return groups
  }

  /**
   * Save matches to database and create chat groups
   */
  async saveMatches(supabase: any, groups: MatchGroup[]): Promise<void> {
    const currentWeek = new Date().toISOString().split("T")[0] // YYYY-MM-DD format

    for (const group of groups) {
      try {
        // Create match record
        const { data: match, error: matchError } = await supabase
          .from("matches")
          .insert({
            group_name: `Week of ${currentWeek}`,
            status: "active",
            match_week: currentWeek,
          })
          .select()
          .single()

        if (matchError) {
          console.error("Error creating match:", matchError)
          continue
        }

        // Create match members
        const memberInserts = group.members.map((member) => ({
          match_id: match.id,
          user_id: member.id,
          joined_at: new Date().toISOString(),
        }))

        const { error: membersError } = await supabase.from("match_members").insert(memberInserts)

        if (membersError) {
          console.error("Error creating match members:", membersError)
          continue
        }

        // Create initial chat message from RoundsBot
        const welcomeMessage = this.generateWelcomeMessage(group.members)

        const { error: messageError } = await supabase.from("chat_messages").insert({
          match_id: match.id,
          user_id: null, // System message
          message_type: "system",
          content: welcomeMessage,
          created_at: new Date().toISOString(),
        })

        if (messageError) {
          console.error("Error creating welcome message:", messageError)
        }

        console.log(`Successfully saved match ${match.id} with ${group.members.length} members`)
      } catch (error) {
        console.error("Error saving match group:", error)
      }
    }
  }

  /**
   * Generate welcome message for new match group
   */
  private generateWelcomeMessage(members: UserProfile[]): string {
    const names = members.map((m) => m.first_name).join(", ")
    const specialties = [...new Set(members.map((m) => m.specialty))].join(", ")

    return `🎉 Welcome to your BeyondRounds group, ${names}! 

I'm RoundsBot, your friendly facilitator. You've been matched based on your specialties (${specialties}) and shared interests.

Here are some conversation starters:
• What's the most interesting case you've seen this week?
• Any exciting medical conferences or learning opportunities coming up?
• What do you like to do to unwind after long shifts?

I'll help you coordinate meetup times and keep the conversation flowing. Looking forward to seeing some great connections form! 

When you're ready to meet up, just let me know your availability and I'll help coordinate. 🏥✨`
  }
}
