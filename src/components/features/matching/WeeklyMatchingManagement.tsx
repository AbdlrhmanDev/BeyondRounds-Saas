'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar,
  Users,
  MessageSquare,
  Bell,
  Play,
  RefreshCw,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface WeeklyMatchingManagementProps {
  adminId: string
}

interface MatchingGroup {
  id: string
  name: string
  memberCount: number
  specialties: string[]
  created_at: string
  status: string
  members: Array<{
    id: string
    first_name: string
    last_name: string
    medical_specialty: string
    city: string
    is_verified: boolean
    compatibility_score: number
  }>
}

interface WeeklyStats {
  totalGroups: number
  totalUsers: number
  averageCompatibility: number
  verifiedUsers: number
  thisWeekGroups: number
  lastWeekGroups: number
}

export default function WeeklyMatchingManagement({ adminId }: WeeklyMatchingManagementProps) {
  const [currentWeekGroups, setCurrentWeekGroups] = useState<MatchingGroup[]>([])
  const [lastWeekGroups, setLastWeekGroups] = useState<MatchingGroup[]>([])
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [runningMatching, setRunningMatching] = useState(false)
  const [activeTab, setActiveTab] = useState('current')

  useEffect(() => {
    loadWeeklyMatchingData()
  }, [])

  const loadWeeklyMatchingData = async () => {
    try {
      setLoading(true)
      
      // Load current week data
      const currentWeekResponse = await fetch('/api/matching/weekly')
      const currentWeekData = await currentWeekResponse.json()
      
      if (currentWeekData.success) {
        setCurrentWeekGroups(currentWeekData.data || [])
      }

      // Load last week data
      const lastWeek = getLastWeek()
      const lastWeekResponse = await fetch(`/api/matching/weekly?week=${lastWeek.week}&year=${lastWeek.year}`)
      const lastWeekData = await lastWeekResponse.json()
      
      if (lastWeekData.success) {
        setLastWeekGroups(lastWeekData.data || [])
      }

      // Calculate stats
      const weeklyStats = calculateStats(currentWeekData.data || [], lastWeekData.data || [])
      setStats(weeklyStats)

    } catch (error) {
      console.error('Error loading weekly matching data:', error)
      toast.error('Failed to load weekly matching data')
    } finally {
      setLoading(false)
    }
  }

  const runWeeklyMatching = async () => {
    try {
      setRunningMatching(true)
      
      const response = await fetch('/api/matching/weekly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId,
          forceRun: true
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Weekly matching completed successfully!')
        loadWeeklyMatchingData() // Refresh data
      } else {
        toast.error(result.error || 'Failed to run weekly matching')
      }
    } catch (error) {
      console.error('Error running weekly matching:', error)
      toast.error('Failed to run weekly matching')
    } finally {
      setRunningMatching(false)
    }
  }

  const calculateStats = (currentGroups: MatchingGroup[], lastGroups: MatchingGroup[]): WeeklyStats => {
    const totalGroups = currentGroups.length + lastGroups.length
    const totalUsers = [...currentGroups, ...lastGroups].reduce((sum, group) => sum + group.memberCount, 0)
    const verifiedUsers = [...currentGroups, ...lastGroups].reduce((sum, group) => 
      sum + group.members.filter(m => m.is_verified).length, 0
    )
    
    const allCompatibilityScores = [...currentGroups, ...lastGroups].flatMap(group => 
      group.members.map(m => m.compatibility_score)
    )
    const averageCompatibility = allCompatibilityScores.length > 0 
      ? Math.round(allCompatibilityScores.reduce((sum, score) => sum + score, 0) / allCompatibilityScores.length)
      : 0

    return {
      totalGroups,
      totalUsers,
      averageCompatibility,
      verifiedUsers,
      thisWeekGroups: currentGroups.length,
      lastWeekGroups: lastGroups.length
    }
  }

  const getLastWeek = () => {
    const now = new Date()
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const start = new Date(lastWeek.getFullYear(), 0, 1)
    const days = Math.floor((lastWeek.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    const week = Math.ceil((days + start.getDay() + 1) / 7)
    return { week, year: lastWeek.getFullYear() }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCurrentWeek = () => {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 1)
    const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    return Math.ceil((days + start.getDay() + 1) / 7)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading weekly matching data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Weekly Matching Management</h2>
          <p className="text-gray-600">Manage automated weekly matching system</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={loadWeeklyMatchingData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button 
            onClick={runWeeklyMatching} 
            disabled={runningMatching}
            className="bg-green-600 hover:bg-green-700"
          >
            {runningMatching ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Matching
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Groups</p>
                  <p className="text-2xl font-bold">{stats.totalGroups}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Compatibility</p>
                  <p className="text-2xl font-bold">{stats.averageCompatibility}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Users</p>
                  <p className="text-2xl font-bold">{stats.verifiedUsers}</p>
                </div>
                <Bell className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weekly Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Weekly Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900">This Week (Week {getCurrentWeek()})</h3>
              <p className="text-2xl font-bold text-blue-600">{stats?.thisWeekGroups || 0}</p>
              <p className="text-sm text-blue-700">Groups Created</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">Last Week</h3>
              <p className="text-2xl font-bold text-gray-600">{stats?.lastWeekGroups || 0}</p>
              <p className="text-sm text-gray-700">Groups Created</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matching Groups */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="current">Current Week ({currentWeekGroups.length})</TabsTrigger>
          <TabsTrigger value="last">Last Week ({lastWeekGroups.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {currentWeekGroups.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups This Week</h3>
                <p className="text-gray-600 mb-4">Weekly matching hasn't been run yet this week.</p>
                <Button onClick={runWeeklyMatching} disabled={runningMatching}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Weekly Matching
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {currentWeekGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{group.name}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-2 text-gray-500" />
                        {group.memberCount} members
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-2 text-gray-500" />
                        Chat room created
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-2 text-gray-500" />
                        {formatDate(group.created_at)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Members:</h4>
                      {group.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between text-xs">
                          <span>
                            {member.first_name} {member.last_name} ({member.medical_specialty})
                          </span>
                          <div className="flex items-center space-x-1">
                            <span className="text-gray-500">{member.compatibility_score}%</span>
                            {member.is_verified && (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="last" className="space-y-4">
          {lastWeekGroups.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">No groups found for last week</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {lastWeekGroups.map((group) => (
                <Card key={group.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{group.name}</CardTitle>
                      <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-2 text-gray-500" />
                        {group.memberCount} members
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-2 text-gray-500" />
                        {formatDate(group.created_at)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Specialties:</h4>
                      <div className="flex flex-wrap gap-1">
                        {group.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}






