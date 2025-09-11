"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, Send, Users, Bot, ArrowLeft, MoreVertical, Smile, Paperclip, Mic, RefreshCw } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { subscribeToRoom, sendMessage as sendChatMessage, subscribeToPresence } from "@/lib/supabase/chat-utils"
import { sendSimpleMessage, getUserProfile, testConnection } from "@/lib/supabase/simple-chat"

interface ChatMessage {
  id: string
  content: string
  message_type: "user" | "system" | "bot"
  created_at: string
  user_id: string | null
  profiles?: {
    first_name: string
    last_name: string
  }
}

interface MatchMember {
  user_id: string
  profiles: {
    id: string
    first_name: string
    last_name: string
    specialty: string
  }
}

interface MatchDetails {
  id: string
  group_name: string
  status: string
  match_week: string
  match_members: MatchMember[]
}

export default function ChatPage({ params }: { params: { groupId: string } }) {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [match, setMatch] = useState<MatchDetails | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: string }>({})
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const presenceRef = useRef<any>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Function to refresh messages from database
  const refreshMessages = async () => {
    if (!params.groupId) return
    
    try {
      console.log("Refreshing messages...")
      const { data: messagesData, error: messagesError } = await supabase
        .from("chat_messages")
        .select(`
          id,
          content,
          message_type,
          created_at,
          user_id,
          profiles(first_name, last_name)
        `)
        .eq("match_id", params.groupId)
        .order("created_at", { ascending: true })

      if (messagesError) {
        console.error("Error refreshing messages:", messagesError)
      } else {
        console.log("Refreshed messages:", messagesData?.length || 0)
        setMessages(messagesData || [])
      }
    } catch (error) {
      console.error("Error refreshing messages:", error)
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push("/auth/login")
          return
        }
        setUser(user)

        // Get user profile for proper name display
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", user.id)
          .single()

        if (profileData) {
          setUserProfile(profileData)
        }

        // Get match details and verify user is a member
        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .select(`
            id,
            group_name,
            status,
            match_week,
            match_members!inner(
              user_id,
              profiles!inner(
                id,
                first_name,
                last_name,
                specialty
              )
            )
          `)
          .eq("id", params.groupId)
          .single()

        if (matchError || !matchData) {
          setError("Match not found")
          setIsLoading(false)
          return
        }

        // Check if user is a member of this match
        const isMember = matchData.match_members.some((member: MatchMember) => member.user_id === user.id)

        if (!isMember) {
          setError("You are not a member of this group")
          setIsLoading(false)
          return
        }

        setMatch(matchData)

        // Load existing messages with enhanced error handling
        console.log("Loading messages for group:", params.groupId)
        const { data: messagesData, error: messagesError } = await supabase
          .from("chat_messages")
          .select(`
            id,
            content,
            message_type,
            created_at,
            user_id,
            profiles(first_name, last_name)
          `)
          .eq("match_id", params.groupId)
          .order("created_at", { ascending: true })

        if (messagesError) {
          console.error("Error loading messages:", messagesError)
          // Try alternative loading method without profile join
          const { data: simpleMessages, error: simpleError } = await supabase
            .from("chat_messages")
            .select("id, content, message_type, created_at, user_id")
            .eq("match_id", params.groupId)
            .order("created_at", { ascending: true })
          
          if (simpleError) {
            console.error("Simple message loading also failed:", simpleError)
            setMessages([])
          } else {
            console.log("Loaded messages without profiles:", simpleMessages?.length || 0)
            // Load profiles separately for each message
            const messagesWithProfiles = await Promise.all(
              (simpleMessages || []).map(async (msg) => {
                if (msg.user_id) {
                  const { data: profile } = await supabase
                    .from("profiles")
                    .select("first_name, last_name")
                    .eq("id", msg.user_id)
                    .single()
                  return { ...msg, profiles: profile }
                }
                return msg
              })
            )
            setMessages(messagesWithProfiles)
          }
        } else {
          console.log("Successfully loaded messages:", messagesData?.length || 0)
          setMessages(messagesData || [])
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing chat:", error)
        setError("Failed to load chat")
        setIsLoading(false)
      }
    }

    initializeChat()
  }, [params.groupId, router, supabase])

  // Set up real-time subscription with presence
  useEffect(() => {
    if (!match || !user || !userProfile) return

    // Subscribe to messages
    const unsubscribeMessages = subscribeToRoom(params.groupId, async (newMessage) => {
      // Get user profile for the new message if not included
      let messageWithProfile = newMessage as ChatMessage

      if (newMessage.user_id && !messageWithProfile.profiles) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", newMessage.user_id)
          .single()

        if (profile) {
          messageWithProfile.profiles = profile
        }
      }

      // Avoid duplicate messages
      setMessages((prev) => {
        const messageExists = prev.some(msg => msg.id === messageWithProfile.id)
        if (messageExists) {
          return prev
        }
        return [...prev, messageWithProfile]
      })
    })

    // Subscribe to presence and typing
    const presenceSubscription = subscribeToPresence(
      params.groupId,
      user.id,
      userProfile,
      (presenceState) => {
        // Convert presence state to array of online users
        const users = Object.values(presenceState).flat()
        setOnlineUsers(users)
      },
      (payload) => {
        // Handle typing indicators
        if (payload.user_id !== user.id) {
          setTypingUsers(prev => {
            const newState = { ...prev }
            if (payload.isTyping) {
              newState[payload.user_id] = payload.userName
            } else {
              delete newState[payload.user_id]
            }
            return newState
          })

          // Auto-clear typing after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => {
              const newState = { ...prev }
              delete newState[payload.user_id]
              return newState
            })
          }, 3000)
        }
      }
    )

    presenceRef.current = presenceSubscription

    return () => {
      unsubscribeMessages()
      presenceSubscription.unsubscribe()
    }
  }, [match, user, userProfile, params.groupId, supabase])

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return

    setIsSending(true)
    const messageContent = newMessage.trim()
    const tempId = `temp-${Date.now()}-${Math.random()}`

    // Stop typing indicator
    if (presenceRef.current) {
      presenceRef.current.sendTyping(false)
    }
    setIsTyping(false)

    // Create temporary message to show immediately
    const tempMessage: ChatMessage = {
      id: tempId,
      content: messageContent,
      message_type: "user",
      created_at: new Date().toISOString(),
      user_id: user.id,
      profiles: {
        first_name: userProfile?.first_name || "You",
        last_name: userProfile?.last_name || ""
      }
    }

    // Add message to UI immediately for instant feedback
    setMessages(prev => [...prev, tempMessage])
    setNewMessage("")

    try {
      // Use the simple message sending approach
      const messageData = await sendSimpleMessage(params.groupId, user.id, messageContent)
      const profileData = await getUserProfile(user.id)
      
      const data = {
        ...messageData,
        profiles: profileData
      }

      // Replace temporary message with the real one from database
      if (data) {
        setMessages(prev => prev.map(msg => 
          msg.id === tempId ? data : msg
        ))
      }

      // Trigger AI bot response after a short delay
      setTimeout(() => {
        triggerBotResponse()
      }, 2000)
    } catch (error) {
      console.error("Error sending message:", error)
      
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
      
      // Restore message content for retry
      setNewMessage(messageContent)
      
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : "Failed to send message. Please try again."
      alert(errorMessage)
    } finally {
      setIsSending(false)
    }
  }

  const triggerBotResponse = async () => {
    try {
      await fetch("/api/chat/bot-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId: params.groupId,
          recentMessages: messages.slice(-5), // Send last 5 messages for context
        }),
      })
    } catch (error) {
      console.error("Error triggering bot response:", error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)

    // Handle typing indicators
    if (presenceRef.current) {
      if (value.trim() && !isTyping) {
        setIsTyping(true)
        presenceRef.current.sendTyping(true)
      } else if (!value.trim() && isTyping) {
        setIsTyping(false)
        presenceRef.current.sendTyping(false)
      }

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set new timeout to stop typing indicator
      if (value.trim()) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false)
          if (presenceRef.current) {
            presenceRef.current.sendTyping(false)
          }
        }, 1500) // Stop typing after 1.5 seconds of inactivity
      }
    }
  }

  const getMessageSender = (message: ChatMessage) => {
    if (message.message_type === "system" || message.message_type === "bot") {
      return "RoundsBot"
    }
    if (message.profiles) {
      return `${message.profiles.first_name} ${message.profiles.last_name}`
    }
    return "Unknown User"
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{match?.group_name || "Group"}</h1>
              <p className="text-sm text-gray-500">
                {match?.match_members.length} members • {onlineUsers.length} online • {messages.length} messages
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={refreshMessages}
            title="Refresh messages"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-6 py-4">
          <div className="space-y-6 max-w-4xl">
            {messages.map((message, index) => {
              const isBot = message.message_type === "system" || message.message_type === "bot"
              const isCurrentUser = message.user_id === user?.id
              const senderName = getMessageSender(message)
              const prevMessage = index > 0 ? messages[index - 1] : null
              const isFirstInGroup = !prevMessage || prevMessage.user_id !== message.user_id
              const showAvatar = isFirstInGroup && !isCurrentUser

                  const isOnline = onlineUsers.some(u => u.user_id === message.user_id)

                  return (
                    <div key={message.id} className="flex gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 flex-shrink-0 relative">
                        {showAvatar ? (
                          <>
                            <Avatar className="w-10 h-10">
                              <AvatarFallback 
                                className={`${
                                  isBot 
                                    ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white" 
                                    : "bg-gradient-to-br from-gray-400 to-gray-600 text-white"
                                } text-sm font-medium`}
                              >
                                {isBot ? <Bot className="w-5 h-5" /> : getInitials(senderName)}
                              </AvatarFallback>
                            </Avatar>
                            {/* Online status indicator */}
                            {!isBot && isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </>
                        ) : !isCurrentUser ? (
                          <div className="w-10 h-10" />
                        ) : null}
                      </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    {isFirstInGroup && !isCurrentUser && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">{senderName}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                    
                    <div className={`${isCurrentUser ? "flex justify-end" : ""}`}>
                      <div
                        className={`inline-block rounded-2xl px-4 py-2 max-w-lg ${
                          isBot
                            ? "bg-blue-50 border border-blue-200 text-gray-800"
                            : isCurrentUser
                              ? "bg-blue-500 text-white"
                              : "bg-white border border-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>

                    {isCurrentUser && isFirstInGroup && (
                      <div className="flex justify-end mt-1">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* Typing Indicators */}
            {Object.keys(typingUsers).length > 0 && (
              <div className="flex gap-3 opacity-70">
                <div className="w-10 h-10 flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-xs">
                    <p className="text-sm text-gray-600">
                      {Object.values(typingUsers).join(", ")} {Object.keys(typingUsers).length === 1 ? "is" : "are"} typing...
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t px-6 py-4">
        <div className="flex items-end gap-3 max-w-4xl">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="pr-24 py-3 rounded-full border-gray-300 focus:border-blue-500"
                  disabled={isSending}
                />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Paperclip className="w-4 h-4 text-gray-400" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Smile className="w-4 h-4 text-gray-400" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Mic className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || isSending}
            className="rounded-full w-10 h-10 p-0 bg-blue-500 hover:bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
