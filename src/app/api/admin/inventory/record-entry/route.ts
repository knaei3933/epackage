/**
 * Entry Recording API
 *
 * 入庫記録API - 詳細な追跡情報付き
 *
 * POST - Record inventory entry with reference tracking
 */

export const dynamic = 'force-dynamic';

import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import type { Database } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      productId,
      productName,
      productCode,
      quantity,
      warehouseLocation = 'MAIN',
      binLocation,
      referenceNumber,
      supplierName,
      entryDate,
      notes,
    } = body;

    // Validation
    if (!productId || !productName || !productCode || quantity === undefined) {
      return NextResponse.json(
        { error: '製品ID、製品名、製品コード、数量は必須です' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: '数量は0より大きい必要があります' },
        { status: 400 }
      );
    }

    if (!referenceNumber || !referenceNumber.trim()) {
      return NextResponse.json(
        { error: '参照番号は必須です' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Find or create inventory record
    const { data: existingInventory } = await supabase
      .from('inventory')
      .select('id, quantity_on_hand')
      .eq('product_id', productId)
      .eq('warehouse_location', warehouseLocation)
      .single();

    let inventoryId: string;
    let quantityBefore: number;
    let quantityAfter: number;

    if (existingInventory) {
      inventoryId = existingInventory.id;
      quantityBefore = existingInventory.quantity_on_hand;
      quantityAfter = quantityBefore + quantity;

      // Update existing inventory
      const { error: updateError } = await supabase
        .from('inventory')
        .update({
          quantity_on_hand: quantityAfter,
          updated_at: new Date().toISOString(),
        })
        .eq('id', inventoryId);

      if (updateError) {
        console.error('Inventory update error:', updateError);
        throw new Error('在庫更新に失敗しました');
      }
    } else {
      // Create new inventory record
      const { data: newInventory, error: createError } = await supabase
        .from('inventory')
        .insert({
          product_id: productId,
          product_name: productName,
          product_code: productCode,
          warehouse_location: warehouseLocation,
          bin_location: binLocation || null,
          quantity_on_hand: quantity,
          quantity_allocated: 0,
          reorder_point: 10,
          max_stock_level: null,
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Inventory creation error:', createError);
        throw new Error('在庫レコード作成に失敗しました');
      }

      inventoryId = newInventory.id;
      quantityBefore = 0;
      quantityAfter = quantity;
    }

    // Create transaction record with enhanced fields
    const transactionData: TransactionInsert = {
      inventory_id: inventoryId,
      transaction_type: 'receipt',
      quantity: quantity,
      quantity_before: quantityBefore,
      quantity_after: quantityAfter,
      reason: 'Inventory entry',
      performed_by: user.id,
      notes: notes ? { notes } : null,
      reference_number: referenceNumber.trim(),
      supplier_name: supplierName?.trim() || null,
      entry_date: entryDate || new Date().toISOString(),
    };

    const { error: transactionError } = await supabase
      .from('inventory_transactions')
      .insert(transactionData);

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      throw new Error('トランザクション記録に失敗しました');
    }

    return NextResponse.json({
      success: true,
      message: '入庫を記録しました',
      data: {
        inventoryId,
        quantityBefore,
        quantityAfter,
        quantityAdded: quantity,
        referenceNumber: referenceNumber.trim(),
        supplierName: supplierName?.trim() || null,
      },
    });
  } catch (error: unknown) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// GET - Fetch recent entries with reference information
export async function GET(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createSupabaseClient();

    // Fetch recent stock entries with reference information
    const { data: entries, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        inventory (
          product_name,
          product_code,
          warehouse_location,
          bin_location
        )
      `)
      .eq('transaction_type', 'receipt')
      .not('reference_number', 'is', null)
      .order('entry_date', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching entries:', error);
      return NextResponse.json(
        { error: '入庫記録の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      entries: entries || [],
    });
  } catch (error: unknown) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
