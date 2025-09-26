'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Message = Database['public']['Tables']['chat_messages']['Row'] & {
  profiles: {
    id: string
    first_name: string
    last_name: string
    medical_specialty: string
  } | null
}

interface UseRealtimeChatReturn {
  messages: Message[]
  isConnected: boolean
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

export function useRealtimeChat(chatRoomId: string | null): UseRealtimeChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()
  const channelRef = useRef<any>(null)
  const processedMessageIds = useRef<Set<string>>(new Set())

  // Function to add message with deduplication
  const addMessageSafely = (newMessage: Message) => {
    console.log('🔄 Processing message:', newMessage.id)
    
    // Check if we already processed this message
    if (processedMessageIds.current.has(newMessage.id)) {
      console.log('⚠️ Duplicate message ignored:', newMessage.id)
      return
    }

    // Mark message as processed
    processedMessageIds.current.add(newMessage.id)

    setMessages(prevMessages => {
      // Double-check: ensure message doesn't already exist in state
      const existsInState = prevMessages.some(msg => msg.id === newMessage.id)
      if (existsInState) {
        console.log('⚠️ Message already in state:', newMessage.id)
        return prevMessages
      }

      console.log('✅ Adding new message:', newMessage.id)
      return [...prevMessages, newMessage].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    })
  }

  // Function to load initial messages
  const loadMessages = async (chatRoomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', chatRoomId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (data) {
        // Clear processed IDs when loading fresh data
        processedMessageIds.current.clear()
        
        // Mark all initial messages as processed
        data.forEach(msg => processedMessageIds.current.add(msg.id))
        
        setMessages(data as Message[])
        console.log(`📥 Loaded ${data.length} initial messages`)
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error)
    }
  }

  // Setup realtime subscription
  useEffect(() => {
    if (!chatRoomId) {
      setMessages([])
      setIsConnected(false)
      return
    }

    // Load initial messages
    loadMessages(chatRoomId)

    // Create realtime channel with unique name
    const channelName = `chat_messages:chat_room_id=eq.${chatRoomId}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        async (payload) => {
          console.log('🔄 New message received:', payload.new)
          
          // Fetch the full message with profile data
          const { data: newMessage, error } = await supabase
            .from('chat_messages')
            .select(`
              *,
              profiles!sender_id (
                id,
                first_name,
                last_name,
                medical_specialty
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && newMessage) {
            addMessageSafely(newMessage as Message)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        async (payload) => {
          console.log('🔄 Message updated:', payload.new)
          
          // Fetch the updated message with profile data
          const { data: updatedMessage, error } = await supabase
            .from('chat_messages')
            .select(`
              *,
              profiles!sender_id (
                id,
                first_name,
                last_name,
                medical_specialty
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && updatedMessage) {
            setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg.id === updatedMessage.id ? (updatedMessage as Message) : msg
              )
            )
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_room_id=eq.${chatRoomId}`,
        },
        (payload) => {
          console.log('🔄 Message deleted:', payload)
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id))
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    // Cleanup function
    return () => {
      console.log('🔌 Unsubscribing from real-time updates')
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      setIsConnected(false)
    }
  }, [chatRoomId, supabase])

  return {
    messages,
    isConnected,
    setMessages,
  }
}
