/**
 * Admin Shipping Info API
 *
 * 管理者配送情報入力API
 * - 送付状番号、配送業者、到着予定日を入力
 *
 * @route /api/admin/orders/[id]/shipping-info
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

interface ShippingInfoResponse {
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

    // Parse request body
    const body = await request.json();
    const { trackingNumber, shippingMethod, estimatedDelivery } = body;

    // Validate
    if (!trackingNumber || !shippingMethod || !estimatedDelivery) {
      return NextResponse.json(
        {
          error: '送付状番号、配送業者、到着予定日は必須です。',
          errorEn: 'Tracking number, shipping method, and estimated delivery are required'
        },
        { status: 400 }
      );
    }

    // Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        tracking_number_domestic: trackingNumber,
        shipping_method: shippingMethod,
        estimated_delivery_at: estimatedDelivery,
        shipped_to_customer_at: new Date().toISOString(),
        current_stage: 'SHIPPED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const response: ShippingInfoResponse = {
      success: true,
      message: '配送情報を更新しました。',
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Shipping Info] Error:', error);

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
