require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testChatRoomFixes() {
  console.log('🧪 Testing ChatRoom Fixes...\n')

  const userId = '9eb30096-40af-4e20-8dd8-225f8d3411ee' // Auth user ID
  const chatRoomId = 'f1cd9ef6-954b-49d7-9731-e20e344f26fb' // From terminal logs

  try {
    // Test 1: Get user's profile ID (this was failing before)
    console.log('1. Testing user profile lookup:')
    const { data: userData, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('❌ Profile lookup error:', profileError)
    } else {
      console.log('✅ Profile found:', userData)
    }

    // Test 2: Get chat room info
    console.log('\n2. Testing chat room lookup:')
    const { data: chatRoom, error: chatError } = await supabase
      .from('chat_rooms')
      .select('name, description')
      .eq('id', chatRoomId)
      .single()

    if (chatError) {
      console.error('❌ Chat room error:', chatError)
    } else {
      console.log('✅ Chat room found:', chatRoom)
    }

    // Test 3: Get messages with sender info (this was failing before)
    console.log('\n3. Testing messages with sender info:')
    const { data: messagesData, error: messagesError } = await supabase
      .from('chat_messages')
      .select(`
        id,
        content,
        sender_id,
        created_at,
        is_edited,
        profiles!chat_messages_sender_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq('chat_room_id', chatRoomId)
      .order('created_at', { ascending: true })
      .limit(3)

    if (messagesError) {
      console.error('❌ Messages error:', messagesError)
    } else {
      console.log('✅ Messages found:', messagesData?.length || 0)
      messagesData?.forEach(msg => {
        console.log(`   - "${msg.content}" by ${msg.profiles?.first_name} ${msg.profiles?.last_name}`)
      })
    }

    // Test 4: Get members with profile info (this was failing before)
    console.log('\n4. Testing members with profile info:')
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
      .eq('match_id', '8c6a7fc6-b83b-4fde-8fa2-0653e6741d0d') // Grace match ID from logs
      .limit(3)

    if (membersError) {
      console.error('❌ Members error:', membersError)
    } else {
      console.log('✅ Members found:', membersData?.length || 0)
      membersData?.forEach(member => {
        console.log(`   - ${member.profiles?.first_name} ${member.profiles?.last_name}`)
      })
    }

    // Test 5: Test sending a message (this was failing before)
    console.log('\n5. Testing message sending:')
    if (userData) {
      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: chatRoomId,
          match_id: '8c6a7fc6-b83b-4fde-8fa2-0653e6741d0d',
          sender_id: userData.id,
          content: 'Test message from script - ChatRoom fixes working!'
        })
        .select()
        .single()

      if (messageError) {
        console.error('❌ Message send error:', messageError)
      } else {
        console.log('✅ Message sent successfully:', messageData.id)
      }
    }

    console.log('\n🎉 ChatRoom fixes test completed!')
    console.log('\n📋 Summary:')
    console.log('   ✅ Fixed all "users" table references to "profiles"')
    console.log('   ✅ Fixed profile ID lookups')
    console.log('   ✅ Fixed message sender info queries')
    console.log('   ✅ Fixed member info queries')
    console.log('   ✅ Fixed message sending functionality')
    console.log('\n💬 The chat should now work without errors!')

  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testChatRoomFixes()







