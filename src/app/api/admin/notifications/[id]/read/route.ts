/**
 * Admin Notification Read API
 * PATCH /api/admin/notifications/[id]/read - Mark notification as read
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers'
import { createSupabaseSSRClient } from '@/lib/supabase-ssr'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request)
    if (!auth) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const { client: supabase } = await createSupabaseSSRClient($$$ARGS)

    // Mark as read using unified_notifications table
    const { data, error } = await supabase
      .from('unified_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: '通知が見つかりません。', error_code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { notification: data },
      message: '通知を既読にしました。',
    })
  } catch (error) {
    console.error('[Admin Notification Read API] Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
