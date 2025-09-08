import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, UserCheck, Users, MessageCircle, Calendar, Shield, Zap, Award } from "lucide-react"
import Link from "next/link"

const steps = [
  {
    number: "01",
    title: "Sign Up & Verify",
    description: "Create your account and upload your medical credentials for verification",
    icon: UserCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    details: [
      "Complete your professional profile",
      "Upload medical license and ID",
      "Get verified within 48 hours",
      "Set your preferences and interests",
    ],
  },
  {
    number: "02",
    title: "Choose Your Plan",
    description: "Select a subscription plan that works for your networking goals",
    icon: Award,
    color: "text-green-600",
    bgColor: "bg-green-100",
    details: [
      "Start with our 7-day trial",
      "Choose monthly or annual plans",
      "30-day friendship guarantee",
      "Cancel anytime, no commitments",
    ],
  },
  {
    number: "03",
    title: "Get Matched",
    description: "Our AI algorithm creates compatible groups every Thursday at 4 PM",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    details: [
      "Matched with 2-3 other doctors",
      "Based on specialty, interests, location",
      "Gender-balanced groups when possible",
      "No repeat matches for 6 weeks",
    ],
  },
  {
    number: "04",
    title: "Connect & Chat",
    description: "Join your private group chat and start building relationships",
    icon: MessageCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    details: [
      "Private group conversations",
      "AI facilitator helps break the ice",
      "Plan meetups and activities",
      "Build lasting professional friendships",
    ],
  },
]

const features = [
  {
    title: "Smart Matching Algorithm",
    description: "Our AI considers specialty (30%), interests (40%), location (20%), and availability (10%)",
    icon: Zap,
    color: "text-blue-600",
  },
  {
    title: "Weekly Fresh Matches",
    description: "New connections every Thursday, expanding your professional network continuously",
    icon: Calendar,
    color: "text-green-600",
  },
  {
    title: "Verified Professionals Only",
    description: "Every member is a verified medical professional, ensuring quality connections",
    icon: Shield,
    color: "text-purple-600",
  },
]

export default function HowItWorksPage() {
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
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/join">
              <Button>Join Now</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">The Process</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-balance">How BeyondRounds Works</h1>
          <p className="text-xl text-gray-600 mb-8 text-pretty max-w-3xl mx-auto">
            From verification to meaningful connections, here's your journey to building lasting professional
            relationships with fellow medical professionals.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 1

              return (
                <div
                  key={index}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${isEven ? "lg:grid-flow-col-dense" : ""}`}
                >
                  <div className={isEven ? "lg:col-start-2" : ""}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-4xl font-bold text-gray-200">{step.number}</div>
                      <div className={`w-12 h-12 ${step.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${step.color}`} />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-xl text-gray-600 mb-6">{step.description}</p>
                    <ul className="space-y-3">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-3">
                          <div className={`w-2 h-2 ${step.bgColor} rounded-full mt-2 flex-shrink-0`}></div>
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={isEven ? "lg:col-start-1" : ""}>
                    <Card className="shadow-xl border-0">
                      <CardContent className="p-8">
                        <div
                          className={`w-20 h-20 ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                        >
                          <Icon className={`w-10 h-10 ${step.color}`} />
                        </div>
                        <div className="text-center">
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">Step {step.number}</h4>
                          <p className="text-gray-600">{step.title}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Makes BeyondRounds Special</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform is designed specifically for medical professionals, with features that ensure meaningful and
              professional connections.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center border-0 shadow-lg">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Weekly Schedule</h2>
            <p className="text-gray-600">Here's what to expect each week as a BeyondRounds member</p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Thursday 12:00 PM</h4>
                    <p className="text-gray-600">Join cutoff - Last chance to join this week's matching</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Thursday 4:00 PM</h4>
                    <p className="text-gray-600">Matches revealed - Get your new group and start chatting</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Friday - Sunday</h4>
                    <p className="text-gray-600">Weekend meetup window - Plan and meet with your group</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Connecting?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of medical professionals who have found their community through BeyondRounds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/join">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                View Pricing
              </Button>
            </Link>
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
