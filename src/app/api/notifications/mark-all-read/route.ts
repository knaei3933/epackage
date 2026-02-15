/**
 * 統合通知全て既読化API
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createNotificationService } from '@/lib/unified-notifications';
import { getCurrentUserId } from '@/lib/dashboard';
import { isDevMode } from '@/lib/dev-mode';

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const isDevModeEnabled = isDevMode();

    if (!userId && !isDevModeEnabled) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const recipientType = body.recipientType || 'member';

    const service = createNotificationService();
    await service.markAllAsRead(userId || 'dev-mock-user', recipientType);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Mark all as read error:', error);
    return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
  }
}
