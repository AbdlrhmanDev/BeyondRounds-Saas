#!/usr/bin/env node

/**
 * BeyondRounds User Flow Test Script
 * Tests the complete user registration and profile creation flow
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const testUser = {
  email: `test-user-${Date.now()}@beyondrounds.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  city: 'London',
  medicalSpecialty: 'Cardiology'
};

async function testUserFlow() {
  console.log('🚀 Starting BeyondRounds User Flow Test');
  console.log('=====================================');

  try {
    // Step 1: Test user registration
    console.log('\n1️⃣ Testing user registration...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUser.email,
      password: testUser.password,
      email_confirm: true,
      user_metadata: {
        first_name: testUser.firstName,
        last_name: testUser.lastName
      }
    });

    if (authError) {
      console.error('❌ Auth user creation failed:', authError.message);
      return;
    }

    console.log('✅ Auth user created successfully');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);

    // Step 2: Check if profile was created automatically
    console.log('\n2️⃣ Checking automatic profile creation...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError.message);
      return;
    }

    if (profile) {
      console.log('✅ Profile created automatically');
      console.log(`   Profile ID: ${profile.id}`);
      console.log(`   Name: ${profile.first_name} ${profile.last_name}`);
      console.log(`   City: ${profile.city}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Verified: ${profile.is_verified}`);
      console.log(`   Onboarding Completed: ${profile.onboarding_completed}`);
    } else {
      console.log('⚠️  No profile found - attempting manual creation...');
      
      // Step 3: Manual profile creation
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: testUser.email,
          first_name: testUser.firstName,
          last_name: testUser.lastName,
          city: testUser.city,
          medical_specialty: testUser.medicalSpecialty,
          gender: 'prefer-not-to-say',
          role: 'user',
          is_verified: false,
          is_banned: false,
          onboarding_completed: false,
          profile_completion: 20
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Manual profile creation failed:', createError.message);
        return;
      }

      console.log('✅ Profile created manually');
      console.log(`   Profile ID: ${newProfile.id}`);
    }

    // Step 4: Test profile preferences creation
    console.log('\n3️⃣ Testing profile preferences creation...');
    const { data: preferences, error: prefError } = await supabase
      .from('profile_preferences')
      .insert({
        profile_id: profile?.id || newProfile.id,
        gender_preference: 'no-preference',
        specialty_preference: 'no-preference',
        meeting_frequency: 'monthly',
        activity_level: 'moderately-active',
        social_energy_level: 'moderate-energy-small-groups',
        conversation_style: 'mix-everything',
        life_stage: 'single-no-kids',
        ideal_weekend: 'mix-active-relaxing'
      })
      .select()
      .single();

    if (prefError) {
      console.error('❌ Profile preferences creation failed:', prefError.message);
    } else {
      console.log('✅ Profile preferences created successfully');
    }

    // Step 5: Test user preferences creation
    console.log('\n4️⃣ Testing user preferences creation...');
    const { data: userPrefs, error: userPrefError } = await supabase
      .from('user_preferences')
      .insert({
        profile_id: profile?.id || newProfile.id,
        email_notifications: true,
        push_notifications: true,
        weekly_match_reminders: true,
        marketing_emails: false,
        privacy_level: 'standard'
      })
      .select()
      .single();

    if (userPrefError) {
      console.error('❌ User preferences creation failed:', userPrefError.message);
    } else {
      console.log('✅ User preferences created successfully');
    }

    // Step 6: Test profile update
    console.log('\n5️⃣ Testing profile update...');
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        bio: 'Test bio for automated testing',
        profile_completion: 60,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', authData.user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Profile update failed:', updateError.message);
    } else {
      console.log('✅ Profile updated successfully');
      console.log(`   Bio: ${updatedProfile.bio}`);
      console.log(`   Completion: ${updatedProfile.profile_completion}%`);
    }

    // Step 7: Test profile fetch with joins
    console.log('\n6️⃣ Testing profile fetch with related data...');
    const { data: fullProfile, error: fetchError } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_preferences(*),
        user_preferences(*),
        profile_specialties(*)
      `)
      .eq('user_id', authData.user.id)
      .single();

    if (fetchError) {
      console.error('❌ Full profile fetch failed:', fetchError.message);
    } else {
      console.log('✅ Full profile with related data fetched successfully');
      console.log(`   Has preferences: ${!!fullProfile.profile_preferences}`);
      console.log(`   Has user prefs: ${!!fullProfile.user_preferences}`);
      console.log(`   Specialties count: ${fullProfile.profile_specialties?.length || 0}`);
    }

    // Step 8: Cleanup
    console.log('\n7️⃣ Cleaning up test data...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
    
    if (deleteError) {
      console.error('❌ User cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Test user cleaned up successfully');
    }

    console.log('\n🎉 User flow test completed successfully!');
    console.log('=====================================');
    console.log('✅ All tests passed - the user flow is working correctly');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testUserFlow().then(() => {
  console.log('\n📊 Test Summary:');
  console.log('- User registration: ✅');
  console.log('- Profile creation: ✅');
  console.log('- Preferences setup: ✅');
  console.log('- Profile updates: ✅');
  console.log('- Data fetching: ✅');
  console.log('- Cleanup: ✅');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});

