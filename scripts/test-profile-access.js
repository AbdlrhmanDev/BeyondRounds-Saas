const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testProfileAccess() {
  console.log('🔍 Testing profile access and permissions...\n');

  const userId = 'eafceba3-e4f2-4899-8bfa-2da27423296d';
  
  try {
    // Test 1: Check if we can read the profile
    console.log('1. Testing profile read access...');
    const { data: profile, error: readError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (readError) {
      console.error('❌ Read access failed:', readError.message);
      console.error('   Code:', readError.code);
      console.error('   Details:', readError.details);
    } else {
      console.log('✅ Read access successful');
      console.log('   Profile ID:', profile.id);
      console.log('   Onboarding completed:', profile.onboarding_completed);
    }

    // Test 2: Try to update the profile
    console.log('\n2. Testing profile update access...');
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Update access failed:', updateError.message);
      console.error('   Code:', updateError.code);
      console.error('   Details:', updateError.details);
      console.error('   Hint:', updateError.hint);
    } else {
      console.log('✅ Update access successful');
      console.log('   Updated profile:', {
        id: updatedProfile.id,
        onboarding_completed: updatedProfile.onboarding_completed
      });
    }

    // Test 3: Check RLS status
    console.log('\n3. Checking RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('get_table_rls_status', { table_name: 'profiles' });
    
    if (rlsError) {
      console.log('⚠️  Could not check RLS status (function may not exist)');
    } else {
      console.log('✅ RLS status:', rlsStatus);
    }

    // Test 4: Try to create a new profile (should fail if one exists)
    console.log('\n4. Testing profile creation (should fail if profile exists)...');
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        city: 'Test City',
        medical_specialty: 'Test Specialty'
      })
      .select()
      .single();
    
    if (createError) {
      if (createError.code === '23505') {
        console.log('✅ Profile creation correctly failed (duplicate key)');
      } else {
        console.error('❌ Profile creation failed:', createError.message);
        console.error('   Code:', createError.code);
      }
    } else {
      console.log('⚠️  Profile creation succeeded (unexpected)');
    }

  } catch (error) {
    console.error('💥 Exception:', error.message);
  }
}

testProfileAccess();
