"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Users, 
  MessageCircle, 
  Heart, 
  CheckCircle, 
  Star, 
  Zap, 
  Globe, 
  Calendar,
  UserCheck,
  Search,
  Coffee,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Award
} from "lucide-react"
import Link from "next/link"
import ModernNav from "@/components/modern-nav"
import Footer from "@/components/footer"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"

export default function HowItWorksPage() {
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
        <ModernNav />

        {/* Hero Section */}
        <section className="py-32 px-4 relative overflow-hidden">
          {/* Enhanced floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-3 h-3 bg-gradient-to-r from-violet-400/60 to-purple-500/60 rounded-full animate-pulse shadow-lg shadow-violet-500/30"></div>
            <div className="absolute top-40 right-20 w-2 h-2 bg-gradient-to-r from-blue-400/60 to-cyan-500/60 rounded-full animate-bounce shadow-lg shadow-blue-500/30"></div>
            <div className="absolute bottom-40 left-1/4 w-2.5 h-2.5 bg-gradient-to-r from-emerald-400/60 to-teal-500/60 rounded-full animate-ping shadow-lg shadow-emerald-500/30"></div>
            <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-gradient-to-r from-pink-400/60 to-rose-500/60 rounded-full animate-pulse shadow-lg shadow-pink-500/30"></div>
          </div>

          <div className="container mx-auto text-center max-w-5xl relative z-10">
            {/* Enhanced Glassmorphic badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-12 bg-white/15 backdrop-blur-xl rounded-full border border-white/30 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-500 hover:scale-105 group">
              <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-blue-500 rounded-full animate-pulse group-hover:animate-spin"></div>
              <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-text">
                Simple Process
              </span>
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-emerald-500 rounded-full animate-ping"></div>
            </div>

            {/* Enhanced Gradient headline */}
            <h1 className="text-6xl lg:text-8xl font-bold mb-8 text-balance leading-tight">
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent animate-gradient-text drop-shadow-2xl">
                How BeyondRounds
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent animate-gradient-text drop-shadow-2xl" style={{animationDelay: '1s'}}>
                Works for You
              </span>
            </h1>

            {/* Enhanced supportive copy */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
              Our intelligent matching system connects you with like-minded medical professionals in your area
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent font-semibold animate-gradient-text"> in just three simple steps</span>.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Verified Doctors Only</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <span>AI-Powered Matching</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span>95% Success Rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Steps Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-violet-400/10 to-blue-500/10 rounded-full blur-2xl animate-float"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-blue-400/10 to-cyan-500/10 rounded-full blur-2xl animate-float-delayed"></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-3 gap-12">
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
                      healthcare professionals for your safety and peace of mind.
                    </p>
                    
                    {/* Sub-features */}
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span>Medical license verification</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span>Photo ID confirmation</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                        <span>Usually approved within 24 hours</span>
                      </div>
                    </div>
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
                      <Search className="w-10 h-10 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-blue-100/80 backdrop-blur-sm rounded-full border border-blue-200/50">
                      <span className="text-sm font-semibold text-blue-700">Step 2</span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">Smart Matching</h3>
                    <p className="text-gray-600 leading-relaxed text-lg mb-8">
                      Our AI algorithm matches you with 2-3 doctors every Thursday based on specialty, interests, location, 
                      and availability. Each match is carefully curated for compatibility.
                    </p>
                    
                    {/* Sub-features */}
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <Zap className="w-3 h-3 text-white" />
                        </div>
                        <span>AI-powered compatibility</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <MapPin className="w-3 h-3 text-white" />
                        </div>
                        <span>Location-based matching</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <Calendar className="w-3 h-3 text-white" />
                        </div>
                        <span>Weekly fresh connections</span>
                      </div>
                    </div>
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
                      <Coffee className="w-10 h-10 text-white group-hover:animate-pulse" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-purple-100/80 backdrop-blur-sm rounded-full border border-purple-200/50">
                      <span className="text-sm font-semibold text-purple-700">Step 3</span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-cyan-700 to-purple-700 bg-clip-text text-transparent">Connect & Meet</h3>
                    <p className="text-gray-600 leading-relaxed text-lg mb-8">
                      Chat with your matches in private group conversations, plan meetups, and build lasting friendships 
                      with fellow medical professionals who share your interests.
                    </p>
                    
                    {/* Sub-features */}
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-3 h-3 text-white" />
                        </div>
                        <span>Private group chats</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <Users className="w-3 h-3 text-white" />
                        </div>
                        <span>Plan meetups together</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <Heart className="w-3 h-3 text-white" />
                        </div>
                        <span>Build lasting friendships</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Process Timeline */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="container mx-auto max-w-4xl relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">Timeline</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-text drop-shadow-lg">
                  Your Journey to New Friendships
                </span>
              </h2>
            </div>

            <div className="space-y-12">
              {/* Timeline Item 1 */}
              <div className="flex gap-8 items-start group">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 group-hover:scale-110 transition-all duration-300">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-0.5 h-16 bg-gradient-to-b from-violet-500 to-blue-600 mx-auto mt-4"></div>
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">Sign Up & Verification</h3>
                    <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">Day 1</Badge>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Create your profile, upload your medical credentials, and tell us about your interests and availability. 
                    Our team reviews and approves your application within 24 hours.
                  </p>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="flex gap-8 items-start group">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-300">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-0.5 h-16 bg-gradient-to-b from-blue-500 to-cyan-600 mx-auto mt-4"></div>
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">First Match</h3>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Thursday</Badge>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Receive your first group of 2-3 carefully matched doctors every Thursday at 4 PM. 
                    Get notified via email and in-app notification when your group is ready.
                  </p>
                </div>
              </div>

              {/* Timeline Item 3 */}
              <div className="flex gap-8 items-start group">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:shadow-cyan-500/50 group-hover:scale-110 transition-all duration-300">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-0.5 h-16 bg-gradient-to-b from-cyan-500 to-purple-600 mx-auto mt-4"></div>
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">Start Chatting</h3>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Same Day</Badge>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Join your private group chat facilitated by our AI assistant, RoundsBot. 
                    Get conversation starters and activity suggestions to break the ice.
                  </p>
                </div>
              </div>

              {/* Timeline Item 4 */}
              <div className="flex gap-8 items-start group">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 group-hover:scale-110 transition-all duration-300">
                    <Coffee className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">Meet in Person</h3>
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Within a Week</Badge>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Plan your first meetup together - coffee, dinner, hiking, or any activity you all enjoy. 
                    Build genuine friendships that extend beyond the hospital walls.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="container mx-auto max-w-4xl relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">Common Questions</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-8">
                <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent animate-gradient-text drop-shadow-lg">
                  Frequently Asked Questions
                </span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="group relative overflow-hidden bg-white/50 backdrop-blur-2xl border border-white/30 hover:bg-white/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg text-gray-900">How does matching work?</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600">Our AI considers your specialty, interests, location, and availability to create compatible groups of 2-3 doctors every Thursday.</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-white/50 backdrop-blur-2xl border border-white/30 hover:bg-white/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg text-gray-900">Is it safe to meet strangers?</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600">All members are verified doctors, and we encourage meeting in public places. Our AI facilitator helps plan safe meetups.</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-white/50 backdrop-blur-2xl border border-white/30 hover:bg-white/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg text-gray-900">What if I don't click with my group?</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600">You get new matches every week! Our algorithm learns from feedback to make better matches over time.</p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-white/50 backdrop-blur-2xl border border-white/30 hover:bg-white/60 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg text-gray-900">How much does it cost?</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-gray-600">Plans start at €9.99 for your first month trial. All plans include our 30-day friendship guarantee.</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <Link href="/faq">
                <Button variant="outline" size="lg" className="group bg-white/50 backdrop-blur-xl border-white/30 hover:bg-white/70 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  View All FAQs
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
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
                  Ready to Start?
                </span>
                <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-emerald-500 rounded-full animate-ping"></div>
              </div>
              
              <h2 className="text-5xl lg:text-6xl font-bold mb-8">
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent drop-shadow-2xl">
                  Ready to Find Your Tribe?
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-blue-50 mb-12 leading-relaxed max-w-2xl mx-auto">
                Join hundreds of doctors who have found their professional community and lasting friendships through BeyondRounds.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-white/50 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                  <Link href={user ? "/dashboard" : "/auth/sign-up"}>
                    <Button size="lg" className="relative overflow-hidden bg-white text-violet-700 hover:bg-gray-50 px-12 py-6 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 group border border-white/20 rounded-2xl">
                      <span className="relative z-10 flex items-center gap-3">
                        {user ? "Go to Dashboard" : "Start Your Journey"}
                        <div className="w-3 h-3 bg-violet-600 rounded-full animate-pulse group-hover:animate-spin shadow-lg shadow-violet-600/50"></div>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/15 to-violet-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    </Button>
                  </Link>
                </div>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="px-12 py-6 text-xl font-semibold border-2 border-white/40 text-white hover:bg-white/15 hover:border-white/60 transition-all duration-500 hover:scale-105 backdrop-blur-xl group rounded-2xl">
                    <span className="flex items-center gap-3">
                      Learn More
                      <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      
      </div>
    </div>
  )
}
