/**
 * Shipping Tracking API
 *
 * 配送追跡API
 *
 * Manages EMS tracking numbers and shipping status updates
 * Admin can update shipping status and customers get notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import {
  generateEMSTrackingNumber,
  validateEMSTrackingNumber,
  getEMSTrackingURL,
  getJapanPostTrackingURL,
} from '@/lib/ems-tracking';
import { sendShippingStatusEmail } from '@/lib/email';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';
import type { Database } from '@/types/database';

// ============================================================
// Types
// ============================================================

interface ShippingUpdateRequest {
  orderId: string;
  trackingNumber?: string;
  carrier?: 'ems' | 'surface_mail' | 'sea_freight' | 'air_freight' | 'other';
  shippingDate?: string;
  estimatedDeliveryDate?: string;
  status?: 'processing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  location?: string;
  notes?: string;
}

interface ShippingStatus {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  location?: string;
  estimatedDeliveryDate?: string;
  trackingURL?: string;
  japanPostURL?: string;
}

// ============================================================
// POST: Generate Tracking Number
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body: { orderId: string; carrier?: string } = await request.json();
    const { orderId, carrier: carrierParam = 'ems' } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Validate and cast carrier type
    const validCarriers = ['ems', 'surface_mail', 'sea_freight', 'air_freight', 'other'] as const;
    const carrier: 'ems' | 'surface_mail' | 'sea_freight' | 'air_freight' | 'other' =
      validCarriers.includes(carrierParam as CarrierType)
        ? (carrierParam as 'ems' | 'surface_mail' | 'sea_freight' | 'air_freight' | 'other')
        : 'ems';

    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'generate_tracking_number',
      userId: auth.userId,
      route: '/api/admin/shipping/tracking',
    });

    // Generate new tracking number
    const trackingNumber = generateEMSTrackingNumber();

    // Get order info
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, customers!inner(*)')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update or create delivery tracking
    const { data: tracking, error: trackingError } = await supabaseAdmin
      .from('delivery_tracking')
      .upsert({
        order_id: orderId,
        tracking_number: trackingNumber,
        carrier: carrier,
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (trackingError) {
      console.error('[Shipping Tracking] Upsert error:', trackingError);
    }

    // Send notification email to customer
    if (order.customers) {
      const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
      await sendShippingStatusEmail({
        recipient: {
          name: customer?.full_name || customer?.name || 'お客様',
          email: customer?.email || '',
        },
        orderNumber: order.order_number,
        trackingNumber,
        carrier,
        status: 'processing',
        message: '商品が発送されました。配送追跡番号が発行されました。',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        trackingNumber,
        trackingURL: getEMSTrackingURL(trackingNumber),
        japanPostURL: getJapanPostTrackingURL(trackingNumber),
        carrier,
      },
      message: 'EMS送り状番号が生成されました',
    });
  } catch (error: unknown) {
    console.error('[Shipping Tracking] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// PATCH: Update Shipping Status
// ============================================================

export async function PATCH(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body: ShippingUpdateRequest = await request.json();
    const {
      orderId,
      trackingNumber,
      carrier,
      shippingDate,
      estimatedDeliveryDate,
      status,
      location,
      notes,
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (trackingNumber && !validateEMSTrackingNumber(trackingNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tracking number format' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'update_shipping_status',
      userId: auth.userId,
      route: '/api/admin/shipping/tracking',
    });

    // Build update data
    const updateData: ShipmentUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }
    if (carrier) {
      updateData.carrier = carrier;
    }
    if (shippingDate) {
      updateData.shipping_date = shippingDate;
    }
    if (estimatedDeliveryDate) {
      updateData.estimated_delivery_date_min = estimatedDeliveryDate;
      updateData.estimated_delivery_date_max = estimatedDeliveryDate;
    }
    if (status) {
      updateData.status = status;
    }
    if (notes) {
      updateData.admin_notes = notes;
    }

    // Update delivery tracking
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

    // Get order info for notification
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('order_number, customers!inner(*)')
      .eq('id', orderId)
      .single();

    // Send status update notification
    if (status && order?.customers) {
      const statusMessages: Record<string, string> = {
        shipped: '商品が発送されました。',
        in_transit: '商品が輸送中です。',
        out_for_delivery: '商品が配送先に到着し、配送予定です。',
        delivered: '商品の配送が完了しました。',
        failed: '配送に失敗しました。管理者にお問い合わせください。',
        returned: '商品が返送されました。',
      };

      // Extract customer data (handle both array and single object)
      const customerData = Array.isArray(order.customers) ? order.customers[0] : order.customers;
      const customerName = customerData?.full_name || customerData?.name || 'お客様';
      const customerEmail = customerData?.email || '';

      // Validate carrier type
      const validCarriers = ['ems', 'surface_mail', 'sea_freight', 'air_freight', 'other'] as const;
      const emailCarrier: 'ems' | 'surface_mail' | 'sea_freight' | 'air_freight' | 'other' =
        tracking.carrier && validCarriers.includes(tracking.carrier as CarrierType)
          ? (tracking.carrier as 'ems' | 'surface_mail' | 'sea_freight' | 'air_freight' | 'other')
          : 'ems';

      await sendShippingStatusEmail({
        recipient: {
          name: customerName,
          email: customerEmail,
        },
        orderNumber: order.order_number,
        trackingNumber: tracking.tracking_number || '',
        carrier: emailCarrier,
        status: status as Database["public"]["Tables"]["shipments"]["Row"]["status"],
        message: statusMessages[status] || '配送状態が更新されました。',
        location,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        trackingNumber: tracking.tracking_number,
        status: tracking.status,
        trackingURL: tracking.tracking_number
          ? getEMSTrackingURL(tracking.tracking_number)
          : null,
        japanPostURL: tracking.tracking_number
          ? getJapanPostTrackingURL(tracking.tracking_number)
          : null,
      },
      message: '配送状態が更新されました',
    });
  } catch (error: unknown) {
    console.error('[Shipping Tracking] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: Retrieve Shipping Status
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'get_shipping_status',
      userId: auth.userId,
      route: '/api/admin/shipping/tracking',
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

    if (!tracking) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No tracking information found',
      });
    }

    const responseData: ShippingStatus = {
      orderId: tracking.order_id,
      trackingNumber: tracking.tracking_number || '',
      carrier: tracking.carrier || 'ems',
      status: tracking.status || 'processing',
      location: undefined,
      estimatedDeliveryDate: tracking.estimated_delivery_date_max || undefined,
    };

    if (tracking.tracking_number) {
      responseData.trackingURL = getEMSTrackingURL(tracking.tracking_number);
      responseData.japanPostURL = getJapanPostTrackingURL(tracking.tracking_number);
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: unknown) {
    console.error('[Shipping Tracking] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
