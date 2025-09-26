/**
 * Test Database Configuration for BeyondRounds
 * Sets up test environment with proper mocking and database configuration
 */

const fs = require('fs')
const path = require('path')

// Test database configuration
const testDatabaseConfig = {
  // Supabase test configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test-project.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key',
  },

  // Test data schemas
  schemas: {
    profiles: {
      id: 'uuid',
      user_id: 'uuid',
      name: 'text',
      email: 'text',
      specialty: 'text',
      experience_level: 'text',
      location: 'text',
      interests: 'text[]',
      bio: 'text',
      phone_number: 'text',
      created_at: 'timestamp',
      updated_at: 'timestamp'
    },
    matches: {
      id: 'uuid',
      user1_id: 'uuid',
      user2_id: 'uuid',
      compatibility_score: 'integer',
      status: 'text',
      created_at: 'timestamp'
    },
    groups: {
      id: 'uuid',
      name: 'text',
      description: 'text',
      created_by: 'uuid',
      created_at: 'timestamp'
    },
    group_members: {
      id: 'uuid',
      group_id: 'uuid',
      user_id: 'uuid',
      joined_at: 'timestamp'
    },
    messages: {
      id: 'uuid',
      group_id: 'uuid',
      sender_id: 'uuid',
      content: 'text',
      created_at: 'timestamp'
    }
  },

  // Test data generators
  generators: {
    profile: (overrides = {}) => ({
      id: `profile-${Math.random().toString(36).substr(2, 9)}`,
      user_id: `user-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Dr. Test User',
      email: 'test@example.com',
      specialty: 'Emergency Medicine',
      experience_level: 'Attending',
      location: 'New York, NY',
      interests: ['Research', 'Teaching'],
      bio: 'Experienced emergency physician',
      phone_number: '+1234567890',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides
    }),

    match: (overrides = {}) => ({
      id: `match-${Math.random().toString(36).substr(2, 9)}`,
      user1_id: `user-${Math.random().toString(36).substr(2, 9)}`,
      user2_id: `user-${Math.random().toString(36).substr(2, 9)}`,
      compatibility_score: Math.floor(Math.random() * 100),
      status: 'active',
      created_at: new Date().toISOString(),
      ...overrides
    }),

    group: (overrides = {}) => ({
      id: `group-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Test Group',
      description: 'A test group for emergency physicians',
      created_by: `user-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      ...overrides
    }),

    message: (overrides = {}) => ({
      id: `message-${Math.random().toString(36).substr(2, 9)}`,
      group_id: `group-${Math.random().toString(36).substr(2, 9)}`,
      sender_id: `user-${Math.random().toString(36).substr(2, 9)}`,
      content: 'Test message content',
      created_at: new Date().toISOString(),
      ...overrides
    })
  },

  // Mock database operations
  mockOperations: {
    // Create operation
    insert: (table, data) => {
      return Promise.resolve({
        data: Array.isArray(data) ? data : [data],
        error: null
      })
    },

    // Read operation
    select: (table, query = {}) => {
      const mockData = {
        profiles: [testDatabaseConfig.generators.profile()],
        matches: [testDatabaseConfig.generators.match()],
        groups: [testDatabaseConfig.generators.group()],
        messages: [testDatabaseConfig.generators.message()]
      }

      return Promise.resolve({
        data: mockData[table] || [],
        error: null
      })
    },

    // Update operation
    update: (table, data, condition) => {
      return Promise.resolve({
        data: [{ ...data, updated_at: new Date().toISOString() }],
        error: null
      })
    },

    // Delete operation
    delete: (table, condition) => {
      return Promise.resolve({
        data: null,
        error: null
      })
    },

    // RPC operation
    rpc: (functionName, params) => {
      const mockResponses = {
        get_user_matches: {
          data: [testDatabaseConfig.generators.match()],
          error: null
        },
        calculate_compatibility: {
          data: { score: 75 },
          error: null
        },
        get_admin_stats: {
          data: {
            total_users: 100,
            active_matches: 50,
            total_messages: 1000
          },
          error: null
        }
      }

      return Promise.resolve(
        mockResponses[functionName] || { data: null, error: null }
      )
    }
  }
}

// Enhanced mock Supabase client
const createMockSupabaseClient = () => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: testDatabaseConfig.generators.profile() },
      error: null
    }),
    getSession: jest.fn().mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
      error: null
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: testDatabaseConfig.generators.profile(), session: { access_token: 'test-token' } },
      error: null
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: testDatabaseConfig.generators.profile(), session: null },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
  },

  from: jest.fn((table) => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(() => testDatabaseConfig.mockOperations.select(table)),
    then: jest.fn(() => testDatabaseConfig.mockOperations.select(table))
  })),

  rpc: jest.fn((functionName, params) =>
    testDatabaseConfig.mockOperations.rpc(functionName, params)
  ),

  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({
        data: { path: 'test-file.jpg' },
        error: null
      }),
      list: jest.fn().mockResolvedValue({
        data: [{ name: 'file1.jpg' }],
        error: null
      }),
      download: jest.fn().mockResolvedValue({
        data: new Blob(['test']),
        error: null
      })
    }))
  },

  realtime: {
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockResolvedValue({ error: null }),
      unsubscribe: jest.fn().mockResolvedValue({ error: null })
    }))
  }
})

// Test environment setup
const setupTestEnvironment = () => {
  // Set environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_SUPABASE_URL = testDatabaseConfig.supabase.url
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = testDatabaseConfig.supabase.anonKey
  process.env.SUPABASE_SERVICE_ROLE_KEY = testDatabaseConfig.supabase.serviceRoleKey
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  process.env.CRON_SECRET = 'test-cron-secret'

  // Global test utilities
  global.testDatabaseConfig = testDatabaseConfig
  global.createMockSupabaseClient = createMockSupabaseClient

  console.log('✅ Test environment configured')
  return testDatabaseConfig
}

// Cleanup function
const cleanupTestEnvironment = () => {
  // Reset mocks
  jest.clearAllMocks()
  jest.resetAllMocks()

  console.log('✅ Test environment cleaned up')
}

// Export configuration
module.exports = {
  testDatabaseConfig,
  createMockSupabaseClient,
  setupTestEnvironment,
  cleanupTestEnvironment
}