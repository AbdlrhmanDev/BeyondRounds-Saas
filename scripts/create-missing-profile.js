const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createMissingProfile() {
  console.log('🔧 Creating missing profile...\n');

  const userId = 'eafceba3-e4f2-4899-8bfa-2da27423296d';
  
  try {
    // Check if profile already exists
    console.log(`1. Checking if profile exists for user: ${userId}`);
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('   No profile found, creating new one...');
      
      // Create the profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: 'user@example.com', // This will be updated during onboarding
          first_name: '',
          last_name: '',
          city: 'Not specified',
          gender: 'prefer-not-to-say',
          role: 'user',
          is_verified: false,
          is_banned: false,
          onboarding_completed: false,
          profile_completion_percentage: 0
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Failed to create profile:', createError.message);
        console.error('   Code:', createError.code);
        console.error('   Details:', createError.details);
      } else {
        console.log('✅ Profile created successfully!');
        console.log('   Profile ID:', newProfile.id);
        console.log('   User ID:', newProfile.user_id);
      }
    } else if (checkError) {
      console.error('❌ Error checking profile:', checkError.message);
    } else {
      console.log('✅ Profile already exists!');
      console.log('   Profile ID:', existingProfile.id);
      console.log('   Onboarding completed:', existingProfile.onboarding_completed);
    }

  } catch (error) {
    console.error('💥 Exception:', error.message);
  }
}

createMissingProfile();
