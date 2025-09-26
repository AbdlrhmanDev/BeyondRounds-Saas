import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LoginPage from '@/app/auth/login/page'
import SignUpPage from '@/app/auth/sign-up/page'
import { AuthAPI } from '@/lib/api'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('@/lib/supabase/client')
jest.mock('@/hooks/features/auth/useAuthUser', () => ({
  useAuthUser: jest.fn(),
}))

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
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    resetPasswordForEmail: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
}

describe('Authentication System - Comprehensive Tests', () => {
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
  })

  describe('Login Page Tests', () => {
    test('renders login form with all required fields', () => {
      render(<LoginPage />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    test('validates email format', async () => {
      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      })
    })

    test('validates password presence', async () => {
      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
      })
    })

    test('handles successful login', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { first_name: 'Test', last_name: 'User' }
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null
      })

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

    test('handles login errors gracefully', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      })

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
      })
    })

    test('handles email not confirmed error', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Email not confirmed' }
      })

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/email not confirmed/i)).toBeInTheDocument()
      })
    })

    test('handles too many requests error', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Too many requests' }
      })

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/too many login attempts/i)).toBeInTheDocument()
      })
    })

    test('redirects to specified redirectTo parameter after login', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { first_name: 'Test', last_name: 'User' }
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null
      })

      // Mock URL with redirectTo parameter
      Object.defineProperty(window, 'location', {
        value: {
          search: '?redirectTo=/matches'
        },
        writable: true
      })

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/matches')
      })
    })
  })

  describe('Sign Up Page Tests', () => {
    test('renders sign up form with all required fields', () => {
      render(<SignUpPage />)
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
    })

    test('validates password confirmation match', async () => {
      render(<SignUpPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })

    test('validates password strength', async () => {
      render(<SignUpPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: '123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
    })

    test('handles successful sign up', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { first_name: 'Test', last_name: 'User' }
      }

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      })

      render(<SignUpPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        })
        expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      })
    })

    test('handles sign up errors', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' }
      })

      render(<SignUpPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/user already registered/i)).toBeInTheDocument()
      })
    })
  })

  describe('AuthAPI Tests', () => {
    let authAPI: AuthAPI

    beforeEach(() => {
      authAPI = new AuthAPI()
    })

    test('getCurrentUser returns user data', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await authAPI.getCurrentUser()
      expect(result).toEqual(mockUser)
    })

    test('getCurrentUser handles errors', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      })

      await expect(authAPI.getCurrentUser()).rejects.toThrow()
    })

    test('signIn calls Supabase auth', async () => {
      const mockData = { user: { id: 'user-123' }, session: { access_token: 'token' } }
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await authAPI.signIn('test@example.com', 'password123')
      expect(result).toEqual(mockData)
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    test('signOut calls Supabase auth', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null })

      await authAPI.signOut()
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled()
    })

    test('resetPassword calls Supabase auth', async () => {
      const mockData = { message: 'Password reset email sent' }
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: mockData,
        error: null
      })

      const result = await authAPI.resetPassword('test@example.com')
      expect(result).toEqual(mockData)
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com')
    })
  })

  describe('useAuthUser Hook Tests', () => {
    test('returns initial state correctly', () => {
      const mockReturn = {
        user: null,
        profile: null,
        isLoading: true,
        signOut: jest.fn(),
      }
      ;(useAuthUser as jest.Mock).mockReturnValue(mockReturn)

      expect(useAuthUser).toHaveBeenCalled()
      expect(useAuthUser).toHaveReturnedWith(mockReturn)
    })

    test('handles auth state changes', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockProfile = { id: 'profile-123', first_name: 'Test' }

      const mockReturn = {
        user: mockUser,
        profile: mockProfile,
        isLoading: false,
        signOut: jest.fn(),
      }
      ;(useAuthUser as jest.Mock).mockReturnValue(mockReturn)

      expect(useAuthUser).toHaveBeenCalled()
      expect(useAuthUser).toHaveReturnedWith(mockReturn)
      expect(mockReturn.profile).toEqual(mockProfile)
      expect(mockReturn.isLoading).toBe(false)
    })

    test('signOut function works correctly', async () => {
      const mockSignOut = jest.fn()
      const mockReturn = {
        user: { id: 'user-123' },
        profile: { id: 'profile-123' },
        isLoading: false,
        signOut: mockSignOut,
      }
      ;(useAuthUser as jest.Mock).mockReturnValue(mockReturn)

      expect(useAuthUser).toHaveBeenCalled()
      expect(useAuthUser).toHaveReturnedWith(mockReturn)
      await mockSignOut()
      expect(mockSignOut).toHaveBeenCalled()
    })
  })

  describe('Authentication Flow Integration Tests', () => {
    test('complete login flow with redirect', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { first_name: 'Test', last_name: 'User' }
      }

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null
      })

      // Mock authenticated state after login
      ;(useAuthUser as jest.Mock).mockReturnValue({
        user: mockUser,
        profile: { id: 'profile-123', onboarding_completed: true },
        isLoading: false,
        signOut: jest.fn(),
      })

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalled()
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

    test('handles network errors gracefully', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockRejectedValue(
        new Error('Network error')
      )

      render(<LoginPage />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/unable to sign in/i)).toBeInTheDocument()
      })
    })
  })
})

// Helper function for testing hooks
function renderHook(hook: () => any) {
  const result = { current: null }
  const TestComponent = () => {
    result.current = hook()
    return null
  }
  render(<TestComponent />)
  return result
}
