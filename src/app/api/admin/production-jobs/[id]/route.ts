/**
 * Production Jobs API Route
 *
 * 製造ジョブAPIルート
 *
 * API endpoint for fetching production job details by ID
 * Uses MCP Supabase execute_sql for data retrieval
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
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
    const { client: supabase } = await createSupabaseSSRClient(request);
    // production_orders / stage_action_history are not in the hand-written
    // Database type (kept minimal). Use a loosely-typed alias so dynamic
    // table access compiles without touching database.ts.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = supabase;
    // Fetch production job details using execute_sql
    const { data: productionJob, error: jobError } = await db
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
    const { data: orderDetails } = await db
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order: any = orderDetails;
    const transformedOrderDetails = order ? {
      id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
      customer_name: order.profiles?.company_name ||
        `${order.profiles?.kanji_last_name || ''} ${order.profiles?.kanji_first_name || ''}`.trim() ||
        'N/A',
      customer_email: order.profiles?.email || 'N/A',
    } : null;

    // Fetch stage action history
    const { data: stageHistory } = await db
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
      { error: 'Failed to fetch production job' },
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
    const { client: supabase } = await createSupabaseSSRClient(request);
    // production_orders / stage_action_history are not in the hand-written
    // Database type (kept minimal). Use a loosely-typed alias so dynamic
    // table access compiles without touching database.ts.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = supabase;
    const body = await request.json();
    const { action, reason } = body;

    // Fetch current production order
    const { data: currentOrder, error: fetchError } = await db
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stageData: any = currentOrder.stage_data;
      const updatedStageData = {
        ...stageData,
        [currentOrder.current_stage]: {
          ...(stageData[currentOrder.current_stage] || {}),
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: auth.userId,
        },
        [nextStage]: {
          ...(stageData[nextStage] || {}),
          status: 'in_progress',
          started_at: new Date().toISOString(),
        },
      };

      // Calculate new progress percentage
      const newProgress = Math.round(((currentIndex + 1) / stages.length) * 100);

      // Update production order
      const { data } = await db
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
      await db.from('stage_action_history').insert({
        production_order_id: id,
        stage: nextStage,
        action: 'started',
        performed_by: auth.userId,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stageData: any = currentOrder.stage_data;
      const updatedStageData = {
        ...stageData,
        [currentOrder.current_stage]: {
          ...(stageData[currentOrder.current_stage] || {}),
          status: 'pending',
          started_at: null,
        },
        [previousStage]: {
          ...(stageData[previousStage] || {}),
          status: 'in_progress',
        },
      };

      // Calculate new progress percentage
      const newProgress = Math.round((currentIndex / stages.length) * 100);

      // Update production order
      const { data } = await db
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
      await db.from('stage_action_history').insert({
        production_order_id: id,
        stage: previousStage,
        action: 'rolled_back',
        performed_by: auth.userId,
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
      { error: 'Failed to update production job' },
      { status: 500 }
    );
  }
}
