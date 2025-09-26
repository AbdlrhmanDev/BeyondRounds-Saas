#!/usr/bin/env node

/**
 * Reset Password for Specific User
 * Resets password for abdlrhmannabil@gmail.com
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

async function resetPassword() {
  console.log('🔐 Resetting Password for abdlrhmannabil@gmail.com')
  console.log('================================================\n')

  try {
    // Find the user
    const { data: users } = await supabase.auth.admin.listUsers()
    const user = users.users.find(u => u.email === 'abdlrhmannabil@gmail.com')
    
    if (!user) {
      console.error('❌ User not found!')
      return
    }

    console.log('👤 Found user:')
    console.log('   Email:', user.email)
    console.log('   ID:', user.id)
    console.log('   Confirmed:', user.email_confirmed_at ? 'Yes' : 'No')

    // Reset password
    const newPassword = 'MyNewPassword123!'
    
    console.log(`\n🔄 Resetting password to: ${newPassword}`)
    
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword
    })

    if (error) {
      console.error('❌ Error resetting password:', error.message)
      return
    }

    console.log('✅ Password reset successfully!')
    console.log('\n📋 New Login Credentials:')
    console.log('==========================')
    console.log('Email: abdlrhmannabil@gmail.com')
    console.log(`Password: ${newPassword}`)
    console.log('\n🔗 You can now login at: http://localhost:3000/auth/login')

    // Test the new password
    console.log('\n🧪 Testing new password...')
    const testClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    const { data: testData, error: testError } = await testClient.auth.signInWithPassword({
      email: 'abdlrhmannabil@gmail.com',
      password: newPassword
    })

    if (testError) {
      console.error('❌ Test login failed:', testError.message)
    } else {
      console.log('✅ Test login successful!')
      console.log('   User ID:', testData.user.id)
      await testClient.auth.signOut()
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }
}

// Run the script
resetPassword().catch(console.error)
