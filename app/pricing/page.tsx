"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Heart, Zap, Crown, Users, ChevronDown } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import ModernNav from "@/components/modern-nav"

const plans = [
  {
    id: "onetime",
    name: "One-time",
    price: "€14.99",
    period: "",
    description: "Perfect for a single, curated connection",
    features: [
      "One Curated Match",
      "Private Group Chat Access",
      "Meetup Facilitation",
      "Doctor-Verified Community",
    ],
    popular: false,
    stripePriceId: "price_onetime",
    buttonText: "Start Trial",
    buttonStyle: "white",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: "€29.99",
    period: "",
    description: "Full access with ultimate flexibility",
    features: [
      "Weekly Curated Matches",
      "Unlimited Private Group Chats",
      "Advanced Meetup Facilitation",
      "Priority Matching",
      "Risk-Free Guarantee",
    ],
    popular: false,
    stripePriceId: "price_monthly_subscription",
    buttonText: "Get Started",
    buttonStyle: "gradient",
  },
  {
    id: "quarterly",
    name: "3-month",
    price: "€19.99",
    period: "per month",
    description: "Best value for consistent connection",
    features: [
      "Weekly Curated Matches",
      "Unlimited Private Group Chats",
      "Advanced Meetup Facilitation",
      "Priority Matching",
      "Risk-Free Guarantee",
      "Save 33%",
    ],
    popular: true,
    stripePriceId: "price_quarterly_subscription",
    buttonText: "Choose Plan",
    buttonStyle: "gradient",
  },
  {
    id: "semiannual",
    name: "6-month",
    price: "€14.99",
    period: "per month",
    description: "Maximum savings for committed social growth",
    features: [
      "Weekly Curated Matches",
      "Unlimited Private Group Chats",
      "Advanced Meetup Facilitation",
      "Priority Matching",
      "Risk-Free Guarantee",
      "Save 50%",
    ],
    popular: false,
    stripePriceId: "price_semiannual_subscription",
    buttonText: "Save Most",
    buttonStyle: "white",
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

  const handleSubscribe = async (plan: any) => {
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-blue-600/20 to-cyan-500/20 animate-gradient-shift"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-purple-500/10 via-transparent to-blue-500/10 animate-pulse-slow"></div>
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-violet-400/30 to-purple-600/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-400/20 to-purple-500/20 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Glass morphism overlay */}
      <div className="min-h-screen bg-white/5 backdrop-blur-[1px] supports-backdrop-blur:bg-white/5 supports-no-backdrop-blur:bg-white/90">
        <ModernNav />

        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-balance">
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Unlock Your Social Circle: Choose Your BeyondRounds Plan
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
              Choose the plan that works best for your schedule.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-24 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl py-12">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:-translate-y-2 h-full flex flex-col ${
                    plan.popular 
                      ? "border-2 border-purple-200 shadow-lg bg-purple-50/50" 
                      : "border border-gray-200 bg-white"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-green-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-600 text-sm mb-4">{plan.description}</CardDescription>
                    
                    <div className="pt-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-bold text-purple-600">{plan.price}</span>
                        {plan.period && <span className="text-gray-600 text-sm">{plan.period}</span>}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex flex-col h-full">
                    <div className="flex-grow">
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              feature.includes("Risk-Free") || feature.includes("Save")
                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                : "bg-gradient-to-r from-purple-500 to-purple-600"
                            }`}>
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-700 leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-auto">
                      <Button
                        onClick={() => handleSubscribe(plan)}
                        disabled={processingPlan === plan.id || isLoading}
                        className={`w-full transition-all duration-300 ${
                          plan.buttonStyle === "gradient"
                            ? "bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white"
                            : "bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50"
                        }`}
                      >
                        {processingPlan === plan.id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </div>
                        ) : (
                          user ? plan.buttonText : "Sign Up & Subscribe"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 px-4 relative">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Frequently Asked Questions
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Everything you need to know about our plans and services.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">What's included in the trial?</h3>
                <p className="text-gray-600 leading-relaxed">
                  The 7-day trial gives you full access to all features including weekly matches, group chats, and our AI
                  facilitator. Perfect for testing the waters.
                </p>
              </div>

              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">Can I cancel anytime?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes! Monthly and annual subscriptions can be cancelled at any time. You'll continue to have access until
                  the end of your billing period.
                </p>
              </div>

              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">What's the 30-day guarantee?</h3>
                <p className="text-gray-600 leading-relaxed">
                  If you don't make meaningful connections within 30 days, we'll refund your subscription. No questions
                  asked.
                </p>
              </div>

              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <h3 className="font-bold text-gray-900 mb-3 text-lg">How does matching work?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI algorithm matches you with 2-3 doctors every Thursday based on specialty, interests, location,
                  and availability preferences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Footer */}
    
      </div>
    </div>
  )
}
