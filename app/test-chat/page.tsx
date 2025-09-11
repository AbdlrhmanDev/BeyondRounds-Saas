"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Users, Send } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function TestChatPage() {
  const [user, setUser] = useState<any>(null)
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [directGroupId, setDirectGroupId] = useState("")
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push("/auth/login")
          return
        }
        setUser(user)

        // Get user's groups
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select(`
            id,
            group_name,
            created_at,
            match_members!inner(user_id)
          `)
          .eq("match_members.user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (!matchesError && matchesData) {
          setGroups(matchesData)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, supabase])

  const goToChat = (groupId: string) => {
    router.push(`/chat/${groupId}`)
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Your Chat</h1>
          <p className="text-gray-600">Quick access to test messaging functionality</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Your Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Your Groups ({groups.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {groups.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No groups found</p>
                  <Link href="/debug">
                    <Button variant="outline">Check Debug Dashboard</Button>
                  </Link>
                </div>
              ) : (
                groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium">{group.group_name}</h4>
                      <p className="text-sm text-gray-500">
                        Created {new Date(group.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => goToChat(group.id)}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-green-600"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Direct Access */}
          <Card>
            <CardHeader>
              <CardTitle>Direct Group Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Enter Group ID:
                </label>
                <Input
                  value={directGroupId}
                  onChange={(e) => setDirectGroupId(e.target.value)}
                  placeholder="e.g., 897badb8-f264-447f-a638-55970d246d52"
                  className="mb-3"
                />
                <Button
                  onClick={() => directGroupId && goToChat(directGroupId)}
                  disabled={!directGroupId.trim()}
                  className="w-full"
                >
                  Go to Chat
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">From Debug Results:</h4>
                <p className="text-sm text-blue-700 mb-2">Test_Group_02 ID:</p>
                <code className="text-xs bg-blue-100 px-2 py-1 rounded break-all">
                  897badb8-f264-447f-a638-55970d246d52
                </code>
                <Button
                  onClick={() => goToChat("897badb8-f264-447f-a638-55970d246d52")}
                  size="sm"
                  className="w-full mt-2"
                  variant="outline"
                >
                  Quick Access to Test_Group_02
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>🧪 Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">What to Test:</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>✅ Send a message and see it appear instantly</li>
                  <li>✅ Check message timestamps</li>
                  <li>✅ Verify your name displays correctly</li>
                  <li>✅ Test Enter key to send</li>
                  <li>✅ Try sending multiple messages quickly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Expected Behavior:</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Messages appear immediately when sent</li>
                  <li>• Your messages show on the right (blue)</li>
                  <li>• Other messages show on the left (white)</li>
                  <li>• Auto-scroll to latest message</li>
                  <li>• Loading spinner while sending</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

