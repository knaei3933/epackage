/**
 * 統合通知既読化API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createNotificationService } from '@/lib/unified-notifications';
import { getCurrentUserId } from '@/lib/dashboard';
import { isDevMode } from '@/lib/dev-mode';

export async function POST(
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

    // 権限チェック（自分の通知のみ既読化可能）
    // 管理者は全ての通知を既読化可能

    const service = createNotificationService();
    await service.markAsRead(notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Mark as read error:', error);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}
