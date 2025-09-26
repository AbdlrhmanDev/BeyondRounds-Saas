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

describe('Authentication Flow Tests', () => {
  const mockPush = jest.fn()
  const mockSearchParams = new URLSearchParams()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
    })
    ;(require('next/navigation').useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
  })

  describe('Login Page', () => {
    it('should render login form correctly', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      expect(screen.getByText('Sign in to BeyondRounds')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument()
    })

    it('should handle successful login', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
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
      } as any)

      render(<LoginPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should handle login with profile creation', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // Profile doesn't exist
        }),
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      } as any)

      render(<LoginPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(mockSupabaseClient.from().insert).toHaveBeenCalled()
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should handle login errors', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      })

      render(<LoginPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'wrongpassword' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
      })
    })

    it('should handle Google OAuth login', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: null,
      })

      render(<LoginPage />, { wrapper: createWrapper() })
      
      fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        })
      })
    })

    it('should redirect to specified page after login', async () => {
      mockSearchParams.set('redirectTo', '/profile')
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
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
      } as any)

      render(<LoginPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/profile')
      })
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

    it('should validate form fields', async () => {
      render(<SignUpPage />, { wrapper: createWrapper() })
      
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

      await waitFor(() => {
        // The form should show validation errors for required fields
        expect(screen.getByLabelText('Email address')).toHaveAttribute('required')
        expect(screen.getByLabelText('Password')).toHaveAttribute('required')
      })
    })

    it('should validate password match', async () => {
      render(<SignUpPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: 'different123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })

    it('should validate password length', async () => {
      render(<SignUpPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: '123' },
      })
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: '123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
      })
    })

    it('should handle successful sign up', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: { ...mockUser, email_confirmed_at: '2023-01-01T00:00:00Z' } },
        error: null,
      })
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      } as any)

      render(<SignUpPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('First Name'), {
        target: { value: 'John' },
      })
      fireEvent.change(screen.getByLabelText('Last Name'), {
        target: { value: 'Doe' },
      })
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'john@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByLabelText(/I agree to the/))

      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123',
          options: {
            data: {
              first_name: 'John',
              last_name: 'Doe',
            },
          },
        })
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should handle sign up with email confirmation', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: { ...mockUser, email_confirmed_at: null } },
        error: null,
      })
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      } as any)

      render(<SignUpPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('First Name'), {
        target: { value: 'John' },
      })
      fireEvent.change(screen.getByLabelText('Last Name'), {
        target: { value: 'Doe' },
      })
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'john@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.change(screen.getByLabelText('Confirm Password'), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByLabelText(/I agree to the/))

      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

      await waitFor(() => {
        expect(screen.getByText(/Please check your email/)).toBeInTheDocument()
      })
    })
  })

  describe('Forgot Password Page', () => {
    it('should render forgot password form correctly', () => {
      render(<ForgotPasswordPage />, { wrapper: createWrapper() })
      
      expect(screen.getByText('Reset Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument()
    })

    it('should handle successful password reset request', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: null,
      })

      render(<ForgotPasswordPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          {
            redirectTo: expect.stringContaining('/auth/reset-password'),
          }
        )
        expect(screen.getByText(/If an account with email/)).toBeInTheDocument()
      })
    })

    it('should handle password reset errors', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'Email not found' },
      })

      render(<ForgotPasswordPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'nonexistent@example.com' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(screen.getByText('Email not found')).toBeInTheDocument()
      })
    })
  })

  describe('Reset Password Page', () => {
    it('should render reset password form correctly', () => {
      render(<ResetPasswordPage />, { wrapper: createWrapper() })
      
      expect(screen.getByText('Update Password')).toBeInTheDocument()
      expect(screen.getByLabelText('New Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Update Password' })).toBeInTheDocument()
    })

    it('should validate password match', async () => {
      render(<ResetPasswordPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('New Password'), {
        target: { value: 'newpassword123' },
      })
      fireEvent.change(screen.getByLabelText('Confirm New Password'), {
        target: { value: 'different123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Update Password' }))

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })

    it('should validate password length', async () => {
      render(<ResetPasswordPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('New Password'), {
        target: { value: '123' },
      })
      fireEvent.change(screen.getByLabelText('Confirm New Password'), {
        target: { value: '123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Update Password' }))

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
      })
    })

    it('should handle successful password update', async () => {
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      render(<ResetPasswordPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('New Password'), {
        target: { value: 'newpassword123' },
      })
      fireEvent.change(screen.getByLabelText('Confirm New Password'), {
        target: { value: 'newpassword123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Update Password' }))

      await waitFor(() => {
        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          password: 'newpassword123',
        })
        expect(screen.getByText('Password updated successfully! Redirecting...')).toBeInTheDocument()
      })
    })
  })

  describe('Protected Route', () => {
    it('should redirect unauthenticated users to login', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
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
          data: { ...mockProfile, role: 'user' },
          error: null,
        }),
      } as any)

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
          data: { ...mockProfile, role: 'admin' },
          error: null,
        }),
      } as any)

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
})
