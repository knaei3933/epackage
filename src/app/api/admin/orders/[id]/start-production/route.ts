/**
 * Admin Start Production API
 *
 * 管理者製造開始API
 * - 製造開始条件をチェック
 * - payment_confirmed_at, spec_approved_at, contract_signed_at
 * - 条件不満足時はエラーを返す
 *
 * @route /api/admin/orders/[id]/start-production
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { canStartProduction, getProductionStartErrorMessage } from '@/lib/production-actions';

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

// =====================================================
// POST Handler - Start Production
// =====================================================

/**
 * POST /api/admin/orders/[id]/start-production
 * Start production for an order
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Production started successfully"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase environment variables not configured' },
        { status: 500 }
      );
    }

    // 1. Authenticate and verify admin role
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user?.id) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: '管理者権限が必要です。', errorEn: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id: orderId } = await params;

    // 2. Get order with payment and approval status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        payment_confirmed_at,
        spec_approved_at,
        contract_signed_at,
        current_stage
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    // 3. Check if production can be started
    const validation = canStartProduction(order);

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

    // 4. Create production order
    const { data: productionOrder, error: prodError } = await supabase
      .from('production_orders')
      .insert({
        order_id: orderId,
        current_stage: 'data_received',
        priority: 'normal',
        estimated_completion_date: null,
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

    // 5. Update order stage
    await supabase
      .from('orders')
      .update({
        current_stage: 'PRODUCTION',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // 6. Log to order history
    await supabase
      .from('order_history')
      .insert({
        order_id: orderId,
        action: 'production_started',
        description: '製造を開始しました',
        performed_by: user.id,
        metadata: {
          productionOrderId: productionOrder.id,
        }
      });

    const response: StartProductionResponse = {
      success: true,
      message: '製造を開始しました。',
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Start Production] Error:', error);

    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// =====================================================
// OPTIONS Handler for CORS
// =====================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
