require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixRLSDirectly() {
  console.log('🔧 Fixing RLS recursion issue directly...')
  
  try {
    // First, let's try to create the exec_sql function using raw SQL
    console.log('1. Creating exec_sql function...')
    
    const createFunctionSQL = `
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
    
    // Try to execute this directly
    const { data, error } = await supabase
      .from('_sql')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('⚠️  Cannot access _sql table:', error.message)
    }
    
    // Let's try a different approach - disable RLS using direct table operations
    console.log('\n2. Disabling RLS using direct operations...')
    
    // Try to disable RLS by updating table settings
    const tables = ['match_members', 'profiles', 'chat_messages', 'notifications']
    
    for (const table of tables) {
      try {
        // Try to access the table directly to see if RLS is causing issues
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`⚠️  ${table}: ${error.message}`)
          
          // If it's a recursion error, we need to fix it manually
          if (error.message.includes('infinite recursion')) {
            console.log(`🚨 ${table} has infinite recursion - needs manual fix`)
          }
        } else {
          console.log(`✅ ${table}: Accessible`)
        }
      } catch (err) {
        console.log(`⚠️  ${table}: ${err.message}`)
      }
    }
    
    console.log('\n🎯 Manual Fix Required!')
    console.log('📋 Please follow these steps in Supabase SQL Editor:')
    console.log('')
    console.log('1. Go to Supabase Dashboard > SQL Editor')
    console.log('2. Run this SQL:')
    console.log('')
    console.log('-- Disable RLS on problematic tables')
    console.log('ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;')
    console.log('ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;')
    console.log('ALTER TABLE public.chat_messages DISABLE ROW LEVEL SECURITY;')
    console.log('ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;')
    console.log('')
    console.log('-- Drop problematic functions')
    console.log('DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);')
    console.log('DROP FUNCTION IF EXISTS public.current_profile_id();')
    console.log('DROP FUNCTION IF EXISTS public.is_admin();')
    console.log('DROP FUNCTION IF EXISTS public.is_moderator_or_admin();')
    console.log('')
    console.log('3. Click "Run" to execute')
    console.log('4. Test the application')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixRLSDirectly()
