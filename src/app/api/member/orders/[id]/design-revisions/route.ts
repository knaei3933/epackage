/**
 * Member Design Revisions API
 *
 * 会員用デザイン改訂API
 * - GET: 注文のデザイン改訂一覧取得
 * - PATCH: 改訂の承認/拒否
 *
 * @route /api/member/orders/[id]/design-revisions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DESIGN_REVISION_ERRORS, createErrorResponse } from '@/lib/api-error-codes';

// Env vars checked at runtime in handler function
const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const dynamic = 'force-dynamic';

// サービスクライアント (RLSバイパス用)
const getServiceClient = () => createClient(supabaseUrl(), supabaseServiceKey(), {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// =====================================================
// GET Handler - List Design Revisions
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SSR Client for authentication
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      supabaseUrl(),
      supabaseAnonKey(),
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();
    const { id: orderId } = await params;

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Get design revisions AND order items in parallel
    const [revisionsResult, orderItemsResult] = await Promise.all([
      supabase
        .from('design_revisions')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false }),
      supabase
        .from('order_items')
        .select('id, product_name, quantity, specifications')
        .eq('order_id', orderId),
    ]);

    const { data: revisions, error } = revisionsResult;

    if (error) {
      console.error('[Design Revisions GET] Error:', error);
      return NextResponse.json(
        { success: false, error: 'デザイン改訂データの取得に失敗しました。' },
        { status: 500 }
      );
    }

    // Create a map of order items for quick lookup
    const orderItemsMap = new Map(
      (orderItemsResult.data || []).map(item => [item.id, item])
    );

    // Add sku_name to each revision
    const revisionsWithSkuNames = (revisions || []).map(revision => {
      let skuName = null;
      if (revision.order_item_id) {
        const item = orderItemsMap.get(revision.order_item_id);
        if (item) {
          skuName = `${item.product_name} (${item.quantity}枚)`;
        }
      }
      return {
        ...revision,
        sku_name: skuName,
      };
    });

    console.log('[Design Revisions GET] Success:', revisions?.length || 0, 'revisions');

    return NextResponse.json({
      success: true,
      revisions: revisionsWithSkuNames,
      orderItems: orderItemsResult.data || [],  // NEW: For SKU selector
    });

  } catch (error) {
    console.error('[Design Revisions GET] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH Handler - Update Approval Status
// =====================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // SSR Client for authentication
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      supabaseUrl(),
      supabaseAnonKey(),
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
          set: () => {},
          remove: () => {},
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '認証されていません' },
        { status: 401 }
      );
    }

    const supabase = getServiceClient();
    const { id: orderId } = await params;

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'アクセス権限がありません。' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { revisionId, status, customerComment, rejectionReason } = body;

    if (!revisionId || !status) {
      const error = createErrorResponse(DESIGN_REVISION_ERRORS.MISSING_REVISION_ID);
      return NextResponse.json(error.response, { status: error.status });
    }

    if (!['approved', 'rejected'].includes(status)) {
      const error = createErrorResponse(DESIGN_REVISION_ERRORS.INVALID_REVISION_STATUS);
      return NextResponse.json(error.response, { status: error.status });
    }

    // Validation: rejectionReason is REQUIRED when rejecting
    if (status === 'rejected' && !rejectionReason) {
      const error = createErrorResponse(DESIGN_REVISION_ERRORS.MISSING_REJECTION_REASON);
      return NextResponse.json(error.response, { status: error.status });
    }

    // Verify revision belongs to this order AND is still pending
    const { data: revision, error: revisionError } = await supabase
      .from('design_revisions')
      .select('*')
      .eq('id', revisionId)
      .eq('order_id', orderId)
      .single();

    if (revisionError || !revision) {
      const error = createErrorResponse(DESIGN_REVISION_ERRORS.REVISION_NOT_FOUND);
      return NextResponse.json(error.response, { status: error.status });
    }

    // Check if revision is still pending
    if (revision.approval_status !== 'pending') {
      const error = createErrorResponse(DESIGN_REVISION_ERRORS.REVISION_NOT_PENDING);
      return NextResponse.json(error.response, { status: error.status });
    }

    // ============================================================
    // Schema Strategy Option C:
    // For rejection: Populate BOTH approval fields AND rejection fields
    // For approval: Only populate approval fields
    // ============================================================
    const updateData: Record<string, unknown> = {
      approval_status: status,
      customer_comment: customerComment || null,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    };

    // For rejection: ALSO populate rejection fields (Option C)
    if (status === 'rejected') {
      updateData.rejected_by = user.id;
      updateData.rejected_at = new Date().toISOString();
      updateData.rejection_reason = rejectionReason;
    }

    // Update approval status
    const { data: updatedRevision, error: updateError } = await supabase
      .from('design_revisions')
      .update(updateData)
      .eq('id', revisionId)
      .select()
      .single();

    if (updateError) {
      console.error('[Design Revisions PATCH] Error:', updateError);
      return NextResponse.json(
        { success: false, error: '承認ステータスの更新に失敗しました。' },
        { status: 500 }
      );
    }

    console.log('[Design Revisions PATCH] Success:', revisionId, '→', status);
    if (status === 'rejected') {
      console.log('[Design Revisions PATCH] Rejection reason:', rejectionReason);
    }

    // ============================================================
    // Auto-transition: CUSTOMER_APPROVAL_PENDING → SPEC_APPROVED
    // 교정 승인 후 자동으로 사양 승인 완료 상태로 변경
    // ============================================================
    if (status === 'approved') {
      try {
        // 현재 주문 상태 확인
        const { data: currentOrder } = await supabase
          .from('orders')
          .select('status')
          .eq('id', orderId)
          .single();

        const currentStatus = currentOrder?.status;

        // CUSTOMER_APPROVAL_PENDING 상태에서만 자동 전환
        if (currentStatus === 'CUSTOMER_APPROVAL_PENDING') {
          console.log('[Design Revisions PATCH] Auto-transition: CUSTOMER_APPROVAL_PENDING → PRODUCTION');

          const { error: statusError } = await supabase
            .from('orders')
            .update({
              status: 'PRODUCTION',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);

          if (statusError) {
            console.error('[Design Revisions PATCH] Status update error:', statusError);
            // 에러가 있어도 승인은 성공한 것으로 처리
          } else {
            console.log('[Design Revisions PATCH] Auto-transition completed to PRODUCTION');

            // 이력 기록
            await supabase
              .from('order_status_history')
              .insert({
                order_id: orderId,
                from_status: currentStatus,
                to_status: 'PRODUCTION',
                changed_by: user.id,
                changed_at: new Date().toISOString(),
                reason: `교정 데이터 승인 (리비전 ${revision.revision_number})`,
              })
              .then(() => console.log('[Design Revisions PATCH] Status history logged'))
              .catch((err) => console.error('[Design Revisions PATCH] History logging error:', err));
          }
        }
      } catch (transitionError) {
        console.error('[Design Revisions PATCH] Status transition error:', transitionError);
        // 상태 변경 실패는 승인 실패로 처리하지 않음
      }
    }

    return NextResponse.json({
      success: true,
      revision: updatedRevision,
      notificationSent: true, // TODO: Implement actual email notification
    });

  } catch (error) {
    console.error('[Design Revisions PATCH] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '予期しないエラーが発生しました。',
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
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
