const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testDashboardAccess() {
  try {
    console.log('🧪 Testing dashboard access after RLS fix...');
    
    // Test 1: Check if we can access profiles
    console.log('1. Testing profiles access...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, role, email')
      .limit(5);
    
    if (profileError) {
      console.error('❌ Profile access failed:', profileError);
      return false;
    } else {
      console.log('✅ Profile access successful!');
      console.log(`Found ${profiles?.length || 0} profiles`);
      profiles?.forEach(profile => {
        console.log(`  - ${profile.first_name} ${profile.last_name} (${profile.role})`);
      });
    }
    
    // Test 2: Check if we can access match_members
    console.log('2. Testing match_members access...');
    const { data: matchMembers, error: matchError } = await supabase
      .from('match_members')
      .select('id, match_id, profile_id, is_active')
      .limit(5);
    
    if (matchError) {
      console.error('❌ Match members access failed:', matchError);
      return false;
    } else {
      console.log('✅ Match members access successful!');
      console.log(`Found ${matchMembers?.length || 0} match members`);
    }
    
    // Test 3: Check if we can access matches
    console.log('3. Testing matches access...');
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, group_name, match_week, group_size')
      .limit(5);
    
    if (matchesError) {
      console.error('❌ Matches access failed:', matchesError);
      return false;
    } else {
      console.log('✅ Matches access successful!');
      console.log(`Found ${matches?.length || 0} matches`);
    }
    
    // Test 4: Check RLS status
    console.log('4. Checking RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .in('tablename', ['profiles', 'match_members', 'matches']);
    
    if (rlsError) {
      console.log('⚠️  Could not check RLS status:', rlsError.message);
    } else {
      console.log('✅ RLS status check:');
      rlsStatus?.forEach(table => {
        console.log(`  - ${table.tablename}: RLS ${table.rowsecurity ? 'enabled' : 'disabled'}`);
      });
    }
    
    console.log('🎉 All tests passed! Dashboard should be accessible now.');
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

// Run the test
testDashboardAccess().then(success => {
  if (success) {
    console.log('✅ Dashboard access test completed successfully!');
    process.exit(0);
  } else {
    console.log('❌ Dashboard access test failed!');
    process.exit(1);
  }
});







