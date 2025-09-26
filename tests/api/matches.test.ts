import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/matches/route'

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      neq: jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
      }))
    }))
  }))
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: () => mockSupabaseClient
}))

describe('/api/matches API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
  })

  describe('GET /api/matches', () => {
    it('returns matches for authenticated user', async () => {
      const mockProfiles = [
        {
          user_id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          medical_specialty: 'Cardiology',
          city: 'Riyadh',
          experience_years: 10,
          languages: ['Arabic', 'English'],
          interests: ['Research', 'Exercise'],
          bio: 'Cardiologist with 10 years experience',
          email: 'john@example.com',
          age: 35
        },
        {
          user_id: 'user-2',
          first_name: 'Jane',
          last_name: 'Smith',
          medical_specialty: 'Pediatrics',
          city: 'Jeddah',
          experience_years: 5,
          languages: ['Arabic'],
          interests: ['Child Development'],
          bio: 'Pediatrician',
          email: 'jane@example.com',
          age: 30
        }
      ]

      const mockExistingMatches = [
        {
          match_id: 'match-1',
          compatibility_score: 85,
          is_active: true
        }
      ]

      mockSupabaseClient.from().select().neq().eq().limit.mockResolvedValue({
        data: mockProfiles,
        error: null
      })

      mockSupabaseClient.from().select().eq().eq.mockResolvedValue({
        data: mockExistingMatches,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/matches')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.data[0]).toHaveProperty('name', 'Dr. John Doe')
      expect(data.data[0]).toHaveProperty('specialty', 'Cardiology')
      expect(data.data[0]).toHaveProperty('compatibility')
      expect(data.data[0]).toHaveProperty('interests')
    })

    it('handles database errors when loading profiles', async () => {
      mockSupabaseClient.from().select().neq().eq().limit.mockResolvedValue({
        data: null,
        error: new Error('Database error')
      })

      const request = new NextRequest('http://localhost:3000/api/matches')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Database error')
    })

    it('handles database errors when loading existing matches', async () => {
      const mockProfiles = [
        {
          user_id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          medical_specialty: 'Cardiology',
          city: 'Riyadh',
          experience_years: 10,
          languages: ['Arabic'],
          interests: ['Research'],
          bio: 'Cardiologist',
          email: 'john@example.com',
          age: 35
        }
      ]

      mockSupabaseClient.from().select().neq().eq().limit.mockResolvedValue({
        data: mockProfiles,
        error: null
      })

      mockSupabaseClient.from().select().eq().eq.mockResolvedValue({
        data: null,
        error: new Error('Matches error')
      })

      const request = new NextRequest('http://localhost:3000/api/matches')
      const response = await GET(request)
      const data = await response.json()

      // Should still succeed even if matches loading fails
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('handles server errors', async () => {
      mockSupabaseClient.from().select().neq().eq().limit.mockRejectedValue(
        new Error('Server error')
      )

      const request = new NextRequest('http://localhost:3000/api/matches')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to load matches')
    })

    it('generates default interests when user has no interests', async () => {
      const mockProfiles = [
        {
          user_id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          medical_specialty: 'Cardiology',
          city: 'Riyadh',
          experience_years: 10,
          languages: ['Arabic'],
          interests: null, // No interests
          bio: 'Cardiologist',
          email: 'john@example.com',
          age: 35
        }
      ]

      mockSupabaseClient.from().select().neq().eq().limit.mockResolvedValue({
        data: mockProfiles,
        error: null
      })

      mockSupabaseClient.from().select().eq().eq.mockResolvedValue({
        data: [],
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/matches')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data[0].interests).toEqual(['Heart Health', 'Exercise', 'Research'])
    })
  })

  describe('POST /api/matches', () => {
    it('creates a match for like action', async () => {
      const mockMatchData = {
        id: 'match-123',
        group_name: 'Match 2024-01-01',
        match_week: '2024-01-01',
        group_size: 2,
        average_compatibility: 85
      }

      const mockProfile1 = { id: 'profile-1' }
      const mockProfile2 = { id: 'profile-2' }

      const mockMemberData = [
        { match_id: 'match-123', profile_id: 'profile-1' },
        { match_id: 'match-123', profile_id: 'profile-2' }
      ]

      mockSupabaseClient.from().insert().select().single.mockResolvedValue({
        data: mockMatchData,
        error: null
      })

      mockSupabaseClient.from().select().eq().single
        .mockResolvedValueOnce({ data: mockProfile1, error: null })
        .mockResolvedValueOnce({ data: mockProfile2, error: null })

      mockSupabaseClient.from().insert.mockResolvedValue({
        data: mockMemberData,
        error: null
      })

      const requestBody = {
        user1Id: 'user-1',
        user2Id: 'user-2',
        action: 'like'
      }

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Match created successfully')
      expect(data.data).toHaveProperty('match')
      expect(data.data).toHaveProperty('members')
    })

    it('creates a match for match action', async () => {
      const mockMatchData = {
        id: 'match-123',
        group_name: 'Match 2024-01-01',
        match_week: '2024-01-01',
        group_size: 2,
        average_compatibility: 85
      }

      const mockProfile1 = { id: 'profile-1' }
      const mockProfile2 = { id: 'profile-2' }

      mockSupabaseClient.from().insert().select().single.mockResolvedValue({
        data: mockMatchData,
        error: null
      })

      mockSupabaseClient.from().select().eq().single
        .mockResolvedValueOnce({ data: mockProfile1, error: null })
        .mockResolvedValueOnce({ data: mockProfile2, error: null })

      mockSupabaseClient.from().insert.mockResolvedValue({
        data: [],
        error: null
      })

      const requestBody = {
        user1Id: 'user-1',
        user2Id: 'user-2',
        action: 'match'
      }

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('handles invalid JSON in request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid JSON in request body')
    })

    it('handles invalid action', async () => {
      const requestBody = {
        user1Id: 'user-1',
        user2Id: 'user-2',
        action: 'invalid'
      }

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Invalid action')
    })

    it('handles match creation errors', async () => {
      mockSupabaseClient.from().insert().select().single.mockResolvedValue({
        data: null,
        error: new Error('Match creation failed')
      })

      const requestBody = {
        user1Id: 'user-1',
        user2Id: 'user-2',
        action: 'like'
      }

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Match creation failed')
    })

    it('handles profile lookup errors', async () => {
      const mockMatchData = {
        id: 'match-123',
        group_name: 'Match 2024-01-01',
        match_week: '2024-01-01',
        group_size: 2,
        average_compatibility: 85
      }

      mockSupabaseClient.from().insert().select().single.mockResolvedValue({
        data: mockMatchData,
        error: null
      })

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: null,
        error: new Error('Profile not found')
      })

      const requestBody = {
        user1Id: 'user-1',
        user2Id: 'user-2',
        action: 'like'
      }

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Could not find user users')
    })

    it('handles member insertion errors', async () => {
      const mockMatchData = {
        id: 'match-123',
        group_name: 'Match 2024-01-01',
        match_week: '2024-01-01',
        group_size: 2,
        average_compatibility: 85
      }

      const mockProfile1 = { id: 'profile-1' }
      const mockProfile2 = { id: 'profile-2' }

      mockSupabaseClient.from().insert().select().single.mockResolvedValue({
        data: mockMatchData,
        error: null
      })

      mockSupabaseClient.from().select().eq().single
        .mockResolvedValueOnce({ data: mockProfile1, error: null })
        .mockResolvedValueOnce({ data: mockProfile2, error: null })

      mockSupabaseClient.from().insert.mockResolvedValue({
        data: null,
        error: new Error('Member insertion failed')
      })

      const requestBody = {
        user1Id: 'user-1',
        user2Id: 'user-2',
        action: 'like'
      }

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Member insertion failed')
    })

    it('handles server errors', async () => {
      mockSupabaseClient.from().insert().select().single.mockRejectedValue(
        new Error('Server error')
      )

      const requestBody = {
        user1Id: 'user-1',
        user2Id: 'user-2',
        action: 'like'
      }

      const request = new NextRequest('http://localhost:3000/api/matches', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Failed to process match action')
    })
  })
})


