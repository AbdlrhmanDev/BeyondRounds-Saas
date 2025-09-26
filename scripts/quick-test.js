// ==============================================
// Quick Test Script (Node REPL Style)
// ==============================================
// Copy and paste this into Node REPL or run as script

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('❌ Missing SUPABASE environment variables')
  process.exit(1)
}

const c = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function quickTest() {
  // Test 1: Create auth user
  console.log('Testing auth user creation...')
  const r = await c.auth.admin.createUser({ 
    email: 'test@quick.com', 
    password: 'Secret12!',
    email_confirm: false
  })

  console.log('Auth result:', {
    error: r.error?.message,
    userId: r.data?.user?.id,
    success: !r.error
  })

  if (r.data?.user) {
    // Test 2: Check if profile was created by trigger
    console.log('\nChecking if profile was created by trigger...')
    const profileCheck = await c
      .from('profiles')
      .select('*')
      .eq('user_id', r.data.user.id)
      .single()
    
    console.log('Profile check:', {
      error: profileCheck.error?.message,
      profileId: profileCheck.data?.id,
      hasProfile: !!profileCheck.data
    })
    
    // Test 3: Check if user preferences were created by trigger
    if (profileCheck.data) {
      console.log('\nChecking if user preferences were created by trigger...')
      const prefsCheck = await c
        .from('user_preferences')
        .select('*')
        .eq('profile_id', profileCheck.data.id)
        .single()
      
      console.log('Preferences check:', {
        error: prefsCheck.error?.message,
        prefsId: prefsCheck.data?.id,
        hasPreferences: !!prefsCheck.data
      })
    }
    
    // Cleanup
    console.log('\nCleaning up...')
    await c.auth.admin.deleteUser(r.data.user.id)
    console.log('Test user deleted')
  }

  console.log('\nTest completed!')
}

// Run the test
quickTest().catch(console.error)
