"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Heart, Zap, Crown, Users } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const plans = [
  {
    id: "trial",
    name: "7-Day Trial",
    price: "£9.99",
    period: "one-time",
    description: "Perfect for trying out BeyondRounds",
    features: [
      "7 days of full access",
      "Up to 2 match groups",
      "AI-facilitated group chats",
      "Profile verification",
      "30-day friendship guarantee",
    ],
    popular: false,
    stripePriceId: "price_trial_7day", // Replace with actual Stripe price ID
    icon: Zap,
    color: "text-blue-600",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "£29.99",
    period: "per month",
    description: "Great for regular networking",
    features: [
      "Unlimited weekly matches",
      "AI-facilitated group chats",
      "Priority matching algorithm",
      "Profile verification",
      "30-day friendship guarantee",
      "Cancel anytime",
    ],
    popular: true,
    stripePriceId: "price_monthly_subscription", // Replace with actual Stripe price ID
    icon: Users,
    color: "text-green-600",
  },
  {
    id: "annual",
    name: "Annual",
    price: "£299.99",
    period: "per year",
    originalPrice: "£359.88",
    description: "Best value for committed networkers",
    features: [
      "Unlimited weekly matches",
      "AI-facilitated group chats",
      "Priority matching algorithm",
      "Profile verification",
      "30-day friendship guarantee",
      "2 months free",
      "Early access to new features",
    ],
    popular: false,
    stripePriceId: "price_annual_subscription", // Replace with actual Stripe price ID
    icon: Crown,
    color: "text-purple-600",
  },
]

export default function PricingPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }
    checkUser()
  }, [supabase.auth])

  const handleSubscribe = async (plan: (typeof plans)[0]) => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    setProcessingPlan(plan.id)

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId: user.id,
          planType: plan.id,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Redirect to Stripe checkout
      window.location.href = url
    } catch (error: any) {
      console.error("Error creating checkout session:", error)
      alert("Failed to start checkout process. Please try again.")
    } finally {
      setProcessingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BeyondRounds</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 mb-8">
            Start connecting with fellow doctors today. All plans include our 30-day friendship guarantee.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.popular ? "border-2 border-blue-500 shadow-xl scale-105" : "border shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                      Most Popular
                    </Badge>
                  )}

                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${
                        plan.popular ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${plan.color}`} />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-sm">{plan.description}</CardDescription>

                    <div className="pt-4">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">/{plan.period}</span>
                      </div>
                      {plan.originalPrice && (
                        <p className="text-sm text-gray-500 line-through mt-1">{plan.originalPrice}</p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSubscribe(plan)}
                      disabled={processingPlan === plan.id || isLoading}
                      className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {processingPlan === plan.id ? "Processing..." : user ? `Get ${plan.name}` : "Sign Up & Subscribe"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What's included in the trial?</h3>
              <p className="text-gray-600 text-sm">
                The 7-day trial gives you full access to all features including weekly matches, group chats, and our AI
                facilitator. Perfect for testing the waters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes! Monthly and annual subscriptions can be cancelled at any time. You'll continue to have access until
                the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What's the 30-day guarantee?</h3>
              <p className="text-gray-600 text-sm">
                If you don't make meaningful connections within 30 days, we'll refund your subscription. No questions
                asked.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How does matching work?</h3>
              <p className="text-gray-600 text-sm">
                Our AI algorithm matches you with 2-3 doctors every Thursday based on specialty, interests, location,
                and availability preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">BeyondRounds</span>
          </div>
          <p className="text-gray-400">Where doctors become friends.</p>
        </div>
      </footer>
    </div>
  )
}
