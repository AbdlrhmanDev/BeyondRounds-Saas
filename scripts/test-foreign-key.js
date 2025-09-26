require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkMatchesDirectly() {
  console.log('🔍 Checking matches directly...')
  
  try {
    // Get matches directly
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('id, group_name, group_size, created_at')
      .order('created_at', { ascending: false })
      .limit(5)

    if (matchesError) {
      console.error('Error fetching matches:', matchesError)
      return
    }

    console.log(`\n📊 Recent matches:`)
    matches.forEach(match => {
      console.log(`  - ${match.group_name} (ID: ${match.id})`)
      console.log(`    Group size: ${match.group_size}`)
      console.log(`    Created: ${match.created_at}`)
    })

    // Now check the foreign key relationship
    const matchId = matches[0].id
    console.log(`\n🔗 Testing foreign key relationship for match ${matchId}:`)
    
    const { data: testQuery, error: testError } = await supabase
      .from('match_members')
      .select(`
        match_id,
        matches!inner (
          id,
          group_name
        )
      `)
      .eq('match_id', matchId)
      .limit(1)

    if (testError) {
      console.error('Foreign key test error:', testError)
    } else {
      console.log('Foreign key test result:', testQuery)
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

checkMatchesDirectly()




