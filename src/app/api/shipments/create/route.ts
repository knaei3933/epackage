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
        delivery_address,
        status,
        total_amount
      `)
      .eq('id', body.order_id)
      .single();

    if (orderError || !order) {
      throw new ShipmentError('Order not found', 'ORDER_NOT_FOUND');
    }

    const orderTyped = order as any;

    // Check order status - must be PRODUCTION (10-step workflow)
    const validOrderStatuses = ['PRODUCTION', 'READY_TO_SHIP'];
    if (!validOrderStatuses.includes(orderTyped.status)) {
      throw new ShipmentError(
        `Order status must be PRODUCTION or READY_TO_SHIP, current status: ${orderTyped.status}`,
        'ORDER_NOT_READY'
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
      orderTyped.delivery_address,
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
          orderTyped.delivery_address.postal_code
        );

    // Generate shipment number: SHP-YYYYMMDD-NNNN
    const shipmentNumber = `SHP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Map carrier type to carrier name and code
    const carrierNameMap: Record<string, string> = {
      yamato: 'Yamato Transport',
      sagawa: 'Sagawa Express',
      jp_post: 'Japan Post',
      seino: 'Seino Transport',
    };

    const carrierCodeMap: Record<string, string> = {
      yamato: 'YTO',
      sagawa: 'SGE',
      jp_post: 'JPP',
      seino: 'SNO',
    };

    // Map service type to service level
    const serviceLevelMap: Record<string, string> = {
      [ShippingServiceType.TAKKYUBIN]: 'STANDARD',
      [ShippingServiceType.COOL]: 'EXPRESS',
      [ShippingServiceType.REGULAR]: 'ECONOMY',
      [ShippingServiceType.MAIL]: 'STANDARD',
    };

    // Prepare package details as JSONB
    const packageDetails = {
      packages_count: body.package_count || 1,
      total_weight_kg: body.weight_kg,
      dimensions: body.dimensions_cm,
      special_handling: body.delivery_time_slot !== DeliveryTimeSlot.NONE ? [body.delivery_time_slot] : [],
    };

    // =====================================================
    // Step 3: Create shipment record in database
    // =====================================================

    // Use user-provided tracking number or auto-generate
    const trackingNumber = body.tracking_number || carrierResponse.trackingNumber;

    const { data: shipment, error: shipmentError } = await (supabase as any)
      .from('shipments')
      .insert({
        order_id: body.order_id,
        shipment_number: shipmentNumber,
        tracking_number: trackingNumber,
        carrier_name: carrierNameMap[body.carrier] || body.carrier,
        carrier_code: carrierCodeMap[body.carrier] || body.carrier.toUpperCase().slice(0, 3),
        service_level: serviceLevelMap[body.service_type || ShippingServiceType.TAKKYUBIN] || 'STANDARD',
        shipping_method: 'courier',
        shipping_cost: 0,
        package_details: packageDetails,
        tracking_url: getTrackingUrl(body.carrier, trackingNumber),
        estimated_delivery_date: estimatedDelivery.toISOString().split('T')[0],
        shipped_at: pickupDate.toISOString(),
        status: 'pending',
        shipping_notes: body.customer_notes,
      })
      .select()
      .single();

    if (shipmentError || !shipment) {
      console.error('[Shipment] DB Error Details:', JSON.stringify(shipmentError, null, 2));
      throw new ShipmentError('Failed to create shipment record', 'DB_ERROR', shipmentError);
    }

    // =====================================================
    // Step 4: Create initial tracking event
    // =====================================================

    await (supabase as any).from('shipment_tracking').insert({
      shipment_id: shipment.id,
      status_code: 'CREATED',
      status_description: '配送を作成しました',
      location: DEFAULT_SENDER_ADDRESS.city + ', ' + DEFAULT_SENDER_ADDRESS.prefecture,
      event_at: new Date().toISOString(),
      event_data: carrierResponse,
      source: 'api',
    });

    // =====================================================
    // Step 5: Update order status to READY_TO_SHIP (10-step workflow)
    // =====================================================

    await (supabase as any)
      .from('orders')
      .update({
        status: 'READY_TO_SHIP',
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
          trackingNumber: trackingNumber,
          carrier: body.carrier,
          estimatedDelivery: estimatedDelivery.toISOString(),
          shippingAddress: orderTyped.delivery_address,
        };

        // Generate tracking URL based on carrier
        const trackingUrl = getTrackingUrl(body.carrier, trackingNumber);

        await sendShipmentNotificationEmail(
          recipient,
          orderInfo,
          shipmentInfo,
          { trackingUrl }
        );

        console.log('[Shipment] Notification email sent:', {
          orderId: body.order_id,
          customerEmail: orderTyped.customer_email,
          trackingNumber: trackingNumber,
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
        delivery_address,
        status,
        total_amount,
        created_at,
        shipments(id, status, tracking_number)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    } else {
      // Default: show orders ready for shipment (PRODUCTION status in 10-step workflow)
      query = query.eq('status', 'PRODUCTION');
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
