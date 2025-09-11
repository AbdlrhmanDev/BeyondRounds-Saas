"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Starting sign-up process for:", email)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      })

      if (signUpError) {
        console.log("[v0] Sign-up error:", signUpError)
        throw signUpError
      }

      console.log("[v0] Sign-up successful, user created:", data.user?.id)

      setTimeout(() => {
        router.push("/auth/sign-up-success")
      }, 500)
    } catch (error: unknown) {
      console.log("[v0] Sign-up failed:", error)
      setError(error instanceof Error ? error.message : "An error occurred during sign-up")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    const supabase = createClient()
    setIsGoogleLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 md:p-10">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-blue-600/20 to-cyan-500/20 animate-gradient-shift"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-purple-500/10 via-transparent to-blue-500/10 animate-pulse-slow"></div>
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-violet-400/30 to-purple-600/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Glass morphism overlay */}
      <div className="min-h-screen w-full bg-white/5 backdrop-blur-[1px] supports-backdrop-blur:bg-white/5 supports-no-backdrop-blur:bg-white/90 flex items-center justify-center">
        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col gap-6">
            {/* Enhanced glassmorphic card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/25 to-cyan-500/25 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <Card className="relative bg-white/40 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/50 group-hover:border-white/40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10 text-center pb-8">
                  {/* Enhanced logo/icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                    <Heart className="w-8 h-8 text-white group-hover:animate-pulse" />
                  </div>
                  <CardTitle className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-700 via-blue-700 to-cyan-700 bg-clip-text text-transparent animate-gradient-text">
                    Join BeyondRounds
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-lg mt-3">
                    Create your account to connect with fellow doctors
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 p-8">
                  <form onSubmit={handleSignUp}>
                    <div className="flex flex-col gap-6">
                      {/* Enhanced Google Sign-up Button */}
                      <div className="group/btn relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-lg group-hover/btn:blur-xl transition-all duration-300"></div>
                        <Button
                          type="button"
                          variant="outline"
                          className="relative w-full bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80 hover:border-white/40 transition-all duration-300 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl group-hover/btn:scale-105"
                          onClick={handleGoogleSignUp}
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
                          {isGoogleLoading ? "Signing up..." : "Continue with Google"}
                        </Button>
                      </div>

                      {/* Enhanced Divider */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-white/30" />
                        </div>
                        <div className="relative flex justify-center text-sm uppercase">
                          <span className="bg-white/40 backdrop-blur-sm px-4 py-2 text-gray-600 font-medium rounded-full border border-white/30">
                            Or continue with email
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Form Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="firstName" className="text-gray-700 font-semibold text-sm">
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white/80 focus:border-white/50 transition-all duration-300 py-3 px-4 rounded-xl text-gray-800 placeholder:text-gray-500"
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="lastName" className="text-gray-700 font-semibold text-sm">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Smith"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white/80 focus:border-white/50 transition-all duration-300 py-3 px-4 rounded-xl text-gray-800 placeholder:text-gray-500"
                          />
                        </div>
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="doctor@hospital.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white/80 focus:border-white/50 transition-all duration-300 py-3 px-4 rounded-xl text-gray-800 placeholder:text-gray-500"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="password" className="text-gray-700 font-semibold text-sm">
                          Password
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Create a strong password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white/80 focus:border-white/50 transition-all duration-300 py-3 px-4 rounded-xl text-gray-800 placeholder:text-gray-500"
                        />
                      </div>
                      {/* Enhanced Error Message */}
                      {error && (
                        <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl p-4">
                          <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                      )}

                      {/* Enhanced Submit Button */}
                      <div className="group/submit relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-xl blur-lg group-hover/submit:blur-xl transition-all duration-300"></div>
                        <Button 
                          type="submit" 
                          className="relative w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white py-6 text-lg font-bold shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-500 hover:scale-105 rounded-xl border border-white/20 group btn-shimmer animate-glow" 
                          disabled={isLoading || isGoogleLoading}
                        >
                          <span className="relative z-10 flex items-center gap-3">
                            {isLoading ? "Creating account..." : "Create Account"}
                            {!isLoading && <div className="w-2 h-2 bg-white/90 rounded-full animate-pulse"></div>}
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                        </Button>
                      </div>
                    </div>

                    {/* Enhanced Footer Links */}
                    <div className="mt-8 space-y-4 text-center">
                      <div className="text-gray-600">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors duration-200 hover:underline underline-offset-4">
                          Sign in
                        </Link>
                      </div>
                      <div className="text-gray-600">
                        Want the full experience?{" "}
                        <Link href="/join" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline underline-offset-4">
                          Join as a doctor
                        </Link>
                      </div>
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
