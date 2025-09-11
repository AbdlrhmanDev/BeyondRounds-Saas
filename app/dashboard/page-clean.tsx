"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"
import Link from "next/link"

// Custom hooks
import { useAuth } from "@/hooks/use-auth"
import { useDashboard } from "@/hooks/use-dashboard-enhanced"

// Components
import { LoadingSpinner, ErrorMessage, EmptyState, DashboardCardSkeleton } from "@/components/ui/common"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { WelcomeSection } from "@/components/dashboard/welcome-section"
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { MatchCard } from "@/components/dashboard/match-card"
import EnhancedMatchingDashboard from "@/components/enhanced-matching-dashboard"
import { DashboardErrorBoundary } from "@/components/common/error-boundary"

/**
 * Enhanced Dashboard Page with performance optimizations and better error handling
 */
export default function DashboardPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

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
    joinGroup,
    getInitials,
    getLastMessage,
    getLastMessageTime
  } = useDashboard(user?.id || null)

  // Memoized filtered matches to prevent unnecessary recalculations
  const filteredMatches = useMemo(() => {
    if (!searchTerm.trim()) return matches

    const searchLower = searchTerm.toLowerCase()
    return matches.filter(match =>
      match.group_name.toLowerCase().includes(searchLower) ||
      match.match_members.some(member =>
        member.profiles.specialty.toLowerCase().includes(searchLower) ||
        `${member.profiles.first_name || ''} ${member.profiles.last_name || ''}`.toLowerCase().includes(searchLower)
      )
    )
  }, [matches, searchTerm])

  // Memoized available groups count
  const availableGroupsCount = useMemo(() => 
    availableGroups.filter(g => g.can_join).length,
    [availableGroups]
  )

  // Memoized active matches count
  const activeMatchesCount = useMemo(() => 
    matches.filter(m => m.status === 'active').length,
    [matches]
  )

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // Handle join group with error handling
  const handleJoinGroup = useCallback(async (groupId: string) => {
    try {
      await joinGroup(groupId)
    } catch (error) {
      console.error("Error joining group:", error)
    }
  }, [joinGroup])

  // Handle search change with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
  }, [])

  // Handle tab change
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

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
          icon={<Filter className="w-8 h-8 text-gray-400" />}
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
    <DashboardErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        {/* Header */}
        <DashboardHeader
          profile={profile}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          notifications={[]} // TODO: Implement notifications
          onSignOut={signOut}
        />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Welcome Section */}
          <WelcomeSection profile={profile} stats={stats} />

          {/* Stats Grid */}
          <StatsGrid profile={profile} stats={stats} />

          {/* Tabbed Interface */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
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
                  {availableGroupsCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-blue-500 text-white">
                      {availableGroupsCount}
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
                    icon={<Filter className="w-8 h-8 text-gray-400" />}
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
                      getInitials={getInitials}
                      getLastMessage={getLastMessage}
                      getLastMessageTime={getLastMessageTime}
                      onViewDetails={(matchId: string) => console.log('View details for:', matchId)}
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
                    {activeMatchesCount} Active
                  </Badge>
                </div>
                {matches.length === 0 ? (
                  <EmptyState
                    icon={<Filter className="w-8 h-8 text-gray-400" />}
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
                        getInitials={getInitials}
                        getLastMessage={getLastMessage}
                        getLastMessageTime={getLastMessageTime}
                        onViewDetails={(matchId: string) => console.log('View details for:', matchId)}
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
                    {availableGroupsCount} Available to Join
                  </Badge>
                </div>
                {availableGroups.length === 0 ? (
                  <EmptyState
                    icon={<Filter className="w-8 h-8 text-gray-400" />}
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
                      <p className="text-sm text-gray-600">You sent a message in Surgery group</p>
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
                <EmptyState
                  icon={<Filter className="w-8 h-8 text-gray-400" />}
                  title="No Notifications"
                  description="You're all caught up! New notifications will appear here."
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardErrorBoundary>
  )
}
