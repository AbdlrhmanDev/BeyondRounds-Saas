#!/usr/bin/env node

/**
 * BeyondRounds Valid Users Creation Script
 * Creates users that can actually log in successfully
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const validUsers = [
  {
    email: 'test.user@beyondrounds.com',
    password: 'password123',
    role: 'user',
    user_metadata: {
      first_name: 'Test',
      last_name: 'User',
      city: 'Riyadh',
      medical_specialty: 'General Practice'
    }
  },
  {
    email: 'test.admin@beyondrounds.com',
    password: 'password123',
    role: 'admin',
    user_metadata: {
      first_name: 'Test',
      last_name: 'Admin',
      city: 'Riyadh',
      medical_specialty: 'Administration'
    }
  },
  {
    email: 'ahmed.doctor@beyondrounds.com',
    password: 'password123',
    role: 'user',
    user_metadata: {
      first_name: 'Ahmed',
      last_name: 'Doctor',
      city: 'Riyadh',
      medical_specialty: 'Cardiology'
    }
  },
  {
    email: 'sara.doctor@beyondrounds.com',
    password: 'password123',
    role: 'user',
    user_metadata: {
      first_name: 'Sara',
      last_name: 'Doctor',
      city: 'Jeddah',
      medical_specialty: 'Dermatology'
    }
  }
]

async function createValidUsers() {
  console.log('🔐 Creating Valid Users for Login Testing...')
  console.log('============================================\n')

  for (const user of validUsers) {
    try {
      console.log(`📝 Creating user: ${user.email}`)
      
      // Delete existing user if exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers.users.find(u => u.email === user.email)
      
      if (existingUser) {
        console.log(`🗑️  Deleting existing user: ${user.email}`)
        await supabase.auth.admin.deleteUser(existingUser.id)
      }
      
      // Create new user
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.user_metadata
      })

      if (error) {
        console.error(`❌ Error creating ${user.email}:`, error.message)
        continue
      }

      if (data.user) {
        console.log(`✅ Created user: ${user.email} (ID: ${data.user.id})`)
        
        // Create profile
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
              role: user.role,
              is_verified: true,
              is_banned: false,
              onboarding_completed: true,
              profile_completion: 100,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.error(`⚠️  Profile creation failed:`, profileError.message)
          } else {
            console.log(`✅ Profile created for ${user.email}`)
          }
        } catch (profileErr) {
          console.error(`⚠️  Profile creation error:`, profileErr.message)
        }
      }
    } catch (err) {
      console.error(`❌ Unexpected error creating ${user.email}:`, err.message)
    }
    
    console.log('') // Empty line for readability
  }

  console.log('🎉 Valid Users Creation Completed!')
  console.log('\n📋 Login Credentials:')
  console.log('=====================')
  validUsers.forEach(user => {
    console.log(`Email: ${user.email}`)
    console.log(`Password: ${user.password}`)
    console.log(`Role: ${user.role}`)
    console.log('---')
  })
  
  console.log('\n🔗 Test Login Steps:')
  console.log('1. Go to: http://localhost:3000/auth/login')
  console.log('2. Use any of the credentials above')
  console.log('3. Check browser console for redirect messages')
  console.log('4. Admin users should go to /admin')
  console.log('5. Regular users should go to /dashboard')
}

// Run the script
createValidUsers().catch(console.error)
