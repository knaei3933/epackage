/**
 * Admin Order Items Update API Route
 *
 * 管理者用商品明細更新 API
 * - PUT: 商品明細更新（管理者専用）
 * - Service Role Keyを使用してRLSを回避
 *
 * Features:
 * - order_itemsのspecifications、quantity、unit_priceを一括更新
 * - ordersテーブルの金額を再計算
 * - 監査ログ記録
 * - 通知送信
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { notifyModificationRequested } from '@/lib/customer-notifications';

// ============================================================
// Types
// ============================================================

const EDITABLE_STATUSES = [
  'DATA_UPLOAD_PENDING',         // データ入稿待ち
  'DATA_UPLOADED',               // データ受領済み
  'MODIFICATION_REJECTED',       // 修正拒否（再修正可能）
  'PROOF_CREATION_PENDING',      // 校正作成中
  'PROOF_SENT',                  // 校正データ送信済み
  'PROOF_APPROVAL_PENDING',      // 校正データ顧客承認待ち
];

// ============================================================
// Types
// ============================================================

interface ItemUpdate {
  specifications?: any;
  quantity?: number;
  unitPrice?: number;
}

interface UpdateRequest {
  items: {
    [itemId: string]: ItemUpdate;
  };
  regeneratePdf?: boolean;
  // 修正要求フロー用パラメータ
  requestModification?: boolean;
  modificationReason?: string;
}

// ============================================================
// PUT: 商品明細更新（管理者専用）
// ============================================================

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[Admin Order Items API] ========================================');
    console.log('[Admin Order Items API] PUT request received');

    const params = await context.params;
    const { id: orderId } = params;
    console.log('[Admin Order Items API] Order ID:', orderId);

    const body = await request.json() as UpdateRequest;
    console.log('[Admin Order Items API] Request body:', { itemCount: Object.keys(body.items).length });

    // Service clientを使用（RLS回避）
    const supabase = createServiceClient();
    console.log('[Admin Order Items API] Service client created');

    // 注文確認
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    console.log('[Admin Order Items API] Order query result:', {
      found: !!order,
      orderNumber: order?.order_number,
      currentStatus: order?.status,
      error: orderError?.message
    });

    if (orderError || !order) {
      console.error('[Admin Order Items API] Order not found:', orderError);
      return NextResponse.json(
        { error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    // ステータス確認（編集可能なステータスか）
    if (!EDITABLE_STATUSES.includes(order.status)) {
      console.warn('[Admin Order Items API] Status not editable:', order.status);
      return NextResponse.json(
        {
          error: 'このステータスでは編集できません',
          currentStatus: order.status,
          editableStatuses: EDITABLE_STATUSES
        },
        { status: 400 }
      );
    }

    // アイテム更新
    const updatedItems: any[] = [];
    let newSubtotal = 0;

    console.log('[Admin Order Items API] Processing items:', Object.keys(body.items));
    console.log('[Admin Order Items API] Order ID for query:', orderId);
    for (const [itemId, updateData] of Object.entries(body.items)) {
      console.log('[Admin Order Items API] Processing item:', itemId, 'updateData:', updateData);

      // 既存アイテムを取得
      const { data: existingItem, error: itemError } = await supabase
        .from('order_items')
        .select('*')
        .eq('id', itemId)
        .eq('order_id', orderId)
        .single();

      console.log('[Order Items API] Query result for item:', {
        itemId,
        orderId,
        found: !!existingItem,
        error: itemError?.message,
        existingItem: existingItem ? { id: existingItem.id, quantity: existingItem.quantity } : null
      });

      if (!existingItem) {
        console.warn(`[Order Items API] Item ${itemId} not found for order ${orderId}`);
        continue;
      }

      // 更新データの構築
      const updatePayload: any = {};

      if (updateData.specifications !== undefined) {
        updatePayload.specifications = updateData.specifications;
      }

      if (updateData.quantity !== undefined) {
        updatePayload.quantity = updateData.quantity;
      }

      if (updateData.unitPrice !== undefined) {
        updatePayload.unit_price = updateData.unitPrice;
      }

      // total_priceは生成列なので直接更新しない
      const quantity = updateData.quantity ?? existingItem.quantity;
      const unitPrice = updateData.unitPrice ?? existingItem.unit_price;
      // 計算用のtotal_price（生成列なのでDBが自動計算）
      const calculatedTotalPrice = quantity * unitPrice;

      console.log('[Order Items API] Updating item:', {
        itemId,
        quantity,
        unitPrice,
        calculatedTotalPrice
      });

      // アイテムを更新（total_priceは生成列なので更新しない）
      const { error: updateError } = await supabase
        .from('order_items')
        .update(updatePayload)
        .eq('id', itemId);

      console.log('[Order Items API] Update result:', {
        itemId,
        error: updateError?.message,
        details: updateError?.details
      });

      if (updateError) {
        console.error('[Order Items API] Update error:', updateError);
        continue; // Skip this item and continue with others
      }

      // 更新後のアイテムを取得
      const { data: updatedItem } = await supabase
        .from('order_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (updatedItem) {
        updatedItems.push(updatedItem);
        newSubtotal += updatedItem.total_price;
      } else {
        console.error('[Order Items API] Failed to fetch updated item, using calculated value');
        updatedItems.push({ ...existingItem, ...updatePayload });
        newSubtotal += calculatedTotalPrice;
      }
    }

    // 金額再計算
    const newTaxAmount = newSubtotal * 0.1; // 10% 消費税
    const newTotalAmount = newSubtotal + newTaxAmount;

    console.log('[Order Items API] Updating order totals:', {
      newSubtotal,
      newTaxAmount,
      newTotalAmount
    });

    // 注文更新データの構築
    const orderUpdateData: any = {
      subtotal: newSubtotal,
      tax_amount: newTaxAmount,
      total_amount: newTotalAmount,
      updated_at: new Date().toISOString(),
    };

    // 修正要求フローの処理
    if (body.requestModification && body.modificationReason) {
      console.log('[Order Items API] Requesting modification approval');
      orderUpdateData.status = 'MODIFICATION_REQUESTED';
      orderUpdateData.modification_reason = body.modificationReason;
      orderUpdateData.modification_requested_at = new Date().toISOString();

      // 修正前の仕様を保存（履歴用）
      orderUpdateData.previous_specifications = order.items?.map((item: any) => ({
        id: item.id,
        specifications: item.specifications,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      console.log('[Order Items API] Modification request data prepared:', {
        reason: body.modificationReason,
        newStatus: 'MODIFICATION_REQUESTED',
      });
    }

    await supabase
      .from('orders')
      .update(orderUpdateData)
      .eq('id', orderId);

    // 監査ログ
    try {
      await supabase
        .from('audit_logs')
        .insert({
          table_name: 'order_items',
          record_id: orderId,
          action: 'UPDATE',
          old_value: {
            subtotal: order.subtotal,
            tax_amount: order.tax_amount,
            total_amount: order.total_amount,
          },
          new_value: {
            subtotal: newSubtotal,
            tax_amount: newTaxAmount,
            total_amount: newTotalAmount,
          },
          changed_by: 'ADMIN',
          reason: `Updated ${updatedItems.length} items`,
        });
    } catch (auditError) {
      console.warn('[Order Items API] Failed to create audit log:', auditError);
    }

    // 修正要求通知を顧客に送信
    if (body.requestModification && body.modificationReason) {
      try {
        await notifyModificationRequested(
          order.user_id,
          orderId,
          order.order_number,
          body.modificationReason
        );
        console.log('[Order Items API] Modification request notification sent to customer');
      } catch (notifError) {
        console.warn('[Order Items API] Failed to send notification:', notifError);
      }
    }

    console.log('[Order Items API] Update successful:', {
      orderId,
      orderNumber: order.order_number,
      updatedItemsCount: updatedItems.length,
      priceDifference: newTotalAmount - order.total_amount,
    });

    return NextResponse.json({
      success: true,
      message: '商品明細を更新しました',
      data: {
        updatedItems,
        newSubtotal,
        newTaxAmount,
        newTotalAmount,
        priceDifference: newTotalAmount - order.total_amount,
      }
    });

  } catch (error) {
    console.error('[Admin Order Items API] PUT error:', error);
    return NextResponse.json(
      {
        error: '商品明細の更新中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: 商品明細取得
// ============================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[Admin Order Items API] GET request received');

    const params = await context.params;
    const { id: orderId } = params;

    const supabase = createServiceClient();

    const { data: items, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[Admin Order Items API] GET error:', error);
      return NextResponse.json(
        { error: 'アイテムの取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      items: items || []
    });

  } catch (error) {
    console.error('[Admin Order Items API] GET error:', error);
    return NextResponse.json(
      { error: 'アイテムの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

// OPTIONSメソッド - CORS preflightリクエスト処理
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
