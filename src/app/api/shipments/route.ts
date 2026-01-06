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

    // Build query - use view with recent tracking included (N+1 fix)
    let query = supabase
      .from('shipments_with_recent_tracking')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.carrier) {
      query = query.eq('carrier', filters.carrier);
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
      // Search in shipment_number or customer_name
      query = query.or(`shipment_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`);
    }

    // Apply pagination and sorting
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data: shipments, error, count } = await query;

    if (error) {
      throw error;
    }

    // N+1 FIX: recent_tracking already included from the view
    // Format shipments with tracking data from the view
    const shipmentsWithTracking = (shipments || []).map((shipment: any) => ({
      ...shipment,
      recent_tracking: shipment.recent_tracking || [],
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
