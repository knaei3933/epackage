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

    // 注: inventory_transactions テーブルに product_id 列は存在しない（実DB schema 確認済）。
    // inventory テーブルで product_id → inventory_id を逆引きし、inventory_id で絞り込む。
    const { data: inventoryRows, error: inventoryLookupError } = await supabase
      .from('inventory')
      .select('id')
      .eq('product_id', productId);

    if (inventoryLookupError) {
      console.error('在庫逆引きエラー:', inventoryLookupError);
      return NextResponse.json(
        { error: '在庫の取得に失敗しました' },
        { status: 500 }
      );
    }

    const inventoryIds = (inventoryRows || []).map((r) => r.id);
    if (inventoryIds.length === 0) {
      // 該当商品の在庫レコードなし → 空配列
      return NextResponse.json([]);
    }

    // 技術的負債: PostgREST FK エイリアス（performed_by_profile:profiles!fk_performed_by）
    // を select に入れると TS2589（型再帰過深）が発生するため、ヘッダ查询を分割。
    // 1) inventory_transactions は単純 select（TS2589 回避）
    // 2) profiles は別途 batch 取得してメモリで結合
    const { data: transactions, error } = await supabase
      .from('inventory_transactions')
      .select('*')
      .in('inventory_id', inventoryIds)
      .order('transaction_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('移動履歴取得エラー:', error);
      return NextResponse.json(
        { error: '移動履歴の取得に失敗しました' },
        { status: 500 }
      );
    }

    // performed_by の profiles を別途取得して結合（FK エイリアス回避）
    const performedByIds = Array.from(new Set(
      (transactions || [])
        .map((t) => t.performed_by)
        .filter((id): id is string => Boolean(id))
    ));
    const profileMap = new Map<string, { kanji_last_name: string | null; kanji_first_name: string | null }>();
    if (performedByIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, kanji_last_name, kanji_first_name')
        .in('id', performedByIds);
      (profiles || []).forEach((p) => {
        profileMap.set(p.id, {
          kanji_last_name: p.kanji_last_name,
          kanji_first_name: p.kanji_first_name,
        });
      });
    }
    const transactionsWithProfile = (transactions || []).map((t) => ({
      ...t,
      performed_by_profile: t.performed_by ? profileMap.get(t.performed_by) ?? null : null,
    }));

    return NextResponse.json(transactionsWithProfile);
  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
