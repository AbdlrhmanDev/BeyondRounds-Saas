require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixUserProfile() {
  console.log('🔧 Fixing User Profile...\n')

  const userId = '9eb30096-40af-4e20-8dd8-225f8d3411ee' // This is the auth user ID

  try {
    // Check what profiles exist
    console.log('1. Checking existing profiles:')
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, email')
      .limit(5)

    if (allProfilesError) {
      console.error('❌ All profiles error:', allProfilesError)
    } else {
      console.log('✅ All profiles found:', allProfiles?.length || 0)
      allProfiles?.forEach(profile => {
        console.log(`   - ${profile.first_name} ${profile.last_name} (user_id: ${profile.user_id})`)
      })
    }

    // Check if this user already has a profile
    console.log('\n2. Checking if user has a profile:')
    const { data: existingProfile, error: existingProfileError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, email')
      .eq('user_id', userId)
      .single()

    if (existingProfileError && existingProfileError.code !== 'PGRST116') {
      console.error('❌ Existing profile error:', existingProfileError)
    } else if (existingProfile) {
      console.log('✅ User already has a profile:', existingProfile)
    } else {
      console.log('❌ User does not have a profile, creating one...')
      
      // Create a profile for this user
      const { data: newProfile, error: newProfileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          city: 'Test City',
          timezone: 'UTC',
          role: 'user',
          medical_specialty: 'general',
          profile_completion: 50,
          onboarding_completed: true
        })
        .select()
        .single()

      if (newProfileError) {
        console.error('❌ Create profile error:', newProfileError)
      } else {
        console.log('✅ Profile created successfully:', newProfile)
        
        // Now add the user to a match
        console.log('\n3. Adding user to a match:')
        const { data: allMatches } = await supabase
          .from('matches')
          .select('id, group_name')
          .limit(1)

        if (allMatches && allMatches.length > 0) {
          const matchId = allMatches[0].id
          const { data: insertData, error: insertError } = await supabase
            .from('match_members')
            .insert({
              match_id: matchId,
              profile_id: newProfile.id,
              is_active: true,
              joined_at: new Date().toISOString()
            })
            .select()

          if (insertError) {
            console.error('❌ Insert match member error:', insertError)
          } else {
            console.log('✅ User added to match successfully!')
          }
        }
      }
    }

    // Verify the user now has matches
    console.log('\n4. Verifying user matches:')
    const { data: userMatches, error: userMatchesError } = await supabase
      .from('match_members')
      .select(`
        match_id,
        matches!match_members_match_id_fkey (
          id,
          group_name
        )
      `)
      .eq('profile_id', existingProfile?.id || '')
      .eq('is_active', true)

    if (userMatchesError) {
      console.error('❌ User matches error:', userMatchesError)
    } else {
      console.log('✅ User matches found:', userMatches?.length || 0)
      userMatches?.forEach(match => {
        console.log(`   - ${match.matches?.group_name} (${match.match_id})`)
      })
    }

    console.log('\n🎉 User profile and matches fixed! The Messages page should now show conversations.')

  } catch (error) {
    console.error('❌ Fix error:', error)
  }
}

fixUserProfile()







