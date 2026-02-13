export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/dashboard';
import { isDevMode } from '@/lib/dev-mode';

/**
 * ============================================================
 * Member Sample Requests API
 * ============================================================
 *
 * GET /api/member/samples - Get user's sample requests
 *
 * Uses getCurrentUserId() for authentication with RBAC fallback
 */

// ============================================================
// GET Handler - List Sample Requests
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getCurrentUserId();
    const isDevModeEnabled = isDevMode();

    // DEV_MODEではモックユーザーIDを使用
    const effectiveUserId = userId || (isDevModeEnabled ? 'dev-mock-user' : null);

    if (!effectiveUserId) {
      // 本番環境で認証されていない場合は空の配列を返す（UIを壊さないため）
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
      .eq('user_id', effectiveUserId)
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Sample requests fetch error:', error);
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

    return NextResponse.json({
      success: true,
      data: sampleRequests,
    });
  } catch (error) {
    console.error('Sample requests API error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラーが発生しました',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
