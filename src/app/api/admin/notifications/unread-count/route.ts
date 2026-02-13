/**
 * Admin Notifications Unread Count API
 * GET /api/admin/notifications/unread-count - Get unread count
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/auth-helpers'
import { createSupabaseSSRClient } from '@/lib/supabase-ssr'

// GET /api/admin/notifications/unread-count - Get unread count
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const auth = await verifyAdminAuth(request)
    if (!auth) {
      return NextResponse.json(
        { error: '認証されていません。' },
        { status: 401 }
      )
    }

    const { client: supabase } = await createSupabaseSSRClient(request)

    // Get unread count from unified_notifications
    const { count, error } = await supabase
      .from('unified_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_type', 'admin')
      .eq('is_read', false)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())

    if (error) {
      console.error('[Unread Count API] Error:', error)
      return NextResponse.json(
        { error: '未読数の取得に失敗しました。', error_code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { count: count || 0 },
    })
  } catch (error) {
    console.error('[Admin Notifications Unread Count API] Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
