'use client'
 
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { User, Session } from '@supabase/supabase-js'
 
export default function AuthDebugPage() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
 
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('Session:', session)
        console.log('Session Error:', sessionError)
        
        setSession(session)
        
        if (session?.user) {
          setUser(session.user)
          
          // Get profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle()
            
          console.log('Profile:', profileData)
          console.log('Profile Error:', profileError)
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setIsLoading(false)
      }
    }
 
    checkAuth()
 
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
      setSession(session)
      setUser(session?.user || null)
    })
 
    return () => subscription.unsubscribe()
  }, [supabase.auth])
 
  const handleLogin = async () => {
    router.push('/auth/login')
  }
 
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }
 
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading authentication status...</p>
        </div>
      </div>
    )
  }
 
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Status */}
            <div>
              <h3 className="text-lg font-semibold mb-2">User Status</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
 
            {/* Session Status */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Session Status</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </div>
 
            {/* Profile Status */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Profile Status</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </div>
            </div>
 
            {/* Environment Variables */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Environment Variables</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="text-sm space-y-1">
                  <div>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</div>
                  <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</div>
                </div>
              </div>
            </div>
 
            {/* Actions */}
            <div className="flex space-x-4">
              {!user ? (
                <Button onClick={handleLogin}>
                  Go to Login
                </Button>
              ) : (
                <>
                  <Button onClick={() => router.push('/dashboard')}>
                    Go to Dashboard
                  </Button>
                  <Button onClick={handleLogout} variant="outline">
                    Logout
                  </Button>
                </>
              )}
            </div>
 
            {/* Quick Test Credentials */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Test Credentials</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <div>Email: test@beyondrounds.com</div>
                <div>Password: TestPassword123!</div>
                <div className="text-xs text-blue-600 mt-2">
                  * Make sure this user exists in your Supabase Auth
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}