/**
 * @jest-environment jsdom
 */
/* eslint-env jest */
import { NextRequest } from 'next/server'
import { middleware } from '../../middleware'
import { createServerClient } from '@supabase/ssr'

// Mock Supabase SSR
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}))

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    url: string
    method: string
    headers: Map<string, string>
    body: string | null
    cookies: {
      getAll: jest.Mock
      set: jest.Mock
    }

    constructor(url: string, init: any = {}) {
      this.url = url
      this.method = init.method || 'GET'
      this.headers = new Map()
      this.body = init.body || null
      this.cookies = {
        getAll: jest.fn(() => []),
        set: jest.fn(),
      }
    }
    
    async json() {
      return JSON.parse(this.body || '{}')
    }
    
    async text() {
      return this.body || ''
    }
  },
  NextResponse: {
    next: jest.fn((options) => ({
      ...options,
      cookies: {
        set: jest.fn(),
        getAll: jest.fn(() => []),
      },
    })),
    redirect: jest.fn((url) => ({
      url: url.toString(),
      status: 302,
      headers: new Map(),
    })),
  },
}))

describe('Middleware Authentication Tests', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('Public Routes Access', () => {
    const publicRoutes = [
      '/',
      '/auth/login',
      '/auth/sign-up',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/about',
      '/contact',
      '/privacy',
      '/faq',
      '/how-matching-works',
    ]

    test.each(publicRoutes)('allows unauthenticated access to %s', async (route) => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = new NextRequest(`https://example.com${route}`)
      const response = await middleware(request)

      expect(response).toBeDefined()
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled()
    })

    test.each(publicRoutes)('allows authenticated access to %s', async (route) => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = new NextRequest(`https://example.com${route}`)
      const response = await middleware(request)

      expect(response).toBeDefined()
    })
  })

  describe('Protected Routes Access', () => {
    const protectedRoutes = [
      '/dashboard',
      '/profile',
      '/matches',
      '/settings',
      '/messages',
      '/groups',
      '/onboarding',
    ]

    test.each(protectedRoutes)('redirects unauthenticated users from %s to login', async (route) => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = new NextRequest(`https://example.com${route}`)
      const response = await middleware(request)

      expect(response.url).toContain('/auth/login')
      expect(response.url).toContain(`redirectTo=${encodeURIComponent(route)}`)
    })

    test.each(protectedRoutes)('allows authenticated users to access %s', async (route) => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = new NextRequest(`https://example.com${route}`)
      const response = await middleware(request)

      expect(response).toBeDefined()
      expect(response.url).not.toContain('/auth/login')
    })
  })

  describe('Admin Routes Access', () => {
    test('redirects unauthenticated users from admin routes to login', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = new NextRequest('https://example.com/admin')
      const response = await middleware(request)

      expect(response.url).toContain('/auth/login')
      expect(response.url).toContain('redirectTo=%2Fadmin')
    })

    test('allows authenticated users to access admin routes', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = new NextRequest('https://example.com/admin')
      const response = await middleware(request)

      expect(response).toBeDefined()
      expect(response.url).not.toContain('/auth/login')
    })
  })

  describe('Auth Pages Redirect Logic', () => {
    test('redirects authenticated users from login page to dashboard', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = new NextRequest('https://example.com/auth/login')
      const response = await middleware(request)

      expect(response.url).toContain('/dashboard')
    })

    test('redirects authenticated users from sign-up page to dashboard', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = new NextRequest('https://example.com/auth/sign-up')
      const response = await middleware(request)

      expect(response.url).toContain('/dashboard')
    })

    test('redirects authenticated users from forgot-password page to dashboard', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = new NextRequest('https://example.com/auth/forgot-password')
      const response = await middleware(request)

      expect(response.url).toContain('/dashboard')
    })
  })

  describe('Error Handling', () => {
    test('handles Supabase auth errors gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth service unavailable' },
      })

      const request = new NextRequest('https://example.com/dashboard')
      const response = await middleware(request)

      expect(response.url).toContain('/auth/login')
    })

    test('handles network errors gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(
        new Error('Network error')
      )

      const request = new NextRequest('https://example.com/dashboard')
      
      // Should not throw, but handle gracefully
      await expect(middleware(request)).resolves.toBeDefined()
    })
  })

  describe('Cookie Management', () => {
    test('handles cookie operations correctly', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const request = new NextRequest('https://example.com/dashboard', {
        headers: {
          cookie: 'supabase-auth-token=test-token',
        },
      })

      const response = await middleware(request)

      expect(response).toBeDefined()
      expect(createServerClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      )
    })
  })

  describe('URL Parameters', () => {
    test('preserves redirectTo parameter in login redirect', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = new NextRequest('https://example.com/matches')
      const response = await middleware(request)

      expect(response.url).toContain('redirectTo=%2Fmatches')
    })

    test('handles complex redirectTo URLs', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const complexPath = '/matches/123?tab=active'
      const request = new NextRequest(`https://example.com${complexPath}`)
      const response = await middleware(request)

      expect(response.url).toContain(`redirectTo=${encodeURIComponent(complexPath)}`)
    })
  })

  describe('Edge Cases', () => {
    test('handles root path correctly', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = new NextRequest('https://example.com/')
      const response = await middleware(request)

      expect(response).toBeDefined()
    })

    test('handles nested public routes', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = new NextRequest('https://example.com/auth/login/help')
      const response = await middleware(request)

      expect(response).toBeDefined()
    })

    test('handles nested protected routes', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = new NextRequest('https://example.com/dashboard/settings')
      const response = await middleware(request)

      expect(response.url).toContain('/auth/login')
      expect(response.url).toContain('redirectTo=%2Fdashboard%2Fsettings')
    })

    test('handles nested admin routes', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      const request = new NextRequest('https://example.com/admin/users')
      const response = await middleware(request)

      expect(response.url).toContain('/auth/login')
      expect(response.url).toContain('redirectTo=%2Fadmin%2Fusers')
    })
  })
})
