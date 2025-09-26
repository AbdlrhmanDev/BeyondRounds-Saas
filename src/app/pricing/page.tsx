'use client'
 
import { useState } from 'react'
import { SubscriptionPlanCard, SUBSCRIPTION_PLANS } from '@/components/features/payments/SubscriptionPlanCard'
import { PaymentForm } from '@/components/features/payments/PaymentForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Users, 
  ArrowLeft,
  Star,
  Shield,
  Clock
} from 'lucide-react'
import Link from 'next/link'
 
export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoading] = useState(false)
 
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }
 
  const handlePaymentSuccess = () => {
    // Redirect to success page or dashboard
    window.location.href = '/payment/success'
  }
 
 
  const selectedPlanData = SUBSCRIPTION_PLANS.find(plan => plan.id === selectedPlan)
 
  if (selectedPlan && selectedPlanData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setSelectedPlan(null)}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
          </div>
 
          {/* Payment Form */}
          <PaymentForm
            selectedPlan={{
              id: selectedPlanData.id,
              name: selectedPlanData.name,
              price: selectedPlanData.price,
              interval: selectedPlanData.period === 'year' ? 'year' : 'month',
              features: selectedPlanData.features
            }}
            onSubmit={(paymentData) => {
              // Handle payment submission
              console.log('Payment data:', paymentData)
              handlePaymentSuccess()
            }}
            loading={isLoading}
          />
        </div>
      </div>
    )
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6 text-sm">
            🏥 Exclusively for Verified Medical Professionals
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of medical professionals building meaningful connections. 
            Start your journey to finding your medical tribe.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Secure Payment
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              30-Day Guarantee
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              1000+ Doctors
            </div>
          </div>
        </div>
 
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              onSelect={handlePlanSelect}
              isLoading={isLoading}
            />
          ))}
        </div>
 
        {/* Features Comparison */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-900">
              Feature Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Features</th>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <th key={plan.id} className="text-center py-4 px-4 font-semibold text-gray-900">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-4 px-4 text-gray-700">Weekly Matching</td>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700">Group Chat</td>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700">Priority Matching</td>
                    <td className="text-center py-4 px-4">
                      <div className="w-5 h-5 mx-auto bg-gray-300 rounded"></div>
                    </td>
                    {SUBSCRIPTION_PLANS.slice(1).map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700">Professional Events</td>
                    <td className="text-center py-4 px-4">
                      <div className="w-5 h-5 mx-auto bg-gray-300 rounded"></div>
                    </td>
                    {SUBSCRIPTION_PLANS.slice(1).map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700">Mentorship Program</td>
                    <td className="text-center py-4 px-4">
                      <div className="w-5 h-5 mx-auto bg-gray-300 rounded"></div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="w-5 h-5 mx-auto bg-gray-300 rounded"></div>
                    </td>
                    {SUBSCRIPTION_PLANS.slice(2).map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-4">
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-gray-700">Dedicated Support</td>
                    <td className="text-center py-4 px-4">
                      <div className="w-5 h-5 mx-auto bg-gray-300 rounded"></div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="w-5 h-5 mx-auto bg-gray-300 rounded"></div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <div className="w-5 h-5 mx-auto bg-gray-300 rounded"></div>
                    </td>
                    <td className="text-center py-4 px-4">
                      <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
 
        {/* FAQ Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-900">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  How does the matching work?
                </h3>
                <p className="text-gray-600">
                  Our AI-powered algorithm matches you with 3-4 compatible doctors every Thursday 
                  based on your specialty, interests, location, and availability.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Can I cancel anytime?
                </h3>
                <p className="text-gray-600">
                  Yes! You can cancel your subscription at any time. You'll continue to have 
                  access to premium features until the end of your current billing period.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Is there a money-back guarantee?
                </h3>
                <p className="text-gray-600">
                  Absolutely! We offer a 30-day money-back guarantee. If you're not satisfied 
                  with our service, contact support for a full refund.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  How do I verify my medical credentials?
                </h3>
                <p className="text-gray-600">
                  After signing up, you'll be asked to upload your medical license and ID. 
                  Our team reviews and verifies all credentials within 24 hours.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
 
        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            What Our Members Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "BeyondRounds helped me find my medical tribe. The weekly matching 
                  is spot-on and I've made genuine friendships."
                </p>
                <p className="font-semibold text-gray-900">Dr. Sarah Chen</p>
                <p className="text-sm text-gray-500">Cardiologist</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "Finally, a platform that understands the unique challenges 
                  of being a medical professional. Highly recommended!"
                </p>
                <p className="font-semibold text-gray-900">Dr. Michael Rodriguez</p>
                <p className="text-sm text-gray-500">Neurologist</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The verification process ensures quality connections. 
                  I've met amazing colleagues who've become close friends."
                </p>
                <p className="font-semibold text-gray-900">Dr. Emily Johnson</p>
                <p className="text-sm text-gray-500">Dermatologist</p>
              </CardContent>
            </Card>
          </div>
        </div>
 
        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="pt-8">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Find Your Medical Tribe?
              </h2>
              <p className="text-xl mb-6 opacity-90">
                Join thousands of verified medical professionals building meaningful connections
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
                  onClick={() => setSelectedPlan('premium')}
                >
                  Start with Premium
                </Button>
                <Link href="/auth/sign-up">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
                  >
                    Try Basic Plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}