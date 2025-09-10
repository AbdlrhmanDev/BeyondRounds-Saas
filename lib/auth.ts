import { createClient } from "@/lib/supabase/server"

/**
 * Server-side helper to check if a user is an admin
 * Uses the database role field for secure authorization
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    // If no userId provided, get current user
    if (!userId) {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return false
      userId = user.id
    }

    // Use the secure database function
    const { data, error } = await supabase
      .rpc('get_user_role', { uid: userId })

    if (error) {
      console.error('Error checking admin status:', error)
      return false
    }

    return data === 'admin'
  } catch (error) {
    console.error('Error in isAdmin helper:', error)
    return false
  }
}

/**
 * Get user role from database
 */
export async function getUserRole(userId?: string): Promise<'user' | 'admin'> {
  try {
    const supabase = await createClient()
    
    // If no userId provided, get current user
    if (!userId) {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) return 'user'
      userId = user.id
    }

    // Use the secure database function
    const { data, error } = await supabase
      .rpc('get_user_role', { uid: userId })

    if (error) {
      console.error('Error getting user role:', error)
      return 'user'
    }

    return data || 'user'
  } catch (error) {
    console.error('Error in getUserRole helper:', error)
    return 'user'
  }
}

/**
 * Middleware helper to check user role and get redirect path
 */
export async function getRedirectPath(user: any): Promise<string> {
  if (!user) return '/auth/login'
  
  const role = await getUserRole(user.id)
  return role === 'admin' ? '/admin' : '/dashboard'
}
