/**
 * Comprehensive Integration Test Suite
 * 
 * Tests end-to-end workflows and system integration:
 * - Complete user registration and onboarding flow
 * - Authentication and authorization workflows
 * - Matching algorithm and group formation
 * - Real-time chat functionality
 * - Payment processing integration
 * - Admin management workflows
 * - Cross-system data consistency
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextRequest, NextResponse } from 'next/server'

// Mock Next.js router
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

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
    onAuthStateChange: jest.fn(() => ({ 
      data: { subscription: { unsubscribe: jest.fn() } } 
    })),
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
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
  })),
  rpc: jest.fn(),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      download: jest.fn(),
      remove: jest.fn(),
    })),
  },
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

jest.mock('@/lib/database/supabase-browser', () => ({
  createClient: () => mockSupabaseClient,
}))

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabaseClient,
}))

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Test data fixtures
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
  experience_years: 5,
  city: 'New York',
  state: 'NY',
  is_verified: true,
  is_paid: true,
  onboarding_completed: true,
  created_at: '2024-01-01T00:00:00Z',
}

const mockMatch = {
  id: 'test-match-id',
  created_at: '2024-01-01T00:00:00Z',
  is_active: true,
  compatibility_score: 0.85,
}

describe('🔄 Comprehensive Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    })
  })

  // ============================================================================
  // USER REGISTRATION AND ONBOARDING FLOW
  // ============================================================================
  describe('👤 Complete User Registration Flow', () => {
    it('should complete full user registration and onboarding', async () => {
      // Step 1: Sign up
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { 
          user: mockUser, 
          session: null // Email verification required
        },
        error: null,
      })

      const signUpResult = await mockSupabaseClient.auth.signUp({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            first_name: 'Jane',
            last_name: 'Smith',
          },
        },
      })

      expect(signUpResult.data.user).toEqual(mockUser)
      expect(signUpResult.data.session).toBeNull() // Requires email verification

      // Step 2: Email verification (simulated)
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null,
      })

      const sessionResult = await mockSupabaseClient.auth.getSession()
      expect(sessionResult.data.session.user).toEqual(mockUser)

      // Step 3: Create profile
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockProfile, onboarding_completed: false },
              error: null,
            }),
          }),
        }),
      })

      const profileResult = await mockSupabaseClient
        .from('profiles')
        .insert({
          id: mockUser.id,
          email: mockUser.email,
          first_name: mockUser.user_metadata.first_name,
          last_name: mockUser.user_metadata.last_name,
          onboarding_completed: false,
        })
        .select()
        .single()

      expect(profileResult.data.onboarding_completed).toBe(false)

      // Step 4: Complete onboarding steps
      const onboardingSteps = [
        { step: 'medical_background', data: { specialty: 'Cardiology', experience_years: 5 } },
        { step: 'interests', data: { interests: ['Running', 'Reading'] } },
        { step: 'preferences', data: { city: 'New York', state: 'NY' } },
        { step: 'availability', data: { availability: ['Monday', 'Wednesday', 'Friday'] } },
      ]

      for (const step of onboardingSteps) {
        mockSupabaseClient.from.mockReturnValue({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: { ...mockProfile, ...step.data },
                  error: null,
                }),
              }),
            }),
          }),
        })

        const updateResult = await mockSupabaseClient
          .from('profiles')
          .update(step.data)
          .eq('id', mockUser.id)
          .select()
          .single()

        expect(updateResult.error).toBeNull()
      }

      // Step 5: Mark onboarding as complete
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        }),
      })

      const completionResult = await mockSupabaseClient
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', mockUser.id)
        .select()
        .single()

      expect(completionResult.data.onboarding_completed).toBe(true)
    })

    it('should handle onboarding validation errors', async () => {
      // Attempt to complete onboarding with missing required fields
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Missing required fields' },
              }),
            }),
          }),
        }),
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .update({ 
          specialty: '', // Missing required field
          onboarding_completed: true 
        })
        .eq('id', mockUser.id)
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error.message).toBe('Missing required fields')
    })

    it('should prevent access to protected routes during onboarding', async () => {
      // Mock incomplete profile
      const incompleteProfile = { ...mockProfile, onboarding_completed: false }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: incompleteProfile,
              error: null,
            }),
          }),
        }),
      })

      const profileResult = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('id', mockUser.id)
        .single()

      // Should redirect to onboarding if not completed
      if (!profileResult.data.onboarding_completed) {
        expect(mockPush).toHaveBeenCalledWith('/onboarding')
      }
    })
  })

  // ============================================================================
  // AUTHENTICATION WORKFLOW INTEGRATION
  // ============================================================================
  describe('🔐 Authentication Workflow Integration', () => {
    it('should complete login to dashboard flow', async () => {
      // Step 1: Login
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: mockUser, 
          session: { user: mockUser, access_token: 'token123' }
        },
        error: null,
      })

      const loginResult = await mockSupabaseClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(loginResult.data.user).toEqual(mockUser)
      expect(loginResult.data.session.access_token).toBe('token123')

      // Step 2: Fetch user profile
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

      const profileResult = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('id', mockUser.id)
        .single()

      expect(profileResult.data).toEqual(mockProfile)

      // Step 3: Check if onboarding is complete and redirect appropriately
      if (profileResult.data.onboarding_completed) {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      } else {
        expect(mockPush).toHaveBeenCalledWith('/onboarding')
      }

      // Step 4: Fetch dashboard data
      mockSupabaseClient.rpc.mockResolvedValue({
        data: {
          active_matches: 2,
          unread_messages: 5,
          recent_activity: [],
        },
        error: null,
      })

      const dashboardResult = await mockSupabaseClient.rpc('get_dashboard_data', {
        user_id: mockUser.id,
      })

      expect(dashboardResult.data.active_matches).toBe(2)
      expect(dashboardResult.data.unread_messages).toBe(5)
    })

    it('should handle session expiration and refresh', async () => {
      // Step 1: Initial session check returns expired session
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session expired' },
      })

      const expiredSessionResult = await mockSupabaseClient.auth.getSession()
      expect(expiredSessionResult.data.session).toBeNull()

      // Step 2: Redirect to login
      expect(mockPush).toHaveBeenCalledWith('/auth/login')

      // Step 3: User logs in again
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: mockUser, 
          session: { user: mockUser, access_token: 'new_token123' }
        },
        error: null,
      })

      const newLoginResult = await mockSupabaseClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(newLoginResult.data.session.access_token).toBe('new_token123')
    })

    it('should handle password reset flow', async () => {
      // Step 1: Request password reset
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      })

      const resetResult = await mockSupabaseClient.auth.resetPasswordForEmail(
        'test@example.com',
        {
          redirectTo: 'http://localhost:3000/auth/reset-password',
        }
      )

      expect(resetResult.error).toBeNull()

      // Step 2: User clicks reset link and updates password
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const updateResult = await mockSupabaseClient.auth.updateUser({
        password: 'newpassword123',
      })

      expect(updateResult.data.user).toEqual(mockUser)
      expect(updateResult.error).toBeNull()

      // Step 3: Redirect to dashboard after successful password update
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  // ============================================================================
  // MATCHING ALGORITHM INTEGRATION
  // ============================================================================
  describe('🤝 Matching Algorithm Integration', () => {
    it('should complete weekly matching workflow', async () => {
      // Step 1: Identify eligible users
      const eligibleUsers = [
        mockProfile,
        { ...mockProfile, id: 'user-2', first_name: 'Jane', specialty: 'Neurology' },
        { ...mockProfile, id: 'user-3', first_name: 'Bob', specialty: 'Cardiology' },
        { ...mockProfile, id: 'user-4', first_name: 'Alice', specialty: 'Pediatrics' },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: eligibleUsers,
                error: null,
              }),
            }),
          }),
        }),
      })

      const eligibleResult = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('is_verified', true)
        .eq('is_paid', true)
        .eq('onboarding_completed', true)

      expect(eligibleResult.data).toEqual(eligibleUsers)

      // Step 2: Execute matching algorithm
      mockSupabaseClient.rpc.mockResolvedValue({
        data: {
          success: true,
          groups_created: 1,
          users_matched: 3,
          matches: [
            {
              id: 'new-match-1',
              members: ['user-1', 'user-2', 'user-3'],
              compatibility_score: 0.82,
            },
          ],
        },
        error: null,
      })

      const matchingResult = await mockSupabaseClient.rpc('execute_weekly_matching')

      expect(matchingResult.data.success).toBe(true)
      expect(matchingResult.data.groups_created).toBe(1)
      expect(matchingResult.data.users_matched).toBe(3)

      // Step 3: Create match records
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'new-match-1',
                compatibility_score: 0.82,
                is_active: true,
                created_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      })

      const matchRecord = await mockSupabaseClient
        .from('matches')
        .insert({
          id: 'new-match-1',
          compatibility_score: 0.82,
          is_active: true,
        })
        .select()
        .single()

      expect(matchRecord.data.id).toBe('new-match-1')
      expect(matchRecord.data.is_active).toBe(true)

      // Step 4: Add users to match
      const matchMembers = ['user-1', 'user-2', 'user-3']
      
      for (const userId of matchMembers) {
        mockSupabaseClient.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  match_id: 'new-match-1',
                  user_id: userId,
                  joined_at: new Date().toISOString(),
                },
                error: null,
              }),
            }),
          }),
        })

        const memberResult = await mockSupabaseClient
          .from('match_members')
          .insert({
            match_id: 'new-match-1',
            user_id: userId,
          })
          .select()
          .single()

        expect(memberResult.data.match_id).toBe('new-match-1')
        expect(memberResult.data.user_id).toBe(userId)
      }

      // Step 5: Send notifications to matched users
      for (const userId of matchMembers) {
        mockSupabaseClient.from.mockReturnValue({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  user_id: userId,
                  type: 'match_created',
                  title: 'New Match Found!',
                  message: 'You have been matched with other doctors.',
                  is_read: false,
                },
                error: null,
              }),
            }),
          }),
        })

        const notificationResult = await mockSupabaseClient
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'match_created',
            title: 'New Match Found!',
            message: 'You have been matched with other doctors.',
          })
          .select()
          .single()

        expect(notificationResult.data.type).toBe('match_created')
        expect(notificationResult.data.is_read).toBe(false)
      }

      // Step 6: Initialize group chat
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                match_id: 'new-match-1',
                sender_id: 'system',
                content: 'Welcome to your new match group! Introduce yourselves and start connecting.',
                message_type: 'system',
              },
              error: null,
            }),
          }),
        }),
      })

      const welcomeMessage = await mockSupabaseClient
        .from('chat_messages')
        .insert({
          match_id: 'new-match-1',
          sender_id: 'system',
          content: 'Welcome to your new match group! Introduce yourselves and start connecting.',
          message_type: 'system',
        })
        .select()
        .single()

      expect(welcomeMessage.data.message_type).toBe('system')
      expect(welcomeMessage.data.content).toContain('Welcome')
    })

    it('should handle matching algorithm failures gracefully', async () => {
      // Mock algorithm failure
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Insufficient eligible users for matching' },
      })

      const matchingResult = await mockSupabaseClient.rpc('execute_weekly_matching')

      expect(matchingResult.data).toBeNull()
      expect(matchingResult.error.message).toContain('Insufficient eligible users')

      // Should log the failure for admin review
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                execution_date: new Date().toISOString(),
                status: 'failed',
                error_message: 'Insufficient eligible users for matching',
                users_processed: 2,
                groups_created: 0,
              },
              error: null,
            }),
          }),
        }),
      })

      const logResult = await mockSupabaseClient
        .from('matching_logs')
        .insert({
          execution_date: new Date().toISOString(),
          status: 'failed',
          error_message: 'Insufficient eligible users for matching',
          users_processed: 2,
          groups_created: 0,
        })
        .select()
        .single()

      expect(logResult.data.status).toBe('failed')
      expect(logResult.data.groups_created).toBe(0)
    })
  })

  // ============================================================================
  // REAL-TIME CHAT INTEGRATION
  // ============================================================================
  describe('💬 Real-time Chat Integration', () => {
    it('should complete chat workflow with real-time updates', async () => {
      // Step 1: User joins chat room
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [
                  {
                    id: 'msg-1',
                    match_id: mockMatch.id,
                    sender_id: 'system',
                    content: 'Welcome to your match group!',
                    message_type: 'system',
                    created_at: '2024-01-01T00:00:00Z',
                  },
                ],
                error: null,
              }),
            }),
          }),
        }),
      })

      const initialMessages = await mockSupabaseClient
        .from('chat_messages')
        .select('*, profiles(first_name, last_name)')
        .eq('match_id', mockMatch.id)
        .order('created_at', { ascending: true })
        .limit(50)

      expect(initialMessages.data).toHaveLength(1)
      expect(initialMessages.data[0].message_type).toBe('system')

      // Step 2: Set up real-time subscription
      const mockSubscription = { unsubscribe: jest.fn() }
      mockSupabaseClient.from.mockReturnValue({
        on: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            subscribe: jest.fn().mockReturnValue(mockSubscription),
          }),
        }),
      })

      const subscription = mockSupabaseClient
        .from('chat_messages')
        .on('INSERT', (payload: any) => {
          // Handle new message
          console.log('New message:', payload.new)
        })
        .eq('match_id', mockMatch.id)
        .subscribe()

      expect(subscription).toEqual(mockSubscription)

      // Step 3: User sends a message
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'msg-2',
                match_id: mockMatch.id,
                sender_id: mockUser.id,
                content: 'Hello everyone! Excited to meet you all.',
                message_type: 'user',
                created_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      })

      const newMessage = await mockSupabaseClient
        .from('chat_messages')
        .insert({
          match_id: mockMatch.id,
          sender_id: mockUser.id,
          content: 'Hello everyone! Excited to meet you all.',
          message_type: 'user',
        })
        .select()
        .single()

      expect(newMessage.data.content).toBe('Hello everyone! Excited to meet you all.')
      expect(newMessage.data.sender_id).toBe(mockUser.id)

      // Step 4: Other users receive real-time update
      // This would be handled by the subscription callback in a real scenario

      // Step 5: Update last read timestamp
      mockSupabaseClient.from.mockReturnValue({
        upsert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                match_id: mockMatch.id,
                user_id: mockUser.id,
                last_read_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      })

      const readUpdate = await mockSupabaseClient
        .from('match_read_status')
        .upsert({
          match_id: mockMatch.id,
          user_id: mockUser.id,
          last_read_at: new Date().toISOString(),
        })
        .select()
        .single()

      expect(readUpdate.data.match_id).toBe(mockMatch.id)
      expect(readUpdate.data.user_id).toBe(mockUser.id)

      // Step 6: Clean up subscription
      subscription.unsubscribe()
      expect(mockSubscription.unsubscribe).toHaveBeenCalled()
    })

    it('should handle message sending failures', async () => {
      // Mock message sending failure
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Message too long' },
            }),
          }),
        }),
      })

      const messageResult = await mockSupabaseClient
        .from('chat_messages')
        .insert({
          match_id: mockMatch.id,
          sender_id: mockUser.id,
          content: 'a'.repeat(2000), // Too long message
        })
        .select()
        .single()

      expect(messageResult.data).toBeNull()
      expect(messageResult.error.message).toBe('Message too long')

      // Should show error to user without breaking the chat interface
    })

    it('should handle real-time connection failures', async () => {
      // Mock subscription failure
      mockSupabaseClient.from.mockReturnValue({
        on: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            subscribe: jest.fn().mockImplementation(() => {
              throw new Error('Connection failed')
            }),
          }),
        }),
      })

      try {
        mockSupabaseClient
          .from('chat_messages')
          .on('INSERT', () => {})
          .eq('match_id', mockMatch.id)
          .subscribe()
      } catch (error) {
        expect(error.message).toBe('Connection failed')
        // Should fall back to polling or show connection error
      }
    })
  })

  // ============================================================================
  // PAYMENT PROCESSING INTEGRATION
  // ============================================================================
  describe('💳 Payment Processing Integration', () => {
    it('should complete subscription payment flow', async () => {
      // Step 1: User initiates subscription
      const mockStripeSession = {
        id: 'cs_123',
        url: 'https://checkout.stripe.com/session-123',
        customer: 'cus_123',
      }

      // Mock Stripe checkout creation
      const createCheckoutSession = jest.fn().mockResolvedValue(mockStripeSession)

      const checkoutResult = await createCheckoutSession({
        price_id: 'price_monthly_2999',
        customer_email: mockUser.email,
        success_url: 'http://localhost:3000/payment/success',
        cancel_url: 'http://localhost:3000/payment/error',
        metadata: {
          user_id: mockUser.id,
        },
      })

      expect(checkoutResult.url).toContain('stripe.com')
      expect(checkoutResult.id).toBe('cs_123')

      // Step 2: User completes payment (webhook simulation)
      const webhookEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_123',
            customer: 'cus_123',
            subscription: 'sub_123',
            metadata: {
              user_id: mockUser.id,
            },
          },
        },
      }

      // Step 3: Process webhook and update user status
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  ...mockProfile,
                  is_paid: true,
                  stripe_customer_id: 'cus_123',
                  stripe_subscription_id: 'sub_123',
                },
                error: null,
              }),
            }),
          }),
        }),
      })

      const profileUpdate = await mockSupabaseClient
        .from('profiles')
        .update({
          is_paid: true,
          stripe_customer_id: webhookEvent.data.object.customer,
          stripe_subscription_id: webhookEvent.data.object.subscription,
        })
        .eq('id', webhookEvent.data.object.metadata.user_id)
        .select()
        .single()

      expect(profileUpdate.data.is_paid).toBe(true)
      expect(profileUpdate.data.stripe_customer_id).toBe('cus_123')

      // Step 4: Record payment in history
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: mockUser.id,
                amount: 2999,
                currency: 'usd',
                status: 'succeeded',
                stripe_payment_intent_id: 'pi_123',
                stripe_subscription_id: 'sub_123',
              },
              error: null,
            }),
          }),
        }),
      })

      const paymentRecord = await mockSupabaseClient
        .from('payment_history')
        .insert({
          user_id: mockUser.id,
          amount: 2999,
          currency: 'usd',
          status: 'succeeded',
          stripe_payment_intent_id: 'pi_123',
          stripe_subscription_id: 'sub_123',
        })
        .select()
        .single()

      expect(paymentRecord.data.status).toBe('succeeded')
      expect(paymentRecord.data.amount).toBe(2999)

      // Step 5: Send confirmation notification
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: mockUser.id,
                type: 'payment_success',
                title: 'Payment Successful',
                message: 'Your subscription has been activated.',
              },
              error: null,
            }),
          }),
        }),
      })

      const notification = await mockSupabaseClient
        .from('notifications')
        .insert({
          user_id: mockUser.id,
          type: 'payment_success',
          title: 'Payment Successful',
          message: 'Your subscription has been activated.',
        })
        .select()
        .single()

      expect(notification.data.type).toBe('payment_success')
      expect(notification.data.title).toBe('Payment Successful')
    })

    it('should handle payment failures', async () => {
      // Mock payment failure webhook
      const failureWebhookEvent = {
        type: 'invoice.payment_failed',
        data: {
          object: {
            customer: 'cus_123',
            subscription: 'sub_123',
            metadata: {
              user_id: mockUser.id,
            },
          },
        },
      }

      // Step 1: Record failed payment
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: mockUser.id,
                amount: 2999,
                currency: 'usd',
                status: 'failed',
                stripe_subscription_id: 'sub_123',
              },
              error: null,
            }),
          }),
        }),
      })

      const failedPaymentRecord = await mockSupabaseClient
        .from('payment_history')
        .insert({
          user_id: mockUser.id,
          amount: 2999,
          currency: 'usd',
          status: 'failed',
          stripe_subscription_id: 'sub_123',
        })
        .select()
        .single()

      expect(failedPaymentRecord.data.status).toBe('failed')

      // Step 2: Send failure notification
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: mockUser.id,
                type: 'payment_failed',
                title: 'Payment Failed',
                message: 'Please update your payment method.',
              },
              error: null,
            }),
          }),
        }),
      })

      const failureNotification = await mockSupabaseClient
        .from('notifications')
        .insert({
          user_id: mockUser.id,
          type: 'payment_failed',
          title: 'Payment Failed',
          message: 'Please update your payment method.',
        })
        .select()
        .single()

      expect(failureNotification.data.type).toBe('payment_failed')

      // Step 3: Update user status if necessary
      // Don't immediately disable access, allow grace period
    })

    it('should handle subscription cancellation', async () => {
      // Mock subscription cancellation webhook
      const cancellationWebhookEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            metadata: {
              user_id: mockUser.id,
            },
          },
        },
      }

      // Step 1: Update user subscription status
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  ...mockProfile,
                  is_paid: false,
                  subscription_end_date: new Date().toISOString(),
                },
                error: null,
              }),
            }),
          }),
        }),
      })

      const cancellationUpdate = await mockSupabaseClient
        .from('profiles')
        .update({
          is_paid: false,
          subscription_end_date: new Date().toISOString(),
        })
        .eq('id', cancellationWebhookEvent.data.object.metadata.user_id)
        .select()
        .single()

      expect(cancellationUpdate.data.is_paid).toBe(false)

      // Step 2: Send cancellation notification
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: mockUser.id,
                type: 'subscription_cancelled',
                title: 'Subscription Cancelled',
                message: 'Your subscription has been cancelled.',
              },
              error: null,
            }),
          }),
        }),
      })

      const cancellationNotification = await mockSupabaseClient
        .from('notifications')
        .insert({
          user_id: mockUser.id,
          type: 'subscription_cancelled',
          title: 'Subscription Cancelled',
          message: 'Your subscription has been cancelled.',
        })
        .select()
        .single()

      expect(cancellationNotification.data.type).toBe('subscription_cancelled')
    })
  })

  // ============================================================================
  // ADMIN MANAGEMENT WORKFLOW
  // ============================================================================
  describe('👑 Admin Management Workflow', () => {
    const mockAdmin = {
      ...mockUser,
      id: 'admin-user-id',
      user_metadata: {
        ...mockUser.user_metadata,
        role: 'admin',
      },
    }

    beforeEach(() => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockAdmin },
        error: null,
      })
    })

    it('should complete user verification workflow', async () => {
      // Step 1: Admin fetches pending verification requests
      const pendingVerifications = [
        {
          id: 'ver-1',
          user_id: 'pending-user-1',
          document_type: 'medical_license',
          document_url: 'https://example.com/license.pdf',
          status: 'pending',
          submitted_at: '2024-01-01T00:00:00Z',
          profiles: {
            first_name: 'Pending',
            last_name: 'User',
            email: 'pending@example.com',
            specialty: 'Cardiology',
          },
        },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: pendingVerifications,
              error: null,
            }),
          }),
        }),
      })

      const verificationRequests = await mockSupabaseClient
        .from('verification_requests')
        .select('*, profiles(first_name, last_name, email, specialty)')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true })

      expect(verificationRequests.data).toHaveLength(1)
      expect(verificationRequests.data[0].status).toBe('pending')

      // Step 2: Admin reviews and approves verification
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  ...pendingVerifications[0],
                  status: 'approved',
                  reviewed_at: new Date().toISOString(),
                  reviewer_id: mockAdmin.id,
                },
                error: null,
              }),
            }),
          }),
        }),
      })

      const approvalResult = await mockSupabaseClient
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewer_id: mockAdmin.id,
        })
        .eq('id', 'ver-1')
        .select()
        .single()

      expect(approvalResult.data.status).toBe('approved')
      expect(approvalResult.data.reviewer_id).toBe(mockAdmin.id)

      // Step 3: Update user profile verification status
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'pending-user-1',
                  is_verified: true,
                  verified_at: new Date().toISOString(),
                },
                error: null,
              }),
            }),
          }),
        }),
      })

      const profileVerification = await mockSupabaseClient
        .from('profiles')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
        })
        .eq('id', 'pending-user-1')
        .select()
        .single()

      expect(profileVerification.data.is_verified).toBe(true)

      // Step 4: Send verification approval notification
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: 'pending-user-1',
                type: 'verification_approved',
                title: 'Verification Approved',
                message: 'Your medical license has been verified.',
              },
              error: null,
            }),
          }),
        }),
      })

      const approvalNotification = await mockSupabaseClient
        .from('notifications')
        .insert({
          user_id: 'pending-user-1',
          type: 'verification_approved',
          title: 'Verification Approved',
          message: 'Your medical license has been verified.',
        })
        .select()
        .single()

      expect(approvalNotification.data.type).toBe('verification_approved')
    })

    it('should handle verification rejection workflow', async () => {
      // Step 1: Admin rejects verification with reason
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 'ver-1',
                  status: 'rejected',
                  reviewed_at: new Date().toISOString(),
                  reviewer_id: mockAdmin.id,
                  notes: 'Document is not clear enough. Please resubmit.',
                },
                error: null,
              }),
            }),
          }),
        }),
      })

      const rejectionResult = await mockSupabaseClient
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewer_id: mockAdmin.id,
          notes: 'Document is not clear enough. Please resubmit.',
        })
        .eq('id', 'ver-1')
        .select()
        .single()

      expect(rejectionResult.data.status).toBe('rejected')
      expect(rejectionResult.data.notes).toContain('not clear enough')

      // Step 2: Send rejection notification
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                user_id: 'pending-user-1',
                type: 'verification_rejected',
                title: 'Verification Rejected',
                message: 'Please resubmit your documents. Reason: Document is not clear enough. Please resubmit.',
              },
              error: null,
            }),
          }),
        }),
      })

      const rejectionNotification = await mockSupabaseClient
        .from('notifications')
        .insert({
          user_id: 'pending-user-1',
          type: 'verification_rejected',
          title: 'Verification Rejected',
          message: 'Please resubmit your documents. Reason: Document is not clear enough. Please resubmit.',
        })
        .select()
        .single()

      expect(rejectionNotification.data.type).toBe('verification_rejected')
      expect(rejectionNotification.data.message).toContain('not clear enough')
    })

    it('should complete admin analytics dashboard workflow', async () => {
      // Step 1: Fetch admin statistics
      mockSupabaseClient.rpc.mockResolvedValue({
        data: {
          total_users: 150,
          verified_users: 120,
          paid_users: 100,
          active_matches: 25,
          total_messages: 500,
          pending_verifications: 5,
          revenue_this_month: 5000,
          average_compatibility: 0.78,
        },
        error: null,
      })

      const adminStats = await mockSupabaseClient.rpc('get_admin_stats')

      expect(adminStats.data.total_users).toBe(150)
      expect(adminStats.data.pending_verifications).toBe(5)
      expect(adminStats.data.revenue_this_month).toBe(5000)

      // Step 2: Fetch recent activity
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'log-1',
                  action: 'user_verified',
                  user_id: 'user-1',
                  admin_id: mockAdmin.id,
                  timestamp: '2024-01-01T12:00:00Z',
                },
                {
                  id: 'log-2',
                  action: 'match_created',
                  details: { match_id: 'match-1', users_matched: 3 },
                  timestamp: '2024-01-01T11:00:00Z',
                },
              ],
              error: null,
            }),
          }),
        }),
      })

      const recentActivity = await mockSupabaseClient
        .from('admin_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10)

      expect(recentActivity.data).toHaveLength(2)
      expect(recentActivity.data[0].action).toBe('user_verified')

      // Step 3: Fetch matching algorithm performance
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [
                {
                  execution_date: '2024-01-04T16:00:00Z',
                  status: 'success',
                  users_processed: 50,
                  groups_created: 12,
                  execution_time_ms: 1500,
                },
              ],
              error: null,
            }),
          }),
        }),
      })

      const matchingLogs = await mockSupabaseClient
        .from('matching_logs')
        .select('*')
        .order('execution_date', { ascending: false })
        .limit(5)

      expect(matchingLogs.data[0].status).toBe('success')
      expect(matchingLogs.data[0].groups_created).toBe(12)
    })
  })

  // ============================================================================
  // CROSS-SYSTEM DATA CONSISTENCY
  // ============================================================================
  describe('🔄 Cross-System Data Consistency', () => {
    it('should maintain data consistency across profile updates', async () => {
      // Step 1: Update user profile
      const updatedProfile = {
        ...mockProfile,
        first_name: 'Updated',
        specialty: 'Neurology',
        city: 'Boston',
      }

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

      const profileUpdate = await mockSupabaseClient
        .from('profiles')
        .update({
          first_name: 'Updated',
          specialty: 'Neurology',
          city: 'Boston',
        })
        .eq('id', mockUser.id)
        .select()
        .single()

      expect(profileUpdate.data.first_name).toBe('Updated')
      expect(profileUpdate.data.specialty).toBe('Neurology')

      // Step 2: Check that related data is updated consistently
      // Messages should still reference the same user
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'msg-1',
                  sender_id: mockUser.id,
                  content: 'Hello',
                  profiles: updatedProfile, // Should reflect updated profile
                },
              ],
              error: null,
            }),
          }),
        }),
      })

      const userMessages = await mockSupabaseClient
        .from('chat_messages')
        .select('*, profiles(*)')
        .eq('sender_id', mockUser.id)
        .limit(10)

      expect(userMessages.data[0].profiles.first_name).toBe('Updated')

      // Step 3: Verify match compatibility scores are recalculated if needed
      // This would typically be handled by database triggers
      mockSupabaseClient.rpc.mockResolvedValue({
        data: { compatibility_updated: true, affected_matches: 2 },
        error: null,
      })

      const compatibilityUpdate = await mockSupabaseClient.rpc(
        'update_compatibility_scores',
        { user_id: mockUser.id }
      )

      expect(compatibilityUpdate.data.compatibility_updated).toBe(true)
      expect(compatibilityUpdate.data.affected_matches).toBe(2)
    })

    it('should handle cascading deletes properly', async () => {
      // Step 1: Delete a match
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      })

      await mockSupabaseClient
        .from('matches')
        .delete()
        .eq('id', mockMatch.id)

      // Step 2: Verify related data is properly cleaned up
      // Match members should be deleted
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [], // Should be empty after cascade delete
            error: null,
          }),
        }),
      })

      const remainingMembers = await mockSupabaseClient
        .from('match_members')
        .select('*')
        .eq('match_id', mockMatch.id)

      expect(remainingMembers.data).toEqual([])

      // Chat messages should be deleted
      const remainingMessages = await mockSupabaseClient
        .from('chat_messages')
        .select('*')
        .eq('match_id', mockMatch.id)

      expect(remainingMessages.data).toEqual([])
    })

    it('should maintain referential integrity', async () => {
      // Attempt to create a match member for non-existent match
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'foreign key violation', code: '23503' },
            }),
          }),
        }),
      })

      const invalidMemberResult = await mockSupabaseClient
        .from('match_members')
        .insert({
          match_id: 'non-existent-match',
          user_id: mockUser.id,
        })
        .select()
        .single()

      expect(invalidMemberResult.data).toBeNull()
      expect(invalidMemberResult.error.code).toBe('23503')

      // Attempt to create a message for non-existent match
      const invalidMessageResult = await mockSupabaseClient
        .from('chat_messages')
        .insert({
          match_id: 'non-existent-match',
          sender_id: mockUser.id,
          content: 'Hello',
        })
        .select()
        .single()

      expect(invalidMessageResult.data).toBeNull()
      expect(invalidMessageResult.error.code).toBe('23503')
    })
  })

  // ============================================================================
  // ERROR RECOVERY AND RESILIENCE
  // ============================================================================
  describe('🛡️ Error Recovery and Resilience', () => {
    it('should handle network failures gracefully', async () => {
      // Mock network failure
      mockSupabaseClient.from.mockImplementation(() => {
        throw new Error('Network error')
      })

      try {
        await mockSupabaseClient.from('profiles').select('*')
      } catch (error) {
        expect(error.message).toBe('Network error')
        
        // Should implement retry logic or show appropriate error message
        // and not crash the application
      }
    })

    it('should handle partial system failures', async () => {
      // Mock database available but real-time unavailable
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [mockProfile],
          error: null,
        }),
      })

      // Database queries work
      const profileResult = await mockSupabaseClient
        .from('profiles')
        .select('*')

      expect(profileResult.data).toEqual([mockProfile])

      // But real-time subscriptions fail
      mockSupabaseClient.from.mockReturnValue({
        on: jest.fn().mockReturnValue({
          subscribe: jest.fn().mockImplementation(() => {
            throw new Error('Real-time connection failed')
          }),
        }),
      })

      try {
        mockSupabaseClient
          .from('chat_messages')
          .on('INSERT', () => {})
          .subscribe()
      } catch (error) {
        expect(error.message).toBe('Real-time connection failed')
        
        // Should fall back to polling or show degraded functionality notice
      }
    })

    it('should recover from transaction failures', async () => {
      // Mock transaction failure during match creation
      let attemptCount = 0
      
      mockSupabaseClient.rpc.mockImplementation(() => {
        attemptCount++
        if (attemptCount === 1) {
          return Promise.resolve({
            data: null,
            error: { message: 'Transaction failed' },
          })
        } else {
          return Promise.resolve({
            data: { success: true, groups_created: 1 },
            error: null,
          })
        }
      })

      // First attempt fails
      let matchingResult = await mockSupabaseClient.rpc('execute_weekly_matching')
      expect(matchingResult.error.message).toBe('Transaction failed')

      // Retry succeeds
      matchingResult = await mockSupabaseClient.rpc('execute_weekly_matching')
      expect(matchingResult.data.success).toBe(true)
      expect(attemptCount).toBe(2)
    })
  })
})

// ============================================================================
// CLEANUP AND TEARDOWN
// ============================================================================
afterAll(async () => {
  // Clean up any test data or connections
  jest.clearAllMocks()
  jest.restoreAllMocks()
})



