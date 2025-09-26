'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, Users, MessageCircle, Heart } from 'lucide-react'

interface RealtimeDemoProps {
  userId: string
}

export default function RealtimeDemo({ userId }: RealtimeDemoProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    // 1. Listen to profile updates
    const profileChannel = supabase
      .channel('profile-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE',
          schema: 'public', 
          table: 'profiles',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('Profile updated:', payload.new)
          addNotification({
            type: 'profile',
            message: 'Your profile was updated',
            timestamp: new Date()
          })
        }
      )
      .subscribe((status) => {
        console.log('Profile channel status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    // 2. Listen to new matches (if matches table exists)
    const matchChannel = supabase
      .channel('match-notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT',
          schema: 'public', 
          table: 'matches',
          filter: `user_id=eq.${userId}`
        }, 
        (payload) => {
          console.log('New match:', payload.new)
          addNotification({
            type: 'match',
            message: 'You have a new match!',
            timestamp: new Date()
          })
        }
      )
      .subscribe()

    // 3. Track online users (presence)
    const presenceChannel = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const users = Object.values(state).flat()
        setOnlineUsers(users)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user as online
          await presenceChannel.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          })
        }
      })

    // Cleanup
    return () => {
      supabase.removeChannel(profileChannel)
      supabase.removeChannel(matchChannel)
      supabase.removeChannel(presenceChannel)
    }
  }, [userId, supabase])

  const addNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]) // Keep last 10
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Realtime Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Connected to Realtime' : 'Disconnected'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Live Notifications
            </div>
            <Button variant="outline" size="sm" onClick={clearNotifications}>
              Clear All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications yet. Try updating your profile!</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  {notification.type === 'profile' && <Users className="h-4 w-4 text-blue-500" />}
                  {notification.type === 'match' && <Heart className="h-4 w-4 text-red-500" />}
                  <span className="text-sm">{notification.message}</span>
                  <Badge variant="outline" className="ml-auto">
                    {notification.timestamp.toLocaleTimeString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Online Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Online Users ({onlineUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {onlineUsers.length === 0 ? (
            <p className="text-gray-500">No other users online</p>
          ) : (
            <div className="space-y-2">
              {onlineUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">User {user.user_id}</span>
                  <Badge variant="outline" className="ml-auto">
                    {new Date(user.online_at).toLocaleTimeString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How to Test Realtime</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>Open this page in multiple browser tabs</li>
            <li>Update your profile in another tab</li>
            <li>Watch notifications appear here in real-time</li>
            <li>See online users update automatically</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}


