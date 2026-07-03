/**
 * 統合通知削除API
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createNotificationService } from '@/lib/unified-notifications';
import { getCurrentUserId } from '@/lib/dashboard';
import { isDevMode } from '@/lib/dev-mode';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId();
    const isDevModeEnabled = isDevMode();

    if (!userId && !isDevModeEnabled) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: notificationId } = await params;

    const service = await createNotificationService();
    // C-14: userId を渡して自分の通知のみ削除（IDOR 対策）。devMode(userId null)は従来動作。
    await service.deleteNotification(notificationId, userId || undefined);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Delete notification error:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
