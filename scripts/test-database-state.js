const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCurrentState() {
  try {
    console.log('🔍 Testing current database state...');
    
    // Test 1: Check if we can access profiles
    console.log('1. Testing profiles access...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Profile access failed:', profileError);
    } else {
      console.log('✅ Profile access successful:', profiles?.[0]);
    }
    
    // Test 2: Check RLS policies
    console.log('2. Checking RLS policies...');
    const { data: policies, error: policyError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname, cmd, qual')
      .eq('schemaname', 'public')
      .in('tablename', ['profiles', 'match_members']);
    
    if (policyError) {
      console.error('❌ Policy check failed:', policyError);
    } else {
      console.log('✅ Found policies:', policies?.length || 0);
      policies?.forEach(policy => {
        console.log(`  - ${policy.tablename}.${policy.policyname} (${policy.cmd})`);
      });
    }
    
    // Test 3: Check functions
    console.log('3. Checking functions...');
    const { data: functions, error: functionError } = await supabase
      .from('pg_proc')
      .select('proname, prosrc')
      .eq('pronamespace', (await supabase.from('pg_namespace').select('oid').eq('nspname', 'public')).data?.[0]?.oid)
      .in('proname', ['current_profile_id', 'is_admin', 'is_member_of_match']);
    
    if (functionError) {
      console.error('❌ Function check failed:', functionError);
    } else {
      console.log('✅ Found functions:', functions?.length || 0);
      functions?.forEach(func => {
        console.log(`  - ${func.proname}`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Run the test
testCurrentState().then(success => {
  if (success) {
    console.log('🎉 Database state test completed!');
    process.exit(0);
  } else {
    console.log('💥 Database state test failed!');
    process.exit(1);
  }
});







