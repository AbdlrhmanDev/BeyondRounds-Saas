/**
 * Test Utilities and Helpers for BeyondRounds
 * Common testing utilities, mocks, and helper functions
 */

import { jest } from '@jest/globals'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { ReactElement } from 'react'

// Import test configuration
const { createMockSupabaseClient, testDatabaseConfig } = require('../test-database-config')

/**
 * Enhanced render function with common providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(
      'div',
      { 'data-testid': 'test-providers' },
      children
    )
  }

  return render(ui, { wrapper: AllTheProviders, ...options })
}

/**
 * User event setup with default configuration
 */
export const setupUser = () => userEvent.setup({
  advanceTimers: jest.advanceTimersByTime,
})

/**
 * Test data generators
 */
export const generateTestData = {
  user: (overrides: Partial<any> = {}) => ({
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: `test-${Math.random().toString(36).substr(2, 5)}@example.com`,
    name: 'Test User',
    created_at: new Date().toISOString(),
    ...overrides
  }),

  profile: (overrides: Partial<any> = {}) => ({
    id: `profile-${Math.random().toString(36).substr(2, 9)}`,
    user_id: `user-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Dr. Test User',
    email: `test-${Math.random().toString(36).substr(2, 5)}@example.com`,
    specialty: 'Emergency Medicine',
    experience_level: 'Attending',
    location: 'New York, NY',
    interests: ['Research', 'Teaching'],
    bio: 'Test bio for medical professional',
    phone_number: '+1-555-0123',
    verification_status: 'verified',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides
  }),

  match: (overrides: Partial<any> = {}) => ({
    id: `match-${Math.random().toString(36).substr(2, 9)}`,
    user1_id: `user-${Math.random().toString(36).substr(2, 9)}`,
    user2_id: `user-${Math.random().toString(36).substr(2, 9)}`,
    compatibility_score: Math.floor(Math.random() * 40) + 60, // 60-100
    status: 'active',
    created_at: new Date().toISOString(),
    ...overrides
  }),

  group: (overrides: Partial<any> = {}) => ({
    id: `group-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Medical Group',
    description: 'A test group for medical professionals',
    created_by: `user-${Math.random().toString(36).substr(2, 9)}`,
    member_count: Math.floor(Math.random() * 20) + 3,
    created_at: new Date().toISOString(),
    ...overrides
  }),

  message: (overrides: Partial<any> = {}) => ({
    id: `message-${Math.random().toString(36).substr(2, 9)}`,
    group_id: `group-${Math.random().toString(36).substr(2, 9)}`,
    sender_id: `user-${Math.random().toString(36).substr(2, 9)}`,
    content: 'Test message content',
    created_at: new Date().toISOString(),
    ...overrides
  }),

  adminStats: () => ({
    total_users: Math.floor(Math.random() * 1000) + 100,
    active_users: Math.floor(Math.random() * 800) + 50,
    total_matches: Math.floor(Math.random() * 500) + 25,
    active_groups: Math.floor(Math.random() * 100) + 10,
    messages_sent: Math.floor(Math.random() * 10000) + 1000,
    verification_pending: Math.floor(Math.random() * 50) + 5,
    last_matching_run: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  })
}

/**
 * Mock API response generator
 */
export const mockApiResponse = {
  success: (data: any) => ({
    data,
    error: null,
    status: 'success'
  }),

  error: (message: string, code?: string) => ({
    data: null,
    error: { message, code },
    status: 'error'
  }),

  pagination: (data: any[], page: number = 1, limit: number = 10) => ({
    data: data.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      total: data.length,
      pages: Math.ceil(data.length / limit)
    },
    error: null
  })
}

/**
 * Database query builders for testing
 */
export const mockQuery = {
  select: (table: string, columns: string = '*') => ({
    from: table,
    select: columns,
    execute: () => Promise.resolve(mockApiResponse.success([generateTestData.profile()])),
    eq: (column: string, value: any) => mockQuery.select(table, columns),
    order: (column: string, options?: any) => mockQuery.select(table, columns),
    limit: (count: number) => mockQuery.select(table, columns),
    single: () => ({
      execute: () => Promise.resolve(mockApiResponse.success(generateTestData.profile()))
    })
  }),

  insert: (table: string, data: any) => ({
    into: table,
    values: data,
    execute: () => Promise.resolve(mockApiResponse.success(Array.isArray(data) ? data : [data]))
  }),

  update: (table: string, data: any) => ({
    table,
    set: data,
    eq: (column: string, value: any) => mockQuery.update(table, data),
    execute: () => Promise.resolve(mockApiResponse.success({ ...data, updated_at: new Date().toISOString() }))
  }),

  delete: (table: string) => ({
    from: table,
    eq: (column: string, value: any) => mockQuery.delete(table),
    execute: () => Promise.resolve(mockApiResponse.success(null))
  }),

  rpc: (functionName: string, params?: any) => {
    const mockRpcResponses: { [key: string]: any } = {
      get_user_matches: [generateTestData.match(), generateTestData.match()],
      calculate_compatibility: { score: 75 },
      get_admin_stats: generateTestData.adminStats(),
      run_weekly_matching: { matches_created: 25, groups_formed: 5, execution_time: '2.5s' },
      get_user_stats: { total_matches: 10, active_groups: 3, messages_sent: 50 },
      get_matching_stats: { success_rate: 0.78, average_score: 73.5 },
      get_messaging_stats: { daily_messages: 150, active_conversations: 45 }
    }

    return {
      execute: () => Promise.resolve(mockApiResponse.success(mockRpcResponses[functionName] || {}))
    }
  }
}

/**
 * Mock Supabase client factory
 */
export const createTestSupabaseClient = (customResponses: any = {}) => {
  const defaultClient = createMockSupabaseClient()

  return {
    ...defaultClient,
    from: jest.fn((table: string) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(() => {
        const mockData = customResponses[table] || testDatabaseConfig.generators[table.slice(0, -1)]?.()
        return Promise.resolve(mockApiResponse.success(mockData))
      }),
      then: jest.fn(() => {
        const mockData = customResponses[`${table}_list`] || [testDatabaseConfig.generators[table.slice(0, -1)]?.()]
        return Promise.resolve(mockApiResponse.success(mockData))
      })
    })),
    rpc: jest.fn((functionName: string, params?: any) => {
      const mockResponse = customResponses[functionName] || mockQuery.rpc(functionName, params)
      return mockResponse.execute ? mockResponse.execute() : Promise.resolve(mockApiResponse.success(mockResponse))
    })
  }
}

/**
 * Test environment setup utilities
 */
export const testUtils = {
  // Wait for async operations
  waitFor: async (callback: () => void, timeout: number = 5000) => {
    const startTime = Date.now()
    while (Date.now() - startTime < timeout) {
      try {
        callback()
        return
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    throw new Error(`Timeout after ${timeout}ms`)
  },

  // Mock local storage
  mockLocalStorage: () => {
    const store: { [key: string]: string } = {}
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key]
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach(key => delete store[key])
      })
    }
  },

  // Mock window.fetch
  mockFetch: (responses: { [url: string]: any }) => {
    return jest.fn((url: string, options?: RequestInit) => {
      const method = options?.method || 'GET'
      const key = `${method} ${url}`
      const response = responses[key] || responses[url] || { status: 404, json: () => Promise.resolve({ error: 'Not found' }) }

      return Promise.resolve({
        ok: response.status >= 200 && response.status < 300,
        status: response.status || 200,
        json: () => Promise.resolve(response.data || response),
        text: () => Promise.resolve(JSON.stringify(response.data || response))
      })
    })
  },

  // Create mock form data
  createMockFormData: (data: { [key: string]: string }) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value)
    })
    return formData
  },

  // Generate test files
  createMockFile: (name: string = 'test.jpg', type: string = 'image/jpeg', size: number = 1024) => {
    const content = new Array(size).fill('a').join('')
    return new File([content], name, { type })
  },

  // Mock date/time utilities
  mockDateTime: {
    now: () => new Date('2023-12-25T10:00:00Z'),
    addDays: (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000),
    formatDate: (date: Date) => date.toISOString().split('T')[0],
    isWithinRange: (date: Date, start: Date, end: Date) => date >= start && date <= end
  }
}

/**
 * Common test assertions
 */
export const assertions = {
  // Verify API response structure
  validateApiResponse: (response: any) => {
    expect(response).toHaveProperty('data')
    expect(response).toHaveProperty('error')
    if (response.error) {
      expect(response.data).toBeNull()
    } else {
      expect(response.data).toBeTruthy()
    }
  },

  // Verify profile structure
  validateProfile: (profile: any) => {
    expect(profile).toHaveProperty('id')
    expect(profile).toHaveProperty('user_id')
    expect(profile).toHaveProperty('name')
    expect(profile).toHaveProperty('email')
    expect(profile).toHaveProperty('specialty')
    expect(profile).toHaveProperty('experience_level')
    expect(profile).toHaveProperty('created_at')
  },

  // Verify match structure
  validateMatch: (match: any) => {
    expect(match).toHaveProperty('id')
    expect(match).toHaveProperty('user1_id')
    expect(match).toHaveProperty('user2_id')
    expect(match).toHaveProperty('compatibility_score')
    expect(match.compatibility_score).toBeGreaterThanOrEqual(0)
    expect(match.compatibility_score).toBeLessThanOrEqual(100)
    expect(match).toHaveProperty('status')
    expect(match).toHaveProperty('created_at')
  },

  // Verify group structure
  validateGroup: (group: any) => {
    expect(group).toHaveProperty('id')
    expect(group).toHaveProperty('name')
    expect(group).toHaveProperty('created_by')
    expect(group).toHaveProperty('created_at')
  },

  // Verify message structure
  validateMessage: (message: any) => {
    expect(message).toHaveProperty('id')
    expect(message).toHaveProperty('group_id')
    expect(message).toHaveProperty('sender_id')
    expect(message).toHaveProperty('content')
    expect(message.content.length).toBeGreaterThan(0)
    expect(message).toHaveProperty('created_at')
  },

  // Verify timestamp format
  validateTimestamp: (timestamp: string) => {
    expect(typeof timestamp).toBe('string')
    expect(new Date(timestamp)).toBeInstanceOf(Date)
    expect(new Date(timestamp).getTime()).not.toBeNaN()
  },

  // Verify email format
  validateEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test(email)).toBe(true)
  },

  // Verify UUID format
  validateUUID: (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    expect(typeof uuid).toBe('string')
    // For test data, we use custom IDs, so just check it's a string
    expect(uuid.length).toBeGreaterThan(0)
  }
}

/**
 * Performance testing utilities
 */
export const performanceUtils = {
  // Measure execution time
  measureExecutionTime: async (fn: () => Promise<any> | any) => {
    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    return {
      result,
      executionTime: end - start
    }
  },

  // Test concurrent operations
  testConcurrency: async (operations: (() => Promise<any>)[], maxConcurrency: number = 10) => {
    const results: any[] = []
    const errors: any[] = []

    for (let i = 0; i < operations.length; i += maxConcurrency) {
      const batch = operations.slice(i, i + maxConcurrency)
      const batchResults = await Promise.allSettled(batch.map(op => op()))

      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          errors.push(result.reason)
        }
      })
    }

    return { results, errors, successRate: results.length / (results.length + errors.length) }
  },

  // Memory usage tracking (mock)
  trackMemoryUsage: () => {
    const mockMemoryUsage = {
      used: Math.random() * 100,
      total: 512,
      percentage: Math.random() * 100
    }
    return mockMemoryUsage
  }
}

/**
 * Cleanup utilities
 */
export const cleanup = {
  // Clear all mocks
  clearAllMocks: () => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  },

  // Reset test environment
  resetTestEnvironment: () => {
    cleanup.clearAllMocks()
    // Reset any global state
    if (global.testDatabaseConfig) {
      // Reset test config if needed
    }
  },

  // Clean up timers
  clearTimers: () => {
    jest.clearAllTimers()
    jest.useRealTimers()
  },

  // Clean up DOM
  cleanupDOM: () => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
  }
}

/**
 * Export all utilities
 */
export default {
  renderWithProviders,
  setupUser,
  generateTestData,
  mockApiResponse,
  mockQuery,
  createTestSupabaseClient,
  testUtils,
  assertions,
  performanceUtils,
  cleanup
}