/**
 * Member Inquiry Messages API (Thread)
 *
 * GET  /api/member/inquiries/[id]/messages - スレッド取得（全メッセージ・時系列順）
 * POST /api/member/inquiries/[id]/messages - メッセージ追記（本文 + 添付・最大5枚）
 *
 * SECURITY:
 * - アプリ層認可 = 第一防御線: 全クエリ user_id = auth.uid() を WHERE に強制
 * - service_role は RLS をバイパスするため、inquiry_id の所有者を必ず検証
 *
 * 添付ファイル:
 * - Storage path 設計: {user_id}/{inquiry_id}/{message_id}/{filename}
 * - 孤立ファイル対策: Storage アップロード後 DB INSERT 失敗時は Storage をクリーンアップ
 * - DB には Storage path を保存（signed URL は期限付きのため都度生成）
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createServiceClient } from '@/lib/supabase';
import { withMemberAuth } from '@/lib/api-auth';
import { withApiHandler } from '@/lib/api-error-handler';
import { withRateLimit, RateLimiter } from '@/lib/rate-limiter';
import { getAuditLogger } from '@/lib/audit-logger';
import {
  validateInquiryAttachments,
  validateOrderInquiryAttachments,
  resolveUniqueFileName,
} from '@/lib/file-validation';
import { getAttachmentBucketForInquiry } from '@/lib/storage/inquiry-buckets';

// ============================================================
// Constants
// ============================================================

const STORAGE_BUCKET = 'inquiry-attachments';
const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 時間
const MESSAGE_BODY_MAX_LENGTH = 5000;

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
 * inquiry_id が会員自身のものか検証（所有者検証 = 第一防御線）
 * 戻り値: 所有者なら inquiry 行（order_id 含む・バケット切替に使用）、そうでなければ null
 *
 * ※ order_id は添付バケット切替（M1 CRITICAL）に必須:
 *    order_id あり → inquiry-order-attachments / なし → inquiry-attachments
 */
async function verifyOwnership(
  supabase: ReturnType<typeof createServiceClient>,
  inquiryId: string,
  userId: string
): Promise<{ user_id: string; order_id: string | null } | null> {
  const { data, error } = await (supabase as any)
    .from('inquiries')
    .select('user_id, order_id')
    .eq('id', inquiryId)
    .eq('user_id', userId) // 第一防御線: service_role バイパス対策
    .maybeSingle();

  if (error || !data) return null;
  return data as { user_id: string; order_id: string | null };
}

/**
 * Storage path から signed URL を生成（期限 1 時間）
 * 失敗時は元の path をそのまま返す（フォールバック）
 *
 * bucket は呼出側で getAttachmentBucketForInquiry(inquiry.order_id) から決定して渡す
 * （注文チャットは inquiry-order-attachments・一般 inquiry は inquiry-attachments・M1 CRITICAL）。
 */
async function toSignedUrl(
  supabase: ReturnType<typeof createServiceClient>,
  path: string,
  bucket: string = STORAGE_BUCKET
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data?.signedUrl) {
    console.error('[inquiry messages] signed URL generation failed:', { path, bucket, error });
    return path;
  }
  return data.signedUrl;
}

/**
 * Storage 上のファイルを削除（孤立ファイル対策のクリーンアップ）
 *
 * bucket は呼出側で getAttachmentBucketForInquiry(inquiry.order_id) から決定して渡す。
 */
async function cleanupStorageFiles(
  supabase: ReturnType<typeof createServiceClient>,
  paths: string[],
  bucket: string = STORAGE_BUCKET
): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) {
    console.error('[inquiry messages] Storage cleanup failed:', { paths, bucket, error });
  }
}

// ============================================================
// GET - スレッド取得
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

    // 所有者検証（第一防御線）
    const owner = await verifyOwnership(supabase, inquiryId, userId);
    if (!owner) {
      return NextResponse.json(
        { success: false, error: 'お問い合わせが見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 添付バケット切替（M1 CRITICAL）: order_id あり → inquiry-order-attachments
    // ※ ハードコード禁止・必ず getAttachmentBucketForInquiry 経由
    const attachmentBucket = getAttachmentBucketForInquiry(owner.order_id);

    // メッセージ一覧取得（時系列順）
    const { data: messages, error } = await (supabase as any)
      .from('inquiry_messages')
      .select('*')
      .eq('inquiry_id', inquiryId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[inquiry messages GET] DB error:', error);
      // テーブル未作成の場合は空配列（UI 砕壊防止）
      if (error.code === '42P01') {
        return NextResponse.json({ success: true, data: [] });
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

    const senderMap = new Map<string, { id: string; name: string }>();
    if (senderIds.length > 0) {
      const { data: senders } = await (supabase as any)
        .from('profiles')
        .select('id, kanji_last_name, kanji_first_name')
        .in('id', senderIds);

      for (const s of (senders || []) as Array<{ id: string; kanji_last_name: string; kanji_first_name: string }>) {
        senderMap.set(s.id, {
          id: s.id,
          name: `${s.kanji_last_name} ${s.kanji_first_name}`,
        });
      }
    }

    // attachments の url（Storage path）を signed URL に変換
    // ※ 注文チャットは inquiry-order-attachments バケットから取得（attachmentBucket で切替）
    const enriched = await Promise.all(
      messageList.map(async (m) => {
        const attachments = await Promise.all(
          (m.attachments || []).map(async (a) => ({
            ...a,
            url: await toSignedUrl(supabase, a.url, attachmentBucket),
          }))
        );
        const sender = m.sender_id ? senderMap.get(m.sender_id) : null;
        return {
          id: m.id,
          inquiryId,
          senderType: m.sender_type,
          senderId: m.sender_id,
          senderName: sender?.name ?? null,
          body: m.body,
          attachments,
          createdAt: m.created_at,
        };
      })
    );

    return NextResponse.json({ success: true, data: enriched });
  })
);

// ============================================================
// POST - メッセージ追記（本文 + 添付）
// ============================================================

/**
 * POST 専用レートリミッター（/api/contact 準拠・API 毎に別インスタンス）
 * 10 リクエスト / 15 分・超過時は 30 分ブロック
 * ※ memberInquiryRateLimiter（作成 API）と別インスタンスでカウンタを分離
 */
const memberInquiryMessageRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  blockDurationMs: 30 * 60 * 1000,
});

/**
 * メッセージ追記の実処理（POST 本体から切り出し）
 */
async function handleCreateMessage(
  request: NextRequest,
  authResult: { userId: string },
  context?: { params: Promise<Record<string, string | string[]>> }
): Promise<NextResponse> {
    const userId = authResult.userId;
    const inquiryId = await getInquiryId(context);

    if (!inquiryId) {
      return NextResponse.json(
        { success: false, error: 'お問い合わせ ID が指定されていません' },
        { status: 400 }
      );
    }

    // multipart/form-data をパース（本文 + 添付ファイル群）
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

    // 本文バリデーション
    if (!bodyText) {
      return NextResponse.json(
        { success: false, error: 'メッセージ本文を入力してください' },
        { status: 400 }
      );
    }
    if (bodyText.length > MESSAGE_BODY_MAX_LENGTH) {
      return NextResponse.json(
        { success: false, error: `メッセージ本文は${MESSAGE_BODY_MAX_LENGTH}文字以内で入力してください` },
        { status: 400 }
      );
    }

    // File インスタンスのみ抽出
    const files = rawFiles.filter(
      (f): f is File =>
        typeof File !== 'undefined' && f instanceof File
    );

    const supabase = createServiceClient();

    // 所有者検証（第一防御線）+ order_id 取得（バケット切替用）
    const owner = await verifyOwnership(supabase, inquiryId, userId);
    if (!owner) {
      return NextResponse.json(
        { success: false, error: 'お問い合わせが見つかりません', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // 添付バケット切替（M1 CRITICAL）+ 添付検証（order_id で関数を切替）
    //   注文チャット（order_id あり）→ validateOrderInquiryAttachments（100MB・デザインデータ可）
    //   一般 inquiry（order_id なし）→ validateInquiryAttachments（10MB・画像+PDF・Non-Goals 準拠）
    // ※ バケット判別は必ず getAttachmentBucketForInquiry 経由（ハードコード禁止）
    const attachmentBucket = getAttachmentBucketForInquiry(owner.order_id);
    const attachmentValidation = owner.order_id !== null
      ? await validateOrderInquiryAttachments(files)
      : await validateInquiryAttachments(files);
    if (!attachmentValidation.valid) {
      return NextResponse.json(
        { success: false, error: '添付ファイルの検証に失敗しました', details: attachmentValidation.errors },
        { status: 400 }
      );
    }

    // message_id を事前生成（Storage path と DB PK を一致させる）
    const messageId = randomUUID();
    const uploadedPaths: string[] = [];
    const usedFileNames: string[] = []; // 同名ファイル重複回避用
    const nowIso = new Date().toISOString();

    // 添付を Storage へアップロード（path: {user_id}/{inquiry_id}/{message_id}/{filename}）
    const attachmentsMeta: Array<{
      url: string;
      file_name: string;
      mime_type: string;
      file_size: number;
      uploaded_at: string;
      validation_status: 'valid';
    }> = [];

    for (const file of attachmentValidation.validFiles) {
      const uniqueName = resolveUniqueFileName(file.name, usedFileNames);
      const path = `${userId}/${inquiryId}/${messageId}/${uniqueName}`;
      const { error: uploadError } = await supabase.storage
        .from(attachmentBucket)
        .upload(path, file, {
          contentType: file.type || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        // アップロード失敗時: 既に上げた分をクリーンアップして 500
        console.error('[inquiry messages POST] Storage upload failed:', { path, bucket: attachmentBucket, error: uploadError });
        await cleanupStorageFiles(supabase, uploadedPaths, attachmentBucket);
        return NextResponse.json(
          { success: false, error: '添付ファイルの保存に失敗しました', code: 'STORAGE_UPLOAD_ERROR' },
          { status: 500 }
        );
      }

      uploadedPaths.push(path);
      usedFileNames.push(uniqueName);
      attachmentsMeta.push({
        url: path, // DB には path を保存（signed URL は API で都度生成）
        file_name: uniqueName,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
        uploaded_at: nowIso,
        validation_status: 'valid',
      });
    }

    // inquiry_messages INSERT（id を事前生成・attachments にメタ配列）
    const { data: savedMessage, error: insertError } = await (supabase as any)
      .from('inquiry_messages')
      .insert({
        id: messageId,
        inquiry_id: inquiryId,
        sender_type: 'member',
        sender_id: userId,
        body: bodyText,
        attachments: attachmentsMeta,
      })
      .select()
      .single();

    if (insertError || !savedMessage) {
      // 孤立ファイル対策: DB INSERT 失敗時は Storage をクリーンアップ
      console.error('[inquiry messages POST] INSERT error:', insertError);
      await cleanupStorageFiles(supabase, uploadedPaths, attachmentBucket);
      return NextResponse.json(
        { success: false, error: 'メッセージの保存に失敗しました', code: 'INSERT_ERROR' },
        { status: 500 }
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
      details: {
        action: 'member_inquiry_message_sent',
        message_id: messageId,
        order_id: owner.order_id,
        attachment_bucket: attachmentBucket,
        attachment_count: attachmentsMeta.length,
        total_attachment_size: attachmentsMeta.reduce((sum, a) => sum + a.file_size, 0),
      },
    });

    // レスポンス（attachments の url を signed URL に変換）
    // ※ attachmentBucket で切替（注文チャットは inquiry-order-attachments）
    const responseAttachments = await Promise.all(
      attachmentsMeta.map(async (a) => ({
        ...a,
        url: await toSignedUrl(supabase, a.url, attachmentBucket),
      }))
    );

    return NextResponse.json({
      success: true,
      data: {
        id: savedMessage.id,
        inquiryId,
        senderType: 'member',
        senderId: userId,
        body: bodyText,
        attachments: responseAttachments,
        createdAt: savedMessage.created_at,
      },
    });
}

/**
 * POST handler（認証 + エラーハンドリング + レートリミット）
 */
export const POST = withRateLimit(
  withApiHandler(
    withMemberAuth<any>(async (request: NextRequest, authResult, context) => {
      return handleCreateMessage(request, authResult, context);
    })
  ),
  memberInquiryMessageRateLimiter
);
