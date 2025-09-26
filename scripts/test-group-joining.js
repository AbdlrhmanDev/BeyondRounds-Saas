const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testGroupJoining() {
  console.log('🧪 Testing Group Joining Functionality...')
  
  try {
    // Step 1: Check if we have any profiles
    console.log('\n📊 Checking profiles table...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, medical_specialty, is_verified, onboarding_completed, is_banned')
      .limit(5)

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message)
      return
    }

    console.log(`✅ Found ${profiles.length} profiles`)
    profiles.forEach(profile => {
      console.log(`  - ${profile.first_name} ${profile.last_name} (${profile.medical_specialty}) - Verified: ${profile.is_verified}, Onboarding: ${profile.onboarding_completed}`)
    })

    if (profiles.length === 0) {
      console.log('❌ No profiles found! You need to create some test profiles first.')
      return
    }

    // Step 2: Test the join group API
    console.log('\n🚀 Testing join group API...')
    const testUserId = profiles[0].user_id
    const testGroupId = 'test-group-123'

    const response = await fetch('http://localhost:3000/api/matching/join-group', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
        groupId: testGroupId
      })
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Join group API successful!')
      console.log('📊 Result:', result)
    } else {
      console.error('❌ Join group API failed:', result)
    }

    // Step 3: Check matches table
    console.log('\n📋 Checking matches table...')
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .limit(5)

    if (matchesError) {
      console.error('❌ Error fetching matches:', matchesError.message)
    } else {
      console.log(`✅ Found ${matches.length} matches`)
      matches.forEach(match => {
        console.log(`  - ${match.group_name} (${match.status}) - Size: ${match.group_size}`)
      })
    }

    // Step 4: Check match_members table
    console.log('\n👥 Checking match_members table...')
    const { data: matchMembers, error: matchMembersError } = await supabase
      .from('match_members')
      .select('*')
      .limit(5)

    if (matchMembersError) {
      console.error('❌ Error fetching match_members:', matchMembersError.message)
    } else {
      console.log(`✅ Found ${matchMembers.length} match members`)
      matchMembers.forEach(member => {
        console.log(`  - Match: ${member.match_id}, Profile: ${member.profile_id}, Active: ${member.is_active}`)
      })
    }

    // Step 5: Check chat_rooms table
    console.log('\n💬 Checking chat_rooms table...')
    const { data: chatRooms, error: chatRoomsError } = await supabase
      .from('chat_rooms')
      .select('*')
      .limit(5)

    if (chatRoomsError) {
      console.error('❌ Error fetching chat_rooms:', chatRoomsError.message)
    } else {
      console.log(`✅ Found ${chatRooms.length} chat rooms`)
      chatRooms.forEach(room => {
        console.log(`  - ${room.name} (Match: ${room.match_id}) - Active: ${room.is_active}`)
      })
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message)
  }
}

testGroupJoining()


