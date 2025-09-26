'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, MessageCircle, ArrowLeft, Calendar, MapPin, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GroupPageClientProps {
  groupId: string
  user: any
  profile: any
}

interface Group {
  id: string
  name: string
  description: string
  members: number
  specialty: string
  location: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  avatar: string
  color: string
  isMember: boolean
  compatibility?: number
  status?: string
  created_at?: string
  last_activity_at?: string
}

interface Member {
  id: string
  name: string
  specialty: string
  avatar: string
  online: boolean
  compatibility?: number
  joinedAt?: string
}

interface Message {
  id: string
  sender: string
  message: string
  time: string
  avatar: string
  senderId?: string
}

export default function GroupPageClient({ groupId, user, profile }: GroupPageClientProps) {
  const router = useRouter()
  
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [recentMessages, setRecentMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/groups/${groupId}?userId=${user.id}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()

        if (result.success) {
          const data = result.data
          setGroup(data.group)
          setMembers(data.members)
          setRecentMessages(data.recentMessages)
        } else {
          throw new Error(result.error || 'Failed to fetch group data')
        }
      } catch (err) {
        console.error('Error fetching group data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch group data')
      } finally {
        setIsLoading(false)
      }
    }

    if (groupId && user?.id) {
      fetchGroupData()
    }
  }, [groupId, user?.id])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading group information...</p>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Group Not Found</h2>
          <p className="text-gray-600 mb-4">
            {error || 'The group you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${group.color}`}>
                {group.avatar}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                <p className="text-gray-600">{group.specialty} • {group.location}</p>
                {group.compatibility && (
                  <Badge variant="outline" className="mt-1 bg-green-100 text-green-700">
                    {Math.round(group.compatibility)}% compatibility
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Group Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Group Information</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      {group.isMember ? 'Member' : 'Not a Member'}
                    </Badge>
                    {group.status && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">
                        {group.status}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{group.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{group.members} members</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{group.location}</span>
                  </div>
                </div>
                {group.created_at && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Created {formatTimeAgo(group.created_at)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Messages</span>
                  {group.unreadCount > 0 && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-700">
                      {group.unreadCount} unread
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentMessages.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {recentMessages.map((msg) => (
                        <div key={msg.id} className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            {msg.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-sm">{msg.sender}</span>
                              <span className="text-xs text-gray-500">{formatTimeAgo(msg.time)}</span>
                            </div>
                            <p className="text-gray-700 text-sm">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Button className="w-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Open Full Chat
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No messages yet</p>
                    <p className="text-sm text-gray-500 mt-1">Start the conversation!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Group Members */}
            <Card>
              <CardHeader>
                <CardTitle>Group Members</CardTitle>
              </CardHeader>
              <CardContent>
                {members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {member.avatar}
                          </div>
                          {member.online && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.specialty}</p>
                          {member.compatibility && (
                            <p className="text-xs text-green-600">
                              {Math.round(member.compatibility)}% compatibility
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No members found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                {!group.isMember && (
                  <Button variant="outline" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Join Group
                  </Button>
                )}
                {group.isMember && (
                  <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Users className="w-4 h-4 mr-2" />
                    Leave Group
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

