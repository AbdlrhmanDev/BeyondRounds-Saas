"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  Users, 
  MessageCircle, 
  Reply,
  Smile,
  Paperclip,
  Phone,
  Video,
  Wifi,
  WifiOff,
  ArrowLeft,
  Search,
  Settings,
  CheckCheck,
  Star,
  Heart,
  ThumbsUp,
  Calendar,
  Zap,
  Image as ImageIcon,
  ChevronDown
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
  reactions?: { emoji: string; count: number; users: string[] }[]
}

interface ChatRoom {
  id: string
  name: string
  description: string
  groupSize: number
  groupName: string
  isActive?: boolean
  lastActivity?: string
}

interface Member {
  id: string
  name: string
  specialty: string
  city: string
  joinedAt: string
  compatibility: number
  isOnline?: boolean
  lastSeen?: string
}

interface ChatProps {
  chatRoomId: string
  userId: string
  onNavigate?: (page: string) => void
}

export default function ModernChatComponent({ chatRoomId, userId, onNavigate }: ChatProps) {
  const { messages: realtimeMessages, isConnected, setMessages } = useRealtimeChat(chatRoomId)
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showMembers, setShowMembers] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Convert realtime messages to our interface and deduplicate
  const messages: Message[] = realtimeMessages
    .filter((msg, index, self) => 
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
      replyToId: msg.reply_to_id || undefined,
      reactions: []
    }))

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setShowScrollButton(false)
    }, 100)
  }

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
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
    } catch (error) {
      console.error('Error fetching chat data:', error)
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
        setIsTyping(false)
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
    } else if (isTyping && !e.target.value.trim()) {
      setIsTyping(false)
    }
  }

  const formatTime = (dateString: string) => {
    if (!dateString) return 'Invalid Time'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Time'
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } catch {
      return 'Invalid Time'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      
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
      return 'Invalid Date'
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center h-screen">
          <Card className="w-96 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Chat</h3>
              <p className="text-gray-600">Connecting you to your group...</p>
              <div className="mt-4 flex justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              {onNavigate && (
                <Button
                  variant="ghost"
                  onClick={() => onNavigate('dashboard')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{chatRoom?.name}</h1>
                  <p className="text-sm text-gray-600">{chatRoom?.groupName}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {members.length} Members
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Chat Messages */}
          <div className={`${showMembers ? 'lg:col-span-3' : 'lg:col-span-4'} flex flex-col min-h-0`}>
            <Card className="h-full border-0 shadow-xl bg-white/80 backdrop-blur-sm flex flex-col min-h-0">
              {/* Chat Header */}
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {members.slice(0, 3).map((member, _idx) => (
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
                      <p className="text-white/80 text-sm">{chatRoom?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white hover:bg-white/20"
                      onClick={() => setShowMembers(!showMembers)}
                    >
                      <Users className="w-4 h-4" />
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
                              {!isCurrentUser && (
                                <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <ThumbsUp className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Heart className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <Reply className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl p-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
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
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <Input
                    ref={inputRef}
                    value={newMessage}
                    onChange={handleInputChange}
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
          {showMembers && (
            <div className="lg:col-span-1 flex flex-col min-h-0">
              <div className="space-y-4 flex flex-col h-full">
                {/* Members Card */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
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
                  <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                    {/* Search */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search members..."
                          className="pl-10 border-gray-300 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    {/* Members List */}
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-3">
                        {filteredMembers.map((member) => (
                          <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {member.isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                            </div>
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

                {/* Quick Actions */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start hover:bg-blue-50 hover:border-blue-300">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                      Schedule Meetup
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start hover:bg-green-50 hover:border-green-300">
                      <Users className="w-4 h-4 mr-2 text-green-600" />
                      Group Settings
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start hover:bg-purple-50 hover:border-purple-300">
                      <Star className="w-4 h-4 mr-2 text-purple-600" />
                      Star Group
                    </Button>
                    <Separator />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start hover:bg-red-50 hover:border-red-300 text-red-600"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Leave Group
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
