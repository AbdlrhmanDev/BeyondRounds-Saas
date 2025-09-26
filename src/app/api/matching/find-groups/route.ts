import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

/* eslint-disable @typescript-eslint/no-explicit-any */
 
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    
    // Check if service client is properly initialized
    if (!supabase) {
      console.error('❌ Failed to initialize Supabase service client')
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      )
    }
    
    const { userId, profileId, preferences } = await request.json()
 
    if (!userId || !profileId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Profile ID are required' },
        { status: 400 }
      )
    }
 
    console.log(`🔍 Finding group matches for user: ${userId}`)
 
    // Get user's profile and interests
    console.log(`👤 Fetching user profile for user: ${userId}`)
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_interests (*),
        user_preferences (*)
      `)
      .eq('user_id', userId)
      .single()
 
    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError)
      return NextResponse.json(
        { success: false, error: 'Profile not found', details: profileError.message },
        { status: 404 }
      )
    }
 
    console.log(`✅ User profile found: ${userProfile.first_name} ${userProfile.last_name}`)
 
    // Get potential matches (other active profiles)
    console.log(`🔍 Fetching potential profiles for user: ${userId}`)
    const { data: potentialProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_interests (*),
        user_preferences (*)
      `)
      .neq('user_id', userId)
      .eq('is_verified', true)
      .eq('is_banned', false)
      .eq('onboarding_completed', true)
      .limit(50) // Limit for performance
 
    if (profilesError) {
      console.error('❌ Error fetching potential profiles:', profilesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch potential matches', details: profilesError.message },
        { status: 500 }
      )
    }
 
    console.log(`✅ Found ${potentialProfiles?.length || 0} potential profiles`)
 
    // Calculate compatibility scores and create groups
    const matches = await calculateGroupMatches(userProfile, potentialProfiles || [], preferences)
 
    console.log(`✅ Found ${matches.length} group matches`)
 
    return NextResponse.json({
      success: true,
      data: {
        matches,
        totalFound: matches.length
      }
    })
 
  } catch (error) {
    console.error('❌ Failed to find group matches:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to find group matches',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
 
async function calculateGroupMatches(userProfile: any, potentialProfiles: any[], preferences: any) {
  const matches: any[] = []
  const groupSize = preferences.groupSize || 3
  const minCompatibility = preferences.minCompatibility || 50
 
  // Calculate compatibility for each potential match
  const scoredProfiles = potentialProfiles.map(profile => ({
    ...profile,
    compatibility: calculateCompatibility(userProfile, profile)
  })).filter(profile => profile.compatibility >= minCompatibility)
 
  // Sort by compatibility
  scoredProfiles.sort((a, b) => b.compatibility - a.compatibility)
 
  // Create groups using improved algorithm
  const usedProfiles = new Set()
  
  for (let i = 0; i < scoredProfiles.length && matches.length < 8; i++) {
    if (usedProfiles.has(scoredProfiles[i].id)) continue
 
    const groupMembers = [scoredProfiles[i]]
    usedProfiles.add(scoredProfiles[i].id)
 
    // Find compatible members for this group with better compatibility checking
    for (let j = i + 1; j < scoredProfiles.length && groupMembers.length < groupSize; j++) {
      if (usedProfiles.has(scoredProfiles[j].id)) continue
 
      // Check compatibility with all existing group members
      const compatibilityScores = groupMembers.map(member => 
        calculateCompatibility(member, scoredProfiles[j])
      )
      
      const avgCompatibility = compatibilityScores.reduce((sum, score) => sum + score, 0) / compatibilityScores.length
      const minCompatibilityInGroup = Math.min(...compatibilityScores)
 
      // Add member if they're compatible with all existing members
      if (avgCompatibility >= 60 && minCompatibilityInGroup >= 50) {
        groupMembers.push(scoredProfiles[j])
        usedProfiles.add(scoredProfiles[j].id)
      }
    }
 
    // Create groups with at least 2 members (including the user)
    if (groupMembers.length >= 2) {
      const groupMatch = createGroupMatch(userProfile, groupMembers)
      matches.push(groupMatch)
    }
  }
 
  // Sort matches by average compatibility
  matches.sort((a, b) => b.average_compatibility - a.average_compatibility)
 
  return matches.slice(0, 6) // Return top 6 matches
}
 
function calculateCompatibility(profile1: any, profile2: any) {
  let score = 0
  let factors = 0
 
  // Specialty compatibility (25 points)
  if (profile1.medical_specialty && profile2.medical_specialty) {
    if (profile1.medical_specialty === profile2.medical_specialty) {
      score += 25
    } else {
      // Check for related specialties
      const relatedSpecialties = getRelatedSpecialties(profile1.medical_specialty)
      if (relatedSpecialties.includes(profile2.medical_specialty)) {
        score += 18
      } else {
        score += 8
      }
    }
    factors += 25
  }
 
  // Location compatibility (20 points)
  if (profile1.city && profile2.city) {
    if (profile1.city === profile2.city) {
      score += 20
    } else if (profile1.state === profile2.state) {
      score += 15
    } else if (profile1.country === profile2.country) {
      score += 10
    } else {
      score += 5
    }
    factors += 20
  }
 
  // Age compatibility (15 points)
  if (profile1.age && profile2.age) {
    const ageDiff = Math.abs(profile1.age - profile2.age)
    if (ageDiff <= 3) {
      score += 15
    } else if (ageDiff <= 7) {
      score += 12
    } else if (ageDiff <= 12) {
      score += 8
    } else if (ageDiff <= 18) {
      score += 5
    } else {
      score += 2
    }
    factors += 15
  }
 
  // Interests compatibility (25 points)
  const interestsScore = calculateInterestsCompatibility(profile1.profile_interests, profile2.profile_interests)
  score += interestsScore
  factors += 25
 
  // Career stage compatibility (15 points)
  const careerScore = calculateCareerStageCompatibility(profile1, profile2)
  score += careerScore
  factors += 15
 
  return factors > 0 ? Math.round((score / factors) * 100) : 0
}
 
function calculateCareerStageCompatibility(profile1: any, profile2: any) {
  // Estimate career stage based on age and years of experience
  const getCareerStage = (profile: any) => {
    const age = profile.age || 30
    const yearsExperience = profile.years_of_experience || 0
    
    if (age <= 30 || yearsExperience <= 3) return 'early'
    if (age <= 40 || yearsExperience <= 10) return 'mid'
    if (age <= 55 || yearsExperience <= 20) return 'senior'
    return 'expert'
  }
  
  const stage1 = getCareerStage(profile1)
  const stage2 = getCareerStage(profile2)
  
  if (stage1 === stage2) return 15
  if (Math.abs(['early', 'mid', 'senior', 'expert'].indexOf(stage1) - 
               ['early', 'mid', 'senior', 'expert'].indexOf(stage2)) === 1) {
    return 10
  }
  return 5
}
 
function calculateInterestsCompatibility(interests1: any[], interests2: any[]) {
  if (!interests1?.length || !interests2?.length) return 0
 
  let score = 0
  // let matches = 0 // TODO: Use matches variable or remove
 
  // Create maps of interests by kind for easier comparison
  const interests1Map = new Map()
  const interests2Map = new Map()
 
  interests1.forEach(interest => {
    if (interest.kind && interest.value) {
      interests1Map.set(`${interest.kind}:${interest.value}`, true)
    }
  })
 
  interests2.forEach(interest => {
    if (interest.kind && interest.value) {
      interests2Map.set(`${interest.kind}:${interest.value}`, true)
    }
  })
 
  // Count exact matches
  for (const [key] of interests1Map) {
    if (interests2Map.has(key)) {
      score += 10
      // matches++ // TODO: Use matches variable or remove
    }
  }
 
  // Count category matches (same kind, different value)
  const kinds1 = new Set(interests1.map(i => i.kind).filter(Boolean))
  const kinds2 = new Set(interests2.map(i => i.kind).filter(Boolean))
  
  for (const kind of kinds1) {
    if (kinds2.has(kind)) {
      score += 3
    }
  }
 
  return Math.min(score, 30) // Cap at 30 points
}
 
function getRelatedSpecialties(specialty: string): string[] {
  const relatedMap: Record<string, string[]> = {
    'Emergency Medicine': ['Internal Medicine', 'Family Medicine', 'Surgery'],
    'Internal Medicine': ['Family Medicine', 'Emergency Medicine', 'Cardiology'],
    'Family Medicine': ['Internal Medicine', 'Pediatrics', 'Emergency Medicine'],
    'Surgery': ['Orthopedics', 'Emergency Medicine', 'Anesthesiology'],
    'Cardiology': ['Internal Medicine', 'Emergency Medicine'],
    'Pediatrics': ['Family Medicine', 'Emergency Medicine'],
    'Psychiatry': ['Family Medicine', 'Internal Medicine'],
    'Radiology': ['Emergency Medicine', 'Surgery'],
    'Anesthesiology': ['Surgery', 'Emergency Medicine'],
    'Orthopedics': ['Surgery', 'Emergency Medicine']
  }
 
  return relatedMap[specialty] || []
}
 
function calculateGroupDiversity(members: any[]) {
  const specialties = new Set(members.map(m => m.medical_specialty))
  const cities = new Set(members.map(m => m.city))
  const ageRange = Math.max(...members.map(m => m.age)) - Math.min(...members.map(m => m.age))
  
  let diversityScore = 0
  diversityScore += specialties.size * 10 // More specialties = higher diversity
  diversityScore += cities.size * 5 // More cities = higher diversity
  diversityScore += Math.min(ageRange * 2, 20) // Age range contributes to diversity
  
  return Math.min(diversityScore, 100)
}
 
function generateMatchReason(members: any[], commonInterests: string[], compatibility: number, diversityScore: number) {
  const reasons = []
  
  if (compatibility >= 85) {
    reasons.push(`Excellent compatibility (${compatibility}%)`)
  } else if (compatibility >= 75) {
    reasons.push(`High compatibility (${compatibility}%)`)
  } else {
    reasons.push(`Good compatibility (${compatibility}%)`)
  }
  
  if (commonInterests.length >= 3) {
    reasons.push(`${commonInterests.length} shared interests`)
  } else if (commonInterests.length >= 1) {
    reasons.push(`${commonInterests.length} common interest${commonInterests.length > 1 ? 's' : ''}`)
  }
  
  const specialties = new Set(members.map(m => m.medical_specialty))
  if (specialties.size === 1) {
    reasons.push(`All ${members[0].medical_specialty} specialists`)
  } else if (specialties.size > 1) {
    reasons.push(`${specialties.size} different specialties`)
  }
  
  const cities = new Set(members.map(m => m.city))
  if (cities.size === 1) {
    reasons.push(`All located in ${members[0].city}`)
  } else if (cities.size <= 3) {
    reasons.push(`Nearby locations`)
  }
  
  if (diversityScore >= 70) {
    reasons.push(`High group diversity`)
  }
  
  return reasons.join(', ')
}
 
function determineMeetingPreference(members: any[]) {
  const cities = new Set(members.map(m => m.city))
  if (cities.size === 1) {
    return 'In-person'
  } else if (cities.size <= 3) {
    return 'Hybrid'
  } else {
    return 'Virtual'
  }
}
 
function determineGroupLocation(members: any[]) {
  const cities = members.map(m => m.city).filter(Boolean)
  if (cities.length === 0) return 'TBD'
  
  // Return the most common city, or first city if tied
  const cityCounts = cities.reduce((acc, city) => {
    acc[city] = (acc[city] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(cityCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0][0]
}
 
function generateGroupDescription(members: any[], commonInterests: string[]) {
  const specialty = members[0].medical_specialty || 'medical'
  const interestText = commonInterests.length > 0 
    ? ` who share interests in ${commonInterests.slice(0, 3).join(', ')}`
    : ''
  
  return `A dynamic group of ${specialty} professionals${interestText}, looking to build meaningful connections and professional relationships.`
}
 
function getSpecialtyMix(members: any[]) {
  const specialties = members.map(m => m.medical_specialty)
  const counts = specialties.reduce((acc, spec) => {
    acc[spec] = (acc[spec] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(counts).map(([specialty, count]) => ({
    specialty,
    count,
    percentage: Math.round(((count as number) / members.length) * 100)
  }))
}
 
function getAgeRange(members: any[]) {
  const ages = members.map(m => m.age).filter(Boolean)
  if (ages.length === 0) return { min: 0, max: 0, average: 0 }
  
  return {
    min: Math.min(...ages),
    max: Math.max(...ages),
    average: Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
  }
}
 
function getLocationSpread(members: any[]) {
  const cities = members.map(m => m.city).filter(Boolean)
  const uniqueCities = [...new Set(cities)]
  
  return {
    cities: uniqueCities,
    count: uniqueCities.length,
    isLocal: uniqueCities.length <= 2
  }
}
 
function getCurrentWeek() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  return `Week ${Math.ceil(days / 7)}`
}
 
function createGroupMatch(userProfile: any, groupMembers: any[]) {
  const allMembers = [userProfile, ...groupMembers]
  const commonInterests = calculateCommonInterests(allMembers)
  const averageCompatibility = Math.round(
    groupMembers.reduce((sum, member) => sum + member.compatibility, 0) / groupMembers.length
  )
 
  // Generate group name based on common interests and specialty
  const groupName = generateGroupName(commonInterests, allMembers[0].medical_specialty)
  
  // Calculate group diversity score
  const diversityScore = calculateGroupDiversity(allMembers)
  
  // Generate match reason with more detail
  const matchReason = generateMatchReason(allMembers, commonInterests, averageCompatibility, diversityScore)
  
  // Determine meeting preference based on locations
  const meetingPreference = determineMeetingPreference(allMembers)
 
  return {
    id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: groupName,
    members: allMembers.map(member => ({
      id: member.user_id,
      name: `${member.first_name} ${member.last_name}`,
      specialty: member.medical_specialty || 'General Practice',
      city: member.city || 'Unknown',
      age: member.age || 30,
      compatibility: member.compatibility || 0,
      avatar: `${member.first_name?.[0]}${member.last_name?.[0]}`
    })),
    commonInterests,
    compatibility: averageCompatibility,
    meetingPreference,
    location: determineGroupLocation(allMembers),
    description: generateGroupDescription(allMembers, commonInterests),
    matchReason,
    groupSize: allMembers.length,
    average_compatibility: averageCompatibility,
    lastActivityAt: new Date().toISOString(),
    created_at: new Date().toISOString(),
    status: 'active',
    matchWeek: getCurrentWeek(),
    diversityScore,
    specialtyMix: getSpecialtyMix(allMembers),
    ageRange: getAgeRange(allMembers),
    locationSpread: getLocationSpread(allMembers)
  }
}
 
function calculateCommonInterests(members: any[]): string[] {
  const interestCounts: Record<string, number> = {}
 
  members.forEach(member => {
    const interests = member.profile_interests || []
    if (!interests.length) return
 
    // With the new schema, interests are stored as key-value pairs
    interests.forEach((interest: any) => {
      if (interest.kind && interest.value) {
        const key = `${interest.kind}:${interest.value}`
        interestCounts[key] = (interestCounts[key] || 0) + 1
      }
    })
  })
 
  // Return interests that appear in at least 2 members
  return Object.entries(interestCounts)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([interest]) => interest)
}
 
function generateGroupName(commonInterests: string[], specialty: string): string {
  if (commonInterests.length === 0) {
    return `${specialty} Professionals`
  }
 
  const interest = commonInterests[0]
  const specialtyPrefix = specialty ? `${specialty} ` : ''
 
  // Generate creative group names based on interests
  const nameMap: Record<string, string> = {
    'Coffee': 'Coffee & Conversation',
    'Hiking': 'Trail Blazers',
    'Photography': 'Lens Masters',
    'Cooking': 'Culinary Crew',
    'Travel': 'Globe Trotters',
    'Music': 'Harmony Seekers',
    'Movies': 'Cinema Society',
    'Reading': 'Book Club',
    'Sports': 'Active Alliance',
    'Art': 'Creative Collective',
    'Wine': 'Vintage Vibe',
    'Fitness': 'Fit & Friendly'
  }
 
  return nameMap[interest] || `${specialtyPrefix}${interest} Enthusiasts`
}