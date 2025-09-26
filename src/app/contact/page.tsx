import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, MessageCircle, Shield, Clock, MapPin } from 'lucide-react'
import Link from 'next/link'
 
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 text-sm">
            Get In Touch
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
            Contact & Support
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help. Reach out to our team for any questions, support, or feedback.
          </p>
        </div>
      </section>
 
      {/* Contact Methods */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Get In Touch</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the best way to reach us based on your needs
            </p>
          </div>
 
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">General Support</CardTitle>
                <p className="text-gray-600">Questions about the platform</p>
              </CardHeader>
              <CardContent>
                
                  hello@beyondrounds.com
                
                <p className="text-sm text-gray-500 mt-2">
                  Response within 24 hours
                </p>
              </CardContent>
            </Card>
 
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Technical Support</CardTitle>
                <p className="text-gray-600">App issues and technical help</p>
              </CardHeader>
              <CardContent>
                
                  support@beyondrounds.com
                
                <p className="text-sm text-gray-500 mt-2">
                  Response within 12 hours
                </p>
              </CardContent>
            </Card>
 
            <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Privacy & Security</CardTitle>
                <p className="text-gray-600">Data protection questions</p>
              </CardHeader>
              <CardContent>
                
                  privacy@beyondrounds.com
                
                <p className="text-sm text-gray-500 mt-2">
                  Response within 24 hours
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* Contact Form */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl text-center mb-4">Send Us a Message</CardTitle>
                <p className="text-center text-gray-600">
                  Fill out the form below and we'll get back to you as soon as possible
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Your first name"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Your last name"
                        className="w-full"
                      />
                    </div>
                  </div>
 
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="w-full"
                    />
                  </div>
 
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder="What's this about?"
                      className="w-full"
                    />
                  </div>
 
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      placeholder="Tell us how we can help..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
 
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* Office Information */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Office</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Visit us or reach out through traditional channels
            </p>
          </div>
 
          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Office Address</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-700">
                  <p className="font-semibold">BeyondRounds Ltd.</p>
                  <p>123 Medical District</p>
                  <p>London, UK SW1A 1AA</p>
                  <p>United Kingdom</p>
                </div>
              </CardContent>
            </Card>
 
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Business Hours</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    Monday - Friday:
                    9:00 AM - 6:00 PM GMT
                  </div>
                  <div className="flex justify-between">
                    Saturday:
                    10:00 AM - 4:00 PM GMT
                  </div>
                  <div className="flex justify-between">
                    Sunday:
                    Closed
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* Legal Contact */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Legal Inquiries</h2>
            <p className="text-xl text-gray-600 mb-8">
              For legal matters, partnerships, or business inquiries
            </p>
 
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    
                      legal@beyondrounds.com
                    
                  </div>
                  <p className="text-gray-600">
                    Questions about these terms? Contact us at legal@beyondrounds.com
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* FAQ Link */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Before You Contact Us</h2>
            <p className="text-xl text-gray-600 mb-8">
              Check our FAQ section - you might find the answer you're looking for right away!
            </p>
 
            <Link href="/faq">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                Visit FAQ Section
              </Button>
            </Link>
          </div>
        </div>
      </section>
 
      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Have questions? We're here to help. Join thousands of doctors who've already found their tribe.
          </p>
          <div className="space-x-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                Get Started Today
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}