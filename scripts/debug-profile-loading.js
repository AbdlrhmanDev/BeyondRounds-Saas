#!/usr/bin/env node

/**
 * Debug Profile Loading Issue
 * Check why profile is not loading for the current user
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

async function debugProfileLoading() {
  try {
    console.log('🔍 Debugging profile loading issue...')

    // The user ID from the terminal logs
    const testUserId = 'f4322027-66bd-4016-98f2-96fe8416896c'
    
    console.log(`\n👤 Debugging user: ${testUserId}`)

    // Check auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(testUserId)
    
    if (authError) {
      console.error('❌ Error fetching auth user:', authError)
      return
    }

    console.log('✅ Auth user found:', {
      id: authUser.user.id,
      email: authUser.user.email,
      created_at: authUser.user.created_at
    })

    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUserId)

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return
    }

    console.log(`\n📋 Profiles found: ${profiles.length}`)
    profiles.forEach((profile, index) => {
      console.log(`  ${index + 1}. Profile ID: ${profile.id}`)
      console.log(`     User ID: ${profile.user_id}`)
      console.log(`     Email: ${profile.email}`)
      console.log(`     Name: ${profile.first_name} ${profile.last_name}`)
      console.log(`     Role: ${profile.role}`)
      console.log(`     Verified: ${profile.is_verified}`)
    })

    // Test the exact query used in useAuthUser hook
    console.log('\n🧪 Testing useAuthUser query...')
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUserId)
      .maybeSingle()

    if (error) {
      console.error('❌ Error in useAuthUser query:', error)
    } else {
      console.log('✅ useAuthUser query result:', profileData ? 'Profile found' : 'No profile found')
      if (profileData) {
        console.log('   Profile details:', {
          id: profileData.id,
          email: profileData.email,
          name: `${profileData.first_name} ${profileData.last_name}`,
          role: profileData.role
        })
      }
    }

    // Check if there are any RLS issues
    console.log('\n🔒 Checking RLS policies...')
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'profiles' })
      .catch(() => ({ data: null, error: { message: 'Function not available' } }))

    if (policiesError) {
      console.log('⚠️  Could not check RLS policies:', policiesError.message)
    } else {
      console.log('✅ RLS policies:', policies)
    }

    // Test with service role (should bypass RLS)
    console.log('\n🔧 Testing with service role...')
    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey)
    
    const { data: serviceProfile, error: serviceError } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUserId)
      .maybeSingle()

    if (serviceError) {
      console.error('❌ Service role query error:', serviceError)
    } else {
      console.log('✅ Service role query result:', serviceProfile ? 'Profile found' : 'No profile found')
    }

  } catch (error) {
    console.error('❌ Error debugging profile loading:', error)
  }
}

// Run the script
debugProfileLoading()
  .then(() => {
    console.log('\n✨ Debug completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
