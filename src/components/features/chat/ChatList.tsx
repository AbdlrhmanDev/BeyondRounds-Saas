// تحديث ChatList.tsx - إزالة جميع Foreign Key joins
// Updated ChatList.tsx - Remove all foreign key joins

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  MessageSquare,
  Users,
  Pin,
  Plus,
  RefreshCw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { createClient } from '@/lib/supabase/client'

interface ChatMember {
  id: string
  name: string
  isOnline: boolean
}

interface ChatPreview {
  id: string
  chatRoomId: string
  matchId: string
  name: string
  lastMessage?: {
    content: string
    timestamp: string
    senderName: string
  }
  members: ChatMember[]
  unreadCount: number
  isPinned: boolean
  memberCount: number
}

interface ChatListProps {
  onChatSelect: (chatRoomId: string, matchId: string) => void
  selectedChatId?: string
  searchQuery?: string
}

export default function ChatList({ onChatSelect, selectedChatId, searchQuery: externalSearchQuery }: ChatListProps) {
  const { user } = useAuthUser()
  const [chats, setChats] = useState<ChatPreview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '')

  const supabase = createClient()

  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery)
    }
  }, [externalSearchQuery])

  useEffect(() => {
    loadChats()
  }, [user])

  const loadChats = async () => {
    if (!user) return

    try {
      setIsLoading(true)

      // Use the new my_profile_id() function from the migration
      const { data: myProfileId, error: profileError } = await supabase
        .rpc('my_profile_id')

      if (profileError) {
        console.error('Error getting profile ID:', profileError)
        return
      }

      if (!myProfileId) {
        console.error('No profile found for user')
        return
      }

      // Get user's matches - using the RLS-optimized approach
      const { data: matchesData, error: matchesError } = await supabase
        .from('match_members')
        .select('match_id, profile_id')
        .eq('profile_id', myProfileId)
        .eq('is_active', true)

      if (matchesError) {
        console.error('Error fetching matches:', matchesError)
        return
      }

      if (!matchesData || matchesData.length === 0) {
        setChats([])
        return
      }

      const matchIds = matchesData.map((match: Record<string, unknown>) => match.match_id as string)

      // Get chat rooms for these matches - NO FOREIGN KEY JOINS
      const { data: chatRoomsData, error: chatRoomsError } = await supabase
        .from('chat_rooms')
        .select('id, match_id, name, created_at')
        .in('match_id', matchIds)

      if (chatRoomsError) {
        console.error('Error fetching chat rooms:', chatRoomsError)
        return
      }

      // Process each chat room
      const chatPreviews: ChatPreview[] = []
      
      for (const chatRoom of chatRoomsData || []) {
        // Get members for this match - NO FOREIGN KEY JOINS
        const { data: membersData, error: membersError } = await supabase
          .from('match_members')
          .select('profile_id')
          .eq('match_id', chatRoom.match_id)
          .eq('is_active', true)

        if (membersError) {
          console.error('Error fetching members:', membersError)
          continue
        }

        // Get profile info for members separately
        const profileIds = membersData?.map((member: Record<string, unknown>) => member.profile_id as string) || []
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, last_active_at')
          .in('id', profileIds)

        const members = profilesData?.map((profile: Record<string, unknown>) => ({
          id: profile.id as string,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
          isOnline: isRecentlyActive((profile.last_active_at as string) || new Date().toISOString())
        })) || []

        // Get the last message for this chat room - NO FOREIGN KEY JOINS
        const { data: lastMessageData } = await supabase
          .from('chat_messages')
          .select('content, created_at, sender_id')
          .eq('chat_room_id', chatRoom.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        let lastMessage = undefined
        if (lastMessageData) {
          // Get sender info separately
          const { data: senderData } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', lastMessageData.sender_id)
            .single()

          lastMessage = {
            content: lastMessageData.content,
            timestamp: lastMessageData.created_at,
            senderName: senderData 
              ? `${senderData.first_name || ''} ${senderData.last_name || ''}`.trim()
              : 'Unknown User'
          }
        }

        // Count unread messages (simplified)
        const { count: unreadCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('chat_room_id', chatRoom.id)
          .neq('sender_id', myProfileId)

        const chatName = members
          .filter((member: ChatMember) => member.id !== myProfileId)
          .map((member: ChatMember) => member.name)
          .join(', ') || 'Group Chat'

        chatPreviews.push({
          id: chatRoom.id,
          chatRoomId: chatRoom.id,
          matchId: chatRoom.match_id,
          name: chatName,
          lastMessage,
          members,
          unreadCount: unreadCount || 0,
          isPinned: false,
          memberCount: members.length
        })
      }

      setChats(chatPreviews)
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshChats = () => {
    loadChats()
  }

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isRecentlyActive = (lastActiveAt: string) => {
    const lastActive = new Date(lastActiveAt)
    const now = new Date()
    const diffInMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60)
    return diffInMinutes < 5
  }

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0)

  return (
    <Card className="h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-300 flex items-center">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mr-3">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            Medical Chats
            {totalUnread > 0 && (
              <Badge variant="outline" className="ml-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 animate-pulse">
                {totalUnread}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshChats}
              disabled={isLoading}
              title="Refresh chats"
              className="hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
          <Input
            placeholder="Search medical chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 focus:border-blue-400 dark:focus:border-blue-500"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-blue-600">Loading chats...</span>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No chats found</p>
                <p className="text-sm">Start a conversation with your medical colleagues!</p>
              </div>
            ) : (
              <AnimatePresence>
                {filteredChats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`p-4 rounded-xl mb-2 cursor-pointer transition-all duration-300 hover:shadow-md ${
                        selectedChatId === chat.id
                          ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-2 border-blue-300 dark:border-blue-700'
                          : 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950 border border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => onChatSelect(chat.chatRoomId, chat.matchId)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12 ring-2 ring-blue-200 dark:ring-blue-800">
                            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold">
                              {chat.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {chat.members.some(member => member.isOnline) && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`font-semibold truncate ${
                              selectedChatId === chat.id 
                                ? 'text-blue-800 dark:text-blue-200' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {chat.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              {chat.isPinned && (
                                <Pin className="w-4 h-4 text-yellow-500" />
                              )}
                              {chat.unreadCount > 0 && (
                                <Badge variant="default" className="bg-red-500 text-white text-xs">
                                  {chat.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <Users className="w-4 h-4" />
                            <span>{chat.memberCount} members</span>
                            <span>•</span>
                            <span>{chat.members.filter(m => m.isOnline).length} online</span>
                          </div>
                          {chat.lastMessage && (
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                <span className="font-medium">{chat.lastMessage.senderName}:</span> {chat.lastMessage.content}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                                {formatDistanceToNow(new Date(chat.lastMessage.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}