'use client'
 
import { Notifications } from '@/components/features/notifications/Notifications';
import { useAuthUser } from '@/hooks/features/auth/useAuthUser';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
 
export default function NotificationsPage() {
  const { user, isLoading } = useAuthUser();
  const router = useRouter();
 
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, isLoading, router]);
 
  const handleNavigate = (page: string) => {
    switch (page) {
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'matching':
        router.push('/matching');
        break;
      case 'chat':
        router.push('/chat');
        break;
      case 'preferences':
        router.push('/settings');
        break;
      default:
        router.push('/dashboard');
    }
  };
 
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }
 
  if (!user) {
    return null; // Will redirect to sign-in
  }
 
  return <Notifications user={user as unknown as Record<string, unknown>} onNavigate={handleNavigate} />;
}