/**
 * Bulk Create Shipments API
 * POST /api/shipments/bulk-create
 *
 * Creates multiple shipments at once for selected orders
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import {
  CarrierType,
  ShippingServiceType,
  DeliveryTimeSlot,
  BulkCreateShipmentRequest,
  ShipmentError,
} from '@/types/shipment';
import {
  createShipmentWithCarrier,
  calculateEstimatedDelivery,
} from '@/lib/shipping-carriers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
 * POST handler - Bulk create shipments
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    // Parse request body
    const body: BulkCreateShipmentRequest = await request.json();

    // Validate required fields
    if (!body.order_ids || !Array.isArray(body.order_ids) || body.order_ids.length === 0) {
      throw new ShipmentError('order_ids array is required', 'MISSING_ORDER_IDS');
    }

    if (!body.carrier) {
      throw new ShipmentError('carrier is required', 'MISSING_CARRIER');
    }

    // Validate carrier type
    if (!Object.values(CarrierType).includes(body.carrier)) {
      throw new ShipmentError('Invalid carrier type', 'INVALID_CARRIER');
    }

    // Limit bulk operations to prevent timeouts
    const MAX_BULK_SIZE = 20;
    if (body.order_ids.length > MAX_BULK_SIZE) {
      throw new ShipmentError(
        `Cannot create more than ${MAX_BULK_SIZE} shipments at once`,
        'BULK_LIMIT_EXCEEDED'
      );
    }

    // Get pickup date
    const pickupDate = body.pickup_scheduled_for
      ? new Date(body.pickup_scheduled_for)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    // =====================================================
    // Step 1: Verify all orders are ready for shipment
    // =====================================================

    const { data: orders, error: ordersError } = await supabase
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
      .in('id', body.order_ids);

    if (ordersError || !orders || orders.length === 0) {
      throw new ShipmentError('No valid orders found', 'NO_VALID_ORDERS');
    }

    const ordersTyped = orders as any[];

    // Check each order is ready
    const validProductionStatuses = ['final_inspection', 'completed', 'quality_check_passed'];
    const notReadyOrders: string[] = [];

    for (const order of ordersTyped) {
      // Check production status
      if (!validProductionStatuses.includes(order.production_status)) {
        notReadyOrders.push(`${order.order_number}: ${order.production_status}`);
        continue;
      }

      // Check payment status
      if (order.payment_status === 'pending' && order.total_amount > 0) {
        notReadyOrders.push(`${order.order_number}: payment pending`);
        continue;
      }

      // Check if shipment already exists
      const { data: existingShipment } = await supabase
        .from('shipments')
        .select('id')
        .eq('order_id', order.id)
        .maybeSingle();

      if (existingShipment) {
        notReadyOrders.push(`${order.order_number}: shipment exists`);
      }
    }

    if (notReadyOrders.length > 0) {
      throw new ShipmentError(
        `Some orders are not ready for shipment: ${notReadyOrders.join(', ')}`,
        'ORDERS_NOT_READY',
        { not_ready_orders: notReadyOrders }
      );
    }

    // =====================================================
    // Step 2: Create shipments for all orders
    // =====================================================

    const results = {
      successful: [] as any[],
      failed: [] as any[],
      total: ordersTyped.length,
      created: 0,
      errors: 0,
    };

    for (const order of ordersTyped) {
      try {
        // Create shipment with carrier
        const carrierResponse = await createShipmentWithCarrier(
          order.id,
          body.carrier,
          pickupDate,
          DEFAULT_SENDER_ADDRESS,
          order.shipping_address,
          body.service_type || ShippingServiceType.TAKKYUBIN,
          1, // package_count
          undefined, // weight_kg
          undefined, // dimensions_cm
          DeliveryTimeSlot.NONE,
          undefined // delivery_date_request
        );

        // Calculate estimated delivery
        const estimatedDelivery = calculateEstimatedDelivery(
          body.carrier,
          body.service_type || ShippingServiceType.TAKKYUBIN,
          pickupDate,
          DEFAULT_SENDER_ADDRESS.postal_code,
          order.shipping_address.postal_code
        );

        // Create shipment record
        const { data: shipment, error: shipmentError } = await (supabase as any)
          .from('shipments')
          .insert({
            order_id: order.id,
            carrier: body.carrier,
            service_type: body.service_type || ShippingServiceType.TAKKYUBIN,
            tracking_number: carrierResponse.trackingNumber,
            package_count: 1,
            delivery_time_slot: DeliveryTimeSlot.NONE,
            shipping_address: order.shipping_address,
            sender_address: DEFAULT_SENDER_ADDRESS,
            pickup_scheduled_for: pickupDate.toISOString(),
            estimated_delivery: estimatedDelivery.toISOString(),
            tracking_data: carrierResponse,
            shipping_label_url: carrierResponse.labelUrl,
            status: 'pending',
          })
          .select()
          .single();

        if (shipmentError || !shipment) {
          throw new Error('Failed to create shipment record');
        }

        // Create initial tracking event
        await (supabase as any).from('shipment_tracking_events').insert({
          shipment_id: shipment.id,
          event_time: new Date().toISOString(),
          status: 'CREATED',
          location: DEFAULT_SENDER_ADDRESS.city + ', ' + DEFAULT_SENDER_ADDRESS.prefecture,
          description_ja: '配送を作成しました',
          description_en: 'Shipment created',
          raw_data: carrierResponse,
        });

        // Update order status
        await (supabase as any)
          .from('orders')
          .update({
            production_status: 'shipped',
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id);

        results.successful.push({
          order_id: order.id,
          order_number: order.order_number,
          shipment_id: shipment.id,
          shipment_number: shipment.shipment_number,
          tracking_number: shipment.tracking_number,
        });

        results.created++;

      } catch (error) {
        results.failed.push({
          order_id: order.id,
          order_number: order.order_number,
          error: error instanceof Error ? error.message : String(error),
        });
        results.errors++;
      }
    }

    // =====================================================
    // Step 3: Return results
    // =====================================================

    return NextResponse.json({
      success: true,
      results,
      message: `Created ${results.created} shipments successfully${results.errors > 0 ? `, ${results.errors} failed` : ''}`,
    }, { status: 201 });

  } catch (error) {
    console.error('Bulk create shipments error:', error);

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
