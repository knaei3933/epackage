/**
 * Admin Notifications API
 * GET /api/admin/notifications - List admin notifications
 * POST /api/admin/notifications - Create admin notification (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getAdminNotifications,
  getUnreadAdminNotificationCount,
  markAllAdminNotificationsAsRead,
  type AdminNotification,
} from '@/lib/admin-notifications'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers'

// GET /api/admin/notifications - List notifications
export async function GET(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request)
    if (!auth) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const type = searchParams.get('type') as
      | 'order'
      | 'quotation'
      | 'sample'
      | 'registration'
      | 'production'
      | 'shipment'
      | 'contract'
      | 'system'
      | null
    const priority = searchParams.get('priority') as
      | 'low'
      | 'normal'
      | 'high'
      | 'urgent'
      | null
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { notifications, total } = await getAdminNotifications({
      unreadOnly,
      type: type || undefined,
      priority: priority || undefined,
      limit,
      offset,
    })

    // Get unread count
    const unreadCount = await getUnreadAdminNotificationCount()

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount,
      },
      pagination: {
        limit,
        offset,
        total,
        hasMore: total > offset + limit,
      },
    })
  } catch (error) {
    console.error('[Admin Notifications API] Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}

// POST /api/admin/notifications - Mark all as read
export async function POST(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request)
    if (!auth) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { action } = body

    if (action === 'mark_all_read') {
      const markedCount = await markAllAdminNotificationsAsRead()

      return NextResponse.json({
        success: true,
        data: { marked_count: markedCount },
        message: 'すべての通知を既読にしました。',
      })
    } else {
      return NextResponse.json(
        { error: '無効なリクエストです。', error_code: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[Admin Notifications API] Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
