"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, Mail, MapPin, Clock, Send } from "lucide-react"
import Link from "next/link"
import Footer from "@/components/footer"
import ModernNav from "@/components/modern-nav"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setSubmitted(true)
    setIsSubmitting(false)
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Enhanced Animated Gradient Background */}
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
        {/* Navigation */}
        <ModernNav transparent={true} />

        {/* Enhanced Hero Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-3 h-3 bg-gradient-to-r from-violet-400/60 to-purple-500/60 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-2 h-2 bg-gradient-to-r from-blue-400/60 to-cyan-500/60 rounded-full animate-bounce"></div>
            <div className="absolute bottom-40 left-1/4 w-2.5 h-2.5 bg-gradient-to-r from-emerald-400/60 to-teal-500/60 rounded-full animate-ping"></div>
            <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-gradient-to-r from-pink-400/60 to-rose-500/60 rounded-full animate-pulse"></div>
          </div>

          <div className="container mx-auto text-center max-w-4xl relative z-10">
            {/* Enhanced Glassmorphic badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 mb-12 bg-white/15 backdrop-blur-xl rounded-full border border-white/30 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 transition-all duration-500 hover:scale-105 group">
              <div className="w-3 h-3 bg-gradient-to-r from-violet-400 to-blue-500 rounded-full animate-pulse group-hover:animate-spin"></div>
              <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-text">
                Get in Touch
              </span>
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-emerald-500 rounded-full animate-ping"></div>
            </div>

            {/* Enhanced Gradient headline */}
            <h1 className="text-5xl lg:text-6xl font-bold mb-8 text-balance leading-tight">
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent animate-gradient-text drop-shadow-2xl">
                We're Here to Help
              </span>
            </h1>

            {/* Enhanced supportive copy */}
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 text-pretty max-w-3xl mx-auto leading-relaxed">
              Have questions about BeyondRounds? Need support with your account? Our team is ready to assist you
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent font-semibold animate-gradient-text"> with personalized care</span>.
            </p>
          </div>
        </section>

        {/* Enhanced Contact Content */}
        <section className="pb-24 px-4 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-20 w-48 h-48 bg-gradient-to-r from-emerald-400/10 to-teal-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-56 h-56 bg-gradient-to-r from-violet-400/10 to-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
          </div>

          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Enhanced Contact Form */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <Card className="relative bg-white/50 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/60 group-hover:border-white/40">
                  <CardHeader className="p-10">
                    <CardTitle className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">
                      Send us a Message
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-600 leading-relaxed">
                      Fill out the form below and we'll get back to you within 24 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 pt-0">
                    {submitted ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30 animate-glow">
                          <Send className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Message Sent!</h3>
                        <p className="text-lg text-gray-600 leading-relaxed">Thank you for contacting us. We'll respond within 24 hours.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label htmlFor="name" className="text-lg font-semibold text-gray-700">Full Name</Label>
                            <Input 
                              id="name" 
                              name="name" 
                              value={formData.name} 
                              onChange={handleChange} 
                              required 
                              className="h-12 bg-white/60 backdrop-blur-sm border-white/30 rounded-xl focus:bg-white/80 focus:border-blue-300/50 transition-all duration-300 text-lg"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="email" className="text-lg font-semibold text-gray-700">Email Address</Label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="h-12 bg-white/60 backdrop-blur-sm border-white/30 rounded-xl focus:bg-white/80 focus:border-blue-300/50 transition-all duration-300 text-lg"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="subject" className="text-lg font-semibold text-gray-700">Subject</Label>
                          <Input 
                            id="subject" 
                            name="subject" 
                            value={formData.subject} 
                            onChange={handleChange} 
                            required 
                            className="h-12 bg-white/60 backdrop-blur-sm border-white/30 rounded-xl focus:bg-white/80 focus:border-blue-300/50 transition-all duration-300 text-lg"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="message" className="text-lg font-semibold text-gray-700">Message</Label>
                          <Textarea
                            id="message"
                            name="message"
                            rows={6}
                            value={formData.message}
                            onChange={handleChange}
                            required
                            className="bg-white/60 backdrop-blur-sm border-white/30 rounded-xl focus:bg-white/80 focus:border-blue-300/50 transition-all duration-300 text-lg resize-none"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Sending...
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              Send Message
                              <Send className="w-5 h-5" />
                            </div>
                          )}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Contact Information */}
              <div className="space-y-10">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <Card className="relative bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/50 group-hover:border-white/40">
                    <CardHeader className="p-8">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                          <Mail className="w-6 h-6 text-white group-hover:animate-pulse" />
                        </div>
                        <span className="bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Email Support</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                      <p className="text-gray-600 mb-4 text-lg">For general inquiries and support:</p>
                      <p className="font-semibold text-lg text-gray-900 mb-6">support@beyondrounds.com</p>
                      <p className="text-gray-600 mb-4 text-lg">For partnership opportunities:</p>
                      <p className="font-semibold text-lg text-gray-900">partnerships@beyondrounds.com</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <Card className="relative bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/50 group-hover:border-white/40">
                    <CardHeader className="p-8">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                          <Clock className="w-6 h-6 text-white group-hover:animate-pulse" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent">Response Times</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
                          <span className="text-gray-600 text-lg">General Support:</span>
                          <span className="font-semibold text-lg text-gray-900">Within 24 hours</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
                          <span className="text-gray-600 text-lg">Technical Issues:</span>
                          <span className="font-semibold text-lg text-gray-900">Within 4 hours</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
                          <span className="text-gray-600 text-lg">Account Verification:</span>
                          <span className="font-semibold text-lg text-gray-900">Within 48 hours</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <Card className="relative bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/50 group-hover:border-white/40">
                    <CardHeader className="p-8">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                          <MapPin className="w-6 h-6 text-white group-hover:animate-pulse" />
                        </div>
                        <span className="bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">Office Location</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                      <div className="space-y-2 text-lg text-gray-600">
                        <p>BeyondRounds Ltd.</p>
                        <p>123 Medical District</p>
                        <p>London, UK EC1A 1BB</p>
                      </div>
                      <div className="mt-6 p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
                        <p className="text-gray-600">
                          <strong className="text-gray-900">Note:</strong> We operate remotely but are available for scheduled meetings.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
                  <Card className="relative bg-white/40 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/50 group-hover:border-white/40">
                    <CardHeader className="p-8">
                      <CardTitle className="text-xl font-bold text-gray-900 bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">
                        Frequently Asked Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                      <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                        Before reaching out, you might find your answer in our comprehensive FAQ section.
                      </p>
                      <Link href="/faq">
                        <Button variant="outline" className="w-full h-12 bg-white/60 backdrop-blur-sm border-white/30 text-gray-700 hover:bg-white/80 hover:border-orange-300/50 transition-all duration-300 hover:scale-105 text-lg font-semibold rounded-xl">
                          View FAQ
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
          </div>
        </div>
      </section>

        {/* Enhanced Footer */}
        <Footer />
      </div>
    </div>
  )
}
