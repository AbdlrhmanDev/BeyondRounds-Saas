import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, FileText, Users, CreditCard, Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-balance">Terms of Service</h1>
          <p className="text-xl text-gray-600 mb-8 text-pretty max-w-3xl mx-auto">
            These terms govern your use of BeyondRounds. By using our platform, you agree to these terms and conditions.
          </p>
          <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                  By accessing or using BeyondRounds ("the Platform"), you agree to be bound by these Terms of Service
                  and our Privacy Policy. If you do not agree to these terms, please do not use our platform.
                </p>
                <p className="text-gray-600 text-sm">
                  We may update these terms from time to time. Continued use of the platform after changes constitutes
                  acceptance of the new terms. We will notify users of significant changes via email or platform
                  notification.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-gray-600 text-sm space-y-2 ml-4 list-disc">
                  <li>You must be a licensed medical doctor, medical student, resident, or fellow</li>
                  <li>You must be at least 18 years old</li>
                  <li>You must provide accurate verification information</li>
                  <li>You agree to maintain professional conduct at all times</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Account & Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-gray-600 text-sm space-y-2 ml-4 list-disc">
                  <li>You must verify your medical credentials through license upload</li>
                  <li>False information or impersonation results in immediate termination</li>
                  <li>You're responsible for maintaining account security</li>
                  <li>One account per person</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Code of Conduct
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">Members must:</p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                  <li>Treat all members with respect and professionalism</li>
                  <li>Attend scheduled meetups or provide reasonable notice</li>
                  <li>Maintain confidentiality about other members' personal information</li>
                  <li>Report inappropriate behavior immediately</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Prohibited Behavior
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">The following will result in immediate termination:</p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                  <li>Harassment, discrimination, or hate speech</li>
                  <li>Solicitation for professional services or business</li>
                  <li>Sharing personal information without consent</li>
                  <li>Using the platform for dating or romantic purposes</li>
                  <li>Spam or commercial promotion</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  Subscription & Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                  <li>All subscriptions are recurring until cancelled</li>
                  <li>Prices may change with 30 days notice</li>
                  <li>Refunds only available under our 30-Day Friendship Guarantee</li>
                  <li>No partial month refunds after the guarantee period</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Intellectual Property
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                  All content, features, and functionality are owned by BeyondRounds and protected by international copyright and trademark laws.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Privacy & Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Your privacy is important to us. Please review our Privacy Policy for details on how we collect, use, and protect your information.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">BeyondRounds is not responsible for:</p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                  <li>Actions of other members during meetups</li>
                  <li>Personal safety during offline meetings</li>
                  <li>Disputes between members</li>
                  <li>Loss or damage resulting from service use</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                  We may terminate accounts for violation of these terms. Upon termination, your right to use the service ceases immediately.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                  We may update these terms occasionally. Continued use after changes constitutes acceptance of new terms.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  Questions about these terms? Contact us at <strong>legal@beyondrounds.com</strong>
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
