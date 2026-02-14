/**
 * Admin Specification Change API
 *
 * 管理者用仕様変更・再計算API
 * - 注文後の仕様変更を管理者が処理
 * - 新しい仕様で単価再計算
 * - 元の金額との差額を計算
 * - 仕様変更承認用の新規見積を作成
 * - 顧客に通知を送信
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { UnifiedNotificationService } from '@/lib/unified-notifications';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface Specification {
  width: number;
  height: number;
  depth?: number;
  materialId?: string;
  bagType?: string;
  printingType?: string;
  printingColors?: number;
  postProcessingOptions?: string[];
  thicknessSelection?: string;
}

interface SpecChangeRequest {
  itemId: string;
  specifications: Specification;
  changeReason?: string;
  notifyCustomer?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 管理者認証確認
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: orderId } = await params;
    const body = await request.json() as SpecChangeRequest;

    // Supabaseクライアント作成（サービスロール）
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // 注文の詳細を取得
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 注文アイテムを取得
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .eq('id', body.itemId)
      .single();

    if (!orderItems) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }

    // 注文ステータス確認（データ入稿後のみ変更可能）
    const allowedStatuses = ['data_received', 'spec_approved', 'in_production', 'work_order', 'contract_sent', 'contract_signed'];
    if (!allowedStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: '仕様変更はデータ入稿後のみ可能です' },
        { status: 400 }
      );
    }

    // =====================================================
    // 再計算ロジック (unified-pricing-engineを使用)
    // =====================================================

    // unified-pricing-engineを動的インポート
    const { unifiedPricingEngine } = await import('@/lib/unified-pricing-engine');

    // specificationsから必要なパラメータを構築
    const specs = orderItems.specifications as any;
    const newSpecs = body.specifications;

    // unified-pricing-engine用のパラメータを構築
    const quoteParams = {
      bagTypeId: newSpecs.bagType || specs.bag_type || specs.bagTypeId || 'flat_3_side',
      materialId: newSpecs.materialId || specs.material || specs.materialId || 'pet_al',
      width: newSpecs.width,
      height: newSpecs.height,
      depth: newSpecs.depth,
      quantity: orderItems.quantity,
      thicknessSelection: newSpecs.thicknessSelection || specs.thicknessSelection || 'standard',
      printingType: newSpecs.printingType || specs.printing_type || specs.printingType || 'gravure',
      printingColors: newSpecs.printingColors || specs.printing_colors || specs.printingColors || 1,
      postProcessingOptions: newSpecs.postProcessingOptions || specs.post_processing || specs.postProcessingOptions || [],
      skuQuantities: specs.sku_quantities || [orderItems.quantity],
      useSKUCalculation: true
    };

    // 新しい価格を計算
    const newQuoteResult = await unifiedPricingEngine.calculateQuote(quoteParams);

    // 価格差額を計算
    const originalPrice = orderItems.total_price;
    const newPrice = newQuoteResult.totalPrice;
    const priceDifference = newPrice - originalPrice;
    const differencePercentage = originalPrice > 0 ? (priceDifference / originalPrice) * 100 : 0;

    // =====================================================
    // 仕様変更承認用見積を作成
    // =====================================================

    // 元の見積情報を取得
    const { data: originalQuotation } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', order.quotation_id)
      .single();

    let newQuotationId: string | null = null;

    if (originalQuotation) {
      // 顧客情報を取得
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_name')
        .eq('id', order.user_id)
        .maybeSingle();

      // 新しい見積を作成（仕様変更用）
      const { data: newQuotation } = await supabase
        .from('quotations')
        .insert({
          user_id: order.user_id,
          company_id: originalQuotation.company_id || profile?.company_name,
          quotation_number: `${originalQuotation.quotation_number}-REV-${Date.now()}`, // 管理者による修正版であることを示す
          status: 'DRAFT', // ドラフトで作成
          customer_name: originalQuotation.customer_name,
          customer_email: originalQuotation.customer_email,
          customer_phone: originalQuotation.customer_phone,
          subtotal_amount: newQuoteResult.breakdown.subtotal,
          tax_amount: newQuoteResult.breakdown.tax || 0,
          total_amount: newPrice,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: `【管理者による仕様変更】\n変更理由: ${body.changeReason || '未入力'}\n変更者: ${auth.userId}`,
          admin_notes: `元注文: ${order.order_number}\n元見積: ${originalQuotation.quotation_number}\n変更元価格: ¥${originalPrice.toLocaleString()}`,
          sales_rep: originalQuotation.sales_rep
        })
        .select()
        .single();

      if (newQuotation) {
        newQuotationId = newQuotation.id;

        // 新しい見積アイテムを作成
        await supabase
          .from('quotation_items')
          .insert({
            quotation_id: newQuotation.id,
            product_id: orderItems.product_id,
            product_name: orderItems.product_name + ' (管理者仕様変更)',
            category: orderItems.category,
            quantity: orderItems.quantity,
            unit_price: newQuoteResult.unitPrice, // 小数点以下を保持
            total_price: newPrice,
            specifications: {
              ...specs,
              ...newSpecs,
              original_item_id: orderItems.id,
              change_reason: body.changeReason,
              change_date: new Date().toISOString(),
              changed_by: 'admin',
              admin_user_id: auth.userId
            },
            notes: `管理者による仕様変更: ¥${originalPrice.toLocaleString()} → ¥${newPrice.toLocaleString()}`,
            display_order: 0
          });
      }
    }

    // 仕様変更履歴を記録
    await supabase
      .from('order_audit_log')
      .insert({
        table_name: 'order_items',
        record_id: orderItems.id,
        action: 'UPDATE',
        old_data: {
          specifications: specs,
          price: originalPrice
        },
        new_data: {
          specifications: newSpecs,
          price: newPrice
        },
        changed_fields: ['specifications', 'unit_price', 'total_price'],
        changed_by: auth.userId,
        metadata: {
          change_reason: body.changeReason,
          original_quotation_id: originalQuotation?.id,
          new_quotation_id: newQuotationId,
          order_id: orderId,
          changed_by_admin: true
        }
      });

    // 顧客への通知送信（オプション）
    if (body.notifyCustomer && originalQuotation) {
      try {
        // 通知サービスの初期化
        const notificationService = new UnifiedNotificationService();
        await notificationService.initialize();

        // 価格変化に基づいて通知タイプとメッセージを作成
        const notificationType = priceDifference > 0 ? 'spec_change_price_increase' : 'spec_change_price_decrease';
        const priceChangeText = priceDifference > 0
          ? `+¥${priceDifference.toLocaleString()} (${differencePercentage.toFixed(1)}%) の増加`
          : priceDifference < 0
          ? `¥${Math.abs(priceDifference).toLocaleString()} (${differencePercentage.toFixed(1)}%) の減少`
          : '変更なし';

        // 通知を作成
        await notificationService.createNotification({
          recipientId: order.user_id,
          recipientType: 'member',
          type: notificationType,
          title: '仕様変更のお知らせ',
          message: `注文 ${order.order_number} の仕様が変更されました。\n金額: ${priceChangeText}\n変更理由: ${body.changeReason || '管理者による変更'}`,
          relatedId: order.id,
          relatedType: 'order',
          priority: priceDifference > 10000 ? 'high' : 'normal',
          metadata: {
            originalPrice,
            newPrice,
            priceDifference,
            differencePercentage,
            originalSpecs: specs,
            newSpecs: newSpecs,
            changeReason: body.changeReason,
            newQuotationId,
            changedByAdmin: true
          },
          actionUrl: `/member/orders/${order.id}`,
          actionLabel: '注文詳細を確認'
        });

        console.log('[Admin Spec Change] Customer notification sent for order:', orderId);
      } catch (notificationError) {
        // 通知エラーはメイン処理に影響しない
        console.error('[Admin Spec Change] Failed to send notification:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      originalPrice,
      newPrice,
      priceDifference,
      differencePercentage,
      newQuotationId,
      message: priceDifference > 0
        ? `金額が¥${priceDifference.toLocaleString()}増加します`
        : priceDifference < 0
        ? `金額が¥${Math.abs(priceDifference).toLocaleString()}減少します`
        : '金額に変更はありません'
    });

  } catch (error) {
    console.error('[Admin Specification Change API] Error:', error);
    return NextResponse.json(
      { error: '仕様変更の処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }});
}
