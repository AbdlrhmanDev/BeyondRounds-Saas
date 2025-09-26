import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
 
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body
 
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }
 
    console.log(`🔍 Fetching profile for user: ${userId}`)
 
    // Fetch profile using service role (bypasses RLS)
    const { data: User, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()
 
    if (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
 
    if (!User) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
 
    console.log('✅ User fetched successfully:', User.email)
 
    return NextResponse.json({ 
      success: true, 
      user: User,
      message: 'User fetched successfully'
    })
 
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}