import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  Settings, 
  Bell, 
  LogOut,
  Heart,
  MapPin,
  Clock,
  Star,
  Plus,
  ChevronRight,
  User,
  Stethoscope,
  Loader2,
  TrendingUp,
  Activity,
  Zap,
  Target,
  Award,
  Sparkles
} from 'lucide-react';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  medical_specialty: string;
  city: string;
  created_at: string;
  avatar?: string;
}

interface DashboardStats {
  totalMatches: number;
  activeGroups: number;
  messagesSent: number;
  profileViews: number;
  newMatches: number;
  responseRate: number;
  avgCompatibility: number;
  weeklyActivity: number;
}

interface RecentMatch {
  id: string;
  name: string;
  specialty: string | null;
  compatibility: number | null;
  lastActive: string;
  avatar: string;
  status: 'new' | 'active' | 'pending';
  mutualInterests: number;
  location: string;
  age: number;
  careerStage: string;
}

interface ActiveGroup {
  id: string;
  name: string;
  members: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar: string;
  color: string;
}

interface Notification {
  id: string;
  type: 'match' | 'message' | 'activity' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface UserDashboardProps {
  user: User;
  stats: DashboardStats;
  recentMatches: RecentMatch[];
  activeGroups: ActiveGroup[];
  notifications: Notification[];
  profile?: any; // Add profile prop
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function UserDashboard({ user, stats, recentMatches, activeGroups, notifications, profile, onNavigate, onLogout }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Format stats for display with real data and enhanced styling
  const statsData = [
    { 
      label: 'Groups Matched', 
      value: stats.totalMatches, 
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
      description: 'Total group matches',
      trend: '+12%'
    },
    { 
      label: 'New Matches', 
      value: stats.newMatches, 
      icon: Heart, 
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-200 dark:border-red-800',
      description: 'This week',
      trend: '+8%'
    },
    { 
      label: 'Active Groups', 
      value: stats.activeGroups, 
      icon: Calendar, 
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
      borderColor: 'border-green-200 dark:border-green-800',
      description: 'Currently chatting',
      trend: '+15%'
    },
    { 
      label: 'Messages Sent', 
      value: stats.messagesSent, 
      icon: MessageCircle, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      borderColor: 'border-purple-200 dark:border-purple-800',
      description: 'Total messages',
      trend: '+23%'
    }
  ];

  // Calculate additional metrics with enhanced styling
  const avgCompatibility = Math.round(stats.avgCompatibility || 0);
  const responseRate = Math.round(stats.responseRate || 0);
  const weeklyActivity = stats.weeklyActivity || 0;
  const engagementScore = Math.min(100, Math.max(0, Math.round((responseRate + avgCompatibility + weeklyActivity) / 3)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Enhanced Header with Glass Effect */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-blue-200/50 dark:border-blue-800/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
                    BeyondRounds
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Doctor Dashboard
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('chat')}
                className="relative hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {activeGroups.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs animate-pulse"></span>
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
              >
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full text-xs animate-pulse"></span>
                )}
              </Button>

              <div className="flex items-center gap-3 pl-3 border-l border-blue-200 dark:border-blue-800">
                <Avatar className="w-9 h-9 ring-2 ring-blue-200 dark:ring-blue-800">
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">
                    {profile ? `${profile.first_name?.[0]}${profile.last_name?.[0]}` : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {profile?.medical_specialty || 'Medical Professional'}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 dark:from-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                Welcome back, {profile?.first_name || 'User'}! 👋
          </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                You have <span className="font-semibold text-blue-600 dark:text-blue-400">{activeGroups.length}</span> active groups and <span className="font-semibold text-green-600 dark:text-green-400">{recentMatches.length}</span> recent matches.
          </p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card key={index} className={`${stat.borderColor} ${stat.bgColor} hover:shadow-lg transition-all duration-300 hover:scale-105`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.label}</span>
                      <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.trend}
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.description}</p>
                  </div>
                  <div className={`p-4 rounded-xl ${stat.bgColor} ${stat.color} shadow-lg`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Compatibility</span>
                    <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                      <Target className="w-3 h-3 mr-1" />
                      Quality
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300 mb-1">{avgCompatibility}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Match quality score</p>
                </div>
                <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 shadow-lg">
                  <Star className="w-7 h-7" />
          </div>
        </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Response Rate</span>
                    <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700">
                      <Activity className="w-3 h-3 mr-1" />
                      Engagement
                    </Badge>
                        </div>
                  <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">{responseRate}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Engagement level</p>
                      </div>
                <div className="p-4 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 shadow-lg">
                  <MessageCircle className="w-7 h-7" />
                    </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Weekly Activity</span>
                    <Badge variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700">
                      <Zap className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mb-1">{weeklyActivity}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Messages this week</p>
                </div>
                <div className="p-4 rounded-xl bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 shadow-lg">
                  <Clock className="w-7 h-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Active Groups */}
            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-t-lg">
                <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                Active Groups
              </CardTitle>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => onNavigate('chat')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Join Group
                </Button>
            </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {activeGroups.length > 0 ? (
                    activeGroups.map((group) => (
                      <div key={group.id} className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700">
                        <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">{group.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {group.members} members
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Last active: {new Date(group.lastMessageTime).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                              <Activity className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                            {group.unreadCount > 0 && (
                              <Badge variant="outline" className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700">
                                {group.unreadCount} unread
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium">Last message:</span> {group.lastMessage}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 border-blue-200 dark:border-blue-700 transition-all duration-300"
                          onClick={() => onNavigate('chat')}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          View Group Chat 
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <MessageCircle className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No active groups yet</h3>
                      <p className="text-sm mb-6">Join groups to start chatting with fellow medical professionals!</p>
                      <Button
                        variant="outline"
                        onClick={() => onNavigate('matching')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Find Groups
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Recent Matches */}
            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-t-lg">
                <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Recent Matches
                </CardTitle>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => onNavigate('matching')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Find More
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentMatches.length > 0 ? (
                    recentMatches.map((match) => (
                      <div key={match.id} className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-md transition-all duration-300 hover:border-green-300 dark:hover:border-green-700">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-2">{match.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                              <div className="flex items-center gap-1">
                                <Stethoscope className="w-4 h-4" />
                                {match.specialty}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {match.location}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Last active: {new Date(match.lastActive).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {match.mutualInterests} interests
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                              <Target className="w-3 h-3 mr-1" />
                              {match.compatibility || 0}% match
                            </Badge>
                            <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                              {match.status}
                            </Badge>
                        </div>
                      </div>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950 border-green-200 dark:border-green-700 transition-all duration-300"
                            onClick={() => onNavigate('chat')}
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Chat
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 border-blue-200 dark:border-blue-700 transition-all duration-300"
                            onClick={() => onNavigate('matching')}
                          >
                            <Users className="w-4 h-4 mr-2" />
                            View Group
                      </Button>
                    </div>
                  </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-10 w-10 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
                      <p className="text-sm mb-6">Complete your profile to get matched with fellow medical professionals!</p>
                      <Button
                        variant="outline"
                        onClick={() => onNavigate('matching')}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Start Matching
                      </Button>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Profile Card */}
            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="relative mb-6">
                  <Avatar className="w-24 h-24 mx-auto ring-4 ring-blue-200 dark:ring-blue-800 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-2xl font-bold">
                      {profile ? `${profile.first_name?.[0]}${profile.last_name?.[0]}` : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                  {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 font-medium">
                  {profile?.medical_specialty || 'Medical Professional'}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <Clock className="w-4 h-4" />
                  Member since {profile ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
                </div>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 border-blue-200 dark:border-blue-700 transition-all duration-300"
                    onClick={() => onNavigate('profile')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950 border-indigo-200 dark:border-indigo-700 transition-all duration-300"
                    onClick={() => onNavigate('profile-edit')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Actions */}
            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 hover:shadow-lg transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900 dark:to-violet-900 rounded-t-lg">
                <CardTitle className="text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950 border-purple-200 dark:border-purple-700 transition-all duration-300"
                  onClick={() => onNavigate('matching')}
                >
                  <Users className="w-4 h-4 mr-3" />
                  Find New Groups
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 border-blue-200 dark:border-blue-700 transition-all duration-300"
                  onClick={() => onNavigate('chat')}
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Message Groups
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950 border-orange-200 dark:border-orange-700 transition-all duration-300"
                  onClick={() => onNavigate('notifications')}
                >
                  <Bell className="w-4 h-4 mr-3" />
                  Notifications
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-950 border-gray-200 dark:border-gray-700 transition-all duration-300"
                  onClick={() => onNavigate('preferences')}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Enhanced Engagement Score */}
            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Star className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">Engagement Score</h3>
                <p className="text-4xl font-bold text-green-800 dark:text-green-200 mb-2">
                  {engagementScore}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                  {engagementScore > 80 ? "You're highly engaged! 🎉" : 
                   engagementScore > 50 ? "Great activity level! 👍" : 
                   "Keep connecting with others! 💪"}
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${engagementScore}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Notifications Summary */}
            {notifications.length > 0 && (
              <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 hover:shadow-lg transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900 rounded-t-lg">
                  <CardTitle className="text-orange-700 dark:text-orange-300 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Notifications
                    <Badge variant="outline" className="bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700">
                      {notifications.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-orange-800 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                            <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 mb-1">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(notification.time).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length > 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950 border-orange-200 dark:border-orange-700 transition-all duration-300"
                        onClick={() => onNavigate('notifications')}
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        View All Notifications
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}