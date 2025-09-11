"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"
import Link from "next/link"

// Custom hooks
import { useAuth } from "@/hooks/use-auth"
import { useDashboard } from "@/hooks/use-dashboard"

// Components
import { LoadingSpinner, ErrorMessage, EmptyState } from "@/components/ui/common"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { WelcomeSection } from "@/components/dashboard/welcome-section"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { MatchCard } from "@/components/dashboard/match-card"
import EnhancedMatchingDashboard from "@/components/enhanced-matching-dashboard"

export default function DashboardPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [notifications, setNotifications] = useState([
    { id: 1, type: "match", message: "New match available in Cardiology group", time: "2 hours ago", unread: true },
    { id: 2, type: "message", message: "Dr. Smith sent a message in Surgery group", time: "4 hours ago", unread: true },
    { id: 3, type: "system", message: "Weekly matching completed successfully", time: "1 day ago", unread: false }
  ])

  // Custom hooks
  const { user, loading: authLoading, error: authError, signOut } = useAuth()
  const { 
    profile, 
    matches, 
    availableGroups, 
    stats, 
    isLoading: dashboardLoading, 
    error: dashboardError, 
    refreshData, 
    joinGroup 
  } = useDashboard(user?.id || null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // Add profile completion notification
  useEffect(() => {
    if (profile && profile.profile_completion_percentage && profile.profile_completion_percentage < 80) {
      const profileNotification = {
        id: 999,
        type: "profile" as const,
        message: "Complete your profile to start receiving matches",
        time: "Now",
        unread: true
      }
      
      setNotifications(prev => {
        const hasProfileNotification = prev.some(n => n.id === 999)
        if (!hasProfileNotification) {
          return [profileNotification, ...prev]
        }
        return prev
      })
    } else if (profile && profile.profile_completion_percentage && profile.profile_completion_percentage >= 80) {
      setNotifications(prev => prev.filter(n => n.id !== 999))
    }
  }, [profile])

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ))
  }

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup(groupId)
      setNotifications(prev => [{
        id: Date.now(),
        type: "match",
        message: "Successfully joined group! Start chatting with your new colleagues.",
        time: "Just now",
        unread: true
      }, ...prev])
    } catch (error) {
      console.error("Error joining group:", error)
    }
  }

  const filteredMatches = matches.filter(match =>
    match.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.match_members.some(member =>
      member.profiles.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${member.profiles.first_name || ''} ${member.profiles.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  // Loading state
  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (authError || dashboardError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <ErrorMessage
          title="Failed to load dashboard"
          message={authError || dashboardError || "An unexpected error occurred"}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  // No profile state
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <EmptyState
          icon={Filter}
          title="Profile Not Found"
          description="We couldn't load your profile data. Please try again or contact support."
          action={
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <DashboardHeader
        profile={profile}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        notifications={notifications}
        onSignOut={signOut}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <WelcomeSection firstName={profile.first_name} stats={stats} />

        {/* Stats Grid */}
        <StatsGrid profile={profile} stats={stats} />

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/60 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/80">
                Overview
              </TabsTrigger>
              <TabsTrigger value="groups" className="data-[state=active]:bg-white/80">
                My Groups
              </TabsTrigger>
              <TabsTrigger value="available" className="data-[state=active]:bg-white/80">
                Available Groups
                {availableGroups.filter(g => g.can_join).length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-500 text-white">
                    {availableGroups.filter(g => g.can_join).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-white/80">
                Activity
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-white/80">
                Notifications
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-sm hover:bg-white/80">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {matches.length === 0 ? (
              <div className="space-y-6">
                <EmptyState
                  icon={Filter}
                  title="Ready to Connect?"
                  description={
                    !profile.is_verified
                      ? "Complete your verification to start getting matched with fellow medical professionals."
                      : !profile.is_paid
                        ? "Subscribe to start receiving weekly matches with doctors in your specialty."
                        : "You're all set! Your first matches will arrive on Thursday at 4 PM."
                  }
                  action={
                    !profile.is_verified ? (
                      <Link href="/verify">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                          Complete Verification
                        </Button>
                      </Link>
                    ) : !profile.is_paid ? (
                      <Link href="/pricing">
                        <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                          View Subscription Plans
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="bg-gradient-to-r from-gray-400 to-gray-500">
                        Waiting for Thursday
                      </Button>
                    )
                  }
                />
                
                <EnhancedMatchingDashboard />
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match}
                    onViewDetails={(matchId) => console.log('View details for:', matchId)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <div className="bg-white/60 backdrop-blur-sm border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">My Groups ({matches.length})</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {matches.filter(m => m.status === 'active').length} Active
                </Badge>
              </div>
              {matches.length === 0 ? (
                <EmptyState
                  icon={Filter}
                  title="No Groups Yet"
                  description="You haven't joined any groups yet. Check out available groups to join!"
                  action={
                    <Button onClick={() => setActiveTab("available")} className="bg-blue-600 hover:bg-blue-700">
                      Browse Available Groups
                    </Button>
                  }
                />
              ) : (
                <div className="grid gap-4">
                  {matches.map((match) => (
                    <MatchCard 
                      key={match.id} 
                      match={match}
                      onViewDetails={(matchId) => console.log('View details for:', matchId)}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Available Groups Tab */}
          <TabsContent value="available" className="space-y-4">
            <div className="bg-white/60 backdrop-blur-sm border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Available Groups</h3>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {availableGroups.filter(g => g.can_join).length} Available to Join
                </Badge>
              </div>
              {availableGroups.length === 0 ? (
                <EmptyState
                  icon={Filter}
                  title="No Available Groups"
                  description="All existing groups are currently full or you're already a member of all groups."
                />
              ) : (
                <div className="grid gap-4">
                  {availableGroups.map((group) => (
                    <div key={group.id} className="border rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-lg">{group.group_name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {new Date(group.created_at).toLocaleDateString()}
                            </Badge>
                            {!group.can_join && (
                              <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                                Full
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{group.member_count}/4 members</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{group.cities.join(", ") || "Various cities"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>{group.specialties.slice(0, 2).join(", ")}{group.specialties.length > 2 && " +more"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          {group.can_join ? (
                            <Button 
                              onClick={() => handleJoinGroup(group.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Join Group
                            </Button>
                          ) : (
                            <Button disabled variant="secondary">
                              Group Full
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <div className="bg-white/60 backdrop-blur-sm border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">New match created</p>
                    <p className="text-sm text-gray-600">You were matched with 3 other doctors in Cardiology</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-green-50/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="font-medium">Message sent</p>
                    <p className="text-sm text-gray-600">You sent a message in Surgery Specialists group</p>
                    <p className="text-xs text-gray-500 mt-1">4 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="bg-white/60 backdrop-blur-sm border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                      notification.unread ? 'bg-blue-50/50 border-l-4 border-blue-500' : 'bg-gray-50/30'
                    }`}
                    onClick={() => {
                      markNotificationAsRead(notification.id)
                      if (notification.type === 'profile') {
                        router.push('/settings')
                      }
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'match' ? 'bg-green-500' :
                      notification.type === 'message' ? 'bg-blue-500' :
                      notification.type === 'profile' ? 'bg-orange-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                    {notification.unread && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
