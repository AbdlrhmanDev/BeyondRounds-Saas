import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
 
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const { searchParams } = new URL(request.url)
    const chatRoomId = searchParams.get('chatRoomId')
    const userId = searchParams.get('userId')
 
    if (!chatRoomId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Chat room ID and user ID are required' },
        { status: 400 }
      )
    }
 
    console.log(`💬 Fetching messages for chat room: ${chatRoomId}`)

    // Get user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }
 
    // Get chat room info
    const { data: chatRoom, error: chatRoomError } = await supabase
      .from('chat_rooms')
      .select(`
        *,
        matches (
          id,
          group_name,
          group_size
        )
      `)
      .eq('id', chatRoomId)
      .single()
 
    if (chatRoomError) {
      console.error('Error fetching chat room:', chatRoomError)
      return NextResponse.json(
        { success: false, error: 'Chat room not found' },
        { status: 404 }
      )
    }
 
    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('chat_room_id', chatRoomId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
 
    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }
 
    // Get chat room members
    const { data: members, error: membersError } = await supabase
      .from('match_members')
      .select(`
        *,
        profiles!sender_id (
          id,
          first_name,
          last_name,
          medical_specialty,
          city
        )
      `)
      .eq('match_id', chatRoom.match_id)
      .eq('is_active', true)
 
    if (membersError) {
      console.error('Error fetching members:', membersError)
    }
 
    console.log('✅ Chat data fetched successfully')
    console.log('📊 Messages data:', messages?.length || 0, 'messages')
    console.log('👥 Members data:', members?.length || 0, 'members')
    
    // Debug first message
    if (messages && messages.length > 0) {
      console.log('🔍 First message debug:', {
        id: messages[0].id,
        content: messages[0].content,
        sender_id: messages[0].sender_id,
        profiles: messages[0].profiles,
        created_at: messages[0].created_at,
        senderName: messages[0].profiles ? `${messages[0].profiles.first_name || ''} ${messages[0].profiles.last_name || ''}`.trim() : 'Unknown User'
      })
    }
 
    // Debug the mapped messages
    const mappedMessages = messages?.map(msg => ({
      id: msg.id,
      content: msg.content,
      senderId: msg.sender_id,
      senderName: msg.profiles ? `${msg.profiles.first_name || ''} ${msg.profiles.last_name || ''}`.trim() : 'Unknown User',
      senderSpecialty: msg.profiles?.medical_specialty || 'Unknown Specialty',
      createdAt: msg.created_at,
      isEdited: msg.is_edited,
      replyToId: msg.reply_to_id
    })) || []
 
    console.log('🔍 Mapped messages sample:', mappedMessages.slice(0, 2))
 
    return NextResponse.json({
      success: true,
      data: {
        chatRoom: {
          id: chatRoom.id,
          name: chatRoom.name,
          description: chatRoom.description,
          groupSize: chatRoom.matches?.group_size || 3,
          groupName: chatRoom.matches?.group_name || 'Medical Group'
        },
        messages: mappedMessages,
        members: members?.map(member => ({
          id: member.profiles?.id,
          name: member.profiles ? `${member.profiles.first_name || ''} ${member.profiles.last_name || ''}`.trim() : 'Unknown User',
          specialty: member.profiles?.medical_specialty || 'Unknown Specialty',
          city: member.profiles?.city || 'Unknown City',
          joinedAt: member.joined_at,
          compatibility: member.compatibility_score || 0
        })) || []
      }
    })
 
  } catch (error) {
    console.error('Failed to fetch chat data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat data' },
      { status: 500 }
    )
  }
}
 
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const body = await request.json()
    const { chatRoomId, userId, content, replyToId } = body
 
    if (!chatRoomId || !userId || !content) {
      return NextResponse.json(
        { success: false, error: 'Chat room ID, user ID, and content are required' },
        { status: 400 }
      )
    }
 
    console.log(`💬 Sending message to chat room: ${chatRoomId}`)
 
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single()
 
    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }
 
    // Get chat room info to get match_id
    const { data: chatRoom, error: chatRoomError } = await supabase
      .from('chat_rooms')
      .select('match_id')
      .eq('id', chatRoomId)
      .single()
 
    if (chatRoomError) {
      console.error('Error fetching chat room:', chatRoomError)
      return NextResponse.json(
        { success: false, error: 'Chat room not found' },
        { status: 404 }
      )
    }
 
    // Create message
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        chat_room_id: chatRoomId,
        match_id: chatRoom.match_id,
        sender_id: profile.id,
        content: content.trim(),
        reply_to_id: replyToId || null,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single()
 
    if (messageError) {
      console.error('Error creating message:', messageError)
      return NextResponse.json(
        { success: false, error: 'Failed to send message' },
        { status: 500 }
      )
    }
 
    // Update chat room last message time
    await supabase
      .from('chat_rooms')
      .update({
        last_message_at: new Date().toISOString()
      })
      .eq('id', chatRoomId)
 
    console.log('✅ Message sent successfully')
 
    return NextResponse.json({
      success: true,
      data: {
        message: {
          id: message.id,
          content: message.content,
          senderId: message.sender_id,
          senderName: message.profiles?.first_name + ' ' + message.profiles?.last_name,
          senderSpecialty: message.profiles?.medical_specialty,
          createdAt: message.created_at,
          isEdited: message.is_edited,
          replyToId: message.reply_to_id
        }
      }
    })
 
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    )
  }
}