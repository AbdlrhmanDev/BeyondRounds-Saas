import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, HelpCircle, Users, Shield, CreditCard, Calendar } from "lucide-react"
import Link from "next/link"

const faqCategories = [
  {
    title: "Getting Started",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    faqs: [
      {
        question: "Who can join BeyondRounds?",
        answer:
          "BeyondRounds is exclusively for verified medical professionals including doctors, nurses, physician assistants, and other licensed healthcare providers. All members must complete our verification process.",
      },
      {
        question: "How does the verification process work?",
        answer:
          "Upload your medical license, government ID, and a selfie. Our team reviews all documents within 48 hours. We maintain strict verification standards to ensure a trusted community.",
      },
      {
        question: "What happens after I'm verified?",
        answer:
          "Once verified and subscribed, you'll start receiving weekly matches every Thursday at 4 PM. You'll be matched with 2-3 other doctors based on your preferences and compatibility.",
      },
    ],
  },
  {
    title: "Matching & Groups",
    icon: Calendar,
    color: "text-green-600",
    bgColor: "bg-green-100",
    faqs: [
      {
        question: "How does the matching algorithm work?",
        answer:
          "Our AI considers your specialty (30%), interests (40%), location (20%), and availability (10%) to create compatible groups. We also ensure gender balance and prevent repeat matches within 6 weeks.",
      },
      {
        question: "Can I choose who I'm matched with?",
        answer:
          "While you can't select specific individuals, you can set preferences for specialty, interests, gender, and availability. Our algorithm uses these to find the best matches for you.",
      },
      {
        question: "What if I don't connect with my matches?",
        answer:
          "That's completely normal! Not every match will lead to friendship. You'll get new matches every week, and our 30-day guarantee ensures you'll find meaningful connections.",
      },
    ],
  },
  {
    title: "Pricing & Billing",
    icon: CreditCard,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    faqs: [
      {
        question: "What subscription plans are available?",
        answer:
          "We offer a 7-day trial (£9.99), monthly subscription (£29.99/month), and annual subscription (£299.99/year with 2 months free). All plans include unlimited matches and full platform access.",
      },
      {
        question: "What's the 30-day friendship guarantee?",
        answer:
          "If you don't make meaningful connections within 30 days of subscribing, we'll provide a full refund. No questions asked. We're confident in our platform's ability to help you connect.",
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer:
          "Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your current billing period, and no future charges will occur.",
      },
    ],
  },
  {
    title: "Privacy & Security",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-100",
    faqs: [
      {
        question: "How is my personal information protected?",
        answer:
          "We use enterprise-grade security with end-to-end encryption. All data is stored in EU servers with strict GDPR compliance. Verification documents are automatically deleted after 90 days.",
      },
      {
        question: "Who can see my profile information?",
        answer:
          "Only your matched group members can see your profile details. We never share your information with third parties or use it for marketing purposes outside the platform.",
      },
      {
        question: "Can I control what information is shared?",
        answer:
          "Yes! You have full control over your profile visibility. You can choose what information to share and update your preferences at any time in your dashboard.",
      },
    ],
  },
]

export default function FAQPage() {
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
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">Help Center</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-balance">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 mb-8 text-pretty max-w-3xl mx-auto">
            Find answers to common questions about BeyondRounds. Can't find what you're looking for? Contact our support
            team.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="space-y-12">
            {faqCategories.map((category, categoryIndex) => {
              const Icon = category.icon
              return (
                <div key={categoryIndex}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${category.color}`} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                  </div>

                  <div className="grid gap-4">
                    {category.faqs.map((faq, faqIndex) => (
                      <Card key={faqIndex} className="shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-start gap-2">
                            <HelpCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            {faq.question}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Our support team is here to help. Get in touch and we'll respond within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg">Contact Support</Button>
            </Link>
            <Link href="/join">
              <Button size="lg" variant="outline">
                Start Your Trial
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
