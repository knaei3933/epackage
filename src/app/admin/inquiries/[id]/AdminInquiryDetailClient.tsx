/**
 * Admin Inquiry Detail Client Component
 *
 * お問い合わせ詳細（管理者） - Client Component
 *
 * 機能:
 * - inquiry 本体表示（顧客情報・ステータス・種別・件名・本文）
 * - スレッド表示（inquiry_messages・member/admin で左右振り分け・送信者の役職を併記）
 * - 添付ファイル表示（画像サムネイル・PDF ダウンロードリンク・signed URL 使用）
 * - 回答フォーム（本文 + 添付・POST multipart・サーバー側で status 自動遷移 + 会員へ通知メール）
 *
 * 管理者は close/reopen 操作を持たない（管理者 API に該当 endpoint なし）。
 * 回答送信で status が open/in_progress の場合は responded へ自動遷移する。
 *
 * @client
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Card,
  Button,
  Badge,
} from '@/components/ui';
import { PageLoadingState } from '@/components/ui';
import {
  Loader2,
  Send,
  FileText,
  Image as ImageIcon,
  Download,
  AlertCircle,
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  User,
  CheckCircle,
  Info,
  Package,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type {
  AdminInquiryDetail,
  AdminInquiryMessage,
  InquiryStatus,
  InquiryType,
} from '@/types/dashboard';
import {
  fetchAdminInquiry,
  createAdminReply,
} from '@/lib/api/admin/inquiries';
import { InquiryAttachmentUpload } from '@/components/inquiries/InquiryAttachmentUpload';

// =====================================================
// Constants
// =====================================================

const REPLY_BODY_MAX = 10000; // サーバー側 MESSAGE_BODY_MAX_LENGTH に整合

const inquiryTypeLabels: Record<InquiryType, string> = {
  product: '商品について',
  quotation: '見積もり',
  sample: 'サンプル',
  order: '注文',
  billing: '請求',
  other: 'その他',
  general: '一般',
  technical: '技術',
  sales: '営業',
  support: 'サポート',
};

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
  const roleLabel = message.senderRole ? senderRoleLabels[message.senderRole] || message.senderRole : null;

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

export interface AdminInquiryDetailClientProps {
  inquiryId: string;
}

export default function AdminInquiryDetailClient({
  inquiryId,
}: AdminInquiryDetailClientProps) {
  const [detail, setDetail] = useState<AdminInquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [replyBody, setReplyBody] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [replyFeedback, setReplyFeedback] = useState<string | null>(null);

  // 自動スクロール用
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const loadDetail = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAdminInquiry(inquiryId);
      setDetail(data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'お問い合わせの取得に失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  }, [inquiryId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // スレッド末尾へスクロール（初回読込 + メッセージ追加時）
  useEffect(() => {
    if (!isLoading && detail) {
      scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [detail?.messages.length, isLoading]);

  // -------------------------------------------------
  // 回答送信
  // -------------------------------------------------

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
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
      const created = await createAdminReply(inquiryId, trimmed, replyAttachments);

      // スレッドへ回答を追加
      setDetail((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, created],
          // status 自動遷移があった場合は反映（open/in_progress → responded）
          inquiry:
            created.statusTransitioned
              ? { ...prev.inquiry, status: 'responded', respondedAt: new Date().toISOString() }
              : prev.inquiry,
        };
      });

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
  // Render
  // =====================================================

  if (isLoading && !detail) {
    return (
      <PageLoadingState isLoading={true} error={null} message="お問い合わせを読み込み中..." />
    );
  }

  if (loadError || !detail) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/admin/inquiries"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            お問い合わせ一覧へ戻る
          </Link>
          <Card className="p-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-gray-900 font-medium">
                  {loadError || 'お問い合わせが見つかりません'}
                </p>
                <button
                  type="button"
                  onClick={loadDetail}
                  className="text-sm text-blue-600 hover:text-blue-800 underline mt-2"
                >
                  再読み込み
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const { inquiry, messages } = detail;

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 戻るリンク */}
        <Link
          href="/admin/inquiries"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          お問い合わせ一覧へ戻る
        </Link>

        {/* inquiry 本体 */}
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">
                {inquiry.inquiryNumber || inquiry.id.slice(0, 8)}
              </h1>
              <Badge
                variant="secondary"
                className={inquiryStatusBadgeClass[inquiry.status] || inquiryStatusBadgeClass.open}
              >
                {inquiryStatusLabels[inquiry.status] || inquiry.status}
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                {inquiryTypeLabels[inquiry.type] || inquiry.type}
              </Badge>
              {inquiry.orderId && inquiry.orderNumber && (
                <Link
                  href={`/admin/orders/${inquiry.orderId}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-full transition-colors"
                  title={`注文 ${inquiry.orderNumber} の詳細へ`}
                >
                  <Package className="w-3.5 h-3.5" />
                  注文: {inquiry.orderNumber}
                </Link>
              )}
            </div>
            <div className="text-sm text-gray-500">
              受付: {format(new Date(inquiry.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
            </div>
          </div>

          {/* 件名 */}
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {inquiry.subject || '（件名なし）'}
          </h2>

          {/* 本文 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {inquiry.message}
            </p>
          </div>

          {/* 顧客情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{inquiry.customerName || '（名前未設定）'}</span>
              {inquiry.customerNameKana && (
                <span className="text-gray-500">（{inquiry.customerNameKana}）</span>
              )}
            </div>
            {inquiry.companyName && (
              <div className="flex items-center gap-2 text-gray-700">
                <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{inquiry.companyName}</span>
              </div>
            )}
            {inquiry.email && (
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <a
                  href={`mailto:${inquiry.email}`}
                  className="text-blue-600 hover:text-blue-800 break-all"
                >
                  {inquiry.email}
                </a>
              </div>
            )}
            {inquiry.phone && (
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{inquiry.phone}</span>
              </div>
            )}
          </div>
        </Card>

        {/* スレッド */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">スレッド</h3>
            <span className="text-sm text-gray-500">{messages.length} 件のメッセージ</span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                メッセージがありません
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={scrollBottomRef} />
              </>
            )}
          </div>
        </Card>

        {/* 回答フォーム */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">回答を送信</h3>

          {/* フィードバック（送信成功） */}
          {replyFeedback && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-green-800">{replyFeedback}</p>
            </div>
          )}

          {/* ステータス案内 */}
          {(inquiry.status === 'resolved' || inquiry.status === 'closed') && (
            <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-800">
                このお問い合わせは「{inquiryStatusLabels[inquiry.status]}」です。回答できますが、ステータスは維持されます。
              </p>
            </div>
          )}

          <form onSubmit={handleReply} className="space-y-3">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-reply-body"
                className="text-sm font-medium text-gray-900"
              >
                回答本文 <span className="text-red-600">*</span>
              </label>
              <textarea
                id="admin-reply-body"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                disabled={isSending}
                rows={5}
                placeholder="会員への回答を入力してください..."
                maxLength={REPLY_BODY_MAX}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 resize-y"
              />
              <div className="flex justify-end text-xs text-gray-500">
                {replyBody.length} / {REPLY_BODY_MAX}
              </div>
            </div>

            {/* 添付アップロード */}
            <InquiryAttachmentUpload
              attachments={replyAttachments}
              onChange={setReplyAttachments}
              disabled={isSending}
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
        </Card>
      </div>
    </div>
  );
}
