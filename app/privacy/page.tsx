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
          <p className="text-xl text-gray-600 mb-8 text-pretty max-w-3xl mx-auto">
            Your privacy and data security are fundamental to our mission. This policy explains how we collect, use, and
            protect your information.
          </p>
          <p className="text-sm text-gray-500">Last updated: January 2024</p>
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
                  <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                  <p className="text-gray-600 text-sm">
                    We collect information you provide directly, including your name, email address, medical specialty,
                    location, professional interests, and availability preferences.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Verification Documents</h4>
                  <p className="text-gray-600 text-sm">
                    For verification purposes, we temporarily collect copies of your medical license, government-issued
                    ID, and verification photos. These documents are automatically deleted after 90 days.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Usage Information</h4>
                  <p className="text-gray-600 text-sm">
                    We collect information about how you use our platform, including chat messages, match interactions,
                    and platform engagement metrics to improve our matching algorithm.
                  </p>
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
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Matching & Platform Services</h4>
                  <p className="text-gray-600 text-sm">
                    We use your information to create compatible matches, facilitate group conversations, and provide
                    personalized platform experiences.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Verification & Safety</h4>
                  <p className="text-gray-600 text-sm">
                    Your verification documents are used solely to confirm your medical credentials and ensure platform
                    safety. We never share these documents with other users.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
                  <p className="text-gray-600 text-sm">
                    We use your contact information to send important platform updates, match notifications, and respond
                    to your support requests.
                  </p>
                </div>
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
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">With Other Users</h4>
                  <p className="text-gray-600 text-sm">
                    Only your matched group members can see your profile information (name, specialty, interests). Your
                    verification documents and contact information are never shared with other users.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">With Third Parties</h4>
                  <p className="text-gray-600 text-sm">
                    We do not sell, rent, or share your personal information with third parties for marketing purposes.
                    We only share information when required by law or to protect platform safety.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Service Providers</h4>
                  <p className="text-gray-600 text-sm">
                    We work with trusted service providers (hosting, payment processing, analytics) who are bound by
                    strict confidentiality agreements and data protection standards.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-600" />
                  Data Security & Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Security Measures</h4>
                  <p className="text-gray-600 text-sm">
                    We use enterprise-grade security including end-to-end encryption, secure data transmission, regular
                    security audits, and access controls to protect your information.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Location</h4>
                  <p className="text-gray-600 text-sm">
                    All data is stored on secure servers within the European Union, ensuring compliance with GDPR and
                    providing additional privacy protections for our users.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Data Retention</h4>
                  <p className="text-gray-600 text-sm">
                    Verification documents are automatically deleted after 90 days. Other personal information is
                    retained while your account is active and for a reasonable period after account closure.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Your Rights & Choices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Access & Control</h4>
                  <p className="text-gray-600 text-sm">
                    You can access, update, or delete your personal information through your account dashboard. You also
                    have the right to download your data or request account deletion.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Communication Preferences</h4>
                  <p className="text-gray-600 text-sm">
                    You can control email notifications and communication preferences in your account settings.
                    Essential platform communications cannot be disabled.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">GDPR Rights</h4>
                  <p className="text-gray-600 text-sm">
                    As a EU-based service, you have additional rights under GDPR including data portability,
                    rectification, and the right to be forgotten. Contact us to exercise these rights.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> privacy@beyondrounds.com
                  </p>
                  <p>
                    <strong>Address:</strong> BeyondRounds Ltd., 123 Medical District, London, UK EC1A 1BB
                  </p>
                  <p>
                    <strong>Data Protection Officer:</strong> dpo@beyondrounds.com
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
