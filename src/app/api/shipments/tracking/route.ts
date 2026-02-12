/**
 * Shipment Tracking API Routes
 * Provides endpoints for tracking updates and information
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { shipmentTrackingService } from '@/lib/shipment-tracking-service';

// =====================================================
// GET /api/shipments/tracking
// Get tracking information for a shipment
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const shipmentId = searchParams.get('shipmentId');
    const shipmentNumber = searchParams.get('shipmentNumber');
    const trackingNumber = searchParams.get('trackingNumber');

    // Validate request
    if (!shipmentId && !shipmentNumber && !trackingNumber) {
      return NextResponse.json(
        { error: 'Must provide shipmentId, shipmentNumber, or trackingNumber' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Find shipment if not provided by ID
    let targetShipmentId = shipmentId;

    if (!targetShipmentId && (shipmentNumber || trackingNumber)) {
      const { data: shipment, error } = await supabase
        .from('shipments')
        .select('id')
        .or(`shipment_number.eq.${shipmentNumber},tracking_number.eq.${trackingNumber}`)
        .single();

      if (error || !shipment) {
        return NextResponse.json(
          { error: 'Shipment not found' },
          { status: 404 }
        );
      }

      targetShipmentId = shipment.id;
    }

    // Get tracking details
    const trackingDetails = await shipmentTrackingService.getShipmentTrackingDetails(
      targetShipmentId as string
    );

    if (!trackingDetails) {
      return NextResponse.json(
        { error: 'Tracking information not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trackingDetails);
  } catch (error) {
    console.error('Error fetching tracking information:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/shipments/tracking
// Update tracking information (manual trigger or webhook)
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shipmentId, action } = body;

    if (!shipmentId) {
      return NextResponse.json(
        { error: 'shipmentId is required' },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      case 'update':
        // Update tracking from carrier API
        const result = await shipmentTrackingService.updateShipmentTracking(shipmentId);
        return NextResponse.json(result);

      case 'delivery_attempt':
        // Record delivery attempt
        const { success, notes, signatureUrl } = body;
        await shipmentTrackingService.recordDeliveryAttempt(
          shipmentId,
          success,
          notes,
          signatureUrl
        );
        return NextResponse.json({ success: true });

      case 'exception':
        // Record shipping exception
        const { exceptionType, description, resolved } = body;
        await shipmentTrackingService.recordShippingException(
          shipmentId,
          exceptionType,
          description,
          resolved
        );
        return NextResponse.json({ success: true });

      case 'manual_event':
        // Add manual tracking event
        const { status, description: eventDescription, location } = body;
        await shipmentTrackingService.addManualTrackingEvent(
          shipmentId,
          status,
          eventDescription,
          location
        );
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: update, delivery_attempt, exception, manual_event' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating tracking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update tracking' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT /api/shipments/tracking
// Batch update multiple shipments
// =====================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { shipmentIds, updateAll } = body;

    let results;

    if (updateAll) {
      // Update all active shipments
      results = await shipmentTrackingService.updateAllActiveShipments();
    } else if (shipmentIds && Array.isArray(shipmentIds)) {
      // Update specific shipments
      results = await shipmentTrackingService.updateMultipleShipments(shipmentIds);
    } else {
      return NextResponse.json(
        { error: 'Must provide shipmentIds array or set updateAll=true' },
        { status: 400 }
      );
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in batch tracking update:', error);
    return NextResponse.json(
      { error: 'Failed to update tracking' },
      { status: 500 }
    );
  }
}
