"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, MessageCircle, Shield, Heart, Star, Zap, Globe, Command } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-blue-600/20 to-cyan-500/20 animate-gradient-shift"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-purple-500/10 via-transparent to-blue-500/10 animate-pulse-slow"></div>
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-violet-400/30 to-purple-600/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Glass morphism overlay */}
      <div className="min-h-screen bg-white/5 backdrop-blur-[1px] supports-backdrop-blur:bg-white/5 supports-no-backdrop-blur:bg-white/90">

        {/* Hero Section */}
        <section className="relative py-32 px-4 overflow-hidden">
          {/* Enhanced floating particles with more variety */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-3 h-3 bg-gradient-to-r from-violet-400/60 to-purple-500/60 rounded-full animate-pulse shadow-lg shadow-violet-500/30"></div>
            <div className="absolute top-40 right-20 w-2 h-2 bg-gradient-to-r from-blue-400/60 to-cyan-500/60 rounded-full animate-bounce shadow-lg shadow-blue-500/30"></div>
            <div className="absolute bottom-40 left-1/4 w-2.5 h-2.5 bg-gradient-to-r from-emerald-400/60 to-teal-500/60 rounded-full animate-ping shadow-lg shadow-emerald-500/30"></div>
            <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-gradient-to-r from-pink-400/60 to-rose-500/60 rounded-full animate-pulse shadow-lg shadow-pink-500/30"></div>
            <div className="absolute bottom-20 right-1/4 w-3 h-3 bg-gradient-to-r from-indigo-400/60 to-violet-500/60 rounded-full animate-bounce shadow-lg shadow-indigo-500/30"></div>
            <div className="absolute top-1/3 left-1/3 w-4 h-4 bg-gradient-to-r from-yellow-400/40 to-orange-500/40 rounded-full animate-float"></div>
            <div className="absolute bottom-1/3 right-1/5 w-2 h-2 bg-gradient-to-r from-green-400/50 to-emerald-500/50 rounded-full animate-float-delayed"></div>
          </div>

          <div className="container mx-auto text-center max-w-5xl relative z-10">
            {/* Enhanced Glassmorphic badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-12 bg-white/15 backdrop-blur-xl rounded-full border border-white/30 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-500 hover:scale-105 group">
              <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-blue-500 rounded-full animate-pulse group-hover:animate-spin"></div>
              <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-text">
                Where doctors become friends
              </span>
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-emerald-500 rounded-full animate-ping"></div>
            </div>

            {/* Enhanced Gradient headline with more dynamic effects */}
            <h1 className="text-6xl lg:text-8xl font-bold mb-8 text-balance leading-tight">
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent animate-gradient-text drop-shadow-2xl">
                Connect with Fellow
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent animate-gradient-text drop-shadow-2xl" style={{animationDelay: '1s'}}>
                Doctors in Your City
              </span>
            </h1>

            {/* Enhanced supportive copy */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
              Join verified medical professionals for meaningful connections, shared experiences, and lasting friendships
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent font-semibold animate-gradient-text"> beyond the hospital walls</span>.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                  <Button size="lg" className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white px-12 py-6 text-xl font-bold shadow-3xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-500 hover:scale-110 group btn-shimmer animate-glow border border-white/20 rounded-2xl">
                    <span className="relative z-10 flex items-center gap-3">
                      {user ? "Go to Dashboard" : "Start Connecting Today"}
                      <div className="w-3 h-3 bg-white/90 rounded-full animate-pulse group-hover:animate-spin shadow-lg shadow-white/50"></div>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                  </Button>
                </Link>
              </div>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="relative px-12 py-6 text-xl font-semibold border-2 border-violet-200/50 text-violet-700 hover:bg-violet-50/80 hover:border-violet-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-xl bg-white/60 hover:shadow-2xl hover:shadow-violet-500/20 group rounded-2xl">
                    <span className="flex items-center gap-3">
                      Learn More
                      <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>30-Day Friendship Guarantee</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>Verified Doctors Only</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>4.9/5 Rating</span>
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-violet-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
        </section>

        {/* Enhanced How It Works */}
        <section className="py-24 px-4 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-violet-400/10 to-blue-500/10 rounded-full blur-2xl animate-float"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-blue-400/10 to-cyan-500/10 rounded-full blur-2xl animate-float-delayed"></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">Simple Process</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold mb-8">
                <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent animate-gradient-text drop-shadow-lg">
                  How BeyondRounds Works
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Our intelligent matching system connects you with like-minded medical professionals in your area.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {/* Enhanced Step 1 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/15 to-blue-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 text-center shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/60 group-hover:border-white/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-violet-500/30 group-hover:shadow-violet-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                      <Shield className="w-10 h-10 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-violet-100/80 backdrop-blur-sm rounded-full border border-violet-200/50">
                      <span className="text-sm font-semibold text-violet-700">Step 1</span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-violet-700 to-blue-700 bg-clip-text text-transparent">Get Verified</h3>
                    <p className="text-gray-600 leading-relaxed text-lg mb-8">
                      Upload your medical license and ID for quick verification. We ensure all members are legitimate
                      healthcare professionals.
                    </p>
                    <Link href="/how-it-works">
                      <Button variant="ghost" className="text-violet-600 hover:text-violet-700 hover:bg-violet-50/80 group/btn px-6 py-3 rounded-xl backdrop-blur-sm border border-violet-200/50 hover:border-violet-300/70 transition-all duration-300">
                        Learn more
                        <span className="ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Enhanced Step 2 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 text-center shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/60 group-hover:border-white/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                      <Users className="w-10 h-10 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-blue-100/80 backdrop-blur-sm rounded-full border border-blue-200/50">
                      <span className="text-sm font-semibold text-blue-700">Step 2</span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">Smart Matching</h3>
                    <p className="text-gray-600 leading-relaxed text-lg mb-8">
                      Our algorithm matches you with 2-3 doctors based on specialty, interests, location, and availability
                      every Thursday.
                    </p>
                    <Link href="/how-it-works">
                      <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 group/btn px-6 py-3 rounded-xl backdrop-blur-sm border border-blue-200/50 hover:border-blue-300/70 transition-all duration-300">
                        Learn more
                        <span className="ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Enhanced Step 3 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 to-purple-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 text-center shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/60 group-hover:border-white/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-cyan-500/30 group-hover:shadow-cyan-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                      <MessageCircle className="w-10 h-10 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-purple-100/80 backdrop-blur-sm rounded-full border border-purple-200/50">
                      <span className="text-sm font-semibold text-purple-700">Step 3</span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-cyan-700 to-purple-700 bg-clip-text text-transparent">Connect & Meet</h3>
                    <p className="text-gray-600 leading-relaxed text-lg mb-8">
                      Chat with your matches, plan meetups, and build lasting friendships with fellow medical professionals.
                    </p>
                    <Link href="/how-it-works">
                      <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50/80 group/btn px-6 py-3 rounded-xl backdrop-blur-sm border border-purple-200/50 hover:border-purple-300/70 transition-all duration-300">
                        Learn more
                        <span className="ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features */}
        <section id="features" className="py-24 px-4 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-48 h-48 bg-gradient-to-r from-emerald-400/10 to-teal-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-56 h-56 bg-gradient-to-r from-violet-400/10 to-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">Why Choose Us</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold mb-8">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent animate-gradient-text drop-shadow-lg">
                  Why Doctors Choose BeyondRounds
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-10">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative flex gap-6 p-8 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 hover:bg-white/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group-hover:border-white/40">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-green-500/30 group-hover:shadow-green-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                      <CheckCircle className="w-8 h-8 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-3 text-xl bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Verified Medical Professionals Only</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        Connect with confidence knowing every member is a verified healthcare professional.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative flex gap-6 p-8 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 hover:bg-white/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group-hover:border-white/40">
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-violet-500/30 group-hover:shadow-violet-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                      <Zap className="w-8 h-8 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-3 text-xl bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">AI-Powered Matching</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        Smart algorithm considers specialty, interests, location, and schedule compatibility.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative flex gap-6 p-8 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 hover:bg-white/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group-hover:border-white/40">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                      <MessageCircle className="w-8 h-8 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-3 text-xl bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">Private Group Chats</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        Secure, private conversations with your matches facilitated by our AI assistant.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative flex gap-6 p-8 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 hover:bg-white/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group-hover:border-white/40">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-orange-500/30 group-hover:shadow-orange-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                      <Star className="w-8 h-8 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-3 text-xl bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">Weekly Fresh Matches</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        New connections every Thursday, expanding your professional and social network.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative flex gap-6 p-8 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 hover:bg-white/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group-hover:border-white/40">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-teal-500/30 group-hover:shadow-teal-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                      <Globe className="w-8 h-8 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-3 text-xl bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">Local Focus</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        Meet doctors in your city for real-world connections and friendships.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <div className="relative flex gap-6 p-8 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 hover:bg-white/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group-hover:border-white/40">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/30 group-hover:shadow-emerald-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                      <Shield className="w-8 h-8 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-3 text-xl bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">30-Day Guarantee</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">
                        Not satisfied? Get your money back within 30 days, no questions asked.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Pricing Section */}
        <section id="pricing" className="py-24 px-4 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-cyan-500/10 rounded-full blur-3xl animate-float-delayed"></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            {/* <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">Transparent Pricing</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold mb-8">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent animate-gradient-text drop-shadow-lg">
                  Simple, Transparent Pricing
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Choose the plan that works best for your networking goals.
              </p>
            </div> */}

            <div className="grid md:grid-cols-3 gap-10">
              {/* Enhanced Basic Plan */}
              {/* <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-500/15 to-slate-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/60 group-hover:border-white/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-slate-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-gray-100/80 backdrop-blur-sm rounded-full border border-gray-200/50">
                        <span className="text-sm font-semibold text-gray-700">Basic</span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-700 to-slate-700 bg-clip-text text-transparent">Explorer</h3>
                      <div className="mb-8">
                        <span className="text-5xl font-bold text-gray-900">$29</span>
                        <span className="text-gray-600 text-xl">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-4 mb-10">
                      <li className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-600 text-lg">2 matches per week</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-600 text-lg">Basic chat features</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-600 text-lg">City-wide matching</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      Get Started
                    </Button>
                  </div>
                </div>
              </div> */}

              {/* Enhanced Pro Plan */}
              {/* <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/25 to-purple-500/25 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/50 backdrop-blur-2xl border-2 border-violet-200/50 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/60 group-hover:border-violet-300/70">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-xl border border-white/20">Most Popular</span>
                  </div>
                  <div className="relative z-10">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-violet-100/80 backdrop-blur-sm rounded-full border border-violet-200/50">
                        <span className="text-sm font-semibold text-violet-700">Professional</span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">Professional</h3>
                      <div className="mb-8">
                        <span className="text-5xl font-bold text-gray-900">$49</span>
                        <span className="text-gray-600 text-xl">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-4 mb-10">
                      <li className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-600 text-lg">3 matches per week</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-600 text-lg">Advanced chat features</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-600 text-lg">Priority matching</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-600 text-lg">Event invitations</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 animate-glow">
                      Get Started
                    </Button>
                  </div>
                </div>
              </div> */}

              {/* Enhanced Enterprise Plan */}
              {/* <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/60 group-hover:border-white/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-blue-100/80 backdrop-blur-sm rounded-full border border-blue-200/50">
                        <span className="text-sm font-semibold text-blue-700">Elite</span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">Elite</h3>
                      <div className="mb-8">
                        <span className="text-5xl font-bold text-gray-900">$99</span>
                        <span className="text-gray-600 text-xl">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-4 mb-10">
                      <li className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-600 text-lg">Unlimited matches</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-600 text-lg">Premium features</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-600 text-lg">Concierge service</span>
                      </li>
                      <li className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-600 text-lg">VIP events</span>
                      </li>
                    </ul>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      Get Started
                    </Button>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials */}
        <section className="py-24 px-4 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-56 h-56 bg-gradient-to-r from-green-400/10 to-teal-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-cyan-500/10 rounded-full blur-3xl animate-float-delayed"></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-teal-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">Testimonials</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold mb-8">
                <span className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-text drop-shadow-lg">
                  What Doctors Are Saying
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/15 to-emerald-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/60 group-hover:border-white/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-yellow-500 fill-current group-hover:animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-8 leading-relaxed text-lg italic">
                      "BeyondRounds helped me find my closest friends in the medical field. The matching algorithm is incredible!"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-green-500/30 group-hover:shadow-green-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                        <span className="text-white font-bold text-lg">SC</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">Dr. Sarah Chen</p>
                        <p className="text-sm text-gray-600">Cardiologist, San Francisco</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/60 group-hover:border-white/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-yellow-500 fill-current group-hover:animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-8 leading-relaxed text-lg italic">
                      "Finally, a platform that understands the unique challenges doctors face. Made amazing connections here."
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                        <span className="text-white font-bold text-lg">MJ</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">Dr. Michael Johnson</p>
                        <p className="text-sm text-gray-600">Emergency Medicine, Chicago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/60 group-hover:border-white/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-yellow-500 fill-current group-hover:animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-8 leading-relaxed text-lg italic">
                      "The verification process gives me confidence, and the matches have been spot-on. Highly recommended!"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30 group-hover:shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20">
                        <span className="text-white font-bold text-lg">AP</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">Dr. Aisha Patel</p>
                        <p className="text-sm text-gray-600">Pediatrics, Austin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-32 px-4 relative overflow-hidden">
          {/* Enhanced background */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/25 via-blue-600/25 to-cyan-500/25"></div>
          <div className="absolute inset-0 bg-gradient-to-tl from-purple-500/15 via-transparent to-blue-500/15 animate-pulse-slow"></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-violet-400/60 to-purple-500/60 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-3 h-3 bg-gradient-to-r from-blue-400/60 to-cyan-500/60 rounded-full animate-bounce"></div>
            <div className="absolute bottom-40 left-1/4 w-3.5 h-3.5 bg-gradient-to-r from-emerald-400/60 to-teal-500/60 rounded-full animate-ping"></div>
            <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-gradient-to-r from-pink-400/60 to-rose-500/60 rounded-full animate-pulse"></div>
          </div>

          <div className="container mx-auto text-center max-w-4xl relative z-10">
            <div className="bg-white/25 backdrop-blur-2xl border border-white/30 rounded-3xl p-16 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:bg-white/30">
              <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 bg-white/20 backdrop-blur-lg rounded-full border border-white/30 shadow-xl">
                <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  Ready to Connect?
                </span>
                <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-emerald-500 rounded-full animate-ping"></div>
              </div>
              
              <h2 className="text-5xl lg:text-7xl font-bold mb-8">
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-2xl">
                  Ready to Build Meaningful Connections?
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-blue-50 mb-12 leading-relaxed max-w-2xl mx-auto">
                Join hundreds of doctors who have found their professional community through BeyondRounds.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                  <Button size="lg" className="relative overflow-hidden bg-white text-violet-700 hover:bg-gray-50 px-10 py-5 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 group border border-white/20">
                    <span className="relative z-10">{user ? "Go to Dashboard" : "Get Started Today"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/15 to-violet-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="px-10 py-5 text-lg font-semibold border-2 border-white/40 text-white hover:bg-white/15 hover:border-white/60 transition-all duration-500 hover:scale-105 backdrop-blur-xl group">
                    <span className="flex items-center gap-3">
                      Learn More
                      <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Footer */}
    
      </div>
    </div>
  )
}
