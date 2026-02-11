/**
 * Admin Notifications API
 * GET /api/admin/notifications - List admin notifications
 * POST /api/admin/notifications - Mark all as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers'
import { createSupabaseSSRClient } from '@/lib/supabase-ssr'

// GET /api/admin/notifications - List notifications
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication first
    const auth = await verifyAdminAuth(request)
    if (!auth) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { client: supabase } = await createSupabaseSSRClient(request)

    // Build query for unified_notifications with recipient_type = 'admin'
    let query = supabase
      .from('unified_notifications')
      .select('*', { count: 'exact' })
      .eq('recipient_type', 'admin')

    // Filter out expired notifications
    query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())

    // Filter by unread status
    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    // Filter by type
    if (type) {
      query = query.eq('type', type)
    }

    // Filter by priority
    if (priority) {
      query = query.eq('priority', priority)
    }

    // Order by created_at desc and paginate
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: notifications, error, count } = await query

    if (error) {
      console.error('[Admin Notifications API] Error:', error)
      return NextResponse.json(
        { error: '通知の取得に失敗しました。', error_code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('unified_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_type', 'admin')
      .eq('is_read', false)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications || [],
        unread_count: unreadCount || 0,
      },
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
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
    // Verify admin authentication first
    const auth = await verifyAdminAuth(request)
    if (!auth) {
      return unauthorizedResponse()
    }

    const body = await request.json()
    const { action } = body

    if (action === 'mark_all_read') {
      const { client: supabase } = await createSupabaseSSRClient(request)

      // Mark all admin notifications as read
      const { error } = await supabase
        .from('unified_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_type', 'admin')
        .eq('is_read', false)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())

      if (error) {
        console.error('[Mark All Read API] Error:', error)
        return NextResponse.json(
          { error: '既読への更新に失敗しました。', error_code: 'DATABASE_ERROR' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: { marked_count: 0 },
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
