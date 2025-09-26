import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, Brain, Users, MapPin, Heart, Zap } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
 
export default function HowMatchingWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 text-sm">
            AI-Powered Matching
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
            How Our Matching Algorithm Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every Thursday at 4 PM local time, our sophisticated AI creates groups of 3-4 compatible doctors in your area
          </p>
        </div>
      </section>
 
      {/* Algorithm Overview */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">The BeyondRounds Matching Algorithm</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI analyzes multiple factors to create the perfect group for you
            </p>
          </div>
 
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg mb-8">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Weekly Matching Schedule</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-700 mb-4">
                  <strong>Every Thursday at 4 PM local time</strong>, our algorithm runs and creates new groups of 3-4 compatible doctors in your area. 
                  You'll receive an email and in-app notification when your new group is ready.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
                    <strong>Why Thursday?</strong> This gives you time to plan weekend meetups and ensures fresh connections 
                    for your upcoming week.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* Algorithm Weights */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Matching Algorithm Weights</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Here's how our AI determines compatibility between doctors
            </p>
          </div>
 
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Heart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Interest Compatibility</h3>
                      <p className="text-gray-600">Shared hobbies, activities, and passions</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">40%</Badge>
                </div>
                <Progress value={40} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">
                  The most important factor - we match doctors who share similar interests outside of medicine
                </p>
              </CardContent>
            </Card>
 
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Medical Specialty Match</h3>
                      <p className="text-gray-600">Similar specialties and career stages</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">20%</Badge>
                </div>
                <Progress value={20} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">
                  Understanding shared professional experiences and challenges
                </p>
              </CardContent>
            </Card>
 
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Brain className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Social Preferences</h3>
                      <p className="text-gray-600">Meeting style, group size, conversation topics</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">20%</Badge>
                </div>
                <Progress value={20} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">
                  Matching social energy levels and preferred interaction styles
                </p>
              </CardContent>
            </Card>
 
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Availability Overlap</h3>
                      <p className="text-gray-600">Free time and preferred meeting times</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">10%</Badge>
                </div>
                <Progress value={10} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">
                  Ensuring you can actually meet up with your matches
                </p>
              </CardContent>
            </Card>
 
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                      <MapPin className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Geographic Proximity</h3>
                      <p className="text-gray-600">Distance and location convenience</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">5%</Badge>
                </div>
                <Progress value={5} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">
                  Keeping groups local for easier meetups
                </p>
              </CardContent>
            </Card>
 
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                      <Zap className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Lifestyle Compatibility</h3>
                      <p className="text-gray-600">Life stage, values, and general lifestyle</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">5%</Badge>
                </div>
                <Progress value={5} className="h-2" />
                <p className="text-sm text-gray-600 mt-2">
                  Matching life stages and general lifestyle preferences
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* Compatibility Scores */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Compatibility Score Display</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              How we communicate match quality to help you understand your connections
            </p>
          </div>
 
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-green-800">90-100%</h3>
                    <p className="text-green-700">Excellent Match! You have tons in common</p>
                  </div>
                  <Badge className="bg-green-600 text-white text-lg px-4 py-2">Excellent</Badge>
                </div>
                <p className="text-green-600">
                  These matches share multiple interests, have similar social preferences, and are likely to form strong, lasting friendships.
                </p>
              </CardContent>
            </Card>
 
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-blue-800">80-89%</h3>
                    <p className="text-blue-700">Great Match! Strong compatibility</p>
                  </div>
                  <Badge className="bg-blue-600 text-white text-lg px-4 py-2">Great</Badge>
                </div>
                <p className="text-blue-600">
                  Strong compatibility with several shared interests and complementary personalities.
                </p>
              </CardContent>
            </Card>
 
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-purple-800">70-79%</h3>
                    <p className="text-purple-700">Good Match! Several shared interests</p>
                  </div>
                  <Badge className="bg-purple-600 text-white text-lg px-4 py-2">Good</Badge>
                </div>
                <p className="text-purple-600">
                  Good foundation for friendship with some shared interests and compatible social styles.
                </p>
              </CardContent>
            </Card>
 
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-orange-800">60-69%</h3>
                    <p className="text-orange-700">Decent Match! Some common ground</p>
                  </div>
                  <Badge className="bg-orange-600 text-white text-lg px-4 py-2">Decent</Badge>
                </div>
                <p className="text-orange-600">
                  Some shared interests and potential for friendship, though you may need to explore differences.
                </p>
              </CardContent>
            </Card>
 
            <Card className="border-2 border-gray-200 bg-gray-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">50-59%</h3>
                    <p className="text-gray-700">Moderate Match! Room to explore differences</p>
                  </div>
                  <Badge className="bg-gray-600 text-white text-lg px-4 py-2">Moderate</Badge>
                </div>
                <p className="text-gray-600">
                  Basic compatibility with potential for friendship through shared medical background and some interests.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* How It Works Process */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">The Matching Process</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From profile completion to your first group meetup
            </p>
          </div>
 
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      1
                    </div>
                    <CardTitle className="text-xl">User Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Our AI analyzes your complete profile, including interests, specialty, social preferences, 
                    and availability to understand who you are and what you're looking for.
                  </p>
                </CardContent>
              </Card>
 
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      2
                    </div>
                    <CardTitle className="text-xl">Compatibility Scoring</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    We calculate compatibility scores with other doctors in your area using our weighted algorithm, 
                    ensuring diverse and interesting groups.
                  </p>
                </CardContent>
              </Card>
 
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      3
                    </div>
                    <CardTitle className="text-xl">Group Formation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Groups of 3-4 doctors are formed based on compatibility scores, ensuring no one is matched 
                    with the same person for at least 6 weeks.
                  </p>
                </CardContent>
              </Card>
 
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                      4
                    </div>
                    <CardTitle className="text-xl">Notification & Introduction</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    You receive your new group details with compatibility scores and conversation starters 
                    to help break the ice and plan your first meetup.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
 
      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Experience Smart Matching?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Join BeyondRounds and let our AI find your perfect medical tribe. 
            Your first group is just one Thursday away.
          </p>
          <div className="space-x-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                Get Started Today
              </Button>
            </Link>
            <Link href="/faq">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                Read FAQ
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}