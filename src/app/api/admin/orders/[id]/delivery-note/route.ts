/**
 * Delivery Note Auto-Send API
 *
 * 納品書自動発送API
 * - 配送完了時に自動で納品書を生成・送信
 *
 * @route /api/admin/orders/[id]/delivery-note
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { sendTemplatedEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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
    // Authenticate
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です。', errorEn: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;

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

    // Send delivery notification email
    if (order.customer_email) {
      await sendTemplatedEmail(
        'delivery_completion',
        {
          orderNumber: order.order_number,
          shipmentNumber: order.order_number,
          trackingNumber: order.tracking_number_domestic || '',
          carrierName: 'EPACKAGE Lab',
          carrier: 'yamato',
          deliveredAt: order.delivered_at || new Date().toISOString(),
          customerName: order.customer_name,
          customerPhone: order.customer_phone || '',
        },
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
