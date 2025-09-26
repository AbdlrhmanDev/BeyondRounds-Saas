// ==============================================
// Enhanced Matching Algorithm with Comprehensive Scoring
// ==============================================
// Updated matching algorithm with new weighted scoring system:
// - Medical Specialty Match: 20%
// - Interest Compatibility: 40%
// - Social Preferences: 20%
// - Availability Overlap: 10%
// - Geographic Proximity: 5%
// - Lifestyle Compatibility: 5%

import { 
  type EligibleUser, 
  type CompatibilityScore, 
  type MatchingAlgorithmGroup,
  type User,
  type GenderPreference,
  type SpecialtyPreference,
  type SocialEnergyLevel,
  type ConversationStyle,
  type MeetingFrequency,
  type LifeStage,
  type ActivityLevel,
  type IdealWeekend
} from '@/lib/types/database'

export interface EnhancedCompatibilityScore extends Omit<CompatibilityScore, 'breakdown'> {
  breakdown: {
    specialty: number;
    interests: number;
    social: number;
    availability: number;
    geographic: number;
    lifestyle: number;
  };
  description: string;
}

export interface MatchingWeights {
  specialty: number;
  interests: number;
  social: number;
  availability: number;
  geographic: number;
  lifestyle: number;
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  specialty: 0.20,    // 20%
  interests: 0.40,    // 40%
  social: 0.20,       // 20%
  availability: 0.10,  // 10%
  geographic: 0.05,   // 5%
  lifestyle: 0.05     // 5%
}

// ==============================================
// CORE MATCHING FUNCTIONS
// ==============================================

export function calculateCompatibilityScore(
  user1: EligibleUser, 
  user2: EligibleUser,
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): EnhancedCompatibilityScore {
  const specialtyScore = calculateSpecialtyCompatibility(user1, user2)
  const interestsScore = calculateInterestsCompatibility(user1, user2)
  const socialScore = calculateSocialCompatibility(user1, user2)
  const availabilityScore = calculateAvailabilityCompatibility(user1, user2)
  const geographicScore = calculateGeographicCompatibility(user1, user2)
  const lifestyleScore = calculateLifestyleCompatibility(user1, user2)

  const totalScore = 
    specialtyScore * weights.specialty +
    interestsScore * weights.interests +
    socialScore * weights.social +
    availabilityScore * weights.availability +
    geographicScore * weights.geographic +
    lifestyleScore * weights.lifestyle

  return {
    user1_id: user1.id,
    user2_id: user2.id,
    score: Math.round(totalScore * 100) / 100,
    breakdown: {
      specialty: Math.round(specialtyScore * 100) / 100,
      interests: Math.round(interestsScore * 100) / 100,
      social: Math.round(socialScore * 100) / 100,
      availability: Math.round(availabilityScore * 100) / 100,
      geographic: Math.round(geographicScore * 100) / 100,
      lifestyle: Math.round(lifestyleScore * 100) / 100
    },
    description: getCompatibilityDescription(totalScore)
  }
}

// ==============================================
// SPECIALTY COMPATIBILITY (20%)
// ==============================================

function calculateSpecialtyCompatibility(user1: EligibleUser, user2: EligibleUser): number {
  const specialties1 = user1.specialties || []
  const specialties2 = user2.specialties || []
  
  if (specialties1.length === 0 || specialties2.length === 0) {
    return 0.5 // Neutral score if no specialties specified
  }

  // Check for exact specialty matches
  const commonSpecialties = specialties1.filter(s => specialties2.includes(s))
  const specialtyMatchRatio = commonSpecialties.length / Math.max(specialties1.length, specialties2.length)

  // Apply specialty preference logic
  const preference1 = (user1 as any).specialty_preference
  const preference2 = (user2 as any).specialty_preference

  let preferenceMultiplier = 1.0

  if (preference1 === 'same_specialty' || preference2 === 'same_specialty') {
    // Boost score if they prefer same specialty and have matches
    preferenceMultiplier = commonSpecialties.length > 0 ? 1.3 : 0.7
  } else if (preference1 === 'different_specialties' || preference2 === 'different_specialties') {
    // Boost score if they prefer different specialties and have few/no matches
    preferenceMultiplier = commonSpecialties.length === 0 ? 1.2 : 0.8
  }

  return Math.min(specialtyMatchRatio * preferenceMultiplier, 1.0)
}

// ==============================================
// INTERESTS COMPATIBILITY (40%)
// ==============================================

function calculateInterestsCompatibility(user1: EligibleUser, user2: EligibleUser): number {
  const sports1 = user1.sports_activities || {}
  const sports2 = user2.sports_activities || {}
  const music1 = user1.music_genres || []
  const music2 = user2.music_genres || []
  const movies1 = user1.movie_genres || []
  const movies2 = user2.movie_genres || []
  const interests1 = user1.other_interests || []
  const interests2 = user2.other_interests || []

  // Calculate sports compatibility with weighted ratings
  const sportsScore = calculateSportsCompatibility(sports1, sports2)
  
  // Calculate entertainment compatibility
  const musicScore = calculateArrayCompatibility(music1, music2)
  const moviesScore = calculateArrayCompatibility(movies1, movies2)
  const interestsScore = calculateArrayCompatibility(interests1, interests2)

  // Weighted average of all interest categories
  return (
    sportsScore * 0.4 +      // Sports are most important (40%)
    musicScore * 0.2 +       // Music (20%)
    moviesScore * 0.2 +      // Movies (20%)
    interestsScore * 0.2     // Other interests (20%)
  )
}

function calculateSportsCompatibility(sports1: Record<string, number>, sports2: Record<string, number>): number {
  const sports1Keys = Object.keys(sports1)
  const sports2Keys = Object.keys(sports2)
  
  if (sports1Keys.length === 0 || sports2Keys.length === 0) {
    return 0.5 // Neutral score if no sports specified
  }

  const commonSports = sports1Keys.filter(sport => sports2Keys.includes(sport))
  
  if (commonSports.length === 0) {
    return 0.2 // Low score if no common sports
  }

  // Calculate weighted compatibility based on interest ratings
  let totalCompatibility = 0
  let totalWeight = 0

  for (const sport of commonSports) {
    const rating1 = sports1[sport] || 0
    const rating2 = sports2[sport] || 0
    
    // Compatibility is higher when both users have high ratings for the same sport
    const compatibility = Math.min(rating1, rating2) / 5.0
    const weight = (rating1 + rating2) / 10.0 // Weight by combined interest level
    
    totalCompatibility += compatibility * weight
    totalWeight += weight
  }

  return totalWeight > 0 ? totalCompatibility / totalWeight : 0.5
}

function calculateArrayCompatibility(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 || arr2.length === 0) {
    return 0.5 // Neutral score if no preferences specified
  }

  const commonItems = arr1.filter(item => arr2.includes(item))
  const totalItems = new Set([...arr1, ...arr2]).size
  
  return commonItems.length / totalItems
}

// ==============================================
// SOCIAL COMPATIBILITY (20%)
// ==============================================

function calculateSocialCompatibility(user1: EligibleUser, user2: EligibleUser): number {
  const activities1 = user1.meeting_activities || []
  const activities2 = user2.meeting_activities || []
  const energy1 = user1.social_energy_level
  const energy2 = user2.social_energy_level
  const conversation1 = user1.conversation_style
  const conversation2 = user2.conversation_style

  // Meeting activities compatibility
  const activitiesScore = calculateArrayCompatibility(activities1, activities2)

  // Social energy level compatibility
  const energyScore = calculateSocialEnergyCompatibility(energy1, energy2)

  // Conversation style compatibility
  const conversationScore = calculateConversationCompatibility(conversation1, conversation2)

  return (activitiesScore * 0.5 + energyScore * 0.3 + conversationScore * 0.2)
}

function calculateSocialEnergyCompatibility(energy1?: SocialEnergyLevel, energy2?: SocialEnergyLevel): number {
  if (!energy1 || !energy2) return 0.5

  const energyMap: Record<SocialEnergyLevel, number> = {
    'very_high': 4,
    'high': 3,
    'moderate': 2,
    'low': 2.5
  }

  const diff = Math.abs(energyMap[energy1] - energyMap[energy2])
  return Math.max(0, 1 - diff / 3) // Normalize to 0-1 range
}

function calculateConversationCompatibility(style1?: ConversationStyle, style2?: ConversationStyle): number {
  if (!style1 || !style2) return 0.5

  // Compatible conversation styles
  const compatiblePairs: [ConversationStyle, ConversationStyle][] = [
    ['deep_philosophical', 'deep_philosophical'],
    ['light_casual', 'light_casual'],
    ['professional_focused', 'professional_focused'],
    ['professional_focused', 'professional_focused'],
    ['mixed', 'mixed'],
    ['mixed', 'deep_philosophical'],
    ['mixed', 'light_casual'],
    ['mixed', 'professional_focused'],
    ['mixed', 'professional_focused']
  ]

  const isCompatible = compatiblePairs.some(([s1, s2]) => 
    (s1 === style1 && s2 === style2) || (s1 === style2 && s2 === style1)
  )

  return isCompatible ? 1.0 : 0.3
}

// ==============================================
// AVAILABILITY COMPATIBILITY (10%)
// ==============================================

function calculateAvailabilityCompatibility(user1: EligibleUser, user2: EligibleUser): number {
  const times1 = user1.preferred_times || []
  const times2 = user2.preferred_times || []
  const frequency1 = user1.meeting_frequency
  const frequency2 = user2.meeting_frequency

  // Time overlap compatibility
  const timeScore = calculateArrayCompatibility(times1, times2)

  // Meeting frequency compatibility
  const frequencyScore = calculateFrequencyCompatibility(frequency1, frequency2)

  return (timeScore * 0.7 + frequencyScore * 0.3)
}

function calculateFrequencyCompatibility(freq1?: MeetingFrequency, freq2?: MeetingFrequency): number {
  if (!freq1 || !freq2) return 0.5

  const frequencyMap: Record<MeetingFrequency, number> = {
    'weekly': 4,
    'bi_weekly': 3,
    'monthly': 2,
    'flexible': 2.5
  }

  const diff = Math.abs(frequencyMap[freq1] - frequencyMap[freq2])
  return Math.max(0, 1 - diff / 3) // Normalize to 0-1 range
}

// ==============================================
// GEOGRAPHIC COMPATIBILITY (5%)
// ==============================================

function calculateGeographicCompatibility(user1: EligibleUser, user2: EligibleUser): number {
  const city1 = user1.city?.toLowerCase() || ''
  const city2 = user2.city?.toLowerCase() || ''

  if (!city1 || !city2) return 0.5

  // Exact city match
  if (city1 === city2) return 1.0

  // Same metropolitan area (simplified logic)
  const metroAreas: Record<string, string[]> = {
    'new york': ['brooklyn', 'queens', 'manhattan', 'bronx', 'staten island'],
    'los angeles': ['beverly hills', 'santa monica', 'pasadena', 'burbank'],
    'chicago': ['evanston', 'oak park', 'skokie'],
    'houston': ['katy', 'sugar land', 'the woodlands'],
    'phoenix': ['scottsdale', 'tempe', 'mesa'],
    'philadelphia': ['camden', 'cherry hill'],
    'san antonio': ['new braunfels', 'universal city'],
    'san diego': ['la jolla', 'del mar', 'encinitas'],
    'dallas': ['plano', 'richardson', 'garland'],
    'san jose': ['santa clara', 'sunnyvale', 'mountain view']
  }

  for (const [metro, cities] of Object.entries(metroAreas)) {
    if ((city1 === metro || cities.includes(city1)) && 
        (city2 === metro || cities.includes(city2))) {
      return 0.8
    }
  }

  // Different cities - lower score
  return 0.3
}

// ==============================================
// LIFESTYLE COMPATIBILITY (5%)
// ==============================================

function calculateLifestyleCompatibility(user1: EligibleUser, user2: EligibleUser): number {
  const lifeStage1 = user1.life_stage
  const lifeStage2 = user2.life_stage
  const idealWeekend1 = user1.ideal_weekend
  const idealWeekend2 = user2.ideal_weekend

  // Life stage compatibility
  const lifeStageScore = calculateLifeStageCompatibility(lifeStage1, lifeStage2)

  // Ideal weekend compatibility
  const weekendScore = calculateWeekendCompatibility(idealWeekend1, idealWeekend2)

  return (lifeStageScore * 0.6 + weekendScore * 0.4)
}

function calculateLifeStageCompatibility(stage1?: LifeStage, stage2?: LifeStage): number {
  if (!stage1 || !stage2) return 0.5

  // Compatible life stages
  const compatibleStages: Record<LifeStage, LifeStage[]> = {
    'single': ['single', 'dating'],
    'dating': ['single', 'dating', 'married'],
    'married': ['dating', 'married'],
    'parent': ['parent', 'parent'],
    'parent': ['parent', 'parent', 'empty_nester'],
    'empty_nester': ['parent', 'empty_nester'],
    'prefer-not-to-say': ['single', 'dating', 'married']
  }

  return compatibleStages[stage1]?.includes(stage2) ? 1.0 : 0.3
}

function calculateWeekendCompatibility(weekend1?: string, weekend2?: string): number {
  if (!weekend1 || !weekend2) return 0.5

  // Compatible weekend preferences
  const compatibleWeekends: Record<IdealWeekend, IdealWeekend[]> = {
    'adventure_exploration': ['adventure_exploration', 'sports_fitness', 'mix_active_relaxing'],
    'relaxation_self_care': ['relaxation_self_care', 'home-projects', 'mix_active_relaxing'],
    'social_activities': ['social_activities', 'cultural_activities', 'mix_active_relaxing'],
    'cultural_activities': ['cultural_activities', 'social_activities', 'mix_active_relaxing'],
    'sports_fitness': ['sports_fitness', 'adventure_exploration', 'mix_active_relaxing'],
    'home-projects': ['home-projects', 'relaxation_self_care', 'mix_active_relaxing'],
    'mix_active_relaxing': ['adventure_exploration', 'relaxation_self_care', 'social_activities', 'cultural_activities', 'sports_fitness', 'home-projects', 'mix_active_relaxing']
  }

  return compatibleWeekends[weekend1 as IdealWeekend]?.includes(weekend2 as IdealWeekend) ? 1.0 : 0.3
}

// ==============================================
// COMPATIBILITY DESCRIPTION
// ==============================================

function getCompatibilityDescription(score: number): string {
  if (score >= 0.90) return "Excellent Match! You have tons in common"
  if (score >= 0.80) return "Great Match! Strong compatibility"
  if (score >= 0.70) return "Good Match! Several shared interests"
  if (score >= 0.60) return "Decent Match! Some common ground"
  if (score >= 0.50) return "Moderate Match! Room to explore differences"
  return "Limited Match! Few shared interests"
}

// ==============================================
// GROUP FORMATION ALGORITHM
// ==============================================

export function formOptimalGroups(
  users: EligibleUser[], 
  targetGroupSize: number = 3,
  minCompatibilityScore: number = 0.6
): MatchingAlgorithmGroup[] {
  const groups: MatchingAlgorithmGroup[] = []
  const usedUsers = new Set<string>()

  // Sort users by profile completeness and activity level
  const sortedUsers = users.sort((a, b) => {
    const completenessA = calculateProfileCompleteness(a)
    const completenessB = calculateProfileCompleteness(b)
    return completenessB - completenessA
  })

  for (const user of sortedUsers) {
    if (usedUsers.has(user.id)) continue

    const group = [user]
    usedUsers.add(user.id)

    // Find compatible users for this group
    const compatibleUsers = findCompatibleUsers(user, sortedUsers, usedUsers, minCompatibilityScore)
    
    for (const compatibleUser of compatibleUsers) {
      if (group.length >= targetGroupSize) break
      
      // Check if this user is compatible with all existing group members
      const isCompatibleWithGroup = group.every(member => {
        const score = calculateCompatibilityScore(member, compatibleUser)
        return score.score >= minCompatibilityScore
      })

      if (isCompatibleWithGroup) {
        group.push(compatibleUser)
        usedUsers.add(compatibleUser.id)
      }
    }

    // Only create group if it meets minimum size
    if (group.length >= targetGroupSize) {
      const averageScore = calculateGroupAverageScore(group)
      const groupName = generateGroupName(group)
      
      groups.push({
        members: group,
        averageScore,
        groupName
      })
    }
  }

  return groups
}

function findCompatibleUsers(
  targetUser: EligibleUser,
  allUsers: EligibleUser[],
  usedUsers: Set<string>,
  minScore: number
): EligibleUser[] {
  return allUsers
    .filter(user => !usedUsers.has(user.id) && user.id !== targetUser.id)
    .map(user => ({
      user,
      score: calculateCompatibilityScore(targetUser, user)
    }))
    .filter(({ score }) => score.score >= minScore)
    .sort((a, b) => b.score.score - a.score.score)
    .map(({ user }) => user)
}

function calculateGroupAverageScore(group: EligibleUser[]): number {
  if (group.length < 2) return 0

  let totalScore = 0
  let pairCount = 0

  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const score = calculateCompatibilityScore(group[i], group[j])
      totalScore += score.score
      pairCount++
    }
  }

  return pairCount > 0 ? totalScore / pairCount : 0
}

function generateGroupName(group: EligibleUser[]): string {
  const specialties = group.flatMap(user => user.specialties).slice(0, 2)
  const cities = [...new Set(group.map(user => user.city))].slice(0, 2)
  
  const specialtyPart = specialties.length > 0 ? specialties.join(' & ') : 'Medical Professionals'
  const cityPart = cities.length > 0 ? ` from ${cities.join(' & ')}` : ''
  
  return `${specialtyPart}${cityPart}`
}

function calculateProfileCompleteness(user: EligibleUser): number {
  const fields = [
    user.first_name,
    user.city,
    user.specialties?.length,
    Object.keys(user.sports_activities || {}).length,
    user.music_genres?.length,
    user.movie_genres?.length,
    user.meeting_activities?.length,
    user.preferred_times?.length,
    user.looking_for?.length
  ]

  const filledFields = fields.filter(field => field && (typeof field === 'number' ? field > 0 : true)).length
  return filledFields / fields.length
}

// ==============================================
// EXPORTED UTILITIES
// ==============================================

export {
  calculateSpecialtyCompatibility,
  calculateInterestsCompatibility,
  calculateSocialCompatibility,
  calculateAvailabilityCompatibility,
  calculateGeographicCompatibility,
  calculateLifestyleCompatibility,
  getCompatibilityDescription
}
