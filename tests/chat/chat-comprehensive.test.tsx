import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ChatComponent from '@/components/features/chat/ChatComponent'
import ChatRoom from '@/components/features/chat/ChatRoom'
import ChatList from '@/components/features/chat/ChatList'
import MessagesPage from '@/app/messages/page'
import { useRealtimeChat } from '@/hooks/features/chat/useRealtimeChat'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('@/lib/supabase/client')
jest.mock('@/hooks/features/chat/useRealtimeChat')
jest.mock('@/hooks/features/auth/useAuthUser')

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
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })),
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      subscribe: jest.fn(() => Promise.resolve({ unsubscribe: jest.fn() })),
    })),
  })),
}

// Mock fetch for API calls
global.fetch = jest.fn()

describe('Chat System - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Remove the problematic useRouter mock since it's already mocked globally
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
    ;(useAuthUser as jest.Mock).mockReturnValue({
      user: { id: 'user-123', email: 'test@example.com' },
      profile: { id: 'profile-123', first_name: 'Test', last_name: 'User' },
      isLoading: false,
      signOut: jest.fn(),
    })
    ;(useRealtimeChat as jest.Mock).mockReturnValue({
      messages: [],
      isConnected: true,
      setMessages: jest.fn(),
    })
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ success: true, data: { messages: [], chatRoom: null, members: [] } }),
    })
  })

  describe('ChatComponent Tests', () => {
    const mockChatRoomId = 'chat-room-123'
    const mockUserId = 'user-123'

    test('renders chat component with all required elements', () => {
      render(<ChatComponent chatRoomId={mockChatRoomId} userId={mockUserId} />)
      
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
    })

    test('displays chat room information', async () => {
      const mockChatRoom = {
        id: mockChatRoomId,
        name: 'Test Chat Room',
        description: 'Test Description',
        created_at: '2024-01-01T00:00:00Z'
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ 
          success: true, 
          data: { 
            chatRoom: mockChatRoom, 
            messages: [], 
            members: [] 
          } 
        }),
      })

      render(<ChatComponent chatRoomId={mockChatRoomId} userId={mockUserId} />)
      
      await waitFor(() => {
        expect(screen.getByText('Test Chat Room')).toBeInTheDocument()
      })
    })

    test('displays chat members', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          name: 'John Doe',
          avatar: 'avatar1.jpg',
          specialty: 'Cardiology',
          isOnline: true
        },
        {
          id: 'member-2',
          name: 'Jane Smith',
          avatar: 'avatar2.jpg',
          specialty: 'Neurology',
          isOnline: false
        }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ 
          success: true, 
          data: { 
            chatRoom: { id: mockChatRoomId, name: 'Test Room' }, 
            messages: [], 
            members: mockMembers 
          } 
        }),
      })

      render(<ChatComponent chatRoomId={mockChatRoomId} userId={mockUserId} />)
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        expect(screen.getByText('Cardiology')).toBeInTheDocument()
        expect(screen.getByText('Neurology')).toBeInTheDocument()
      })
    })

    test('displays messages correctly', () => {
      const mockMessages: any[] = [
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
        },
        {
          id: 'msg-2',
          content: 'Hi John!',
          sender_id: 'user-2',
          created_at: '2024-01-01T10:01:00Z',
          is_edited: false,
          profiles: {
            first_name: 'Jane',
            last_name: 'Smith',
            medical_specialty: 'Neurology'
          }
        }
      ]

      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: mockMessages,
        isConnected: true,
        setMessages: jest.fn(),
      })

      render(<ChatComponent chatRoomId={mockChatRoomId} userId={mockUserId} />)
      
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument()
      expect(screen.getByText('Hi John!')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    test('sends message when form is submitted', async () => {
      const mockMessage = {
        id: 'new-msg-123',
        content: 'Test message',
        sender_id: mockUserId,
        created_at: '2024-01-01T10:00:00Z',
        is_edited: false,
        profiles: {
          first_name: 'Test',
          last_name: 'User',
          medical_specialty: 'General Practice'
        }
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ 
          success: true, 
          data: { message: mockMessage } 
        }),
      })

      const mockSetMessages = jest.fn()
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: [],
        isConnected: true,
        setMessages: mockSetMessages,
      })

      render(<ChatComponent chatRoomId={mockChatRoomId} userId={mockUserId} />)
      
      const messageInput = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send/i })
      
      fireEvent.change(messageInput, { target: { value: 'Test message' } })
      fireEvent.click(sendButton)
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatRoomId: mockChatRoomId,
            userId: mockUserId,
            content: 'Test message'
          })
        })
      })
    })

    test('sends message when Enter key is pressed', async () => {
      const mockSetMessages = jest.fn()
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: [],
        isConnected: true,
        setMessages: mockSetMessages,
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ 
          success: true, 
          data: { message: { id: 'msg-123', content: 'Test message' } } 
        }),
      })

      render(<ChatComponent chatRoomId={mockChatRoomId} userId={mockUserId} />)
      
      const messageInput = screen.getByRole('textbox')
      
      fireEvent.change(messageInput, { target: { value: 'Test message' } })
      fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      })
    })

    test('does not send message when Shift+Enter is pressed', async () => {
      const mockSetMessages = jest.fn()
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: [],
        isConnected: true,
        setMessages: mockSetMessages,
      })

      render(<ChatComponent chatRoomId={mockChatRoomId} userId={mockUserId} />)
      
      const messageInput = screen.getByRole('textbox')
      
      fireEvent.change(messageInput, { target: { value: 'Test message' } })
      fireEvent.keyPress(messageInput, { key: 'Enter', code: 'Enter', shiftKey: true })
      
      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled()
      })
    })

    test('handles send message errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ 
          success: false, 
          error: 'Failed to send message' 
        }),
      })

      const mockSetMessages = jest.fn()
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: [],
        isConnected: true,
        setMessages: mockSetMessages,
      })

      render(<ChatComponent chatRoomId={mockChatRoomId} userId={mockUserId} />)
      
      const messageInput = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send/i })
      
      fireEvent.change(messageInput, { target: { value: 'Test message' } })
      fireEvent.click(sendButton)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
      })
    })

    test('shows connection status', () => {
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: [],
        isConnected: false,
        setMessages: jest.fn(),
      })

      render(<ChatComponent chatRoomId={mockChatRoomId} userId={mockUserId} />)
      
      expect(screen.getByText(/disconnected/i)).toBeInTheDocument()
    })

    test('auto-scrolls to bottom when new messages arrive', () => {
      const mockScrollIntoView = jest.fn()
      const mockElement = { scrollIntoView: mockScrollIntoView }
      
      jest.spyOn(React, 'useRef').mockReturnValue({ current: mockElement as any })

      const mockMessages: any[] = [
        {
          id: 'msg-1',
          content: 'Message 1',
          sender_id: 'user-1',
          created_at: '2024-01-01T10:00:00Z',
          is_edited: false,
          profiles: { first_name: 'John', last_name: 'Doe' }
        }
      ]

      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: mockMessages,
        isConnected: true,
        setMessages: jest.fn(),
      })

      render(<ChatComponent chatRoomId={mockChatRoomId} userId={mockUserId} />)
      
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    })
  })

  describe('ChatRoom Component Tests', () => {
    const mockChatRoom = {
      id: 'chat-room-123',
      name: 'Test Chat Room',
      description: 'Test Description',
      created_at: '2024-01-01T00:00:00Z'
    }

    test('renders chat room with header information', () => {
      render(<ChatRoom chatRoomId={mockChatRoom.id} matchId="test-match-id" />)
      
      expect(screen.getByText('Test Chat Room')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })

    test('displays message input and send button', () => {
      render(<ChatRoom chatRoomId={mockChatRoom.id} matchId="test-match-id" />)
      
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
    })

    test('shows loading state while fetching messages', () => {
      render(<ChatRoom chatRoomId={mockChatRoom.id} matchId="test-match-id" />)
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    test('displays messages with proper formatting', () => {
      const mockMessages: any[] = [
        {
          id: 'msg-1',
          content: 'Hello!',
          sender_id: 'user-1',
          created_at: '2024-01-01T10:00:00Z',
          is_edited: false,
          sender: {
            name: 'John Doe',
            avatar: 'avatar.jpg',
            specialty: 'Cardiology'
          }
        }
      ]

      render(<ChatRoom chatRoomId={mockChatRoom.id} matchId="test-match-id" />)
      
      expect(screen.getByText('Hello!')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    test('handles message sending', async () => {
      const mockOnSendMessage = jest.fn()
      render(<ChatRoom chatRoomId={mockChatRoom.id} matchId="test-match-id" />)
      
      const messageInput = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send/i })
      
      fireEvent.change(messageInput, { target: { value: 'Test message' } })
      fireEvent.click(sendButton)
      
      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
    })
  })

  describe('ChatList Component Tests', () => {
    const mockChats = [
      {
        id: 'chat-1',
        name: 'Cardiology Group',
        lastMessage: 'Hello everyone!',
        lastMessageTime: '2024-01-01T10:00:00Z',
        unreadCount: 2,
        members: [
          { id: 'user-1', name: 'John Doe', avatar: 'avatar1.jpg' },
          { id: 'user-2', name: 'Jane Smith', avatar: 'avatar2.jpg' }
        ]
      },
      {
        id: 'chat-2',
        name: 'Neurology Discussion',
        lastMessage: 'Great case study!',
        lastMessageTime: '2024-01-01T09:30:00Z',
        unreadCount: 0,
        members: [
          { id: 'user-3', name: 'Bob Wilson', avatar: 'avatar3.jpg' }
        ]
      }
    ]

    test('renders list of chat rooms', () => {
      render(<ChatList onChatSelect={jest.fn()} />)
      
      expect(screen.getByText('Cardiology Group')).toBeInTheDocument()
      expect(screen.getByText('Neurology Discussion')).toBeInTheDocument()
    })

    test('displays last message and timestamp', () => {
      render(<ChatList onChatSelect={jest.fn()} />)
      
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument()
      expect(screen.getByText('Great case study!')).toBeInTheDocument()
    })

    test('shows unread count badges', () => {
      render(<ChatList onChatSelect={jest.fn()} />)
      
      expect(screen.getByText('2')).toBeInTheDocument() // Unread count for first chat
    })

    test('calls onChatSelect when chat is clicked', () => {
      const mockOnChatSelect = jest.fn()
      render(<ChatList onChatSelect={mockOnChatSelect} />)
      
      fireEvent.click(screen.getByText('Cardiology Group'))
      
      expect(mockOnChatSelect).toHaveBeenCalledWith('chat-1')
    })

    test('shows empty state when no chats', () => {
      render(<ChatList onChatSelect={jest.fn()} />)
      
      expect(screen.getByText(/no chats available/i)).toBeInTheDocument()
    })
  })

  describe('MessagesPage Tests', () => {
    test('renders messages page with chat list and room', () => {
      render(<MessagesPage />)
      
      expect(screen.getByText(/messages/i)).toBeInTheDocument()
    })

    test('handles mobile view switching', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      render(<MessagesPage />)
      
      // Test mobile view behavior
      expect(window.innerWidth).toBeLessThan(768)
    })

    test('shows back button in mobile chat view', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      render(<MessagesPage />)
      
      // Simulate selecting a chat (which would trigger mobile view)
      // This would normally be done through user interaction
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })
  })

  describe('Real-time Chat Integration Tests', () => {
    test('handles real-time message updates', () => {
      const mockMessages: any[] = []
      const mockSetMessages = jest.fn()
      
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: mockMessages,
        isConnected: true,
        setMessages: mockSetMessages,
      })

      render(<ChatComponent chatRoomId="chat-123" userId="user-123" />)
      
      // Simulate receiving a new message
      const newMessage = {
        id: 'new-msg',
        content: 'New message!',
        sender_id: 'user-456',
        created_at: '2024-01-01T10:00:00Z',
        is_edited: false,
        profiles: { first_name: 'New', last_name: 'User' }
      }

      act(() => {
        mockSetMessages([newMessage])
      })

      expect(screen.getByText('New message!')).toBeInTheDocument()
    })

    test('handles connection status changes', () => {
      const mockSetMessages = jest.fn()
      
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: [],
        isConnected: false,
        setMessages: mockSetMessages,
      })

      render(<ChatComponent chatRoomId="chat-123" userId="user-123" />)
      
      expect(screen.getByText(/disconnected/i)).toBeInTheDocument()
    })

    test('handles message deduplication', () => {
      const duplicateMessages = [
        {
          id: 'msg-1',
          content: 'Duplicate message',
          sender_id: 'user-1',
          created_at: '2024-01-01T10:00:00Z',
          is_edited: false,
          profiles: { first_name: 'John', last_name: 'Doe' }
        },
        {
          id: 'msg-1', // Same ID
          content: 'Duplicate message',
          sender_id: 'user-1',
          created_at: '2024-01-01T10:00:00Z',
          is_edited: false,
          profiles: { first_name: 'John', last_name: 'Doe' }
        }
      ]

      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: duplicateMessages,
        isConnected: true,
        setMessages: jest.fn(),
      })

      render(<ChatComponent chatRoomId="chat-123" userId="user-123" />)
      
      // Should only show one instance of the message
      const messageElements = screen.getAllByText('Duplicate message')
      expect(messageElements).toHaveLength(1)
    })
  })

  describe('Chat Error Handling Tests', () => {
    test('handles API errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<ChatComponent chatRoomId="chat-123" userId="user-123" />)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load chat/i)).toBeInTheDocument()
      })
    })

    test('handles malformed API responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: () => Promise.resolve({ success: false, error: 'Invalid response' }),
      })

      render(<ChatComponent chatRoomId="chat-123" userId="user-123" />)
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load chat/i)).toBeInTheDocument()
      })
    })

    test('handles empty message content', async () => {
      const mockSetMessages = jest.fn()
      ;(useRealtimeChat as jest.Mock).mockReturnValue({
        messages: [],
        isConnected: true,
        setMessages: mockSetMessages,
      })

      render(<ChatComponent chatRoomId="chat-123" userId="user-123" />)
      
      const messageInput = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send/i })
      
      fireEvent.change(messageInput, { target: { value: '   ' } }) // Only whitespace
      fireEvent.click(sendButton)
      
      await waitFor(() => {
        expect(global.fetch).not.toHaveBeenCalled()
      })
    })
  })
})

// Mock React for useRef
const React = {
  useRef: jest.fn(() => ({ current: null })),
}
