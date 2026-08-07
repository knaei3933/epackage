/**
 * Delete Notification API
 *
 * DELETE /api/member/notifications/[id]
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { getServerClient } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: notificationId } = await params;
    const supabase = getServerClient();

    // TECHNICAL DEBT: SupabaseClient<Database> で notifications クエリの型解決が深すぎて
    // TS2589 が発生するため、最小限の structural 型へキャストして回避（C2 型厳密化の副次被害）。
    const typedClient = supabase as unknown as {
      from: (table: 'notifications') => {
        delete: () => {
          eq: (column: string, value: string) => {
            eq: (
              column: string,
              value: string,
            ) => Promise<{ error: { message: string; code: string } | null }>;
          };
        };
      };
    };

    // Delete notification
    const { error } = await typedClient
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id); // Ensure user can only delete their own notifications

    if (error) {
      console.error('[NotificationDeleteAPI] Error deleting:', error);
      return NextResponse.json(
        { error: 'Failed to delete notification' },
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

    console.error('[NotificationDeleteAPI] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
