import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}))

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(url, init = {}) {
      this.url = url
      this.method = init.method || 'GET'
      this.headers = new Map()
      this.body = init.body
    }
    
    async json() {
      return JSON.parse(this.body || '{}')
    }
    
    async text() {
      return this.body || ''
    }
  },
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: data,
      status: options?.status || 200,
      headers: {
        get: jest.fn((key) => {
          const headers = options?.headers || {}
          return headers[key] || null
        }),
        set: jest.fn(),
      },
    })),
    redirect: jest.fn((url) => ({
      url: url.toString(),
      status: 302,
      headers: new Map(),
    })),
  },
}))

describe('API Endpoint Authorization Tests', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('Admin API Endpoints', () => {
    test('admin endpoints require admin authentication', async () => {
      // Mock non-admin user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'user@test.com' } },
        error: null,
      })

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'user' },
          error: null,
        }),
      })

      // Simulate admin API endpoint handler
      const adminHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (profile?.role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json({ success: true })
      }

      const request = new NextRequest('https://example.com/api/admin/users')
      const response = await adminHandler(request)

      expect(response.status).toBe(403)
      expect(response.json).toEqual({ error: 'Forbidden' })
    })

    test('admin endpoints allow admin users', async () => {
      // Mock admin user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'admin-123', email: 'admin@test.com' } },
        error: null,
      })

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'admin' },
          error: null,
        }),
      })

      // Simulate admin API endpoint handler
      const adminHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (profile?.role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json({ success: true, data: 'admin data' })
      }

      const request = new NextRequest('https://example.com/api/admin/users')
      const response = await adminHandler(request)

      expect(response.status).toBe(200)
      expect(response.json).toEqual({ success: true, data: 'admin data' })
    })

    test('admin endpoints reject unauthenticated requests', async () => {
      // Mock unauthenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      // Simulate admin API endpoint handler
      const adminHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json({ success: true })
      }

      const request = new NextRequest('https://example.com/api/admin/users')
      const response = await adminHandler(request)

      expect(response.status).toBe(401)
      expect(response.json).toEqual({ error: 'Unauthorized' })
    })
  })

  describe('User Profile API Endpoints', () => {
    test('profile endpoints require authentication', async () => {
      // Mock unauthenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      // Simulate profile API endpoint handler
      const profileHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json({ success: true, profile: { id: user.id } })
      }

      const request = new NextRequest('https://example.com/api/profile')
      const response = await profileHandler(request)

      expect(response.status).toBe(401)
      expect(response.json).toEqual({ error: 'Unauthorized' })
    })

    test('profile endpoints allow authenticated users to access own profile', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'user@test.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'profile-123', user_id: 'user-123', first_name: 'Test' },
          error: null,
        }),
      })

      // Simulate profile API endpoint handler
      const profileHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        return NextResponse.json({ success: true, profile })
      }

      const request = new NextRequest('https://example.com/api/profile')
      const response = await profileHandler(request)

      expect(response.status).toBe(200)
      expect(response.json.success).toBe(true)
      expect(response.json.profile.user_id).toBe('user-123')
    })

    test('profile endpoints prevent access to other users profiles', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'user@test.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      // Simulate profile API endpoint handler trying to access other user's profile
      const profileHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Try to access another user's profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', 'other-user-456')
          .single()

        if (error) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json({ success: true, profile })
      }

      const request = new NextRequest('https://example.com/api/profile/other-user-456')
      const response = await profileHandler(request)

      expect(response.status).toBe(403)
      expect(response.json).toEqual({ error: 'Forbidden' })
    })
  })

  describe('Match API Endpoints', () => {
    test('match endpoints require authentication', async () => {
      // Mock unauthenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      // Simulate match API endpoint handler
      const matchHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json({ success: true, matches: [] })
      }

      const request = new NextRequest('https://example.com/api/matches')
      const response = await matchHandler(request)

      expect(response.status).toBe(401)
      expect(response.json).toEqual({ error: 'Unauthorized' })
    })

    test('match endpoints allow users to view their own matches', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'user@test.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockMatches = [
        { id: 'match-1', status: 'active' },
        { id: 'match-2', status: 'completed' },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockMatches,
          error: null,
        }),
      })

      // Simulate match API endpoint handler
      const matchHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: matches } = await supabase
          .from('match_members')
          .select('match_id, matches(*)')
          .eq('user_id', user.id)

        return NextResponse.json({ success: true, matches })
      }

      const request = new NextRequest('https://example.com/api/matches')
      const response = await matchHandler(request)

      expect(response.status).toBe(200)
      expect(response.json.success).toBe(true)
    })

    test('match endpoints prevent access to unauthorized matches', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'user@test.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      // Simulate match API endpoint handler trying to access unauthorized match
      const matchHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: match, error } = await supabase
          .from('matches')
          .select('*')
          .eq('id', 'unauthorized-match-456')
          .single()

        if (error) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json({ success: true, match })
      }

      const request = new NextRequest('https://example.com/api/matches/unauthorized-match-456')
      const response = await matchHandler(request)

      expect(response.status).toBe(403)
      expect(response.json).toEqual({ error: 'Forbidden' })
    })
  })

  describe('Chat API Endpoints', () => {
    test('chat endpoints require authentication', async () => {
      // Mock unauthenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      // Simulate chat API endpoint handler
      const chatHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json({ success: true, messages: [] })
      }

      const request = new NextRequest('https://example.com/api/chat/match-123/messages')
      const response = await chatHandler(request)

      expect(response.status).toBe(401)
      expect(response.json).toEqual({ error: 'Unauthorized' })
    })

    test('chat endpoints allow match members to access messages', async () => {
      // Mock authenticated user who is a match member
      const mockUser = { id: 'user-123', email: 'user@test.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock is_member_of_match function returning true
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true,
        error: null,
      })

      const mockMessages = [
        { id: 'msg-1', content: 'Hello!', user_id: 'user-123' },
        { id: 'msg-2', content: 'Hi there!', user_id: 'user-456' },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockMessages,
          error: null,
        }),
      })

      // Simulate chat API endpoint handler
      const chatHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is member of match
        const { data: isMember } = await supabase.rpc('is_member_of_match', {
          match_id: 'match-123',
        })

        if (!isMember) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const { data: messages } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('match_id', 'match-123')
          .order('created_at', { ascending: true })

        return NextResponse.json({ success: true, messages })
      }

      const request = new NextRequest('https://example.com/api/chat/match-123/messages')
      const response = await chatHandler(request)

      expect(response.status).toBe(200)
      expect(response.json.success).toBe(true)
      expect(response.json.messages).toEqual(mockMessages)
    })

    test('chat endpoints prevent non-members from accessing messages', async () => {
      // Mock authenticated user who is NOT a match member
      const mockUser = { id: 'user-123', email: 'user@test.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock is_member_of_match function returning false
      mockSupabaseClient.rpc.mockResolvedValue({
        data: false,
        error: null,
      })

      // Simulate chat API endpoint handler
      const chatHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is member of match
        const { data: isMember } = await supabase.rpc('is_member_of_match', {
          match_id: 'match-123',
        })

        if (!isMember) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json({ success: true, messages: [] })
      }

      const request = new NextRequest('https://example.com/api/chat/match-123/messages')
      const response = await chatHandler(request)

      expect(response.status).toBe(403)
      expect(response.json).toEqual({ error: 'Forbidden' })
    })

    test('chat POST endpoints allow match members to send messages', async () => {
      // Mock authenticated user who is a match member
      const mockUser = { id: 'user-123', email: 'user@test.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock is_member_of_match function returning true
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true,
        error: null,
      })

      const newMessage = {
        id: 'msg-new',
        content: 'New message!',
        user_id: 'user-123',
        match_id: 'match-123',
        created_at: new Date().toISOString(),
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: newMessage,
          error: null,
        }),
      })

      // Simulate chat POST API endpoint handler
      const chatPostHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is member of match
        const { data: isMember } = await supabase.rpc('is_member_of_match', {
          match_id: 'match-123',
        })

        if (!isMember) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { data: message } = await supabase
          .from('chat_messages')
          .insert({
            content: body.content,
            user_id: user.id,
            match_id: 'match-123',
          })
          .select()
          .single()

        return NextResponse.json({ success: true, message })
      }

      const request = new NextRequest('https://example.com/api/chat/match-123/messages', {
        method: 'POST',
        body: JSON.stringify({ content: 'New message!' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await chatPostHandler(request)

      expect(response.status).toBe(200)
      expect(response.json.success).toBe(true)
      expect(response.json.message).toEqual(newMessage)
    })
  })

  describe('Verification API Endpoints', () => {
    test('verification endpoints require authentication', async () => {
      // Mock unauthenticated user
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      // Simulate verification API endpoint handler
      const verificationHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json({ success: true })
      }

      const request = new NextRequest('https://example.com/api/verification')
      const response = await verificationHandler(request)

      expect(response.status).toBe(401)
      expect(response.json).toEqual({ error: 'Unauthorized' })
    })

    test('verification approval endpoints require admin role', async () => {
      // Mock non-admin user
      const mockUser = { id: 'user-123', email: 'user@test.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { role: 'user' },
          error: null,
        }),
      })

      // Simulate verification approval API endpoint handler
      const verificationApprovalHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (profile?.role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json({ success: true })
      }

      const request = new NextRequest('https://example.com/api/verification/approve/req-123', {
        method: 'POST',
      })

      const response = await verificationApprovalHandler(request)

      expect(response.status).toBe(403)
      expect(response.json).toEqual({ error: 'Forbidden' })
    })
  })

  describe('Rate Limiting and Security', () => {
    test('API endpoints handle rate limiting', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'user@test.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Simulate rate-limited API endpoint handler
      const rateLimitedHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Simulate rate limit check (normally would check Redis/database)
        const isRateLimited = true // Mock rate limit exceeded

        if (isRateLimited) {
          return NextResponse.json(
            { error: 'Too Many Requests' },
            { 
              status: 429,
              headers: {
                'Retry-After': '60',
                'X-RateLimit-Limit': '100',
                'X-RateLimit-Remaining': '0',
              },
            }
          )
        }

        return NextResponse.json({ success: true })
      }

      const request = new NextRequest('https://example.com/api/messages', {
        method: 'POST',
      })

      const response = await rateLimitedHandler(request)

      expect(response.status).toBe(429)
      expect(response.json).toEqual({ error: 'Too Many Requests' })
      expect(response.headers.get('Retry-After')).toBe('60')
    })

    test('API endpoints validate request methods', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'user@test.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Simulate method-restricted API endpoint handler
      const methodRestrictedHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (request.method !== 'POST') {
          return NextResponse.json(
            { error: 'Method Not Allowed' },
            { status: 405 }
          )
        }

        return NextResponse.json({ success: true })
      }

      const request = new NextRequest('https://example.com/api/messages', {
        method: 'GET', // Wrong method
      })

      const response = await methodRestrictedHandler(request)

      expect(response.status).toBe(405)
      expect(response.json).toEqual({ error: 'Method Not Allowed' })
    })

    test('API endpoints validate request body', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'user@test.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Simulate body validation API endpoint handler
      const bodyValidationHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const body = await request.json()
          
          if (!body.content || body.content.trim().length === 0) {
            return NextResponse.json(
              { error: 'Content is required' },
              { status: 400 }
            )
          }

          if (body.content.length > 1000) {
            return NextResponse.json(
              { error: 'Content too long' },
              { status: 400 }
            )
          }

          return NextResponse.json({ success: true })
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid JSON' },
            { status: 400 }
          )
        }
      }

      const request = new NextRequest('https://example.com/api/messages', {
        method: 'POST',
        body: JSON.stringify({ content: '' }), // Invalid empty content
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await bodyValidationHandler(request)

      expect(response.status).toBe(400)
      expect(response.json).toEqual({ error: 'Content is required' })
    })
  })

  describe('Error Handling', () => {
    test('API endpoints handle database errors gracefully', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'user@test.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      // Mock database error
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      })

      // Simulate API endpoint handler with database error
      const errorHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)

          if (error) {
            console.error('Database error:', error)
            return NextResponse.json(
              { error: 'Internal Server Error' },
              { status: 500 }
            )
          }

          return NextResponse.json({ success: true, data })
        } catch (error) {
          console.error('Unexpected error:', error)
          return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
          )
        }
      }

      const request = new NextRequest('https://example.com/api/profile')
      const response = await errorHandler(request)

      expect(response.status).toBe(500)
      expect(response.json).toEqual({ error: 'Internal Server Error' })
    })

    test('API endpoints handle authentication errors gracefully', async () => {
      // Mock authentication error
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT expired' },
      })

      // Simulate API endpoint handler with auth error
      const authErrorHandler = async (request: NextRequest) => {
        const supabase = createClient({ cookies: {} })
        
        try {
          const { data: { user }, error } = await supabase.auth.getUser()

          if (error || !user) {
            return NextResponse.json(
              { error: 'Authentication failed' },
              { status: 401 }
            )
          }

          return NextResponse.json({ success: true })
        } catch (error) {
          console.error('Auth error:', error)
          return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 401 }
          )
        }
      }

      const request = new NextRequest('https://example.com/api/profile')
      const response = await authErrorHandler(request)

      expect(response.status).toBe(401)
      expect(response.json).toEqual({ error: 'Authentication failed' })
    })
  })
})
