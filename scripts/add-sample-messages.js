require('dotenv').config({path: '.env.local'})
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function addSampleMessages() {
  console.log('💬 Adding sample messages to chat rooms...')
  
  try {
    // Get admin profile ID
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', 'f4322027-66bd-4016-98f2-96fe8416896c')
      .single()
    
    if (adminError || !adminProfile) {
      console.error('Error getting admin profile:', adminError)
      return
    }
    
    // Get a few chat rooms
    const { data: chatRooms, error: roomsError } = await supabase
      .from('chat_rooms')
      .select('id, match_id, name')
      .limit(3)
    
    if (roomsError) {
      console.error('Error getting chat rooms:', roomsError)
      return
    }
    
    const sampleMessages = [
      "Hello everyone! 👋",
      "Great to meet you all!",
      "Looking forward to collaborating with fellow medical professionals.",
      "Anyone interested in discussing recent medical research?",
      "Hope everyone is having a good day! 😊"
    ]
    
    for (const room of chatRooms) {
      // Add a sample message to each room
      const randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)]
      
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          chat_room_id: room.id,
          match_id: room.match_id,
          sender_id: adminProfile.id,
          content: randomMessage
        })
      
      if (messageError) {
        console.error(`Error adding message to ${room.name}:`, messageError)
      } else {
        console.log(`✅ Added sample message to ${room.name}`)
      }
    }
    
    console.log('🎉 Sample messages added!')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

addSampleMessages()
