import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Heart, Users, Coffee, Mountain, Music } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
 
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 text-sm">
            Our Story
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
            Where Doctors Become Friends
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The story behind BeyondRounds and why we're passionate about helping doctors find their tribe
          </p>
        </div>
      </section>
 
      {/* Main Story Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  The idea for BeyondRounds was born during one of those late-night shifts that every doctor knows too well. 
                  After years of moving between hospitals, specializing, and diving deep into the demanding world of medicine, 
                  I found myself surrounded by colleagues but genuinely lonely.
                </p>
 
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Don't get me wrong – I loved connecting with people. I've always been social, meeting new faces, 
                  sharing stories, and building connections wherever I went. But there was something missing. The conversations 
                  always seemed to circle back to cases, protocols, and the latest medical research. While professionally enriching, 
                  I craved something deeper – real friendships that went beyond the hospital walls.
                </p>
 
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-8">
                  <p className="text-lg text-blue-800 italic">
                    "Everything changed one evening when I was introduced to four other doctors through a mutual friend. 
                    We met for drinks, and what started as casual conversation quickly evolved into something special."
                  </p>
                </div>
 
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  We discovered we shared the same passion for hiking, had similar music tastes, and – surprisingly – 
                  the same quirky sense of humor that only seemed to make sense to fellow doctors. One of these doctors, 
                  now one of my closest friends, lived in Berlin. Despite the distance, we found ourselves calling each 
                  other regularly, sharing not just our professional challenges, but our weekend adventures, travel plans, 
                  and life dreams.
                </p>
 
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  It was then I realized something profound: there's an unspoken understanding between doctors that's 
                  hard to find elsewhere. We get each other. We understand the unique pressures, the irregular schedules, 
                  the weight of responsibility we carry. But more importantly, we understand the person behind the white 
                  coat – someone who chose medicine not just as a career, but as a calling.
                </p>
 
                <div className="bg-green-50 border-l-4 border-green-500 p-6 my-8">
                  <h3 className="text-xl font-bold text-green-800 mb-3">The Realization</h3>
                  <p className="text-lg text-green-700">
                    That's when it hit me: if I felt this isolated despite working in environments filled with brilliant 
                    medical professionals, how many other doctors were experiencing the same thing? How many were moving 
                    to new cities for residencies, fellowships, or positions, struggling to build meaningful friendships 
                    outside their specialty?
                  </p>
                </div>
 
                <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">
                  BeyondRounds was born from this realization.
                </h2>
 
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  We created BeyondRounds because we believe every doctor deserves to find their tribe – people who 
                  understand the unique rhythm of medical life but share interests that extend far beyond medicine. 
                  Whether you're passionate about rock climbing, love exploring new restaurants, are a weekend warrior 
                  on the tennis court, or prefer quiet coffee conversations about books and travel, there are doctors 
                  out there who share your interests and are looking for the same genuine connections you are.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
 
      {/* Values Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              What drives us to help doctors build meaningful connections
            </p>
          </div>
 
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Authentic Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We believe in fostering genuine friendships that go beyond professional networking. 
                  Real connections that enrich your life outside the hospital.
                </p>
              </CardContent>
            </Card>
 
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Understanding Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Only doctors truly understand the unique challenges, schedules, and pressures of medical life. 
                  We create spaces where this understanding is the foundation.
                </p>
              </CardContent>
            </Card>
 
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Life Beyond Medicine</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We celebrate the whole person – your hobbies, interests, and passions that make you who you are 
                  beyond your medical practice.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* Team Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Built by Doctors, for Doctors</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our team understands the challenges because we've lived them
            </p>
          </div>
 
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Mountain className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">The Founder's Story</h3>
                    <p className="text-gray-600">Emergency Medicine Physician</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "After years of moving between hospitals and cities, I realized that while I was surrounded by 
                  brilliant colleagues, I was missing genuine friendships. BeyondRounds was born from my own 
                  experience of finding my medical tribe – doctors who became my closest friends."
                </p>
              </CardContent>
            </Card>
 
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <Music className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Our Mission</h3>
                    <p className="text-gray-600">Creating Meaningful Connections</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "We're not just another networking platform. We're building a community where doctors can 
                  find their people – those who understand the unique rhythm of medical life and share 
                  interests that extend far beyond the hospital walls."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Find Your Medical Tribe?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Join the community of doctors who've discovered that the best friendships often start with 
            a shared understanding of what it means to dedicate your life to medicine.
          </p>
          <div className="space-x-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/how-matching-works">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                Learn How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}