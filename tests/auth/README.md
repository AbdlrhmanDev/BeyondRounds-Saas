# BeyondRounds Authentication & Authorization Test Suite

This comprehensive test suite covers all aspects of authentication and authorization in the BeyondRounds application.

## Test Structure

### 1. Middleware Authentication Tests (`middleware-auth.test.ts`)
- **Purpose**: Tests Next.js middleware authentication logic
- **Coverage**:
  - Public route access (authenticated and unauthenticated)
  - Protected route access control
  - Admin route authorization
  - Auth page redirect logic
  - Error handling and cookie management
  - URL parameter preservation

### 2. Row Level Security (RLS) Policy Tests (`rls-policies.test.ts`)
- **Purpose**: Tests database-level security policies
- **Coverage**:
  - Profile access permissions (own vs others)
  - Admin role privileges
  - Match member access control
  - Chat message permissions
  - User preferences privacy
  - Service role operations
  - RLS helper functions

### 3. Admin Role Authorization Tests (`admin-authorization.test.tsx`)
- **Purpose**: Tests admin panel access and operations
- **Coverage**:
  - Admin access control
  - Admin operations (user management, role changes, bans)
  - Verification request management
  - System statistics access
  - Role-based UI elements
  - Security measures and audit logging

### 4. User Permission and Access Control Tests (`user-permissions.test.ts`)
- **Purpose**: Tests user-level permissions and data access
- **Coverage**:
  - Profile access and modification rights
  - Match membership permissions
  - Chat message access control
  - Notification privacy
  - Preference management
  - Verification request handling
  - Role-based access control
  - Data privacy controls

### 5. API Endpoint Authorization Tests (`api-authorization.test.ts`)
- **Purpose**: Tests API endpoint security and authorization
- **Coverage**:
  - Admin API endpoint protection
  - User profile API security
  - Match API access control
  - Chat API authorization
  - Verification API permissions
  - Rate limiting and security measures
  - Request validation
  - Error handling

### 6. Session Management and Security Tests (`session-security.test.ts`)
- **Purpose**: Tests session lifecycle and security measures
- **Coverage**:
  - Session creation and validation
  - Token refresh mechanisms
  - Security measures (fingerprinting, activity detection)
  - Session timeout policies
  - Concurrent session limits
  - Secure storage and integrity
  - State management
  - Cleanup and termination
  - Monitoring and logging

### 7. Password Reset and Email Verification Tests (`password-reset-verification.test.tsx`)
- **Purpose**: Tests password recovery and email verification flows
- **Coverage**:
  - Password reset request flow
  - Reset link validation and completion
  - Email verification during signup
  - Email change verification
  - Security validations
  - Rate limiting
  - Error handling and recovery

### 8. Comprehensive Integration Tests (`auth-integration.test.tsx`)
- **Purpose**: Tests end-to-end authentication flows
- **Coverage**:
  - Complete user registration flow
  - Login and dashboard access
  - Admin access flow
  - Session management integration
  - Profile management
  - Cross-component state consistency
  - Error recovery and resilience

## Running the Tests

### Run All Authentication Tests
```bash
npm test tests/auth/
```

### Run Individual Test Suites
```bash
# Middleware tests
npm test tests/auth/middleware-auth.test.ts

# RLS policy tests
npm test tests/auth/rls-policies.test.ts

# Admin authorization tests
npm test tests/auth/admin-authorization.test.tsx

# User permissions tests
npm test tests/auth/user-permissions.test.ts

# API authorization tests
npm test tests/auth/api-authorization.test.ts

# Session security tests
npm test tests/auth/session-security.test.ts

# Password reset tests
npm test tests/auth/password-reset-verification.test.tsx

# Integration tests
npm test tests/auth/auth-integration.test.tsx
```

### Run with Coverage
```bash
npm test tests/auth/ -- --coverage
```

### Run in Watch Mode
```bash
npm test tests/auth/ -- --watch
```

## Test Configuration

### Required Dependencies
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@tanstack/react-query` (for integration tests)
- `jest`
- `jest-environment-jsdom`

### Mock Setup
The tests use comprehensive mocking for:
- Supabase client and auth methods
- Next.js router and navigation
- Authentication hooks
- API endpoints

### Environment Variables
Ensure these are set for testing:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_test_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_test_service_role_key
```

## Test Coverage Goals

### Authentication Flow Coverage
- ✅ User registration and signup
- ✅ Email verification
- ✅ User login and logout
- ✅ Password reset flow
- ✅ Session management
- ✅ Token refresh

### Authorization Coverage
- ✅ Role-based access control (user, admin, moderator)
- ✅ Resource-level permissions
- ✅ API endpoint protection
- ✅ Database row-level security
- ✅ Admin operations
- ✅ User data privacy

### Security Coverage
- ✅ Session security measures
- ✅ Token validation and expiration
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling
- ✅ Audit logging

### Integration Coverage
- ✅ End-to-end user flows
- ✅ Component state consistency
- ✅ Error recovery
- ✅ Cross-browser compatibility
- ✅ Performance under load

## Best Practices

### Writing New Auth Tests
1. **Mock Dependencies**: Always mock external dependencies (Supabase, Next.js)
2. **Test Real Scenarios**: Focus on actual user workflows
3. **Security First**: Test both positive and negative security cases
4. **Error Handling**: Test error conditions and recovery
5. **State Consistency**: Ensure auth state remains consistent

### Test Data Management
- Use factory functions for creating test data
- Keep test data minimal and focused
- Clean up after tests to prevent interference

### Performance Considerations
- Use `jest.useFakeTimers()` for time-dependent tests
- Mock heavy operations (API calls, database queries)
- Run tests in parallel when possible

## Debugging Tests

### Common Issues
1. **Mock Not Working**: Check mock setup in `beforeEach`
2. **Async Issues**: Use `waitFor` for async operations
3. **State Persistence**: Clear mocks between tests
4. **Component Not Rendering**: Check test wrapper setup

### Debug Commands
```bash
# Run with debug output
npm test tests/auth/ -- --verbose

# Run single test with debugging
npm test tests/auth/auth-integration.test.tsx -- --testNamePattern="user can login"
```

## Contributing

When adding new authentication features:

1. **Add Tests First**: Write tests before implementing features
2. **Update Coverage**: Ensure new code paths are tested
3. **Security Review**: Have security-critical tests reviewed
4. **Documentation**: Update this README with new test descriptions

## Security Considerations

These tests cover critical security aspects:

- **Authentication Bypass**: Tests ensure unauthenticated users cannot access protected resources
- **Authorization Escalation**: Tests prevent users from accessing higher-privilege operations
- **Data Leakage**: Tests ensure users can only access their own data
- **Session Security**: Tests validate session management and token handling
- **Input Validation**: Tests ensure malicious input is properly handled

## Maintenance

### Regular Updates
- Review tests monthly for coverage gaps
- Update mocks when dependencies change
- Add new test cases for reported security issues
- Benchmark test performance and optimize as needed

### Monitoring
- Track test execution time
- Monitor test failure rates
- Review security test results regularly
- Update test data to reflect current threats

---

**Note**: These tests are critical for application security. Any failures in the authentication/authorization test suite should be treated as high priority and resolved immediately.


