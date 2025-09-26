import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import LoginPage from '@/app/auth/login/page'
import SignUpPage from '@/app/auth/sign-up/page'
import ForgotPasswordPage from '@/app/auth/forgot-password/page'
import ResetPasswordPage from '@/app/auth/reset-password/page'

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

describe('Authentication Flow Tests - Working', () => {
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
  })

  describe('Form Interactions', () => {
    it('should allow typing in login form', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('should allow typing in sign up form', () => {
      render(<SignUpPage />, { wrapper: createWrapper() })
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })
      
      expect(emailInput).toHaveValue('test@example.com')
      expect(passwordInput).toHaveValue('password123')
    })

    it('should allow typing in forgot password form', () => {
      render(<ForgotPasswordPage />, { wrapper: createWrapper() })
      
      const emailInput = screen.getByLabelText('Email address')
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      
      expect(emailInput).toHaveValue('test@example.com')
    })

    it('should allow typing in reset password form', () => {
      render(<ResetPasswordPage />, { wrapper: createWrapper() })
      
      const newPasswordInput = screen.getByLabelText('New Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm New Password')
      
      fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } })
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } })
      
      expect(newPasswordInput).toHaveValue('newpassword123')
      expect(confirmPasswordInput).toHaveValue('newpassword123')
    })
  })

  describe('Navigation Links', () => {
    it('should have sign up link in login page', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      const signUpLink = screen.getByRole('link', { name: 'Create your account here' })
      expect(signUpLink).toHaveAttribute('href', '/auth/sign-up')
    })

    it('should have login link in sign up page', () => {
      render(<SignUpPage />, { wrapper: createWrapper() })
      
      const loginLink = screen.getByRole('link', { name: 'Sign in' })
      expect(loginLink).toHaveAttribute('href', '/auth/login')
    })

    it('should have forgot password link in login page', () => {
      render(<LoginPage />, { wrapper: createWrapper() })
      
      const forgotPasswordLink = screen.getByRole('link', { name: 'Forgot your password?' })
      expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password')
    })

    it('should have back to login link in forgot password page', () => {
      render(<ForgotPasswordPage />, { wrapper: createWrapper() })
      
      const backToLoginLink = screen.getByRole('link', { name: 'Back to login' })
      expect(backToLoginLink).toHaveAttribute('href', '/auth/login')
    })
  })
})


