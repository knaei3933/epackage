/**
 * InquiryThread
 *
 * お問い合わせスレッド（会員側・展開時表示）
 *
 * 機能:
 * - inquiry_messages の時系列表示（member/admin で左右振り分け・吹き出し色で区別）
 * - 添付ファイル表示（画像はサムネイル・PDF はダウンロードリンク・signed URL 使用）
 * - close / reopen ボタン（status に応じて切替）
 * - 追記フォーム（本文 + 添付・POST multipart）
 *
 * legacy inquiries.response 列は表示しない（新フローは inquiry_messages のみ）。
 *
 * @client
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui';
import {
  Loader2,
  Send,
  FileText,
  Image as ImageIcon,
  Download,
  Lock,
  RotateCcw,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Inquiry, InquiryMessage, InquiryStatus } from '@/types/dashboard';
import {
  fetchInquiryMessages,
  createInquiryMessage,
  updateInquiryStatus,
} from '@/lib/api/member/inquiries';
import { InquiryAttachmentUpload } from './InquiryAttachmentUpload';

// =====================================================
// Constants
// =====================================================

const REPLY_BODY_MAX = 5000;

/** 追記フォームを表示するステータス（resolved / closed は再オープン後に追記可能） */
const REPLYABLE_STATUSES: InquiryStatus[] = ['pending', 'open', 'in_progress', 'responded'];

/** クローズ操作可能ステータス（会員が「解決済み」にできる） */
const CLOSEABLE_STATUSES: InquiryStatus[] = ['pending', 'open', 'in_progress', 'responded'];

/** 再オープン対象ステータス */
const REOPENABLE_STATUSES: InquiryStatus[] = ['resolved', 'closed'];

// =====================================================
// Helpers
// =====================================================

/** 画像系 MIME か（サムネイル表示判定） */
function isImageMime(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/** PDF か */
function isPdfMime(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}

/** ファイルサイズを読みやすい形式に */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// =====================================================
// Sub-components
// =====================================================

/**
 * 添付ファイル表示（画像サムネイル or PDFダウンロードリンク）
 * signed URL（GET messages で返却）を使用・バケットは private で直接 URL アクセス不可
 */
function AttachmentItem({
  attachment,
  align,
}: {
  attachment: InquiryMessage['attachments'][number];
  align: 'left' | 'right';
}) {
  const fileName = attachment.file_name || '添付ファイル';

  if (isImageMime(attachment.mime_type)) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mt-1.5 rounded-lg overflow-hidden border border-border-secondary hover:opacity-90 transition-opacity"
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

  // PDF 等のドキュメントはダウンロードリンク
  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName}
      className={`mt-1.5 inline-flex items-center gap-2 rounded-lg border border-border-secondary px-2.5 py-1.5 text-xs hover:bg-bg-secondary transition-colors ${
        align === 'right' ? 'bg-white/10 text-white' : 'bg-bg-secondary text-text-primary'
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

/**
 * 個別メッセージの吹き出し
 * - senderType='member': 右側・primary 系
 * - senderType='admin': 左側・muted 系
 */
function MessageBubble({ message }: { message: InquiryMessage }) {
  const isMember = message.senderType === 'member';
  const align = isMember ? 'right' : 'left';
  const senderLabel = isMember
    ? message.senderName || 'あなた'
    : message.senderName
      ? `担当者（${message.senderName}）`
      : '担当者';

  return (
    <div className={`flex ${isMember ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isMember ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* 送信者名 + 日時 */}
        <div
          className={`flex items-center gap-1.5 mb-0.5 text-xs text-text-muted ${
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
              ? 'bg-primary text-white rounded-br-sm'
              : 'bg-bg-secondary text-text-primary border border-border-secondary rounded-bl-sm'
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

export interface InquiryThreadProps {
  inquiry: Inquiry;
  /** ステータス変更成功時に親へ通知（親で一覧の inquiry.status を更新） */
  onStatusChange: (inquiryId: string, nextStatus: InquiryStatus) => void;
}

export function InquiryThread({ inquiry, onStatusChange }: InquiryThreadProps) {
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [replyBody, setReplyBody] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const [isToggling, setIsToggling] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  // 自動スクロール用（追記送信後に最新へ）
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchInquiryMessages(inquiry.id);
      setMessages(data);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'メッセージの取得に失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  }, [inquiry.id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // メッセージ取得完了後に末尾へスクロール
  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isLoading]);

  // -------------------------------------------------
  // 追記送信
  // -------------------------------------------------

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError(null);

    const trimmed = replyBody.trim();
    if (!trimmed) {
      setSendError('メッセージ本文を入力してください');
      return;
    }
    if (trimmed.length > REPLY_BODY_MAX) {
      setSendError(`メッセージ本文は${REPLY_BODY_MAX}文字以内で入力してください`);
      return;
    }

    setIsSending(true);
    try {
      const created = await createInquiryMessage(inquiry.id, trimmed, replyAttachments);
      setMessages((prev) => [...prev, created]);
      setReplyBody('');
      setReplyAttachments([]);
    } catch (err) {
      setSendError(
        err instanceof Error ? err.message : 'メッセージの送信に失敗しました'
      );
    } finally {
      setIsSending(false);
    }
  };

  // -------------------------------------------------
  // close / reopen
  // -------------------------------------------------

  const handleToggleStatus = async (action: 'close' | 'reopen') => {
    setStatusError(null);
    setIsToggling(true);
    try {
      const result = await updateInquiryStatus(inquiry.id, action);
      onStatusChange(inquiry.id, result.status);
    } catch (err) {
      setStatusError(
        err instanceof Error ? err.message : 'ステータスの更新に失敗しました'
      );
    } finally {
      setIsToggling(false);
    }
  };

  // =====================================================
  // Derived
  // =====================================================

  const canReply = REPLYABLE_STATUSES.includes(inquiry.status);
  const canClose = CLOSEABLE_STATUSES.includes(inquiry.status);
  const canReopen = REOPENABLE_STATUSES.includes(inquiry.status);

  // 添付種別: 注文チャット（orderId あり）は order（100MB・デザインデータ可）・それ以外は general（10MB・画像+PDF）
  // 一般 inquiry は自動的に general になり後方互換（InquiryAttachmentUpload のデフォルトと同義）
  const attachmentVariant: 'general' | 'order' = inquiry.orderId ? 'order' : 'general';

  // =====================================================
  // Render
  // =====================================================

  return (
    <div className="space-y-4">
      {/* スレッド表示 */}
      <div className="border border-border-secondary rounded-lg bg-bg-primary">
        <div className="px-4 py-2.5 border-b border-border-secondary flex items-center justify-between">
          <h4 className="text-sm font-medium text-text-primary">スレッド</h4>
          <span className="text-xs text-text-muted">{messages.length} 件のメッセージ</span>
        </div>

        <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-text-muted text-sm">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              読み込み中...
            </div>
          ) : loadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-700 dark:text-red-400">{loadError}</p>
                <button
                  type="button"
                  onClick={loadMessages}
                  className="text-xs underline mt-1 text-red-700 dark:text-red-400"
                >
                  再読み込み
                </button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-6 text-sm text-text-muted">
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
      </div>

      {/* ステータス変更ボタン + エラー */}
      {(canClose || canReopen) && (
        <div className="flex flex-wrap items-center gap-2">
          {canClose && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleToggleStatus('close')}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1.5" />
              )}
              解決済みにする
            </Button>
          )}
          {canReopen && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleToggleStatus('reopen')}
              disabled={isToggling}
            >
              {isToggling ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4 mr-1.5" />
              )}
              再オープンする
            </Button>
          )}
          {statusError && (
            <span className="text-xs text-red-600">{statusError}</span>
          )}
        </div>
      )}

      {/* 追記フォーム（resolved/closed は非表示・再オープン後に利用可能） */}
      {canReply ? (
        <form onSubmit={handleReply} className="space-y-3">
          <div className="space-y-1.5">
            <label
              htmlFor={`reply-${inquiry.id}`}
              className="text-sm font-medium text-text-primary"
            >
              追記メッセージ
            </label>
            <textarea
              id={`reply-${inquiry.id}`}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              disabled={isSending}
              rows={3}
              placeholder="担当者への返信や追加情報を入力してください"
              maxLength={REPLY_BODY_MAX}
              className="w-full bg-bg-secondary border border-border-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 resize-y"
            />
            <div className="flex justify-end text-xs text-text-muted">
              {replyBody.length} / {REPLY_BODY_MAX}
            </div>
          </div>

          {/* 添付アップロード */}
          <InquiryAttachmentUpload
            attachments={replyAttachments}
            onChange={setReplyAttachments}
            disabled={isSending}
            variant={attachmentVariant}
          />

          {/* 送信エラー */}
          {sendError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-3">
              <p className="text-sm text-red-700 dark:text-red-400">{sendError}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSending || !replyBody.trim()}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1.5" />
              )}
              送信
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border border-border-secondary bg-bg-secondary p-3 flex items-center gap-2 text-sm text-text-muted">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            このお問い合わせはクローズされています。追記する場合は「再オープンする」をご利用ください。
          </span>
        </div>
      )}
    </div>
  );
}

export default InquiryThread;
