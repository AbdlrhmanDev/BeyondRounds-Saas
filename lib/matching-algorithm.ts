import { UserProfile, MatchScore, MatchGroup, CompatibilityScore, getCompatibilityDescription } from './types/profile'

// Interfaces imported from types/profile.ts

export class MatchingAlgorithm {
  // Updated weights based on new requirements
  private readonly MEDICAL_SPECIALTY_WEIGHT = 0.20  // 20%
  private readonly INTERESTS_WEIGHT = 0.40          // 40%
  private readonly SOCIAL_PREFERENCES_WEIGHT = 0.20 // 20%
  private readonly AVAILABILITY_WEIGHT = 0.10       // 10%
  private readonly GEOGRAPHIC_WEIGHT = 0.05         // 5%
  private readonly LIFESTYLE_WEIGHT = 0.05          // 5%
  private readonly MIN_GROUP_SCORE = 0.55
  private readonly WEEKS_BEFORE_REMATCH = 6

  /**
   * Calculate compatibility score between two users using comprehensive matching
   */
  private calculatePairScore(user1: UserProfile, user2: UserProfile): MatchScore {
    // 1. Medical Specialty Match (20%)
    const medicalSpecialtyScore = this.calculateMedicalSpecialtyScore(user1, user2)

    // 2. Interest Compatibility (40%)
    const interestsScore = this.calculateInterestsScore(user1, user2)

    // 3. Social Preferences (20%)
    const socialScore = this.calculateSocialScore(user1, user2)

    // 4. Availability Overlap (10%)
    const availabilityScore = this.calculateAvailabilityScore(user1, user2)

    // 5. Geographic Proximity (5%)
    const geographicScore = user1.city === user2.city ? 1.0 : 0.0

    // 6. Lifestyle Compatibility (5%)
    const lifestyleScore = this.calculateLifestyleScore(user1, user2)

    // Weighted total score
    const totalScore =
      medicalSpecialtyScore * this.MEDICAL_SPECIALTY_WEIGHT +
      interestsScore * this.INTERESTS_WEIGHT +
      socialScore * this.SOCIAL_PREFERENCES_WEIGHT +
      availabilityScore * this.AVAILABILITY_WEIGHT +
      geographicScore * this.GEOGRAPHIC_WEIGHT +
      lifestyleScore * this.LIFESTYLE_WEIGHT

    return {
      userId1: user1.id,
      userId2: user2.id,
      score: totalScore,
      breakdown: {
        medicalSpecialty: medicalSpecialtyScore,
        interests: interestsScore,
        socialPreferences: socialScore,
        availability: availabilityScore,
        geographic: geographicScore,
        lifestyle: lifestyleScore,
      },
    }
  }

  /**
   * Calculate medical specialty compatibility
   */
  private calculateMedicalSpecialtyScore(user1: UserProfile, user2: UserProfile): number {
    // Use new medical_specialty array if available, fall back to legacy specialty
    const specialties1 = user1.medical_specialty && user1.medical_specialty.length > 0 
      ? user1.medical_specialty 
      : [user1.specialty]
    const specialties2 = user2.medical_specialty && user2.medical_specialty.length > 0 
      ? user2.medical_specialty 
      : [user2.specialty]

    // Check specialty preferences
    const user1WantsSame = user1.specialty_preference === 'same'
    const user1WantsDifferent = user1.specialty_preference === 'different'
    const user2WantsSame = user2.specialty_preference === 'same'
    const user2WantsDifferent = user2.specialty_preference === 'different'

    const hasCommonSpecialty = specialties1.some(s1 => specialties2.includes(s1))

    if (hasCommonSpecialty) {
      // Same specialty
      if (user1WantsSame || user2WantsSame) return 1.0
      if (user1WantsDifferent || user2WantsDifferent) return 0.3
      return 0.8 // Default bonus for same specialty
    } else {
      // Different specialties
      if (user1WantsDifferent || user2WantsDifferent) return 1.0
      if (user1WantsSame || user2WantsSame) return 0.2
      return 0.6 // Default for different specialties
    }
  }

  /**
   * Calculate comprehensive interests compatibility
   */
  private calculateInterestsScore(user1: UserProfile, user2: UserProfile): number {
    let totalScore = 0
    let categoryCount = 0

    // Sports activities (with weighted ratings)
    if (user1.sports_activities && user2.sports_activities) {
      const sportsScore = this.calculateSportsCompatibility(user1.sports_activities, user2.sports_activities)
      totalScore += sportsScore * 0.3 // 30% of interests
      categoryCount++
    }

    // Music preferences
    if (user1.music_preferences && user2.music_preferences) {
      const musicScore = this.calculateArrayOverlap(user1.music_preferences, user2.music_preferences)
      totalScore += musicScore * 0.25 // 25% of interests
      categoryCount++
    }

    // Movie/TV preferences
    if (user1.movie_tv_preferences && user2.movie_tv_preferences) {
      const movieScore = this.calculateArrayOverlap(user1.movie_tv_preferences, user2.movie_tv_preferences)
      totalScore += movieScore * 0.25 // 25% of interests
      categoryCount++
    }

    // Other interests
    if (user1.other_interests && user2.other_interests) {
      const otherScore = this.calculateArrayOverlap(user1.other_interests, user2.other_interests)
      totalScore += otherScore * 0.2 // 20% of interests
      categoryCount++
    }

    return categoryCount > 0 ? totalScore : 0
  }

  /**
   * Calculate sports compatibility with interest ratings
   */
  private calculateSportsCompatibility(sports1: Record<string, number>, sports2: Record<string, number>): number {
    const commonSports = Object.keys(sports1).filter(sport => sport in sports2)
    if (commonSports.length === 0) return 0

    let totalCompatibility = 0
    commonSports.forEach(sport => {
      const rating1 = sports1[sport]
      const rating2 = sports2[sport]
      // Higher compatibility for similar high ratings
      const avgRating = (rating1 + rating2) / 2
      const ratingDiff = Math.abs(rating1 - rating2)
      const sportScore = (avgRating / 5) * (1 - ratingDiff / 4) // Normalize and penalize differences
      totalCompatibility += sportScore
    })

    return Math.min(1.0, totalCompatibility / Math.max(commonSports.length, 3))
  }

  /**
   * Calculate social preferences compatibility
   */
  private calculateSocialScore(user1: UserProfile, user2: UserProfile): number {
    let socialScore = 0
    let factorCount = 0

    // Social energy level compatibility
    if (user1.social_energy_level && user2.social_energy_level) {
      const energyScore = this.calculateEnergyCompatibility(user1.social_energy_level, user2.social_energy_level)
      socialScore += energyScore * 0.4
      factorCount++
    }

    // Conversation style compatibility
    if (user1.conversation_style && user2.conversation_style) {
      const conversationScore = user1.conversation_style === user2.conversation_style ? 1.0 : 
        (user1.conversation_style === 'mix-everything' || user2.conversation_style === 'mix-everything') ? 0.8 : 0.5
      socialScore += conversationScore * 0.3
      factorCount++
    }

    // Preferred activities overlap
    if (user1.preferred_activities && user2.preferred_activities) {
      const activitiesScore = this.calculateArrayOverlap(user1.preferred_activities, user2.preferred_activities)
      socialScore += activitiesScore * 0.3
      factorCount++
    }

    return factorCount > 0 ? socialScore : 0
  }

  /**
   * Calculate energy level compatibility
   */
  private calculateEnergyCompatibility(energy1: string, energy2: string): number {
    if (energy1 === energy2) return 1.0
    if (energy1 === 'varies-by-mood' || energy2 === 'varies-by-mood') return 0.8
    
    const energyLevels = ['low-key-intimate', 'moderate-energy-small-groups', 'high-energy-big-groups']
    const index1 = energyLevels.indexOf(energy1)
    const index2 = energyLevels.indexOf(energy2)
    
    if (index1 === -1 || index2 === -1) return 0.5
    
    const difference = Math.abs(index1 - index2)
    return difference === 1 ? 0.7 : 0.3 // Adjacent levels get 0.7, distant get 0.3
  }

  /**
   * Calculate lifestyle compatibility
   */
  private calculateLifestyleScore(user1: UserProfile, user2: UserProfile): number {
    let lifestyleScore = 0
    let factorCount = 0

    // Life stage compatibility
    if (user1.life_stage && user2.life_stage) {
      const lifeStageScore = this.calculateLifeStageCompatibility(user1.life_stage, user2.life_stage)
      lifestyleScore += lifeStageScore * 0.4
      factorCount++
    }

    // Activity level compatibility
    if (user1.activity_level && user2.activity_level) {
      const activityScore = this.calculateActivityLevelCompatibility(user1.activity_level, user2.activity_level)
      lifestyleScore += activityScore * 0.3
      factorCount++
    }

    // Dietary restrictions compatibility (bonus for matching, neutral for different)
    if (user1.dietary_restrictions && user2.dietary_restrictions) {
      const dietaryScore = this.calculateArrayOverlap(user1.dietary_restrictions, user2.dietary_restrictions)
      lifestyleScore += Math.max(0.5, dietaryScore) * 0.3 // Minimum 0.5 to avoid penalizing differences
      factorCount++
    }

    return factorCount > 0 ? lifestyleScore : 0
  }

  /**
   * Calculate life stage compatibility
   */
  private calculateLifeStageCompatibility(stage1: string, stage2: string): number {
    if (stage1 === stage2) return 1.0
    
    // Group compatible life stages
    const parentGroups = ['young-children', 'older-children']
    const nonParentGroups = ['single-no-kids', 'relationship-no-kids', 'married-no-kids']
    
    const isParent1 = parentGroups.includes(stage1)
    const isParent2 = parentGroups.includes(stage2)
    const isNonParent1 = nonParentGroups.includes(stage1)
    const isNonParent2 = nonParentGroups.includes(stage2)
    
    if ((isParent1 && isParent2) || (isNonParent1 && isNonParent2)) return 0.8
    if (stage1 === 'empty-nester' || stage2 === 'empty-nester') return 0.7 // Flexible
    if (stage1 === 'prefer-not-say' || stage2 === 'prefer-not-say') return 0.6
    
    return 0.4 // Different life stages
  }

  /**
   * Calculate activity level compatibility
   */
  private calculateActivityLevelCompatibility(level1: string, level2: string): number {
    if (level1 === level2) return 1.0
    
    const activityLevels = ['prefer-non-physical', 'occasionally-active', 'moderately-active', 'active', 'very-active']
    const index1 = activityLevels.indexOf(level1)
    const index2 = activityLevels.indexOf(level2)
    
    if (index1 === -1 || index2 === -1) return 0.5
    
    const difference = Math.abs(index1 - index2)
    if (difference === 1) return 0.8
    if (difference === 2) return 0.6
    return 0.3
  }

  /**
   * Calculate availability overlap
   */
  private calculateAvailabilityScore(user1: UserProfile, user2: UserProfile): number {
    const commonSlots = user1.availability_slots.filter((slot) => user2.availability_slots.includes(slot)).length
    return commonSlots > 0 ? commonSlots / Math.min(user1.availability_slots.length, user2.availability_slots.length) : 0
  }

  /**
   * Calculate overlap between two arrays
   */
  private calculateArrayOverlap(array1: string[], array2: string[]): number {
    if (!array1.length || !array2.length) return 0
    const commonItems = array1.filter((item) => array2.includes(item)).length
    return commonItems / Math.min(array1.length, array2.length)
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
   * Check if group has good gender balance based on comprehensive preferences
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
      if (user.gender_preference === "same-gender-only") {
        // All members must be same gender
        if (genders.length > 1) return false
      } else if (user.gender_preference === "mixed") {
        // Must have mixed genders (at least 2 different genders)
        if (genders.length < 2) return false
      } else if (user.gender_preference === "same-gender-preferred") {
        // Prefer same gender but mixed is okay - slight preference bonus but not a hard requirement
        // This is handled in scoring, not in filtering
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
      // .gte("created_at", sixWeeksAgo.toISOString())

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
    recentMatches?.forEach((member: any) => {
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
    
    // Use new medical_specialty field if available, fall back to legacy specialty
    const allSpecialties = members.flatMap(m => 
      m.medical_specialty && m.medical_specialty.length > 0 
        ? m.medical_specialty 
        : [m.specialty]
    )
    const uniqueSpecialties = [...new Set(allSpecialties)].join(", ")

    return `🎉 Welcome to your BeyondRounds group, ${names}! 

I'm RoundsBot, your friendly facilitator. You've been matched based on your specialties (${uniqueSpecialties}) and shared interests.

Here are some conversation starters:
• What's the most interesting case you've seen this week?
• Any exciting medical conferences or learning opportunities coming up?
• What do you like to do to unwind after long shifts?

I'll help you coordinate meetup times and keep the conversation flowing. Looking forward to seeing some great connections form! 

When you're ready to meet up, just let me know your availability and I'll help coordinate. 🏥✨`
  }

  /**
   * Calculate compatibility percentage for display (0-100)
   */
  public calculateCompatibilityPercentage(user1: UserProfile, user2: UserProfile): number {
    const matchScore = this.calculatePairScore(user1, user2)
    return Math.round(matchScore.score * 100)
  }

  /**
   * Get compatibility description for display
   */
  public getCompatibilityDisplay(user1: UserProfile, user2: UserProfile): CompatibilityScore {
    const percentage = this.calculateCompatibilityPercentage(user1, user2)
    return getCompatibilityDescription(percentage)
  }
}
