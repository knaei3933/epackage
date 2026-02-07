/**
 * Create Notification API
 * POST /api/admin/notifications/create - Create a new notification (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers'
import { createSupabaseSSRClient } from '@/lib/supabase-ssr'

interface CreateNotificationData {
  title: string
  message: string
  type?: 'order' | 'quotation' | 'sample' | 'registration' | 'production' | 'shipment' | 'contract' | 'system'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  action_url?: string
  action_label?: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await verifyAdminAuth(request)
    if (!auth) {
      return unauthorizedResponse()
    }

    const body = await request.json() as CreateNotificationData

    // Validate required fields
    if (!body.title || !body.message) {
      return NextResponse.json(
        { error: 'タイトルとメッセージは必須です。', error_code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const { client: supabase } = createSupabaseSSRClient(request)

    // Create notification using unified_notifications table
    const { data, error } = await supabase
      .from('unified_notifications')
      .insert({
        recipient_id: auth.userId, // Send to the admin who created it
        recipient_type: 'admin',
        type: body.type || 'system',
        title: body.title,
        message: body.message,
        priority: body.priority || 'normal',
        action_url: body.action_url,
        action_label: body.action_label,
        is_read: false,
        metadata: {},
        channels: {},
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('[Create Notification API] Error:', error)
      return NextResponse.json(
        { error: '通知の作成に失敗しました。', error_code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { notification: data },
      message: '通知を作成しました。',
    })
  } catch (error) {
    console.error('[Create Notification API] Error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
