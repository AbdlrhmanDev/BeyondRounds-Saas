import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

/**
 * Validates if a user exists in the users table
 * @param user - The authenticated user from Supabase auth
 * @returns Promise<{ exists: boolean; profile?: any; error?: string }>
 */
export async function validateUserExists(user: User | null): Promise<{
  exists: boolean
  profile?: any
  error?: string
}> {
  if (!user) {
    return { exists: false, error: 'No user provided' }
  }

  try {
    const supabase = createClient()
    const { data: User, error } = await supabase
      .from('profiles')
      .select('id, user_id, first_name, last_name, medical_specialty')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // User doesn't exist in database
        return { exists: false, error: 'User not found in database' }
      }
      // Other database error
      return { exists: false, error: `Database error: ${error.message}` }
    }

    return { exists: true, profile }
  } catch (error) {
    console.error('Error validating user:', error)
    return { exists: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Signs out a user and redirects to login with error message
 * @param errorType - The type of error to show
 * @param redirectTo - Optional redirect path after login
 */
export async function signOutWithError(
  errorType: 'no-account' | 'verification-failed',
  redirectTo?: string
) {
  const supabase = createClient()
  await supabase.auth.signOut()
  
  const params = new URLSearchParams()
  params.set('error', errorType)
  if (redirectTo) {
    params.set('redirectTo', redirectTo)
  }
  
  window.location.href = `/auth/login?${params.toString()}`
}
