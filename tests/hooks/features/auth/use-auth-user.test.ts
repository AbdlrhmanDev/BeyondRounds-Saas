import { renderHook, act } from '@testing-library/react'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  }
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient
}))

describe('useAuthUser Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns initial loading state', () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    const { result } = renderHook(() => useAuthUser())

    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBeNull()
  })

  it('returns user when authenticated', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' }
    }

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const { result } = renderHook(() => useAuthUser())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('returns null user when not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    })

    const { result } = renderHook(() => useAuthUser())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('handles authentication errors', async () => {
    const mockError = new Error('Authentication failed')
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: mockError
    })

    const { result } = renderHook(() => useAuthUser())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(mockError)
  })

  it('sets up auth state change listener', () => {
    renderHook(() => useAuthUser())

    expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(
      expect.any(Function)
    )
  })

  it('updates user on auth state change', async () => {
    let authStateCallback: (event: string, session: any) => void

    mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    })

    const { result } = renderHook(() => useAuthUser())

    // Simulate sign in
    const mockUser = {
      id: '123',
      email: 'test@example.com'
    }

    await act(async () => {
      authStateCallback('SIGNED_IN', { user: mockUser })
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isLoading).toBe(false)
  })

  it('clears user on sign out', async () => {
    let authStateCallback: (event: string, session: any) => void

    mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    })

    const { result } = renderHook(() => useAuthUser())

    // First set a user
    const mockUser = { id: '123', email: 'test@example.com' }
    await act(async () => {
      authStateCallback('SIGNED_IN', { user: mockUser })
    })

    expect(result.current.user).toEqual(mockUser)

    // Then sign out
    await act(async () => {
      authStateCallback('SIGNED_OUT', { user: null })
    })

    expect(result.current.user).toBeNull()
  })

  it('unsubscribes from auth state changes on unmount', () => {
    const mockUnsubscribe = jest.fn()
    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    })

    const { unmount } = renderHook(() => useAuthUser())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('handles network errors gracefully', async () => {
    mockSupabaseClient.auth.getUser.mockRejectedValue(
      new Error('Network error')
    )

    const { result } = renderHook(() => useAuthUser())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toBe('Network error')
  })
})


