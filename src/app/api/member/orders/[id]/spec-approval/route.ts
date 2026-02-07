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
import { createServerClient } from '@supabase/ssr';
import { sendTemplatedEmail } from '@/lib/email';
import type { OrderStatus } from '@/types/order-status';

// =====================================================
// Environment Variables
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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
// POST Handler - Process Approval Action
// =====================================================

/**
 * POST /api/member/orders/[id]/spec-approval
 * Process customer approval action
 *
 * Request Body:
 * - action: 'approve' | 'reject' | 'cancel'
 * - revisionId: ID of the design revision
 * - comment: Customer comment (required for reject)
 *
 * Success Response (200):
 * {
 *   "success": true,
 *   "message": "Action completed successfully"
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate user
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

    const { id: orderId } = await params;

    // 2. Verify order exists and belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, order_number, customer_name, status')
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
    const { data: revision, error: revisionError } = await supabase
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
    // 新しいワークフローに基づくステータス遷移
    let newStatus: OrderStatus;
    let revisionStatus: string;
    let message: string;

    switch (action) {
      case 'approve':
        // 新しいワークフロー: CUSTOMER_APPROVAL_PENDING → PRODUCTION
        newStatus = 'PRODUCTION';
        revisionStatus = 'approved';
        message = '教正データを承認しました。製造を開始します。';
        break;

      case 'reject':
        // 新しいワークフロー: CUSTOMER_APPROVAL_PENDING → CORRECTION_IN_PROGRESS (教正ループ)
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
    const { error: updateError } = await supabase
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

    // 7. Update order status (新しいワークフロー: status のみを更新)
    const { error: statusUpdateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
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

    // 8. Log to order history (order_status_historyテーブルを使用)
    const { error: historyError } = await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        from_status: order.status, // 現在のステータス（更新前）
        to_status: newStatus,
        changed_by: user.id,
        changed_at: new Date().toISOString(),
        reason: `顧客アクション: ${action} (リビジョン${revision.revision_number})`,
      });

    if (historyError) {
      console.error('[Spec Approval] History logging error:', historyError);
      // 履歴記録の失敗は処理を続行
    }

    // 9. For rejection, notify Korea designer
    if (action === 'reject') {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // データベースからデザイナーメール取得
        const { data: setting } = await supabase
          .from('notification_settings')
          .select('value')
          .eq('key', 'korea_designer_emails')
          .maybeSingle();

        const designerEmails: string[] = setting?.value || [];

        if (designerEmails.length > 0) {
          // 各デザイナーにメール送信
          for (const email of designerEmails) {
            await sendTemplatedEmail(
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
        // Don't fail the approval if email fails
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
    // Authenticate
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

    const { id: orderId } = await params;

    // Verify order belongs to user
    const { data: order } = await supabase
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
    const { data: revisions, error } = await supabase
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
