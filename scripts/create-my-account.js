#!/usr/bin/env node

/**
 * Create Specific User Account Script
 * Creates the user account for abdlrhmannabil@gmail.com
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

async function createUserAccount() {
  console.log('👤 Creating User Account: abdlrhmannabil@gmail.com')
  console.log('================================================\n')

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.email === 'abdlrhmannabil@gmail.com')
    
    if (existingUser) {
      console.log('✅ User already exists!')
      console.log('   Email:', existingUser.email)
      console.log('   ID:', existingUser.id)
      console.log('   Confirmed:', existingUser.email_confirmed_at ? 'Yes' : 'No')
      console.log('   Created:', new Date(existingUser.created_at).toLocaleString())
      
      if (!existingUser.email_confirmed_at) {
        console.log('\n⚠️  User exists but email is not confirmed')
        console.log('You can either:')
        console.log('1. Confirm the email manually in Supabase Dashboard')
        console.log('2. Or use the "Resend confirmation" button on the login page')
      }
      
      return existingUser
    }

    // Create new user
    console.log('📝 Creating new user account...')
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'abdlrhmannabil@gmail.com',
      password: 'YourPassword123!', // You can change this
      email_confirm: true, // Skip email confirmation for testing
      user_metadata: {
        first_name: 'Abdulrahman',
        last_name: 'Nabil',
        city: 'Riyadh',
        medical_specialty: 'General Practice'
      }
    })

    if (error) {
      console.error('❌ Error creating user:', error.message)
      return null
    }

    console.log('✅ User created successfully!')
    console.log('   Email: abdlrhmannabil@gmail.com')
    console.log('   Password: YourPassword123!')
    console.log('   User ID:', data.user.id)
    console.log('   Email confirmed: Yes')

    // Create profile
    try {
      console.log('\n👤 Creating profile...')
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          email: 'abdlrhmannabil@gmail.com',
          first_name: 'Abdulrahman',
          last_name: 'Nabil',
          medical_specialty: 'General Practice',
          city: 'Riyadh',
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
        console.error('⚠️  Profile creation failed:', profileError.message)
        console.log('The user account was created, but profile creation failed.')
        console.log('You can create the profile manually or it will be created automatically on first login.')
      } else {
        console.log('✅ Profile created successfully!')
      }
    } catch (profileErr) {
      console.error('⚠️  Profile creation error:', profileErr.message)
    }

    console.log('\n🎉 Account creation completed!')
    console.log('\n📋 Login Credentials:')
    console.log('====================')
    console.log('Email: abdlrhmannabil@gmail.com')
    console.log('Password: YourPassword123!')
    console.log('\n🔗 You can now login at: http://localhost:3000/auth/login')

    return data.user

  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    return null
  }
}

// Run the script
createUserAccount().catch(console.error)
