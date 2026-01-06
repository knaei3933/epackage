/**
 * Single Shipment API
 * GET /api/shipments/[id] - Get shipment details
 * PATCH /api/shipments/[id] - Update shipment
 * DELETE /api/shipments/[id] - Delete shipment (not recommended)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { ShipmentError } from '@/types/shipment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET handler - Get shipment details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseClient();
    const { id: shipmentId } = await context.params;

    // Get shipment with order details
    const { data: shipment, error } = await supabase
      .from('shipments_with_order_details')
      .select('*')
      .eq('id', shipmentId)
      .single();

    if (error || !shipment) {
      throw new ShipmentError('Shipment not found', 'SHIPMENT_NOT_FOUND');
    }

    // Get tracking history
    const { data: trackingEvents } = await supabase
      .from('shipment_tracking_events')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('event_time', { ascending: false });

    // Get notifications
    const { data: notifications } = await supabase
      .from('shipment_notifications')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('sent_at', { ascending: false });

    const shipmentTyped = shipment as any;

    return NextResponse.json({
      success: true,
      shipment: {
        ...shipmentTyped,
        tracking_history: trackingEvents || [],
        notifications: notifications || [],
      },
    });

  } catch (error) {
    console.error('Get shipment error:', error);

    if (error instanceof ShipmentError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch shipment',
        details: error instanceof Error ? error.message : String(error),
      },
    }, { status: 500 });
  }
}

/**
 * PATCH handler - Update shipment
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseClient();
    const { id: shipmentId } = await context.params;

    // Check if shipment exists
    const { data: existingShipment } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();

    if (!existingShipment) {
      throw new ShipmentError('Shipment not found', 'SHIPMENT_NOT_FOUND');
    }

    const existingShipmentTyped = existingShipment as any;

    // Parse update data
    const updateData = await request.json();

    // Allowed fields to update
    const allowedFields = [
      'status',
      'delivery_time_slot',
      'delivery_date_request',
      'pickup_scheduled_for',
      'estimated_delivery',
      'delivered_at',
      'tracking_number',
      'shipping_cost',
      'cod_amount',
      'internal_notes',
      'customer_notes',
      'carrier_notes',
      'shipping_label_url',
      'commercial_invoice_url',
      'pickup_slip_url',
      'tracking_data',
    ];

    // Filter only allowed fields
    const filteredData: any = {};
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // Validate status transitions
    if (filteredData.status) {
      const validTransitions: Record<string, string[]> = {
        'pending': ['picked_up', 'failed'],
        'picked_up': ['in_transit', 'failed'],
        'in_transit': ['out_for_delivery', 'failed'],
        'out_for_delivery': ['delivered', 'failed'],
        'delivered': [],
        'failed': ['returned', 'pending'],
        'returned': [],
      };

      const currentStatus = existingShipmentTyped.status;
      const newStatus = filteredData.status;

      if (validTransitions[currentStatus] && !validTransitions[currentStatus].includes(newStatus)) {
        throw new ShipmentError(
          `Invalid status transition from ${currentStatus} to ${newStatus}`,
          'INVALID_STATUS_TRANSITION'
        );
      }
    }

    // Update shipment
    const { data: updatedShipment, error } = await (supabase as any)
      .from('shipments')
      .update(filteredData)
      .eq('id', shipmentId)
      .select()
      .single();

    if (error || !updatedShipment) {
      throw new ShipmentError('Failed to update shipment', 'UPDATE_FAILED', error);
    }

    // Create tracking event if status changed
    if (filteredData.status && filteredData.status !== existingShipmentTyped.status) {
      await (supabase as any).from('shipment_tracking_events').insert({
        shipment_id: shipmentId,
        event_time: new Date().toISOString(),
        status: filteredData.status.toUpperCase(),
        description_ja: `ステータスが「${filteredData.status}」に変更されました`,
        description_en: `Status changed to "${filteredData.status}"`,
      });
    }

    return NextResponse.json({
      success: true,
      shipment: updatedShipment,
    });

  } catch (error) {
    console.error('Update shipment error:', error);

    if (error instanceof ShipmentError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update shipment',
        details: error instanceof Error ? error.message : String(error),
      },
    }, { status: 500 });
  }
}

/**
 * DELETE handler - Delete shipment (use with caution)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseClient();
    const { id: shipmentId } = await context.params;

    // Check if shipment exists
    const { data: existingShipment } = await supabase
      .from('shipments')
      .select('status')
      .eq('id', shipmentId)
      .single();

    if (!existingShipment) {
      throw new ShipmentError('Shipment not found', 'SHIPMENT_NOT_FOUND');
    }

    const existingShipmentDelete = existingShipment as any;

    // Prevent deletion of shipments that are in transit
    if (['picked_up', 'in_transit', 'out_for_delivery'].includes(existingShipmentDelete.status)) {
      throw new ShipmentError(
        'Cannot delete shipment that is in transit',
        'INVALID_SHIPMENT_STATE'
      );
    }

    // Delete shipment (cascades to tracking events and notifications)
    const { error } = await supabase
      .from('shipments')
      .delete()
      .eq('id', shipmentId);

    if (error) {
      throw new ShipmentError('Failed to delete shipment', 'DELETE_FAILED', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Shipment deleted successfully',
    });

  } catch (error) {
    console.error('Delete shipment error:', error);

    if (error instanceof ShipmentError) {
      return NextResponse.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete shipment',
        details: error instanceof Error ? error.message : String(error),
      },
    }, { status: 500 });
  }
}
