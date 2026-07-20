/**
 * Admin Inquiry Detail API
 *
 * GET /api/admin/inquiries/[id] - 個別お問い合わせスレッド取得（管理者）
 *
 * SECURITY:
 * - withAdminAuth で ADMIN ロール + ACTIVE を必須化（第一防御線）
 * - 管理者は全件アクセス（user_id 絞りなし・管理者ポリシー準拠）
 *
 * パフォーマンス:
 * - N+1 回避: messages.sender_id を集約し profiles を一括取得
 * - 添付 URL は signed URL を都度生成（1 時間有効）
 *
 * order-inquiry-link 拡張（M2/M7 CRITICAL）:
 * - inquiry.order_id の有無で添付バケットを切替（getAttachmentBucketForInquiry 経由・ハードコード禁止）
 * - 注文 inquiry（order_id あり）の添付は inquiry-order-attachments バケットの signed URL を生成
 * - 一般 inquiry（order_id 無し）は従来通り inquiry-attachments バケット
 * - 管理者は両バケットの添付を読める（admin SELECT ポリシー両バケットに有り・AC-DB-3）
 * - GET レスポンス inquiry に orderId / orderNumber を追加（AC-UI-A-3 の注文ページ戻るリンク用）
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api-auth';
import { withApiHandler } from '@/lib/api-error-handler';
import { getAttachmentBucketForInquiry } from '@/lib/storage/inquiry-buckets';

// ============================================================
// Constants
// ============================================================

const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 時間

// ============================================================
// Helpers
// ============================================================

async function getInquiryId(
  context?: { params: Promise<Record<string, string | string[]>> }
): Promise<string | null> {
  if (!context?.params) return null;
  const params = await context.params;
  const raw = params?.id;
  if (!raw) return null;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

/**
 * 添付 path の signed URL を生成（バケットは呼び出し側で決定済みのものを使用）
 * order-inquiry-link により inquiry ごとにバケットが異なるため、固定バケットは廃止。
 * 生成失敗時は Storage path 文字列をそのまま返す（UI 上はリンク切れで動作・ログで検知）。
 */
async function toSignedUrl(
  supabase: ReturnType<typeof createServiceClient>,
  bucket: string,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data?.signedUrl) {
    console.error('[admin inquiry detail] signed URL generation failed:', { bucket, path, error });
    return path;
  }
  return data.signedUrl;
}

// ============================================================
// GET - 個別スレッド取得（inquiry 本体 + messages）
// ============================================================

export const GET = withApiHandler(
  withAdminAuth<any>(async (request: NextRequest, _auth, context) => {
    const inquiryId = await getInquiryId(context);

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, error: 'お問い合わせ ID が指定されていません' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // inquiry 本体（管理者は全件アクセス・user_id 絞りなし）
    const { data: inquiry, error: inquiryError } = await (supabase as any)
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .maybeSingle();

    if (inquiryError) {
      console.error('[admin inquiry detail GET] inquiry DB error:', inquiryError);
      return NextResponse.json(
        { success: false, error: 'お問い合わせの取得に失敗しました', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: 'お問い合わせが見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // inquiry.order_id の有無で添付バケットを切替（M2 CRITICAL・ハードコード禁止）
    // - order_id あり（注文チャット）→ inquiry-order-attachments（100MB・デザインデータ可）
    // - order_id 無し（一般 inquiry）→ inquiry-attachments（10MB・画像+PDF）
    const attachmentBucket = getAttachmentBucketForInquiry(inquiry.order_id);

    // order_number 補完（inquiries テーブルに無いため orders を別途 SELECT・AC-API-5）
    // 注文削除（ON DELETE SET NULL）で order_id が null の場合はスキップ
    let orderNumber: string | null = null;
    if (inquiry.order_id) {
      const { data: orderRow, error: orderError } = await (supabase as any)
        .from('orders')
        .select('order_number')
        .eq('id', inquiry.order_id)
        .maybeSingle();
      if (orderError) {
        console.error('[admin inquiry detail GET] order_number fetch error (non-blocking):', orderError);
      } else if (orderRow) {
        orderNumber = orderRow.order_number ?? null;
      }
    }

    // メッセージ一覧（時系列順）
    const { data: messages, error: messagesError } = await (supabase as any)
      .from('inquiry_messages')
      .select('*')
      .eq('inquiry_id', inquiryId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('[admin inquiry detail GET] messages DB error:', messagesError);
      // テーブル未作成の場合は messages 空配列で継続（inquiry 本体は返す）
      if (messagesError.code === '42P01') {
        return NextResponse.json({
          success: true,
          data: { inquiry, messages: [] },
        });
      }
      return NextResponse.json(
        { success: false, error: 'メッセージの取得に失敗しました', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    const messageList = (messages || []) as Array<{
      id: string;
      sender_type: 'member' | 'admin';
      sender_id: string | null;
      body: string;
      attachments: Array<{ url: string; file_name: string; mime_type: string; file_size: number; uploaded_at: string; validation_status: string }>;
      created_at: string;
    }>;

    // N+1 回避: sender_id を集約して profiles を一括取得
    const senderIds = Array.from(
      new Set(messageList.map((m) => m.sender_id).filter((id): id is string => !!id))
    );

    const senderMap = new Map<string, { id: string; name: string; role: string }>();
    if (senderIds.length > 0) {
      const { data: senders } = await (supabase as any)
        .from('profiles')
        .select('id, kanji_last_name, kanji_first_name, role')
        .in('id', senderIds);

      for (const s of (senders || []) as Array<{ id: string; kanji_last_name: string; kanji_first_name: string; role: string }>) {
        senderMap.set(s.id, {
          id: s.id,
          name: `${s.kanji_last_name} ${s.kanji_first_name}`,
          role: s.role,
        });
      }
    }

    // attachments の url を signed URL に変換（inquiry ごとに決定したバケットを使用・M2）
    const enrichedMessages = await Promise.all(
      messageList.map(async (m) => {
        const attachments = await Promise.all(
          (m.attachments || []).map(async (a) => ({
            ...a,
            url: await toSignedUrl(supabase, attachmentBucket, a.url),
          }))
        );
        const sender = m.sender_id ? senderMap.get(m.sender_id) : null;
        return {
          id: m.id,
          senderType: m.sender_type,
          senderId: m.sender_id,
          senderName: sender?.name ?? null,
          senderRole: sender?.role ?? null,
          body: m.body,
          attachments,
          createdAt: m.created_at,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        inquiry: {
          id: inquiry.id,
          inquiryNumber: inquiry.inquiry_number || inquiry.request_number,
          type: inquiry.type,
          status: inquiry.status,
          subject: inquiry.subject,
          message: inquiry.message,
          customerName: inquiry.customer_name,
          customerNameKana: inquiry.customer_name_kana,
          companyName: inquiry.company_name,
          email: inquiry.email,
          phone: inquiry.phone,
          urgency: inquiry.urgency,
          preferredContact: inquiry.preferred_contact,
          userId: inquiry.user_id,
          // 注文 inquiry の識別子・注文ページ（/admin/orders/{orderId}）へのリンク用（M7・AC-UI-A-3）
          orderId: inquiry.order_id ?? null,
          orderNumber,
          createdAt: inquiry.created_at,
          updatedAt: inquiry.updated_at,
          respondedAt: inquiry.responded_at,
        },
        messages: enrichedMessages,
      },
    });
  })
);
