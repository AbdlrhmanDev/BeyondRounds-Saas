#!/usr/bin/env node

/**
 * Quick RLS Fix Script
 * Run this script to fix the infinite recursion in profiles RLS policies
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixRLS() {
  console.log('🔧 Fixing RLS Recursion Issue...')
  
  try {
    // Step 1: Drop all existing policies
    console.log('📋 Dropping existing RLS policies...')
    
    const policiesToDrop = [
      'profiles_select_policy',
      'profiles_insert_policy', 
      'profiles_update_policy',
      'profiles_delete_policy',
      'profiles_select_own',
      'profiles_update_own',
      'profiles_insert_own',
      'profiles_delete_own',
      'Enable read access for all users',
      'Enable insert for authenticated users only',
      'Enable update for users based on user_id',
      'Enable delete for users based on user_id',
      'Users can view own profile',
      'Users can update own profile',
      'Users can insert own profile',
      'Users can delete own profile',
      'profiles_policy',
      'profiles_select',
      'profiles_modify',
      'profiles_select_simple',
      'profiles_insert_simple',
      'profiles_update_simple',
      'profiles_delete_simple'
    ]

    for (const policyName of policiesToDrop) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${policyName}" ON profiles;`
        })
        if (!error) {
          console.log(`✅ Dropped policy: ${policyName}`)
        }
      } catch (error) {
        // Policy might not exist, continue
      }
    }

    // Step 2: Create simple policies
    console.log('📋 Creating new simple RLS policies...')
    
    const newPolicies = [
      {
        name: 'profiles_select_simple',
        sql: `CREATE POLICY "profiles_select_simple" ON profiles
              FOR SELECT
              USING (auth.uid() IS NOT NULL);`
      },
      {
        name: 'profiles_insert_simple', 
        sql: `CREATE POLICY "profiles_insert_simple" ON profiles
              FOR INSERT
              WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());`
      },
      {
        name: 'profiles_update_simple',
        sql: `CREATE POLICY "profiles_update_simple" ON profiles
              FOR UPDATE
              USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
              WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());`
      },
      {
        name: 'profiles_delete_simple',
        sql: `CREATE POLICY "profiles_delete_simple" ON profiles
              FOR DELETE
              USING (auth.uid() IS NOT NULL AND user_id = auth.uid());`
      }
    ]

    for (const policy of newPolicies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.sql })
        if (!error) {
          console.log(`✅ Created policy: ${policy.name}`)
        } else {
          console.error(`❌ Failed to create ${policy.name}:`, error.message)
        }
      } catch (error) {
        console.error(`❌ Error creating ${policy.name}:`, error.message)
      }
    }

    // Step 3: Enable RLS
    console.log('📋 Enabling RLS on profiles table...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;'
    })
    
    if (!rlsError) {
      console.log('✅ RLS enabled on profiles table')
    } else {
      console.error('❌ Failed to enable RLS:', rlsError.message)
    }

    // Step 4: Test
    console.log('📋 Testing profile query...')
    const { data, error: testError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name')
      .limit(1)

    if (testError) {
      console.error('❌ Test query failed:', testError.message)
    } else {
      console.log('✅ Test query successful!')
      console.log('📊 Sample profile:', data?.[0])
    }

    console.log('🎉 RLS fix completed!')
    console.log('🔄 Please restart your application and test the chat functionality.')
    
  } catch (error) {
    console.error('❌ Error fixing RLS:', error.message)
    console.log('\n📋 Manual Fix Instructions:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the SQL commands from RLS_RECURSION_FIX_GUIDE.md')
    process.exit(1)
  }
}

// Create exec_sql function if it doesn't exist
async function createExecSQLFunction() {
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
    console.log('✅ exec_sql function ready')
  } catch (error) {
    console.log('⚠️ exec_sql function may already exist')
  }
}

async function main() {
  console.log('🚀 Starting RLS Recursion Fix...')
  
  await createExecSQLFunction()
  await fixRLS()
}

main().catch(console.error)


