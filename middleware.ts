import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured. Skipping authentication middleware.')
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl
  const path = url.pathname

  // Public routes that don't require authentication
  const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/sign-up', '/auth/forgot-password', '/auth/reset-password', '/about', '/contact', '/privacy', '/faq', '/how-matching-works']
  const isPublic = PUBLIC_ROUTES.some(route => path === route || path.startsWith(`${route}/`))

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/matches', '/settings', '/messages', '/groups', '/onboarding', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  // Admin routes
  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route))

  // Redirect to login if accessing protected route without authentication
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirectTo', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If user has session and tries to access auth pages, redirect to dashboard
  if (user && (path === '/auth/login' || path === '/auth/sign-up')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Check admin role for admin routes
  if (user && isAdminRoute) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      // If there's an RLS error, redirect to dashboard
      console.log('Middleware: RLS error, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    // Temporarily disable middleware to test homepage
    // '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
