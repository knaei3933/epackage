/**
 * Bulk Order Status Update API
 * PUT /api/admin/orders/bulk-status
 *
 * Updates the status of multiple orders at once
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper function to create service role client
function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_ids, status } = body;

    // Validate required fields
    if (!Array.isArray(order_ids) || order_ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'order_ids is required and must be a non-empty array',
        },
      }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'status is required',
        },
      }, { status: 400 });
    }

    // Use service role client to bypass RLS
    const supabase = createServiceRoleClient();

    // Update all orders
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in('id', order_ids)
      .select();

    if (error) {
      console.error('[BulkStatusUpdate] DB Error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      updated_count: data?.length || 0,
      orders: data,
    });

  } catch (error) {
    console.error('Bulk status update error:', error);

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
