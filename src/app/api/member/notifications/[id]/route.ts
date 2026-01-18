/**
 * Delete Notification API
 *
 * DELETE /api/member/notifications/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const notificationId = params.id;

    // Delete notification
    const { error } = await supabase
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
