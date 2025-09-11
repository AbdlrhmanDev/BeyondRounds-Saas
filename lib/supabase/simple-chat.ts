import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Simple message sending without complex joins
export async function sendSimpleMessage(matchId: string, userId: string, content: string) {
  try {
    console.log('Sending simple message:', { matchId, userId, content })
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        match_id: matchId,
        user_id: userId,
        content: content.trim(),
        message_type: 'user'
      })
      .select('id, content, message_type, created_at, user_id')
      .single()
    
    if (error) {
      console.error('Insert error:', error)
      throw new Error(`Database error: ${error.message}`)
    }
    
    console.log('Message inserted:', data)
    return data
  } catch (error) {
    console.error('Send simple message error:', error)
    throw error
  }
}

// Get user profile separately
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.warn('Could not get profile:', error)
    return { first_name: 'Unknown', last_name: 'User' }
  }
  
  return data
}

// Test basic connection
export async function testConnection() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    console.log('Connection test - User:', user?.id)
    return { success: true, userId: user?.id }
  } catch (error) {
    console.error('Connection test failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

