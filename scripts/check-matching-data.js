#!/usr/bin/env node

/**
 * Check Matching Data Script
 * 
 * This script checks the database to see what profiles are available for matching
 * and why the matching algorithm might not be finding groups.
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

async function checkMatchingData() {
  try {
    console.log('🔍 Checking matching data...\n');
    
    // Check total profiles
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, medical_specialty, city, age, is_verified, is_banned, onboarding_completed')
      .limit(100);
    
    if (allError) {
      console.error('❌ Error fetching all profiles:', allError);
      return;
    }
    
    console.log(`📊 Total profiles in database: ${allProfiles?.length || 0}`);
    
    // Check verified profiles
    const verifiedProfiles = allProfiles?.filter(p => p.is_verified) || [];
    console.log(`✅ Verified profiles: ${verifiedProfiles.length}`);
    
    // Check completed onboarding
    const completedProfiles = allProfiles?.filter(p => p.onboarding_completed) || [];
    console.log(`🎯 Completed onboarding: ${completedProfiles.length}`);
    
    // Check not banned
    const notBannedProfiles = allProfiles?.filter(p => !p.is_banned) || [];
    console.log(`🚫 Not banned: ${notBannedProfiles.length}`);
    
    // Check profiles that meet matching criteria
    const matchingProfiles = allProfiles?.filter(p => 
      p.is_verified && 
      !p.is_banned && 
      p.onboarding_completed
    ) || [];
    
    console.log(`🎯 Profiles meeting matching criteria: ${matchingProfiles.length}\n`);
    
    if (matchingProfiles.length > 0) {
      console.log('👥 Available profiles for matching:');
      matchingProfiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.first_name} ${profile.last_name} - ${profile.medical_specialty} (${profile.city}, Age: ${profile.age})`);
      });
    }
    
    // Check interests data
    console.log('\n🎯 Checking interests data...');
    const { data: interests, error: interestsError } = await supabase
      .from('profile_interests')
      .select('profile_id, kind, value')
      .limit(50);
    
    if (interestsError) {
      console.error('❌ Error fetching interests:', interestsError);
    } else {
      console.log(`📊 Total interests entries: ${interests?.length || 0}`);
      
      if (interests && interests.length > 0) {
        const interestsByProfile = interests.reduce((acc, interest) => {
          if (!acc[interest.profile_id]) acc[interest.profile_id] = [];
          acc[interest.profile_id].push(`${interest.kind}:${interest.value}`);
          return acc;
        }, {});
        
        console.log(`👥 Profiles with interests: ${Object.keys(interestsByProfile).length}`);
        
        // Show sample interests
        const sampleProfiles = Object.keys(interestsByProfile).slice(0, 3);
        sampleProfiles.forEach(profileId => {
          const profile = matchingProfiles.find(p => p.id === profileId);
          if (profile) {
            console.log(`   ${profile.first_name} ${profile.last_name}: ${interestsByProfile[profileId].join(', ')}`);
          }
        });
      }
    }
    
    // Check user preferences
    console.log('\n⚙️ Checking user preferences...');
    const { data: preferences, error: prefsError } = await supabase
      .from('user_preferences')
      .select('profile_id, group_size, min_compatibility')
      .limit(20);
    
    if (prefsError) {
      console.error('❌ Error fetching preferences:', prefsError);
    } else {
      console.log(`📊 Total preferences entries: ${preferences?.length || 0}`);
    }
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    
    if (matchingProfiles.length < 3) {
      console.log('   ⚠️  Not enough profiles for group matching (need at least 3)');
      console.log('   📝 Consider adding more test profiles or lowering matching criteria');
    }
    
    if (verifiedProfiles.length < matchingProfiles.length) {
      console.log('   ⚠️  Some profiles are not verified');
      console.log('   📝 Consider verifying more profiles for better matching');
    }
    
    if (completedProfiles.length < matchingProfiles.length) {
      console.log('   ⚠️  Some profiles have not completed onboarding');
      console.log('   📝 Consider completing onboarding for more profiles');
    }
    
    if ((interests?.length || 0) === 0) {
      console.log('   ⚠️  No interests data found');
      console.log('   📝 Add interests to profiles for better compatibility matching');
    }
    
    console.log('\n✅ Data check completed!');
    
  } catch (error) {
    console.error('❌ Error checking matching data:', error);
  }
}

// Run the script
checkMatchingData().catch(console.error);




