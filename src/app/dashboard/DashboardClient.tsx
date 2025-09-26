"use client"
 
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { 
  AlertCircle,
  RefreshCw,
  ArrowDown
} from 'lucide-react'
import type { Database } from '@/lib/types/database'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { UserDashboard } from '@/components/features/dashboard/UserDashboard'
 
type Profile = Database['public']['Tables']['profiles']['Row']
 
interface DashboardStats {
  totalMatches: number
  activeGroups: number
  messagesSent: number
  profileViews: number
  newMatches: number
  responseRate: number
  avgCompatibility: number
  weeklyActivity: number
}
 
interface RecentMatch {
  id: string
  name: string
  specialty: string | null
  compatibility: number | null
  lastActive: string
  avatar: string
  status: 'new' | 'active' | 'pending'
  mutualInterests: number
  location: string
  age: number
  careerStage: string
}
 
interface ActiveGroup {
  id: string
  name: string
  members: number
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  avatar: string
  color: string
}
 
// interface UpcomingActivity {
//   id: string
//   title: string
//   type: 'meetup' | 'group_chat' | 'coffee' | 'hiking' | 'book_club'
//   date: string
//   time: string
//   location: string
//   attendees: number
//   maxAttendees: number
//   status: 'confirmed' | 'pending' | 'cancelled'
// }

// interface Notification {
//   id: string
//   type: 'match' | 'message' | 'activity' | 'system'
//   title: string
//   message: string
//   time: string
//   read: boolean
//   priority: 'high' | 'medium' | 'low'
// }
 
interface DashboardClientProps {
  user: SupabaseUser
  profile: Profile
}
 
export default function DashboardClient({ user, profile }: DashboardClientProps) {
  const router = useRouter()
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalMatches: 0,
    activeGroups: 0,
    messagesSent: 0,
    profileViews: 0,
    newMatches: 0,
    responseRate: 0,
    avgCompatibility: 0,
    weeklyActivity: 0
  })
  
  const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([])
  const [activeGroups, setActiveGroups] = useState<ActiveGroup[]>([])
  // const [upcomingActivities] = useState<UpcomingActivity[]>([])
  // const [notifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedChatRoom, setSelectedChatRoom] = useState<string | null>(null)
 
  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return
 
    try {
      setIsLoading(true)
      setError(null)
 
      // Load real dashboard data from API
      const response = await fetch(`/api/dashboard?userId=${user.id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
 
      if (result.success) {
        const data = result.data
        
        // Set dashboard stats with fallback values
        setDashboardStats({
          totalMatches: data.stats?.totalMatches || 0,
          activeGroups: data.stats?.activeGroups || 0,
          messagesSent: data.stats?.messagesSent || 0,
          profileViews: data.stats?.profileViews || 0,
          newMatches: data.stats?.newMatches || 0,
          responseRate: data.stats?.responseRate || 0,
          avgCompatibility: data.stats?.avgCompatibility || 0,
          weeklyActivity: data.stats?.weeklyActivity || 0
        })
        
        // Set recent matches with fallback
        setRecentMatches(data.recentMatches || [])
        
        // Set active groups (chat rooms) with fallback
        setActiveGroups(data.activeGroups || [])
        
        // Set notifications with fallback
        // setNotifications(data.notifications || [])
        
        // Mock upcoming activities for now
        // setUpcomingActivities([
        //   {
        //     id: '1',
        //     title: 'Coffee Meetup',
        //     type: 'coffee',
        //     date: '2024-01-15',
        //     time: '10:00 AM',
        //     location: 'Blue Bottle Coffee',
        //     attendees: 3,
        //     maxAttendees: 6,
        //     status: 'confirmed'
        //   },
        //   {
        //     id: '2',
        //     title: 'Weekend Hiking',
        //     type: 'hiking',
        //     date: '2024-01-20',
        //     time: '8:00 AM',
        //     location: 'Mountain Trail',
        //     attendees: 2,
        //     maxAttendees: 4,
        //     status: 'pending'
        //   },
        //   {
        //     id: '3',
        //     title: 'Book Club Discussion',
        //     type: 'book_club',
        //     date: '2024-01-18',
        //     time: '7:00 PM',
        //     location: 'Online',
        //     attendees: 5,
        //     maxAttendees: 8,
        //     status: 'confirmed'
        //   }
        // ])
      } else {
        setError(result.error || 'Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])
 
  const handleRefresh = async () => {
    try {
      await loadDashboardData()
      toast.success('Dashboard refreshed!')
    } catch (error) {
      console.error('Error refreshing dashboard:', error)
      toast.error('Failed to refresh dashboard')
    }
  }
 
  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])
 
  // const handleJoinGroup = (_groupId: string) => {
  //   toast.success('Joined group successfully!')
  //   // Here you would implement the actual join logic
  // }

  // const handleStartChat = (_groupId: string) => {
  //   // setSelectedChatRoom(groupId)
  // }
 
  const handleBackToDashboard = () => {
    setSelectedChatRoom(null)
  }
 
  // const handleNavigation = (page: string) => {
  //   switch (page) {
  //     case 'profile':
  //       router.push('/profile')
  //       break
  //     case 'profile-edit':
  //       router.push('/profile/edit')
  //       break
  //     case 'profile-settings':
  //       router.push('/profile/settings')
  //       break
  //     case 'chat':
  //       router.push('/messages')
  //       break
  //     case 'matching':
  //       router.push('/matching')
  //       break
  //     case 'notifications':
  //       router.push('/notifications')
  //       break
  //     case 'preferences':
  //       router.push('/preferences')
  //       break
  //     default:
  //       console.log('Navigation to:', page)
  //   }
  // }
 
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }
 
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="ml-4"
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }
 
  // Safety check for profile data
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-lg">Profile not found</p>
          <p className="text-sm text-gray-500 mt-2">Please complete your profile setup</p>
          <Button 
            variant="outline" 
            onClick={() => router.push('/profile/edit')}
            className="mt-4"
          >
            Complete Profile
          </Button>
        </div>
      </div>
    )
  }
 
  // If a chat room is selected, show the chat component
  if (selectedChatRoom) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2"
          >
            <ArrowDown className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold">Chat Room</h2>
        </div>
        <div className="p-4 text-center">
          <p>Chat functionality coming soon...</p>
        </div>
      </div>
    )
  }
 
  return (
    <UserDashboard 
      user={{
        id: user.id,
        name: [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'User',
        email: user.email,
        specialty: profile.medical_specialty || 'General Practice',
        experience_level: 'Unknown',
        avatar_url: `${profile.first_name?.[0]}${profile.last_name?.[0]}`,
        verification_status: profile.is_verified ? 'verified' : 'pending'
      }}
      matches={recentMatches.map(match => ({
        id: match.id,
        user_id: match.id,
        name: match.name,
        specialty: match.specialty || undefined,
        compatibility_score: match.compatibility || undefined,
        status: match.status
      }))}
      groups={activeGroups.map(group => ({
        id: group.id,
        name: group.name,
        member_count: group.members,
        last_activity: group.lastMessageTime
      }))}
      stats={{
        total_matches: dashboardStats.totalMatches,
        active_conversations: dashboardStats.activeGroups,
        groups_joined: dashboardStats.activeGroups
      }}
    />
  )
}