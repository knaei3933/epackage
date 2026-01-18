/**
 * Delivery Tracking Management API
 *
 * 配送追跡管理API
 *
 * POST   /api/admin/delivery/tracking - Create or update delivery tracking
 * GET    /api/admin/delivery/tracking/:orderId - Get delivery tracking
 * PATCH /api/admin/delivery/tracking/:orderId - Update tracking info
 * DELETE /api/admin/delivery/tracking/:orderId - Delete tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { calculateDeliverySchedule } from '@/lib/delivery-estimator';
import type { DeliverySchedule } from '@/lib/delivery-estimator';
import type { Database } from '@/types/database';

// ============================================================
// Types
// ============================================================

interface TrackingUpdateRequest {
  approvalDate?: string;
  trackingNumber?: string;
  carrier?: 'ems' | 'surface_mail' | 'sea_freight' | 'air_freight' | 'other';
  shippingDate?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  adminNotes?: string;
  customProductionDays?: number;
}

interface CarrierLabel {
  ja: string;
  en: string;
}

const CARRIER_LABELS: Record<string, CarrierLabel> = {
  ems: { ja: 'EMS', en: 'EMS' },
  surface_mail: { ja: '船便', en: 'Surface Mail' },
  sea_freight: { ja: '海上コンテナ', en: 'Sea Freight' },
  air_freight: { ja: '航空貨物', en: 'Air Freight' },
  other: { ja: 'その他', en: 'Other' },
};

// ============================================================
// POST: Create or Update Delivery Tracking
// ============================================================

export async function POST(request: NextRequest) {
  // ✅ Verify admin authentication first
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  try {
    const body: TrackingUpdateRequest & { orderId: string } = await request.json();
    const { orderId, ...trackingData } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Use authenticated service client with audit logging
    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'delivery_tracking_update',
      userId: auth.userId,
      route: '/api/admin/delivery/tracking/[orderId]',
    });

    // Get order info
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, customer_approved_at')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Use approval date from order or provided data
    const approvalDate = trackingData.approvalDate || order.customer_approved_at;

    if (!approvalDate) {
      return NextResponse.json(
        { success: false, error: 'Approval date is required' },
        { status: 400 }
      );
    }

    // Calculate delivery schedule
    const schedule: DeliverySchedule = calculateDeliverySchedule(
      approvalDate,
      trackingData.customProductionDays
    );

    // Check if tracking exists
    const { data: existing } = await supabaseAdmin
      .from('delivery_tracking')
      .select('*')
      .eq('order_id', orderId)
      .single();

    let result;

    if (existing) {
      // Update existing
      const updateData: ShipmentUpdate = {
        approval_date: approvalDate,
        estimated_production_complete_date: schedule.productionCompleteDate,
        estimated_tracking_available_date: schedule.trackingNumberDate,
        estimated_delivery_date_min: schedule.deliveryDateMin,
        estimated_delivery_date_max: schedule.deliveryDateMax,
        updated_at: new Date().toISOString(),
      };

      if (trackingData.trackingNumber !== undefined) {
        updateData.tracking_number = trackingData.trackingNumber;
      }
      if (trackingData.carrier) {
        updateData.carrier = trackingData.carrier;
      }
      if (trackingData.shippingDate) {
        updateData.shipping_date = trackingData.shippingDate;
      }
      if (trackingData.estimatedDeliveryDate) {
        updateData.estimated_delivery_date_min = trackingData.estimatedDeliveryDate;
        updateData.estimated_delivery_date_max = trackingData.estimatedDeliveryDate;
      }
      if (trackingData.actualDeliveryDate) {
        updateData.actual_delivery_date = trackingData.actualDeliveryDate;
      }
      if (trackingData.adminNotes !== undefined) {
        updateData.admin_notes = trackingData.adminNotes;
      }

      const { data, error } = await supabaseAdmin
        .from('delivery_tracking')
        .update(updateData)
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new
      const { data, error } = await supabaseAdmin
        .from('delivery_tracking')
        .insert({
          order_id: orderId,
          approval_date: approvalDate,
          tracking_number: trackingData.trackingNumber || null,
          carrier: trackingData.carrier || null,
          shipping_date: trackingData.shippingDate || null,
          estimated_delivery_date_min: trackingData.estimatedDeliveryDate || schedule.deliveryDateMin,
          estimated_delivery_date_max: trackingData.estimatedDeliveryDate || schedule.deliveryDateMax,
          estimated_production_complete_date: schedule.productionCompleteDate,
          estimated_tracking_available_date: schedule.trackingNumberDate,
          actual_delivery_date: trackingData.actualDeliveryDate || null,
          admin_notes: trackingData.adminNotes || null,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        schedule,
      },
    });
  } catch (error: unknown) {
    console.error('[Delivery Tracking] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: Retrieve Delivery Tracking
// ============================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const params = await context.params;
    const orderId = params.orderId;

    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'get_delivery_tracking',
      userId: auth.userId,
      route: '/api/admin/delivery/tracking/[orderId]',
    });

    // Get delivery tracking
    const { data: tracking, error } = await supabaseAdmin
      .from('delivery_tracking')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // If no tracking exists, return empty
    if (!tracking) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No delivery tracking found for this order',
      });
    }

    // Calculate current schedule
    const schedule = calculateDeliverySchedule(tracking.approval_date);

    return NextResponse.json({
      success: true,
      data: {
        ...tracking,
        schedule,
        carrierLabel: tracking.carrier ? CARRIER_LABELS[tracking.carrier] : null,
      },
    });
  } catch (error: unknown) {
    console.error('[Delivery Tracking] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH: Update Tracking Information
// ============================================================

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const params = await context.params;
    const orderId = params.orderId;

    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body: TrackingUpdateRequest = await request.json();

    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'update_tracking_info',
      userId: auth.userId,
      route: '/api/admin/delivery/tracking/[orderId]',
    });

    // Build update object
    const updateData: ShipmentUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (body.trackingNumber !== undefined) {
      updateData.tracking_number = body.trackingNumber;
    }
    if (body.carrier) {
      updateData.carrier = body.carrier;
    }
    if (body.shippingDate) {
      updateData.shipping_date = body.shippingDate;
    }
    if (body.estimatedDeliveryDate) {
      updateData.estimated_delivery_date_min = body.estimatedDeliveryDate;
      updateData.estimated_delivery_date_max = body.estimatedDeliveryDate;
    }
    if (body.actualDeliveryDate) {
      updateData.actual_delivery_date = body.actualDeliveryDate;
    }
    if (body.adminNotes !== undefined) {
      updateData.admin_notes = body.adminNotes;
    }

    // Update tracking
    const { data: tracking, error } = await supabaseAdmin
      .from('delivery_tracking')
      .update(updateData)
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!tracking) {
      return NextResponse.json(
        { success: false, error: 'Delivery tracking not found' },
        { status: 404 }
      );
    }

    // Recalculate schedule
    const schedule = calculateDeliverySchedule(tracking.approval_date);

    return NextResponse.json({
      success: true,
      data: {
        ...tracking,
        schedule,
      },
      message: '配送追跡情報を更新しました',
    });
  } catch (error: unknown) {
    console.error('[Delivery Tracking] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE: Remove Delivery Tracking
// ============================================================

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const params = await context.params;
    const orderId = params.orderId;

    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'delete_tracking',
      userId: auth.userId,
      route: '/api/admin/delivery/tracking/[orderId]',
    });

    // Delete tracking
    const { error } = await supabaseAdmin
      .from('delivery_tracking')
      .delete()
      .eq('order_id', orderId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '配送追跡情報を削除しました',
    });
  } catch (error: unknown) {
    console.error('[Delivery Tracking] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
