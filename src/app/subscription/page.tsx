import { SubscriptionManagement } from '@/components/organisms/SubscriptionManagement'
 
export default function SubscriptionPage() {
  // In a real app, you'd fetch this from your API
  const mockSubscription = {
    id: 'sub_1234567890',
    planId: 'premium',
    planName: 'Premium',
    status: 'active' as const,
    currentPeriodStart: '2024-01-01T00:00:00Z',
    currentPeriodEnd: '2024-02-01T00:00:00Z',
    amount: 4900, // $49.00 in cents
    currency: 'USD',
    interval: 'month' as const,
    cancelAtPeriodEnd: false,
    nextBillingDate: '2024-02-01T00:00:00Z',
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'visa'
    }
  }
 
  const handleUpdateSubscription = async (subscriptionId: string, updates: Record<string, unknown>) => {
    console.log('Updating subscription:', subscriptionId, updates)
    // Implement subscription update logic
  }
 
  const handleCancelSubscription = async (subscriptionId: string) => {
    console.log('Canceling subscription:', subscriptionId)
    // Implement subscription cancellation logic
  }
 
  const handleReactivateSubscription = async (subscriptionId: string) => {
    console.log('Reactivating subscription:', subscriptionId)
    // Implement subscription reactivation logic
  }
 
  const handleUpdatePaymentMethod = async (subscriptionId: string) => {
    console.log('Updating payment method for subscription:', subscriptionId)
    // Implement payment method update logic
  }
 
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Management</h1>
          <p className="text-gray-600">
            Manage your BeyondRounds subscription and billing information
          </p>
        </div>
 
        <SubscriptionManagement
          subscription={mockSubscription}
          onUpdateSubscription={handleUpdateSubscription}
          onCancelSubscription={handleCancelSubscription}
          onReactivateSubscription={handleReactivateSubscription}
          onUpdatePaymentMethod={handleUpdatePaymentMethod}
        />
      </div>
    </div>
  )
}