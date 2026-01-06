/**
 * AI Parser Approval API
 *
 * POST /api/ai-parser/approve - Approve extracted data and create production records
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import {
  AIExtractionApprovalRequest,
  ApprovalResponse,
} from '@/types/ai-extraction';
import type { Database } from '@/types/database';

// Type for file record with orders join
type FileWithOrder = Database['public']['Tables']['files']['Row'] & {
  orders?: { id: string };
};

// Type for production data record
type ProductionData = Database['public']['Tables']['production_data']['Row'];

// Type for work order record
type WorkOrder = Database['public']['Tables']['work_orders']['Row'];

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient();
    const body = await request.json() as AIExtractionApprovalRequest;

    const { file_id, approved_data, create_work_order = false, notes } = body;

    // Validate inputs
    if (!file_id || !approved_data) {
      return NextResponse.json<ApprovalResponse>({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: '파일 ID와 승인 데이터가 필요합니다.',
        },
      }, { status: 400 });
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json<ApprovalResponse>({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '인증이 필요합니다.',
        },
      }, { status: 401 });
    }

    // Fetch file record
    // Note: Supabase join types are not fully inferred, using explicit type
    const { data: file, error: fileError } = await supabase
      .from('files')
      .select('*, orders!inner(id)')
      .eq('id', file_id)
      .single();

    if (fileError || !file) {
      return NextResponse.json<ApprovalResponse>({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message: '파일을 찾을 수 없습니다.',
        },
      }, { status: 404 });
    }

    // Type assertion for file with orders join - Supabase join types need explicit handling
    const fileWithOrder = file as unknown as FileWithOrder;
    const orderId = fileWithOrder.orders?.id || fileWithOrder.order_id;

    // Update file record with approved data
    await supabase
      .from('files')
      // @ts-expect-error - Supabase JSONB columns need explicit type handling
      .update({
        ai_extraction_data: approved_data,
        ai_extraction_status: 'completed',
        metadata: {
          ...(fileWithOrder.metadata as { [key: string]: unknown } || {}),
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          notes,
        },
      })
      .eq('id', file_id);

    // Create or update production_data record
    const { data: productionDataRaw, error: productionError } = await supabase
      .from('production_data')
      // @ts-expect-error - Supabase JSONB columns need explicit type handling
      .upsert({
        order_id: orderId,
        data_type: 'design_file',
        title: `Design File: ${fileWithOrder.file_name}`,
        description: notes || 'AI 추출 데이터',
        version: '1.0',
        file_id: file_id,
        file_url: fileWithOrder.file_url,
        validation_status: 'valid',
        specifications: approved_data,
        approved_for_production: true,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        submitted_by_customer: false,
        received_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (productionError) {
      console.error('Production data creation error:', productionError);
      return NextResponse.json<ApprovalResponse>({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: '생산 데이터 생성에 실패했습니다.',
        },
      }, { status: 500 });
    }

    // Type assertion for production data
    const productionData = productionDataRaw as unknown as ProductionData;

    // Create work order if requested
    let workOrderId: string | undefined;
    if (create_work_order && orderId) {
      // Generate work order number
      const workOrderNumber = `WO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

      const { data: workOrderRaw, error: workOrderError } = await supabase
        .from('work_orders')
        // @ts-expect-error - Supabase JSONB columns need explicit type handling
        .insert({
          order_id: orderId,
          work_order_number: workOrderNumber,
          title: `작업표준서: ${fileWithOrder.file_name}`,
          version: '1.0',
          status: 'GENERATED',
          specifications: approved_data,
          production_flow: { steps: ['design_received', 'material_prepared', 'printing', 'lamination', 'slitting', 'pouch_making', 'qc_passed', 'packaged'] },
          quality_standards: { criteria: ['visual_inspection', 'dimension_check', 'seal_strength'] },
          packaging_specs: { type: 'standard' },
          pdf_url: null,
          generated_by: user.id,
        })
        .select()
        .single();

      if (!workOrderError && workOrderRaw) {
        const workOrder = workOrderRaw as unknown as WorkOrder;
        workOrderId = workOrder.id;

        // Update production_data to reference work_order
        await supabase
          .from('production_data')
          // @ts-expect-error - Supabase update type inference issue
          .update({ work_order_id: workOrder.id })
          .eq('id', productionData.id);
      }
    }

    return NextResponse.json<ApprovalResponse>({
      success: true,
      data: {
        production_data_id: productionData.id,
        work_order_id: workOrderId,
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      },
    });

  } catch (error) {
    console.error('Approval API error:', error);
    return NextResponse.json<ApprovalResponse>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '서버 오류가 발생했습니다.',
      },
    }, { status: 500 });
  }
}
