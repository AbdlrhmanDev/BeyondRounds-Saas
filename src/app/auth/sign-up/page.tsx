'use client'
 
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
 
export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()
 
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')
 
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // مهم لو مفعّل تأكيد الإيميل
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
 
      if (error) {
        console.error('signup error', error)
        
        // Handle specific error cases
        if (error.message.includes('User already registered') || error.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else if (error.message.includes('Password should be at least')) {
          setError('Password must be at least 6 characters long.')
        } else if (error.message.includes('Invalid email')) {
          setError('Please enter a valid email address.')
        } else {
          setError(error.message)
        }
        return
      }
 
      // لو تأكيد الإيميل مطفّي: غالبًا صار عندك session، ودّه للدashboard
      const session = (await supabase.auth.getSession()).data.session
      if (session) {
        router.replace('/dashboard')
      } else {
        // مفعّل تأكيد الإيميل
        setMessage('Check your email to confirm your account.')
      }
    } catch (error: unknown) {
      console.error('Sign up error:', error)
      setError('Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Join BeyondRounds
          </CardTitle>
          <CardDescription className="text-center">
            Join verified medical professionals and build meaningful friendships
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error}
                {error.includes('already exists') && (
                  <div className="mt-2">
                    <Link
                      href="/auth/login"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Sign in to your account →
                    </Link>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
 
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
 
          <form onSubmit={onSubmit} className="space-y-4">
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
                placeholder="john.doe@example.com"
                disabled={isLoading}
              />
            </div>
 
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
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
              Create Account
            </Button>
          </form>
 
          <div className="text-center text-sm space-y-2">
            <div>
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
            <div>
              Forgot your password?{' '}
              <Link
                href="/auth/forgot-password"
                className="font-medium text-primary hover:underline"
              >
                Reset it here
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}