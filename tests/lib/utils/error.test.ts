import {
  createError,
  getErrorMessage,
  getErrorCode,
  isSupabaseError,
  handleSupabaseError,
  ERROR_CODES,
  HTTP_STATUS,
  type AppError
} from '@/lib/utils/error'

describe('Error Utilities', () => {
  describe('createError', () => {
    it('creates error with message only', () => {
      const error = createError('Test error')
      
      expect(error).toEqual({
        message: 'Test error',
        code: undefined,
        statusCode: undefined,
        details: undefined
      })
    })

    it('creates error with all options', () => {
      const error = createError('Test error', {
        code: 'TEST_ERROR',
        statusCode: 400,
        details: { field: 'test' }
      })
      
      expect(error).toEqual({
        message: 'Test error',
        code: 'TEST_ERROR',
        statusCode: 400,
        details: { field: 'test' }
      })
    })

    it('creates error with partial options', () => {
      const error = createError('Test error', {
        code: 'TEST_ERROR'
      })
      
      expect(error).toEqual({
        message: 'Test error',
        code: 'TEST_ERROR',
        statusCode: undefined,
        details: undefined
      })
    })
  })

  describe('getErrorMessage', () => {
    it('extracts message from Error instance', () => {
      const error = new Error('Test error message')
      expect(getErrorMessage(error)).toBe('Test error message')
    })

    it('returns string as-is', () => {
      expect(getErrorMessage('String error')).toBe('String error')
    })

    it('extracts message from object with message property', () => {
      const error = { message: 'Object error message' }
      expect(getErrorMessage(error)).toBe('Object error message')
    })

    it('handles non-string message in object', () => {
      const error = { message: 123 }
      expect(getErrorMessage(error)).toBe('123')
    })

    it('returns default message for unknown error types', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred')
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred')
      expect(getErrorMessage({})).toBe('An unknown error occurred')
      expect(getErrorMessage(123)).toBe('An unknown error occurred')
    })
  })

  describe('getErrorCode', () => {
    it('extracts code from object with code property', () => {
      const error = { code: 'TEST_CODE' }
      expect(getErrorCode(error)).toBe('TEST_CODE')
    })

    it('handles non-string code', () => {
      const error = { code: 123 }
      expect(getErrorCode(error)).toBe('123')
    })

    it('returns undefined for objects without code', () => {
      expect(getErrorCode({})).toBeUndefined()
      expect(getErrorCode({ message: 'test' })).toBeUndefined()
    })

    it('returns undefined for non-objects', () => {
      expect(getErrorCode('string')).toBeUndefined()
      expect(getErrorCode(123)).toBeUndefined()
      expect(getErrorCode(null)).toBeUndefined()
    })
  })

  describe('isSupabaseError', () => {
    it('identifies Supabase errors correctly', () => {
      const supabaseError = { code: '23505', message: 'Duplicate key' }
      expect(isSupabaseError(supabaseError)).toBe(true)
    })

    it('rejects objects without code', () => {
      const error = { message: 'No code' }
      expect(isSupabaseError(error)).toBe(false)
    })

    it('rejects objects without message', () => {
      const error = { code: '123' }
      expect(isSupabaseError(error)).toBe(false)
    })

    it('rejects null and undefined', () => {
      expect(isSupabaseError(null)).toBe(false)
      expect(isSupabaseError(undefined)).toBe(false)
    })

    it('rejects non-objects', () => {
      expect(isSupabaseError('string')).toBe(false)
      expect(isSupabaseError(123)).toBe(false)
    })
  })

  describe('handleSupabaseError', () => {
    it('handles Supabase errors correctly', () => {
      const supabaseError = {
        code: '23505',
        message: 'Duplicate key violation',
        details: 'Key (email)=(test@example.com) already exists'
      }
      
      const result = handleSupabaseError(supabaseError)
      
      expect(result).toEqual({
        message: 'Duplicate key violation',
        code: '23505',
        statusCode: undefined,
        details: 'Key (email)=(test@example.com) already exists'
      })
    })

    it('handles Supabase errors without details', () => {
      const supabaseError = {
        code: '23505',
        message: 'Duplicate key violation'
      }
      
      const result = handleSupabaseError(supabaseError)
      
      expect(result).toEqual({
        message: 'Duplicate key violation',
        code: '23505',
        statusCode: undefined,
        details: undefined
      })
    })

    it('handles non-Supabase errors', () => {
      const error = new Error('Regular error')
      const result = handleSupabaseError(error)
      
      expect(result).toEqual({
        message: 'Regular error',
        code: undefined,
        statusCode: undefined,
        details: undefined
      })
    })

    it('handles unknown error types', () => {
      const result = handleSupabaseError('String error')
      
      expect(result).toEqual({
        message: 'String error',
        code: undefined,
        statusCode: undefined,
        details: undefined
      })
    })
  })

  describe('ERROR_CODES', () => {
    it('contains all expected error codes', () => {
      expect(ERROR_CODES.UNAUTHORIZED).toBe('UNAUTHORIZED')
      expect(ERROR_CODES.FORBIDDEN).toBe('FORBIDDEN')
      expect(ERROR_CODES.INVALID_CREDENTIALS).toBe('INVALID_CREDENTIALS')
      expect(ERROR_CODES.VALIDATION_ERROR).toBe('VALIDATION_ERROR')
      expect(ERROR_CODES.INVALID_INPUT).toBe('INVALID_INPUT')
      expect(ERROR_CODES.NOT_FOUND).toBe('NOT_FOUND')
      expect(ERROR_CODES.USER_NOT_FOUND).toBe('USER_NOT_FOUND')
      expect(ERROR_CODES.PROFILE_NOT_FOUND).toBe('PROFILE_NOT_FOUND')
      expect(ERROR_CODES.INTERNAL_ERROR).toBe('INTERNAL_ERROR')
      expect(ERROR_CODES.DATABASE_ERROR).toBe('DATABASE_ERROR')
      expect(ERROR_CODES.EXTERNAL_SERVICE_ERROR).toBe('EXTERNAL_SERVICE_ERROR')
      expect(ERROR_CODES.RATE_LIMITED).toBe('RATE_LIMITED')
      expect(ERROR_CODES.PAYMENT_FAILED).toBe('PAYMENT_FAILED')
      expect(ERROR_CODES.PAYMENT_CANCELLED).toBe('PAYMENT_CANCELLED')
    })
  })

  describe('HTTP_STATUS', () => {
    it('contains all expected HTTP status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200)
      expect(HTTP_STATUS.CREATED).toBe(201)
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400)
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401)
      expect(HTTP_STATUS.FORBIDDEN).toBe(403)
      expect(HTTP_STATUS.NOT_FOUND).toBe(404)
      expect(HTTP_STATUS.CONFLICT).toBe(409)
      expect(HTTP_STATUS.UNPROCESSABLE_ENTITY).toBe(422)
      expect(HTTP_STATUS.TOO_MANY_REQUESTS).toBe(429)
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500)
    })
  })
})


