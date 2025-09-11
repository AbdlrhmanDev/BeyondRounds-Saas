import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MatchCard } from '@/components/dashboard/match-card-optimized'
import { Match } from '@/lib/types'

// Mock data
const mockMatch: Match = {
  id: '1',
  group_name: 'Cardiology Specialists',
  status: 'active',
  match_week: '2024-01-15',
  created_at: '2024-01-15T10:00:00Z',
  match_members: [
    {
      user_id: '1',
      joined_at: '2024-01-15T10:00:00Z',
      profiles: {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        specialty: 'Cardiology',
        city: 'New York',
        is_verified: true,
        is_paid: true,
      }
    },
    {
      user_id: '2',
      joined_at: '2024-01-15T10:00:00Z',
      profiles: {
        id: '2',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        specialty: 'Cardiology',
        city: 'Boston',
        is_verified: true,
        is_paid: true,
      }
    }
  ],
  chat_messages: [
    {
      content: 'Hello everyone!',
      created_at: '2024-01-15T11:00:00Z',
      message_type: 'text'
    }
  ]
}

// Mock utility functions
const mockGetInitials = jest.fn((firstName: string, lastName: string) => 
  `${firstName[0]}${lastName[0]}`.toUpperCase()
)
const mockGetLastMessage = jest.fn((match: Match) => 'Hello everyone!')
const mockGetLastMessageTime = jest.fn((match: Match) => '2 hours ago')

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
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

describe('MatchCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders match information correctly', () => {
    render(
      <TestWrapper>
        <MatchCard
          match={mockMatch}
          getInitials={mockGetInitials}
          getLastMessage={mockGetLastMessage}
          getLastMessageTime={mockGetLastMessageTime}
        />
      </TestWrapper>
    )

    expect(screen.getByText('Cardiology Specialists')).toBeInTheDocument()
    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('2 members')).toBeInTheDocument()
    expect(screen.getByText('New York, Boston')).toBeInTheDocument()
    expect(screen.getByText('Cardiology')).toBeInTheDocument()
    expect(screen.getByText('John Doe, Jane Smith')).toBeInTheDocument()
  })

  it('displays member avatars with correct initials', () => {
    render(
      <TestWrapper>
        <MatchCard
          match={mockMatch}
          getInitials={mockGetInitials}
          getLastMessage={mockGetLastMessage}
          getLastMessageTime={mockGetLastMessageTime}
        />
      </TestWrapper>
    )

    expect(mockGetInitials).toHaveBeenCalledWith('John', 'Doe')
    expect(mockGetInitials).toHaveBeenCalledWith('Jane', 'Smith')
  })

  it('shows last message and timestamp', () => {
    render(
      <TestWrapper>
        <MatchCard
          match={mockMatch}
          getInitials={mockGetInitials}
          getLastMessage={mockGetLastMessage}
          getLastMessageTime={mockGetLastMessageTime}
        />
      </TestWrapper>
    )

    expect(mockGetLastMessage).toHaveBeenCalledWith(mockMatch)
    expect(mockGetLastMessageTime).toHaveBeenCalledWith(mockMatch)
    expect(screen.getByText('Hello everyone!')).toBeInTheDocument()
    expect(screen.getByText('• 2 hours ago')).toBeInTheDocument()
  })

  it('handles empty chat messages gracefully', () => {
    const matchWithoutMessages = {
      ...mockMatch,
      chat_messages: []
    }

    mockGetLastMessage.mockReturnValue('No messages yet')
    mockGetLastMessageTime.mockReturnValue('')

    render(
      <TestWrapper>
        <MatchCard
          match={matchWithoutMessages}
          getInitials={mockGetInitials}
          getLastMessage={mockGetLastMessage}
          getLastMessageTime={mockGetLastMessageTime}
        />
      </TestWrapper>
    )

    expect(screen.getByText('No messages yet')).toBeInTheDocument()
  })

  it('calls onViewDetails when view details button is clicked', () => {
    const mockOnViewDetails = jest.fn()

    render(
      <TestWrapper>
        <MatchCard
          match={mockMatch}
          getInitials={mockGetInitials}
          getLastMessage={mockGetLastMessage}
          getLastMessageTime={mockGetLastMessageTime}
          onViewDetails={mockOnViewDetails}
        />
      </TestWrapper>
    )

    const viewDetailsButton = screen.getByText('View Details')
    fireEvent.click(viewDetailsButton)

    expect(mockOnViewDetails).toHaveBeenCalledWith('1')
  })

  it('renders correct number of member avatars', () => {
    render(
      <TestWrapper>
        <MatchCard
          match={mockMatch}
          getInitials={mockGetInitials}
          getLastMessage={mockGetLastMessage}
          getLastMessageTime={mockGetLastMessageTime}
        />
      </TestWrapper>
    )

    // Should show 2 avatars for 2 members
    const avatars = screen.getAllByRole('img', { hidden: true })
    expect(avatars).toHaveLength(2)
  })

  it('shows overflow indicator for more than 5 members', () => {
    const matchWithManyMembers = {
      ...mockMatch,
      match_members: Array.from({ length: 7 }, (_, i) => ({
        user_id: `${i + 1}`,
        joined_at: '2024-01-15T10:00:00Z',
        profiles: {
          id: `${i + 1}`,
          first_name: `User${i + 1}`,
          last_name: 'Test',
          email: `user${i + 1}@example.com`,
          specialty: 'Cardiology',
          city: 'New York',
          is_verified: true,
          is_paid: true,
        }
      }))
    }

    render(
      <TestWrapper>
        <MatchCard
          match={matchWithManyMembers}
          getInitials={mockGetInitials}
          getLastMessage={mockGetLastMessage}
          getLastMessageTime={mockGetLastMessageTime}
        />
      </TestWrapper>
    )

    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('applies correct styling based on match status', () => {
    render(
      <TestWrapper>
        <MatchCard
          match={mockMatch}
          getInitials={mockGetInitials}
          getLastMessage={mockGetLastMessage}
          getLastMessageTime={mockGetLastMessageTime}
        />
      </TestWrapper>
    )

    const statusBadge = screen.getByText('active')
    expect(statusBadge).toHaveClass('bg-green-500')
  })

  it('memoizes expensive calculations', () => {
    const { rerender } = render(
      <TestWrapper>
        <MatchCard
          match={mockMatch}
          getInitials={mockGetInitials}
          getLastMessage={mockGetLastMessage}
          getLastMessageTime={mockGetLastMessageTime}
        />
      </TestWrapper>
    )

    // Clear mock calls
    jest.clearAllMocks()

    // Rerender with same props
    rerender(
      <TestWrapper>
        <MatchCard
          match={mockMatch}
          getInitials={mockGetInitials}
          getLastMessage={mockGetLastMessage}
          getLastMessageTime={mockGetLastMessageTime}
        />
      </TestWrapper>
    )

    // Utility functions should not be called again due to memoization
    expect(mockGetLastMessage).not.toHaveBeenCalled()
    expect(mockGetLastMessageTime).not.toHaveBeenCalled()
  })
})
