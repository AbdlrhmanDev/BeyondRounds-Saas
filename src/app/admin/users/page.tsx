'use client'
 
import { useState, useEffect } from 'react'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  Eye, 
  Mail,
  MapPin,
  Calendar,
  Shield,
  AlertCircle
} from 'lucide-react'
 
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
  verification_documents?: VerificationDocument[]
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
}
 
export default function UsersManagementPage() {
  const { user, profile } = useAuthUser()
  const router = useRouter()
  
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
 
  useEffect(() => {
    // Only load users if user is admin
    if (profile && user && user.role === 'admin') {
      loadUsers()
      
      // Auto-refresh users every 60 seconds
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing users...')
        loadUsers()
      }, 60000)
      
      return () => clearInterval(interval)
    }
  }, [profile])
 
  useEffect(() => {
    filterAndSortUsers()
  }, [users, searchTerm, filterRole, filterStatus, sortBy, sortOrder])
 
  const loadUsers = async () => {
    setIsLoading(true)
    try {
      console.log('🔄 Loading users for admin...')
      
      const response = await fetch('/api/admin/users')
      const result = await response.json()
 
      if (!result.success) {
        throw new Error(result.error || 'Failed to load users')
      }
      
      console.log(`📊 Loaded ${result.data?.length || 0} users`)
      setUsers(result.data || [])
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }
 
  const filterAndSortUsers = () => {
    let filtered = [...users]
 
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.medical_specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.city?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
 
    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole)
    }
 
    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'verified') {
        filtered = filtered.filter(user => user.is_verified)
      } else if (filterStatus === 'pending') {
        filtered = filtered.filter(user => !user.is_verified)
      } else if (filterStatus === 'banned') {
        filtered = filtered.filter(user => user.is_banned)
      }
    }
 
    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof UserProfile]
      let bValue = b[sortBy as keyof UserProfile]
 
      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0
      if (aValue === undefined) return 1
      if (bValue === undefined) return -1
 
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
 
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
 
    setFilteredUsers(filtered)
  }
 
  const handleVerifyUser = async (userId: string, verify: boolean) => {
    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'verify',
          value: verify
        })
      })
 
      const result = await response.json()
 
      if (!result.success) {
        throw new Error(result.error || 'Failed to verify user')
      }
 
      toast.success(result.message)
      loadUsers()
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
      loadUsers()
    } catch (error) {
      console.error('Failed to ban user:', error)
      toast.error('Failed to ban user')
    }
  }
 
  const exportUsers = async () => {
    try {
      const csvContent = [
        ['Email', 'Name', 'Specialty', 'City', 'Role', 'Verified', 'Banned', 'User Completion', 'Created'],
        ...filteredUsers.map((user: UserProfile) => [
          user.email,
          `${user.first_name} ${user.last_name}`,
          user.medical_specialty || '',
          user.city || '',
          user.role,
          user.is_verified ? 'Yes' : 'No',
          user.is_banned ? 'Yes' : 'No',
          `${user.profile_completion_percentage}%`,
          new Date(user.created_at).toLocaleDateString()
        ])
      ].map(row => row.join(',')).join('\n')
 
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
 
  const getUserStats = () => {
    const total = users.length
    const verified = users.filter(u => u.is_verified).length
    const banned = users.filter(u => u.is_banned).length
    const admins = users.filter(u => u.role === 'admin').length
    
    return { total, verified, banned, admins }
  }
 
  const stats = getUserStats()
 
  // Check if user is admin - AFTER all hooks
  if (!profile || !user || user.role !== 'admin') {
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
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
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
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600">
                  Manage all medical professionals on the platform
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={loadUsers}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={exportUsers}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                onClick={() => router.push('/admin/create-user')}
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Create User
              </Button>
            </div>
          </div>
        </div>
 
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>
 
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}% verified
              </p>
            </CardContent>
          </Card>
 
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Banned</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.banned}</div>
              <p className="text-xs text-muted-foreground">
                Suspended accounts
              </p>
            </CardContent>
          </Card>
 
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
              <p className="text-xs text-muted-foreground">
                Admin accounts
              </p>
            </CardContent>
          </Card>
        </div>
 
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
 
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
 
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-')
                setSortBy(field)
                setSortOrder(order as 'asc' | 'desc')
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="first_name-asc">Name A-Z</SelectItem>
                  <SelectItem value="first_name-desc">Name Z-A</SelectItem>
                  <SelectItem value="email-asc">Email A-Z</SelectItem>
                  <SelectItem value="email-desc">Email Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
 
        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              
                <Users className="h-5 w-5" />
                Users ({filteredUsers.length})
              
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            
                          </div>
                          <div>
                            <p className="font-medium">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-gray-500">ID: {user.user_id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.medical_specialty || 'Not specified'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {user.city || 'Not specified'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
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
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${user.profile_completion_percentage}%` }}
                            ></div>
                          </div>
                          {user.profile_completion_percentage}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {user.verification_documents && user.verification_documents.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {user.verification_documents.map((doc) => (
                                <div key={doc.id} className="flex items-center gap-2">
                                  <Badge variant={
                                    doc.status === 'approved' ? 'default' :
                                    doc.status === 'rejected' ? 'destructive' : 'secondary'
                                  }>
                                    {doc.status}
                                  </Badge>
                                  <div className="flex gap-1">
                                    {doc.id_document_url && (
                                      <Button size="sm" variant="outline" className="h-6 px-2">
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    )}
                                    {doc.selfie_url && (
                                      <Button size="sm" variant="outline" className="h-6 px-2">
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    )}
                                    {doc.license_url && (
                                      <Button size="sm" variant="outline" className="h-6 px-2">
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <Badge variant="outline">No documents</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyUser(user.user_id, !user.is_verified)}
                            title={user.is_verified ? 'Unverify user' : 'Verify user'}
                          >
                            {user.is_verified ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBanUser(user.user_id, !user.is_banned)}
                            title={user.is_banned ? 'Unban user' : 'Ban user'}
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
      </div>
    </div>
  )
}