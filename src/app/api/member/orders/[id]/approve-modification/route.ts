/**
 * Customer Modification Approval API Route
 *
 * 顧客が管理者の修正を承認/拒否するAPI
 * - PUT: 修正の承認または拒否
 *
 * 新規ステータス:
 * - MODIFICATION_REQUESTED → MODIFICATION_APPROVED (承認)
 * - MODIFICATION_REQUESTED → MODIFICATION_REJECTED (拒否)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { notifyModificationApproved, notifyModificationRejected } from '@/lib/admin-notifications';

// ============================================================
// Environment Variables
// ============================================================

// Env vars checked at runtime in handler function
const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ============================================================
// Types
// ============================================================

interface ApprovalRequest {
  action: 'approved' | 'rejected';
  reason?: string;
}

// ============================================================
// PUT: 修正承認/拒否
// ============================================================

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[Modification Approval API] ========================================');
    console.log('[Modification Approval API] PUT request received');

    const params = await context.params;
    const { id: orderId } = params;

    // Get user ID from middleware headers (more reliable than cookie auth)
    const headersList = await headers();
    const userId = headersList.get('x-user-id');

    if (!userId) {
      console.error('[Modification Approval API] Auth error: No user ID in headers');
      return NextResponse.json(
        { error: '認証されていません' },
        { status: 401 }
      );
    }

    // Use service client (RLS bypass) - we already validated via middleware
    const supabase = createClient(supabaseUrl(), supabaseServiceKey());
    console.log('[Modification Approval API] User ID:', userId);
    console.log('[Modification Approval API] Order ID:', orderId);

    const body = await request.json() as ApprovalRequest;
    console.log('[Modification Approval API] Request body:', { action: body.action });

    if (body.action !== 'approved' && body.action !== 'rejected') {
      return NextResponse.json(
        { error: '無効なアクションです' },
        { status: 400 }
      );
    }

    // 注文確認
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    console.log('[Modification Approval API] Order query result:', {
      found: !!order,
      orderNumber: order?.order_number,
      currentStatus: order?.status,
      error: orderError?.message
    });

    if (orderError || !order) {
      console.error('[Modification Approval API] Order not found:', orderError);
      return NextResponse.json(
        { error: '注文が見つかりません' },
        { status: 404 }
      );
    }

    // ステータス確認
    if (order.status !== 'MODIFICATION_REQUESTED') {
      console.warn('[Modification Approval API] Invalid status:', order.status);
      return NextResponse.json(
        {
          error: '承認待ちの修正がありません',
          currentStatus: order.status,
        },
        { status: 400 }
      );
    }

    // 新しいステータスを決定
    const newStatus = body.action === 'approved'
      ? 'MODIFICATION_APPROVED'
      : 'MODIFICATION_REJECTED';

    console.log('[Modification Approval API] Updating order status:', {
      from: order.status,
      to: newStatus,
    });

    // 注文ステータス更新
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        modification_response: body.reason || '',
        modification_responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('[Modification Approval API] Update error:', updateError);
      return NextResponse.json(
        { error: 'ステータスの更新に失敗しました' },
        { status: 500 }
      );
    }

    // 通知送信（管理者へ）
    try {
      // 顧客名を取得（profilesテーブルから）
      let customerName = '顧客';
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name, first_name, last_name')
          .eq('id', userId)
          .single();

        if (profile) {
          customerName = profile.company_name ||
                        `${profile.last_name || ''} ${profile.first_name || ''}`.trim() ||
                        '顧客';
        }
      } catch (profileError) {
        console.warn('[Modification Approval API] Failed to fetch customer name:', profileError);
      }

      // アクションに応じて通知を作成
      if (body.action === 'approved') {
        await notifyModificationApproved(
          orderId,
          order.order_number,
          customerName
        );
        console.log('[Modification Approval API] Approval notification sent to admin');
      } else {
        await notifyModificationRejected(
          orderId,
          order.order_number,
          customerName,
          body.reason
        );
        console.log('[Modification Approval API] Rejection notification sent to admin');
      }
    } catch (notifError) {
      console.warn('[Modification Approval API] Failed to send notification:', notifError);
      // 通知失敗はメイン処理のエラーにしない
    }

    console.log('[Modification Approval API] Approval processed successfully:', {
      orderId,
      orderNumber: order.order_number,
      newStatus,
    });

    return NextResponse.json({
      success: true,
      message: body.action === 'approved'
        ? '修正内容を承認しました'
        : '修正内容を拒否しました',
      data: {
        orderId,
        newStatus,
        orderNumber: order.order_number,
      }
    });

  } catch (error) {
    console.error('[Modification Approval API] PUT error:', error);
    return NextResponse.json(
      {
        error: '修正承認処理中にエラーが発生しました',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// OPTIONSメソッド - CORS preflightリクエスト処理
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
