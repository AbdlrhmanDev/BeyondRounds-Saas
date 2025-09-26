#!/usr/bin/env node

/**
 * Create Matches for Current User
 * Creates matches and chat rooms for the authenticated user
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

async function createMatchesForUser() {
  try {
    console.log('🔧 Creating matches for current user...')

    // The current user ID from the logs
    const currentUserId = '9eb30096-40af-4e20-8dd8-225f8d3411ee'
    
    console.log(`👤 Working with user: ${currentUserId}`)

    // Get the user's profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', currentUserId)
      .single()

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError)
      return
    }

    console.log('✅ User profile found:', {
      id: userProfile.id,
      email: userProfile.email,
      name: `${userProfile.first_name} ${userProfile.last_name}`,
      specialty: userProfile.medical_specialty
    })

    // Get other profiles to create matches with
    const { data: otherProfiles, error: othersError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, medical_specialty')
      .neq('user_id', currentUserId)
      .limit(5)

    if (othersError) {
      console.error('❌ Error fetching other profiles:', othersError)
      return
    }

    console.log(`📋 Found ${otherProfiles.length} other profiles to match with`)

    // Create matches with other users
    for (const otherProfile of otherProfiles) {
      console.log(`\n🤝 Creating match with ${otherProfile.first_name} ${otherProfile.last_name}...`)

      // Create match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          group_name: `${userProfile.first_name} & ${otherProfile.first_name} Match`,
          match_week: new Date().toISOString().split('T')[0],
          group_size: 2,
          average_compatibility: 85 + Math.random() * 10,
          algorithm_version: 'v2.0',
          matching_criteria: {
            specialty_match: userProfile.medical_specialty === otherProfile.medical_specialty,
            interest_overlap: 0.7,
            location_proximity: 'same_region'
          },
          success_metrics: {
            messages_exchanged: 0,
            meetings_scheduled: 0
          }
        })
        .select()
        .single()

      if (matchError) {
        console.error(`❌ Error creating match:`, matchError)
        continue
      }

      // Add both users to match
      const { error: memberError } = await supabase
        .from('match_members')
        .insert([
          {
            match_id: match.id,
            profile_id: userProfile.id,
            compatibility_score: 85 + Math.random() * 10,
            compatibility_factors: {
              specialty: userProfile.medical_specialty === otherProfile.medical_specialty ? 0.9 : 0.6,
              interests: 0.7,
              location: 0.8
            },
            is_active: true
          },
          {
            match_id: match.id,
            profile_id: otherProfile.id,
            compatibility_score: 85 + Math.random() * 10,
            compatibility_factors: {
              specialty: userProfile.medical_specialty === otherProfile.medical_specialty ? 0.9 : 0.6,
              interests: 0.7,
              location: 0.8
            },
            is_active: true
          }
        ])

      if (memberError) {
        console.error(`❌ Error adding members to match:`, memberError)
        continue
      }

      // Create chat room
      const { data: chatRoom, error: chatRoomError } = await supabase
        .from('chat_rooms')
        .insert({
          match_id: match.id,
          name: `${userProfile.first_name} & ${otherProfile.first_name}`,
          description: `Chat room for ${userProfile.first_name} and ${otherProfile.first_name}`,
          is_active: true,
          message_count: 0,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single()

      if (chatRoomError) {
        console.error(`❌ Error creating chat room:`, chatRoomError)
        continue
      }

      // Create sample messages
      const sampleMessages = [
        {
          chat_room_id: chatRoom.id,
          match_id: match.id,
          sender_id: userProfile.id,
          content: `Hello ${otherProfile.first_name}! Great to be matched with you. I'm excited to connect and learn about your work in ${otherProfile.medical_specialty}.`,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          chat_room_id: chatRoom.id,
          match_id: match.id,
          sender_id: otherProfile.id,
          content: `Hi ${userProfile.first_name}! Likewise, it's wonderful to meet another medical professional. I'd love to hear about your experience in ${userProfile.medical_specialty} and share some insights from my practice.`,
          created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() // 1.5 hours ago
        },
        {
          chat_room_id: chatRoom.id,
          match_id: match.id,
          sender_id: userProfile.id,
          content: `That sounds great! I've been working in ${userProfile.medical_specialty} for several years now. Have you attended any interesting conferences recently?`,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
        },
        {
          chat_room_id: chatRoom.id,
          match_id: match.id,
          sender_id: otherProfile.id,
          content: `Yes! I was at the Medical Innovation Summit last month. The discussions on AI in healthcare were fascinating. What's your take on technology integration in medical practice?`,
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
        }
      ]

      const { error: messagesError } = await supabase
        .from('chat_messages')
        .insert(sampleMessages)

      if (messagesError) {
        console.error(`❌ Error creating messages:`, messagesError)
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

      console.log(`✅ Created match and chat room: ${userProfile.first_name} & ${otherProfile.first_name}`)
    }

    console.log('\n🎉 Matches creation completed!')
    console.log('💡 Try refreshing the messages page now.')

  } catch (error) {
    console.error('❌ Error creating matches:', error)
  }
}

// Run the script
createMatchesForUser()
  .then(() => {
    console.log('\n✨ Match creation completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
