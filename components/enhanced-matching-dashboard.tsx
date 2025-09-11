"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Activity,
  Zap,
  BarChart3,
  PlayCircle,
  Database,
  Timer,
  Target,
  RefreshCw
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { formatDistanceToNow, format, nextThursday } from "date-fns"

interface MatchingStats {
  total_users: number
  verified_users: number
  paid_users: number
  eligible_users: number
  cities_with_min_users: number
  matching_ready: boolean
  last_updated: string
}

interface SystemReadiness {
  system_ready: boolean
  summary: {
    total_users: number
    verified_users: number
    paid_users: number
    eligible_users: number
    cities_with_min_users: number
    recently_matched_users: number
  }
  requirements: {
    minimum_users: {
      required: number
      current: number
      met: boolean
      percentage: number
    }
    minimum_cities: {
      required: number
      current: number
      met: boolean
      percentage: number
    }
  }
  issues: Array<{
    type: string
    message: string
    current: number
    required: number
    priority: string
  }>
  recommendations: Array<{
    type: string
    message: string
    action: string
  }>
  city_breakdown: Record<string, {
    total_users: number
    eligible_users: number
    meets_minimum: boolean
  }>
}

interface ReadinessMessage {
  message_type: string
  message: string
  priority: string
  action_needed: string
}

interface MatchingHistory {
  week: string
  groups_created: number
  eligible_users: number
  valid_pairs: number
  rollover_users: number
  execution_time_ms: number
  reason: string
  created_at: string
}

interface UserProfile {
  id: string
  role: string
  is_verified: boolean
  is_paid: boolean
  onboarding_completed: boolean
}

export default function EnhancedMatchingDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<MatchingStats | null>(null)
  const [systemReadiness, setSystemReadiness] = useState<SystemReadiness | null>(null)
  const [readinessMessages, setReadinessMessages] = useState<ReadinessMessage[]>([])
  const [history, setHistory] = useState<MatchingHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTestingMatching, setIsTestingMatching] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [cronStatus, setCronStatus] = useState<any>(null)
  const [eligibleCount, setEligibleCount] = useState<number>(0)
  
  const supabase = createClient()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Get current user profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, role, is_verified, is_paid, onboarding_completed')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
      
      // Get matching statistics
      const { data: statsData } = await supabase
        .rpc('get_matching_statistics')
      
      setStats(statsData)
      
      // Get system readiness
      const { data: readinessData } = await supabase
        .rpc('get_system_readiness')
      
      setSystemReadiness(readinessData)
      
      // Get readiness messages
      const { data: messagesData } = await supabase
        .rpc('get_readiness_messages')
      
      setReadinessMessages(messagesData || [])
      
      // Get matching history
      const { data: historyData } = await supabase
        .rpc('get_matching_history', { limit_count: 5 })
      
      setHistory(historyData || [])
      
      // Get eligible users count (fallback if system readiness doesn't work)
      const { data: eligibleData } = await supabase
        .rpc('get_eligible_users_count')
      
      setEligibleCount(systemReadiness?.summary?.eligible_users || eligibleData || 0)
      
      // Get cron job status (if admin)
      if (profileData?.role === 'admin') {
        const { data: cronData } = await supabase
          .rpc('get_cron_job_status')
        
        setCronStatus(cronData?.[0] || null)
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const testMatching = async () => {
    if (profile?.role !== 'admin') return
    
    try {
      setIsTestingMatching(true)
      setTestResult(null)
      
      const { data } = await supabase
        .rpc('trigger_manual_matching')
      
      setTestResult(data)
      
      // Refresh data after test
      await fetchData()
      
    } catch (error) {
      console.error('Error testing matching:', error)
      setTestResult({ success: false, error: error.message })
    } finally {
      setIsTestingMatching(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const nextMatchingDate = nextThursday(new Date())
  const timeUntilMatching = formatDistanceToNow(nextMatchingDate, { addSuffix: true })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Matching Dashboard</h1>
          <p className="text-gray-600">BeyondRounds Weekly Doctor Matching System</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {profile?.role === 'admin' && (
            <Button 
              onClick={testMatching} 
              disabled={isTestingMatching}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isTestingMatching ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Test Matching
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Next Matching Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Next Matching</h3>
                <p className="text-gray-600">
                  {format(nextMatchingDate, 'EEEE, MMMM do')} at 4:00 PM
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  {timeUntilMatching}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <Clock className="w-4 h-4 mr-1" />
              Scheduled
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.verified_users || 0} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eligibleCount}</div>
            <p className="text-xs text-muted-foreground">
              Ready for matching
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities Active</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.cities_with_min_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              With 3+ users each
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.matching_ready ? (
                <span className="text-green-600">Ready</span>
              ) : (
                <span className="text-orange-600">Pending</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.matching_ready ? 'Can create matches' : 'Need more users'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Result */}
      {testResult && (
        <Card className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardHeader>
            <CardTitle className={`flex items-center ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              Test Matching Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResult.success ? (
              <div className="space-y-2">
                <p className="text-green-700">{testResult.message}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Eligible Users:</span> {testResult.eligible_users}
                  </div>
                  <div>
                    <span className="font-medium">Valid Pairs:</span> {testResult.valid_pairs}
                  </div>
                  <div>
                    <span className="font-medium">Groups Created:</span> {testResult.groups_created}
                  </div>
                  <div>
                    <span className="font-medium">Execution Time:</span> {testResult.execution_time_ms}ms
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-red-700">{testResult.error}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Matching History</TabsTrigger>
          {profile?.role === 'admin' && (
            <TabsTrigger value="admin">Admin Controls</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* User Readiness */}
          <Card>
            <CardHeader>
              <CardTitle>User Readiness</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Verified Users</span>
                  <span>{stats?.verified_users || 0}/{stats?.total_users || 0}</span>
                </div>
                <Progress value={stats?.total_users ? (stats.verified_users / stats.total_users) * 100 : 0} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Paid Users</span>
                  <span>{stats?.paid_users || 0}/{stats?.verified_users || 0}</span>
                </div>
                <Progress value={stats?.verified_users ? (stats.paid_users / stats.verified_users) * 100 : 0} />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Eligible for Matching</span>
                  <span>{eligibleCount}/{stats?.paid_users || 0}</span>
                </div>
                <Progress value={stats?.paid_users ? (eligibleCount / stats.paid_users) * 100 : 0} />
              </div>
            </CardContent>
          </Card>

          {/* System Readiness Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Readiness</CardTitle>
            </CardHeader>
            <CardContent>
              {systemReadiness?.system_ready ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">System ready for matching</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{systemReadiness.summary.eligible_users} eligible users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{systemReadiness.summary.cities_with_min_users} cities ready</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-orange-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">System not ready for matching</span>
                  </div>
                  
                  {/* Requirements Progress */}
                  {systemReadiness && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Eligible Users</span>
                          <span>{systemReadiness.requirements.minimum_users.current}/{systemReadiness.requirements.minimum_users.required}</span>
                        </div>
                        <Progress value={systemReadiness.requirements.minimum_users.percentage} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Cities Ready</span>
                          <span>{systemReadiness.requirements.minimum_cities.current}/{systemReadiness.requirements.minimum_cities.required}</span>
                        </div>
                        <Progress value={systemReadiness.requirements.minimum_cities.percentage} className="h-2" />
                      </div>
                    </div>
                  )}
                  
                  {/* Issues and Recommendations */}
                  {readinessMessages.length > 0 && (
                    <div className="space-y-2">
                      {readinessMessages
                        .filter(msg => msg.message_type === 'issue')
                        .map((message, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{message.message}</span>
                          </div>
                        ))}
                      {readinessMessages
                        .filter(msg => msg.message_type === 'recommendation')
                        .map((message, index) => (
                          <div key={`rec-${index}`} className="flex items-start space-x-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-600">{message.message}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Matching History</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No matching history available</p>
              ) : (
                <div className="space-y-4">
                  {history.map((run, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Week of {format(new Date(run.week), 'MMM do, yyyy')}</p>
                          <p className="text-sm text-gray-600">{run.reason}</p>
                        </div>
                        <Badge variant={run.groups_created > 0 ? "default" : "secondary"}>
                          {run.groups_created > 0 ? "Success" : "No Matches"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Groups:</span> {run.groups_created}
                        </div>
                        <div>
                          <span className="text-gray-500">Eligible:</span> {run.eligible_users}
                        </div>
                        <div>
                          <span className="text-gray-500">Valid Pairs:</span> {run.valid_pairs || 0}
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span> {run.execution_time_ms || 0}ms
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {profile?.role === 'admin' && (
          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>CRON Job Status</CardTitle>
              </CardHeader>
              <CardContent>
                {cronStatus ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">CRON job is scheduled</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Schedule:</span> {cronStatus.schedule}
                      </div>
                      <div>
                        <span className="text-gray-500">Active:</span> {cronStatus.active ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="text-gray-500">Job Name:</span> {cronStatus.jobname}
                      </div>
                      <div>
                        <span className="text-gray-500">Database:</span> {cronStatus.database}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-orange-600">
                    <AlertCircle className="w-5 h-5" />
                    <span>CRON job not found or not accessible</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Testing & Debugging</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={testMatching} 
                    disabled={isTestingMatching}
                    className="justify-start"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    {isTestingMatching ? 'Testing...' : 'Test Matching Algorithm'}
                  </Button>
                  
                  <Button variant="outline" className="justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    View Database Logs
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Test Matching:</strong> Runs the complete 7-step matching algorithm manually</p>
                  <p><strong>Note:</strong> This will create actual matches in the database if users are available</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
