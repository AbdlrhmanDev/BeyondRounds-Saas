'use client'
 
import { useState, useEffect } from 'react'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { useRoleRedirect } from '@/hooks/shared/useRoleRedirect'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Shield, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  BarChart3,
  Settings,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  TrendingUp,
  Activity,
  FileText
} from 'lucide-react'
 
interface AdminStats {
  totalUsers: number
  verifiedUsers: number
  paidUsers: number
  activeMatches: number
  pendingVerifications: number
  totalRevenue: number
  monthlyRevenue: number
  userGrowth: number
}
 
interface UserProfile {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  medical_specialty: string
  city: string
  role: string
  is_verified: boolean
  is_banned: boolean
  onboarding_completed: boolean
  profile_completion_percentage: number
  created_at: string
  updated_at: string
}
 
interface VerificationDocument {
  id: string
  profile_id: string
  id_document_url?: string
  selfie_url?: string
  license_url?: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  submitted_at: string
  reviewed_at?: string
  reviewed_by?: string
  deleted_at?: string
  user?: UserProfile
}
 
export default function AdminPage() {
  const { profile, isLoading } = useAuthUser()
  const router = useRouter()
  const supabase = createClient()
  
  // Redirect regular users to dashboard
  useRoleRedirect({ 
    requireAdmin: true, 
    redirectTo: '/dashboard',
    enabled: true // Always enabled for security
  })
  
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    verifiedUsers: 0,
    paidUsers: 0,
    activeMatches: 0,
    pendingVerifications: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    userGrowth: 0
  })
  
  const [users, setUsers] = useState<UserProfile[]>([])
  const [verificationDocuments, setVerificationDocuments] = useState<VerificationDocument[]>([])
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingVerifications, setIsLoadingVerifications] = useState(false)
 
  // Check if user is admin - strict check
  const isAdmin = profile?.role === 'admin'
 
  // Redirect regular users to dashboard
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      console.log('Regular user attempting to access admin panel - redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [profile, router])
 
  useEffect(() => {
    if (isAdmin) {
      loadAllData()
      
      // Auto-refresh data every 30 seconds
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing admin data...')
        loadAllData()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [isAdmin])
 
  const loadAllData = async () => {
    await Promise.all([
      loadAdminStats(),
      loadUsers(),
      loadVerificationDocuments(),
      loadRecentUsers()
    ])
  }
 
  const loadAdminStats = async () => {
    setIsLoadingStats(true)
    try {
      console.log('🔄 Loading admin statistics...')
      
      const response = await fetch('/api/admin/stats')
      const result = await response.json()
 
      if (!result.success) {
        throw new Error(result.error || 'Failed to load statistics')
      }
 
      const newStats = result.data
      console.log('📊 Admin stats loaded:', newStats)
      setStats(newStats)
      
      // Show success message only if this is a manual refresh
      if (!isLoadingStats) {
        toast.success(`Data refreshed! Found ${newStats.totalUsers} total users`)
      }
    } catch (error) {
      console.error('Failed to load admin stats:', error)
      toast.error('Failed to load statistics')
    } finally {
      setIsLoadingStats(false)
    }
  }
 
  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const response = await fetch('/api/admin/users')
      const result = await response.json()
 
      if (!result.success) {
        throw new Error(result.error || 'Failed to load users')
      }
 
      setUsers(result.data || [])
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoadingUsers(false)
    }
  }
 
  const loadVerificationDocuments = async () => {
    setIsLoadingVerifications(true)
    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .select(`
          *,
          users!verification_documents_profile_id_fkey(*)
        `)
        .order('submitted_at', { ascending: false })
        .limit(20)
 
      if (error) throw error
      setVerificationDocuments(data || [])
    } catch (error) {
      console.error('Failed to load verification documents:', error)
      toast.error('Failed to load verification documents')
    } finally {
      setIsLoadingVerifications(false)
    }
  }
 
  const loadRecentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
 
      if (error) throw error
      setRecentUsers(data || [])
    } catch (error) {
      console.error('Failed to load recent users:', error)
    }
  }
 
  const handleVerifyUser = async (userId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'verify',
          value: status === 'approved'
        })
      })
 
      const result = await response.json()
 
      if (!result.success) {
        throw new Error(result.error || 'Failed to verify user')
      }
 
      toast.success(result.message)
      loadAllData() // Refresh data
    } catch (error) {
      console.error('Failed to verify user:', error)
      toast.error('Failed to verify user')
    }
  }
 
  const handleBanUser = async (userId: string, ban: boolean) => {
    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'ban',
          value: ban
        })
      })
 
      const result = await response.json()
 
      if (!result.success) {
        throw new Error(result.error || 'Failed to ban user')
      }
 
      toast.success(result.message)
      loadUsers() // Refresh users
    } catch (error) {
      console.error('Failed to ban user:', error)
      toast.error('Failed to ban user')
    }
  }
 
  const exportUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const result = await response.json()
 
      if (!result.success) {
        throw new Error(result.error || 'Failed to load users')
      }
 
      const data = result.data
 
      // Convert to CSV
      const csvContent = [
        ['Email', 'Name', 'Specialty', 'City', 'Verified', 'Banned', 'Created'],
        ...(data || []).map((user: UserProfile) => [
          user.email,
          `${user.first_name} ${user.last_name}`,
          user.medical_specialty || '',
          user.city || '',
          user.is_verified ? 'Yes' : 'No',
          user.is_banned ? 'Yes' : 'No',
          new Date(user.created_at).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n')
 
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
 
      toast.success('Users exported successfully')
    } catch (error) {
      console.error('Failed to export users:', error)
      toast.error('Failed to export users')
    }
  }
 
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }
 
  // Show loading if profile is loading or if regular user is being redirected
  if (!profile || (profile.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {profile?.role !== 'admin' ? 'Redirecting to dashboard...' : 'Loading admin panel...'}
          </p>
        </div>
      </div>
    )
  }
 
  if (!isAdmin) {
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
 
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-red-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">BeyondRounds Admin Panel</h1>
                  <p className="text-gray-600">
                    Manage medical professionals, verify accounts, and monitor platform activity
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push('/admin/users')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Manage Users
                </Button>
                <Button
                  onClick={() => router.push('/admin/analytics')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
                <Button
                  onClick={() => router.push('/admin/create-user')}
                  className="flex items-center gap-2"
                >
                  <UserCheck className="h-4 w-4" />
                  Create User
                </Button>
                <Button
                  variant="outline"
                  onClick={loadAllData}
                  disabled={isLoadingStats}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
                  {isLoadingStats ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
 
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    stats.totalUsers
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{stats.userGrowth} this month
                </p>
              </CardContent>
            </Card>
 
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    stats.verifiedUsers
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}% verified
                </p>
              </CardContent>
            </Card>
 
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    stats.activeMatches
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current groups
                </p>
              </CardContent>
            </Card>
 
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {isLoadingStats ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                  ) : (
                    stats.pendingVerifications
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>
          </div>
 
          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="verifications">Verifications</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
 
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/users')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      View, search, and manage all users
                    </p>
                    <Button variant="outline" className="w-full">
                      View All Users ({stats.totalUsers})
                    </Button>
                  </CardContent>
                </Card>
 
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/analytics')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Analytics & Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Detailed platform analytics and insights
                    </p>
                    <Button variant="outline" className="w-full">
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
 
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/admin/create-user')}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Create User
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Manually create new user accounts
                    </p>
                    <Button className="w-full">
                      Create New User
                    </Button>
                  </CardContent>
                </Card>
              </div>
 
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      
                        <Users className="h-5 w-5" />
                        Recent Users
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/admin/users')}
                      >
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentUsers.slice(0, 5).map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              
                            </div>
                            <div>
                              <p className="font-medium">{user.first_name} {user.last_name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={user.is_verified ? "default" : "secondary"}>
                              {user.is_verified ? "Verified" : "Pending"}
                            </Badge>
                            <Badge variant="outline">{user.medical_specialty}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
 
                {/* System Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        Database Connection
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        Authentication Service
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        Matching Algorithm
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Running
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        Pending Verifications
                        <Badge variant="default" className="bg-orange-100 text-orange-800">
                          <Clock className="h-3 w-3 mr-1" />
                          {stats.pendingVerifications}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
 
            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    
                      <Users className="h-5 w-5" />
                      User Management
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadUsers}
                        disabled={isLoadingUsers}
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportUsers}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Specialty</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                  
                                </div>
                                <div>
                                  <p className="font-medium">{user.first_name} {user.last_name}</p>
                                  <p className="text-sm text-gray-500">ID: {user.user_id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{user.medical_specialty || 'Not specified'}</Badge>
                            </TableCell>
                            <TableCell>{user.city || 'Not specified'}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Badge variant={user.is_verified ? "default" : "secondary"}>
                                  {user.is_verified ? "Verified" : "Pending"}
                                </Badge>
                                {user.is_banned && (
                                  <Badge variant="destructive">Banned</Badge>
                                )}
                                {user.role === 'admin' && (
                                  <Badge variant="outline">Admin</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleVerifyUser(user.user_id, user.is_verified ? 'rejected' : 'approved')}
                                >
                                  {user.is_verified ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBanUser(user.user_id, !user.is_banned)}
                                >
                                  {user.is_banned ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
 
            {/* Verifications Tab */}
            <TabsContent value="verifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    
                      <FileText className="h-5 w-5" />
                      Verification Requests
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadVerificationDocuments}
                      disabled={isLoadingVerifications}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoadingVerifications ? 'animate-spin' : ''}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Document Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {verificationDocuments.map((document) => (
                          <TableRow key={document.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  
                                    {document.user?.first_name?.[0]}{document.user?.last_name?.[0]}
                                  
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {document.user?.first_name} {document.user?.last_name}
                                  </p>
                                  <p className="text-sm text-gray-500">{document.user?.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Document</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                document.status === 'approved' ? 'default' :
                                document.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {document.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(document.submitted_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {document.status === 'pending' && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    onClick={() => handleVerifyUser(document.profile_id, 'approved')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleVerifyUser(document.profile_id, 'rejected')}
                                  >
                                    <UserX className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
 
            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      User Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        Total Users
                        {stats.totalUsers}
                      </div>
                      <div className="flex items-center justify-between">
                        New This Month
                        +{stats.userGrowth}
                      </div>
                      <div className="flex items-center justify-between">
                        Verification Rate
                        
                          {stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%
                        
                      </div>
                    </div>
                  </CardContent>
                </Card>
 
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Platform Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        Active Matches
                        {stats.activeMatches}
                      </div>
                      <div className="flex items-center justify-between">
                        Pending Reviews
                        {stats.pendingVerifications}
                      </div>
                      <div className="flex items-center justify-between">
                        Paid Users
                        {stats.paidUsers}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}