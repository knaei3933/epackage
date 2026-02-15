/**
 * Delivery Completion API
 *
 * 配送完了API
 *
 * Marks a shipment as delivered and sends notification to customer
 * Admin can mark domestic delivery as complete
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { sendDeliveryCompletionEmail } from '@/lib/email';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { createAuthenticatedServiceClient } from '@/lib/supabase-authenticated';

// ============================================================
// Types
// ============================================================

interface DeliveryCompletionRequest {
  shipmentId: string;
  orderId?: string;
  actualDeliveryDate?: string;
  deliveredTo?: string;
  deliveryNoteUrl?: string;
  signatureImageUrl?: string;
  notes?: string;
}

interface CarrierLabel {
  ja: string;
  ko?: string;
  en: string;
}

const CARRIER_LABELS: Record<string, CarrierLabel> = {
  yamato: { ja: 'ヤマト運輸', en: 'Yamato Transport' },
  sagawa: { ja: '佐川急便', en: 'Sagawa Express' },
  jp_post: { ja: '日本郵便', en: 'Japan Post' },
  seino: { ja: 'セイノー運輸', en: 'Seino Transport' },
};

// ============================================================
// POST: Mark Delivery as Complete
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body: DeliveryCompletionRequest = await request.json();
    const {
      shipmentId,
      orderId,
      actualDeliveryDate,
      deliveredTo,
      deliveryNoteUrl,
      signatureImageUrl,
      notes,
    } = body;

    if (!shipmentId && !orderId) {
      return NextResponse.json(
        { success: false, error: 'Shipment ID or Order ID is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAuthenticatedServiceClient({
      operation: 'mark_delivery_complete',
      userId: auth.userId,
      route: '/api/admin/shipping/deliveries/complete',
    });

    // Find shipment by ID or order ID
    let shipment;
    if (shipmentId) {
      const { data: shipmentData } = await supabaseAdmin
        .from('shipments')
        .select('*')
        .eq('id', shipmentId)
        .single();
      shipment = shipmentData;
    } else if (orderId) {
      const { data: shipmentData } = await supabaseAdmin
        .from('shipments')
        .select('*')
        .eq('order_id', orderId)
        .single();
      shipment = shipmentData;
    }

    if (!shipment) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Update shipment status to delivered
    const updateData: Partial<Database["public"]["Tables"]["shipments"]["Row"]> = {
      status: 'delivered',
      actual_delivery_date: actualDeliveryDate || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (deliveredTo) {
      updateData.delivered_to = deliveredTo;
    }
    if (deliveryNoteUrl) {
      updateData.delivery_note_url = deliveryNoteUrl;
    }
    if (signatureImageUrl) {
      updateData.signature_image_url = signatureImageUrl;
    }
    if (notes !== undefined) {
      updateData.admin_notes = notes;
    }

    const { data: updatedShipment, error: updateError } = await supabaseAdmin
      .from('shipments')
      .update(updateData)
      .eq('id', shipment.id)
      .select()
      .single();

    if (updateError) {
      console.error('[Delivery Completion] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Add tracking entry
    await supabaseAdmin
      .from('shipment_tracking')
      .insert({
        shipment_id: shipment.id,
        status: 'delivered',
        location: deliveredTo || '配送先',
        description: '商品が配送完了しました',
        timestamp: new Date().toISOString(),
      });

    // Get order info for email notification
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, customers!inner(*)')
      .eq('id', shipment.order_id)
      .single();

    // Send delivery completion email
    if (order && order.customers) {
      const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
      const carrier = shipment.carrier as 'yamato' | 'sagawa' | 'jp_post' | 'seino';

      await sendDeliveryCompletionEmail({
        recipient: {
          name: customer?.full_name || customer?.name || 'お客様',
          email: customer?.email || '',
        },
        orderNumber: order.order_number,
        shipmentNumber: shipment.shipment_number,
        trackingNumber: shipment.tracking_number,
        carrier: carrier || 'yamato',
        carrierName: carrier ? CARRIER_LABELS[carrier]?.ja || 'ヤマト運輸' : 'ヤマト運輸',
        deliveredAt: actualDeliveryDate || new Date().toISOString(),
        deliveredTo,
        deliveryAddress: shipment.delivery_address
          ? {
              postalCode: shipment.delivery_address.postal_code || '',
              prefecture: shipment.delivery_address.prefecture || '',
              city: shipment.delivery_address.city || '',
              address: shipment.delivery_address.address || '',
              building: shipment.delivery_address.building,
            }
          : undefined,
        deliveryNoteUrl,
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedShipment,
      message: '配送完了を登録しました',
    });
  } catch (error: unknown) {
    console.error('[Delivery Completion] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
