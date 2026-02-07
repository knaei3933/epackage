/**
 * Specification Change API
 *
 * 顧客用仕様変更・再計算API
 * - 新しい仕様で単価再計算
 * - 元の金額との差額を計算
 * - 仕様変更承認用の新規見積を作成
 * - 管理者に通知を送信
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
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
  orderId: string;
  itemId: string;
  specifications: Specification;
  changeReason?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証確認
    const cookieStore = await cookies();
    const supabase = createClient(
      supabaseUrl!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = params.id;
    const body = await request.json() as SpecChangeRequest;

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
    const allowedStatuses = ['data_received', 'spec_approved', 'in_production'];
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
      bagTypeId: newSpecs.bagType || specs.bag_type || 'flat_3_side',
      materialId: newSpecs.materialId || specs.material || 'pet_al',
      width: newSpecs.width,
      height: newSpecs.height,
      depth: newSpecs.depth,
      quantity: orderItems.quantity,
      thicknessSelection: newSpecs.thicknessSelection || specs.thicknessSelection || 'standard',
      printingType: newSpecs.printingType || specs.printing_type || 'gravure',
      printingColors: newSpecs.printingColors || specs.printing_colors || 1,
      postProcessingOptions: newSpecs.postProcessingOptions || specs.post_processing || [],
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

    if (originalQuotation) {
      // 新しい見積を作成（仕様変更用）
      const { data: newQuotation } = await supabase
        .from('quotations')
        .insert({
          user_id: user.id,
          company_id: originalQuotation.company_id,
          quotation_number: `${originalQuotation.quotation_number}-REV`, // 修正版であることを示す
          quotation_status: 'DRAFT', // ドラフトで作成
          customer_name: originalQuotation.customer_name,
          customer_email: originalQuotation.customer_email,
          customer_phone: originalQuotation.customer_phone,
          subtotal_amount: newQuoteResult.breakdown.subtotal,
          tax_amount: 0, // 後で計算済み
          total_amount: newPrice,
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: `仕様変更リクエスト\n変更理由: ${body.changeReason || '未入力'}`,
          admin_notes: `元注文: ${order.orderNumber}\n元見積: ${originalQuotation.quotation_number}`,
          sales_rep: originalQuotation.sales_rep
        })
        .select()
        .single();

      if (newQuotation) {
        // 新しい見積アイテムを作成
        await supabase
          .from('quotation_items')
          .insert({
            quotation_id: newQuotation.id,
            product_id: orderItems.product_id,
            product_name: orderItems.product_name + ' (仕様変更)',
            category: orderItems.category,
            quantity: orderItems.quantity,
            unit_price: newQuoteResult.unitPrice, // 小数点以下を保持
            total_price: newPrice,
            specifications: {
              ...specs,
              ...newSpecs,
              original_item_id: orderItems.id,
              change_reason: body.changeReason,
              change_date: new Date().toISOString()
            },
            notes: '仕様変更による再計算',
            display_order: 0
          });

        // 仕様変更履歴を記録（既存テーブルがある場合は使用、なければ注文履歴で管理）
        await supabase
          .from('order_audit_log')
          .insert({
            table_name: 'specification_changes',
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
            changed_by: user.id,
            metadata: {
              change_reason: body.changeReason,
              original_quotation_id: originalQuotation.id,
              new_quotation_id: newQuotation.id,
              order_id: orderId
            }
          });
      }
    }

    // 管理者への通知送信
    try {
      // 管理者ユーザーを取得（role = 'ADMIN'）
      const { data: adminUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'ADMIN')
        .eq('status', 'ACTIVE');

      if (adminUsers && adminUsers.length > 0) {
        // 通知サービスの初期化
        const notificationService = new UnifiedNotificationService();
        await notificationService.initialize();

        // 価格変化に基づいて通知メッセージを作成
        const priceChangeText = priceDifference > 0
          ? `+¥${priceDifference.toLocaleString()} (${differencePercentage.toFixed(1)}%)`
          : priceDifference < 0
          ? `¥${Math.abs(priceDifference).toLocaleString()} (${differencePercentage.toFixed(1)}%)`
          : '変更なし';

        // 各管理者に通知を作成
        for (const admin of adminUsers) {
          await notificationService.createNotification({
            recipientId: admin.id,
            recipientType: 'admin',
            type: 'spec_change_request',
            title: '仕様変更リクエスト',
            message: `顧客 ${originalQuotation.customer_name} が注文 ${order.order_number} の仕様変更をリクエストしました。\n金額変化: ${priceChangeText}\n変更理由: ${body.changeReason || '未入力'}`,
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
              customerId: user.id,
              customerEmail: originalQuotation.customer_email
            },
            actionUrl: `/admin/orders/${order.id}`,
            actionLabel: '注文詳細を確認'
          });
        }

        console.log('[Spec Change API] Admin notifications sent');
      }
    } catch (notificationError) {
      // 通知エラーはメイン処理に影響しない
      console.error('[Spec Change API] Failed to send admin notification:', notificationError);
    }

    return NextResponse.json({
      success: true,
      originalPrice,
      newPrice,
      priceDifference,
      differencePercentage,
      message: priceDifference > 0
        ? `金額が¥${priceDifference.toLocaleString()}増加します`
        : priceDifference < 0
        ? `金額が¥${Math.abs(priceDifference).toLocaleString()}減少します`
        : '金額に変更はありません'
    });

  } catch (error) {
    console.error('[Specification Change API] Error:', error);
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
