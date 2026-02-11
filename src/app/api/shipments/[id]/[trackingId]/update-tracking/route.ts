/**
 * Shipment Tracking Update API
 *
 * 配送追跡情報更新API
 *
 * POST - Manually update shipment tracking information
 */

import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; trackingId: string }> }
) {
  try {
    const { id: shipmentId, trackingId } = await params;
    const body = await request.json();
    const {
      status,
      location,
      description_ja,
      description_en,
      raw_data
    } = body;

    // Validation
    if (!status) {
      return NextResponse.json(
        { error: 'ステータスは必須です' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Verify user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await (supabase as any)
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Fetch shipment
    const { data: shipment, error: shipmentError } = await (supabase as any)
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();

    if (shipmentError || !shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Create tracking event
    const { data: trackingEvent, error: eventError } = await (supabase as any)
      .from('shipment_tracking_events')
      .insert({
        shipment_id: shipmentId,
        status: status.toUpperCase(),
        event_time: new Date().toISOString(),
        location: location || '手動入力',
        description: description_ja || description_en || `手動更新: ${status}`,
        raw_data: raw_data || {
          manual_update: true,
          updated_by: user.id,
        },
      })
      .select()
      .single();

    if (eventError) {
      console.error('Error creating tracking event:', eventError);
      return NextResponse.json(
        { error: '追跡イベントの作成に失敗しました' },
        { status: 500 }
      );
    }

    // Update shipment status if needed
    const statusMapping: Record<string, string> = {
      'CREATED': 'pending',
      'PICKED_UP': 'shipped',
      'IN_TRANSIT': 'in_transit',
      'OUT_FOR_DELIVERY': 'out_for_delivery',
      'DELIVERED': 'delivered',
      'FAILED': 'failed',
      'RETURNED': 'returned',
    };

    const newShipmentStatus = statusMapping[status.toUpperCase()];
    if (newShipmentStatus && newShipmentStatus !== shipment.status) {
      const updateData: any = {
        status: newShipmentStatus,
        updated_at: new Date().toISOString(),
      };

      // Update timestamps based on status
      if (newShipmentStatus === 'shipped' && !shipment.shipped_at) {
        updateData.shipped_at = new Date().toISOString();
      } else if (newShipmentStatus === 'delivered' && !shipment.delivered_at) {
        updateData.delivered_at = new Date().toISOString();
      }

      await (supabase as any)
        .from('shipments')
        .update(updateData)
        .eq('id', shipmentId);

      // Auto-transition order status: READY_TO_SHIP → SHIPPED when shipped
      if (newShipmentStatus === 'shipped' && shipment.order_id) {
        await (supabase as any)
          .from('orders')
          .update({
            status: 'SHIPPED',
            shipped_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', shipment.order_id);

        // Log status history
        await (supabase as any).from('order_status_history').insert({
          order_id: shipment.order_id,
          old_status: 'READY_TO_SHIP',
          new_status: 'SHIPPED',
          changed_by: user.id,
          changed_at: new Date().toISOString(),
        });
      }

      // Auto-transition order status: SHIPPED → DELIVERED when delivered
      if (newShipmentStatus === 'delivered' && shipment.order_id) {
        await (supabase as any)
          .from('orders')
          .update({
            status: 'DELIVERED',
            delivered_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', shipment.order_id);

        // Log status history
        await (supabase as any).from('order_status_history').insert({
          order_id: shipment.order_id,
          old_status: 'SHIPPED',
          new_status: 'DELIVERED',
          changed_by: 'SYSTEM',
          changed_at: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      trackingEvent,
      message: '追跡情報を更新しました',
    });
  } catch (error: any) {
    console.error('Error updating tracking:', error);
    return NextResponse.json(
      { error: error.message || '追跡情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}
