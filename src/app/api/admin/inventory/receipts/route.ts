/**
 * Stock Receipt Recording API
 *
 * 入庫記録API
 *
 * POST - Record stock receipt to inventory
 */

export const dynamic = 'force-dynamic';

import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const {
      product_id,
      product_name,
      product_code,
      quantity,
      warehouse_location = 'MAIN',
      bin_location,
      reason = 'Stock receipt',
      notes
    } = body;

    // Validation
    if (!product_id || !product_name || !product_code || quantity === undefined) {
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

    const supabase = createSupabaseClient();

    // Record stock receipt using RPC function
    const { data: result, error: rpcError } = await supabase.rpc('record_stock_receipt', {
      p_product_id: product_id,
      p_product_name: product_name,
      p_product_code: product_code,
      p_quantity: quantity,
      p_performed_by: user.id,
      p_warehouse_location: warehouse_location,
      p_bin_location: bin_location || null,
      p_reason: reason,
      p_notes: notes || null
    });

    if (rpcError) {
      console.error('Stock receipt error:', rpcError);
      return NextResponse.json(
        { error: '入庫記録に失敗しました', details: rpcError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '入庫を記録しました',
      inventory: result,
    });
  } catch (error: unknown) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

// GET - Fetch recent stock receipts
export async function GET(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createSupabaseClient();

    // Fetch recent stock receipts (transaction_type = 'receipt')
    const { data: receipts, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        inventory (
          product_name,
          product_code,
          warehouse_location
        )
      `)
      .eq('transaction_type', 'receipt')
      .order('transaction_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching receipts:', error);
      return NextResponse.json(
        { error: '入庫記録の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      receipts: receipts || [],
    });
  } catch (error: unknown) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
