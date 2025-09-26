/**
 * Authentication API functions
 * Handles user authentication, session management, and password operations
 */

import { createClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/utils/error'
import type { 
  AuthResult, 
  SignInResult, 
  SignUpResult, 
  PasswordResetResult,
  AuthUser,
  AuthSession 
} from '@/lib/types/auth'

/**
 * Base API class with common functionality
 */
class BaseAPI {
  protected supabase = createClient()

  protected handleError(error: unknown) {
    return handleSupabaseError(error)
  }
}

/**
 * Authentication API class
 */
export class AuthAPI extends BaseAPI {
  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get the current session
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        user: data.user || undefined,
        session: data.session || undefined,
        message: 'Successfully signed in',
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error).message,
      }
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string): Promise<SignUpResult> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        user: data.user || undefined,
        session: data.session || undefined,
        needsEmailVerification: !data.session,
        message: data.session ? 'Account created successfully' : 'Please check your email to verify your account',
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error).message,
      }
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signOut()
      
      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        message: 'Successfully signed out',
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error).message,
      }
    }
  }

  /**
   * Reset password for email
   */
  async resetPassword(email: string): Promise<PasswordResetResult> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email)
      
      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        emailSent: true,
        message: 'Password reset email sent',
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error).message,
      }
    }
  }

  /**
   * Update user password
   */
  async updatePassword(password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        password,
      })
      
      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        user: data.user || undefined,
        message: 'Password updated successfully',
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error).message,
      }
    }
  }

  /**
   * Refresh the current session
   */
  async refreshSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()
      
      if (error) throw error
      return data.session
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      })
      
      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        user: data.user || undefined,
        session: data.session || undefined,
        message: 'Email verified successfully',
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error).message,
      }
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email,
      })
      
      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        message: 'Verification email sent',
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error).message,
      }
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'github' | 'linkedin'): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        message: 'Redirecting to OAuth provider',
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error).message,
      }
    }
  }

  /**
   * Get user metadata
   */
  async getUserMetadata(): Promise<Record<string, unknown> | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error) throw error
      return user?.user_metadata || null
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(metadata: Record<string, unknown>): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        data: metadata,
      })
      
      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        user: data.user || undefined,
        message: 'User metadata updated successfully',
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error).message,
      }
    }
  }
}

// Export API instance
export const authAPI = new AuthAPI()
