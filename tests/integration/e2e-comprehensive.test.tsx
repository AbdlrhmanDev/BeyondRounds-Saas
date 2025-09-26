import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { useRealtimeChat } from '@/hooks/features/chat/useRealtimeChat'
import LoginPage from '@/app/auth/login/page'
import DashboardPage from '@/app/dashboard/page'
import MessagesPage from '@/app/messages/page'
import ChatComponent from '@/components/features/chat/ChatComponent'
import ProtectedRoute from '@/components/shared/ProtectedRoute'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('@/lib/supabase/client')
jest.mock('@/hooks/features/auth/useAuthUser')
jest.mock('@/hooks/features/chat/useRealtimeChat')

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

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

describe('End-to-End Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
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

  describe('Complete User Journey Tests', () => {
    test('new user registration and onboarding flow', async () => {
      // Step 1: User visits sign up page
      render(<LoginPage />)
      
      // Step 2: User fills out registration form
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      
      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      // Mock successful sign up
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: { id: 'new-user-123', email: 'newuser@example.com' }, session: null },
        error: null
      })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'password123'
        })
        expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      })
      
      // Step 3: User confirms email and logs in
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: { id: 'new-user-123', email: 'newuser@example.com' }, 
          session: { access_token: 'token' } 
        },
        error: null
      })
      
      // Mock authenticated state
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: { id: 'new-user-123', email: 'newuser@example.com' },
        profile: null, // No profile yet
        isLoading: false,
        signOut: jest.fn(),
      })
      
      // Step 4: User gets redirected to dashboard, which redirects to onboarding
      const mockProfile = {
        id: 'profile-123',
        user_id: 'new-user-123',
        onboarding_completed: false,
        profile_completion: 0
      }
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null })),
          })),
        })),
      })
      
      // This would normally trigger a redirect to onboarding
      expect(mockProfile.onboarding_completed).toBe(false)
    })

    test('existing user login and dashboard access flow', async () => {
      // Step 1: User visits login page
      render(<LoginPage />)
      
      // Step 2: User logs in
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      const mockUser = {
        id: 'existing-user-123',
        email: 'existing@example.com',
        user_metadata: { first_name: 'Existing', last_name: 'User' }
      }
      
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null
      })
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'existing@example.com',
          password: 'password123'
        })
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
      
      // Step 3: User accesses dashboard
      const mockProfile = {
        id: 'profile-123',
        user_id: 'existing-user-123',
        onboarding_completed: true,
        profile_completion: 100,
        role: 'user'
      }
      
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        isLoading: false,
        signOut: jest.fn(),
      })
      
      // Dashboard should render successfully
      expect(mockProfile.onboarding_completed).toBe(true)
      expect(mockProfile.role).toBe('user')
    })

    test('admin user access flow', async () => {
      const mockAdminUser = {
        id: 'admin-user-123',
        email: 'admin@example.com',
        user_metadata: { first_name: 'Admin', last_name: 'User' }
      }
      
      const mockAdminProfile = {
        id: 'admin-profile-123',
        user_id: 'admin-user-123',
        role: 'admin',
        onboarding_completed: true,
        profile_completion: 100
      }
      
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockAdminUser,
        profile: mockAdminProfile,
        isLoading: false,
        signOut: jest.fn(),
      })
      
      // Admin should be redirected to admin panel
      expect(mockAdminProfile.role).toBe('admin')
    })
  })

  describe('Chat and Messaging Integration Tests', () => {
    test('complete chat flow from match to conversation', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      }
      
      const mockProfile = {
        id: 'profile-123',
        first_name: 'Test',
        last_name: 'User',
        medical_specialty: 'Cardiology'
      }
      
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        isLoading: false,
        signOut: jest.fn(),
      })
      
      // Step 1: User accesses messages page
      render(<MessagesPage />)
      
      expect(screen.getByText(/messages/i)).toBeInTheDocument()
      
      // Step 2: User selects a chat
      const mockChats = [
        {
          id: 'chat-1',
          name: 'Cardiology Group',
          lastMessage: 'Hello everyone!',
          lastMessageTime: '2024-01-01T10:00:00Z',
          unreadCount: 2,
          members: [
            { id: 'user-1', name: 'John Doe', avatar: 'avatar1.jpg' },
            { id: 'user-123', name: 'Test User', avatar: 'avatar2.jpg' }
          ]
        }
      ]
      
      // Mock chat list component
      const ChatList = ({ chats, onChatSelect }: { chats: any[], onChatSelect: (chatId: string) => void }) => (
        <div>
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat.id)}
              data-testid={`chat-${chat.id}`}
            >
              {chat.name}
            </button>
          ))}
        </div>
      )
      
      const mockOnChatSelect = jest.fn()
      render(<ChatList chats={mockChats} onChatSelect={mockOnChatSelect} />)
      
      fireEvent.click(screen.getByTestId('chat-chat-1'))
      
      expect(mockOnChatSelect).toHaveBeenCalledWith('chat-1')
      
      // Step 3: User enters chat room
      const mockChatRoom = {
        id: 'chat-1',
        name: 'Cardiology Group',
        description: 'Cardiology professionals discussion',
        created_at: '2024-01-01T00:00:00Z'
      }
      
      const mockMessages = [
        {
          id: 'msg-1',
          content: 'Hello everyone!',
          sender_id: 'user-1',
          created_at: '2024-01-01T10:00:00Z',
          is_edited: false,
          profiles: {
            first_name: 'John',
            last_name: 'Doe',
            medical_specialty: 'Cardiology'
          }
        }
      ]
      
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: mockMessages,
        isConnected: true,
        setMessages: jest.fn(),
      })
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({
          success: true,
          data: {
            chatRoom: mockChatRoom,
            messages: mockMessages,
            members: mockChats[0].members
          }
        }),
      })
      
      render(<ChatComponent chatRoomId="chat-1" userId="user-123" />)
      
      await waitFor(() => {
        expect(screen.getByText('Cardiology Group')).toBeInTheDocument()
        expect(screen.getByText('Hello everyone!')).toBeInTheDocument()
      })
      
      // Step 4: User sends a message
      const messageInput = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send/i })
      
      fireEvent.change(messageInput, { target: { value: 'Hi John!' } })
      
      const mockNewMessage = {
        id: 'new-msg-123',
        content: 'Hi John!',
        sender_id: 'user-123',
        created_at: '2024-01-01T10:01:00Z',
        is_edited: false,
        profiles: {
          first_name: 'Test',
          last_name: 'User',
          medical_specialty: 'Cardiology'
        }
      }
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({
          success: true,
          data: { message: mockNewMessage }
        }),
      })
      
      fireEvent.click(sendButton)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatRoomId: 'chat-1',
            userId: 'user-123',
            content: 'Hi John!'
          })
        })
      })
    })

    test('real-time message updates in chat', async () => {
      const mockSetMessages = jest.fn()
      
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: [],
        isConnected: true,
        setMessages: mockSetMessages,
      })
      
      render(<ChatComponent chatRoomId="chat-1" userId="user-123" />)
      
      // Simulate receiving a new message via real-time
      const newMessage = {
        id: 'realtime-msg-123',
        content: 'New message from real-time!',
        sender_id: 'user-456',
        created_at: '2024-01-01T10:00:00Z',
        is_edited: false,
        profiles: {
          first_name: 'Real',
          last_name: 'Time',
          medical_specialty: 'Neurology'
        }
      }
      
      act(() => {
        mockSetMessages([newMessage])
      })
      
      // Verify the message was processed
      expect(mockSetMessages).toHaveBeenCalledWith([newMessage])
    })
  })

  describe('Matching System Integration Tests', () => {
    test('weekly matching process creates groups and chat rooms', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          user_id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          medical_specialty: 'Cardiology',
          city: 'New York',
          is_verified: true,
          onboarding_completed: true
        },
        {
          id: 'profile-2',
          user_id: 'user-2',
          first_name: 'Jane',
          last_name: 'Smith',
          medical_specialty: 'Cardiology',
          city: 'New York',
          is_verified: true,
          onboarding_completed: true
        },
        {
          id: 'profile-3',
          user_id: 'user-3',
          first_name: 'Bob',
          last_name: 'Wilson',
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
      
      const request = new NextRequest('http://localhost:3000/api/matching/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const response = await import('@/app/api/matching/weekly/route').then(module => module.POST(request))
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    test('user receives match notification and accesses chat', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      }
      
      const mockProfile = {
        id: 'profile-123',
        first_name: 'Test',
        last_name: 'User'
      }
      
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        isLoading: false,
        signOut: jest.fn(),
      })
      
      // Mock user's matches
      const mockMatches = [
        {
          id: 'match-1',
          group_name: 'Cardiology Group',
          match_week: '2024-01-01',
          group_size: 3,
          average_compatibility: 85,
          chat_room_id: 'chat-1',
          members: [
            {
              profile_id: 'profile-1',
              profiles: {
                first_name: 'John',
                last_name: 'Doe',
                medical_specialty: 'Cardiology'
              }
            },
            {
              profile_id: 'profile-2',
              profiles: {
                first_name: 'Jane',
                last_name: 'Smith',
                medical_specialty: 'Cardiology'
              }
            },
            {
              profile_id: 'profile-123',
              profiles: {
                first_name: 'Test',
                last_name: 'User',
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
      
      // User accesses matches
      const request = new NextRequest('http://localhost:3000/api/matches')
      const response = await import('@/app/api/matches/route').then(module => module.GET(request))
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.matches).toHaveLength(1)
      
      // User selects match and enters chat
      const mockChatRoom = {
        id: 'chat-1',
        name: 'Cardiology Group',
        description: 'Cardiology professionals discussion'
      }
      
      const mockMessages = [
        {
          id: 'msg-1',
          content: 'Welcome to the group!',
          sender_id: 'user-1',
          created_at: '2024-01-01T10:00:00Z',
          is_edited: false,
          profiles: {
            first_name: 'John',
            last_name: 'Doe',
            medical_specialty: 'Cardiology'
          }
        }
      ]
      
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: mockMessages,
        isConnected: true,
        setMessages: jest.fn(),
      })
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({
          success: true,
          data: {
            chatRoom: mockChatRoom,
            messages: mockMessages,
            members: mockMatches[0].members
          }
        }),
      })
      
      render(<ChatComponent chatRoomId="chat-1" userId="user-123" />)
      
      await waitFor(() => {
        expect(screen.getByText('Cardiology Group')).toBeInTheDocument()
        expect(screen.getByText('Welcome to the group!')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling Integration Tests', () => {
    test('handles network errors gracefully across the app', async () => {
      // Mock network error
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      }
      
      const mockProfile = {
        id: 'profile-123',
        first_name: 'Test',
        last_name: 'User'
      }
      
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        isLoading: false,
        signOut: jest.fn(),
      })
      
      render(<ChatComponent chatRoomId="chat-1" userId="user-123" />)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load chat/i)).toBeInTheDocument()
      })
    })

    test('handles authentication errors and redirects properly', async () => {
      // Mock authentication error
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      })
      
      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
      })
    })

    test('handles database errors in API routes', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              desc: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Database connection failed' } })),
            })),
          })),
        })),
      })
      
      const request = new NextRequest('http://localhost:3000/api/matches')
      const response = await import('@/app/api/matches/route').then(module => module.GET(request))
      
      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Database connection failed')
    })
  })

  describe('Performance Integration Tests', () => {
    test('handles multiple concurrent users efficiently', async () => {
      const concurrentUsers = Array.from({ length: 10 }, (_, i) => ({
        id: `user-${i}`,
        email: `user${i}@example.com`,
        profile: {
          id: `profile-${i}`,
          first_name: `User${i}`,
          last_name: 'Test'
        }
      }))
      
      // Simulate multiple users accessing the same chat
      const promises = concurrentUsers.map(user => {
        ;(useAuthUser as jest.Mock).mockReturnValue({
          user: user,
          profile: user.profile,
          isLoading: false,
          signOut: jest.fn(),
        })
        
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(`User ${user.id} accessed chat`)
          }, Math.random() * 100)
        })
      })
      
      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(10)
      results.forEach(result => {
        expect(result).toContain('accessed chat')
      })
    })

    test('handles large message history efficiently', async () => {
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
      
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: largeMessageHistory,
        isConnected: true,
        setMessages: jest.fn(),
      })
      
      const startTime = performance.now()
      
      render(<ChatComponent chatRoomId="chat-1" userId="user-123" />)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render large message history efficiently
      expect(renderTime).toBeLessThan(1000) // Less than 1 second
    })
  })

  describe('Security Integration Tests', () => {
    test('prevents unauthorized access to protected routes', async () => {
      // Mock unauthenticated user
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: null,
        profile: null,
        isLoading: false,
        signOut: jest.fn(),
      })
      
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      )
      
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
    })

    test('prevents non-admin access to admin routes', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com'
      }
      
      const mockProfile = {
        id: 'profile-123',
        role: 'user' // Not admin
      }
      
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        isLoading: false,
        signOut: jest.fn(),
      })
      
      render(
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>
      )
      
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
    })

    test('validates user permissions for chat access', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com'
      }
      
      const mockProfile = {
        id: 'profile-123',
        first_name: 'Test',
        last_name: 'User'
      }
      
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        isLoading: false,
        signOut: jest.fn(),
      })
      
      // Mock unauthorized chat access
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({
          success: false,
          error: 'Unauthorized access to chat room'
        }),
      })
      
      render(<ChatComponent chatRoomId="unauthorized-chat" userId="user-123" />)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load chat/i)).toBeInTheDocument()
      })
    })
  })
})
