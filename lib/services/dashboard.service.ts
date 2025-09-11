import { createClient } from '@/lib/supabase/client'
import { Match, AvailableGroup, UserProfile } from '@/lib/types'
import { safeSupabaseOperation } from '@/lib/utils/error-handling'

/**
 * Enhanced service functions for dashboard data management
 * These functions provide a clean API layer over Supabase operations
 */

/**
 * Fetch user's matches with proper error handling
 */
export async function getMatches(userId: string) {
  const supabase = createClient()
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
          profiles(id, first_name, last_name, specialty, city, gender, interests)
        ),
        chat_messages(
          content,
          created_at,
          message_type
        )
      `)
      .eq('match_members.user_id', userId)
      .order('created_at', { ascending: false })

    return { data: data as unknown as Match[], error }
  }, 'getMatches')
}

/**
 * Fetch available groups for user to join
 */
export async function getAvailableGroups(userId: string) {
  const supabase = createClient()
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

    // Process the data into AvailableGroup format
    const processedGroups: AvailableGroup[] = data?.map((group: any) => ({
      id: group.id,
      group_name: group.group_name,
      member_count: group.match_members?.length || 0,
      cities: [...new Set(group.match_members?.map((m: any) => m.profiles?.city).filter(Boolean))] as string[],
      specialties: [...new Set(group.match_members?.map((m: any) => m.profiles?.specialty).filter(Boolean))] as string[],
      created_at: group.created_at,
      can_join: (group.match_members?.length || 0) < 4
    })) || []

    return { data: processedGroups, error: null }
  }, 'getAvailableGroups')
}

/**
 * Join a group
 */
export async function joinGroup(groupId: string, userId: string) {
  const supabase = createClient()
  return safeSupabaseOperation(async () => {
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
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(userId: string) {
  return safeSupabaseOperation(async () => {
    // Get matches for stats calculation
    const matchesResult = await getMatches(userId)
    
    if (matchesResult.error) {
      return { data: null, error: matchesResult.error }
    }

    const matches = matchesResult.data || []
    
    // Calculate stats
    const stats = {
      totalMatches: matches.length,
      activeMatches: matches.filter(m => m.status === 'active').length,
      thisWeekMatches: matches.filter(m => {
        const matchDate = new Date(m.match_week)
        const now = new Date()
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return matchDate >= weekAgo
      }).length,
      activeChats: matches.filter(m => m.chat_messages?.length > 0).length,
      completionRate: matches.length > 0 
        ? Math.round((matches.filter(m => m.status === 'active').length / matches.length) * 100) 
        : 0
    }

    return { data: stats, error: null }
  }, 'getDashboardStats')
}

/**
 * Get user profile
 */
export async function getProfile(userId: string) {
  const supabase = createClient()
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return { data: data as UserProfile, error }
  }, 'getProfile')
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: Partial<UserProfile>) {
  const supabase = createClient()
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    return { data: data as UserProfile, error }
  }, 'updateProfile')
}

/**
 * Check if profile is complete
 */
export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false
  
  return !!(
    profile.first_name?.trim() &&
    profile.last_name?.trim() &&
    profile.specialty?.trim() &&
    profile.city?.trim()
  )
}

/**
 * Get chat messages for a group
 */
export async function getMessages(groupId: string) {
  const supabase = createClient()
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        id,
        content,
        created_at,
        message_type,
        user_id,
        profiles(first_name, last_name)
      `)
      .eq('match_id', groupId)
      .order('created_at', { ascending: true })

    return { data, error }
  }, 'getMessages')
}

/**
 * Send a message
 */
export async function sendMessage(groupId: string, userId: string, content: string, messageType: 'text' | 'system' = 'text') {
  const supabase = createClient()
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        match_id: groupId,
        user_id: userId,
        content,
        message_type: messageType,
        created_at: new Date().toISOString()
      })
      .select()

    return { data, error }
  }, 'sendMessage')
}

/**
 * Get group members
 */
export async function getGroupMembers(groupId: string) {
  const supabase = createClient()
  return safeSupabaseOperation(async () => {
    const { data, error } = await supabase
      .from('match_members')
      .select(`
        user_id,
        joined_at,
        profiles(id, first_name, last_name, specialty, city, profile_image_url)
      `)
      .eq('match_id', groupId)

    return { data, error }
  }, 'getGroupMembers')
}

/**
 * Utility functions for data processing
 */
export function getInitials(firstName: string, lastName: string): string {
  const first = firstName && firstName.trim() ? firstName.trim()[0] : ''
  const last = lastName && lastName.trim() ? lastName.trim()[0] : ''
  return first || last ? `${first}${last}`.toUpperCase() : 'U'
}

/**
 * Get last message preview
 */
export function getLastMessagePreview(match: Match): string {
  if (!match.chat_messages || match.chat_messages.length === 0) {
    return 'No messages yet'
  }

  const lastMessage = match.chat_messages[match.chat_messages.length - 1]
  const preview = lastMessage.content.length > 50 
    ? lastMessage.content.substring(0, 50) + '...' 
    : lastMessage.content

  return preview
}

/**
 * Get last message time
 */
export function getLastMessageTime(match: Match): string {
  if (!match.chat_messages || match.chat_messages.length === 0) {
    return ''
  }

  const lastMessage = match.chat_messages[match.chat_messages.length - 1]
  return new Date(lastMessage.created_at).toLocaleString()
}

/**
 * Filter matches by search term
 */
export function filterMatches(matches: Match[], searchTerm: string): Match[] {
  if (!searchTerm.trim()) return matches

  const searchLower = searchTerm.toLowerCase()
  return matches.filter(match =>
    match.group_name.toLowerCase().includes(searchLower) ||
    match.match_members.some(member =>
      member.profiles.specialty.toLowerCase().includes(searchLower) ||
      `${member.profiles.first_name || ''} ${member.profiles.last_name || ''}`.toLowerCase().includes(searchLower)
    )
  )
}