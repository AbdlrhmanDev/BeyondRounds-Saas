import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowRight, User, Heart } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
 
export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
 
          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to BeyondRounds! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your account has been created successfully. We're excited to help you find your medical tribe!
          </p>
 
          {/* Next Steps */}
          <Card className="border-0 shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="text-xl">What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-blue-800">Complete Your User</h3>
                      <p className="text-blue-700 text-sm">Tell us about yourself to get better matches</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white">Required</Badge>
                </div>
 
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-green-800">Get Your First Matches</h3>
                      <p className="text-green-700 text-sm">Receive your first group next Thursday at 4 PM</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600 text-white">Automatic</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
 
          {/* Action Buttons */}
          <div className="space-x-4">
            <Link href="/profile">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                Complete User
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Go to Dashboard
              </Button>
            </Link>
          </div>
 
          {/* Additional Info */}
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              Our support team is here to help you get started. Don't hesitate to reach out!
            </p>
            <div className="flex justify-center space-x-6">
              
                support@beyondrounds.com
              
              <Link href="/faq" className="text-blue-600 hover:underline">
                FAQ
              </Link>
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}