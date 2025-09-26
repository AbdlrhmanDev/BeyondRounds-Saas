'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Calendar, Users, Heart, ArrowRight, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PaymentSuccessProps {
  planId?: string
  planName?: string
  amount?: number
  currency?: string
  customerEmail?: string
  subscriptionId?: string
}

export function PaymentSuccess({ 
  planId, 
  planName, 
  amount, 
  currency, 
  customerEmail,
  subscriptionId 
}: PaymentSuccessProps) {
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to dashboard after 5 seconds
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  const handleGoToProfile = () => {
    router.push('/profile')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to BeyondRounds! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your subscription has been activated successfully
          </p>
          <Badge className="bg-green-100 text-green-800 px-4 py-2 text-lg">
            <CheckCircle className="w-5 h-5 mr-2" />
            Payment Confirmed
          </Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-gray-900">
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {planName && (
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Plan</span>
                <span className="font-semibold text-gray-900">{planName}</span>
              </div>
            )}
            
            {amount && currency && (
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold text-gray-900">
                  {currency} {amount}
                </span>
              </div>
            )}
            
            {customerEmail && (
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Email</span>
                <span className="font-semibold text-gray-900">{customerEmail}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Status</span>
              <Badge className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-900">
              What's Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Complete Your Profile</h3>
                  <p className="text-sm text-gray-600">
                    Add your medical specialty, interests, and preferences to get better matches
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Get Matched</h3>
                  <p className="text-sm text-gray-600">
                    Our AI will match you with compatible doctors every Thursday
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Set Your Availability</h3>
                  <p className="text-sm text-gray-600">
                    Tell us when you're available for meetings and social activities
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Check Your Email</h3>
                  <p className="text-sm text-gray-600">
                    We've sent you a welcome email with next steps and tips
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={handleGoToProfile}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Complete Profile
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button 
            onClick={handleGoToDashboard}
            variant="outline"
            className="px-8 py-3 text-lg"
          >
            Go to Dashboard
          </Button>
        </div>

        {/* Auto-redirect notice */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Redirecting to dashboard in {countdown} seconds...
          </p>
        </div>

        {/* Support Information */}
        <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Our support team is here to help you get started
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/contact" 
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Mail className="w-4 h-4 mr-1" />
              Email Support
            </Link>
            <Link 
              href="/faq" 
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <Phone className="w-4 h-4 mr-1" />
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


