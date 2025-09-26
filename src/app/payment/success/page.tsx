import { PaymentSuccess } from '@/components/features/payments/PaymentSuccess'
 
export default function PaymentSuccessPage() {
  // In a real app, you'd get these from URL params or API
  const planId = 'premium'
  const planName = 'Premium'
  const amount = 4900 // $49.00 in cents
  const currency = 'USD'
  const customerEmail = 'user@example.com'
  const subscriptionId = 'sub_1234567890'
 
  return (
    <PaymentSuccess
      planId={planId}
      planName={planName}
      amount={amount}
      currency={currency}
      customerEmail={customerEmail}
      subscriptionId={subscriptionId}
    />
  )
}