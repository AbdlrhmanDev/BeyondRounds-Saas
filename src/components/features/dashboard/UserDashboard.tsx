import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  MessageSquare,
  TrendingUp,
  Bell,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  name?: string
  email?: string
  specialty?: string
  experience_level?: string
  avatar_url?: string
  verification_status?: string
}

interface Match {
  id: string
  user_id: string
  name?: string
  specialty?: string
  compatibility_score?: number
  status?: string
}

interface Group {
  id: string
  name?: string
  member_count?: number
  last_activity?: string
}

interface UserDashboardProps {
  user: UserProfile
  matches?: Match[]
  groups?: Group[]
  stats?: {
    total_matches: number
    active_conversations: number
    groups_joined: number
  }
}

export function UserDashboard({
  user,
  matches = [],
  groups = [],
  stats = {
    total_matches: 0,
    active_conversations: 0,
    groups_joined: 0
  }
}: UserDashboardProps) {
  const getInitials = (name: string | undefined) => {
    if (!name || typeof name !== 'string') {
      return 'U'
    }
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user.name?.split(' ')[0] || 'User'}!</h1>
            <p className="text-gray-600">
              {user.specialty && `${user.specialty} • `}
              {user.experience_level}
              {user.verification_status === 'verified' && (
                <Badge variant="secondary" className="ml-2">Verified</Badge>
              )}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/notifications">
              <Bell className="h-4 w-4 mr-1" />
              Notifications
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_matches}</div>
            <p className="text-xs text-muted-foreground">
              {matches.length} active this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_conversations}</div>
            <p className="text-xs text-muted-foreground">
              2 new messages today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groups Joined</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.groups_joined}</div>
            <p className="text-xs text-muted-foreground">
              {groups.length} active groups
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Matches</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/matches">View All</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {matches.length > 0 ? (
            <div className="space-y-4">
              {matches.slice(0, 3).map((match) => (
                <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(match.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{match.name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-600">{match.specialty || 'No specialty'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {match.compatibility_score || 0}% match
                    </Badge>
                    <Button size="sm" asChild>
                      <Link href={`/chat/${match.id}`}>Message</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No matches yet</p>
              <Button className="mt-4" asChild>
                <Link href="/matching">Find Matches</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Groups</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/groups">View All</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length > 0 ? (
            <div className="space-y-4">
              {groups.slice(0, 3).map((group) => (
                <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{group.name || 'Unnamed Group'}</p>
                    <p className="text-sm text-gray-600">
                      {group.member_count || 0} members • Last active {group.last_activity || 'Unknown'}
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/groups/${group.id}`}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Open
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No groups joined yet</p>
              <Button className="mt-4" asChild>
                <Link href="/groups">Browse Groups</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/matching">
                <Users className="h-6 w-6 mb-2" />
                Find Matches
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/messages">
                <MessageSquare className="h-6 w-6 mb-2" />
                Messages
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/groups">
                <TrendingUp className="h-6 w-6 mb-2" />
                Join Groups
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link href="/profile">
                <Settings className="h-6 w-6 mb-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}