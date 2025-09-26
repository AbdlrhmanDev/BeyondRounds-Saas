'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Settings, 
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Subscription {
  id: string
  planId: string
  planName: string
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing'
  currentPeriodStart: string
  currentPeriodEnd: string
  amount: number
  currency: string
  interval: 'month' | 'year'
  cancelAtPeriodEnd: boolean
  nextBillingDate?: string
  paymentMethod?: {
    type: string
    last4: string
    brand: string
  }
}

interface SubscriptionManagementProps {
  subscription?: Subscription
  onUpdateSubscription?: (subscriptionId: string, updates: Partial<Subscription>) => void
  onCancelSubscription?: (subscriptionId: string) => void
  onReactivateSubscription?: (subscriptionId: string) => void
  onUpdatePaymentMethod?: (subscriptionId: string) => void
}

export function SubscriptionManagement({ 
  subscription,
  onUpdateSubscription,
  onCancelSubscription,
  onReactivateSubscription,
  onUpdatePaymentMethod
}: SubscriptionManagementProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showBillingHistory, setShowBillingHistory] = useState(false)
  const [showPaymentMethod, setShowPaymentMethod] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'trialing':
        return 'bg-blue-100 text-blue-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active'
      case 'trialing':
        return 'Trial'
      case 'past_due':
        return 'Past Due'
      case 'canceled':
        return 'Canceled'
      case 'inactive':
        return 'Inactive'
      default:
        return 'Unknown'
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return
    
    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.'
    )
    
    if (!confirmed) return

    setIsLoading(true)
    try {
      await onCancelSubscription?.(subscription.id)
      toast.success('Subscription canceled successfully')
    } catch (error) {
      toast.error('Failed to cancel subscription')
      console.error('Cancel subscription error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    if (!subscription) return
    
    setIsLoading(true)
    try {
      await onReactivateSubscription?.(subscription.id)
      toast.success('Subscription reactivated successfully')
    } catch (error) {
      toast.error('Failed to reactivate subscription')
      console.error('Reactivate subscription error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePaymentMethod = async () => {
    if (!subscription) return
    
    setIsLoading(true)
    try {
      await onUpdatePaymentMethod?.(subscription.id)
      toast.success('Payment method updated successfully')
    } catch (error) {
      toast.error('Failed to update payment method')
      console.error('Update payment method error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">
            You don't have an active subscription. Subscribe to access premium features.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            View Plans
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-900">Subscription Details</CardTitle>
            <Badge className={getStatusColor(subscription.status)}>
              {getStatusText(subscription.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Plan</span>
                <span className="font-semibold text-gray-900">{subscription.planName}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Amount</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(subscription.amount, subscription.currency)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Billing</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {subscription.interval}ly
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Current Period</span>
                <span className="font-semibold text-gray-900">
                  {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>
              
              {subscription.nextBillingDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Next Billing</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(subscription.nextBillingDate)}
                  </span>
                </div>
              )}
              
              {subscription.cancelAtPeriodEnd && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cancellation</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    Ends {formatDate(subscription.currentPeriodEnd)}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      {subscription.paymentMethod && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-900">Payment Method</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUpdatePaymentMethod}
                disabled={isLoading}
              >
                <Settings className="w-4 h-4 mr-2" />
                Update
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <CreditCard className="w-6 h-6 text-gray-600" />
              <div>
                <p className="font-semibold text-gray-900 capitalize">
                  {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  {subscription.paymentMethod.type}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-gray-900">Subscription Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {subscription.status === 'active' && !subscription.cancelAtPeriodEnd ? (
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-2" />
                )}
                Cancel Subscription
              </Button>
            ) : subscription.status === 'canceled' || subscription.cancelAtPeriodEnd ? (
              <Button
                onClick={handleReactivateSubscription}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Reactivate Subscription
              </Button>
            ) : null}
            
            <Button
              variant="outline"
              onClick={() => setShowBillingHistory(!showBillingHistory)}
            >
              {showBillingHistory ? (
                <EyeOff className="w-4 h-4 mr-2" />
              ) : (
                <Eye className="w-4 h-4 mr-2" />
              )}
              {showBillingHistory ? 'Hide' : 'Show'} Billing History
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open('/api/billing/invoice', '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      {showBillingHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-900">Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* This would typically be populated from an API call */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{subscription.planName}</p>
                  <p className="text-sm text-gray-600">{formatDate(subscription.currentPeriodStart)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(subscription.amount, subscription.currency)}
                  </p>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    Paid
                  </Badge>
                </div>
              </div>
              
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  More billing history will appear here as you continue using the service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Important Notes */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Cancellation Policy</h3>
                <p className="text-sm text-blue-800">
                  You can cancel your subscription at any time. You'll continue to have access 
                  to premium features until the end of your current billing period.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-900 mb-1">30-Day Money-Back Guarantee</h3>
                <p className="text-sm text-green-800">
                  Not satisfied? Contact support within 30 days for a full refund, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


