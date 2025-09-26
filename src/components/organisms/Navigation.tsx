'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Users,
  MessageSquare,
  Calendar
} from 'lucide-react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile, isLoading, isAuthenticated, isAdmin, signOut } = useAuthUser()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const navigation = isAuthenticated ? [
    { name: 'Dashboard', href: '/dashboard', icon: Calendar },
    { name: 'Matches', href: '/matches', icon: Users },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'User', href: '/profile', icon: User },
  ] : [
    { name: 'About', href: '/about', icon: undefined },
    { name: 'How It Works', href: '/how-matching-works', icon: undefined },
    { name: 'FAQ', href: '/faq', icon: undefined },
    { name: 'Contact', href: '/contact', icon: undefined },
  ]

  const adminNavigation = isAdmin ? [
    { name: 'Admin Panel', href: '/admin', icon: Shield },
    { name: 'Verification', href: '/admin/verification', icon: Shield },
    { name: 'Weekly Matching', href: '/admin/weekly-matching', icon: Users },
  ] : []

  const allNavigation = [...navigation, ...adminNavigation]

  const isActivePath = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                className="h-8 w-8"
                src="/placeholder-logo.svg"
                alt="BeyondRounds"
              />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                BeyondRounds
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {allNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  isActivePath(item.href)
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100'
                }`}
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.name}
              </Link>
            ))}

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={profile?.first_name || 'User'} />
                        <AvatarFallback>
                          {profile?.first_name?.[0]?.toUpperCase() || 'U'}
                          {profile?.last_name?.[0]?.toUpperCase() || ''}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {profile?.first_name} {profile?.last_name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {profile?.email}
                        </p>
                        {isAdmin && (
                          <p className="text-xs leading-none text-primary font-medium">
                            Administrator
                          </p>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>User</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" asChild>
                    <Link href="/auth/login">Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/auth/sign-up">Sign up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {allNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 text-base font-medium ${
                    isActivePath(item.href)
                      ? 'bg-primary/10 border-r-4 border-primary text-primary'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                    {item.name}
                  </div>
                </Link>
              ))}

              {!isLoading && (
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center px-4">
                        <div className="flex-shrink-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="" alt={profile?.first_name || 'User'} />
                            <AvatarFallback>
                              {profile?.first_name?.[0]?.toUpperCase() || 'U'}
                              {profile?.last_name?.[0]?.toUpperCase() || ''}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="ml-3">
                          <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                            {profile?.first_name} {profile?.last_name}
                          </div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {profile?.email}
                          </div>
                          {isAdmin && (
                            <div className="text-xs font-medium text-primary">
                              Administrator
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        <Link
                          href="/settings"
                          className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center">
                            <Settings className="mr-3 h-5 w-5" />
                            Settings
                          </div>
                        </Link>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false)
                            handleSignOut()
                          }}
                          className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="flex items-center">
                            <LogOut className="mr-3 h-5 w-5" />
                            Sign out
                          </div>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <Link
                        href="/auth/login"
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/auth/sign-up"
                        className="block px-4 py-2 text-base font-medium text-primary hover:bg-primary/10"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign up
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
