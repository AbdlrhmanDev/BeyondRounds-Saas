'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft, 
  Mail, 
  Phone, 
  CreditCard,
  Shield,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface PaymentErrorProps {
  errorCode?: string
  errorMessage?: string
  planId?: string
  planName?: string
  onRetry?: () => void
  onGoBack?: () => void
}

interface ErrorInfo {
  title: string
  description: string
  suggestions: string[]
  icon: React.ReactNode
  color: string
}

const ERROR_TYPES: Record<string, ErrorInfo> = {
  'card_declined': {
    title: 'Card Declined',
    description: 'Your payment method was declined by your bank.',
    suggestions: [
      'Check that your card has sufficient funds',
      'Verify your billing address matches your card',
      'Try a different payment method',
      'Contact your bank to ensure the card is active'
    ],
    icon: <CreditCard className="w-6 h-6" />,
    color: 'red'
  },
  'insufficient_funds': {
    title: 'Insufficient Funds',
    description: 'Your account does not have enough funds for this transaction.',
    suggestions: [
      'Check your account balance',
      'Try a different payment method',
      'Add funds to your account',
      'Contact your bank for assistance'
    ],
    icon: <CreditCard className="w-6 h-6" />,
    color: 'red'
  },
  'expired_card': {
    title: 'Expired Card',
    description: 'The payment method you used has expired.',
    suggestions: [
      'Use a different payment method',
      'Update your card expiration date',
      'Contact your bank for a new card'
    ],
    icon: <CreditCard className="w-6 h-6" />,
    color: 'orange'
  },
  'processing_error': {
    title: 'Processing Error',
    description: 'We encountered an error while processing your payment.',
    suggestions: [
      'Please try again in a few minutes',
      'Check your internet connection',
      'Try a different payment method',
      'Contact support if the problem persists'
    ],
    icon: <AlertCircle className="w-6 h-6" />,
    color: 'yellow'
  },
  'network_error': {
    title: 'Network Error',
    description: 'We could not connect to our payment processor.',
    suggestions: [
      'Check your internet connection',
      'Try again in a few minutes',
      'Disable any VPN or proxy services',
      'Contact support if the problem continues'
    ],
    icon: <AlertCircle className="w-6 h-6" />,
    color: 'yellow'
  },
  'default': {
    title: 'Payment Failed',
    description: 'We encountered an issue processing your payment.',
    suggestions: [
      'Please try again',
      'Check your payment information',
      'Try a different payment method',
      'Contact support for assistance'
    ],
    icon: <AlertCircle className="w-6 h-6" />,
    color: 'red'
  }
}

export function PaymentError({ 
  errorCode, 
  errorMessage, 
  planId, 
  planName, 
  onRetry, 
  onGoBack 
}: PaymentErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const router = useRouter()

  const errorInfo = ERROR_TYPES[errorCode || 'default'] || ERROR_TYPES['default']

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      if (onRetry) {
        await onRetry()
      } else {
        // Default retry behavior - go back to payment form
        router.push(`/pricing?plan=${planId}`)
      }
    } catch (error) {
      console.error('Retry failed:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack()
    } else {
      router.push('/pricing')
    }
  }

  const handleContactSupport = () => {
    router.push('/contact')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 bg-${errorInfo.color}-100 rounded-full flex items-center justify-center mx-auto mb-6`}>
            <div className={`text-${errorInfo.color}-600`}>
              {errorInfo.icon}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {errorInfo.title}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {errorInfo.description}
          </p>
          <Badge className={`bg-${errorInfo.color}-100 text-${errorInfo.color}-800 px-4 py-2 text-lg`}>
            <AlertCircle className="w-5 h-5 mr-2" />
            Payment Error
          </Badge>
        </div>

        {/* Error Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-900">
              Error Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {planName && (
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Plan</span>
                <span className="font-semibold text-gray-900">{planName}</span>
              </div>
            )}
            
            {errorCode && (
              <div className="flex justify-between items-center py-3 border-b border-gray-200">
                <span className="text-gray-600">Error Code</span>
                <span className="font-semibold text-gray-900">{errorCode}</span>
              </div>
            )}
            
            {errorMessage && (
              <div className="py-3">
                <span className="text-gray-600 block mb-2">Error Message</span>
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {errorMessage}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center text-xl text-gray-900">
              What You Can Do
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {errorInfo.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-semibold">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Your Information is Safe</h3>
                <p className="text-sm text-green-800">
                  We use industry-standard encryption to protect your payment information. 
                  No charges were made to your account.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Button 
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            {isRetrying ? (
              <div className="flex items-center">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Retrying...
              </div>
            ) : (
              <div className="flex items-center">
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </div>
            )}
          </Button>
          
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="px-8 py-3 text-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Support Information */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Still Having Trouble?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Our support team is available to help you complete your subscription
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={handleContactSupport}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <Mail className="w-4 h-4 mr-1" />
              Contact Support
            </Button>
            <Link href="/faq">
              <Button variant="outline" size="sm" className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                FAQ
              </Button>
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="text-center mt-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Support available 24/7</span>
          </div>
        </div>
      </div>
    </div>
  )
}


