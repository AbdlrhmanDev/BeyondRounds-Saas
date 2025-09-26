import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
 
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const body = await request.json()
    const { userId, documentType, fileUrl } = body
 
    if (!userId || !documentType || !fileUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
 
    console.log(`📄 Uploading verification document for user: ${userId}`)
 
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
 
    // Check if verification document already exists
    const { data: existingDoc } = await supabase
      .from('verification_documents')
      .select('id, status')
      .eq('profile_id', profile.id)
      .single()
 
    const verificationData: Record<string, unknown> = {
      profile_id: profile.id,
      status: 'pending',
      submitted_at: new Date().toISOString()
    }
 
    // Update existing document or create new one
    if (existingDoc) {
      // Update existing document
      verificationData[`${documentType}_url`] = fileUrl
      verificationData.status = 'pending' // Reset status when new document is uploaded
      
      const { data: updatedDoc, error: updateError } = await supabase
        .from('verification_documents')
        .update(verificationData)
        .eq('id', existingDoc.id)
        .select()
        .single()
 
      if (updateError) {
        console.error('Error updating verification document:', updateError)
        return NextResponse.json(
          { success: false, error: 'Failed to update verification document' },
          { status: 500 }
        )
      }
 
      console.log('✅ Verification document updated successfully')
      return NextResponse.json({
        success: true,
        data: updatedDoc,
        message: 'Verification document updated successfully'
      })
    } else {
      // Create new document
      verificationData[`${documentType}_url`] = fileUrl
      
      const { data: newDoc, error: createError } = await supabase
        .from('verification_documents')
        .insert(verificationData)
        .select()
        .single()
 
      if (createError) {
        console.error('Error creating verification document:', createError)
        return NextResponse.json(
          { success: false, error: 'Failed to create verification document' },
          { status: 500 }
        )
      }
 
      console.log('✅ Verification document created successfully')
      return NextResponse.json({
        success: true,
        data: newDoc,
        message: 'Verification document uploaded successfully'
      })
    }
 
  } catch (error) {
    console.error('Failed to upload verification document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload verification document' },
      { status: 500 }
    )
  }
}
 
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServiceClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
 
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }
 
    console.log(`📄 Fetching verification documents for user: ${userId}`)
 
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
 
    // Get verification documents
    const { data: documents, error: documentsError } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('profile_id', profile.id)
      .single()
 
    if (documentsError && documentsError.code !== 'PGRST116') {
      console.error('Error fetching verification documents:', documentsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch verification documents' },
        { status: 500 }
      )
    }
 
    console.log('✅ Verification documents fetched successfully')
    return NextResponse.json({
      success: true,
      data: documents || null,
      message: 'Verification documents fetched successfully'
    })
 
  } catch (error) {
    console.error('Failed to fetch verification documents:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch verification documents' },
      { status: 500 }
    )
  }
}