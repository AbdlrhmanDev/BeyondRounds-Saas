#!/usr/bin/env node

/**
 * Create Sample Matches Script
 * 
 * This script creates sample matches and match_members entries
 * so the dashboard can display real data
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

async function createSampleMatches() {
  try {
    console.log('🔄 Creating sample matches for dashboard...\n');
    
    // Get some profiles to create matches with
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, medical_specialty, city')
      .eq('is_verified', true)
      .eq('onboarding_completed', true)
      .limit(10);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    console.log(`📊 Found ${profiles.length} profiles to create matches with\n`);

    // Create sample matches
    const sampleMatches = [
      {
        group_name: 'Cardiology Study Group',
        group_size: 3,
        match_week: new Date().toISOString().split('T')[0], // Today's date
        status: 'active'
      },
      {
        group_name: 'Emergency Medicine Network',
        group_size: 4,
        match_week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week ago
        status: 'active'
      },
      {
        group_name: 'Internal Medicine Collaboration',
        group_size: 3,
        match_week: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks ago
        status: 'active'
      }
    ];

    for (let i = 0; i < sampleMatches.length; i++) {
      const matchData = sampleMatches[i];
      console.log(`🎯 Creating match ${i + 1}/${sampleMatches.length}: ${matchData.group_name}`);
      
      // Create the match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert(matchData)
        .select()
        .single();

      if (matchError) {
        console.error(`   ❌ Error creating match: ${matchError.message}`);
        continue;
      }

      console.log(`   ✅ Match created with ID: ${match.id}`);

      // Add members to the match (including the current user)
      const membersToAdd = profiles.slice(i * 2, (i + 1) * 2 + 1); // Get 3 members per group
      
      for (let j = 0; j < membersToAdd.length; j++) {
        const member = membersToAdd[j];
        const { error: memberError } = await supabase
          .from('match_members')
          .insert({
            match_id: match.id,
            profile_id: member.id,
            is_active: true,
            joined_at: new Date().toISOString()
          });

        if (memberError) {
          console.error(`      ❌ Error adding member ${member.first_name}: ${memberError.message}`);
        } else {
          console.log(`      ✅ Added member: ${member.first_name} ${member.last_name}`);
        }
      }
      
      console.log('');
    }

    console.log('🎉 Sample matches creation completed!');
    console.log('\n📊 Summary:');
    console.log('   • Created 3 sample matches');
    console.log('   • Added members to each match');
    console.log('   • Dashboard should now show real data');
    console.log('\n🔄 You can now check the dashboard for matches!');

  } catch (error) {
    console.error('Fatal error during sample matches creation:', error);
  }
}

createSampleMatches();
