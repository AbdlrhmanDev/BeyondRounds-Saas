import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)
 
export async function GET(_request: NextRequest) {
  try {
    console.log('👥 Loading users via API...')
    
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        verification_documents!verification_documents_profile_id_fkey(*)
      `)
      .order('created_at', { ascending: false })
      .limit(100)
 
    if (error) {
      console.error('Error loading users:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
 
    console.log(`📊 Loaded ${data?.length || 0} users via API`)
    
    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error('Failed to load users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load users' },
      { status: 500 }
    )
  }
}