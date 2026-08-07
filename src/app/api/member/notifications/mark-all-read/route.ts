/**
 * Mark All Notifications as Read API
 *
 * PATCH /api/member/notifications/mark-all-read
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { getServerClient } from '@/lib/supabase';

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = getServerClient();

    // TECHNICAL DEBT: SupabaseClient<Database> で notifications クエリの型解決が深すぎて
    // TS2589 が発生するため、最小限の structural 型へキャストして回避（C2 型厳密化の副次被害）。
    const typedClient = supabase as unknown as {
      from: (table: 'notifications') => {
        update: (values: { is_read: boolean }) => {
          eq: (
            column: string,
            value: string | boolean,
          ) => {
            eq: (
              column: string,
              value: string | boolean,
            ) => Promise<{ error: { message: string; code: string } | null }>;
          };
        };
      };
    };

    // Update all notifications as read for this user
    const { error } = await typedClient
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false); // Only update unread notifications

    if (error) {
      console.error('[MarkAllReadAPI] Error marking all as read:', error);
      return NextResponse.json(
        { error: 'Failed to mark all notifications as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('[MarkAllReadAPI] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
