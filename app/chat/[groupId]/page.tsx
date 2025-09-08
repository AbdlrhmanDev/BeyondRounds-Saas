"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, Send, Users, Bot, ArrowLeft, MoreVertical } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

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
  const [match, setMatch] = useState<MatchDetails | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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

        // Load existing messages
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
        } else {
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

  // Set up real-time subscription
  useEffect(() => {
    if (!match) return

    const channel = supabase
      .channel(`chat:${params.groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `match_id=eq.${params.groupId}`,
        },
        async (payload) => {
          // Get user profile for the new message
          const messageWithProfile = payload.new as ChatMessage

          if (payload.new.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("first_name, last_name")
              .eq("id", payload.new.user_id)
              .single()

            if (profile) {
              messageWithProfile.profiles = profile
            }
          }

          setMessages((prev) => [...prev, messageWithProfile])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [match, params.groupId, supabase])

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || isSending) return

    setIsSending(true)
    try {
      const { error } = await supabase.from("chat_messages").insert({
        match_id: params.groupId,
        user_id: user.id,
        message_type: "user",
        content: newMessage.trim(),
      })

      if (error) throw error

      setNewMessage("")

      // Trigger AI bot response after a short delay
      setTimeout(() => {
        triggerBotResponse()
      }, 2000)
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message")
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">{match?.group_name}</h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {match?.match_members.length} members
              </p>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </header>

      {/* Members Bar */}
      <div className="bg-white border-b px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          {match?.match_members.map((member) => (
            <div
              key={member.user_id}
              className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1 whitespace-nowrap"
            >
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">
                  {getInitials(`${member.profiles.first_name} ${member.profiles.last_name}`)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700">{member.profiles.first_name}</span>
              <Badge variant="secondary" className="text-xs">
                {member.profiles.specialty}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => {
            const isBot = message.message_type === "system" || message.message_type === "bot"
            const isCurrentUser = message.user_id === user?.id
            const senderName = getMessageSender(message)

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isCurrentUser && !isBot ? "justify-end" : "justify-start"}`}
              >
                {!isCurrentUser && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={isBot ? "bg-blue-100 text-blue-600" : "bg-gray-100"}>
                      {isBot ? <Bot className="w-4 h-4" /> : getInitials(senderName)[0]}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-xs lg:max-w-md ${isCurrentUser && !isBot ? "order-first" : ""}`}>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isBot
                        ? "bg-blue-50 border border-blue-200"
                        : isCurrentUser
                          ? "bg-blue-600 text-white"
                          : "bg-white border"
                    }`}
                  >
                    {!isCurrentUser && (
                      <p className={`text-xs font-medium mb-1 ${isBot ? "text-blue-600" : "text-gray-600"}`}>
                        {senderName}
                      </p>
                    )}
                    <p
                      className={`text-sm whitespace-pre-wrap ${
                        isBot ? "text-gray-700" : isCurrentUser ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {message.content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 px-1">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </p>
                </div>

                {isCurrentUser && !isBot && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-600">{getInitials(senderName)[0]}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim() || isSending} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
