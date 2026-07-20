/**
 * Admin Inquiries API Functions
 *
 * お問い合わせ管理 API 関数（管理者側・Phase 5）
 *
 * 対応 endpoints:
 * - GET    /api/admin/inquiries              一覧（全文検索 + フィルタ）
 * - GET    /api/admin/inquiries/[id]         個別スレッド（inquiry + messages）
 * - POST   /api/admin/inquiries/[id]/messages 管理者回答（multipart・本文 + 添付）
 *
 * 認証は cookie ベース（api-fetch が credentials: include を付与）。
 * 401 時は api-fetch が自動で /auth/signin へリダイレクト。
 */

import { apiGet, apiFetch } from '@/lib/api-fetch';
import type {
  AdminInquiry,
  AdminInquiryDetail,
  AdminReplyResult,
} from '@/types/dashboard';

// =====================================================
// 共通: エラーレスポンスのパース
// =====================================================

/**
 * API エラーレスポンスから日本語メッセージを取り出す
 *
 * 管理者 API のエラー shape: { success: false, error: '...', code: '...' }
 * body が JSON でない場合（5xx 等の HTML）は fallback を返す。
 */
async function extractErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body = await response.json();
    if (body && typeof body.error === 'string' && body.error) {
      return body.error;
    }
  } catch {
    // JSON パース失敗は無視（HTML エラーページ等）
  }
  return fallback;
}

// =====================================================
// 一覧取得
// =====================================================

/**
 * お問い合わせ一覧を取得（全文検索 + フィルタ）
 * GET /api/admin/inquiries?search=&type=&status=&limit=
 *
 * - search: 件名 / 本文 / 顧客名 / メール等の全文検索（サーバー側 search_inquiries RPC）
 * - type: 'product' | 'quotation' | ... | 'all'
 * - status: 'pending' | 'open' | 'in_progress' | 'responded' | 'resolved' | 'closed' | 'all'
 * - limit: 1-200（既定 50）
 */
export async function fetchAdminInquiries(params?: {
  search?: string;
  type?: string;
  status?: string;
  limit?: number;
}): Promise<AdminInquiry[]> {
  const query = new URLSearchParams();
  if (params?.search && params.search.trim()) {
    query.set('search', params.search.trim());
  }
  if (params?.type && params.type !== 'all') {
    query.set('type', params.type);
  }
  if (params?.status && params.status !== 'all') {
    query.set('status', params.status);
  }
  if (params?.limit && Number.isFinite(params.limit)) {
    query.set('limit', String(params.limit));
  }

  const qs = query.toString();
  const url = `/api/admin/inquiries${qs ? `?${qs}` : ''}`;

  const response = await apiGet(url);

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, 'お問い合わせ一覧の取得に失敗しました')
    );
  }

  const result = await response.json();
  return (result.data || []) as AdminInquiry[];
}

// =====================================================
// 個別スレッド取得
// =====================================================

/**
 * 個別お問い合わせのスレッドを取得（inquiry 本体 + messages）
 * GET /api/admin/inquiries/[id]
 *
 * attachments の url は signed URL（1 時間有効）。
 * messages は時系列順・senderRole 付き。
 */
export async function fetchAdminInquiry(
  inquiryId: string
): Promise<AdminInquiryDetail> {
  const response = await apiGet(`/api/admin/inquiries/${inquiryId}`);

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, 'お問い合わせの取得に失敗しました')
    );
  }

  const result = await response.json();
  return result.data as AdminInquiryDetail;
}

// =====================================================
// 管理者回答の送信（multipart）
// =====================================================

/**
 * 管理者からのお問い合わせ回答を送信（本文 + 添付）
 * POST /api/admin/inquiries/[id]/messages（multipart/form-data）
 *
 * - body: 回答本文（必須・サーバー側で空チェック・最大 10000 文字）
 * - attachments: 添付ファイル群（サーバー側で MIME + magic number + サイズ + 枚数 を再検証）
 *   - 一般 inquiry: 画像（PNG/JPG/WebP/GIF）+ PDF・1ファイル10MB・5枚まで
 *   - 注文チャット（orderId 紐付スレッド）: 上記に加えデザインデータ（AI/EPS/PSD/PS）も可・1ファイル100MB・5枚まで
 *
 * 副作用（サーバー側）:
 * - inquiry_messages INSERT（sender_type='admin'）
 * - inquiries UPDATE: status が open/in_progress の場合は responded へ自動遷移 + responded_at 設定
 * - 会員へ回答通知メール送信
 *
 * 戻り値: 作成されたメッセージ + statusTransitioned + emailSent
 */
export async function createAdminReply(
  inquiryId: string,
  body: string,
  attachments?: File[]
): Promise<AdminReplyResult> {
  const formData = new FormData();
  formData.append('body', body);

  if (attachments && attachments.length > 0) {
    for (const file of attachments) {
      formData.append('files', file, file.name);
    }
  }

  // skipDefaultHeaders: FormData のときは Content-Type をブラウザに自動設定させる
  // （boundary 付き multipart/form-data・手動設定すると boundary が欠落する）
  const response = await apiFetch(`/api/admin/inquiries/${inquiryId}/messages`, {
    method: 'POST',
    body: formData,
    skipDefaultHeaders: true,
  });

  if (!response.ok) {
    throw new Error(
      await extractErrorMessage(response, '回答の送信に失敗しました')
    );
  }

  const result = await response.json();
  return result.data as AdminReplyResult;
}
