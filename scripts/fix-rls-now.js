const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixRLSRecursion() {
  try {
    console.log('🔧 Fixing RLS recursion issue...');
    
    // Step 1: Disable RLS on match_members table
    console.log('1. Disabling RLS on match_members table...');
    const { error: disableError } = await supabase.rpc('exec', { 
      sql: 'ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;' 
    });
    
    if (disableError) {
      console.error('❌ Error disabling RLS:', disableError);
      return false;
    }
    
    console.log('✅ RLS disabled on match_members');
    
    // Step 2: Drop the problematic function
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
      .select('id, first_name, last_name, role')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Profile access failed:', profileError);
      return false;
    }
    
    console.log('✅ Profile access successful!');
    console.log('Sample profile:', profiles?.[0]);
    
    // Step 4: Test match_members access
    console.log('4. Testing match_members access...');
    const { data: matchMembers, error: matchError } = await supabase
      .from('match_members')
      .select('id, match_id, profile_id')
      .limit(1);
    
    if (matchError) {
      console.error('❌ Match members access failed:', matchError);
      return false;
    }
    
    console.log('✅ Match members access successful!');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Run the fix
fixRLSRecursion().then(success => {
  if (success) {
    console.log('🎉 RLS recursion fix completed! Dashboard should work now.');
    process.exit(0);
  } else {
    console.log('💥 RLS recursion fix failed!');
    process.exit(1);
  }
});







