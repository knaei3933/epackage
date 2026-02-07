/**
 * Shipments List API
 * GET /api/shipments
 *
 * Lists all shipments with filtering and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { ShipmentFilters, ShipmentStatus, CarrierType } from '@/types/shipment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET handler - List shipments with filters
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filters: ShipmentFilters = {
      status: searchParams.get('status') as ShipmentStatus || undefined,
      carrier: searchParams.get('carrier') as CarrierType || undefined,
      tracking_number: searchParams.get('tracking_number') || undefined,
      order_id: searchParams.get('order_id') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '50');
    const offset = (page - 1) * pageSize;

    // Build query - join with orders table to get order info
    let query = supabase
      .from('shipments')
      .select(`
        *,
        orders (
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          delivery_address,
          status
        )
      `, { count: 'exact' });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.carrier) {
      query = query.eq('carrier_name', filters.carrier);
    }

    if (filters.tracking_number) {
      query = query.like('tracking_number', `%${filters.tracking_number}%`);
    }

    if (filters.order_id) {
      query = query.eq('order_id', filters.order_id);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters.search) {
      // Search in shipment_number or order_number
      query = query.or(`shipment_number.ilike.%${filters.search}%,tracking_number.ilike.%${filters.search}%`);
    }

    // Apply pagination and sorting
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data: shipments, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get recent tracking for each shipment
    const shipmentIds = shipments?.map((s: any) => s.id) || [];
    const recentTrackingMap = new Map();

    if (shipmentIds.length > 0) {
      // Try shipment_tracking_events first, then fall back to shipment_tracking
      let tracking: any[] | null = null;

      const { data: trackingEvents } = await supabase
        .from('shipment_tracking_events')
        .select('*')
        .in('shipment_id', shipmentIds)
        .order('event_time', { ascending: false });

      if (trackingEvents && trackingEvents.length > 0) {
        tracking = trackingEvents;
      } else {
        // Fallback to shipment_tracking table
        const { data: trackingBackup } = await supabase
          .from('shipment_tracking')
          .select('*')
          .in('shipment_id', shipmentIds)
          .order('event_at', { ascending: false });

        tracking = trackingBackup;
      }

      // Group by shipment_id and take the most recent
      tracking?.forEach((t: any) => {
        if (!recentTrackingMap.has(t.shipment_id)) {
          recentTrackingMap.set(t.shipment_id, t);
        }
      });
    }

    // Format shipments with order data and tracking
    const shipmentsWithTracking = (shipments || []).map((shipment: any) => ({
      ...shipment,
      order_number: shipment.orders?.[0]?.order_number || null,
      customer_name: shipment.orders?.[0]?.customer_name || null,
      customer_email: shipment.orders?.[0]?.customer_email || null,
      customer_phone: shipment.orders?.[0]?.customer_phone || null,
      delivery_address: shipment.orders?.[0]?.delivery_address || null,
      order_status: shipment.orders?.[0]?.status || null,
      recent_tracking: recentTrackingMap.get(shipment.id) || null,
    }));

    return NextResponse.json({
      success: true,
      shipments: shipmentsWithTracking,
      pagination: {
        total: count || 0,
        page,
        page_size: pageSize,
        total_pages: Math.ceil((count || 0) / pageSize),
      },
    });

  } catch (error) {
    console.error('List shipments error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch shipments',
        details: error instanceof Error ? error.message : String(error),
      },
    }, { status: 500 });
  }
}
