require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRLSStatus() {
  console.log('🔐 TESTING RLS STATUS')
  console.log('=' .repeat(50))

  try {
    // Test helper functions
    console.log('\n📋 Testing helper functions...')
    
    const { data: profileId, error: profileError } = await supabase.rpc('current_profile_id')
    if (profileError) {
      console.log(`⚠️  current_profile_id: ${profileError.message}`)
    } else {
      console.log(`✅ current_profile_id: Working (${profileId || 'null'})`)
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin')
    if (adminError) {
      console.log(`⚠️  is_admin: ${adminError.message}`)
    } else {
      console.log(`✅ is_admin: Working (${isAdmin})`)
    }

    const { data: isModerator, error: moderatorError } = await supabase.rpc('is_moderator_or_admin')
    if (moderatorError) {
      console.log(`⚠️  is_moderator_or_admin: ${moderatorError.message}`)
    } else {
      console.log(`✅ is_moderator_or_admin: Working (${isModerator})`)
    }

    // Test table access
    console.log('\n📋 Testing table access...')
    
    const tables = [
      'profiles', 'matches', 'match_members', 'chat_rooms', 
      'chat_messages', 'notifications', 'verification_documents', 
      'user_preferences'
    ]

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)
        
        if (error) {
          console.log(`⚠️  ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: Access working`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }

    // Test RLS status
    console.log('\n📋 Testing RLS status...')
    
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .in('tablename', tables)

    if (rlsError) {
      console.log(`⚠️  RLS status check: ${rlsError.message}`)
    } else {
      console.log('📊 RLS Status:')
      rlsStatus?.forEach(table => {
        const status = table.rowsecurity ? '🔒 Enabled' : '⚠️  Disabled'
        console.log(`   ${table.tablename}: ${status}`)
      })
    }

    console.log('\n🎯 RLS Test Complete!')
    console.log('📖 Follow RLS_MANUAL_FIX.md for manual deployment')

  } catch (error) {
    console.error('❌ RLS testing failed:', error)
  }
}

// Run the test
testRLSStatus().catch(console.error)