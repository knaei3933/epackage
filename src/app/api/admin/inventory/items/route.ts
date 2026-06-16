import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import type { Database } from '@/types/database';

type InventoryRow = Database['public']['Tables']['inventory']['Row'];

/** 変換後の在庫アイテム型（API レスポンス用） */
interface TransformedInventoryItem {
  id: string;
  productId: string;
  productName: string;
  productCode: string;
  warehouseLocation: string | null;
  binLocation: string | null;
  quantityOnHand: number;
  quantityAllocated: number;
  quantityAvailable: number;
  reorderPoint: number;
  maxStockLevel: number | null;
  needsReorder: boolean;
  updatedAt: string;
}

/**
 * GET /api/admin/inventory/items
 * 在庫アイテム一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createSupabaseClient();

    const searchParams = request.nextUrl.searchParams;
    const filterLocation = searchParams.get('location');
    const reorderOnly = searchParams.get('reorderOnly') === 'true';

    let query = supabase
      .from('inventory')
      .select(`
        *,
        products!inner(
          id,
          name_ja,
          product_code
        )
      `)
      .order('warehouse_location', { ascending: true });

    if (filterLocation && filterLocation !== 'all') {
      query = query.eq('warehouse_location', filterLocation);
    }

    const { data: inventory, error } = await query;

    if (error) {
      console.error('在庫取得エラー:', error);
      return NextResponse.json(
        { error: '在庫の取得に失敗しました' },
        { status: 500 }
      );
    }

    // データ変換
    const transformedInventory = inventory?.map((item: InventoryRow) => ({
      id: item.id,
      productId: item.product_id,
      productName: (item as any).products?.name_ja || '',
      productCode: (item as any).products?.product_code || '',
      warehouseLocation: item.warehouse_location,
      binLocation: item.bin_location,
      quantityOnHand: item.quantity_on_hand,
      quantityAllocated: item.quantity_allocated,
      quantityAvailable: item.quantity_available,
      reorderPoint: item.reorder_point,
      maxStockLevel: item.max_stock_level,
      needsReorder: item.quantity_available <= item.reorder_point,
      updatedAt: item.updated_at
    })) || [];

    // 再注文のみフィルター
    let result = transformedInventory;
    if (reorderOnly) {
      result = result.filter((item: TransformedInventoryItem) => item.needsReorder);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
