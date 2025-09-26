#!/usr/bin/env node

/**
 * Chat Test Data Generator for BeyondRounds
 * Creates matches and chat rooms with sample messages for testing
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createChatTestData() {
  try {
    console.log('🚀 Creating chat test data...')

    // First, get existing profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, user_id')
      .eq('is_verified', true)
      .limit(10)

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return
    }

    if (!profiles || profiles.length < 2) {
      console.error('❌ Need at least 2 profiles to create matches')
      return
    }

    console.log(`📋 Found ${profiles.length} profiles`)

    // Create matches
    const matches = []
    for (let i = 0; i < Math.min(3, Math.floor(profiles.length / 2)); i++) {
      const profile1 = profiles[i * 2]
      const profile2 = profiles[i * 2 + 1]

      if (!profile1 || !profile2) break

      // Create match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          group_name: `${profile1.first_name} & ${profile2.first_name} Match`,
          match_week: new Date().toISOString().split('T')[0],
          group_size: 2,
          average_compatibility: 85 + Math.random() * 10,
          algorithm_version: 'v2.0',
          matching_criteria: {
            specialty_match: true,
            interest_overlap: 0.7,
            location_proximity: 'same_city'
          },
          success_metrics: {
            messages_exchanged: 0,
            meetings_scheduled: 0
          }
        })
        .select()
        .single()

      if (matchError) {
        console.error('❌ Error creating match:', matchError)
        continue
      }

      // Add members to match
      const { error: member1Error } = await supabase
        .from('match_members')
        .insert({
          match_id: match.id,
          profile_id: profile1.id,
          compatibility_score: 85 + Math.random() * 10,
          compatibility_factors: {
            specialty: 0.8,
            interests: 0.7,
            location: 0.9
          },
          is_active: true
        })

      const { error: member2Error } = await supabase
        .from('match_members')
        .insert({
          match_id: match.id,
          profile_id: profile2.id,
          compatibility_score: 85 + Math.random() * 10,
          compatibility_factors: {
            specialty: 0.8,
            interests: 0.7,
            location: 0.9
          },
          is_active: true
        })

      if (member1Error || member2Error) {
        console.error('❌ Error adding members to match:', member1Error || member2Error)
        continue
      }

      // Create chat room
      const { data: chatRoom, error: chatRoomError } = await supabase
        .from('chat_rooms')
        .insert({
          match_id: match.id,
          name: `${profile1.first_name} & ${profile2.first_name}`,
          description: `Chat room for ${profile1.first_name} and ${profile2.first_name}`,
          is_active: true,
          message_count: 0,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single()

      if (chatRoomError) {
        console.error('❌ Error creating chat room:', chatRoomError)
        continue
      }

      // Create sample messages
      const sampleMessages = [
        {
          chat_room_id: chatRoom.id,
          match_id: match.id,
          sender_id: profile1.id,
          content: `Hello ${profile2.first_name}! Great to be matched with you. I'm excited to connect and learn about your work in the medical field.`,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          chat_room_id: chatRoom.id,
          match_id: match.id,
          sender_id: profile2.id,
          content: `Hi ${profile1.first_name}! Likewise, it's wonderful to meet another medical professional. I'd love to hear about your experience and share some insights from my practice.`,
          created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() // 1.5 hours ago
        },
        {
          chat_room_id: chatRoom.id,
          match_id: match.id,
          sender_id: profile1.id,
          content: `That sounds great! I've been working in my specialty for several years now. Have you attended any interesting conferences recently?`,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
        },
        {
          chat_room_id: chatRoom.id,
          match_id: match.id,
          sender_id: profile2.id,
          content: `Yes! I was at the Medical Innovation Summit last month. The discussions on AI in healthcare were fascinating. What's your take on technology integration in medical practice?`,
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
        }
      ]

      const { error: messagesError } = await supabase
        .from('chat_messages')
        .insert(sampleMessages)

      if (messagesError) {
        console.error('❌ Error creating messages:', messagesError)
        continue
      }

      // Update chat room message count
      await supabase
        .from('chat_rooms')
        .update({
          message_count: sampleMessages.length,
          last_message_at: sampleMessages[sampleMessages.length - 1].created_at
        })
        .eq('id', chatRoom.id)

      matches.push({
        matchId: match.id,
        chatRoomId: chatRoom.id,
        members: [profile1.first_name, profile2.first_name]
      })

      console.log(`✅ Created match: ${profile1.first_name} & ${profile2.first_name}`)
    }

    console.log(`\n🎉 Successfully created ${matches.length} matches with chat rooms!`)
    console.log('\n📊 Summary:')
    matches.forEach((match, index) => {
      console.log(`  ${index + 1}. ${match.members.join(' & ')} - Chat Room: ${match.chatRoomId}`)
    })

    console.log('\n💬 You can now test the chat functionality!')
    console.log('   - Go to /messages to see the conversations')
    console.log('   - Click on any conversation to start chatting')

  } catch (error) {
    console.error('❌ Error creating chat test data:', error)
  }
}

// Run the script
createChatTestData()
  .then(() => {
    console.log('\n✨ Chat test data creation completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
