import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  }
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

// Mock Next.js navigation
const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/dashboard',
}))

// Test component that uses auth
const AuthenticatedComponent = () => {
  const { user, isLoading, error } = useAuthUser()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!user) return <div>Not authenticated</div>

  return (
    <div>
      <h1>Welcome, {user.email}!</h1>
      <button onClick={() => mockSupabaseClient.auth.signOut()}>
        Sign Out
      </button>
    </div>
  )
}

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

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPush.mockClear()
    mockReplace.mockClear()
  })

  describe('Authentication State Management', () => {
    it('shows loading state initially', async () => {
      mockSupabaseClient.auth.getUser.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: { user: null }, error: null }), 100))
      )

      render(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows authenticated user when logged in', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      render(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument()
      })
    })

    it('shows not authenticated when user is null', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      render(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument()
      })
    })

    it('shows error when authentication fails', async () => {
      const mockError = new Error('Authentication failed')
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockError
      })

      render(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Error: Authentication failed')).toBeInTheDocument()
      })
    })
  })

  describe('Authentication State Changes', () => {
    it('updates UI when user signs in', async () => {
      let authStateCallback: (event: string, session: any) => void

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      render(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      // Initially not authenticated
      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument()
      })

      // Simulate sign in
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      }

      await act(async () => {
        authStateCallback('SIGNED_IN', { user: mockUser })
      })

      await waitFor(() => {
        expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument()
      })
    })

    it('updates UI when user signs out', async () => {
      let authStateCallback: (event: string, session: any) => void

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return { data: { subscription: { unsubscribe: jest.fn() } } }
      })

      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      render(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      // Initially authenticated
      await waitFor(() => {
        expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument()
      })

      // Simulate sign out
      await act(async () => {
        authStateCallback('SIGNED_OUT', { user: null })
      })

      await waitFor(() => {
        expect(screen.getByText('Not authenticated')).toBeInTheDocument()
      })
    })
  })

  describe('Protected Route Integration', () => {
    const ProtectedContent = () => <div>Protected content</div>

    it('redirects unauthenticated users to login', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })

      render(
        <TestWrapper>
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('shows protected content for authenticated users', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      render(
        <TestWrapper>
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Protected content')).toBeInTheDocument()
      })
    })

    it('shows loading state while checking authentication', () => {
      mockSupabaseClient.auth.getUser.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: { user: null }, error: null }), 100))
      )

      render(
        <TestWrapper>
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      )

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('handles authentication errors in protected routes', async () => {
      const mockError = new Error('Network error')
      mockSupabaseClient.auth.getUser.mockRejectedValue(mockError)

      render(
        <TestWrapper>
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </TestWrapper>
      )

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/auth/login')
      })
    })
  })

  describe('Sign Out Flow', () => {
    it('handles sign out successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null
      })

      render(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument()
      })

      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      fireEvent.click(signOutButton)

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })

    it('handles sign out errors', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const signOutError = new Error('Sign out failed')
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: signOutError
      })

      render(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument()
      })

      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      fireEvent.click(signOutButton)

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
      // In a real app, you might want to show an error message
    })
  })

  describe('Session Persistence', () => {
    it('maintains authentication state across component remounts', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const { unmount, rerender } = render(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument()
      })

      // Unmount and remount
      unmount()

      rerender(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument()
      })

      // Should have called getUser again
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(2)
    })
  })

  describe('Network Error Handling', () => {
    it('handles network errors gracefully', async () => {
      mockSupabaseClient.auth.getUser.mockRejectedValue(
        new Error('Network request failed')
      )

      render(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Error: Network request failed')).toBeInTheDocument()
      })
    })

    it('retries authentication after network recovery', async () => {
      // First call fails
      mockSupabaseClient.auth.getUser
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { user: { id: 'user-123', email: 'test@example.com' } },
          error: null
        })

      const { rerender } = render(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Error: Network error')).toBeInTheDocument()
      })

      // Simulate network recovery by re-rendering
      rerender(
        <TestWrapper>
          <AuthenticatedComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Welcome, test@example.com!')).toBeInTheDocument()
      })
    })
  })
})


