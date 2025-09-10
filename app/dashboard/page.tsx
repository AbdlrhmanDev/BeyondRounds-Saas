"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Heart, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Settings,
  Search,
  Bell,
  TrendingUp,
  Calendar,
  Star,
  Filter,
  Activity,
  Zap,
  Award,
  Target,
  BarChart3,
  ChevronDown,
  User,
  Mail,
  MapPin,
  Stethoscope,
  Edit
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatDistanceToNow, format, startOfWeek, endOfWeek } from "date-fns"

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
    profiles: Array<{
      first_name: string
      last_name: string
      specialty: string
    }>
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
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")
  const [notifications, setNotifications] = useState([
    { id: 1, type: "match", message: "New match available in Cardiology group", time: "2 hours ago", unread: true },
    { id: 2, type: "message", message: "Dr. Smith sent a message in Surgery group", time: "4 hours ago", unread: true },
    { id: 3, type: "system", message: "Weekly matching completed successfully", time: "1 day ago", unread: false }
  ])
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
          setMatches((matchesData as Match[]) || [])
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading dashboard:", error)
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [router, supabase])

  // Check if profile is complete
  const isProfileComplete = (profile: UserProfile | null) => {
    if (!profile) return false
    return !!(
      profile.first_name?.trim() &&
      profile.last_name?.trim() &&
      profile.specialty?.trim() &&
      profile.city?.trim()
    )
  }

  // Add profile completion notification
  useEffect(() => {
    if (profile && !isProfileComplete(profile)) {
      const profileNotification = {
        id: 999, // Use high ID to avoid conflicts
        type: "profile" as const,
        message: "Complete your profile to start receiving matches",
        time: "Now",
        unread: true
      }
      
      setNotifications(prev => {
        // Check if profile notification already exists
        const hasProfileNotification = prev.some(n => n.id === 999)
        if (!hasProfileNotification) {
          return [profileNotification, ...prev]
        }
        return prev
      })
    } else if (profile && isProfileComplete(profile)) {
      // Remove profile notification if profile is complete
      setNotifications(prev => prev.filter(n => n.id !== 999))
    }
  }, [profile])

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName && firstName.trim() ? firstName.trim()[0] : ''
    const last = lastName && lastName.trim() ? lastName.trim()[0] : ''
    return first || last ? `${first}${last}`.toUpperCase() : 'U'
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

  const filteredMatches = matches.filter(match =>
    match.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.match_members.some(member =>
      member.profiles.some(profile =>
        profile.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  )

  const getWeeklyStats = () => {
    const thisWeek = matches.filter(match => {
      const matchDate = new Date(match.match_week)
      const weekStart = startOfWeek(new Date())
      const weekEnd = endOfWeek(new Date())
      return matchDate >= weekStart && matchDate <= weekEnd
    })
    
    return {
      totalMatches: matches.length,
      thisWeekMatches: thisWeek.length,
      activeChats: matches.filter(match => match.chat_messages?.length > 0).length,
      completionRate: matches.length > 0 ? Math.round((matches.filter(match => match.status === 'active').length / matches.length) * 100) : 0
    }
  }

  const stats = getWeeklyStats()

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ))
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Modern Header with enhanced search */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-blue-500/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">BeyondRounds</span>
            </Link>
            
            <div className="flex items-center gap-3">
              {/* Enhanced Search Bar */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search groups, doctors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 w-64 bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/80 focus:border-violet-300 transition-all duration-200"
                />
              </div>
              
              {/* Enhanced Notifications */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative hover:bg-white/50 transition-all duration-200">
                  <Bell className="w-4 h-4" />
                  {notifications.some(n => n.unread) && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-red-500/25" />
                  )}
                </Button>
              </div>
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border hover:bg-gray-50">
                    <User className="w-4 h-4" />
                    {profile ? `${profile.first_name}` : "User"}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64 bg-white border shadow-lg rounded-md p-1"
                  sideOffset={5}
                >
                  <DropdownMenuItem 
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => router.push('/profile')}
                  >
                    <User className="w-4 h-4" />
                    Profile Info
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  <DropdownMenuItem 
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => router.push('/settings')}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                    onClick={async () => {
                      await supabase.auth.signOut()
                      router.push("/")
                    }}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Modern Welcome Section */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-3xl blur-3xl" />
          <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                  Welcome back, {profile?.first_name}! 👋
                </h1>
                <p className="text-gray-600 text-lg">Your professional networking hub</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(), 'EEEE, MMMM do')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Activity className="w-4 h-4" />
                    {stats.activeChats} active conversations
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
                  <div className="text-sm text-gray-500">Engagement Rate</div>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Verification Status</CardTitle>
              {profile?.is_verified ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-amber-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{profile?.is_verified ? "Verified" : "Pending"}</div>
              <p className="text-xs text-green-700 mt-1">
                {profile?.is_verified ? "Your account is verified ✓" : "Complete verification to start matching"}
              </p>
              {!profile?.is_verified && (
                <Link href="/verify" className="mt-3 inline-block">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">Complete Verification</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Subscription</CardTitle>
              {profile?.is_paid ? (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{profile?.is_paid ? "Active" : "Inactive"}</div>
              <p className="text-xs text-blue-700 mt-1">
                {profile?.is_paid ? "Ready for weekly matches 🚀" : "Subscribe to start matching"}
              </p>
              {!profile?.is_paid && (
                <Link href="/pricing" className="mt-3 inline-block">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">View Plans</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Active Groups</CardTitle>
              <Users className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{matches.length}</div>
              <p className="text-xs text-purple-700 mt-1">Professional connections</p>
              <Progress value={stats.completionRate} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">This Week</CardTitle>
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{stats.thisWeekMatches}</div>
              <p className="text-xs text-orange-700 mt-1">New matches this week</p>
              <div className="flex items-center gap-1 mt-2">
                <Zap className="w-3 h-3 text-orange-500" />
                <span className="text-xs text-orange-600">+{stats.activeChats} active chats</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/60 backdrop-blur-sm border border-white/20">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/80">Overview</TabsTrigger>
              <TabsTrigger value="groups" className="data-[state=active]:bg-white/80">Groups</TabsTrigger>
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
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardContent className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Connect?</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {!profile?.is_verified
                      ? "Complete your verification to start getting matched with fellow medical professionals."
                      : !profile?.is_paid
                        ? "Subscribe to start receiving weekly matches with doctors in your specialty."
                        : "You're all set! Your first matches will arrive on Thursday at 4 PM."}
                  </p>
                  {!profile?.is_verified ? (
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
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredMatches.map((match) => (
                  <Card key={match.id} className="group hover:shadow-xl transition-all duration-300 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse" />
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {match.group_name}
                            </h3>
                            <Badge 
                              variant={match.status === "active" ? "default" : "secondary"}
                              className={match.status === "active" ? "bg-green-500 hover:bg-green-600" : ""}
                            >
                              {match.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex -space-x-3">
                              {match.match_members.slice(0, 5).map((member, index) => (
                                <Avatar key={index} className="w-10 h-10 border-3 border-white shadow-lg">
                                  <AvatarFallback className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                    {member.profiles[0] && getInitials(member.profiles[0].first_name || '', member.profiles[0].last_name || '')}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                              {match.match_members.length > 5 && (
                                <div className="w-10 h-10 rounded-full bg-gray-100 border-3 border-white shadow-lg flex items-center justify-center">
                                  <span className="text-xs font-semibold text-gray-600">+{match.match_members.length - 5}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">{match.match_members.length} members</span>
                            </div>
                          </div>

                          <div className="bg-gray-50/50 rounded-lg p-3 mb-4">
                            <div className="text-sm text-gray-600 mb-2">
                              <Award className="w-4 h-4 inline mr-2" />
                              <strong>Specialties:</strong>{" "}
                              {[...new Set(match.match_members.flatMap((m) => m.profiles.map(p => p.specialty)))].join(", ")}
                            </div>
                            <div className="text-sm text-gray-500">
                              <MessageCircle className="w-4 h-4 inline mr-2" />
                              {getLastMessage(match)}
                              {getLastMessageTime(match) && <span className="ml-2 text-blue-500">• {getLastMessageTime(match)}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Link href={`/chat/${match.id}`}>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Open Chat
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-sm">
                            <Target className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Group Management</h3>
                <div className="grid gap-4">
                  {filteredMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">{match.group_name}</h4>
                        <p className="text-sm text-gray-600">{match.match_members.length} members</p>
                      </div>
                      <Badge variant={match.status === "active" ? "default" : "secondary"}>
                        {match.status}
                      </Badge>
                    </div>
                  ))}
                </div>
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
