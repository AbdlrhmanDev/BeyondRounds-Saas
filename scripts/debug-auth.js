#!/usr/bin/env node

/**
 * BeyondRounds Authentication Debug Script
 * Helps diagnose authentication issues by testing various scenarios
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 BeyondRounds Authentication Debug Tool')
console.log('==========================================\n')

// Check environment variables
console.log('📋 Environment Check:')
console.log('====================')
console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('Anon Key:', anonKey ? '✅ Set' : '❌ Missing')
console.log('Service Role Key:', serviceRoleKey ? '✅ Set' : '❌ Missing')

if (!supabaseUrl || !anonKey) {
  console.error('\n❌ Missing required environment variables!')
  console.error('Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.')
  process.exit(1)
}

// Create clients
const supabaseAnon = createClient(supabaseUrl, anonKey)
const supabaseService = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null

async function testConnection() {
  console.log('\n🌐 Testing Supabase Connection:')
  console.log('===============================')
  
  try {
    const { data, error } = await supabaseAnon
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }
    
    console.log('✅ Connection successful')
    return true
  } catch (err) {
    console.error('❌ Connection error:', err.message)
    return false
  }
}

async function checkExistingUsers() {
  console.log('\n👥 Checking Existing Users:')
  console.log('============================')
  
  if (!supabaseService) {
    console.log('⚠️  Service role key not available - skipping user check')
    return
  }
  
  try {
    const { data: users, error } = await supabaseService.auth.admin.listUsers()
    
    if (error) {
      console.error('❌ Error fetching users:', error.message)
      return
    }
    
    console.log(`📊 Total users in auth.users: ${users.users.length}`)
    
    if (users.users.length > 0) {
      console.log('\n📋 Recent users:')
      users.users.slice(0, 5).forEach((user, index) => {
        console.log(`${index + 1}. ${user.email}`)
        console.log(`   ID: ${user.id}`)
        console.log(`   Confirmed: ${user.email_confirmed_at ? '✅' : '❌'}`)
        console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`)
        console.log('')
      })
    } else {
      console.log('⚠️  No users found in auth.users table')
    }
  } catch (err) {
    console.error('❌ Error checking users:', err.message)
  }
}

async function testLogin(email, password) {
  console.log(`\n🔐 Testing Login: ${email}`)
  console.log('========================')
  
  try {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('❌ Login failed:', error.message)
      console.error('   Status:', error.status)
      console.error('   Code:', error.code)
      return false
    }
    
    console.log('✅ Login successful!')
    console.log('   User ID:', data.user.id)
    console.log('   Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No')
    
    // Sign out
    await supabaseAnon.auth.signOut()
    return true
  } catch (err) {
    console.error('❌ Login error:', err.message)
    return false
  }
}

async function createTestUser() {
  console.log('\n🧪 Creating Test User:')
  console.log('======================')
  
  if (!supabaseService) {
    console.log('⚠️  Service role key not available - cannot create test user')
    return null
  }
  
  const testEmail = 'debug-test@beyondrounds.com'
  const testPassword = 'DebugTest123!'
  
  try {
    // First, try to delete existing test user
    const { data: existingUsers } = await supabaseService.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.email === testEmail)
    
    if (existingUser) {
      console.log('🗑️  Deleting existing test user...')
      await supabaseService.auth.admin.deleteUser(existingUser.id)
    }
    
    console.log('👤 Creating new test user...')
    const { data, error } = await supabaseService.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        first_name: 'Debug',
        last_name: 'Test',
        city: 'Test City',
        medical_specialty: 'General Practice'
      }
    })
    
    if (error) {
      console.error('❌ Failed to create test user:', error.message)
      return null
    }
    
    console.log('✅ Test user created successfully!')
    console.log('   Email:', testEmail)
    console.log('   Password:', testPassword)
    console.log('   User ID:', data.user.id)
    
    return { email: testEmail, password: testPassword }
  } catch (err) {
    console.error('❌ Error creating test user:', err.message)
    return null
  }
}

async function testProfileCreation(userId) {
  console.log('\n👤 Testing Profile Creation:')
  console.log('============================')
  
  try {
    const { data, error } = await supabaseAnon
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) {
      console.error('❌ Error fetching profile:', error.message)
      return false
    }
    
    if (data) {
      console.log('✅ Profile exists:')
      console.log('   Name:', `${data.first_name} ${data.last_name}`)
      console.log('   Role:', data.role)
      console.log('   Verified:', data.is_verified ? 'Yes' : 'No')
      console.log('   Banned:', data.is_banned ? 'Yes' : 'No')
      return true
    } else {
      console.log('⚠️  No profile found for user')
      return false
    }
  } catch (err) {
    console.error('❌ Error checking profile:', err.message)
    return false
  }
}

async function runDiagnostics() {
  console.log('🚀 Starting Authentication Diagnostics...\n')
  
  // Test connection
  const connectionOk = await testConnection()
  if (!connectionOk) {
    console.log('\n❌ Cannot proceed - connection failed')
    return
  }
  
  // Check existing users
  await checkExistingUsers()
  
  // Create and test a new user
  const testUser = await createTestUser()
  if (testUser) {
    // Test login with the new user
    const loginSuccess = await testLogin(testUser.email, testUser.password)
    
    if (loginSuccess) {
      // Test profile creation
      const { data: users } = await supabaseService.auth.admin.listUsers()
      const user = users.users.find(u => u.email === testUser.email)
      if (user) {
        await testProfileCreation(user.id)
      }
    }
  }
  
  // Test with known credentials if they exist
  const knownCredentials = [
    { email: 'admin@beyondrounds.com', password: 'AdminPassword123!' },
    { email: 'ahmed.hassan@test.beyondrounds.com', password: 'TestPassword123!' },
    { email: 'sara.alqahtani@test.beyondrounds.com', password: 'TestPassword123!' }
  ]
  
  console.log('\n🔍 Testing Known Credentials:')
  console.log('============================')
  
  for (const cred of knownCredentials) {
    await testLogin(cred.email, cred.password)
  }
  
  console.log('\n✅ Diagnostics completed!')
  console.log('\n📋 Next Steps:')
  console.log('==============')
  console.log('1. Check the console output above for any errors')
  console.log('2. If login tests fail, verify your Supabase project settings')
  console.log('3. Check Authentication > Settings in your Supabase dashboard')
  console.log('4. Ensure email confirmation is configured correctly')
  console.log('5. Verify RLS policies allow profile creation')
}

// Run the diagnostics
runDiagnostics().catch(console.error)
