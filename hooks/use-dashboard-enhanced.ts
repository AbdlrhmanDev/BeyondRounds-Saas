import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow, startOfWeek, endOfWeek } from 'date-fns'
import { Match, AvailableGroup, Notification, DashboardStats, UseDashboardReturn, UserProfile } from '@/lib/types'
import { safeSupabaseOperation, SupabaseErrorHandler } from '@/lib/utils/error-handling'

/**
 * Enhanced dashboard hook with improved error handling, performance optimizations,
 * and better data management
 */
export function useDashboard(userId: string | null): UseDashboardReturn {
  const [matches, setMatches] = useState<Match[]>([])
  const [availableGroups, setAvailableGroups] = useState<AvailableGroup[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, type: 'match', message: 'New match available in Cardiology group', time: '2 hours ago', unread: true },
    { id: 2, type: 'message', message: 'Dr. Smith sent a message in Surgery group', time: '4 hours ago', unread: true },
    { id: 3, type: 'system', message: 'Weekly matching completed successfully', time: '1 day ago', unread: false }
  ])
  const [isJoining, setIsJoining] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const supabase = createClient()

  /**
   * Load dashboard data with enhanced error handling
   */
  const loadDashboardData = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Load profile, matches and available groups in parallel
      const [profileResult, matchesResult, groupsResult] = await Promise.all([
        loadProfile(),
        loadMatches(),
        loadAvailableGroups()
      ])

      if (profileResult.error) {
        setError(profileResult.error)
      } else {
        setProfile(profileResult.data)
      }

      if (matchesResult.error) {
        setError(matchesResult.error)
      } else {
        setMatches(matchesResult.data || [])
      }

      if (groupsResult.error) {
        // Don't set error for groups as it's not critical
        console.warn('Failed to load available groups:', groupsResult.error)
      } else {
        setAvailableGroups(groupsResult.data || [])
      }
    } catch (error) {
      const errorMessage = SupabaseErrorHandler.handleError(error)
      setError(errorMessage)
      SupabaseErrorHandler.logError(error, 'loadDashboardData')
    } finally {
      setLoading(false)
    }
  }, [userId])

  /**
   * Load user profile with proper error handling
   */
  const loadProfile = useCallback(async () => {
    if (!userId) return { data: null, error: null }

    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      return { data, error }
    }, 'loadProfile')
  }, [userId, supabase])

  /**
   * Load user's matches with proper error handling
   */
  const loadMatches = useCallback(async () => {
    if (!userId) return { data: null, error: null }

    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          group_name,
          status,
          match_week,
          created_at,
          match_members!inner(
            user_id,
            joined_at,
            profiles!inner(id, first_name, last_name, specialty, city, gender, interests)
          ),
          chat_messages(
            content,
            created_at,
            message_type
          )
        `)
        .eq('match_members.user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { data: null, error }
      }

      // Transform the data to match our types
      const transformedData = data?.map((match: any) => ({
        id: match.id,
        group_name: match.group_name,
        status: match.status,
        match_week: match.match_week,
        created_at: match.created_at,
        match_members: match.match_members.map((member: any) => ({
          user_id: member.user_id,
          joined_at: member.joined_at,
          profiles: member.profiles // This should now be a single object, not an array
        })),
        chat_messages: match.chat_messages || []
      })) || []

      return { data: transformedData, error: null }
    }, 'loadMatches')
  }, [userId, supabase])

  /**
   * Load available groups with proper error handling
   */
  const loadAvailableGroups = useCallback(async () => {
    if (!userId) return { data: null, error: null }

    return safeSupabaseOperation(async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          group_name,
          created_at,
          match_members(
            user_id,
            profiles(id, first_name, last_name, specialty, city, gender)
          )
        `)
        .eq('status', 'active')
        .not('match_members.user_id', 'eq', userId)

      if (error) {
        return { data: null, error }
      }

      // Process the data
      const processedGroups = data?.map((group: any) => ({
        id: group.id,
        group_name: group.group_name,
        member_count: group.match_members?.length || 0,
        cities: [...new Set(group.match_members?.map((m: any) => m.profiles?.city).filter(Boolean))] as string[],
        specialties: [...new Set(group.match_members?.map((m: any) => m.profiles?.specialty).filter(Boolean))] as string[],
        created_at: group.created_at,
        can_join: (group.match_members?.length || 0) < 4
      })) || []

      return { data: processedGroups, error: null }
    }, 'loadAvailableGroups')
  }, [userId, supabase])

  /**
   * Join a group with enhanced error handling and loading states
   */
  const joinGroup = useCallback(async (groupId: string) => {
    if (!userId || isJoining) return
    
    setIsJoining(groupId)
    setError(null)

    try {
      const result = await safeSupabaseOperation(async () => {
        const { data, error } = await supabase
          .from('match_members')
          .insert({
            match_id: groupId,
            user_id: userId,
            joined_at: new Date().toISOString()
          })
          .select()

        return { data, error }
      }, 'joinGroup')

      if (result.error) {
        setError(result.error)
        return
      }

      // Refresh data after successful join
      await loadDashboardData()
      
      // Add success notification
      setNotifications(prev => [{
        id: Date.now(),
        type: 'match',
        message: 'Successfully joined group! Start chatting with your new colleagues.',
        time: 'Just now',
        unread: true
      }, ...prev])

    } catch (error) {
      const errorMessage = SupabaseErrorHandler.handleError(error)
      setError(errorMessage)
      SupabaseErrorHandler.logError(error, 'joinGroup')
    } finally {
      setIsJoining(null)
    }
  }, [userId, isJoining, supabase, loadDashboardData])

  /**
   * Mark notification as read
   */
  const markNotificationAsRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ))
  }, [])

  /**
   * Get weekly stats with memoization for performance
   */
  const getWeeklyStats = useCallback((): DashboardStats => {
    const thisWeek = matches.filter(match => {
      const matchDate = new Date(match.match_week)
      const weekStart = startOfWeek(new Date())
      const weekEnd = endOfWeek(new Date())
      return matchDate >= weekStart && matchDate <= weekEnd
    })
    
    return {
      totalMatches: matches.length,
      thisWeekMatches: thisWeek.length,
      activeChats: matches.filter(match => match.chat_messages?.length > 0).length,
      completionRate: matches.length > 0 ? Math.round((matches.filter(match => match.status === 'active').length / matches.length) * 100) : 0
    }
  }, [matches])

  /**
   * Get last message with memoization
   */
  const getLastMessage = useCallback((match: Match): string => {
    if (!match.chat_messages || match.chat_messages.length === 0) {
      return 'No messages yet'
    }

    const lastMessage = match.chat_messages[match.chat_messages.length - 1]
    const preview = lastMessage.content.length > 50 ? lastMessage.content.substring(0, 50) + '...' : lastMessage.content

    return preview
  }, [])

  /**
   * Get last message time with memoization
   */
  const getLastMessageTime = useCallback((match: Match): string => {
    if (!match.chat_messages || match.chat_messages.length === 0) {
      return ''
    }

    const lastMessage = match.chat_messages[match.chat_messages.length - 1]
    return formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })
  }, [])

  /**
   * Get user initials with memoization
   */
  const getInitials = useCallback((firstName: string, lastName: string): string => {
    const first = firstName && firstName.trim() ? firstName.trim()[0] : ''
    const last = lastName && lastName.trim() ? lastName.trim()[0] : ''
    return first || last ? `${first}${last}`.toUpperCase() : 'U'
  }, [])

  /**
   * Memoized stats to prevent unnecessary recalculations
   */
  const stats = useMemo(() => getWeeklyStats(), [getWeeklyStats])

  // Load data on mount and when userId changes
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return {
    matches,
    availableGroups,
    notifications,
    isJoining,
    loading,
    isLoading: loading, // Alias for backward compatibility
    error,
    profile,
    stats,
    joinGroup,
    markNotificationAsRead,
    getWeeklyStats: () => stats,
    getLastMessage,
    getLastMessageTime,
    getInitials,
    loadDashboardData,
    refreshData: loadDashboardData // Alias for backward compatibility
  }
}
