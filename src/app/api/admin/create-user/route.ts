import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
 
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, firstName, lastName, tempPassword, role, medicalSpecialty, city } = body
 
    // Validate required fields
    if (!email || !firstName || !lastName || !tempPassword || !city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
 
    const supabase = createClient()
 
    // Check if the requesting user is an admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
 
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
 
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()
 
    if (!currentProfile || currentProfile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
 
    // Create user in Supabase Auth using service role key
    const { createClient: createServiceClient } = require('@supabase/supabase-js')
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
 
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Skip email confirmation for admin-created accounts
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    })
 
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 400 }
      )
    }
 
    if (!newUser.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }
 
    // Create profile in our database
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: newUser.user.id, // Use user_id field as per actual schema
        email,
        first_name: firstName,
        last_name: lastName,
        city,
        gender: 'prefer-not-to-say', // Required field
        role: role || 'user',
        is_verified: true, // Admin-created accounts are pre-verified
        profile_completion_percentage: medicalSpecialty ? 20 : 10, // Basic completion
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      })
 
    if (profileError) {
      console.error('User creation error:', profileError)
 
      // If profile creation fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
 
      return NextResponse.json(
        { error: `Failed to create user: ${profileError.message}` },
        { status: 400 }
      )
    }
 
    // Note: profile_professional table doesn't exist in current schema
    // Medical specialty is stored directly in the users table
    if (medicalSpecialty) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          medical_specialty: medicalSpecialty,
          specialties: [medicalSpecialty],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', newUser.user.id) // Use user_id field as per actual schema
 
      if (updateError) {
        console.error('Medical specialty update error:', updateError)
        // Don't fail the whole operation for this
      }
    }
 
    // Get the profile ID to create preferences
    const { data: userData } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', newUser.user.id)
      .single()
 
    if (userData) {
      // Create default preferences
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .insert({
          profile_id: userData.id, // Use actual profile ID
          email_notifications: true,
          push_notifications: true,
          weekly_match_reminders: true,
          marketing_emails: false,
          privacy_level: 'standard'
        })
 
      if (preferencesError) {
        console.error('Preferences creation error:', preferencesError)
        // Don't fail the whole operation for this
      }
    }
 
    return NextResponse.json({
      success: true,
      user: {
        id: newUser.user.id,
        email,
        firstName,
        lastName,
        role: role || 'user'
      }
    })
 
  } catch (error: unknown) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}