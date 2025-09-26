/**
 * Custom Error Classes
 * Application-specific error classes for business logic
 */

import { ERROR_MESSAGES } from '@/lib/constants/messages'
import { BaseAPIError, BadRequestError, NotFoundError, ConflictError, ForbiddenError } from './api-errors'

// Business Logic Errors
export class BusinessLogicError extends BadRequestError {
  constructor(message: string, details?: any) {
    super(message, details)
    this.errorCode = 'BUSINESS_LOGIC_ERROR'
  }
}

// User-related Errors
export class UserNotFoundError extends NotFoundError {
  constructor(userId: string, details?: any) {
    super(ERROR_MESSAGES.ACCOUNT_NOT_FOUND, details)
    this.errorCode = 'USER_NOT_FOUND'
    this.details = { userId, ...details }
  }
}

export class UserAlreadyExistsError extends ConflictError {
  constructor(email: string, details?: any) {
    super(ERROR_MESSAGES.ACCOUNT_ALREADY_EXISTS, details)
    this.errorCode = 'USER_ALREADY_EXISTS'
    this.details = { email, ...details }
  }
}

export class UserDisabledError extends ForbiddenError {
  constructor(userId: string, details?: any) {
    super(ERROR_MESSAGES.ACCOUNT_DISABLED, details)
    this.errorCode = 'USER_DISABLED'
    this.details = { userId, ...details }
  }
}

export class UserNotVerifiedError extends ForbiddenError {
  constructor(userId: string, details?: any) {
    super(ERROR_MESSAGES.ACCOUNT_NOT_VERIFIED, details)
    this.errorCode = 'USER_NOT_VERIFIED'
    this.details = { userId, ...details }
  }
}

// Profile-related Errors
export class ProfileNotFoundError extends NotFoundError {
  constructor(userId: string, details?: any) {
    super(ERROR_MESSAGES.PROFILE_NOT_FOUND, details)
    this.errorCode = 'PROFILE_NOT_FOUND'
    this.details = { userId, ...details }
  }
}

export class ProfileIncompleteError extends BadRequestError {
  constructor(userId: string, missingFields: string[], details?: any) {
    super(ERROR_MESSAGES.PROFILE_INCOMPLETE, details)
    this.errorCode = 'PROFILE_INCOMPLETE'
    this.details = { userId, missingFields, ...details }
  }
}

// Matching-related Errors
export class MatchNotFoundError extends NotFoundError {
  constructor(matchId: string, details?: any) {
    super(ERROR_MESSAGES.MATCH_NOT_FOUND, details)
    this.errorCode = 'MATCH_NOT_FOUND'
    this.details = { matchId, ...details }
  }
}

export class AlreadyLikedError extends ConflictError {
  constructor(userId: string, targetUserId: string, details?: any) {
    super(ERROR_MESSAGES.ALREADY_LIKED, details)
    this.errorCode = 'ALREADY_LIKED'
    this.details = { userId, targetUserId, ...details }
  }
}

export class AlreadyPassedError extends ConflictError {
  constructor(userId: string, targetUserId: string, details?: any) {
    super(ERROR_MESSAGES.ALREADY_PASSED, details)
    this.errorCode = 'ALREADY_PASSED'
    this.details = { userId, targetUserId, ...details }
  }
}

export class CannotMatchSelfError extends BadRequestError {
  constructor(userId: string, details?: any) {
    super('Cannot match with yourself', details)
    this.errorCode = 'CANNOT_MATCH_SELF'
    this.details = { userId, ...details }
  }
}

// Group Matching Errors
export class GroupNotFoundError extends NotFoundError {
  constructor(groupId: string, details?: any) {
    super(ERROR_MESSAGES.GROUP_NOT_FOUND, details)
    this.errorCode = 'GROUP_NOT_FOUND'
    this.details = { groupId, ...details }
  }
}

export class GroupFullError extends ConflictError {
  constructor(groupId: string, currentSize: number, maxSize: number, details?: any) {
    super(ERROR_MESSAGES.GROUP_FULL, details)
    this.errorCode = 'GROUP_FULL'
    this.details = { groupId, currentSize, maxSize, ...details }
  }
}

export class AlreadyInGroupError extends ConflictError {
  constructor(userId: string, groupId: string, details?: any) {
    super(ERROR_MESSAGES.ALREADY_IN_GROUP, details)
    this.errorCode = 'ALREADY_IN_GROUP'
    this.details = { userId, groupId, ...details }
  }
}

export class NotInGroupError extends BadRequestError {
  constructor(userId: string, groupId: string, details?: any) {
    super(ERROR_MESSAGES.NOT_IN_GROUP, details)
    this.errorCode = 'NOT_IN_GROUP'
    this.details = { userId, groupId, ...details }
  }
}

// Messaging Errors
export class ConversationNotFoundError extends NotFoundError {
  constructor(conversationId: string, details?: any) {
    super(ERROR_MESSAGES.CONVERSATION_NOT_FOUND, details)
    this.errorCode = 'CONVERSATION_NOT_FOUND'
    this.details = { conversationId, ...details }
  }
}

export class MessageNotFoundError extends NotFoundError {
  constructor(messageId: string, details?: any) {
    super(ERROR_MESSAGES.MESSAGE_NOT_FOUND, details)
    this.errorCode = 'MESSAGE_NOT_FOUND'
    this.details = { messageId, ...details }
  }
}

export class CannotMessageSelfError extends BadRequestError {
  constructor(userId: string, details?: any) {
    super(ERROR_MESSAGES.CANNOT_MESSAGE_SELF, details)
    this.errorCode = 'CANNOT_MESSAGE_SELF'
    this.details = { userId, ...details }
  }
}

export class CannotMessageUnmatchedError extends BadRequestError {
  constructor(userId: string, targetUserId: string, details?: any) {
    super(ERROR_MESSAGES.CANNOT_MESSAGE_UNMATCHED, details)
    this.errorCode = 'CANNOT_MESSAGE_UNMATCHED'
    this.details = { userId, targetUserId, ...details }
  }
}

// Payment Errors
export class SubscriptionNotFoundError extends NotFoundError {
  constructor(subscriptionId: string, details?: any) {
    super(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND, details)
    this.errorCode = 'SUBSCRIPTION_NOT_FOUND'
    this.details = { subscriptionId, ...details }
  }
}

export class SubscriptionExpiredError extends BadRequestError {
  constructor(subscriptionId: string, expiryDate: Date, details?: any) {
    super(ERROR_MESSAGES.SUBSCRIPTION_EXPIRED, details)
    this.errorCode = 'SUBSCRIPTION_EXPIRED'
    this.details = { subscriptionId, expiryDate, ...details }
  }
}

export class PaymentMethodNotFoundError extends NotFoundError {
  constructor(paymentMethodId: string, details?: any) {
    super(ERROR_MESSAGES.PAYMENT_METHOD_NOT_FOUND, details)
    this.errorCode = 'PAYMENT_METHOD_NOT_FOUND'
    this.details = { paymentMethodId, ...details }
  }
}

// Verification Errors
export class VerificationNotFoundError extends NotFoundError {
  constructor(verificationId: string, details?: any) {
    super(ERROR_MESSAGES.VERIFICATION_NOT_FOUND, details)
    this.errorCode = 'VERIFICATION_NOT_FOUND'
    this.details = { verificationId, ...details }
  }
}

export class VerificationAlreadySubmittedError extends ConflictError {
  constructor(userId: string, details?: any) {
    super(ERROR_MESSAGES.VERIFICATION_ALREADY_SUBMITTED, details)
    this.errorCode = 'VERIFICATION_ALREADY_SUBMITTED'
    this.details = { userId, ...details }
  }
}

export class VerificationAlreadyApprovedError extends ConflictError {
  constructor(verificationId: string, details?: any) {
    super(ERROR_MESSAGES.VERIFICATION_ALREADY_APPROVED, details)
    this.errorCode = 'VERIFICATION_ALREADY_APPROVED'
    this.details = { verificationId, ...details }
  }
}

export class InvalidDocumentError extends BadRequestError {
  constructor(documentId: string, reason: string, details?: any) {
    super(ERROR_MESSAGES.INVALID_DOCUMENT, details)
    this.errorCode = 'INVALID_DOCUMENT'
    this.details = { documentId, reason, ...details }
  }
}

export class DocumentExpiredError extends BadRequestError {
  constructor(documentId: string, expiryDate: Date, details?: any) {
    super(ERROR_MESSAGES.DOCUMENT_EXPIRED, details)
    this.errorCode = 'DOCUMENT_EXPIRED'
    this.details = { documentId, expiryDate, ...details }
  }
}

// Admin Errors
export class AdminAccessRequiredError extends ForbiddenError {
  constructor(userId: string, details?: any) {
    super(ERROR_MESSAGES.ADMIN_ACCESS_REQUIRED, details)
    this.errorCode = 'ADMIN_ACCESS_REQUIRED'
    this.details = { userId, ...details }
  }
}

export class CannotDeleteSelfError extends BadRequestError {
  constructor(userId: string, details?: any) {
    super(ERROR_MESSAGES.CANNOT_DELETE_SELF, details)
    this.errorCode = 'CANNOT_DELETE_SELF'
    this.details = { userId, ...details }
  }
}

export class CannotModifyAdminError extends ForbiddenError {
  constructor(userId: string, details?: any) {
    super(ERROR_MESSAGES.CANNOT_MODIFY_ADMIN, details)
    this.errorCode = 'CANNOT_MODIFY_ADMIN'
    this.details = { userId, ...details }
  }
}

// File-related Errors
export class FileNotFoundError extends NotFoundError {
  constructor(fileId: string, details?: any) {
    super(ERROR_MESSAGES.FILE_NOT_FOUND, details)
    this.errorCode = 'FILE_NOT_FOUND'
    this.details = { fileId, ...details }
  }
}

export class InvalidAvatarFormatError extends BadRequestError {
  constructor(fileName: string, allowedFormats: string[], details?: any) {
    super(ERROR_MESSAGES.INVALID_AVATAR_FORMAT, details)
    this.errorCode = 'INVALID_AVATAR_FORMAT'
    this.details = { fileName, allowedFormats, ...details }
  }
}

export class AvatarTooLargeError extends BadRequestError {
  constructor(fileName: string, fileSize: number, maxSize: number, details?: any) {
    super(ERROR_MESSAGES.AVATAR_TOO_LARGE, details)
    this.errorCode = 'AVATAR_TOO_LARGE'
    this.details = { fileName, fileSize, maxSize, ...details }
  }
}

export class DocumentTooLargeError extends BadRequestError {
  constructor(fileName: string, fileSize: number, maxSize: number, details?: any) {
    super(ERROR_MESSAGES.DOCUMENT_TOO_LARGE, details)
    this.errorCode = 'DOCUMENT_TOO_LARGE'
    this.details = { fileName, fileSize, maxSize, ...details }
  }
}

export class InvalidDocumentFormatError extends BadRequestError {
  constructor(fileName: string, allowedFormats: string[], details?: any) {
    super(ERROR_MESSAGES.INVALID_DOCUMENT_FORMAT, details)
    this.errorCode = 'INVALID_DOCUMENT_FORMAT'
    this.details = { fileName, allowedFormats, ...details }
  }
}

// System Errors
export class MaintenanceModeError extends BadRequestError {
  constructor(message: string = 'System is under maintenance', details?: any) {
    super(message, details)
    this.errorCode = 'MAINTENANCE_MODE'
    this.details = { ...details }
  }
}

export class FeatureDisabledError extends BadRequestError {
  constructor(feature: string, details?: any) {
    super(`Feature '${feature}' is currently disabled`, details)
    this.errorCode = 'FEATURE_DISABLED'
    this.details = { feature, ...details }
  }
}

export class QuotaExceededError extends BadRequestError {
  constructor(quotaType: string, current: number, limit: number, details?: any) {
    super(`Quota exceeded for ${quotaType}`, details)
    this.errorCode = 'QUOTA_EXCEEDED'
    this.details = { quotaType, current, limit, ...details }
  }
}

// Location-related Errors
export class LocationNotFoundError extends NotFoundError {
  constructor(location: string, details?: any) {
    super(`Location '${location}' not found`, details)
    this.errorCode = 'LOCATION_NOT_FOUND'
    this.details = { location, ...details }
  }
}

export class LocationServiceError extends BadRequestError {
  constructor(message: string, details?: any) {
    super(`Location service error: ${message}`, details)
    this.errorCode = 'LOCATION_SERVICE_ERROR'
    this.details = { ...details }
  }
}

// Notification Errors
export class NotificationNotFoundError extends NotFoundError {
  constructor(notificationId: string, details?: any) {
    super('Notification not found', details)
    this.errorCode = 'NOTIFICATION_NOT_FOUND'
    this.details = { notificationId, ...details }
  }
}

export class NotificationServiceError extends BadRequestError {
  constructor(service: string, message: string, details?: any) {
    super(`Notification service error: ${message}`, details)
    this.errorCode = 'NOTIFICATION_SERVICE_ERROR'
    this.details = { service, ...details }
  }
}

// Helper Functions
export const isCustomError = (error: any): error is BaseAPIError => {
  return error instanceof BaseAPIError && error.errorCode.startsWith('CUSTOM_')
}

export const isUserError = (error: any): boolean => {
  return error instanceof UserNotFoundError ||
         error instanceof UserAlreadyExistsError ||
         error instanceof UserDisabledError ||
         error instanceof UserNotVerifiedError
}

export const isProfileError = (error: any): boolean => {
  return error instanceof ProfileNotFoundError ||
         error instanceof ProfileIncompleteError
}

export const isMatchingError = (error: any): boolean => {
  return error instanceof MatchNotFoundError ||
         error instanceof AlreadyLikedError ||
         error instanceof AlreadyPassedError ||
         error instanceof CannotMatchSelfError
}

export const isGroupError = (error: any): boolean => {
  return error instanceof GroupNotFoundError ||
         error instanceof GroupFullError ||
         error instanceof AlreadyInGroupError ||
         error instanceof NotInGroupError
}

export const isMessagingError = (error: any): boolean => {
  return error instanceof ConversationNotFoundError ||
         error instanceof MessageNotFoundError ||
         error instanceof CannotMessageSelfError ||
         error instanceof CannotMessageUnmatchedError
}

export const isPaymentError = (error: any): boolean => {
  return error instanceof SubscriptionNotFoundError ||
         error instanceof SubscriptionExpiredError ||
         error instanceof PaymentMethodNotFoundError
}

export const isVerificationError = (error: any): boolean => {
  return error instanceof VerificationNotFoundError ||
         error instanceof VerificationAlreadySubmittedError ||
         error instanceof VerificationAlreadyApprovedError ||
         error instanceof InvalidDocumentError ||
         error instanceof DocumentExpiredError
}

export const isAdminError = (error: any): boolean => {
  return error instanceof AdminAccessRequiredError ||
         error instanceof CannotDeleteSelfError ||
         error instanceof CannotModifyAdminError
}

export const isFileError = (error: any): boolean => {
  return error instanceof FileNotFoundError ||
         error instanceof InvalidAvatarFormatError ||
         error instanceof AvatarTooLargeError ||
         error instanceof DocumentTooLargeError ||
         error instanceof InvalidDocumentFormatError
}
