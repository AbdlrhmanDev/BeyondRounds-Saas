'use client'
 
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import WeeklyMatchingManagement from '@/components/features/matching/WeeklyMatchingManagement'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
 
export default function AdminWeeklyMatchingPage() {
  const { profile, isLoading } = useAuthUser()
 
  if (isLoading) {
    return <LoadingSpinner />
  }
 
  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }
 
  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="container mx-auto px-4 py-8">
        <WeeklyMatchingManagement adminId={profile.id} />
      </div>
    </ProtectedRoute>
  )
}