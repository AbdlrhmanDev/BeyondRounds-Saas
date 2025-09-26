#!/usr/bin/env node

/**
 * Create Test Profiles Script
 * 
 * This script creates additional test profiles with completed onboarding
 * to enable group matching functionality.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test profiles data
const testProfiles = [
  {
    first_name: 'Sarah',
    last_name: 'Chen',
    email: 'sarah.chen@test.com',
    medical_specialty: 'Emergency Medicine',
    city: 'Los Angeles',
    nationality: 'United States',
    age: 28,
    gender: 'female',
    bio: 'Passionate emergency medicine physician who loves hiking and photography.',
    is_verified: true,
    onboarding_completed: true,
    profile_completion_percentage: 95,
    interests: [
      { kind: 'hobby', value: 'Hiking' },
      { kind: 'hobby', value: 'Photography' },
      { kind: 'hobby', value: 'Coffee' },
      { kind: 'sport', value: 'Running' }
    ]
  },
  {
    first_name: 'Michael',
    last_name: 'Rodriguez',
    email: 'michael.rodriguez@test.com',
    medical_specialty: 'Internal Medicine',
    city: 'New York',
    nationality: 'United States',
    age: 32,
    gender: 'male',
    bio: 'Internal medicine specialist with a passion for teaching and research.',
    is_verified: true,
    onboarding_completed: true,
    profile_completion_percentage: 90,
    interests: [
      { kind: 'hobby', value: 'Reading' },
      { kind: 'hobby', value: 'Cooking' },
      { kind: 'sport', value: 'Tennis' },
      { kind: 'hobby', value: 'Wine' }
    ]
  },
  {
    first_name: 'Emily',
    last_name: 'Johnson',
    email: 'emily.johnson@test.com',
    medical_specialty: 'Pediatrics',
    city: 'Chicago',
    nationality: 'United States',
    age: 26,
    gender: 'female',
    bio: 'Pediatrician who loves working with children and enjoys outdoor activities.',
    is_verified: true,
    onboarding_completed: true,
    profile_completion_percentage: 88,
    interests: [
      { kind: 'hobby', value: 'Hiking' },
      { kind: 'hobby', value: 'Photography' },
      { kind: 'sport', value: 'Swimming' },
      { kind: 'hobby', value: 'Art' }
    ]
  },
  {
    first_name: 'David',
    last_name: 'Kim',
    email: 'david.kim@test.com',
    medical_specialty: 'Cardiology',
    city: 'San Francisco',
    nationality: 'United States',
    age: 35,
    gender: 'male',
    bio: 'Cardiologist with expertise in interventional procedures and patient care.',
    is_verified: true,
    onboarding_completed: true,
    profile_completion_percentage: 92,
    interests: [
      { kind: 'hobby', value: 'Coffee' },
      { kind: 'hobby', value: 'Reading' },
      { kind: 'sport', value: 'Cycling' },
      { kind: 'hobby', value: 'Music' }
    ]
  },
  {
    first_name: 'Lisa',
    last_name: 'Wang',
    email: 'lisa.wang@test.com',
    medical_specialty: 'Surgery',
    city: 'Boston',
    nationality: 'United States',
    age: 30,
    gender: 'female',
    bio: 'General surgeon with a focus on minimally invasive procedures.',
    is_verified: true,
    onboarding_completed: true,
    profile_completion_percentage: 87,
    interests: [
      { kind: 'hobby', value: 'Cooking' },
      { kind: 'hobby', value: 'Travel' },
      { kind: 'sport', value: 'Yoga' },
      { kind: 'hobby', value: 'Movies' }
    ]
  },
  {
    first_name: 'James',
    last_name: 'Thompson',
    email: 'james.thompson@test.com',
    medical_specialty: 'Psychiatry',
    city: 'Seattle',
    nationality: 'United States',
    age: 33,
    gender: 'male',
    bio: 'Psychiatrist specializing in cognitive behavioral therapy and mental health advocacy.',
    is_verified: true,
    onboarding_completed: true,
    profile_completion_percentage: 91,
    interests: [
      { kind: 'hobby', value: 'Reading' },
      { kind: 'hobby', value: 'Music' },
      { kind: 'sport', value: 'Hiking' },
      { kind: 'hobby', value: 'Meditation' }
    ]
  }
];

async function createTestProfiles() {
  try {
    console.log('🚀 Creating test profiles for matching...\n');
    
    for (let i = 0; i < testProfiles.length; i++) {
      const profileData = testProfiles[i];
      console.log(`👤 Creating profile ${i + 1}/${testProfiles.length}: ${profileData.first_name} ${profileData.last_name}`);
      
      // Create a test user first
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: profileData.email,
        password: 'testpassword123',
        email_confirm: true
      });
      
      if (authError) {
        console.error(`   ❌ Error creating auth user: ${authError.message}`);
        continue;
      }
      
      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          email: profileData.email,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          medical_specialty: profileData.medical_specialty,
          city: profileData.city,
          nationality: profileData.nationality,
          age: profileData.age,
          gender: profileData.gender,
          is_verified: profileData.is_verified,
          onboarding_completed: profileData.onboarding_completed,
          profile_completion_percentage: profileData.profile_completion_percentage,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (profileError) {
        console.error(`   ❌ Error creating profile: ${profileError.message}`);
        continue;
      }
      
      // Add interests
      if (profileData.interests && profileData.interests.length > 0) {
        const interestsData = profileData.interests.map(interest => ({
          profile_id: profile.id,
          kind: interest.kind,
          value: interest.value,
          created_at: new Date().toISOString()
        }));
        
        const { error: interestsError } = await supabase
          .from('profile_interests')
          .insert(interestsData);
        
        if (interestsError) {
          console.error(`   ⚠️  Error adding interests: ${interestsError.message}`);
        } else {
          console.log(`   ✅ Added ${interestsData.length} interests`);
        }
      }
      
      console.log(`   ✅ Profile created successfully\n`);
    }
    
    console.log('🎉 Test profiles creation completed!');
    console.log('\n📊 Summary:');
    console.log(`   • Created ${testProfiles.length} new profiles`);
    console.log('   • All profiles are verified and have completed onboarding');
    console.log('   • Each profile has 4 interests for better matching');
    console.log('\n🔄 You can now test the matching functionality!');
    
  } catch (error) {
    console.error('❌ Error creating test profiles:', error);
  }
}

// Run the script
createTestProfiles().catch(console.error);
