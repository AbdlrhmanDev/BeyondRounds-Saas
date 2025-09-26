import { NextRequest } from 'next/server'
import { GET, PUT } from '@/app/api/profile/route'

// Mock Supabase server
const mockSupabaseServer = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }))
}

jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServer: () => mockSupabaseServer
}))

describe('/api/profile API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/profile', () => {
    it('returns profile for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        name: 'John Doe',
        specialty: 'Cardiology'
      }

      mockSupabaseServer.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabaseServer.from().select().eq().single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/profile')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ profile: mockProfile })
    })

    it('returns 401 for unauthenticated user', async () => {
      mockSupabaseServer.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const request = new NextRequest('http://localhost:3000/api/profile')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('returns 404 when profile not found', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      mockSupabaseServer.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabaseServer.from().select().eq().single.mockResolvedValue({
        data: null,
        error: new Error('Profile not found')
      })

      const request = new NextRequest('http://localhost:3000/api/profile')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data).toEqual({ error: 'Profile not found' })
    })

    it('returns 500 for server errors', async () => {
      mockSupabaseServer.auth.getUser.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/profile')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal server error' })
    })
  })

  describe('PUT /api/profile', () => {
    it('updates profile for authenticated user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        name: 'John Doe Updated',
        specialty: 'Neurology'
      }

      mockSupabaseServer.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabaseServer.from().update().eq().select().single.mockResolvedValue({
        data: mockProfile,
        error: null
      })

      const requestBody = {
        name: 'John Doe Updated',
        specialty: 'Neurology'
      }

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ profile: mockProfile })
    })

    it('returns 401 for unauthenticated user', async () => {
      mockSupabaseServer.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      })

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('returns 400 when profile update fails', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      mockSupabaseServer.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabaseServer.from().update().eq().select().single.mockResolvedValue({
        data: null,
        error: new Error('Update failed')
      })

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data).toEqual({ error: 'Failed to update profile' })
    })

    it('returns 500 for server errors', async () => {
      mockSupabaseServer.auth.getUser.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal server error' })
    })

    it('handles invalid JSON in request body', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' }

      mockSupabaseServer.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Internal server error' })
    })
  })
})


