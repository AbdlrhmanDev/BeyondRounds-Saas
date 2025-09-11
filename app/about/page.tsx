import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Shield, Target, Award, Stethoscope } from "lucide-react"
import Link from "next/link"
import ModernNav from "@/components/modern-nav"

export default function AboutPage() {
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
        <section className="py-24 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-lg shadow-violet-500/10">
              <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                Our Story
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent animate-gradient-text">
                Where Doctors
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                Become Friends
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
              The idea for BeyondRounds was born during one of those late-night shifts that every doctor knows too well. After years of moving between hospitals, specializing, and diving deep into the demanding world of medicine, I found myself surrounded by colleagues but genuinely lonely.
            </p>
          </div>
        </section>

        {/* Personal Story Section */}
        <section className="py-24 px-4 relative">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="mb-6">
                Don't get me wrong – I loved connecting with people. I've always been social, meeting new faces, sharing stories, and building connections wherever I went. But there was something missing. The conversations always seemed to circle back to cases, protocols, and the latest medical research. While professionally enriching, I craved something deeper – real friendships that went beyond the hospital walls.
              </p>
              
              <p className="mb-6">
                Everything changed one evening when I was introduced to four other doctors through a mutual friend. We met for drinks, and what started as casual conversation quickly evolved into something special. We discovered we shared the same passion for hiking, had similar music tastes, and – surprisingly – the same quirky sense of humor that only seemed to make sense to fellow doctors.
              </p>
              
              <p className="mb-6">
                One of these doctors, now one of my closest friends, lived in Berlin. Despite the distance, we found ourselves calling each other regularly, sharing not just our professional challenges, but our weekend adventures, travel plans, and life dreams. It was then I realized something profound: there's an unspoken understanding between doctors that's hard to find elsewhere.
              </p>
              
              <p className="mb-6">
                We get each other. We understand the unique pressures, the irregular schedules, the weight of responsibility we carry. But more importantly, we understand the person behind the white coat – someone who chose medicine not just as a career, but as a calling.
              </p>
              
              <p className="mb-6">
                That's when it hit me: if I felt this isolated despite working in environments filled with brilliant medical professionals, how many other doctors were experiencing the same thing? How many were moving to new cities for residencies, fellowships, or positions, struggling to build meaningful friendships outside their specialty?
              </p>
              
              <div className="text-center my-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                    BeyondRounds was born from this realization.
                  </span>
                </h2>
              </div>
              
              <p className="mb-6">
                We created BeyondRounds because we believe every doctor deserves to find their tribe – people who understand the unique rhythm of medical life but share interests that extend far beyond medicine. Whether you're passionate about rock climbing, love exploring new restaurants, are a weekend warrior on the tennis court, or prefer quiet coffee conversations about books and travel, there are doctors out there who share your interests and are looking for the same genuine connections you are.
              </p>
              
              <p className="mb-6">
                Our mission is simple: to help doctors discover friendships that enrich their lives outside the hospital. Because when you find your people – your tribe – everything else falls into place.
              </p>
              
              <div className="text-center mt-12 p-8 bg-gradient-to-r from-violet-50 to-blue-50 rounded-2xl">
                <p className="text-xl font-semibold text-gray-800 italic">
                  Join thousands of doctors who've already found their tribe. Your next great friendship is just one match away.
                </p>
              </div>
            </div>
          </div>
        </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Making an Impact</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <p className="text-gray-600">Verified Doctors</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">1,200+</div>
              <p className="text-gray-600">Successful Matches</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">25+</div>
              <p className="text-gray-600">Cities Covered</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
              <p className="text-gray-600">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Founded by Doctors, for Doctors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our founding team combines decades of medical experience with technology expertise to create the platform
              we wished existed during our own medical careers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle>Dr. Sarah Chen</CardTitle>
                <CardDescription>Co-Founder & CEO</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Emergency Medicine physician with 15 years of experience. Passionate about physician wellness and
                  building supportive medical communities.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Dr. Michael Rodriguez</CardTitle>
                <CardDescription>Co-Founder & CMO</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Cardiologist and former medical director. Expert in healthcare operations and physician engagement
                  with a focus on reducing burnout.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle>Alex Thompson</CardTitle>
                <CardDescription>Co-Founder & CTO</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Former healthcare technology executive with expertise in AI and secure platforms. Dedicated to
                  building technology that serves healthcare professionals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold text-white mb-6">Join Our Growing Community</h2>
          <p className="text-xl text-blue-100 mb-8">
            Be part of a movement that's transforming how medical professionals connect and support each other.
          </p>
          <Link href="/join">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </section>

     
      </div>
    </div>
  )
}
