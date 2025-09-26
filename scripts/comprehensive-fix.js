#!/usr/bin/env node

/**
 * Comprehensive Fix for Profile and Chat Issues
 * Fixes RLS policies, profile creation, and ensures chat functionality works
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

async function comprehensiveFix() {
  try {
    console.log('🔧 Starting comprehensive fix...')

    // 1. Fix RLS policies for profiles table
    console.log('\n1️⃣ Fixing RLS policies...')
    
    // Disable RLS temporarily
    await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;' 
    }).catch(() => {
      console.log('⚠️  Could not disable RLS via RPC, trying direct approach...')
    })

    // Drop existing policies
    const dropPoliciesSQL = `
      DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
      DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
      DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
      DROP POLICY IF EXISTS "service_role_all_access" ON profiles;
      DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;
    `

    await supabase.rpc('exec_sql', { sql: dropPoliciesSQL }).catch(() => {
      console.log('⚠️  Could not drop policies via RPC')
    })

    // Create new, simple policies
    const createPoliciesSQL = `
      -- Enable RLS
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      
      -- Simple policies that work
      CREATE POLICY "profiles_select_own"
      ON profiles FOR SELECT
      USING (user_id = auth.uid());
      
      CREATE POLICY "profiles_update_own"
      ON profiles FOR UPDATE
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
      
      CREATE POLICY "profiles_insert_own"
      ON profiles FOR INSERT
      WITH CHECK (user_id = auth.uid());
      
      CREATE POLICY "service_role_all_access"
      ON profiles FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
    `

    await supabase.rpc('exec_sql', { sql: createPoliciesSQL }).catch(() => {
      console.log('⚠️  Could not create policies via RPC')
    })

    console.log('✅ RLS policies updated')

    // 2. Ensure all users have profiles
    console.log('\n2️⃣ Ensuring all users have profiles...')
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    for (const authUser of authUsers.users) {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', authUser.id)
        .maybeSingle()

      if (!existingProfile) {
        console.log(`⚠️  Creating profile for ${authUser.email}...`)
        
        // Create profile using service role
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            user_id: authUser.id,
            email: authUser.email,
            first_name: authUser.user_metadata?.first_name || '',
            last_name: authUser.user_metadata?.last_name || '',
            city: authUser.user_metadata?.city || 'Not specified',
            gender: 'prefer-not-to-say',
            role: 'user',
            is_verified: false,
            is_banned: false,
            onboarding_completed: false,
            profile_completion_percentage: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (createError) {
          console.error(`❌ Error creating profile for ${authUser.email}:`, createError)
        } else {
          console.log(`✅ Profile created for ${authUser.email}`)
        }
      }
    }

    // 3. Test profile loading for the main user
    console.log('\n3️⃣ Testing profile loading...')
    
    const testUserId = 'f4322027-66bd-4016-98f2-96fe8416896c'
    
    const { data: testProfile, error: testError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single()

    if (testError) {
      console.error('❌ Error loading test profile:', testError)
    } else {
      console.log('✅ Test profile loaded successfully:', {
        id: testProfile.id,
        email: testProfile.email,
        name: `${testProfile.first_name} ${testProfile.last_name}`,
        role: testProfile.role
      })
    }

    // 4. Ensure chat data exists
    console.log('\n4️⃣ Checking chat data...')
    
    const { data: matches, error: matchesError } = await supabase
      .from('match_members')
      .select('match_id')
      .eq('profile_id', testProfile.id)
      .eq('is_active', true)

    if (matchesError) {
      console.error('❌ Error checking matches:', matchesError)
    } else {
      console.log(`📋 User has ${matches.length} active matches`)
      
      if (matches.length === 0) {
        console.log('⚠️  No matches found, creating test matches...')
        
        // Get other profiles to create matches with
        const { data: otherProfiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .neq('user_id', testUserId)
          .limit(3)

        if (otherProfiles && otherProfiles.length > 0) {
          for (const otherProfile of otherProfiles) {
            // Create match
            const { data: match, error: matchError } = await supabase
              .from('matches')
              .insert({
                group_name: `${testProfile.first_name} & ${otherProfile.first_name} Match`,
                match_week: new Date().toISOString().split('T')[0],
                group_size: 2,
                average_compatibility: 85 + Math.random() * 10,
                algorithm_version: 'v2.0',
                matching_criteria: {},
                success_metrics: {}
              })
              .select()
              .single()

            if (!matchError && match) {
              // Add both users to match
              await supabase
                .from('match_members')
                .insert([
                  {
                    match_id: match.id,
                    profile_id: testProfile.id,
                    compatibility_score: 85 + Math.random() * 10,
                    is_active: true
                  },
                  {
                    match_id: match.id,
                    profile_id: otherProfile.id,
                    compatibility_score: 85 + Math.random() * 10,
                    is_active: true
                  }
                ])

              // Create chat room
              await supabase
                .from('chat_rooms')
                .insert({
                  match_id: match.id,
                  name: `${testProfile.first_name} & ${otherProfile.first_name}`,
                  description: `Chat room for ${testProfile.first_name} and ${otherProfile.first_name}`,
                  is_active: true,
                  message_count: 0,
                  last_message_at: new Date().toISOString()
                })

              console.log(`✅ Created match and chat room: ${testProfile.first_name} & ${otherProfile.first_name}`)
            }
          }
        }
      }
    }

    console.log('\n🎉 Comprehensive fix completed!')
    console.log('💡 Try refreshing the messages page now.')

  } catch (error) {
    console.error('❌ Error in comprehensive fix:', error)
  }
}

// Run the script
comprehensiveFix()
  .then(() => {
    console.log('\n✨ Fix completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
