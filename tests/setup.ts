import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock Supabase client with flexible types
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      signInWithOAuth: jest.fn(),
      onAuthStateChange: jest.fn((callback?: (event: string, session: any) => void) => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
    from: jest.fn((table: string) => ({
      select: jest.fn((columns?: string) => ({
        eq: jest.fn((column: string, value: any) => ({
          order: jest.fn((column: string, options?: { ascending?: boolean }) => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
            desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        or: jest.fn((filter: string) => ({
          order: jest.fn((column: string, options?: { ascending?: boolean }) => ({
            desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
        order: jest.fn((column: string, options?: { ascending?: boolean }) => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: jest.fn((data: any) => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      update: jest.fn((data: any) => ({
        eq: jest.fn((column: string, value: any) => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn((column: string, value: any) => Promise.resolve({ data: null, error: null })),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => Promise.resolve({ unsubscribe: jest.fn() })),
      })),
    })),
    rpc: jest.fn(),
  })),
}))

// Mock middleware
jest.mock('@/middleware', () => ({
  middleware: jest.fn(),
}))

// Mock API routes
jest.mock('@/app/api/messages/route', () => ({
  POST: jest.fn(),
  GET: jest.fn(),
  PUT: jest.fn(),
  DELETE: jest.fn(),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null
  rootMargin: string = '0px'
  thresholds: ReadonlyArray<number> = [0]
  
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
  
  observe(target: Element) {
    return null
  }
  disconnect() {
    return null
  }
  unobserve(target: Element) {
    return null
  }
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Suppress console warnings in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
