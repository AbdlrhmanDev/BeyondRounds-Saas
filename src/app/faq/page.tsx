import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { HelpCircle, Users, Shield, CreditCard, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
 
export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 text-sm">
            Frequently Asked Questions
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
            Everything You Need to Know
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Got questions? We've got answers. Find everything you need to know about BeyondRounds.
          </p>
        </div>
      </section>
 
      {/* FAQ Categories */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">General</h3>
                <p className="text-sm text-gray-600">Basic questions</p>
              </CardContent>
            </Card>
 
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Matching</h3>
                <p className="text-sm text-gray-600">How groups work</p>
              </CardContent>
            </Card>
 
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Safety</h3>
                <p className="text-sm text-gray-600">Security & meetings</p>
              </CardContent>
            </Card>
 
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Pricing</h3>
                <p className="text-sm text-gray-600">Membership & billing</p>
              </CardContent>
            </Card>
          </div>
 
          {/* FAQ Content */}
          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {/* General Questions */}
              <AccordionItem value="what-is-beyondrounds" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">What is BeyondRounds?</h3>
                      <p className="text-sm text-gray-600">Understanding our platform</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12">
                    <p className="text-gray-700 mb-4">
                      BeyondRounds is a premium social club exclusively for verified doctors. We match you weekly with 2-3 other doctors in your city based on shared interests, hobbies, and availability – not for professional networking, but to build genuine friendships.
                    </p>
                    <p className="text-gray-700">
                      We're not about professional networking or dating. BeyondRounds is specifically designed for doctors to make real friends who understand their lifestyle and share their personal interests outside of medicine.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
 
              <AccordionItem value="who-can-join" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Who can join BeyondRounds?</h3>
                      <p className="text-sm text-gray-600">Membership requirements</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12">
                    <p className="text-gray-700">
                      Only verified medical doctors, including medical students, residents, fellows, and practicing physicians. We manually verify all members through license verification and photo confirmation to ensure a safe, authentic community.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
 
              {/* Matching Questions */}
              <AccordionItem value="how-matching-works" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">How does the matching work?</h3>
                      <p className="text-sm text-gray-600">Understanding our algorithm</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12">
                    <p className="text-gray-700 mb-4">
                      Every Thursday at 4 PM, our algorithm creates small groups of 3-4 doctors based on your specialty, interests, availability, and location. You'll receive an email and in-app notification when your new group is ready.
                    </p>
                    <p className="text-gray-700">
                      Our AI analyzes compatibility across multiple factors including shared interests (40%), medical specialty (20%), social preferences (20%), availability (10%), location (5%), and lifestyle (5%).
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
 
              <AccordionItem value="what-if-no-click" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">What if I don't click with my group?</h3>
                      <p className="text-sm text-gray-600">Handling mismatches</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12">
                    <p className="text-gray-700 mb-4">
                      That's completely normal! You'll get a new group every week, and our algorithm learns from your feedback to make better matches over time. We also ensure you won't be matched with the same person again for at least 6 weeks.
                    </p>
                    <p className="text-gray-700">
                      Our curated approach is what makes BeyondRounds special. Trust our algorithm – it's designed by doctors, for doctors, and gets smarter with each match.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
 
              <AccordionItem value="choose-matches" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Can I choose my own matches?</h3>
                      <p className="text-sm text-gray-600">About our curated approach</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12">
                    <p className="text-gray-700">
                      Our curated approach is what makes BeyondRounds special. Trust our algorithm – it's designed by doctors, for doctors, and gets smarter with each match. This ensures diverse, interesting groups and prevents the "swipe fatigue" of traditional apps.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
 
              {/* Safety Questions */}
              <AccordionItem value="where-groups-meet" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Where do groups meet?</h3>
                      <p className="text-sm text-gray-600">Meeting locations and safety</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12">
                    <p className="text-gray-700 mb-4">
                      Groups decide together where to meet within your city. Popular options include coffee shops, restaurants, parks, or activity-based meetups like hiking or sports.
                    </p>
                    <p className="text-gray-700">
                      All members are verified doctors, and we encourage meeting in public places. Our AI facilitator, RoundsBot, helps groups plan safe, public meetups and provides conversation starters.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
 
              <AccordionItem value="is-it-safe" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Is it safe to meet strangers?</h3>
                      <p className="text-sm text-gray-600">Safety measures and verification</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12">
                    <p className="text-gray-700 mb-4">
                      All members are verified doctors, and we encourage meeting in public places. Our AI facilitator, RoundsBot, helps groups plan safe, public meetups and provides conversation starters.
                    </p>
                    <p className="text-gray-700">
                      We manually verify all medical licenses and IDs, and maintain strict community guidelines. Any inappropriate behavior results in immediate removal from the platform.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
 
              {/* Pricing Questions */}
              <AccordionItem value="how-much-cost" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <CreditCard className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">How much does BeyondRounds cost?</h3>
                      <p className="text-sm text-gray-600">Pricing plans and options</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        Trial:
                        £9.99
                        (first month)
                      </div>
                      <div className="flex justify-between items-center">
                        Founders:
                        £14.99/month
                        (limited time)
                      </div>
                      <div className="flex justify-between items-center">
                        Core:
                        £29.99/month
                        (standard)
                      </div>
                      <div className="flex justify-between items-center">
                        Premium:
                        £49.99/month
                        (includes advanced filtering)
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
 
              <AccordionItem value="cancel-anytime" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <CreditCard className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Can I cancel anytime?</h3>
                      <p className="text-sm text-gray-600">Cancellation policy</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12">
                    <p className="text-gray-700">
                      Yes, you can cancel your subscription at any time through your account settings. No questions asked. We believe in earning your continued membership through the value we provide.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
 
              <AccordionItem value="friendship-guarantee" className="border rounded-lg px-6">
                <AccordionTrigger className="text-left">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <CreditCard className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">What's the 30-Day Friendship Guarantee?</h3>
                      <p className="text-sm text-gray-600">Our satisfaction guarantee</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-12">
                    <p className="text-gray-700">
                      If you don't have at least 2 meaningful meetups in your first 30 days, we'll provide a full refund. We're confident you'll love the connections you make! This guarantee shows our commitment to your success on the platform.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
 
      {/* Contact Support */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Still Have Questions?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Our support team is here to help. Get in touch and we'll get back to you within 24 hours.
            </p>
          </div>
 
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">General Support</h3>
                    <p className="text-gray-600 mb-4">Questions about the platform</p>
                    
                      support@beyondrounds.com
                    
                  </div>
 
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Privacy & Security</h3>
                    <p className="text-gray-600 mb-4">Data protection questions</p>
                    
                      privacy@beyondrounds.com
                    
                  </div>
                </div>
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
            Join thousands of doctors who've already found their tribe. 
            Your next great friendship is just one match away.
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