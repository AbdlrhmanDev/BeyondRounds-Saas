const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestProfiles() {
  console.log('👥 Creating Test Profiles...')
  
  try {
    // Create test profiles with different specialties
    const testProfiles = [
      {
        user_id: '9a83f7ec-1b03-4402-9f52-00b8b2224f6c', // Your user ID
        first_name: 'John',
        last_name: 'Doe',
        medical_specialty: 'Cardiology',
        city: 'New York',
        is_verified: true,
        onboarding_completed: true,
        is_banned: false,
        bio: 'Experienced cardiologist with 10+ years in interventional cardiology.',
        age: 35,
        gender: 'male',
        phone_number: '+1234567890',
        last_active_at: new Date().toISOString()
      },
      {
        user_id: 'test-user-2',
        first_name: 'Sarah',
        last_name: 'Smith',
        medical_specialty: 'Cardiology',
        city: 'Boston',
        is_verified: true,
        onboarding_completed: true,
        is_banned: false,
        bio: 'Cardiologist specializing in heart failure and transplantation.',
        age: 32,
        gender: 'female',
        phone_number: '+1234567891',
        last_active_at: new Date().toISOString()
      },
      {
        user_id: 'test-user-3',
        first_name: 'Michael',
        last_name: 'Johnson',
        medical_specialty: 'Neurology',
        city: 'Chicago',
        is_verified: true,
        onboarding_completed: true,
        is_banned: false,
        bio: 'Neurologist with expertise in stroke and movement disorders.',
        age: 38,
        gender: 'male',
        phone_number: '+1234567892',
        last_active_at: new Date().toISOString()
      },
      {
        user_id: 'test-user-4',
        first_name: 'Emily',
        last_name: 'Davis',
        medical_specialty: 'Pediatrics',
        city: 'Los Angeles',
        is_verified: true,
        onboarding_completed: true,
        is_banned: false,
        bio: 'Pediatrician passionate about child health and development.',
        age: 29,
        gender: 'female',
        phone_number: '+1234567893',
        last_active_at: new Date().toISOString()
      },
      {
        user_id: 'test-user-5',
        first_name: 'David',
        last_name: 'Wilson',
        medical_specialty: 'Emergency Medicine',
        city: 'Miami',
        is_verified: true,
        onboarding_completed: true,
        is_banned: false,
        bio: 'Emergency medicine physician with trauma surgery experience.',
        age: 41,
        gender: 'male',
        phone_number: '+1234567894',
        last_active_at: new Date().toISOString()
      }
    ]

    console.log(`📝 Creating ${testProfiles.length} test profiles...`)
    
    const { data: createdProfiles, error: createError } = await supabase
      .from('profiles')
      .insert(testProfiles)
      .select()

    if (createError) {
      console.error('❌ Error creating profiles:', createError.message)
      console.error('🔍 Full error:', createError)
      return
    }

    console.log(`✅ Successfully created ${createdProfiles.length} profiles!`)
    
    createdProfiles.forEach(profile => {
      console.log(`  - ${profile.first_name} ${profile.last_name} (${profile.medical_specialty}) - ID: ${profile.id}`)
    })

    // Now test group joining
    console.log('\n🚀 Testing group joining with new profiles...')
    
    const testUserId = '9a83f7ec-1b03-4402-9f52-00b8b2224f6c'
    const testGroupId = 'test-group-123'

    const response = await fetch('http://localhost:3000/api/matching/join-group', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: testUserId,
        groupId: testGroupId
      })
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Join group API successful!')
      console.log('📊 Result:', result)
    } else {
      console.error('❌ Join group API failed:', result)
    }

    // Check what was created
    console.log('\n📋 Checking created matches...')
    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)

    if (matches && matches.length > 0) {
      console.log(`✅ Found ${matches.length} matches:`)
      matches.forEach(match => {
        console.log(`  - ${match.group_name} (${match.status}) - Size: ${match.group_size}`)
      })
    }

    console.log('\n👥 Checking match members...')
    const { data: members } = await supabase
      .from('match_members')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (members && members.length > 0) {
      console.log(`✅ Found ${members.length} match members:`)
      members.forEach(member => {
        console.log(`  - Match: ${member.match_id}, Profile: ${member.profile_id}, Active: ${member.is_active}`)
      })
    }

    console.log('\n💬 Checking chat rooms...')
    const { data: chatRooms } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)

    if (chatRooms && chatRooms.length > 0) {
      console.log(`✅ Found ${chatRooms.length} chat rooms:`)
      chatRooms.forEach(room => {
        console.log(`  - ${room.name} (Match: ${room.match_id}) - Active: ${room.is_active}`)
      })
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message)
  }
}

createTestProfiles()


