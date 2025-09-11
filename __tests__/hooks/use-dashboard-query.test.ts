import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardQuery } from '@/hooks/use-dashboard-query'
import { DashboardService } from '@/lib/services/dashboard.service'

// Mock the service
jest.mock('@/lib/services/dashboard.service')
const mockDashboardService = DashboardService as jest.Mocked<typeof DashboardService>

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useDashboardQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return initial loading state', () => {
    mockDashboardService.getMatches.mockResolvedValue({
      data: [],
      error: null
    })
    mockDashboardService.getAvailableGroups.mockResolvedValue({
      data: [],
      error: null
    })
    mockDashboardService.getDashboardStats.mockResolvedValue({
      data: {
        totalMatches: 0,
        thisWeekMatches: 0,
        activeChats: 0,
        completionRate: 0
      },
      error: null
    })

    const { result } = renderHook(() => useDashboardQuery('test-user-id'), {
      wrapper: createWrapper()
    })

    expect(result.current.loading).toBe(true)
    expect(result.current.matches).toEqual([])
    expect(result.current.availableGroups).toEqual([])
  })

  it('should fetch and return dashboard data', async () => {
    const mockMatches = [
      {
        id: '1',
        group_name: 'Test Group',
        status: 'active' as const,
        match_week: '2024-01-15',
        created_at: '2024-01-15T10:00:00Z',
        match_members: [],
        chat_messages: []
      }
    ]

    const mockAvailableGroups = [
      {
        id: '2',
        group_name: 'Available Group',
        member_count: 2,
        cities: ['New York'],
        specialties: ['Cardiology'],
        created_at: '2024-01-15T10:00:00Z',
        can_join: true
      }
    ]

    const mockStats = {
      totalMatches: 1,
      thisWeekMatches: 1,
      activeChats: 0,
      completionRate: 100
    }

    mockDashboardService.getMatches.mockResolvedValue({
      data: mockMatches,
      error: null
    })
    mockDashboardService.getAvailableGroups.mockResolvedValue({
      data: mockAvailableGroups,
      error: null
    })
    mockDashboardService.getDashboardStats.mockResolvedValue({
      data: mockStats,
      error: null
    })

    const { result } = renderHook(() => useDashboardQuery('test-user-id'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.matches).toEqual(mockMatches)
    expect(result.current.availableGroups).toEqual(mockAvailableGroups)
    expect(result.current.getWeeklyStats()).toEqual(mockStats)
  })

  it('should handle errors gracefully', async () => {
    mockDashboardService.getMatches.mockResolvedValue({
      data: null,
      error: 'Failed to fetch matches'
    })
    mockDashboardService.getAvailableGroups.mockResolvedValue({
      data: [],
      error: null
    })
    mockDashboardService.getDashboardStats.mockResolvedValue({
      data: {
        totalMatches: 0,
        thisWeekMatches: 0,
        activeChats: 0,
        completionRate: 0
      },
      error: null
    })

    const { result } = renderHook(() => useDashboardQuery('test-user-id'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch matches')
    expect(result.current.matches).toEqual([])
  })

  it('should not fetch data when userId is null', () => {
    const { result } = renderHook(() => useDashboardQuery(null), {
      wrapper: createWrapper()
    })

    expect(result.current.loading).toBe(false)
    expect(mockDashboardService.getMatches).not.toHaveBeenCalled()
    expect(mockDashboardService.getAvailableGroups).not.toHaveBeenCalled()
    expect(mockDashboardService.getDashboardStats).not.toHaveBeenCalled()
  })

  it('should provide utility functions', () => {
    mockDashboardService.getMatches.mockResolvedValue({
      data: [],
      error: null
    })
    mockDashboardService.getAvailableGroups.mockResolvedValue({
      data: [],
      error: null
    })
    mockDashboardService.getDashboardStats.mockResolvedValue({
      data: {
        totalMatches: 0,
        thisWeekMatches: 0,
        activeChats: 0,
        completionRate: 0
      },
      error: null
    })

    const { result } = renderHook(() => useDashboardQuery('test-user-id'), {
      wrapper: createWrapper()
    })

    expect(typeof result.current.getInitials).toBe('function')
    expect(typeof result.current.getLastMessage).toBe('function')
    expect(typeof result.current.getLastMessageTime).toBe('function')
    expect(typeof result.current.getWeeklyStats).toBe('function')
    expect(typeof result.current.joinGroup).toBe('function')
    expect(typeof result.current.refreshData).toBe('function')
  })

  it('should handle joinGroup mutation', async () => {
    mockDashboardService.getMatches.mockResolvedValue({
      data: [],
      error: null
    })
    mockDashboardService.getAvailableGroups.mockResolvedValue({
      data: [],
      error: null
    })
    mockDashboardService.getDashboardStats.mockResolvedValue({
      data: {
        totalMatches: 0,
        thisWeekMatches: 0,
        activeChats: 0,
        completionRate: 0
      },
      error: null
    })
    mockDashboardService.joinGroup.mockResolvedValue({
      data: null,
      error: null
    })

    const { result } = renderHook(() => useDashboardQuery('test-user-id'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.joinGroup('group-id')

    expect(mockDashboardService.joinGroup).toHaveBeenCalledWith('group-id', 'test-user-id')
  })

  it('should handle joinGroup mutation error', async () => {
    mockDashboardService.getMatches.mockResolvedValue({
      data: [],
      error: null
    })
    mockDashboardService.getAvailableGroups.mockResolvedValue({
      data: [],
      error: null
    })
    mockDashboardService.getDashboardStats.mockResolvedValue({
      data: {
        totalMatches: 0,
        thisWeekMatches: 0,
        activeChats: 0,
        completionRate: 0
      },
      error: null
    })
    mockDashboardService.joinGroup.mockResolvedValue({
      data: null,
      error: 'Failed to join group'
    })

    const { result } = renderHook(() => useDashboardQuery('test-user-id'), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await result.current.joinGroup('group-id')

    // The error should be handled by the mutation
    expect(mockDashboardService.joinGroup).toHaveBeenCalledWith('group-id', 'test-user-id')
  })
})
