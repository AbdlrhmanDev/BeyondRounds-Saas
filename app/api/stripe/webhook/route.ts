import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    const supabase = await createClient()

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, planType } = session.metadata!

        // Create payment record
        const { error: paymentError } = await supabase.from("payments").insert({
          user_id: userId,
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_subscription_id: session.subscription as string,
          amount: session.amount_total!,
          currency: session.currency!,
          status: "completed",
          payment_type: planType,
        })

        if (paymentError) {
          console.error("Error creating payment record:", paymentError)
        }

        // Update user profile to mark as paid
        const { error: profileError } = await supabase.from("profiles").update({ is_paid: true }).eq("id", userId)

        if (profileError) {
          console.error("Error updating profile:", profileError)
        }

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        // Find user by subscription ID and mark as unpaid
        const { data: payment } = await supabase
          .from("payments")
          .select("user_id")
          .eq("stripe_subscription_id", subscription.id)
          .single()

        if (payment) {
          await supabase.from("profiles").update({ is_paid: false }).eq("id", payment.user_id)
        }

        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          // Find user by subscription ID and mark as unpaid
          const { data: payment } = await supabase
            .from("payments")
            .select("user_id")
            .eq("stripe_subscription_id", invoice.subscription as string)
            .single()

          if (payment) {
            await supabase.from("profiles").update({ is_paid: false }).eq("id", payment.user_id)
          }
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
