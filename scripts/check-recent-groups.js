require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkRecentGroups() {
  console.log('🔍 Checking recent groups...')
  
  try {
    // Get recent matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, group_name, group_size, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (matchesError) {
      console.error('Error fetching matches:', matchesError)
      return
    }

    console.log('📊 Recent matches:')
    matches.forEach(match => {
      console.log(`  - ${match.group_name} (ID: ${match.id})`)
      console.log(`    Group size: ${match.group_size}`)
      console.log(`    Created: ${match.created_at}`)
    })

    // Check members for each match
    for (const match of matches) {
      const { data: members, error: membersError } = await supabase
        .from('match_members')
        .select(`
          profile_id,
          profiles!match_members_profile_id_fkey (
            first_name,
            last_name,
            medical_specialty
          )
        `)
        .eq('match_id', match.id)

      if (membersError) {
        console.error(`Error fetching members for match ${match.id}:`, membersError)
      } else {
        console.log(`\n👥 Members in ${match.group_name}:`)
        members.forEach(member => {
          console.log(`  - ${member.profiles.first_name} ${member.profiles.last_name} (${member.profiles.medical_specialty})`)
        })
        console.log(`  Total members: ${members.length}`)
      }
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

checkRecentGroups()




