/**
 * Restore Status History API
 *
 * 既存注文のステータス履歴を復元する管理用API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const supabase = createServiceClient();

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, status, created_at')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if status history already exists
    const { data: existingHistory } = await supabase
      .from('order_status_history')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existingHistory) {
      return NextResponse.json({
        success: true,
        message: 'Status history already exists',
        history: existingHistory,
      });
    }

    // Create initial status history entry
    const { data: history, error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        from_status: null,
        to_status: order.status,
        changed_by: 'ADMIN',
        changed_at: order.created_at,
        reason: 'ステータス履歴復元（初期ステータス）',
      })
      .select()
      .single();

    if (historyError) {
      console.error('[Restore Status History] Error:', historyError);
      return NextResponse.json(
        { success: false, error: 'Failed to create status history', details: historyError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Status history restored',
      history,
    });

  } catch (error) {
    console.error('[Restore Status History] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
