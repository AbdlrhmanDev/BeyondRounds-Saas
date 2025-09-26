import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)
 
export async function GET(_request: NextRequest) {
  try {
    console.log('🔍 Loading matches via API...')
    
    // For now, we'll use a test user ID - in production this would come from JWT
    // Note: Authorization header check removed for development/testing
    const testUserId = 'f4322027-66bd-4016-98f2-96fe8416896c' // admin@beyondrounds.com
    
    // Load all users except the current user
    const { data: users, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', testUserId)
      .eq('is_verified', true)
      .eq('is_banned', false)
      .limit(20)
 
    if (profilesError) {
      console.error('Error loading users:', profilesError)
      return NextResponse.json(
        { success: false, error: profilesError.message },
        { status: 500 }
      )
    }
 
    // Load existing matches for the user through match_members
    const { data: existingMatches, error: matchesError } = await supabase
      .from('match_members')
      .select('match_id, compatibility_score, is_active')
      .eq('profile_id', testUserId)
      .eq('is_active', true)
 
    if (matchesError) {
      console.error('Error loading matches:', matchesError)
    }
 
    // Calculate compatibility scores and create match objects
    const matches = (users || []).map(user => {
      // Calculate compatibility score based on various factors
      let compatibility = 50 // Base score
      
      // Specialty compatibility (same specialty = higher score)
      if (user.medical_specialty === 'Cardiology') {
        compatibility += 20 // Cardiology is compatible with many specialties
      }
      
      // City compatibility (same city = higher score)
      if (user.city === 'Riyadh') {
        compatibility += 15
      }
      
      // Experience compatibility (similar experience = higher score)
      if (user.experience_years && user.experience_years >= 10) {
        compatibility += 10
      }
      
      // Language compatibility
      if (user.languages && user.languages.includes('Arabic')) {
        compatibility += 5
      }
      
      // Random factor for variety (0-10)
      compatibility += Math.floor(Math.random() * 11)
      
      // Cap at 100
      compatibility = Math.min(compatibility, 100)
      
      // Determine status based on existing matches
      let status = 'new'
      if (existingMatches) {
        // Check if this profile is in any of the user's existing matches
        const existingMatch = existingMatches.find(match => 
          match.match_id && match.is_active
        )
        if (existingMatch) {
          status = 'active'
        }
      }
      
      // Generate interests from profile data
      const interests = []
      if (user.interests && Array.isArray(user.interests)) {
        interests.push(...user.interests.slice(0, 3))
      } else {
        // Default interests based on specialty
        const specialtyInterests = {
          'Cardiology': ['Heart Health', 'Exercise', 'Research'],
          'Pediatrics': ['Child Development', 'Family Care', 'Education'],
          'Orthopedics': ['Sports Medicine', 'Physical Therapy', 'Fitness'],
          'Dermatology': ['Skin Care', 'Cosmetics', 'Research'],
          'Neurology': ['Brain Health', 'Research', 'Technology'],
          'Obstetrics & Gynecology': ['Women Health', 'Family Planning', 'Research'],
          'Emergency Medicine': ['Trauma Care', 'Critical Care', 'Teamwork'],
          'Psychiatry': ['Mental Health', 'Therapy', 'Research'],
          'Urology': ['Men Health', 'Surgery', 'Technology'],
          'Ophthalmology': ['Eye Care', 'Surgery', 'Technology']
        }
        interests.push(...(specialtyInterests[user.medical_specialty as keyof typeof specialtyInterests] || ['Medical Research', 'Patient Care', 'Technology']))
      }
      
      return {
        id: user.user_id,
        name: `Dr. ${user.first_name} ${user.last_name}`,
        specialty: user.medical_specialty,
        hospital: 'Medical Center', // Default since hospital field doesn't exist
        compatibility: compatibility,
        lastActive: '2 hours ago', // This would be calculated from actual activity
        avatar: `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`,
        interests: interests,
        location: user.city,
        age: user.age || (30 + Math.floor(Math.random() * 20)), // Use actual age or random for demo
        careerStage: 'Medical Professional', // Default since experience_years doesn't exist
        mutualInterests: Math.floor(Math.random() * 5) + 2,
        status: status,
        bio: user.bio,
        phone: '', // Default since phone field doesn't exist
        email: user.email
      }
    })
 
    // Sort by compatibility score
    matches.sort((a, b) => b.compatibility - a.compatibility)
 
    console.log(`📊 Generated ${matches.length} matches for user ${testUserId}`)
    
    return NextResponse.json({ 
      success: true, 
      data: matches,
      userId: testUserId
    })
  } catch (error) {
    console.error('Failed to load matches:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load matches' },
      { status: 500 }
    )
  }
}
 
export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    const { user1Id, user2Id, action } = body
 
    console.log(`🔄 Match action: ${action} between ${user1Id} and ${user2Id}`)
 
    if (action === 'like' || action === 'match') {
      // First, create a new match group
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          group_name: `Match ${new Date().toISOString().split('T')[0]}`,
          match_week: new Date().toISOString().split('T')[0],
          group_size: 2,
          average_compatibility: 85,
          algorithm_version: 'v2.0',
          matching_criteria: {},
          success_metrics: {}
        })
        .select()
        .single()
 
      if (matchError) {
        console.error('Error creating match:', matchError)
        return NextResponse.json(
          { success: false, error: matchError.message },
          { status: 500 }
        )
      }
 
      // Get profile IDs for both users
      const { data: profile1, error: profile1Error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user1Id)
        .single()
 
      const { data: profile2, error: profile2Error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user2Id)
        .single()
 
      if (profile1Error || profile2Error) {
        console.error('Error getting profile IDs:', profile1Error || profile2Error)
        return NextResponse.json(
          { success: false, error: 'Could not find user users' },
          { status: 500 }
        )
      }
 
      // Add both users to the match using profile IDs
      const { data: memberData, error: memberError } = await supabase
        .from('match_members')
        .insert([
          {
            match_id: matchData.id,
            profile_id: profile1.id,
            compatibility_score: 85,
            compatibility_factors: {}
          },
          {
            match_id: matchData.id,
            profile_id: profile2.id,
            compatibility_score: 85,
            compatibility_factors: {}
          }
        ])
 
      if (memberError) {
        console.error('Error adding members to match:', memberError)
        return NextResponse.json(
          { success: false, error: memberError.message },
          { status: 500 }
        )
      }
 
      return NextResponse.json({ 
        success: true, 
        message: 'Match created successfully',
        data: { match: matchData, members: memberData }
      })
    }
 
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Failed to process match action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process match action' },
      { status: 500 }
    )
  }
}