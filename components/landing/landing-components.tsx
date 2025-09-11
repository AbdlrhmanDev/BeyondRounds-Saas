import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Users, MessageCircle, Shield, Heart, Star, Zap, Globe } from 'lucide-react'
import Link from 'next/link'
import { HeroSectionProps, HowItWorksStepProps, FeatureCardProps, TestimonialCardProps } from '@/lib/types'

export function HeroSection({ user }: HeroSectionProps) {
  return (
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
  )
}

export function HowItWorksStep({ stepNumber, icon, title, description, features, gradientFrom, gradientTo }: HowItWorksStepProps) {
  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientFrom}/15 ${gradientTo}/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
      <div className="relative bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 text-center shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/60 group-hover:border-white/40">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom}/5 ${gradientTo}/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        <div className="relative z-10">
          <div className={`w-20 h-20 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-${gradientFrom}/30 group-hover:shadow-${gradientFrom}/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20`}>
            {icon}
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 mb-4 bg-${gradientFrom}-100/80 backdrop-blur-sm rounded-full border border-${gradientFrom}-200/50`}>
            <span className={`text-sm font-semibold text-${gradientFrom}-700`}>Step {stepNumber}</span>
          </div>
          <h3 className={`text-2xl lg:text-3xl font-bold text-gray-900 mb-6 bg-gradient-to-r ${gradientFrom}-700 ${gradientTo}-700 bg-clip-text text-transparent`}>{title}</h3>
          <p className="text-gray-600 leading-relaxed text-lg mb-8">
            {description}
          </p>
          
          {/* Sub-features */}
          <div className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function FeatureCard({ icon, title, description, gradientFrom, gradientTo }: FeatureCardProps) {
  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientFrom}/10 ${gradientTo}/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500`}></div>
      <div className="relative flex gap-6 p-8 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/30 hover:bg-white/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group-hover:border-white/40">
        <div className={`w-16 h-16 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-${gradientFrom}/30 group-hover:shadow-${gradientFrom}/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-gray-900 mb-3 text-xl bg-gradient-to-r ${gradientFrom}-700 ${gradientTo}-700 bg-clip-text text-transparent`}>{title}</h3>
          <p className="text-gray-600 leading-relaxed text-lg">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

export function TestimonialCard({ quote, author, role, initials, gradientFrom, gradientTo }: TestimonialCardProps) {
  return (
    <div className="group relative">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientFrom}/15 ${gradientTo}/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500`}></div>
      <div className={`relative bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-4 hover:bg-white/60 group-hover:border-white/40`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom}/5 ${gradientTo}/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        <div className="relative z-10">
          <div className="flex items-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-500 fill-current group-hover:animate-pulse" style={{animationDelay: `${i * 0.1}s`}} />
            ))}
          </div>
          <p className="text-gray-600 mb-8 leading-relaxed text-lg italic">
            "{quote}"
          </p>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl flex items-center justify-center shadow-xl shadow-${gradientFrom}/30 group-hover:shadow-${gradientFrom}/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-white/20`}>
              <span className="text-white font-bold text-lg">{initials}</span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{author}</p>
              <p className="text-sm text-gray-600">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}