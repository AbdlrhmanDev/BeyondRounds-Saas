# Error Handling System

This directory contains a comprehensive error handling system for the BeyondRounds application, providing structured error classes, validation, and centralized error management.

## Structure

```
lib/errors/
├── api-errors.ts      # API-related error classes
├── validation-errors.ts # Validation error classes
├── custom-errors.ts   # Business logic error classes
├── index.ts          # Main export file
└── README.md         # This documentation
```

## Error Class Hierarchy

### Base Classes
- **`BaseAPIError`**: Abstract base class for all API errors
- **`BaseValidationError`**: Base class for validation errors
- **`BusinessLogicError`**: Base class for business logic errors

### HTTP Status Errors
- **`BadRequestError`** (400): Invalid request data
- **`UnauthorizedError`** (401): Authentication required
- **`ForbiddenError`** (403): Access denied
- **`NotFoundError`** (404): Resource not found
- **`ConflictError`** (409): Resource conflict
- **`UnprocessableEntityError`** (422): Validation failed
- **`RateLimitError`** (429): Too many requests
- **`InternalServerError`** (500): Server error

### Authentication & Authorization
- **`AuthenticationError`**: Invalid credentials
- **`TokenExpiredError`**: JWT token expired
- **`InvalidTokenError`**: Invalid JWT token
- **`InsufficientPermissionsError`**: Insufficient permissions

### Validation Errors
- **Field Validation**: Required, length, format validation
- **Type Validation**: Email, phone, URL, number validation
- **File Validation**: Size, type, format validation
- **Password Validation**: Strength requirements
- **Array Validation**: Min/max items, uniqueness

### Business Logic Errors
- **User Errors**: Not found, already exists, disabled
- **Profile Errors**: Incomplete, not found
- **Matching Errors**: Already liked, cannot match self
- **Group Errors**: Full, not found, membership issues
- **Messaging Errors**: Conversation, message issues
- **Payment Errors**: Subscription, payment method issues
- **Verification Errors**: Document, verification issues

## Usage Examples

### Basic Error Handling

```typescript
import { 
  NotFoundError, 
  ValidationErrors, 
  UserNotFoundError,
  ErrorHandler 
} from '@/lib/errors'

// Throw specific errors
throw new UserNotFoundError('user123')
throw new ValidationErrors([new RequiredFieldError('email')])

// Handle errors
try {
  // Some operation
} catch (error) {
  const errorResponse = ErrorHandler.handleError(error)
  return Response.json(errorResponse, { status: errorResponse.statusCode })
}
```

### Validation Error Handling

```typescript
import { 
  RequiredFieldError, 
  InvalidEmailError, 
  MinLengthError,
  ValidationErrors 
} from '@/lib/errors'

// Create validation errors
const errors = []

if (!email) {
  errors.push(new RequiredFieldError('email'))
} else if (!isValidEmail(email)) {
  errors.push(new InvalidEmailError('email', email))
}

if (password && password.length < 8) {
  errors.push(new MinLengthError('password', password, 8))
}

if (errors.length > 0) {
  throw new ValidationErrors(errors)
}
```

### API Error Handling

```typescript
import { 
  BadRequestError, 
  NotFoundError, 
  ForbiddenError,
  createAPIError 
} from '@/lib/errors'

// Throw specific API errors
if (!user) {
  throw new NotFoundError('User not found')
}

if (!user.isVerified) {
  throw new ForbiddenError('Account not verified')
}

if (invalidData) {
  throw new BadRequestError('Invalid request data')
}

// Create errors dynamically
const error = createAPIError(400, 'Custom error message', 'CUSTOM_ERROR')
```

### Custom Business Logic Errors

```typescript
import { 
  MatchNotFoundError, 
  AlreadyLikedError, 
  CannotMatchSelfError,
  GroupFullError 
} from '@/lib/errors'

// Matching logic
if (userId === targetUserId) {
  throw new CannotMatchSelfError(userId)
}

if (alreadyLiked) {
  throw new AlreadyLikedError(userId, targetUserId)
}

// Group logic
if (group.members.length >= group.maxSize) {
  throw new GroupFullError(groupId, group.members.length, group.maxSize)
}
```

### Error Middleware

```typescript
import { globalErrorHandler, ErrorContext } from '@/lib/errors'

// Express.js middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const context: ErrorContext = {
    requestId: req.headers['x-request-id'] as string,
    userId: req.user?.id,
    path: req.path,
    method: req.method,
    userAgent: req.headers['user-agent'],
    ip: req.ip,
    timestamp: new Date(),
  }

  const errorResponse = globalErrorHandler(error, context)
  
  res.status(errorResponse.statusCode).json(errorResponse)
})
```

### React Error Boundary

```typescript
import { ErrorBoundary, ErrorBoundaryProps } from '@/lib/errors'

const AppErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback: Fallback,
  onError 
}) => {
  return (
    <ErrorBoundary
      fallback={Fallback || DefaultErrorFallback}
      onError={(error, errorInfo) => {
        // Log error
        console.error('React Error Boundary caught an error:', error, errorInfo)
        
        // Call custom error handler
        onError?.(error, errorInfo)
        
        // Send to monitoring service
        // errorMonitoringService.captureException(error, { extra: errorInfo })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```

## Error Response Format

### Single Error Response
```json
{
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "field": "email",
    "value": "invalid-email",
    "constraint": "email"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Multiple Validation Errors
```json
{
  "statusCode": 400,
  "errorCode": "MULTIPLE_VALIDATION_ERRORS",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "value": "invalid-email",
      "constraint": "email",
      "message": "البريد الإلكتروني غير صحيح"
    },
    {
      "field": "password",
      "value": "123",
      "constraint": "minLength",
      "message": "يجب أن يكون النص 8 أحرف على الأقل"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Best Practices

### 1. **Use Specific Error Types**
```typescript
// Good: Specific error type
throw new UserNotFoundError('user123')

// Bad: Generic error
throw new Error('User not found')
```

### 2. **Include Context Information**
```typescript
// Good: Include relevant context
throw new AlreadyLikedError(userId, targetUserId, { 
  timestamp: new Date(),
  source: 'matching-service' 
})

// Bad: Minimal context
throw new Error('Already liked')
```

### 3. **Handle Errors Appropriately**
```typescript
// Good: Proper error handling
try {
  const user = await findUser(userId)
  if (!user) {
    throw new UserNotFoundError(userId)
  }
} catch (error) {
  if (error instanceof UserNotFoundError) {
    return Response.json({ error: 'User not found' }, { status: 404 })
  }
  throw error // Re-throw unexpected errors
}
```

### 4. **Log Errors with Context**
```typescript
// Good: Log with context
ErrorHandler.logError(error, {
  userId,
  action: 'createMatch',
  requestId: req.headers['x-request-id']
})

// Bad: Log without context
console.error(error)
```

### 5. **Use Error Boundaries**
```typescript
// Good: Wrap components with error boundaries
<ErrorBoundary fallback={ErrorFallback}>
  <UserProfile userId={userId} />
</ErrorBoundary>
```

## Error Monitoring Integration

### Sentry Integration
```typescript
import * as Sentry from '@sentry/nextjs'

// In error handler
if (ErrorHandler.shouldReportError(error)) {
  Sentry.captureException(error, {
    tags: {
      errorType: error.constructor.name,
      errorCode: error.errorCode,
    },
    extra: context,
  })
}
```

### LogRocket Integration
```typescript
import LogRocket from 'logrocket'

// In error handler
if (ErrorHandler.shouldReportError(error)) {
  LogRocket.captureException(error, {
    extra: {
      errorType: error.constructor.name,
      errorCode: error.errorCode,
      context,
    },
  })
}
```

## Testing Error Handling

### Unit Tests
```typescript
import { UserNotFoundError, ValidationErrors } from '@/lib/errors'

describe('Error Handling', () => {
  it('should create UserNotFoundError with correct properties', () => {
    const error = new UserNotFoundError('user123')
    
    expect(error.statusCode).toBe(404)
    expect(error.errorCode).toBe('USER_NOT_FOUND')
    expect(error.message).toBe('الحساب غير موجود')
    expect(error.details.userId).toBe('user123')
  })

  it('should handle ValidationErrors correctly', () => {
    const errors = [
      new RequiredFieldError('email'),
      new InvalidEmailError('email', 'invalid-email')
    ]
    const validationError = new ValidationErrors(errors)
    
    expect(validationError.errors).toHaveLength(2)
    expect(validationError.hasFieldError('email')).toBe(true)
  })
})
```

### Integration Tests
```typescript
describe('API Error Handling', () => {
  it('should return 404 for UserNotFoundError', async () => {
    const response = await request(app)
      .get('/api/users/nonexistent')
      .expect(404)
    
    expect(response.body.errorCode).toBe('USER_NOT_FOUND')
    expect(response.body.message).toBe('الحساب غير موجود')
  })
})
```

## Migration Guide

When migrating from generic error handling:

1. **Identify Error Patterns**: Look for common error scenarios
2. **Create Specific Error Classes**: Replace generic errors with specific ones
3. **Update Error Handling**: Use ErrorHandler.handleError()
4. **Add Error Boundaries**: Wrap React components
5. **Update Tests**: Test specific error scenarios
6. **Monitor Errors**: Set up error monitoring

## Contributing

When adding new error types:

1. **Choose the Right Base Class**: API, Validation, or Custom
2. **Follow Naming Conventions**: Use descriptive names ending with "Error"
3. **Include Relevant Properties**: Add context-specific properties
4. **Add Helper Functions**: Create utility functions for common checks
5. **Update Documentation**: Add examples and usage patterns
6. **Write Tests**: Ensure proper error behavior
