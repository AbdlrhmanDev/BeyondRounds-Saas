/**
 * API Error Classes
 * Custom error classes for API-related errors
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { API_STATUS, API_ERROR_CODES } from '@/lib/constants/api'
import { ERROR_MESSAGES } from '@/lib/constants/messages'

// Base API Error Class
export abstract class BaseAPIError extends Error {
  public readonly statusCode: number
  public errorCode: string
  public readonly isOperational: boolean
  public readonly timestamp: Date
  public readonly path?: string
  public readonly method?: string
  public details?: any

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message)
    
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.isOperational = isOperational
    this.timestamp = new Date()
    this.details = details

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      timestamp: this.timestamp,
      path: this.path,
      method: this.method,
      details: this.details,
    }
  }
}

// 400 Bad Request
export class BadRequestError extends BaseAPIError {
  constructor(message: string = ERROR_MESSAGES.VALIDATION_ERROR, details?: any) {
    super(message, API_STATUS.BAD_REQUEST, API_ERROR_CODES.VALIDATION_ERROR, true, details)
  }
}

// 401 Unauthorized
export class UnauthorizedError extends BaseAPIError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED, details?: any) {
    super(message, API_STATUS.UNAUTHORIZED, API_ERROR_CODES.AUTHENTICATION_ERROR, true, details)
  }
}

// 403 Forbidden
export class ForbiddenError extends BaseAPIError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN, details?: any) {
    super(message, API_STATUS.FORBIDDEN, API_ERROR_CODES.AUTHORIZATION_ERROR, true, details)
  }
}

// 404 Not Found
export class NotFoundError extends BaseAPIError {
  constructor(message: string = ERROR_MESSAGES.NOT_FOUND, details?: any) {
    super(message, API_STATUS.NOT_FOUND, API_ERROR_CODES.NOT_FOUND_ERROR, true, details)
  }
}

// 409 Conflict
export class ConflictError extends BaseAPIError {
  constructor(message: string = ERROR_MESSAGES.CONFLICT_ERROR, details?: any) {
    super(message, API_STATUS.CONFLICT, API_ERROR_CODES.CONFLICT_ERROR, true, details)
  }
}

// 422 Unprocessable Entity
export class UnprocessableEntityError extends BaseAPIError {
  constructor(message: string = ERROR_MESSAGES.VALIDATION_ERROR, details?: any) {
    super(message, API_STATUS.UNPROCESSABLE_ENTITY, API_ERROR_CODES.VALIDATION_ERROR, true, details)
  }
}

// 429 Too Many Requests
export class RateLimitError extends BaseAPIError {
  public readonly retryAfter?: number

  constructor(
    message: string = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
    retryAfter?: number,
    details?: any
  ) {
    super(message, 429, API_ERROR_CODES.RATE_LIMIT_ERROR, true, details)
    this.retryAfter = retryAfter
  }
}

// 500 Internal Server Error
export class InternalServerError extends BaseAPIError {
  constructor(message: string = ERROR_MESSAGES.SERVER_ERROR, details?: any) {
    super(message, API_STATUS.INTERNAL_SERVER_ERROR, API_ERROR_CODES.SERVER_ERROR, false, details)
  }
}

// Network Error
export class NetworkError extends BaseAPIError {
  constructor(message: string = ERROR_MESSAGES.NETWORK_ERROR, details?: any) {
    super(message, 0, API_ERROR_CODES.NETWORK_ERROR, true, details)
  }
}

// Timeout Error
export class TimeoutError extends BaseAPIError {
  public readonly timeout: number

  constructor(timeout: number, message?: string, details?: any) {
    super(
      message || `Request timed out after ${timeout}ms`,
      408,
      'TIMEOUT_ERROR',
      true,
      details
    )
    this.timeout = timeout
  }
}

// Authentication Errors
export class AuthenticationError extends UnauthorizedError {
  constructor(message: string = ERROR_MESSAGES.INVALID_CREDENTIALS, details?: any) {
    super(message, details)
    this.errorCode = 'AUTHENTICATION_FAILED'
  }
}

export class TokenExpiredError extends UnauthorizedError {
  constructor(message: string = ERROR_MESSAGES.TOKEN_EXPIRED, details?: any) {
    super(message, details)
    this.errorCode = 'TOKEN_EXPIRED'
  }
}

export class InvalidTokenError extends UnauthorizedError {
  constructor(message: string = ERROR_MESSAGES.INVALID_TOKEN, details?: any) {
    super(message, details)
    this.errorCode = 'INVALID_TOKEN'
  }
}

// Authorization Errors
export class InsufficientPermissionsError extends ForbiddenError {
  constructor(message: string = ERROR_MESSAGES.ADMIN_ACCESS_REQUIRED, details?: any) {
    super(message, details)
    this.errorCode = 'INSUFFICIENT_PERMISSIONS'
  }
}

// Resource Errors
export class ResourceNotFoundError extends NotFoundError {
  constructor(resource: string, id?: string, details?: any) {
    const message = id 
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`
    super(message, details)
    this.errorCode = 'RESOURCE_NOT_FOUND'
  }
}

export class ResourceAlreadyExistsError extends ConflictError {
  constructor(resource: string, field: string, value: string, details?: any) {
    super(`${resource} with ${field} '${value}' already exists`, details)
    this.errorCode = 'RESOURCE_ALREADY_EXISTS'
  }
}

// File Upload Errors
export class FileUploadError extends BadRequestError {
  constructor(message: string = ERROR_MESSAGES.UPLOAD_FAILED, details?: any) {
    super(message, details)
    this.errorCode = 'FILE_UPLOAD_ERROR'
  }
}

export class FileTooLargeError extends FileUploadError {
  constructor(maxSize: string, details?: any) {
    super(ERROR_MESSAGES.FILE_TOO_LARGE, details)
    this.errorCode = 'FILE_TOO_LARGE'
    this.details = { maxSize, ...details }
  }
}

export class InvalidFileTypeError extends FileUploadError {
  constructor(allowedTypes: string[], details?: any) {
    super(ERROR_MESSAGES.INVALID_FILE_TYPE, details)
    this.errorCode = 'INVALID_FILE_TYPE'
    this.details = { allowedTypes, ...details }
  }
}

// Payment Errors
export class PaymentError extends BadRequestError {
  constructor(message: string = ERROR_MESSAGES.PAYMENT_FAILED, details?: any) {
    super(message, details)
    this.errorCode = 'PAYMENT_ERROR'
  }
}

export class InsufficientFundsError extends PaymentError {
  constructor(message: string = ERROR_MESSAGES.INSUFFICIENT_FUNDS, details?: any) {
    super(message, details)
    this.errorCode = 'INSUFFICIENT_FUNDS'
  }
}

export class InvalidPaymentMethodError extends PaymentError {
  constructor(message: string = ERROR_MESSAGES.INVALID_PAYMENT_METHOD, details?: any) {
    super(message, details)
    this.errorCode = 'INVALID_PAYMENT_METHOD'
  }
}

// Database Errors
export class DatabaseError extends InternalServerError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, details)
    this.errorCode = 'DATABASE_ERROR'
  }
}

export class DatabaseConnectionError extends DatabaseError {
  constructor(message: string = 'Database connection failed', details?: any) {
    super(message, details)
    this.errorCode = 'DATABASE_CONNECTION_ERROR'
  }
}

export class DatabaseQueryError extends DatabaseError {
  constructor(message: string = 'Database query failed', details?: any) {
    super(message, details)
    this.errorCode = 'DATABASE_QUERY_ERROR'
  }
}

// External Service Errors
export class ExternalServiceError extends InternalServerError {
  public readonly service: string

  constructor(service: string, message: string, details?: any) {
    super(`External service error: ${message}`, details)
    this.service = service
    this.errorCode = 'EXTERNAL_SERVICE_ERROR'
  }
}

export class EmailServiceError extends ExternalServiceError {
  constructor(message: string, details?: any) {
    super('Email Service', message, details)
    this.errorCode = 'EMAIL_SERVICE_ERROR'
  }
}

export class PaymentServiceError extends ExternalServiceError {
  constructor(message: string, details?: any) {
    super('Payment Service', message, details)
    this.errorCode = 'PAYMENT_SERVICE_ERROR'
  }
}

// Helper Functions
export const isAPIError = (error: any): error is BaseAPIError => {
  return error instanceof BaseAPIError
}

export const isOperationalError = (error: any): boolean => {
  return isAPIError(error) && error.isOperational
}

export const getErrorStatusCode = (error: any): number => {
  if (isAPIError(error)) {
    return error.statusCode
  }
  return API_STATUS.INTERNAL_SERVER_ERROR
}

export const getErrorCode = (error: any): string => {
  if (isAPIError(error)) {
    return error.errorCode
  }
  return API_ERROR_CODES.SERVER_ERROR
}

export const createAPIError = (
  statusCode: number,
  message: string,
  errorCode: string,
  details?: any
): BaseAPIError => {
  switch (statusCode) {
    case API_STATUS.BAD_REQUEST:
      return new BadRequestError(message, details)
    case API_STATUS.UNAUTHORIZED:
      return new UnauthorizedError(message, details)
    case API_STATUS.FORBIDDEN:
      return new ForbiddenError(message, details)
    case API_STATUS.NOT_FOUND:
      return new NotFoundError(message, details)
    case API_STATUS.CONFLICT:
      return new ConflictError(message, details)
    case API_STATUS.UNPROCESSABLE_ENTITY:
      return new UnprocessableEntityError(message, details)
    case API_STATUS.INTERNAL_SERVER_ERROR:
      return new InternalServerError(message, details)
    default:
      return new InternalServerError(message, details)
  }
}
