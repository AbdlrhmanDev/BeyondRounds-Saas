import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import DashboardClient from './DashboardClient'
 
export default async function DashboardPage() {
  const supabase = createSupabaseServer()
 
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError) {
    console.error('Error getting user:', userError)
    redirect('/auth/login')
  }
  
  if (!user) {
    console.log('No user found, redirecting to login')
    redirect('/auth/login')
  }
 
  console.log('Dashboard: User found:', user.id)
 
  // Get user profile with better error handling
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
 
  if (profileError) {
    console.error('Error getting profile:', profileError)
    
    // If it's an RLS error, try to create a profile
    if (profileError.code === '42P17' || profileError.message?.includes('recursion') || profileError.message?.includes('RLS')) {
      console.log('RLS error detected, attempting to create profile...')
      
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || 'User',
          last_name: user.user_metadata?.last_name || 'Name',
          medical_specialty: 'General Practice',
          city: 'Not specified',
          gender: 'prefer-not-to-say',
          role: 'user',
          is_verified: false,
          is_banned: false,
          onboarding_completed: false,
          profile_completion: 0
        })
        .select()
        .single()
 
      if (createError) {
        console.error('Error creating profile:', createError)
        redirect('/auth/login')
      }
 
      console.log('Profile created successfully, redirecting to onboarding')
      redirect('/onboarding')
    } else {
      redirect('/auth/login')
    }
  }
 
  // If no profile exists, create one
  if (!profile) {
    console.log('No profile found, creating new profile...')
    
    const { error: createError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.first_name || 'User',
        last_name: user.user_metadata?.last_name || 'Name',
        medical_specialty: 'General Practice',
        city: 'Not specified',
        gender: 'prefer_not_to_say',
        role: 'user',
        is_verified: false,
        is_banned: false,
        onboarding_completed: false,
        profile_completion: 0
      })
      .select()
      .single()
 
    if (createError) {
      console.error('Error creating profile:', createError)
      redirect('/auth/login')
    }
 
    console.log('Profile created successfully, redirecting to onboarding')
    redirect('/onboarding')
  }
 
  console.log('Dashboard: Profile found:', profile.id, 'Role:', profile.role)
 
  // Check if user is admin and redirect to admin panel
  if (profile.role === 'admin') {
    console.log('Dashboard: User is admin, redirecting to /admin')
    redirect('/admin')
  }
 
  // Check if onboarding is completed
  if (!profile.onboarding_completed || (profile.profile_completion ?? 0) < 80) {
    console.log('Dashboard: Onboarding not completed, redirecting to /onboarding')
    redirect('/onboarding')
  }
 
  console.log('Dashboard: User authorized, rendering dashboard')
  return <DashboardClient user={user} profile={profile} />
}