const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRLSStatus() {
  console.log('🔍 Checking RLS status and profiles...\n');

  try {
    // Check if we can access profiles table
    console.log('1. Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Profiles access error:', profilesError.message);
      console.error('   Code:', profilesError.code);
      console.error('   Details:', profilesError.details);
    } else {
      console.log('✅ Profiles accessible');
      console.log(`   Found ${profiles?.length || 0} profiles`);
      if (profiles?.[0]) {
        console.log('   Sample profile:', {
          id: profiles[0].id,
          user_id: profiles[0].user_id,
          first_name: profiles[0].first_name,
          onboarding_completed: profiles[0].onboarding_completed
        });
      }
    }

    // Check RLS policies
    console.log('\n2. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'profiles' });
    
    if (policiesError) {
      console.log('⚠️  Could not fetch policies (function may not exist)');
    } else {
      console.log('✅ RLS policies found:', policies?.length || 0);
      policies?.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd}`);
      });
    }

    // Check if RLS is enabled
    console.log('\n3. Checking RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('tablename', 'profiles')
      .eq('schemaname', 'public');
    
    if (rlsError) {
      console.log('⚠️  Could not check RLS status');
    } else {
      console.log('✅ Table exists in public schema');
    }

    // Test with a specific user ID from the error
    const testUserId = 'eafceba3-e4f2-4899-8bfa-2da27423296d';
    console.log(`\n4. Testing access for user: ${testUserId}`);
    
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUserId)
      .single();
    
    if (userError) {
      console.error('❌ User profile access error:', userError.message);
      console.error('   Code:', userError.code);
    } else {
      console.log('✅ User profile accessible');
      console.log('   Profile:', {
        id: userProfile.id,
        first_name: userProfile.first_name,
        onboarding_completed: userProfile.onboarding_completed
      });
    }

  } catch (error) {
    console.error('💥 Exception:', error.message);
  }
}

checkRLSStatus();
