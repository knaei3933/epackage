/**
 * 統合通知未読件数取得API
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createNotificationService } from '@/lib/unified-notifications';
import { getCurrentUserId } from '@/lib/dashboard';
import { isDevMode } from '@/lib/dev-mode';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const isDevModeEnabled = isDevMode();

    if (!userId && !isDevModeEnabled) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // リクエストパラメータからrecipientTypeを取得
    const searchParams = request.nextUrl.searchParams;
    const recipientType = (searchParams.get('recipientType') || 'member') as 'member' | 'admin';

    const service = createNotificationService();
    const unreadCount = await service.getUnreadCount(
      userId || 'dev-mock-user',
      recipientType
    );

    return NextResponse.json({ count: unreadCount });
  } catch (error) {
    console.error('[API] Unread count error:', error);
    return NextResponse.json({ error: 'Failed to get unread count' }, { status: 500 });
  }
}
