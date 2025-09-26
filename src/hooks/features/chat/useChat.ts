"use client"

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatAPI } from '@/lib/api'
import { QUERY_KEYS, CACHE_TIMES } from '@/lib/constants'
import { handleSupabaseError } from '@/lib/utils/error'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook to fetch chat messages
 */
export function useChatMessages(groupId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CHAT.MESSAGES(groupId),
    queryFn: () => chatAPI.getMessages(groupId),
    enabled: !!groupId,
    staleTime: CACHE_TIMES.SHORT,
    gcTime: CACHE_TIMES.MEDIUM,
    retry: 3,
    refetchInterval: 2000, // Poll for new messages every 2 seconds
  })
}

/**
 * Hook to fetch group members
 */
export function useGroupMembers(groupId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.CHAT.MEMBERS(groupId),
    queryFn: () => chatAPI.getMatchMembers(groupId),
    enabled: !!groupId,
    staleTime: CACHE_TIMES.MEDIUM,
    gcTime: CACHE_TIMES.LONG,
    retry: 3,
  })
}

/**
 * Hook to send a message
 */
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      groupId, 
      userId, 
      content 
    }: { 
      groupId: string
      userId: string
      content: string 
    }) => {
      return chatAPI.sendMessage(groupId, userId, content)
    },
    onSuccess: (_, { groupId }) => {
      // Invalidate messages query to refetch with new message
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHAT.MESSAGES(groupId) })
    },
    onError: (error) => {
      throw handleSupabaseError(error)
    },
  })
}

/**
 * Hook to subscribe to real-time messages
 */
export function useRealtimeMessages(chatRoomId: string) {
  const queryClient = useQueryClient()
  const [messages, setMessages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    if (!chatRoomId) return

    const supabase = createClient()

    // Load initial messages
    const loadInitialMessages = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            id,
            content,
            sender_id,
            created_at,
            is_edited
          `)
          .eq('chat_room_id', chatRoomId)
          .order('created_at', { ascending: true })

        if (error) throw error

        const formattedMessages = data.map((msg: any) => ({
          ...msg,
          sender: msg.users ? {
            name: `${msg.users.first_name} ${msg.users.last_name}`.trim(),
          } : null
        }))

        setMessages(formattedMessages)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialMessages()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`chat_messages:${chatRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`
        },
        async (payload) => {
          const newMessage = payload.new as any

          // Fetch sender info for the new message
          const { data: senderData } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', newMessage.sender_id)
            .single()

          const messageWithSender = {
            ...newMessage,
            sender: senderData ? {
              name: `${senderData.first_name} ${senderData.last_name}`.trim()
            } : null
          }

          setMessages(prev => [...prev, messageWithSender])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`
        },
        (payload) => {
          const updatedMessage = payload.new as any
          setMessages(prev => prev.map(msg =>
            msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
          ))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`
        },
        (payload) => {
          const deletedMessage = payload.old as any
          setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id))
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [chatRoomId])

  const subscribe = () => {
    // Already handled in useEffect
  }

  const unsubscribe = () => {
    // Handled in cleanup
  }

  return {
    messages,
    isLoading,
    error,
    subscribe,
    unsubscribe,
  }
}

/**
 * Hook to get chat statistics
 */
export function useChatStats(groupId: string) {
  const { data: messages } = useChatMessages(groupId)
  const { data: members } = useGroupMembers(groupId)

  return {
    messageCount: messages?.length || 0,
    memberCount: members?.length || 0,
    lastMessage: messages?.[messages.length - 1],
  }
}
