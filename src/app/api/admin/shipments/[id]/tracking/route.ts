/**
 * Admin Shipment Tracking API
 * Update tracking information for a specific shipment
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { shipmentTrackingService } from '@/lib/shipment-tracking-service';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

// =====================================================
// GET /api/admin/shipments/[id]/tracking
// Get tracking details for a shipment
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: shipmentId } = await params;

    const trackingDetails = await shipmentTrackingService.getShipmentTrackingDetails(
      shipmentId
    );

    if (!trackingDetails) {
      return NextResponse.json(
        { error: 'Tracking information not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trackingDetails);
  } catch (error) {
    console.error('Error fetching tracking details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking details' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/admin/shipments/[id]/tracking
// Manually trigger tracking update from carrier API
// =====================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: shipmentId } = await params;
    const body = await request.json();
    const { force } = body;

    // Check if shipment exists and has tracking number
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    const supabase = createServiceClient();
    const { data: shipment, error } = await supabase
      .from('shipments')
      .select('id, tracking_number, carrier_code, last_tracking_update')
      .eq('id', shipmentId)
      .single();

    if (error || !shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    if (!shipment.tracking_number) {
      return NextResponse.json(
        { error: 'No tracking number assigned to this shipment' },
        { status: 400 }
      );
    }

    // Rate limiting: Check if update was recently done
    if (!force && shipment.last_tracking_update) {
      const lastUpdate = new Date(shipment.last_tracking_update);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

      if (diffMinutes < 5) {
        return NextResponse.json(
          {
            error: 'Tracking update too frequent',
            message: `Last update was ${Math.floor(diffMinutes)} minutes ago. Please wait at least 5 minutes between updates.`,
            lastUpdate: shipment.last_tracking_update,
          },
          { status: 429 }
        );
      }
    }

    // Update tracking
    const result = await shipmentTrackingService.updateShipmentTracking(shipmentId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating tracking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update tracking' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT /api/admin/shipments/[id]/tracking
// Update tracking information manually
// =====================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: shipmentId } = await params;
    const body = await request.json();

    const { action } = body;

    switch (action) {
      case 'update_estimated_delivery': {
        const { estimatedDelivery } = body;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
          return NextResponse.json(
            { error: 'Database configuration error' },
            { status: 500 }
          );
        }

        const supabase = createServiceClient();

        const { error } = await supabase
          .from('shipments')
          .update({
            estimated_delivery_date: estimatedDelivery,
            updated_at: new Date().toISOString(),
          })
          .eq('id', shipmentId);

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: 'Estimated delivery date updated',
        });
      }

      case 'update_status': {
        const { status, notes } = body;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
          return NextResponse.json(
            { error: 'Database configuration error' },
            { status: 500 }
          );
        }

        const supabase = createServiceClient();

        // Update status
        const { error } = await supabase
          .from('shipments')
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', shipmentId);

        if (error) throw error;

        // Add manual tracking event
        if (notes) {
          await shipmentTrackingService.addManualTrackingEvent(
            shipmentId,
            status,
            notes
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Status updated',
        });
      }

      case 'add_tracking_number': {
        const { trackingNumber } = body;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
          return NextResponse.json(
            { error: 'Database configuration error' },
            { status: 500 }
          );
        }

        const supabase = createServiceClient();

        const { error } = await supabase
          .from('shipments')
          .update({
            tracking_number: trackingNumber,
            updated_at: new Date().toISOString(),
          })
          .eq('id', shipmentId);

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: 'Tracking number added',
          trackingNumber,
        });
      }

      case 'record_exception': {
        const { exceptionType, description, resolved } = body;
        await shipmentTrackingService.recordShippingException(
          shipmentId,
          exceptionType,
          description,
          resolved
        );

        return NextResponse.json({
          success: true,
          message: 'Exception recorded',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating tracking manually:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update tracking' },
      { status: 500 }
    );
  }
}
