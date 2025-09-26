"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchingAPI } from '@/lib/api'
import { QUERY_KEYS, CACHE_TIMES } from '@/lib/constants'
import { handleSupabaseError } from '@/lib/utils/error'

/**
 * Hook to run the matching algorithm
 */
export function useRunMatching() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      return matchingAPI.runMatchingAlgorithm(userId)
    },
    onSuccess: (_, userId) => {
      // Invalidate matching results
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MATCHING.RESULTS(userId) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD.MATCHES(userId) })
    },
    onError: (error) => {
      throw handleSupabaseError(error)
    },
  })
}

/**
 * Hook to fetch matching results
 */
export function useMatchingResults(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.MATCHING.RESULTS(userId),
    queryFn: () => matchingAPI.getMatchingResults(userId),
    enabled: !!userId,
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    retry: 3,
  })
}

/**
 * Hook to get matching algorithm status
 */
export function useMatchingStatus(userId: string) {
  const { data: results, isLoading, error } = useMatchingResults(userId)
  const runMatching = useRunMatching()

  return {
    isLoading: isLoading || runMatching.isPending,
    error: error || runMatching.error,
    lastRun: results?.created_at,
    status: results?.status || 'idle',
    runMatching: () => runMatching.mutate(userId),
  }
}
