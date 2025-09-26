/**
 * Chat API functions
 * Handles chat rooms, messages, and real-time communication
 */

import { createClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/utils/error'
import type { 
  ChatRoom, 
  ChatMessage, 
  MatchMember,
  Profile 
} from '@/lib/types/database'
import type { 
  MessageRequest, 
  MessageResponse, 
  ChatRoomResponse 
} from '@/lib/types/api'

/**
 * Base API class with common functionality
 */
class BaseAPI {
  protected supabase = createClient()

  protected handleError(error: unknown) {
    return handleSupabaseError(error)
  }
}

/**
 * Chat API class
 */
export class ChatAPI extends BaseAPI {
  /**
   * Get chat room by match ID
   */
  async getChatRoomByMatchId(matchId: string): Promise<ChatRoom | null> {
    try {
      const { data, error } = await this.supabase
        .from('chat_rooms')
        .select('*')
        .eq('match_id', matchId)
        .eq('is_active', true)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }
      
      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Create a new chat room
   */
  async createChatRoom(matchId: string, name: string): Promise<ChatRoom> {
    try {
      const { data, error } = await this.supabase
        .from('chat_rooms')
        .insert({
          match_id: matchId,
          name,
          is_active: true,
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get chat room with messages
   */
  async getChatRoomWithMessages(chatRoomId: string): Promise<ChatRoomResponse | null> {
    try {
      // Get chat room
      const { data: chatRoom, error: roomError } = await this.supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', chatRoomId)
        .single()
      
      if (roomError) {
        if (roomError.code === 'PGRST116') {
          return null
        }
        throw roomError
      }

      // Get messages
      const { data: messages, error: messagesError } = await this.supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!chat_messages_sender_id_fkey(
            id,
            first_name,
            last_name,
            profile_picture_url
          )
        `)
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true })
      
      if (messagesError) throw messagesError

      // Get members
      const { data: members, error: membersError } = await this.supabase
        .from('match_members')
        .select(`
          *,
          profiles!match_members_profile_id_fkey(
            id,
            first_name,
            last_name,
            profile_picture_url
          )
        `)
        .eq('match_id', chatRoom.match_id)
        .eq('is_active', true)
      
      if (membersError) throw membersError

      return {
        id: chatRoom.id,
        name: chatRoom.name,
        matchId: chatRoom.match_id,
        members: members?.map(member => ({
          id: member.profiles.id,
          name: `${member.profiles.first_name} ${member.profiles.last_name}`,
          avatar: member.profiles.profile_picture_url || '',
          isOnline: false, // TODO: Implement online status
        })) || [],
        lastMessage: messages && messages.length > 0 ? {
          id: messages[messages.length - 1].id,
          content: messages[messages.length - 1].content,
          senderId: messages[messages.length - 1].sender_id,
          senderName: `${messages[messages.length - 1].profiles.first_name} ${messages[messages.length - 1].profiles.last_name}`,
          senderAvatar: messages[messages.length - 1].profiles.profile_picture_url || '',
          createdAt: messages[messages.length - 1].created_at,
          isEdited: messages[messages.length - 1].is_edited,
        } : undefined,
        unreadCount: 0, // TODO: Implement unread count
        createdAt: chatRoom.created_at,
        updatedAt: chatRoom.updated_at,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get messages for a chat room
   */
  async getMessages(chatRoomId: string, limit: number = 50, offset: number = 0): Promise<MessageResponse[]> {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!chat_messages_sender_id_fkey(
            id,
            first_name,
            last_name,
            profile_picture_url
          )
        `)
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) throw error

      return (data || []).map(message => ({
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
        senderName: `${message.profiles.first_name} ${message.profiles.last_name}`,
        senderAvatar: message.profiles.profile_picture_url || '',
        createdAt: message.created_at,
        isEdited: message.is_edited,
        replyTo: message.reply_to_id ? {
          id: message.reply_to_id,
          content: '', // TODO: Get reply content
          senderName: '', // TODO: Get reply sender name
        } : undefined,
      })).reverse() // Reverse to get chronological order
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Send a message
   */
  async sendMessage(messageData: MessageRequest): Promise<MessageResponse> {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .insert({
          chat_room_id: messageData.chatRoomId,
          sender_id: messageData.senderId || '', // TODO: Get from auth context
          content: messageData.content,
          reply_to_id: messageData.replyToId,
        })
        .select(`
          *,
          profiles!chat_messages_sender_id_fkey(
            id,
            first_name,
            last_name,
            profile_picture_url
          )
        `)
        .single()
      
      if (error) throw error

      // Update chat room last message timestamp
      await this.supabase
        .from('chat_rooms')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageData.chatRoomId)

      return {
        id: data.id,
        content: data.content,
        senderId: data.sender_id,
        senderName: `${data.profiles.first_name} ${data.profiles.last_name}`,
        senderAvatar: data.profiles.profile_picture_url || '',
        createdAt: data.created_at,
        isEdited: data.is_edited,
        replyTo: data.reply_to_id ? {
          id: data.reply_to_id,
          content: '', // TODO: Get reply content
          senderName: '', // TODO: Get reply sender name
        } : undefined,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Edit a message
   */
  async editMessage(messageId: string, content: string): Promise<MessageResponse> {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .update({
          content,
          is_edited: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId)
        .select(`
          *,
          profiles!chat_messages_sender_id_fkey(
            id,
            first_name,
            last_name,
            profile_picture_url
          )
        `)
        .single()
      
      if (error) throw error

      return {
        id: data.id,
        content: data.content,
        senderId: data.sender_id,
        senderName: `${data.profiles.first_name} ${data.profiles.last_name}`,
        senderAvatar: data.profiles.profile_picture_url || '',
        createdAt: data.created_at,
        isEdited: data.is_edited,
        replyTo: data.reply_to_id ? {
          id: data.reply_to_id,
          content: '', // TODO: Get reply content
          senderName: '', // TODO: Get reply sender name
        } : undefined,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)
      
      if (error) throw error
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get match members for a chat room
   */
  async getMatchMembers(matchId: string): Promise<Array<MatchMember & { profile: Profile }>> {
    try {
      const { data, error } = await this.supabase
        .from('match_members')
        .select(`
          *,
          profiles!match_members_profile_id_fkey(*)
        `)
        .eq('match_id', matchId)
        .eq('is_active', true)
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get user's chat rooms
   */
  async getUserChatRooms(userId: string): Promise<ChatRoomResponse[]> {
    try {
      // Get matches where user is a member
      const { data: matches, error: matchesError } = await this.supabase
        .from('match_members')
        .select(`
          match_id,
          matches!match_members_match_id_fkey(
            id,
            group_name,
            status
          )
        `)
        .eq('profile_id', userId)
        .eq('is_active', true)
      
      if (matchesError) throw matchesError

      if (!matches || matches.length === 0) {
        return []
      }

      const matchIds = matches.map(m => m.match_id)

      // Get chat rooms for these matches
      const { data: chatRooms, error: roomsError } = await this.supabase
        .from('chat_rooms')
        .select('*')
        .in('match_id', matchIds)
        .eq('is_active', true)
        .order('last_message_at', { ascending: false, nullsLast: true })
      
      if (roomsError) throw roomsError

      // Get last messages and member counts for each room
      const chatRoomsWithDetails = await Promise.all(
        (chatRooms || []).map(async (room) => {
          // Get last message
          const { data: lastMessage } = await this.supabase
            .from('chat_messages')
            .select(`
              *,
              profiles!chat_messages_sender_id_fkey(
                first_name,
                last_name
              )
            `)
            .eq('chat_room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Get member count
          const { count: memberCount } = await this.supabase
            .from('match_members')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', room.match_id)
            .eq('is_active', true)

          return {
            id: room.id,
            name: room.name,
            matchId: room.match_id,
            members: [], // TODO: Get actual members
            lastMessage: lastMessage ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.sender_id,
              senderName: `${lastMessage.profiles.first_name} ${lastMessage.profiles.last_name}`,
              senderAvatar: '',
              createdAt: lastMessage.created_at,
              isEdited: lastMessage.is_edited,
            } : undefined,
            unreadCount: 0, // TODO: Implement unread count
            createdAt: room.created_at,
            updatedAt: room.updated_at,
          }
        })
      )

      return chatRoomsWithDetails
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(chatRoomId: string, userId: string): Promise<void> {
    try {
      // TODO: Implement message read tracking
      // This would require a separate table to track read status
      console.log(`Marking messages as read for user ${userId} in room ${chatRoomId}`)
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      // TODO: Implement unread message counting
      // This would require a separate table to track read status
      return 0
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Search messages in a chat room
   */
  async searchMessages(chatRoomId: string, query: string): Promise<MessageResponse[]> {
    try {
      const { data, error } = await this.supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!chat_messages_sender_id_fkey(
            id,
            first_name,
            last_name,
            profile_picture_url
          )
        `)
        .eq('chat_room_id', chatRoomId)
        .ilike('content', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) throw error

      return (data || []).map(message => ({
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
        senderName: `${message.profiles.first_name} ${message.profiles.last_name}`,
        senderAvatar: message.profiles.profile_picture_url || '',
        createdAt: message.created_at,
        isEdited: message.is_edited,
        replyTo: message.reply_to_id ? {
          id: message.reply_to_id,
          content: '', // TODO: Get reply content
          senderName: '', // TODO: Get reply sender name
        } : undefined,
      }))
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

// Export API instance
export const chatAPI = new ChatAPI()
