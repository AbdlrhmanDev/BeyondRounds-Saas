import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Shield, Eye, Lock, Database, UserCheck } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BeyondRounds</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/join">
              <Button>Join Now</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">Legal</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-balance">Privacy Policy</h1>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Matters</h2>
            <p className="text-xl text-gray-600 text-pretty max-w-3xl mx-auto">
              At BeyondRounds, we're committed to protecting your privacy and handling your data responsibly. This policy explains what information we collect and how we use it.
            </p>
          </div>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Account Information:</h4>
                  <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                    <li>Name, age, gender, city</li>
                    <li>Medical specialty and career stage</li>
                    <li>Contact information (email, phone)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Verification Data:</h4>
                  <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                    <li>Medical license/ID photos</li>
                    <li>Selfie for identity confirmation</li>
                    <li>Professional credentials</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Matching Information:</h4>
                  <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                    <li>Interests, hobbies, and preferences</li>
                    <li>Availability and meeting preferences</li>
                    <li>Feedback about matches and meetups</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Usage Data:</h4>
                  <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                    <li>App usage patterns</li>
                    <li>Communication within groups</li>
                    <li>Device and location information</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                  <li>Create compatible matches with other doctors</li>
                  <li>Facilitate group communications</li>
                  <li>Verify medical credentials</li>
                  <li>Improve our matching algorithm</li>
                  <li>Send service notifications and updates</li>
                  <li>Ensure platform safety and security</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                  Information Sharing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">We never sell your personal information. We only share data:</p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                  <li>With matched group members (limited profile info only)</li>
                  <li>With service providers (payment processing, hosting)</li>
                  <li>When required by law</li>
                  <li>With your explicit consent</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-600" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                  <li>All data encrypted in transit and at rest</li>
                  <li>Servers hosted in GDPR-compliant EU facilities</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Verification photos deleted after 90 days</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Your Rights (GDPR)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and data</li>
                  <li>Export your data</li>
                  <li>Withdraw consent for processing</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                  <li>Active accounts: data retained while active</li>
                  <li>Cancelled accounts: data deleted within 30 days</li>
                  <li>Verification photos: deleted after 90 days</li>
                  <li>Anonymous usage analytics: retained for improvement</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  Cookies & Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                  We use essential cookies for functionality and analytics cookies to improve our service. You can control cookie preferences in your browser.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Questions about privacy? Email us at <strong>privacy@beyondrounds.com</strong> or write to: BeyondRounds Privacy Team [Address] [City, Country]
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">BeyondRounds</span>
          </div>
          <p className="text-gray-400">Where doctors become friends.</p>
        </div>
      </footer>
    </div>
  )
}
