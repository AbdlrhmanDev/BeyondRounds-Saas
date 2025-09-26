import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)
 
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, firstName, lastName } = body
 
    if (!userId || !email) {
      return NextResponse.json(
        { success: false, error: 'User ID and email are required' },
        { status: 400 }
      )
    }
 
    console.log(`🔧 Creating profile for user: ${email}`)
 
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
 
    if (existingProfile) {
      console.log('User already exists, fetching it...')
      const { data: User } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
 
      return NextResponse.json({ 
        success: true, 
        user: User,
        message: 'User already existed'
      })
    }
 
    // Create new profile using service role (bypasses RLS)
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        user_id: userId,
        email: email,
        first_name: firstName || '',
        last_name: lastName || '',
        city: 'Not specified',
        gender: 'prefer-not-to-say',
        role: 'user',
        is_verified: false,
        is_banned: false,
        onboarding_completed: false,
        profile_completion: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
 
    if (error) {
      console.error('Error creating user:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
 
    console.log('✅ User created successfully:', newProfile.email)
 
    return NextResponse.json({ 
      success: true, 
      user: newProfile,
      message: 'User created successfully'
    })
 
  } catch (error) {
    console.error('Failed to create user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}