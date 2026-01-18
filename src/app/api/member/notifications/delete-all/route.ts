/**
 * Delete All Notifications API
 *
 * DELETE /api/member/notifications/delete-all
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthRequiredError } from '@/lib/dashboard';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Delete all notifications for this user
    const { error } = await supabase
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
