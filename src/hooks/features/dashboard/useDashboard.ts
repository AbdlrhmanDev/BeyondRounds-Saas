"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dashboardAPI } from '@/lib/api'
import { QUERY_KEYS, CACHE_TIMES } from '@/lib/constants'
import { handleSupabaseError } from '@/lib/utils/error'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook to fetch user's matches
 */
export function useMatches(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.MATCHES(userId),
    queryFn: () => dashboardAPI.getMatches(userId),
    enabled: !!userId,
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    retry: 3,
  })
}

/**
 * Hook to fetch available groups
 */
export function useAvailableGroups(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.GROUPS(userId),
    queryFn: () => dashboardAPI.getAvailableGroups(userId),
    enabled: !!userId,
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    retry: 3,
  })
}

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD.STATS(userId),
    queryFn: () => dashboardAPI.getDashboardStats(userId),
    enabled: !!userId,
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    retry: 3,
  })
}

/**
 * Hook to join a group
 */
export function useJoinGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      // This would be implemented in the API layer
      // For now, we'll assume it's a direct Supabase call
      const supabase = createClient()
      const { data, error } = await supabase
        .from('group_members')
        .insert({ group_id: groupId, user_id: userId })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, { userId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.GROUPS(userId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.STATS(userId) })
    },
    onError: (error) => {
      throw handleSupabaseError(error)
    },
  })
}

/**
 * Hook to leave a group
 */
export function useLeaveGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: string; userId: string }) => {
      const supabase = createClient()
      const { error } = await supabase
        .from('match_members')
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq('match_id', groupId)
        .eq('profile_id', userId)

      if (error) throw error
    },
    onSuccess: (_, { userId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.GROUPS(userId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.STATS(userId) })
    },
    onError: (error) => {
      throw handleSupabaseError(error)
    },
  })
}

/**
 * Hook to refresh dashboard data
 */
export function useRefreshDashboard(userId: string) {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.MATCHES(userId) })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.GROUPS(userId) })
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.STATS(userId) })
  }
}
