/**
 * Shipment Update API
 * PUT /api/shipments/[id]
 *
 * Updates shipment details including tracking number, carrier, status, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper function to create service role client
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
  });
}

interface UpdateShipmentRequest {
  tracking_number?: string;
  carrier_name?: string;
  carrier_code?: string;
  service_level?: string;
  status?: string;
  estimated_delivery_date?: string;
  shipping_notes?: string;
  package_details?: any;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shipmentId } = await params;

    // Parse request body
    const body: UpdateShipmentRequest = await request.json();

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient();

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.tracking_number !== undefined) updateData.tracking_number = body.tracking_number;
    if (body.carrier_name !== undefined) updateData.carrier_name = body.carrier_name;
    if (body.carrier_code !== undefined) updateData.carrier_code = body.carrier_code;
    if (body.service_level !== undefined) updateData.service_level = body.service_level;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.estimated_delivery_date !== undefined) updateData.estimated_delivery_date = body.estimated_delivery_date;
    if (body.shipping_notes !== undefined) updateData.shipping_notes = body.shipping_notes;
    if (body.package_details !== undefined) updateData.package_details = body.package_details;

    // Update shipment
    const { data, error } = await supabase
      .from('shipments')
      .update(updateData)
      .eq('id', shipmentId)
      .select()
      .single();

    if (error) {
      console.error('[ShipmentUpdate] DB Error:', error);
      return NextResponse.json({
        success: false,
        error: {
          code: 'DB_ERROR',
          message: 'Failed to update shipment',
          details: error.message,
        },
      }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Shipment not found',
        },
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      shipment: data,
    });

  } catch (error) {
    console.error('Shipment update error:', error);

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
 * GET handler - Fetch shipment details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shipmentId } = await params;
    const supabase = createServiceRoleClient();

    // まず shipments データを取得
    const { data: shipmentData, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();

    if (shipmentError || !shipmentData) {
      console.error('[ShipmentGet] DB Error:', shipmentError);
      throw shipmentError || new Error('Shipment not found');
    }

    // order_id を使用して orders データを取得
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, customer_email, delivery_address')
      .eq('id', shipmentData.order_id)
      .single();

    if (orderError) {
      console.error('[ShipmentGet] Order fetch error:', orderError);
      // 注文データがなくても shipment データは返す
    }

    // shipment データに order データをマージ
    const data = {
      ...shipmentData,
      order: orderData || null,
    };

    return NextResponse.json({
      success: true,
      shipment: data,
    });

  } catch (error) {
    console.error('Shipment fetch error:', error);

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
