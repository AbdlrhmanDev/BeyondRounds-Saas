'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Star, Users, Heart, Zap, Crown } from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  period: string
  description: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
  color: string
}

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan
  onSelect: (planId: string) => void
  isLoading?: boolean
  currentPlan?: string
}

const planIcons = {
  basic: <Users className="w-6 h-6" />,
  premium: <Heart className="w-6 h-6" />,
  professional: <Crown className="w-6 h-6" />,
  enterprise: <Zap className="w-6 h-6" />,
}

export function SubscriptionPlanCard({ 
  plan, 
  onSelect, 
  isLoading = false, 
  currentPlan 
}: SubscriptionPlanCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isCurrentPlan = currentPlan === plan.id
  const isPopular = plan.popular

  const handleSelect = () => {
    if (!isCurrentPlan && !isLoading) {
      onSelect(plan.id)
    }
  }

  return (
    <Card 
      className={`relative transition-all duration-300 cursor-pointer ${
        isPopular 
          ? 'border-blue-500 shadow-lg scale-105' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
      } ${isCurrentPlan ? 'bg-blue-50 border-blue-500' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-600 text-white px-4 py-1 text-sm font-semibold">
            <Star className="w-4 h-4 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-green-600 text-white px-4 py-1 text-sm font-semibold">
            <CheckCircle className="w-4 h-4 mr-1" />
            Current Plan
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isPopular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {plan.icon}
        </div>
        
        <CardTitle className={`text-xl font-bold ${
          isPopular ? 'text-blue-900' : 'text-gray-900'
        }`}>
          {plan.name}
        </CardTitle>
        
        <p className="text-gray-600 text-sm mt-2">
          {plan.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pricing */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {plan.currency} {plan.price}
          </div>
          <div className="text-gray-600 text-sm">
            per {plan.period}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm">What's included:</h4>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          {isCurrentPlan ? (
            <Button 
              disabled 
              className="w-full bg-green-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Current Plan
            </Button>
          ) : (
            <Button 
              onClick={handleSelect}
              disabled={isLoading}
              className={`w-full ${
                isPopular 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Choose ${plan.name}`
              )}
            </Button>
          )}
        </div>

        {/* Hover Effect */}
        {isHovered && !isCurrentPlan && (
          <div className="absolute inset-0 bg-blue-50 bg-opacity-50 rounded-lg pointer-events-none transition-opacity duration-300" />
        )}
      </CardContent>
    </Card>
  )
}

// Predefined subscription plans
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    currency: '$',
    period: 'month',
    description: 'Perfect for getting started with professional connections',
    features: [
      'Weekly matching with 3-4 doctors',
      'Group chat with matched professionals',
      'Basic profile features',
      'Email support',
      'Mobile app access'
    ],
    icon: planIcons.basic,
    color: 'gray'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49,
    currency: '$',
    period: 'month',
    description: 'Most popular choice for active medical professionals',
    features: [
      'Everything in Basic',
      'Priority matching algorithm',
      'Advanced profile customization',
      'Professional networking events',
      'Priority customer support',
      'Advanced analytics dashboard'
    ],
    popular: true,
    icon: planIcons.premium,
    color: 'blue'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    currency: '$',
    period: 'month',
    description: 'For established professionals seeking deeper connections',
    features: [
      'Everything in Premium',
      'Exclusive professional groups',
      'Mentorship program access',
      'Advanced matching preferences',
      'Custom group creation',
      'Dedicated account manager'
    ],
    icon: planIcons.professional,
    color: 'purple'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    currency: '$',
    period: 'month',
    description: 'For medical institutions and large practices',
    features: [
      'Everything in Professional',
      'Team management dashboard',
      'Custom integration support',
      'Advanced reporting & analytics',
      'White-label options',
      '24/7 priority support',
      'Custom matching algorithms'
    ],
    icon: planIcons.enterprise,
    color: 'gold'
  }
]


