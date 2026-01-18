/**
 * Shipment Creation API
 * POST /api/shipments/create
 *
 * Creates a new shipment for an order that's ready for production completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import {
  CarrierType,
  ShippingServiceType,
  DeliveryTimeSlot,
  CreateShipmentRequest,
  ShipmentError,
} from '@/types/shipment';
import {
  createShipmentWithCarrier,
  calculateEstimatedDelivery,
} from '@/lib/shipping-carriers';
import { sendShipmentNotificationEmail, createRecipient } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Generate tracking URL based on carrier
 */
function getTrackingUrl(carrier: CarrierType, trackingNumber: string): string {
  switch (carrier) {
    case 'yamato':
      return `https://tokky.kuronekoyamato.co.jp/tokky.jsp?nob=${trackingNumber}`;
    case 'sagawa':
      return `https://k2k.sagawa-exp.co.jp/web/search.html?no=${trackingNumber}`;
    case 'jp_post':
      return `https://tracking.post.japanpost.jp/services/srv/search/direct?searchKind=S004&locale=ja&reqCodeNo1=${trackingNumber}`;
    case 'seino':
      return `https://track.seino.co.jp/kamotsu/TrackNo?n=${trackingNumber}`;
    default:
      return '';
  }
}

// Default sender address (warehouse)
const DEFAULT_SENDER_ADDRESS = {
  name: process.env.WAREHOUSE_NAME || 'Epackage Lab',
  postal_code: process.env.WAREHOUSE_POSTAL_CODE || '100-0001',
  prefecture: process.env.WAREHOUSE_PREFECTURE || '東京都',
  city: process.env.WAREHOUSE_CITY || '千代田区',
  address: process.env.WAREHOUSE_ADDRESS || '丸の内1-1-1',
  building: process.env.WAREHOUSE_BUILDING,
  phone: process.env.WAREHOUSE_PHONE || '03-1234-5678',
};

/**
 * POST handler - Create new shipment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    // Parse request body
    const body: CreateShipmentRequest = await request.json();

    // Validate required fields
    if (!body.order_id) {
      throw new ShipmentError('order_id is required', 'MISSING_ORDER_ID');
    }
    if (!body.carrier) {
      throw new ShipmentError('carrier is required', 'MISSING_CARRIER');
    }

    // Validate carrier type
    if (!Object.values(CarrierType).includes(body.carrier)) {
      throw new ShipmentError('Invalid carrier type', 'INVALID_CARRIER');
    }

    // Validate service type if provided
    if (body.service_type && !Object.values(ShippingServiceType).includes(body.service_type)) {
      throw new ShipmentError('Invalid service type', 'INVALID_SERVICE_TYPE');
    }

    // =====================================================
    // Step 1: Verify order is ready for shipment
    // =====================================================

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        production_status,
        payment_status,
        total_amount,
        paid_amount
      `)
      .eq('id', body.order_id)
      .single();

    if (orderError || !order) {
      throw new ShipmentError('Order not found', 'ORDER_NOT_FOUND');
    }

    const orderTyped = order as any;

    // Check production status - must be in final_inspection or completed
    const validProductionStatuses = ['final_inspection', 'completed', 'quality_check_passed'];
    if (!validProductionStatuses.includes(orderTyped.production_status)) {
      throw new ShipmentError(
        `Order production status must be completed, current status: ${orderTyped.production_status}`,
        'ORDER_NOT_READY'
      );
    }

    // Check payment status if applicable
    if (orderTyped.payment_status === 'pending' && orderTyped.total_amount > 0) {
      throw new ShipmentError(
        'Order payment must be completed before shipping',
        'PAYMENT_PENDING'
      );
    }

    // Check if shipment already exists for this order
    const { data: existingShipment } = await supabase
      .from('shipments')
      .select('id, status')
      .eq('order_id', body.order_id)
      .maybeSingle();

    const existingShipmentTyped = existingShipment as any;

    if (existingShipmentTyped) {
      throw new ShipmentError(
        `Shipment already exists for this order (ID: ${existingShipmentTyped.id})`,
        'SHIPMENT_EXISTS'
      );
    }

    // =====================================================
    // Step 2: Create shipment with carrier API
    // =====================================================

    const pickupDate = body.pickup_scheduled_for
      ? new Date(body.pickup_scheduled_for)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default: tomorrow

    const deliveryDateRequest = body.delivery_date_request
      ? new Date(body.delivery_date_request)
      : undefined;

    const carrierResponse = await createShipmentWithCarrier(
      body.order_id,
      body.carrier,
      pickupDate,
      DEFAULT_SENDER_ADDRESS,
      orderTyped.shipping_address,
      body.service_type || ShippingServiceType.TAKKYUBIN,
      body.package_count || 1,
      body.weight_kg,
      body.dimensions_cm,
      body.delivery_time_slot,
      deliveryDateRequest
    );

    // Calculate estimated delivery if not provided by carrier
    const estimatedDelivery = carrierResponse.estimatedDelivery
      ? new Date(carrierResponse.estimatedDelivery)
      : calculateEstimatedDelivery(
          body.carrier,
          body.service_type || ShippingServiceType.TAKKYUBIN,
          pickupDate,
          DEFAULT_SENDER_ADDRESS.postal_code,
          orderTyped.shipping_address.postal_code
        );

    // =====================================================
    // Step 3: Create shipment record in database
    // =====================================================

    const { data: shipment, error: shipmentError } = await (supabase as any)
      .from('shipments')
      .insert({
        order_id: body.order_id,
        carrier: body.carrier,
        service_type: body.service_type || ShippingServiceType.TAKKYUBIN,
        tracking_number: carrierResponse.trackingNumber,
        package_count: body.package_count || 1,
        weight_kg: body.weight_kg,
        dimensions_cm: body.dimensions_cm,
        delivery_time_slot: body.delivery_time_slot || DeliveryTimeSlot.NONE,
        delivery_date_request: body.delivery_date_request,
        shipping_address: orderTyped.shipping_address,
        sender_address: DEFAULT_SENDER_ADDRESS,
        pickup_scheduled_for: pickupDate.toISOString(),
        estimated_delivery: estimatedDelivery.toISOString(),
        tracking_data: carrierResponse,
        shipping_label_url: carrierResponse.labelUrl,
        customer_notes: body.customer_notes,
        status: 'pending',
      })
      .select()
      .single();

    if (shipmentError || !shipment) {
      throw new ShipmentError('Failed to create shipment record', 'DB_ERROR', shipmentError);
    }

    // =====================================================
    // Step 4: Create initial tracking event
    // =====================================================

    await (supabase as any).from('shipment_tracking_events').insert({
      shipment_id: shipment.id,
      event_time: new Date().toISOString(),
      status: 'CREATED',
      location: DEFAULT_SENDER_ADDRESS.city + ', ' + DEFAULT_SENDER_ADDRESS.prefecture,
      description_ja: '配送を作成しました',
      description_en: 'Shipment created',
      raw_data: carrierResponse,
    });

    // =====================================================
    // Step 5: Update order status
    // =====================================================

    await (supabase as any)
      .from('orders')
      .update({
        production_status: 'shipped',
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.order_id);

    // =====================================================
    // Step 6: Send notification to customer
    // =====================================================

    try {
      if (orderTyped.customer_email) {
        const recipient = createRecipient(
          orderTyped.customer_name || 'お客様',
          orderTyped.customer_email
        );

        const orderInfo = {
          orderId: orderTyped.id,
          orderDate: new Date().toISOString(),
          totalAmount: orderTyped.total_amount,
          items: [], // Items can be fetched if needed
        };

        const shipmentInfo = {
          trackingNumber: carrierResponse.trackingNumber,
          carrier: body.carrier,
          estimatedDelivery: estimatedDelivery.toISOString(),
          shippingAddress: orderTyped.shipping_address,
        };

        // Generate tracking URL based on carrier
        const trackingUrl = getTrackingUrl(body.carrier, carrierResponse.trackingNumber);

        await sendShipmentNotificationEmail(
          recipient,
          orderInfo,
          shipmentInfo,
          { trackingUrl }
        );

        console.log('[Shipment] Notification email sent:', {
          orderId: body.order_id,
          customerEmail: orderTyped.customer_email,
          trackingNumber: carrierResponse.trackingNumber,
        });
      }
    } catch (emailError) {
      console.error('[Shipment] Email error:', emailError);
      // Don't fail the request if email fails
    }

    // =====================================================
    // Step 7: Return response
    // =====================================================

    return NextResponse.json({
      success: true,
      shipment: {
        id: shipment.id,
        shipment_number: shipment.shipment_number,
        order_id: shipment.order_id,
        order_number: orderTyped.order_number,
        carrier: shipment.carrier,
        service_type: shipment.service_type,
        tracking_number: shipment.tracking_number,
        pickup_scheduled_for: shipment.pickup_scheduled_for,
        estimated_delivery: shipment.estimated_delivery,
        status: shipment.status,
        shipping_label_url: shipment.shipping_label_url,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Shipment creation error:', error);

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
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
    }, { status: 500 });
  }
}

/**
 * GET handler - List ready orders for shipment
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Order status filter
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        production_status,
        payment_status,
        total_amount,
        created_at,
        shipments(id, status, tracking_number)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status) {
      query = query.eq('production_status', status);
    } else {
      // Default: show orders ready for shipment
      query = query.in('production_status', ['final_inspection', 'completed', 'quality_check_passed']);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      throw error;
    }

    // Filter out orders that already have shipments
    const readyOrders = orders?.filter((order: any) => !order.shipments || order.shipments.length === 0) || [];

    return NextResponse.json({
      success: true,
      orders: readyOrders,
      total: count || 0,
      offset,
      limit,
    });

  } catch (error) {
    console.error('Get ready orders error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch ready orders',
        details: error instanceof Error ? error.message : String(error),
      },
    }, { status: 500 });
  }
}
