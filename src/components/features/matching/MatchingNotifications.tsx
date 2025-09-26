'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users,
  MessageSquare,
  Calendar,
  Bell,
  Clock,
  Star,
  MapPin,
  Shield
} from 'lucide-react'
import { toast } from 'sonner'

interface MatchingNotificationProps {
  userId: string
}

interface MatchingNotification {
  id: string
  title: string
  message: string
  data: {
    type: string
    match_id: string
    group_name: string
    member_count: number
  }
  is_read: boolean
  created_at: string
}

interface MatchingGroup {
  id: string
  name: string
  memberCount: number
  created_at: string
  members: Array<{
    id: string
    first_name: string
    last_name: string
    medical_specialty: string
    city: string
    is_verified: boolean
    compatibility_score: number
  }>
}

export default function MatchingNotifications({ userId }: MatchingNotificationProps) {
  const [notifications, setNotifications] = useState<MatchingNotification[]>([])
  const [matchingGroups, setMatchingGroups] = useState<MatchingGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatchingData()
  }, [userId])

  const loadMatchingData = async () => {
    try {
      setLoading(true)
      
      // Load matching notifications
      const notificationsResponse = await fetch(`/api/notifications?userId=${userId}&type=matching`)
      const notificationsData = await notificationsResponse.json()
      
      if (notificationsData.success) {
        setNotifications(notificationsData.data || [])
      }

      // Load current week's matching groups
      const groupsResponse = await fetch('/api/matching/weekly')
      const groupsData = await groupsResponse.json()
      
      if (groupsData.success) {
        setMatchingGroups(groupsData.data || [])
      }

    } catch (error) {
      console.error('Error loading matching data:', error)
      toast.error('Failed to load matching data')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          isRead: true
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading matching data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Weekly Matching</h3>
        <Button onClick={loadMatchingData} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Current Week's Groups */}
      {matchingGroups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Your Current Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {matchingGroups.map((group) => (
              <div key={group.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{group.name}</h4>
                  <Badge className="bg-green-100 text-green-800">
                    {group.memberCount} members
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {member.first_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {member.first_name} {member.last_name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <span>{member.medical_specialty}</span>
                            <span>•</span>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {member.city}
                            </div>
                            {member.is_verified && (
                              <>
                                <span>•</span>
                                <div className="flex items-center">
                                  <Shield className="h-3 w-3 mr-1 text-green-500" />
                                  <span className="text-green-600">Verified</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${getCompatibilityColor(member.compatibility_score)}`}>
                          {member.compatibility_score}%
                        </div>
                        <div className="text-xs text-gray-500">Compatibility</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    Matched on {formatDate(group.created_at)}
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chatting
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Matching Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Matching Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => {
              const isUnread = !notification.is_read
              
              return (
                <div key={notification.id} className={`border rounded-lg p-4 ${isUnread ? 'border-blue-200 bg-blue-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className={`font-medium ${isUnread ? 'text-blue-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        {isUnread && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm mb-2 ${isUnread ? 'text-blue-700' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(notification.created_at)}
                      </div>
                    </div>
                    {isUnread && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs"
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* No Matches Message */}
      {matchingGroups.length === 0 && notifications.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Weekly Matches Yet</h3>
            <p className="text-gray-600 mb-4">
              Weekly matching runs automatically every week. You'll be notified when you're matched with other medical professionals.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Runs every Monday
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Groups of 3-4 people
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1" />
                Based on compatibility
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}






