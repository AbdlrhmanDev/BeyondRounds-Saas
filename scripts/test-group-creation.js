require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testGroupCreation() {
  console.log('🧪 Testing group creation...')
  
  try {
    // Get a test user
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, medical_specialty')
      .eq('is_verified', true)
      .eq('onboarding_completed', true)
      .eq('is_banned', false)
      .limit(1)

    if (profilesError || !profiles.length) {
      console.error('No test profiles found')
      return
    }

    const testUser = profiles[0]
    console.log(`👤 Testing with user: ${testUser.first_name} ${testUser.last_name}`)

    // Test the join-group API
    const response = await fetch('http://localhost:3000/api/matching/join-group', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUser.user_id,
        groupId: 'test-group-' + Date.now()
      })
    })

    const result = await response.json()
    console.log('📊 API Response:', result)

    if (result.success) {
      // Check the created match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('id, group_name, group_size')
        .eq('id', result.data.matchId)
        .single()

      if (matchError) {
        console.error('Error fetching match:', matchError)
      } else {
        console.log('✅ Match created:', match)
      }

      // Check the members
      const { data: members, error: membersError } = await supabase
        .from('match_members')
        .select(`
          profile_id,
          profiles!match_members_profile_id_fkey (
            first_name,
            last_name,
            medical_specialty
          )
        `)
        .eq('match_id', result.data.matchId)

      if (membersError) {
        console.error('Error fetching members:', membersError)
      } else {
        console.log(`👥 Members in group (${members.length}):`)
        members.forEach(member => {
          console.log(`  - ${member.profiles.first_name} ${member.profiles.last_name} (${member.profiles.medical_specialty})`)
        })
      }

      // Check the chat room
      const { data: chatRoom, error: chatRoomError } = await supabase
        .from('chat_rooms')
        .select('id, name, match_id')
        .eq('match_id', result.data.matchId)
        .single()

      if (chatRoomError) {
        console.error('Error fetching chat room:', chatRoomError)
      } else {
        console.log('💬 Chat room created:', chatRoom)
      }
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testGroupCreation()
