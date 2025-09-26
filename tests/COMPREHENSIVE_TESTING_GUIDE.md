# BeyondRounds Comprehensive Testing Guide

This guide covers the complete testing strategy and implementation for the BeyondRounds medical professional matching platform.

## 📋 Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Suite Overview](#test-suite-overview)
3. [Test Structure](#test-structure)
4. [Running Tests](#running-tests)
5. [Test Categories](#test-categories)
6. [Coverage Requirements](#coverage-requirements)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## 🎯 Testing Philosophy

Our testing approach follows the **Testing Pyramid** principle:

```
     /\
    /  \    E2E Tests (Few)
   /____\   
  /      \  Integration Tests (Some)
 /________\ 
/          \ Unit Tests (Many)
\__________/
```

- **Unit Tests (70%)**: Fast, isolated tests for individual components and functions
- **Integration Tests (20%)**: Test component interactions and workflows
- **End-to-End Tests (10%)**: Full system testing with real user scenarios

## 🏗️ Test Suite Overview

### Core Test Files

```
tests/
├── comprehensive-all-systems-master.test.tsx    # Master comprehensive test
├── api/comprehensive-api.test.ts                # All API routes
├── components/comprehensive-components.test.tsx  # All React components
├── database/comprehensive-database.test.ts      # Database operations
├── integration/comprehensive-integration.test.tsx # E2E workflows
├── performance/comprehensive-performance.test.ts # Performance testing
└── test-environment.js                         # Test utilities
```

### System Coverage

| System | Test File | Coverage |
|--------|-----------|----------|
| Authentication | `comprehensive-all-systems-master.test.tsx` | Login, signup, verification, password reset |
| Profile Management | `comprehensive-components.test.tsx` | Profile creation, editing, validation |
| Matching Algorithm | `comprehensive-integration.test.tsx` | Weekly matching, compatibility scoring |
| Chat System | `comprehensive-api.test.ts` | Real-time messaging, subscriptions |
| Admin Dashboard | `comprehensive-database.test.ts` | User management, analytics |
| Payment System | `comprehensive-integration.test.tsx` | Stripe integration, webhooks |
| Database Operations | `comprehensive-database.test.ts` | CRUD, RLS policies, complex queries |
| Performance | `comprehensive-performance.test.ts` | Load testing, memory usage |

## 🎮 Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:api
npm run test:database
npm run test:performance
npm run test:comprehensive

# Run full comprehensive suite
npm run test:full-suite
```

### Advanced Usage

```bash
# Use the comprehensive test runner
node scripts/comprehensive-test-runner.js

# Run specific suite with options
node scripts/comprehensive-test-runner.js unit --coverage --verbose

# Run all tests with performance monitoring
node scripts/comprehensive-test-runner.js all --coverage --bail

# Watch mode for development
npm run test:watch
```

### Test Runner Options

| Option | Description |
|--------|-------------|
| `--coverage, -c` | Generate coverage reports |
| `--watch, -w` | Run tests in watch mode |
| `--verbose, -v` | Show detailed output |
| `--bail, -b` | Stop on first failure |
| `--silent, -s` | Suppress console output |
| `--parallel, -p` | Run tests in parallel |

## 📊 Test Categories

### 1. Unit Tests (`tests/components/`, `tests/hooks/`, `tests/lib/`)

**Purpose**: Test individual components and functions in isolation

**Examples**:
- Button component renders correctly
- Form validation functions work properly
- Utility functions return expected values

**Command**: `npm run test:unit`

### 2. Integration Tests (`tests/integration/`)

**Purpose**: Test complete user workflows and system interactions

**Examples**:
- User registration flow from signup to profile completion
- Matching algorithm execution and group formation
- Payment processing from checkout to confirmation

**Command**: `npm run test:integration`

### 3. API Tests (`tests/api/`)

**Purpose**: Test all API endpoints and route handlers

**Examples**:
- Authentication endpoints handle login/signup correctly
- Profile API creates and updates user data
- Chat API sends and receives messages properly

**Command**: `npm run test:api`

### 4. Database Tests (`tests/database/`)

**Purpose**: Test database operations, queries, and security

**Examples**:
- CRUD operations on all tables
- Row Level Security (RLS) policies enforcement
- Complex queries and joins performance

**Command**: `npm run test:database`

### 5. Performance Tests (`tests/performance/`)

**Purpose**: Test system performance and resource usage

**Examples**:
- Load testing with concurrent users
- Memory usage and leak detection
- Database query performance optimization

**Command**: `npm run test:performance`

### 6. Comprehensive Tests (`tests/comprehensive-all-systems-master.test.tsx`)

**Purpose**: Master test file covering all systems integration

**Examples**:
- Complete user journey from signup to matching
- Cross-system data consistency
- Error handling and recovery

**Command**: `npm run test:comprehensive`

## 📈 Coverage Requirements

### Minimum Coverage Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Lines | 70% | 85% |
| Functions | 70% | 85% |
| Branches | 70% | 80% |
| Statements | 70% | 85% |

### Coverage by Category

| Category | Expected Coverage |
|----------|------------------|
| Unit Tests | 90%+ |
| Integration Tests | 80%+ |
| API Tests | 85%+ |
| Database Tests | 75%+ |
| Performance Tests | N/A |

### Excluded from Coverage

- Type definition files (`*.d.ts`)
- Story files (`*.stories.*`)
- Test files themselves
- Next.js layout files
- Configuration files

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js', '<rootDir>/tests/test-environment.js'],
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // ... other configurations
}
```

### Test Environment (`tests/test-environment.js`)

Provides:
- Global test utilities (`testUtils`)
- Mock implementations for browser APIs
- Performance monitoring tools
- Data generators for consistent test data

## 🛠️ Test Utilities

### Data Generators

```javascript
// Generate test user
const user = testUtils.generateTestUser(1, { specialty: 'Cardiology' })

// Generate test match
const match = testUtils.generateTestMatch(1, { compatibility_score: 0.9 })

// Generate test message
const message = testUtils.generateTestMessage(1, 'match-1', 'user-1')
```

### Component Testing

```javascript
// Render with providers
const { getByText } = testUtils.renderWithProviders(<MyComponent />)

// Fill form data
await testUtils.fillForm(form, { name: 'John', email: 'john@test.com' })
```

### Performance Monitoring

```javascript
const monitor = testUtils.createPerformanceMonitor()
monitor.start()
// ... test operations
monitor.end()
console.log(`Duration: ${monitor.getDuration()}ms`)
```

## ✅ Best Practices

### 1. Test Structure

```javascript
describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  })

  afterEach(() => {
    // Cleanup after each test
  })

  describe('specific functionality', () => {
    it('should do something specific', () => {
      // Test implementation
    })
  })
})
```

### 2. Test Naming

- Use descriptive test names that explain the expected behavior
- Follow the pattern: "should [expected behavior] when [condition]"
- Group related tests in `describe` blocks

### 3. Test Data

- Use the provided data generators for consistency
- Avoid hardcoded values where possible
- Create realistic test data that reflects production scenarios

### 4. Mocking

- Mock external dependencies (APIs, databases, third-party services)
- Use the provided mock utilities
- Reset mocks between tests

### 5. Assertions

- Test behavior, not implementation details
- Use appropriate Jest matchers
- Test user-visible outcomes

### 6. Error Testing

- Test both success and error scenarios
- Verify error messages and handling
- Test edge cases and boundary conditions

## 🐛 Troubleshooting

### Common Issues

#### 1. Import Errors

**Problem**: Module import errors in tests

**Solution**: Check path mapping in `jest.config.js`:

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

#### 2. Async Test Failures

**Problem**: Tests failing due to async operations

**Solution**: Use proper async/await or `waitFor`:

```javascript
await waitFor(() => {
  expect(screen.getByText('Loading')).not.toBeInTheDocument()
})
```

#### 3. Mock Issues

**Problem**: Mocks not working correctly

**Solution**: Ensure mocks are properly reset:

```javascript
beforeEach(() => {
  jest.clearAllMocks()
})
```

#### 4. Timeout Errors

**Problem**: Tests timing out

**Solution**: Increase timeout in configuration:

```javascript
testTimeout: 15000, // 15 seconds
```

### Debug Tips

1. **Use `screen.debug()`** to inspect rendered DOM
2. **Add `--verbose` flag** for detailed test output
3. **Use `--runInBand`** for debugging race conditions
4. **Check console** for warnings and errors

### Performance Issues

1. **Slow tests**: Use `--parallel` flag or optimize test data
2. **Memory leaks**: Check for proper cleanup in `afterEach`
3. **Large datasets**: Use pagination or streaming in tests

## 📋 Test Checklist

Before deploying, ensure:

- [ ] All test suites pass
- [ ] Coverage thresholds are met
- [ ] No console errors or warnings
- [ ] Performance tests show acceptable results
- [ ] Integration tests cover main user flows
- [ ] Error scenarios are tested
- [ ] Edge cases are covered
- [ ] Documentation is updated

## 🔄 Continuous Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Push to main branch
- Manual workflow dispatch

### Coverage Reports

- Generated for each test run
- Uploaded to coverage services
- Must meet minimum thresholds

### Quality Gates

- All tests must pass
- Coverage thresholds must be met
- No high-severity linting errors
- Performance benchmarks must be within limits

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Supabase Testing Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

## 🤝 Contributing

When adding new features:

1. **Write tests first** (TDD approach)
2. **Maintain coverage** levels
3. **Follow naming conventions**
4. **Update documentation**
5. **Test error scenarios**
6. **Add performance tests** for critical paths

For questions or issues with tests, please refer to this documentation or create an issue in the project repository.

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintainer**: BeyondRounds Development Team



