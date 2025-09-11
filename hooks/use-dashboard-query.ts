import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getMatches, 
  getAvailableGroups, 
  joinGroup, 
  getDashboardStats,
  getProfile,
  updateProfile,
  isProfileComplete,
  getMessages,
  sendMessage,
  getGroupMembers,
  getInitials,
  getLastMessagePreview,
  getLastMessageTime
} from '@/lib/services/dashboard.service'
import { queryKeys, queryOptions } from '@/lib/providers/query-provider'
import { Match, AvailableGroup, DashboardStats, UseDashboardReturn, UserProfile } from '@/lib/types'

/**
 * Enhanced dashboard hook using React Query for better caching and data management
 */
export function useDashboardQuery(userId: string | null): UseDashboardReturn {
  const queryClient = useQueryClient()

  // Query for user's matches
  const {
    data: matches = [],
    isLoading: matchesLoading,
    error: matchesError
  } = useQuery({
    queryKey: queryKeys.dashboard.matches(userId!),
    queryFn: () => getMatches(userId!),
    enabled: !!userId,
    ...queryOptions.dashboard,
    select: (result) => result.data || []
  })

  // Query for available groups
  const {
    data: availableGroups = [],
    isLoading: groupsLoading,
    error: groupsError
  } = useQuery({
    queryKey: queryKeys.dashboard.availableGroups(userId!),
    queryFn: () => getAvailableGroups(userId!),
    enabled: !!userId,
    ...queryOptions.dashboard,
    select: (result) => result.data || []
  })

  // Query for dashboard stats
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError
  } = useQuery({
    queryKey: queryKeys.dashboard.stats(userId!),
    queryFn: () => getDashboardStats(userId!),
    enabled: !!userId,
    ...queryOptions.dashboard,
    select: (result) => result.data || {
      totalMatches: 0,
      thisWeekMatches: 0,
      activeChats: 0,
      completionRate: 0
    }
  })

  // Query for user profile
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError
  } = useQuery({
    queryKey: queryKeys.auth.profile(userId!),
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
    ...queryOptions.profile,
    select: (result) => result.data || null
  })

  // Mutation for joining a group
  const joinGroupMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      joinGroup(groupId, userId),
    onSuccess: () => {
      // Invalidate and refetch dashboard data
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.matches(userId!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.availableGroups(userId!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(userId!) })
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(userId!) })
    },
    onError: (error) => {
      console.error('Error joining group:', error)
    }
  })

  // Join group function
  const joinGroupHandler = async (groupId: string) => {
    if (!userId) return
    
    await joinGroupMutation.mutateAsync({ groupId, userId })
  }

  // Memoized utility functions
  const getWeeklyStats = () => stats || {
    totalMatches: 0,
    thisWeekMatches: 0,
    activeChats: 0,
    completionRate: 0
  }

  const getLastMessage = (match: Match): string => getLastMessagePreview(match)
  const getLastMessageTime = (match: Match): string => getLastMessageTime(match)
  const getInitials = (firstName: string, lastName: string): string => getInitials(firstName, lastName)

  // Refresh data function
  const refreshData = async () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.matches(userId!) })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.availableGroups(userId!) })
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats(userId!) })
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(userId!) })
  }

  // Loading and error states
  const loading = matchesLoading || groupsLoading || statsLoading || profileLoading
  const error = matchesError || groupsError || statsError || profileError

  return {
    matches,
    availableGroups,
    notifications: [], // TODO: Implement notifications
    isJoining: joinGroupMutation.isPending ? 'pending' : null,
    loading,
    isLoading: loading, // Alias for backward compatibility
    error: error?.message || null,
    profile: profile || null,
    stats: stats || {
      totalMatches: 0,
      thisWeekMatches: 0,
      activeChats: 0,
      completionRate: 0
    },
    joinGroup: joinGroupHandler,
    markNotificationAsRead: () => {}, // TODO: Implement notifications
    getWeeklyStats,
    getLastMessage,
    getLastMessageTime,
    getInitials,
    loadDashboardData: refreshData,
    refreshData
  }
}

/**
 * Hook for managing user profile with React Query
 */
export function useProfileQuery(userId: string | null) {
  const queryClient = useQueryClient()

  const {
    data: profile,
    isLoading,
    error
  } = useQuery({
    queryKey: queryKeys.auth.profile(userId!),
    queryFn: () => getProfile(userId!),
    enabled: !!userId,
    ...queryOptions.profile,
    select: (result) => result.data || null
  })

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: (updates: Partial<UserProfile>) =>
      updateProfile(userId!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile(userId!) })
    }
  })

  const updateProfileHandler = async (updates: Partial<UserProfile>) => {
    await updateProfileMutation.mutateAsync(updates)
  }

  const isProfileCompleteCheck = isProfileComplete(profile || null)

  return {
    profile,
    loading: isLoading,
    error: error?.message || null,
    updateProfile: updateProfileHandler,
    isProfileComplete: isProfileCompleteCheck,
    isUpdating: updateProfileMutation.isPending
  }
}

/**
 * Hook for managing chat data with React Query
 */
export function useChatQuery(groupId: string | null) {
  const queryClient = useQueryClient()

  // Query for chat messages
  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError
  } = useQuery({
    queryKey: queryKeys.chat.messages(groupId!),
    queryFn: () => getMessages(groupId!),
    enabled: !!groupId,
    ...queryOptions.chat,
    select: (result) => result.data || []
  })

  // Query for group members
  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError
  } = useQuery({
    queryKey: queryKeys.chat.members(groupId!),
    queryFn: () => getGroupMembers(groupId!),
    enabled: !!groupId,
    ...queryOptions.dashboard,
    select: (result) => result.data || []
  })

  // Mutation for sending messages
  const sendMessageMutation = useMutation({
    mutationFn: ({ content, messageType }: { content: string; messageType?: 'text' | 'system' }) =>
      sendMessage(groupId!, 'current-user-id', content, messageType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chat.messages(groupId!) })
    }
  })

  const sendMessageHandler = async (content: string, messageType: 'text' | 'system' = 'text') => {
    await sendMessageMutation.mutateAsync({ content, messageType })
  }

  return {
    messages,
    members,
    loading: messagesLoading || membersLoading,
    error: messagesError?.message || membersError?.message || null,
    sendMessage: sendMessageHandler,
    isSending: sendMessageMutation.isPending
  }
}
