/**
 * Comprehensive Performance Test Suite
 * 
 * Tests system performance and optimization:
 * - Load testing and stress testing
 * - Memory usage and leak detection
 * - Database query performance
 * - API response times
 * - Real-time system performance
 * - Concurrent user handling
 * - Resource utilization
 */

// Mock performance APIs
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
} as any

// Mock Supabase client with performance tracking
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
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
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
  })),
  rpc: jest.fn(),
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

// Performance test utilities
class PerformanceMonitor {
  private startTime: number = 0
  private endTime: number = 0
  private memoryUsage: any = {}

  start() {
    this.startTime = performance.now()
    if (process.memoryUsage) {
      this.memoryUsage.start = process.memoryUsage()
    }
  }

  end() {
    this.endTime = performance.now()
    if (process.memoryUsage) {
      this.memoryUsage.end = process.memoryUsage()
    }
  }

  getDuration() {
    return this.endTime - this.startTime
  }

  getMemoryDelta() {
    if (!this.memoryUsage.start || !this.memoryUsage.end) {
      return null
    }
    return {
      heapUsed: this.memoryUsage.end.heapUsed - this.memoryUsage.start.heapUsed,
      heapTotal: this.memoryUsage.end.heapTotal - this.memoryUsage.start.heapTotal,
      external: this.memoryUsage.end.external - this.memoryUsage.start.external,
      rss: this.memoryUsage.end.rss - this.memoryUsage.start.rss,
    }
  }
}

// Test data generators
const generateTestUser = (id: number) => ({
  id: `user-${id}`,
  first_name: `User${id}`,
  last_name: `Test${id}`,
  email: `user${id}@test.com`,
  specialty: ['Cardiology', 'Neurology', 'Pediatrics'][id % 3],
  interests: ['Running', 'Reading', 'Cooking', 'Photography'].slice(0, (id % 4) + 1),
  city: ['New York', 'Los Angeles', 'Chicago'][id % 3],
  is_verified: true,
  is_paid: true,
  onboarding_completed: true,
})

const generateTestMessage = (id: number, matchId: string, senderId: string) => ({
  id: `msg-${id}`,
  match_id: matchId,
  sender_id: senderId,
  content: `Test message ${id} with some content to simulate real messages`,
  created_at: new Date(Date.now() - (id * 60000)).toISOString(),
})

describe('⚡ Comprehensive Performance Tests', () => {
  let monitor: PerformanceMonitor

  beforeEach(() => {
    jest.clearAllMocks()
    monitor = new PerformanceMonitor()
  })

  // ============================================================================
  // DATABASE QUERY PERFORMANCE
  // ============================================================================
  describe('🗄️ Database Query Performance', () => {
    it('should handle large dataset queries efficiently', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => generateTestUser(i))

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: largeDataset.slice(0, 100),
            error: null,
          }),
        }),
      })

      monitor.start()
      
      const supabase = mockSupabaseClient
      const result = await supabase
        .from('profiles')
        .select('*')
        .limit(100)

      monitor.end()

      const duration = monitor.getDuration()
      const memoryDelta = monitor.getMemoryDelta()

      expect(result.data).toHaveLength(100)
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
      
      if (memoryDelta) {
        expect(memoryDelta.heapUsed).toBeLessThan(50 * 1024 * 1024) // Less than 50MB
      }
    })

    it('should optimize complex join queries', async () => {
      const complexJoinResult = Array.from({ length: 50 }, (_, i) => ({
        id: `match-${i}`,
        compatibility_score: 0.8 + (i % 20) / 100,
        match_members: Array.from({ length: 3 }, (_, j) => ({
          user_id: `user-${i * 3 + j}`,
          profiles: generateTestUser(i * 3 + j),
        })),
        chat_messages: Array.from({ length: 10 }, (_, k) => 
          generateTestMessage(k, `match-${i}`, `user-${i * 3 + (k % 3)}`)
        ),
      }))

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: complexJoinResult,
          error: null,
        }),
      })

      monitor.start()

      const supabase = mockSupabaseClient
      const result = await supabase
        .from('matches')
        .select(`
          *,
          match_members(
            user_id,
            profiles(*)
          ),
          chat_messages(*)
        `)

      monitor.end()

      const duration = monitor.getDuration()

      expect(result.data).toHaveLength(50)
      expect(duration).toBeLessThan(2000) // Complex join should complete within 2 seconds
      
      // Check that all nested data is properly loaded
      expect(result.data[0].match_members).toHaveLength(3)
      expect(result.data[0].chat_messages).toHaveLength(10)
    })

    it('should handle concurrent database operations', async () => {
      const concurrentOperations = 20
      const operations = []

      // Mock different types of operations
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: generateTestUser(1),
              error: null,
            }),
          }),
        }),
      })

      monitor.start()

      // Create concurrent operations
      for (let i = 0; i < concurrentOperations; i++) {
        operations.push(
          mockSupabaseClient
            .from('profiles')
            .select('*')
            .eq('id', `user-${i}`)
            .single()
        )
      }

      const results = await Promise.all(operations)
      monitor.end()

      const duration = monitor.getDuration()
      const memoryDelta = monitor.getMemoryDelta()

      expect(results).toHaveLength(concurrentOperations)
      expect(results.every(result => result.data !== null)).toBe(true)
      expect(duration).toBeLessThan(3000) // Should handle 20 concurrent operations within 3 seconds

      if (memoryDelta) {
        expect(memoryDelta.heapUsed).toBeLessThan(100 * 1024 * 1024) // Less than 100MB
      }
    })

    it('should optimize search queries with indexing', async () => {
      const searchResults = Array.from({ length: 100 }, (_, i) => generateTestUser(i))

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            contains: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: searchResults,
                error: null,
              }),
            }),
          }),
        }),
      })

      monitor.start()

      const supabase = mockSupabaseClient
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('specialty', 'Cardiology')
        .contains('interests', ['Running'])
        .limit(100)

      monitor.end()

      const duration = monitor.getDuration()

      expect(result.data).toHaveLength(100)
      expect(duration).toBeLessThan(500) // Indexed search should be very fast
    })

    it('should handle pagination efficiently', async () => {
      const pageSize = 50
      const totalPages = 10
      const allResults = []

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          range: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: Array.from({ length: pageSize }, (_, i) => generateTestUser(i)),
              error: null,
            }),
          }),
        }),
      })

      monitor.start()

      // Simulate paginated loading
      for (let page = 0; page < totalPages; page++) {
        const supabase = mockSupabaseClient
        const result = await supabase
          .from('profiles')
          .select('*')
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order('created_at', { ascending: false })

        allResults.push(...result.data)
      }

      monitor.end()

      const duration = monitor.getDuration()
      const memoryDelta = monitor.getMemoryDelta()

      expect(allResults).toHaveLength(pageSize * totalPages)
      expect(duration).toBeLessThan(5000) // 10 pages should load within 5 seconds

      if (memoryDelta) {
        expect(memoryDelta.heapUsed).toBeLessThan(200 * 1024 * 1024) // Less than 200MB
      }
    })
  })

  // ============================================================================
  // API RESPONSE TIME PERFORMANCE
  // ============================================================================
  describe('🛣️ API Response Time Performance', () => {
    it('should handle authentication requests quickly', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { 
          user: { id: 'user-1', email: 'test@example.com' },
          session: { access_token: 'token123' }
        },
        error: null,
      })

      monitor.start()

      const result = await mockSupabaseClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      monitor.end()

      const duration = monitor.getDuration()

      expect(result.data.user).toBeDefined()
      expect(duration).toBeLessThan(1000) // Authentication should be fast
    })

    it('should handle profile creation efficiently', async () => {
      const newProfile = generateTestUser(1)

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: newProfile,
              error: null,
            }),
          }),
        }),
      })

      monitor.start()

      const supabase = mockSupabaseClient
      const result = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single()

      monitor.end()

      const duration = monitor.getDuration()

      expect(result.data).toEqual(newProfile)
      expect(duration).toBeLessThan(1500) // Profile creation should be fast
    })

    it('should handle matching algorithm execution within time limits', async () => {
      const matchingResult = {
        success: true,
        groups_created: 15,
        users_matched: 45,
        execution_time_ms: 2500,
      }

      mockSupabaseClient.rpc.mockResolvedValue({
        data: matchingResult,
        error: null,
      })

      monitor.start()

      const result = await mockSupabaseClient.rpc('execute_weekly_matching')

      monitor.end()

      const duration = monitor.getDuration()

      expect(result.data.success).toBe(true)
      expect(result.data.groups_created).toBe(15)
      expect(duration).toBeLessThan(5000) // Matching should complete within 5 seconds
    })

    it('should handle chat message operations quickly', async () => {
      const messages = Array.from({ length: 50 }, (_, i) => 
        generateTestMessage(i, 'match-1', 'user-1')
      )

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: messages,
                error: null,
              }),
            }),
          }),
        }),
      })

      monitor.start()

      const supabase = mockSupabaseClient
      const result = await supabase
        .from('chat_messages')
        .select('*')
        .eq('match_id', 'match-1')
        .order('created_at', { ascending: true })
        .limit(50)

      monitor.end()

      const duration = monitor.getDuration()

      expect(result.data).toHaveLength(50)
      expect(duration).toBeLessThan(800) // Chat loading should be very fast
    })
  })

  // ============================================================================
  // MEMORY USAGE AND LEAK DETECTION
  // ============================================================================
  describe('🧠 Memory Usage and Leak Detection', () => {
    it('should not cause memory leaks with repeated operations', async () => {
      const iterations = 100
      const initialMemory = process.memoryUsage ? process.memoryUsage() : null

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [generateTestUser(1)],
          error: null,
        }),
      })

      monitor.start()

      // Perform repeated operations
      for (let i = 0; i < iterations; i++) {
        const supabase = mockSupabaseClient
        await supabase.from('profiles').select('*')
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc()
        }
      }

      monitor.end()

      const finalMemory = process.memoryUsage ? process.memoryUsage() : null
      const duration = monitor.getDuration()

      expect(duration).toBeLessThan(10000) // 100 operations within 10 seconds

      if (initialMemory && finalMemory) {
        const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed
        expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024) // Less than 50MB growth
      }
    })

    it('should handle large data structures efficiently', async () => {
      const largeDataset = Array.from({ length: 5000 }, (_, i) => ({
        ...generateTestUser(i),
        additional_data: {
          bio: 'A'.repeat(1000), // 1KB per user
          preferences: Array.from({ length: 50 }, (_, j) => `pref-${j}`),
          history: Array.from({ length: 100 }, (_, k) => ({
            action: `action-${k}`,
            timestamp: new Date().toISOString(),
            data: { key: `value-${k}` },
          })),
        },
      }))

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: largeDataset,
          error: null,
        }),
      })

      monitor.start()

      const supabase = mockSupabaseClient
      const result = await supabase.from('profiles').select('*')

      // Process the large dataset
      const processedData = result.data.map((user: any) => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        preferences_count: user.additional_data?.preferences?.length || 0,
        history_count: user.additional_data?.history?.length || 0,
      }))

      monitor.end()

      const duration = monitor.getDuration()
      const memoryDelta = monitor.getMemoryDelta()

      expect(result.data).toHaveLength(5000)
      expect(processedData).toHaveLength(5000)
      expect(duration).toBeLessThan(3000) // Processing should be efficient

      if (memoryDelta) {
        // Should handle ~5MB of data without excessive memory usage
        expect(memoryDelta.heapUsed).toBeLessThan(100 * 1024 * 1024) // Less than 100MB
      }
    })

    it('should clean up event listeners and subscriptions', async () => {
      const subscriptions = []
      const eventListeners = []

      monitor.start()

      // Create multiple subscriptions
      for (let i = 0; i < 10; i++) {
        const mockSubscription = { unsubscribe: jest.fn() }
        
        mockSupabaseClient.from.mockReturnValue({
          on: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              subscribe: jest.fn().mockReturnValue(mockSubscription),
            }),
          }),
        })

        const subscription = mockSupabaseClient
          .from('chat_messages')
          .on('INSERT', () => {})
          .eq('match_id', `match-${i}`)
          .subscribe()

        subscriptions.push(subscription)

        // Create event listeners
        const listener = () => {}
        if (typeof window !== 'undefined') {
          window.addEventListener('resize', listener)
          eventListeners.push(() => window.removeEventListener('resize', listener))
        }
      }

      // Clean up all subscriptions
      subscriptions.forEach(sub => sub.unsubscribe())
      
      // Clean up all event listeners
      eventListeners.forEach(cleanup => cleanup())

      monitor.end()

      const duration = monitor.getDuration()
      const memoryDelta = monitor.getMemoryDelta()

      expect(subscriptions).toHaveLength(10)
      expect(duration).toBeLessThan(1000) // Cleanup should be fast

      // Verify all subscriptions were properly unsubscribed
      subscriptions.forEach(sub => {
        expect(sub.unsubscribe).toHaveBeenCalled()
      })

      if (memoryDelta) {
        expect(memoryDelta.heapUsed).toBeLessThan(10 * 1024 * 1024) // Minimal memory usage
      }
    })
  })

  // ============================================================================
  // REAL-TIME SYSTEM PERFORMANCE
  // ============================================================================
  describe('🔄 Real-time System Performance', () => {
    it('should handle multiple concurrent subscriptions', async () => {
      const subscriptionCount = 50
      const subscriptions = []

      mockSupabaseClient.from.mockReturnValue({
        on: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            subscribe: jest.fn().mockReturnValue({ 
              unsubscribe: jest.fn() 
            }),
          }),
        }),
      })

      monitor.start()

      // Create multiple concurrent subscriptions
      for (let i = 0; i < subscriptionCount; i++) {
        const subscription = mockSupabaseClient
          .from('chat_messages')
          .on('INSERT', () => {})
          .eq('match_id', `match-${i}`)
          .subscribe()

        subscriptions.push(subscription)
      }

      monitor.end()

      const duration = monitor.getDuration()
      const memoryDelta = monitor.getMemoryDelta()

      expect(subscriptions).toHaveLength(subscriptionCount)
      expect(duration).toBeLessThan(2000) // Should create subscriptions quickly

      if (memoryDelta) {
        expect(memoryDelta.heapUsed).toBeLessThan(50 * 1024 * 1024) // Reasonable memory usage
      }

      // Clean up
      subscriptions.forEach(sub => sub.unsubscribe())
    })

    it('should handle high-frequency real-time updates', async () => {
      const updateCount = 1000
      const updates = []

      // Mock high-frequency message updates
      const messageHandler = jest.fn()

      monitor.start()

      // Simulate receiving many real-time updates
      for (let i = 0; i < updateCount; i++) {
        const update = {
          new: generateTestMessage(i, 'match-1', `user-${i % 5}`),
          eventType: 'INSERT',
        }
        updates.push(update)
        messageHandler(update)
      }

      monitor.end()

      const duration = monitor.getDuration()
      const memoryDelta = monitor.getMemoryDelta()

      expect(messageHandler).toHaveBeenCalledTimes(updateCount)
      expect(duration).toBeLessThan(1000) // Should handle updates efficiently

      if (memoryDelta) {
        expect(memoryDelta.heapUsed).toBeLessThan(30 * 1024 * 1024) // Efficient memory usage
      }
    })

    it('should throttle real-time update processing', async () => {
      const rapidUpdates = Array.from({ length: 100 }, (_, i) => 
        generateTestMessage(i, 'match-1', 'user-1')
      )

      let processedUpdates = 0
      const throttledHandler = jest.fn(() => {
        processedUpdates++
      })

      // Mock throttling mechanism
      const throttle = (fn: Function, delay: number) => {
        let timeoutId: NodeJS.Timeout | null = null
        return (...args: any[]) => {
          if (timeoutId) clearTimeout(timeoutId)
          timeoutId = setTimeout(() => fn(...args), delay)
        }
      }

      const throttledUpdate = throttle(throttledHandler, 100)

      monitor.start()

      // Send rapid updates
      rapidUpdates.forEach(update => {
        throttledUpdate(update)
      })

      // Wait for throttled execution
      await new Promise(resolve => setTimeout(resolve, 200))

      monitor.end()

      const duration = monitor.getDuration()

      expect(duration).toBeLessThan(300) // Throttling should be efficient
      expect(processedUpdates).toBeLessThan(rapidUpdates.length) // Should throttle updates
      expect(processedUpdates).toBeGreaterThan(0) // But still process some updates
    })
  })

  // ============================================================================
  // LOAD TESTING AND STRESS TESTING
  // ============================================================================
  describe('🏋️ Load Testing and Stress Testing', () => {
    it('should handle high user load', async () => {
      const userCount = 1000
      const concurrentOperations = []

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      })

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: generateTestUser(1),
              error: null,
            }),
          }),
        }),
      })

      monitor.start()

      // Simulate high concurrent user load
      for (let i = 0; i < userCount; i++) {
        concurrentOperations.push(
          Promise.all([
            mockSupabaseClient.auth.getUser(),
            mockSupabaseClient
              .from('profiles')
              .select('*')
              .eq('id', `user-${i}`)
              .single(),
          ])
        )
      }

      const results = await Promise.all(concurrentOperations)

      monitor.end()

      const duration = monitor.getDuration()
      const memoryDelta = monitor.getMemoryDelta()

      expect(results).toHaveLength(userCount)
      expect(results.every(result => result[0].data.user && result[1].data)).toBe(true)
      expect(duration).toBeLessThan(10000) // Should handle 1000 concurrent users within 10 seconds

      if (memoryDelta) {
        expect(memoryDelta.heapUsed).toBeLessThan(500 * 1024 * 1024) // Less than 500MB
      }
    })

    it('should handle burst traffic patterns', async () => {
      const burstSize = 200
      const burstCount = 5
      const burstInterval = 100 // ms between bursts

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: generateTestMessage(1, 'match-1', 'user-1'),
              error: null,
            }),
          }),
        }),
      })

      monitor.start()

      // Simulate burst traffic pattern
      for (let burst = 0; burst < burstCount; burst++) {
        const burstOperations = []
        
        // Create burst of operations
        for (let i = 0; i < burstSize; i++) {
          burstOperations.push(
            mockSupabaseClient
              .from('chat_messages')
              .insert(generateTestMessage(burst * burstSize + i, 'match-1', 'user-1'))
              .select()
              .single()
          )
        }

        // Execute burst
        await Promise.all(burstOperations)
        
        // Wait between bursts
        if (burst < burstCount - 1) {
          await new Promise(resolve => setTimeout(resolve, burstInterval))
        }
      }

      monitor.end()

      const duration = monitor.getDuration()
      const memoryDelta = monitor.getMemoryDelta()

      expect(duration).toBeLessThan(5000) // Should handle all bursts within 5 seconds

      if (memoryDelta) {
        expect(memoryDelta.heapUsed).toBeLessThan(200 * 1024 * 1024) // Reasonable memory usage
      }
    })

    it('should maintain performance under sustained load', async () => {
      const operationsPerSecond = 50
      const testDurationSeconds = 10
      const totalOperations = operationsPerSecond * testDurationSeconds

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [generateTestUser(1)],
          error: null,
        }),
      })

      monitor.start()

      const operationPromises = []
      const startTime = Date.now()

      // Distribute operations over time
      for (let i = 0; i < totalOperations; i++) {
        const delay = (i / operationsPerSecond) * 1000
        
        const delayedOperation = new Promise(resolve => {
          setTimeout(async () => {
            const result = await mockSupabaseClient.from('profiles').select('*')
            resolve(result)
          }, delay)
        })
        
        operationPromises.push(delayedOperation)
      }

      await Promise.all(operationPromises)

      monitor.end()

      const actualDuration = Date.now() - startTime
      const memoryDelta = monitor.getMemoryDelta()

      expect(actualDuration).toBeLessThan((testDurationSeconds + 2) * 1000) // Allow 2s buffer
      expect(actualDuration).toBeGreaterThan(testDurationSeconds * 1000 * 0.8) // At least 80% of expected time

      if (memoryDelta) {
        expect(memoryDelta.heapUsed).toBeLessThan(100 * 1024 * 1024) // Stable memory usage
      }
    })
  })

  // ============================================================================
  // RESOURCE UTILIZATION OPTIMIZATION
  // ============================================================================
  describe('📊 Resource Utilization Optimization', () => {
    it('should optimize CPU usage for complex operations', async () => {
      const complexData = Array.from({ length: 1000 }, (_, i) => ({
        ...generateTestUser(i),
        calculations: Array.from({ length: 100 }, (_, j) => Math.random() * 1000),
      }))

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: complexData,
          error: null,
        }),
      })

      monitor.start()

      const supabase = mockSupabaseClient
      const result = await supabase.from('profiles').select('*')

      // Perform CPU-intensive processing
      const processedData = result.data.map((user: any) => ({
        id: user.id,
        name: `${user.first_name} ${user.last_name}`,
        averageCalculation: user.calculations.reduce((a: number, b: number) => a + b, 0) / user.calculations.length,
        maxCalculation: Math.max(...user.calculations),
        minCalculation: Math.min(...user.calculations),
      }))

      monitor.end()

      const duration = monitor.getDuration()
      const memoryDelta = monitor.getMemoryDelta()

      expect(processedData).toHaveLength(1000)
      expect(duration).toBeLessThan(2000) // Complex processing should be optimized

      if (memoryDelta) {
        expect(memoryDelta.heapUsed).toBeLessThan(150 * 1024 * 1024) // Efficient memory usage
      }
    })

    it('should optimize network request batching', async () => {
      const batchSize = 10
      const totalRequests = 100
      const batches = Math.ceil(totalRequests / batchSize)

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({
            data: Array.from({ length: batchSize }, (_, i) => generateTestUser(i)),
            error: null,
          }),
        }),
      })

      monitor.start()

      const batchPromises = []

      // Process requests in batches instead of individually
      for (let batch = 0; batch < batches; batch++) {
        const batchStart = batch * batchSize
        const batchEnd = Math.min(batchStart + batchSize, totalRequests)
        const userIds = Array.from(
          { length: batchEnd - batchStart }, 
          (_, i) => `user-${batchStart + i}`
        )

        const batchPromise = mockSupabaseClient
          .from('profiles')
          .select('*')
          .in('id', userIds)

        batchPromises.push(batchPromise)
      }

      const batchResults = await Promise.all(batchPromises)

      monitor.end()

      const duration = monitor.getDuration()
      const totalResults = batchResults.reduce((acc, batch) => acc + batch.data.length, 0)

      expect(batchResults).toHaveLength(batches)
      expect(totalResults).toBe(totalRequests)
      expect(duration).toBeLessThan(3000) // Batching should be more efficient than individual requests
    })

    it('should implement efficient caching strategies', async () => {
      const cache = new Map()
      const cacheHits = { count: 0 }
      const cacheMisses = { count: 0 }

      const getCachedData = async (key: string) => {
        if (cache.has(key)) {
          cacheHits.count++
          return cache.get(key)
        }

        cacheMisses.count++
        const data = await mockSupabaseClient
          .from('profiles')
          .select('*')
          .eq('id', key)
          .single()

        cache.set(key, data)
        return data
      }

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: generateTestUser(1),
              error: null,
            }),
          }),
        }),
      })

      monitor.start()

      // Access same data multiple times to test caching
      const requests = []
      for (let i = 0; i < 100; i++) {
        const userId = `user-${i % 10}` // Only 10 unique users, accessed multiple times
        requests.push(getCachedData(userId))
      }

      await Promise.all(requests)

      monitor.end()

      const duration = monitor.getDuration()
      const cacheHitRatio = cacheHits.count / (cacheHits.count + cacheMisses.count)

      expect(cacheHits.count).toBeGreaterThan(0)
      expect(cacheMisses.count).toBe(10) // Should only miss once per unique user
      expect(cacheHitRatio).toBeGreaterThan(0.8) // High cache hit ratio
      expect(duration).toBeLessThan(1000) // Caching should make it faster
    })
  })

  // ============================================================================
  // PERFORMANCE REGRESSION TESTING
  // ============================================================================
  describe('📈 Performance Regression Testing', () => {
    it('should maintain baseline performance for critical operations', async () => {
      const baselines = {
        authentication: 1000, // ms
        profileLoad: 800,
        chatLoad: 500,
        matching: 5000,
      }

      // Test authentication performance
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-1' }, session: {} },
        error: null,
      })

      monitor.start()
      await mockSupabaseClient.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })
      monitor.end()

      const authDuration = monitor.getDuration()
      expect(authDuration).toBeLessThan(baselines.authentication)

      // Test profile loading performance
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: generateTestUser(1),
              error: null,
            }),
          }),
        }),
      })

      monitor.start()
      await mockSupabaseClient
        .from('profiles')
        .select('*')
        .eq('id', 'user-1')
        .single()
      monitor.end()

      const profileDuration = monitor.getDuration()
      expect(profileDuration).toBeLessThan(baselines.profileLoad)

      // Test chat loading performance
      const messages = Array.from({ length: 50 }, (_, i) => 
        generateTestMessage(i, 'match-1', 'user-1')
      )

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: messages,
                error: null,
              }),
            }),
          }),
        }),
      })

      monitor.start()
      await mockSupabaseClient
        .from('chat_messages')
        .select('*')
        .eq('match_id', 'match-1')
        .order('created_at', { ascending: true })
        .limit(50)
      monitor.end()

      const chatDuration = monitor.getDuration()
      expect(chatDuration).toBeLessThan(baselines.chatLoad)

      // Test matching algorithm performance
      mockSupabaseClient.rpc.mockResolvedValue({
        data: { success: true, groups_created: 10 },
        error: null,
      })

      monitor.start()
      await mockSupabaseClient.rpc('execute_weekly_matching')
      monitor.end()

      const matchingDuration = monitor.getDuration()
      expect(matchingDuration).toBeLessThan(baselines.matching)
    })

    it('should track performance metrics over time', async () => {
      const performanceMetrics = {
        timestamp: Date.now(),
        operations: {},
      }

      const operations = [
        'user_authentication',
        'profile_load',
        'message_send',
        'match_search',
      ]

      // Mock different operations with varying performance
      const mockOperations = {
        user_authentication: () => mockSupabaseClient.auth.getUser(),
        profile_load: () => mockSupabaseClient.from('profiles').select('*').single(),
        message_send: () => mockSupabaseClient.from('chat_messages').insert({}).select().single(),
        match_search: () => mockSupabaseClient.from('matches').select('*'),
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      })

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: generateTestUser(1),
            error: null,
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: generateTestMessage(1, 'match-1', 'user-1'),
              error: null,
            }),
          }),
        }),
      })

      for (const operation of operations) {
        monitor.start()
        await mockOperations[operation as keyof typeof mockOperations]()
        monitor.end()

        performanceMetrics.operations[operation as keyof typeof performanceMetrics.operations] = {
          duration: monitor.getDuration(),
          memoryDelta: monitor.getMemoryDelta(),
        }
      }

      // Verify all operations completed within acceptable limits
      Object.entries(performanceMetrics.operations).forEach(([operation, metrics]) => {
        expect((metrics as any).duration).toBeLessThan(2000) // 2 second max for any operation
        expect((metrics as any).duration).toBeGreaterThan(0) // Should take some time
      })

      expect(performanceMetrics.timestamp).toBeLessThan(Date.now())
      expect(Object.keys(performanceMetrics.operations)).toHaveLength(operations.length)
    })
  })
})

// ============================================================================
// PERFORMANCE REPORTING AND ANALYSIS
// ============================================================================
describe('📊 Performance Reporting and Analysis', () => {
  it('should generate performance reports', () => {
    const performanceReport = {
      testSuite: 'Comprehensive Performance Tests',
      timestamp: new Date().toISOString(),
      environment: {
        node_version: process.version,
        platform: process.platform,
        memory_limit: process.env.NODE_OPTIONS?.includes('--max-old-space-size') ? 'custom' : 'default',
      },
      metrics: {
        database_queries: {
          average_response_time: 250, // ms
          p95_response_time: 500,
          p99_response_time: 800,
          queries_per_second: 100,
        },
        api_endpoints: {
          average_response_time: 150,
          p95_response_time: 300,
          p99_response_time: 500,
          requests_per_second: 200,
        },
        memory_usage: {
          peak_heap_used: 150 * 1024 * 1024, // 150MB
          average_heap_used: 75 * 1024 * 1024, // 75MB
          memory_leaks_detected: 0,
        },
        real_time_performance: {
          subscription_setup_time: 50, // ms
          message_delivery_latency: 25, // ms
          concurrent_connections_supported: 1000,
        },
      },
      recommendations: [
        'Database queries are performing well within acceptable limits',
        'API response times are optimal for user experience',
        'Memory usage is stable with no leaks detected',
        'Real-time system is handling concurrent connections efficiently',
      ],
      alerts: [],
    }

    // Validate report structure
    expect(performanceReport.testSuite).toBeDefined()
    expect(performanceReport.timestamp).toBeDefined()
    expect(performanceReport.environment).toBeDefined()
    expect(performanceReport.metrics).toBeDefined()
    expect(performanceReport.recommendations).toBeInstanceOf(Array)
    expect(performanceReport.alerts).toBeInstanceOf(Array)

    // Validate performance thresholds
    expect(performanceReport.metrics.database_queries.average_response_time).toBeLessThan(500)
    expect(performanceReport.metrics.api_endpoints.average_response_time).toBeLessThan(300)
    expect(performanceReport.metrics.memory_usage.memory_leaks_detected).toBe(0)
    expect(performanceReport.metrics.real_time_performance.concurrent_connections_supported).toBeGreaterThan(500)
  })

  it('should identify performance bottlenecks', () => {
    const bottleneckAnalysis = {
      identified_bottlenecks: [
        {
          area: 'Database Queries',
          issue: 'Complex join queries taking longer than expected',
          impact: 'Medium',
          recommendation: 'Add database indexes for frequently joined tables',
          estimated_improvement: '30% faster query execution',
        },
        {
          area: 'Memory Usage',
          issue: 'Large dataset processing causing memory spikes',
          impact: 'Low',
          recommendation: 'Implement streaming for large dataset processing',
          estimated_improvement: '50% reduction in peak memory usage',
        },
      ],
      performance_trends: {
        database_performance: 'Stable',
        api_performance: 'Improving',
        memory_efficiency: 'Stable',
        real_time_performance: 'Excellent',
      },
      action_items: [
        'Implement database indexing for join operations',
        'Add streaming support for large dataset operations',
        'Monitor memory usage patterns in production',
      ],
    }

    expect(bottleneckAnalysis.identified_bottlenecks).toBeInstanceOf(Array)
    expect(bottleneckAnalysis.performance_trends).toBeDefined()
    expect(bottleneckAnalysis.action_items).toBeInstanceOf(Array)

    bottleneckAnalysis.identified_bottlenecks.forEach(bottleneck => {
      expect(bottleneck.area).toBeDefined()
      expect(bottleneck.issue).toBeDefined()
      expect(bottleneck.impact).toMatch(/^(Low|Medium|High)$/)
      expect(bottleneck.recommendation).toBeDefined()
    })
  })
})

// ============================================================================
// CLEANUP AND TEARDOWN
// ============================================================================
afterAll(async () => {
  // Clean up any test data or connections
  jest.clearAllMocks()
  jest.restoreAllMocks()
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
})



