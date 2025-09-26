#!/usr/bin/env node

/**
 * BeyondRounds Test Users Creation Script
 * Creates authenticated users in Supabase Auth using the service role
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Please check your NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const testUsers = [
  {
    email: 'ahmed.hassan@test.beyondrounds.com',
    password: 'TestPassword123!',
    user_metadata: {
      first_name: 'Ahmed',
      last_name: 'Hassan',
      city: 'Riyadh',
      medical_specialty: 'Cardiology'
    }
  },
  {
    email: 'sara.alqahtani@test.beyondrounds.com',
    password: 'TestPassword123!',
    user_metadata: {
      first_name: 'Sara',
      last_name: 'Al-Qahtani',
      city: 'Riyadh',
      medical_specialty: 'Dermatology'
    }
  },
  {
    email: 'admin@beyondrounds.com',
    password: 'AdminPassword123!',
    user_metadata: {
      first_name: 'Admin',
      last_name: 'User',
      city: 'Riyadh',
      medical_specialty: 'Administration'
    }
  }
]

async function createTestUsers() {
  console.log('🚀 Creating test users in Supabase Auth...')
  console.log('=====================================\n')

  for (const user of testUsers) {
    try {
      console.log(`📝 Creating user: ${user.email}`)
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Skip email confirmation
        user_metadata: user.user_metadata
      })

      if (error) {
        console.error(`❌ Error creating ${user.email}:`, error.message)
        continue
      }

      if (data.user) {
        console.log(`✅ Created user: ${user.email} (ID: ${data.user.id})`)
        
        // Create profile in the profiles table
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              email: user.email,
              first_name: user.user_metadata.first_name,
              last_name: user.user_metadata.last_name,
              medical_specialty: user.user_metadata.medical_specialty,
              city: user.user_metadata.city,
              gender: 'prefer-not-to-say',
              role: user.email === 'admin@beyondrounds.com' ? 'admin' : 'user',
              is_verified: true,
              is_banned: false,
              onboarding_completed: true,
              profile_completion: 100,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.error(`⚠️  Profile creation failed for ${user.email}:`, profileError.message)
          } else {
            console.log(`✅ Profile created for ${user.email}`)
          }
        } catch (profileErr) {
          console.error(`⚠️  Profile creation error for ${user.email}:`, profileErr.message)
        }
      }
    } catch (err) {
      console.error(`❌ Unexpected error creating ${user.email}:`, err.message)
    }
    
    console.log('') // Empty line for readability
  }

  console.log('🎉 Test users creation completed!')
  console.log('\n📋 Test Credentials:')
  console.log('===================')
  testUsers.forEach(user => {
    console.log(`Email: ${user.email}`)
    console.log(`Password: ${user.password}`)
    console.log(`Role: ${user.email === 'admin@beyondrounds.com' ? 'admin' : 'user'}`)
    console.log('---')
  })
  
  console.log('\n🔗 You can now test login at: http://localhost:3000/auth/login')
}

// Run the script
createTestUsers().catch(console.error)
