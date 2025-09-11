"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Heart, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  Star,
  Filter,
  Calendar,
  MapPin,
  Stethoscope
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import EnhancedMatchingDashboard from "@/components/enhanced-matching-dashboard"

// Custom hooks
import { useAuth } from "@/hooks/use-auth"
import { useDashboard } from "@/hooks/use-dashboard"

// Components
import { LoadingSpinner, EmptyState } from "@/components/ui/common"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { WelcomeSection } from "@/components/dashboard/welcome-section"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { MatchCard } from "@/components/dashboard/match-card"

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  
  // Custom hooks
  const { user, profile, loading: authLoading, signOut, isProfileComplete } = useAuth()
  const {
    matches,
    availableGroups,
    notifications,
    isJoining,
    loading: dashboardLoading,
    joinGroup,
    markNotificationAsRead,
    getWeeklyStats,
    getLastMessage,
    getLastMessageTime,
    getInitials
  } = useDashboard(user?.id || null)

  const stats = getWeeklyStats()
  const isLoading = authLoading || dashboardLoading

  // Add profile completion notification
  useEffect(() => {
    if (profile && !isProfileComplete) {
      const profileNotification = {
        id: 999,
        type: "profile" as const,
        message: "Complete your profile to start receiving matches",
        time: "Now",
        unread: true
      }
      
      // This would be handled by the dashboard hook in a real implementation
      // For now, we'll keep it simple
    }
  }, [profile, isProfileComplete])

  const filteredMatches = matches.filter(match =>
    match.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.match_members.some(member =>
      member.profiles.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${member.profiles.first_name || ''} ${member.profiles.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 ml-4">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <DashboardHeader
        profile={profile}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        notifications={notifications}
        onSignOut={signOut}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <WelcomeSection profile={profile} stats={stats} />
        <StatsGrid profile={profile} stats={stats} />

        {/* Modern Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/60 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/80">Overview</TabsTrigger>
              <TabsTrigger value="groups" className="data-[state=active]:bg-white/80">My Groups</TabsTrigger>
              <TabsTrigger value="available" className="data-[state=active]:bg-white/80">
                Available Groups
                {availableGroups.filter(g => g.can_join).length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-500 text-white">
                    {availableGroups.filter(g => g.can_join).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-white/80">Activity</TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-white/80">Notifications</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                <Calendar className="w-3 h-3 mr-1" />
                Next matches: Thursday 4 PM
              </Badge>
              <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-sm hover:bg-white/80">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {matches.length === 0 ? (
              <div className="space-y-6">
                {/* Quick Status Card */}
                <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                  <CardContent className="text-center py-8">
                    <EmptyState
                      icon={
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-white" />
                        </div>
                      }
                      title="Ready to Connect?"
                      description={
                        !profile?.is_verified
                          ? "Complete your verification to start getting matched with fellow medical professionals."
                          : !profile?.is_paid
                            ? "Subscribe to start receiving weekly matches with doctors in your specialty."
                            : "You're all set! Your first matches will arrive on Thursday at 4 PM."
                      }
                      action={
                        !profile?.is_verified ? (
                          <Link href="/verify">
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete Verification
                            </Button>
                          </Link>
                        ) : !profile?.is_paid ? (
                          <Link href="/pricing">
                            <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                              <Star className="w-4 h-4 mr-2" />
                              View Subscription Plans
                            </Button>
                          </Link>
                        ) : (
                          <Button disabled className="bg-gradient-to-r from-gray-400 to-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            Waiting for Thursday
                          </Button>
                        )
                      }
                    />
                  </CardContent>
                </Card>
                
                {/* Enhanced Matching Dashboard */}
                <EnhancedMatchingDashboard />
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    getInitials={getInitials}
                    getLastMessage={getLastMessage}
                    getLastMessageTime={getLastMessageTime}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">My Groups ({matches.length})</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {matches.filter(m => m.status === 'active').length} Active
                  </Badge>
                </div>
                {matches.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">No Groups Yet</h4>
                    <p className="text-gray-500 mb-4">You haven't joined any groups yet. Check out available groups to join!</p>
                    <Button onClick={() => setActiveTab("available")} className="bg-blue-600 hover:bg-blue-700">
                      Browse Available Groups
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {matches.map((match) => (
                      <div key={match.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{match.group_name}</h4>
                            <Badge variant={match.status === "active" ? "default" : "secondary"}>
                              {match.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {match.match_members.length} members
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {[...new Set(match.match_members.map(m => m.profiles.city))].join(", ")}
                            </span>
                            <span className="flex items-center gap-1">
                              <Stethoscope className="w-4 h-4" />
                              {[...new Set(match.match_members.map(m => m.profiles.specialty))].slice(0, 2).join(", ")}
                              {[...new Set(match.match_members.map(m => m.profiles.specialty))].length > 2 && " +more"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href={`/chat/${match.id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Chat
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Available Groups</h3>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {availableGroups.filter(g => g.can_join).length} Available to Join
                  </Badge>
                </div>
                {availableGroups.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-600 mb-2">No Available Groups</h4>
                    <p className="text-gray-500">All existing groups are currently full or you're already a member of all groups.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {availableGroups.map((group) => (
                      <div key={group.id} className="border rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-lg">{group.group_name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {formatDistanceToNow(new Date(group.created_at), { addSuffix: true })}
                              </Badge>
                              {!group.can_join && (
                                <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                                  Full
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{group.member_count}/4 members</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{group.cities.join(", ") || "Various cities"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Stethoscope className="w-4 h-4" />
                                <span>{group.specialties.slice(0, 2).join(", ")}{group.specialties.length > 2 && " +more"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={(group.member_count / 4) * 100} className="flex-1 h-2" />
                              <span className="text-xs text-gray-500">{4 - group.member_count} spots left</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {group.can_join ? (
                              <Button 
                                onClick={() => joinGroup(group.id)}
                                disabled={isJoining === group.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {isJoining === group.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                                    Joining...
                                  </>
                                ) : (
                                  <>
                                    <Users className="w-4 h-4 mr-2" />
                                    Join Group
                                  </>
                                )}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
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
                  <div className="flex items-start gap-4 p-4 bg-purple-50/50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    <div>
                      <p className="font-medium">Profile updated</p>
                      <p className="text-sm text-gray-600">You updated your specialty information</p>
                      <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
