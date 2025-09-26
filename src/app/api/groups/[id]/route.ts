import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseServiceClient()
    const groupId = params.id

    console.log(`📊 Group API called with groupId: ${groupId}`)

    // Get the current user from the request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      console.error('No authorization header found')
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Extract user ID from the authorization header or use a different approach
    // For now, let's get the user ID from the request URL or use a service client approach
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      console.error('User ID not provided')
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user profile using service client
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, role')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get group/match data
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select(`
        id,
        group_name,
        group_size,
        average_compatibility,
        algorithm_version,
        status,
        last_activity_at,
        created_at,
        match_members (
          id,
          profile_id,
          compatibility_score,
          compatibility_factors,
          joined_at,
          is_active,
          profiles (
            id,
            first_name,
            last_name,
            medical_specialty,
            city,
            last_active_at
          )
        )
      `)
      .eq('id', groupId)
      .single()

    if (matchError || !match) {
      console.error('Match not found:', matchError)
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      )
    }

    // Get chat room for this match
    const { data: chatRoom } = await supabase
      .from('chat_rooms')
      .select(`
        id,
        name,
        description,
        is_active,
        is_archived,
        message_count,
        last_message_at,
        created_at
      `)
      .eq('match_id', groupId)
      .single()

    // Get recent messages
    let recentMessages: any[] = []
    if (chatRoom) {
      const { data: messages } = await supabase
        .from('chat_messages')
        .select(`
          id,
          sender_id,
          content,
          created_at,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('chat_room_id', chatRoom.id)
        .is('deleted_at', null)
        .eq('is_flagged', false)
        .order('created_at', { ascending: false })
        .limit(10)

      recentMessages = messages || []
    }

    // Check if current user is a member
    const isMember = match.match_members?.some((member: any) => 
      member.profile_id === profile.id && member.is_active
    ) || false

    // Prepare group data
    const groupData = {
      id: match.id,
      name: match.group_name,
      description: chatRoom?.description || `A group of ${match.group_size} medical professionals matched based on compatibility.`,
      members: match.match_members?.filter((m: any) => m.is_active).length || 0,
      specialty: (match.match_members as any)?.[0]?.profiles?.medical_specialty || 'Mixed Specialties',
      location: (match.match_members as any)?.[0]?.profiles?.city || 'Various Locations',
      lastMessage: recentMessages[0]?.content || 'No recent messages',
      lastMessageTime: recentMessages[0]?.created_at || match.last_activity_at,
      unreadCount: 0, // TODO: Calculate actual unread count
      avatar: match.group_name?.substring(0, 2).toUpperCase() || 'GR',
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      isMember,
      compatibility: match.average_compatibility,
      status: match.status,
      created_at: match.created_at,
      last_activity_at: match.last_activity_at
    }

    // Prepare members data
    const membersData = (match.match_members as any)
      ?.filter((member: any) => member.is_active)
      ?.map((member: any) => ({
        id: member.profile_id,
        name: `${member.profiles?.first_name || ''} ${member.profiles?.last_name || ''}`.trim() || 'Anonymous',
        specialty: member.profiles?.medical_specialty || 'Unknown',
        avatar: `${member.profiles?.first_name?.[0] || ''}${member.profiles?.last_name?.[0] || ''}`.toUpperCase() || '??',
        online: member.profiles?.last_active_at ? 
          new Date(member.profiles.last_active_at) > new Date(Date.now() - 5 * 60 * 1000) : false,
        compatibility: member.compatibility_score,
        joinedAt: member.joined_at
      })) || []

    // Prepare recent messages data
    const messagesData = recentMessages.map((msg: any) => ({
      id: msg.id,
      sender: `${msg.profiles?.first_name || ''} ${msg.profiles?.last_name || ''}`.trim() || 'Anonymous',
      message: msg.content,
      time: msg.created_at,
      avatar: `${msg.profiles?.first_name?.[0] || ''}${msg.profiles?.last_name?.[0] || ''}`.toUpperCase() || '??',
      senderId: msg.sender_id
    }))

    console.log('✅ Group API returning real data')

    return NextResponse.json({
      success: true,
      data: {
        group: groupData,
        members: membersData,
        recentMessages: messagesData,
        chatRoom: chatRoom
      }
    })

  } catch (error) {
    console.error('Failed to fetch group data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch group data' },
      { status: 500 }
    )
  }
}
