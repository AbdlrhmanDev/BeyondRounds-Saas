import { PaymentError } from '@/components/features/payments/PaymentError'
 
export default function PaymentErrorPage() {
  // In a real app, you'd get these from URL params or API
  const errorCode = 'card_declined'
  const errorMessage = 'Your card was declined by your bank. Please try a different payment method.'
  const planId = 'premium'
  const planName = 'Premium'
 
  return (
    <PaymentError
      errorCode={errorCode}
      errorMessage={errorMessage}
      planId={planId}
      planName={planName}
    />
  )
}