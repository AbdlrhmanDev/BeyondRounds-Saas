# BeyondRounds Comprehensive Test Suite

This directory contains a complete testing framework for the BeyondRounds medical professional matching platform, covering all system components with comprehensive test coverage.

## 🚀 Quick Start

```bash
# Run all tests
npm test

# Run comprehensive test suite with reporting
node tests/run-all-tests.js

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:api
npm run test:system
```

## 📋 Enhanced Test Structure

```
tests/
├── complete-system-test.test.tsx        # Master system test (15 categories)
├── unit/
│   └── core-functionality.test.tsx     # Unit tests for all core functions
├── integration/
│   └── full-system-integration.test.tsx # Complete integration workflows
├── api/
│   └── api-endpoints.test.tsx           # All API endpoint testing
├── utils/
│   └── test-helpers.ts                  # Testing utilities and helpers
├── test-database-config.js              # Database mocking configuration
├── run-all-tests.js                     # Master test runner script
└── README.md                            # This documentation
```

## Test Categories

### Unit Tests
- **Components**: Test individual React components in isolation
- **Hooks**: Test custom React hooks functionality
- **Utilities**: Test utility functions and helpers

### Integration Tests
- **App Integration**: Test component interactions and data flow
- **Auth Flow**: Test authentication workflows end-to-end

### API Tests
- **Route Handlers**: Test Next.js API route functionality
- **Error Handling**: Test API error scenarios
- **Data Validation**: Test request/response validation

## Running Tests

### All Tests
```bash
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage report
npm run test:ci           # Run tests for CI/CD
```

### Category-Specific Tests
```bash
npm run test:unit         # Run unit tests only
npm run test:integration  # Run integration tests only
npm run test:api         # Run API tests only
npm run test:all         # Run all categories sequentially
```

### Coverage Reports
```bash
npm run test:coverage:unit         # Unit test coverage
npm run test:coverage:integration  # Integration test coverage
npm run test:coverage:api         # API test coverage
```

## Test Configuration

### Jest Configuration
The Jest configuration is located in `jest.config.js` and includes:
- TypeScript support
- Next.js integration
- Path mapping for imports
- Coverage thresholds (70% minimum)
- Custom test environments

### Coverage Thresholds
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

### Excluded from Coverage
- Type definition files (*.d.ts)
- Story files (*.stories.*)
- Test files themselves
- Next.js layout files
- Type-only modules

## Test Utilities

### Mocks
- **Supabase**: Mocked client for database operations
- **Next.js Router**: Mocked navigation functions
- **Environment Variables**: Test-specific environment setup

### Test Helpers
- **React Testing Library**: Component testing utilities
- **Jest**: Test framework and assertions
- **User Events**: Simulated user interactions

## Writing Tests

### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interactions', () => {
    const handleClick = jest.fn()
    render(<MyComponent onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

### Hook Tests
```typescript
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from '@/hooks/useMyHook'

describe('useMyHook', () => {
  it('returns expected initial state', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe(initialValue)
  })

  it('updates state correctly', () => {
    const { result } = renderHook(() => useMyHook())
    
    act(() => {
      result.current.updateValue('new value')
    })
    
    expect(result.current.value).toBe('new value')
  })
})
```

### API Tests
```typescript
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/my-route/route'

describe('/api/my-route', () => {
  it('returns data for valid request', async () => {
    const request = new NextRequest('http://localhost/api/my-route')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('success', true)
  })
})
```

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Test Data
- Use realistic test data
- Create reusable test fixtures
- Avoid hardcoded values where possible

### Assertions
- Test behavior, not implementation
- Use appropriate matchers
- Test user-visible outcomes

### Mocking
- Mock at the boundary (API calls, external services)
- Use jest.fn() for function mocks
- Reset mocks between tests

## Continuous Integration

### GitHub Actions
Tests run automatically on:
- Pull requests
- Push to main branch
- Manual workflow dispatch

### Coverage Reports
- Coverage reports are generated for each test run
- Results are uploaded to coverage services
- Minimum coverage thresholds must be met

## Troubleshooting

### Common Issues
1. **Import errors**: Check path mapping in jest.config.js
2. **Async test failures**: Use proper async/await or waitFor
3. **Mock issues**: Ensure mocks are properly reset between tests
4. **Timeout errors**: Increase testTimeout in configuration

### Debug Tips
- Use `screen.debug()` to inspect rendered DOM
- Add `--verbose` flag for detailed test output
- Use `--runInBand` for debugging race conditions
- Check console for warnings and errors

## Contributing

When adding new features:
1. Write tests alongside your code
2. Maintain or improve coverage percentages
3. Follow existing test patterns
4. Update this documentation if needed

For questions or issues with tests, please refer to the project documentation or create an issue.


