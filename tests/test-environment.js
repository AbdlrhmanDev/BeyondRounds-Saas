/**
 * Test Environment Configuration
 * 
 * Sets up the testing environment with proper configurations,
 * mocks, and utilities for comprehensive testing.
 */

const { TextEncoder, TextDecoder } = require('util')

// Mock Next.js server modules immediately to prevent import issues
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(url, init = {}) {
      this.url = url
      this.method = init.method || 'GET'
      this.headers = new Map()
      this.body = init.body
    }
    
    async json() {
      return JSON.parse(this.body || '{}')
    }
    
    async text() {
      return this.body || ''
    }
  },
  NextResponse: {
    json: (data, init = {}) => ({
      json: () => Promise.resolve(data),
      status: init.status || 200,
      statusText: init.statusText || 'OK',
    }),
    redirect: (url, status = 302) => ({
      status,
      headers: { location: url },
    }),
  },
}))

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock fetch for Node.js environment - use a simple mock instead of node-fetch
if (typeof fetch === 'undefined') {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      headers: new Map(),
    })
  )
}


// Mock Request and Response globals - define them early
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(url, init = {}) {
      this.url = url
      this.method = init.method || 'GET'
      this.headers = new Map()
      this.body = init.body
    }
    
    async json() {
      return JSON.parse(this.body || '{}')
    }
    
    async text() {
      return this.body || ''
    }
  }
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Map()
    }
    
    async json() {
      return JSON.parse(this.body || '{}')
    }
    
    async text() {
      return this.body || ''
    }
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null
  }
  disconnect() {
    return null
  }
  unobserve() {
    return null
  }
}

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = jest.fn()

// Mock scrollTo
global.scrollTo = jest.fn()

// Mock console methods for cleaner test output
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  // Suppress React warnings in tests
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: React.createFactory() is deprecated') ||
       args[0].includes('Warning: componentWillReceiveProps has been renamed'))
    ) {
      return
    }
    originalConsoleError.call(console, ...args)
  }

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: React.createFactory() is deprecated') ||
       args[0].includes('Warning: componentWillReceiveProps has been renamed'))
    ) {
      return
    }
    originalConsoleWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Test utilities
global.testUtils = {
  // Wait for async operations
  waitFor: (callback, options = {}) => {
    const { timeout = 5000, interval = 50 } = options
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const check = async () => {
        try {
          const result = await callback()
          if (result) {
            resolve(result)
            return
          }
        } catch (error) {
          // Continue checking
        }

        if (Date.now() - startTime >= timeout) {
          reject(new Error(`Timeout after ${timeout}ms`))
          return
        }

        setTimeout(check, interval)
      }

      check()
    })
  },

  // Generate test data
  generateTestUser: (id = 1, overrides = {}) => ({
    id: `user-${id}`,
    first_name: `User${id}`,
    last_name: `Test${id}`,
    email: `user${id}@test.com`,
    specialty: ['Cardiology', 'Neurology', 'Pediatrics'][id % 3],
    interests: ['Running', 'Reading', 'Cooking', 'Photography'].slice(0, (id % 4) + 1),
    city: ['New York', 'Los Angeles', 'Chicago'][id % 3],
    state: ['NY', 'CA', 'IL'][id % 3],
    is_verified: true,
    is_paid: true,
    onboarding_completed: true,
    created_at: new Date(Date.now() - id * 86400000).toISOString(),
    ...overrides,
  }),

  generateTestMatch: (id = 1, overrides = {}) => ({
    id: `match-${id}`,
    created_at: new Date(Date.now() - id * 86400000).toISOString(),
    is_active: true,
    compatibility_score: 0.7 + (id % 30) / 100,
    group_size: 3 + (id % 2),
    ...overrides,
  }),

  generateTestMessage: (id = 1, matchId = 'match-1', senderId = 'user-1', overrides = {}) => ({
    id: `msg-${id}`,
    match_id: matchId,
    sender_id: senderId,
    content: `Test message ${id} with some content to simulate real messages`,
    message_type: 'user',
    created_at: new Date(Date.now() - id * 60000).toISOString(),
    ...overrides,
  }),

  // Mock API responses
  mockApiSuccess: (data) => ({
    data,
    error: null,
    status: 200,
    statusText: 'OK',
  }),

  mockApiError: (message, code = 400) => ({
    data: null,
    error: { message, code },
    status: code,
    statusText: 'Error',
  }),

  // Performance monitoring
  createPerformanceMonitor: () => {
    let startTime = 0
    let endTime = 0
    let memoryUsage = {}

    return {
      start() {
        startTime = performance.now()
        if (process.memoryUsage) {
          memoryUsage.start = process.memoryUsage()
        }
      },

      end() {
        endTime = performance.now()
        if (process.memoryUsage) {
          memoryUsage.end = process.memoryUsage()
        }
      },

      getDuration() {
        return endTime - startTime
      },

      getMemoryDelta() {
        if (!memoryUsage.start || !memoryUsage.end) {
          return null
        }
        return {
          heapUsed: memoryUsage.end.heapUsed - memoryUsage.start.heapUsed,
          heapTotal: memoryUsage.end.heapTotal - memoryUsage.start.heapTotal,
          external: memoryUsage.end.external - memoryUsage.start.external,
          rss: memoryUsage.end.rss - memoryUsage.start.rss,
        }
      }
    }
  },

  // Database mocking utilities
  createMockSupabaseClient: () => ({
    auth: {
      getUser: jest.fn(() => Promise.resolve({ 
        data: { user: null }, 
        error: null 
      })),
      getSession: jest.fn(() => Promise.resolve({ 
        data: { session: null }, 
        error: null 
      })),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      signInWithOAuth: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
    })),
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        list: jest.fn(),
        update: jest.fn(),
        move: jest.fn(),
        copy: jest.fn(),
      })),
    },
  }),

  // Component testing utilities
  renderWithProviders: (ui, options = {}) => {
    const { QueryClient, QueryClientProvider } = require('@tanstack/react-query')
    const { render } = require('@testing-library/react')
    const React = require('react')

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const Wrapper = ({ children }) => {
      return React.createElement(QueryClientProvider, { client: queryClient }, children)
    }

    return render(ui, { wrapper: Wrapper, ...options })
  },

  // Async testing utilities
  flushPromises: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Form testing utilities
  fillForm: async (form, data) => {
    const { fireEvent } = require('@testing-library/react')
    
    for (const [field, value] of Object.entries(data)) {
      const input = form.querySelector(`[name="${field}"]`)
      if (input) {
        fireEvent.change(input, { target: { value } })
      }
    }
    
    await testUtils.flushPromises()
  },

  // Error simulation
  simulateNetworkError: () => {
    throw new Error('Network error')
  },

  simulateTimeout: (ms = 5000) => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), ms)
    })
  },

  // Test data cleanup
  cleanup: () => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  }
}

// Export for use in other test files
module.exports = {
  testUtils: global.testUtils
}
