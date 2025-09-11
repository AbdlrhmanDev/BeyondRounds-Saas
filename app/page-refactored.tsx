"use client"

import { HeroSection, FeatureCard, TestimonialCard } from '@/components/landing/landing-components'
import { useAuth } from '@/hooks/use-auth'
import { 
  Shield, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  Star, 
  Zap, 
  Globe, 
  Heart
} from 'lucide-react'

export default function LandingPage() {
  const { user, loading } = useAuth()

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
        <HeroSection user={user} />

        {/* How It Works Section */}
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
              <FeatureCard
                icon={Shield}
                title="Get Verified"
                description="Upload your medical license and ID for quick verification. We ensure all members are legitimate healthcare professionals."
                step={1}
                gradientFrom="from-violet-500/15"
                gradientTo="to-blue-500/15"
              />
              <FeatureCard
                icon={Users}
                title="Smart Matching"
                description="Our algorithm matches you with 2-3 doctors based on specialty, interests, location, and availability every Thursday."
                step={2}
                gradientFrom="from-blue-500/15"
                gradientTo="to-cyan-500/15"
              />
              <FeatureCard
                icon={MessageCircle}
                title="Connect & Meet"
                description="Chat with your matches, plan meetups, and build lasting friendships with fellow medical professionals."
                step={3}
                gradientFrom="from-cyan-500/15"
                gradientTo="to-purple-500/15"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
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
                <FeatureCard
                  icon={CheckCircle}
                  title="Verified Medical Professionals Only"
                  description="Connect with confidence knowing every member is a verified healthcare professional."
                  gradientFrom="from-green-500/10"
                  gradientTo="to-emerald-500/10"
                />
                <FeatureCard
                  icon={Zap}
                  title="AI-Powered Matching"
                  description="Smart algorithm considers specialty, interests, location, and schedule compatibility."
                  gradientFrom="from-violet-500/10"
                  gradientTo="to-purple-500/10"
                />
                <FeatureCard
                  icon={MessageCircle}
                  title="Private Group Chats"
                  description="Secure, private conversations with your matches facilitated by our AI assistant."
                  gradientFrom="from-blue-500/10"
                  gradientTo="to-cyan-500/10"
                />
              </div>

              <div className="space-y-10">
                <FeatureCard
                  icon={Star}
                  title="Weekly Fresh Matches"
                  description="New connections every Thursday, expanding your professional and social network."
                  gradientFrom="from-orange-500/10"
                  gradientTo="to-red-500/10"
                />
                <FeatureCard
                  icon={Globe}
                  title="Local Focus"
                  description="Meet doctors in your city for real-world connections and friendships."
                  gradientFrom="from-teal-500/10"
                  gradientTo="to-cyan-500/10"
                />
                <FeatureCard
                  icon={Shield}
                  title="30-Day Guarantee"
                  description="Not satisfied? Get your money back within 30 days, no questions asked."
                  gradientFrom="from-emerald-500/10"
                  gradientTo="to-green-500/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
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
              <TestimonialCard
                name="Dr. Sarah Chen"
                role="Cardiologist"
                location="San Francisco"
                content="BeyondRounds helped me find my closest friends in the medical field. The matching algorithm is incredible!"
                initials="SC"
                gradientFrom="from-green-500/15"
                gradientTo="to-emerald-500/15"
              />
              <TestimonialCard
                name="Dr. Michael Johnson"
                role="Emergency Medicine"
                location="Chicago"
                content="Finally, a platform that understands the unique challenges doctors face. Made amazing connections here."
                initials="MJ"
                gradientFrom="from-blue-500/15"
                gradientTo="to-cyan-500/15"
              />
              <TestimonialCard
                name="Dr. Aisha Patel"
                role="Pediatrics"
                location="Austin"
                content="The verification process gives me confidence, and the matches have been spot-on. Highly recommended!"
                initials="AP"
                gradientFrom="from-purple-500/15"
                gradientTo="to-pink-500/15"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
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
                <a href={user ? "/dashboard" : "/auth/sign-up"}>
                  <button className="relative overflow-hidden bg-white text-violet-700 hover:bg-gray-50 px-10 py-5 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-110 group border border-white/20 rounded-2xl">
                    <span className="relative z-10">{user ? "Go to Dashboard" : "Get Started Today"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/0 via-violet-600/15 to-violet-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  </button>
                </a>
                <a href="/about">
                  <button className="px-10 py-5 text-lg font-semibold border-2 border-white/40 text-white hover:bg-white/15 hover:border-white/60 transition-all duration-500 hover:scale-105 backdrop-blur-xl group rounded-2xl">
                    <span className="flex items-center gap-3">
                      Learn More
                      <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    </span>
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
