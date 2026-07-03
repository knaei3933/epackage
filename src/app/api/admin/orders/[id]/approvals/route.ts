/**
 * Admin Order Approval Requests API
 *
 * 管理者用注文承認リクエストAPI
 * - GET: 注文の承認リクエスト一覧取得
 * - POST: 顧客に承認リクエストを送信
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';
import { sendEmail } from '@/lib/email';

// ============================================================
// GET - List approval requests for an order
// ============================================================
export async function GET(
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

    const supabase = createServiceClient();

    const { data: approvals, error: approvalsError } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (approvalsError) {
      console.error('[Admin Approvals] Fetch error:', approvalsError);
      return NextResponse.json(
        { error: '承認リクエストの取得に失敗しました。' },
        { status: 500 }
      );
    }

    const { data: revisions } = await supabase
      .from('design_revisions')
      .select('id, revision_number, approval_status, preview_image_url, created_at, responded_at')
      .eq('order_id', orderId)
      .order('revision_number', { ascending: false });

    return NextResponse.json({
      success: true,
      data: {
        approvals: approvals || [],
        revisions: revisions || [],
      },
    });
  } catch (error) {
    console.error('[Admin Approvals] GET error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST - Send approval request to customer
// ============================================================
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
    const body = await request.json();
    const { title, description, revisionId } = body;

    const supabase = createServiceClient();

    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, customer_email, customer_name, user_id')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json(
        { error: '注文が見つかりません。' },
        { status: 404 }
      );
    }

    const { data: approvalRequest, error: createError } = await supabase
      .from('approval_requests')
      .insert({
        order_id: orderId,
        title: title || '校正データの承認をお願いします',
        description: description || 'ご確認の上、承認または修正依頼をお願いいたします。',
        approval_type: 'design_revision',
        status: 'pending',
        requested_by: auth.userId,
        requested_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: revisionId ? { revision_id: revisionId } : {},
      })
      .select()
      .single();

    if (createError || !approvalRequest) {
      console.error('[Admin Approvals] Create error:', createError);
      return NextResponse.json(
        { error: '承認リクエストの作成に失敗しました。' },
        { status: 500 }
      );
    }

    if (order.customer_email) {
      try {
        await sendEmail(
          order.customer_email,
          `【Epackage Lab】校正データの承認依頼 - ${order.order_number}`,
          `${order.customer_name || 'お客様'}様\n\n校正データが準備されました。\n以下のURLよりご確認・承認をお願いいたします。\n\n${process.env.NEXT_PUBLIC_SITE_URL}/member/orders/${orderId}/spec-approval\n\nEpackage Lab`,
          `<p>${order.customer_name || 'お客様'}様</p><p>校正データが準備されました。</p><p>以下のURLよりご確認・承認をお願いいたします。</p><p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/member/orders/${orderId}/spec-approval">校正データを確認する</a></p><hr><p>Epackage Lab</p>`,
        );
      } catch (emailError) {
        console.warn('[Admin Approvals] Email send failed:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      data: approvalRequest,
      message: '承認リクエストを送信しました。',
    });
  } catch (error) {
    console.error('[Admin Approvals] POST error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
