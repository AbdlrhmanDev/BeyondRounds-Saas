"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Heart,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Eye,
  UserCheck,
  CreditCard,
  MessageSquare,
  Calendar,
  Search,
  Bell,
  Plus,
  Edit,
  Trash2,
  Filter,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  specialty: string
  city: string
  gender: string
  gender_preference: string
  interests: string[]
  availability_slots: string[]
  is_verified: boolean
  is_paid: boolean
  role: string
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
}

interface VerificationDocument {
  id: string
  user_id: string
  document_url: string
  document_type: 'license' | 'certificate' | 'id'
  status: string
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  rejection_reason: string | null
  profiles: {
    first_name: string
    last_name: string
    email: string
    specialty: string
    city: string
  }
}

interface AdminStats {
  totalSignups: number
  verifiedUsers: number
  paidUsers: number
  activeMatches: number
  totalMessages: number
  verificationRate: number
  paymentRate: number
}

interface Match {
  id: string
  group_name: string
  status: string
  match_week: string
  match_members: Array<{
    user_id: string
    profiles: {
      first_name: string
      last_name: string
      specialty: string
      email: string
    }
  }>
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [verifications, setVerifications] = useState<VerificationDocument[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingVerifications, setLoadingVerifications] = useState(true)
  const [loadingMatches, setLoadingMatches] = useState(true)
  const [selectedVerification, setSelectedVerification] = useState<VerificationDocument | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // User management state
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null)
  const [userSearchTerm, setUserSearchTerm] = useState("")
  const [userStatusFilter, setUserStatusFilter] = useState("all")
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Verified users and verification documents
  const [verifiedUsers, setVerifiedUsers] = useState<(UserProfile & { verification_documents?: VerificationDocument[] })[]>([])
  const [loadingVerifiedUsers, setLoadingVerifiedUsers] = useState(true)
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<{url: string, type: string, user: string} | null>(null)
  const [verifiedSearchTerm, setVerifiedSearchTerm] = useState("")
  const [selectedVerifiedUser, setSelectedVerifiedUser] = useState<UserProfile | null>(null)
  const [showVerifiedUserModal, setShowVerifiedUserModal] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push("/auth/login")
          return
        }
        setUser(user)

        // Check role via Supabase RPC (client-safe)
        const { data: role, error: roleError } = await supabase.rpc('get_user_role', { uid: user.id })
        if (roleError || role !== 'admin') {
          router.push("/dashboard")
          return
        }
        setIsAdmin(true)
        setIsLoading(false)

        // Load admin data in background (non-blocking)
        loadAdminData()
      } catch (error) {
        console.error("Error checking admin access:", error)
        router.push("/dashboard")
      }
    }

    checkAdminAccess()
  }, [router, supabase])

  // Load admin data in background (non-blocking)
  const loadAdminData = async () => {
    try {
      // Load all data in parallel for better performance
      await Promise.all([
        loadVerifications(),
        loadMatches(),
        loadStats(),
        loadUsers(),
        loadVerifiedUsers()
      ])
    } catch (error) {
      console.error("Error loading admin data:", error)
    }
  }

  // User CRUD operations
  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error loading users:", error)
    }
    setLoadingUsers(false)
  }

  // Load verified users with their verification documents
  const loadVerifiedUsers = async () => {
    setLoadingVerifiedUsers(true)
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          verification_documents (
            id,
            document_url,
            document_type,
            status,
            submitted_at,
            reviewed_at,
            rejection_reason
          )
        `)
        .eq("is_verified", true)
        .order("created_at", { ascending: false })
        .limit(100)

      if (error) {
        console.error("Error loading verified users:", error)
        // Fallback: use verified users from main users list
        const verifiedFromUsers = users.filter(u => u.is_verified)
        setVerifiedUsers(verifiedFromUsers)
      } else {
        setVerifiedUsers(data || [])
      }
      console.log("Loaded verified users:", data?.length || 0)
    } catch (error) {
      console.error("Error loading verified users:", error)
      // Fallback: use verified users from main users list
      const verifiedFromUsers = users.filter(u => u.is_verified)
      setVerifiedUsers(verifiedFromUsers)
    }
    setLoadingVerifiedUsers(false)
  }

  const revokeVerification = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_verified: false,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)

      if (error) throw error
      
      await Promise.all([loadUsers(), loadVerifiedUsers()])
      alert("Verification revoked successfully!")
    } catch (error: any) {
      console.error("Error revoking verification:", error)
      alert("Failed to revoke verification: " + error.message)
    }
  }

  const updateVerifiedUser = async (userId: string, userData: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)

      if (error) throw error
      
      await Promise.all([loadUsers(), loadVerifiedUsers()])
      setShowVerifiedUserModal(false)
      setSelectedVerifiedUser(null)
      alert("Verified user updated successfully!")
    } catch (error: any) {
      console.error("Error updating verified user:", error)
      alert("Failed to update verified user: " + error.message)
    }
  }

  const createUser = async (userData: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert([{
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      
      await loadUsers() // Reload users
      setShowUserModal(false)
      setSelectedUser(null)
      alert("User created successfully!")
    } catch (error: any) {
      console.error("Error creating user:", error)
      alert("Failed to create user: " + error.message)
    }
  }

  const updateUser = async (userId: string, userData: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId)

      if (error) throw error
      
      await loadUsers() // Reload users
      setShowUserModal(false)
      setSelectedUser(null)
      alert("User updated successfully!")
    } catch (error: any) {
      console.error("Error updating user:", error)
      alert("Failed to update user: " + error.message)
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId)

      if (error) throw error
      
      await loadUsers() // Reload users
      setShowDeleteConfirm(false)
      setUserToDelete(null)
      alert("User deleted successfully!")
    } catch (error: any) {
      console.error("Error deleting user:", error)
      alert("Failed to delete user: " + error.message)
    }
  }

  const loadVerifications = async () => {
    setLoadingVerifications(true)
    const { data, error } = await supabase
      .from("verification_documents")
      .select(`
        *,
        profiles(first_name, last_name, email, specialty, city)
      `)
      .order("submitted_at", { ascending: false })
      .limit(50) // Limit to recent 50 verifications for faster loading

    if (error) {
      console.error("Error loading verifications:", error)
    } else {
      setVerifications(data || [])
    }
    setLoadingVerifications(false)
  }

  const loadMatches = async () => {
    setLoadingMatches(true)
    const { data, error } = await supabase
      .from("matches")
      .select(`
        id,
        group_name,
        status,
        match_week,
        match_members(
          user_id,
          profiles(first_name, last_name, specialty, email)
        )
      `)
      .order("match_week", { ascending: false })
      .limit(20) // Reduce to 20 recent matches for faster loading

    if (error) {
      console.error("Error loading matches:", error)
    } else {
      setMatches(data || [])
    }
    setLoadingMatches(false)
  }

  const loadStats = async () => {
    setLoadingStats(true)
    try {
      // Load all stats in parallel for better performance
      const [
        { count: totalSignups },
        { count: verifiedUsers },
        { count: paidUsers },
        { count: activeMatches },
        { count: totalMessages }
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_verified", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_paid", true),
        supabase.from("matches").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("chat_messages").select("*", { count: "exact", head: true })
      ])

      setStats({
        totalSignups: totalSignups || 0,
        verifiedUsers: verifiedUsers || 0,
        paidUsers: paidUsers || 0,
        activeMatches: activeMatches || 0,
        totalMessages: totalMessages || 0,
        verificationRate: totalSignups ? ((verifiedUsers || 0) / totalSignups) * 100 : 0,
        paymentRate: totalSignups ? ((paidUsers || 0) / totalSignups) * 100 : 0,
      })
    } catch (error) {
      console.error("Error loading stats:", error)
    }
    setLoadingStats(false)
  }

  const handleVerificationReview = async (verificationId: string, status: "approved" | "rejected") => {
    try {
      // Update verification status
      const { error: verificationError } = await supabase
        .from("verification_documents")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          admin_notes: reviewNotes || null,
        })
        .eq("id", verificationId)

      if (verificationError) throw verificationError

      // If approved, update user profile
      if (status === "approved") {
        const verification = verifications.find((v) => v.id === verificationId)
        if (verification) {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ is_verified: true })
            .eq("id", verification.user_id)

          if (profileError) throw profileError
        }
      }

      // Reload verifications
      await loadVerifications()
      setSelectedVerification(null)
      setReviewNotes("")

      alert(`Verification ${status} successfully`)
    } catch (error: any) {
      console.error("Error reviewing verification:", error)
      alert("Failed to update verification status")
    }
  }

  const filteredVerifications = verifications.filter((v) => {
    const matchesSearch =
      searchTerm === "" ||
      v.profiles.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.profiles.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || v.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      userSearchTerm === "" ||
      user.first_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.specialty?.toLowerCase().includes(userSearchTerm.toLowerCase())

    const matchesStatus = 
      userStatusFilter === "all" ||
      (userStatusFilter === "verified" && user.is_verified) ||
      (userStatusFilter === "unverified" && !user.is_verified) ||
      (userStatusFilter === "paid" && user.is_paid) ||
      (userStatusFilter === "admin" && user.role === "admin")

    return matchesSearch && matchesStatus
  })

  const filteredVerifiedUsers = verifiedUsers.filter((user) => {
    const matchesSearch =
      verifiedSearchTerm === "" ||
      user.first_name?.toLowerCase().includes(verifiedSearchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(verifiedSearchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(verifiedSearchTerm.toLowerCase()) ||
      user.specialty?.toLowerCase().includes(verifiedSearchTerm.toLowerCase())

    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Modern Header with enhanced styling */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-blue-500/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">BeyondRounds</span>
                <p className="text-sm text-violet-600 font-medium">Admin Dashboard</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              {/* Enhanced Search Bar */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search verifications, users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 w-64 bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/80 focus:border-violet-300 transition-all duration-200"
                />
              </div>
              
              {/* Enhanced Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative hover:bg-white/50 transition-all duration-200">
                  <Bell className="w-4 h-4" />
                  {verifications.filter((v) => v.status === "pending").length > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-red-500/25" />
                  )}
                </Button>
              </div>
              
              <Link href="/dashboard">
                <Button variant="ghost" className="hover:bg-white/50 transition-all duration-200">
                  <Users className="w-4 h-4 mr-2" />
                  User View
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push("/")
                }}
                className="hover:bg-white/50 transition-all duration-200"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview with modern styling */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Total Signups</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loadingStats ? "..." : (stats?.totalSignups || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Verified</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loadingStats ? "..." : (stats?.verifiedUsers || 0)}
              </div>
              <p className="text-xs text-emerald-600 font-medium">
                {loadingStats ? "..." : `${stats?.verificationRate.toFixed(1)}% rate`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Paid Users</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loadingStats ? "..." : (stats?.paidUsers || 0)}
              </div>
              <p className="text-xs text-purple-600 font-medium">
                {loadingStats ? "..." : `${stats?.paymentRate.toFixed(1)}% rate`}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Active Matches</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loadingStats ? "..." : (stats?.activeMatches || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Messages</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loadingStats ? "..." : (stats?.totalMessages || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Pending Reviews</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {loadingVerifications ? "..." : verifications.filter((v) => v.status === "pending").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">Growth</CardTitle>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">+12%</div>
              <p className="text-xs text-teal-600 font-medium">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs with modern styling */}
        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
            <TabsTrigger 
              value="verifications" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              Verifications ({loadingVerifications ? "..." : verifications.filter((v) => v.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger 
              value="matches"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              Matches
            </TabsTrigger>
            <TabsTrigger 
              value="users"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="verified-users"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-blue-500 data-[state=active]:text-white"
            >
              Verified Users ({loadingUsers ? "..." : users.filter(u => u.is_verified).length})
            </TabsTrigger>
          </TabsList>

          {/* Verifications Tab */}
          <TabsContent value="verifications" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="grid gap-4">
              {filteredVerifications.map((verification) => (
                <Card key={verification.id} className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {verification.profiles.first_name} {verification.profiles.last_name}
                          </h3>
                          <Badge
                            variant={
                              verification.status === "approved"
                                ? "default"
                                : verification.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {verification.status}
                          </Badge>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>Email:</strong> {verification.profiles.email}
                          </p>
                          <p>
                            <strong>Specialty:</strong> {verification.profiles.specialty}
                          </p>
                          <p>
                            <strong>City:</strong> {verification.profiles.city}
                          </p>
                          <p>
                            <strong>Submitted:</strong>{" "}
                            {formatDistanceToNow(new Date(verification.submitted_at), { addSuffix: true })}
                          </p>
                          {verification.reviewed_at && (
                            <p>
                              <strong>Reviewed:</strong>{" "}
                              {formatDistanceToNow(new Date(verification.reviewed_at), { addSuffix: true })}
                            </p>
                          )}
                          {verification.admin_notes && (
                            <p>
                              <strong>Notes:</strong> {verification.admin_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedVerification(verification)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <div className="grid gap-4">
              {matches.map((match) => (
                <Card key={match.id} className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900">{match.group_name}</h3>
                          <Badge variant={match.status === "active" ? "default" : "secondary"}>{match.status}</Badge>
                        </div>

                        <div className="text-sm text-gray-600 mb-3">
                          <p>
                            <strong>Week:</strong> {format(new Date(match.match_week), "MMM d, yyyy")}
                          </p>
                          <p>
                            <strong>Members:</strong> {match.match_members.length}
                          </p>
                        </div>

                        <div className="space-y-2">
                          {match.match_members.map((member, index) => (
                            <div key={member.user_id} className="flex items-center gap-2 text-sm">
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {member.profiles.first_name[0]}
                                  {member.profiles.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {member.profiles.first_name} {member.profiles.last_name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {member.profiles.specialty}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Link href={`/chat/${match.id}`}>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View Chat
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Users Header with Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">User Management</h2>
                <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
              </div>
              <Button
                onClick={() => {
                  setSelectedUser(null)
                  setIsEditMode(false)
                  setShowUserModal(true)
                }}
                className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* Users Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-white/30"
                />
              </div>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-white/50 backdrop-blur-sm border-white/30"
              >
                <option value="all">All Users</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
                <option value="paid">Paid</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            {/* Users Table */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 border-b border-white/20">
                      <tr>
                        <th className="text-left p-4 font-semibold text-gray-700">User</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Specialty</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Role</th>
                        <th className="text-left p-4 font-semibold text-gray-700">Created</th>
                        <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingUsers ? (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-gray-500">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                              Loading users...
                            </div>
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center p-8 text-gray-500">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-white/10 hover:bg-white/20 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                    {user.first_name?.[0]}{user.last_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                                  <p className="text-xs text-gray-500">{user.city}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{user.email}</td>
                            <td className="p-4">
                              <Badge variant="outline" className="text-xs">
                                {user.specialty || 'Not set'}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1">
                                <Badge 
                                  variant={user.is_verified ? "default" : "secondary"}
                                  className="text-xs w-fit"
                                >
                                  {user.is_verified ? "Verified" : "Unverified"}
                                </Badge>
                                {user.is_paid && (
                                  <Badge variant="outline" className="text-xs text-green-600 w-fit">
                                    Paid
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge 
                                variant={user.role === 'admin' ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {user.role || 'user'}
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2 justify-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user)
                                    setIsEditMode(true)
                                    setShowUserModal(true)
                                  }}
                                  className="hover:bg-blue-50"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setUserToDelete(user)
                                    setShowDeleteConfirm(true)
                                  }}
                                  className="hover:bg-red-50 text-red-600"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verified Users Tab */}
          <TabsContent value="verified-users" className="space-y-6">
            {/* Verified Users Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Verified Users</h2>
                <p className="text-gray-600">Manage verified users and view their verification documents</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadVerifiedUsers()}
                  className="text-xs"
                >
                  Refresh
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      // Quick test: verify the first unverified user
                      const unverifiedUser = users.find(u => !u.is_verified)
                      if (unverifiedUser) {
                        try {
                          const { error } = await supabase
                            .from("profiles")
                            .update({ is_verified: true })
                            .eq("id", unverifiedUser.id)
                          if (!error) {
                            await Promise.all([loadUsers(), loadVerifiedUsers()])
                            alert(`Verified ${unverifiedUser.first_name} ${unverifiedUser.last_name} for testing`)
                          }
                        } catch (error) {
                          console.error("Error verifying user:", error)
                        }
                      } else {
                        alert("No unverified users to test with")
                      }
                    }}
                    className="text-xs"
                  >
                    Test: Verify User
                  </Button>
                )}
              </div>
            </div>

            {/* Verified Users Search */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search verified users..."
                  value={verifiedSearchTerm}
                  onChange={(e) => setVerifiedSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-white/30"
                />
              </div>
            </div>

            {/* Unverified Users Section */}
            {users.filter(u => !u.is_verified).length > 0 && (
              <Card className="bg-orange-50/50 backdrop-blur-sm border-orange-200/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Users Awaiting Verification ({users.filter(u => !u.is_verified).length})
                  </CardTitle>
                  <CardDescription>
                    New users that haven't been verified yet
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {users.filter(u => !u.is_verified).slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-orange-200/30">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">
                              Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                const { error } = await supabase
                                  .from("profiles")
                                  .update({ is_verified: true })
                                  .eq("id", user.id)
                                if (!error) {
                                  await Promise.all([loadUsers(), loadVerifiedUsers()])
                                  alert(`${user.first_name} ${user.last_name} has been verified!`)
                                }
                              } catch (error) {
                                console.error("Error verifying user:", error)
                                alert("Failed to verify user")
                              }
                            }}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verify
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsEditMode(true)
                              setShowUserModal(true)
                            }}
                            className="text-xs hover:bg-blue-50"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                    {users.filter(u => !u.is_verified).length > 5 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        And {users.filter(u => !u.is_verified).length - 5} more unverified users...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verified Users Grid */}
            <div className="grid gap-4">
              {loadingVerifiedUsers ? (
                <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                      Loading verified users...
                    </div>
                  </CardContent>
                </Card>
              ) : filteredVerifiedUsers.length === 0 ? (
                <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                  <CardContent className="p-8 text-center text-gray-500">
                    <div className="space-y-2">
                      <p>No verified users found</p>
                      <p className="text-xs">Total users loaded: {users.length}</p>
                      <p className="text-xs">Verified users in system: {users.filter(u => u.is_verified).length}</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredVerifiedUsers.map((user) => (
                  <Card key={user.id} className="bg-white/60 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <Avatar className="w-12 h-12">
                              <AvatarFallback className="text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-gray-900 text-lg">
                                  {user.first_name} {user.last_name}
                                </h3>
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                                {user.is_paid && (
                                  <Badge variant="outline" className="text-green-600 border-green-600">
                                    Paid
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mt-1 space-y-1">
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>Specialty:</strong> {user.specialty || 'Not specified'}</p>
                                <p><strong>City:</strong> {user.city || 'Not specified'}</p>
                                <p><strong>Verified:</strong> {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</p>
                              </div>
                            </div>
                          </div>

                          {/* Verification Documents */}
                          <div className="mt-4 p-4 bg-green-50/50 rounded-lg border border-green-200/50">
                            <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Verification Documents
                            </h4>
                            {user.verification_documents && user.verification_documents.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {user.verification_documents.map((doc) => (
                                  <div key={doc.id} className="space-y-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedPhoto({
                                          url: doc.document_url,
                                          type: doc.document_type === 'id' ? 'ID Document' : 
                                                doc.document_type === 'license' ? 'Medical License' : 
                                                'Certificate',
                                          user: `${user.first_name} ${user.last_name}`
                                        })
                                        setShowPhotoModal(true)
                                      }}
                                      className={`w-full text-xs ${
                                        doc.document_type === 'id' ? 'hover:bg-blue-50' :
                                        doc.document_type === 'license' ? 'hover:bg-green-50' :
                                        'hover:bg-purple-50'
                                      }`}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      View {doc.document_type === 'id' ? 'ID' : 
                                             doc.document_type === 'license' ? 'License' : 
                                             'Certificate'}
                                    </Button>
                                    <div className="text-xs text-gray-500 text-center">
                                      Status: <span className={`font-medium ${
                                        doc.status === 'approved' ? 'text-green-600' : 
                                        doc.status === 'rejected' ? 'text-red-600' : 
                                        'text-yellow-600'
                                      }`}>
                                        {doc.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <p className="text-sm">No verification documents uploaded</p>
                                <p className="text-xs mt-1">User was verified manually</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedVerifiedUser(user)
                              setShowVerifiedUserModal(true)
                            }}
                            className="hover:bg-blue-50"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => revokeVerification(user.id)}
                            className="hover:bg-red-50 text-red-600 border-red-200"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Revoke
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Verification Review Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-blue-50 border-b border-white/20">
              <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Review Verification - {selectedVerification.profiles.first_name}{" "}
                {selectedVerification.profiles.last_name}
              </CardTitle>
              <CardDescription>Review the submitted documents and approve or reject the verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50/50 to-violet-50/50 rounded-xl border border-white/20">
                <div>
                  <p>
                    <strong>Name:</strong> {selectedVerification.profiles.first_name}{" "}
                    {selectedVerification.profiles.last_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedVerification.profiles.email}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Specialty:</strong> {selectedVerification.profiles.specialty}
                  </p>
                  <p>
                    <strong>City:</strong> {selectedVerification.profiles.city}
                  </p>
                </div>
              </div>

              {/* Documents */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">ID Document</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <img
                      src={selectedVerification.id_document_url || "/placeholder.svg"}
                      alt="ID Document"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Selfie with ID</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <img
                      src={selectedVerification.selfie_url || "/placeholder.svg"}
                      alt="Selfie"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Medical License</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <img
                      src={selectedVerification.license_url || "/placeholder.svg"}
                      alt="Medical License"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <Label htmlFor="notes">Admin Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this verification..."
                  className="mt-2"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedVerification(null)
                    setReviewNotes("")
                  }}
                  className="hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleVerificationReview(selectedVerification.id, "rejected")}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all duration-200"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button 
                  onClick={() => handleVerificationReview(selectedVerification.id, "approved")}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {showPhotoModal && selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-violet-50 border-b border-white/20">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {selectedPhoto.type} - {selectedPhoto.user}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-center">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.type}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg border shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg"
                  }}
                />
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => {
                    setShowPhotoModal(false)
                    setSelectedPhoto(null)
                  }}
                  className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Verified User Edit Modal */}
      {showVerifiedUserModal && selectedVerifiedUser && (
        <UserModal
          user={selectedVerifiedUser}
          isEdit={true}
          onSave={updateVerifiedUser}
          onClose={() => {
            setShowVerifiedUserModal(false)
            setSelectedVerifiedUser(null)
          }}
        />
      )}

      {/* User Create/Edit Modal */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          isEdit={isEditMode}
          onSave={isEditMode ? updateUser : createUser}
          onClose={() => {
            setShowUserModal(false)
            setSelectedUser(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border-white/20 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b border-white/20">
              <CardTitle className="text-red-700 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Delete User
              </CardTitle>
              <CardDescription>
                This action cannot be undone. This will permanently delete the user account.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    <strong>User:</strong> {userToDelete.first_name} {userToDelete.last_name}
                  </p>
                  <p className="text-sm text-red-700">
                    <strong>Email:</strong> {userToDelete.email}
                  </p>
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setUserToDelete(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteUser(userToDelete.id)}
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// User Modal Component
function UserModal({ 
  user, 
  isEdit, 
  onSave, 
  onClose 
}: { 
  user: UserProfile | null
  isEdit: boolean
  onSave: (userId: string, data: Partial<UserProfile>) => void | ((data: Partial<UserProfile>) => void)
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    specialty: user?.specialty || '',
    city: user?.city || '',
    gender: user?.gender || 'prefer-not-to-say',
    gender_preference: user?.gender_preference || 'no-preference',
    interests: user?.interests || [],
    availability_slots: user?.availability_slots || [],
    is_verified: user?.is_verified || false,
    is_paid: user?.is_paid || false,
    role: user?.role || 'user',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEdit && user) {
      onSave(user.id, formData)
    } else {
      onSave(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-blue-50 border-b border-white/20">
          <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {isEdit ? 'Edit User' : 'Create New User'}
          </CardTitle>
          <CardDescription>
            {isEdit ? 'Update user information and permissions' : 'Add a new user to the system'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialty">Specialty</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_verified}
                  onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                />
                <span className="text-sm">Verified</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_paid}
                  onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                />
                <span className="text-sm">Paid</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600"
              >
                {isEdit ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
