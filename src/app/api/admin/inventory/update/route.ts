import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST handler - Update inventory quantity
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { inventoryId, productId, quantity, transactionType, reason } = body;

    // Validate required fields
    if (!inventoryId || !productId || quantity === undefined || !transactionType) {
      return NextResponse.json(
        { error: { code: 'MISSING_FIELDS', message: '必須フィールドが不足しています' } },
        { status: 400 }
      );
    }

    // Validate transaction type
    const validTransactionTypes = ['receipt', 'issue', 'adjustment', 'transfer', 'return', 'production_in', 'production_out'];
    if (!validTransactionTypes.includes(transactionType)) {
      return NextResponse.json(
        { error: { code: 'INVALID_TRANSACTION_TYPE', message: '無効な取引タイプです' } },
        { status: 400 }
      );
    }

    // Calculate new quantities
    const quantityChange = parseInt(quantity.toString());
    if (isNaN(quantityChange) || quantityChange === 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_QUANTITY', message: '有効な数量を入力してください' } },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = createServiceClient();

    // Get current inventory
    const { data: currentInventory, error: fetchError } = await supabase
      .from('inventory')
      .select('id, quantity_on_hand, quantity_available')
      .eq('id', inventoryId)
      .single();

    if (fetchError || !currentInventory) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: '在庫レコードが見つかりません' } },
        { status: 404 }
      );
    }

    // Update inventory
    const newQuantityOnHand = Math.max(0, currentInventory.quantity_on_hand + quantityChange);
    const newQuantityAvailable = Math.max(0, currentInventory.quantity_available + quantityChange);

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
      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: '在庫の更新に失敗しました' } },
        { status: 500 }
      );
    }

    // Create inventory transaction record
    const referenceNumber = `MANUAL-${Math.random().toString(36).substring(2, 10)}`;

    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert({
        inventory_id: inventoryId,
        product_id: productId,
        transaction_type: transactionType,
        quantity: quantityChange,
        reference_number: referenceNumber,
        notes: reason || null,
        transaction_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
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
          quantity: quantityChange,
        },
      },
    });
  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : '在庫更新に失敗しました',
        },
      },
      { status: 500 }
    );
  }
}
