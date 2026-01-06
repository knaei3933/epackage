import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * GET /api/admin/inventory/history/[productId]
 * 在庫移動履歴を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { productId } = await params;
    const supabase = createSupabaseClient();

    const { data: transactions, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        performed_by_profile:profiles!fk_performed_by(
          kanji_last_name,
          kanji_first_name
        )
      `)
      .eq('product_id', productId)
      .order('transaction_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('移動履歴取得エラー:', error);
      return NextResponse.json(
        { error: '移動履歴の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json(transactions || []);
  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
