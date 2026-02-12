export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * GET /api/admin/shipping/tracking/[id]
 * 出荷追跡情報を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: shipmentId } = await params;
    const supabase = createSupabaseClient();

    const { data: tracking, error } = await supabase
      .from('shipment_tracking')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('event_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('追跡情報取得エラー:', error);
      return NextResponse.json(
        { error: '追跡情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(tracking || []);
  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
