import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/auth/login/page'
import SignUpPage from '@/app/auth/sign-up/page'
import ForgotPasswordPage from '@/app/auth/forgot-password/page'
import ResetPasswordPage from '@/app/auth/reset-password/page'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { mockUser, mockSession, mockProfile } from '../__mocks__/supabase'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

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

describe('Authentication Flow Tests - Complete', () => {
  const mockPush = jest.fn()
  const mockReplace = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    })
  })

  describe('Login Page', () => {
    it('should render login form correctly', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      expect(screen.getByText('Sign in to BeyondRounds')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    })

    it('should have required form fields', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should allow typing in form fields', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('should have Google login button', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      const googleButton = screen.getByRole('button', { name: 'Continue with Google' })
      expect(googleButton).toBeInTheDocument()
    })

    it('should have navigation links', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      const signUpLink = screen.getByRole('link', { name: 'Create your account here' })
      const forgotPasswordLink = screen.getByRole('link', { name: 'Forgot your password?' })
      
      expect(signUpLink).toHaveAttribute('href', '/auth/sign-up')
      expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password')
    })
  })

  describe('Sign Up Page', () => {
    it('should render sign up form correctly', () => {
      render(<SignUpPage />, { wrapper: createWrapper() })
      
      expect(screen.getByText('Join BeyondRounds')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
    })

    it('should have required form fields', () => {
      render(<SignUpPage />, { wrapper: createWrapper() })
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should allow typing in form fields', () => {
      render(<SignUpPage />, { wrapper: createWrapper() })
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('should have login link', () => {
      render(<SignUpPage />, { wrapper: createWrapper() })
      
      const loginLink = screen.getByRole('link', { name: 'Sign in' })
      expect(loginLink).toHaveAttribute('href', '/auth/login')
    })
  })

  describe('Forgot Password Page', () => {
    it('should render forgot password form correctly', () => {
      render(<ForgotPasswordPage />, { wrapper: createWrapper() })
      
      expect(screen.getByText('Reset Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()
    })

    it('should have required email field', () => {
      render(<ForgotPasswordPage />, { wrapper: createWrapper() })
      
      const emailInput = screen.getByLabelText('Email address')
      
      expect(emailInput).toHaveAttribute('required')
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should allow typing in email field', () => {
      render(<ForgotPasswordPage />, { wrapper: createWrapper() })
      
      const emailInput = screen.getByLabelText('Email address')
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('should have back to login link', () => {
      render(<ForgotPasswordPage />, { wrapper: createWrapper() })
      
      const backToLoginLink = screen.getByRole('link', { name: 'Back to login' })
      expect(backToLoginLink).toHaveAttribute('href', '/auth/login')
    })
  })

  describe('Reset Password Page', () => {
    it('should render reset password form correctly', () => {
      render(<ResetPasswordPage />, { wrapper: createWrapper() })
      
      expect(screen.getByRole('heading', { name: 'Update Password' })).toBeInTheDocument()
      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Update Password' })).toBeInTheDocument()
    })

    it('should have required password fields', () => {
      render(<ResetPasswordPage />, { wrapper: createWrapper() })
      
      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      
      expect(newPasswordInput).toHaveAttribute('required')
      expect(confirmPasswordInput).toHaveAttribute('required')
      expect(newPasswordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    })

    it('should allow typing in password fields', () => {
      render(<ResetPasswordPage />, { wrapper: createWrapper() })
      
      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      
      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } })
      
      expect(newPasswordInput).toHaveValue('newpassword123')
      expect(confirmPasswordInput).toHaveValue('newpassword123')
    })
  })

  describe('Protected Route', () => {
    it('should render loading state initially', () => {
      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      )
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should redirect unauthenticated users to login', async () => {
      // Mock unauthenticated state
      const mockSupabaseClient = require('@/lib/supabase/client').createClient()
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      })

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login?redirectTo=')
        )
      })
    })

    it('should allow authenticated users to access protected content', async () => {
      // Mock authenticated state
      const mockSupabaseClient = require('@/lib/supabase/client').createClient()
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      })

      render(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
      })
    })

    it('should redirect non-admin users from admin routes', async () => {
      // Mock authenticated but non-admin state
      const mockSupabaseClient = require('@/lib/supabase/client').createClient()
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, role: 'user' },
          error: null,
        }),
      })

      render(
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should allow admin users to access admin routes', async () => {
      // Mock authenticated admin state
      const mockSupabaseClient = require('@/lib/supabase/client').createClient()
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockProfile, role: 'admin' },
          error: null,
        }),
      })

      render(
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Content</div>
        </ProtectedRoute>,
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(screen.getByText('Admin Content')).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    it('should show error for invalid email format', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      const emailInput = screen.getByLabelText('Email address')
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.blur(emailInput)
      
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should show error for empty required fields', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      
      expect(emailInput).toHaveAttribute('required')
      expect(passwordInput).toHaveAttribute('required')
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('should have proper button labels', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument()
    })

    it('should have proper headings', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      expect(screen.getByText('Sign in to BeyondRounds')).toBeInTheDocument()
    })
  })
})


