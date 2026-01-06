/**
 * Admin Notification Read API
 * PATCH /api/admin/notifications/[id]/read - Mark notification as read
 * DELETE /api/admin/notifications/[id] - Delete notification
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  markAdminNotificationAsRead,
  deleteAdminNotification,
} from '@/lib/admin-notifications'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers'

// PATCH /api/admin/notifications/[id]/read - Mark as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request)
    if (!auth) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const notification = await markAdminNotificationAsRead(id)

    if (!notification) {
      return NextResponse.json(
        { error: '通知が見つかりません。', error_code: 'NOTIFICATION_NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: notification,
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

// DELETE /api/admin/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request)
    if (!auth) {
      return unauthorizedResponse()
    }

    const { id } = await params
    const success = await deleteAdminNotification(id)

    if (!success) {
      return NextResponse.json(
        { error: '通知の削除に失敗しました。', error_code: 'DELETE_FAILED' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '通知を削除しました。',
    })
  } catch (error) {
    console.error('[Admin Notification Delete API] Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
