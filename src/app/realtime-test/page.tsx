'use client'
 
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Bell, Wifi } from 'lucide-react'
import RealtimeDemo from '@/components/realtime/RealtimeDemo'
 
interface TestMessage {
  id: number
  message: string
  user: string
  timestamp: Date
}

export default function RealtimeTestPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [testMessage, setTestMessage] = useState('')
  const [messages, setMessages] = useState<TestMessage[]>([])
  
  const supabase = createClient()
 
  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      setIsLoading(false)
    }
    getUser()
  }, [supabase])
 
  // Test realtime with a simple message system
  useEffect(() => {
    if (!user) return
 
    const channel = supabase
      .channel('test-messages')
      .on('broadcast', { event: 'test-message' }, (payload) => {
        console.log('Received test message:', payload)
        setMessages(prev => [...prev, {
          id: Date.now(),
          message: payload.message,
          user: payload.user,
          timestamp: new Date()
        }])
      })
      .subscribe((status) => {
        console.log('Test channel status:', status)
      })
 
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])
 
  const sendTestMessage = async () => {
    if (!testMessage.trim()) return
 
    const channel = supabase.channel('test-messages')
    await channel.send({
      type: 'broadcast',
      event: 'test-message',
      payload: {
        message: testMessage,
        user: user?.email || 'Anonymous'
      }
    })
    
    setTestMessage('')
  }
 
  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }
 
  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You need to be logged in to test realtime features.
            </p>
            <Button onClick={() => window.location.href = '/auth/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
 
  return (
    <div className="container mx-auto p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Supabase Realtime Test</h1>
        <p className="text-gray-600 mt-2">
          Test WebSocket connections and real-time features
        </p>
      </div>
 
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Badge variant="outline">User: {user.email}</Badge>
            </div>
            <div className="text-center">
              <Badge variant="outline">Supabase: Connected</Badge>
            </div>
            <div className="text-center">
              <Badge variant="outline">Realtime: Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
 
      {/* Test Message System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Test Message System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-message">Send a test message</Label>
            <div className="flex gap-2">
              <Input
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendTestMessage()}
              />
              <Button onClick={sendTestMessage}>Send</Button>
            </div>
          </div>
          
          {messages.length > 0 && (
            <div className="space-y-2">
              <Label>Recent Messages</Label>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="flex justify-between">
                      {msg.user}
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                    <p>{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
 
      {/* Realtime Demo */}
      <RealtimeDemo userId={user.id} />
 
      {/* Instructions */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Open multiple tabs</strong> of this page</li>
            <li><strong>Send test messages</strong> - they should appear in all tabs instantly</li>
            <li><strong>Update your profile</strong> in another tab to see notifications</li>
            <li><strong>Check browser console</strong> for WebSocket connection logs</li>
            <li><strong>Monitor online users</strong> - each tab should show as online</li>
          </ol>
        </CardContent>
      </Card>
 
      {/* Troubleshooting */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-800">Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>WebSocket errors</strong> are normal in development</li>
            <li><strong>Messages not appearing?</strong> Check browser console for errors</li>
            <li><strong>Connection issues?</strong> Try refreshing the page</li>
            <li><strong>RLS errors?</strong> Make sure you're logged in properly</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}