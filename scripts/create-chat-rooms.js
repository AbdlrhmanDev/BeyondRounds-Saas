require('dotenv').config({path: '.env.local'})
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createChatRooms() {
  console.log('🔧 Creating chat rooms for existing matches...')
  
  try {
    // Get all matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, group_name')
    
    if (matchesError) {
      console.error('Error getting matches:', matchesError)
      return
    }
    
    console.log(`Found ${matches.length} matches`)
    
    for (const match of matches) {
      // Check if chat room already exists
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('match_id', match.id)
        .single()
      
      if (!existingRoom) {
        // Create chat room
        const { error: insertError } = await supabase
          .from('chat_rooms')
          .insert({
            match_id: match.id,
            name: `Chat: ${match.group_name}`,
            is_active: true
          })
        
        if (insertError) {
          console.error(`Error creating room for ${match.group_name}:`, insertError)
        } else {
          console.log(`✅ Created chat room for ${match.group_name}`)
        }
      } else {
        console.log(`⏭️  Chat room already exists for ${match.group_name}`)
      }
    }
    
    console.log('🎉 Chat room creation completed!')
    
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createChatRooms()



