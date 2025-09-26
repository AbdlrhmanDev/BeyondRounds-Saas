# Constants Layer

This directory contains centralized constants for the BeyondRounds application, organized by functionality for better maintainability and consistency.

## Structure

```
lib/constants/
├── routes.ts       # Route constants
├── api.ts         # API endpoints
├── messages.ts    # Error/success messages
├── config.ts      # App configuration
├── index.ts       # Main export file
└── README.md      # This documentation
```

## Files Overview

### `routes.ts`
Contains all application routes organized by type:
- **Public Routes**: Home, about, FAQ, etc.
- **Authentication Routes**: Login, signup, password reset
- **Protected Routes**: Dashboard, profile, matches
- **Admin Routes**: Admin panel, user management
- **API Routes**: Backend API endpoints
- **Dynamic Routes**: Parameterized routes with helper functions

### `api.ts`
Centralized API endpoint definitions:
- **Authentication Endpoints**: Login, signup, token refresh
- **User Endpoints**: Profile management, user operations
- **Matching Endpoints**: Match creation, liking, group matching
- **Messaging Endpoints**: Conversations, message sending
- **Payment Endpoints**: Subscription management, billing
- **Admin Endpoints**: Administrative operations
- **File Upload Endpoints**: Document and image uploads

### `messages.ts`
Localized messages for the application:
- **Success Messages**: Confirmation messages in Arabic
- **Error Messages**: Error descriptions and troubleshooting
- **Validation Messages**: Form validation feedback
- **Warning Messages**: User warnings and confirmations
- **Info Messages**: General information and placeholders

### `config.ts`
Application configuration constants:
- **Environment Configuration**: Development/production settings
- **Authentication Configuration**: JWT, session settings
- **File Upload Configuration**: Size limits, allowed types
- **Payment Configuration**: Stripe settings, subscription plans
- **Matching Configuration**: Algorithm settings, thresholds
- **Feature Flags**: Toggle features on/off
- **UI Configuration**: Theme, language, pagination settings

## Usage

### Importing Constants

```typescript
// Import specific constants
import { PUBLIC_ROUTES, AUTH_ROUTES } from '@/lib/constants/routes'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants/messages'
import { APP_CONFIG, AUTH_CONFIG } from '@/lib/constants/config'

// Import all constants
import * as Constants from '@/lib/constants'

// Import from main index
import { 
  PUBLIC_ROUTES, 
  SUCCESS_MESSAGES, 
  APP_CONFIG 
} from '@/lib/constants'
```

### Using Route Constants

```typescript
import { PUBLIC_ROUTES, DYNAMIC_ROUTES } from '@/lib/constants'

// Static routes
router.push(PUBLIC_ROUTES.HOME)
router.push(AUTH_ROUTES.LOGIN)

// Dynamic routes
const userProfileUrl = DYNAMIC_ROUTES.USER_PROFILE('user123')
const matchDetailsUrl = DYNAMIC_ROUTES.MATCH_DETAILS('match456')
```

### Using API Endpoints

```typescript
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from '@/lib/constants'

// API calls
const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, {
  method: 'POST',
  body: JSON.stringify(credentials)
})

const userProfile = await fetch(`${API_BASE_URL}${USER_ENDPOINTS.PROFILE}`)
```

### Using Messages

```typescript
import { SUCCESS_MESSAGES, ERROR_MESSAGES, getValidationMessage } from '@/lib/constants'

// Success messages
toast.success(SUCCESS_MESSAGES.PROFILE_UPDATED)

// Error messages
toast.error(ERROR_MESSAGES.INVALID_CREDENTIALS)

// Validation messages
const emailError = getValidationMessage('INVALID_EMAIL')
const minLengthError = getValidationMessage('MIN_LENGTH', 8)
```

### Using Configuration

```typescript
import { APP_CONFIG, AUTH_CONFIG, isFeatureEnabled } from '@/lib/constants'

// App configuration
console.log(APP_CONFIG.NAME, APP_CONFIG.VERSION)

// Feature flags
if (isFeatureEnabled('ENABLE_CHAT')) {
  // Show chat feature
}

// Auth configuration
const tokenExpiry = AUTH_CONFIG.JWT_EXPIRES_IN
```

## Benefits

### 🎯 **Centralized Management**
- All constants in one place
- Easy to find and update
- Consistent naming conventions

### 🔧 **Type Safety**
- TypeScript support with proper typing
- IntelliSense autocomplete
- Compile-time error checking

### 🌍 **Internationalization**
- Arabic messages included
- Easy to extend for multiple languages
- Consistent message formatting

### 🚀 **Performance**
- No runtime string concatenation
- Tree-shaking support
- Optimized bundle size

### 🛠️ **Maintainability**
- Clear organization by functionality
- Easy to refactor and update
- Version control friendly

## Best Practices

### 1. **Naming Conventions**
- Use UPPER_SNAKE_CASE for constants
- Group related constants together
- Use descriptive names

### 2. **Organization**
- Keep related constants in the same file
- Use consistent structure across files
- Add JSDoc comments for complex constants

### 3. **Usage**
- Import only what you need
- Use constants instead of hardcoded strings
- Leverage TypeScript for type safety

### 4. **Updates**
- Update constants when adding new features
- Maintain backward compatibility
- Document breaking changes

## Migration Guide

When migrating from hardcoded strings to constants:

1. **Identify hardcoded values** in your codebase
2. **Add to appropriate constants file** if not exists
3. **Replace hardcoded values** with constant imports
4. **Test thoroughly** to ensure no regressions
5. **Update documentation** if needed

## Contributing

When adding new constants:

1. **Choose the right file** based on functionality
2. **Follow naming conventions** and structure
3. **Add TypeScript types** if needed
4. **Update index.ts** exports
5. **Add documentation** for complex constants
6. **Test your changes** thoroughly
