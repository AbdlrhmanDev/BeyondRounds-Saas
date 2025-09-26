import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
 
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const isRead = searchParams.get('isRead')
 
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }
 
    console.log(`🔔 Fetching notifications for user: ${userId}`)
 
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
 
    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('profile_id', profile.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
 
    // Apply filters
    if (type) {
      query = query.eq('data->type', type)
    }
 
    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true')
    }
 
    const { data: notifications, error: notificationsError } = await query
 
    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }
 
    console.log(`✅ Found ${notifications?.length || 0} notifications`)
    return NextResponse.json({
      success: true,
      data: notifications || [],
      message: 'Notifications fetched successfully'
    })
 
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
 
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const body = await request.json()
    const { notificationId, isRead } = body
 
    if (!notificationId || isRead === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
 
    console.log(`🔔 Updating notification: ${notificationId}`)
 
    const updateData: Record<string, unknown> = {}
    if (isRead !== undefined) {
      updateData.is_read = isRead
      if (isRead) {
        updateData.read_at = new Date().toISOString()
      }
    }
 
    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', notificationId)
      .select()
      .single()
 
    if (updateError) {
      console.error('Error updating notification:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update notification' },
        { status: 500 }
      )
    }
 
    console.log('✅ Notification updated successfully')
    return NextResponse.json({
      success: true,
      data: updatedNotification,
      message: 'Notification updated successfully'
    })
 
  } catch (error) {
    console.error('Failed to update notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}
 
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const body = await request.json()
    const { userId, title, message, data, type } = body
 
    if (!userId || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
 
    console.log(`🔔 Creating notification for user: ${userId}`)
 
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
 
    // Create notification
    const notificationData = {
      profile_id: profile.id,
      title,
      message,
      data: data || { type: type || 'general' },
      is_read: false,
      created_at: new Date().toISOString()
    }
 
    const { data: newNotification, error: createError } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()
 
    if (createError) {
      console.error('Error creating notification:', createError)
      return NextResponse.json(
        { success: false, error: 'Failed to create notification' },
        { status: 500 }
      )
    }
 
    console.log('✅ Notification created successfully')
    return NextResponse.json({
      success: true,
      data: newNotification,
      message: 'Notification created successfully'
    })
 
  } catch (error) {
    console.error('Failed to create notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}