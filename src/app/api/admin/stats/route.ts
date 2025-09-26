import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)
 
export async function GET(_request: NextRequest) {
  try {
    console.log('📊 Loading admin statistics via API...')
    
    // Load total users
    const { count: totalUsers, error: totalError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
 
    if (totalError) {
      console.error('Error loading total users:', totalError)
    }
 
    // Load verified users
    const { count: verifiedUsers, error: verifiedError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true)
 
    if (verifiedError) {
      console.error('Error loading verified users:', verifiedError)
    }
 
    // Load banned users
    const { error: bannedError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_banned', true)

    if (bannedError) {
      console.error('Error loading banned users:', bannedError)
    }

    // Load admin users
    const { error: adminError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')

    if (adminError) {
      console.error('Error loading admin users:', adminError)
    }
 
    // Load active matches (matches that are not completed)
    const { count: activeMatches, error: matchesError } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .is('completion_date', null)
 
    if (matchesError) {
      console.error('Error loading active matches:', matchesError)
    }
 
    // Load pending verifications
    const { count: pendingVerifications, error: verificationsError } = await supabase
      .from('verification_documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
 
    if (verificationsError) {
      console.error('Error loading pending verifications:', verificationsError)
    }
 
    // Calculate user growth (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: recentUsers, error: recentError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString())
 
    if (recentError) {
      console.error('Error loading recent users:', recentError)
    }
 
    const stats = {
      totalUsers: totalUsers || 0,
      verifiedUsers: verifiedUsers || 0,
      paidUsers: verifiedUsers || 0, // Using verified users as paid users for now
      activeMatches: activeMatches || 0,
      pendingVerifications: pendingVerifications || 0,
      totalRevenue: 0, // Will implement payment tracking
      monthlyRevenue: 0, // Will implement payment tracking
      userGrowth: recentUsers || 0
    }
 
    console.log('📊 Admin stats loaded via API:', stats)
    
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Failed to load admin stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load statistics' },
      { status: 500 }
    )
  }
}