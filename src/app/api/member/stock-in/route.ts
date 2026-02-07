/**
 * Member Stock In API
 * POST /api/member/stock-in - Process stock in
 *
 * Migrated from /api/b2b/stock-in
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// ============================================================
// Helper: Get authenticated user ID
// ============================================================

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Stock In API] Using user ID from middleware:', userIdFromMiddleware);
    return userIdFromMiddleware;
  }

  // Fallback to SSR client auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const response = NextResponse.json({ success: false });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('[Stock In API] Auth error:', authError);
    return null;
  }

  return user.id;
}

// ============================================================
// Helper: Create Supabase client for database operations
// ============================================================

function createSupabaseClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {},
      remove() {},
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseClient(request);

    // Check if user is admin or operator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (!profile || !['ADMIN', 'OPERATOR'].includes(profile.role)) {
      return NextResponse.json(
        { error: '権限がありません。' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const orderId = formData.get('order_id') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const warehouseLocation = formData.get('warehouse_location') as string;
    const qualityStatus = formData.get('quality_status') as 'PASSED' | 'FAILED' | 'REWORK';
    const notes = formData.get('notes') as string | null;
    const photo = formData.get('photo') as File | null;

    if (!orderId || !quantity || !warehouseLocation) {
      return NextResponse.json(
        { error: '必須項目が不足しています。' },
        { status: 400 }
      );
    }

    // Use authenticated service client for write operations
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'process_stock_in',
      userId: userId,
      route: '/api/member/stock-in',
    });

    // Handle photo upload
    let photoUrl: string | null = null;
    if (photo) {
      const fileName = `${orderId}-stockin-${Date.now()}-${photo.name}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('stock-in-photos')
        .upload(fileName, photo);

      if (!uploadError) {
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('stock-in-photos')
          .getPublicUrl(fileName);
        photoUrl = publicUrl;
      }
    }

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'STOCK_IN',
        current_state: 'stocked_in',
        state_metadata: {
          quantity,
          warehouse_location: warehouseLocation,
          quality_status: qualityStatus,
          photo_url: photoUrl
        }
      })
      .eq('id', orderId);

    if (updateError) {
      throw updateError;
    }

    // Log stock in
    await supabaseAdmin
      .from('production_logs')
      .insert({
        order_id: orderId,
        sub_status: 'packaged', // Assuming stock in means packaging is complete
        progress_percentage: 100,
        assigned_to: userId,
        photo_url: photoUrl,
        notes: `入庫完了 - ${quantity}枚、倉庫: ${warehouseLocation}、QC: ${qualityStatus}${notes ? ', ' + notes : ''}`
      });

    // Log status change
    await supabaseAdmin
      .from('order_status_history')
      .insert({
        order_id: orderId,
        from_status: 'PRODUCTION',
        to_status: 'STOCK_IN',
        changed_by: userId,
        reason: `入庫完了: ${quantity}枚 (${qualityStatus})`
      });

    return NextResponse.json({
      success: true,
      message: '入庫処理が完了しました。'
    });

  } catch (error) {
    console.error('Stock In API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
