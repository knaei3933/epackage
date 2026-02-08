/**
 * Admin Order Manual Discount API Route
 *
 * 管理者用手動割引 API
 * - POST: 手動割引率(%)を適用
 * - Service Role Keyを使用してRLSを回避
 *
 * Features:
 * - 注文に手動割引率(%)を適用
 * - 小計に対して割引額を計算
 * - 消費税と合計金額を再計算
 * - クーポン適用後の金額に対して手動割引を適用
 * - 監査ログ記録
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

// ============================================================
// Types
// ============================================================

interface ApplyDiscountRequest {
  discountPercentage: number;
}

interface Order {
  id: string;
  order_number: string;
  subtotal: number | null;
  tax_amount: number | null;
  total_amount: number;
  manual_discount_percentage: number;
  manual_discount_amount: number;
}

// ============================================================
// POST: 手動割引適用
// ============================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[Admin Manual Discount API] ========================================');
    console.log('[Admin Manual Discount API] POST request received');

    const params = await context.params;
    const orderId = params.id;
    console.log('[Admin Manual Discount API] Order ID:', orderId);

    const body = await request.json() as ApplyDiscountRequest;
    const { discountPercentage } = body;

    // バリデーション
    if (typeof discountPercentage !== 'number' || discountPercentage < 0 || discountPercentage > 100) {
      console.warn('[Admin Manual Discount API] Invalid discount percentage:', discountPercentage);
      return NextResponse.json(
        { error: '割引率は0〜100の間で指定してください' },
        { status: 400 }
      );
    }

    console.log('[Admin Manual Discount API] Discount percentage:', discountPercentage);

    // Service clientを使用（RLS回避）
    const supabase = createServiceClient() as any;
    console.log('[Admin Manual Discount API] Service client created');

    // 注文確認
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    console.log('[Admin Manual Discount API] Order query result:', {
      found: !!order,
      error: orderError?.message
    });

    if (orderError || !order) {
      console.error('[Admin Manual Discount API] Order not found:', orderError);
      return NextResponse.json(
        { error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    // Type narrowing - order is now guaranteed to be non-null
    const orderData: Order = order;

    // 現在の小計を取得（クーポン割引後の金額があればそれを使用）
    const baseAmount = orderData.subtotal || 0;

    // 手動割引額を計算
    const manualDiscountAmount = Math.round(baseAmount * (discountPercentage / 100));

    // 割引後の小計
    const discountedSubtotal = baseAmount - manualDiscountAmount;

    // 消費税（10%）を再計算
    const newTaxAmount = Math.round(discountedSubtotal * 0.1);

    // 合計金額を再計算
    const newTotalAmount = discountedSubtotal + newTaxAmount;

    console.log('[Admin Manual Discount API] Calculated amounts:', {
      baseAmount,
      discountPercentage,
      manualDiscountAmount,
      discountedSubtotal,
      newTaxAmount,
      newTotalAmount,
      previousTotal: orderData.total_amount
    });

    // 注文更新
    const orderUpdateData: any = {
      manual_discount_percentage: discountPercentage,
      manual_discount_amount: manualDiscountAmount,
      subtotal: discountedSubtotal,
      tax_amount: newTaxAmount,
      total_amount: newTotalAmount,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('orders')
      .update(orderUpdateData)
      .eq('id', orderId);

    if (updateError) {
      console.error('[Admin Manual Discount API] Update error:', updateError);
      return NextResponse.json(
        { error: '注文の更新に失敗しました' },
        { status: 500 }
      );
    }

    // 監査ログ
    try {
      // @ts-ignore - audit_logs type may not match exactly
      await supabase
        .from('audit_logs')
        .insert({
          table_name: 'orders',
          record_id: orderId,
          action: 'UPDATE',
          old_value: {
            manual_discount_percentage: orderData.manual_discount_percentage,
            manual_discount_amount: orderData.manual_discount_amount,
            subtotal: orderData.subtotal,
            tax_amount: orderData.tax_amount,
            total_amount: orderData.total_amount,
          },
          new_value: {
            manual_discount_percentage: discountPercentage,
            manual_discount_amount: manualDiscountAmount,
            subtotal: discountedSubtotal,
            tax_amount: newTaxAmount,
            total_amount: newTotalAmount,
          },
          changed_by: 'ADMIN',
          reason: `Manual discount ${discountPercentage}% applied`,
        });
    } catch (auditError) {
      console.warn('[Admin Manual Discount API] Failed to create audit log:', auditError);
    }

    console.log('[Admin Manual Discount API] Discount applied successfully:', {
      orderId,
      orderNumber: orderData.order_number,
      discountPercentage,
      manualDiscountAmount,
      newTotalAmount,
      totalDifference: newTotalAmount - orderData.total_amount,
    });

    return NextResponse.json({
      success: true,
      message: `割引${discountPercentage}%を適用しました`,
      data: {
        discountPercentage,
        discountAmount: manualDiscountAmount,
        newSubtotal: discountedSubtotal,
        newTaxAmount,
        newTotal: newTotalAmount,
        previousTotal: orderData.total_amount,
        totalDifference: newTotalAmount - orderData.total_amount,
      }
    });

  } catch (error) {
    console.error('[Admin Manual Discount API] POST error:', error);
    return NextResponse.json(
      {
        error: '手動割引の適用中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE: 手動割引をクリア
// ============================================================

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[Admin Manual Discount API] DELETE request received');

    const params = await context.params;
    const orderId = params.id;

    const supabase = createServiceClient() as any;

    // 注文確認
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    // Type narrowing
    const orderData: Order = order;

    // 現在の手動割引額を元に戻して計算
    const baseSubtotal = (orderData.subtotal || 0) + (orderData.manual_discount_amount || 0);
    const newTaxAmount = Math.round(baseSubtotal * 0.1);
    const newTotalAmount = baseSubtotal + newTaxAmount;

    // 手動割引をクリア
    const orderUpdateData = {
      manual_discount_percentage: 0,
      manual_discount_amount: 0,
      subtotal: baseSubtotal,
      tax_amount: newTaxAmount,
      total_amount: newTotalAmount,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('orders')
      .update(orderUpdateData as any)
      .eq('id', orderId);

    if (updateError) {
      return NextResponse.json(
        { error: '注文の更新に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '手動割引をクリアしました',
      data: {
        discountPercentage: 0,
        discountAmount: 0,
        newSubtotal: baseSubtotal,
        newTaxAmount,
        newTotal: newTotalAmount,
      }
    });

  } catch (error) {
    console.error('[Admin Manual Discount API] DELETE error:', error);
    return NextResponse.json(
      { error: '手動割引のクリア中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// OPTIONSメソッド - CORS preflightリクエスト処理
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
