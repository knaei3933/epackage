/**
 * Member Order Detail API (Integrated from /api/customer/orders/[id])
 * GET /api/member/orders/[id] - Get detailed order information
 * POST /api/member/orders/[id]/notes - Add note to order
 *
 * Provides complete order detail data for:
 * - Portal pages (migrated to /admin/customers)
 * - Member pages
 *
 * Features:
 * - Order items with specifications
 * - Production stages tracking
 * - Shipment information
 * - Available documents
 * - Order notes
 * - Progress percentage
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromHeaders } from '@/lib/supabase-ssr';
import { createServiceClient } from '@/lib/supabase';
import { extractPathFromUrl } from '@/lib/storage-path';
import { getStatusProgress, isOrderStatus } from '@/types/order-status';
import type { PortalOrder, PortalProductionStage, PortalShipmentStatus, OrderNote, OrderNoteType, Address } from '@/types/portal';

// GET /api/member/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUserFromHeaders(request);
    if (!authUser) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = authUser.id;
    const { id: orderId } = await context.params;

    // Use service client (bypasses RLS) with explicit user_id filter for security
    const supabase = createServiceClient();

    // Fetch order with related data - explicit user_id check ensures customer can only see their own orders
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        quotations (
          id,
          quotation_number,
          pdf_url,
          subtotal_amount,
          tax_amount,
          total_amount
        ),
        delivery_addresses (
          id,
          name,
          postal_code,
          prefecture,
          city,
          address,
          building,
          phone,
          contact_person
        ),
        billing_addresses (
          id,
          company_name,
          postal_code,
          prefecture,
          city,
          address,
          building,
          tax_number,
          email,
          phone
        ),
        order_items (*)
      `)
      .eq('id', orderId)
      .eq('user_id', userId) // Extra security - ensure user owns this order
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません。', error_code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Fetch production logs for this order
    const { data: productionLogs } = await supabase
      .from('production_logs')
      .select('*')
      .eq('order_id', orderId)
      .order('logged_at', { ascending: true });

    // Build production stages
    const stageKeys = [
      'design_received',
      'work_order_created',
      'material_prepared',
      'printing',
      'lamination',
      'slitting',
      'pouch_making',
      'qc_passed',
      'packaged',
    ];

    // production-photos は private bucket。各 stage の photo_url（DB には publicUrl 保存）を
    // extractPathFromUrl → createSignedUrl で署名付き URL（24h 有効）に変換。
    // service client（L45・RLS bypass）を再利用。photo_url が null の場合はそのまま。
    const productionStages = await Promise.all(
      stageKeys.map(async (key, index) => {
        const log = productionLogs?.find((l: any) => l.sub_status === key);
        const rawPhotoUrl = log?.photo_url || null;
        let photoUrl = rawPhotoUrl;
        if (rawPhotoUrl) {
          const path = extractPathFromUrl(rawPhotoUrl);
          if (path) {
            const { data: signedData } = await supabase.storage
              .from('production-photos')
              .createSignedUrl(path, 86400);
            if (signedData?.signedUrl) {
              photoUrl = signedData.signedUrl;
            }
          }
        }
        return {
          id: `${orderId}-${key}`,
          key,
          name: key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          name_ja: key,
          status: (log ? 'completed' : index === 0 ? 'in_progress' : 'pending') as PortalProductionStage['status'],
          completed_at: log?.logged_at || null,
          notes: log?.notes || null,
          photo_url: photoUrl,
        };
      })
    );

    // Fetch shipment information
    const { data: shipment } = await supabase
      .from('shipments')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const shipmentInfo = shipment ? {
      shipment_number: shipment.shipment_number,
      tracking_number: shipment.tracking_number,
      carrier_name: shipment.carrier_name,
      carrier_name_ja: shipment.carrier_name,
      tracking_url: shipment.tracking_url,
      estimated_delivery_date: shipment.estimated_delivery_date,
      actual_delivery_date: shipment.delivered_at,
      status: shipment.status as PortalShipmentStatus,
      delivery_address: (order.delivery_addresses ?? null) as unknown as Address,
    } : null;

    // Fetch available documents based on order status
    const documents: any[] = [];

    if (order.quotations?.pdf_url) {
      documents.push({
        id: `quote-${order.quotations.id}`,
        type: 'quote',
        name: '見積書',
        name_ja: '見積書',
        file_url: order.quotations.pdf_url,
        file_size: null,
        created_at: order.created_at,
        quotation_id: order.quotations.id,
        is_available: true,
      });
    }

    // Check for contract
    const { data: contract } = await supabase
      .from('contracts')
      .select('id, final_contract_url, status')
      .eq('order_id', orderId)
      .maybeSingle();

    if (contract?.final_contract_url) {
      documents.push({
        id: `contract-${contract.id}`,
        type: 'contract',
        name: '契約書',
        name_ja: '契約書',
        file_url: contract.final_contract_url,
        file_size: null,
        created_at: order.created_at,
        order_id: orderId,
        is_available: true,
      });
    }

    // Fetch customer-visible notes.
    // NOTE: order_notes テーブルは実DB不存在のため order_comments（is_internal=false）から取得し OrderNote へマップ。
    const { data: comments } = await supabase
      .from('order_comments')
      .select('*')
      .eq('order_id', orderId)
      .eq('is_internal', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: false, nullsFirst: false });

    const notes: OrderNote[] = (comments ?? []).map((c) => ({
      id: c.id,
      order_id: c.order_id,
      user_id: c.author_id,
      note_type: (c.comment_type as OrderNoteType) ?? 'customer',
      subject: null as string | null,
      content: c.content,
      is_visible_to_customer: !c.is_internal,
      is_pinned: false,
      created_at: c.created_at ?? '',
      updated_at: c.updated_at ?? '',
    }));

    // Determine if changes can be requested
    // 変更要求は入稿・校正段階のみ許可（正規14ステータス体系に準拠）
    const canRequestChanges = [
      'QUOTATION_PENDING',
      'QUOTATION_APPROVED',
      'DATA_UPLOAD_PENDING',
      'DATA_UPLOADED',
      'CORRECTION_IN_PROGRESS',
      'CORRECTION_COMPLETED',
      'CUSTOMER_APPROVAL_PENDING',
    ].includes(order.status);

    // Calculate progress
    // 進捗率は正規14ステータス体系（getStatusProgress）で算出。
    // DB に旧レガシーステータスが残存する場合のみ推定マッピングでフォールバック。
    const legacyProgressMap: Record<string, number> = {
      PENDING: 0,
      QUOTATION: 10,
      DATA_RECEIVED: 30,
      WORK_ORDER: 50,
      CONTRACT_SENT: 55,
      CONTRACT_SIGNED: 60,
      STOCK_IN: 90,
      DELIVERED: 100,
    };
    const progressPercentage = isOrderStatus(order.status)
      ? getStatusProgress(order.status)
      : (legacyProgressMap[order.status] ?? 0);

    // TECHNICAL DEBT: PortalOrder は旧ドメイン Order 型（orderNumber/paymentTerm/taxAmount 等）を
    // ベースにするが、クエリ結果の order は orders テーブル Row 型（実DB整合・スネークケース）。
    // プロパティ名体系が異なるため unknown 経由でキャスト。PortalOrder/Order 型の統合は別タスク。
    const portalOrder = {
      ...order,
      progress_percentage: progressPercentage,
      current_stage: productionStages.find((s: any) => s.status === 'in_progress') || productionStages[0],
      production_stages: productionStages,
      shipment_info: shipmentInfo,
      can_request_changes: canRequestChanges,
      available_documents: documents,
      notes: notes || [],
    } as unknown as PortalOrder;

    return NextResponse.json({
      success: true,
      data: portalOrder,
    });

  } catch (error) {
    console.error('Order Detail API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

// POST /api/member/orders/[id]/notes - Add note to order
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUserFromHeaders(request);
    if (!authUser) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = authUser.id;
    const { id: orderId } = await context.params;

    const supabase = createServiceClient();

    // Verify user owns this order
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!order) {
      return NextResponse.json(
        { error: '注文が見つかりません。', error_code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { subject, content } = body as { subject?: string; content: string };

    if (!content) {
      return NextResponse.json(
        { error: 'メモの内容は必須です。', error_code: 'MISSING_CONTENT' },
        { status: 400 }
      );
    }

    // Create customer note.
    // NOTE: order_notes テーブルは実DB不存在のため order_comments へ保存。
    const { data: note, error: noteError } = await supabase
      .from('order_comments')
      .insert({
        order_id: orderId,
        author_id: userId,
        author_role: 'customer',
        comment_type: 'customer',
        content,
        is_internal: false,
      })
      .select()
      .single();

    if (noteError) {
      console.error('Error creating note:', noteError);
      return NextResponse.json(
        { error: 'メモの作成中にエラーが発生しました。', error_code: 'NOTE_CREATE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: note,
      message: 'メモを追加しました。',
    });

  } catch (error) {
    console.error('Order Notes API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', error_code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
