#!/usr/bin/env tsx

/**
 * BeyondRounds Weekly Matching Engine Simulation
 * 
 * This script demonstrates the complete 7-step matching process
 * with sample data that matches your exact specification.
 */

import { EligibleUser, MatchScore, MatchGroup, WeeklyMatchingEngine, MatchingResults } from '../lib/weekly-matching-engine'

// ===============================================
// SAMPLE DATA GENERATION
// ===============================================

const SAMPLE_CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Mecca']
const MEDICAL_SPECIALTIES = [
  'Internal Medicine', 'Surgery', 'Pediatrics', 'Cardiology', 
  'Dermatology', 'Emergency Medicine', 'Radiology', 'Orthopedics'
]
const INTERESTS = [
  'AI', 'Wellness', 'Fitness', 'Reading', 'Travel', 'Cooking', 
  'Photography', 'Sports', 'Music', 'Movies', 'Gaming', 'Art'
]
const AVAILABILITY_SLOTS = [
  'Thursday 4PM', 'Friday 10AM', 'Friday 6PM', 'Saturday 2PM', 
  'Saturday 7PM', 'Sunday 10AM', 'Sunday 4PM'
]

function generateSampleUsers(count: number): EligibleUser[] {
  const users: EligibleUser[] = []
  const firstNames = ['Ahmed', 'Sara', 'Omar', 'Fatima', 'Ali', 'Nora', 'Khalid', 'Lina', 'Mohammed', 'Reem']
  const lastNames = ['Al-Ahmad', 'Al-Rashid', 'Al-Mansour', 'Al-Zahra', 'Al-Fahad', 'Al-Nasser', 'Al-Otaibi', 'Al-Dosari']

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[i % lastNames.length]
    const city = SAMPLE_CITIES[Math.floor(Math.random() * SAMPLE_CITIES.length)]
    
    // Ensure each city has at least 3 users
    const cityIndex = Math.floor(i / 3) % SAMPLE_CITIES.length
    const assignedCity = SAMPLE_CITIES[cityIndex]

    users.push({
      id: `user_${i + 1}`,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      specialty: MEDICAL_SPECIALTIES[Math.floor(Math.random() * MEDICAL_SPECIALTIES.length)],
      medical_specialty: [MEDICAL_SPECIALTIES[Math.floor(Math.random() * MEDICAL_SPECIALTIES.length)]],
      city: assignedCity,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      gender_preference: Math.random() > 0.7 ? 'same-gender-preferred' : 'no-preference',
      interests: INTERESTS.slice(0, 3 + Math.floor(Math.random() * 4)),
      other_interests: INTERESTS.slice(4, 6 + Math.floor(Math.random() * 3)),
      availability_slots: AVAILABILITY_SLOTS.slice(0, 2 + Math.floor(Math.random() * 4)),
      is_verified: true,
      is_paid: true,
      onboarding_completed: true,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
      sports_activities: {
        'Running': 4,
        'Swimming': 3,
        'Tennis': Math.floor(Math.random() * 5) + 1
      },
      music_preferences: ['Pop', 'Rock'],
      movie_tv_preferences: ['Drama', 'Comedy'],
      preferred_activities: ['Coffee meetups', 'Dinner at restaurants'],
      social_energy_level: 'moderate-energy-small-groups',
      conversation_style: 'mix-everything',
      life_stage: 'single-no-kids',
      activity_level: 'active',
      dietary_restrictions: ['No restrictions']
    })
  }

  return users
}

// ===============================================
// MOCK SUPABASE CLIENT
// ===============================================

class MockSupabaseClient {
  private users: EligibleUser[]
  private matches: any[] = []
  private matchMembers: any[] = []
  private chatMessages: any[] = []

  constructor(users: EligibleUser[]) {
    this.users = users
  }

  from(table: string) {
    return {
      select: (fields: string) => ({
        eq: (field: string, value: any) => ({
          lt: (field2: string, value2: any) => ({
            then: () => Promise.resolve({ data: this.users, error: null })
          }),
          then: () => Promise.resolve({ 
            data: table === 'matches' ? this.matches : [], 
            error: null 
          })
        }),
        gte: (field: string, value: any) => ({
          then: () => Promise.resolve({ data: [], error: null })
        }),
        limit: (n: number) => ({
          then: () => Promise.resolve({ 
            data: table === 'matches' ? this.matches.slice(0, n) : [], 
            error: null 
          })
        }),
        then: () => Promise.resolve({ data: this.users, error: null })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => {
            if (table === 'matches') {
              const match = { id: `match_${this.matches.length + 1}`, ...data }
              this.matches.push(match)
              return Promise.resolve({ data: match, error: null })
            } else if (table === 'match_members') {
              const members = Array.isArray(data) ? data : [data]
              const insertedMembers = members.map((member, i) => ({
                id: `member_${this.matchMembers.length + i + 1}`,
                ...member
              }))
              this.matchMembers.push(...insertedMembers)
              return Promise.resolve({ data: insertedMembers, error: null })
            } else if (table === 'chat_messages') {
              const message = { id: `msg_${this.chatMessages.length + 1}`, ...data }
              this.chatMessages.push(message)
              return Promise.resolve({ data: message, error: null })
            }
            return Promise.resolve({ data: null, error: null })
          },
          then: () => {
            if (table === 'match_members') {
              const members = Array.isArray(data) ? data : [data]
              const insertedMembers = members.map((member, i) => ({
                id: `member_${this.matchMembers.length + i + 1}`,
                ...member
              }))
              this.matchMembers.push(...insertedMembers)
              return Promise.resolve({ data: insertedMembers, error: null })
            }
            return Promise.resolve({ data: null, error: null })
          }
        }),
        then: () => Promise.resolve({ data: null, error: null })
      })
    }
  }
}

// ===============================================
// MOCK MATCHING ENGINE
// ===============================================

class MockWeeklyMatchingEngine extends WeeklyMatchingEngine {
  constructor(mockSupabase: any) {
    super(mockSupabase)
  }

  async fetchEligibleUsers(): Promise<EligibleUser[]> {
    console.log('🔍 Step 1: Fetching eligible users...')
    
    // Simulate the filtering logic
    const { data: users, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('is_verified', true)
      .eq('is_paid', true)
      .lt('created_at', new Date().toISOString())

    if (error || !users) {
      console.log('❌ Error or no users found')
      return []
    }

    // Filter by city size (≥ 3 users)
    const usersByCity = users.reduce((acc: Record<string, EligibleUser[]>, user: EligibleUser) => {
      if (!acc[user.city]) acc[user.city] = []
      acc[user.city].push(user)
      return acc
    }, {})

    const eligibleUsers = Object.values(usersByCity)
      .filter((cityUsers: EligibleUser[]) => cityUsers.length >= 3)
      .flat()

    console.log(`✅ Step 1 Complete: ${eligibleUsers.length} eligible users from ${Object.keys(usersByCity).filter(city => usersByCity[city].length >= 3).length} cities`)
    
    return eligibleUsers
  }
}

// ===============================================
// MAIN SIMULATION FUNCTION
// ===============================================

async function simulateMatchingEngine() {
  console.log('🚀 BeyondRounds Weekly Matching Engine Simulation')
  console.log('=' .repeat(60))
  console.log()

  // Generate sample data
  const sampleUsers = generateSampleUsers(20) // Generate 20 sample users
  console.log('📊 Generated Sample Data:')
  console.log(`   • Total users: ${sampleUsers.length}`)
  console.log(`   • Cities: ${[...new Set(sampleUsers.map(u => u.city))].join(', ')}`)
  console.log(`   • Specialties: ${[...new Set(sampleUsers.map(u => u.specialty))].length} different`)
  console.log()

  // Create mock Supabase client
  const mockSupabase = new MockSupabaseClient(sampleUsers)
  
  // Create matching engine
  const engine = new MockWeeklyMatchingEngine(mockSupabase)

  console.log('🎯 Starting 7-Step Matching Process')
  console.log('=' .repeat(60))
  console.log()

  try {
    // Run the complete matching process
    const results = await engine.runWeeklyMatching()

    // Display detailed results
    console.log()
    console.log('📋 FINAL MATCHING RESULTS')
    console.log('=' .repeat(60))
    console.log()
    
    console.log('📊 Summary Statistics:')
    console.log(`   • Eligible users: ${results.eligibleUsers.length}`)
    console.log(`   • Valid pairs (score ≥ 0.55): ${results.scoredPairings.length}`)
    console.log(`   • Groups created: ${results.finalGroups.length}`)
    console.log(`   • Users matched: ${results.finalGroups.reduce((sum, g) => sum + g.members.length, 0)}`)
    console.log(`   • Notifications prepared: ${results.notifications.length}`)
    console.log(`   • Rollover candidates: ${results.rolloverCandidates.length}`)
    console.log()

    if (results.finalGroups.length > 0) {
      console.log('👥 Created Groups:')
      results.finalGroups.forEach((group, index) => {
        console.log(`   ${group.groupName} (Score: ${group.averageScore.toFixed(3)}):`)
        group.members.forEach(member => {
          console.log(`     • ${member.first_name} ${member.last_name} - ${member.specialty} (${member.city})`)
        })
        console.log()
      })
    }

    if (results.scoredPairings.length > 0) {
      console.log('🔗 Top 5 Scoring Pairs:')
      results.scoredPairings.slice(0, 5).forEach((pair, index) => {
        const user1 = results.eligibleUsers.find(u => u.id === pair.userId1)
        const user2 = results.eligibleUsers.find(u => u.id === pair.userId2)
        console.log(`   ${index + 1}. ${user1?.first_name} & ${user2?.first_name} (Score: ${pair.score.toFixed(3)})`)
        console.log(`      Breakdown: Specialty=${pair.breakdown.specialtySimilarity.toFixed(2)}, Interests=${pair.breakdown.sharedInterestRatio.toFixed(2)}, City=${pair.breakdown.sameCity}, Availability=${pair.breakdown.overlappingAvailabilityRatio.toFixed(2)}`)
      })
      console.log()
    }

    if (results.notifications.length > 0) {
      console.log('📧 Sample Notifications (first 3):')
      results.notifications.slice(0, 3).forEach((notif, index) => {
        console.log(`   ${index + 1}. To: ${notif.firstName} (${notif.email})`)
        console.log(`      Subject: 🎉 You've been matched!`)
        console.log(`      Group: ${notif.groupName} with ${notif.groupMembers.length} other doctors`)
        console.log(`      Body: Your Rounds group is live. Head to the chat to meet your fellow doctors!`)
        console.log()
      })
    }

    if (results.rolloverCandidates.length > 0) {
      console.log('🔄 Rollover Candidates (for next Thursday):')
      results.rolloverCandidates.forEach(user => {
        console.log(`   • ${user.first_name} ${user.last_name} - ${user.specialty} (${user.city})`)
      })
      console.log()
    }

    console.log('✅ Simulation completed successfully!')
    
    return results

  } catch (error) {
    console.error('❌ Simulation failed:', error)
    throw error
  }
}

// ===============================================
// RUN SIMULATION
// ===============================================

if (require.main === module) {
  simulateMatchingEngine()
    .then(() => {
      console.log('🎉 Simulation finished!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Simulation error:', error)
      process.exit(1)
    })
}

export { simulateMatchingEngine, generateSampleUsers }

