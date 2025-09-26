'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@/components/theme-provider'
import AuthErrorBoundary from '@/components/shared/AuthErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})

interface AppProvidersProps {
  children: ReactNode
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthErrorBoundary>
          {children}
        </AuthErrorBoundary>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
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
  
  // User queries
  user: {
    all: ['profile'] as const,
    byId: (id: string) => ['profile', id] as const,
  },
  
  // Matching queries
  matching: {
    algorithm: (userId: string) => ['matching', 'algorithm', userId] as const,
    results: (userId: string) => ['matching', 'results', userId] as const,
  },
} as const

/**
 * Default query options for different data types
 */
export const queryOptions = {
  // User profile data (longer cache)
  user: {
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
  
  // Matching data (medium cache)
  matching: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  },
} as const
