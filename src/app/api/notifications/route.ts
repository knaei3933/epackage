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

    // 認証されていない場合は空の配列を返す（エラーにしない）
    if (!userId && !isDevModeEnabled) {
      console.log('[API] Notifications: No user authenticated, returning empty array');
      return NextResponse.json([]);
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
      try {
        const { createServerClient } = await import('@supabase/ssr');
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        // CRITICAL FIX: Server Components の cookieStore は読み取り専用
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get: (name: string) => cookieStore.get(name)?.value,
              set: () => {}, // 読み取り専用
              remove: () => {}, // 読み取り専用
            },
          }
        );

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        if (profile?.role === 'ADMIN') {
          recipientType = 'admin';
        }
      } catch (profileError) {
        console.error('[API] Notifications: Failed to fetch profile, using default role:', profileError);
        // エラーが発生してもデフォルトのmemberロールで続行
      }
    } else if (request.headers.get('x-user-role') === 'ADMIN') {
      // DEV_MODEでヘッダーからロールを取得
      recipientType = 'admin';
    }

    // CRITICAL FIX: unified_notifications テーブルが存在しない場合のエラーハンドリング
    let notifications: any[] = [];
    try {
      const service = await createNotificationService();
      notifications = await service.getNotifications({
        recipientId: userId || 'dev-mock-user',
        recipientType,
        unreadOnly,
        limit,
        type,
      });
    } catch (serviceError) {
      // unified_notifications テーブルが存在しない、または初期化に失敗した場合
      console.error('[API] Notifications: Service error (table may not exist):', serviceError);
      // エラーを無視して空の配列を返す（UIクラッシュ防止）
      notifications = [];
    }

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('[API] Notifications fetch error:', error);
    // エラー時は空の配列を返して、UIのレンダリングを中断させない
    return NextResponse.json([]);
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
