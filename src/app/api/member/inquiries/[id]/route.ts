/**
 * Member Inquiry Detail API
 *
 * GET    /api/member/inquiries/[id] - 個別お問い合わせ取得（会員・所有者のみ）
 * PATCH  /api/member/inquiries/[id] - ステータス変更（close → resolved / reopen → in_progress）
 *
 * SECURITY:
 * - アプリ層認可 = 第一防御線: 全クエリ user_id = auth.uid() を WHERE に強制
 * - service_role は RLS をバイパスするため、アプリ層で必ず所有者検証
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { withMemberAuth } from '@/lib/api-auth';
import { withApiHandler } from '@/lib/api-error-handler';
import { getAuditLogger } from '@/lib/audit-logger';

// ============================================================
// Schemas
// ============================================================

const patchInquirySchema = z.object({
  action: z.enum(['close', 'reopen']),
});

// ============================================================
// Helpers
// ============================================================

/**
 * 動的ルートパラメータから id を取り出す（Next.js 16: params は Promise）
 */
async function getInquiryId(
  context?: { params: Promise<Record<string, string | string[]>> }
): Promise<string | null> {
  if (!context?.params) return null;
  const params = await context.params;
  const raw = params?.id;
  if (!raw) return null;
  // [id] は単一セグメントだが型上 string | string[] になるため正規化
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

// ============================================================
// GET - 個別お問い合わせ取得
// ============================================================

export const GET = withApiHandler(
  withMemberAuth<any>(async (request: NextRequest, authResult, context) => {
    const userId = authResult.userId;
    const inquiryId = await getInquiryId(context);

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, error: 'お問い合わせ ID が指定されていません' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // 所有者検証込みで取得（user_id = auth.uid() を WHERE に強制）
    // orders を LEFT JOIN して order_number を取得（注文チャットのみ・一般 inquiry は null）
    // ※ Relationships: [] のため PostgREST 型推論が効かない → any キャスト
    const { data: inquiry, error } = await (supabase as any)
      .from('inquiries')
      .select('*, orders:order_id(order_number, user_id)')
      .eq('id', inquiryId)
      .eq('user_id', userId) // 第一防御線: service_role バイパス対策
      .maybeSingle();

    if (error) {
      console.error('[inquiries GET detail] DB error:', error);
      return NextResponse.json(
        { success: false, error: 'お問い合わせの取得に失敗しました', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    if (!inquiry) {
      // 所有者でない、または存在しない。情報漏洩を防ぐため 404 統一
      return NextResponse.json(
        { success: false, error: 'お問い合わせが見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 注文チャット時の二重防御（AC-ROB-1）: inquiry.order_id 経由で orders.user_id = auth.uid() を検証
    // ※ inquiries.user_id = userId は WHERE で既に保証済みだが、order_id 紐付けの注文が
    //    データ不整合等で他人のものになっていないかを検証（RLS 第二防御線と同等の位置付け）
    if (inquiry.order_id && inquiry.orders) {
      const orderUserId = inquiry.orders.user_id;
      if (orderUserId !== userId) {
        console.error('[inquiries GET detail] order ownership mismatch:', {
          inquiryId,
          orderId: inquiry.order_id,
          inquiryUserId: userId,
          orderUserId,
        });
        return NextResponse.json(
          { success: false, error: 'お問い合わせが見つかりません', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    // クライアント Inquiry 型に合わせて返却
    return NextResponse.json({
      success: true,
      data: {
        id: inquiry.id,
        userId: inquiry.user_id,
        inquiryNumber: inquiry.inquiry_number || inquiry.request_number || `INQ-${String(inquiry.id).slice(0, 8)}`,
        orderId: inquiry.order_id ?? null,
        orderNumber: inquiry.orders?.order_number ?? null,
        type: inquiry.type,
        status: inquiry.status,
        subject: inquiry.subject,
        message: inquiry.message,
        response: inquiry.response,
        createdAt: inquiry.created_at,
        updatedAt: inquiry.updated_at,
        respondedAt: inquiry.responded_at,
      },
    });
  })
);

// ============================================================
// PATCH - ステータス変更（close / reopen）
// ============================================================

/**
 * close → status='resolved'（会員が解決済みにする）
 * reopen → status='in_progress'（会員が再オープン・追加質問等）
 */
export const PATCH = withApiHandler(
  withMemberAuth<any>(async (request: NextRequest, authResult, context) => {
    const userId = authResult.userId;
    const inquiryId = await getInquiryId(context);

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, error: 'お問い合わせ ID が指定されていません' },
        { status: 400 }
      );
    }

    // body parse & Zod 検証
    let parsed: z.infer<typeof patchInquirySchema>;
    try {
      const body = await request.json();
      parsed = patchInquirySchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: '入力データに誤りがあります',
            details: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'リクエストの解析に失敗しました' },
        { status: 400 }
      );
    }

    const nextStatus: 'resolved' | 'in_progress' =
      parsed.action === 'close' ? 'resolved' : 'in_progress';

    const supabase = createServiceClient();

    // 所有者検証込みで UPDATE（user_id = auth.uid() を WHERE に強制）
    const { data: updated, error } = await (supabase as any)
      .from('inquiries')
      .update({ status: nextStatus })
      .eq('id', inquiryId)
      .eq('user_id', userId) // 第一防御線
      .select()
      .maybeSingle();

    if (error) {
      console.error('[inquiries PATCH] DB error:', error);
      return NextResponse.json(
        { success: false, error: 'ステータスの更新に失敗しました', code: 'UPDATE_ERROR' },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'お問い合わせが見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // audit log
    const logger = getAuditLogger();
    await logger.log({
      event_type: 'data_modification',
      resource_type: 'other',
      resource_id: inquiryId,
      user_id: userId,
      outcome: 'success',
      details: { action: `member_inquiry_${parsed.action}`, next_status: nextStatus },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updated_at,
      },
    });
  })
);
