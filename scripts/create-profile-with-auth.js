const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createProfileWithAuth() {
  console.log('🔧 Creating profile with proper authentication...\n');

  const userId = 'eafceba3-e4f2-4899-8bfa-2da27423296d';
  
  try {
    // First, let's try to sign in as the user to get proper auth context
    console.log('1. Attempting to get user session...');
    
    // Since we can't sign in programmatically without credentials,
    // we'll create the profile using a different approach
    
    // Check if we can access the profiles table at all
    console.log('2. Testing basic table access...');
    const { data: allProfiles, error: listError } = await supabase
      .from('profiles')
      .select('id, user_id, email')
      .limit(5);
    
    if (listError) {
      console.error('❌ Cannot access profiles table:', listError.message);
      console.error('   Code:', listError.code);
      console.error('   Details:', listError.details);
      
      if (listError.code === '42501') {
        console.log('\n💡 Solution: RLS is blocking access. You need to:');
        console.log('   1. Run the SQL script in Supabase SQL Editor to create the profile');
        console.log('   2. Or temporarily disable RLS to create the profile');
        console.log('   3. Or sign in as the user in the browser to create the profile');
        
        console.log('\n📋 SQL to run in Supabase SQL Editor:');
        console.log(`
-- Create profile for user ${userId}
INSERT INTO public.profiles (
  user_id,
  email,
  first_name,
  last_name,
  city,
  gender,
  role,
  is_verified,
  is_banned,
  onboarding_completed,
  medical_specialty
)
VALUES (
  '${userId}',
  'user@example.com',
  '',
  '',
  'Not specified',
  'prefer-not-to-say',
  'user',
  false,
  false,
  false,
  'Not specified'
)
ON CONFLICT (user_id) DO NOTHING;

-- Verify the profile was created
SELECT id, user_id, email, onboarding_completed 
FROM public.profiles 
WHERE user_id = '${userId}';
        `);
      }
    } else {
      console.log('✅ Can access profiles table');
      console.log(`   Found ${allProfiles?.length || 0} profiles`);
      
      // Try to create the profile
      console.log('\n3. Attempting to create profile...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: 'user@example.com',
          first_name: '',
          last_name: '',
          city: 'Not specified',
          gender: 'prefer-not-to-say',
          role: 'user',
          is_verified: false,
          is_banned: false,
          onboarding_completed: false,
          medical_specialty: 'Not specified'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Profile creation failed:', createError.message);
        console.error('   Code:', createError.code);
      } else {
        console.log('✅ Profile created successfully!');
        console.log('   Profile ID:', newProfile.id);
      }
    }

  } catch (error) {
    console.error('💥 Exception:', error.message);
  }
}

createProfileWithAuth();
