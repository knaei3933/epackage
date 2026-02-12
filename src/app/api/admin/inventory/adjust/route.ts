export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseClient } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api-auth';
import { handleApiError, ValidationError } from '@/lib/api-error-handler';
import { uuidSchema } from '@/lib/validation-schemas';
import type { Database } from '@/types/database';

/**
 * POST /api/admin/inventory/adjust
 * 在庫調整を実行
 *
 * Fixed: Use atomic update to prevent race condition
 * - Previously: check-then-update pattern (vulnerable)
 * - Now: Atomic database operation with negative check
 */

// ============================================================
// Validation Schema
// ============================================================

const inventoryAdjustSchema = z.object({
  inventoryId: uuidSchema,
  quantity: z.number().int(),
  reason: z.string().optional(),
});

export const POST = withAdminAuth(async (request: NextRequest, auth) => {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json();
    const validationResult = inventoryAdjustSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError('Invalid request data', validationResult.error.errors);
    }

    const data = validationResult.data;
    const { inventoryId, quantity, reason } = data;

    // =====================================================
    // ATOMIC INVENTORY UPDATE (Race Condition Fix)
    // =====================================================
    // Use RPC function for atomic operation:
    // 1. Check if quantity_on_hand + adjustment >= 0
    // 2. Update in single database transaction
    // 3. Return updated value

    const { data: result, error: rpcError } = await supabase.rpc(
      'adjust_inventory_atomically',
      {
        p_inventory_id: inventoryId,
        p_quantity_adjustment: quantity,
      }
    );

    if (rpcError) {
      console.error('在庫調整エラー:', rpcError);

      // Handle specific error cases
      if (rpcError.message?.includes('insufficient stock') || rpcError.code === 'P0001') {
        return NextResponse.json(
          { error: '在庫不足', message: '調整量が現在在庫を超えています' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: '在庫の調整に失敗しました', details: rpcError.message },
        { status: 500 }
      );
    }

    if (!result) {
      return NextResponse.json(
        { error: '在庫調整結果を取得できませんでした' },
        { status: 500 }
      );
    }

    // Extract result from RPC function
    type InventoryResult = {
      inventory: Database['public']['Tables']['inventory']['Row'];
      previous_quantity: number;
      new_quantity: number;
    };

    const resultTyped = result as InventoryResult | null;
    const updatedInventory = resultTyped.inventory;
    const previousQuantity = resultTyped.previous_quantity;
    const newQuantity = resultTyped.new_quantity;

    // 移動履歴を記録
    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert({
        inventory_id: inventoryId,
        transaction_type: quantity > 0 ? 'receipt' : 'adjustment',
        quantity: quantity,
        quantity_before: previousQuantity,
        quantity_after: newQuantity,
        reason: reason || '手動調整',
        performed_by: auth.userId,
        transaction_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('移動履歴記録エラー:', transactionError);
    }

    return NextResponse.json({
      success: true,
      message: '在庫を調整しました',
      inventory: updatedInventory,
      previousQuantity: previousQuantity,
      newQuantity: newQuantity
    });
  } catch (error) {
    return handleApiError(error);
  }
});
