import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import type { Database } from '@/types/database';

/**
 * GET /api/admin/production/jobs
 * 生産ジョブ一覧を取得
 * Note: production_orders 테이블을 사용 (9단계 생산 프로세스)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.error('[GET /api/admin/production/jobs] ===== ROUTE CALLED =====');
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createSupabaseClient();

    // URL 파라미터에서 필터링 조건 추출
    const searchParams = request.nextUrl.searchParams;
    const stage = searchParams.get('stage'); // current_stage 필터링
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // production_orders 테이블 쿼리 (실제 테이블)
    let query = supabase
      .from('production_orders')
      .select(`
        *,
        orders!inner(
          id,
          order_number,
          customer_name,
          user_id
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // 상태 필터링 (current_stage)
    if (stage && stage !== 'all') {
      query = query.eq('current_stage', stage);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('生産ジョブ取得エラー:', error);
      return NextResponse.json(
        { error: '生産ジョブの取得に失敗しました', details: error.message },
        { status: 500 }
      );
    }

    // 데이터 변환: production_orders → ProductionJob 형식으로 변환
    const transformedJobs = orders?.map((po: any) => {
      // 9단계 생산 스테이지 계산
      const stages = ['data_received', 'inspection', 'design', 'plate_making', 'printing', 'surface_finishing', 'die_cutting', 'lamination', 'final_inspection'];
      const currentStageIndex = stages.indexOf(po.current_stage);
      const progressPercentage = currentStageIndex >= 0 ? Math.round((currentStageIndex / (stages.length - 1)) * 100) : 0;

      // priority 문자열 → 숫자 변환
      let priorityNum = 3; // default normal
      if (typeof po.priority === 'string') {
        if (po.priority === 'low') priorityNum = 1;
        else if (po.priority === 'normal') priorityNum = 2;
        else if (po.priority === 'high') priorityNum = 3;
        else if (po.priority === 'urgent') priorityNum = 4;
      } else if (typeof po.priority === 'number') {
        priorityNum = po.priority;
      }

      // status 계산
      let status = 'pending';
      if (po.actual_completion_date) {
        status = 'completed';
      } else if (po.current_stage && po.current_stage !== 'data_received') {
        status = 'in_progress';
      }

      return {
        id: po.id,
        jobNumber: po.orders?.order_number || `PO-${po.id.slice(0, 8)}`,
        jobName: `${po.orders?.order_number || '주문'} 생산`,
        jobType: po.current_stage || 'data_received',
        status: status,
        progressPercentage: progressPercentage,
        priority: priorityNum,
        orderNumber: po.orders?.order_number || '',
        customerName: po.orders?.customer_name || '',
        scheduledStartAt: po.started_at,
        scheduledEndAt: po.estimated_completion_date,
        actualStartAt: po.started_at,
        actualEndAt: po.actual_completion_date,
        assignedTo: null, // 담당자 정보가 없으면 null
        outputQuantity: 0, // production_orders에는 output_quantity가 없음
        rejectedQuantity: 0, // production_orders에는 rejected_quantity가 없음
        description: po.current_stage,
        specifications: po.stage_data,
        currentStep: currentStageIndex + 1,
        stepsTotal: stages.length,
        stepsCompleted: currentStageIndex + 1
      };
    }) || [];

    return NextResponse.json(transformedJobs);
  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/production/jobs
 * 生産ジョブの状態を更新
 * Note: production_orders テーブルを使用 (9단계 생산 프로세스)
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { jobId, currentStage, priority, status, stageData } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'ジョブIDは必須です' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Build update object for production_orders table
    const updateData: Record<string, unknown> = {};

    // Update current_stage if provided
    if (currentStage) {
      const validStages = ['data_received', 'inspection', 'design', 'plate_making', 'printing', 'surface_finishing', 'die_cutting', 'lamination', 'final_inspection'];
      if (validStages.includes(currentStage)) {
        updateData.current_stage = currentStage;

        // Set started_at if moving from data_received
        if (currentStage !== 'data_received') {
          updateData.started_at = new Date().toISOString();
        }

        // Set actual_completion_date if reaching final_inspection
        if (currentStage === 'final_inspection') {
          updateData.actual_completion_date = new Date().toISOString();
        }
      }
    }

    // Update priority if provided
    if (priority) {
      updateData.priority = priority;
    }

    // Update stage_data if provided
    if (stageData) {
      updateData.stage_data = stageData;
    }

    // Handle status-based updates for backwards compatibility
    if (status === 'completed') {
      updateData.current_stage = 'final_inspection';
      updateData.actual_completion_date = new Date().toISOString();
    } else if (status === 'in_progress' && !currentStage) {
      updateData.started_at = new Date().toISOString();
    }

    const { data: job, error } = await supabase
      .from('production_orders')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('ジョブ更新エラー:', error);
      return NextResponse.json(
        { error: 'ジョブの更新に失敗しました', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'ジョブを更新しました',
      job
    });
  } catch (error) {
    console.error('API エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
