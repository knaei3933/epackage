/**
 * AdminOrderInquirySection
 *
 * 管理者注文詳細ページ（/admin/orders/[id]）埋め込みの
 * 注文のお問い合わせチャットセクション（折りたたみ）。
 *
 * 機能:
 * - 当該注文に紐付くスレッドを取得（GET /api/admin/inquiries を type='order' で絞り込み）
 * - スレッド未存在: 「会員からのお問い合わせはまだありません」を表示
 * - スレッド存在: 折りたたみ（件名 + 最終メッセージ概要）・クリックで展開
 *   - 会員 / 管理者 双方向のメッセージを吹き出しで表示
 *   - 添付ファイル（signed URL）を表示（画像サムネイル / PDF ダウンロード）
 *   - 管理者返信フォーム（本文 + 添付・POST multipart）
 *
 * AC-UI-A-2: 管理者注文詳細ページに折りたたみチャット埋め込み・注文の文脈で回答可
 *
 * @client
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Loader2,
  Send,
  FileText,
  Image as ImageIcon,
  Download,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Info,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type {
  AdminInquiry,
  AdminInquiryDetail,
  AdminInquiryMessage,
  InquiryStatus,
} from '@/types/dashboard';
import {
  fetchAdminInquiries,
  fetchAdminInquiry,
  createAdminReply,
} from '@/lib/api/admin/inquiries';
import { InquiryAttachmentUpload } from '@/components/inquiries/InquiryAttachmentUpload';

// =====================================================
// Constants
// =====================================================

const REPLY_BODY_MAX = 10000; // サーバー側 MESSAGE_BODY_MAX_LENGTH に整合

const inquiryStatusLabels: Record<InquiryStatus, string> = {
  pending: '保留中',
  open: '未対応',
  in_progress: '対応中',
  responded: '返信済',
  resolved: '完了',
  closed: 'クローズ',
};

const inquiryStatusBadgeClass: Record<InquiryStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  responded: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-200 text-gray-700',
};

// 送信者の役職ラベル（profiles.role）
const senderRoleLabels: Record<string, string> = {
  admin: '管理者',
  operator: 'オペレーター',
  sales: '営業',
  accounting: '経理',
  member: '会員',
};

// =====================================================
// Helpers
// =====================================================

function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

function isPdfMime(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 本文の1行プレビュー（折りたたみ表示用） */
function summarizeBody(body: string, max = 60): string {
  const text = body.replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

// =====================================================
// Sub-components
// =====================================================

function AttachmentItem({
  attachment,
  align,
}: {
  attachment: AdminInquiryMessage['attachments'][number];
  align: 'left' | 'right';
}) {
  const fileName = attachment.file_name || '添付ファイル';

  if (isImageMime(attachment.mime_type)) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-1.5 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity"
        title={fileName}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={attachment.url}
          alt={fileName}
          className="max-w-[200px] max-h-[200px] object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName}
      className={`mt-1.5 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs hover:bg-gray-100 transition-colors ${
        align === 'right' ? 'bg-white/10 text-white border-white/20' : 'bg-gray-100 text-gray-900'
      }`}
    >
      {isPdfMime(attachment.mime_type) ? (
        <FileText className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <ImageIcon className="w-3.5 h-3.5 shrink-0" />
      )}
      <span className="truncate max-w-[180px]">{fileName}</span>
      <span className="opacity-70 shrink-0">{formatFileSize(attachment.file_size)}</span>
      <Download className="w-3 h-3 shrink-0" />
    </a>
  );
}

function MessageBubble({ message }: { message: AdminInquiryMessage }) {
  const isMember = message.senderType === 'member';
  const align = isMember ? 'right' : 'left';
  const roleLabel = message.senderRole
    ? senderRoleLabels[message.senderRole] || message.senderRole
    : null;

  const senderLabel = isMember
    ? message.senderName || '会員'
    : message.senderName
      ? roleLabel
        ? `担当者（${message.senderName}・${roleLabel}）`
        : `担当者（${message.senderName}）`
      : '担当者';

  return (
    <div className={`flex ${isMember ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isMember ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* 送信者名 + 日時 */}
        <div
          className={`flex items-center gap-1.5 mb-0.5 text-xs text-gray-500 ${
            isMember ? 'flex-row-reverse' : ''
          }`}
        >
          <span className="font-medium">{senderLabel}</span>
          <span>
            {format(new Date(message.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
          </span>
        </div>

        {/* 吹き出し本体 */}
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap break-words ${
            isMember
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 border border-gray-200 rounded-bl-sm'
          }`}
        >
          {message.body}
        </div>

        {/* 添付 */}
        {message.attachments && message.attachments.length > 0 && (
          <div className={`flex flex-col ${isMember ? 'items-end' : 'items-start'}`}>
            {message.attachments.map((att, idx) => (
              <AttachmentItem key={idx} attachment={att} align={align} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =====================================================
// Main Component
// =====================================================

export interface AdminOrderInquirySectionProps {
  /** 注文 ID（inquiries.order_id と一致） */
  orderId: string;
  /** 注文番号（ラベル表示用） */
  orderNumber: string;
}

export function AdminOrderInquirySection({
  orderId,
  orderNumber,
}: AdminOrderInquirySectionProps) {
  // スレッド一覧から当該注文の inquiry を特定
  const [matchedInquiry, setMatchedInquiry] = useState<AdminInquiry | null>(null);
  // スレッド詳細（messages 含む）
  const [detail, setDetail] = useState<AdminInquiryDetail | null>(null);

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ※ デフォルト=展開: 既存スレッドがある場合は会話（最新メッセージ含む）をすぐ見せるため
  //   （ユーザー主訴「やり取りが見えない」= 折りたたみで隠れていた の解消）
  const [isExpanded, setIsExpanded] = useState(true);

  // 返信フォーム
  const [replyBody, setReplyBody] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [replyFeedback, setReplyFeedback] = useState<string | null>(null);

  // 自動スクロール用
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------
  // 当該注文のスレッド特定（type='order' 一覧を取得して orderId で絞り込み）
  // 1注文1スレッド保証（UNIQUE 制約）のため最大1件
  // -------------------------------------------------
  const loadMatchedInquiry = useCallback(async () => {
    setIsLoadingList(true);
    setLoadError(null);
    try {
      const list = await fetchAdminInquiries({ type: 'order', limit: 200 });
      const matched = list.find((i) => i.orderId === orderId) ?? null;
      setMatchedInquiry(matched);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'お問い合わせの取得に失敗しました'
      );
      setMatchedInquiry(null);
    } finally {
      setIsLoadingList(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadMatchedInquiry();
  }, [loadMatchedInquiry]);

  // -------------------------------------------------
  // スレッド詳細取得（展開時・初回のみ）
  // -------------------------------------------------
  const loadDetail = useCallback(async () => {
    if (!matchedInquiry) return;
    setIsLoadingDetail(true);
    try {
      const data = await fetchAdminInquiry(matchedInquiry.id);
      setDetail(data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'スレッドの取得に失敗しました'
      );
    } finally {
      setIsLoadingDetail(false);
    }
  }, [matchedInquiry]);

  useEffect(() => {
    if (isExpanded && matchedInquiry && !detail && !isLoadingDetail) {
      loadDetail();
    }
  }, [isExpanded, matchedInquiry, detail, isLoadingDetail, loadDetail]);

  // スレッド末尾へスクロール（メッセージ追加時）
  useEffect(() => {
    if (isExpanded && detail && detail.messages.length > 0) {
      scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [detail?.messages.length, isExpanded]);

  // -------------------------------------------------
  // 展開トグル
  // -------------------------------------------------
  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
    setSendError(null);
    setReplyFeedback(null);
  };

  // -------------------------------------------------
  // 管理者返信送信
  // -------------------------------------------------
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedInquiry) return;
    setSendError(null);
    setReplyFeedback(null);

    const trimmed = replyBody.trim();
    if (!trimmed) {
      setSendError('回答本文を入力してください');
      return;
    }
    if (trimmed.length > REPLY_BODY_MAX) {
      setSendError(`回答本文は${REPLY_BODY_MAX}文字以内で入力してください`);
      return;
    }

    setIsSending(true);
    try {
      const created = await createAdminReply(matchedInquiry.id, trimmed, replyAttachments);

      // スレッドへ回答を追加（detail が未取得なら再取得）
      if (detail) {
        setDetail((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...prev.messages, created],
            inquiry: created.statusTransitioned
              ? { ...prev.inquiry, status: 'responded', respondedAt: new Date().toISOString() }
              : prev.inquiry,
          };
        });
      } else {
        await loadDetail();
      }

      // 一覧側のステータスも更新（折りたたみ概要に反映）
      if (created.statusTransitioned && matchedInquiry) {
        setMatchedInquiry({
          ...matchedInquiry,
          status: 'responded',
          respondedAt: new Date().toISOString(),
        });
      }

      setReplyBody('');
      setReplyAttachments([]);

      // フィードバック
      const parts: string[] = ['回答を送信しました'];
      if (created.statusTransitioned) {
        parts.push('ステータスを「返信済」に更新しました');
      }
      if (!created.emailSent) {
        parts.push('（会員への通知メール送信に失敗しました）');
      }
      setReplyFeedback(parts.join('・'));
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : '回答の送信に失敗しました'
      );
    } finally {
      setIsSending(false);
    }
  };

  // =====================================================
  // Derived
  // =====================================================

  /** 折りたたみ概要に表示する最終メッセージ本文 */
  const lastMessagePreview = (() => {
    if (!detail || detail.messages.length === 0) return null;
    const last = detail.messages[detail.messages.length - 1];
    const who = last.senderType === 'member' ? '会員' : '担当者';
    return `${who}: ${summarizeBody(last.body)}`;
  })();

  /** スレッド存在時の件名（注文番号から自動生成されたものと想定） */
  const threadSubject = matchedInquiry?.subject || `注文 ${orderNumber} のお問い合わせ`;

  const inquiryStatus = matchedInquiry?.status;

  // =====================================================
  // Render
  // =====================================================

  // ロード中（初回）
  if (isLoadingList && !matchedInquiry) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          お問い合わせを確認中...
        </div>
      </Card>
    );
  }

  // 一覧取得エラー
  if (loadError && !matchedInquiry) {
    return (
      <Card className="p-4 bg-red-50 border-red-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={loadMatchedInquiry}
              className="text-xs underline mt-1 text-red-700"
            >
              再読み込み
            </button>
          </div>
        </div>
      </Card>
    );
  }

  // スレッド未存在: 会員からの問い合わせなし（管理者は作成できない・閲覧+返信のみ）
  if (!matchedInquiry) {
    return (
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              この注文のお問い合わせ
            </h3>
            <p className="text-sm text-gray-500">
              会員からのお問い合わせはまだありません。会員が注文ページから問い合わせると、ここでチャットを確認・回答できます。
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // スレッド存在: 折りたたみチャット
  return (
    <Card className="overflow-hidden">
      {/* ヘッダ（折りたたみトグル） */}
      <button
        type="button"
        onClick={handleToggleExpand}
        className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                この注文のお問い合わせ
              </h3>
              {inquiryStatus && (
                <Badge
                  variant="secondary"
                  className={inquiryStatusBadgeClass[inquiryStatus] || inquiryStatusBadgeClass.open}
                >
                  {inquiryStatusLabels[inquiryStatus] || inquiryStatus}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {lastMessagePreview ? (
                <>{threadSubject} ・ {lastMessagePreview}</>
              ) : (
                <>{threadSubject}</>
              )}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
        )}
      </button>

      {/* 展開時: スレッド + 返信フォーム */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-5 space-y-5">
          {/* スレッド */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">スレッド</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {detail?.messages.length ?? 0} 件のメッセージ
                </span>
                <button
                  type="button"
                  onClick={loadDetail}
                  disabled={isLoadingDetail}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  title="再読み込み"
                  aria-label="スレッドを再読み込み"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingDetail ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                スレッドを読み込み中...
              </div>
            ) : loadError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">{loadError}</p>
                  <button
                    type="button"
                    onClick={loadDetail}
                    className="text-xs underline mt-1 text-red-700"
                  >
                    再読み込み
                  </button>
                </div>
              </div>
            ) : !detail || detail.messages.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-500">
                メッセージがありません
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {detail.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={scrollBottomRef} />
              </div>
            )}
          </div>

          {/* 返信フォーム */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">回答を送信</h4>

            {/* フィードバック（送信成功） */}
            {replyFeedback && (
              <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3 flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-green-800">{replyFeedback}</p>
              </div>
            )}

            {/* ステータス案内 */}
            {inquiryStatus && (inquiryStatus === 'resolved' || inquiryStatus === 'closed') && (
              <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3 flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-800">
                  このお問い合わせは「{inquiryStatusLabels[inquiryStatus]}」です。回答できますが、ステータスは維持されます。
                </p>
              </div>
            )}

            <form onSubmit={handleReply} className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor={`admin-order-inquiry-reply-${orderId}`}
                  className="text-sm font-medium text-gray-900"
                >
                  回答本文 <span className="text-red-600">*</span>
                </label>
                <textarea
                  id={`admin-order-inquiry-reply-${orderId}`}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  disabled={isSending}
                  rows={4}
                  placeholder="会員への回答を入力してください..."
                  maxLength={REPLY_BODY_MAX}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-y"
                />
                <div className="flex justify-end text-xs text-gray-500">
                  {replyBody.length} / {REPLY_BODY_MAX}
                </div>
              </div>

              {/* 添付アップロード（注文チャット用・100MB・デザインデータ AI/EPS/PSD/PS 可） */}
              <InquiryAttachmentUpload
                attachments={replyAttachments}
                onChange={setReplyAttachments}
                disabled={isSending}
                variant="order"
              />

              {/* 送信エラー */}
              {sendError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">{sendError}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSending || !replyBody.trim()}
                  className="flex items-center"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-1.5" />
                  )}
                  回答を送信
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}

export default AdminOrderInquirySection;
