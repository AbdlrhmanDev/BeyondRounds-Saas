'use client'

import { createClient } from '@/lib/supabase/client'
import { useQuery } from '@tanstack/react-query'

const supabase = createClient()

interface MatchPeer {
  id: string
  first_name: string
  last_name: string
  city: string
  medical_specialty: string
}

interface UseMatchPeersReturn {
  peers: MatchPeer[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to get peers in the same match using recommended query pattern
 * @param matchId - The match ID to get peers for
 * @returns Match peers data and loading state
 */
export function useMatchPeers(matchId: string | null): UseMatchPeersReturn {
  const {
    data: peers = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['match-peers', matchId],
    queryFn: async (): Promise<MatchPeer[]> => {
      if (!matchId) return []

      // Use recommended query pattern for match peers
      const { data, error } = await supabase
        .from('match_members')
        .select('profiles!inner(id,first_name,last_name,city,medical_specialty)')
        .eq('match_id', matchId)

      if (error) {
        console.error('Error fetching match peers:', error)
        throw error
      }

      // Extract profiles from the nested structure
      return data?.map(member => member.profiles).filter(Boolean) || []
    },
    enabled: !!matchId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    peers,
    isLoading,
    error: error as Error | null,
    refetch
  }
}

/**
 * Hook to get current user's profile using recommended pattern
 * @returns Current user profile data
 */
export function useCurrentProfile() {
  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['current-profile'],
    queryFn: async () => {
      // Use recommended query pattern for current user profile
      const { data, error } = await supabase
        .from('profiles')
        .select('id,user_id,first_name,last_name,city,medical_specialty,profile_completion,role,is_verified,onboarding_completed')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (error) {
        console.error('Error fetching current profile:', error)
        throw error
      }

      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })

  return {
    profile,
    isLoading,
    error: error as Error | null,
    refetch
  }
}

/**
 * Hook to send a message using recommended pattern
 * @returns Function to send messages
 */
export function useSendMessage() {
  const sendMessage = async (chatRoomId: string, matchId: string, content: string) => {
    try {
      // Use recommended pattern: get my profile ID first
      const { data: myId } = await supabase.rpc('my_profile_id')
      
      if (!myId) {
        throw new Error('Could not get user profile ID')
      }

      // Send message using recommended pattern
      const { error } = await supabase
        .from('chat_messages')
        .insert({ 
          chat_room_id: chatRoomId, 
          match_id: matchId, 
          content: content.trim(),
          sender_id: myId 
        })

      if (error) {
        console.error('Error sending message:', error)
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Error in sendMessage:', error)
      throw error
    }
  }

  return { sendMessage }
}

/**
 * Hook to update current user's profile using recommended pattern
 * @returns Function to update profile
 */
export function useUpdateProfile() {
  const updateProfile = async (updates: Partial<{
    city: string
    bio: string
    first_name: string
    last_name: string
    medical_specialty: string
    profile_completion: number
  }>) => {
    try {
      // Use recommended pattern for updating profile
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)

      if (error) {
        console.error('Error updating profile:', error)
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error('Error in updateProfile:', error)
      throw error
    }
  }

  return { updateProfile }
}


