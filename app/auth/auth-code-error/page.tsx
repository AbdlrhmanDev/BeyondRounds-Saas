"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { AlertTriangle, ArrowLeft } from "lucide-react"
import ModernNav from "@/components/modern-nav"

export default function AuthCodeError() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-blue-600/20 to-cyan-500/20 animate-gradient-shift"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-purple-500/10 via-transparent to-blue-500/10 animate-pulse-slow"></div>
        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-violet-400/30 to-purple-600/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/30 to-cyan-500/30 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Glass morphism overlay */}
      <div className="min-h-screen bg-white/5 backdrop-blur-[1px] supports-backdrop-blur:bg-white/5 supports-no-backdrop-blur:bg-white/90">
        <ModernNav transparent />
        
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 pt-24">
          <div className="w-full max-w-md animate-slide-up">
            {/* Back to Home */}
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-violet-600 transition-colors mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>

            <div className="flex flex-col gap-6">
              <Card className="glass-card border-white/20 shadow-glass-lg">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/25">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-red-600">Authentication Error</CardTitle>
                  <CardDescription className="text-gray-600">
                    Sorry, there was an issue processing your login request.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-sm text-gray-600">
                    This could happen if:
                  </p>
                  <ul className="text-sm text-gray-600 text-left space-y-1 max-w-sm mx-auto">
                    <li>• The authorization code has expired</li>
                    <li>• There was a network issue during login</li>
                    <li>• The login request was invalid</li>
                  </ul>
                  
                  <div className="pt-4 space-y-3">
                    <Button asChild className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105">
                      <Link href="/auth/login">
                        Try Again
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="w-full glass-button">
                      <Link href="/contact">
                        Contact Support
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
