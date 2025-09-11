import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, HelpCircle, Users, Shield, CreditCard, Calendar } from "lucide-react"
import Link from "next/link"

const faqCategories = [
  {
    title: "General Questions",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    faqs: [
      {
        question: "What is BeyondRounds?",
        answer:
          "BeyondRounds is a premium social club exclusively for verified doctors. We match you weekly with 2-3 other doctors in your city based on shared interests, hobbies, and availability – not for professional networking, but to build genuine friendships.",
      },
      {
        question: "How is this different from other networking apps?",
        answer:
          "We're not about professional networking or dating. BeyondRounds is specifically designed for doctors to make real friends who understand their lifestyle and share their personal interests outside of medicine.",
      },
      {
        question: "Who can join BeyondRounds?",
        answer:
          "Only verified medical doctors, including medical students, residents, fellows, and practicing physicians. We manually verify all members through license verification and photo confirmation.",
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
        question: "How does the matching work?",
        answer:
          "Every Thursday at 4 PM, our algorithm creates small groups of 3–4 doctors based on your specialty, interests, availability, and location. You'll receive an email and in-app notification when your new group is ready.",
      },
      {
        question: "What if I don't click with my group?",
        answer:
          "That's completely normal! You'll get a new group every week, and our algorithm learns from your feedback to make better matches over time. We also ensure you won't be matched with the same person again for at least 6 weeks.",
      },
      {
        question: "Can I choose my own matches?",
        answer:
          "Our curated approach is what makes BeyondRounds special. Trust our algorithm – it's designed by doctors, for doctors, and gets smarter with each match.",
      },
    ],
  },
  {
    title: "Meetings & Safety",
    icon: Shield,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    faqs: [
      {
        question: "Where do groups meet?",
        answer:
          "Groups decide together where to meet within your city. Popular options include coffee shops, restaurants, parks, or activity-based meetups like hiking or sports.",
      },
      {
        question: "Is it safe to meet strangers?",
        answer:
          "All members are verified doctors, and we encourage meeting in public places. Our AI facilitator, RoundsBot, helps groups plan safe, public meetups and provides conversation starters.",
      },
      {
        question: "What if someone doesn't show up?",
        answer:
          "We take no-shows seriously. Members get one warning, a temporary pause after the second no-show, and potential removal after the third.",
      },
    ],
  },
  {
    title: "Pricing & Membership",
    icon: CreditCard,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    faqs: [
      {
        question: "How much does BeyondRounds cost?",
        answer:
          "Trial: €9.99 (first month) • Founders: €14.99/month (limited time) • Core: €29.99/month • Premium: €49.99/month (includes advanced filtering)",
      },
      {
        question: "Can I cancel anytime?",
        answer:
          "Yes, you can cancel your subscription at any time through your account settings. You'll continue to receive matches until your current billing period ends.",
      },
      {
        question: "What's the 30-Day Friendship Guarantee?",
        answer:
          "If you don't have at least 2 meaningful meetups in your first 30 days, we'll provide a full refund. We're confident you'll love the connections you make!",
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
