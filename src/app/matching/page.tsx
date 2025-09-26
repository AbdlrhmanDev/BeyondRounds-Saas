'use client'
 
import { GroupMatching } from '@/components/features/matching/GroupMatching'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
// import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
 
export default function GroupMatchingPage() {
  const { user, profile, isLoading } = useAuthUser()
 
  // const handleNavigate = (page: string) => {
  //   switch (page) {
  //     case 'dashboard':
  //       router.push('/dashboard')
  //       break
  //     case 'admin-dashboard':
  //       router.push('/admin')
  //       break
  //     case 'chat':
  //       router.push('/messages')
  //       break
  //     default:
  //       console.log('Navigation to:', page)
  //   }
  // }
 
  if (!user) {
    return <ProtectedRoute><div /></ProtectedRoute>
  }
 
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950 flex items-center justify-center">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-300">Loading group matching...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
 
  return (
    <GroupMatching
      currentUserId={user.id}
      userSpecialty={profile?.medical_specialty || 'General Practice'}
      userLocation={profile?.city || 'Unknown'}
    />
  )
}