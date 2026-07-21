/**
 * Admin Inquiry Reply API
 *
 * POST /api/admin/inquiries/[id]/messages - 管理者からの回答（本文 + 添付）
 *
 * SECURITY:
 * - withAdminAuth で ADMIN ロール + ACTIVE を必須化（第一防御線）
 * - legacy inquiries.response 列には書き込まない（新フローは inquiry_messages のみ）
 *
 * 副作用:
 * - inquiry_messages INSERT（sender_type='admin'）
 * - inquiries UPDATE（status が open/in_progress の場合 → 'responded'・responded_at 設定）
 *   ※ resolved/closed は維持（管理者回答で完了/クローズを強制再オープンしない）
 * - sendInquiryRepliedEmail で会員へ通知（メール失敗はログのみ・DB は commit 保持）
 *
 * 添付:
 * - Storage path: {admin_id}/{inquiry_id}/{message_id}/{filename}
 * - 孤立ファイル対策: Storage アップロード後 DB INSERT 失敗時は Storage クリーンアップ
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createServiceClient } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/api-auth';
import { withApiHandler } from '@/lib/api-error-handler';
import { getAuditLogger } from '@/lib/audit-logger';
import { sendInquiryRepliedEmail } from '@/lib/email/send-inquiry-notification';
import {
  validateInquiryAttachments,
  validateOrderInquiryAttachments,
} from '@/lib/file-validation';
import { getAttachmentBucketForInquiry } from '@/lib/storage/inquiry-buckets';

// ============================================================
// Constants
// ============================================================

const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 時間
const MESSAGE_BODY_MAX_LENGTH = 10000; // 管理者回答は会員より少し長めに許容

/** status 自動遷移対象（これら以外は維持） */
const TRANSITIONABLE_STATUSES = new Set(['open', 'in_progress']);

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

async function toSignedUrl(
  supabase: ReturnType<typeof createServiceClient>,
  bucket: string,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data?.signedUrl) {
    console.error('[admin reply] signed URL generation failed:', { bucket, path, error });
    return path;
  }
  return data.signedUrl;
}

async function cleanupStorageFiles(
  supabase: ReturnType<typeof createServiceClient>,
  bucket: string,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) {
    console.error('[admin reply] Storage cleanup failed:', { bucket, paths, error });
  }
}

// ============================================================
// POST - 管理者からの回答
// ============================================================

export const POST = withApiHandler(
  withAdminAuth<any>(async (request: NextRequest, auth, context) => {
    const adminId = auth.userId;
    const inquiryId = await getInquiryId(context);

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, error: 'お問い合わせ ID が指定されていません' },
        { status: 400 }
      );
    }

    // multipart/form-data をパース
    let bodyText: string;
    let rawFiles: unknown[];
    try {
      const formData = await request.formData();
      bodyText = (formData.get('body') as string | null)?.trim() ?? '';
      rawFiles = formData.getAll('files');
    } catch {
      return NextResponse.json(
        { success: false, error: 'リクエストの解析に失敗しました' },
        { status: 400 }
      );
    }

    if (!bodyText) {
      return NextResponse.json(
        { success: false, error: '回答本文を入力してください' },
        { status: 400 }
      );
    }
    if (bodyText.length > MESSAGE_BODY_MAX_LENGTH) {
      return NextResponse.json(
        { success: false, error: `回答本文は${MESSAGE_BODY_MAX_LENGTH}文字以内で入力してください` },
        { status: 400 }
      );
    }

    const files = rawFiles.filter(
      (f): f is File => typeof File !== 'undefined' && f instanceof File
    );

    const supabase = createServiceClient();

    // inquiry 存在確認 + order_id（バケット切替用）+ メール通知用情報取得（管理者は全件アクセス）
    const { data: inquiry, error: inquiryError } = await (supabase as any)
      .from('inquiries')
      .select('id, status, subject, email, customer_name, inquiry_number, request_number, order_id')
      .eq('id', inquiryId)
      .maybeSingle();

    if (inquiryError || !inquiry) {
      return NextResponse.json(
        { success: false, error: 'お問い合わせが見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // inquiry.order_id の有無で添付バケットを切替（order-inquiry-link・ハードコード禁止）
    // - order_id あり（注文チャット）→ inquiry-order-attachments（100MB・デザインデータ可）
    // - order_id 無し（一般 inquiry）→ inquiry-attachments（10MB・画像+PDF）
    const attachmentBucket = getAttachmentBucketForInquiry(inquiry.order_id);

    // 添付検証（order_id で切替・MIME + magic number + サイズ + 5枚）
    // - order_id あり: validateOrderInquiryAttachments（100MB・デザインデータ8種）
    // - order_id 無し: validateInquiryAttachments（10MB・画像+PDF5種）
    const attachmentValidation =
      inquiry.order_id != null
        ? await validateOrderInquiryAttachments(files)
        : await validateInquiryAttachments(files);
    if (!attachmentValidation.valid) {
      return NextResponse.json(
        { success: false, error: '添付ファイルの検証に失敗しました', details: attachmentValidation.errors },
        { status: 400 }
      );
    }

    // 注文 inquiry の場合は order_number を補完（メール文面の注文番号表示・AC-ROB-4）
    // 一般 inquiry は null のまま（メールで注文番号行は省略される）
    let orderNumber: string | null = null;
    if (inquiry.order_id) {
      const { data: orderRow, error: orderError } = await (supabase as any)
        .from('orders')
        .select('order_number')
        .eq('id', inquiry.order_id)
        .maybeSingle();
      if (orderError) {
        console.error('[admin reply POST] order_number fetch error (non-blocking):', orderError);
      } else if (orderRow) {
        orderNumber = orderRow.order_number ?? null;
      }
    }

    // message_id を事前生成（Storage path と DB PK を一致させる）
    const messageId = randomUUID();
    const uploadedPaths: string[] = [];
    const nowIso = new Date().toISOString();

    // 添付を Storage へアップロード（path: {admin_id}/{inquiry_id}/{message_id}/{filename}）
    // バケットは attachmentBucket（inquiry.order_id で決定）
    const attachmentsMeta: Array<{
      url: string;
      file_name: string;
      mime_type: string;
      file_size: number;
      uploaded_at: string;
      validation_status: 'valid';
    }> = [];

    for (const file of attachmentValidation.validFiles) {
      const path = `${adminId}/${inquiryId}/${messageId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(attachmentBucket)
        .upload(path, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        console.error('[admin reply POST] Storage upload failed:', { bucket: attachmentBucket, path, error: uploadError });
        await cleanupStorageFiles(supabase, attachmentBucket, uploadedPaths);
        return NextResponse.json(
          { success: false, error: '添付ファイルの保存に失敗しました', code: 'STORAGE_UPLOAD_ERROR' },
          { status: 500 }
        );
      }

      uploadedPaths.push(path);
      attachmentsMeta.push({
        url: path,
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
        uploaded_at: nowIso,
        validation_status: 'valid',
      });
    }

    // inquiry_messages INSERT（sender_type='admin'）
    const { data: savedMessage, error: insertError } = await (supabase as any)
      .from('inquiry_messages')
      .insert({
        id: messageId,
        inquiry_id: inquiryId,
        sender_type: 'admin',
        sender_id: adminId,
        body: bodyText,
        attachments: attachmentsMeta,
      })
      .select()
      .single();

    if (insertError || !savedMessage) {
      // 孤立ファイル対策: DB INSERT 失敗時は Storage をクリーンアップ
      console.error('[admin reply POST] INSERT error:', insertError);
      await cleanupStorageFiles(supabase, attachmentBucket, uploadedPaths);
      return NextResponse.json(
        { success: false, error: '回答の保存に失敗しました', code: 'INSERT_ERROR' },
        { status: 500 }
      );
    }

    // inquiries UPDATE: status 自動遷移（open/in_progress → 'responded'）+ responded_at
    // ※ resolved/closed は維持（管理者回答で完了/クローズを強制再オープンしない）
    let statusTransitioned = false;
    if (TRANSITIONABLE_STATUSES.has(inquiry.status)) {
      const { error: updateError } = await (supabase as any)
        .from('inquiries')
        .update({ status: 'responded', responded_at: nowIso })
        .eq('id', inquiryId);

      if (updateError) {
        console.error('[admin reply POST] status UPDATE error (non-blocking):', updateError);
        // メッセージ保存は成功しているので、status 遷移失敗はログのみで継続
      } else {
        statusTransitioned = true;
      }
    }

    // 会員へ回答通知メール（メール失敗はログのみ・DB は commit 保持）
    let emailSent = false;
    if (inquiry.email) {
      const inquiryNumber = inquiry.inquiry_number || inquiry.request_number || inquiryId;
      const memberName = inquiry.customer_name || '';

      const emailResult = await sendInquiryRepliedEmail({
        inquiryNumber,
        // 注文 inquiry の場合のみ注文番号を文面に含める（AC-ROB-4・null 時は省略）
        orderNumber: orderNumber ?? undefined,
        subject: inquiry.subject,
        memberEmail: inquiry.email,
        memberName,
        adminReply: bodyText,
        attachments: attachmentsMeta.map((a) => ({
          file_name: a.file_name,
          mime_type: a.mime_type,
          file_size: a.file_size,
        })),
      });

      if (!emailResult.success) {
        console.error('[admin reply POST] Email send failed (non-blocking):', emailResult.error);
      } else {
        emailSent = true;
      }
    } else {
      console.warn('[admin reply POST] inquiry has no email - skipping notification:', inquiryId);
    }

    // audit log
    const logger = getAuditLogger();
    await logger.log({
      event_type: 'data_modification',
      resource_type: 'other',
      resource_id: inquiryId,
      user_id: adminId,
      outcome: 'success',
      details: {
        action: 'admin_inquiry_replied',
        message_id: messageId,
        status_transitioned: statusTransitioned,
        previous_status: inquiry.status,
        email_sent: emailSent,
        attachment_count: attachmentsMeta.length,
      },
    });

    // レスポンス（attachments の url を signed URL に変換・attachmentBucket を使用）
    const responseAttachments = await Promise.all(
      attachmentsMeta.map(async (a) => ({
        ...a,
        url: await toSignedUrl(supabase, attachmentBucket, a.url),
      }))
    );

    return NextResponse.json({
      success: true,
      data: {
        id: savedMessage.id,
        inquiryId,
        senderType: 'admin',
        senderId: adminId,
        body: bodyText,
        attachments: responseAttachments,
        createdAt: savedMessage.created_at,
        statusTransitioned,
        emailSent,
      },
    });
  })
);
