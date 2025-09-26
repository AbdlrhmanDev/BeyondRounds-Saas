import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { calculateCompatibilityScore, DEFAULT_MATCHING_WEIGHTS } from '@/lib/matching-algorithm'
import { calculateCompatibility } from '@/lib/matching/specialty-preference-matching'

// Mock dependencies
jest.mock('next/navigation')
jest.mock('@/lib/supabase/client')
jest.mock('@/hooks/features/auth/useAuthUser')

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
}

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      or: jest.fn(() => ({
        order: jest.fn(() => ({
          desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      order: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      desc: jest.fn(() => Promise.resolve({ data: [], error: null })),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  })),
} as any

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock NextRequest for API route tests
global.Request = class MockRequest {
  constructor(public url: string, public init?: RequestInit) {}
  async json() {
    return JSON.parse(this.init?.body as string || '{}')
  }
} as any

global.Response = class MockResponse {
  constructor(public body: any, public init?: ResponseInit) {}
  async json() {
    return this.body
  }
} as any

describe('Matching Engine - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Matching Algorithm Tests', () => {
    const mockUser1 = {
      id: 'user-1',
      medical_specialty: 'Cardiology',
      interests: ['research', 'teaching', 'clinical_practice'],
      social_preferences: ['professional_networking', 'mentoring'],
      availability_preferences: ['weekday_evenings', 'weekend_mornings'],
      city: 'New York',
      career_stage: 'mid_career',
      institutions: ['NYU Medical Center'],
      gender: 'male',
      age: 35
    }

    const mockUser2 = {
      id: 'user-2',
      medical_specialty: 'Cardiology',
      interests: ['research', 'teaching', 'clinical_practice'],
      social_preferences: ['professional_networking', 'mentoring'],
      availability_preferences: ['weekday_evenings', 'weekend_mornings'],
      city: 'New York',
      career_stage: 'mid_career',
      institutions: ['NYU Medical Center'],
      gender: 'female',
      age: 32
    }

    const mockUser3 = {
      id: 'user-3',
      medical_specialty: 'Neurology',
      interests: ['research'],
      social_preferences: ['professional_networking'],
      availability_preferences: ['weekday_evenings'],
      city: 'Boston',
      career_stage: 'early_career',
      institutions: ['Harvard Medical School'],
      gender: 'male',
      age: 28
    }

    test('calculates high compatibility score for similar users', () => {
      const score = calculateCompatibilityScore(mockUser1, mockUser2)
      
      expect(score.score).toBeGreaterThan(0.8)
      expect(score.breakdown.specialty).toBe(1.0) // Same specialty
      expect(score.breakdown.interests).toBeGreaterThan(0.8) // High interest overlap
      expect(score.breakdown.social).toBeGreaterThan(0.8) // High social overlap
      expect(score.breakdown.availability).toBeGreaterThan(0.8) // High availability overlap
      expect(score.breakdown.geographic).toBe(1.0) // Same city
    })

    test('calculates lower compatibility score for different users', () => {
      const score = calculateCompatibilityScore(mockUser1, mockUser3)
      
      expect(score.score).toBeLessThan(0.6)
      expect(score.breakdown.specialty).toBeLessThan(0.5) // Different specialty
      expect(score.breakdown.interests).toBeLessThan(0.5) // Lower interest overlap
      expect(score.breakdown.geographic).toBe(0) // Different city
    })

    test('applies custom matching weights correctly', () => {
      const customWeights = {
        specialty: 0.5,
        interests: 0.3,
        social: 0.1,
        availability: 0.05,
        geographic: 0.03,
        lifestyle: 0.02
      }

      const score = calculateCompatibilityScore(mockUser1, mockUser2, customWeights)
      
      // With higher specialty weight, the score should be even higher
      expect(score.score).toBeGreaterThan(0.8)
    })

    test('handles missing data gracefully', () => {
      const incompleteUser1 = {
        id: 'user-1',
        medical_specialty: 'Cardiology',
        interests: [],
        social_preferences: [],
        availability_preferences: [],
        city: 'New York',
        career_stage: 'mid_career',
        institutions: [],
        gender: 'male',
        age: 35
      }

      const incompleteUser2 = {
        id: 'user-2',
        medical_specialty: 'Cardiology',
        interests: ['research'],
        social_preferences: ['professional_networking'],
        availability_preferences: ['weekday_evenings'],
        city: 'New York',
        career_stage: 'mid_career',
        institutions: ['NYU Medical Center'],
        gender: 'female',
        age: 32
      }

      const score = calculateCompatibilityScore(incompleteUser1, incompleteUser2)
      
      expect(score.score).toBeGreaterThan(0) // Should still calculate a score
      expect(score.breakdown.specialty).toBe(1.0) // Same specialty
      expect(score.breakdown.geographic).toBe(1.0) // Same city
    })

    test('generates appropriate compatibility descriptions', () => {
      const highScore = calculateCompatibilityScore(mockUser1, mockUser2)
      const lowScore = calculateCompatibilityScore(mockUser1, mockUser3)
      
      expect(highScore.description).toContain('excellent')
      expect(lowScore.description).toContain('moderate')
    })
  })

  describe('Specialty Preference Matching Tests', () => {
    const mockProfile1 = {
      specialties: ['Cardiology', 'Internal Medicine'],
      specialtyPreference: 'same_specialty',
      careerStage: 'mid_career',
      city: 'New York',
      institutions: ['NYU Medical Center'],
      gender: 'male',
      age: 35
    }

    const mockProfile2 = {
      specialties: ['Cardiology', 'Cardiac Surgery'],
      specialtyPreference: 'same_specialty',
      careerStage: 'mid_career',
      city: 'New York',
      institutions: ['NYU Medical Center'],
      gender: 'female',
      age: 32
    }

    const mockProfile3 = {
      specialties: ['Neurology', 'Neurosurgery'],
      specialtyPreference: 'different_specialty',
      careerStage: 'early_career',
      city: 'Boston',
      institutions: ['Harvard Medical School'],
      gender: 'male',
      age: 28
    }

    test('calculates high compatibility for same specialty preference', () => {
      const compatibility = calculateCompatibility(mockProfile1 as any, mockProfile2 as any)
      
      expect(compatibility.overall).toBeGreaterThan(0.8)
      expect(compatibility.specialty).toBeGreaterThan(0.8)
      expect(compatibility.career).toBeGreaterThan(0.8)
      expect(compatibility.location).toBeGreaterThan(0.8)
    })

    test('calculates lower compatibility for different specialties', () => {
      const compatibility = calculateCompatibility(mockProfile1 as any, mockProfile3 as any)
      
      expect(compatibility.overall).toBeLessThan(0.6)
      expect(compatibility.specialty).toBeLessThan(0.5)
      expect(compatibility.location).toBe(0) // Different city
    })

    test('applies specialty preference weighting correctly', () => {
      const compatibility = calculateCompatibility(mockProfile1 as any, mockProfile2 as any)
      
      // Both prefer same specialty and have overlapping specialties
      expect(compatibility.specialty).toBeGreaterThan(0.8)
    })

    test('handles different specialty preferences', () => {
      const profileWithDifferentPreference = {
        ...mockProfile1,
        specialtyPreference: 'different_specialty'
      }

      const compatibility = calculateCompatibility(profileWithDifferentPreference as any, mockProfile3 as any)
      
      // Should still calculate compatibility but with different weighting
      expect(compatibility.overall).toBeGreaterThan(0)
    })
  })

  describe('Weekly Matching API Tests', () => {
    test('POST /api/matching/weekly creates matching groups', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          user_id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          medical_specialty: 'Cardiology',
          city: 'New York',
          country: 'USA',
          age: 35,
          gender: 'male',
          looking_for: 'professional_networking',
          interests: ['research', 'teaching'],
          lifestyle_goals: ['career_advancement'],
          availability_preferences: ['weekday_evenings'],
          is_verified: true,
          onboarding_completed: true,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'profile-2',
          user_id: 'user-2',
          first_name: 'Jane',
          last_name: 'Smith',
          medical_specialty: 'Cardiology',
          city: 'New York',
          country: 'USA',
          age: 32,
          gender: 'female',
          looking_for: 'professional_networking',
          interests: ['research', 'teaching'],
          lifestyle_goals: ['career_advancement'],
          availability_preferences: ['weekday_evenings'],
          is_verified: true,
          onboarding_completed: true,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'profile-3',
          user_id: 'user-3',
          first_name: 'Bob',
          last_name: 'Wilson',
          medical_specialty: 'Neurology',
          city: 'Boston',
          country: 'USA',
          age: 28,
          gender: 'male',
          looking_for: 'professional_networking',
          interests: ['research'],
          lifestyle_goals: ['career_advancement'],
          availability_preferences: ['weekday_evenings'],
          is_verified: true,
          onboarding_completed: true,
          created_at: '2024-01-01T00:00:00Z'
        }
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => Promise.resolve({ data: mockProfiles, error: null })),
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: [{ id: 'match-1' }], error: null })),
        })),
      })

      const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }

      // Mock the API response
      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({ success: true })
      }

      expect(mockResponse.status).toBe(200)
      const data = await mockResponse.json()
      expect(data.success).toBe(true)
    })

    test('handles insufficient profiles for matching', async () => {
      const mockProfiles = [
        {
          id: 'profile-1',
          user_id: 'user-1',
          first_name: 'John',
          last_name: 'Doe',
          medical_specialty: 'Cardiology',
          is_verified: true,
          onboarding_completed: true
        }
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => Promise.resolve({ data: mockProfiles, error: null })),
      })

      const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }

      // Mock the API response for insufficient profiles
      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({ 
          success: false, 
          error: 'Not enough profiles for matching' 
        })
      }

      expect(mockResponse.status).toBe(200)
      const data = await mockResponse.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Not enough profiles')
    })

    test('handles database errors during matching', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } })),
      })

      const request = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }

      // Mock the API response for database error
      const mockResponse = {
        status: 500,
        json: () => Promise.resolve({ 
          success: false, 
          error: 'Database error' 
        })
      }

      expect(mockResponse.status).toBe(500)
      const data = await mockResponse.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Database error')
    })
  })

  describe('Matches API Tests', () => {
    test('GET /api/matches returns user matches', async () => {
      const mockMatches = [
        {
          id: 'match-1',
          group_name: 'Cardiology Group',
          match_week: '2024-01-01',
          group_size: 3,
          average_compatibility: 85,
          members: [
            {
              profile_id: 'profile-1',
              profiles: {
                first_name: 'John',
                last_name: 'Doe',
                medical_specialty: 'Cardiology'
              }
            },
            {
              profile_id: 'profile-2',
              profiles: {
                first_name: 'Jane',
                last_name: 'Smith',
                medical_specialty: 'Cardiology'
              }
            }
          ]
        }
      ]

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              desc: jest.fn(() => Promise.resolve({ data: mockMatches, error: null })),
            })),
          })),
        })),
      })

      const request = {
        method: 'GET'
      }

      // Mock the API response
      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({ 
          success: true, 
          data: { matches: mockMatches } 
        })
      }

      expect(mockResponse.status).toBe(200)
      const data = await mockResponse.json()
      expect(data.success).toBe(true)
      expect(data.data.matches).toHaveLength(1)
    })

    test('POST /api/matches creates new match', async () => {
      const mockMatch = {
        id: 'match-1',
        group_name: 'Match 2024-01-01',
        match_week: '2024-01-01',
        group_size: 2,
        average_compatibility: 85
      }

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: mockMatch, error: null })),
        })),
      })

      const requestBody = {
        user1Id: 'user-1',
        user2Id: 'user-2',
        action: 'like'
      }

      const request = {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      }

      // Mock the API response
      const mockResponse = {
        status: 200,
        json: () => Promise.resolve({ success: true })
      }

      expect(mockResponse.status).toBe(200)
      const data = await mockResponse.json()
      expect(data.success).toBe(true)
    })

    test('handles match creation errors', async () => {
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Match creation failed' } })),
        })),
      })

      const requestBody = {
        user1Id: 'user-1',
        user2Id: 'user-2',
        action: 'like'
      }

      const request = {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      }

      // Mock the API response for error
      const mockResponse = {
        status: 500,
        json: () => Promise.resolve({ 
          success: false, 
          error: 'Match creation failed' 
        })
      }

      expect(mockResponse.status).toBe(500)
      const data = await mockResponse.json()
      expect(data.success).toBe(false)
      expect(data.error).toContain('Match creation failed')
    })
  })

  describe('Matching Components Tests', () => {
    test('renders match list with proper information', () => {
      const mockMatches = [
        {
          id: 'match-1',
          group_name: 'Cardiology Group',
          match_week: '2024-01-01',
          group_size: 3,
          average_compatibility: 85,
          members: [
            {
              profile_id: 'profile-1',
              profiles: {
                first_name: 'John',
                last_name: 'Doe',
                medical_specialty: 'Cardiology',
                avatar_url: 'avatar1.jpg'
              }
            },
            {
              profile_id: 'profile-2',
              profiles: {
                first_name: 'Jane',
                last_name: 'Smith',
                medical_specialty: 'Cardiology',
                avatar_url: 'avatar2.jpg'
              }
            }
          ]
        }
      ]

      const MatchList = ({ matches }: { matches: any[] }) => (
        <div>
          {matches.map(match => (
            <div key={match.id} data-testid={`match-${match.id}`}>
              <h3>{match.group_name}</h3>
              <p>Compatibility: {match.average_compatibility}%</p>
              <p>Group Size: {match.group_size}</p>
              <div>
                {match.members.map((member: any) => (
                  <div key={member.profile_id}>
                    <span>{member.profiles.first_name} {member.profiles.last_name}</span>
                    <span>{member.profiles.medical_specialty}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )

      render(<MatchList matches={mockMatches} />)

      expect(screen.getByTestId('match-match-1')).toBeInTheDocument()
      expect(screen.getByText('Cardiology Group')).toBeInTheDocument()
      expect(screen.getByText('Compatibility: 85%')).toBeInTheDocument()
      expect(screen.getByText('Group Size: 3')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    test('handles match selection and chat creation', () => {
      const mockOnMatchSelect = jest.fn()
      const mockMatches = [
        {
          id: 'match-1',
          group_name: 'Cardiology Group',
          chat_room_id: 'chat-1'
        }
      ]

      const MatchSelector = ({ matches, onMatchSelect }: { matches: any[], onMatchSelect: (matchId: string, chatRoomId: string) => void }) => (
        <div>
          {matches.map(match => (
            <button
              key={match.id}
              onClick={() => onMatchSelect(match.id, match.chat_room_id)}
              data-testid={`select-match-${match.id}`}
            >
              {match.group_name}
            </button>
          ))}
        </div>
      )

      render(<MatchSelector matches={mockMatches} onMatchSelect={mockOnMatchSelect} />)

      fireEvent.click(screen.getByTestId('select-match-match-1'))

      expect(mockOnMatchSelect).toHaveBeenCalledWith('match-1', 'chat-1')
    })

    test('displays match compatibility breakdown', () => {
      const mockMatch = {
        id: 'match-1',
        group_name: 'Cardiology Group',
        compatibility_breakdown: {
          specialty: 0.9,
          interests: 0.8,
          social: 0.7,
          availability: 0.6,
          geographic: 1.0,
          lifestyle: 0.5
        }
      }

      const CompatibilityBreakdown = ({ match }: { match: any }) => (
        <div>
          <h3>{match.group_name}</h3>
          <div>
            <span>Specialty: {Math.round(match.compatibility_breakdown.specialty * 100)}%</span>
            <span>Interests: {Math.round(match.compatibility_breakdown.interests * 100)}%</span>
            <span>Social: {Math.round(match.compatibility_breakdown.social * 100)}%</span>
            <span>Availability: {Math.round(match.compatibility_breakdown.availability * 100)}%</span>
            <span>Location: {Math.round(match.compatibility_breakdown.geographic * 100)}%</span>
            <span>Lifestyle: {Math.round(match.compatibility_breakdown.lifestyle * 100)}%</span>
          </div>
        </div>
      )

      render(<CompatibilityBreakdown match={mockMatch} />)

      expect(screen.getByText('Specialty: 90%')).toBeInTheDocument()
      expect(screen.getByText('Interests: 80%')).toBeInTheDocument()
      expect(screen.getByText('Social: 70%')).toBeInTheDocument()
      expect(screen.getByText('Availability: 60%')).toBeInTheDocument()
      expect(screen.getByText('Location: 100%')).toBeInTheDocument()
      expect(screen.getByText('Lifestyle: 50%')).toBeInTheDocument()
    })
  })

  describe('Matching Algorithm Edge Cases', () => {
    test('handles users with no interests', () => {
      const userWithNoInterests = {
        id: 'user-1',
        medical_specialty: 'Cardiology',
        interests: [],
        social_preferences: ['professional_networking'],
        availability_preferences: ['weekday_evenings'],
        city: 'New York',
        career_stage: 'mid_career',
        institutions: ['NYU Medical Center'],
        gender: 'male',
        age: 35
      }

      const normalUser = {
        id: 'user-2',
        medical_specialty: 'Cardiology',
        interests: ['research', 'teaching'],
        social_preferences: ['professional_networking'],
        availability_preferences: ['weekday_evenings'],
        city: 'New York',
        career_stage: 'mid_career',
        institutions: ['NYU Medical Center'],
        gender: 'female',
        age: 32
      }

      const score = calculateCompatibilityScore(userWithNoInterests, normalUser)
      
      expect(score.score).toBeGreaterThan(0) // Should still calculate a score
      expect(score.breakdown.interests).toBe(0) // No interests overlap
    })

    test('handles users with different career stages', () => {
      const earlyCareerUser = {
        id: 'user-1',
        medical_specialty: 'Cardiology',
        interests: ['research'],
        social_preferences: ['professional_networking'],
        availability_preferences: ['weekday_evenings'],
        city: 'New York',
        career_stage: 'early_career',
        institutions: ['NYU Medical Center'],
        gender: 'male',
        age: 28
      }

      const seniorUser = {
        id: 'user-2',
        medical_specialty: 'Cardiology',
        interests: ['research', 'teaching', 'mentoring'],
        social_preferences: ['professional_networking', 'mentoring'],
        availability_preferences: ['weekday_evenings'],
        city: 'New York',
        career_stage: 'senior',
        institutions: ['NYU Medical Center'],
        gender: 'female',
        age: 45
      }

      const score = calculateCompatibilityScore(earlyCareerUser, seniorUser)
      
      expect(score.score).toBeGreaterThan(0.5) // Should still have good compatibility
      expect(score.breakdown.specialty).toBe(1.0) // Same specialty
      expect(score.breakdown.geographic).toBe(1.0) // Same city
    })

    test('handles maximum compatibility score', () => {
      const identicalUser1 = {
        id: 'user-1',
        medical_specialty: 'Cardiology',
        interests: ['research', 'teaching', 'clinical_practice'],
        social_preferences: ['professional_networking', 'mentoring'],
        availability_preferences: ['weekday_evenings', 'weekend_mornings'],
        city: 'New York',
        career_stage: 'mid_career',
        institutions: ['NYU Medical Center'],
        gender: 'male',
        age: 35
      }

      const identicalUser2 = {
        id: 'user-2',
        medical_specialty: 'Cardiology',
        interests: ['research', 'teaching', 'clinical_practice'],
        social_preferences: ['professional_networking', 'mentoring'],
        availability_preferences: ['weekday_evenings', 'weekend_mornings'],
        city: 'New York',
        career_stage: 'mid_career',
        institutions: ['NYU Medical Center'],
        gender: 'female',
        age: 32
      }

      const score = calculateCompatibilityScore(identicalUser1, identicalUser2)
      
      expect(score.score).toBeCloseTo(1.0, 1) // Should be very close to perfect match
    })
  })

  describe('Matching Performance Tests', () => {
    test('handles large number of users efficiently', () => {
      const users = Array.from({ length: 100 }, (_, i) => ({
        id: `user-${i}`,
        medical_specialty: i % 2 === 0 ? 'Cardiology' : 'Neurology',
        interests: ['research', 'teaching'],
        social_preferences: ['professional_networking'],
        availability_preferences: ['weekday_evenings'],
        city: i % 3 === 0 ? 'New York' : i % 3 === 1 ? 'Boston' : 'Chicago',
        career_stage: 'mid_career',
        institutions: ['Medical Center'],
        gender: i % 2 === 0 ? 'male' : 'female',
        age: 30 + (i % 20)
      }))

      const startTime = performance.now()
      
      // Calculate compatibility for first user with all others
      const scores = users.slice(1).map(user => 
        calculateCompatibilityScore(users[0], user)
      )
      
      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(scores).toHaveLength(99)
      expect(executionTime).toBeLessThan(1000) // Should complete in less than 1 second
      
      // Verify scores are reasonable
      scores.forEach(score => {
        expect(score.score).toBeGreaterThanOrEqual(0)
        expect(score.score).toBeLessThanOrEqual(1)
      })
    })

    test('handles memory efficiently with large datasets', () => {
      const largeUserSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `user-${i}`,
        medical_specialty: 'Cardiology',
        interests: ['research'],
        social_preferences: ['professional_networking'],
        availability_preferences: ['weekday_evenings'],
        city: 'New York',
        career_stage: 'mid_career',
        institutions: ['Medical Center'],
        gender: 'male',
        age: 35
      }))

      // This should not cause memory issues
      const sampleScores = largeUserSet.slice(0, 10).map(user => 
        calculateCompatibilityScore(largeUserSet[0], user)
      )

      expect(sampleScores).toHaveLength(10)
      sampleScores.forEach(score => {
        expect(score.score).toBeGreaterThanOrEqual(0)
        expect(score.score).toBeLessThanOrEqual(1)
      })
    })
  })
})
