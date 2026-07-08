/**
 * Convert Approved Quotation to Order API (Member Portal - Migrated from B2B)
 *
 * 承認された見積を注文に変換するAPI
 *
 * Allows customers to convert their approved quotations to orders
 * POST /api/member/quotations/[id]/convert - Convert quotation to order
 * GET /api/member/quotations/[id]/convert - Check conversion eligibility
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { sendEmail } from '@/lib/email';
import { subject as poSubject, plainText as poPlainText, html as poHtml, type PurchaseOrderData, type PurchaseOrderItemData } from '@/lib/email/templates/purchase_order';
import { MANUFACTURER_ORDER_EMAIL, PRICING_CONSTANTS } from '@/lib/pricing/core/constants';

// ============================================================
// Types
// ============================================================

interface ConvertToOrderRequest {
  quotationId: string;
  notes?: string;
  selectedItemIds?: string[];
  deliveryAddress?: {
    postalCode: string;
    prefecture: string;
    city: string;
    address: string;
    building?: string;
    contactPerson?: string;
    contactPhone?: string;
  };
}

/**
 * Helper: Get authenticated user
 */
async function getAuthenticatedUser(request: NextRequest) {
  // Normal auth: Use cookie-based auth with createSupabaseSSRClient
  const { client: supabase } = await createSupabaseSSRClient(request);
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const userId = authUser.id;
  const user = authUser;
  console.log('[Convert to Order] Authenticated user:', userId);

  return { userId, user };
}

// ============================================================
// POST: Convert Quotation to Order
// ============================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: quotationId } = params;

    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId, user } = authResult;

    // Parse request body
    const body: ConvertToOrderRequest = await request.json();
    const { notes, deliveryAddress, selectedItemIds } = body;

    // Use normal SSR client with cookie auth
    const { client: supabase } = await createSupabaseSSRClient(request);

    // Get quotation data (simple query first)
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        { success: false, error: '見積が見つかりません。' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (quotation.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'convert_quotation_to_order',
      userId,
      route: '/api/member/quotations/[id]/convert',
    });

    // Check if order already exists (check FIRST before status validation)
    // This allows returning existing order even if quotation was already converted
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number')
      .eq('quotation_id', quotationId)
      .maybeSingle();

    if (existingOrder) {
      return NextResponse.json(
        {
          success: true,
          data: existingOrder,
          message: '既に注文が生成されています。',
          alreadyExists: true,
        },
        { status: 200 }
      );
    }

    // Approval gate removed: all quotations are orderable regardless of status.
    // Only block terminal statuses that make conversion meaningless.
    const quotationStatus = quotation.status as unknown as string;
    const isTerminal = quotationStatus === 'cancelled' || quotationStatus === 'CANCELLED';

    if (isTerminal) {
      return NextResponse.json(
        {
          success: false,
          error: 'この見積はキャンセルされているため注文に変換できません。',
          currentStatus: quotation.status,
        },
        { status: 400 }
      );
    }

    // Check if expired
    if (quotation.valid_until && new Date(quotation.valid_until) < new Date()) {
      return NextResponse.json(
        { success: false, error: '有効期限切れの見積です。' },
        { status: 400 }
      );
    }

    // Issue 4 fix: Generate phone-friendly order number.
    // Format: ORD-YYYY-XXXXXXX (7 chars, unambiguous alphabet: no 0/O/1/I/L)
    // The 7-char tail is short enough to dictate over the phone ("末尾7桁は〜")
    // Collision-safe: checked against existing orders, regenerated if needed.
    const ORDER_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const generateOrderCode = (): string => {
      let code = '';
      for (let i = 0; i < 7; i++) {
        code += ORDER_CODE_ALPHABET[Math.floor(Math.random() * ORDER_CODE_ALPHABET.length)];
      }
      return code;
    };
    let orderNumber = `ORD-${new Date().getFullYear()}-${generateOrderCode()}`;
    let collisionGuard = 0;
    while (collisionGuard < 5) {
      const { data: conflict } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber)
        .maybeSingle();
      if (!conflict) break;
      orderNumber = `ORD-${new Date().getFullYear()}-${generateOrderCode()}`;
      collisionGuard++;
    }

    // Get or create delivery and billing addresses
    // Note: delivery_address_id / billing_address_id are not on the generated
    // quotation Row type but exist in the actual schema (Json metadata or
    // additional columns). Cast to access them without changing behavior.
    const quotationRow = quotation as unknown as Record<string, any>;
    let deliveryAddressId = quotationRow.delivery_address_id;
    let billingAddressId = quotationRow.billing_address_id;

    // Priority for delivery address:
    // 1. Use quotation's delivery_address_id if exists
    // 2. Use registered default delivery address (is_default = true)
    // 3. Create from user profile (registration address)
    if (!deliveryAddressId) {
      const { data: defaultDelivery } = await supabaseAdmin
        .from('delivery_addresses')
        .select('id')
        .eq('user_id', userId)
        .eq('is_default', true)
        .maybeSingle();

      if (defaultDelivery) {
        deliveryAddressId = defaultDelivery.id;
      } else {
        // Create delivery address from user profile
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('kanji_last_name, kanji_first_name, company_name, postal_code, prefecture, city, street, building')
          .eq('id', userId)
          .single();

        if (profile) {
          const fullName = (profile.kanji_last_name && profile.kanji_first_name)
            ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
            : profile.company_name || 'お客様';

          const { data: newDeliveryAddress } = await supabaseAdmin
            .from('delivery_addresses')
            .insert({
              user_id: userId,
              name: fullName,
              postal_code: profile.postal_code || '',
              prefecture: profile.prefecture || '',
              city: profile.city || '',
              address: profile.street || '',
              building: profile.building || '',
              phone: '',
              is_default: true,
            })
            .select('id')
            .single();

          deliveryAddressId = newDeliveryAddress?.id || null;
        }
      }
    }

    // Same priority for billing address
    if (!billingAddressId) {
      const { data: defaultBilling } = await supabaseAdmin
        .from('billing_addresses')
        .select('id')
        .eq('user_id', userId)
        .eq('is_default', true)
        .maybeSingle();

      if (defaultBilling) {
        billingAddressId = defaultBilling.id;
      } else {
        // Create billing address from user profile
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('kanji_last_name, kanji_first_name, company_name, postal_code, prefecture, city, street, building, email')
          .eq('id', userId)
          .single();

        if (profile) {
          const companyName = profile.company_name ||
            ((profile.kanji_last_name && profile.kanji_first_name)
              ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
              : 'お客様');

          const { data: newBillingAddress } = await supabaseAdmin
            .from('billing_addresses')
            .insert({
              user_id: userId,
              company_name: companyName,
              postal_code: profile.postal_code || '',
              prefecture: profile.prefecture || '',
              city: profile.city || '',
              address: profile.street || '',
              building: profile.building || '',
              email: profile.email || '',
              is_default: true,
            })
            .select('id')
            .single();

          billingAddressId = newBillingAddress?.id || null;
        }
      }
    }

    // Get quotation items to copy to order
    let quotationItemsQuery = supabaseAdmin
      .from('quotation_items')
      .select('*')
      .eq('quotation_id', quotationId);

    // Filter by selected item IDs if provided (partial pattern order)
    if (selectedItemIds && Array.isArray(selectedItemIds) && selectedItemIds.length > 0) {
      quotationItemsQuery = quotationItemsQuery.in('id', selectedItemIds);
    }

    const { data: quotationItems, error: itemsError } = await quotationItemsQuery;

    if (itemsError) {
      console.error('[Convert to Order] Failed to fetch quotation items:', itemsError);
      return NextResponse.json(
        { success: false, error: '見積アイテムの取得に失敗しました。', details: itemsError?.message },
        { status: 500 }
      );
    }

    // Create order directly with contract skip
    // 새로운 워크플로우: 견적 승인 후 DATA_UPLOAD_PENDING 상태로 시작
    const { data: order, error: createError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        quotation_id: quotationId,
        order_number: orderNumber,
        status: 'DATA_UPLOAD_PENDING',  // 새 워크플로우: 데이터 입고 대기
        current_stage: 'AWAITING_DATA',  // 데이터 입고 대기
        // 財務スナップショット: 선택된 패턴만 주문하는 경우 항목에서 재계산,
        // 전체 주문인 경우 견적 헤더 값을 그대로 사용.
        ...(selectedItemIds && selectedItemIds.length > 0
          ? (() => {
              const itemSubtotal = Math.ceil(
                (quotationItems || []).reduce((sum: number, item: any) => sum + (item.total_price || item.quantity * item.unit_price || 0), 0) / 100
              ) * 100;
              const itemTax = Math.ceil(itemSubtotal * 0.1);
              const itemTotal = Math.ceil((itemSubtotal + itemTax) / 100) * 100;
              return {
                total_amount: itemTotal as number,
                subtotal: itemSubtotal as number,
                tax_amount: itemTax as number,
                coupon_id: null as string | null,
                discount_amount: 0 as number,
                discount_type: null as string | null,
              };
            })()
          : {
              total_amount: quotation.total_amount as number,
              subtotal: quotation.subtotal_amount as number,
              tax_amount: quotation.tax_amount as number,
              coupon_id: (quotation.coupon_id ?? null) as string | null,
              discount_amount: (quotation.discount_amount ?? 0) as number,
              discount_type: (quotation.discount_type ?? null) as string | null,
            }),
        customer_name: quotation.customer_name,
        customer_email: quotation.customer_email,
        customer_phone: quotation.customer_phone,
        delivery_address_id: deliveryAddressId,
        billing_address_id: billingAddressId,
        skip_contract: true,  // 계약서 프로세스 건너뛰기
      })
      .select()
      .single();

    if (createError || !order) {
      console.error('[Convert to Order] Create error:', createError);
      return NextResponse.json(
        { success: false, error: '注文作成中にエラーが発生しました。', details: createError?.message },
        { status: 500 }
      );
    }

    // Create initial status history entry
    // Note: cast the insert chain to Promise so .catch() is available
    // (supabase types the resolved insert as PromiseLike<void> which lacks .catch).
    await Promise.resolve(supabaseAdmin
      .from('order_status_history')
      .insert({
        order_id: order.id,
        from_status: '',
        to_status: 'DATA_UPLOAD_PENDING',
        changed_by: userId,
        changed_at: new Date().toISOString(),
        reason: '見積もりから注文作成（初期ステータス）',
      }))
      .then(() => console.log('[Convert to Order] Initial status history logged'))
      .catch((err) => console.error('[Convert to Order] Failed to log status history:', err));

    // Copy quotation items to order items with SKU split support
    if (quotationItems && quotationItems.length > 0) {
      const orderItems: any[] = [];

      for (const item of quotationItems) {
        const specs = item.specifications || {};
        const skuQuantities = specs.sku_quantities;

        // Check if SKU split exists
        if (skuQuantities && Array.isArray(skuQuantities) && skuQuantities.length > 1) {
          // Create separate order items for each SKU
          skuQuantities.forEach((skuQty: number, index: number) => {
            orderItems.push({
              order_id: order.id,
              product_id: item.product_id,
              product_name: `${item.product_name} (SKU${index + 1})`,
              quantity: skuQty,
              unit_price: item.unit_price,
              specifications: {
                ...specs,
                sku_index: index,
                sku_total: skuQuantities.length,
              },
            });
          });
          console.log('[Convert to Order] Split item into', skuQuantities.length, 'SKUs');
        } else {
          // No SKU split, copy as-is
          orderItems.push({
            order_id: order.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            specifications: item.specifications,
          });
        }
      }

      const { error: itemsInsertError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItems);

      if (itemsInsertError) {
        console.error('[Convert to Order] Failed to insert order items:', itemsInsertError);
        // Don't fail the order creation, just log the error
      } else {
        console.log('[Convert to Order] Copied', orderItems.length, 'items to order');
      }
    }

    // Update quotation status to converted
    // H-17: quotations.status = quotation_status enum は大文字（database.ts L272 / judgment6 SQL 前提）
    //   小文字 'converted' は DB 汚染の根因。大文字 'CONVERTED' へ修正（判断6 SQL と同時適用で再汚染防止）。
    await supabaseAdmin
      .from('quotations')
      .update({ status: 'CONVERTED' })
      .eq('id', quotationId);

    // Notify admins about new order
    const { data: admins } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('role', 'ADMIN');

    console.log('[Convert to Order] New order created by customer:', {
      orderId: order.id,
      orderNumber: order.order_number,
      quotationId,
      customerEmail: user.email,
      adminEmails: admins?.map((a: any) => a.email) || [],
    });

    // ========================================
    // Phase 3: 発注メール（製造社向け）送信 + purchase_orders 監査レコード保存
    // ========================================
    // 仕様: 製造社請求額 = 原価 × 1.4 (manufacturingMargin) + 国際配送費のみ。
    //       国内配送 1,600 JPY/箱 は発注額に含めない。販売価格は一切含めない。
    // 順序: purchase_orders insert 成功後にメール送信。メール失敗は非致命的（sent_at NULL で保持）。
    try {
      const exchangeRate = PRICING_CONSTANTS.EXCHANGE_RATE_KRW_TO_JPY; // 0.12

      // 選択された（または全件の）quotation_items を対象に製造社向け原価を集計
      const itemsForPo: PurchaseOrderItemData[] = (quotationItems || []).map((item: any) => {
        const cb = (item.cost_breakdown || {}) as Record<string, number>;
        const specs = (item.specifications || {}) as Record<string, any>;
        // baseCost: cost_breakdown.totalCost（原価）。フォールバックで film_cost_details.costJPY。
        const baseCostJPY = Number(cb.totalCost) || Number(item.film_cost_details?.costJPY) || 0;
        const manufacturingMarginJPY = Math.round(baseCostJPY * PRICING_CONSTANTS.MANUFACTURER_MARGIN);
        const manufacturerPriceJPY = baseCostJPY + manufacturingMarginJPY;
        // 国際配送費: cost_breakdown.intlShippingJPY が保存されていればそれを使用（国内1,600円/箱除外済み）。
        // フォールバック: 分離値がない旧データは delivery 全額を国際として扱う。
        const intlShippingJPY = Number(cb.intlShippingJPY) || Number(cb.delivery) || 0;
        const domesticShippingJPY = Number(cb.domesticShippingJPY) || 0;
        const deliveryBoxes = Number(cb.deliveryBoxes) || 0;

        return {
          product_name: item.product_name,
          quantity: item.quantity,
          bagTypeId: specs.bagTypeId,
          materialId: specs.materialId,
          width: specs.width,
          height: specs.height,
          depth: specs.depth,
          sideWidth: specs.sideWidth,
          thicknessSelection: specs.thicknessSelection,
          printingType: specs.printingType,
          printingColors: specs.printingColors,
          postProcessingOptions: specs.postProcessingOptions,
          zipper: specs.zipper,
          hasZipper: specs.postProcessingOptions?.some((o: string) => o?.includes('zipper')),
          sku_quantities: specs.sku_quantities,
          cost_breakdown: cb as any,
          film_cost_details: item.film_cost_details || specs.film_cost_details,
          baseCostJPY,
          manufacturingMarginJPY,
          manufacturerPriceJPY,
          intlShippingJPY,
          domesticShippingJPY,
          deliveryBoxes,
        };
      });

      const totalBaseCost = itemsForPo.reduce((s, i) => s + (i.baseCostJPY || 0), 0);
      const totalMargin = itemsForPo.reduce((s, i) => s + (i.manufacturingMarginJPY || 0), 0);
      const totalIntlShipping = itemsForPo.reduce((s, i) => s + (i.intlShippingJPY || 0), 0);
      const totalDomesticShipping = itemsForPo.reduce((s, i) => s + (i.domesticShippingJPY || 0), 0);
      const manufacturerAmountJPY = itemsForPo.reduce(
        (s, i) => s + ((i.manufacturerPriceJPY || 0) + (i.intlShippingJPY || 0)), 0
      );

      // 会社名取得
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('company_name')
        .eq('id', userId)
        .maybeSingle();
      const companyName = profile?.company_name || undefined;

      const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com';
      const poData: PurchaseOrderData = {
        quotation_number: quotation.quotation_number,
        order_number: order.order_number,
        customer_name: quotation.customer_name,
        company_name: companyName,
        manufacturer_amount_jpy: manufacturerAmountJPY,
        base_cost_jpy: totalBaseCost,
        manufacturing_margin_jpy: totalMargin,
        intl_shipping_jpy: totalIntlShipping,
        domestic_shipping_jpy: totalDomesticShipping,
        exchange_rate_note: `為替レート KRW→JPY = ${exchangeRate}`,
        items: itemsForPo,
        submitted_at: new Date().toLocaleString('ja-JP'),
        order_url: `${appUrl}/admin/orders/${order.id}`,
      };

      // 1. purchase_orders 監査レコード保存（メール送信前に commit）
      const { data: poRecord, error: poInsertError } = await supabaseAdmin
        .from('purchase_orders')
        .insert({
          quotation_id: quotationId,
          order_id: order.id,
          manufacturer_email: MANUFACTURER_ORDER_EMAIL,
          manufacturer_amount_jpy: manufacturerAmountJPY,
          base_cost_jpy: totalBaseCost,
          manufacturing_margin_jpy: totalMargin,
          intl_shipping_jpy: totalIntlShipping,
          payload: poData as any,
        })
        .select('id')
        .single();

      const poRecordId = poRecord?.id ?? null;
      if (poInsertError) {
        // テーブル未作成等の場合: ログのみ。注文自体は成功済みなので継続。
        console.error('[Convert to Order] Failed to insert purchase_orders record:', poInsertError.message);
      }

      // 2. メール送信（監査レコード保存の成否にかかわらず必ず送信）。
      //    監査レコードは付加的なもの。purchase_orders テーブルが未作成でもメールは届く。
      try {
        const emailResult = await sendEmail(
          MANUFACTURER_ORDER_EMAIL,
          poSubject(poData),
          poPlainText(poData),
          poHtml(poData)
        );

        if (emailResult.success) {
          if (poRecordId) {
            await supabaseAdmin
              .from('purchase_orders')
              .update({ sent_at: new Date().toISOString() })
              .eq('id', poRecordId);
          }
          console.log('[Convert to Order] Purchase order email sent to manufacturer:', MANUFACTURER_ORDER_EMAIL);
        } else {
          if (poRecordId) {
            await supabaseAdmin
              .from('purchase_orders')
              .update({ send_error: emailResult.error || 'Unknown send error' })
              .eq('id', poRecordId);
          }
          console.error('[Convert to Order] Failed to send PO email:', emailResult.error);
        }
      } catch (emailErr) {
        console.error('[Convert to Order] PO email send exception:', emailErr);
      }
    } catch (poError) {
      // 発注メール処理の失敗は注文成功を妨げない（ログのみ）
      console.error('[Convert to Order] Purchase order processing error:', poError);
    }

    // ========================================
    // Issue 4: 注文完了メールを顧客に送信（注文番号 + URL を明記）
    // 電話対応でも「末尾7桁」で検索できるよう案内文を含める。
    // ========================================
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com';
      const orderUrl = `${baseUrl}/member/orders/${order.id}`;
      const customerEmailAddr = quotation.customer_email || user.email;
      const customerName = order.customer_name || 'お客様';

      if (customerEmailAddr) {
        const customerSubject = `【注文完了】ご注文番号 ${order.order_number} - EPAC PACKAGE LAB`;
        const customerHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #1e40af;">ご注文ありがとうございます</h2>
            <p>${customerName} 様</p>
            <p>この度はご注文いただき、誠にありがとうございます。<br />以下の内容で注文を受け付けいたしました。</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8fafc; font-weight: bold; width: 40%;">ご注文番号</td><td style="padding: 8px; border: 1px solid #ddd; font-size: 18px; font-weight: bold; color: #1e40af;">${order.order_number}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #ddd; background: #f8fafc; font-weight: bold;">注文詳細URL</td><td style="padding: 8px; border: 1px solid #ddd;"><a href="${orderUrl}">${orderUrl}</a></td></tr>
            </table>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;"><strong>お問い合わせ時のご案内</strong></p>
              <p style="margin: 8px 0 0; font-size: 13px;">お電話やメールでのお問い合わせの際、<strong>ご注文番号</strong>をお伝えください。<br />番号が分からない場合は<strong>「末尾7桁」</strong>（${order.order_number.split('-').pop()}）だけでも検索可能です。</p>
            </div>
            <p style="font-size: 13px; color: #666;">今後の進捗は注文詳細ページからご確認いただけます。</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #999;">EPAC PACKAGE LAB</p>
          </div>
        `;
        // HTML非表示メーラー向けプレーンテキスト（HTMLと同内容）
        const customerText = [
          `ご注文ありがとうございます`,
          ``,
          `${customerName} 様`,
          ``,
          `この度はご注文いただき、誠にありがとうございます。`,
          `以下の内容で注文を受け付けいたしました。`,
          ``,
          `ご注文番号: ${order.order_number}`,
          `注文詳細URL: ${orderUrl}`,
          ``,
          `【お問い合わせ時のご案内】`,
          `お電話やメールでのお問い合わせの際、ご注文番号をお伝えください。`,
          `番号が分からない場合は「末尾7桁」（${order.order_number.split('-').pop()}）だけでも検索可能です。`,
          ``,
          `今後の進捗は注文詳細ページからご確認いただけます。`,
          ``,
          `EPAC PACKAGE LAB`,
        ].join('\n');
        await sendEmail(customerEmailAddr, customerSubject, customerText, customerHtml);
        console.log('[Convert to Order] Customer confirmation email sent:', customerEmailAddr);
      }
    } catch (custEmailErr) {
      console.error('[Convert to Order] Customer confirmation email failed:', custEmailErr);
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: '注文が生成されました。',
    });
  } catch (error: unknown) {
    const errMsg = (error as { message?: string }).message;
    console.error('[Convert to Order] POST error:', error);
    return NextResponse.json(
      { success: false, error: errMsg || 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: Check if quotation can be converted to order
// ============================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: quotationId } = params;

    // Get authenticated user
    const authResult = await getAuthenticatedUser(request);
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: '認証されていないリクエストです。' },
        { status: 401 }
      );
    }

    const { userId } = authResult;

    // Use normal SSR client with cookie auth
    const { client: supabase } = await createSupabaseSSRClient(request);

    // Get quotation data
    const { data: quotation, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', quotationId)
      .single();

    if (error || !quotation) {
      return NextResponse.json(
        { success: false, error: '見積が見つかりません。' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (quotation.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Check if order exists
    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'convert_quotation_to_order',
      userId,
      route: '/api/member/quotations/[id]/convert',
    });

    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, created_at')
      .eq('quotation_id', quotationId)
      .maybeSingle();

    // Check conversion eligibility
    // Approval gate removed: all non-cancelled quotations are orderable.
    const quotationStatus = quotation.status as unknown as string;
    const isCancelled = quotationStatus === 'cancelled' || quotationStatus === 'CANCELLED';
    const canConvert = !isCancelled;
    const isExpired =
      quotation.valid_until && new Date(quotation.valid_until) < new Date();
    const hasOrder = !!existingOrder;

    return NextResponse.json({
      success: true,
      data: {
        quotation: {
          id: quotation.id,
          quotation_number: quotation.quotation_number,
          status: quotation.status,
          total_amount: quotation.total_amount,
          valid_until: quotation.valid_until,
        },
        conversionStatus: {
          canConvert: canConvert && !hasOrder && !isExpired,
          isExpired,
          hasOrder,
          existingOrder,
          reason: !canConvert
            ? 'この見積はキャンセルされています。'
            : hasOrder
            ? '既に注文が生成されています。'
            : isExpired
            ? '有効期限が切れています。'
            : null,
        },
      },
    });
  } catch (error: unknown) {
    const errMsg = (error as { message?: string }).message;
    console.error('[Convert to Order] GET error:', error);
    return NextResponse.json(
      { success: false, error: errMsg || 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
