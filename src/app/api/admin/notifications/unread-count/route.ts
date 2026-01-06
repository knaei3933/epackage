/**
 * Admin Notifications Unread Count API
 * GET /api/admin/notifications/unread-count - Get unread count
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUnreadAdminNotificationCount } from '@/lib/admin-notifications'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers'

// GET /api/admin/notifications/unread-count - Get unread count
export async function GET(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request)
    if (!auth) {
      return unauthorizedResponse()
    }

    const unreadCount = await getUnreadAdminNotificationCount()

    return NextResponse.json({
      success: true,
      data: { count: unreadCount },
    })
  } catch (error) {
    console.error('[Admin Notifications Unread Count API] Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
