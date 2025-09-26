"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Send, 
  Users, 
  MessageCircle, 
  MoreVertical,
  Smile,
  Paperclip,
  Phone,
  Video,
  Wifi,
  WifiOff,
  CheckCheck,
  ChevronDown,
  Heart
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useRealtimeChat } from '@/hooks/features/chat/useRealtimeChat'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  senderSpecialty: string
  createdAt: string
  isEdited: boolean
  replyToId?: string
}

interface ChatRoom {
  id: string
  name: string
  description: string
  groupSize: number
  groupName: string
}

interface Member {
  id: string
  name: string
  specialty: string
  city: string
  joinedAt: string
  compatibility: number
}

interface ChatProps {
  chatRoomId: string
  userId: string
}

export default function ChatComponent({ chatRoomId, userId }: ChatProps) {
  const { messages: realtimeMessages, isConnected, setMessages } = useRealtimeChat(chatRoomId)
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Convert realtime messages to our interface and deduplicate
  const messages: Message[] = realtimeMessages
    .filter((msg, index, self) => 
      // Remove duplicates based on message ID
      index === self.findIndex(m => m.id === msg.id)
    )
    .map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.sender_id,
      senderName: msg.profiles ? `${msg.profiles.first_name || ''} ${msg.profiles.last_name || ''}`.trim() : 'Unknown User',
      senderSpecialty: msg.profiles?.medical_specialty || 'Unknown Specialty',
      createdAt: msg.created_at,
      isEdited: msg.is_edited,
      replyToId: msg.reply_to_id || undefined
    }))

  // Debug: Log the first few messages
  if (messages.length > 0) {
    console.log('🔍 ChatComponent messages sample:', messages.slice(0, 2))
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setShowScrollButton(false)
    }, 100)
  }

const handleScroll = (event:React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollButton(!isNearBottom)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages.length])

  useEffect(() => {
    fetchInitialData()
  }, [chatRoomId])

  const fetchInitialData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/chat?chatRoomId=${chatRoomId}&userId=${userId}`)
      const result = await response.json()

      if (result.success) {
        setChatRoom(result.data.chatRoom)
        setMembers(result.data.members)
        
        // Set initial messages for real-time hook
        const initialMessages = result.data.messages.map((msg: Record<string, unknown>) => ({
          id: msg.id,
          content: msg.content,
          sender_id: msg.sender_id,
          created_at: msg.created_at,
          is_edited: msg.is_edited,
          reply_to_id: msg.reply_to_id,
          profiles: msg.profiles
        }))
        setMessages(initialMessages)
      } else {
        toast.error('Failed to load chat')
      }
    } catch {
      toast.error('Failed to load chat')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    try {
      setIsSending(true)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatRoomId,
          userId,
          content: newMessage.trim()
        })
      })

      const result = await response.json()

      if (result.success) {
        setMessages(prev => [...prev, result.data.message])
        setNewMessage('')
      } else {
        toast.error('Failed to send message')
      }
    } catch {
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Just now'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Just now'
      
      const now = new Date()
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      
      if (diffInMinutes < 1) return 'Just now'
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
      
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return 'Just now'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Today'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Today'
      
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (date.toDateString() === today.toDateString()) {
        return 'Today'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday'
      } else {
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      }
    } catch {
      return 'Today'
    }
  }

  if (isLoading) {
    return (
      <Card className="h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MessageCircle className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading chat...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Chat Messages */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm flex flex-col min-h-0">
              {/* Chat Header */}
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {members.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="w-8 h-8 border-2 border-white">
                          <AvatarFallback className="bg-white text-blue-600 text-xs font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {members.length > 3 && (
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border-2 border-white">
                          <span className="text-xs font-semibold text-white">+{members.length - 3}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-white">{chatRoom?.name}</CardTitle>
                      <p className="text-white/80 text-sm">{chatRoom?.groupName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
                      {isConnected ? (
                        <Wifi className="h-4 w-4 text-green-400" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-red-400" />
                      )}
                      <span className={`text-xs font-medium ${isConnected ? 'text-green-300' : 'text-red-300'}`}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-hidden p-0 relative min-h-0">
                <ScrollArea className="h-full p-4" onScrollCapture={handleScroll}>
                  <div className="space-y-4 pb-4">
                    {messages.map((message, index) => {
                      const showDate = index === 0 || 
                        formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt)
                      const isCurrentUser = message.senderId === userId
                      
                      return (
                        <div key={message.id}>
                          {showDate && (
                            <div className="text-center my-6">
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600 px-3 py-1">
                                {formatDate(message.createdAt)}
                              </Badge>
                            </div>
                          )}
                          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}>
                            <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                              {!isCurrentUser && (
                                <div className="flex items-center gap-2 mb-1">
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                      {message.senderName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium text-gray-700">{message.senderName}</span>
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    {message.senderSpecialty}
                                  </Badge>
                                </div>
                              )}
                              <div
                                className={`p-3 rounded-2xl transition-all duration-200 hover:shadow-md ${
                                  isCurrentUser
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto'
                                    : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                                }`}
                              >
                                <p className="text-sm leading-relaxed">{message.content}</p>
                                <div className={`flex items-center justify-between mt-2 ${isCurrentUser ? 'text-white/70' : 'text-gray-500'}`}>
                                  <span className="text-xs">{formatTime(message.createdAt)}</span>
                                  {isCurrentUser && (
                                    <div className="flex items-center gap-1">
                                      <CheckCheck className="w-3 h-3" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Scroll to Bottom Button */}
                {showScrollButton && (
                  <Button
                    onClick={scrollToBottom}
                    className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-10"
                    size="sm"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isSending}
                    className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-full"
                  />
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim() || isSending}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full px-4"
                  >
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Members Sidebar */}
          <div className="lg:col-span-1 flex flex-col min-h-0">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm flex flex-col h-full min-h-0">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Members
                  </CardTitle>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {members.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-3">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
                          <p className="text-xs text-blue-600 font-medium">{member.specialty}</p>
                          <p className="text-xs text-gray-500">{member.city}</p>
                        </div>
                        {member.compatibility && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {member.compatibility}%
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">BeyondRounds</h3>
                <p className="text-gray-400 text-sm">Where doctors become verified medical professionals</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <h4 className="font-semibold mb-2">Get In Touch</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <p>hello@beyondrounds.com</p>
                <p>privacy@beyondrounds.com</p>
                <p>support@beyondrounds.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-sm text-gray-400">
            © 2024 BeyondRounds. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
