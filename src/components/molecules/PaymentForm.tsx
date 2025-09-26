'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, CreditCard, Shield, Clock, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'
import React from 'react'

interface PaymentFormProps {
  planId: string
  planName: string
  price: number
  currency: string
  features: string[]
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function PaymentForm({ 
  planId, 
  planName, 
  price, 
  currency, 
  features, 
  onSuccess: _onSuccess, 
  onError 
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [cardholderName, setCardholderName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !cardholderName) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          email,
          cardholderName,
          successUrl: `${window.location.origin}/payment/success?plan=${planId}`,
          cancelUrl: `${window.location.origin}/payment/cancel`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed')
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Complete Your Subscription
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Join thousands of medical professionals building meaningful connections
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Plan Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg text-blue-900">{planName}</h3>
                <p className="text-blue-700">Monthly subscription</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {currency} {price}
                </div>
                <div className="text-sm text-blue-600">per month</div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="mt-1"
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-900 mb-1">Secure Payment</p>
                  <p>
                    Your payment information is processed securely by Stripe. 
                    We never store your card details on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Subscribe Now - {currency} {price}/month
                </div>
              )}
            </Button>
          </form>

          {/* Trust Indicators */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                30-day money-back guarantee
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Join 1000+ doctors
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Cancel anytime. No hidden fees.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


