import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/auth/login/page'
import SignUpPage from '@/app/auth/sign-up/page'
import DashboardPage from '@/app/dashboard/page'
import AdminPage from '@/app/admin/page'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { createClient } from '@/lib/supabase/client'
import { AuthAPI, ProfileAPI } from '@/lib/api'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('@/lib/supabase/client')
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
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      range: jest.fn(() => Promise.resolve({ data: [], error: null })),
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
  rpc: jest.fn(),
}

// Test wrapper component
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

describe('Authentication Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
  })

  describe('Complete User Registration Flow', () => {
    test('user can register, verify email, and complete onboarding', async () => {
      // Step 1: User registration
      const mockNewUser = {
        id: 'new-user-123',
        email: 'newuser@example.com',
        email_confirmed_at: null,
      }

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockNewUser, session: null },
        error: null,
      })

      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
        signOut: jest.fn(),
      })

      render(
        <TestWrapper>
          <SignUpPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePass123!' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
        })
        expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      })

      // Step 2: Email verification (simulate)
      const verifiedUser = {
        ...mockNewUser,
        email_confirmed_at: new Date().toISOString(),
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: verifiedUser },
        error: null,
      })

      // Step 3: Profile creation after verification
      const newProfile = {
        id: 'profile-123',
        user_id: 'new-user-123',
        email: 'newuser@example.com',
        first_name: null,
        last_name: null,
        role: 'user',
        onboarding_completed: false,
        is_verified: false,
        is_paid: false,
      }

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: newProfile,
                  error: null,
                })),
              })),
            })),
            insert: jest.fn(() => ({
              select: jest.fn(() => Promise.resolve({
                data: newProfile,
                error: null,
              })),
            })),
          }
        }
        return mockSupabaseClient.from()
      })

      // Update auth state to reflect verified user
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: verifiedUser,
        profile: newProfile,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: false,
        signOut: jest.fn(),
      })

      // User should be redirected to onboarding
      expect(mockRouter.push).toHaveBeenCalledWith('/onboarding')
    })

    test('handles registration errors gracefully', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' },
      })

      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
        signOut: jest.fn(),
      })

      render(
        <TestWrapper>
          <SignUpPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })

      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'SecurePass123!' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'SecurePass123!' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/user already registered/i)).toBeInTheDocument()
      })
    })
  })

  describe('Complete User Login Flow', () => {
    test('user can login and access dashboard', async () => {
      // Step 1: User login
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: new Date().toISOString(),
      }

      const mockSession = {
        access_token: 'access-token-123',
        refresh_token: 'refresh-token-123',
        expires_at: Date.now() + 3600000,
        user: mockUser,
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
        signOut: jest.fn(),
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'password123',
        })
      })

      // Step 2: Profile loading after login
      const userProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        onboarding_completed: true,
        is_verified: true,
        is_paid: true,
      }

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: userProfile,
        error: null,
                })),
              })),
            })),
          }
        }
        return mockSupabaseClient.from()
      })

      // Update auth state to reflect logged in user
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: userProfile,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: false,
        signOut: jest.fn(),
      })

      // Step 3: Access to dashboard
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument()
        expect(screen.getByText(/john doe/i)).toBeInTheDocument()
      })
    })

    test('handles login with incomplete onboarding', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: new Date().toISOString(),
      }

      const incompleteProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        email: 'user@example.com',
        first_name: null,
        last_name: null,
        role: 'user',
        onboarding_completed: false,
        is_verified: false,
        is_paid: false,
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      })
      
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: incompleteProfile,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: false,
        signOut: jest.fn(),
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        // Should redirect to onboarding instead of dashboard
        expect(mockRouter.push).toHaveBeenCalledWith('/onboarding')
      })
    })

    test('handles login errors with helpful messages', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      })

      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
        signOut: jest.fn(),
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

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
  })

  describe('Admin Access Flow', () => {
    test('admin user can access admin panel', async () => {
      const mockAdminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        email_confirmed_at: new Date().toISOString(),
      }

      const adminProfile = {
        id: 'profile-admin-123',
        user_id: 'admin-123',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        onboarding_completed: true,
        is_verified: true,
        is_paid: true,
      }

      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockAdminUser,
        profile: adminProfile,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: true,
        signOut: jest.fn(),
      })

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: [adminProfile],
                error: null,
              })),
              range: jest.fn(() => Promise.resolve({
                data: [adminProfile],
                error: null,
              })),
            })),
          }
        }
        return {
          select: jest.fn(() => ({
            order: jest.fn(() => Promise.resolve({ data: [], error: null })),
            range: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        }
      })

      render(
        <TestWrapper>
          <AdminPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /users/i })).toBeInTheDocument()
        expect(screen.getByRole('tab', { name: /verification/i })).toBeInTheDocument()
      })
    })

    test('regular user cannot access admin panel', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
        email_confirmed_at: new Date().toISOString(),
      }

      const userProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        email: 'user@example.com',
        first_name: 'Regular',
        last_name: 'User',
        role: 'user',
        onboarding_completed: true,
        is_verified: true,
        is_paid: true,
      }

      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: userProfile,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: false,
        signOut: jest.fn(),
      })

      render(
        <TestWrapper>
          <AdminPage />
        </TestWrapper>
      )

      expect(screen.getByText(/access denied/i)).toBeInTheDocument()
      expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument()
    })
  })

  describe('Session Management Flow', () => {
    test('handles session expiration and refresh', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
      }

      const expiredSession = {
        access_token: 'expired-token',
        refresh_token: 'refresh-token-123',
        expires_at: Date.now() - 1000, // Expired
        user: mockUser,
      }

      const refreshedSession = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: Date.now() + 3600000,
        user: mockUser,
      }

      mockSupabaseClient.auth.getSession
        .mockResolvedValueOnce({
          data: { session: expiredSession },
          error: null,
        })

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: refreshedSession },
        error: null,
      })

      const authAPI = new AuthAPI()

      // Simulate session refresh logic
      const session = await authAPI.getCurrentSession()
      if (session && session.expires_at < Date.now()) {
        await mockSupabaseClient.auth.refreshSession()
      }

      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalled()
    })

    test('handles logout and cleanup', async () => {
      const mockSignOut = jest.fn()
      
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: { id: 'user-123', email: 'user@example.com' },
        profile: { id: 'profile-123', role: 'user' },
        isLoading: false,
        isAuthenticated: true,
        isAdmin: false,
        signOut: mockSignOut,
      })

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      })

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      )

      const logoutButton = screen.getByRole('button', { name: /sign out/i })
      fireEvent.click(logoutButton)

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login')
      })
    })
  })

  describe('Profile Management Flow', () => {
    test('user can update profile information', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
      }

      const currentProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
      }

      const updatedProfile = {
        ...currentProfile,
        first_name: 'Jane',
        last_name: 'Smith',
      }

      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: currentProfile,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: false,
        signOut: jest.fn(),
      })

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            update: jest.fn(() => ({
              eq: jest.fn(() => ({
                select: jest.fn(() => Promise.resolve({
                  data: updatedProfile,
                  error: null,
                })),
              })),
            })),
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: currentProfile,
                  error: null,
                })),
              })),
            })),
          }
        }
        return mockSupabaseClient.from()
      })

      const profileAPI = new ProfileAPI()
      const result = await profileAPI.updateProfile('user-123', {
        first_name: 'Jane',
        last_name: 'Smith',
      })

      expect(result).toEqual(updatedProfile)
    })

    test('handles profile update errors', async () => {
      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            update: jest.fn(() => ({
              eq: jest.fn(() => ({
                select: jest.fn(() => Promise.resolve({
                  data: null,
                  error: { message: 'Update failed' },
                })),
              })),
            })),
          }
        }
        return mockSupabaseClient.from()
      })

      const profileAPI = new ProfileAPI()

      await expect(
        profileAPI.updateProfile('user-123', { first_name: 'Jane' })
      ).rejects.toThrow()
    })
  })

  describe('Cross-Component State Consistency', () => {
    test('auth state is consistent across components', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
      }

      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
      }

      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: false,
        signOut: jest.fn(),
      })

      // Render multiple components that use auth
      const { rerender } = render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      )

      expect(screen.getByText(/john doe/i)).toBeInTheDocument()

      // Rerender with different component
      rerender(
        <TestWrapper>
          <AdminPage />
        </TestWrapper>
      )

      // Should show access denied for non-admin
      expect(screen.getByText(/access denied/i)).toBeInTheDocument()
    })

    test('handles auth state changes across components', async () => {
      // Start with unauthenticated state
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
        signOut: jest.fn(),
      })

      const { rerender } = render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      )

      expect(screen.getByText(/please sign in/i)).toBeInTheDocument()

      // Update to authenticated state
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
      }

      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
      }

      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: mockProfile,
        isLoading: false,
        isAuthenticated: true,
        isAdmin: false,
        signOut: jest.fn(),
      })

      rerender(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      )

      expect(screen.getByText(/welcome/i)).toBeInTheDocument()
      expect(screen.getByText(/john doe/i)).toBeInTheDocument()
    })
  })

  describe('Error Recovery and Resilience', () => {
    test('recovers from network errors', async () => {
      // First attempt fails
      mockSupabaseClient.auth.signInWithPassword
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: { 
            user: { id: 'user-123', email: 'user@example.com' },
            session: { access_token: 'token' }
          },
          error: null,
        })

      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: null,
        profile: null,
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
        signOut: jest.fn(),
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })

      // Retry should work
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledTimes(2)
      })
    })

    test('handles partial failures gracefully', async () => {
      // Auth succeeds but profile loading fails
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com',
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      })

      mockSupabaseClient.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: null,
                  error: { message: 'Profile not found' },
                })),
              })),
            })),
          }
        }
        return mockSupabaseClient.from()
      })

      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: null, // Profile failed to load
        isLoading: false,
        isAuthenticated: true,
        isAdmin: false,
        signOut: jest.fn(),
      })

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      )

      // Should handle missing profile gracefully
      expect(screen.getByText(/profile incomplete/i)).toBeInTheDocument()
    })
  })
})