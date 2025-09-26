'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { user, profile, isLoading, isAuthenticated, isAdmin } = useAuthUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}`)
        return
      }

      if (requireAdmin && !isAdmin) {
        router.push('/dashboard')
        return
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, requireAdmin, router, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect via useEffect
  }

  if (requireAdmin && !isAdmin) {
    return null // Will redirect via useEffect
  }

  return <>{children}</>
}
