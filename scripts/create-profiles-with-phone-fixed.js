const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Simple UUID generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

async function createTestProfilesWithPhone() {
  console.log('👥 Creating Test Profiles with Phone Numbers...')
  
  try {
    // Create test profiles with proper UUIDs and phone numbers
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
        phone_number: '+1234567890',
        last_active_at: new Date().toISOString()
      },
      {
        user_id: generateUUID(), // Generate proper UUID
        first_name: 'Sarah',
        last_name: 'Smith',
        medical_specialty: 'Cardiology',
        city: 'Boston',
        is_verified: true,
        onboarding_completed: true,
        is_banned: false,
        bio: 'Cardiologist specializing in heart failure and transplantation.',
        phone_number: '+1234567891',
        last_active_at: new Date().toISOString()
      },
      {
        user_id: generateUUID(), // Generate proper UUID
        first_name: 'Michael',
        last_name: 'Johnson',
        medical_specialty: 'Neurology',
        city: 'Chicago',
        is_verified: true,
        onboarding_completed: true,
        is_banned: false,
        bio: 'Neurologist with expertise in stroke and movement disorders.',
        phone_number: '+1234567892',
        last_active_at: new Date().toISOString()
      },
      {
        user_id: generateUUID(), // Generate proper UUID
        first_name: 'Emily',
        last_name: 'Davis',
        medical_specialty: 'Pediatrics',
        city: 'Los Angeles',
        is_verified: true,
        onboarding_completed: true,
        is_banned: false,
        bio: 'Pediatrician passionate about child health and development.',
        phone_number: '+1234567893',
        last_active_at: new Date().toISOString()
      },
      {
        user_id: generateUUID(), // Generate proper UUID
        first_name: 'David',
        last_name: 'Wilson',
        medical_specialty: 'Emergency Medicine',
        city: 'Miami',
        is_verified: true,
        onboarding_completed: true,
        is_banned: false,
        bio: 'Emergency medicine physician with trauma surgery experience.',
        phone_number: '+1234567894',
        last_active_at: new Date().toISOString()
      }
    ]

    console.log(`📝 Creating ${testProfiles.length} test profiles...`)
    
    // Try to insert profiles (this will fail if phone_number column doesn't exist)
    const { data: createdProfiles, error: createError } = await supabase
      .from('profiles')
      .insert(testProfiles)
      .select()

    if (createError) {
      console.error('❌ Error creating profiles:', createError.message)
      
      if (createError.message.includes('phone_number')) {
        console.log('\n📱 PHONE_NUMBER COLUMN MISSING!')
        console.log('🔧 You need to add the phone_number column first.')
        console.log('\n📝 Manual Instructions:')
        console.log('1. Go to your Supabase Dashboard')
        console.log('2. Navigate to SQL Editor')
        console.log('3. Copy and paste this SQL:')
        console.log('=' .repeat(50))
        console.log('ALTER TABLE profiles ADD COLUMN phone_number VARCHAR(20);')
        console.log('=' .repeat(50))
        console.log('4. Click "Run"')
        console.log('5. Then run this script again')
        return
      }
      
      console.error('🔍 Full error:', createError)
      return
    }

    console.log(`✅ Successfully created ${createdProfiles.length} profiles!`)
    
    createdProfiles.forEach(profile => {
      console.log(`  - ${profile.first_name} ${profile.last_name} (${profile.medical_specialty}) - Phone: ${profile.phone_number} - ID: ${profile.id}`)
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

  } catch (error) {
    console.error('💥 Unexpected error:', error.message)
  }
}

createTestProfilesWithPhone()


