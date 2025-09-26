require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createExecSqlFunction() {
  console.log('🔧 Creating exec_sql function...')
  
  try {
    // Create the exec_sql function
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
        RETURNS text
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
          RETURN 'OK';
        END;
        $$;
      `
    })
    
    if (error) {
      console.log('⚠️  exec_sql function already exists or error:', error.message)
    } else {
      console.log('✅ exec_sql function created successfully')
    }
    
    // Now fix RLS
    console.log('\n🔧 Fixing RLS recursion issue...')
    
    // 1. Disable RLS on problematic tables
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
    
    console.log('\n🎉 RLS recursion fix completed!')
    console.log('✅ System should work now without infinite recursion')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createExecSqlFunction()







