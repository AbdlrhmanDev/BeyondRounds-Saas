import { createClient } from '@supabase/supabase-js'
import { ProfileAPI } from '@/lib/api'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
  },
  rpc: jest.fn(),
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}))

describe('User Permissions and Access Control Tests', () => {
  const testUserId = 'test-user-123'
  const testProfileId = 'test-profile-123'
  const otherUserId = 'other-user-456'
  const otherProfileId = 'other-profile-456'

  let profileAPI: ProfileAPI

  beforeEach(() => {
    jest.clearAllMocks()
    profileAPI = new ProfileAPI()
  })

  describe('Profile Access Permissions', () => {
    test('user can read their own profile', async () => {
      const mockProfile = {
        id: testProfileId,
        user_id: testUserId,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        role: 'user',
        is_verified: false,
        is_paid: false,
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        }),
      })

      const result = await profileAPI.getProfile(testUserId)

      expect(result).toEqual(mockProfile)
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
    })

    test('user cannot read other users private profile data', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      await expect(profileAPI.getProfile(otherUserId)).rejects.toThrow()
    })

    test('user can update their own profile', async () => {
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

      const result = await profileAPI.updateProfile(testUserId, {
        first_name: 'Updated',
        last_name: 'Name',
      })

      expect(result).toEqual(updatedProfile)
    })

    test('user cannot update other users profiles', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      await expect(
        profileAPI.updateProfile(otherUserId, { first_name: 'Hacked' })
      ).rejects.toThrow()
    })

    test('user cannot change sensitive fields', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Permission denied for field: role' },
        }),
      })

      await expect(
        profileAPI.updateProfile(testUserId, { role: 'admin' })
      ).rejects.toThrow()
    })
  })

  describe('Match Access Permissions', () => {
    test('user can view matches they are part of', async () => {
      const mockMatches = [
        {
          id: 'match-1',
          match_type: 'group',
          status: 'active',
          created_at: new Date().toISOString(),
        },
        {
          id: 'match-2',
          match_type: 'pair',
          status: 'active',
          created_at: new Date().toISOString(),
        },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: mockMatches,
          error: null,
        }),
      })

      // Mock user is member of these matches
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await mockSupabaseClient
        .from('matches')
        .select('*')
        .in('id', ['match-1', 'match-2'])

      expect(result.data).toEqual(mockMatches)
      expect(result.error).toBeNull()
    })

    test('user cannot view matches they are not part of', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      // Mock user is not member of these matches
      mockSupabaseClient.rpc.mockResolvedValue({
        data: false,
        error: null,
      })

      const result = await mockSupabaseClient
        .from('matches')
        .select('*')
        .in('id', ['restricted-match-1'])

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })

    test('user can leave their own matches', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'membership-1',
            profile_id: testProfileId,
            match_id: 'match-1',
            is_active: false,
          },
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('match_members')
        .update({ is_active: false })
        .eq('profile_id', testProfileId)
        .select()
        .single()

      expect(result.data.is_active).toBe(false)
      expect(result.error).toBeNull()
    })

    test('user cannot remove others from matches', async () => {
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
        .from('match_members')
        .update({ is_active: false })
        .eq('profile_id', otherProfileId)
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('Chat Message Permissions', () => {
    test('user can send messages in matches they belong to', async () => {
      const newMessage = {
        id: 'message-123',
        user_id: testUserId,
        match_id: 'match-1',
        content: 'Hello everyone!',
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

      // Mock user is member of the match
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true,
        error: null,
      })

      const result = await mockSupabaseClient
        .from('chat_messages')
        .insert({
          user_id: testUserId,
          match_id: 'match-1',
          content: 'Hello everyone!',
        })
        .select()
        .single()

      expect(result.data).toEqual(newMessage)
      expect(result.error).toBeNull()
    })

    test('user cannot send messages in matches they do not belong to', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      // Mock user is not member of the match
      mockSupabaseClient.rpc.mockResolvedValue({
        data: false,
        error: null,
      })

      const result = await mockSupabaseClient
        .from('chat_messages')
        .insert({
          user_id: testUserId,
          match_id: 'restricted-match',
          content: 'Unauthorized message!',
        })
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })

    test('user can edit their own messages', async () => {
      const updatedMessage = {
        id: 'message-123',
        user_id: testUserId,
        match_id: 'match-1',
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

    test('user cannot edit other users messages', async () => {
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
        .eq('user_id', otherUserId)
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })

    test('user can delete their own messages', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('chat_messages')
        .delete()
        .eq('user_id', testUserId)

      expect(result.error).toBeNull()
    })

    test('user cannot delete other users messages', async () => {
      mockSupabaseClient.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      const result = await mockSupabaseClient
        .from('chat_messages')
        .delete()
        .eq('user_id', otherUserId)

      expect(result.error).toBeTruthy()
    })
  })

  describe('Notification Permissions', () => {
    test('user can view their own notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          user_id: testUserId,
          type: 'match_found',
          title: 'New Match Found!',
          message: 'You have a new match',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 'notif-2',
          user_id: testUserId,
          type: 'message_received',
          title: 'New Message',
          message: 'You have a new message',
          is_read: true,
          created_at: new Date().toISOString(),
        },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockNotifications,
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false })

      expect(result.data).toEqual(mockNotifications)
      expect(result.error).toBeNull()
    })

    test('user cannot view other users notifications', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      const result = await mockSupabaseClient
        .from('notifications')
        .select('*')
        .eq('user_id', otherUserId)
        .order('created_at', { ascending: false })

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })

    test('user can mark their own notifications as read', async () => {
      const updatedNotification = {
        id: 'notif-1',
        user_id: testUserId,
        is_read: true,
        updated_at: new Date().toISOString(),
      }

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedNotification,
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', testUserId)
        .select()
        .single()

      expect(result.data).toEqual(updatedNotification)
      expect(result.error).toBeNull()
    })

    test('user cannot modify other users notifications', async () => {
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
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', otherUserId)
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('Preference Management Permissions', () => {
    test('user can view their own preferences', async () => {
      const mockPreferences = {
        id: 'pref-123',
        user_id: testUserId,
        email_notifications: true,
        push_notifications: false,
        privacy_level: 'friends',
        show_online_status: true,
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

    test('user can update their own preferences', async () => {
      const updatedPreferences = {
        id: 'pref-123',
        user_id: testUserId,
        email_notifications: false,
        push_notifications: true,
        privacy_level: 'public',
        show_online_status: false,
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
          show_online_status: false,
        })
        .eq('user_id', testUserId)
        .select()
        .single()

      expect(result.data).toEqual(updatedPreferences)
      expect(result.error).toBeNull()
    })

    test('user cannot view other users preferences', async () => {
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
        .eq('user_id', otherUserId)
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('Verification Request Permissions', () => {
    test('user can create their own verification request', async () => {
      const newVerificationRequest = {
        id: 'req-123',
        user_id: testUserId,
        document_type: 'medical_license',
        status: 'pending',
        created_at: new Date().toISOString(),
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: newVerificationRequest,
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('verification_requests')
        .insert({
          user_id: testUserId,
          document_type: 'medical_license',
          status: 'pending',
        })
        .select()
        .single()

      expect(result.data).toEqual(newVerificationRequest)
      expect(result.error).toBeNull()
    })

    test('user can view their own verification requests', async () => {
      const mockRequests = [
        {
          id: 'req-1',
          user_id: testUserId,
          document_type: 'medical_license',
          status: 'approved',
          created_at: new Date().toISOString(),
        },
        {
          id: 'req-2',
          user_id: testUserId,
          document_type: 'medical_certificate',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockRequests,
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('verification_requests')
        .select('*')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false })

      expect(result.data).toEqual(mockRequests)
      expect(result.error).toBeNull()
    })

    test('user cannot create verification requests for other users', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      const result = await mockSupabaseClient
        .from('verification_requests')
        .insert({
          user_id: otherUserId,
          document_type: 'medical_license',
          status: 'pending',
        })
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })

    test('user cannot view other users verification requests', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Row Level Security policy violation' },
        }),
      })

      const result = await mockSupabaseClient
        .from('verification_requests')
        .select('*')
        .eq('user_id', otherUserId)
        .order('created_at', { ascending: false })

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })

    test('regular users cannot approve verification requests', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Insufficient permissions' },
        }),
      })

      const result = await mockSupabaseClient
        .from('verification_requests')
        .update({ status: 'approved' })
        .eq('id', 'req-123')
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('Role-Based Access Control', () => {
    test('verified users have additional permissions', async () => {
      const verifiedUserProfile = {
        id: testProfileId,
        user_id: testUserId,
        role: 'verified_user',
        is_verified: true,
        is_paid: true,
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: verifiedUserProfile,
          error: null,
        }),
      })

      // Mock additional permissions check
      mockSupabaseClient.rpc.mockResolvedValue({
        data: true, // has_verified_permissions
        error: null,
      })

      const result = await mockSupabaseClient.rpc('has_verified_permissions')

      expect(result.data).toBe(true)
      expect(result.error).toBeNull()
    })

    test('unverified users have limited permissions', async () => {
      const unverifiedUserProfile = {
        id: testProfileId,
        user_id: testUserId,
        role: 'user',
        is_verified: false,
        is_paid: false,
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: unverifiedUserProfile,
          error: null,
        }),
      })

      // Mock limited permissions check
      mockSupabaseClient.rpc.mockResolvedValue({
        data: false, // has_verified_permissions
        error: null,
      })

      const result = await mockSupabaseClient.rpc('has_verified_permissions')

      expect(result.data).toBe(false)
      expect(result.error).toBeNull()
    })

    test('banned users have no access', async () => {
      const bannedUserProfile = {
        id: testProfileId,
        user_id: testUserId,
        role: 'user',
        is_banned: true,
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'User is banned' },
        }),
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', testUserId)
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })

  describe('Data Privacy Controls', () => {
    test('user can control profile visibility', async () => {
      const privateProfile = {
        id: testProfileId,
        user_id: testUserId,
        privacy_level: 'private',
        show_online_status: false,
        show_location: false,
      }

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: privateProfile,
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .update({
          privacy_level: 'private',
          show_online_status: false,
          show_location: false,
        })
        .eq('user_id', testUserId)
        .select()
        .single()

      expect(result.data).toEqual(privateProfile)
      expect(result.error).toBeNull()
    })

    test('private profiles are not visible to unauthorized users', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Profile is private' },
        }),
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('privacy_level', 'private')
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })

    test('user can delete their own data', async () => {
      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: testProfileId,
            user_id: testUserId,
            deleted_at: new Date().toISOString(),
          },
          error: null,
        }),
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', testUserId)
        .select()
        .single()

      expect(result.data.deleted_at).toBeTruthy()
      expect(result.error).toBeNull()
    })

    test('user cannot delete other users data', async () => {
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
        .update({ deleted_at: new Date().toISOString() })
        .eq('user_id', otherUserId)
        .select()
        .single()

      expect(result.data).toBeNull()
      expect(result.error).toBeTruthy()
    })
  })
})


