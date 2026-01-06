/**
 * Customer Order Detail API
 * GET /api/customer/orders/[id] - Get detailed order information
 * POST /api/customer/orders/[id]/notes - Add note to order
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { PortalOrder, OrderNote } from '@/types/portal';

// GET /api/customer/orders/[id] - Get order details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id: orderId } = await context.params;

    // Fetch order with related data - RLS ensures customer can only see their own orders
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        companies (
          id,
          name,
          name_kana,
          corporate_number
        ),
        quotations (
          id,
          quotation_number,
          pdf_url,
          subtotal_amount,
          tax_amount,
          total_amount
        ),
        order_items (*)
      `)
      .eq('id', orderId)
      .eq('user_id', user.id) // Extra security - ensure user owns this order
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

    const productionStages = stageKeys.map((key, index) => {
      const log = productionLogs?.find((l: any) => l.sub_status === key);
      return {
        id: `${orderId}-${key}`,
        key,
        name: key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        name_ja: key,
        status: log ? 'completed' : index === 0 ? 'in_progress' : 'pending',
        completed_at: log?.logged_at || null,
        notes: log?.notes || null,
        photo_url: log?.photo_url || null,
      };
    });

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
      status: shipment.status,
      delivery_address: order.shipping_address,
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
      .select('id, pdf_url, status')
      .eq('order_id', orderId)
      .maybeSingle();

    if (contract?.pdf_url) {
      documents.push({
        id: `contract-${contract.id}`,
        type: 'contract',
        name: '契約書',
        name_ja: '契約書',
        file_url: contract.pdf_url,
        file_size: null,
        created_at: order.created_at,
        order_id: orderId,
        is_available: true,
      });
    }

    // Fetch customer-visible notes
    const { data: notes } = await supabase
      .from('order_notes')
      .select('*')
      .eq('order_id', orderId)
      .eq('is_visible_to_customer', true)
      .order('created_at', { ascending: false });

    // Determine if changes can be requested
    const canRequestChanges = ['PENDING', 'QUOTATION', 'DATA_RECEIVED'].includes(order.status);

    // Calculate progress
    const STATUS_ORDER = [
      'PENDING', 'QUOTATION', 'DATA_RECEIVED', 'WORK_ORDER',
      'CONTRACT_SENT', 'CONTRACT_SIGNED', 'PRODUCTION', 'STOCK_IN',
      'SHIPPED', 'DELIVERED',
    ];
    const currentIndex = STATUS_ORDER.indexOf(order.status);
    const progressPercentage = currentIndex >= 0
      ? Math.round(((currentIndex + 1) / STATUS_ORDER.length) * 100)
      : 0;

    const portalOrder: PortalOrder = {
      ...order,
      progress_percentage: progressPercentage,
      current_stage: productionStages.find((s: any) => s.status === 'in_progress') || productionStages[0],
      production_stages: productionStages,
      shipment_info: shipmentInfo,
      can_request_changes: canRequestChanges,
      available_documents: documents,
      notes: notes || [],
    };

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

// POST /api/customer/orders/[id]/notes - Add note to order
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', error_code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id: orderId } = await context.params;

    // Verify user owns this order
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!order) {
      return NextResponse.json(
        { error: '注文が見つかりません。', error_code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { subject, content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'メモの内容は必須です。', error_code: 'MISSING_CONTENT' },
        { status: 400 }
      );
    }

    // Create customer note
    const { data: note, error: noteError } = await supabase
      .from('order_notes')
      .insert({
        order_id: orderId,
        user_id: user.id,
        note_type: 'customer',
        subject: subject || null,
        content,
        is_visible_to_customer: true,
        is_pinned: false,
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
