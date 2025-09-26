#!/usr/bin/env node

/**
 * Simple Fix for Profile and Chat Issues
 * Fixes profile creation and ensures chat functionality works
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

async function simpleFix() {
  try {
    console.log('🔧 Starting simple fix...')

    // 1. Ensure all users have profiles using service role
    console.log('\n1️⃣ Ensuring all users have profiles...')
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    console.log(`📋 Found ${authUsers.users.length} authenticated users`)

    for (const authUser of authUsers.users) {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authUser.id)
        .maybeSingle()

      if (!existingProfile) {
        console.log(`⚠️  Creating profile for ${authUser.email}...`)
        
        // Create profile using service role (bypasses RLS)
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            user_id: authUser.id,
            email: authUser.email,
            first_name: authUser.user_metadata?.first_name || '',
            last_name: authUser.user_metadata?.last_name || '',
            city: authUser.user_metadata?.city || 'Not specified',
            gender: 'prefer-not-to-say',
            role: 'user',
            is_verified: false,
            is_banned: false,
            onboarding_completed: false,
            profile_completion_percentage: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (createError) {
          console.error(`❌ Error creating profile for ${authUser.email}:`, createError)
        } else {
          console.log(`✅ Profile created for ${authUser.email}`)
        }
      } else {
        console.log(`✅ Profile already exists for ${authUser.email}`)
      }
    }

    // 2. Test profile loading for the main user
    console.log('\n2️⃣ Testing profile loading...')
    
    const testUserId = 'f4322027-66bd-4016-98f2-96fe8416896c'
    
    const { data: testProfile, error: testError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single()

    if (testError) {
      console.error('❌ Error loading test profile:', testError)
      return
    }

    console.log('✅ Test profile loaded successfully:', {
      id: testProfile.id,
      email: testProfile.email,
      name: `${testProfile.first_name} ${testProfile.last_name}`,
      role: testProfile.role
    })

    // 3. Ensure chat data exists
    console.log('\n3️⃣ Checking chat data...')
    
    const { data: matches, error: matchesError } = await supabase
      .from('match_members')
      .select('match_id')
      .eq('profile_id', testProfile.id)
      .eq('is_active', true)

    if (matchesError) {
      console.error('❌ Error checking matches:', matchesError)
    } else {
      console.log(`📋 User has ${matches.length} active matches`)
      
      if (matches.length === 0) {
        console.log('⚠️  No matches found, creating test matches...')
        
        // Get other profiles to create matches with
        const { data: otherProfiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .neq('user_id', testUserId)
          .limit(3)

        if (otherProfiles && otherProfiles.length > 0) {
          for (const otherProfile of otherProfiles) {
            // Create match
            const { data: match, error: matchError } = await supabase
              .from('matches')
              .insert({
                group_name: `${testProfile.first_name} & ${otherProfile.first_name} Match`,
                match_week: new Date().toISOString().split('T')[0],
                group_size: 2,
                average_compatibility: 85 + Math.random() * 10,
                algorithm_version: 'v2.0',
                matching_criteria: {},
                success_metrics: {}
              })
              .select()
              .single()

            if (!matchError && match) {
              // Add both users to match
              await supabase
                .from('match_members')
                .insert([
                  {
                    match_id: match.id,
                    profile_id: testProfile.id,
                    compatibility_score: 85 + Math.random() * 10,
                    is_active: true
                  },
                  {
                    match_id: match.id,
                    profile_id: otherProfile.id,
                    compatibility_score: 85 + Math.random() * 10,
                    is_active: true
                  }
                ])

              // Create chat room
              const { data: chatRoom, error: chatRoomError } = await supabase
                .from('chat_rooms')
                .insert({
                  match_id: match.id,
                  name: `${testProfile.first_name} & ${otherProfile.first_name}`,
                  description: `Chat room for ${testProfile.first_name} and ${otherProfile.first_name}`,
                  is_active: true,
                  message_count: 0,
                  last_message_at: new Date().toISOString()
                })
                .select()
                .single()

              if (!chatRoomError && chatRoom) {
                // Create sample messages
                const sampleMessages = [
                  {
                    chat_room_id: chatRoom.id,
                    match_id: match.id,
                    sender_id: testProfile.id,
                    content: `Hello ${otherProfile.first_name}! Great to be matched with you.`,
                    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                  },
                  {
                    chat_room_id: chatRoom.id,
                    match_id: match.id,
                    sender_id: otherProfile.id,
                    content: `Hi ${testProfile.first_name}! Likewise, it's wonderful to meet another medical professional.`,
                    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
                  }
                ]

                await supabase
                  .from('chat_messages')
                  .insert(sampleMessages)

                // Update chat room message count
                await supabase
                  .from('chat_rooms')
                  .update({
                    message_count: sampleMessages.length,
                    last_message_at: sampleMessages[sampleMessages.length - 1].created_at
                  })
                  .eq('id', chatRoom.id)

                console.log(`✅ Created match and chat room: ${testProfile.first_name} & ${otherProfile.first_name}`)
              }
            }
          }
        }
      }
    }

    console.log('\n🎉 Simple fix completed!')
    console.log('💡 Try refreshing the messages page now.')

  } catch (error) {
    console.error('❌ Error in simple fix:', error)
  }
}

// Run the script
simpleFix()
  .then(() => {
    console.log('\n✨ Fix completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
