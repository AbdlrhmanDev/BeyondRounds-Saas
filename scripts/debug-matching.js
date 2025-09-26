#!/usr/bin/env node

/**
 * Debug Matching Algorithm Script
 * 
 * This script helps debug why matching is not working by:
 * 1. Checking user profile data
 * 2. Testing compatibility calculations
 * 3. Showing what's preventing matches
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

// Copy the compatibility calculation from the API
function calculateCompatibility(profile1, profile2) {
  let score = 0
  let factors = 0

  // Specialty compatibility (25 points)
  if (profile1.medical_specialty && profile2.medical_specialty) {
    if (profile1.medical_specialty === profile2.medical_specialty) {
      score += 25
    } else {
      // Check for related specialties
      const relatedSpecialties = getRelatedSpecialties(profile1.medical_specialty)
      if (relatedSpecialties.includes(profile2.medical_specialty)) {
        score += 18
      } else {
        score += 8
      }
    }
    factors += 25
  }

  // Location compatibility (20 points)
  if (profile1.city && profile2.city) {
    if (profile1.city === profile2.city) {
      score += 20
    } else if (profile1.state === profile2.state) {
      score += 15
    } else if (profile1.nationality === profile2.nationality) {
      score += 10
    } else {
      score += 5
    }
    factors += 20
  }

  // Age compatibility (15 points)
  if (profile1.age && profile2.age) {
    const ageDiff = Math.abs(profile1.age - profile2.age)
    if (ageDiff <= 3) {
      score += 15
    } else if (ageDiff <= 7) {
      score += 12
    } else if (ageDiff <= 12) {
      score += 8
    } else if (ageDiff <= 18) {
      score += 5
    } else {
      score += 2
    }
    factors += 15
  }

  // Interests compatibility (25 points)
  const interestsScore = calculateInterestsCompatibility(profile1.profile_interests, profile2.profile_interests)
  score += interestsScore
  factors += 25

  // Career stage compatibility (15 points)
  const careerScore = calculateCareerStageCompatibility(profile1, profile2)
  score += careerScore
  factors += 15

  return factors > 0 ? Math.round((score / factors) * 100) : 0
}

function getRelatedSpecialties(specialty) {
  const relatedMap = {
    'Internal Medicine': ['Family Medicine', 'Emergency Medicine', 'Cardiology'],
    'Surgery': ['Orthopedic Surgery', 'General Surgery', 'Plastic Surgery'],
    'Pediatrics': ['Family Medicine', 'Emergency Medicine'],
    'Emergency Medicine': ['Internal Medicine', 'Family Medicine', 'Surgery'],
    'Cardiology': ['Internal Medicine', 'Emergency Medicine'],
    'Family Medicine': ['Internal Medicine', 'Pediatrics', 'Emergency Medicine']
  }
  return relatedMap[specialty] || []
}

function calculateCareerStageCompatibility(profile1, profile2) {
  const getCareerStage = (profile) => {
    const age = profile.age || 30
    const yearsExperience = profile.years_of_experience || 0
    
    if (age <= 30 || yearsExperience <= 3) return 'early'
    if (age <= 40 || yearsExperience <= 10) return 'mid'
    if (age <= 55 || yearsExperience <= 20) return 'senior'
    return 'expert'
  }
  
  const stage1 = getCareerStage(profile1)
  const stage2 = getCareerStage(profile2)
  
  if (stage1 === stage2) return 15
  if (Math.abs(['early', 'mid', 'senior', 'expert'].indexOf(stage1) - 
               ['early', 'mid', 'senior', 'expert'].indexOf(stage2)) === 1) {
    return 10
  }
  return 5
}

function calculateInterestsCompatibility(interests1, interests2) {
  if (!interests1?.length || !interests2?.length) return 0

  let score = 0
  let matches = 0

  // Create maps of interests by kind for easier comparison
  const interests1Map = {}
  const interests2Map = {}

  interests1.forEach(interest => {
    if (!interests1Map[interest.kind]) interests1Map[interest.kind] = []
    interests1Map[interest.kind].push(interest.value.toLowerCase())
  })

  interests2.forEach(interest => {
    if (!interests2Map[interest.kind]) interests2Map[interest.kind] = []
    interests2Map[interest.kind].push(interest.value.toLowerCase())
  })

  // Calculate matches for each interest kind
  Object.keys(interests1Map).forEach(kind => {
    if (interests2Map[kind]) {
      const commonInterests = interests1Map[kind].filter(interest => 
        interests2Map[kind].includes(interest)
      )
      matches += commonInterests.length
    }
  })

  // Score based on number of matches
  if (matches >= 5) score = 25
  else if (matches >= 3) score = 20
  else if (matches >= 2) score = 15
  else if (matches >= 1) score = 10
  else score = 0

  return score
}

async function debugMatching() {
  try {
    console.log('🔍 Debugging Matching Algorithm...\n');
    
    // Get the current user (Lisa Wang)
    const { data: currentUser, error: userError } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_interests (*)
      `)
      .eq('email', 'lisa.wang@test.com')
      .single();

    if (userError) {
      console.error('❌ Error fetching current user:', userError.message);
      return;
    }

    console.log('👤 Current User Profile:');
    console.log(`   Name: ${currentUser.first_name} ${currentUser.last_name}`);
    console.log(`   Specialty: ${currentUser.medical_specialty || 'Not set'}`);
    console.log(`   City: ${currentUser.city || 'Not set'}`);
    console.log(`   Age: ${currentUser.age || 'Not set'}`);
    console.log(`   Interests: ${currentUser.profile_interests?.length || 0} items`);
    console.log(`   Verified: ${currentUser.is_verified}`);
    console.log(`   Onboarding Completed: ${currentUser.onboarding_completed}\n`);

    // Get potential matches
    const { data: potentialProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        *,
        profile_interests (*)
      `)
      .neq('user_id', currentUser.user_id)
      .eq('is_verified', true)
      .eq('is_banned', false)
      .eq('onboarding_completed', true)
      .limit(10);

    if (profilesError) {
      console.error('❌ Error fetching potential profiles:', profilesError.message);
      return;
    }

    console.log(`📊 Found ${potentialProfiles.length} potential profiles\n`);

    // Test compatibility with each profile
    const minCompatibility = 50;
    const compatibleProfiles = [];

    potentialProfiles.forEach((profile, index) => {
      const compatibility = calculateCompatibility(currentUser, profile);
      const isCompatible = compatibility >= minCompatibility;
      
      console.log(`🔍 Profile ${index + 1}: ${profile.first_name} ${profile.last_name}`);
      console.log(`   Specialty: ${profile.medical_specialty || 'Not set'}`);
      console.log(`   City: ${profile.city || 'Not set'}`);
      console.log(`   Age: ${profile.age || 'Not set'}`);
      console.log(`   Interests: ${profile.profile_interests?.length || 0} items`);
      console.log(`   Compatibility: ${compatibility}% ${isCompatible ? '✅' : '❌'}`);
      
      if (isCompatible) {
        compatibleProfiles.push(profile);
      }
      console.log('');
    });

    console.log(`\n📈 Summary:`);
    console.log(`   Total potential profiles: ${potentialProfiles.length}`);
    console.log(`   Compatible profiles (≥${minCompatibility}%): ${compatibleProfiles.length}`);
    console.log(`   Match rate: ${Math.round((compatibleProfiles.length / potentialProfiles.length) * 100)}%`);

    if (compatibleProfiles.length === 0) {
      console.log('\n🚨 ISSUE IDENTIFIED: No compatible profiles found!');
      console.log('   Possible causes:');
      console.log('   1. Current user profile is incomplete');
      console.log('   2. Minimum compatibility threshold (70%) is too high');
      console.log('   3. Potential profiles lack required data');
      console.log('   4. Compatibility calculation has bugs');
      
      console.log('\n💡 Recommendations:');
      console.log('   1. Lower the minimum compatibility threshold to 50%');
      console.log('   2. Ensure all profiles have complete data');
      console.log('   3. Add fallback logic for incomplete profiles');
    }

  } catch (error) {
    console.error('Fatal error during debugging:', error);
  }
}

debugMatching();
