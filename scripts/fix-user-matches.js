require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixUserMatches() {
  console.log('🔧 Fixing User Matches...\n')

  const profileId = '9eb30096-40af-4e20-8dd8-225f8d3411ee'

  try {
    // Check what matches exist
    console.log('1. Checking existing matches:')
    const { data: allMatches, error: allMatchesError } = await supabase
      .from('matches')
      .select('id, group_name, match_week')
      .limit(5)

    if (allMatchesError) {
      console.error('❌ All matches error:', allMatchesError)
    } else {
      console.log('✅ All matches found:', allMatches?.length || 0)
      allMatches?.forEach(match => {
        console.log(`   - ${match.group_name} (${match.id})`)
      })
    }

    // Check what match_members exist
    console.log('\n2. Checking existing match members:')
    const { data: allMembers, error: allMembersError } = await supabase
      .from('match_members')
      .select(`
        match_id,
        profile_id,
        profiles!match_members_profile_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq('is_active', true)
      .limit(10)

    if (allMembersError) {
      console.error('❌ All members error:', allMembersError)
    } else {
      console.log('✅ All members found:', allMembers?.length || 0)
      allMembers?.forEach(member => {
        console.log(`   - ${member.profiles?.first_name} ${member.profiles?.last_name} in match ${member.match_id}`)
      })
    }

    // Add the user to an existing match
    if (allMatches && allMatches.length > 0) {
      const matchId = allMatches[0].id
      console.log(`\n3. Adding user to match: ${matchId}`)
      
      const { data: insertData, error: insertError } = await supabase
        .from('match_members')
        .insert({
          match_id: matchId,
          profile_id: profileId,
          is_active: true,
          joined_at: new Date().toISOString()
        })
        .select()

      if (insertError) {
        console.error('❌ Insert error:', insertError)
      } else {
        console.log('✅ User added to match successfully!')
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
      .eq('profile_id', profileId)
      .eq('is_active', true)

    if (userMatchesError) {
      console.error('❌ User matches error:', userMatchesError)
    } else {
      console.log('✅ User matches found:', userMatches?.length || 0)
      userMatches?.forEach(match => {
        console.log(`   - ${match.matches?.group_name} (${match.match_id})`)
      })
    }

    console.log('\n🎉 User matches fixed! The Messages page should now show conversations.')

  } catch (error) {
    console.error('❌ Fix error:', error)
  }
}

fixUserMatches()







