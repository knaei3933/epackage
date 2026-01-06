/**
 * Work Order Generation API
 * POST /api/admin/generate-work-order
 *
 * 作業指示書生成システム (Work Order Generation System)
 * Japanese business terminology for production workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';
import { sendWorkOrderEmails, WorkOrderData } from '@/lib/email';
import { Database } from '@/types/database';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

// =====================================================
// Types
// =====================================================

interface WorkOrderRequest {
  order_id: string;
  specifications?: Database['public']['Tables']['work_orders']['Insert']['specifications'];
  production_flow?: Database['public']['Tables']['work_orders']['Insert']['production_flow'];
  quality_standards?: Database['public']['Tables']['work_orders']['Insert']['quality_standards'];
  packaging_specs?: Database['public']['Tables']['work_orders']['Insert']['packaging_specs'];
  estimated_completion?: string; // ISO date string
}

interface WorkOrderItem {
  order_item_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  specifications: Record<string, unknown> | null;
  material_requirements: MaterialRequirement[];
  quality_checkpoints: QualityCheckpoint[];
  estimated_steps: number;
}

interface MaterialRequirement {
  material_type: string;
  material_name: string;
  quantity: number;
  unit: string;
  supplier?: string;
  lead_time_days: number;
}

interface QualityCheckpoint {
  step_number: number;
  step_name: string;
  checkpoint_name: string;
  specification: string;
  tolerance: string;
  inspection_method: string;
}

interface ProductionTimeline {
  total_days: number;
  steps: {
    step: string;
    name_ja: string;
    name_en: string;
    duration_days: number;
    dependencies: string[];
  }[];
}

// =====================================================
// Constants: Japanese Business Terminology
// =====================================================

const PRODUCTION_STEPS = [
  { step: 'design_received', name_ja: 'デザイン受領', name_en: 'Design Received', duration_days: 1 },
  { step: 'work_order_created', name_ja: '作業指示書発行', name_en: 'Work Order Created', duration_days: 1 },
  { step: 'material_prepared', name_ja: '材料準備', name_en: 'Material Preparation', duration_days: 3 },
  { step: 'printing', name_ja: '印刷工程', name_en: 'Printing', duration_days: 2 },
  { step: 'lamination', name_ja: 'ラミネート加工', name_en: 'Lamination', duration_days: 1 },
  { step: 'slitting', name_ja: 'スリット加工', name_en: 'Slitting', duration_days: 1 },
  { step: 'pouch_making', name_ja: '製袋加工', name_en: 'Pouch Making', duration_days: 2 },
  { step: 'qc_passed', name_ja: '品質検査合格', name_en: 'Quality Control', duration_days: 2 },
  { step: 'packaged', name_ja: '梱包完了', name_en: 'Packaging', duration_days: 1 },
];

const MATERIAL_TYPES: Record<string, { name_ja: string; unit: string; default_lead_time: number }> = {
  PET: { name_ja: 'PETフィルム', unit: 'kg', default_lead_time: 3 },
  AL: { name_ja: 'アルミ箔', unit: 'kg', default_lead_time: 5 },
  CPP: { name_ja: 'CPPフィルム', unit: 'kg', default_lead_time: 3 },
  PE: { name_ja: 'PEフィルム', unit: 'kg', default_lead_time: 2 },
  NY: { name_ja: 'ナイロンフィルム', unit: 'kg', default_lead_time: 4 },
  PAPER: { name_ja: '紙', unit: 'kg', default_lead_time: 3 },
};

const QUALITY_CHECKPOINTS_TEMPLATE: QualityCheckpoint[] = [
  {
    step_number: 1,
    step_name: 'material_prepared',
    checkpoint_name: '材料検査',
    specification: '材料仕様書に準拠',
    tolerance: '±0.5%',
    inspection_method: 'サンプル検査及び測定',
  },
  {
    step_number: 2,
    step_name: 'printing',
    checkpoint_name: '印刷品質',
    specification: '色見本との照合',
    tolerance: 'ΔE < 2.0',
    inspection_method: '分光光度計による測定',
  },
  {
    step_number: 3,
    step_name: 'lamination',
    checkpoint_name: 'ラミネート強度',
    specification: 'ピール強度',
    tolerance: '≥ 200g/15mm',
    inspection_method: '引張試験機',
  },
  {
    step_number: 4,
    step_name: 'slitting',
    checkpoint_name: 'スリット幅精度',
    specification: '設寸法通りの幅',
    tolerance: '±0.5mm',
    inspection_method: 'ノギス測定',
  },
  {
    step_number: 5,
    step_name: 'pouch_making',
    checkpoint_name: '製袋寸法',
    specification: '図面寸法',
    tolerance: '±1.0mm',
    inspection_method: '定規測定',
  },
  {
    step_number: 6,
    step_name: 'qc_passed',
    checkpoint_name: '最終検査',
    specification: '外観・機能検査',
    tolerance: '欠品なし',
    inspection_method: '全数検査',
  },
];

// =====================================================
// Helper Functions
// =====================================================

/**
 * Type-safe insert helper for work_orders table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function insertWorkOrder(supabase: ReturnType<typeof createSupabaseClient>, data: Database['public']['Tables']['work_orders']['Insert']) {
  return supabase
    .from('work_orders')
    // @ts-expect-error - Supabase JSONB columns need explicit type handling
    .insert(data)
    .select('*')
    .single();
}

/**
 * Type-safe update helper for orders table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function updateOrder(supabase: ReturnType<typeof createSupabaseClient>, orderId: string, data: Database['public']['Tables']['orders']['Update']) {
  return supabase
    .from('orders')
    // @ts-expect-error - Supabase JSONB columns need explicit type handling
    .update(data)
    .eq('id', orderId);
}

/**
 * Type-safe insert helper for order_status_history table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function insertOrderStatusHistory(supabase: ReturnType<typeof createSupabaseClient>, data: Omit<Database['public']['Tables']['order_status_history']['Insert'], 'changed_at'>) {
  return supabase
    .from('order_status_history')
    // @ts-expect-error - Supabase JSONB columns need explicit type handling
    .insert({
      ...data,
      changed_at: new Date().toISOString(),
    });
}

/**
 * Type-safe insert helper for production_logs table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function insertProductionLog(supabase: ReturnType<typeof createSupabaseClient>, data: Omit<Database['public']['Tables']['production_logs']['Insert'], 'logged_at'>) {
  return supabase
    .from('production_logs')
    // @ts-expect-error - Supabase JSONB columns need explicit type handling
    .insert({
      ...data,
      logged_at: new Date().toISOString(),
    });
}

/**
 * Type-safe insert helper for order_audit_log table
 * @ts-expect-error - Supabase type system limitation: .from() doesn't recognize dynamically added tables
 */
function insertOrderAuditLog(supabase: ReturnType<typeof createSupabaseClient>, data: Omit<Database['public']['Tables']['order_audit_log']['Insert'], 'changed_at'>) {
  return supabase
    .from('order_audit_log')
    // @ts-expect-error - Supabase JSONB columns need explicit type handling
    .insert({
      ...data,
      changed_at: new Date().toISOString(),
    });
}

/**
 * Generate unique work order number (WO-YYYY-NNNN format)
 */
function generateWorkOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `WO-${year}-${random}`;
}

/**
 * Calculate production timeline based on order specifications
 */
function calculateProductionTimeline(order: Database['public']['Tables']['orders']['Row'], items: Database['public']['Tables']['order_items']['Row'][]): ProductionTimeline {
  const baseDays = PRODUCTION_STEPS.reduce((sum, step) => sum + step.duration_days, 0);

  // Adjust based on order quantity (simple logic: +1 day per 10,000 units)
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const quantityAdjustment = Math.floor(totalQuantity / 10000);

  // Adjust based on complexity (number of items)
  const complexityAdjustment = items.length > 1 ? Math.ceil(items.length / 2) : 0;

  const totalDays = baseDays + quantityAdjustment + complexityAdjustment;

  return {
    total_days: totalDays,
    steps: PRODUCTION_STEPS.map(s => ({
      step: s.step,
      name_ja: s.name_ja,
      name_en: s.name_en,
      duration_days: s.duration_days,
      dependencies: [],
    })),
  };
}

/**
 * Calculate material requirements from order items
 */
function calculateMaterialRequirements(item: Database['public']['Tables']['order_items']['Row']): MaterialRequirement[] {
  const requirements: MaterialRequirement[] = [];
  const specifications = (item.specifications as Record<string, unknown>) || {};

  // Extract material types from specifications
  const materials = (specifications.materials as string[]) || ['PET', 'PE'];
  const quantity = item.quantity || 0;

  materials.forEach((material: string) => {
    const materialInfo = MATERIAL_TYPES[material];
    if (materialInfo) {
      // Calculate material quantity based on order quantity
      // Simplified calculation: 100g material per unit
      const materialQuantity = Math.ceil(quantity * 0.1);

      requirements.push({
        material_type: material,
        material_name: materialInfo.name_ja,
        quantity: materialQuantity,
        unit: materialInfo.unit,
        supplier: '', // Would be populated from supplier database
        lead_time_days: materialInfo.default_lead_time,
      });
    }
  });

  return requirements;
}

/**
 * Generate quality checkpoints for a work order item
 */
function generateQualityCheckpoints(item: Database['public']['Tables']['order_items']['Row']): QualityCheckpoint[] {
  const specs = (item.specifications as Record<string, unknown> | undefined);
  return QUALITY_CHECKPOINTS_TEMPLATE.map(checkpoint => ({
    ...checkpoint,
    // Customize based on item specifications if needed
    specification: (specs?.quality_standard as string) || checkpoint.specification,
  }));
}

/**
 * Calculate estimated completion date
 */
function calculateEstimatedCompletion(timeline: ProductionTimeline, startDate: Date = new Date()): string {
  const completionDate = new Date(startDate);
  completionDate.setDate(completionDate.getDate() + timeline.total_days);
  return completionDate.toISOString();
}

// =====================================================
// Main API Handler
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const supabase = createSupabaseClient();

    // Parse request body
    const body: WorkOrderRequest = await request.json();
    const { order_id, specifications, production_flow, quality_standards, packaging_specs, estimated_completion } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: '注文IDは必須です', error_code: 'MISSING_ORDER_ID' },
        { status: 400 }
      );
    }

    // ===================================================
    // Step 1: Validate and retrieve order
    // ===================================================

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles:user_id (
          id,
          kanji_last_name,
          kanji_first_name,
          email
        )
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません', error_code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const orderTyped = order as Database['public']['Tables']['orders']['Row'];

    // Check if work order already exists
    const { data: existingWorkOrder } = await supabase
      .from('work_orders')
      .select('id, work_order_number, status')
      .eq('order_id', order_id)
      .maybeSingle();

    if (existingWorkOrder) {
      return NextResponse.json(
        {
          error: '作業指示書は既に存在します',
          error_code: 'WORK_ORDER_EXISTS',
          existing_work_order: existingWorkOrder,
        },
        { status: 400 }
      );
    }

    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order_id);

    if (itemsError || !orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: '注文アイテムが見つかりません', error_code: 'NO_ORDER_ITEMS' },
        { status: 400 }
      );
    }

    const orderItemsTyped = orderItems as Database['public']['Tables']['order_items']['Row'][];

    // ===================================================
    // Step 2: Calculate production requirements
    // ===================================================

    const productionTimeline = calculateProductionTimeline(orderTyped, orderItemsTyped);
    const estimatedCompletionDate = estimated_completion || calculateEstimatedCompletion(productionTimeline);

    // Generate work order items with material requirements and quality checkpoints
    const workOrderItems: WorkOrderItem[] = orderItemsTyped.map((item) => ({
      order_item_id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      specifications: item.specifications as Record<string, unknown> | null,
      material_requirements: calculateMaterialRequirements(item),
      quality_checkpoints: generateQualityCheckpoints(item),
      estimated_steps: PRODUCTION_STEPS.length,
    }));

    // Aggregate all material requirements
    const allMaterialRequirements = workOrderItems.flatMap(item => item.material_requirements);

    // Aggregate all quality checkpoints
    const allQualityCheckpoints = workOrderItems.flatMap(item => item.quality_checkpoints);

    // ===================================================
    // Step 3: Create work order
    // ===================================================

    const workOrderNumber = generateWorkOrderNumber();

    // Build specifications object
    const workOrderSpecifications = specifications || {
      order_number: orderTyped.order_number,
      customer_name: orderTyped.customer_name,
      items: workOrderItems,
      total_quantity: workOrderItems.reduce((sum, item) => sum + item.quantity, 0),
      production_timeline: productionTimeline,
    };

    // Build production flow
    const workOrderProductionFlow = production_flow || {
      steps: PRODUCTION_STEPS.map((step, index) => ({
        sequence: index + 1,
        step_code: step.step,
        step_name_ja: step.name_ja,
        step_name_en: step.name_en,
        duration_days: step.duration_days,
        status: 'pending',
      })),
      total_duration_days: productionTimeline.total_days,
      current_step: 1,
    };

    // Build quality standards
    const workOrderQualityStandards = quality_standards || {
      checkpoints: allQualityCheckpoints,
      inspection_criteria: {
        visual_inspection: true,
        dimensional_inspection: true,
        functional_testing: false,
        package_integrity: true,
      },
    };

    // Build packaging specs
    const workOrderPackagingSpecs = packaging_specs || {
      packaging_type: 'standard',
      packaging_material: 'cardboard_box',
      labels_required: true,
      special_instructions: null,
    };

    // Use type-safe helper for work_orders insert
    const { data: workOrderRaw, error: workOrderError } = await insertWorkOrder(supabase, {
      work_order_number: workOrderNumber,
      order_id: order_id,
      quotation_id: orderTyped.quotation_id,
      title: `${workOrderNumber} - ${orderTyped.customer_name}`,
      version: 'v1.0',
      status: 'GENERATED' as Database['public']['Tables']['work_orders']['Row']['status'],
      specifications: workOrderSpecifications as Database['public']['Tables']['work_orders']['Insert']['specifications'],
      production_flow: workOrderProductionFlow as Database['public']['Tables']['work_orders']['Insert']['production_flow'],
      quality_standards: workOrderQualityStandards as Database['public']['Tables']['work_orders']['Insert']['quality_standards'],
      packaging_specs: workOrderPackagingSpecs as Database['public']['Tables']['work_orders']['Insert']['packaging_specs'],
      estimated_completion: estimatedCompletionDate,
      pdf_url: null,  // PDF will be generated later
      generated_by: orderTyped.user_id,
      approved_by: null,
      approved_at: null,
    });

    if (workOrderError) {
      console.error('[Work Order] Insert error:', workOrderError);
      return NextResponse.json(
        { error: '作業指示書の作成に失敗しました', error_code: 'INSERT_FAILED', details: workOrderError },
        { status: 500 }
      );
    }

    // Type assertion for workOrder - Supabase type inference needs help
    const workOrder = workOrderRaw as unknown as Database['public']['Tables']['work_orders']['Row'] | null;

    // ===================================================
    // Step 4: Update order status
    // ===================================================

    // Use type-safe helper for orders update
    const { error: updateError } = await updateOrder(supabase, order_id, {
      status: 'production_start' as Database['public']['Tables']['orders']['Row']['status'],
      current_state: 'design_received' as Database['public']['Tables']['orders']['Row']['current_state'],
      state_metadata: {
        work_order_id: workOrder?.id,
        work_order_number: workOrderNumber,
        estimated_completion: estimatedCompletionDate,
        production_started_at: new Date().toISOString(),
      } as Database['public']['Tables']['orders']['Insert']['state_metadata'],
    });

    if (updateError) {
      console.error('[Work Order] Order update error:', updateError);
      // Non-critical error, continue
    }

    // ===================================================
    // Step 5: Log status change in audit trail
    // ===================================================

    // Use type-safe helper for order_status_history insert
    await insertOrderStatusHistory(supabase, {
      order_id: order_id,
      from_status: orderTyped.status,
      to_status: 'production_start' as Database['public']['Tables']['order_status_history']['Row']['to_status'],
      changed_by: orderTyped.user_id,
      reason: `作業指示書発行: ${workOrderNumber}`,
      metadata: {
        work_order_id: workOrder?.id,
        work_order_number: workOrderNumber,
        estimated_completion: estimatedCompletionDate,
      } as Database['public']['Tables']['order_status_history']['Insert']['metadata'],
    });

    // ===================================================
    // Step 6: Create production log entry (design_received)
    // ===================================================

    // Use type-safe helper for production_logs insert
    await insertProductionLog(supabase, {
      order_id: order_id,
      work_order_id: workOrder?.id ?? null,
      sub_status: 'design_received' as Database['public']['Tables']['production_logs']['Row']['sub_status'],
      progress_percentage: 10,
      assigned_to: null,
      photo_url: null,
      notes: '作業指示書発行。デザインデータ受領待ち。',
      measurements: null,
    });

    // ===================================================
    // Step 7: Create audit log entry
    // ===================================================

    // Use type-safe helper for order_audit_log insert
    await insertOrderAuditLog(supabase, {
      table_name: 'work_orders',
      record_id: workOrder?.id || '',
      action: 'INSERT' as Database['public']['Tables']['order_audit_log']['Row']['action'],
      old_data: null,
      new_data: workOrder as Database['public']['Tables']['order_audit_log']['Insert']['new_data'],
      changed_fields: null,
      changed_by: orderTyped.user_id,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      user_agent: request.headers.get('user-agent') || null,
    });

    // ===================================================
    // Step 8: Send email notifications
    // ===================================================

    // Prepare email data
    const emailData: WorkOrderData = {
      workOrderId: workOrder?.id || '',
      workOrderNumber: workOrderNumber,
      orderId: orderTyped.id,
      orderNumber: orderTyped.order_number,
      customerName: orderTyped.customer_name,
      customerEmail: orderTyped.customer_email,
      estimatedCompletion: estimatedCompletionDate,
      productionTimeline: productionTimeline,
      materialRequirements: allMaterialRequirements,
      items: workOrderItems.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
      })),
    };

    // Send notifications (non-blocking)
    sendWorkOrderEmails(emailData).then(emailResults => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Work Order] Email notification results:', {
          customer: emailResults.customerEmail?.success,
          productionTeam: emailResults.productionTeamEmail?.success,
          previewUrl: emailResults.previewUrl,
          errors: emailResults.errors,
        });
      }
      if (!emailResults.success) {
        console.error('[Work Order] Email notification errors:', emailResults.errors);
      }
    }).catch(err => {
      console.error('[Work Order] Email notification failed:', err);
    });

    // ===================================================
    // Response
    // ===================================================

    return NextResponse.json({
      success: true,
      message: '作業指示書を発行しました',
      data: {
        work_order: {
          id: workOrder?.id || '',
          work_order_number: workOrderNumber,
          title: `${workOrderNumber} - ${orderTyped.customer_name}`,
          status: 'GENERATED',
          estimated_completion: estimatedCompletionDate,
        },
        order: {
          id: orderTyped.id,
          order_number: orderTyped.order_number,
          new_status: 'production_start',
        },
        production_timeline: productionTimeline,
        material_requirements: allMaterialRequirements,
        quality_checkpoints: allQualityCheckpoints,
      },
    });

  } catch (error: unknown) {
    console.error('[Work Order API] Error:', error);
    return NextResponse.json(
      {
        error: 'サーバーエラーが発生しました',
        error_code: 'SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/generate-work-order
 * Get work order generation status for an order
 */
export async function GET(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get('order_id');

    if (!order_id) {
      return NextResponse.json(
        { error: '注文IDは必須です', error_code: 'MISSING_ORDER_ID' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Check if work order exists
    const { data: workOrder, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('order_id', order_id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'データベースエラー', error_code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    if (!workOrder) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: '作業指示書は未作成です',
      });
    }

    const workOrderTyped = workOrder as Database['public']['Tables']['work_orders']['Row'];

    return NextResponse.json({
      success: true,
      exists: true,
      data: {
        id: workOrderTyped.id,
        work_order_number: workOrderTyped.work_order_number,
        title: workOrderTyped.title,
        status: workOrderTyped.status,
        estimated_completion: workOrderTyped.estimated_completion,
        created_at: workOrderTyped.created_at,
      },
    });

  } catch (error: unknown) {
    console.error('[Work Order GET] Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました', error_code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
