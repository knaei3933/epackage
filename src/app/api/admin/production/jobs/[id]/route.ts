/**
 * Production Job Status Update API
 *
 * 生産ジョブステータス更新API
 *
 * POST - Update production job status with timestamp tracking
 */

import { createSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import type { Database } from '@/types/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: jobId } = await params;
    const supabase = createSupabaseClient();

    // Parse request body
    const body = await request.json();
    const { status, notes } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Valid status values
    const validStatuses = ['pending', 'in_progress', 'quality_check', 'completed', 'shipped', 'failed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Update production order status
    const updateData: Partial<ProductionJobRow> = {
      current_stage: status,
      updated_at: new Date().toISOString(),
    };

    // Set timestamp based on status
    const timestampField = `${status}_at`;
    if (status === 'in_progress') {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updateData.actual_completion_date = new Date().toISOString();
      updateData.progress_percentage = 100;
    }

    const { data: productionOrder, error: updateError } = await supabase
      .from('production_orders')
      .update(updateData)
      .eq('id', jobId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating production order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update production status' },
        { status: 500 }
      );
    }

    // Log the action in stage_action_history
    if (productionOrder) {
      await supabase
        .from('stage_action_history')
        .insert({
          production_order_id: productionOrder.id,
          stage: status as string,
          action: 'status_changed',
          performed_by: auth.userId,
          performed_at: new Date().toISOString(),
          notes: notes || `Status changed to ${status}`,
          metadata: {
            previous_status: productionOrder.current_stage,
            new_status: status,
          },
        });
    }

    return NextResponse.json({
      success: true,
      productionOrder,
      message: `Status updated to ${status}`,
    });
  } catch (error: unknown) {
    console.error('Error updating production status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update production status' },
      { status: 500 }
    );
  }
}

// GET - Fetch production job details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id: jobId } = await params;
    const supabase = createSupabaseClient();

    // Fetch production order with related order data
    const { data: productionOrder, error } = await supabase
      .from('production_orders')
      .select(`
        *,
        orders (
          order_number,
          customer_name,
          customer_email,
          total_amount
        ),
        order_items (
          product_name,
          quantity,
          specifications
        )
      `)
      .eq('id', jobId)
      .single();

    if (error || !productionOrder) {
      return NextResponse.json(
        { error: 'Production order not found' },
        { status: 404 }
      );
    }

    // Fetch action history
    const { data: actionHistory } = await supabase
      .from('stage_action_history')
      .select('*')
      .eq('production_order_id', jobId)
      .order('performed_at', { ascending: false })
      .limit(20);

    return NextResponse.json({
      productionOrder,
      actionHistory: actionHistory || [],
    });
  } catch (error: unknown) {
    console.error('Error fetching production order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch production order' },
      { status: 500 }
    );
  }
}
