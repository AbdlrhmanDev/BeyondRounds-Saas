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
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format } from "date-fns"

interface VerificationDocument {
  id: string
  user_id: string
  status: string
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  admin_notes: string | null
  id_document_url: string
  selfie_url: string
  license_url: string
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
  const [selectedVerification, setSelectedVerification] = useState<VerificationDocument | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

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

        // Check if user is admin (has @beyondrounds.com email)
        if (!user.email?.endsWith("@beyondrounds.com")) {
          router.push("/dashboard")
          return
        }
        setIsAdmin(true)

        // Load admin data
        await Promise.all([loadVerifications(), loadMatches(), loadStats()])

        setIsLoading(false)
      } catch (error) {
        console.error("Error checking admin access:", error)
        router.push("/dashboard")
      }
    }

    checkAdminAccess()
  }, [router, supabase])

  const loadVerifications = async () => {
    const { data, error } = await supabase
      .from("verification_documents")
      .select(`
        *,
        profiles(first_name, last_name, email, specialty, city)
      `)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error loading verifications:", error)
    } else {
      setVerifications(data || [])
    }
  }

  const loadMatches = async () => {
    const { data, error } = await supabase
      .from("matches")
      .select(`
        *,
        match_members(
          user_id,
          profiles(first_name, last_name, specialty, email)
        )
      `)
      .order("match_week", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Error loading matches:", error)
    } else {
      setMatches(data || [])
    }
  }

  const loadStats = async () => {
    try {
      // Get total signups
      const { count: totalSignups } = await supabase.from("profiles").select("*", { count: "exact", head: true })

      // Get verified users
      const { count: verifiedUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_verified", true)

      // Get paid users
      const { count: paidUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_paid", true)

      // Get active matches
      const { count: activeMatches } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")

      // Get total messages
      const { count: totalMessages } = await supabase.from("chat_messages").select("*", { count: "exact", head: true })

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BeyondRounds Admin</h1>
              <p className="text-sm text-gray-600">Administrative Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Button
              variant="ghost"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push("/")
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSignups || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <UserCheck className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.verifiedUsers || 0}</div>
              <p className="text-xs text-muted-foreground">{stats?.verificationRate.toFixed(1)}% rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
              <CreditCard className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.paidUsers || 0}</div>
              <p className="text-xs text-muted-foreground">{stats?.paymentRate.toFixed(1)}% rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
              <Calendar className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeMatches || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="w-4 h-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifications.filter((v) => v.status === "pending").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="verifications">
              Verifications ({verifications.filter((v) => v.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
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
                <Card key={verification.id}>
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
                <Card key={match.id}>
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
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts, subscriptions, and verification status</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">User management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Verification Review Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                Review Verification - {selectedVerification.profiles.first_name}{" "}
                {selectedVerification.profiles.last_name}
              </CardTitle>
              <CardDescription>Review the submitted documents and approve or reject the verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
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
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedVerification(null)
                    setReviewNotes("")
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleVerificationReview(selectedVerification.id, "rejected")}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button onClick={() => handleVerificationReview(selectedVerification.id, "approved")}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
