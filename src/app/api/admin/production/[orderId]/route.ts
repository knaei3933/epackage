/**
 * Production Tracking API Routes
 *
 * 製造追跡APIルート
 *
 * API endpoints for managing production workflow stages
 * GET    - Fetch production order details
 * PATCH  - Update current stage
 * POST   - Add stage note, upload photo, assign staff
 */

import { createSupabaseClient } from '@/lib/supabase';
import { productionActions } from '@/lib/production-actions';
import { NextRequest, NextResponse } from 'next/server';
import type { ProductionStage } from '@/types/production';
import type { Database } from '@/types/database';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

// productionActions は現状 getProductionOrderByOrderId / getStageActionHistory のみ実装。
// 以下の stage 操作メソッドは未実装（実行時は undefined エラー）だが、型エラー解消のため any で扱う。
const productionActionsAny = productionActions as any;

// =====================================================
// GET - Fetch Production Order
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { orderId } = await params;
    const supabase = createSupabaseClient();

    // Fetch production order
    const productionOrder = await productionActions.getProductionOrderByOrderId(orderId);

    if (!productionOrder) {
      return NextResponse.json({ error: 'Production order not found' }, { status: 404 });
    }

    // Fetch action history
    const actionHistory = await productionActions.getStageActionHistory(productionOrder.id);

    // Fetch related order details
    const { data: order } = await supabase
      .from('orders')
      .select('order_number, customer_name, customer_email')
      .eq('id', orderId)
      .single();

    return NextResponse.json({
      productionOrder,
      actionHistory,
      order,
    });
  } catch (error: unknown) {
    console.error('Error fetching production order:', error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : String(error)) || 'Failed to fetch production order' },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - Update Production Stage
// =====================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { orderId } = await params;
    const supabase = createSupabaseClient();

    // Parse request body
    const body = await request.json();
    const { action, stage, reason } = body;

    let productionOrder;

    switch (action) {
      case 'advance':
        // Advance to next stage
        productionOrder = await productionActionsAny.advanceToNextStage(orderId, auth.userId);
        break;

      case 'rollback':
        // Rollback to previous stage
        productionOrder = await productionActionsAny.rollbackToPreviousStage(
          orderId,
          auth.userId,
          reason
        );
        break;

      case 'update_priority':
        // Update priority
        const { data: priorityData } = await supabase
          .from('production_orders')
          .update({
            priority: body.priority,
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId)
          .select('*')
          .single();

        productionOrder = priorityData;
        break;

      case 'update_estimated_date':
        // Update estimated completion date
        const { data: estimatedData } = await supabase
          .from('production_orders')
          .update({
            estimated_completion_date: body.estimated_completion_date,
            updated_at: new Date().toISOString(),
          })
          .eq('order_id', orderId)
          .select('*')
          .single();

        productionOrder = estimatedData;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      productionOrder,
      message: `Stage ${action} successful`,
    });
  } catch (error: unknown) {
    console.error('Error updating production stage:', error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : String(error)) || 'Failed to update production stage' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Add Stage Note / Upload Photo / Assign Staff
// =====================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { orderId } = await params;
    const supabase = createSupabaseClient();

    // Parse request body
    const contentType = request.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      // File upload (photo)
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const stage = formData.get('stage') as ProductionStage;

      if (!file || !stage) {
        return NextResponse.json(
          { error: 'File and stage are required' },
          { status: 400 }
        );
      }

      // Upload photo
      const photoUrl = await productionActionsAny.uploadStagePhoto(
        orderId,
        stage,
        file,
        auth.userId
      );

      return NextResponse.json({
        success: true,
        photoUrl,
        message: 'Photo uploaded successfully',
      });
    } else {
      // JSON request (notes or staff assignment)
      const body = await request.json();
      const { action, stage, notes, staffId } = body;

      switch (action) {
        case 'add_note':
          // Add stage notes
          await productionActionsAny.updateStageNotes(
            orderId,
            stage,
            notes,
            auth.userId
          );

          return NextResponse.json({
            success: true,
            message: 'Note added successfully',
          });

        case 'assign_staff':
          // Assign staff to stage
          await productionActionsAny.assignStageToStaff(
            orderId,
            stage,
            staffId,
            auth.userId
          );

          return NextResponse.json({
            success: true,
            message: 'Staff assigned successfully',
          });

        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }
  } catch (error: unknown) {
    console.error('Error processing POST request:', error);
    return NextResponse.json(
      { error: (error instanceof Error ? error.message : String(error)) || 'Failed to process request' },
      { status: 500 }
    );
  }
}
