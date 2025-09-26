import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})
 
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, email, cardholderName, successUrl, cancelUrl } = body
 
    // Validate required fields
    if (!planId || !email || !cardholderName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
 
    // Define plan pricing (in cents)
    const planPricing: Record<string, number> = {
      basic: 2900,    // $29.00
      premium: 4900,  // $49.00
      professional: 7900, // $79.00
      enterprise: 14900,  // $149.00
    }
 
    const price = planPricing[planId]
    if (!price) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }
 
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `BeyondRounds ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
              description: 'Monthly subscription for medical professional matching platform',
              images: ['https://beyondrounds.com/logo.png'], // Replace with actual logo URL
            },
            unit_amount: price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planId,
        cardholderName,
      },
      subscription_data: {
        metadata: {
          planId,
          cardholderName,
        },
      },
      // Enable customer portal for subscription management
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    })
 
    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
 
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}