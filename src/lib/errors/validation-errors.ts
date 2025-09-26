/**
 * Validation Error Classes
 * Custom error classes for validation-related errors
 */

import { VALIDATION_MESSAGES } from '@/lib/constants/messages'
import { BadRequestError } from './api-errors'

// Base Validation Error Class
export abstract class BaseValidationError extends BadRequestError {
  public readonly field: string
  public readonly value: any
  public readonly constraint: string

  constructor(
    field: string,
    value: any,
    constraint: string,
    message: string,
    details?: any
  ) {
    super(message, details)
    this.field = field
    this.value = value
    this.constraint = constraint
    this.errorCode = 'VALIDATION_ERROR'
  }

  toJSON() {
    return {
      ...super.toJSON(),
      field: this.field,
      value: this.value,
      constraint: this.constraint,
    }
  }
}

// Required Field Error
export class RequiredFieldError extends BaseValidationError {
  constructor(field: string, details?: any) {
    super(
      field,
      undefined,
      'required',
      VALIDATION_MESSAGES.REQUIRED_FIELD(field),
      details
    )
    this.errorCode = 'REQUIRED_FIELD_ERROR'
  }
}

// Length Validation Errors
export class MinLengthError extends BaseValidationError {
  public readonly minLength: number

  constructor(field: string, value: string, minLength: number, details?: any) {
    super(
      field,
      value,
      'minLength',
      VALIDATION_MESSAGES.MIN_LENGTH(minLength),
      details
    )
    this.minLength = minLength
    this.errorCode = 'MIN_LENGTH_ERROR'
  }
}

export class MaxLengthError extends BaseValidationError {
  public readonly maxLength: number

  constructor(field: string, value: string, maxLength: number, details?: any) {
    super(
      field,
      value,
      'maxLength',
      VALIDATION_MESSAGES.MAX_LENGTH(maxLength),
      details
    )
    this.maxLength = maxLength
    this.errorCode = 'MAX_LENGTH_ERROR'
  }
}

// Email Validation Error
export class InvalidEmailError extends BaseValidationError {
  constructor(field: string, value: string, details?: any) {
    super(
      field,
      value,
      'email',
      VALIDATION_MESSAGES.INVALID_EMAIL,
      details
    )
    this.errorCode = 'INVALID_EMAIL_ERROR'
  }
}

// Phone Validation Error
export class InvalidPhoneError extends BaseValidationError {
  constructor(field: string, value: string, details?: any) {
    super(
      field,
      value,
      'phone',
      VALIDATION_MESSAGES.INVALID_PHONE,
      details
    )
    this.errorCode = 'INVALID_PHONE_ERROR'
  }
}

// URL Validation Error
export class InvalidUrlError extends BaseValidationError {
  constructor(field: string, value: string, details?: any) {
    super(
      field,
      value,
      'url',
      VALIDATION_MESSAGES.INVALID_URL,
      details
    )
    this.errorCode = 'INVALID_URL_ERROR'
  }
}

// Number Validation Errors
export class MinValueError extends BaseValidationError {
  public readonly minValue: number

  constructor(field: string, value: number, minValue: number, details?: any) {
    super(
      field,
      value,
      'minValue',
      VALIDATION_MESSAGES.MIN_VALUE(minValue),
      details
    )
    this.minValue = minValue
    this.errorCode = 'MIN_VALUE_ERROR'
  }
}

export class MaxValueError extends BaseValidationError {
  public readonly maxValue: number

  constructor(field: string, value: number, maxValue: number, details?: any) {
    super(
      field,
      value,
      'maxValue',
      VALIDATION_MESSAGES.MAX_VALUE(maxValue),
      details
    )
    this.maxValue = maxValue
    this.errorCode = 'MAX_VALUE_ERROR'
  }
}

export class InvalidNumberError extends BaseValidationError {
  constructor(field: string, value: any, details?: any) {
    super(
      field,
      value,
      'number',
      VALIDATION_MESSAGES.INVALID_NUMBER,
      details
    )
    this.errorCode = 'INVALID_NUMBER_ERROR'
  }
}

export class PositiveNumberError extends BaseValidationError {
  constructor(field: string, value: number, details?: any) {
    super(
      field,
      value,
      'positive',
      VALIDATION_MESSAGES.POSITIVE_NUMBER,
      details
    )
    this.errorCode = 'POSITIVE_NUMBER_ERROR'
  }
}

// Date Validation Errors
export class InvalidDateError extends BaseValidationError {
  constructor(field: string, value: any, details?: any) {
    super(
      field,
      value,
      'date',
      VALIDATION_MESSAGES.INVALID_DATE,
      details
    )
    this.errorCode = 'INVALID_DATE_ERROR'
  }
}

export class FutureDateError extends BaseValidationError {
  constructor(field: string, value: Date, details?: any) {
    super(
      field,
      value,
      'futureDate',
      VALIDATION_MESSAGES.FUTURE_DATE,
      details
    )
    this.errorCode = 'FUTURE_DATE_ERROR'
  }
}

export class PastDateError extends BaseValidationError {
  constructor(field: string, value: Date, details?: any) {
    super(
      field,
      value,
      'pastDate',
      VALIDATION_MESSAGES.PAST_DATE,
      details
    )
    this.errorCode = 'PAST_DATE_ERROR'
  }
}

export class MinAgeError extends BaseValidationError {
  public readonly minAge: number

  constructor(field: string, value: number, minAge: number, details?: any) {
    super(
      field,
      value,
      'minAge',
      VALIDATION_MESSAGES.MIN_AGE(minAge),
      details
    )
    this.minAge = minAge
    this.errorCode = 'MIN_AGE_ERROR'
  }
}

export class MaxAgeError extends BaseValidationError {
  public readonly maxAge: number

  constructor(field: string, value: number, maxAge: number, details?: any) {
    super(
      field,
      value,
      'maxAge',
      VALIDATION_MESSAGES.MAX_AGE(maxAge),
      details
    )
    this.maxAge = maxAge
    this.errorCode = 'MAX_AGE_ERROR'
  }
}

// File Validation Errors
export class InvalidFileSizeError extends BaseValidationError {
  public readonly maxSize: string

  constructor(field: string, value: File, maxSize: string, details?: any) {
    super(
      field,
      value.name,
      'fileSize',
      VALIDATION_MESSAGES.INVALID_FILE_SIZE(maxSize),
      details
    )
    this.maxSize = maxSize
    this.errorCode = 'INVALID_FILE_SIZE_ERROR'
  }
}

export class InvalidFileTypeError extends BaseValidationError {
  public readonly allowedTypes: string[]

  constructor(field: string, value: File, allowedTypes: string[], details?: any) {
    super(
      field,
      value.name,
      'fileType',
      VALIDATION_MESSAGES.INVALID_FILE_TYPE(allowedTypes),
      details
    )
    this.allowedTypes = allowedTypes
    this.errorCode = 'INVALID_FILE_TYPE_ERROR'
  }
}

// Password Validation Errors
export class PasswordTooShortError extends BaseValidationError {
  public readonly minLength: number

  constructor(field: string, value: string, minLength: number, details?: any) {
    super(
      field,
      '[HIDDEN]',
      'passwordLength',
      VALIDATION_MESSAGES.PASSWORD_TOO_SHORT,
      details
    )
    this.minLength = minLength
    this.errorCode = 'PASSWORD_TOO_SHORT_ERROR'
  }
}

export class PasswordTooLongError extends BaseValidationError {
  public readonly maxLength: number

  constructor(field: string, value: string, maxLength: number, details?: any) {
    super(
      field,
      '[HIDDEN]',
      'passwordLength',
      VALIDATION_MESSAGES.PASSWORD_TOO_LONG,
      details
    )
    this.maxLength = maxLength
    this.errorCode = 'PASSWORD_TOO_LONG_ERROR'
  }
}

export class PasswordMissingUppercaseError extends BaseValidationError {
  constructor(field: string, details?: any) {
    super(
      field,
      '[HIDDEN]',
      'passwordUppercase',
      VALIDATION_MESSAGES.PASSWORD_MUST_CONTAIN_UPPERCASE,
      details
    )
    this.errorCode = 'PASSWORD_MISSING_UPPERCASE_ERROR'
  }
}

export class PasswordMissingLowercaseError extends BaseValidationError {
  constructor(field: string, details?: any) {
    super(
      field,
      '[HIDDEN]',
      'passwordLowercase',
      VALIDATION_MESSAGES.PASSWORD_MUST_CONTAIN_LOWERCASE,
      details
    )
    this.errorCode = 'PASSWORD_MISSING_LOWERCASE_ERROR'
  }
}

export class PasswordMissingNumberError extends BaseValidationError {
  constructor(field: string, details?: any) {
    super(
      field,
      '[HIDDEN]',
      'passwordNumber',
      VALIDATION_MESSAGES.PASSWORD_MUST_CONTAIN_NUMBER,
      details
    )
    this.errorCode = 'PASSWORD_MISSING_NUMBER_ERROR'
  }
}

export class PasswordMissingSpecialError extends BaseValidationError {
  constructor(field: string, details?: any) {
    super(
      field,
      '[HIDDEN]',
      'passwordSpecial',
      VALIDATION_MESSAGES.PASSWORD_MUST_CONTAIN_SPECIAL,
      details
    )
    this.errorCode = 'PASSWORD_MISSING_SPECIAL_ERROR'
  }
}

// Array Validation Errors
export class MinItemsError extends BaseValidationError {
  public readonly minItems: number

  constructor(field: string, value: any[], minItems: number, details?: any) {
    super(
      field,
      value.length,
      'minItems',
      VALIDATION_MESSAGES.MIN_ITEMS(minItems),
      details
    )
    this.minItems = minItems
    this.errorCode = 'MIN_ITEMS_ERROR'
  }
}

export class MaxItemsError extends BaseValidationError {
  public readonly maxItems: number

  constructor(field: string, value: any[], maxItems: number, details?: any) {
    super(
      field,
      value.length,
      'maxItems',
      VALIDATION_MESSAGES.MAX_ITEMS(maxItems),
      details
    )
    this.maxItems = maxItems
    this.errorCode = 'MAX_ITEMS_ERROR'
  }
}

export class UniqueItemsError extends BaseValidationError {
  constructor(field: string, value: any[], details?: any) {
    super(
      field,
      value,
      'uniqueItems',
      VALIDATION_MESSAGES.UNIQUE_ITEMS,
      details
    )
    this.errorCode = 'UNIQUE_ITEMS_ERROR'
  }
}

// Custom Validation Errors
export class InvalidSelectionError extends BaseValidationError {
  constructor(field: string, value: any, details?: any) {
    super(
      field,
      value,
      'selection',
      VALIDATION_MESSAGES.INVALID_SELECTION,
      details
    )
    this.errorCode = 'INVALID_SELECTION_ERROR'
  }
}

export class InvalidFormatError extends BaseValidationError {
  constructor(field: string, value: any, details?: any) {
    super(
      field,
      value,
      'format',
      VALIDATION_MESSAGES.INVALID_FORMAT,
      details
    )
    this.errorCode = 'INVALID_FORMAT_ERROR'
  }
}

export class MustAgreeError extends BaseValidationError {
  constructor(field: string, details?: any) {
    super(
      field,
      false,
      'agreement',
      VALIDATION_MESSAGES.MUST_AGREE,
      details
    )
    this.errorCode = 'MUST_AGREE_ERROR'
  }
}

// Multiple Validation Errors
export class ValidationErrors extends BadRequestError {
  public readonly errors: BaseValidationError[]

  constructor(errors: BaseValidationError[], message?: string) {
    super(message || 'Validation failed', { errors })
    this.errors = errors
    this.errorCode = 'MULTIPLE_VALIDATION_ERRORS'
  }

  toJSON() {
    return {
      ...super.toJSON(),
      errors: this.errors.map(error => error.toJSON()),
    }
  }

  getFieldErrors(field: string): BaseValidationError[] {
    return this.errors.filter(error => error.field === field)
  }

  hasFieldError(field: string): boolean {
    return this.errors.some(error => error.field === field)
  }

  getFirstFieldError(field: string): BaseValidationError | undefined {
    return this.errors.find(error => error.field === field)
  }
}

// Helper Functions
export const isValidationError = (error: any): error is BaseValidationError => {
  return error instanceof BaseValidationError
}

export const isValidationErrors = (error: any): error is ValidationErrors => {
  return error instanceof ValidationErrors
}

// Concrete implementation for creating validation errors
class GenericValidationError extends BaseValidationError {
  constructor(field: string, value: any, constraint: string, message: string, details?: any) {
    super(field, value, constraint, message, details)
  }
}

export const createValidationError = (
  field: string,
  value: any,
  constraint: string,
  message: string,
  details?: any
): BaseValidationError => {
  return new GenericValidationError(field, value, constraint, message, details)
}

export const createValidationErrors = (errors: BaseValidationError[]): ValidationErrors => {
  return new ValidationErrors(errors)
}
