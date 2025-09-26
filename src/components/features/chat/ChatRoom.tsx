// تحديث ChatRoom.tsx - إزالة جميع Foreign Key joins
// Updated ChatRoom.tsx - Remove all foreign key joins

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Send,
  Smile,
  Paperclip,
  Phone,
  Video,
  Info,
  Loader2,
  ArrowLeft,
  Stethoscope
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format, isToday, isYesterday } from 'date-fns'
import { useSendMessage } from '@/hooks/features/profile/useProfileQueries'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  is_edited?: boolean
  sender?: {
    name: string
    avatar?: string
    specialty?: string
  }
}

interface ChatMember {
  id: string
  name: string
  avatar?: string
  specialty?: string
  is_online?: boolean
  last_seen?: string
}

interface ChatRoomProps {
  chatRoomId: string
  matchId: string
  onClose?: () => void
  onNavigate?: (page: string) => void
  notificationsEnabled?: boolean
  soundEnabled?: boolean
}

export default function ChatRoom({ 
  chatRoomId, 
  matchId, 
  onClose, 
  onNavigate,
  notificationsEnabled: _notificationsEnabled = true, 
  soundEnabled: _soundEnabled = true 
}: ChatRoomProps) {
  // Validation
  if (!matchId || !chatRoomId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️ Error</div>
          <div className="text-gray-600">Missing required parameters</div>
        </div>
      </div>
    )
  }

  const { user } = useAuthUser()
  const { sendMessage: sendMessageHook } = useSendMessage()
  const [messages, setMessages] = useState<Message[]>([])
  const [members, setMembers] = useState<ChatMember[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [chatInfo, setChatInfo] = useState<{ name: string; description?: string } | null>(null)
  const [profilesCache, setProfilesCache] = useState<Map<string, Record<string, unknown>>>(new Map())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Cache profiles to avoid repeated queries
  const getProfileInfo = async (profileId: string) => {
    if (profilesCache.has(profileId)) {
      return profilesCache.get(profileId)
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, medical_specialty, last_active_at')
        .eq('id', profileId)
        .single()

      if (data) {
        const profile = {
          id: data.id,
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          specialty: data.medical_specialty,
          last_active_at: data.last_active_at
        }
        setProfilesCache(prev => new Map(prev.set(profileId, profile)))
        return profile
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
    
    return null
  }

  // Load initial data
  useEffect(() => {
    if (!chatRoomId || !user) return

    const loadChatData = async () => {
      try {
        setIsLoading(true)

        // Use the new my_profile_id() function from the migration
        const { data: myProfileId, error: profileError } = await supabase
          .rpc('my_profile_id')

        if (profileError || !myProfileId) {
          console.error('Error getting profile ID:', profileError)
          return
        }

        // Get chat room info
        const { data: chatRoomData, error: chatRoomError } = await supabase
          .from('chat_rooms')
          .select('id, match_id, name, description')
          .eq('id', chatRoomId)
          .single()

        if (chatRoomError) {
          console.error('Error fetching chat room:', chatRoomError)
          setChatInfo({
            name: `Group ${chatRoomId.slice(0, 8)}`,
            description: 'Medical Group Chat'
          })
        } else {
          setChatInfo({
            name: chatRoomData.name || `Group Chat`,
            description: chatRoomData.description || 'Medical Group Chat'
          })
        }

        // Load messages - NO FOREIGN KEY JOINS
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('id, content, sender_id, created_at, is_edited')
          .eq('chat_room_id', chatRoomId)
          .order('created_at', { ascending: true })

        if (messagesError) {
          console.error('Error loading messages:', messagesError)
          setMessages([])
        } else {
          // Load sender info for each message
          const uniqueSenderIds = [...new Set(messagesData.map((msg: Record<string, unknown>) => msg.sender_id as string))]
          const senderProfiles = new Map()

          // Batch load all sender profiles
          for (const senderId of uniqueSenderIds) {
            const profile = await getProfileInfo(senderId)
            if (profile) {
              senderProfiles.set(senderId, profile)
            }
          }

          const formattedMessages: Message[] = messagesData.map((msg: Record<string, unknown>) => ({
            id: msg.id as string,
            content: msg.content as string,
            sender_id: msg.sender_id as string,
            created_at: msg.created_at as string,
            is_edited: msg.is_edited as boolean | undefined,
            sender: senderProfiles.get(msg.sender_id) || {
              name: 'Unknown User',
              specialty: 'Unknown'
            }
          }))

          setMessages(formattedMessages)
        }

        // Load members - NO FOREIGN KEY JOINS
        const { data: membersData, error: membersError } = await supabase
          .from('match_members')
          .select('profile_id')
          .eq('match_id', matchId)
          .eq('is_active', true)

        if (membersError) {
          console.error('Error fetching members:', membersError)
        } else {
          // Get profile info for all members
          const memberProfiles: ChatMember[] = []
          for (const member of membersData) {
            const profile = await getProfileInfo(member.profile_id)
            if (profile) {
              memberProfiles.push({
                id: profile.id as string,
                name: profile.name as string,
                specialty: profile.specialty as string | undefined,
                is_online: isRecentlyActive(profile.last_active_at as string)
              })
            }
          }
          setMembers(memberProfiles)
        }

      } catch (error) {
        console.error('Error loading chat data:', error)
        toast.error('Failed to load chat')
      } finally {
        setIsLoading(false)
      }
    }

    loadChatData()
  }, [chatRoomId, matchId, user])

  // Real-time subscriptions with fallback
  useEffect(() => {
    if (!chatRoomId) return

    let subscription: unknown = null
    let pollingInterval: ReturnType<typeof setInterval> | null = null

    // Polling fallback
    const startPolling = () => {
      pollingInterval = setInterval(async () => {
        try {
          const { data: newMessages } = await supabase
            .from('chat_messages')
            .select('id, content, sender_id, created_at, is_edited')
            .eq('chat_room_id', chatRoomId)
            .order('created_at', { ascending: true })

          if (newMessages && newMessages.length > messages.length) {
            const newerMessages = newMessages.slice(messages.length)
            
            // Get sender info for new messages
            for (const msg of newerMessages) {
              const profile = await getProfileInfo(msg.sender_id as string)
              ;(msg as Record<string, unknown>).sender = profile || { name: 'Unknown User', specialty: 'Unknown' }
            }

            setMessages(prev => [...prev, ...newerMessages])
            scrollToBottom()
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }, 3000)
    }

    // Try real-time subscription
    try {
      subscription = supabase
        .channel(`chat_messages:${chatRoomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `chat_room_id=eq.${chatRoomId}`
          },
          async (payload: Record<string, unknown>) => {
            const newMessage = payload.new as Record<string, unknown>
            
            // Get sender info
            const profile = await getProfileInfo(newMessage.sender_id as string)
            ;(newMessage as Record<string, unknown>).sender = profile || { name: 'Unknown User', specialty: 'Unknown' }

            const formattedNewMessage: Message = {
              id: newMessage.id as string,
              content: newMessage.content as string,
              sender_id: newMessage.sender_id as string,
              created_at: newMessage.created_at as string,
              is_edited: newMessage.is_edited as boolean | undefined,
              sender: newMessage.sender as { name: string; specialty?: string }
            }
            
            setMessages(prev => [...prev, formattedNewMessage])
            scrollToBottom()

            if (newMessage.sender_id !== user?.id) {
              const sender = newMessage.sender as { name: string }
              toast(`New message from ${sender.name}`)
            }
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Real-time active')
            if (pollingInterval) {
              clearInterval(pollingInterval)
              pollingInterval = null
            }
          } else {
            console.log('❌ Real-time failed, using polling')
            startPolling()
          }
        })
    } catch {
      console.log('Using polling fallback')
      startPolling()
    }

    return () => {
      if (subscription && typeof subscription === 'object' && subscription !== null && 'unsubscribe' in subscription) {
        (subscription as { unsubscribe: () => void }).unsubscribe()
      }
      if (pollingInterval) clearInterval(pollingInterval)
    }
  }, [chatRoomId, user, messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const isRecentlyActive = (lastActive: string) => {
    const now = new Date()
    const lastActiveDate = new Date(lastActive)
    const diffInMinutes = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60)
    return diffInMinutes < 5
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || isSending) return

    setIsSending(true)

    try {
      // Use the recommended pattern with the hook
      await sendMessageHook(chatRoomId, matchId, newMessage.trim())
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    if (isToday(date)) {
      return format(date, 'HH:mm')
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`
    } else {
      return format(date, 'MMM dd, HH:mm')
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {}

    messages.forEach((message) => {
      const date = new Date(message.created_at)
      let dateKey: string

      if (isToday(date)) {
        dateKey = 'Today'
      } else if (isYesterday(date)) {
        dateKey = 'Yesterday'
      } else {
        dateKey = format(date, 'MMMM dd, yyyy')
      }

      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(message)
    })

    return groups
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-300">Loading chat...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-b border-blue-200 dark:border-blue-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => onNavigate ? onNavigate('dashboard') : onClose?.()}
                className="text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-blue-800 dark:text-blue-200">
                  {chatInfo?.name || 'Loading...'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              {/* Chat Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                {Object.entries(groupedMessages).map(([dateKey, dayMessages]) => (
                  <div key={dateKey}>
                    <div className="flex items-center my-6">
                      <Separator className="flex-1" />
                      <Badge variant="outline" className="mx-4 text-xs">
                        {dateKey}
                      </Badge>
                      <Separator className="flex-1" />
                    </div>

                    <div className="space-y-4">
                      {dayMessages.map((message, _index) => {
                        const isCurrentUser = message.sender_id === user?.id
                        
                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className="max-w-xs lg:max-w-md">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-xs text-gray-500 font-medium">
                                  {isCurrentUser ? 'You' : message.sender?.name} • {formatMessageTime(message.created_at)}
                                </p>
                              </div>
                              <div
                                className={`p-4 rounded-2xl ${
                                  isCurrentUser
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border'
                                }`}
                              >
                                <p className="text-sm leading-relaxed">{message.content}</p>
                                {message.is_edited && (
                                  <p className="text-xs opacity-70 mt-1 italic">edited</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-6">
                <form onSubmit={sendMessage} className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" type="button">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Share your medical insights..."
                    className="flex-1"
                    disabled={isSending}
                  />
                  <Button variant="ghost" size="sm" type="button">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-700">Group Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-600 text-white text-xs">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.specialty}</p>
                    </div>
                    {member.is_online && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}