'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'

interface UseRoleRedirectOptions {
  requireAdmin?: boolean
  requireUser?: boolean
  redirectTo?: string
  enabled?: boolean
}

/**
 * Hook to handle role-based redirects for BeyondRounds medical professional platform
 * @param options Configuration options for the redirect behavior
 */
export function useRoleRedirect(options: UseRoleRedirectOptions = {}) {
  const { profile, isLoading } = useAuthUser()
  const router = useRouter()
  
  const {
    requireAdmin = false,
    requireUser = false,
    redirectTo,
    enabled = true
  } = options

  useEffect(() => {
    if (!enabled || isLoading || !profile) return

    const isAdmin = profile.role === 'admin'
    const isRegularUser = profile.role === 'user'

    // Determine redirect destination
    let shouldRedirect = false
    let destination = ''

    if (requireAdmin && !isAdmin) {
      shouldRedirect = true
      destination = redirectTo || '/dashboard'
    } else if (requireUser && !isRegularUser) {
      shouldRedirect = true
      destination = redirectTo || '/admin'
    }

    if (shouldRedirect && destination) {
      router.push(destination)
    }
  }, [profile, isLoading, requireAdmin, requireUser, redirectTo, enabled, router])

  return {
    isAdmin: profile?.role === 'admin',
    isRegularUser: profile?.role === 'user',
    isLoading,
    profile
  }
}

