import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, CheckCircle, Clock, Shield, Mail, CreditCard } from "lucide-react"
import Link from "next/link"
import ModernNav from "@/components/modern-nav"

export default function CancellationPage() {
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
        <section className="py-16 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">Cancellation Policy</Badge>
            <h1 className="text-4xl font-bold text-gray-900 mb-6 text-balance">Cancellation & Refund Policy</h1>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Easy Cancellation</h2>
              <p className="text-xl text-gray-600 text-pretty max-w-3xl mx-auto">
                You can cancel your BeyondRounds subscription at any time through your account settings. No questions asked, no hassle.
              </p>
            </div>
          </div>
        </section>

        {/* How to Cancel Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  How to Cancel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ol className="text-gray-600 text-sm space-y-2 ml-4 list-decimal">
                  <li>Log into your BeyondRounds account</li>
                  <li>Go to Account Settings > Subscription</li>
                  <li>Click "Cancel Subscription"</li>
                  <li>Confirm your cancellation</li>
                </ol>
                <p className="text-gray-600 text-sm mt-4">
                  Or email us at <strong>support@beyondrounds.com</strong> with "Cancel Subscription" in the subject line.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  What Happens When You Cancel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-gray-600 text-sm space-y-2 ml-4 list-disc">
                  <li>You'll continue to receive matches until your current billing period ends</li>
                  <li>Access to premium features continues until subscription expires</li>
                  <li>Your account and profile remain active until the end of the billing cycle</li>
                  <li>No additional charges after cancellation</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  30-Day Friendship Guarantee
                </CardTitle>
                <p className="text-sm text-green-700 mt-2">New members only</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 text-sm">
                  If you don't have at least 2 meaningful meetups with other doctors in your first 30 days, we'll provide a full refund.
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">To claim your guarantee:</h4>
                  <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                    <li>Email <strong>support@beyondrounds.com</strong> within 30 days of signup</li>
                    <li>Provide brief feedback about your experience</li>
                    <li>Refund processed within 5–7 business days</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  Regular Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">
                  After the 30-day guarantee period, subscriptions are non-refundable. This policy allows us to:
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                  <li>Maintain consistent group formation</li>
                  <li>Ensure serious commitment from members</li>
                  <li>Keep membership costs low for everyone</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  Special Circumstances
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">
                  We may consider refunds in exceptional circumstances such as:
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4 list-disc">
                  <li>Technical issues preventing service use</li>
                  <li>Medical emergencies affecting participation</li>
                  <li>Relocation outside service areas</li>
                </ul>
                <p className="text-gray-600 text-sm mt-4">
                  Contact <strong>support@beyondrounds.com</strong> to discuss your situation.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-orange-600" />
                  Billing Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-gray-600 text-sm space-y-2 ml-4 list-disc">
                  <li>Charges appear as "BeyondRounds" on your statement</li>
                  <li>Billing cycles are monthly from your signup date</li>
                  <li>Price changes require 30 days notice</li>
                  <li>Contact <strong>support@beyondrounds.com</strong> for billing inquiries</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-4xl font-bold text-white mb-6">Still Have Questions?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Our support team is here to help. Contact us and we'll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Contact Support
                </Button>
              </Link>
              <Link href="/join">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Start Your Trial
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
