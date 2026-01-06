/**
 * Production Jobs API Route
 *
 * 製造ジョブAPIルート
 *
 * API endpoint for fetching production job details by ID
 * Uses MCP Supabase execute_sql for data retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

// =====================================================
// GET - Fetch Production Job by ID
// =====================================================

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

    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch production job details using execute_sql
    const { data: productionJob, error: jobError } = await supabase
      .from('production_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (jobError || !productionJob) {
      return NextResponse.json(
        { error: 'Production job not found' },
        { status: 404 }
      );
    }

    // Fetch related order details
    const { data: orderDetails } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount,
        user_id,
        profiles:user_id (
          email,
          kanji_last_name,
          kanji_first_name,
          company_name
        )
      `)
      .eq('id', productionJob.order_id)
      .single();

    // Transform the data to match expected format
    const transformedOrderDetails = orderDetails ? {
      id: orderDetails.id,
      order_number: orderDetails.order_number,
      total_amount: orderDetails.total_amount,
      customer_name: orderDetails.profiles?.company_name ||
        `${orderDetails.profiles?.kanji_last_name || ''} ${orderDetails.profiles?.kanji_first_name || ''}`.trim() ||
        'N/A',
      customer_email: orderDetails.profiles?.email || 'N/A',
    } : null;

    // Fetch stage action history
    const { data: stageHistory } = await supabase
      .from('stage_action_history')
      .select('*')
      .eq('production_order_id', id)
      .order('performed_at', { ascending: false });

    return NextResponse.json({
      productionJob,
      orderDetails: transformedOrderDetails,
      stageHistory: stageHistory || [],
    });
  } catch (error: unknown) {
    console.error('Error fetching production job:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch production job' },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - Update Production Job
// =====================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const supabase = createRouteHandlerClient({ cookies });

    const body = await request.json();
    const { action, reason } = body;

    // Fetch current production order
    const { data: currentOrder, error: fetchError } = await supabase
      .from('production_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !currentOrder) {
      return NextResponse.json({ error: 'Production job not found' }, { status: 404 });
    }

    let updatedOrder;

    if (action === 'advance') {
      // Get next stage
      const stages = [
        'data_received',
        'inspection',
        'design',
        'plate_making',
        'printing',
        'surface_finishing',
        'die_cutting',
        'lamination',
        'final_inspection',
      ];

      const currentIndex = stages.indexOf(currentOrder.current_stage);
      if (currentIndex === stages.length - 1) {
        return NextResponse.json({ error: 'Already at final stage' }, { status: 400 });
      }

      const nextStage = stages[currentIndex + 1];

      // Update stage data
      const updatedStageData = {
        ...currentOrder.stage_data,
        [currentOrder.current_stage]: {
          ...(currentOrder.stage_data[currentOrder.current_stage] || {}),
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: user.id,
        },
        [nextStage]: {
          ...(currentOrder.stage_data[nextStage] || {}),
          status: 'in_progress',
          started_at: new Date().toISOString(),
        },
      };

      // Calculate new progress percentage
      const newProgress = Math.round(((currentIndex + 1) / stages.length) * 100);

      // Update production order
      const { data } = await supabase
        .from('production_orders')
        .update({
          current_stage: nextStage,
          stage_data: updatedStageData,
          progress_percentage: newProgress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      updatedOrder = data;

      // Log action in history
      await supabase.from('stage_action_history').insert({
        production_order_id: id,
        stage: nextStage,
        action: 'started',
        performed_by: user.id,
        performed_at: new Date().toISOString(),
        notes: `Advanced from ${currentOrder.current_stage}`,
      });
    } else if (action === 'rollback') {
      // Get previous stage
      const stages = [
        'data_received',
        'inspection',
        'design',
        'plate_making',
        'printing',
        'surface_finishing',
        'die_cutting',
        'lamination',
        'final_inspection',
      ];

      const currentIndex = stages.indexOf(currentOrder.current_stage);
      if (currentIndex === 0) {
        return NextResponse.json({ error: 'Already at first stage' }, { status: 400 });
      }

      const previousStage = stages[currentIndex - 1];

      // Update stage data
      const updatedStageData = {
        ...currentOrder.stage_data,
        [currentOrder.current_stage]: {
          ...(currentOrder.stage_data[currentOrder.current_stage] || {}),
          status: 'pending',
          started_at: null,
        },
        [previousStage]: {
          ...(currentOrder.stage_data[previousStage] || {}),
          status: 'in_progress',
        },
      };

      // Calculate new progress percentage
      const newProgress = Math.round((currentIndex / stages.length) * 100);

      // Update production order
      const { data } = await supabase
        .from('production_orders')
        .update({
          current_stage: previousStage,
          stage_data: updatedStageData,
          progress_percentage: newProgress,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      updatedOrder = data;

      // Log action in history
      await supabase.from('stage_action_history').insert({
        production_order_id: id,
        stage: previousStage,
        action: 'rolled_back',
        performed_by: user.id,
        performed_at: new Date().toISOString(),
        notes: reason || `Rolled back from ${currentOrder.current_stage}`,
      });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      productionOrder: updatedOrder,
      message: `Stage ${action} successful`,
    });
  } catch (error: unknown) {
    console.error('Error updating production job:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update production job' },
      { status: 500 }
    );
  }
}
