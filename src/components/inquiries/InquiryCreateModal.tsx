/**
 * InquiryCreateModal
 *
 * 新規お問い合わせ作成モーダル（会員側・/member/inquiries 一覧から呼び出し）
 *
 * フォーム本体は `InquiryCreateForm` に抽出し、本コンポーネントは Dialog ラッパーとして機能。
 * `OrderInquirySection`（注文ページ埋め込み）とフォームを共用することで二重実装を回避（M6）。
 *
 * @client
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui';
import type { Inquiry } from '@/types/dashboard';
import { InquiryCreateForm } from './InquiryCreateForm';

// =====================================================
// Shared Types（後方互換のため再エクスポート）
// =====================================================

export type { MemberProfileSummary } from './InquiryCreateForm';

// =====================================================
// Component
// =====================================================

export interface InquiryCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** プロフィール（page.tsx で取得）・未渡時は情報表示セクションを省略 */
  profile?: import('./InquiryCreateForm').MemberProfileSummary;
  /** 作成成功時に呼ばれる（親で一覧へ先頭挿入等） */
  onCreated: (inquiry: Inquiry) => void;
}

export function InquiryCreateModal({
  open,
  onOpenChange,
  profile,
  onCreated,
}: InquiryCreateModalProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>新規お問い合わせ</DialogTitle>
          <DialogDescription>
            お問い合わせ内容を入力してください。送信後、スレッド形式で担当者とやり取りできます。
          </DialogDescription>
        </DialogHeader>

        <InquiryCreateForm
          profile={profile}
          onCreated={onCreated}
          onCancel={handleClose}
          submitLabel="送信"
          showCancelButton
        />
      </DialogContent>
    </Dialog>
  );
}

export default InquiryCreateModal;
