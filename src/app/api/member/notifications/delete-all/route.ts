/**
 * Delete All Notifications API
 *
 * DELETE /api/member/notifications/delete-all
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { getServerClient } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = getServerClient();

    // TECHNICAL DEBT: SupabaseClient<Database> で notifications クエリの型解決が深すぎて
    // TS2589 が発生するため、最小限の structural 型へキャストして回避（C2 型厳密化の副次被害）。
    const typedClient = supabase as unknown as {
      from: (table: 'notifications') => {
        delete: () => {
          eq: (
            column: string,
            value: string,
          ) => Promise<{ error: { message: string; code: string } | null }>;
        };
      };
    };

    // Delete all notifications for this user
    const { error } = await typedClient
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('[DeleteAllNotificationsAPI] Error deleting all:', error);
      return NextResponse.json(
        { error: 'Failed to delete all notifications' },
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

    console.error('[DeleteAllNotificationsAPI] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
