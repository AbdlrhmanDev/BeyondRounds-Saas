'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface UseAuthUserReturn {
  user: SupabaseUser | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export function useAuthUser(): UseAuthUserReturn {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null)
      return
    }

    try {
      console.log('Refreshing profile for user:', user.id)
      
      // Use recommended query pattern for current user profile
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('id,user_id,first_name,last_name,city,medical_specialty,profile_completion,role,is_verified,onboarding_completed')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // If RLS error or recursion error, try to fetch profile using API
        if (error.code === '42501' || error.code === '42P17' || error.message.includes('row-level security') || error.message.includes('infinite recursion')) {
          console.log('RLS error detected, trying to fetch profile via API...')
          
          try {
            const response = await fetch('/api/auth/get-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id
              })
            })
            
            if (response.ok) {
              const result = await response.json()
              console.log('User fetched via API:', result)
              setProfile(result.user)
            } else {
              console.error('Failed to fetch profile via API, trying to create...')
              
              // Try to create profile if fetch fails
              const createResponse = await fetch('/api/auth/create-profile', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId: user.id,
                  email: user.email,
                  firstName: user.user_metadata?.first_name || '',
                  lastName: user.user_metadata?.last_name || ''
                })
              })
              
              if (createResponse.ok) {
                const createResult = await createResponse.json()
                console.log('User created via API:', createResult)
                setProfile(createResult.user)
              } else {
                console.error('Failed to create profile via API')
                setProfile(null)
              }
            }
          } catch (apiError) {
            console.error('API error:', apiError)
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
      } else {
        console.log('User loaded successfully:', userData)
        
        // If userData is null but no error, try API fallback
        if (!userData) {
          console.log('User data is null, trying API fallback...')
          
          try {
            const response = await fetch('/api/auth/get-profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id
              })
            })
            
            if (response.ok) {
              const result = await response.json()
              console.log('User fetched via API:', result)
              setProfile(result.user)
            } else {
              console.error('Failed to fetch profile via API')
              setProfile(null)
            }
          } catch (apiError) {
            console.error('API error:', apiError)
            setProfile(null)
          }
        } else {
          setProfile(userData)
        }
      }
    } catch (error) {
      console.error('Error in refreshProfile:', error)
      setProfile(null)
    }
  }

  const signOut = async () => {
    try {
      // Store user role before signing out
      const userRole = profile?.role
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        toast.error('Failed to sign out. Please try again.')
        throw error
      }
      
      // Clear local state
      setUser(null)
      setProfile(null)
      
      // Show success toast
      toast.success('Successfully signed out from BeyondRounds!')
      
      // Redirect to login with appropriate redirect parameter based on user role
      if (userRole === 'admin') {
        router.push('/auth/login?redirectTo=/admin')
      } else {
        router.push('/auth/login?redirectTo=/dashboard')
      }
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
      }
      
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getInitialSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event)
      setUser(session?.user ?? null)
      setIsLoading(false)

      // Handle different auth events
      if (event === 'SIGNED_IN') {
        console.log('User signed in')
        toast.success('Welcome back to BeyondRounds!')
        
        // Get the redirect URL from the current page or default to dashboard
        const currentPath = window.location.pathname
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get('redirectTo') || '/dashboard'
        
        // Only redirect if we're on an auth page
        if (currentPath === '/auth/login' || currentPath === '/auth/sign-up') {
          console.log('Redirecting to:', redirectTo)
          router.push(redirectTo)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        setProfile(null)
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Fetch profile when user changes
  useEffect(() => {
    if (user && !profile) {
      refreshProfile()
    } else if (!user) {
      setProfile(null)
    }
  }, [user])

  // Auto-redirect admin users to admin panel when profile loads
  useEffect(() => {
    if (profile) {
      console.log('useAuthUser: User loaded, role:', profile.role)
      if (profile.role === 'admin') {
        const currentPath = window.location.pathname
        console.log('useAuthUser: Admin user detected on path:', currentPath)
        // Only redirect if we're on dashboard or auth pages
        if (currentPath === '/dashboard' || currentPath === '/auth/login' || currentPath === '/auth/sign-up') {
          
          console.log('useAuthUser: Redirecting admin to /admin')
          router.push('/admin')
        }
      }
    }
  }, [profile, router])

  return {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    signOut,
    refreshProfile,
  }
}

