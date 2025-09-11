import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to check admin status
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Get matching statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('get_matching_statistics')

    if (statsError) {
      console.error('Error getting stats:', statsError)
      return NextResponse.json({ error: 'Failed to get statistics' }, { status: 500 })
    }

    // Get eligible users count
    const { data: eligibleCount, error: eligibleError } = await supabase
      .rpc('get_eligible_users_count')

    if (eligibleError) {
      console.error('Error getting eligible count:', eligibleError)
      return NextResponse.json({ error: 'Failed to get eligible count' }, { status: 500 })
    }

    // Get matching history
    const { data: history, error: historyError } = await supabase
      .rpc('get_matching_history', { limit_count: 5 })

    if (historyError) {
      console.error('Error getting history:', historyError)
      // Don't fail the request if history is unavailable
    }

    let cronStatus = null
    if (profile?.role === 'admin') {
      // Get CRON job status for admins
      const { data: cronData, error: cronError } = await supabase
        .rpc('get_cron_job_status')
      
      if (!cronError && cronData && cronData.length > 0) {
        cronStatus = cronData[0]
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        eligibleCount,
        history: history || [],
        cronStatus,
        isAdmin: profile?.role === 'admin'
      }
    })

  } catch (error) {
    console.error('Error in matching stats API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

