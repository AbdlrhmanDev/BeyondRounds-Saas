import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Shield, Lock, Eye, Download, Trash2, Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
 
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 text-sm">
            Privacy & Data Protection
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-8 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy matters to us. Learn how we protect your data and respect your rights.
          </p>
        </div>
      </section>
 
      {/* Privacy Highlights */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy Highlights</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Key points about how we handle your personal information
            </p>
          </div>
 
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Your Privacy Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  At BeyondRounds, we're committed to protecting your privacy and handling your data responsibly. 
                  This policy explains what information we collect and how we use it.
                </p>
              </CardContent>
            </Card>
 
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Never Sold</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We never sell your personal information. We only share data with matched group members 
                  (limited profile info only) and service providers when necessary.
                </p>
              </CardContent>
            </Card>
 
            <Card className="text-center border-0 shadow-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl">GDPR Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Full GDPR compliance with rights to access, correct, delete, and export your data. 
                  Servers hosted in EU facilities with enterprise-grade security.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* Information We Collect */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl text-center mb-6">Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Account Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Name, age, gender, city</li>
                    <li>Medical specialty and career stage</li>
                    <li>Contact information (email, phone)</li>
                  </ul>
                </div>
 
                <Separator />
 
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Verification Data</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Medical license/ID photos</li>
                    <li>Professional credentials</li>
                    <li>Identity verification documents</li>
                  </ul>
                </div>
 
                <Separator />
 
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Matching Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Interests, hobbies, and preferences</li>
                    <li>Social preferences and meeting styles</li>
                    <li>Availability and location data</li>
                    <li>Feedback about matches and meetups</li>
                  </ul>
                </div>
 
                <Separator />
 
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Usage Data</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>App usage patterns</li>
                    <li>Communication within groups</li>
                    <li>Device and location information</li>
                    <li>Performance and analytics data</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* How We Use Information */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl text-center mb-6">How We Use Your Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">Core Services</h3>
                    <ul className="list-disc list-inside space-y-2 text-blue-700">
                      <li>Create compatible matches with other doctors</li>
                      <li>Facilitate group communications</li>
                      <li>Verify medical credentials</li>
                      <li>Improve our matching algorithm</li>
                    </ul>
                  </div>
 
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-green-800 mb-3">Platform Operations</h3>
                    <ul className="list-disc list-inside space-y-2 text-green-700">
                      <li>Send service notifications and updates</li>
                      <li>Ensure platform safety and security</li>
                      <li>Provide customer support</li>
                      <li>Process payments and subscriptions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* Information Sharing */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl text-center mb-6">Information Sharing</CardTitle>
                <p className="text-center text-gray-600 mb-6">
                  We never sell your personal information. We only share data in these specific circumstances:
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-red-800 mb-3">❌ We Never Sell Your Data</h3>
                  <p className="text-red-700">
                    Your personal information is never sold to third parties for marketing or any other purposes.
                  </p>
                </div>
 
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-800 mb-3">✅ With Matched Group Members</h3>
                    <p className="text-blue-700">
                      Limited profile information only (name, specialty, interests) to facilitate introductions and group formation.
                    </p>
                  </div>
 
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-green-800 mb-3">✅ With Service Providers</h3>
                    <p className="text-green-700">
                      Payment processing, hosting, and analytics services under strict data protection agreements.
                    </p>
                  </div>
 
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-purple-800 mb-3">✅ When Required by Law</h3>
                    <p className="text-purple-700">
                      Only when legally required or to protect our rights and the safety of our community.
                    </p>
                  </div>
 
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-orange-800 mb-3">✅ With Your Explicit Consent</h3>
                    <p className="text-orange-700">
                      Any other sharing only occurs with your clear, informed consent for specific purposes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* Data Security */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Data Security</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enterprise-grade security measures to protect your information
            </p>
          </div>
 
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Lock className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Encryption & Storage</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    All data encrypted in transit and at rest
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Servers hosted in GDPR-compliant EU facilities
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                    Regular security audits and monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>
 
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Data Retention</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    Verification photos deleted after 90 days
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    Account data retained while active
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                    Immediate deletion upon account closure
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
 
      {/* Your Rights */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Your Rights (GDPR)</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete control over your personal data
            </p>
          </div>
 
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold">Access Your Data</h3>
                  </div>
                  <p className="text-gray-700">
                    Request a copy of all personal data we hold about you in a portable format.
                  </p>
                </CardContent>
              </Card>
 
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold">Correct Information</h3>
                  </div>
                  <p className="text-gray-700">
                    Update or correct any inaccurate personal information in your user.
                  </p>
                </CardContent>
              </Card>
 
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Download className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold">Export Your Data</h3>
                  </div>
                  <p className="text-gray-700">
                    Download your data in a machine-readable format for transfer to another service.
                  </p>
                </CardContent>
              </Card>
 
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold">Delete Your Account</h3>
                  </div>
                  <p className="text-gray-700">
                    Permanently delete your account and all associated personal data.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
 
      {/* Contact Information */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Questions About Privacy?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Our privacy team is here to help with any questions about how we handle your data.
            </p>
 
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 mr-3" />
                    
                      privacy@beyondrounds.com
                    
                  </div>
                  <p className="text-gray-600">
                    BeyondRounds Privacy Team<br />
                    [Address]<br />
                    [City, Country]
                  </p>
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
            Ready to Join Our Secure Community?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Your privacy is our priority. Join thousands of doctors who trust us with their data 
            while building meaningful friendships.
          </p>
          <div className="space-x-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                Get Started Securely
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-6">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}