/**
 * Mock Supabase client for testing
 */

export const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  rpc: jest.fn(),
}

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
}

export const mockSession = {
  user: mockUser,
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
}

export const mockProfile = {
  id: 'test-user-id',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  bio: 'Test bio',
  specialty: 'Cardiology',
  experience_years: 5,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
}

export const mockMatch = {
  id: 'test-match-id',
  user_id: 'test-user-id',
  matched_user_id: 'matched-user-id',
  compatibility_score: 0.85,
  created_at: '2023-01-01T00:00:00Z',
}

export const mockGroup = {
  id: 'test-group-id',
  name: 'Test Group',
  description: 'Test group description',
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
}

export const mockMessage = {
  id: 'test-message-id',
  group_id: 'test-group-id',
  user_id: 'test-user-id',
  content: 'Test message',
  created_at: '2023-01-01T00:00:00Z',
}

// Helper functions for mocking API responses
export const mockApiResponse = <T>(data: T, error: any = null) => ({
  data,
  error,
})

export const mockApiError = (message: string, code?: string) => ({
  data: null,
  error: {
    message,
    code,
    details: null,
    hint: null,
  },
})
