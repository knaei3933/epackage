/**
 * Inquiries API Functions
 *
 * お問い合わせAPI関数（Phase 3: スレッド機能対応・order-inquiry-link で注文チャット対応）
 */

import type { Inquiry, InquiryMessage, InquiryStatus, InquiryType } from '@/types/dashboard';

// =====================================================
// Errors
// =====================================================

/**
 * 注文チャット重複（1注文=1スレッド）の競合エラー。
 *
 * POST /api/member/inquiries が HTTP 409 + code:'ORDER_INQUIRY_EXISTS' を返した場合に throw される。
 * `existingInquiryId` は既存スレッドの id・フロントはこれを使って当該スレッドを展開する（AC-API-2）。
 *
 * 使用側（OrderInquirySection）は `instanceof InquiryConflictError` で分岐して、
 * 既存スレッドを再取得して表示を切り替える。
 */
export class InquiryConflictError extends Error {
  /** 既存スレッドの id（race condition の稀なケースでは null の可能性） */
  readonly existingInquiryId: string | null;

  constructor(message: string, existingInquiryId: string | null) {
    super(message);
    this.name = 'InquiryConflictError';
    this.existingInquiryId = existingInquiryId;
  }
}

// =====================================================
// API Client Functions
// =====================================================

/**
 * Fetch inquiries for the current member
 */
export async function fetchInquiries(params?: {
  status?: string;
  type?: string;
}): Promise<Inquiry[]> {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') {
    queryParams.set('status', params.status);
  }
  if (params?.type && params.type !== 'all') {
    queryParams.set('type', params.type);
  }

  const response = await fetch(`/api/member/inquiries?${queryParams.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'お問い合わせの取得に失敗しました');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Fetch a single inquiry by ID
 */
export async function fetchInquiry(id: string): Promise<Inquiry> {
  const response = await fetch(`/api/member/inquiries/${id}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'お問い合わせの取得に失敗しました');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Create a new inquiry
 *
 * POST /api/member/inquiries は multipart/form-data 受け取り:
 * - テキストフィールド: type, subject, message, orderId?, quotationId?
 * - 添付ファイル: 'attachments'（複数・サーバー側で MIME + magic number + 10MB + 5枚 を再検証）
 *
 * 添付は inquiry_messages の第1レコードに格納される（スレッド開始メッセージ）。
 */
export async function createInquiry(data: {
  type: InquiryType;
  /**
   * 件名。注文チャット（orderId あり）では省略可能（サーバー側で
   * 「注文 {orderNumber} のお問い合わせ」を自動生成）。一般 inquiry では必須。
   */
  subject?: string;
  message: string;
  orderId?: string;
  quotationId?: string;
  attachments?: File[];
}): Promise<Inquiry> {
  const formData = new FormData();
  formData.append('type', data.type);
  // 件名は任意（注文チャット時は省略可・サーバー側で自動生成）
  if (data.subject !== undefined) {
    formData.append('subject', data.subject);
  }
  formData.append('message', data.message);
  if (data.orderId) {
    formData.append('orderId', data.orderId);
  }
  if (data.quotationId) {
    formData.append('quotationId', data.quotationId);
  }

  if (data.attachments && data.attachments.length > 0) {
    for (const file of data.attachments) {
      formData.append('attachments', file, file.name);
    }
  }

  const response = await fetch('/api/member/inquiries', {
    method: 'POST',
    credentials: 'include',
    body: formData, // multipart/form-data（Content-Type はブラウザが boundary 付きで自動設定）
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // 注文チャット重複（1注文=1スレッド）: 既存スレッドの id を添えて InquiryConflictError を投げる
    // フロント（OrderInquirySection）はこれを受けて既存スレッドを展開する（AC-API-2）
    if (
      response.status === 409 &&
      error?.code === 'ORDER_INQUIRY_EXISTS'
    ) {
      throw new InquiryConflictError(
        error.error || 'この注文には既にお問い合わせスレッドが存在します',
        error.existingInquiryId ?? null
      );
    }
    throw new Error(error.error || 'お問い合わせの作成に失敗しました');
  }

  const result = await response.json();
  return result.data as Inquiry;
}

/**
 * お問い合わせスレッド（全メッセージ）を取得
 * GET /api/member/inquiries/[id]/messages
 *
 * 戻り値: 時系列順のメッセージ配列（senderName は profiles 結合済み・添付は signed URL 付き）
 */
export async function fetchInquiryMessages(inquiryId: string): Promise<InquiryMessage[]> {
  const response = await fetch(`/api/member/inquiries/${inquiryId}/messages`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'メッセージの取得に失敗しました');
  }

  const result = await response.json();
  // API は snake_case キーで返す・クライアント型も snake_case で整合済み
  return (result.data || []) as InquiryMessage[];
}

/**
 * スレッドへメッセージを追記（本文 + 添付）
 * POST /api/member/inquiries/[id]/messages（multipart/form-data）
 *
 * - body: メッセージ本文（必須・サーバー側で空チェック）
 * - attachments: 添付ファイル群（サーバー側で MIME + magic number + サイズ + 枚数 を再検証）
 *   - 一般 inquiry: 画像（PNG/JPG/WebP/GIF）+ PDF・1ファイル10MB・5枚まで
 *   - 注文チャット（orderId 紐付スレッド）: 上記に加えデザインデータ（AI/EPS/PSD/PS）も可・1ファイル100MB・5枚まで
 *
 * 戻り値: 作成されたメッセージ（senderName は含まない・必要なら再 fetch で補完）
 */
export async function createInquiryMessage(
  inquiryId: string,
  body: string,
  attachments?: File[]
): Promise<InquiryMessage> {
  const formData = new FormData();
  formData.append('body', body);

  if (attachments && attachments.length > 0) {
    for (const file of attachments) {
      formData.append('files', file, file.name);
    }
  }

  const response = await fetch(`/api/member/inquiries/${inquiryId}/messages`, {
    method: 'POST',
    credentials: 'include',
    body: formData, // multipart/form-data（Content-Type はブラウザが boundary 付きで自動設定）
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'メッセージの送信に失敗しました');
  }

  const result = await response.json();
  return result.data as InquiryMessage;
}

/**
 * お問い合わせのステータスを変更（会員側クローズ/再オープン）
 * PATCH /api/member/inquiries/[id]
 *
 * - action: 'close'（→ resolved）/ 'reopen'（→ in_progress）
 *
 * 戻り値: 更新後の inquiry 部分情報（id, status, updatedAt）
 */
export async function updateInquiryStatus(
  inquiryId: string,
  action: 'close' | 'reopen'
): Promise<{ id: string; status: InquiryStatus; updatedAt: string }> {
  const response = await fetch(`/api/member/inquiries/${inquiryId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ action }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'ステータスの更新に失敗しました');
  }

  const result = await response.json();
  return result.data;
}
