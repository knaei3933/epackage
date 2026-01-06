/**
 * Tracking Refresh API
 * POST /api/shipments/[id]/track
 *
 * Refreshes tracking information from carrier API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { ShipmentError, ShipmentStatus } from '@/types/shipment';
import { getTrackingStatus } from '@/lib/shipping-carriers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST handler - Refresh tracking from carrier
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseClient();
    const { id: shipmentId } = await context.params;

    // Get shipment details
    const { data: shipment, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();

    if (error || !shipment) {
      throw new ShipmentError('Shipment not found', 'SHIPMENT_NOT_FOUND');
    }

    const shipmentTyped = shipment as any;

    // Check if tracking number exists
    if (!shipmentTyped.tracking_number) {
      throw new ShipmentError('No tracking number for this shipment', 'NO_TRACKING_NUMBER');
    }

    // Get latest tracking from carrier
    const trackingInfo = await getTrackingStatus(shipmentTyped.carrier, shipmentTyped.tracking_number);

    // Check if status has changed
    const statusChanged = trackingInfo.current_status !== shipmentTyped.status;

    // Update shipment record
    const updateData: any = {
      status: trackingInfo.current_status,
      tracking_data: trackingInfo.raw_response,
      updated_at: new Date().toISOString(),
    };

    if (trackingInfo.estimated_delivery) {
      updateData.estimated_delivery = trackingInfo.estimated_delivery;
    }

    // Update delivered_at if status is delivered
    if (trackingInfo.current_status === ShipmentStatus.DELIVERED && !shipmentTyped.delivered_at) {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data: updatedShipment, error: updateError } = await (supabase as any)
      .from('shipments')
      .update(updateData)
      .eq('id', shipmentId)
      .select()
      .single();

    if (updateError || !updatedShipment) {
      throw new ShipmentError('Failed to update shipment', 'UPDATE_FAILED', updateError);
    }

    // Add new tracking events
    // Get existing events
    const { data: existingEvents } = await supabase
      .from('shipment_tracking_events')
      .select('status, event_time')
      .eq('shipment_id', shipmentId);

    const existingEventsTyped = (existingEvents || []) as any[];

    // Filter only new events
    const newEvents = trackingInfo.events.filter(carrierEvent => {
      return !existingEventsTyped.some(
        existing =>
          existing.status === carrierEvent.status &&
          existing.event_time === carrierEvent.datetime
      );
    });

    // Insert new tracking events
    if (newEvents.length > 0) {
      await (supabase as any).from('shipment_tracking_events').insert(
        newEvents.map(event => ({
          shipment_id: shipmentId,
          event_time: event.datetime,
          status: event.status,
          location: event.location,
          description_ja: event.description_ja,
          description_en: event.description_en,
          raw_data: event,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      shipment: updatedShipment,
      tracking_info: trackingInfo,
      new_events_count: newEvents.length,
      status_changed: statusChanged,
      message: statusChanged
        ? `Status updated to ${trackingInfo.current_status}`
        : 'Tracking refreshed',
    });

  } catch (error) {
    console.error('Refresh tracking error:', error);

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
        message: 'Failed to refresh tracking',
        details: error instanceof Error ? error.message : String(error),
      },
    }, { status: 500 });
  }
}
