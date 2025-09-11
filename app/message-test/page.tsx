"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, RefreshCw, Database, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function MessagePersistenceTest() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [testResults, setTestResults] = useState<any[]>([])
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      loadMessages()
    }
    checkAuth()
  }, [router, supabase])

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      // Load messages from Test_Group_02
      const { data, error } = await supabase
        .from("chat_messages")
        .select(`
          id,
          content,
          message_type,
          created_at,
          user_id,
          profiles(first_name, last_name)
        `)
        .eq("match_id", "897badb8-f264-447f-a638-55970d246d52")
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Error loading messages:", error)
        setTestResults(prev => [...prev, {
          test: "Load Messages",
          status: "error",
          message: error.message,
          timestamp: new Date().toISOString()
        }])
      } else {
        console.log("Loaded messages:", data?.length || 0)
        setMessages(data || [])
        setTestResults(prev => [...prev, {
          test: "Load Messages",
          status: "success",
          message: `Successfully loaded ${data?.length || 0} messages`,
          timestamp: new Date().toISOString()
        }])
      }
    } catch (error) {
      console.error("Error:", error)
      setTestResults(prev => [...prev, {
        test: "Load Messages",
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const testMessageInsertion = async () => {
    if (!user) return
    
    try {
      const testMessage = `Test message ${Date.now()}`
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          match_id: "897badb8-f264-447f-a638-55970d246d52",
          user_id: user.id,
          content: testMessage,
          message_type: "user"
        })
        .select("id, content, created_at")
        .single()

      if (error) {
        setTestResults(prev => [...prev, {
          test: "Insert Message",
          status: "error",
          message: error.message,
          timestamp: new Date().toISOString()
        }])
      } else {
        setTestResults(prev => [...prev, {
          test: "Insert Message",
          status: "success",
          message: `Message inserted: ${data.id}`,
          timestamp: new Date().toISOString()
        }])
        
        // Refresh messages to see the new one
        setTimeout(() => loadMessages(), 1000)
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: "Insert Message",
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }])
    }
  }

  const clearTestMessages = async () => {
    try {
      const { error } = await supabase
        .from("chat_messages")
        .delete()
        .like("content", "Test message%")

      if (error) {
        setTestResults(prev => [...prev, {
          test: "Clear Test Messages",
          status: "error",
          message: error.message,
          timestamp: new Date().toISOString()
        }])
      } else {
        setTestResults(prev => [...prev, {
          test: "Clear Test Messages",
          status: "success",
          message: "Test messages cleared",
          timestamp: new Date().toISOString()
        }])
        loadMessages()
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: "Clear Test Messages",
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }])
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Message Persistence Test</h1>
          <p className="text-gray-600">Verify that messages are being saved and loaded correctly</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Messages Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Recent Messages ({messages.length})
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadMessages}
                  className="ml-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages found</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {message.profiles ? 
                            `${message.profiles.first_name} ${message.profiles.last_name}` : 
                            'Unknown User'
                          }
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {message.message_type}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{message.content}</p>
                    <p className="text-xs text-gray-400 mt-1">ID: {message.id}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button 
                  onClick={testMessageInsertion}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Test Message Insertion
                </Button>
                
                <Button 
                  onClick={loadMessages}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Messages
                </Button>
                
                <Button 
                  onClick={clearTestMessages}
                  variant="destructive"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear Test Messages
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Quick Actions:</h4>
                <div className="space-y-2">
                  <Link href="/test-chat">
                    <Button variant="outline" size="sm" className="w-full">
                      Go to Chat Test Page
                    </Button>
                  </Link>
                  <Link href="/chat/897badb8-f264-447f-a638-55970d246d52">
                    <Button variant="outline" size="sm" className="w-full">
                      Open Test Group Chat
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testResults.slice(-10).reverse().map((result, index) => (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      result.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    {result.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.test}</span>
                        <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                          {result.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{result.message}</p>
                      <p className="text-xs text-gray-400">{result.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

