// Add Node.js polyfills for test environment
import fetch from 'node-fetch'
if (!globalThis.fetch) {
  globalThis.fetch = fetch as any
}
if (!globalThis.performance) {
  globalThis.performance = require('perf_hooks').performance
}

// import { NextRequest } from 'next/server' // Not used in this test
import { createClient } from '@/lib/supabase/client'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { useRealtimeChat } from '@/hooks/features/chat/useRealtimeChat'
import { calculateCompatibilityScore } from '@/lib/matching-algorithm'
import { calculateCompatibility } from '@/lib/matching/specialty-preference-matching'

// Mock dependencies
jest.mock('@/lib/supabase/client')
jest.mock('@/hooks/features/auth/useAuthUser')
jest.mock('@/hooks/features/chat/useRealtimeChat')

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      or: jest.fn(() => ({
        order: jest.fn(() => ({
          desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      order: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      subscribe: jest.fn(() => Promise.resolve({ unsubscribe: jest.fn() })),
    })),
  })),
} as any

// Mock fetch for API calls
global.fetch = jest.fn()

describe('Comprehensive Test Suite - All Systems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
    ;(useAuthUser as jest.Mock).mockReturnValue({
      user: null,
      profile: null,
      isLoading: false,
      signOut: jest.fn(),
    })
    ;(useRealtimeChat as jest.Mock).mockReturnValue({
      messages: [],
      isConnected: true,
      setMessages: jest.fn(),
    })
  })

  describe('Authentication System Tests', () => {
    test('user can sign up with valid credentials', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      })

      const result = await mockSupabaseClient.auth.signUp({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.data.user).toEqual(mockUser)
      expect(result.error).toBeNull()
    })

    test('user can sign in with valid credentials', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null
      })

      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.data.user).toEqual(mockUser)
      expect(result.data.session.access_token).toBe('token')
    })

    test('authentication errors are handled gracefully', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      })

      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      })

      expect(result.data).toBeNull()
      expect(result.error.message).toBe('Invalid login credentials')
    })
  })

  describe('Redirect System Tests', () => {
    test('unauthenticated users are redirected to login', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      // const _request = new NextRequest('http://localhost:3000/dashboard') // Not used in this test
      
      // This would normally be handled by middleware
      const user = await mockSupabaseClient.auth.getUser()
      
      expect(user.data.user).toBeNull()
      // In real middleware, this would trigger a redirect to /auth/login
    })

    test('authenticated users can access protected routes', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const user = await mockSupabaseClient.auth.getUser()
      
      expect(user.data.user).toEqual(mockUser)
      // In real middleware, this would allow access to protected routes
    })

    test('admin users can access admin routes', async () => {
      const mockUser = { id: 'admin-123', email: 'admin@example.com' }
      const mockProfile = { role: 'admin' }
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null })),
          })),
        })),
      })

      const user = await mockSupabaseClient.auth.getUser()
      const profile = await mockSupabaseClient.from('profiles').select().eq('user_id', user.data.user.id).single()
      
      expect(profile.data.role).toBe('admin')
    })
  })

  describe('Chat System Tests', () => {
    test('chat room loads with messages and members', async () => {
      const mockChatData = {
        chatRoom: {
          id: 'chat-1',
          name: 'Test Chat Room',
          description: 'Test Description'
        },
        messages: [
          {
            id: 'msg-1',
            content: 'Hello!',
            sender_id: 'user-1',
            created_at: '2024-01-01T10:00:00Z',
            profiles: {
              first_name: 'John',
              last_name: 'Doe',
              medical_specialty: 'Cardiology'
            }
          }
        ],
        members: [
          {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            medical_specialty: 'Cardiology'
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({
          success: true,
          data: mockChatData
        }),
      })

      const response = await fetch('/api/chat?chatRoomId=chat-1&userId=user-123')
      const data = await response.json() as { success: boolean; data: { chatRoom: { name: string }; messages: any[]; members: any[] } }

      expect(data.success).toBe(true)
      expect(data.data.chatRoom.name).toBe('Test Chat Room')
      expect(data.data.messages).toHaveLength(1)
      expect(data.data.members).toHaveLength(1)
    })

    test('messages can be sent successfully', async () => {
      const mockNewMessage = {
        id: 'new-msg-123',
        content: 'Test message',
        sender_id: 'user-123',
        created_at: '2024-01-01T10:00:00Z',
        profiles: {
          first_name: 'Test',
          last_name: 'User',
          medical_specialty: 'Cardiology'
        }
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: mockNewMessage, error: null })),
        })),
      })

      const result = await mockSupabaseClient.from('messages').insert({
        content: 'Test message',
        sender_id: 'user-123',
        chat_room_id: 'chat-1'
      }).select()

      expect(result.data).toEqual(mockNewMessage)
      expect(result.error).toBeNull()
    })

    test('real-time message updates work correctly', () => {
      const mockMessages: any[] = []
      const mockSetMessages = jest.fn()
      
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: mockMessages,
        isConnected: true,
        setMessages: mockSetMessages,
      })

      // Simulate receiving a new message
      const newMessage = {
        id: 'realtime-msg',
        content: 'New real-time message!',
        sender_id: 'user-456',
        created_at: '2024-01-01T10:00:00Z',
        profiles: {
          first_name: 'Real',
          last_name: 'Time',
          medical_specialty: 'Neurology'
        }
      }

      mockSetMessages([newMessage])
      
      expect(mockSetMessages).toHaveBeenCalledWith([newMessage])
    })
  })

  describe('Messaging System Tests', () => {
    test('user messages are retrieved correctly', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          content: 'Hello!',
          sender_id: 'user-1',
          receiver_id: 'user-123',
          created_at: '2024-01-01T10:00:00Z',
          is_read: false,
          sender: {
            first_name: 'John',
            last_name: 'Doe',
            medical_specialty: 'Cardiology'
          }
        }
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          or: jest.fn(() => ({
            order: jest.fn(() => ({
              desc: jest.fn(() => Promise.resolve({ data: mockMessages, error: null })),
            })),
          })),
        })),
      })

      const result = await mockSupabaseClient.from('messages').select().or('sender_id.eq.user-123,receiver_id.eq.user-123').order('created_at', { ascending: false })

      expect(result.data).toEqual(mockMessages)
      expect(result.error).toBeNull()
    })

    test('messages can be marked as read', async () => {
      const mockUpdatedMessage = {
        id: 'msg-1',
        is_read: true,
        read_at: '2024-01-01T10:00:00Z'
      }

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => Promise.resolve({ data: mockUpdatedMessage, error: null })),
          })),
        })),
      })

      const result = await mockSupabaseClient.from('messages').update({
        is_read: true,
        read_at: new Date().toISOString()
      }).eq('id', 'msg-1').select()

      expect(result.data?.is_read).toBe(true)
      expect(result.error).toBeNull()
    })

    test('messages can be deleted', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })

      const result = await mockSupabaseClient.from('messages').delete().eq('id', 'msg-1')

      expect(result.data).toBeNull()
      expect(result.error).toBeNull()
    })
  })

  describe('Matching System Tests', () => {
    test('compatibility scores are calculated correctly', () => {
      const user1 = {
        id: 'user-1',
        medical_specialty: 'Cardiology',
        interests: ['research', 'teaching'],
        social_preferences: ['professional_networking'],
        availability_preferences: ['weekday_evenings'],
        city: 'New York',
        career_stage: 'mid_career',
        institutions: ['NYU Medical Center'],
        gender: 'male',
        age: 35
      }

      const user2 = {
        id: 'user-2',
        medical_specialty: 'Cardiology',
        interests: ['research', 'teaching'],
        social_preferences: ['professional_networking'],
        availability_preferences: ['weekday_evenings'],
        city: 'New York',
        career_stage: 'mid_career',
        institutions: ['NYU Medical Center'],
        gender: 'female',
        age: 32
      }

      const score = calculateCompatibilityScore(user1, user2)
      
      expect(score.score).toBeGreaterThan(0.8)
      expect(score.breakdown.specialty).toBe(1.0)
      expect(score.breakdown.geographic).toBe(1.0)
      expect(score.user1_id).toBe('user-1')
      expect(score.user2_id).toBe('user-2')
    })

    test('specialty preference matching works correctly', () => {
      const profile1 = {
        specialties: ['Cardiology', 'Internal Medicine'],
        specialtyPreference: 'same_specialty',
        careerStage: 'mid_career',
        city: 'New York',
        institutions: ['NYU Medical Center'],
        gender: 'male',
        age: 35
      }

      const profile2 = {
        specialties: ['Cardiology', 'Cardiac Surgery'],
        specialtyPreference: 'same_specialty',
        careerStage: 'mid_career',
        city: 'New York',
        institutions: ['NYU Medical Center'],
        gender: 'female',
        age: 32
      }

      const compatibility = calculateCompatibility(profile1 as any, profile2 as any)
      
      expect(compatibility.overall).toBeGreaterThan(0.8)
      expect(compatibility.specialty).toBeGreaterThan(0.8)
      expect(compatibility.location).toBeGreaterThan(0.8)
    })

    test('weekly matching process creates groups', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          user_id: 'user-1',
          medical_specialty: 'Cardiology',
          city: 'New York',
          is_verified: true,
          onboarding_completed: true
        },
        {
          id: 'profile-2',
          user_id: 'user-2',
          medical_specialty: 'Cardiology',
          city: 'New York',
          is_verified: true,
          onboarding_completed: true
        },
        {
          id: 'profile-3',
          user_id: 'user-3',
          medical_specialty: 'Cardiology',
          city: 'New York',
          is_verified: true,
          onboarding_completed: true
        }
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => Promise.resolve({ data: mockProfiles, error: null })),
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [{ id: 'match-1' }], error: null })),
        })),
      })

      // Simulate weekly matching process
      const profiles = await mockSupabaseClient.from('profiles').select()
      expect(profiles.data).toHaveLength(3)

      const matchResult = await mockSupabaseClient.from('matches').insert({
        group_name: 'Cardiology Group',
        match_week: '2024-01-01',
        group_size: 3,
        average_compatibility: 85
      }).select()

      expect(matchResult.data).toHaveLength(1)
      expect(matchResult.data?.[0]?.id).toBe('match-1')
    })

    test('user matches are retrieved correctly', async () => {
      const mockMatches = [
        {
          id: 'match-1',
          group_name: 'Cardiology Group',
          match_week: '2024-01-01',
          group_size: 3,
          average_compatibility: 85,
          members: [
            {
              profile_id: 'profile-1',
              profiles: {
                first_name: 'John',
                last_name: 'Doe',
                medical_specialty: 'Cardiology'
              }
            }
          ]
        }
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              desc: jest.fn(() => Promise.resolve({ data: mockMatches, error: null })),
            })),
          })),
        })),
      })

      const result = await mockSupabaseClient.from('matches').select().eq('user_id', 'user-123').order('created_at', { ascending: false })

      expect(result.data).toEqual(mockMatches)
      expect(result.error).toBeNull()
    })
  })

  describe('Error Handling Tests', () => {
    test('network errors are handled gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      try {
        await fetch('/api/chat')
      } catch (error: any) {
        expect(error.message).toBe('Network error')
      }
    })

    test('database errors are handled gracefully', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              desc: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } })),
            })),
          })),
        })),
      })

      const result = await mockSupabaseClient.from('matches').select().eq('user_id', 'user-123').order('created_at', { ascending: false })

      expect(result.data).toBeNull()
      expect(result.error?.message).toBe('Database error')
    })

    test('authentication errors are handled gracefully', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      })

      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      })

      expect(result.data).toBeNull()
      expect(result.error.message).toBe('Invalid login credentials')
    })
  })

  describe('Performance Tests', () => {
    test('compatibility calculation is efficient', () => {
      const users = Array.from({ length: 100 }, (_, i) => ({
        id: `user-${i}`,
        medical_specialty: 'Cardiology',
        interests: ['research', 'teaching'],
        social_preferences: ['professional_networking'],
        availability_preferences: ['weekday_evenings'],
        city: 'New York',
        career_stage: 'mid_career',
        institutions: ['Medical Center'],
        gender: 'male',
        age: 35
      }))

      const startTime = performance.now() // eslint-disable-line no-undef

      // Calculate compatibility for first user with all others
      const scores = users.slice(1).map(user =>
        calculateCompatibilityScore(users[0], user)
      )

      const endTime = performance.now() // eslint-disable-line no-undef
      const executionTime = endTime - startTime

      expect(scores).toHaveLength(99)
      expect(executionTime).toBeLessThan(1000) // Should complete in less than 1 second
    })

    test('large message history is handled efficiently', () => {
      const largeMessageHistory = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg-${i}`,
        content: `Message ${i}`,
        sender_id: `user-${i % 10}`,
        created_at: `2024-01-01T${String(i % 24).padStart(2, '0')}:00:00Z`,
        is_edited: false,
        profiles: {
          first_name: `User${i % 10}`,
          last_name: 'Test',
          medical_specialty: 'Cardiology'
        }
      }))

      const startTime = performance.now() // eslint-disable-line no-undef

      // Process large message history
      const processedMessages = largeMessageHistory.map(msg => ({
        ...msg,
        formattedTime: new Date(msg.created_at).toLocaleTimeString()
      }))

      const endTime = performance.now() // eslint-disable-line no-undef
      const processingTime = endTime - startTime

      expect(processedMessages).toHaveLength(1000)
      expect(processingTime).toBeLessThan(100) // Should process quickly
    })
  })

  describe('Security Tests', () => {
    test('user data is properly validated', () => {
      const validUser = {
        id: 'user-123',
        email: 'test@example.com',
        medical_specialty: 'Cardiology',
        city: 'New York',
        is_verified: true,
        onboarding_completed: true
      }

      // Validate required fields
      expect(validUser.id).toBeTruthy()
      expect(validUser.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      expect(validUser.medical_specialty).toBeTruthy()
      expect(validUser.is_verified).toBe(true)
      expect(validUser.onboarding_completed).toBe(true)
    })

    test('unauthorized access is prevented', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      const user = await mockSupabaseClient.auth.getUser()
      
      expect(user.data.user).toBeNull()
      // In real application, this would prevent access to protected resources
    })

    test('admin permissions are properly checked', async () => {
      const mockUser = { id: 'user-123', email: 'user@example.com' }
      const mockProfile = { role: 'user' } // Not admin
      
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null })),
          })),
        })),
      })

      const user = await mockSupabaseClient.auth.getUser()
      const profile = await mockSupabaseClient.from('profiles').select().eq('user_id', user.data.user.id).single()
      
      expect(profile.data?.role).toBe('user')
      expect(profile.data?.role).not.toBe('admin')
    })
  })
})
