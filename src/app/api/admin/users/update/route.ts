import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)
 
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action, value } = body
 
    console.log(`🔄 Updating user ${userId}: ${action} = ${value}`)
 
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }
 
    if (action === 'verify') {
      updateData.is_verified = value
    } else if (action === 'ban') {
      updateData.is_banned = value
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      )
    }
 
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', userId)
 
    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
 
    console.log(`✅ User ${userId} updated successfully`)
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${action} ${value ? 'enabled' : 'disabled'} successfully` 
    })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}