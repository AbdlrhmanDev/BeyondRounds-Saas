import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UserDashboard } from '@/components/features/dashboard/UserDashboard'
import { ChatComponent } from '@/components/features/chat/ChatComponent'
import { MatchCard } from '@/components/features/dashboard/MatchCard'

// Mock dependencies
jest.mock('@/hooks/features/auth/useAuthUser', () => ({
  useAuthUser: () => ({
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' }
    },
    isLoading: false,
    error: null
  })
}))

jest.mock('@/hooks/features/dashboard/useDashboard', () => ({
  useDashboard: () => ({
    user: {
      id: 'test-user-1',
      name: 'Test User',
      email: 'test@example.com',
      profile_completion: 85
    },
    stats: {
      totalMatches: 5,
      activeGroups: 2,
      messagesReceived: 15,
      profileViews: 30
    },
    recentActivity: [
      {
        id: '1',
        type: 'match',
        message: 'New match with Dr. Smith',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'message',
        message: 'Message from Dr. Johnson',
        timestamp: new Date().toISOString()
      }
    ],
    isLoading: false,
    error: null
  })
}))

jest.mock('@/hooks/features/chat/useChat', () => ({
  useChat: () => ({
    messages: [
      {
        id: '1',
        content: 'Hello everyone!',
        sender_id: 'user-1',
        sender_name: 'Dr. Smith',
        created_at: new Date().toISOString(),
        is_own: false
      },
      {
        id: '2',
        content: 'Hi there!',
        sender_id: 'test-user-1',
        sender_name: 'Test User',
        created_at: new Date().toISOString(),
        is_own: true
      }
    ],
    sendMessage: jest.fn(),
    isLoading: false,
    error: null,
    isConnected: true
  })
}))

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Application Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Dashboard Integration', () => {
    it('renders dashboard with user data and stats', async () => {
      render(
        <TestWrapper>
          <UserDashboard />
        </TestWrapper>
      )

      // Check user information
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()

      // Check statistics
      expect(screen.getByText('5')).toBeInTheDocument() // totalMatches
      expect(screen.getByText('2')).toBeInTheDocument() // activeGroups
      expect(screen.getByText('15')).toBeInTheDocument() // messagesReceived
      expect(screen.getByText('30')).toBeInTheDocument() // profileViews

      // Check profile completion
      expect(screen.getByText('85%')).toBeInTheDocument()

      // Check recent activity
      expect(screen.getByText('New match with Dr. Smith')).toBeInTheDocument()
      expect(screen.getByText('Message from Dr. Johnson')).toBeInTheDocument()
    })

    it('handles dashboard navigation actions', async () => {
      const mockPush = jest.fn()
      jest.mocked(require('next/navigation').useRouter).mockReturnValue({
        push: mockPush,
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
      })

      render(
        <TestWrapper>
          <UserDashboard />
        </TestWrapper>
      )

      // Test navigation to matches
      const viewMatchesButton = screen.getByRole('button', { name: /view matches/i })
      fireEvent.click(viewMatchesButton)
      expect(mockPush).toHaveBeenCalledWith('/matches')

      // Test navigation to profile
      const editProfileButton = screen.getByRole('button', { name: /edit profile/i })
      fireEvent.click(editProfileButton)
      expect(mockPush).toHaveBeenCalledWith('/profile')
    })
  })

  describe('Chat Integration', () => {
    it('renders chat with messages and allows sending', async () => {
      const mockSendMessage = jest.fn()
      jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
        messages: [
          {
            id: '1',
            content: 'Hello everyone!',
            sender_id: 'user-1',
            sender_name: 'Dr. Smith',
            created_at: new Date().toISOString(),
            is_own: false
          }
        ],
        sendMessage: mockSendMessage,
        isLoading: false,
        error: null,
        isConnected: true
      })

      render(
        <TestWrapper>
          <ChatComponent groupId="test-group" />
        </TestWrapper>
      )

      // Check messages are displayed
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument()
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument()

      // Test sending a message
      const input = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send/i })

      fireEvent.change(input, { target: { value: 'Test message' } })
      fireEvent.click(sendButton)

      expect(mockSendMessage).toHaveBeenCalledWith('Test message')
    })

    it('handles chat connection states', () => {
      jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
        messages: [],
        sendMessage: jest.fn(),
        isLoading: false,
        error: null,
        isConnected: false
      })

      render(
        <TestWrapper>
          <ChatComponent groupId="test-group" />
        </TestWrapper>
      )

      // Check that input is disabled when not connected
      const input = screen.getByRole('textbox')
      const sendButton = screen.getByRole('button', { name: /send/i })

      expect(input).toBeDisabled()
      expect(sendButton).toBeDisabled()
      expect(screen.getByText(/connecting/i)).toBeInTheDocument()
    })
  })

  describe('Match Card Integration', () => {
    const mockMatch = {
      id: 'match-1',
      name: 'Dr. Jane Smith',
      specialty: 'Cardiology',
      hospital: 'City Hospital',
      compatibility: 85,
      lastActive: '2 hours ago',
      avatar: 'JS',
      interests: ['Research', 'Exercise', 'Reading'],
      location: 'Riyadh',
      age: 35,
      careerStage: 'Senior',
      mutualInterests: 3,
      status: 'new',
      bio: 'Experienced cardiologist',
      phone: '+966123456789',
      email: 'jane@example.com'
    }

    it('renders match card with all information', () => {
      render(
        <TestWrapper>
          <MatchCard match={mockMatch} />
        </TestWrapper>
      )

      expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Cardiology')).toBeInTheDocument()
      expect(screen.getByText('City Hospital')).toBeInTheDocument()
      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByText('2 hours ago')).toBeInTheDocument()
      expect(screen.getByText('Riyadh')).toBeInTheDocument()
      expect(screen.getByText('35')).toBeInTheDocument()
      expect(screen.getByText('Research')).toBeInTheDocument()
      expect(screen.getByText('Exercise')).toBeInTheDocument()
      expect(screen.getByText('Reading')).toBeInTheDocument()
    })

    it('handles match actions', () => {
      const mockOnLike = jest.fn()
      const mockOnPass = jest.fn()

      render(
        <TestWrapper>
          <MatchCard 
            match={mockMatch} 
            onLike={mockOnLike}
            onPass={mockOnPass}
          />
        </TestWrapper>
      )

      const likeButton = screen.getByRole('button', { name: /like/i })
      const passButton = screen.getByRole('button', { name: /pass/i })

      fireEvent.click(likeButton)
      expect(mockOnLike).toHaveBeenCalledWith(mockMatch.id)

      fireEvent.click(passButton)
      expect(mockOnPass).toHaveBeenCalledWith(mockMatch.id)
    })
  })

  describe('Error Handling Integration', () => {
    it('handles dashboard errors gracefully', () => {
      jest.mocked(require('@/hooks/features/dashboard/useDashboard')).useDashboard.mockReturnValue({
        user: null,
        stats: null,
        recentActivity: [],
        isLoading: false,
        error: 'Failed to load dashboard data'
      })

      render(
        <TestWrapper>
          <UserDashboard />
        </TestWrapper>
      )

      expect(screen.getByText(/failed to load dashboard data/i)).toBeInTheDocument()
    })

    it('handles chat errors gracefully', () => {
      jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
        messages: [],
        sendMessage: jest.fn(),
        isLoading: false,
        error: 'Failed to load messages',
        isConnected: false
      })

      render(
        <TestWrapper>
          <ChatComponent groupId="test-group" />
        </TestWrapper>
      )

      expect(screen.getByText(/failed to load messages/i)).toBeInTheDocument()
    })
  })

  describe('Loading States Integration', () => {
    it('shows loading states across components', () => {
      jest.mocked(require('@/hooks/features/dashboard/useDashboard')).useDashboard.mockReturnValue({
        user: null,
        stats: null,
        recentActivity: [],
        isLoading: true,
        error: null
      })

      render(
        <TestWrapper>
          <UserDashboard />
        </TestWrapper>
      )

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('handles chat loading states', () => {
      jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
        messages: [],
        sendMessage: jest.fn(),
        isLoading: true,
        error: null,
        isConnected: true
      })

      render(
        <TestWrapper>
          <ChatComponent groupId="test-group" />
        </TestWrapper>
      )

      expect(screen.getByRole('status')).toBeInTheDocument()
    })
  })

  describe('Real-time Updates Integration', () => {
    it('updates dashboard when new activity arrives', async () => {
      const { rerender } = render(
        <TestWrapper>
          <UserDashboard />
        </TestWrapper>
      )

      // Initial state
      expect(screen.getByText('New match with Dr. Smith')).toBeInTheDocument()

      // Simulate new activity
      jest.mocked(require('@/hooks/features/dashboard/useDashboard')).useDashboard.mockReturnValue({
        user: {
          id: 'test-user-1',
          name: 'Test User',
          email: 'test@example.com',
          profile_completion: 85
        },
        stats: {
          totalMatches: 6, // Updated
          activeGroups: 2,
          messagesReceived: 16, // Updated
          profileViews: 30
        },
        recentActivity: [
          {
            id: '3',
            type: 'match',
            message: 'New match with Dr. Brown', // New activity
            timestamp: new Date().toISOString()
          },
          {
            id: '1',
            type: 'match',
            message: 'New match with Dr. Smith',
            timestamp: new Date().toISOString()
          }
        ],
        isLoading: false,
        error: null
      })

      rerender(
        <TestWrapper>
          <UserDashboard />
        </TestWrapper>
      )

      // Check updated values
      expect(screen.getByText('6')).toBeInTheDocument() // Updated totalMatches
      expect(screen.getByText('16')).toBeInTheDocument() // Updated messagesReceived
      expect(screen.getByText('New match with Dr. Brown')).toBeInTheDocument() // New activity
    })

    it('updates chat when new messages arrive', async () => {
      const { rerender } = render(
        <TestWrapper>
          <ChatComponent groupId="test-group" />
        </TestWrapper>
      )

      // Initial state
      expect(screen.getByText('Hello everyone!')).toBeInTheDocument()

      // Simulate new message
      jest.mocked(require('@/hooks/features/chat/useChat')).useChat.mockReturnValue({
        messages: [
          {
            id: '1',
            content: 'Hello everyone!',
            sender_id: 'user-1',
            sender_name: 'Dr. Smith',
            created_at: new Date().toISOString(),
            is_own: false
          },
          {
            id: '3',
            content: 'How is everyone doing?', // New message
            sender_id: 'user-2',
            sender_name: 'Dr. Johnson',
            created_at: new Date().toISOString(),
            is_own: false
          }
        ],
        sendMessage: jest.fn(),
        isLoading: false,
        error: null,
        isConnected: true
      })

      rerender(
        <TestWrapper>
          <ChatComponent groupId="test-group" />
        </TestWrapper>
      )

      // Check new message appears
      expect(screen.getByText('How is everyone doing?')).toBeInTheDocument()
      expect(screen.getByText('Dr. Johnson')).toBeInTheDocument()
    })
  })
})


