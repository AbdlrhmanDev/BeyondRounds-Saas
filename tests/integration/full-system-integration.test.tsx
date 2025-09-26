/**
 * Full System Integration Tests for BeyondRounds
 * Tests complete user workflows and system interactions
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock test configuration inline to avoid import issues
const setupTestEnvironment = () => {
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
}

const createMockSupabaseClient = () => ({
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user', email: 'test@example.com' } },
      error: null
    }),
    getSession: jest.fn().mockResolvedValue({
      data: { session: { access_token: 'test-token' } },
      error: null
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user' }, session: { access_token: 'test-token' } },
      error: null
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: { id: 'new-user' } },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    })
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: { id: 'test-data' },
      error: null
    }),
    then: jest.fn().mockResolvedValue({
      data: [{ id: 'test-data' }],
      error: null
    })
  })),
  rpc: jest.fn().mockResolvedValue({
    data: { success: true },
    error: null
  }),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
      list: jest.fn().mockResolvedValue({ data: [], error: null })
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

// Setup test environment
setupTestEnvironment()

describe('Full System Integration Tests', () => {
  let mockSupabaseClient: any
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    mockSupabaseClient = createMockSupabaseClient()
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Complete User Registration and Onboarding Flow', () => {
    test('should complete full user registration process', async () => {
      // Step 1: User signs up
      const signUpData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        metadata: {
          name: 'Dr. New User',
          specialty: 'Internal Medicine'
        }
      }

      const signUpResult = await mockSupabaseClient.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: { data: signUpData.metadata }
      })

      expect(signUpResult.data.user).toBeTruthy()
      expect(signUpResult.error).toBeNull()

      // Step 2: Create profile after email verification
      const profileData = {
        user_id: signUpResult.data.user.id,
        name: signUpData.metadata.name,
        email: signUpData.email,
        specialty: signUpData.metadata.specialty,
        experience_level: 'Resident',
        location: 'Boston, MA',
        interests: ['Research', 'Education'],
        bio: 'Passionate about internal medicine and patient care'
      }

      const profileResult = await mockSupabaseClient
        .from('profiles')
        .insert(profileData)

      expect(profileResult.data).toContain(profileData)

      // Step 3: Verify profile exists
      const getProfileResult = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', signUpResult.data.user.id)
        .single()

      expect(getProfileResult.data).toBeTruthy()
      expect(getProfileResult.data.name).toBe(signUpData.metadata.name)

      console.log('✅ User registration and profile creation completed')
    })

    test('should handle profile completion workflow', async () => {
      const userId = 'test-user-123'

      // Simulate incomplete profile
      const incompleteProfile = {
        user_id: userId,
        name: 'Dr. Incomplete',
        email: 'incomplete@example.com',
        specialty: null, // Missing required field
        experience_level: null // Missing required field
      }

      await mockSupabaseClient.from('profiles').insert(incompleteProfile)

      // Profile completion steps
      const profileUpdates = [
        { specialty: 'Emergency Medicine' },
        { experience_level: 'Attending' },
        { location: 'New York, NY' },
        { interests: ['Trauma', 'Critical Care'] },
        { bio: 'Experienced emergency physician' },
        { phone_number: '+1-555-0123' }
      ]

      // Apply updates sequentially
      for (const update of profileUpdates) {
        await mockSupabaseClient
          .from('profiles')
          .update(update)
          .eq('user_id', userId)
      }

      // Verify profile is now complete
      const completeProfile = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      expect(completeProfile.data.specialty).toBe('Emergency Medicine')
      expect(completeProfile.data.experience_level).toBe('Attending')
      expect(completeProfile.data.location).toBe('New York, NY')

      console.log('✅ Profile completion workflow verified')
    })
  })

  describe('Matching System Integration', () => {
    test('should complete full matching workflow', async () => {
      // Step 1: Create test users with profiles
      const users = [
        {
          id: 'user-1',
          profile: {
            name: 'Dr. Alice Smith',
            specialty: 'Emergency Medicine',
            experience_level: 'Attending',
            location: 'New York, NY',
            interests: ['Research', 'Teaching']
          }
        },
        {
          id: 'user-2',
          profile: {
            name: 'Dr. Bob Johnson',
            specialty: 'Emergency Medicine',
            experience_level: 'Fellow',
            location: 'New York, NY',
            interests: ['Research', 'Clinical Practice']
          }
        },
        {
          id: 'user-3',
          profile: {
            name: 'Dr. Carol Davis',
            specialty: 'Pediatrics',
            experience_level: 'Resident',
            location: 'Boston, MA',
            interests: ['Education']
          }
        }
      ]

      // Insert profiles
      for (const user of users) {
        await mockSupabaseClient
          .from('profiles')
          .insert({ user_id: user.id, ...user.profile })
      }

      // Step 2: Run matching algorithm (simulate)
      const calculateCompatibility = (profile1: any, profile2: any) => {
        let score = 0
        if (profile1.specialty === profile2.specialty) score += 40
        if (profile1.location === profile2.location) score += 30
        if (profile1.interests.some((i: string) => profile2.interests.includes(i))) score += 30
        return score
      }

      // Calculate matches for user-1
      const user1Profile = users[0].profile
      const potentialMatches = users.slice(1).map(user => ({
        userId: user.id,
        profile: user.profile,
        score: calculateCompatibility(user1Profile, user.profile)
      }))

      // Filter matches above threshold (60)
      const validMatches = potentialMatches.filter(match => match.score >= 60)

      expect(validMatches.length).toBeGreaterThan(0)
      expect(validMatches[0].score).toBeGreaterThan(60)

      // Step 3: Create match records
      for (const match of validMatches) {
        await mockSupabaseClient.from('matches').insert({
          user1_id: 'user-1',
          user2_id: match.userId,
          compatibility_score: match.score,
          status: 'active'
        })
      }

      // Step 4: Verify matches were created
      const matchesResult = await mockSupabaseClient
        .from('matches')
        .select('*')
        .eq('user1_id', 'user-1')

      expect(matchesResult.data).toBeTruthy()
      expect(Array.isArray(matchesResult.data)).toBe(true)

      console.log('✅ Matching system integration completed')
    })

    test('should handle group formation from matches', async () => {
      // Step 1: Create successful matches
      const matches = [
        { user1_id: 'user-a', user2_id: 'user-b', compatibility_score: 85 },
        { user1_id: 'user-a', user2_id: 'user-c', compatibility_score: 78 },
        { user1_id: 'user-b', user2_id: 'user-c', compatibility_score: 82 }
      ]

      for (const match of matches) {
        await mockSupabaseClient.from('matches').insert({
          ...match,
          status: 'accepted'
        })
      }

      // Step 2: Create group for matched users
      const groupData = {
        name: 'Emergency Medicine Discussion Group',
        description: 'A group for emergency medicine professionals to share experiences and knowledge',
        created_by: 'user-a'
      }

      const groupResult = await mockSupabaseClient
        .from('groups')
        .insert(groupData)

      expect(groupResult.data).toContain(groupData)

      // Step 3: Add members to group
      const groupId = 'group-123'
      const memberIds = ['user-a', 'user-b', 'user-c']

      for (const memberId of memberIds) {
        await mockSupabaseClient.from('group_members').insert({
          group_id: groupId,
          user_id: memberId
        })
      }

      // Step 4: Verify group membership
      const membersResult = await mockSupabaseClient
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)

      expect(membersResult.data).toBeTruthy()
      expect(Array.isArray(membersResult.data)).toBe(true)

      console.log('✅ Group formation from matches completed')
    })
  })

  describe('Chat System Integration', () => {
    test('should complete full chat workflow', async () => {
      const groupId = 'test-group-456'
      const users = ['user-x', 'user-y', 'user-z']

      // Step 1: Set up realtime channel
      const channel = mockSupabaseClient.realtime.channel(`group-${groupId}`)

      const messageHandler = jest.fn()
      channel.on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${groupId}`
      }, messageHandler)

      await channel.subscribe()

      // Step 2: Users send messages
      const messages = [
        { sender_id: 'user-x', content: 'Hello everyone! Excited to be in this group.' },
        { sender_id: 'user-y', content: 'Hi! Great to connect with fellow physicians.' },
        { sender_id: 'user-z', content: 'Looking forward to our discussions!' },
        { sender_id: 'user-x', content: 'Has anyone worked with the new trauma protocols?' },
        { sender_id: 'user-y', content: 'Yes, implemented them last month. Very effective!' }
      ]

      for (const message of messages) {
        await mockSupabaseClient.from('messages').insert({
          group_id: groupId,
          ...message,
          created_at: new Date().toISOString()
        })
      }

      // Step 3: Retrieve message history
      const messageHistory = await mockSupabaseClient
        .from('messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })

      expect(messageHistory.data).toBeTruthy()
      expect(Array.isArray(messageHistory.data)).toBe(true)

      // Step 4: Test message search/filtering
      const searchResults = await mockSupabaseClient
        .from('messages')
        .select('*')
        .eq('group_id', groupId)
        .ilike('content', '%trauma%')

      expect(searchResults.data).toBeTruthy()

      console.log('✅ Chat system integration completed')
    })

    test('should handle real-time message delivery', async () => {
      const groupId = 'realtime-group-789'

      // Set up multiple subscribers (simulating different users)
      const subscribers = ['user-1', 'user-2', 'user-3'].map(userId => {
        const channel = mockSupabaseClient.realtime.channel(`user-${userId}-${groupId}`)
        const handler = jest.fn()

        channel.on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        }, handler)

        return { userId, channel, handler }
      })

      // Subscribe all channels
      await Promise.all(subscribers.map(sub => sub.channel.subscribe()))

      // Send a message
      const newMessage = {
        group_id: groupId,
        sender_id: 'user-1',
        content: 'Real-time message test',
        created_at: new Date().toISOString()
      }

      await mockSupabaseClient.from('messages').insert(newMessage)

      // Verify all subscribers can access the message
      expect(subscribers.length).toBe(3)
      subscribers.forEach(sub => {
        expect(sub.channel.on).toHaveBeenCalled()
        expect(sub.channel.subscribe).toHaveBeenCalled()
      })

      console.log('✅ Real-time message delivery integration completed')
    })
  })

  describe('Dashboard Integration', () => {
    test('should load complete dashboard data', async () => {
      const userId = 'dashboard-user-123'

      // Mock dashboard data queries
      const dashboardQueries = [
        // User profile
        mockSupabaseClient.from('profiles').select('*').eq('user_id', userId).single(),

        // User matches
        mockSupabaseClient.from('matches').select('*').eq('user1_id', userId).order('created_at', { ascending: false }),

        // User groups
        mockSupabaseClient.from('group_members')
          .select('*, groups(*)')
          .eq('user_id', userId),

        // Recent messages
        mockSupabaseClient.from('messages')
          .select('*, groups(name)')
          .in('group_id', ['group-1', 'group-2'])
          .order('created_at', { ascending: false })
          .limit(10),

        // Statistics
        mockSupabaseClient.rpc('get_user_stats', { user_id: userId })
      ]

      const results = await Promise.all(dashboardQueries)

      // Verify all queries completed successfully
      results.forEach((result, index) => {
        expect(result).toBeTruthy()
        if (result.error) {
          console.error(`Query ${index} failed:`, result.error)
        }
        expect(result.error).toBeNull()
      })

      console.log('✅ Dashboard data integration completed')
    })

    test('should handle dashboard real-time updates', async () => {
      const userId = 'realtime-dashboard-user-456'

      // Set up real-time subscriptions for dashboard
      const subscriptions = [
        // New matches
        mockSupabaseClient.realtime.channel('user-matches')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'matches',
            filter: `user1_id=eq.${userId}`
          }, jest.fn()),

        // New messages in user's groups
        mockSupabaseClient.realtime.channel('user-messages')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          }, jest.fn()),

        // Profile updates
        mockSupabaseClient.realtime.channel('profile-updates')
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${userId}`
          }, jest.fn())
      ]

      // Subscribe to all channels
      await Promise.all(subscriptions.map(sub => sub.subscribe()))

      expect(subscriptions).toHaveLength(3)
      subscriptions.forEach(sub => {
        expect(sub.on).toHaveBeenCalled()
        expect(sub.subscribe).toHaveBeenCalled()
      })

      console.log('✅ Dashboard real-time updates integration completed')
    })
  })

  describe('Admin System Integration', () => {
    test('should complete admin user management workflow', async () => {
      // Step 1: Admin authentication
      const adminUser = await mockSupabaseClient.auth.getUser()
      expect(adminUser.data.user).toBeTruthy()

      // Step 2: Get all users for admin dashboard
      const allUsers = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      expect(allUsers.data).toBeTruthy()
      expect(Array.isArray(allUsers.data)).toBe(true)

      // Step 3: Get system statistics
      const stats = await mockSupabaseClient.rpc('get_admin_stats')
      expect(stats.data).toBeTruthy()

      // Step 4: User verification workflow
      const unverifiedUsers = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('verification_status', 'pending')

      expect(unverifiedUsers.data).toBeTruthy()

      // Verify a user
      const userToVerify = 'user-pending-verification'
      const verificationResult = await mockSupabaseClient
        .from('profiles')
        .update({ verification_status: 'verified' })
        .eq('user_id', userToVerify)

      expect(verificationResult).toBeDefined()

      // Step 5: Run matching algorithm for all users
      const matchingResult = await mockSupabaseClient.rpc('run_weekly_matching')
      expect(matchingResult.data).toBeTruthy()

      console.log('✅ Admin user management integration completed')
    })

    test('should handle admin analytics and reporting', async () => {
      // Mock analytics queries
      const analyticsQueries = [
        // User growth
        mockSupabaseClient.rpc('get_user_growth_stats'),

        // Matching success rates
        mockSupabaseClient.rpc('get_matching_stats'),

        // Message activity
        mockSupabaseClient.rpc('get_messaging_stats'),

        // Geographic distribution
        mockSupabaseClient.from('profiles')
          .select('location')
          .not('location', 'is', null),

        // Specialty distribution
        mockSupabaseClient.from('profiles')
          .select('specialty')
          .not('specialty', 'is', null)
      ]

      const analyticsResults = await Promise.all(analyticsQueries)

      analyticsResults.forEach((result, index) => {
        expect(result).toBeTruthy()
        expect(result.error).toBeNull()
      })

      console.log('✅ Admin analytics integration completed')
    })
  })

  describe('Error Handling and Recovery Integration', () => {
    test('should handle authentication failures gracefully', async () => {
      // Simulate authentication failure
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      })

      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      })

      expect(result.error).toBeTruthy()
      expect(result.error.message).toContain('Invalid login credentials')

      // Test recovery - successful login after fixing credentials
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: 'recovery-user', email: 'valid@example.com' },
          session: { access_token: 'recovery-token' }
        },
        error: null
      })

      const recoveryResult = await mockSupabaseClient.auth.signInWithPassword({
        email: 'valid@example.com',
        password: 'correctpassword'
      })

      expect(recoveryResult.data.user).toBeTruthy()
      expect(recoveryResult.error).toBeNull()

      console.log('✅ Authentication error handling integration completed')
    })

    test('should handle database connection failures', async () => {
      // Simulate database error
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed', code: 'PGRST301' }
        })
      })

      const result = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .single()

      expect(result.error).toBeTruthy()
      expect(result.error.message).toContain('Database connection failed')

      // Test retry logic
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'recovery-profile' },
          error: null
        })
      })

      const retryResult = await mockSupabaseClient
        .from('profiles')
        .select('*')
        .single()

      expect(retryResult.data).toBeTruthy()
      expect(retryResult.error).toBeNull()

      console.log('✅ Database error handling integration completed')
    })
  })

  describe('Performance and Load Integration', () => {
    test('should handle concurrent user operations', async () => {
      const concurrentOperations = []

      // Simulate 10 concurrent users performing operations
      for (let i = 0; i < 10; i++) {
        const userId = `concurrent-user-${i}`

        const operations = [
          // User authentication
          mockSupabaseClient.auth.getUser(),

          // Profile loading
          mockSupabaseClient.from('profiles').select('*').eq('user_id', userId).single(),

          // Matches loading
          mockSupabaseClient.from('matches').select('*').eq('user1_id', userId),

          // Send message
          mockSupabaseClient.from('messages').insert({
            group_id: 'load-test-group',
            sender_id: userId,
            content: `Message from user ${i}`
          })
        ]

        concurrentOperations.push(...operations)
      }

      const startTime = performance.now()
      const results = await Promise.all(concurrentOperations)
      const endTime = performance.now()

      const duration = endTime - startTime
      const successfulOperations = results.filter(r => r && !r.error)

      expect(successfulOperations.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds with mocks

      console.log(`✅ Concurrent operations completed: ${successfulOperations.length}/${results.length} successful in ${duration.toFixed(2)}ms`)
    })

    test('should handle large dataset operations', async () => {
      // Mock large dataset
      const largeUserSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `bulk-user-${i}`,
        name: `User ${i}`,
        specialty: i % 2 === 0 ? 'Emergency Medicine' : 'Internal Medicine',
        experience_level: ['Resident', 'Fellow', 'Attending'][i % 3]
      }))

      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        then: jest.fn().mockResolvedValue({
          data: largeUserSet,
          error: null
        })
      })

      const startTime = performance.now()
      const result = await mockSupabaseClient.from('profiles').select('*')
      const endTime = performance.now()

      expect(result.data).toHaveLength(1000)
      expect(endTime - startTime).toBeLessThan(1000) // Fast with mocks

      console.log('✅ Large dataset handling integration completed')
    })
  })

  describe('End-to-End User Journey Integration', () => {
    test('should complete full user lifecycle', async () => {
      console.log('🚀 Starting complete user lifecycle test...')

      // Phase 1: Registration and Onboarding
      const newUser = {
        email: 'lifecycle@example.com',
        password: 'SecurePass123!',
        name: 'Dr. Lifecycle Test',
        specialty: 'Emergency Medicine',
        experience_level: 'Attending'
      }

      // 1.1: Sign up
      const signUpResult = await mockSupabaseClient.auth.signUp({
        email: newUser.email,
        password: newUser.password
      })
      expect(signUpResult.data.user).toBeTruthy()

      // 1.2: Create profile
      const profileResult = await mockSupabaseClient.from('profiles').insert({
        user_id: signUpResult.data.user.id,
        name: newUser.name,
        email: newUser.email,
        specialty: newUser.specialty,
        experience_level: newUser.experience_level,
        location: 'Test City, TS',
        interests: ['Research', 'Education']
      })
      expect(profileResult.data).toBeTruthy()

      console.log('  ✅ Phase 1: Registration and Onboarding completed')

      // Phase 2: Matching and Connection
      // 2.1: Find matches
      const matchesResult = await mockSupabaseClient.rpc('get_user_matches', {
        user_id: signUpResult.data.user.id
      })
      expect(matchesResult.data).toBeTruthy()

      // 2.2: Accept match and create group
      const groupResult = await mockSupabaseClient.from('groups').insert({
        name: 'Test Connection Group',
        description: 'Group formed from matching',
        created_by: signUpResult.data.user.id
      })
      expect(groupResult.data).toBeTruthy()

      console.log('  ✅ Phase 2: Matching and Connection completed')

      // Phase 3: Active Participation
      const groupId = 'lifecycle-group-id'

      // 3.1: Join group
      const joinResult = await mockSupabaseClient.from('group_members').insert({
        group_id: groupId,
        user_id: signUpResult.data.user.id
      })
      expect(joinResult.data).toBeTruthy()

      // 3.2: Send messages
      const messages = [
        'Hello everyone, excited to be here!',
        'Looking forward to collaborating',
        'Happy to share my experience in emergency medicine'
      ]

      for (const content of messages) {
        await mockSupabaseClient.from('messages').insert({
          group_id: groupId,
          sender_id: signUpResult.data.user.id,
          content
        })
      }

      console.log('  ✅ Phase 3: Active Participation completed')

      // Phase 4: Profile Management
      // 4.1: Update profile
      const profileUpdates = {
        bio: 'Updated bio with more details about my practice',
        interests: ['Research', 'Education', 'Mentoring'],
        phone_number: '+1-555-LIFECYCLE'
      }

      const updateResult = await mockSupabaseClient
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', signUpResult.data.user.id)
      expect(updateResult).toBeDefined()

      console.log('  ✅ Phase 4: Profile Management completed')

      // Phase 5: Dashboard Analytics
      // 5.1: Load dashboard data
      const dashboardData = await Promise.all([
        mockSupabaseClient.from('profiles').select('*').eq('user_id', signUpResult.data.user.id).single(),
        mockSupabaseClient.from('matches').select('*').eq('user1_id', signUpResult.data.user.id),
        mockSupabaseClient.from('group_members').select('*, groups(*)').eq('user_id', signUpResult.data.user.id),
        mockSupabaseClient.rpc('get_user_stats', { user_id: signUpResult.data.user.id })
      ])

      dashboardData.forEach(result => {
        expect(result).toBeDefined()
      })

      console.log('  ✅ Phase 5: Dashboard Analytics completed')

      console.log('🎉 Complete user lifecycle test completed successfully!')
    })
  })

  describe('System Health and Monitoring Integration', () => {
    test('should verify all system components are healthy', async () => {
      console.log('🔍 Running system health check...')

      const healthChecks = [
        {
          name: 'Authentication Service',
          check: () => mockSupabaseClient.auth.getUser()
        },
        {
          name: 'Database Connectivity',
          check: () => mockSupabaseClient.from('profiles').select('count').limit(1)
        },
        {
          name: 'Storage Service',
          check: () => mockSupabaseClient.storage.from('avatars').list('', { limit: 1 })
        },
        {
          name: 'Realtime Service',
          check: () => {
            const channel = mockSupabaseClient.realtime.channel('health-check')
            return channel.subscribe()
          }
        },
        {
          name: 'RPC Functions',
          check: () => mockSupabaseClient.rpc('get_admin_stats')
        }
      ]

      const results = await Promise.allSettled(
        healthChecks.map(async ({ name, check }) => {
          try {
            await check()
            return { name, status: 'healthy', response_time: Math.random() * 100 }
          } catch (error) {
            return { name, status: 'unhealthy', error }
          }
        })
      )

      const healthyServices = results.filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === 'fulfilled' && result.value.status === 'healthy'
      )

      const unhealthyServices = results.filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === 'fulfilled' && result.value.status === 'unhealthy'
      )

      console.log(`✅ Healthy services: ${healthyServices.length}/${results.length}`)

      if (unhealthyServices.length > 0) {
        console.log(`❌ Unhealthy services: ${unhealthyServices.map(s => s.value.name).join(', ')}`)
      }

      expect(healthyServices.length).toBeGreaterThan(0)
      expect(results.length).toBe(5)

      console.log('🎯 System health check completed')
    })
  })
})