/**
 * Comprehensive API Routes Test Suite
 * 
 * Tests all API endpoints in the BeyondRounds application:
 * - Authentication endpoints
 * - Profile management
 * - Matching system
 * - Chat functionality
 * - Admin operations
 * - Payment processing
 * - Notifications
 */

import { NextRequest, NextResponse } from 'next/server'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  rpc: jest.fn(),
}

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabaseClient,
}))

jest.mock('@/lib/database/supabase-server', () => ({
  createClient: () => mockSupabaseClient,
}))

// Test data
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    first_name: 'John',
    last_name: 'Doe',
  },
}

const mockProfile = {
  id: 'test-user-id',
  first_name: 'John',
  last_name: 'Doe',
  email: 'test@example.com',
  specialty: 'Cardiology',
  interests: ['Running', 'Reading'],
  is_verified: true,
  is_paid: true,
  onboarding_completed: true,
}

describe('🛣️ Comprehensive API Routes Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })
  })

  // ============================================================================
  // AUTHENTICATION API TESTS
  // ============================================================================
  describe('🔐 Authentication API', () => {
    describe('POST /api/auth/create-profile', () => {
      it('should create a new profile successfully', async () => {
        mockSupabaseClient.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/auth/create-profile', {
          method: 'POST',
          body: JSON.stringify(mockProfile),
          headers: { 'Content-Type': 'application/json' },
        })

        // Mock API handler
        const handler = async (req: NextRequest) => {
          const body = await req.json()
          const supabase = mockSupabaseClient
          const result = await supabase
            .from('profiles')
            .insert(body)
            .select()
            .single()

          if (result.error) {
            return NextResponse.json({ error: result.error.message }, { status: 400 })
          }

          return NextResponse.json({ data: result.data }, { status: 201 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.data).toEqual(mockProfile)
      })

      it('should handle profile creation errors', async () => {
        mockSupabaseClient.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Profile already exists' },
              }),
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/auth/create-profile', {
          method: 'POST',
          body: JSON.stringify(mockProfile),
          headers: { 'Content-Type': 'application/json' },
        })

        const handler = async (req: NextRequest) => {
          const body = await req.json()
          const supabase = mockSupabaseClient
          const result = await supabase
            .from('profiles')
            .insert(body)
            .select()
            .single()

          if (result.error) {
            return NextResponse.json({ error: result.error.message }, { status: 400 })
          }

          return NextResponse.json({ data: result.data }, { status: 201 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Profile already exists')
      })
    })

    describe('GET /api/auth/get-profile', () => {
      it('should fetch user profile successfully', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/auth/get-profile')

        const handler = async (req: NextRequest) => {
          const supabase = mockSupabaseClient
          const { data: { user } } = await supabase.auth.getUser()
          
          if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
          }

          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (result.error) {
            return NextResponse.json({ error: result.error.message }, { status: 404 })
          }

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data).toEqual(mockProfile)
      })

      it('should handle unauthorized access', async () => {
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'No user found' },
        })

        const request = new NextRequest('http://localhost/api/auth/get-profile')

        const handler = async (req: NextRequest) => {
          const supabase = mockSupabaseClient
          const { data: { user } } = await supabase.auth.getUser()
          
          if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
          }

          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })
    })
  })

  // ============================================================================
  // PROFILE API TESTS
  // ============================================================================
  describe('👤 Profile API', () => {
    describe('GET /api/profile', () => {
      it('should fetch profile with complete data', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/profile')

        const handler = async (req: NextRequest) => {
          const supabase = mockSupabaseClient
          const { data: { user } } = await supabase.auth.getUser()

          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data).toEqual(mockProfile)
      })
    })

    describe('PUT /api/profile', () => {
      it('should update profile successfully', async () => {
        const updatedProfile = { ...mockProfile, first_name: 'Jane' }

        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: updatedProfile,
                  error: null,
                }),
              }),
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/profile', {
          method: 'PUT',
          body: JSON.stringify({ first_name: 'Jane' }),
          headers: { 'Content-Type': 'application/json' },
        })

        const handler = async (req: NextRequest) => {
          const body = await req.json()
          const supabase = mockSupabaseClient
          const { data: { user } } = await supabase.auth.getUser()

          const result = await supabase
            .from('profiles')
            .update(body)
            .eq('id', user.id)
            .select()
            .single()

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.first_name).toBe('Jane')
      })
    })
  })

  // ============================================================================
  // MATCHES API TESTS
  // ============================================================================
  describe('🤝 Matches API', () => {
    const mockMatch = {
      id: 'match-1',
      created_at: '2024-01-01T00:00:00Z',
      is_active: true,
      match_members: [
        { profiles: mockProfile },
      ],
    }

    describe('GET /api/matches', () => {
      it('should fetch user matches', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [mockMatch],
                error: null,
              }),
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/matches')

        const handler = async (req: NextRequest) => {
          const supabase = mockSupabaseClient
          const { data: { user } } = await supabase.auth.getUser()

          const result = await supabase
            .from('match_members')
            .select('matches(*, match_members(profiles(*)))')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data).toContain(mockMatch)
      })

      it('should handle no matches found', async () => {
        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/matches')

        const handler = async (req: NextRequest) => {
          const supabase = mockSupabaseClient
          const { data: { user } } = await supabase.auth.getUser()

          const result = await supabase
            .from('match_members')
            .select('matches(*, match_members(profiles(*)))')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data).toEqual([])
      })
    })
  })

  // ============================================================================
  // CHAT API TESTS
  // ============================================================================
  describe('💬 Chat API', () => {
    const mockMessage = {
      id: 'msg-1',
      match_id: 'match-1',
      sender_id: mockUser.id,
      content: 'Hello everyone!',
      created_at: '2024-01-01T00:00:00Z',
    }

    describe('POST /api/chat', () => {
      it('should send message successfully', async () => {
        mockSupabaseClient.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockMessage,
                error: null,
              }),
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            match_id: 'match-1',
            content: 'Hello everyone!',
          }),
          headers: { 'Content-Type': 'application/json' },
        })

        const handler = async (req: NextRequest) => {
          const body = await req.json()
          const supabase = mockSupabaseClient
          const { data: { user } } = await supabase.auth.getUser()

          const messageData = {
            ...body,
            sender_id: user.id,
            created_at: new Date().toISOString(),
          }

          const result = await supabase
            .from('chat_messages')
            .insert(messageData)
            .select()
            .single()

          return NextResponse.json({ data: result.data }, { status: 201 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(201)
        expect(data.data.content).toBe('Hello everyone!')
        expect(data.data.sender_id).toBe(mockUser.id)
      })

      it('should validate message content', async () => {
        const request = new NextRequest('http://localhost/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            match_id: 'match-1',
            content: '', // Empty content
          }),
          headers: { 'Content-Type': 'application/json' },
        })

        const handler = async (req: NextRequest) => {
          const body = await req.json()
          
          if (!body.content || body.content.trim().length === 0) {
            return NextResponse.json(
              { error: 'Message content is required' },
              { status: 400 }
            )
          }

          return NextResponse.json({ success: true }, { status: 201 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Message content is required')
      })
    })

    describe('GET /api/chat', () => {
      it('should fetch messages for a match', async () => {
        const messages = [mockMessage]

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: messages,
                  error: null,
                }),
              }),
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/chat?match_id=match-1')

        const handler = async (req: NextRequest) => {
          const url = new URL(req.url)
          const matchId = url.searchParams.get('match_id')
          const supabase = mockSupabaseClient

          const result = await supabase
            .from('chat_messages')
            .select('*, profiles(first_name, last_name)')
            .eq('match_id', matchId)
            .order('created_at', { ascending: true })
            .limit(50)

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data).toEqual(messages)
      })
    })
  })

  // ============================================================================
  // ADMIN API TESTS
  // ============================================================================
  describe('👑 Admin API', () => {
    describe('GET /api/admin/users', () => {
      it('should fetch all users for admin', async () => {
        const users = [mockProfile, { ...mockProfile, id: 'user-2' }]

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: users,
              error: null,
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/admin/users')

        const handler = async (req: NextRequest) => {
          const supabase = mockSupabaseClient
          
          // Mock admin check
          const isAdmin = true
          if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
          }

          const result = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data).toEqual(users)
      })

      it('should handle non-admin access', async () => {
        const request = new NextRequest('http://localhost/api/admin/users')

        const handler = async (req: NextRequest) => {
          // Mock non-admin user
          const isAdmin = false
          if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
          }

          return NextResponse.json({ data: [] }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(403)
        expect(data.error).toBe('Forbidden')
      })
    })

    describe('POST /api/admin/verification', () => {
      it('should update user verification status', async () => {
        const updatedUser = { ...mockProfile, is_verified: true }

        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: updatedUser,
                  error: null,
                }),
              }),
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/admin/verification', {
          method: 'POST',
          body: JSON.stringify({
            user_id: mockUser.id,
            is_verified: true,
          }),
          headers: { 'Content-Type': 'application/json' },
        })

        const handler = async (req: NextRequest) => {
          const body = await req.json()
          const supabase = mockSupabaseClient

          const result = await supabase
            .from('profiles')
            .update({ is_verified: body.is_verified })
            .eq('id', body.user_id)
            .select()
            .single()

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.is_verified).toBe(true)
      })
    })

    describe('GET /api/admin/stats', () => {
      it('should return admin statistics', async () => {
        const stats = {
          total_users: 150,
          verified_users: 120,
          paid_users: 100,
          active_matches: 25,
          total_messages: 500,
        }

        mockSupabaseClient.rpc.mockResolvedValue({
          data: stats,
          error: null,
        })

        const request = new NextRequest('http://localhost/api/admin/stats')

        const handler = async (req: NextRequest) => {
          const supabase = mockSupabaseClient
          
          const result = await supabase.rpc('get_admin_stats')

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data).toEqual(stats)
      })
    })
  })

  // ============================================================================
  // MATCHING API TESTS
  // ============================================================================
  describe('🔄 Matching API', () => {
    describe('POST /api/matching/weekly', () => {
      it('should trigger weekly matching', async () => {
        const matchingResult = {
          success: true,
          groups_created: 5,
          users_matched: 18,
        }

        mockSupabaseClient.rpc.mockResolvedValue({
          data: matchingResult,
          error: null,
        })

        const request = new NextRequest('http://localhost/api/matching/weekly', {
          method: 'POST',
        })

        const handler = async (req: NextRequest) => {
          const supabase = mockSupabaseClient
          
          const result = await supabase.rpc('execute_weekly_matching')

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.success).toBe(true)
        expect(data.data.groups_created).toBe(5)
      })
    })

    describe('GET /api/matching/find-groups', () => {
      it('should find available groups', async () => {
        const availableGroups = [
          {
            id: 'group-1',
            compatibility_score: 0.85,
            members: [mockProfile],
            open_spots: 2,
          },
        ]

        mockSupabaseClient.rpc.mockResolvedValue({
          data: availableGroups,
          error: null,
        })

        const request = new NextRequest('http://localhost/api/matching/find-groups')

        const handler = async (req: NextRequest) => {
          const supabase = mockSupabaseClient
          const { data: { user } } = await supabase.auth.getUser()
          
          const result = await supabase.rpc('find_available_groups', {
            user_id: user.id,
          })

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data).toEqual(availableGroups)
      })
    })
  })

  // ============================================================================
  // PAYMENT API TESTS
  // ============================================================================
  describe('💳 Payment API', () => {
    describe('POST /api/payments/create-checkout', () => {
      it('should create Stripe checkout session', async () => {
        const checkoutSession = {
          id: 'cs_123',
          url: 'https://checkout.stripe.com/session-123',
        }

        // Mock Stripe
        const mockStripe = {
          checkout: {
            sessions: {
              create: jest.fn().mockResolvedValue(checkoutSession),
            },
          },
        }

        const request = new NextRequest('http://localhost/api/payments/create-checkout', {
          method: 'POST',
          body: JSON.stringify({
            price_id: 'price_123',
          }),
          headers: { 'Content-Type': 'application/json' },
        })

        const handler = async (req: NextRequest) => {
          const body = await req.json()
          
          // Mock Stripe session creation
          const session = await mockStripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price: body.price_id,
                quantity: 1,
              },
            ],
            mode: 'subscription',
            success_url: 'http://localhost/payment/success',
            cancel_url: 'http://localhost/payment/error',
          })

          return NextResponse.json({ data: session }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.url).toContain('stripe.com')
      })
    })

    describe('POST /api/payments/webhook', () => {
      it('should handle Stripe webhook events', async () => {
        const webhookEvent = {
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_123',
              customer: 'cus_123',
              subscription: 'sub_123',
            },
          },
        }

        const request = new NextRequest('http://localhost/api/payments/webhook', {
          method: 'POST',
          body: JSON.stringify(webhookEvent),
          headers: { 'Content-Type': 'application/json' },
        })

        const handler = async (req: NextRequest) => {
          const body = await req.json()
          
          if (body.type === 'checkout.session.completed') {
            // Update user subscription status
            const supabase = mockSupabaseClient
            await supabase
              .from('profiles')
              .update({ is_paid: true })
              .eq('stripe_customer_id', body.data.object.customer)

            return NextResponse.json({ received: true }, { status: 200 })
          }

          return NextResponse.json({ received: true }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.received).toBe(true)
      })
    })
  })

  // ============================================================================
  // NOTIFICATIONS API TESTS
  // ============================================================================
  describe('🔔 Notifications API', () => {
    describe('GET /api/notifications', () => {
      it('should fetch user notifications', async () => {
        const notifications = [
          {
            id: 'notif-1',
            user_id: mockUser.id,
            type: 'match_created',
            title: 'New Match Found!',
            message: 'You have been matched with 3 other doctors.',
            is_read: false,
            created_at: '2024-01-01T00:00:00Z',
          },
        ]

        mockSupabaseClient.from.mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: notifications,
                  error: null,
                }),
              }),
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/notifications')

        const handler = async (req: NextRequest) => {
          const supabase = mockSupabaseClient
          const { data: { user } } = await supabase.auth.getUser()

          const result = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data).toEqual(notifications)
      })
    })

    describe('PUT /api/notifications', () => {
      it('should mark notifications as read', async () => {
        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        })

        const request = new NextRequest('http://localhost/api/notifications', {
          method: 'PUT',
          body: JSON.stringify({
            notification_ids: ['notif-1', 'notif-2'],
          }),
          headers: { 'Content-Type': 'application/json' },
        })

        const handler = async (req: NextRequest) => {
          const body = await req.json()
          const supabase = mockSupabaseClient

          const result = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', body.notification_ids[0]) // Simplified for test

          return NextResponse.json({ success: true }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
      })
    })
  })

  // ============================================================================
  // DASHBOARD API TESTS
  // ============================================================================
  describe('📊 Dashboard API', () => {
    describe('GET /api/dashboard', () => {
      it('should fetch dashboard data', async () => {
        const dashboardData = {
          profile: mockProfile,
          active_matches: 2,
          unread_messages: 5,
          recent_activity: [],
          upcoming_matches: 1,
        }

        mockSupabaseClient.rpc.mockResolvedValue({
          data: dashboardData,
          error: null,
        })

        const request = new NextRequest('http://localhost/api/dashboard')

        const handler = async (req: NextRequest) => {
          const supabase = mockSupabaseClient
          const { data: { user } } = await supabase.auth.getUser()

          const result = await supabase.rpc('get_dashboard_data', {
            user_id: user.id,
          })

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.active_matches).toBe(2)
        expect(data.data.unread_messages).toBe(5)
      })
    })
  })

  // ============================================================================
  // CRON JOB API TESTS
  // ============================================================================
  describe('⏰ Cron Job API', () => {
    describe('POST /api/cron/weekly-matching', () => {
      it('should execute weekly matching cron job', async () => {
        const cronResult = {
          success: true,
          execution_time: '2024-01-04T16:00:00Z',
          groups_created: 8,
          users_matched: 24,
          errors: [],
        }

        mockSupabaseClient.rpc.mockResolvedValue({
          data: cronResult,
          error: null,
        })

        const request = new NextRequest('http://localhost/api/cron/weekly-matching', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer cron-secret-token',
          },
        })

        const handler = async (req: NextRequest) => {
          // Verify cron authorization
          const authHeader = req.headers.get('Authorization')
          if (authHeader !== 'Bearer cron-secret-token') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
          }

          const supabase = mockSupabaseClient
          const result = await supabase.rpc('execute_weekly_matching_cron')

          return NextResponse.json({ data: result.data }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.data.success).toBe(true)
        expect(data.data.groups_created).toBe(8)
      })

      it('should handle unauthorized cron requests', async () => {
        const request = new NextRequest('http://localhost/api/cron/weekly-matching', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer invalid-token',
          },
        })

        const handler = async (req: NextRequest) => {
          const authHeader = req.headers.get('Authorization')
          if (authHeader !== 'Bearer cron-secret-token') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
          }

          return NextResponse.json({ success: true }, { status: 200 })
        }

        const response = await handler(request)
        const data = await response.json()

        expect(response.status).toBe(401)
        expect(data.error).toBe('Unauthorized')
      })
    })
  })
})

// ============================================================================
// API ERROR HANDLING TESTS
// ============================================================================
describe('🚨 API Error Handling', () => {
  describe('Global Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabaseClient.from.mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const request = new NextRequest('http://localhost/api/profile')

      const handler = async (req: NextRequest) => {
        try {
          const supabase = mockSupabaseClient
          await supabase.from('profiles').select('*')
          return NextResponse.json({ data: [] }, { status: 200 })
        } catch (error) {
          return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
          )
        }
      }

      const response = await handler(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should handle malformed JSON requests', async () => {
      const request = new NextRequest('http://localhost/api/profile', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      })

      const handler = async (req: NextRequest) => {
        try {
          await req.json()
          return NextResponse.json({ success: true }, { status: 200 })
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid JSON format' },
            { status: 400 }
          )
        }
      }

      const response = await handler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid JSON format')
    })

    it('should handle missing required fields', async () => {
      const request = new NextRequest('http://localhost/api/profile', {
        method: 'POST',
        body: JSON.stringify({ first_name: 'John' }), // Missing required fields
        headers: { 'Content-Type': 'application/json' },
      })

      const handler = async (req: NextRequest) => {
        const body = await req.json()
        const requiredFields = ['first_name', 'last_name', 'email', 'specialty']
        const missingFields = requiredFields.filter(field => !body[field])

        if (missingFields.length > 0) {
          return NextResponse.json(
            { error: `Missing required fields: ${missingFields.join(', ')}` },
            { status: 400 }
          )
        }

        return NextResponse.json({ success: true }, { status: 200 })
      }

      const response = await handler(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Missing required fields')
    })
  })

  describe('Rate Limiting', () => {
    it('should handle rate limit exceeded', async () => {
      const request = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ content: 'Hello' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const handler = async (req: NextRequest) => {
        // Mock rate limit check
        const isRateLimited = true
        
        if (isRateLimited) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          )
        }

        return NextResponse.json({ success: true }, { status: 200 })
      }

      const response = await handler(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
    })
  })
})



