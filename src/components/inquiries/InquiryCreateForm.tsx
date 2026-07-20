/**
 * InquiryCreateForm
 *
 * 新規お問い合わせ作成のフォーム本体（会員側）。
 *
 * `InquiryCreateModal`（/member/inquiries のモーダル）と
 * `OrderInquirySection`（/member/orders/[id] の埋め込みセクション）で共用するための
 * コンポーネント。Dialog ラッパーを持たず、純粋なフォームとして振る舞う（M6・二重実装回避）。
 *
 * 設計（POST /api/member/inquiries は multipart/form-data 受け取り）:
 * - テキストフィールド: 種別 + 件名 + 本文
 * - 添付ファイル: 画像 + PDF（一般・10MB）or 画像 + PDF + デザインデータ（注文チャット・100MB）
 * - プロフィール（氏名・email・会社・電話）は表示のみ・編集不可
 *
 * 注文チャットモード（prefillOrderId 設定時・hideSubjectAndType=true 推奨）:
 * - 種別='order' 固定・件名入力欄を非表示（サーバー側で件名は自動生成）
 * - 添付は 'order' variant（100MB・デザインデータ可）を使用
 * - 409 受領時は onConflict(existingInquiryId) を呼ぶ → 親は既存スレッドを展開
 *
 * @client
 */

'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Loader2, Send } from 'lucide-react';
import type { Inquiry, InquiryType } from '@/types/dashboard';
import {
  createInquiry,
  InquiryConflictError,
} from '@/lib/api/member/inquiries';
import { InquiryAttachmentUpload } from './InquiryAttachmentUpload';

// =====================================================
// Shared Types
// =====================================================

/**
 * 新規作成フォームのプロフィール表示用サマリ（page.tsx で取得・親経由で受け渡し）
 */
export interface MemberProfileSummary {
  /** 氏名（kanji_last + kanji_first・未設定時は空文字列） */
  fullName: string;
  /** メールアドレス */
  email: string;
  /** 会社名（任意） */
  companyName?: string;
  /** 電話番号（corporate_phone || personal_phone・任意） */
  phone?: string;
}

// =====================================================
// Constants
// =====================================================

const inquiryTypeOptions: { value: InquiryType; label: string }[] = [
  { value: 'product', label: '商品について' },
  { value: 'quotation', label: '見積もり' },
  { value: 'sample', label: 'サンプル' },
  { value: 'order', label: '注文' },
  { value: 'billing', label: '請求' },
  { value: 'technical', label: '技術' },
  { value: 'sales', label: '営業' },
  { value: 'support', label: 'サポート' },
  { value: 'general', label: '一般' },
  { value: 'other', label: 'その他' },
];

const SUBJECT_MAX = 200;
const MESSAGE_MAX = 5000;

// =====================================================
// Component
// =====================================================

export interface InquiryCreateFormProps {
  /** プロフィール（page.tsx で取得）・未渡時は情報表示セクションを省略 */
  profile?: MemberProfileSummary;
  /** 種別の初期値（デフォルト 'product'） */
  prefillType?: InquiryType;
  /** 注文チャットモード: orderId を設定すると type='order' で送信・添付は 'order' variant */
  prefillOrderId?: string;
  /** 種別 select・件名 input を非表示（注文チャットモード・件名はサーバー側で自動生成） */
  hideSubjectAndType?: boolean;
  /** 作成成功時に呼ばれる（親で一覧へ先頭挿入・スレッド表示切替等） */
  onCreated: (inquiry: Inquiry) => void;
  /** 409（注文チャット重複）受領時に呼ばれる・existingInquiryId で既存スレッドを展開 */
  onConflict?: (existingInquiryId: string | null) => void;
  /** キャンセルボタン押下時（モーダルでは閉じる・セクションでは省略可） */
  onCancel?: () => void;
  /** 送信ボタンのラベル（デフォルト '送信'） */
  submitLabel?: string;
  /** キャンセルボタンを表示するか（モーダル=true・セクション=false） */
  showCancelButton?: boolean;
}

export function InquiryCreateForm({
  profile,
  prefillType = 'product',
  prefillOrderId,
  hideSubjectAndType = false,
  onCreated,
  onConflict,
  onCancel,
  submitLabel = '送信',
  showCancelButton = true,
}: InquiryCreateFormProps) {
  const isOrderMode = Boolean(prefillOrderId);
  const [type, setType] = useState<InquiryType>(isOrderMode ? 'order' : prefillType);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // クライアント側の軽量バリデーション（サーバー側でも再検証される）
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    const nextFieldErrors: Record<string, string> = {};
    // 注文チャットモードでは件名入力不要（サーバー側で自動生成）・一般モードのみ検証
    if (!isOrderMode) {
      if (!trimmedSubject) {
        nextFieldErrors.subject = '件名を入力してください';
      } else if (trimmedSubject.length > SUBJECT_MAX) {
        nextFieldErrors.subject = `件名は${SUBJECT_MAX}文字以内で入力してください`;
      }
    }
    if (!trimmedMessage) {
      nextFieldErrors.message = 'お問い合わせ内容を入力してください';
    } else if (trimmedMessage.length > MESSAGE_MAX) {
      nextFieldErrors.message = `お問い合わせ内容は${MESSAGE_MAX}文字以内で入力してください`;
    }
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createInquiry({
        type: isOrderMode ? 'order' : type,
        // 注文チャットモードでは件名はサーバー側で自動生成されるが、Zod min(1) を満たすためダミーを送信
        // （サーバー側で orderContext により上書きされる・AC-API-1）
        subject: isOrderMode ? '（注文チャット・自動生成）' : trimmedSubject,
        message: trimmedMessage,
        orderId: prefillOrderId,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      // 成功後は親へ通知 → モーダルは閉じる・セクションはスレッド表示へ切替
      onCreated(created);
    } catch (err) {
      if (err instanceof InquiryConflictError) {
        // 409: 既存スレッドがある → 親へ existingInquiryId を渡して展開
        if (onConflict) {
          onConflict(err.existingInquiryId);
        } else {
          setError(err.message);
        }
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : 'お問い合わせの作成に失敗しました。しばらくしてからもう一度お試しください。'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 送信ボタンの disabled 条件: 注文チャットは本文のみ必須・一般は件名+本文
  const canSubmit = isOrderMode
    ? message.trim().length > 0
    : subject.trim().length > 0 && message.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* プロフィール表示（参照用・編集不可） */}
      {profile && (
        <div className="rounded-lg border border-border-secondary bg-bg-secondary p-3 space-y-1.5">
          <p className="text-xs font-medium text-text-muted">
            お客様情報（プロフィールから自動取得・送信時にDBへ保存されます）
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-text-muted">氏名</dt>
            <dd className="text-text-primary">{profile.fullName || '（未設定）'}</dd>
            <dt className="text-text-muted">メール</dt>
            <dd className="text-text-primary break-all">{profile.email || '（未設定）'}</dd>
            {profile.companyName && (
              <>
                <dt className="text-text-muted">会社名</dt>
                <dd className="text-text-primary">{profile.companyName}</dd>
              </>
            )}
            {profile.phone && (
              <>
                <dt className="text-text-muted">電話番号</dt>
                <dd className="text-text-primary">{profile.phone}</dd>
              </>
            )}
          </dl>
          <p className="text-xs text-text-muted">※変更はプロフィール設定から行ってください</p>
        </div>
      )}

      {/* 種別（注文チャットモードでは非表示・type='order' で送信） */}
      {!hideSubjectAndType && (
        <div className="space-y-1.5">
          <label htmlFor="inquiry-type" className="text-sm font-medium text-text-primary">
            種別
          </label>
          <select
            id="inquiry-type"
            value={type}
            onChange={(e) => setType(e.target.value as InquiryType)}
            disabled={isSubmitting}
            className="w-full appearance-none bg-bg-secondary border border-border-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          >
            {inquiryTypeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 件名（注文チャットモードでは非表示・サーバー側で「注文 {orderNumber} のお問い合わせ」を自動生成） */}
      {!hideSubjectAndType && (
        <div className="space-y-1.5">
          <label htmlFor="inquiry-subject" className="text-sm font-medium text-text-primary">
            件名 <span className="text-red-600">*</span>
          </label>
          <Input
            id="inquiry-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSubmitting}
            placeholder="お問い合わせの件名"
            maxLength={SUBJECT_MAX}
          />
          <div className="flex justify-between text-xs">
            <span className="text-red-600">{fieldErrors.subject}</span>
            <span className="text-text-muted">
              {subject.length} / {SUBJECT_MAX}
            </span>
          </div>
        </div>
      )}

      {/* 本文 */}
      <div className="space-y-1.5">
        <label htmlFor="inquiry-message" className="text-sm font-medium text-text-primary">
          お問い合わせ内容 <span className="text-red-600">*</span>
        </label>
        <textarea
          id="inquiry-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSubmitting}
          rows={isOrderMode ? 4 : 6}
          placeholder={
            isOrderMode
              ? 'この注文について質問したい内容をご記入ください'
              : 'お問い合わせ内容を詳しくご記入ください'
          }
          maxLength={MESSAGE_MAX}
          className="w-full bg-bg-secondary border border-border-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 resize-y"
        />
        <div className="flex justify-between text-xs">
          <span className="text-red-600">{fieldErrors.message}</span>
          <span className="text-text-muted">
            {message.length} / {MESSAGE_MAX}
          </span>
        </div>
      </div>

      {/* 添付ファイル */}
      <InquiryAttachmentUpload
        attachments={attachments}
        onChange={setAttachments}
        variant={isOrderMode ? 'order' : 'general'}
        disabled={isSubmitting}
      />

      {/* 全体エラー */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20 p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* アクション */}
      <div className="flex justify-end gap-2">
        {showCancelButton && onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting || !canSubmit}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default InquiryCreateForm;
