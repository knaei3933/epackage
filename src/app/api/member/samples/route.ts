export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * ============================================================
 * Member Sample Requests API
 * ============================================================
 *
 * GET /api/member/samples - Get user's sample requests
 *
 * Uses direct Supabase auth for reliable authentication
 */

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get user ID from Supabase auth cookies (most reliable method)
 */
async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    // Dynamic import to avoid build-time issues
    const { createServerClient } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[samples API] Missing Supabase environment variables');
      return null;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {}, // Read-only in Server Components
        remove: () => {}, // Read-only
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.log('[samples API] Auth error:', error.message);
      return null;
    }

    if (!user) {
      console.log('[samples API] No user found in session');
      return null;
    }

    console.log('[samples API] Found user:', user.id);
    return user.id;
  } catch (error) {
    console.error('[samples API] Error getting authenticated user:', error);
    return null;
  }
}

// ============================================================
// GET Handler - List Sample Requests
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getAuthenticatedUserId();

    // 未認証の場合は空の配列を返す（UIを壊さないため）
    if (!userId) {
      console.log('[samples API] No authenticated user, returning empty array');
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const supabase = createServiceClient();

    let query = supabase
      .from('sample_requests')
      .select(`
        *,
        sample_items (
          id,
          product_name,
          category,
          quantity
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('[samples API] Database error:', error);
      // テーブルが存在しない等の場合も空配列を返す
      if (error.code === '42P01') { // relation does not exist
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
      return NextResponse.json(
        { error: 'サンプル依頼の取得に失敗しました', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    // Transform to dashboard format
    const sampleRequests = requests?.map(req => ({
      id: req.id,
      userId: req.user_id,
      requestNumber: req.request_number || `SMP-${String(req.id).padStart(6, '0')}`,
      status: req.status || 'received',
      samples: req.sample_items || [],
      deliveryAddress: req.delivery_address,
      trackingNumber: req.tracking_number,
      createdAt: req.created_at,
      shippedAt: req.shipped_at,
      deliveredAt: req.delivered_at,
    })) || [];

    console.log('[samples API] Returning', sampleRequests.length, 'requests');
    return NextResponse.json({
      success: true,
      data: sampleRequests,
    });
  } catch (error) {
    console.error('[samples API] Unexpected error:', error);
    // 予期しないエラーでもUIを壊さないよう空配列を返す
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}
