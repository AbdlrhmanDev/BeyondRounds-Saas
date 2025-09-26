/**
 * Error Handling Index
 * Centralized export of all error classes and utilities
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// API Errors
export * from './api-errors'

// Validation Errors
export * from './validation-errors'

// Custom Errors
export * from './custom-errors'

// Import specific classes for ErrorHandler
import { BaseAPIError } from './api-errors'
import { ValidationErrors, BaseValidationError } from './validation-errors'
import React from 'react'

// Re-export commonly used error classes for convenience
export {
  // Base API Error
  BaseAPIError,
  
  // HTTP Status Errors
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  RateLimitError,
  InternalServerError,
  NetworkError,
  TimeoutError,
  
  // Authentication Errors
  AuthenticationError,
  TokenExpiredError,
  InvalidTokenError,
  
  // Authorization Errors
  InsufficientPermissionsError,
  
  // Resource Errors
  ResourceNotFoundError,
  ResourceAlreadyExistsError,
  
  // File Upload Errors
  FileUploadError,
  FileTooLargeError,
  
  // Payment Errors
  PaymentError,
  InsufficientFundsError,
  InvalidPaymentMethodError,
  
  // Database Errors
  DatabaseError,
  DatabaseConnectionError,
  DatabaseQueryError,
  
  // External Service Errors
  ExternalServiceError,
  EmailServiceError,
  PaymentServiceError,
  
  // Helper Functions
  isAPIError,
  isOperationalError,
  getErrorStatusCode,
  getErrorCode,
  createAPIError,
} from './api-errors'

export {
  // Base Validation Error
  BaseValidationError,
  
  // Field Validation Errors
  RequiredFieldError,
  MinLengthError,
  MaxLengthError,
  InvalidEmailError,
  InvalidPhoneError,
  InvalidUrlError,
  
  // Number Validation Errors
  MinValueError,
  MaxValueError,
  InvalidNumberError,
  PositiveNumberError,
  
  // Date Validation Errors
  InvalidDateError,
  FutureDateError,
  PastDateError,
  MinAgeError,
  MaxAgeError,
  
  // File Validation Errors
  InvalidFileSizeError,
  InvalidFileTypeError,
  
  // Password Validation Errors
  PasswordTooShortError,
  PasswordTooLongError,
  PasswordMissingUppercaseError,
  PasswordMissingLowercaseError,
  PasswordMissingNumberError,
  PasswordMissingSpecialError,
  
  // Array Validation Errors
  MinItemsError,
  MaxItemsError,
  UniqueItemsError,
  
  // Custom Validation Errors
  InvalidSelectionError,
  InvalidFormatError,
  MustAgreeError,
  
  // Multiple Validation Errors
  ValidationErrors,
  
  // Helper Functions
  isValidationError,
  isValidationErrors,
  createValidationError,
  createValidationErrors,
} from './validation-errors'

export {
  // Business Logic Errors
  BusinessLogicError,
  
  // User-related Errors
  UserNotFoundError,
  UserAlreadyExistsError,
  UserDisabledError,
  UserNotVerifiedError,
  
  // Profile-related Errors
  ProfileNotFoundError,
  ProfileIncompleteError,
  
  // Matching-related Errors
  MatchNotFoundError,
  AlreadyLikedError,
  AlreadyPassedError,
  CannotMatchSelfError,
  
  // Group Matching Errors
  GroupNotFoundError,
  GroupFullError,
  AlreadyInGroupError,
  NotInGroupError,
  
  // Messaging Errors
  ConversationNotFoundError,
  MessageNotFoundError,
  CannotMessageSelfError,
  CannotMessageUnmatchedError,
  
  // Payment Errors
  SubscriptionNotFoundError,
  SubscriptionExpiredError,
  PaymentMethodNotFoundError,
  
  // Verification Errors
  VerificationNotFoundError,
  VerificationAlreadySubmittedError,
  VerificationAlreadyApprovedError,
  InvalidDocumentError,
  DocumentExpiredError,
  
  // Admin Errors
  AdminAccessRequiredError,
  CannotDeleteSelfError,
  CannotModifyAdminError,
  
  // File-related Errors
  FileNotFoundError,
  InvalidAvatarFormatError,
  AvatarTooLargeError,
  DocumentTooLargeError,
  InvalidDocumentFormatError,
  
  // System Errors
  MaintenanceModeError,
  FeatureDisabledError,
  QuotaExceededError,
  
  // Location-related Errors
  LocationNotFoundError,
  LocationServiceError,
  
  // Notification Errors
  NotificationNotFoundError,
  NotificationServiceError,
  
  // Helper Functions
  isCustomError,
  isUserError,
  isProfileError,
  isMatchingError,
  isGroupError,
  isMessagingError,
  isPaymentError,
  isVerificationError,
  isAdminError,
  isFileError,
} from './custom-errors'

// Error Handler Utilities
export class ErrorHandler {
  /**
   * Handle and format errors for API responses
   */
  static handleError(error: any): {
    statusCode: number
    errorCode: string
    message: string
    details?: any
    timestamp: Date
  } {
    // If it's already an API error, return it as-is
    if (error instanceof BaseAPIError) {
      return {
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp,
      }
    }

    // Handle validation errors
    if (error instanceof ValidationErrors) {
      return {
        statusCode: 400,
        errorCode: 'VALIDATION_ERRORS',
        message: error.message,
        details: error.errors.map(e => e.toJSON()),
        timestamp: new Date(),
      }
    }

    // Handle unknown errors
    return {
      statusCode: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date(),
    }
  }

  /**
   * Log error for monitoring and debugging
   */
  static logError(error: any, context?: any): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      context,
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error occurred:', errorInfo)
    }

    // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
    // errorMonitoringService.captureException(error, { extra: context })
  }

  /**
   * Check if error should be reported to monitoring service
   */
  static shouldReportError(error: any): boolean {
    // Don't report operational errors
    if (error instanceof BaseAPIError && error.isOperational) {
      return false
    }

    // Don't report validation errors
    if (error instanceof BaseValidationError || error instanceof ValidationErrors) {
      return false
    }

    // Report all other errors
    return true
  }
}

// Error Response Types
export interface ErrorResponse {
  statusCode: number
  errorCode: string
  message: string
  details?: any
  timestamp: Date
}

export interface ValidationErrorResponse extends ErrorResponse {
  errors: Array<{
    field: string
    value: any
    constraint: string
    message: string
  }>
}

// Error Middleware Types
export interface ErrorContext {
  requestId?: string
  userId?: string
  path?: string
  method?: string
  userAgent?: string
  ip?: string
  timestamp: Date
}

// Global Error Handler
export const globalErrorHandler = (error: any, context?: ErrorContext) => {
  // Log the error
  ErrorHandler.logError(error, context)

  // Handle the error
  const errorResponse = ErrorHandler.handleError(error)

  // Report to monitoring service if needed
  if (ErrorHandler.shouldReportError(error)) {
    // TODO: Send to error monitoring service
    console.error('Error reported to monitoring service:', errorResponse)
  }

  return errorResponse
}

// Error Boundary Props (for React)
export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: () => void // Simplified callback without parameters
}

// Error Boundary State
export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

// Utility Functions
export const createErrorResponse = (
  statusCode: number,
  errorCode: string,
  message: string,
  details?: any
): ErrorResponse => ({
  statusCode,
  errorCode,
  message,
  details,
  timestamp: new Date(),
})

export const isError = (value: any): value is Error => {
  return value instanceof Error
}

export const getErrorMessage = (error: any): string => {
  if (isError(error)) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

export const getErrorStack = (error: any): string | undefined => {
  if (isError(error)) {
    return error.stack
  }
  return undefined
}
