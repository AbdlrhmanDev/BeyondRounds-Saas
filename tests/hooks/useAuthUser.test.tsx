import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
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
    signInWithOAuth: jest.fn(),
    onAuthStateChange: jest.fn((callback?: (event: string, session: any) => void) => ({
      data: { subscription: { unsubscribe: jest.fn() } },
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
  })),
  rpc: jest.fn(),
}

jest.mock('@/lib/database/supabase-browser', () => ({
  createClient: () => mockSupabaseClient,
}))

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
}

const mockSession = {
  user: mockUser,
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
}

const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  bio: 'Test bio',
  specialty: 'Cardiology',
  experience_years: 5,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
}

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useAuthUser Hook Tests', () => {
  const mockPush = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
    })
  })

  describe('useAuthUser Hook', () => {
  it('should return initial loading state', () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      })

    const { result } = renderHook(() => useAuthUser(), {
        wrapper: createWrapper(),
      })

      expect(result.current.isLoading).toBe(true)
      expect(result.current.user).toBe(null)
      expect(result.current.profile).toBe(null)
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isAdmin).toBe(false)
    })

    it('should handle authenticated user with profile', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      })
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      } as any)

      const { result } = renderHook(() => useAuthUser(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.profile).toEqual(mockProfile)
        expect(result.current.isAuthenticated).toBe(true)
        expect(result.current.isAdmin).toBe(false)
      })
    })

    it('should handle admin user', async () => {
      const adminProfile = { ...mockProfile, role: 'admin' }
      
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      })
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: adminProfile,
          error: null,
        }),
      } as any)

      const { result } = renderHook(() => useAuthUser(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true)
      })
    })

    it('should handle auth state changes', async () => {
      let authStateCallback: any = null
      
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authStateCallback = callback
        return {
          data: { subscription: { unsubscribe: jest.fn() } },
        }
      })

      const { result } = renderHook(() => useAuthUser(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      // Simulate sign in
      await act(async () => {
        authStateCallback('SIGNED_IN', mockSession)
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.isAuthenticated).toBe(true)
      })

      // Simulate sign out
      await act(async () => {
        authStateCallback('SIGNED_OUT', null)
      })

      await waitFor(() => {
        expect(result.current.user).toBe(null)
        expect(result.current.isAuthenticated).toBe(false)
      })
    })

    it('should handle profile refresh', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      })
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      } as any)

      const { result } = renderHook(() => useAuthUser(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Update profile data
      const updatedProfile = { ...mockProfile, first_name: 'Updated' }
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedProfile,
          error: null,
        }),
      } as any)

      await act(async () => {
        await result.current.refreshProfile()
      })

      await waitFor(() => {
        expect(result.current.profile?.first_name).toBe('Updated')
      })
    })

    it('should handle sign out', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      })
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      } as any)
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      })

      const { result } = renderHook(() => useAuthUser(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      await act(async () => {
        await result.current.signOut()
      })

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('should handle profile fetch errors', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      })
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Profile not found' },
        }),
      } as any)

      const { result } = renderHook(() => useAuthUser(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      await waitFor(() => {
        expect(result.current.profile).toBe(null)
      })
    })
  })
})