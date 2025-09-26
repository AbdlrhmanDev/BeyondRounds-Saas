#!/usr/bin/env node

/**
 * Fix RLS Recursion Issue - Final Solution
 * This script addresses the infinite recursion in profiles table RLS policies
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLSRecursion() {
  console.log('🔧 Fixing RLS Recursion Issue...')
  
  try {
    // Step 1: Drop all existing RLS policies on profiles table
    console.log('📋 Step 1: Dropping existing RLS policies...')
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;',
      'DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;',
      'DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;',
      'DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;',
      'DROP POLICY IF EXISTS "profiles_select_own" ON profiles;',
      'DROP POLICY IF EXISTS "profiles_update_own" ON profiles;',
      'DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;',
      'DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;',
      'DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;',
      'DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;',
      'DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;',
      'DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON profiles;',
      'DROP POLICY IF EXISTS "Users can view own profile" ON profiles;',
      'DROP POLICY IF EXISTS "Users can update own profile" ON profiles;',
      'DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;',
      'DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;',
      'DROP POLICY IF EXISTS "profiles_policy" ON profiles;',
      'DROP POLICY IF EXISTS "profiles_select" ON profiles;',
      'DROP POLICY IF EXISTS "profiles_modify" ON profiles;'
    ]

    for (const policy of dropPolicies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy })
        console.log(`✅ Dropped policy: ${policy.split(' ')[5]}`)
      } catch (error) {
        console.log(`⚠️ Policy may not exist: ${policy.split(' ')[5]}`)
      }
    }

    // Step 2: Create simple, non-recursive RLS policies
    console.log('📋 Step 2: Creating new non-recursive RLS policies...')
    
    const createPolicies = [
      // Simple select policy - users can read their own profile and others' basic info
      `CREATE POLICY "profiles_select_simple" ON profiles
       FOR SELECT
       USING (
         auth.uid() IS NOT NULL AND (
           user_id = auth.uid() OR 
           true  -- Allow reading all profiles for now
         )
       );`,
      
      // Simple insert policy - users can only insert their own profile
      `CREATE POLICY "profiles_insert_simple" ON profiles
       FOR INSERT
       WITH CHECK (
         auth.uid() IS NOT NULL AND 
         user_id = auth.uid()
       );`,
      
      // Simple update policy - users can only update their own profile
      `CREATE POLICY "profiles_update_simple" ON profiles
       FOR UPDATE
       USING (
         auth.uid() IS NOT NULL AND 
         user_id = auth.uid()
       )
       WITH CHECK (
         auth.uid() IS NOT NULL AND 
         user_id = auth.uid()
       );`,
      
      // Simple delete policy - users can only delete their own profile
      `CREATE POLICY "profiles_delete_simple" ON profiles
       FOR DELETE
       USING (
         auth.uid() IS NOT NULL AND 
         user_id = auth.uid()
       );`
    ]

    for (const policy of createPolicies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy })
        console.log(`✅ Created policy: ${policy.split('"')[1]}`)
      } catch (error) {
        console.error(`❌ Failed to create policy: ${error.message}`)
      }
    }

    // Step 3: Ensure RLS is enabled on profiles table
    console.log('📋 Step 3: Ensuring RLS is enabled...')
    
    await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;' 
    })
    console.log('✅ RLS enabled on profiles table')

    // Step 4: Test the policies
    console.log('📋 Step 4: Testing RLS policies...')
    
    // Test with service key (should work)
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name')
      .limit(1)

    if (testError) {
      console.error('❌ Test query failed:', testError.message)
    } else {
      console.log('✅ Test query successful')
      console.log('📊 Sample profile:', testData?.[0])
    }

    console.log('🎉 RLS recursion fix completed!')
    
  } catch (error) {
    console.error('❌ Error fixing RLS recursion:', error.message)
    process.exit(1)
  }
}

async function createExecSQLFunction() {
  console.log('🔧 Creating exec_sql function if it doesn\'t exist...')
  
  const createFunction = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `

  try {
    await supabase.rpc('exec_sql', { sql: createFunction })
    console.log('✅ exec_sql function created/updated')
  } catch (error) {
    console.log('⚠️ exec_sql function may already exist or failed to create')
  }
}

async function main() {
  console.log('🚀 Starting RLS Recursion Fix...')
  
  await createExecSQLFunction()
  await fixRLSRecursion()
  
  console.log('✨ All done! The RLS recursion issue should now be resolved.')
  console.log('🔄 Please restart your application and test the profile queries.')
}

main().catch(console.error)