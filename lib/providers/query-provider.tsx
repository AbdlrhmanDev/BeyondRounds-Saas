"use client"

import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

/**
 * Query provider component for React Query
 * Must be a client component to work with Next.js App Router
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance inside the component to avoid SSR issues
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 5 minutes by default
        staleTime: 5 * 60 * 1000,
        // Keep data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry failed requests 3 times
        retry: 3,
        // Retry delay with exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus
        refetchOnWindowFocus: false,
        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry mutations once
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}

/**
 * Query keys for consistent caching
 */
export const queryKeys = {
  // Auth queries
  auth: {
    user: ['auth', 'user'] as const,
    profile: (userId: string) => ['auth', 'profile', userId] as const,
  },
  
  // Dashboard queries
  dashboard: {
    matches: (userId: string) => ['dashboard', 'matches', userId] as const,
    availableGroups: (userId: string) => ['dashboard', 'availableGroups', userId] as const,
    stats: (userId: string) => ['dashboard', 'stats', userId] as const,
  },
  
  // Chat queries
  chat: {
    messages: (groupId: string) => ['chat', 'messages', groupId] as const,
    members: (groupId: string) => ['chat', 'members', groupId] as const,
  },
  
  // Profile queries
  profile: {
    all: ['profile'] as const,
    byId: (id: string) => ['profile', id] as const,
  },
} as const

/**
 * Default query options for different data types
 */
export const queryOptions = {
  // User profile data (longer cache)
  profile: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  
  // Dashboard data (medium cache)
  dashboard: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  },
  
  // Chat messages (short cache)
  chat: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  
  // Real-time data (very short cache)
  realtime: {
    staleTime: 0, // Always stale
    gcTime: 1 * 60 * 1000, // 1 minute
  },
} as const
