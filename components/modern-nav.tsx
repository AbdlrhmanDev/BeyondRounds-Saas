"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Menu, X, Command, Search, Bell } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"
import { Input } from "@/components/ui/input"

interface ModernNavProps {
  showSearch?: boolean
  transparent?: boolean
  className?: string
}

export default function ModernNav({ showSearch = false, transparent = false, className = "" }: ModernNavProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const supabase = createClient()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const navItems = [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" }
  ]

  const baseClasses = transparent 
    ? "fixed top-0 left-0 right-0 z-50 border-b border-white/10 backdrop-blur-2xl bg-white/5 supports-backdrop-blur:bg-white/5 supports-no-backdrop-blur:bg-white/90 transition-all duration-500 shadow-lg shadow-violet-500/10"
    : "sticky top-0 z-50 border-b border-white/20 backdrop-blur-2xl bg-white/80 supports-backdrop-blur:bg-white/60 supports-no-backdrop-blur:bg-white/95 shadow-2xl shadow-violet-500/10 transition-all duration-500"

  return (
    <header className={`${baseClasses} ${className}`}>
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Heart className="w-6 h-6 text-white group-hover:animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:via-teal-700 group-hover:to-cyan-700 transition-all duration-300">
              BeyondRounds
            </span>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <div key={item.href} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <Link 
                  href={item.href} 
                  className="relative text-gray-700 hover:text-emerald-600 font-semibold text-lg transition-all duration-300 px-4 py-3 rounded-xl hover:bg-white/30 hover:backdrop-blur-sm hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 group-hover:w-3/4 rounded-full"></span>
                </Link>
              </div>
            ))}
          </div>

          {/* Search Bar (optional) */}
          {showSearch && (
            <div className="hidden lg:flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 w-64 bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/80 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Right side - Auth aware */}
          <div className="flex items-center gap-3">
            {/* Enhanced Command Menu */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative hidden lg:flex items-center gap-2 text-gray-600 hover:text-emerald-600 hover:bg-white/30 hover:backdrop-blur-sm transition-all duration-300 rounded-lg px-3 py-2 hover:shadow-lg hover:shadow-violet-500/20 hover:scale-105"
              >
                <Command className="w-4 h-4" />
                <span className="text-sm font-medium">⌘K</span>
              </Button>
            </div>

            {/* Enhanced Notifications for logged-in users */}
            {user && (
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <Button variant="ghost" size="sm" className="relative hover:bg-white/50 hover:shadow-lg hover:shadow-red-500/20 hover:scale-105 transition-all duration-300 rounded-lg">
                  <Bell className="w-4 h-4" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-20 h-9 bg-gray-200/50 animate-pulse rounded-lg"></div>
                <div className="w-24 h-9 bg-gray-200/50 animate-pulse rounded-lg"></div>
              </div>
            ) : user ? (
              // Enhanced Authenticated state
              <div className="flex items-center gap-3">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/25 to-blue-500/25 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <Link href="/dashboard">
                    <Button className="relative bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-2xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3 font-semibold">
                      Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              // Enhanced Unauthenticated state
                <div className="hidden md:flex items-center gap-3">
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    <Link href="/auth/login">
                      <Button variant="ghost" className="relative text-gray-700 hover:text-emerald-600 hover:bg-white/30 hover:backdrop-blur-sm transition-all duration-300 font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-gray-500/20 hover:scale-105">
                        Log In
                      </Button>
                    </Link>
                  </div>
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    <Link href="/auth/sign-up">
                      <Button className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 group btn-shimmer rounded-xl px-6 py-3 font-semibold">
                        <span className="relative z-10">Join Now</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
                      </Button>
                    </Link>
                  </div>
                </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/20">
            <div className="flex flex-col gap-4 pt-4">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className="text-gray-700 hover:text-emerald-600 font-semibold text-lg transition-all duration-300 py-3 px-2 rounded-lg hover:bg-white/20"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Auth Buttons */}
              {!loading && !user && (
                  <div className="flex flex-col gap-3 pt-4 border-t border-white/20">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:text-emerald-600 hover:bg-white/30 font-semibold">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-emerald-500/25">
                      Join Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
