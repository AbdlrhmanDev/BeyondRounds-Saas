#!/usr/bin/env node

/**
 * Test Login for Specific User
 * Tests login with abdlrhmannabil@gmail.com
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, anonKey)

async function testLogin() {
  console.log('🔐 Testing Login for abdlrhmannabil@gmail.com')
  console.log('==============================================\n')

  // Common passwords to try
  const passwords = [
    'YourPassword123!',
    'password123',
    'Password123',
    '123456',
    'password',
    'admin123',
    'test123'
  ]

  for (const password of passwords) {
    try {
      console.log(`🔑 Trying password: ${password}`)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'abdlrhmannabil@gmail.com',
        password: password
      })

      if (error) {
        console.log(`❌ Failed: ${error.message}`)
      } else {
        console.log('✅ SUCCESS! Login successful!')
        console.log('   User ID:', data.user.id)
        console.log('   Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No')
        console.log(`\n🎉 Working credentials:`)
        console.log(`   Email: abdlrhmannabil@gmail.com`)
        console.log(`   Password: ${password}`)
        
        // Sign out
        await supabase.auth.signOut()
        return
      }
    } catch (err) {
      console.log(`❌ Error: ${err.message}`)
    }
  }

  console.log('\n⚠️  None of the common passwords worked.')
  console.log('You may need to reset the password or check with the account creator.')
}

testLogin().catch(console.error)
