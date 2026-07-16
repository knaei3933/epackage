/**
 * Admin Start Production API
 *
 * 管理者製造開始API
 * - 製造開始条件をチェック
 * - payment_confirmations テーブルで入金確認を判定
 * - design_revisions (approved) で仕様承認を判定
 *
 * @route /api/admin/orders/[id]/start-production
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { invalidateAdminDashboardCache } from '@/lib/cache-helpers';

// =====================================================
// Types
// =====================================================

interface StartProductionResponse {
  success: boolean;
  message?: string;
  error?: string;
  errorEn?: string;
  missingRequirements?: string[];
}

interface OrderForProductionCheck {
  id: string;
  order_number?: string;
  hasPaymentConfirmation?: boolean;
  hasSpecApproval?: boolean;
  skip_contract?: boolean;
  current_stage?: string | null;
}

// =====================================================
// Helpers
// =====================================================

async function checkProductionReadiness(
  serviceClient: ReturnType<typeof createServiceClient>,
  orderId: string
): Promise<{ canStart: boolean; missingRequirements: string[] }> {
  const missingRequirements: string[] = [];

  // Check payment confirmation
  const { data: payment } = await serviceClient
    .from('payment_confirmations')
    .select('id')
    .eq('quotation_id', (
      await serviceClient
        .from('orders')
        .select('quotation_id')
        .eq('id', orderId)
        .single()
    ).data?.quotation_id)
    .maybeSingle();

  if (!payment) {
    missingRequirements.push('payment_confirmation');
  }

  // Check spec approval (design_revisions with approval_status = 'approved')
  const { data: revision } = await serviceClient
    .from('design_revisions')
    .select('id')
    .eq('order_id', orderId)
    .eq('approval_status', 'approved')
    .maybeSingle();

  if (!revision) {
    missingRequirements.push('spec_approval');
  }

  return {
    canStart: missingRequirements.length === 0,
    missingRequirements,
  };
}

function getProductionStartErrorMessage(missingRequirements: string[]): string {
  if (missingRequirements.length === 0) return '';
  const labels: Record<string, string> = {
    payment_confirmation: '入金確認',
    spec_approval: '仕様承認',
  };
  return `以下の条件を満たす必要があります: ${missingRequirements.map(r => labels[r] || r).join('、')}`;
}

// =====================================================
// POST Handler - Start Production
// =====================================================

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const params = await context.params;
    const { id: orderId } = params;

    const serviceClient = createServiceClient();

    // Check production readiness
    const validation = await checkProductionReadiness(serviceClient, orderId);

    if (!validation.canStart) {
      return NextResponse.json(
        {
          error: getProductionStartErrorMessage(validation.missingRequirements),
          errorEn: `Production cannot be started. Missing: ${validation.missingRequirements.join(', ')}`,
          missingRequirements: validation.missingRequirements,
        },
        { status: 400 }
      );
    }

    // Create production order
    const { data: productionOrder, error: prodError } = await serviceClient
      .from('production_orders')
      .insert({
        order_id: orderId,
        current_stage: 'data_received',
        priority: 'normal',
      })
      .select()
      .single();

    if (prodError) {
      console.error('[Start Production] Create production order error:', prodError);
      return NextResponse.json(
        { error: '製造注文の作成に失敗しました。', errorEn: 'Failed to create production order' },
        { status: 500 }
      );
    }

    // H-12: 現 status を select して from_status にセット
    // 旧実装は 'CUSTOMER_APPROVAL_PENDING' 決め打ちで、異常ケースの監査ログが実態と乖離していた。
    const { data: currentOrder } = await serviceClient
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single();
    const previousStatus = currentOrder?.status || 'CUSTOMER_APPROVAL_PENDING';

    // Update order: status PRODUCTION + current_stage
    await serviceClient
      .from('orders')
      .update({
        status: 'PRODUCTION',
        current_stage: 'PRODUCTION',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // Log to status history（from_status は実態の現 status・changed_at は default now()）
    await serviceClient
      .from('order_status_history')
      .insert({
        order_id: orderId,
        from_status: previousStatus,
        to_status: 'PRODUCTION',
        changed_by: auth.userId,
        reason: '製造開始（管理者操作）',
      });

    const response: StartProductionResponse = {
      success: true,
      message: '製造を開始しました。',
    };

    // ダッシュボード統計の即時反映（C2・Phase 4-3・orders.status=PRODUCTION → ordersByStatus/activeProduction 直結）
    invalidateAdminDashboardCache();

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Start Production] Error:', error);
    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
