/**
 * Schedule Pickup API
 * POST /api/shipments/[id]/schedule-pickup
 *
 * Schedules carrier pickup for a shipment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { ShipmentError } from '@/types/shipment';
import { schedulePickup as scheduleCarrierPickup } from '@/lib/shipping-carriers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST handler - Schedule carrier pickup
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

    // Check if shipment can be scheduled
    if (shipmentTyped.status !== 'pending') {
      throw new ShipmentError(
        `Cannot schedule pickup for shipment with status: ${shipmentTyped.status}`,
        'INVALID_SHIPMENT_STATE'
      );
    }

    // Parse request body
    const body = await request.json();
    const pickupTime = body.pickup_time ? new Date(body.pickup_time) : undefined;
    const specialInstructions = body.special_instructions;

    if (!pickupTime) {
      throw new ShipmentError('pickup_time is required', 'MISSING_PICKUP_TIME');
    }

    // Validate pickup time (must be in future, at least 1 business day)
    const now = new Date();
    const minPickupTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // At least 24 hours

    if (pickupTime < minPickupTime) {
      throw new ShipmentError(
        'Pickup must be scheduled at least 24 hours in advance',
        'INVALID_PICKUP_TIME'
      );
    }

    // Check if pickup is on weekend or holiday (Japanese business rule)
    const pickupDay = pickupTime.getDay();
    if (pickupDay === 0 || pickupDay === 6) {
      throw new ShipmentError(
        'Pickup cannot be scheduled on weekend',
        'INVALID_PICKUP_DAY'
      );
    }

    // Schedule pickup with carrier
    await scheduleCarrierPickup(
      shipmentId,
      shipmentTyped.carrier,
      pickupTime,
      specialInstructions
    );

    // Update shipment record
    const { data: updatedShipment, error: updateError } = await (supabase as any)
      .from('shipments')
      .update({
        pickup_scheduled_for: pickupTime.toISOString(),
        carrier_notes: specialInstructions || shipmentTyped.carrier_notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipmentId)
      .select()
      .single();

    if (updateError || !updatedShipment) {
      throw new ShipmentError('Failed to update shipment', 'UPDATE_FAILED', updateError);
    }

    // Create tracking event
    await (supabase as any).from('shipment_tracking_events').insert({
      shipment_id: shipmentId,
      event_time: new Date().toISOString(),
      status: 'PICKUP_SCHEDULED',
      location: shipmentTyped.sender_address?.city || 'Warehouse',
      description_ja: `集荷予定: ${pickupTime.toLocaleDateString('ja-JP')} ${pickupTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`,
      description_en: `Pickup scheduled for ${pickupTime.toLocaleDateString('en-US')} ${pickupTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
    });

    return NextResponse.json({
      success: true,
      shipment: updatedShipment,
      message: 'Pickup scheduled successfully',
    });

  } catch (error) {
    console.error('Schedule pickup error:', error);

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
        message: 'Failed to schedule pickup',
        details: error instanceof Error ? error.message : String(error),
      },
    }, { status: 500 });
  }
}
