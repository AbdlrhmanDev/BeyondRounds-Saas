import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import type { SupabaseClient } from '@supabase/supabase-js'

interface Profile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  email: string
  medical_specialty: string
  city: string
  country: string
  age: number
  gender: string
  looking_for: string[]
  interests: string[]
  lifestyle_goals: string[]
  availability_preferences: string[]
  is_verified: boolean
  onboarding_completed: boolean
  created_at: string
}

interface MatchingGroup {
  id: string
  name: string
  members: Profile[]
  match: Record<string, unknown>
}
 
export async function POST(_request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    console.log('🔄 Starting weekly matching process...')
 
    // 1. Get all active profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        email,
        medical_specialty,
        city,
        country,
        age,
        gender,
        looking_for,
        interests,
        lifestyle_goals,
        availability_preferences,
        is_verified,
        onboarding_completed,
        created_at
      `)
      .eq('onboarding_completed', true)
      .is('deleted_at', null)
 
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }
 
    if (!profiles || profiles.length < 3) {
      console.log('❌ Not enough profiles for matching (minimum 3 required)')
      return NextResponse.json({
        success: false,
        error: 'Not enough profiles for matching',
        data: { profilesCount: profiles?.length || 0 }
      })
    }
 
    console.log(`📊 Found ${profiles.length} active profiles`)
 
    // 2. Create weekly matching groups
    const matchingGroups = await createMatchingGroups(profiles, supabase)
    
    if (matchingGroups.length === 0) {
      console.log('❌ No matching groups created')
      return NextResponse.json({
        success: false,
        error: 'No matching groups could be created'
      })
    }
 
    // 3. Create chat rooms for each group
    const chatRooms = await createChatRooms(matchingGroups, supabase)
 
    // 4. Send notifications to all matched users
    await sendMatchingNotifications(matchingGroups, supabase)
 
    console.log(`✅ Weekly matching completed successfully!`)
    console.log(`   - Created ${matchingGroups.length} matching groups`)
    console.log(`   - Created ${chatRooms.length} chat rooms`)
    console.log(`   - Sent notifications to ${matchingGroups.reduce((sum, group) => sum + group.members.length, 0)} users`)
 
    return NextResponse.json({
      success: true,
      data: {
        groupsCreated: matchingGroups.length,
        chatRoomsCreated: chatRooms.length,
        totalUsersMatched: matchingGroups.reduce((sum, group) => sum + group.members.length, 0),
        groups: matchingGroups.map(group => ({
          id: group.id,
          name: group.name,
          memberCount: group.members.length,
          specialties: group.members.map((m: Profile) => m.medical_specialty)
        }))
      },
      message: 'Weekly matching completed successfully'
    })
 
  } catch (error) {
    console.error('Failed to run weekly matching:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to run weekly matching' },
      { status: 500 }
    )
  }
}
 
async function createMatchingGroups(profiles: Profile[], supabase: SupabaseClient) {
  const groups = []
  const usedProfiles = new Set()
  const groupSize = 3 // Default group size
 
  // Sort profiles by compatibility factors
  const sortedProfiles = profiles.sort((a, b) => {
    // Prioritize verified users
    if (a.is_verified && !b.is_verified) return -1
    if (!a.is_verified && b.is_verified) return 1
    
    // Then by onboarding completion date (newer users first)
    return new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
  })
 
  for (let i = 0; i < sortedProfiles.length; i += groupSize) {
    const groupProfiles = sortedProfiles.slice(i, i + groupSize)
    
    // Skip if group is too small
    if (groupProfiles.length < 3) break
 
    // Check if all profiles are available
    const availableProfiles = groupProfiles.filter(profile => 
      !usedProfiles.has(profile.id) && 
      profile.availability_preferences && Array.isArray(profile.availability_preferences) && 
      profile.availability_preferences.includes('available')
    )
 
    if (availableProfiles.length < 3) continue
 
    // Create match group
    const groupName = `Medical Group ${Math.floor(i / groupSize) + 1}`
    const groupId = crypto.randomUUID()
 
    const { data: matchGroup, error: matchError } = await supabase
      .from('matches')
      .insert({
        id: groupId,
        group_name: groupName,
        group_size: availableProfiles.length,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single()
 
    if (matchError) {
      console.error('Error creating match group:', matchError)
      continue
    }
 
    // Add members to the group
    const members = []
    for (const profile of availableProfiles) {
      const { data: member, error: memberError } = await supabase
        .from('match_members')
        .insert({
          match_id: groupId,
          profile_id: profile.id,
          joined_at: new Date().toISOString(),
          is_active: true,
          compatibility_score: calculateCompatibility(profile, availableProfiles)
        })
        .select()
        .single()
 
      if (memberError) {
        console.error('Error adding member to group:', memberError)
        continue
      }
 
      members.push({ ...profile, compatibility_score: member.compatibility_score })
      usedProfiles.add(profile.id)
    }
 
    if (members.length >= 3) {
      groups.push({
        id: groupId,
        name: groupName,
        members: members,
        match: matchGroup
      })
    }
  }
 
  return groups
}
 
async function createChatRooms(matchingGroups: MatchingGroup[], supabase: SupabaseClient) {
  const chatRooms = []
 
  for (const group of matchingGroups) {
    const { data: chatRoom, error: chatError } = await supabase
      .from('chat_rooms')
      .insert({
        match_id: group.id,
        name: group.name,
        description: `Weekly matching group for ${group.members.map((m: Profile) => m.first_name).join(', ')}`,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
 
    if (chatError) {
      console.error('Error creating chat room:', chatError)
      continue
    }
 
    chatRooms.push(chatRoom)
  }
 
  return chatRooms
}
 
async function sendMatchingNotifications(matchingGroups: MatchingGroup[], supabase: SupabaseClient) {
  for (const group of matchingGroups) {
    for (const member of group.members) {
      const notificationData = {
        profile_id: member.id,
        title: 'New Weekly Match!',
        message: `You've been matched with ${group.members.length - 1} other medical professionals in "${group.name}". Check your messages to start chatting!`,
        data: {
          type: 'matching',
          match_id: group.id,
          group_name: group.name,
          member_count: group.members.length
        },
        is_read: false,
        created_at: new Date().toISOString()
      }
 
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationData)
 
      if (notificationError) {
        console.error('Error creating notification:', notificationError)
      }
    }
  }
}
 
function calculateCompatibility(profile: Profile, groupProfiles: Profile[]) {
  let score = 50 // Base score
 
  // Specialty compatibility
  const sameSpecialty = groupProfiles.filter(p => p.medical_specialty === profile.medical_specialty).length
  score += sameSpecialty * 10
 
  // Location compatibility
  const sameCity = groupProfiles.filter(p => p.city === profile.city).length
  score += sameCity * 15
 
  // Age compatibility (within 10 years)
  const ageRange = groupProfiles.filter(p => Math.abs(p.age - profile.age) <= 10).length
  score += ageRange * 5
 
  // Interests compatibility
  if (profile.interests && Array.isArray(profile.interests)) {
    const commonInterests = groupProfiles.filter(p => 
      p.interests && Array.isArray(p.interests) && 
      p.interests.some((interest: string) => profile.interests.includes(interest))
    ).length
    score += commonInterests * 8
  }
 
  // Verification bonus
  if (profile.is_verified) {
    score += 20
  }
 
  return Math.min(100, Math.max(0, score))
}
 
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const { searchParams } = new URL(request.url)
    const week = searchParams.get('week')
    const year = searchParams.get('year')
 
    console.log(`📊 Fetching weekly matching data for week ${week}, year ${year}`)
 
    // Get current week's matches
    const currentWeek = week ? parseInt(week.toString()) : getCurrentWeek()
    const currentYear = year ? parseInt(year.toString()) : new Date().getFullYear()
 
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(`
        *,
        match_members (
          *,
          profiles (
            id,
            first_name,
            last_name,
            medical_specialty,
            city,
            is_verified
          )
        ),
        chat_rooms (
          id,
          name,
          description,
          is_active
        )
      `)
      .gte('created_at', getWeekStartDate(currentYear, currentWeek))
      .lt('created_at', getWeekEndDate(currentYear, currentWeek))
 
    if (matchesError) {
      console.error('Error fetching weekly matches:', matchesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch weekly matches' },
        { status: 500 }
      )
    }
 
    console.log(`✅ Found ${matches?.length || 0} weekly matches`)
    return NextResponse.json({
      success: true,
      data: matches || [],
      message: 'Weekly matches fetched successfully'
    })
 
  } catch (error) {
    console.error('Failed to fetch weekly matches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weekly matches' },
      { status: 500 }
    )
  }
}
 
function getCurrentWeek() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + start.getDay() + 1) / 7)
}
 
function getWeekStartDate(year: number, week: number) {
  const date = new Date(year, 0, 1)
  const dayOfWeek = date.getDay()
  const daysToAdd = (week - 1) * 7 - dayOfWeek
  date.setDate(date.getDate() + daysToAdd)
  return date.toISOString()
}
 
function getWeekEndDate(year: number, week: number) {
  const startDate = new Date(getWeekStartDate(year, week))
  startDate.setDate(startDate.getDate() + 7)
  return startDate.toISOString()
}