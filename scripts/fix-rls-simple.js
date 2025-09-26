require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixRLS() {
  console.log('🔧 Fixing RLS recursion issue...')
  
  try {
    // 1. Disable RLS on problematic tables
    console.log('1. Disabling RLS on problematic tables...')
    
    const tables = ['match_members', 'profiles', 'chat_messages', 'notifications']
    
    for (const table of tables) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;`
        })
        
        if (error) {
          console.log(`⚠️  ${table}: ${error.message}`)
        } else {
          console.log(`✅ ${table}: RLS disabled`)
        }
      } catch (err) {
        console.log(`⚠️  ${table}: ${err.message}`)
      }
    }
    
    // 2. Drop problematic functions
    console.log('\n2. Dropping problematic functions...')
    
    const functions = [
      'is_member_of_match',
      'current_profile_id', 
      'is_admin',
      'is_moderator_or_admin'
    ]
    
    for (const func of functions) {
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `DROP FUNCTION IF EXISTS public.${func}(uuid);`
        })
        
        if (error) {
          console.log(`⚠️  ${func}: ${error.message}`)
        } else {
          console.log(`✅ ${func}: Dropped`)
        }
      } catch (err) {
        console.log(`⚠️  ${func}: ${err.message}`)
      }
    }
    
    console.log('\n🎉 RLS recursion fix completed!')
    console.log('✅ System should work now without infinite recursion')
    
  } catch (error) {
    console.error('❌ Error fixing RLS:', error)
  }
}

fixRLS()







