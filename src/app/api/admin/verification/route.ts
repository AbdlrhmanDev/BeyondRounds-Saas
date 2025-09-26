import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
 
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit
 
    console.log(`📋 Fetching verification requests with status: ${status}`)
 
    // Get verification documents with profile information
    const { data: documents, error: documentsError } = await supabase
      .from('verification_documents')
      .select(`
        *,
        profiles!verification_documents_profile_id_fkey (
          id,
          first_name,
          last_name,
          email,
          medical_specialty,
          city,
          created_at
        )
      `)
      .eq('status', status)
      .is('deleted_at', null)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)
 
    if (documentsError) {
      console.error('Error fetching verification documents:', documentsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch verification documents' },
        { status: 500 }
      )
    }
 
    // Get total count
    const { count, error: countError } = await supabase
      .from('verification_documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)
      .is('deleted_at', null)
 
    if (countError) {
      console.error('Error fetching count:', countError)
    }
 
    console.log(`✅ Found ${documents?.length || 0} verification requests`)
    return NextResponse.json({
      success: true,
      data: {
        documents: documents || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      },
      message: 'Verification requests fetched successfully'
    })
 
  } catch (error) {
    console.error('Failed to fetch verification requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification requests' },
      { status: 500 }
    )
  }
}
 
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const body = await request.json()
    const { documentId, status, adminNotes, adminId } = body
 
    if (!documentId || !status || !adminId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
 
    console.log(`🔍 Processing verification document: ${documentId} with status: ${status}`)
 
    // Update verification document
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId
    }
 
    if (adminNotes) {
      updateData.admin_notes = adminNotes
    }
 
    const { data: updatedDoc, error: updateError } = await supabase
      .from('verification_documents')
      .update(updateData)
      .eq('id', documentId)
      .select(`
        *,
        profiles!verification_documents_profile_id_fkey (
          id,
          first_name,
          last_name,
          email,
          is_verified
        )
      `)
      .single()
 
    if (updateError) {
      console.error('Error updating verification document:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update verification document' },
        { status: 500 }
      )
    }
 
    // If approved, update user's verification status
    if (status === 'approved' && updatedDoc.profiles) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          is_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', updatedDoc.profiles.id)
 
      if (profileError) {
        console.error('Error updating profile verification status:', profileError)
      } else {
        console.log('✅ User verification status updated to verified')
      }
    }
 
    // If rejected, update user's verification status
    if (status === 'rejected' && updatedDoc.profiles) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          is_verified: false,
          verified_at: null
        })
        .eq('id', updatedDoc.profiles.id)
 
      if (profileError) {
        console.error('Error updating profile verification status:', profileError)
      } else {
        console.log('✅ User verification status updated to not verified')
      }
    }
 
    // Create notification for the user
    const notificationData = {
      profile_id: updatedDoc.profiles.id,
      title: status === 'approved' ? 'Verification Approved' : 'Verification Rejected',
      message: status === 'approved' 
        ? 'Your identity verification has been approved. You can now access all features.'
        : `Your identity verification was rejected. ${adminNotes || 'Please review your documents and try again.'}`,
      data: {
        type: 'verification',
        status,
        document_id: documentId
      },
      is_read: false,
      created_at: new Date().toISOString()
    }
 
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationData)
 
    if (notificationError) {
      console.error('Error creating notification:', notificationError)
    } else {
      console.log('✅ Notification created for user')
    }
 
    console.log('✅ Verification document processed successfully')
    return NextResponse.json({
      success: true,
      data: updatedDoc,
      message: 'Verification document processed successfully'
    })
 
  } catch (error) {
    console.error('Failed to process verification document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process verification document' },
      { status: 500 }
    )
  }
}