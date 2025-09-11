import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow, startOfWeek, endOfWeek } from 'date-fns'
import { Match, AvailableGroup, Notification, DashboardStats, UseDashboardReturn } from '@/lib/types'

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
  const supabase = createClient()

  const loadDashboardData = async () => {
    if (!userId) return

    try {
      // Get user's matches
      const { data: matchesData, error: matchesError } = await supabase
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

      if (matchesError) {
        console.error('Error loading matches:', matchesError)
      } else {
        setMatches((matchesData as any) || [])
      }

      // Get available groups
      const { data: availableGroupsData, error: availableGroupsError } = await supabase
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

      if (availableGroupsError) {
        console.error('Error loading available groups:', availableGroupsError)
      } else {
        const processedGroups = availableGroupsData?.map((group: any) => ({
          id: group.id,
          group_name: group.group_name,
          member_count: group.match_members?.length || 0,
          cities: [...new Set(group.match_members?.map((m: any) => m.profiles?.city).filter(Boolean))] as string[],
          specialties: [...new Set(group.match_members?.map((m: any) => m.profiles?.specialty).filter(Boolean))] as string[],
          created_at: group.created_at,
          can_join: (group.match_members?.length || 0) < 4
        })) || []
        
        setAvailableGroups(processedGroups as AvailableGroup[])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const joinGroup = async (groupId: string) => {
    if (!userId || isJoining) return
    
    setIsJoining(groupId)
    try {
      const { error } = await supabase
        .from('match_members')
        .insert({
          match_id: groupId,
          user_id: userId,
          joined_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error joining group:', error)
        alert('Failed to join group. Please try again.')
        return
      }

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
      console.error('Error joining group:', error)
      alert('An error occurred while joining the group.')
    } finally {
      setIsJoining(null)
    }
  }

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, unread: false } : notif
    ))
  }

  const getWeeklyStats = () => {
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
  }

  const getLastMessage = (match: Match) => {
    if (!match.chat_messages || match.chat_messages.length === 0) {
      return 'No messages yet'
    }

    const lastMessage = match.chat_messages[match.chat_messages.length - 1]
    const preview = lastMessage.content.length > 50 ? lastMessage.content.substring(0, 50) + '...' : lastMessage.content

    return preview
  }

  const getLastMessageTime = (match: Match) => {
    if (!match.chat_messages || match.chat_messages.length === 0) {
      return ''
    }

    const lastMessage = match.chat_messages[match.chat_messages.length - 1]
    return formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })
  }

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName && firstName.trim() ? firstName.trim()[0] : ''
    const last = lastName && lastName.trim() ? lastName.trim()[0] : ''
    return first || last ? `${first}${last}`.toUpperCase() : 'U'
  }

  return {
    matches,
    availableGroups,
    notifications,
    isJoining,
    loading,
    joinGroup,
    markNotificationAsRead,
    getWeeklyStats,
    getLastMessage,
    getLastMessageTime,
    getInitials,
    loadDashboardData
  }
}