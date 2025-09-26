'use client'
 
import { useState, useEffect } from 'react'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import toast from 'react-hot-toast'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserCheck, 
  Clock, 
  MapPin, 
  Calendar,
  Activity,
  Shield,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react'
 
interface AnalyticsData {
  totalUsers: number
  verifiedUsers: number
  bannedUsers: number
  adminUsers: number
  activeMatches: number
  pendingVerifications: number
  userGrowth: {
    thisMonth: number
    lastMonth: number
    growthRate: number
  }
  specialtyDistribution: Array<{
    specialty: string
    count: number
    percentage: number
  }>
  cityDistribution: Array<{
    city: string
    count: number
    percentage: number
  }>
  recentActivity: Array<{
    type: string
    description: string
    timestamp: string
    user?: string
  }>
}
 
export default function AnalyticsPage() {
  const { profile } = useAuthUser()
  const supabase = createClient()
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
 
  useEffect(() => {
    // Only load analytics if user is admin
    if (profile && profile.role === 'admin') {
      loadAnalytics()
    }
  }, [timeRange, profile])
 
  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const days = parseInt(timeRange)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
 
      // Load basic stats
      const [
        { count: totalUsers },
        { count: verifiedUsers },
        { count: bannedUsers },
        { count: adminUsers },
        { count: activeMatches },
        { count: pendingVerifications }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('matches').select('*', { count: 'exact', head: true }).is('completion_date', null),
        supabase.from('verification_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])
 
      // Load user growth data
      const { count: thisMonthUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
 
      const lastMonthStart = new Date()
      lastMonthStart.setDate(lastMonthStart.getDate() - (days * 2))
      const { count: lastMonthUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', startDate.toISOString())
 
      const growthRate = lastMonthUsers && lastMonthUsers > 0 
        ? ((thisMonthUsers || 0) - lastMonthUsers) / lastMonthUsers * 100 
        : 0
 
      // Load specialty distribution
      const { data: specialtyData } = await supabase
        .from('profiles')
        .select('medical_specialty')
        .not('medical_specialty', 'is', null)
 
      const specialtyCounts = specialtyData?.reduce((acc, profile) => {
        const specialty = profile.medical_specialty || 'Not specified'
        acc[specialty] = (acc[specialty] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
 
      const specialtyDistribution = Object.entries(specialtyCounts)
        .map(([specialty, count]) => ({
          specialty,
          count,
          percentage: totalUsers ? (count / totalUsers) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
 
      // Load city distribution
      const { data: cityData } = await supabase
        .from('profiles')
        .select('city')
        .not('city', 'is', null)
 
      const cityCounts = cityData?.reduce((acc, profile) => {
        const city = profile.city || 'Not specified'
        acc[city] = (acc[city] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
 
      const cityDistribution = Object.entries(cityCounts)
        .map(([city, count]) => ({
          city,
          count,
          percentage: totalUsers ? (count / totalUsers) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
 
      // Load recent activity (simplified)
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
 
      const recentActivity = recentUsers?.map(user => ({
        type: 'user_registration',
        description: `New user registered: ${user.first_name} ${user.last_name}`,
        timestamp: user.created_at,
        user: `${user.first_name} ${user.last_name}`
      })) || []
 
      setAnalytics({
        totalUsers: totalUsers || 0,
        verifiedUsers: verifiedUsers || 0,
        bannedUsers: bannedUsers || 0,
        adminUsers: adminUsers || 0,
        activeMatches: activeMatches || 0,
        pendingVerifications: pendingVerifications || 0,
        userGrowth: {
          thisMonth: thisMonthUsers || 0,
          lastMonth: lastMonthUsers || 0,
          growthRate
        },
        specialtyDistribution,
        cityDistribution,
        recentActivity
      })
    } catch (error) {
      console.error('Failed to load analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }
 
  const exportAnalytics = async () => {
    if (!analytics) return
 
    try {
      const csvContent = [
        ['Metric', 'Value'],
        ['Total Users', analytics.totalUsers],
        ['Verified Users', analytics.verifiedUsers],
        ['Banned Users', analytics.bannedUsers],
        ['Admin Users', analytics.adminUsers],
        ['Active Matches', analytics.activeMatches],
        ['Pending Verifications', analytics.pendingVerifications],
        ['New Users This Month', analytics.userGrowth.thisMonth],
        ['Growth Rate', `${analytics.userGrowth.growthRate.toFixed(2)}%`],
        ['', ''],
        ['Top Specialties', ''],
        ...analytics.specialtyDistribution.map(s => [s.specialty, s.count]),
        ['', ''],
        ['Top Cities', ''],
        ...analytics.cityDistribution.map(c => [c.city, c.count])
      ].map(row => row.join(',')).join('\n')
 
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
 
      toast.success('Analytics exported successfully')
    } catch (error) {
      console.error('Failed to export analytics:', error)
      toast.error('Failed to export analytics')
    }
  }
 
  // Check if user is admin - AFTER all hooks
  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. You need admin privileges to view this page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
 
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }
 
  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load analytics data.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
 
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
                <p className="text-gray-600">
                  Comprehensive insights into platform usage and user behavior
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={loadAnalytics}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={exportAnalytics}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
 
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{analytics.userGrowth.thisMonth} this period
              </p>
            </CardContent>
          </Card>
 
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.verifiedUsers}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.totalUsers > 0 ? Math.round((analytics.verifiedUsers / analytics.totalUsers) * 100) : 0}% verified
              </p>
            </CardContent>
          </Card>
 
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{analytics.activeMatches}</div>
              <p className="text-xs text-muted-foreground">
                Current groups
              </p>
            </CardContent>
          </Card>
 
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${analytics.userGrowth.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.userGrowth.growthRate >= 0 ? '+' : ''}{analytics.userGrowth.growthRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                vs previous period
              </p>
            </CardContent>
          </Card>
        </div>
 
        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Specialty Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Medical Specialties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.specialtyDistribution.map((specialty, index) => (
                  <div key={specialty.specialty} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      {specialty.specialty}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${specialty.percentage}%` }}
                        ></div>
                      </div>
                      
                        {specialty.count} ({specialty.percentage.toFixed(1)}%)
                      
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
 
          {/* City Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.cityDistribution.map((city, index) => (
                  <div key={city.city} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      {city.city}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${city.percentage}%` }}
                        ></div>
                      </div>
                      
                        {city.count} ({city.percentage.toFixed(1)}%)
                      
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
 
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">{activity.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}