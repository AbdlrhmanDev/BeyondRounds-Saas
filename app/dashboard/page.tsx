"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, Users, MessageCircle, CheckCircle, Clock, AlertCircle, Settings } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  specialty: string
  city: string
  is_verified: boolean
  is_paid: boolean
}

interface Match {
  id: string
  group_name: string
  status: string
  match_week: string
  match_members: Array<{
    profiles: {
      first_name: string
      last_name: string
      specialty: string
    }
  }>
  chat_messages: Array<{
    content: string
    created_at: string
    message_type: string
  }>
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadDashboard = async () => {
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

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error loading profile:", profileError)
        } else {
          setProfile(profileData)
        }

        // Get user's matches
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select(`
            id,
            group_name,
            status,
            match_week,
            match_members!inner(
              profiles(first_name, last_name, specialty)
            ),
            chat_messages(
              content,
              created_at,
              message_type
            )
          `)
          .eq("match_members.user_id", user.id)
          .order("match_week", { ascending: false })

        if (matchesError) {
          console.error("Error loading matches:", matchesError)
        } else {
          setMatches(matchesData || [])
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading dashboard:", error)
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [router, supabase])

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const getLastMessage = (match: Match) => {
    if (!match.chat_messages || match.chat_messages.length === 0) {
      return "No messages yet"
    }

    const lastMessage = match.chat_messages[match.chat_messages.length - 1]
    const preview = lastMessage.content.length > 50 ? lastMessage.content.substring(0, 50) + "..." : lastMessage.content

    return preview
  }

  const getLastMessageTime = (match: Match) => {
    if (!match.chat_messages || match.chat_messages.length === 0) {
      return ""
    }

    const lastMessage = match.chat_messages[match.chat_messages.length - 1]
    return formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BeyondRounds</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile?.first_name}!</h1>
          <p className="text-gray-600">Your doctor networking dashboard</p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
              {profile?.is_verified ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <Clock className="w-4 h-4 text-yellow-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.is_verified ? "Verified" : "Pending"}</div>
              <p className="text-xs text-muted-foreground">
                {profile?.is_verified ? "Your account is verified" : "Complete verification to start matching"}
              </p>
              {!profile?.is_verified && (
                <Link href="/verify" className="mt-2 inline-block">
                  <Button size="sm">Complete Verification</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              {profile?.is_paid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.is_paid ? "Active" : "Inactive"}</div>
              <p className="text-xs text-muted-foreground">
                {profile?.is_paid ? "Ready for weekly matches" : "Subscribe to start matching"}
              </p>
              {!profile?.is_paid && (
                <Link href="/pricing" className="mt-2 inline-block">
                  <Button size="sm">View Plans</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matches.length}</div>
              <p className="text-xs text-muted-foreground">Groups you're part of</p>
            </CardContent>
          </Card>
        </div>

        {/* Matches Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Groups</h2>
            <Badge variant="secondary">Next matches: Thursday 4 PM</Badge>
          </div>

          {matches.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
                <p className="text-gray-600 mb-4">
                  {!profile?.is_verified
                    ? "Complete your verification to start getting matched with fellow doctors."
                    : !profile?.is_paid
                      ? "Subscribe to start receiving weekly matches."
                      : "You'll receive your first matches on Thursday at 4 PM."}
                </p>
                {!profile?.is_verified ? (
                  <Link href="/verify">
                    <Button>Complete Verification</Button>
                  </Link>
                ) : !profile?.is_paid ? (
                  <Link href="/pricing">
                    <Button>View Subscription Plans</Button>
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {matches.map((match) => (
                <Card key={match.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900">{match.group_name}</h3>
                          <Badge variant={match.status === "active" ? "default" : "secondary"}>{match.status}</Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex -space-x-2">
                            {match.match_members.slice(0, 4).map((member, index) => (
                              <Avatar key={index} className="w-8 h-8 border-2 border-white">
                                <AvatarFallback className="text-xs">
                                  {getInitials(member.profiles.first_name, member.profiles.last_name)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">{match.match_members.length} members</span>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Specialties:</strong>{" "}
                          {[...new Set(match.match_members.map((m) => m.profiles.specialty))].join(", ")}
                        </div>

                        <div className="text-sm text-gray-500">
                          <MessageCircle className="w-4 h-4 inline mr-1" />
                          {getLastMessage(match)}
                          {getLastMessageTime(match) && <span className="ml-2">• {getLastMessageTime(match)}</span>}
                        </div>
                      </div>

                      <Link href={`/chat/${match.id}`}>
                        <Button size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
