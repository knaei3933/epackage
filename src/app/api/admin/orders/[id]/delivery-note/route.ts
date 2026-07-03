/**
 * Delivery Note Auto-Send API
 *
 * 納品書自動発送API
 * - 配送完了時に自動で納品書を生成・送信
 *
 * @route /api/admin/orders/[id]/delivery-note
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTemplatedEmail } from '@/lib/email';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

// サービスクライアント (RLSバイパス用)
const getServiceClient = () => createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface DeliveryNoteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // H-11/C-21: 認証を verifyAdminAuth に統一（status==='ACTIVE' チェック含む・Phase 1 C-15 と同じパターン）。
    // 旧: インライン認証（supabase.auth.getUser → profiles.role==='ADMIN'）・ACTIVE チェック漏れ。
    const auth = await verifyAdminAuth(request);
    if (!auth) return unauthorizedResponse();

    const { id: orderId } = await params;

    // C-21: service client（RLSバイパス）で他人の注文も参照可能。
    // 旧: createServerClient(anon + cookie・RLS有効) で管理者が他人の注文を参照できず常に404。
    const supabase = getServiceClient();

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_email, customer_phone, total_amount, delivered_at')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    // C-22: 存在しない tracking_number_domestic カラム参照（常に空文字）を削除。
    // 代わりに shipments テーブルから最新出荷の tracking_number を取得（顧客が荷物を追跡可能に）。
    const { data: shipment } = await supabase
      .from('shipments')
      .select('tracking_number, carrier_name')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const trackingNumber = shipment?.tracking_number || '';

    // Send delivery notification email
    if (order.customer_email) {
      await sendTemplatedEmail(
        'delivery_completion',
        {
          orderNumber: order.order_number,
          shipmentNumber: order.order_number,
          trackingNumber,
          carrierName: 'EPACKAGE Lab',
          carrier: 'yamato',
          deliveredAt: order.delivered_at || new Date().toISOString(),
          customerName: order.customer_name,
          customerPhone: order.customer_phone || '',
        } as any,
        {
          name: order.customer_name,
          email: order.customer_email,
        }
      );
    }

    const response: DeliveryNoteResponse = {
      success: true,
      message: '納品書を送信しました。',
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Delivery Note] Error:', error);

    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
