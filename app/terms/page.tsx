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
          <p className="text-sm text-gray-500">Last updated: January 2024</p>
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
                  Eligibility & Account Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Professional Requirements</h4>
                  <p className="text-gray-600 text-sm">
                    BeyondRounds is exclusively for licensed medical professionals. You must be a practicing doctor,
                    nurse, physician assistant, or other licensed healthcare provider to use our platform.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Verification Process</h4>
                  <p className="text-gray-600 text-sm">
                    All users must complete our verification process by providing valid medical credentials and
                    government-issued identification. Providing false information will result in immediate account
                    termination.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Account Responsibility</h4>
                  <p className="text-gray-600 text-sm">
                    You are responsible for maintaining the confidentiality of your account credentials and for all
                    activities that occur under your account. Notify us immediately of any unauthorized use.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Platform Use & Conduct
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Acceptable Use</h4>
                  <p className="text-gray-600 text-sm">
                    BeyondRounds is designed for professional networking and friendship building among medical
                    professionals. Use the platform respectfully and in accordance with professional medical ethics.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Prohibited Activities</h4>
                  <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                    <li>Harassment, discrimination, or inappropriate behavior</li>
                    <li>Sharing patient information or confidential medical data</li>
                    <li>Commercial solicitation or unauthorized marketing</li>
                    <li>Impersonation or providing false information</li>
                    <li>Attempting to circumvent platform security measures</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Content Guidelines</h4>
                  <p className="text-gray-600 text-sm">
                    All communications must be professional and appropriate. We reserve the right to monitor
                    conversations and remove content that violates our community standards.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-orange-600" />
                  Subscription & Payment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Subscription Plans</h4>
                  <p className="text-gray-600 text-sm">
                    BeyondRounds offers trial, monthly, and annual subscription plans. All prices are listed in GBP and
                    include applicable taxes. Subscription fees are non-refundable except as specified in our guarantee.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">30-Day Friendship Guarantee</h4>
                  <p className="text-gray-600 text-sm">
                    If you don't make meaningful connections within 30 days of your first paid subscription, we'll
                    provide a full refund. Contact support within the guarantee period to request a refund.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cancellation</h4>
                  <p className="text-gray-600 text-sm">
                    You may cancel your subscription at any time through your account settings. Cancellation takes
                    effect at the end of your current billing period. No partial refunds for unused time.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Disclaimers & Limitations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Platform Availability</h4>
                  <p className="text-gray-600 text-sm">
                    We strive to maintain platform availability but cannot guarantee uninterrupted service. We are not
                    liable for temporary outages or technical issues beyond our reasonable control.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">User Interactions</h4>
                  <p className="text-gray-600 text-sm">
                    BeyondRounds facilitates connections but is not responsible for the actions or behavior of users. We
                    encourage professional conduct but cannot guarantee the quality of interactions or relationships
                    formed.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Medical Advice Disclaimer</h4>
                  <p className="text-gray-600 text-sm">
                    BeyondRounds is not intended for medical consultations or patient care. Any medical discussions are
                    for professional networking purposes only and should not be considered medical advice.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Termination & Account Closure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Voluntary Termination</h4>
                  <p className="text-gray-600 text-sm">
                    You may delete your account at any time through your account settings. Upon deletion, your profile
                    and personal information will be removed from the platform.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Platform Termination</h4>
                  <p className="text-gray-600 text-sm">
                    We reserve the right to suspend or terminate accounts that violate these terms or engage in
                    inappropriate behavior. Serious violations may result in immediate termination without refund.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact & Legal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> legal@beyondrounds.com
                  </p>
                  <p>
                    <strong>Address:</strong> BeyondRounds Ltd., 123 Medical District, London, UK EC1A 1BB
                  </p>
                  <p>
                    <strong>Governing Law:</strong> These terms are governed by the laws of England and Wales
                  </p>
                </div>
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
