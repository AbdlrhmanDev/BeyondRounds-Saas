import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserDashboard } from '@/components/features/dashboard/UserDashboard'

// Mock the hooks and dependencies
jest.mock('@/hooks/features/dashboard/useDashboard', () => ({
  useDashboard: () => ({
    user: {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      profile_completion: 85
    },
    stats: {
      totalMatches: 12,
      activeGroups: 3,
      messagesReceived: 45,
      profileViews: 28
    },
    recentActivity: [
      {
        id: '1',
        type: 'match',
        message: 'New match found!',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'message',
        message: 'You received a new message',
        timestamp: new Date().toISOString()
      }
    ],
    isLoading: false,
    error: null
  })
}))

jest.mock('@/hooks/features/auth/useAuthUser', () => ({
  useAuthUser: () => ({
    user: {
      id: '1',
      email: 'john@example.com'
    },
    isLoading: false
  })
}))

describe('UserDashboard Component', () => {
  it('renders dashboard with user information', () => {
    render(<UserDashboard />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('displays dashboard statistics', () => {
    render(<UserDashboard />)
    
    expect(screen.getByText('12')).toBeInTheDocument() // totalMatches
    expect(screen.getByText('3')).toBeInTheDocument() // activeGroups
    expect(screen.getByText('45')).toBeInTheDocument() // messagesReceived
    expect(screen.getByText('28')).toBeInTheDocument() // profileViews
  })

  it('shows profile completion percentage', () => {
    render(<UserDashboard />)
    
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText(/profile completion/i)).toBeInTheDocument()
  })

  it('displays recent activity', () => {
    render(<UserDashboard />)
    
    expect(screen.getByText('New match found!')).toBeInTheDocument()
    expect(screen.getByText('You received a new message')).toBeInTheDocument()
  })

  it('renders quick action buttons', () => {
    render(<UserDashboard />)
    
    expect(screen.getByRole('button', { name: /view matches/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view messages/i })).toBeInTheDocument()
  })

  it('handles quick action button clicks', () => {
    const mockPush = jest.fn()
    jest.mocked(require('next/navigation').useRouter).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })

    render(<UserDashboard />)
    
    fireEvent.click(screen.getByRole('button', { name: /view matches/i }))
    expect(mockPush).toHaveBeenCalledWith('/matches')
    
    fireEvent.click(screen.getByRole('button', { name: /edit profile/i }))
    expect(mockPush).toHaveBeenCalledWith('/profile')
  })

  it('shows loading state', () => {
    jest.mocked(require('@/hooks/features/dashboard/useDashboard')).useDashboard.mockReturnValue({
      user: null,
      stats: null,
      recentActivity: [],
      isLoading: true,
      error: null
    })

    render(<UserDashboard />)
    
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows error state', () => {
    jest.mocked(require('@/hooks/features/dashboard/useDashboard')).useDashboard.mockReturnValue({
      user: null,
      stats: null,
      recentActivity: [],
      isLoading: false,
      error: 'Failed to load dashboard'
    })

    render(<UserDashboard />)
    
    expect(screen.getByText(/failed to load dashboard/i)).toBeInTheDocument()
  })

  it('renders with empty activity list', () => {
    jest.mocked(require('@/hooks/features/dashboard/useDashboard')).useDashboard.mockReturnValue({
      user: { id: '1', name: 'John Doe', email: 'john@example.com', profile_completion: 85 },
      stats: { totalMatches: 0, activeGroups: 0, messagesReceived: 0, profileViews: 0 },
      recentActivity: [],
      isLoading: false,
      error: null
    })

    render(<UserDashboard />)
    
    expect(screen.getByText(/no recent activity/i)).toBeInTheDocument()
  })
})


