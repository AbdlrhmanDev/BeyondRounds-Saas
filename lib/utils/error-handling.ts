import React from 'react'
import { SupabaseError } from '@/lib/types'

/**
 * Enhanced error handling utilities for Supabase operations
 */

export class SupabaseErrorHandler {
  /**
   * Handles Supabase errors and returns user-friendly messages
   */
  static handleError(error: any): string {
    if (!error) return 'An unexpected error occurred'

    // Handle Supabase specific errors
    if (error.code) {
      switch (error.code) {
        case '23505': // Unique constraint violation
          return 'This item already exists. Please try again.'
        case '23503': // Foreign key constraint violation
          return 'Cannot perform this action due to related data constraints.'
        case '42501': // Insufficient privilege
          return 'You do not have permission to perform this action.'
        case 'PGRST116': // Row level security policy violation
          return 'Access denied. You do not have permission to view this data.'
        case 'PGRST301': // JWT expired
          return 'Your session has expired. Please log in again.'
        default:
          return error.message || 'A database error occurred'
      }
    }

    // Handle network errors
    if (error.message?.includes('fetch')) {
      return 'Network error. Please check your connection and try again.'
    }

    // Handle authentication errors
    if (error.message?.includes('auth')) {
      return 'Authentication error. Please log in again.'
    }

    // Return the original message if it's user-friendly
    if (error.message && error.message.length < 100) {
      return error.message
    }

    // Default fallback
    return 'An unexpected error occurred. Please try again.'
  }

  /**
   * Logs errors for debugging and monitoring
   */
  static logError(error: any, context?: string) {
    const errorInfo = {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Supabase Error:', errorInfo)
    }

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Add Sentry or similar error logging service
      console.error('Production Supabase Error:', errorInfo)
    }
  }

  /**
   * Creates a standardized error response
   */
  static createErrorResponse(error: any, context?: string) {
    const userMessage = this.handleError(error)
    this.logError(error, context)

    return {
      success: false,
      error: userMessage,
      details: process.env.NODE_ENV === 'development' ? error : undefined,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Utility function to safely execute Supabase operations
 */
export async function safeSupabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  context?: string
): Promise<{ data: T | null; error: string | null }> {
  try {
    const result = await operation()
    
    if (result.error) {
      const errorMessage = SupabaseErrorHandler.handleError(result.error)
      SupabaseErrorHandler.logError(result.error, context)
      return { data: null, error: errorMessage }
    }

    return { data: result.data, error: null }
  } catch (error) {
    const errorMessage = SupabaseErrorHandler.handleError(error)
    SupabaseErrorHandler.logError(error, context)
    return { data: null, error: errorMessage }
  }
}

/**
 * Hook for handling async operations with error states
 */
export function useAsyncOperation<T>() {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const execute = async (operation: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await operation()
      return result
    } catch (err) {
      const errorMessage = SupabaseErrorHandler.handleError(err)
      setError(errorMessage)
      SupabaseErrorHandler.logError(err, 'useAsyncOperation')
      return null
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setError(null)
    setLoading(false)
  }

  return { execute, loading, error, reset }
}

/**
 * Error types for better type safety
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  message: string
  code?: string
  details?: any
  timestamp: string
}

/**
 * Creates a standardized application error
 */
export function createAppError(
  type: ErrorType,
  message: string,
  code?: string,
  details?: any
): AppError {
  return {
    type,
    message,
    code,
    details,
    timestamp: new Date().toISOString()
  }
}

/**
 * Determines error type from Supabase error
 */
export function getErrorType(error: any): ErrorType {
  if (!error) return ErrorType.UNKNOWN

  if (error.message?.includes('fetch') || error.message?.includes('network')) {
    return ErrorType.NETWORK
  }

  if (error.message?.includes('auth') || error.code === 'PGRST301') {
    return ErrorType.AUTHENTICATION
  }

  if (error.code === '42501' || error.code === 'PGRST116') {
    return ErrorType.AUTHORIZATION
  }

  if (error.code?.startsWith('23')) {
    return ErrorType.VALIDATION
  }

  if (error.code?.startsWith('PGRST') || error.code?.startsWith('PGR')) {
    return ErrorType.DATABASE
  }

  return ErrorType.UNKNOWN
}
