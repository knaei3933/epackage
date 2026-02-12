/**
 * 統合通知API
 *
 * 会員・管理者共通の通知機能を提供します
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createNotificationService } from '@/lib/unified-notifications';
import { requireAuth, getCurrentUserId } from '@/lib/dashboard';
import { isDevMode } from '@/lib/dev-mode';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    // DEV_MODE対応
    const isDevModeEnabled = isDevMode();
    if (!userId && !isDevModeEnabled) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const type = searchParams.get('type') || undefined;

    // ユーザーロールを取得（recipientType決定用）
    // DEV_MODEではデフォルト値を使用
    let recipientType: 'member' | 'admin' = 'member';

    // 本番環境ではプロフィールからロールを取得
    if (!isDevModeEnabled && userId) {
      const { createServerClient } = await import('@supabase/ssr');
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get: cookieStore.get, set: cookieStore.set, remove: cookieStore.delete } }
      );

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profile?.role === 'ADMIN') {
        recipientType = 'admin';
      }
    } else if (request.headers.get('x-user-role') === 'ADMIN') {
      // DEV_MODEでヘッダーからロールを取得
      recipientType = 'admin';
    }

    const service = await createNotificationService();
    const notifications = await service.getNotifications({
      recipientId: userId || 'dev-mock-user',
      recipientType,
      unreadOnly,
      limit,
      type,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('[API] Notifications fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    // 管理者のみ通知作成可能
    if (user.user_metadata?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const service = await createNotificationService();
    const notificationId = await service.createNotification(body);

    return NextResponse.json({ id: notificationId }, { status: 201 });
  } catch (error) {
    console.error('[API] Notification creation error:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
