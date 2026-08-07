import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api-auth';
import { handleApiError, ValidationError } from '@/lib/api-error-handler';
import { uuidSchema } from '@/lib/validation-schemas';
import type { Database } from '@/types/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// Validation Schema
// ============================================================

const inventoryUpdateSchema = z.object({
  inventoryId: uuidSchema,
  productId: uuidSchema,
  quantity: z.number().int().refine((val) => val !== 0, {
    message: 'Quantity cannot be zero'
  }),
  transactionType: z.enum(['receipt', 'issue', 'adjustment', 'transfer', 'return', 'production_in', 'production_out']),
  reason: z.string().optional(),
});

/**
 * POST handler - Update inventory quantity
 */
export const POST = withAdminAuth(async (request: NextRequest, auth) => {
  try {
    const body = await request.json();
    const validationResult = inventoryUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError('Invalid request data', validationResult.error.errors);
    }

    const data = validationResult.data;
    const { inventoryId, productId, quantity, transactionType, reason } = data;

    const supabase = createServiceClient();

    // Get current inventory
    const { data: currentInventory, error: fetchError } = await supabase
      .from('inventory')
      .select('id, quantity_on_hand, quantity_available')
      .eq('id', inventoryId)
      .single();

    if (fetchError || !currentInventory) {
      throw new Error('Inventory record not found');
    }

    // Update inventory
    const newQuantityOnHand = Math.max(0, currentInventory.quantity_on_hand + quantity);
    const newQuantityAvailable = Math.max(0, currentInventory.quantity_available + quantity);

    const { data: updatedInventory, error: updateError } = await supabase
      .from('inventory')
      .update({
        quantity_on_hand: newQuantityOnHand,
        quantity_available: newQuantityAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventoryId)
      .select('id, product_id, quantity_on_hand, quantity_available, updated_at')
      .single();

    if (updateError || !updatedInventory) {
      throw new Error('Failed to update inventory');
    }

    // Create inventory transaction record
    // 注: inventory_transactions テーブルに product_id 列は存在しない（実DB schema確認済）。
    // productId は notes（Json）へ記録し、参照性を担保。reference_number/notes は実在カラム。
    const referenceNumber = `MANUAL-${Math.random().toString(36).substring(2, 10)}`;

    // notes（Json 型）へ構造化オブジェクトを保存。TS235 回避のため明示キャスト。
    const transactionNotes: Record<string, unknown> = reason
      ? { reason, product_id: productId }
      : { product_id: productId };

    // inventory_transactions Insert 型は quantity_before/quantity_after が必須。
    // 更新前後の在庫数量から算出（newQuantityOnHand は L54 で Math.max(0, ...) 済み）。
    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert({
        inventory_id: inventoryId,
        transaction_type: transactionType,
        quantity: quantity,
        quantity_before: currentInventory.quantity_on_hand,
        quantity_after: newQuantityOnHand,
        reference_number: referenceNumber,
        notes: transactionNotes as Database['public']['Tables']['inventory_transactions']['Insert']['notes'],
        transaction_at: new Date().toISOString(),
        // 注: inventory_transactions に created_at 列は存在しない（実DB schema 確認済）。
        // transaction_at で代替（DB default もある）。
      });

    if (transactionError) {
      console.error('Failed to create inventory transaction:', transactionError);
    }

    return NextResponse.json({
      success: true,
      data: {
        inventory: updatedInventory,
        transaction: {
          type: transactionType,
          quantity: quantity,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
});
