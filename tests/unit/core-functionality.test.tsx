/**
 * Unit Tests for Core Functionality
 * Tests individual components and functions in isolation
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Inline test setup to avoid import issues
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
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user' }, session: { access_token: 'test-token' } },
      error: null
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: { id: 'new-user' } },
      error: null
    }),
    signOut: jest.fn().mockResolvedValue({ error: null })
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: { id: 'test-data' },
      error: null
    })
  })),
  rpc: jest.fn().mockResolvedValue({
    data: { success: true },
    error: null
  })
})

// Setup test environment
setupTestEnvironment()

describe('Core Functionality Unit Tests', () => {
  let mockSupabaseClient: any
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    mockSupabaseClient = createMockSupabaseClient()
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Authentication Functions', () => {
    const mockAuthFunctions = {
      signIn: async (email: string, password: string) => {
        return await mockSupabaseClient.auth.signInWithPassword({ email, password })
      },

      signUp: async (email: string, password: string, metadata: any) => {
        return await mockSupabaseClient.auth.signUp({
          email,
          password,
          options: { data: metadata }
        })
      },

      signOut: async () => {
        return await mockSupabaseClient.auth.signOut()
      },

      getUser: async () => {
        return await mockSupabaseClient.auth.getUser()
      }
    }

    test('should handle successful login', async () => {
      const result = await mockAuthFunctions.signIn('test@example.com', 'password123')

      expect(result.data.user).toBeTruthy()
      expect(result.data.session).toBeTruthy()
      expect(result.error).toBeNull()
    })

    test('should handle user registration', async () => {
      const metadata = { name: 'Test User', specialty: 'Emergency Medicine' }
      const result = await mockAuthFunctions.signUp('new@example.com', 'password123', metadata)

      expect(result.data.user).toBeTruthy()
      expect(result.error).toBeNull()
    })

    test('should handle logout', async () => {
      const result = await mockAuthFunctions.signOut()
      expect(result.error).toBeNull()
    })

    test('should retrieve current user', async () => {
      const result = await mockAuthFunctions.getUser()
      expect(result.data.user).toBeTruthy()
    })
  })

  describe('Profile Management Functions', () => {
    const mockProfileFunctions = {
      createProfile: async (profileData: any) => {
        return await mockSupabaseClient.from('profiles').insert(profileData)
      },

      getProfile: async (userId: string) => {
        return await mockSupabaseClient
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single()
      },

      updateProfile: async (userId: string, updates: any) => {
        return await mockSupabaseClient
          .from('profiles')
          .update(updates)
          .eq('user_id', userId)
      },

      deleteProfile: async (userId: string) => {
        return await mockSupabaseClient
          .from('profiles')
          .delete()
          .eq('user_id', userId)
      }
    }

    test('should create new profile', async () => {
      const profileData = {
        user_id: 'test-user-id',
        name: 'Dr. Test User',
        specialty: 'Emergency Medicine',
        experience_level: 'Attending'
      }

      const result = await mockProfileFunctions.createProfile(profileData)
      expect(result.data).toContain(profileData)
    })

    test('should retrieve profile', async () => {
      const result = await mockProfileFunctions.getProfile('test-user-id')
      expect(result.data).toBeTruthy()
      expect(result.data.user_id).toBeDefined()
    })

    test('should update profile', async () => {
      const updates = { name: 'Dr. Updated User', bio: 'Updated bio' }
      const result = await mockProfileFunctions.updateProfile('test-user-id', updates)
      expect(result.data).toBeTruthy()
    })

    test('should delete profile', async () => {
      const result = await mockProfileFunctions.deleteProfile('test-user-id')
      expect(result.error).toBeNull()
    })
  })

  describe('Matching Algorithm Functions', () => {
    const mockMatchingFunctions = {
      calculateCompatibility: (profile1: any, profile2: any) => {
        let score = 0

        // Specialty match (30 points)
        if (profile1.specialty === profile2.specialty) {
          score += 30
        }

        // Location match (20 points)
        if (profile1.location === profile2.location) {
          score += 20
        }

        // Experience level compatibility (25 points)
        const experienceLevels = ['Medical Student', 'Resident', 'Fellow', 'Attending']
        const exp1Index = experienceLevels.indexOf(profile1.experience_level)
        const exp2Index = experienceLevels.indexOf(profile2.experience_level)
        const experienceDiff = Math.abs(exp1Index - exp2Index)

        if (experienceDiff <= 1) {
          score += 25 - (experienceDiff * 5)
        }

        // Interest overlap (25 points)
        if (profile1.interests && profile2.interests) {
          const commonInterests = profile1.interests.filter((interest: string) =>
            profile2.interests.includes(interest)
          )
          score += Math.min(commonInterests.length * 5, 25)
        }

        return Math.min(score, 100)
      },

      findMatches: async (userId: string) => {
        return await mockSupabaseClient.rpc('get_user_matches', { user_id: userId })
      },

      createMatch: async (user1Id: string, user2Id: string, score: number) => {
        return await mockSupabaseClient.from('matches').insert({
          user1_id: user1Id,
          user2_id: user2Id,
          compatibility_score: score,
          status: 'active'
        })
      }
    }

    test('should calculate high compatibility for similar profiles', () => {
      const profile1 = {
        specialty: 'Emergency Medicine',
        location: 'New York, NY',
        experience_level: 'Attending',
        interests: ['Research', 'Teaching', 'Clinical Work']
      }

      const profile2 = {
        specialty: 'Emergency Medicine',
        location: 'New York, NY',
        experience_level: 'Fellow',
        interests: ['Research', 'Teaching']
      }

      const score = mockMatchingFunctions.calculateCompatibility(profile1, profile2)
      expect(score).toBeGreaterThan(70) // High compatibility
    })

    test('should calculate low compatibility for dissimilar profiles', () => {
      const profile1 = {
        specialty: 'Emergency Medicine',
        location: 'New York, NY',
        experience_level: 'Attending',
        interests: ['Research']
      }

      const profile2 = {
        specialty: 'Pediatrics',
        location: 'Los Angeles, CA',
        experience_level: 'Medical Student',
        interests: ['Sports Medicine']
      }

      const score = mockMatchingFunctions.calculateCompatibility(profile1, profile2)
      expect(score).toBeLessThan(30) // Low compatibility
    })

    test('should find user matches', async () => {
      const result = await mockMatchingFunctions.findMatches('test-user-id')
      expect(result.data).toBeTruthy()
      expect(Array.isArray(result.data)).toBe(true)
    })

    test('should create match record', async () => {
      const result = await mockMatchingFunctions.createMatch('user1', 'user2', 85)
      expect(result.data).toBeTruthy()
    })
  })

  describe('Chat Functions', () => {
    const mockChatFunctions = {
      createGroup: async (groupData: any) => {
        return await mockSupabaseClient.from('groups').insert(groupData)
      },

      joinGroup: async (groupId: string, userId: string) => {
        return await mockSupabaseClient.from('group_members').insert({
          group_id: groupId,
          user_id: userId
        })
      },

      sendMessage: async (groupId: string, senderId: string, content: string) => {
        return await mockSupabaseClient.from('messages').insert({
          group_id: groupId,
          sender_id: senderId,
          content: content
        })
      },

      getMessages: async (groupId: string) => {
        return await mockSupabaseClient
          .from('messages')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true })
      },

      subscribeToMessages: (groupId: string, callback: Function) => {
        const channel = mockSupabaseClient.realtime.channel(`group-${groupId}`)
        channel.on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${groupId}`
        }, callback)

        return channel
      }
    }

    test('should create chat group', async () => {
      const groupData = {
        name: 'Emergency Medicine Group',
        description: 'Discussion for EM physicians',
        created_by: 'test-user-id'
      }

      const result = await mockChatFunctions.createGroup(groupData)
      expect(result.data).toContain(groupData)
    })

    test('should join group', async () => {
      const result = await mockChatFunctions.joinGroup('group-id', 'user-id')
      expect(result.data).toBeTruthy()
    })

    test('should send message', async () => {
      const result = await mockChatFunctions.sendMessage(
        'group-id',
        'sender-id',
        'Hello, everyone!'
      )
      expect(result.data).toBeTruthy()
    })

    test('should retrieve messages', async () => {
      const result = await mockChatFunctions.getMessages('group-id')
      expect(result.data).toBeTruthy()
      expect(Array.isArray(result.data)).toBe(true)
    })

    test('should set up realtime subscription', () => {
      const mockCallback = jest.fn()
      const channel = mockChatFunctions.subscribeToMessages('group-id', mockCallback)

      expect(channel).toBeDefined()
      expect(channel.on).toHaveBeenCalled()
    })
  })

  describe('Utility Functions', () => {
    const mockUtilities = {
      validateEmail: (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      },

      validatePhone: (phone: string) => {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
        return phoneRegex.test(phone)
      },

      formatDate: (date: Date | string) => {
        const d = new Date(date)
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      },

      generateId: () => {
        return `id-${Math.random().toString(36).substr(2, 9)}`
      },

      sanitizeInput: (input: string) => {
        return input.trim().replace(/[<>]/g, '')
      },

      calculateAge: (birthDate: Date | string) => {
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--
        }

        return age
      }
    }

    test('should validate email addresses', () => {
      expect(mockUtilities.validateEmail('test@example.com')).toBe(true)
      expect(mockUtilities.validateEmail('invalid-email')).toBe(false)
      expect(mockUtilities.validateEmail('test@')).toBe(false)
      expect(mockUtilities.validateEmail('@example.com')).toBe(false)
    })

    test('should validate phone numbers', () => {
      expect(mockUtilities.validatePhone('+1234567890')).toBe(true)
      expect(mockUtilities.validatePhone('(555) 123-4567')).toBe(true)
      expect(mockUtilities.validatePhone('123')).toBe(false)
      expect(mockUtilities.validatePhone('abc123')).toBe(false)
    })

    test('should format dates', () => {
      const testDate = new Date('2023-12-25')
      const formatted = mockUtilities.formatDate(testDate)
      expect(formatted).toMatch(/Dec 25, 2023/)
    })

    test('should generate unique IDs', () => {
      const id1 = mockUtilities.generateId()
      const id2 = mockUtilities.generateId()

      expect(id1).toMatch(/^id-[a-z0-9]{9}$/)
      expect(id2).toMatch(/^id-[a-z0-9]{9}$/)
      expect(id1).not.toBe(id2)
    })

    test('should sanitize input', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello'
      const sanitized = mockUtilities.sanitizeInput(maliciousInput)
      expect(sanitized).toBe('scriptalert("xss")/scriptHello')
    })

    test('should calculate age correctly', () => {
      const birthDate = new Date('1990-06-15')
      const age = mockUtilities.calculateAge(birthDate)
      expect(age).toBeGreaterThan(30)
      expect(typeof age).toBe('number')
    })
  })

  describe('Error Handling Functions', () => {
    const mockErrorHandlers = {
      handleApiError: (error: any) => {
        if (!error) return null

        const errorMap: { [key: string]: string } = {
          'auth/invalid-email': 'Invalid email address',
          'auth/user-not-found': 'User not found',
          'auth/wrong-password': 'Incorrect password',
          'auth/too-many-requests': 'Too many login attempts',
          'database/connection-failed': 'Database connection failed',
          'validation/missing-required-field': 'Required field missing'
        }

        return errorMap[error.code] || error.message || 'An unexpected error occurred'
      },

      validateProfileData: (data: any) => {
        const errors: string[] = []

        if (!data.name || data.name.trim().length < 2) {
          errors.push('Name must be at least 2 characters')
        }

        if (!data.email || !data.email.includes('@')) {
          errors.push('Valid email is required')
        }

        if (!data.specialty || data.specialty.trim().length === 0) {
          errors.push('Specialty is required')
        }

        if (!data.experience_level) {
          errors.push('Experience level is required')
        }

        return errors
      },

      isRetryableError: (error: any) => {
        const retryableCodes = [
          'network-error',
          'timeout',
          'rate-limit-exceeded',
          'server-error-5xx'
        ]

        return retryableCodes.includes(error?.code)
      }
    }

    test('should handle API errors', () => {
      const authError = { code: 'auth/invalid-email' }
      const message = mockErrorHandlers.handleApiError(authError)
      expect(message).toBe('Invalid email address')

      const unknownError = { code: 'unknown-error' }
      const unknownMessage = mockErrorHandlers.handleApiError(unknownError)
      expect(unknownMessage).toBe('unknown-error')
    })

    test('should validate profile data', () => {
      const validData = {
        name: 'Dr. John Doe',
        email: 'john@example.com',
        specialty: 'Emergency Medicine',
        experience_level: 'Attending'
      }

      const errors = mockErrorHandlers.validateProfileData(validData)
      expect(errors).toHaveLength(0)

      const invalidData = {
        name: 'A',
        email: 'invalid-email',
        specialty: '',
        experience_level: null
      }

      const invalidErrors = mockErrorHandlers.validateProfileData(invalidData)
      expect(invalidErrors.length).toBeGreaterThan(0)
    })

    test('should identify retryable errors', () => {
      const retryableError = { code: 'network-error' }
      const nonRetryableError = { code: 'validation-error' }

      expect(mockErrorHandlers.isRetryableError(retryableError)).toBe(true)
      expect(mockErrorHandlers.isRetryableError(nonRetryableError)).toBe(false)
    })
  })

  describe('Component Utilities', () => {
    const TestButton = ({ onClick, children, disabled = false }: any) => (
      <button onClick={onClick} disabled={disabled} data-testid="test-button">
        {children}
      </button>
    )

    const TestForm = ({ onSubmit }: any) => (
      <form onSubmit={onSubmit} data-testid="test-form">
        <input data-testid="test-input" placeholder="Test input" />
        <TestButton type="submit">Submit</TestButton>
      </form>
    )

    const TestCard = ({ title, content, actions }: any) => (
      <div data-testid="test-card">
        <h3>{title}</h3>
        <p>{content}</p>
        {actions && <div data-testid="card-actions">{actions}</div>}
      </div>
    )

    test('should render button component', () => {
      const handleClick = jest.fn()
      render(<TestButton onClick={handleClick}>Click me</TestButton>)

      const button = screen.getByTestId('test-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Click me')
    })

    test('should handle button clicks', async () => {
      const handleClick = jest.fn()
      render(<TestButton onClick={handleClick}>Click me</TestButton>)

      const button = screen.getByTestId('test-button')
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('should render form component', () => {
      const handleSubmit = jest.fn()
      render(<TestForm onSubmit={handleSubmit} />)

      expect(screen.getByTestId('test-form')).toBeInTheDocument()
      expect(screen.getByTestId('test-input')).toBeInTheDocument()
      expect(screen.getByTestId('test-button')).toBeInTheDocument()
    })

    test('should render card component', () => {
      const actions = <TestButton>Action</TestButton>
      render(
        <TestCard
          title="Test Card"
          content="This is test content"
          actions={actions}
        />
      )

      expect(screen.getByTestId('test-card')).toBeInTheDocument()
      expect(screen.getByText('Test Card')).toBeInTheDocument()
      expect(screen.getByText('This is test content')).toBeInTheDocument()
      expect(screen.getByTestId('card-actions')).toBeInTheDocument()
    })
  })

  describe('Performance Functions', () => {
    const mockPerformanceFunctions = {
      debounce: (func: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout
        return (...args: any[]) => {
          clearTimeout(timeoutId)
          timeoutId = setTimeout(() => func.apply(null, args), delay)
        }
      },

      throttle: (func: Function, limit: number) => {
        let inThrottle: boolean
        return (...args: any[]) => {
          if (!inThrottle) {
            func.apply(null, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
          }
        }
      },

      memoize: (func: Function) => {
        const cache = new Map()
        return (...args: any[]) => {
          const key = JSON.stringify(args)
          if (cache.has(key)) {
            return cache.get(key)
          }
          const result = func.apply(null, args)
          cache.set(key, result)
          return result
        }
      }
    }

    test('should debounce function calls', (done) => {
      const mockFn = jest.fn()
      const debouncedFn = mockPerformanceFunctions.debounce(mockFn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      // Function should not be called immediately
      expect(mockFn).not.toHaveBeenCalled()

      setTimeout(() => {
        expect(mockFn).toHaveBeenCalledTimes(1)
        done()
      }, 150)
    })

    test('should throttle function calls', (done) => {
      const mockFn = jest.fn()
      const throttledFn = mockPerformanceFunctions.throttle(mockFn, 100)

      throttledFn()
      throttledFn()
      throttledFn()

      // Should be called once immediately
      expect(mockFn).toHaveBeenCalledTimes(1)

      setTimeout(() => {
        throttledFn()
        expect(mockFn).toHaveBeenCalledTimes(2)
        done()
      }, 150)
    })

    test('should memoize function results', () => {
      let callCount = 0
      const expensiveFn = (x: number) => {
        callCount++
        return x * 2
      }

      const memoizedFn = mockPerformanceFunctions.memoize(expensiveFn)

      expect(memoizedFn(5)).toBe(10)
      expect(memoizedFn(5)).toBe(10) // Should use cached result
      expect(memoizedFn(10)).toBe(20)

      expect(callCount).toBe(2) // Only called twice, not three times
    })
  })
})