import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const ROUNDSBOT_SYSTEM_PROMPT = `You are RoundsBot, a friendly facilitator for small groups of verified doctors in BeyondRounds. Your role is to:

1. Break the ice and encourage conversation
2. Propose meetup times and help coordinate schedules
3. Nudge silent groups to participate
4. Help confirm weekend meetups
5. Be warm, concise, and inclusive

Guidelines:
- Keep responses conversational and friendly
- Ask engaging questions about medical practice, interests, or meetup planning
- Suggest specific activities or conversation topics
- Help coordinate schedules when users discuss availability
- Be encouraging about forming real-world connections
- Use medical humor appropriately
- Keep messages under 200 words
- Don't be overly formal or robotic

Context: This is a private group of 3-4 verified medical professionals who were matched based on specialty, interests, and location.`

interface ChatMessage {
  id: string
  content: string
  message_type: string
  created_at: string
  user_id: string | null
}

export async function POST(request: NextRequest) {
  try {
    const { matchId, recentMessages } = await request.json()

    if (!matchId) {
      return NextResponse.json({ error: "Missing matchId" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get match details and members
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select(`
        id,
        group_name,
        match_week,
        match_members(
          profiles(first_name, specialty, interests)
        )
      `)
      .eq("id", matchId)
      .single()

    if (matchError || !match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    // Check if bot should respond (don't respond to every message)
    const shouldRespond = await decideBotResponse(recentMessages, supabase, matchId)

    if (!shouldRespond) {
      return NextResponse.json({ message: "Bot decided not to respond" })
    }

    // Generate bot response
    const botResponse = await generateBotResponse(match, recentMessages)

    if (!botResponse) {
      return NextResponse.json({ message: "No bot response generated" })
    }

    // Save bot message to database
    const { error: messageError } = await supabase.from("chat_messages").insert({
      match_id: matchId,
      user_id: null, // Bot messages have null user_id
      message_type: "bot",
      content: botResponse,
    })

    if (messageError) {
      console.error("Error saving bot message:", messageError)
      return NextResponse.json({ error: "Failed to save bot message" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Bot response sent",
      response: botResponse,
    })
  } catch (error: any) {
    console.error("Error generating bot response:", error)
    return NextResponse.json(
      {
        error: "Failed to generate bot response",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

async function decideBotResponse(recentMessages: ChatMessage[], supabase: any, matchId: string): Promise<boolean> {
  // Don't respond if there are no recent messages
  if (!recentMessages || recentMessages.length === 0) {
    return false
  }

  // Don't respond if the last message was from the bot
  const lastMessage = recentMessages[recentMessages.length - 1]
  if (lastMessage?.message_type === "bot" || lastMessage?.message_type === "system") {
    return false
  }

  // Get all messages in the last 24 hours
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  const { data: recentBotMessages } = await supabase
    .from("chat_messages")
    .select("created_at")
    .eq("match_id", matchId)
    .in("message_type", ["bot", "system"])
    .gte("created_at", oneDayAgo.toISOString())

  // Don't respond if bot has already sent 3+ messages in the last 24 hours
  if (recentBotMessages && recentBotMessages.length >= 3) {
    return false
  }

  // Respond if:
  // 1. It's been more than 2 hours since last bot message
  // 2. Users are discussing meetup plans
  // 3. There's been 5+ user messages since last bot message

  const userMessages = recentMessages.filter((m) => m.message_type === "user")
  const meetupKeywords = ["meet", "coffee", "lunch", "weekend", "available", "free", "schedule"]
  const hasMeetupDiscussion = recentMessages.some((m) =>
    meetupKeywords.some((keyword) => m.content.toLowerCase().includes(keyword)),
  )

  return userMessages.length >= 3 || hasMeetupDiscussion
}

async function generateBotResponse(match: any, recentMessages: ChatMessage[]): Promise<string | null> {
  try {
    // Simple rule-based responses for now (can be enhanced with AI later)
    const lastMessages = recentMessages
      .slice(-3)
      .map((m) => m.content)
      .join(" ")
    const memberNames = match.match_members.map((m: any) => m.profiles.first_name)

    // Check for meetup-related keywords
    const meetupKeywords = ["meet", "coffee", "lunch", "weekend", "available", "free", "schedule", "time"]
    const hasMeetupTalk = meetupKeywords.some((keyword) => lastMessages.toLowerCase().includes(keyword))

    if (hasMeetupTalk) {
      const meetupResponses = [
        `Great to see you planning to meet up! 📅 For coordinating schedules, I'd suggest sharing your availability for this weekend. Coffee meetups are always popular with our doctor groups!`,

        `Love the meetup energy! ☕ Based on your profiles, you all seem to enjoy similar activities. Weekend coffee or lunch usually works well for busy medical schedules.`,

        `Fantastic! Meeting in person is where the real connections happen. 🤝 Don't forget our 30-day friendship guarantee - we're confident you'll hit it off!`,
      ]
      return meetupResponses[Math.floor(Math.random() * meetupResponses.length)]
    }

    // Check for medical/work discussion
    const medicalKeywords = ["patient", "case", "hospital", "shift", "surgery", "clinic", "rounds"]
    const hasMedicalTalk = medicalKeywords.some((keyword) => lastMessages.toLowerCase().includes(keyword))

    if (hasMedicalTalk) {
      const medicalResponses = [
        `Interesting medical discussion! 🏥 It's great to connect with colleagues who understand the unique challenges we face. Anyone have similar experiences to share?`,

        `The medical insights you're sharing are fascinating! This is exactly why BeyondRounds exists - connecting doctors who can learn from each other's experiences.`,

        `Love hearing about your professional experiences! 👩‍⚕️👨‍⚕️ It's refreshing to talk shop with people who truly get it, isn't it?`,
      ]
      return medicalResponses[Math.floor(Math.random() * medicalResponses.length)]
    }

    // General conversation starters
    const generalResponses = [
      `Hi ${memberNames.join(", ")}! 👋 How's everyone settling into the group? I'd love to help you plan your first meetup - weekend coffee is always a hit!`,

      `Great conversation so far! 💬 Since you're all in the same city, have you thought about meeting up this weekend? I can help coordinate if you'd like!`,

      `Loving the energy in here! ✨ You were matched based on shared interests and specialties - I'm curious what common ground you're discovering?`,

      `Hope everyone's having a good week! 🌟 Remember, the best BeyondRounds connections happen when groups meet in person. Any weekend plans brewing?`,
    ]

    return generalResponses[Math.floor(Math.random() * generalResponses.length)]
  } catch (error) {
    console.error("Error generating bot response:", error)
    return null
  }
}
