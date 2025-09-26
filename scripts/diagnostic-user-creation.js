// ==============================================
// BeyondRounds User Creation Diagnostic Script
// ==============================================
// Run this to test user creation directly with service key
// This will help identify if the issue is with triggers/profiles

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('❌ Missing Supabase environment variables for BeyondRounds')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!url)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!serviceKey)
  process.exit(1)
}

console.log('🔧 Testing BeyondRounds user creation with service key...')
console.log('URL:', url)
console.log('Service Key:', serviceKey.substring(0, 20) + '...')

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testUserCreation() {
  try {
    console.log('\n📝 Step 1: Creating auth user...')
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@diagnostic.com',
      password: 'Secret12!',
      email_confirm: false,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User',
        city: 'Test City'
      }
    })

    if (authError) {
      console.error('❌ Auth user creation failed:', authError)
      return
    }

    console.log('✅ Auth user created successfully:', authData.user?.id)

    // Check if profile was created by trigger
    console.log('\n📝 Step 2: Checking if profile was created by trigger...')
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    if (profileError) {
      console.log('⚠️  No profile found (trigger may not be working):', profileError.message)
      
      // Try to create profile manually
      console.log('\n📝 Step 3: Creating profile manually...')
      
      const { data: manualProfile, error: manualError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: 'test@diagnostic.com',
          first_name: 'Test',
          last_name: 'User',
          city: 'Test City',
          gender: 'prefer-not-to-say',
          is_verified: false,
          is_banned: false,
          onboarding_completed: false,
          profile_completion_percentage: 0,
          role: 'user'
        })
        .select('*')
        .single()

      if (manualError) {
        console.error('❌ Manual profile creation failed:', manualError)
      } else {
        console.log('✅ Manual profile creation successful:', manualProfile.id)
      }
    } else {
      console.log('✅ Profile created by trigger:', profileData.id)
    }

    // Test user preferences
    console.log('\n📝 Step 4: Checking user preferences...')
    
    const profileId = profileData?.id || manualProfile?.id
    
    if (profileId) {
      // Check if preferences were created by trigger
      const { data: existingPrefs, error: prefsCheckError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('profile_id', profileId)
        .single()

      if (prefsCheckError && prefsCheckError.code === 'PGRST116') {
        // No preferences found, try to create manually
        console.log('⚠️  No preferences found, creating manually...')
        
        const { data: prefsData, error: prefsError } = await supabase
          .from('user_preferences')
          .insert({
            profile_id: profileId,
            email_notifications: true,
            push_notifications: true,
            weekly_match_reminders: true,
            marketing_emails: false,
            privacy_level: 'standard'
          })
          .select('*')
          .single()

        if (prefsError) {
          console.error('❌ User preferences creation failed:', prefsError)
        } else {
          console.log('✅ User preferences created manually:', prefsData.id)
        }
      } else if (prefsCheckError) {
        console.error('❌ Error checking user preferences:', prefsCheckError)
      } else {
        console.log('✅ User preferences created by trigger:', existingPrefs.id)
      }
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await supabase.auth.admin.deleteUser(authData.user.id)
    console.log('✅ Test user deleted')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test
testUserCreation().then(() => {
  console.log('\n🏁 Diagnostic completed')
  process.exit(0)
}).catch(error => {
  console.error('❌ Diagnostic failed:', error)
  process.exit(1)
})
