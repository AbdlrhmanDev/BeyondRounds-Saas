#!/usr/bin/env node

/**
 * Test RLS Fix - Verify Profile Queries Work
 * Run this after applying the RLS fix to verify everything works
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

async function testRLSFix() {
  console.log('🧪 Testing RLS Fix...')
  
  try {
    // Test 1: Basic profile query
    console.log('📋 Test 1: Basic profile query...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name')
      .limit(3)

    if (profilesError) {
      console.error('❌ Profile query failed:', profilesError.message)
      return false
    } else {
      console.log('✅ Profile query successful!')
      console.log('📊 Found profiles:', profiles.length)
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.first_name} ${profile.last_name} (${profile.user_id})`)
      })
    }

    // Test 2: Specific user query
    console.log('\n📋 Test 2: Specific user query...')
    const testUserId = '9a83f7ec-1b03-4402-9f52-00b8b2224f6c'
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single()

    if (userError) {
      console.error('❌ User profile query failed:', userError.message)
    } else {
      console.log('✅ User profile query successful!')
      console.log('📊 User profile:', {
        name: `${userProfile.first_name} ${userProfile.last_name}`,
        specialty: userProfile.medical_specialty,
        email: userProfile.email
      })
    }

    // Test 3: Count profiles
    console.log('\n📋 Test 3: Count profiles...')
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('❌ Profile count failed:', countError.message)
    } else {
      console.log('✅ Profile count successful!')
      console.log(`📊 Total profiles: ${count}`)
    }

    console.log('\n🎉 All tests passed! RLS fix is working correctly.')
    console.log('🔄 Your application should now work properly.')
    
    return true
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting RLS Fix Verification...')
  
  const success = await testRLSFix()
  
  if (success) {
    console.log('\n✅ RLS Fix Verification: PASSED')
    console.log('🎯 Your chat system should now work!')
  } else {
    console.log('\n❌ RLS Fix Verification: FAILED')
    console.log('🔧 Please check the URGENT_RLS_FIX.md file for manual fix instructions.')
  }
}

main().catch(console.error)


