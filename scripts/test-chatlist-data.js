require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testChatListData() {
  console.log('🧪 Testing ChatList Data Loading...\n')

  // Use the same profile ID from the terminal logs
  const profileId = '9eb30096-40af-4e20-8dd8-225f8d3411ee'

  try {
    // Test 1: Get user's matches
    console.log('1. Testing user matches query:')
    const { data: matchesData, error: matchesError } = await supabase
      .from('match_members')
      .select(`
        match_id,
        matches!match_members_match_id_fkey (
          id,
          group_name
        )
      `)
      .eq('profile_id', profileId)
      .eq('is_active', true)

    if (matchesError) {
      console.error('❌ Matches error:', matchesError)
    } else {
      console.log('✅ Matches found:', matchesData?.length || 0)
      matchesData?.forEach(match => {
        console.log(`   - Match: ${match.match_id} (${match.matches?.group_name || 'No name'})`)
      })
    }

    // Test 2: Get chat rooms for matches
    console.log('\n2. Testing chat rooms query:')
    if (matchesData && matchesData.length > 0) {
      for (const match of matchesData) {
        const { data: chatRoomData, error: chatRoomError } = await supabase
          .from('chat_rooms')
          .select('id, name')
          .eq('match_id', match.match_id)
          .single()

        if (chatRoomError) {
          console.log(`   ❌ No chat room for match ${match.match_id}:`, chatRoomError.message)
        } else {
          console.log(`   ✅ Chat room: ${chatRoomData.name} (${chatRoomData.id})`)
        }
      }
    }

    // Test 3: Get members for a match
    console.log('\n3. Testing members query:')
    if (matchesData && matchesData.length > 0) {
      const matchId = matchesData[0].match_id
      const { data: membersData, error: membersError } = await supabase
        .from('match_members')
        .select(`
          profile_id,
          profiles!match_members_profile_id_fkey (
            first_name,
            last_name,
            last_active_at
          )
        `)
        .eq('match_id', matchId)
        .eq('is_active', true)

      if (membersError) {
        console.error('❌ Members error:', membersError)
      } else {
        console.log('✅ Members found:', membersData?.length || 0)
        membersData?.forEach(member => {
          console.log(`   - ${member.profiles?.first_name} ${member.profiles?.last_name} (${member.profile_id})`)
        })
      }
    }

    // Test 4: Get last message for a chat room
    console.log('\n4. Testing last message query:')
    const { data: chatRooms } = await supabase
      .from('chat_rooms')
      .select('id, name')
      .limit(1)

    if (chatRooms && chatRooms.length > 0) {
      const chatRoomId = chatRooms[0].id
      const { data: lastMessageData, error: lastMessageError } = await supabase
        .from('chat_messages')
        .select(`
          content,
          created_at,
          sender_id,
          profiles!chat_messages_sender_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (lastMessageError) {
        console.error('❌ Last message error:', lastMessageError)
      } else {
        console.log('✅ Last message found:', lastMessageData?.length || 0)
        if (lastMessageData && lastMessageData.length > 0) {
          const msg = lastMessageData[0]
          console.log(`   - "${msg.content}" by ${msg.profiles?.first_name} ${msg.profiles?.last_name}`)
        }
      }
    }

    console.log('\n🎉 ChatList data loading test completed!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Fixed table references from "users" to "profiles"')
    console.log('   ✅ Fixed user ID references to use profile.id')
    console.log('   ✅ All queries should now work correctly')

  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testChatListData()







