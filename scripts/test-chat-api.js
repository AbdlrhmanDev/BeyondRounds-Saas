require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testChatAPI() {
  console.log('🧪 Testing Chat API Query...\n')

  const chatRoomId = 'f1cd9ef6-954b-49d7-9731-e20e344f26fb'
  const userId = '9eb30096-40af-4e20-8dd8-225f8d3411ee'

  try {
    // Test the exact same query as the API
    console.log('1. Testing messages query:')
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select(`
        *,
        profiles!chat_messages_sender_id_fkey (
          id,
          first_name,
          last_name,
          medical_specialty
        )
      `)
      .eq('chat_room_id', chatRoomId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('❌ Messages error:', messagesError)
    } else {
      console.log('✅ Messages found:', messages?.length || 0)
      messages?.forEach((msg, index) => {
        console.log(`   Message ${index + 1}:`)
        console.log(`     Content: "${msg.content}"`)
        console.log(`     Sender ID: ${msg.sender_id}`)
        console.log(`     Created: ${msg.created_at}`)
        console.log(`     Profile: ${msg.profiles ? `${msg.profiles.first_name} ${msg.profiles.last_name}` : 'NULL'}`)
        console.log('')
      })
    }

    // Test members query
    console.log('2. Testing members query:')
    const { data: members, error: membersError } = await supabase
      .from('match_members')
      .select(`
        *,
        profiles (
          id,
          first_name,
          last_name,
          medical_specialty,
          city
        )
      `)
      .eq('match_id', (await supabase.from('chat_rooms').select('match_id').eq('id', chatRoomId).single()).data?.match_id)
      .eq('is_active', true)

    if (membersError) {
      console.error('❌ Members error:', membersError)
    } else {
      console.log('✅ Members found:', members?.length || 0)
      members?.forEach((member, index) => {
        console.log(`   Member ${index + 1}:`)
        console.log(`     Profile ID: ${member.profile_id}`)
        console.log(`     Profile: ${member.profiles ? `${member.profiles.first_name} ${member.profiles.last_name}` : 'NULL'}`)
        console.log(`     Specialty: ${member.profiles?.medical_specialty || 'NULL'}`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

testChatAPI()







