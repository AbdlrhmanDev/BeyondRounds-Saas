# BeyondRounds System Test Guide

This guide explains how to run and understand the comprehensive system tests for BeyondRounds.

## Overview

The system test suite validates the entire BeyondRounds platform including:

- **Authentication System**: User registration, login, password reset
- **Profile Management**: Profile creation, updates, validation
- **Matching Algorithm**: User matching, group formation
- **Chat System**: Message sending, real-time updates, chat rooms
- **API Endpoints**: Dashboard, matching, profile APIs
- **Database Operations**: CRUD operations, queries, relationships
- **UI Components**: Form validation, loading states, user interactions
- **Error Handling**: Authentication errors, database errors, network errors
- **Performance**: Large dataset handling, concurrent requests
- **Security**: Permission validation, input sanitization, SQL injection prevention

## Test Files

### Main Test Suite
- `tests/system-comprehensive.test.tsx` - Comprehensive system test suite
- `scripts/run-system-tests.js` - Test runner script

### Existing Test Suites
- `tests/auth/` - Authentication tests
- `tests/components/` - Component tests
- `tests/api/` - API endpoint tests
- `tests/database/` - Database operation tests
- `tests/integration/` - Integration tests
- `tests/performance/` - Performance tests

## Running Tests

### Quick System Check
```bash
npm run test:system-quick
```
Runs a quick health check of the system without executing full test suite.

### Comprehensive System Tests
```bash
npm run test:system
```
Runs the full comprehensive system test suite with coverage reporting.

### System Test Runner
```bash
npm run test:system-runner
```
Runs the complete test runner script that includes:
- TypeScript type checking
- Code linting
- Unit tests
- Integration tests
- API tests
- Database tests
- System tests
- Performance tests

### Individual Test Categories
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# API tests
npm run test:api

# Database tests
npm run test:database

# Performance tests
npm run test:performance

# All tests
npm run test:all
```

### Watch Mode
```bash
# Watch system tests
npm run test:system:watch

# Watch all tests
npm run test:watch
```

## Test Structure

### Authentication Tests
- User registration flow
- Login/logout functionality
- Password reset process
- Session management
- Permission validation

### Profile Management Tests
- Profile creation
- Profile updates
- Data validation
- File uploads
- Profile completeness

### Matching Algorithm Tests
- User compatibility scoring
- Group formation logic
- Preference matching
- Location-based matching
- Specialty-based matching

### Chat System Tests
- Message sending/receiving
- Real-time updates
- Chat room management
- File sharing
- Message history

### API Endpoint Tests
- Request/response validation
- Authentication middleware
- Error handling
- Rate limiting
- Data transformation

### Database Tests
- CRUD operations
- Query optimization
- Relationship integrity
- Transaction handling
- Data consistency

### UI Component Tests
- Form validation
- User interactions
- Loading states
- Error display
- Responsive design

### Performance Tests
- Large dataset queries
- Concurrent request handling
- Memory usage
- Response times
- Database performance

### Security Tests
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Permission checks

## Test Configuration

### Jest Configuration
The tests use Jest with the following configuration:
- TypeScript support
- React Testing Library
- Mock implementations
- Coverage reporting
- Parallel execution

### Mock Setup
Tests use comprehensive mocks for:
- Supabase client
- Next.js navigation
- Environment variables
- External APIs
- Database operations

### Environment Variables
Required environment variables for testing:
```env
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-role-key
```

## Test Results

### Coverage Reports
Test coverage reports are generated in:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format coverage data

### Test Output
Tests provide detailed output including:
- Test execution status
- Error messages
- Performance metrics
- Coverage statistics
- System health status

## Troubleshooting

### Common Issues

1. **Test Timeout Errors**
   - Increase Jest timeout in `jest.config.js`
   - Check for infinite loops in test code
   - Verify mock implementations

2. **Mock Failures**
   - Ensure all dependencies are properly mocked
   - Check mock return values
   - Verify mock function calls

3. **Environment Issues**
   - Verify environment variables are set
   - Check file permissions
   - Ensure all dependencies are installed

4. **Database Connection Issues**
   - Tests use mocked database operations
   - No actual database connection required
   - Check mock implementations

### Debug Mode
Run tests with debug output:
```bash
DEBUG=* npm run test:system
```

### Verbose Output
Get detailed test output:
```bash
npm run test:system -- --verbose
```

## Best Practices

### Writing Tests
1. **Test Isolation**: Each test should be independent
2. **Mock External Dependencies**: Use mocks for external services
3. **Clear Test Names**: Descriptive test names that explain the scenario
4. **Assertions**: Use specific assertions, not just truthy checks
5. **Cleanup**: Clean up after each test

### Test Organization
1. **Group Related Tests**: Use `describe` blocks for logical grouping
2. **Setup/Teardown**: Use `beforeEach` and `afterEach` for common setup
3. **Test Data**: Use consistent test data across tests
4. **Mock Management**: Reset mocks between tests

### Performance Considerations
1. **Parallel Execution**: Tests run in parallel by default
2. **Mock Heavy Operations**: Mock database and API calls
3. **Timeout Management**: Set appropriate timeouts
4. **Memory Management**: Clean up large objects

## Continuous Integration

### GitHub Actions
Tests are configured to run in CI/CD pipelines:
- Type checking
- Linting
- Unit tests
- Integration tests
- Coverage reporting

### Pre-commit Hooks
Consider adding pre-commit hooks to run tests:
```bash
npm install --save-dev husky lint-staged
```

## Contributing

### Adding New Tests
1. Follow existing test patterns
2. Add appropriate mocks
3. Include edge cases
4. Update documentation
5. Ensure tests pass

### Test Maintenance
1. Keep tests up to date with code changes
2. Remove obsolete tests
3. Update mocks when APIs change
4. Monitor test performance
5. Review coverage reports

## Support

For issues with the test suite:
1. Check this documentation
2. Review test output and error messages
3. Check mock implementations
4. Verify environment setup
5. Consult the main project documentation
