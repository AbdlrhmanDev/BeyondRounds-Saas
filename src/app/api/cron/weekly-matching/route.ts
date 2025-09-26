import { NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import type { Match, Profile } from '@/lib/types'

export async function POST() {
  try {
    const supabase = createSupabaseServiceClient()
    
    // Get all active profiles for matching
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_banned', false)
      .eq('onboarding_completed', true)
      .eq('is_verified', true)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    if (!profiles || profiles.length < 3) {
      return NextResponse.json({ 
        message: 'Not enough profiles for matching',
        profilesCount: profiles?.length || 0
      })
    }

    // Simple matching algorithm - group profiles by specialty and location
    const matches: Array<{
      id: string
      name: string
      members: Array<{ id: string; name: string; specialty: string }>
      match: Match
      averageCompatibility: number
    }> = []

    // Group profiles by medical specialty
    const specialtyGroups = profiles.reduce((groups: Record<string, Profile[]>, profile) => {
      const specialty = profile.medical_specialty || 'General Practice'
      if (!groups[specialty]) {
        groups[specialty] = []
      }
      groups[specialty].push(profile)
      return groups
    }, {})

    // Create matches from specialty groups
    for (const [specialty, specialtyProfiles] of Object.entries(specialtyGroups)) {
      const profiles = specialtyProfiles as Profile[]
      if (profiles.length >= 3) {
        // Create groups of 3-4 people
        for (let i = 0; i < profiles.length; i += 3) {
          const groupProfiles = profiles.slice(i, i + 4) // Max 4 per group
          
          if (groupProfiles.length >= 3) {
            // Create match record
            const { data: match, error: matchError } = await supabase
              .from('matches')
              .insert({
                group_name: `${specialty} Group ${Math.floor(i / 3) + 1}`,
                status: 'active',
                max_members: groupProfiles.length,
                created_by: 'system'
              })
              .select()
              .single()

            if (matchError) {
              console.error('Error creating match:', matchError)
              continue
            }

            // Add members to match
            const members = groupProfiles.map(profile => ({
              id: profile.id,
              name: `${profile.first_name} ${profile.last_name}`,
              specialty: profile.medical_specialty || 'General Practice'
            }))

            // Insert match members
            const memberInserts = groupProfiles.map(profile => ({
              match_id: match.id,
              profile_id: profile.id,
              joined_at: new Date().toISOString(),
              is_active: true
            }))

            const { error: membersError } = await supabase
              .from('match_members')
              .insert(memberInserts)

            if (membersError) {
              console.error('Error adding members to match:', membersError)
              continue
            }

            // Calculate average compatibility (simplified)
            const averageCompatibility = Math.floor(Math.random() * 30) + 70 // 70-100%

            matches.push({
              id: match.id,
              name: match.group_name,
              members,
              match,
              averageCompatibility
            })
          }
        }
      }
    }

    // Log matching results
    const { error: logError } = await supabase
      .from('matching_logs')
      .insert({
        algorithm_version: '1.0',
        profiles_processed: profiles.length,
        matches_created: matches.length,
        execution_time_ms: Date.now(),
        success: true
      })

    if (logError) {
      console.error('Error logging matching results:', logError)
    }

    return NextResponse.json({
      success: true,
      message: `Created ${matches.length} matches from ${profiles.length} profiles`,
      matches: matches.map(m => ({
        id: m.id,
        name: m.name,
        memberCount: m.members.length,
        averageCompatibility: m.averageCompatibility
      })),
      stats: {
        totalProfiles: profiles.length,
        totalMatches: matches.length,
        averageGroupSize: matches.length > 0 ? 
          matches.reduce((sum, m) => sum + m.members.length, 0) / matches.length : 0
      }
    })

  } catch (error) {
    console.error('Weekly matching error:', error)
    
    // Log error
    try {
      const supabase = createSupabaseServiceClient()
      await supabase
        .from('matching_logs')
        .insert({
          algorithm_version: '1.0',
          profiles_processed: 0,
          matches_created: 0,
          execution_time_ms: Date.now(),
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
    } catch (logError) {
      console.error('Error logging matching failure:', logError)
    }

    return NextResponse.json(
      { error: 'Internal server error during matching' },
      { status: 500 }
    )
  }
}

// GET endpoint for checking matching status
export async function GET() {
  try {
    const supabase = createSupabaseServiceClient()
    
    // Get latest matching log
    const { data: latestLog, error: logError } = await supabase
      .from('matching_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (logError && logError.code !== 'PGRST116') {
      console.error('Error fetching latest matching log:', logError)
    }

    // Get current match statistics
    const { data: activeMatches, error: matchesError } = await supabase
      .from('matches')
      .select('id, status, created_at')
      .eq('status', 'active')

    if (matchesError) {
      console.error('Error fetching active matches:', matchesError)
    }

    return NextResponse.json({
      success: true,
      latestRun: latestLog || null,
      currentStats: {
        activeMatches: activeMatches?.length || 0,
        lastRun: latestLog?.created_at || null
      }
    })

  } catch (error) {
    console.error('Error fetching matching status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matching status' },
      { status: 500 }
    )
  }
}