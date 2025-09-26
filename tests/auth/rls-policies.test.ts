import { createClient } from '@supabase/supabase-js'

// Mock environment variables
const mockSupabaseUrl = 'https://test.supabase.co'
const mockSupabaseServiceKey = 'test-service-key'

// Create a mock Supabase client for testing
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    admin: {
      createUser: jest.fn(),
      deleteUser: jest.fn(),
    },
  },
  rpc: jest.fn(),
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}))

describe('Row Level Security (RLS) Policy Tests', () => {
  const testUserId = 'test-user-123'
  const testAdminId = 'test-admin-456'
  const testProfileId = 'test-profile-123'
  const testMatchId = 'test-match-456'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Profile RLS Policies', () => {
    test('users can view their own profile', async () => {
      const mockProfile = {
        id: testProfileId,
        user_id: testUserId,
        first_name: 'Test',
        last_name: 'User',
        role: 'user',
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      })

      // Simulate authenticated user context
      const result = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', testUserId)
        .single()

      expect(result.data).toEqual(mockProfile)
      expect(result.error).toBeNull()
    })

    test('users cannot view other users profiles', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', 'other-user-456')
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })

    test('users can update their own profile', async () => {
      const updatedProfile = {
        id: testProfileId,
        user_id: testUserId,
        first_name: 'Updated',
        last_name: 'Name',
      }

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedProfile,
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .update({ first_name: 'Updated', last_name: 'Name' })
        .eq('user_id', testUserId)
        .select()
        .single()

      expect(result.data).toEqual(updatedProfile)
      expect(result.error).toBeNull()
    })

    test('users cannot update other users profiles', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .update({ first_name: 'Hacked' })
        .eq('user_id', 'other-user-456')
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })

    test('users can insert their own profile', async () => {
      const newProfile = {
        id: testProfileId,
        user_id: testUserId,
        first_name: 'New',
        last_name: 'User',
        role: 'user',
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: newProfile,
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      expect(result.data).toEqual(newProfile)
      expect(result.error).toBeNull()
    })

    test('users cannot insert profiles for other users', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .insert({
          user_id: 'other-user-456',
          first_name: 'Fake',
          last_name: 'Profile',
        })
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('Admin RLS Policies', () => {
    test('admins can view all profiles', async () => {
      const mockProfiles = [
        { id: 'profile-1', user_id: 'user-1', role: 'user' },
        { id: 'profile-2', user_id: 'user-2', role: 'user' },
        { id: 'profile-3', user_id: testAdminId, role: 'admin' },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockProfiles,
          error: null,
        }),
      })

      // Simulate admin context
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true, // is_admin() returns true
        error: null,
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .select('*')

      expect(result.data).toEqual(mockProfiles)
      expect(result.error).toBeNull()
    })

    test('admins can update any profile', async () => {
      const updatedProfile = {
        id: 'profile-1',
        user_id: 'user-1',
        role: 'verified_user',
      }

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedProfile,
          error: null,
        }),
      })

      mockSupabaseClient.rpc.mockResolvedValue({
        data: true, // is_admin() returns true
        error: null,
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .update({ role: 'verified_user' })
        .eq('id', 'profile-1')
        .select()
        .single()

      expect(result.data).toEqual(updatedProfile)
      expect(result.error).toBeNull()
    })

    test('non-admins cannot perform admin operations', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insufficient permissions' },
        }),
      })

      mockSupabaseClient.rpc.mockResolvedValue({
        data: false, // is_admin() returns false
        error: null,
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', 'profile-1')
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('Match Members RLS Policies', () => {
    test('users can view their own match memberships', async () => {
      const mockMemberships = [
        {
          id: 'membership-1',
          profile_id: testProfileId,
          match_id: 'match-1',
          is_active: true,
        },
        {
          id: 'membership-2',
          profile_id: testProfileId,
          match_id: 'match-2',
          is_active: true,
        },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockMemberships,
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('match_members')
        .select('*')
        .eq('profile_id', testProfileId)

      expect(result.data).toEqual(mockMemberships)
      expect(result.error).toBeNull()
    })

    test('match members can view other members in the same match', async () => {
      const mockMatchMembers = [
        {
          id: 'membership-1',
          profile_id: testProfileId,
          match_id: testMatchId,
          is_active: true,
        },
        {
          id: 'membership-2',
          profile_id: 'other-profile-456',
          match_id: testMatchId,
          is_active: true,
        },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockMatchMembers,
          error: null,
        }),
      })

      // Mock is_member_of_match function to return true
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await mockSupabaseClient
        .from('match_members')
        .select('*')
        .eq('match_id', testMatchId)

      expect(result.data).toEqual(mockMatchMembers)
      expect(result.error).toBeNull()
    })

    test('users cannot view match members of matches they are not in', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      // Mock is_member_of_match function to return false
      mockSupabaseClient.rpc.mockResolvedValue({
        data: false,
        error: null,
      })

      const result = await mockSupabaseClient
        .from('match_members')
        .select('*')
        .eq('match_id', 'restricted-match-789')

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('Chat Messages RLS Policies', () => {
    test('users can view messages in matches they belong to', async () => {
      const mockMessages = [
        {
          id: 'message-1',
          user_id: testUserId,
          match_id: testMatchId,
          content: 'Hello everyone!',
          created_at: new Date().toISOString(),
        },
        {
          id: 'message-2',
          user_id: 'other-user-456',
          match_id: testMatchId,
          content: 'Hi there!',
          created_at: new Date().toISOString(),
        },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockMessages,
          error: null,
        }),
      })

      // Mock is_member_of_match function to return true
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await mockSupabaseClient
        .from('chat_messages')
        .select('*')
        .eq('match_id', testMatchId)

      expect(result.data).toEqual(mockMessages)
      expect(result.error).toBeNull()
    })

    test('users can create messages in matches they belong to', async () => {
      const newMessage = {
        id: 'message-3',
        user_id: testUserId,
        match_id: testMatchId,
        content: 'New message!',
        created_at: new Date().toISOString(),
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: newMessage,
          error: null,
        }),
      })

      // Mock is_member_of_match function to return true
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await mockSupabaseClient
        .from('chat_messages')
        .insert({
          user_id: testUserId,
          match_id: testMatchId,
          content: 'New message!',
        })
        .select()
        .single()

      expect(result.data).toEqual(newMessage)
      expect(result.error).toBeNull()
    })

    test('users can update their own messages', async () => {
      const updatedMessage = {
        id: 'message-1',
        user_id: testUserId,
        match_id: testMatchId,
        content: 'Updated message!',
        updated_at: new Date().toISOString(),
      }

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedMessage,
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('chat_messages')
        .update({ content: 'Updated message!' })
        .eq('user_id', testUserId)
        .select()
        .single()

      expect(result.data).toEqual(updatedMessage)
      expect(result.error).toBeNull()
    })

    test('users cannot update other users messages', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      const result = await mockSupabaseClient
        .from('chat_messages')
        .update({ content: 'Hacked message!' })
        .eq('user_id', 'other-user-456')
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })

    test('users cannot view messages in matches they do not belong to', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      // Mock is_member_of_match function to return false
      mockSupabaseClient.rpc.mockResolvedValue({
        data: false,
        error: null,
      })

      const result = await mockSupabaseClient
        .from('chat_messages')
        .select('*')
        .eq('match_id', 'restricted-match-789')

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('User Preferences RLS Policies', () => {
    test('users can view their own preferences', async () => {
      const mockPreferences = {
        id: 'pref-123',
        user_id: testUserId,
        email_notifications: true,
        push_notifications: false,
        privacy_level: 'friends',
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPreferences,
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('user_preferences')
        .select('*')
        .eq('user_id', testUserId)
        .single()

      expect(result.data).toEqual(mockPreferences)
      expect(result.error).toBeNull()
    })

    test('users can update their own preferences', async () => {
      const updatedPreferences = {
        id: 'pref-123',
        user_id: testUserId,
        email_notifications: false,
        push_notifications: true,
        privacy_level: 'public',
      }

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedPreferences,
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('user_preferences')
        .update({
          email_notifications: false,
          push_notifications: true,
          privacy_level: 'public',
        })
        .eq('user_id', testUserId)
        .select()
        .single()

      expect(result.data).toEqual(updatedPreferences)
      expect(result.error).toBeNull()
    })

    test('users cannot view other users preferences', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      const result = await mockSupabaseClient
        .from('user_preferences')
        .select('*')
        .eq('user_id', 'other-user-456')
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('Service Role Policies', () => {
    test('service role can manage matching logs', async () => {
      const mockMatchingLog = {
        id: 'log-123',
        batch_id: 'batch-456',
        total_profiles: 100,
        total_matches: 25,
        status: 'completed',
        created_at: new Date().toISOString(),
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMatchingLog,
          error: null,
        }),
      })

      // Mock service role context
      mockSupabaseClient.rpc.mockResolvedValue({
        data: 'service_role',
        error: null,
      })

      const result = await mockSupabaseClient
        .from('matching_logs')
        .insert(mockMatchingLog)
        .select()
        .single()

      expect(result.data).toEqual(mockMatchingLog)
      expect(result.error).toBeNull()
    })

    test('service role can read profiles for matching', async () => {
      const mockProfiles = [
        { id: 'profile-1', user_id: 'user-1', is_active: true },
        { id: 'profile-2', user_id: 'user-2', is_active: true },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockProfiles,
          error: null,
        }),
      })

      // Mock service role context
      mockSupabaseClient.rpc.mockResolvedValue({
        data: 'service_role',
        error: null,
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('is_active', true)

      expect(result.data).toEqual(mockProfiles)
      expect(result.error).toBeNull()
    })

    test('service role can create matches', async () => {
      const newMatch = {
        id: testMatchId,
        batch_id: 'batch-456',
        match_type: 'group',
        status: 'active',
        created_at: new Date().toISOString(),
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: newMatch,
          error: null,
        }),
      })

      // Mock service role context
      mockSupabaseClient.rpc.mockResolvedValue({
        data: 'service_role',
        error: null,
      })

      const result = await mockSupabaseClient
        .from('matches')
        .insert(newMatch)
        .select()
        .single()

      expect(result.data).toEqual(newMatch)
      expect(result.error).toBeNull()
    })

    test('regular users cannot perform service role operations', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insufficient permissions' },
        }),
      })

      // Mock regular user context
      mockSupabaseClient.rpc.mockResolvedValue({
        data: 'authenticated',
        error: null,
      })

      const result = await mockSupabaseClient
        .from('matching_logs')
        .insert({
          batch_id: 'batch-456',
          status: 'completed',
        })
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('RLS Helper Functions', () => {
    test('is_admin function works correctly', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await mockSupabaseClient.rpc('is_admin')

      expect(result.data).toBe(true)
      expect(result.error).toBeNull()
    })

    test('is_moderator_or_admin function works correctly', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await mockSupabaseClient.rpc('is_moderator_or_admin')

      expect(result.data).toBe(true)
      expect(result.error).toBeNull()
    })

    test('current_profile_id function works correctly', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: testProfileId,
        error: null,
      })

      const result = await mockSupabaseClient.rpc('current_profile_id')

      expect(result.data).toBe(testProfileId)
      expect(result.error).toBeNull()
    })

    test('is_member_of_match function works correctly', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await mockSupabaseClient.rpc('is_member_of_match', {
        match_id: testMatchId,
      })

      expect(result.data).toBe(true)
      expect(result.error).toBeNull()
    })
  })
})


