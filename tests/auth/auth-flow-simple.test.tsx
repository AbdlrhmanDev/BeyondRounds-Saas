import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/auth/login/page'
import SignUpPage from '@/app/auth/sign-up/page'
import ForgotPasswordPage from '@/app/auth/forgot-password/page'
import ResetPasswordPage from '@/app/auth/reset-password/page'
import { mockUser, mockSession, mockProfile } from '../__mocks__/supabase'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(() => Promise.resolve({ 
      data: { user: mockUser }, 
      error: null 
    })),
    getSession: jest.fn(() => Promise.resolve({ 
      data: { session: mockSession }, 
      error: null 
    })),
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

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

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

describe('Authentication Flow Tests - Fixed', () => {
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

    it('should handle successful login', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
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

    it('should handle successful sign up', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: { ...mockUser, email_confirmed_at: '2023-01-01T00:00:00Z' } },
        error: null,
      })
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      render(<SignUpPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            emailRedirectTo: expect.stringContaining('/auth/callback'),
          },
        })
      })
    })

    it('should handle sign up with email confirmation', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      render(<SignUpPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Create Account' }))

      await waitFor(() => {
        expect(screen.getByText('Check your email to confirm your account.')).toBeInTheDocument()
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

    it('should handle password reset request', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      })

      render(<ForgotPasswordPage />, { wrapper: createWrapper() })
      
      fireEvent.change(screen.getByLabelText('Email address'), {
        target: { value: 'test@example.com' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }))

      await waitFor(() => {
        expect(screen.getByText(/If an account with email test@example.com exists/)).toBeInTheDocument()
      })
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
  })
})


