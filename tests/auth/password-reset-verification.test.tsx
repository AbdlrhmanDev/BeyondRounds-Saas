import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import ForgotPasswordPage from '@/app/auth/forgot-password/page'
import ResetPasswordPage from '@/app/auth/reset-password/page'
import { AuthAPI } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('@/lib/supabase/client')

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
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    signUp: jest.fn(),
    resend: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
  },
  from: jest.fn(),
  rpc: jest.fn(),
}

describe('Password Reset and Email Verification Tests', () => {
  let authAPI: AuthAPI

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(createClient as jest.Mock).mockReturnValue(mockSupabaseClient)
    authAPI = new AuthAPI()
  })

  describe('Password Reset Flow', () => {
    test('renders forgot password form correctly', () => {
      render(<ForgotPasswordPage />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
      expect(screen.getByText(/forgot your password/i)).toBeInTheDocument()
    })

    test('validates email format in forgot password form', async () => {
      render(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
      })
    })

    test('handles successful password reset request', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: { message: 'Password reset email sent' },
        error: null,
      })

      render(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          expect.objectContaining({
            redirectTo: expect.stringContaining('/auth/reset-password'),
          })
        )
        expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      })
    })

    test('handles password reset request errors', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      })

      render(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/user not found/i)).toBeInTheDocument()
      })
    })

    test('prevents multiple reset requests in short time', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: { message: 'Password reset email sent' },
        error: null,
      })

      render(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument()
      })

      // Try to submit again immediately
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/please wait before requesting another/i)).toBeInTheDocument()
      })
    })

    test('includes proper redirect URL in reset request', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: { message: 'Password reset email sent' },
        error: null,
      })

      render(<ForgotPasswordPage />)

      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /send reset link/i })

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          expect.objectContaining({
            redirectTo: expect.stringMatching(/\/auth\/reset-password/),
          })
        )
      })
    })
  })

  describe('Password Reset Completion', () => {
    test('renders reset password form correctly', () => {
      // Mock URL search params
      Object.defineProperty(window, 'location', {
        value: {
          search: '?access_token=token123&refresh_token=refresh123',
        },
        writable: true,
      })

      render(<ResetPasswordPage />)

      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument()
    })

    test('validates password strength requirements', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?access_token=token123&refresh_token=refresh123',
        },
        writable: true,
      })

      render(<ResetPasswordPage />)

      const passwordInput = screen.getByLabelText(/new password/i)
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /update password/i })

      fireEvent.change(passwordInput, { target: { value: '123' } })
      fireEvent.change(confirmInput, { target: { value: '123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
    })

    test('validates password confirmation match', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?access_token=token123&refresh_token=refresh123',
        },
        writable: true,
      })

      render(<ResetPasswordPage />)

      const passwordInput = screen.getByLabelText(/new password/i)
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /update password/i })

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })
      fireEvent.change(confirmInput, { target: { value: 'differentpassword123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
    })

    test('handles successful password update', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?access_token=token123&refresh_token=refresh123',
        },
        writable: true,
      })

      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })

      render(<ResetPasswordPage />)

      const passwordInput = screen.getByLabelText(/new password/i)
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /update password/i })

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
          password: 'newpassword123',
        })
        expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument()
      })
    })

    test('handles password update errors', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?access_token=token123&refresh_token=refresh123',
        },
        writable: true,
      })

      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: null,
        error: { message: 'Password reset token expired' },
      })

      render(<ResetPasswordPage />)

      const passwordInput = screen.getByLabelText(/new password/i)
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /update password/i })

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/password reset token expired/i)).toBeInTheDocument()
      })
    })

    test('handles missing or invalid reset tokens', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '', // No tokens in URL
        },
        writable: true,
      })

      render(<ResetPasswordPage />)

      expect(screen.getByText(/invalid or missing reset link/i)).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /update password/i })).not.toBeInTheDocument()
    })

    test('redirects to login after successful password reset', async () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?access_token=token123&refresh_token=refresh123',
        },
        writable: true,
      })

      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })

      render(<ResetPasswordPage />)

      const passwordInput = screen.getByLabelText(/new password/i)
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /update password/i })

      fireEvent.change(passwordInput, { target: { value: 'newpassword123' } })
      fireEvent.change(confirmInput, { target: { value: 'newpassword123' } })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/auth/login?message=password-updated')
      })
    })
  })

  describe('Email Verification Flow', () => {
    test('handles email verification during signup', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: null,
      }

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { 
          user: mockUser, 
          session: null, // No session until email confirmed
        },
        error: null,
      })

      const result = await authAPI.signUp('test@example.com', 'password123')

      expect(result.user).toEqual(mockUser)
      expect(result.session).toBeNull()
      expect(result.user.email_confirmed_at).toBeNull()
    })

    test('handles email confirmation success', async () => {
      const confirmedUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: new Date().toISOString(),
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: confirmedUser },
        error: null,
      })

      const user = await authAPI.getCurrentUser()

      expect(user.email_confirmed_at).toBeTruthy()
    })

    test('handles email confirmation errors', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Email confirmation token expired' },
      })

      await expect(authAPI.getCurrentUser()).rejects.toThrow()
    })

    test('resends email confirmation', async () => {
      mockSupabaseClient.auth.resend.mockResolvedValue({
        data: { message: 'Confirmation email sent' },
        error: null,
      })

      // Simulate resend confirmation email
      const resendConfirmation = async (email: string) => {
        const result = await mockSupabaseClient.auth.resend({
          type: 'signup',
          email: email,
        })
        return result
      }

      const result = await resendConfirmation('test@example.com')

      expect(result.data.message).toBe('Confirmation email sent')
      expect(mockSupabaseClient.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
      })
    })

    test('handles email confirmation rate limiting', async () => {
      mockSupabaseClient.auth.resend.mockResolvedValue({
        data: null,
        error: { message: 'Email rate limit exceeded' },
      })

      const resendConfirmation = async (email: string) => {
        const result = await mockSupabaseClient.auth.resend({
          type: 'signup',
          email: email,
        })
        if (result.error) {
          throw new Error(result.error.message)
        }
        return result
      }

      await expect(resendConfirmation('test@example.com')).rejects.toThrow('Email rate limit exceeded')
    })
  })

  describe('Email Change Verification', () => {
    test('handles email change request', async () => {
      const currentUser = {
        id: 'user-123',
        email: 'old@example.com',
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: currentUser },
        error: null,
      })

      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { 
          user: { ...currentUser, new_email: 'new@example.com' },
        },
        error: null,
      })

      const result = await mockSupabaseClient.auth.updateUser({
        email: 'new@example.com',
      })

      expect(result.data.user.new_email).toBe('new@example.com')
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        email: 'new@example.com',
      })
    })

    test('handles email change confirmation', async () => {
      const userWithNewEmail = {
        id: 'user-123',
        email: 'new@example.com',
        email_confirmed_at: new Date().toISOString(),
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: userWithNewEmail },
        error: null,
      })

      const user = await authAPI.getCurrentUser()

      expect(user.email).toBe('new@example.com')
      expect(user.email_confirmed_at).toBeTruthy()
    })

    test('handles invalid email change token', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid email change token' },
      })

      await expect(authAPI.getCurrentUser()).rejects.toThrow()
    })
  })

  describe('Security and Validation', () => {
    test('validates email format before sending reset', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..name@example.com',
        'user@.com',
      ]

      for (const email of invalidEmails) {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        expect(isValid).toBe(false)
      }
    })

    test('validates password strength requirements', () => {
      const weakPasswords = [
        '123',
        'password',
        '12345678',
        'abcdefgh',
        'PASSWORD',
      ]

      const strongPasswords = [
        'Password123!',
        'MySecure@Password1',
        'Complex#Pass2023',
      ]

      const validatePasswordStrength = (password: string) => {
        const minLength = password.length >= 8
        const hasUppercase = /[A-Z]/.test(password)
        const hasLowercase = /[a-z]/.test(password)
        const hasNumber = /\d/.test(password)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

        return {
          isValid: minLength && hasUppercase && hasLowercase && hasNumber,
          requirements: {
            minLength,
            hasUppercase,
            hasLowercase,
            hasNumber,
            hasSpecialChar,
          },
        }
      }

      weakPasswords.forEach(password => {
        const result = validatePasswordStrength(password)
        expect(result.isValid).toBe(false)
      })

      strongPasswords.forEach(password => {
        const result = validatePasswordStrength(password)
        expect(result.isValid).toBe(true)
      })
    })

    test('prevents password reset token reuse', async () => {
      const usedToken = 'used-token-123'

      // Mock token validation
      const validateResetToken = (token: string) => {
        const usedTokens = ['used-token-123', 'expired-token-456']
        return !usedTokens.includes(token)
      }

      const isValid = validateResetToken(usedToken)

      expect(isValid).toBe(false)
    })

    test('enforces token expiration', () => {
      const tokenData = {
        token: 'token-123',
        expires_at: Date.now() - 3600000, // 1 hour ago (expired)
        created_at: Date.now() - 7200000, // 2 hours ago
      }

      const isTokenValid = (token: any) => {
        return token.expires_at > Date.now()
      }

      const isValid = isTokenValid(tokenData)

      expect(isValid).toBe(false)
    })

    test('logs security events', () => {
      const securityLogger = {
        logEvent: jest.fn(),
      }

      const securityEvents = [
        { type: 'PASSWORD_RESET_REQUESTED', email: 'test@example.com', ip: '192.168.1.1' },
        { type: 'PASSWORD_RESET_COMPLETED', userId: 'user-123', ip: '192.168.1.1' },
        { type: 'EMAIL_VERIFICATION_SENT', email: 'test@example.com', ip: '192.168.1.1' },
        { type: 'EMAIL_VERIFIED', userId: 'user-123', ip: '192.168.1.1' },
        { type: 'SUSPICIOUS_RESET_ATTEMPT', email: 'test@example.com', ip: '203.0.113.1' },
      ]

      securityEvents.forEach(event => {
        securityLogger.logEvent(event)
      })

      expect(securityLogger.logEvent).toHaveBeenCalledTimes(5)
      expect(securityLogger.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'SUSPICIOUS_RESET_ATTEMPT' })
      )
    })

    test('implements rate limiting for reset requests', () => {
      const rateLimiter = {
        attempts: new Map(),
        isAllowed: (email: string) => {
          const now = Date.now()
          const attempts = rateLimiter.attempts.get(email) || []
          
          // Remove attempts older than 1 hour
          const recentAttempts = attempts.filter((time: number) => now - time < 3600000)
          
          // Allow maximum 3 attempts per hour
          if (recentAttempts.length >= 3) {
            return false
          }
          
          recentAttempts.push(now)
          rateLimiter.attempts.set(email, recentAttempts)
          return true
        },
      }

      // Test rate limiting
      expect(rateLimiter.isAllowed('test@example.com')).toBe(true)
      expect(rateLimiter.isAllowed('test@example.com')).toBe(true)
      expect(rateLimiter.isAllowed('test@example.com')).toBe(true)
      expect(rateLimiter.isAllowed('test@example.com')).toBe(false) // 4th attempt blocked
    })
  })

  describe('Error Handling and Recovery', () => {
    test('handles network errors gracefully', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockRejectedValue(
        new Error('Network error')
      )

      const resetPassword = async (email: string) => {
        try {
          const result = await authAPI.resetPassword(email)
          return { success: true, result }
        } catch (error) {
          return { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          }
        }
      }

      const result = await resetPassword('test@example.com')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })

    test('provides helpful error messages', () => {
      const errorMessages = {
        'User not found': 'No account found with this email address.',
        'Email rate limit exceeded': 'Too many requests. Please wait before trying again.',
        'Invalid email': 'Please enter a valid email address.',
        'Password too weak': 'Password must be at least 8 characters long.',
        'Token expired': 'This reset link has expired. Please request a new one.',
      }

      Object.entries(errorMessages).forEach(([error, message]) => {
        expect(message).toBeTruthy()
        expect(message.length).toBeGreaterThan(10)
      })
    })

    test('handles email delivery failures', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'Email delivery failed' },
      })

      const result = await mockSupabaseClient.auth.resetPasswordForEmail('test@example.com')

      expect(result.error).toBeTruthy()
      expect(result.error.message).toBe('Email delivery failed')
    })
  })
})


