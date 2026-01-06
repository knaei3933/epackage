/**
 * B2B 출하 API (B2B Shipment API)
 * POST /api/b2b/shipments - Process shipment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Next.js 16: cookies() now returns a Promise and must be awaited
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // Check if user is admin or operator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['ADMIN', 'OPERATOR'].includes(profile.role)) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      order_id,
      invoice_number,
      carrier,
      tracking_number,
      tracking_url,
      shipping_date
    } = body;

    if (!order_id || !invoice_number || !carrier) {
      return NextResponse.json(
        { error: '필수 항목이 누락되었습니다.' },
        { status: 400 }
      );
    }

    // Update order with shipment info
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'SHIPPED',
        current_state: 'shipped',
        shipped_at: new Date(shipping_date).toISOString(),
        state_metadata: {
          invoice_number,
          carrier,
          tracking_number,
          tracking_url
        }
      })
      .eq('id', order_id);

    if (updateError) {
      throw updateError;
    }

    // Log shipment
    await supabase
      .from('order_audit_log')
      .insert({
        table_name: 'shipments',
        record_id: order_id,
        action: 'INSERT',
        new_data: {
          invoice_number,
          carrier,
          tracking_number,
          tracking_url,
          shipping_date,
          shipped_by: user.id
        },
        changed_by: user.id
      });

    // Log status change
    await supabase
      .from('order_status_history')
      .insert({
        order_id: order_id,
        from_status: 'STOCK_IN',
        to_status: 'SHIPPED',
        changed_by: user.id,
        reason: `출하 완료: ${carrier} (${invoice_number})`
      });

    // TODO: Send notification to customer (email/SMS)
    // await sendShipmentNotification(order_id, tracking_number, tracking_url);

    return NextResponse.json({
      success: true,
      message: '출하 처리가 완료되었습니다.'
    });

  } catch (error) {
    console.error('Shipment API error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
