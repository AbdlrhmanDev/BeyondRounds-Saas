import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function subscribeToRoom(matchId: string, onNewMessage: (msg: any) => void) {
  const channel = supabase
    .channel(`room:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => onNewMessage(payload.new)
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}

export async function sendMessage(matchId: string, userId: string, content: string) {
  try {
    console.log('Attempting to send message:', { matchId, userId, content })
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ 
        match_id: matchId, 
        user_id: userId, 
        content,
        message_type: 'user'
      })
      .select(`
        id,
        content,
        message_type,
        created_at,
        user_id,
        profiles(first_name, last_name)
      `)
      .single()
    
    if (error) {
      console.error('Database error:', error)
      throw new Error(`Failed to send message: ${error.message}`)
    }
    
    console.log('Message sent successfully:', data)
    return data
  } catch (error) {
    console.error('Send message error:', error)
    throw error
  }
}

export function subscribeToPresence(
  matchId: string, 
  userId: string, 
  userProfile: { first_name: string, last_name: string },
  onPresenceChange: (presenceState: any) => void,
  onTyping: (payload: { user_id: string, isTyping: boolean, userName: string }) => void
) {
  const channel = supabase.channel(`room:${matchId}`, {
    config: {
      presence: { key: userId },
      broadcast: { self: true },
    },
  })

  // Listen for presence changes (who's online)
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    onPresenceChange(state)
  })

  // Listen for typing indicators
  channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
    onTyping(payload)
  })

  // Subscribe and track presence
  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ 
        user_id: userId, 
        name: `${userProfile.first_name} ${userProfile.last_name}`,
        online_at: new Date().toISOString()
      })
    }
  })

  return {
    channel,
    sendTyping: (isTyping: boolean) => {
      channel.send({ 
        type: 'broadcast', 
        event: 'typing', 
        payload: { 
          user_id: userId, 
          isTyping,
          userName: `${userProfile.first_name} ${userProfile.last_name}`
        } 
      })
    },
    unsubscribe: () => supabase.removeChannel(channel)
  }
}
