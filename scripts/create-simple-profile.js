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

async function createTestProfilesSimple() {
  console.log('👥 Creating Test Profiles (Simple Version)...')
  
  try {
    // First, let's try to create profiles without phone_number to test RLS
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
        last_active_at: new Date().toISOString()
      }
    ]

    console.log(`📝 Creating ${testProfiles.length} test profile...`)
    
    // Try to insert profile
    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert(testProfiles)
      .select()

    if (createError) {
      console.error('❌ Error creating profile:', createError.message)
      console.error('🔍 Full error:', createError)
      
      if (createError.message.includes('row-level security')) {
        console.log('\n🔒 RLS POLICY BLOCKING INSERT!')
        console.log('📝 You need to temporarily disable RLS or modify the policy.')
        console.log('\n🔧 Quick Fix - Run this SQL in Supabase Dashboard:')
        console.log('=' .repeat(50))
        console.log('-- Temporarily disable RLS for testing')
        console.log('ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;')
        console.log('=' .repeat(50))
        console.log('Then run this script again.')
      }
      return
    }

    console.log(`✅ Successfully created profile!`)
    console.log(`  - ${createdProfile[0].first_name} ${createdProfile[0].last_name} (${createdProfile[0].medical_specialty}) - ID: ${createdProfile[0].id}`)

    // Now test group joining
    console.log('\n🚀 Testing group joining...')
    
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

createTestProfilesSimple()


