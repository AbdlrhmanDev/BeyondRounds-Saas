import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
 
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const { userId, groupId } = await request.json()
 
    if (!userId || !groupId) {
      return NextResponse.json(
        { success: false, error: 'User ID and Group ID are required' },
        { status: 400 }
      )
    }
 
    console.log(`👥 User ${userId} joining group ${groupId}`)
 
    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, medical_specialty, city')
      .eq('user_id', userId)
      .single()
 
    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }
 
    // Find compatible profiles for group creation
    const { data: compatibleProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, medical_specialty, city')
      .eq('is_verified', true)
      .eq('onboarding_completed', true)
      .eq('is_banned', false)
      .neq('id', profile.id) // Exclude current user
      .limit(3) // Get up to 3 other members for a group of 4
 
    if (profilesError) {
      console.error('Error fetching compatible profiles:', profilesError)
      return NextResponse.json(
        { success: false, error: 'Failed to find compatible members' },
        { status: 500 }
      )
    }
 
    // Create a new match record with group name based on specialty
    const specialty = profile.medical_specialty || 'Medical Professionals'
    const groupName = `${specialty} Group ${Date.now().toString().slice(-6)}`
    
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({
        group_name: groupName,
        status: 'active',
        match_week: new Date().toISOString().split('T')[0],
        group_size: Math.min(compatibleProfiles.length + 1, 4) // Current user + compatible profiles
      })
      .select()
      .single()
 
    if (matchError) {
      console.error('Error creating match:', matchError)
      return NextResponse.json(
        { success: false, error: 'Failed to create match' },
        { status: 500 }
      )
    }
 
    // Add current user to the match
    const { error: currentUserError } = await supabase
      .from('match_members')
      .insert({
        match_id: match.id,
        profile_id: profile.id,
        is_active: true
      })
 
    if (currentUserError) {
      console.error('Error adding current user to match:', currentUserError)
      return NextResponse.json(
        { success: false, error: 'Failed to join group' },
        { status: 500 }
      )
    }
 
    // Add compatible profiles to the match
    if (compatibleProfiles.length > 0) {
      const memberInserts = compatibleProfiles.map(compatibleProfile => ({
        match_id: match.id,
        profile_id: compatibleProfile.id,
        is_active: true
      }))
 
      const { error: membersError } = await supabase
        .from('match_members')
        .insert(memberInserts)
 
      if (membersError) {
        console.error('Error adding compatible members to match:', membersError)
        // Don't fail the entire operation, just log the error
        console.log('Continuing with current user only...')
      } else {
        console.log(`✅ Added ${compatibleProfiles.length} compatible members to group`)
      }
    }
 
    // Create chat room for this match (only if it doesn't exist)
    const { data: existingChatRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('match_id', match.id)
      .single()
 
    if (!existingChatRoom) {
      const { data: chatRoom, error: chatRoomError } = await supabase
        .from('chat_rooms')
        .insert({
          match_id: match.id,
          name: groupName,
          description: `Chat room for ${groupName}`,
          is_active: true
        })
        .select('id')
        .single()
 
      if (chatRoomError) {
        console.error('Error creating chat room:', chatRoomError)
        console.log('Continuing without chat room...')
      } else {
        console.log(`✅ Created chat room ${chatRoom.id} for match ${match.id}`)
      }
    } else {
      console.log(`✅ Chat room ${existingChatRoom.id} already exists for match ${match.id}`)
    }
 
    console.log(`✅ User ${userId} successfully created and joined group ${match.id}`)
    console.log(`📊 Group details: ${compatibleProfiles.length + 1} total members (${compatibleProfiles.length} compatible + 1 current user)`)
    console.log(`👥 Compatible profiles found:`, compatibleProfiles.map(p => `${p.first_name} ${p.last_name} (${p.medical_specialty})`))
 
    return NextResponse.json({
      success: true,
      data: {
        matchId: match.id,
        groupName: groupName,
        memberCount: compatibleProfiles.length + 1,
        message: `Successfully created group with ${compatibleProfiles.length + 1} members!`
      }
    })
 
  } catch (error) {
    console.error('Failed to join group:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to join group' },
      { status: 500 }
    )
  }
}