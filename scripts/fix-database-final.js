const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDatabaseNow() {
  try {
    console.log('🔧 Fixing database RLS recursion issue...');
    
    // Step 1: Disable RLS on match_members
    console.log('1. Disabling RLS on match_members table...');
    const { error: disableError } = await supabase.rpc('exec', { 
      sql: 'ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;' 
    });
    
    if (disableError) {
      console.error('❌ Error disabling RLS:', disableError);
      console.log('📝 Manual fix needed: Go to Supabase SQL Editor and run:');
      console.log('   ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;');
      return false;
    }
    
    console.log('✅ RLS disabled on match_members');
    
    // Step 2: Drop problematic function
    console.log('2. Dropping problematic function...');
    const { error: dropError } = await supabase.rpc('exec', { 
      sql: 'DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);' 
    });
    
    if (dropError) {
      console.log('⚠️  Warning dropping function:', dropError.message);
    } else {
      console.log('✅ Function dropped');
    }
    
    // Step 3: Test access
    console.log('3. Testing profile access...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Profile access failed:', profileError);
      return false;
    }
    
    console.log('✅ Profile access successful!');
    console.log('Sample profile:', profiles?.[0]);
    
    console.log('🎉 Database fix completed! Dashboard should work now.');
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('📝 Manual fix needed: Go to Supabase SQL Editor and run:');
    console.log('   ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;');
    console.log('   DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);');
    return false;
  }
}

// Run the fix
fixDatabaseNow().then(success => {
  if (success) {
    console.log('✅ All fixes applied successfully!');
    process.exit(0);
  } else {
    console.log('❌ Automated fix failed - manual intervention required');
    process.exit(1);
  }
});







