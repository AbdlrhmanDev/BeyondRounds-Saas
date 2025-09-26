require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugChatData() {
  console.log('🔍 Debugging Chat Data...\n')

  try {
    // Check profiles table
    console.log('1. Checking profiles table:')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, medical_specialty, email')
      .limit(5)

    if (profilesError) {
      console.error('❌ Profiles error:', profilesError)
    } else {
      console.log('✅ Profiles found:', profiles?.length || 0)
      profiles?.forEach(profile => {
        console.log(`   - ${profile.first_name} ${profile.last_name} (${profile.medical_specialty})`)
      })
    }

    // Check chat_rooms table
    console.log('\n2. Checking chat_rooms table:')
    const { data: chatRooms, error: chatRoomsError } = await supabase
      .from('chat_rooms')
      .select('id, name, match_id')
      .limit(3)

    if (chatRoomsError) {
      console.error('❌ Chat rooms error:', chatRoomsError)
    } else {
      console.log('✅ Chat rooms found:', chatRooms?.length || 0)
      chatRooms?.forEach(room => {
        console.log(`   - ${room.name} (${room.id})`)
      })
    }

    // Check chat_messages with profiles
    console.log('\n3. Checking chat_messages with profiles:')
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select(`
        id,
        content,
        sender_id,
        created_at,
        profiles!chat_messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          medical_specialty
        )
      `)
      .limit(3)

    if (messagesError) {
      console.error('❌ Messages error:', messagesError)
    } else {
      console.log('✅ Messages found:', messages?.length || 0)
      messages?.forEach(msg => {
        console.log(`   - Message: "${msg.content}"`)
        console.log(`     Sender: ${msg.profiles?.first_name} ${msg.profiles?.last_name} (${msg.profiles?.medical_specialty})`)
        console.log(`     Created: ${msg.created_at}`)
        console.log('')
      })
    }

    // Check if we have the specific chat room
    console.log('\n4. Checking specific chat room: f1cd9ef6-954b-49d7-9731-e20e344f26fb')
    const { data: specificRoom, error: specificRoomError } = await supabase
      .from('chat_rooms')
      .select(`
        id,
        name,
        match_id,
        chat_messages (
          id,
          content,
          sender_id,
          created_at,
          profiles!chat_messages_sender_id_fkey (
            id,
            first_name,
            last_name,
            medical_specialty
          )
        )
      `)
      .eq('id', 'f1cd9ef6-954b-49d7-9731-e20e344f26fb')
      .single()

    if (specificRoomError) {
      console.error('❌ Specific room error:', specificRoomError)
    } else if (specificRoom) {
      console.log('✅ Specific room found:', specificRoom.name)
      console.log('   Messages:', specificRoom.chat_messages?.length || 0)
      specificRoom.chat_messages?.forEach(msg => {
        console.log(`   - "${msg.content}" by ${msg.profiles?.first_name} ${msg.profiles?.last_name}`)
      })
    } else {
      console.log('❌ Specific room not found')
    }

  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

debugChatData()







