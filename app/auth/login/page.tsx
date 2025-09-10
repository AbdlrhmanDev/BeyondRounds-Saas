"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Heart, Eye, EyeOff, ArrowLeft } from "lucide-react"
import ModernNav from "@/components/modern-nav"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-blue-600/20 to-cyan-500/20 animate-gradient-shift"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-purple-500/10 via-transparent to-blue-500/10 animate-pulse-slow"></div>
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-violet-400/30 to-purple-600/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Glass morphism overlay */}
      <div className="min-h-screen bg-white/5 backdrop-blur-[1px] supports-backdrop-blur:bg-white/5 supports-no-backdrop-blur:bg-white/90">
        <ModernNav transparent />
        
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 pt-24">
          <div className="w-full max-w-md animate-slide-up">
            {/* Back to Home */}
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-violet-600 transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <div className="flex flex-col gap-6">
              <Card className="glass-card border-white/20 shadow-glass-lg">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold gradient-text-primary">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-600">Sign in to your BeyondRounds account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin}>
                    <div className="flex flex-col gap-6">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full glass-button hover:scale-105 transition-all duration-300 btn-shimmer"
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading || isLoading}
                      >
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
                        {isGoogleLoading ? "Signing in..." : "Continue with Google"}
                      </Button>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-gray-500 font-medium">Or continue with email</span>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="doctor@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/80 focus:border-violet-300 transition-all duration-200"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/80 focus:border-violet-300 transition-all duration-200 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-white/20"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      {error && (
                        <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105 btn-shimmer" 
                        disabled={isLoading || isGoogleLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Signing in...
                          </div>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/sign-up" className="font-medium text-violet-600 hover:text-violet-700 transition-colors underline-offset-4 hover:underline">
                          Create account
                        </Link>
                      </p>
                      <Link href="/auth/forgot-password" className="text-sm text-gray-500 hover:text-violet-600 transition-colors mt-2 inline-block">
                        Forgot your password?
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
