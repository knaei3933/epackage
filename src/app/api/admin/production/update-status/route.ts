export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

/**
 * POST /api/admin/production/update-status
 * 生産ジョブのステータスを更新
 * Note: production_orders テーブルを使用（9段階生産プロセス）
 */
export async function POST(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { jobId, stage, status, notes } = body;

    if (!jobId || !stage) {
      return NextResponse.json(
        { error: { code: 'MISSING_FIELDS', message: '必須フィールドが不足しています' } },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Validate stage
    const validStages = ['data_received', 'inspection', 'design', 'plate_making', 'printing', 'surface_finishing', 'die_cutting', 'lamination', 'final_inspection'];
    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { error: { code: 'INVALID_STAGE', message: '無効なステージです' } },
        { status: 400 }
      );
    }

    // Build update data for production_orders
    const updateData: Record<string, unknown> = {
      current_stage: stage,
      updated_at: new Date().toISOString(),
    };

    // Update stage_data if notes provided
    if (notes) {
      updateData.stage_data = { notes };
    }

    // Set timestamps based on stage
    if (stage === 'final_inspection') {
      updateData.actual_completion_date = new Date().toISOString();
    } else if (stage !== 'data_received') {
      updateData.started_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('production_orders')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: { code: 'UPDATE_FAILED', message: error.message } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        currentStage: data.current_stage,
        actualCompletionDate: data.actual_completion_date,
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error('Production status update error:', error);
    return NextResponse.json(
      {
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'ステータス更新に失敗しました',
        },
      },
      { status: 500 }
    );
  }
}
