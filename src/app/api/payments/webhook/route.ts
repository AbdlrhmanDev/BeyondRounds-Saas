import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})
 
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
 
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!
 
    let event: Stripe.Event
 
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }
 
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break
 
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
 
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
 
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
 
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
 
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
 
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
 
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
 
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)
  
  // Update user subscription status in database
  const subscriptionId = session.subscription as string
  const customerEmail = session.customer_email
  const planId = session.metadata?.planId
 
  if (subscriptionId && customerEmail && planId) {
    // Update user profile with subscription info
    // This would typically update your database
    console.log('Updating user subscription:', {
      email: customerEmail,
      subscriptionId,
      planId,
      status: 'active'
    })
  }
}
 
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)
  
  // Update user subscription in database
  const customerId = subscription.customer as string
  const planId = subscription.metadata?.planId
 
  if (customerId && planId) {
    // Update user profile with new subscription
    console.log('Creating subscription:', {
      customerId,
      subscriptionId: subscription.id,
      planId,
      status: subscription.status
    })
  }
}
 
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  
  // Update subscription status in database
  const subscriptionId = subscription.id
  const status = subscription.status
 
  console.log('Updating subscription:', {
    subscriptionId,
    status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  })
}
 
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  // Update user subscription status to canceled
  const subscriptionId = subscription.id
 
  console.log('Canceling subscription:', {
    subscriptionId,
    status: 'canceled'
  })
}
 
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded for invoice:', invoice.id)
  
  // Update user subscription status
  const subscriptionId = invoice.subscription as string
 
  if (subscriptionId) {
    console.log('Payment succeeded for subscription:', subscriptionId)
  }
}
 
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed for invoice:', invoice.id)
  
  // Handle failed payment
  const subscriptionId = invoice.subscription as string
  const customerEmail = invoice.customer_email
 
  if (subscriptionId && customerEmail) {
    console.log('Payment failed for subscription:', {
      subscriptionId,
      customerEmail,
      amount: invoice.amount_due
    })
    
    // Send payment failure notification email
    // This would typically trigger an email notification
  }
}