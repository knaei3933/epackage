/**
 * Customer Spec Approval API
 *
 * 顧客教正データ承認API
 * 新しいワークフローに基づくステータス遷移:
 * - Approve: CUSTOMER_APPROVAL_PENDING → PRODUCTION (製造開始)
 * - Reject: CUSTOMER_APPROVAL_PENDING → CORRECTION_IN_PROGRESS (教正ループ)
 * - Cancel: → CANCELLED (注文キャンセル)
 *
 * @route /api/member/orders/[id]/spec-approval
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { sendTemplatedEmail } from '@/lib/email';
import { orderStatusEmails } from '@/lib/email/order-status-emails';
import { mapStatusToCurrentStage, type OrderStatus } from '@/types/order-status';

export const dynamic = 'force-dynamic';

// =====================================================
// Types
// =====================================================

interface SpecApprovalResponse {
  success: boolean;
  message?: string;
  error?: string;
  errorEn?: string;
}

// =====================================================
// Helper: Authenticate user (cookie-based via SSR client)
// =====================================================

async function authenticateUser(request: NextRequest) {
  const { client: supabase } = await createSupabaseSSRClient(request);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.id) return null;
  return user;
}

// =====================================================
// POST Handler - Process Approval Action
// =====================================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;
    const serviceClient = createServiceClient();

    // 2. Verify order exists and belongs to user
    const { data: order, error: orderError } = await serviceClient
      .from('orders')
      .select('id, user_id, order_number, customer_name, customer_email, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: '注文が見つかりません。', errorEn: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { error: 'この注文にアクセスする権限がありません。', errorEn: 'Access denied' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { action, revisionId, comment } = body;

    if (!action || !revisionId) {
      return NextResponse.json(
        {
          error: 'アクションとリビジョンIDは必須です。',
          errorEn: 'Action and revision ID are required'
        },
        { status: 400 }
      );
    }

    if (action === 'reject' && !comment?.trim()) {
      return NextResponse.json(
        {
          error: '修正要求の場合はコメントを入力してください。',
          errorEn: 'Comment is required for revision request'
        },
        { status: 400 }
      );
    }

    // 4. Verify revision exists and belongs to this order
    const { data: revision, error: revisionError } = await serviceClient
      .from('design_revisions')
      .select('*')
      .eq('id', revisionId)
      .eq('order_id', orderId)
      .single();

    if (revisionError || !revision) {
      return NextResponse.json(
        { error: '教正データが見つかりません。', errorEn: 'Revision not found' },
        { status: 404 }
      );
    }

    // 5. Process action
    let newStatus: OrderStatus;
    let revisionStatus: string;
    let message: string;

    switch (action) {
      case 'approve':
        newStatus = 'PRODUCTION';
        revisionStatus = 'approved';
        message = '教正データを承認しました。製造を開始します。';
        break;

      case 'reject':
        newStatus = 'CORRECTION_IN_PROGRESS';
        revisionStatus = 'rejected';
        message = '修正要求を送信しました。';
        break;

      case 'cancel':
        newStatus = 'CANCELLED';
        revisionStatus = 'rejected';
        message = '注文をキャンセルしました。';
        break;

      default:
        return NextResponse.json(
          {
            error: '無効なアクションです。',
            errorEn: 'Invalid action'
          },
          { status: 400 }
        );
    }

    // 6. Update revision status
    const { error: updateError } = await serviceClient
      .from('design_revisions')
      .update({
        approval_status: revisionStatus,
        customer_comment: comment || null,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', revisionId);

    if (updateError) {
      console.error('[Spec Approval] Revision update error:', updateError);
      return NextResponse.json(
        { error: '更新に失敗しました。', errorEn: 'Update failed' },
        { status: 500 }
      );
    }

    // 7. Update order status + current_stage
    const { error: statusUpdateError } = await serviceClient
      .from('orders')
      .update({
        status: newStatus,
        current_stage: mapStatusToCurrentStage(newStatus),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (statusUpdateError) {
      console.error('[Spec Approval] Status update error:', statusUpdateError);
      return NextResponse.json(
        { error: 'ステータス更新に失敗しました。', errorEn: 'Failed to update status', details: statusUpdateError.message },
        { status: 500 }
      );
    }

    // 8. Log to order history
    const { error: historyError } = await serviceClient
      .from('order_status_history')
      .insert({
        order_id: orderId,
        from_status: order.status,
        to_status: newStatus,
        changed_by: user.id,
        changed_at: new Date().toISOString(),
        reason: `顧客アクション: ${action} (リビジョン${revision.revision_number})`,
      });

    if (historyError) {
      console.error('[Spec Approval] History logging error:', historyError);
    }

    // 9. Send production start notification for approval
    if (action === 'approve') {
      try {
        const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com';

        let customerEmail = order.customer_email;
        if (!customerEmail) {
          const { data: userData } = await serviceClient
            .from('profiles')
            .select('email')
            .eq('id', user.id)
            .single();
          customerEmail = userData?.email;
        }

        if (customerEmail) {
          const estimatedCompletion =
            new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

          await orderStatusEmails.notifyProductionStarted({
            orderId: order.id,
            orderNumber: order.order_number,
            customerEmail,
            customerName: order.customer_name || 'お客様',
            productName: undefined,
            viewUrl: `${appUrl}/member/orders/${orderId}`,
          }, estimatedCompletion);

          console.log('[Spec Approval] Production start notification sent to customer');
        }
      } catch (emailError) {
        console.error('[Spec Approval] Production start notification error:', emailError);
      }
    }

    // 10. For rejection, notify Korea designer
    if (action === 'reject') {
      try {
        const appUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.package-lab.com';

        const { data: setting } = await serviceClient
          .from('notification_settings')
          .select('value')
          .eq('key', 'korea_designer_emails')
          .maybeSingle();

        const designerEmails: string[] = setting?.value || [];

        if (designerEmails.length > 0) {
          for (const email of designerEmails) {
            await (sendTemplatedEmail as any)(
              'correction_rejected',
              {
                orderNumber: order.order_number,
                customerComment: comment || '',
                correctionUploadUrl: `${appUrl}/admin/orders/${orderId}/correction`,
              },
              {
                name: '韓国デザイナー',
                email,
              }
            );
          }

          console.log('[Spec Approval] Korea designer notification sent for rejection');
        }
      } catch (emailError) {
        console.error('[Spec Approval] Korea designer notification error:', emailError);
      }
    }

    const response: SpecApprovalResponse = {
      success: true,
      message,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('[Spec Approval] Error:', error);

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
// GET Handler - List Revisions
// =====================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;
    const serviceClient = createServiceClient();

    // Verify order belongs to user
    const { data: order } = await serviceClient
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();

    if (!order || order.user_id !== user.id) {
      return NextResponse.json(
        { error: 'アクセス権限がありません。', errorEn: 'Access denied' },
        { status: 403 }
      );
    }

    // Get revisions
    const { data: revisions, error } = await serviceClient
      .from('design_revisions')
      .select('*')
      .eq('order_id', orderId)
      .order('revision_number', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: '教正データの取得に失敗しました。', errorEn: 'Failed to fetch revisions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      revisions: revisions || [],
    });

  } catch (error) {
    console.error('[Spec Approval GET] Error:', error);

    return NextResponse.json(
      {
        error: '予期しないエラーが発生しました。',
        errorEn: 'An unexpected error occurred',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
