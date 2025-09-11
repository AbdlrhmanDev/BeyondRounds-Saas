import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, BookOpen, Users, Lightbulb, MapPin, Coffee, MessageCircle, Scale, Calendar, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import ModernNav from "@/components/modern-nav"

const blogPosts = [
  {
    id: 1,
    title: "The Hidden Epidemic: Why Doctors Are Lonely (And What We're Doing About It)",
    description: "Exploring the unique challenges doctors face in building friendships and maintaining social connections.",
    category: "Mental Health",
    readTime: "8 min read",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-100",
    gradient: "from-red-500 to-pink-500",
    featured: true,
  },
  {
    id: 2,
    title: "5 Doctors Share How BeyondRounds Changed Their Social Lives",
    description: "Real member testimonials about finding friendship through the platform.",
    category: "Success Stories",
    readTime: "6 min read",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    gradient: "from-blue-500 to-cyan-500",
    featured: true,
  },
  {
    id: 3,
    title: "The Science of Friendship: Why Doctors Need Doctor Friends",
    description: "Research-backed article about shared experiences and understanding in professional peer relationships.",
    category: "Research",
    readTime: "10 min read",
    icon: Lightbulb,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    gradient: "from-yellow-500 to-orange-500",
    featured: true,
  },
  {
    id: 4,
    title: "From Scrubs to Social: Transitioning from Work Mode to Friend Mode",
    description: "Tips for doctors on separating professional and personal interactions.",
    category: "Lifestyle",
    readTime: "5 min read",
    icon: Coffee,
    color: "text-green-600",
    bgColor: "bg-green-100",
    gradient: "from-green-500 to-emerald-500",
    featured: false,
  },
  {
    id: 5,
    title: "New City, New Job, New Friends: A Resident's Guide to Social Survival",
    description: "Practical advice for medical professionals relocating for training or positions.",
    category: "Career",
    readTime: "7 min read",
    icon: MapPin,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    gradient: "from-purple-500 to-violet-500",
    featured: false,
  },
  {
    id: 6,
    title: "Beyond Medicine: Doctors Share Their Surprising Hobbies and Passions",
    description: "Showcasing the diverse interests of medical professionals outside healthcare.",
    category: "Lifestyle",
    readTime: "4 min read",
    icon: BookOpen,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    gradient: "from-indigo-500 to-blue-500",
    featured: false,
  },
  {
    id: 7,
    title: "The Art of Medical Small Talk: Conversations That Go Beyond Cases",
    description: "Guide to building personal connections with fellow doctors.",
    category: "Communication",
    readTime: "6 min read",
    icon: MessageCircle,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    gradient: "from-teal-500 to-cyan-500",
    featured: false,
  },
  {
    id: 8,
    title: "Work-Life Balance for Doctors: Why Friends Matter More Than You Think",
    description: "Discussing the mental health and wellness benefits of strong social connections.",
    category: "Wellness",
    readTime: "9 min read",
    icon: Scale,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    gradient: "from-pink-500 to-rose-500",
    featured: false,
  },
]

const categories = [
  { name: "All", count: blogPosts.length },
  { name: "Mental Health", count: blogPosts.filter(post => post.category === "Mental Health").length },
  { name: "Success Stories", count: blogPosts.filter(post => post.category === "Success Stories").length },
  { name: "Research", count: blogPosts.filter(post => post.category === "Research").length },
  { name: "Lifestyle", count: blogPosts.filter(post => post.category === "Lifestyle").length },
  { name: "Career", count: blogPosts.filter(post => post.category === "Career").length },
  { name: "Communication", count: blogPosts.filter(post => post.category === "Communication").length },
  { name: "Wellness", count: blogPosts.filter(post => post.category === "Wellness").length },
]

export default function BlogPage() {
  const featuredPosts = blogPosts.filter(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

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
        <section className="py-24 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 backdrop-blur-lg rounded-full border border-white/20 shadow-lg shadow-violet-500/10">
              <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                BeyondRounds Blog
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-balance leading-tight">
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent animate-gradient-text">
                Stories, Insights &
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                Medical Connections
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
              Exploring the human side of medicine through friendship, connection, and the stories that matter most to healthcare professionals.
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {categories.map((category, index) => (
                <Button
                  key={index}
                  variant={category.name === "All" ? "default" : "outline"}
                  className={`${
                    category.name === "All"
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                      : "hover:bg-white/20 hover:backdrop-blur-sm"
                  } transition-all duration-300`}
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-violet-500 to-blue-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8 mb-16">
              {featuredPosts.map((post, index) => {
                const Icon = post.icon
                return (
                  <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${post.gradient}`}></div>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 ${post.bgColor} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-6 h-6 ${post.color}`} />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl leading-tight group-hover:text-violet-600 transition-colors duration-300">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {post.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </div>
                        <Button variant="ghost" size="sm" className="group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors duration-300">
                          Read More
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* All Articles */}
        <section className="py-12 px-4 bg-white/30 backdrop-blur-sm">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-900">All Articles</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {regularPosts.map((post, index) => {
                const Icon = post.icon
                return (
                  <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 ${post.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${post.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {post.category}
                            </Badge>
                            <span className="text-xs text-gray-500">{post.readTime}</span>
                          </div>
                          <CardTitle className="text-lg leading-tight group-hover:text-violet-600 transition-colors duration-300">
                            {post.title}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {post.description}
                      </p>
                      <Button variant="ghost" size="sm" className="w-full justify-center group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors duration-300">
                        Read Article
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-20 px-4 bg-gradient-to-r from-violet-600 to-blue-600">
          <div className="container mx-auto text-center max-w-3xl">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">Never Miss a Story</h2>
            <p className="text-xl text-blue-100 mb-8">
              Get the latest insights on medical friendships, wellness, and professional growth delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 bg-white/10 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button className="bg-white text-violet-600 hover:bg-gray-100 px-8">
                Subscribe
              </Button>
            </div>
            <p className="text-sm text-blue-200 mt-4">
              Join 1,000+ doctors who read our weekly insights. Unsubscribe anytime.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Find Your Medical Tribe?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of doctors who've discovered meaningful friendships through BeyondRounds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/join">
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:from-violet-700 hover:to-blue-700">
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
