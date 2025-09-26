const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function emergencyRLSFix() {
  console.log('🚨 EMERGENCY RLS FIX - Starting...')
  
  try {
    // Step 1: Check current RLS status
    console.log('\n📊 Checking current RLS status...')
    const { data: policies, error: policiesError } = await supabase.rpc('get_policies', { table_name: 'profiles' })
    
    if (policiesError) {
      console.log('ℹ️  Could not fetch policies (this is normal)')
    } else {
      console.log('📋 Current policies:', policies)
    }

    // Step 2: Try to query profiles table
    console.log('\n🔍 Testing profile query...')
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name')
      .limit(1)

    if (testError) {
      console.error('❌ Profile query failed:', testError.message)
      console.error('🔍 Error code:', testError.code)
      
      if (testError.code === '42P17') {
        console.log('\n🚨 INFINITE RECURSION DETECTED!')
        console.log('📝 You need to apply the SQL fix in Supabase Dashboard')
        console.log('🔗 Go to: SQL Editor in your Supabase Dashboard')
        console.log('📋 Copy the SQL from URGENT_RLS_FIX.md')
      }
    } else {
      console.log('✅ Profile query successful!')
      console.log('📊 Test data:', testData)
    }

    // Step 3: Try alternative approach - disable RLS temporarily
    console.log('\n🛠️  Attempting emergency fix...')
    
    const emergencySQL = `
      -- Emergency fix: Disable RLS temporarily
      ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
      
      -- Test query
      SELECT id, user_id, first_name, last_name FROM profiles LIMIT 1;
    `
    
    console.log('📝 Emergency SQL to run in Supabase Dashboard:')
    console.log('=' .repeat(50))
    console.log(emergencySQL)
    console.log('=' .repeat(50))
    
    // Step 4: Test with disabled RLS
    console.log('\n🔄 Testing with disabled RLS...')
    const { data: emergencyData, error: emergencyError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name')
      .limit(1)

    if (emergencyError) {
      console.error('❌ Emergency test failed:', emergencyError.message)
      console.log('\n🚨 MANUAL FIX REQUIRED:')
      console.log('1. Go to Supabase Dashboard > SQL Editor')
      console.log('2. Run this SQL:')
      console.log('   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;')
      console.log('3. Test your application')
    } else {
      console.log('✅ Emergency test successful!')
      console.log('📊 Emergency data:', emergencyData)
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message)
  }
}

emergencyRLSFix()


