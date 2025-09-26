import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Welcome to <span className="text-blue-600">BeyondRounds</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Connect with medical professionals, share knowledge, and advance your career in healthcare.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-blue-600">🏥 Professional Network</CardTitle>
              <CardDescription>
                Connect with doctors, nurses, and healthcare professionals
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-green-600">💬 Secure Messaging</CardTitle>
              <CardDescription>
                HIPAA-compliant communication for sensitive discussions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-purple-600">🎓 Knowledge Sharing</CardTitle>
              <CardDescription>
                Share insights, cases, and learn from experienced professionals
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/auth/sign-up">
              Get Started
            </Link>
          </Button>
          <Button variant="outline" asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/auth/login">
              Sign In
            </Link>
          </Button>
          <Button variant="ghost" asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/dashboard">
              Dashboard
            </Link>
          </Button>
        </div>

        <div className="text-sm text-gray-500 mt-8">
          <p>Built for healthcare professionals by healthcare professionals</p>
        </div>
      </div>
    </div>
  )
}