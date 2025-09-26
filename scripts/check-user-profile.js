require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkUserProfile() {
  console.log('🔍 Checking user profile...')
  
  try {
    // Get the user ID from the terminal logs
    const userId = '9a83f7ec-1b03-4402-9f52-00b8b2224f6c'
    
    // Get the profile for this user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return
    }

    console.log(`\n👤 Profile found:`)
    console.log(`   Profile ID: ${profile.id}`)
    console.log(`   User ID: ${profile.user_id}`)
    console.log(`   Name: ${profile.first_name} ${profile.last_name}`)

    // Check matches for this profile
    const { data: matches, error: matchesError } = await supabase
      .from('match_members')
      .select(`
        match_id,
        matches!match_members_match_id_fkey (
          id,
          group_name
        )
      `)
      .eq('profile_id', profile.id)
      .eq('is_active', true)

    if (matchesError) {
      console.error('Error fetching matches:', matchesError)
    } else {
      console.log(`\n📊 Matches for profile ${profile.id}:`)
      matches.forEach(match => {
        console.log(`  - Match: ${match.match_id}, Group: ${match.matches?.[0]?.group_name}`)
      })
      console.log(`  Total matches: ${matches.length}`)
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

checkUserProfile()




