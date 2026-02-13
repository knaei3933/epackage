/**
 * Member Production Logs API (Unified B2B + Member)
 *
 * POST /api/member/orders/[id]/production-logs - Create production log entry (admin/operator only)
 * GET /api/member/orders/[id]/production-logs - Get production logs for order
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';

/**
 * Helper: Get authenticated user
 */
async function getAuthenticatedUser(request: NextRequest) {
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
    const { client: supabase } = await createSupabaseSSRClient(request);

    // Check if user is admin or operator
    const { data: profile } = await supabase
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

    // Handle photo upload if provided
    let photoUrl: string | null = null;
    if (photo) {
      try {
        // Upload to Supabase Storage
        const fileName = `${orderId}-${Date.now()}-${photo.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('production-photos')
          .upload(fileName, photo);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          // Continue without photo
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('production-photos')
            .getPublicUrl(fileName);

          photoUrl = publicUrl;
        }
      } catch (error) {
        console.error('Photo upload error:', error);
        // Continue without photo
      }
    }

    // Create production log
    const { data: log, error: logError } = await supabase
      .from('production_logs')
      .insert({
        order_id: orderId,
        sub_status: subStatus,
        progress_percentage: progressPercentage || 0,
        assigned_to: userId,
        photo_url: photoUrl,
        notes: notes
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating production log:', logError);
      return NextResponse.json(
        { error: '生産ログの作成中にエラーが発生しました。' },
        { status: 500 }
      );
    }

    // Update order current_state
    await supabase
      .from('orders')
      .update({
        current_state: subStatus,
        status: 'PRODUCTION'
      })
      .eq('id', orderId);

    // Log status change
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        to_status: 'PRODUCTION',
        changed_by: userId,
        reason: `生産進捗: ${subStatus} (${progressPercentage}%)`
      });

    return NextResponse.json({
      success: true,
      data: log,
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
    const { client: supabase } = await createSupabaseSSRClient(request);

    const { id: orderId } = await context.params;

    // Check access permission
    const { data: order } = await supabase
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'OPERATOR';
    const isOwner = order.user_id === userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: '権限がありません。' },
        { status: 403 }
      );
    }

    // Get production logs for this order
    const { data: logs, error } = await supabase
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

    return NextResponse.json({
      success: true,
      data: logs
    });

  } catch (error) {
    console.error('Production Logs API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
