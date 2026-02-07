/**
 * Mark Notification as Read API
 *
 * PATCH /api/member/notifications/[id]/read
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { getServerClient } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const notificationId = params.id;
    const supabase = getServerClient();

    // Update notification as read
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id); // Ensure user can only update their own notifications

    if (error) {
      console.error('[NotificationReadAPI] Error marking as read:', error);
      return NextResponse.json(
        { error: 'Failed to mark notification as read' },
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

    console.error('[NotificationReadAPI] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
