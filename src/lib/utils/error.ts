/**
 * Error handling utilities
 * Provides consistent error handling across the application
 */

export interface AppError {
  message: string
  code?: string
  statusCode?: number
  details?: unknown
}

/**
 * Create a standardized error object
 */
export function createError(
  message: string,
  options: {
    code?: string
    statusCode?: number
    details?: unknown
  } = {}
): AppError {
  return {
    message,
    code: options.code,
    statusCode: options.statusCode,
    details: options.details,
  }
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }
  
  return 'An unknown error occurred'
}

/**
 * Extract error code from various error types
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code)
  }
  
  return undefined
}

/**
 * Check if error is a Supabase error
 */
export function isSupabaseError(error: unknown): error is { code: string; message: string } {
  return error !== null && typeof error === 'object' && 'code' in error && 'message' in error
}

/**
 * Handle Supabase errors
 */
export function handleSupabaseError(error: unknown): AppError {
  if (isSupabaseError(error)) {
    const supabaseError = error as { code: string; message: string; details?: string }
    return createError(supabaseError.message, {
      code: supabaseError.code,
      details: supabaseError.details,
    })
  }
  
  return createError(getErrorMessage(error))
}

/**
 * Common error codes
 */
export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Not found errors
  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
} as const

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const
