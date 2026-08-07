/**
 * Member Notifications API
 *
 * GET /api/member/notifications - Get user notifications
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { getServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();

    // Fetch notifications for the user
    const supabase = getServerClient();
    // TECHNICAL DEBT: SupabaseClient<Database> で notifications クエリの型解決が深すぎて
    // TS2589 が発生するため、最小限の structural 型へキャストして回避（C2 型厳密化の副次被害）。
    type NotificationRow = {
      id: string;
      title: string;
      message: string;
      type: string;
      is_read: boolean | null;
      read_at: string | null;
      related_id: string | null;
      created_at: string;
      created_for: string;
    };
    const typedClient = supabase as unknown as {
      from: (table: 'notifications') => {
        select: (columns: string) => {
          eq: (column: string, value: string) => {
            order: (column: string, opts: { ascending: boolean }) => {
              limit: (count: number) => Promise<{
                data: NotificationRow[] | null;
                error: { message: string; code: string } | null;
              }>;
            };
          };
        };
      };
    };
    const { data: notifications, error } = await typedClient
      .from('notifications')
      .select('id, title, message, type, is_read, read_at, related_id, created_at, created_for')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('[NotificationsAPI] Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: notifications || [],
      count: notifications?.length || 0,
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[NotificationsAPI] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
