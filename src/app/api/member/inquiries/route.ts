export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { createServiceClient, auth } from '@/lib/supabase';
import { withMemberAuth } from '@/lib/api-auth';
import { withApiHandler } from '@/lib/api-error-handler';
import { withRateLimit, RateLimiter } from '@/lib/rate-limiter';
import { getAuditLogger } from '@/lib/audit-logger';
import { sendInquiryReceivedEmail } from '@/lib/email/send-inquiry-notification';
import {
  validateInquiryAttachments,
  validateOrderInquiryAttachments,
  resolveUniqueFileName,
  type InquiryAttachmentMeta,
} from '@/lib/file-validation';
import { getAttachmentBucketForInquiry } from '@/lib/storage/inquiry-buckets';
import type { Database } from '@/types/database';

/**
 * ============================================================
 * Member Inquiries API
 * ============================================================
 *
 * GET /api/member/inquiries - Get user's inquiries
 * POST /api/member/inquiries - Create a new inquiry (会員)
 *
 * SECURITY:
 * - アプリ層認可 = 第一防御線（全クエリ user_id = auth.uid() WHERE 強制）
 * - service_role は RLS をバイパスするため、アプリ層で必ず所有者検証
 * - legacy inquiries.response 列には新フローは書き込まない（inquiry_messages のみ使用）
 */

// ============================================================
// Helper Functions
// ============================================================

/**
 * Get user ID from Supabase auth cookies (most reliable method)
 */
async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    // Dynamic import to avoid build-time issues
    const { createServerClient } = await import('@supabase/ssr');
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[inquiries API] Missing Supabase environment variables');
      return null;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {}, // Read-only in Server Components
        remove: () => {}, // Read-only
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.log('[inquiries API] Auth error:', error.message);
      return null;
    }

    if (!user) {
      console.log('[inquiries API] No user found in session');
      return null;
    }

    console.log('[inquiries API] Found user:', user.id);
    return user.id;
  } catch (error) {
    console.error('[inquiries API] Error getting authenticated user:', error);
    return null;
  }
}

// ============================================================
// GET Handler - List Inquiries
// ============================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = await getAuthenticatedUserId();

    // 未認証の場合は空の配列を返す（UIを壊さないため）
    if (!userId) {
      console.log('[inquiries API] No authenticated user, returning empty array');
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const supabase = createServiceClient();

    // orders を LEFT JOIN して order_number を取得（注文チャットのみ・一般 inquiry は null）
    // ※ Relationships: [] のため PostgREST 型推論が効かない → any キャスト（既存パターン踏襲）
    let query = (supabase as any)
      .from('inquiries')
      .select('*, orders:order_id(order_number)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data: inquiries, error } = await query;

    if (error) {
      console.error('[inquiries API] Database error:', error);
      // テーブルが存在しない等の場合も空配列を返す
      if (error.code === '42P01') { // relation does not exist
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
      return NextResponse.json(
        { error: 'お問い合わせの取得に失敗しました', code: 'FETCH_ERROR' },
        { status: 500 }
      );
    }

    // Transform to frontend format
    const transformedInquiries = inquiries?.map((inquiry: { id: string; user_id: string; order_id: string | null; inquiry_number: string | null; request_number: string | null; type: string | null; subject: string | null; message: string | null; status: string; response: string | null; created_at: string; responded_at: string | null; orders: { order_number: string } | null }) => ({
      id: inquiry.id,
      userId: inquiry.user_id,
      inquiryNumber: inquiry.inquiry_number || inquiry.request_number || `INQ-${String(inquiry.id).padStart(6, '0')}`,
      orderId: inquiry.order_id ?? null,
      orderNumber: inquiry.orders?.order_number ?? null,
      type: inquiry.type || 'other',
      subject: inquiry.subject || 'お問い合わせ',
      message: inquiry.message || '',
      status: inquiry.status as 'open' | 'responded' | 'resolved' | 'closed',
      response: inquiry.response,
      createdAt: inquiry.created_at,
      respondedAt: inquiry.responded_at,
    })) || [];

    console.log('[inquiries API] Returning', transformedInquiries.length, 'inquiries');
    return NextResponse.json({
      success: true,
      data: transformedInquiries,
    });
  } catch (error) {
    console.error('[inquiries API] Unexpected error:', error);
    // 予期しないエラーでもUIを壊さないよう空配列を返す
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}

// ============================================================
// POST Handler - Create new inquiry（会員）
// ============================================================

/**
 * POST 専用レートリミッター（/api/contact 準拠・API 毎に別インスタンス）
 * 10 リクエスト / 15 分・超過時は 30 分ブロック
 */
const memberInquiryRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  blockDurationMs: 30 * 60 * 1000,
});

/**
 * Type-safe insert helper for inquiries table
 * （contact API の insertInquiry パターン踏襲）
 */
function insertInquiry(
  supabase: ReturnType<typeof createServiceClient>,
  data: Database['public']['Tables']['inquiries']['Insert']
) {
  return (supabase as any)
    .from('inquiries')
    .insert(data)
    .select()
    .single();
}

/**
 * Type-safe insert helper for inquiry_messages table
 * （Phase 1 migration で新設・database.ts 型未生成のためキャスト）
 */
function insertInquiryMessage(
  supabase: ReturnType<typeof createServiceClient>,
  data: {
    inquiry_id: string;
    sender_type: 'member' | 'admin';
    sender_id: string;
    body: string;
    attachments?: unknown[];
  }
) {
  return (supabase as any)
    .from('inquiry_messages')
    .insert({
      inquiry_id: data.inquiry_id,
      sender_type: data.sender_type,
      sender_id: data.sender_id,
      body: data.body,
      attachments: data.attachments ?? [],
    })
    .select()
    .single();
}

// ============================================================
// 添付アップロード用の定数とヘルパー（multipart 化対応）
// ============================================================

const STORAGE_BUCKET = 'inquiry-attachments';
const SIGNED_URL_EXPIRY_SECONDS = 3600; // 1 時間

/**
 * Storage path から signed URL を生成（期限 1 時間）
 * 失敗時は元の path をそのまま返す（フォールバック）
 *
 * bucket は呼出側で getAttachmentBucketForInquiry(orderId) から決定して渡す
 * （注文チャットは inquiry-order-attachments・一般 inquiry は inquiry-attachments）。
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
    console.error('[inquiries POST] signed URL generation failed:', { path, bucket, error });
    return path;
  }
  return data.signedUrl;
}

/**
 * Storage 上のファイルを削除（孤立ファイル対策のクリーンアップ）
 *
 * bucket は呼出側で getAttachmentBucketForInquiry(orderId) から決定して渡す。
 */
async function cleanupStorageFiles(
  supabase: ReturnType<typeof createServiceClient>,
  paths: string[],
  bucket: string = STORAGE_BUCKET
): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) {
    console.error('[inquiries POST] Storage cleanup failed:', { paths, bucket, error });
  }
}

/**
 * 新規お問い合わせ作成の入力スキーマ
 * （クライアント src/lib/api/member/inquiries.ts createInquiry の shape に整合）
 */
const createInquirySchema = z
  .object({
    type: z.enum([
      'product', 'quotation', 'sample', 'order', 'billing',
      'other', 'general', 'technical', 'sales', 'support',
    ]),
    // 注文チャット（orderId あり）では件名は不要（サーバー側で「注文 {orderNumber} のお問い合わせ」を自動生成）。
    // 一般 inquiry では件名必須（下記 refine で orderId なし時を検証）。
    subject: z
      .string()
      .min(1, '件名を入力してください')
      .max(200, '件名は200文字以内で入力してください')
      .optional(),
    message: z.string().min(1, 'お問い合わせ内容を入力してください').max(5000, 'お問い合わせ内容は5000文字以内で入力してください'),
    orderId: z.string().optional(),
    quotationId: z.string().optional(),
  })
  // 一般 inquiry（orderId 無し）では件名必須・注文チャット（orderId あり）では件名省略可
  .refine(
    (data) =>
      Boolean(data.orderId) ||
      (typeof data.subject === 'string' && data.subject.trim().length > 0),
    { message: '件名を入力してください', path: ['subject'] }
  );

/**
 * 新規お問い合わせ作成の実処理
 *
 * multipart/form-data 受け取り（初回からの添付対応）:
 * - JSON フィールド: type, subject, message, orderId?, quotationId?
 * - 添付ファイル: 複数（formData.getAll('attachments')）
 *
 * 注文チャット（orderId 受領時）の特別扱い（AC-API-1/2/3）:
 * - ① orders.user_id = auth.uid() を検証（他人の注文へのスレッド作成を拒否 → 403）
 * - ② 既存スレッドがあれば事前 SELECT で検知 → 409 Conflict（UX 向け高速応答）
 * - ③ type='order' を強制・件名「注文 {orderNumber} のお問い合わせ」を自動生成（会員は件名入力不可）
 * - ④ order_id を INSERT に設定（1注文=1スレッド・部分UNIQUE索引で強制）
 * - ⑤ 添付は inquiry-order-attachments バケット（100MB・デザインデータ可）
 * - race condition 最終防御: INSERT で 23505 unique_violation を catch → 409 に変換（M4）
 *
 * 一般 inquiry（orderId 無し）は従来通り（type は会員選択・件名手入力・inquiry-attachments・10MB）。
 *
 * フロー:
 * 1. multipart parse & Zod 検証
 * 2. 注文チャット時: orders.user_id 検証 + 既存スレッドチェック
 * 3. 添付検証（注文チャット: validateOrderInquiryAttachments / 一般: validateInquiryAttachments）
 * 4. profiles 取得（customer_name / email / phone 等）
 * 5. inquiries INSERT（user_id セット・status:'open'・legacy response 列には書き込まない）
 *    - 注文チャット時: type='order' 強制・件名自動生成・order_id セット
 *    - 23505 unique_violation を catch → 409 に変換
 * 6. message_id 生成（crypto.randomUUID・Storage path と DB PK を一致）
 * 7. 添付ファイルを Storage アップロード（path: {user_id}/{inquiry_id}/{message_id}/{filename}）
 *    - バケットは getAttachmentBucketForInquiry(orderId) で決定
 *    - 失敗時: アップロード済み Storage をクリーンアップ + inquiries DELETE で部分状態防止
 * 8. inquiry_messages 第1レコード INSERT（スレッド開始・attachments に検証済みファイル情報を格納）
 *    - 失敗時: Storage クリーンアップ + inquiries DELETE で部分状態防止
 * 9. 管理者へ sendInquiryReceivedEmail（メール失敗はログのみ・DB は commit 保持）
 * 10. audit log
 */
async function handleCreateInquiry(
  request: NextRequest,
  authResult: { userId: string }
): Promise<NextResponse> {
  const userId = authResult.userId;
  const requestId = `INQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  console.log('[inquiries POST] Request received:', { requestId, userId });

  // 1. multipart parse & Zod 検証
  let parsed: z.infer<typeof createInquirySchema>;
  let rawAttachments: File[] = [];
  try {
    const formData = await request.formData();

    // JSON フィールドを取得（multipart の各 part として送信される）
    const typeValue = formData.get('type');
    const subjectValue = formData.get('subject');
    const messageValue = formData.get('message');
    const orderIdValue = formData.get('orderId');
    const quotationIdValue = formData.get('quotationId');

    parsed = createInquirySchema.parse({
      type: typeValue?.toString() ?? '',
      // 注文チャット（orderId あり）では件名未送信を許容（undefined → optional でパス）
      subject: subjectValue?.toString() || undefined,
      message: messageValue?.toString() ?? '',
      orderId: orderIdValue?.toString() || undefined,
      quotationId: quotationIdValue?.toString() || undefined,
    });

    // 添付ファイル群を取得（getAll は配列を返す・無ければ空配列・空 File は除外）
    const attachmentEntries = formData.getAll('attachments');
    rawAttachments = attachmentEntries.filter(
      (entry): entry is File =>
        entry !== null && typeof entry === 'object' && entry instanceof File && entry.size > 0
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '入力データに誤りがあります',
          details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'リクエストの解析に失敗しました' },
      { status: 400 }
    );
  }

  // 2. 注文チャット（orderId 受領時）の事前検証
  //    ① orders.user_id = auth.uid() 検証（AC-API-3 第一防御線・他人の注文へのスレッド作成を拒否）
  //    ② 既存スレッドチェック（AC-API-2・1注文=1スレッド・UX 向け高速応答）
  //       ※ 最終防御は INSERT 時の 23505 unique_violation catch → 409（race condition 対策・M4）
  const supabase = createServiceClient();
  let orderContext: { orderId: string; orderNumber: string } | null = null;

  if (parsed.orderId) {
    // ① 注文の存在と所有者検証（orders.user_id = auth.uid()）
    const { data: order, error: orderError } = await (supabase as any)
      .from('orders')
      .select('id, order_number, user_id')
      .eq('id', parsed.orderId)
      .eq('user_id', userId) // 第一防御線: service_role バイパス対策
      .maybeSingle();

    if (orderError) {
      console.error('[inquiries POST] orders lookup error:', orderError);
      return NextResponse.json(
        { success: false, error: '注文の検証に失敗しました', code: 'ORDER_LOOKUP_ERROR' },
        { status: 500 }
      );
    }

    if (!order) {
      // 注文が存在しない、または他人の注文。詳細は秘して 403
      return NextResponse.json(
        {
          success: false,
          error: 'この注文についてお問い合わせできません',
          code: 'ORDER_FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // ② 既存スレッドチェック（部分UNIQUE索引の前段・UX 向け高速応答）
    const { data: existing, error: existingError } = await (supabase as any)
      .from('inquiries')
      .select('id')
      .eq('order_id', parsed.orderId)
      .maybeSingle();

    if (existingError) {
      console.error('[inquiries POST] existing inquiry lookup error:', existingError);
      return NextResponse.json(
        { success: false, error: 'お問い合わせの検証に失敗しました', code: 'LOOKUP_ERROR' },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'この注文には既にお問い合わせスレッドが存在します',
          code: 'ORDER_INQUIRY_EXISTS',
          existingInquiryId: existing.id,
        },
        { status: 409 }
      );
    }

    orderContext = { orderId: order.id, orderNumber: order.order_number };
  }

  // 3. 添付検証（MIME + magic number）
  //    注文チャット → validateOrderInquiryAttachments（100MB・デザインデータ可）
  //    一般 inquiry → validateInquiryAttachments（10MB・画像+PDF・Non-Goals 準拠）
  const attachmentValidation = orderContext
    ? await validateOrderInquiryAttachments(rawAttachments)
    : await validateInquiryAttachments(rawAttachments);
  if (!attachmentValidation.valid) {
    return NextResponse.json(
      {
        success: false,
        error: '添付ファイルに問題があります',
        details: attachmentValidation.errors.map((message) => ({ message })),
      },
      { status: 400 }
    );
  }
  const validatedFiles = attachmentValidation.validFiles;

  // 3. プロフィール取得（inquiries INSERT に必要な顧客情報を補完）
  const profile = await auth.getProfile(userId);
  if (!profile) {
    console.error('[inquiries POST] Profile not found:', userId);
    return NextResponse.json(
      { success: false, error: 'プロフィール情報が取得できませんでした' },
      { status: 400 }
    );
  }

  const customerName = `${profile.kanji_last_name} ${profile.kanji_first_name}`;
  const customerNameKana = `${profile.kana_last_name} ${profile.kana_first_name}`;
  const phone = profile.corporate_phone || profile.personal_phone || '';

  // 4. inquiries INSERT（user_id セット・status:'open'）
  //    注文チャット時: type='order' 強制・件名自動生成・order_id セット（AC-API-1）
  //    ※ supabase クライアントは step 2 で取得済み
  const inquiryType: Database['public']['Tables']['inquiries']['Insert']['type'] = orderContext
    ? 'order'
    : parsed.type;
  // 一般 inquiry では refine で subject 必須を保証済み（parsed.subject は string）。
  // ?? '' は型安全のためのフォールバック（到達しないパス）。
  const inquirySubject = orderContext
    ? `注文 ${orderContext.orderNumber} のお問い合わせ`
    : (parsed.subject ?? '');

  const inquiryRecord: Database['public']['Tables']['inquiries']['Insert'] = {
    user_id: userId,
    inquiry_number: requestId, // trigger が自動採番で上書き（contact API と同じ運用）
    request_number: requestId,
    type: inquiryType,
    customer_name: customerName,
    customer_name_kana: customerNameKana,
    company_name: profile.company_name || null,
    email: profile.email,
    phone,
    fax: null,
    postal_code: profile.postal_code || null,
    prefecture: profile.prefecture || null,
    city: profile.city || null,
    street: profile.street || null,
    subject: inquirySubject,
    message: parsed.message,
    response: null, // legacy 列・新フローは inquiry_messages のみ使用
    urgency: 'normal',
    preferred_contact: null,
    privacy_consent: true, // 会員は登録時に同意済み
    status: 'open',
    admin_notes: null,
    responded_at: null,
    // 注文チャット連携（order-inquiry-link）: order_id を設定（部分UNIQUE索引で1注文=1スレッド強制）
    order_id: orderContext?.orderId ?? null,
  };

  const insertResult = await insertInquiry(supabase, inquiryRecord);
  const savedInquiry = insertResult.data;
  const inquiryError = insertResult.error;

  if (inquiryError || !savedInquiry) {
    // race condition 最終防御（M4）: 事前 SELECT と INSERT の間に別リクエストが割り込んだ場合、
    // 部分UNIQUE索引 inquiries_order_id_unique が 23505 unique_violation を発生させる → 409 に変換
    if (inquiryError && (inquiryError as { code?: string }).code === '23505') {
      console.warn('[inquiries POST] unique_violation on order_id (race condition):', inquiryError);
      // 既存スレッドを再取得して existingInquiryId を返す
      const { data: existingAfterRace } = await (supabase as any)
        .from('inquiries')
        .select('id')
        .eq('order_id', parsed.orderId!)
        .maybeSingle();

      return NextResponse.json(
        {
          success: false,
          error: 'この注文には既にお問い合わせスレッドが存在します',
          code: 'ORDER_INQUIRY_EXISTS',
          existingInquiryId: existingAfterRace?.id ?? null,
        },
        { status: 409 }
      );
    }

    console.error('[inquiries POST] inquiries INSERT error:', inquiryError);
    return NextResponse.json(
      { success: false, error: 'お問い合わせの保存に失敗しました', code: 'INSERT_ERROR' },
      { status: 500 }
    );
  }

  // 5. message_id 事前生成（Storage path と DB の PK を一致させる）
  const messageId = randomUUID();

  // 6. 添付ファイルを Storage へアップロード
  //    path 設計: {userId}/{inquiryId}/{messageId}/{filename}
  //    （migration の storage.foldername(name)[1] = user_id 検証と整合）
  //    バケットは getAttachmentBucketForInquiry(orderId) で決定（M1/M3 CRITICAL・ハードコード禁止）:
  //      注文チャット → inquiry-order-attachments（100MB・デザインデータ可）
  //      一般 inquiry → inquiry-attachments（10MB・画像+PDF）
  const attachmentBucket = getAttachmentBucketForInquiry(orderContext?.orderId ?? null);
  const uploadedPaths: string[] = [];
  const usedFileNames: string[] = []; // 同名ファイル重複回避用
  const attachmentsMeta: InquiryAttachmentMeta[] = [];

  for (const file of validatedFiles) {
    // 同名ファイルがある場合は固有名を生成（Storage unique 制約違反回避）
    const uniqueName = resolveUniqueFileName(file.name, usedFileNames);
    const storagePath = `${userId}/${savedInquiry.id}/${messageId}/${uniqueName}`;
    const { error: uploadError } = await supabase.storage
      .from(attachmentBucket)
      .upload(storagePath, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('[inquiries POST] Storage upload error:', { storagePath, uploadError });
      // ロールバック: アップロード済み Storage をクリーンアップ + inquiries を削除（部分状態防止）
      await cleanupStorageFiles(supabase, uploadedPaths, attachmentBucket);
      await supabase
        .from('inquiries')
        .delete()
        .eq('id', savedInquiry.id)
        .eq('user_id', userId);

      return NextResponse.json(
        { success: false, error: '添付ファイルの保存に失敗しました', code: 'ATTACHMENT_UPLOAD_ERROR' },
        { status: 500 }
      );
    }

    uploadedPaths.push(storagePath);
    usedFileNames.push(uniqueName);
    attachmentsMeta.push({
      url: storagePath, // DB には path を保存・API で signed URL を都度生成（期限切れ回避）
      file_name: uniqueName, // 同名重複時は固有名（photo-2.png 等）
      mime_type: file.type || 'application/octet-stream',
      file_size: file.size,
      uploaded_at: new Date().toISOString(),
      validation_status: 'valid',
    });
  }

  // 7. inquiry_messages 第1レコード INSERT（スレッド開始・attachments 格納）
  const { error: messageError } = await insertInquiryMessage(supabase, {
    inquiry_id: savedInquiry.id,
    sender_type: 'member',
    sender_id: userId,
    body: parsed.message,
    attachments: attachmentsMeta,
  });

  if (messageError) {
    // ロールバック: Storage クリーンアップ + inquiries を削除（部分状態防止）
    console.error('[inquiries POST] inquiry_messages INSERT error:', messageError);
    await cleanupStorageFiles(supabase, uploadedPaths, attachmentBucket);
    await supabase
      .from('inquiries')
      .delete()
      .eq('id', savedInquiry.id)
      .eq('user_id', userId);

    return NextResponse.json(
      { success: false, error: 'お問い合わせの保存に失敗しました（スレッド初期化エラー）', code: 'MESSAGE_INSERT_ERROR' },
      { status: 500 }
    );
  }

  console.log('[inquiries POST] Inquiry created:', {
    inquiryId: savedInquiry.id,
    messageId,
    attachmentCount: attachmentsMeta.length,
  });

  // 8. 管理者へ通知メール（失敗はログのみ・DB は commit 保持）
  //    ※ メールには signed URL ではなく ファイル名・サイズのみ表示（期限付き URL 回避）
  //    注文チャット時は件名「注文 {orderNumber} のお問い合わせ」・type='order' で通知
  //    （worker-3 が InquiryReceivedEmailData.orderNumber を追加予定・現時点は subject 経由で注文番号を含む）
  const emailResult = await sendInquiryReceivedEmail({
    inquiryNumber: savedInquiry.inquiry_number || requestId,
    subject: inquirySubject,
    memberEmail: profile.email,
    memberName: customerName,
    messageBody: parsed.message,
    inquiryType: inquiryType,
    orderNumber: orderContext?.orderNumber,
    attachments: attachmentsMeta.map((a) => ({
      file_name: a.file_name,
      mime_type: a.mime_type,
      file_size: a.file_size,
    })),
  });
  if (!emailResult.success) {
    console.error('[inquiries POST] Email send failed (non-blocking):', emailResult.error);
  }

  // 9. audit log（inquiry_messages の作成を含む全体アクションとして記録）
  const logger = getAuditLogger();
  await logger.log({
    event_type: 'data_modification',
    resource_type: 'other',
    resource_id: savedInquiry.id,
    user_id: userId,
    outcome: 'success',
    details: {
      action: 'member_inquiry_created',
      inquiry_number: savedInquiry.inquiry_number,
      inquiry_type: inquiryType,
      order_id: orderContext?.orderId ?? null,
      attachment_count: attachmentsMeta.length,
      email_sent: emailResult.success,
    },
  });

  // 10. レスポンス（attachments の url を signed URL に変換して返却）
  //     バケットは getAttachmentBucketForInquiry で決定した attachmentBucket を使用
  const responseAttachments = await Promise.all(
    attachmentsMeta.map(async (a) => ({
      url: await toSignedUrl(supabase, a.url, attachmentBucket),
      file_name: a.file_name,
      mime_type: a.mime_type,
      file_size: a.file_size,
    }))
  );

  return NextResponse.json({
    success: true,
    data: {
      id: savedInquiry.id,
      userId: savedInquiry.user_id,
      inquiryNumber: savedInquiry.inquiry_number || savedInquiry.request_number || requestId,
      orderId: orderContext?.orderId ?? null,
      orderNumber: orderContext?.orderNumber ?? null,
      type: savedInquiry.type,
      status: savedInquiry.status,
      subject: savedInquiry.subject,
      message: savedInquiry.message,
      createdAt: savedInquiry.created_at,
      updatedAt: savedInquiry.updated_at,
      // 第1メッセージの id と attachments（クライアントで即時表示できるよう返却）
      messageId,
      attachments: responseAttachments,
    },
  });
}

/**
 * POST handler（認証 + エラーハンドリング + レートリミット）
 */
export const POST = withRateLimit(
  withApiHandler(
    withMemberAuth(async (request: NextRequest, authResult) => {
      return handleCreateInquiry(request, { userId: authResult.userId });
    })
  ),
  memberInquiryRateLimiter
);
