/**
 * Customer Notifications API
 * GET /api/customer/notifications - List customer notifications
 * POST /api/customer/notifications/read - Mark notification as read
 * POST /api/customer/notifications/read-all - Mark all as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// GET /api/customer/notifications - List notifications
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('customer_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter unread if requested
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    // Filter out expired notifications
    query = query.or('expires_at.is.null,expires_at.gt.now()');

    const { data: notifications, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: '通知の取得中にエラーが発生しました。', error_code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    // Get unread count
    const { data: unreadCountResult } = await supabase
      .rpc('get_unread_notification_count', { user_uuid: user.id });

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications || [],
        total: notifications?.length || 0,
        unread_count: unreadCountResult || 0,
      },
      pagination: {
        limit,
        offset,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });

  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

// POST /api/customer/notifications/read - Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, notification_id } = body;

    if (action === 'read_all') {
      // Mark all notifications as read
      const { data: markedCount } = await supabase
        .rpc('mark_all_notifications_read', { user_uuid: user.id });

      return NextResponse.json({
        success: true,
        data: { marked_count: markedCount },
        message: 'すべての通知を既読にしました。',
      });
    } else if (action === 'mark_read' && notification_id) {
      // Mark specific notification as read
      const { data: success } = await supabase
        .rpc('mark_notification_read', {
          notification_uuid: notification_id,
          user_uuid: user.id,
        });

      if (!success) {
        return NextResponse.json(
          { error: '通知が見つかりません。', error_code: 'NOTIFICATION_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: '通知を既読にしました。',
      });
    } else {
      return NextResponse.json(
        { error: '無効なリクエストです。', error_code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Notifications Action API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
