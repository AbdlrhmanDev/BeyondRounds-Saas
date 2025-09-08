"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Heart } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function PaymentSuccessPage() {
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    // Verify payment session
    const verifyPayment = async () => {
      if (sessionId) {
        try {
          const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
          const data = await response.json()

          if (data.success) {
            // Payment verified successfully
            setIsLoading(false)
          } else {
            // Redirect to pricing if verification fails
            window.location.href = "/pricing"
          }
        } catch (error) {
          console.error("Error verifying payment:", error)
          window.location.href = "/pricing"
        }
      } else {
        window.location.href = "/pricing"
      }
    }

    verifyPayment()
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Welcome to BeyondRounds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Your subscription is now active. You'll start receiving weekly matches every Thursday at 4 PM.
          </p>
          <p className="text-sm text-gray-600">
            Don't forget to complete your profile verification to start connecting with fellow doctors.
          </p>
          <div className="space-y-2">
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
            <Link href="/verify">
              <Button variant="outline" className="w-full bg-transparent">
                Complete Verification
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
