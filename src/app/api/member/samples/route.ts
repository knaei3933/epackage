export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/dashboard';

/**
 * ============================================================
 * Member Sample Requests API
 * ============================================================
 *
 * GET /api/member/samples - Get user's sample requests
 *
 * Uses cookie-based authentication with fallback to RBAC context
 */

// ============================================================
// GET Handler - List Sample Requests
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json(
        { error: '認証されていません', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
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
