import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import GroupPageClient from './GroupPageClient'

interface GroupPageProps {
  params: {
    id: string
  }
}

export default async function GroupPage({ params }: GroupPageProps) {
  const supabase = createSupabaseServer()
  const groupId = params.id

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

  console.log('Group Page: User found:', user.id)

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Error getting profile:', profileError)
    redirect('/auth/login')
  }

  if (!profile) {
    console.log('No profile found, redirecting to onboarding')
    redirect('/onboarding')
  }

  return <GroupPageClient groupId={groupId} user={user} profile={profile} />
}
