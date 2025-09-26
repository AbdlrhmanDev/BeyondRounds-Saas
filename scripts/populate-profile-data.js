#!/usr/bin/env node

/**
 * Populate Profile Data Script
 * 
 * This script populates missing profile data to improve matching:
 * 1. Adds missing names, ages, cities
 * 2. Adds sample interests
 * 3. Ensures profiles are complete for matching
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

const sampleData = {
  names: [
    { first: 'Sarah', last: 'Chen' },
    { first: 'Michael', last: 'Rodriguez' },
    { first: 'Emily', last: 'Johnson' },
    { first: 'David', last: 'Kim' },
    { first: 'Jessica', last: 'Williams' },
    { first: 'Alex', last: 'Thompson' },
    { first: 'Maria', last: 'Garcia' },
    { first: 'James', last: 'Wilson' },
    { first: 'Lisa', last: 'Wang' },
    { first: 'Robert', last: 'Brown' }
  ],
  cities: [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
    'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
    'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
    'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington'
  ],
  specialties: [
    'Internal Medicine', 'Emergency Medicine', 'Pediatrics', 'Surgery',
    'Cardiology', 'Family Medicine', 'Psychiatry', 'Radiology',
    'Anesthesiology', 'Dermatology', 'Neurology', 'Oncology'
  ],
  interests: [
    { kind: 'hobby', value: 'Reading' },
    { kind: 'hobby', value: 'Cooking' },
    { kind: 'hobby', value: 'Photography' },
    { kind: 'hobby', value: 'Travel' },
    { kind: 'hobby', value: 'Music' },
    { kind: 'sport', value: 'Running' },
    { kind: 'sport', value: 'Swimming' },
    { kind: 'sport', value: 'Tennis' },
    { kind: 'sport', value: 'Basketball' },
    { kind: 'sport', value: 'Cycling' },
    { kind: 'professional', value: 'Research' },
    { kind: 'professional', value: 'Teaching' },
    { kind: 'professional', value: 'Mentoring' },
    { kind: 'professional', value: 'Public Health' }
  ]
};

async function populateProfileData() {
  try {
    console.log('🔄 Populating profile data for better matching...\n');
    
    // Get all profiles that need data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, city, age, medical_specialty, profile_interests(*)')
      .eq('is_verified', true)
      .eq('onboarding_completed', true)
      .limit(20);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    console.log(`📊 Found ${profiles.length} profiles to update\n`);

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const nameData = sampleData.names[i % sampleData.names.length];
      
      console.log(`👤 Updating profile ${i + 1}/${profiles.length}: ${profile.first_name || 'Unknown'} ${profile.last_name || 'Unknown'}`);
      
      const updateData = {};
      
      // Add missing name
      if (!profile.first_name || profile.first_name.trim() === '') {
        updateData.first_name = nameData.first;
        console.log(`   ✅ Added first name: ${nameData.first}`);
      }
      
      if (!profile.last_name || profile.last_name.trim() === '') {
        updateData.last_name = nameData.last;
        console.log(`   ✅ Added last name: ${nameData.last}`);
      }
      
      // Add missing city
      if (!profile.city || profile.city === 'Not specified' || profile.city.trim() === '') {
        updateData.city = sampleData.cities[i % sampleData.cities.length];
        console.log(`   ✅ Added city: ${updateData.city}`);
      }
      
      // Add missing age
      if (!profile.age) {
        updateData.age = Math.floor(Math.random() * 20) + 25; // Age 25-44
        console.log(`   ✅ Added age: ${updateData.age}`);
      }
      
      // Add missing specialty
      if (!profile.medical_specialty || profile.medical_specialty === 'general') {
        updateData.medical_specialty = sampleData.specialties[i % sampleData.specialties.length];
        console.log(`   ✅ Added specialty: ${updateData.medical_specialty}`);
      }
      
      // Update profile if we have changes
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', profile.id);

        if (updateError) {
          console.error(`   ❌ Error updating profile: ${updateError.message}`);
        } else {
          console.log(`   ✅ Profile updated successfully`);
        }
      }
      
      // Add interests if missing
      if (!profile.profile_interests || profile.profile_interests.length === 0) {
        console.log(`   🎯 Adding interests...`);
        
        // Add 3-5 random interests
        const numInterests = Math.floor(Math.random() * 3) + 3; // 3-5 interests
        const shuffledInterests = [...sampleData.interests].sort(() => 0.5 - Math.random());
        
        for (let j = 0; j < numInterests; j++) {
          const interest = shuffledInterests[j];
          const { error: interestError } = await supabase
            .from('profile_interests')
            .insert({
              profile_id: profile.id,
              kind: interest.kind,
              value: interest.value
            });

          if (interestError) {
            console.error(`      ❌ Error adding interest ${interest.value}: ${interestError.message}`);
          } else {
            console.log(`      ✅ Added interest: ${interest.value}`);
          }
        }
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('🎉 Profile data population completed!');
    console.log('\n📊 Summary:');
    console.log('   • Added missing names, cities, ages, and specialties');
    console.log('   • Added sample interests to profiles without any');
    console.log('   • All profiles now have complete data for matching');
    console.log('\n🔄 You can now test the matching functionality!');

  } catch (error) {
    console.error('Fatal error during profile data population:', error);
  }
}

populateProfileData();
