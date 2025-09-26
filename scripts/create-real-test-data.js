require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

console.log('🔍 Environment check:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables!')
  console.log('Please check your .env.local file and make sure it has:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
  console.log('- SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTestData() {
  console.log('🚀 Creating comprehensive test data for BeyondRounds...')

  try {
    // Create test users and profiles
    const testUsers = [
      {
        email: 'dr.sarah.chen@example.com',
        password: 'MedicalPass123!',
        first_name: 'Sarah',
        last_name: 'Chen',
        medical_specialty: 'Cardiology',
        city: 'San Francisco',
        age: 32,
        gender: 'female',
        bio: 'Cardiologist passionate about preventive medicine and patient care.',
        looking_for: 'Professional networking and coffee meetups'
      },
      {
        email: 'dr.michael.rodriguez@example.com',
        password: 'MedicalPass123!',
        first_name: 'Michael',
        last_name: 'Rodriguez',
        medical_specialty: 'Emergency Medicine',
        city: 'Los Angeles',
        age: 29,
        gender: 'male',
        bio: 'Emergency medicine resident looking to connect with fellow healthcare professionals.',
        looking_for: 'Study groups and outdoor activities'
      },
      {
        email: 'dr.emily.johnson@example.com',
        password: 'MedicalPass123!',
        first_name: 'Emily',
        last_name: 'Johnson',
        medical_specialty: 'Pediatrics',
        city: 'Seattle',
        age: 31,
        gender: 'female',
        bio: 'Pediatrician who loves working with children and their families.',
        looking_for: 'Book clubs and hiking groups'
      },
      {
        email: 'dr.david.kim@example.com',
        password: 'MedicalPass123!',
        first_name: 'David',
        last_name: 'Kim',
        medical_specialty: 'Internal Medicine',
        city: 'New York',
        age: 35,
        gender: 'male',
        bio: 'Internal medicine physician focused on chronic disease management.',
        looking_for: 'Professional development and networking'
      },
      {
        email: 'dr.lisa.wang@example.com',
        password: 'MedicalPass123!',
        first_name: 'Lisa',
        last_name: 'Wang',
        medical_specialty: 'Orthopedics',
        city: 'Chicago',
        age: 33,
        gender: 'female',
        bio: 'Orthopedic surgeon specializing in sports medicine.',
        looking_for: 'Fitness activities and medical conferences'
      }
    ]

    const createdProfiles = []

    for (const userData of testUsers) {
      console.log(`Creating user: ${userData.email}`)
      
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name
        }
      })

      if (authError) {
        console.error(`Error creating auth user ${userData.email}:`, authError)
        continue
      }

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authUser.user.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          medical_specialty: userData.medical_specialty,
          city: userData.city,
          age: userData.age,
          gender: userData.gender,
          bio: userData.bio,
          looking_for: userData.looking_for,
          role: 'user',
          is_verified: true,
          onboarding_completed: true,
          profile_completion: 85
        })
        .select()
        .single()

      if (profileError) {
        console.error(`Error creating profile for ${userData.email}:`, profileError)
        continue
      }

      createdProfiles.push(profile)
      console.log(`✅ Created profile for ${userData.first_name} ${userData.last_name}`)
    }

    // Create match batches
    console.log('Creating match batches...')
    const { data: batch, error: batchError } = await supabase
      .from('match_batches')
      .insert({
        batch_date: new Date().toISOString().split('T')[0],
        total_eligible_users: createdProfiles.length,
        total_groups_created: 2,
        total_users_matched: createdProfiles.length,
        algorithm_version: 'v2.0',
        processing_started_at: new Date().toISOString(),
        processing_completed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (batchError) {
      console.error('Error creating batch:', batchError)
    }

    // Create matches
    console.log('Creating matches...')
    const matches = [
      {
        batch_id: batch?.id,
        group_name: 'Cardiology & Emergency Medicine',
        match_week: new Date().toISOString().split('T')[0],
        group_size: 2,
        average_compatibility: 88,
        algorithm_version: 'v2.0',
        matching_criteria: { specialty_compatibility: true, location_proximity: true },
        success_metrics: { response_rate: 95, engagement_score: 92 }
      },
      {
        batch_id: batch?.id,
        group_name: 'Pediatrics & Internal Medicine',
        match_week: new Date().toISOString().split('T')[0],
        group_size: 2,
        average_compatibility: 85,
        algorithm_version: 'v2.0',
        matching_criteria: { specialty_compatibility: true, location_proximity: true },
        success_metrics: { response_rate: 90, engagement_score: 88 }
      }
    ]

    const createdMatches = []
    for (const matchData of matches) {
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert(matchData)
        .select()
        .single()

      if (matchError) {
        console.error('Error creating match:', matchError)
        continue
      }

      createdMatches.push(match)
    }

    // Create match members
    console.log('Creating match members...')
    const matchMembers = [
      // Match 1: Sarah (Cardiology) + Michael (Emergency Medicine)
      {
        match_id: createdMatches[0]?.id,
        profile_id: createdProfiles[0]?.id, // Sarah
        compatibility_score: 88,
        compatibility_factors: { specialty_compatibility: 85, location_proximity: 90, age_compatibility: 88 }
      },
      {
        match_id: createdMatches[0]?.id,
        profile_id: createdProfiles[1]?.id, // Michael
        compatibility_score: 88,
        compatibility_factors: { specialty_compatibility: 85, location_proximity: 90, age_compatibility: 88 }
      },
      // Match 2: Emily (Pediatrics) + David (Internal Medicine)
      {
        match_id: createdMatches[1]?.id,
        profile_id: createdProfiles[2]?.id, // Emily
        compatibility_score: 85,
        compatibility_factors: { specialty_compatibility: 80, location_proximity: 85, age_compatibility: 90 }
      },
      {
        match_id: createdMatches[1]?.id,
        profile_id: createdProfiles[3]?.id, // David
        compatibility_score: 85,
        compatibility_factors: { specialty_compatibility: 80, location_proximity: 85, age_compatibility: 90 }
      }
    ]

    for (const memberData of matchMembers) {
      const { error: memberError } = await supabase
        .from('match_members')
        .insert(memberData)

      if (memberError) {
        console.error('Error creating match member:', memberError)
      }
    }

    // Create chat rooms
    console.log('Creating chat rooms...')
    const chatRooms = [
      {
        match_id: createdMatches[0]?.id,
        name: 'Cardiology & Emergency Medicine',
        description: 'Connect with fellow cardiology and emergency medicine professionals',
        is_active: true,
        message_count: 0,
        last_message_at: new Date().toISOString(),
        settings: { notifications_enabled: true, auto_join: true }
      },
      {
        match_id: createdMatches[1]?.id,
        name: 'Pediatrics & Internal Medicine',
        description: 'Discussion group for pediatrics and internal medicine professionals',
        is_active: true,
        message_count: 0,
        last_message_at: new Date().toISOString(),
        settings: { notifications_enabled: true, auto_join: true }
      }
    ]

    const createdChatRooms = []
    for (const roomData of chatRooms) {
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert(roomData)
        .select()
        .single()

      if (roomError) {
        console.error('Error creating chat room:', roomError)
        continue
      }

      createdChatRooms.push(room)
    }

    // Create sample messages
    console.log('Creating sample messages...')
    const sampleMessages = [
      {
        chat_room_id: createdChatRooms[0]?.id,
        match_id: createdMatches[0]?.id,
        sender_id: createdProfiles[0]?.id, // Sarah
        content: 'Hi everyone! Excited to connect with fellow medical professionals. Anyone interested in a coffee meetup this weekend?',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        chat_room_id: createdChatRooms[0]?.id,
        match_id: createdMatches[0]?.id,
        sender_id: createdProfiles[1]?.id, // Michael
        content: 'That sounds great! I\'d love to meet up. How about Saturday morning at Blue Bottle Coffee?',
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      },
      {
        chat_room_id: createdChatRooms[1]?.id,
        match_id: createdMatches[1]?.id,
        sender_id: createdProfiles[2]?.id, // Emily
        content: 'Hello! Looking forward to connecting with everyone. I\'m particularly interested in discussing pediatric care innovations.',
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
      },
      {
        chat_room_id: createdChatRooms[1]?.id,
        match_id: createdMatches[1]?.id,
        sender_id: createdProfiles[3]?.id, // David
        content: 'Great to meet you all! I\'d be happy to share insights from internal medicine practice.',
        created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() // 1.5 hours ago
      }
    ]

    for (const messageData of sampleMessages) {
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert(messageData)

      if (messageError) {
        console.error('Error creating message:', messageError)
      }
    }

    // Update chat room message counts
    for (const room of createdChatRooms) {
      const { error: updateError } = await supabase
        .from('chat_rooms')
        .update({
          message_count: 2,
          last_message_at: new Date().toISOString()
        })
        .eq('id', room.id)

      if (updateError) {
        console.error('Error updating chat room:', updateError)
      }
    }

    // Create notifications
    console.log('Creating notifications...')
    const notifications = [
      {
        profile_id: createdProfiles[0]?.id,
        title: 'New Match!',
        message: 'You have been matched with Dr. Michael Rodriguez (88% compatibility)',
        type: 'match',
        is_read: false,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        profile_id: createdProfiles[1]?.id,
        title: 'New Message',
        message: 'Dr. Sarah Chen sent you a message in Cardiology & Emergency Medicine group',
        type: 'message',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        profile_id: createdProfiles[2]?.id,
        title: 'New Match!',
        message: 'You have been matched with Dr. David Kim (85% compatibility)',
        type: 'match',
        is_read: false,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ]

    for (const notificationData of notifications) {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notificationData)

      if (notificationError) {
        console.error('Error creating notification:', notificationError)
      }
    }

    console.log('✅ Test data creation completed successfully!')
    console.log(`Created ${createdProfiles.length} profiles`)
    console.log(`Created ${createdMatches.length} matches`)
    console.log(`Created ${createdChatRooms.length} chat rooms`)
    console.log(`Created ${sampleMessages.length} sample messages`)
    console.log(`Created ${notifications.length} notifications`)

    console.log('\n📧 Test User Credentials:')
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} / ${user.password}`)
    })

  } catch (error) {
    console.error('❌ Error creating test data:', error)
  }
}

// Run the script
createTestData()
