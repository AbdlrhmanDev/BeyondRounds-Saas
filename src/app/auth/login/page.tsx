'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
 
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
 
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const errorParam = searchParams.get('error')
  const supabase = createClient()
 
  // Handle successful login by listening to auth state changes
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsLoading(false)
        // The redirect will be handled by the auth hook
      }
    })
 
    return () => subscription.unsubscribe()
  }, [supabase.auth])
 
  // Handle error parameters from OAuth callback
  React.useEffect(() => {
    if (errorParam === 'no-account') {
      setError('You don\'t have an account. Make an account.')
    } else if (errorParam === 'verification-failed') {
      setError('Unable to verify your account. Please try again or make an account.')
    }
  }, [errorParam])
 
  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
 
    // Enhanced debugging and validation
    console.log('🔐 Login attempt started')
    console.log('📧 Email:', email.trim())
    console.log('🔑 Password length:', password.length)
    console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔑 Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
 
    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address')
      setIsLoading(false)
      return
    }
 
    if (!password) {
      setError('Please enter your password')
      setIsLoading(false)
      return
    }
 
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }
 
    try {
      console.log('🚀 Attempting Supabase authentication...')
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password 
      })
 
      console.log('📊 Auth response:', { data, error })
 
      if (error) {
        console.error('❌ Login error details:', {
          message: error.message,
          status: error.status,
          code: error.code,
          details: (error as any).details,
          hint: (error as any).hint
        })
 
        // Enhanced error handling
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setError('Email not confirmed. We can resend the confirmation email.')
        } else if (error.message.toLowerCase().includes('invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (error.message.toLowerCase().includes('too many requests')) {
          setError('Too many login attempts. Please wait a moment and try again.')
        } else if (error.message.toLowerCase().includes('user not found')) {
          setError('No account found with this email address. Please sign up first.')
        } else {
          setError(`Login failed: ${error.message}`)
        }
        setIsLoading(false)
        return
      }
 
      // Login successful
      console.log('✅ Login successful!')
      console.log('👤 User data:', data.user)
      console.log('🔑 Session:', data.session)
      
      // Direct redirect after successful login
      console.log('🔄 Redirecting to:', redirectTo)
      router.push(redirectTo)
      
    } catch (error: any) {
      console.error('💥 Unexpected login error:', error)
      setError('Unable to sign in. Please check your credentials or make an account.')
      setIsLoading(false)
    }
  }
 
  const resend = async () => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback` },
    })
    if (error) console.error('resend error', error)
    else setError('Confirmation email sent.')
  }
 
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')
 
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
        },
      })
 
      if (error) throw error
    } catch (error: any) {
      console.error('Google login error:', error)
      setError('Unable to sign in with Google. Please contact support if you need an account.')
      setIsLoading(false)
    }
  }
 
  // Debug function to create a test user
  const createTestUser = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      console.log('🧪 Creating test user...')
      
      const testEmail = 'test@beyondrounds.com'
      const testPassword = 'TestPassword123!'
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
 
      if (error) {
        console.error('❌ Test user creation error:', error)
        setError(`Failed to create test user: ${error.message}`)
      } else {
        console.log('✅ Test user created successfully:', data)
        setError('Test user created! You can now login with: test@beyondrounds.com / TestPassword123!')
        
        // Auto-fill the form
        setEmail(testEmail)
        setPassword(testPassword)
      }
    } catch (error: any) {
      console.error('💥 Unexpected error creating test user:', error)
      setError('Failed to create test user. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Sign in to BeyondRounds
          </CardTitle>
          <CardDescription className="text-center">
            Welcome back to your medical professional community
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
 
          <form onSubmit={onLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
 
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
 
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
 
          {error && error.includes('Email not confirmed') && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={resend}
              disabled={isLoading}
            >
              Resend confirmation
            </Button>
          )}
 
          {/* Debug section - only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="border-t pt-4">
              <div className="text-xs text-gray-500 mb-2">Debug Tools:</div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={createTestUser}
                disabled={isLoading}
              >
                Create Test User
              </Button>
            </div>
          )}
 
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              
                Or continue with
              
            </div>
          </div>
 
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
 
          <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <strong>Don't have an account?</strong>
            <br />
            <Link href="/auth/sign-up" className="text-blue-600 hover:underline font-medium">
              Create your account here
            </Link>
          </div>
 
          <div className="text-center text-sm">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}