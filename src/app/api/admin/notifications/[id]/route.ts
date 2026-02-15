/**
 * Admin Notification [id] API
 * DELETE /api/admin/notifications/[id] - Delete a notification (admin only)
 * PUT /api/admin/notifications/[id] - Update a notification (admin only)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers'
import { createSupabaseSSRClient } from '@/lib/supabase-ssr'

interface UpdateNotificationData {
  title?: string
  message?: string
  type?: 'order' | 'quotation' | 'sample' | 'registration' | 'production' | 'shipment' | 'contract' | 'system'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  action_url?: string
  action_label?: string
  is_read?: boolean
}

// DELETE /api/admin/notifications/[id] - Delete notification
export async function DELETE(
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
    const { client: supabase } = await createSupabaseSSRClient(request)

    // Delete notification using unified_notifications table
    const { error } = await supabase
      .from('unified_notifications')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Delete Notification API] Error:', error)
      return NextResponse.json(
        { error: '通知の削除に失敗しました。', error_code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '通知を削除しました。',
    })
  } catch (error) {
    console.error('[Delete Notification API] Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/notifications/[id] - Update notification

export async function PUT(
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
    const body = await request.json() as UpdateNotificationData

    const { client: supabase } = await createSupabaseSSRClient(request)

    // Build update object
    const updateData: Record<string, any> = {}
    if (body.title !== undefined) updateData.title = body.title
    if (body.message !== undefined) updateData.message = body.message
    if (body.type !== undefined) updateData.type = body.type
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.action_url !== undefined) updateData.action_url = body.action_url
    if (body.action_label !== undefined) updateData.action_label = body.action_label
    if (body.is_read !== undefined) {
      updateData.is_read = body.is_read
      if (body.is_read) updateData.read_at = new Date().toISOString()
    }
    // Note: unified_notifications table doesn't have updated_at column

    // Update notification using unified_notifications table
    const { data, error } = await supabase
      .from('unified_notifications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[Update Notification API] Error:', error)
      return NextResponse.json(
        { error: '通知の更新に失敗しました。', error_code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: '通知が見つかりません。', error_code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { notification: data },
      message: '通知を更新しました。',
    })
  } catch (error) {
    console.error('[Update Notification API] Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
