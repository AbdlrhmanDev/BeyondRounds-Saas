#!/usr/bin/env node

/**
 * BeyondRounds Admin User Creation Script
 * Creates a test admin user for debugging redirect issues
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

async function createTestAdmin() {
  console.log('👑 Creating Test Admin User...')
  console.log('==============================\n')

  const adminUser = {
    email: 'admin.test@beyondrounds.com',
    password: 'AdminPassword123!',
    user_metadata: {
      first_name: 'Admin',
      last_name: 'Test',
      city: 'Riyadh',
      medical_specialty: 'Administration'
    }
  }

  try {
    console.log(`📝 Creating admin user: ${adminUser.email}`)
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminUser.email,
      password: adminUser.password,
      email_confirm: true,
      user_metadata: adminUser.user_metadata
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log(`⚠️  Admin user ${adminUser.email} already exists`)
      } else {
        console.error(`❌ Error creating admin:`, error.message)
        return
      }
    }

    if (data.user) {
      console.log(`✅ Created admin user: ${adminUser.email} (ID: ${data.user.id})`)
      
      // Create admin profile
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            email: adminUser.email,
            first_name: adminUser.user_metadata.first_name,
            last_name: adminUser.user_metadata.last_name,
            medical_specialty: adminUser.user_metadata.medical_specialty,
            city: adminUser.user_metadata.city,
            gender: 'prefer-not-to-say',
            role: 'admin', // This is the key!
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
          console.log(`✅ Admin profile created successfully`)
        }
      } catch (profileErr) {
        console.error(`⚠️  Profile creation error:`, profileErr.message)
      }
    }

    console.log('\n🎉 Test Admin Creation Completed!')
    console.log('\n📋 Admin Credentials:')
    console.log('====================')
    console.log(`Email: ${adminUser.email}`)
    console.log(`Password: ${adminUser.password}`)
    console.log(`Role: admin`)
    console.log(`Expected Redirect: /admin`)
    
    console.log('\n🔗 Test Steps:')
    console.log('1. Go to: http://localhost:3000/auth/login')
    console.log('2. Login with the credentials above')
    console.log('3. You should be redirected to /admin')
    console.log('4. Check browser console for any errors')

  } catch (err) {
    console.error(`❌ Unexpected error:`, err.message)
  }
}

// Run the script
createTestAdmin().catch(console.error)
