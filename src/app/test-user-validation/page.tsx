'use client'
 
import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { validateUserExists } from '@/lib/utils/user-validation'
 
export default function TestUserValidationPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState('')
  const supabase = createClient()
 
  const testLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setResult('')
 
    try {
      // First, try to authenticate with Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
 
      if (authError) {
        setError(`Authentication failed: ${authError.message}`)
        return
      }
 
      if (data.user) {
        // Now validate if user exists in our database
        const validation = await validateUserExists(data.user)
        
        if (validation.exists) {
          setResult(`✅ User exists in database! Name: ${validation.profile?.first_name} ${validation.profile?.last_name}`)
        } else {
          setResult(`❌ User does not exist in database: ${validation.error}`)
          // Sign out the user since they don't exist in our database
          await supabase.auth.signOut()
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setError(`Test failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }
 
  const testWithNonExistentUser = async () => {
    setIsLoading(true)
    setError('')
    setResult('')
 
    try {
      // Try to authenticate with a non-existent user
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      })
 
      if (authError) {
        setResult(`❌ Authentication failed as expected: ${authError.message}`)
      } else if (data.user) {
        // This shouldn't happen, but if it does, validate
        const validation = await validateUserExists(data.user)
        if (!validation.exists) {
          setResult(`❌ User authenticated but doesn't exist in database: ${validation.error}`)
          await supabase.auth.signOut()
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setResult(`Test completed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            User Validation Test
          </CardTitle>
          <CardDescription className="text-center">
            Test the user validation flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
 
          {result && (
            <Alert>
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          )}
 
          <form onSubmit={testLogin} className="space-y-4">
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
              Test Login with User Validation
            </Button>
          </form>
 
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              
                Or test with
              
            </div>
          </div>
 
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={testWithNonExistentUser}
            disabled={isLoading}
          >
            Test Non-Existent User
          </Button>
 
          <div className="text-center text-sm text-muted-foreground">
            <p>This page tests the user validation flow:</p>
            <ul className="text-left mt-2 space-y-1">
              <li>• Authenticates with Supabase</li>
              <li>• Checks if user exists in users table</li>
              <li>• Shows appropriate error messages</li>
              <li>• Signs out non-existent users</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}