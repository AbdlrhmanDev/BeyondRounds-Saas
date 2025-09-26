#!/usr/bin/env node

/**
 * BeyondRounds Medical Meet Users Creation Script
 * Creates users with @medicalmeet.com domain for comprehensive testing
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

const medicalUsers = [
  {
    email: 'ahmed.hassan@medicalmeet.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Ahmed',
      last_name: 'Hassan',
      city: 'Riyadh',
      medical_specialty: 'Cardiology'
    }
  },
  {
    email: 'sara.alqahtani@medicalmeet.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Sara',
      last_name: 'Al-Qahtani',
      city: 'Riyadh',
      medical_specialty: 'Dermatology'
    }
  },
  {
    email: 'omar.mohammed@medicalmeet.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Omar',
      last_name: 'Mohammed',
      city: 'Jeddah',
      medical_specialty: 'Orthopedics'
    }
  },
  {
    email: 'fatima.alzahra@medicalmeet.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Fatima',
      last_name: 'Al-Zahra',
      city: 'Riyadh',
      medical_specialty: 'Pediatrics'
    }
  },
  {
    email: 'khalid.alfarisi@medicalmeet.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Khalid',
      last_name: 'Al-Farisi',
      city: 'Riyadh',
      medical_specialty: 'Emergency Medicine'
    }
  },
  {
    email: 'layla.ibrahim@medicalmeet.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Layla',
      last_name: 'Ibrahim',
      city: 'Jeddah',
      medical_specialty: 'Psychiatry'
    }
  },
  {
    email: 'yusuf.alnasser@medicalmeet.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Yusuf',
      last_name: 'Al-Nasser',
      city: 'Riyadh',
      medical_specialty: 'Radiology'
    }
  },
  {
    email: 'maryam.alkhalil@medicalmeet.com',
    password: 'password123',
    user_metadata: {
      first_name: 'Maryam',
      last_name: 'Al-Khalil',
      city: 'Riyadh',
      medical_specialty: 'Obstetrics and Gynecology'
    }
  }
]

async function createMedicalUsers() {
  console.log('🏥 Creating Medical Meet users in Supabase Auth...')
  console.log('==================================================\n')

  for (const user of medicalUsers) {
    try {
      console.log(`📝 Creating user: ${user.email}`)
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Skip email confirmation
        user_metadata: user.user_metadata
      })

      if (error) {
        if (error.message.includes('already been registered')) {
          console.log(`⚠️  User ${user.email} already exists - skipping`)
          continue
        }
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
              role: 'user',
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

  console.log('🎉 Medical Meet users creation completed!')
  console.log('\n📋 Test Credentials:')
  console.log('===================')
  medicalUsers.forEach(user => {
    console.log(`Email: ${user.email}`)
    console.log(`Password: ${user.password}`)
    console.log(`Specialty: ${user.user_metadata.medical_specialty}`)
    console.log('---')
  })
  
  console.log('\n🔗 You can now test login at: http://localhost:3000/auth/login')
  console.log('📊 Run the comprehensive data script to create matches and conversations')
}

// Run the script
createMedicalUsers().catch(console.error)
