/**
 * Member Production Logs API (Unified B2B + Member)
 *
 * POST /api/member/orders/[id]/production-logs - Create production log entry (admin/operator only)
 * GET /api/member/orders/[id]/production-logs - Get production logs for order
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createServiceClient } from '@/lib/supabase';
import { extractPathFromUrl } from '@/lib/storage-path';

/**
 * Helper: Get authenticated user
 */
async function getAuthenticatedUser(request: NextRequest) {
  // Task #27: middleware 検証済み header があれば userId を 0 RTT で返却
  // (getAuthenticatedUserFromHeaders と同一の header 条件: id+role+status)。
  // fallback は従来通り getUser() を実行し、認証結果（誰が認証されるか）は不変。
  const headerUserId = request.headers.get('x-user-id');
  const headerRole = request.headers.get('x-user-role');
  const headerStatus = request.headers.get('x-user-status');
  if (headerUserId && headerRole && headerStatus) {
    return { userId: headerUserId, user: { id: headerUserId } };
  }
  // Normal auth: Use cookie-based auth with createSupabaseSSRClient
  const { client: supabase } = await createSupabaseSSRClient(request);
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const userId = authUser.id;
  const user = authUser;
  console.log('[Production Logs] Authenticated user:', userId);

  return { userId, user };
}

// POST /api/member/orders/[id]/production-logs - Create production log (admin/operator only)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId } = authResult;

    // DB 操作（profiles / production_logs / orders / order_status_history）+ storage 操作は
    // service client。createSupabaseSSRClient は getAll/setAll 推奨パターンだが、@supabase/ssr
    // server context で PostgREST(DB) に session が伝播せず anon 扱いになり RLS で 0 rows /
    // INSERT 拒否されるため。cookie client（getAuthenticatedUser 内）は getUser()（認証）のみ。
    const serviceClient = createServiceClient();

    // Check if user is admin or operator（service client）
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile || !['ADMIN', 'OPERATOR'].includes(profile.role)) {
      return NextResponse.json(
        { error: '権限がありません。管理者またはオペレーターのみ生産ログを作成できます。' },
        { status: 403 }
      );
    }

    // Parse form data (for photo upload)
    const formData = await request.formData();
    const orderId = formData.get('order_id') as string;
    const subStatus = formData.get('sub_status') as string;
    const progressPercentage = parseInt(formData.get('progress_percentage') as string);
    const notes = formData.get('notes') as string | null;
    const photo = formData.get('photo') as File | null;

    if (!orderId || !subStatus) {
      return NextResponse.json(
        { error: '必須項目が不足しています。' },
        { status: 400 }
      );
    }

    // Handle photo upload if provided（service client で RLS bypass）
    let photoUrl: string | null = null;
    let signedPhotoUrl: string | null = null;
    if (photo) {
      try {
        const fileName = `${orderId}-${Date.now()}-${photo.name}`;
        const { data: uploadData, error: uploadError } = await serviceClient.storage
          .from('production-photos')
          .upload(fileName, photo);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          // Continue without photo
        } else {
          // production-photos は private bucket。response 表示用に signed URL（24h 有効）を生成。
          // DB の photo_url は従来通り getPublicUrl の結果を維持（保存方法の変更は別 Issue）。
          const { data: { publicUrl } } = serviceClient.storage
            .from('production-photos')
            .getPublicUrl(fileName);
          photoUrl = publicUrl;

          const { data: signedData, error: signedError } = await serviceClient.storage
            .from('production-photos')
            .createSignedUrl(fileName, 86400);
          if (signedError) {
            console.error('Photo signed URL error:', signedError);
          } else {
            signedPhotoUrl = signedData.signedUrl;
          }
        }
      } catch (error) {
        console.error('Photo upload error:', error);
        // Continue without photo
      }
    }

    // Create production log（service client）
    const { data: log, error: logError } = await serviceClient
      .from('production_logs')
      .insert({
        order_id: orderId,
        sub_status: subStatus,
        progress_percentage: progressPercentage || 0,
        assigned_to: userId,
        photo_url: photoUrl,
        notes: notes
      } as any)
      .select()
      .single();

    if (logError) {
      console.error('Error creating production log:', logError);
      return NextResponse.json(
        { error: '生産ログの作成中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    // Update order status（service client）
    // 判断4: current_state は orders テーブル実列に非存在のため削除。
    // subStatus（製造サブステータス）は production_logs.sub_status に保存済み。
    await serviceClient
      .from('orders')
      .update({
        status: 'PRODUCTION'
      })
      .eq('id', orderId);

    // Log status change（service client）
    await serviceClient
      .from('order_status_history')
      .insert({
        order_id: orderId,
        to_status: 'PRODUCTION',
        changed_by: userId,
        reason: `生産進捗: ${subStatus} (${progressPercentage}%)`
      } as any);

    return NextResponse.json({
      success: true,
      // response の photo_url は signed URL（24h 有効）で上書き。
      // DB の photo_url は publicUrl のままだが private bucket で実質アクセス不可のため、
      // 即時表示用に signed URL を返す。DB 保存方法の抜本的修正は別 Issue。
      data: { ...log, photo_url: signedPhotoUrl ?? log.photo_url },
      message: '生産ログが保存されました。'
    });

  } catch (error) {
    console.error('Production Logs API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// GET /api/member/orders/[id]/production-logs - Get production logs for order
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId } = authResult;

    // DB 操作は service client（POST と同方針・cookie client は anon で 0 rows になるため）
    const serviceClient = createServiceClient();

    const { id: orderId } = await context.params;

    // Check access permission（service client）
    const { data: order } = await serviceClient
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.role === 'ADMIN' || (profile?.role as string) === 'OPERATOR';
    const isOwner = order.user_id === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: '権限がありません。' },
        { status: 403 }
      );
    }

    // Get production logs for this order（service client）
    const { data: logs, error } = await serviceClient
      .from('production_logs')
      .select(`
        *,
        profiles (
          kanji_last_name,
          kanji_first_name
        )
      `)
      .eq('order_id', orderId)
      .order('logged_at', { ascending: false });

    if (error) {
      console.error('Error fetching production logs:', error);
      return NextResponse.json(
        { error: '生産ログの読み込み中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    // production-photos は private bucket。各 log の photo_url（DB には publicUrl 保存）を
    // extractPathFromUrl → createSignedUrl で署名付き URL（24h 有効）に変換して返す。
    // POST 直後だけでなくリロード（GET 再取得）時も写真が表示されるように。
    const logsWithSignedUrls = await Promise.all(
      (logs || []).map(async (log: any) => {
        if (!log.photo_url) return log;
        const path = extractPathFromUrl(log.photo_url);
        if (!path) return log;
        const { data: signedData } = await serviceClient.storage
          .from('production-photos')
          .createSignedUrl(path, 86400);
        return { ...log, photo_url: signedData?.signedUrl ?? log.photo_url };
      })
    );

    return NextResponse.json({
      success: true,
      data: logsWithSignedUrls
    });

  } catch (error) {
    console.error('Production Logs API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
