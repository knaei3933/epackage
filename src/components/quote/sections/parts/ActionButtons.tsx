/**
 * Action buttons section for ResultStep.
 */

import { RefreshCw, Download, List, ShoppingCart, Printer, Pencil } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/Button';

interface ActionButtonsProps {
  userId?: string | null;
  quotationId: string | null;
  onReset: () => void;
  /** 入力に戻って、条件を変えて計算し直す（入力は消さない） */
  onEdit?: () => void;
  handleDownloadPdf: () => void;
  isGeneratingPdf: boolean;
  pdfStatus: 'idle' | 'success' | 'error';
  showPatternComparison: boolean;
  multiQuantityQuotesLength: number;
  /** 注文ボタン押下時のコールバック（親 ResultStep が同意モーダルを開く）。直接 fetch は廃止。 */
  onRequestOrder: () => void;
  /** 注文確定処理中フラグ（同意モーダルの送信中）。ボタン disabled 制御に使用。 */
  isOrdering?: boolean;
}

export function ActionButtons({
  userId,
  quotationId,
  onReset,
  onEdit,
  handleDownloadPdf,
  isGeneratingPdf,
  pdfStatus,
  showPatternComparison,
  multiQuantityQuotesLength,
  onRequestOrder,
  isOrdering = false,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 print:hidden">
      {/* 注文ボタン（会員限定） */}
      {/* Phase C0: 直接 fetch を廃止。親 ResultStep 所有の OrderConsentModal を開く。 */}
      {userId && quotationId && (
        <Button size="lg" onClick={onRequestOrder} disabled={isOrdering}>
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {isOrdering ? '処理中...' : 'この内容で注文'}
        </Button>
      )}

      {onEdit && (
        <Button size="lg" variant="secondary" onClick={onEdit}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
          条件を変えて再計算
        </Button>
      )}

      <Button size="lg" variant="secondary" onClick={() => window.print()}>
        <Printer className="h-4 w-4" aria-hidden="true" />
        印刷
      </Button>

      <Button
        size="lg"
        variant="secondary"
        onClick={() => {
          if (window.confirm('新しい見積もりを作成します。現在の入力内容はリセットされます。よろしいですか？')) {
            onReset();
          }
        }}
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        新しい見積もり
      </Button>

      {/* 見積一覧リンク（認証済みのみ） */}
      {userId && (
        <Link href="/member/quotations" className={buttonVariants({ size: 'lg', variant: 'secondary' })}>
          <List className="h-4 w-4" aria-hidden="true" />
          見積一覧
        </Link>
      )}

      <Button size="lg" variant="outline" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
        {isGeneratingPdf ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            PDF生成中...
          </>
        ) : pdfStatus === 'success' ? (
          <>
            <Download className="h-4 w-4" aria-hidden="true" />
            ダウンロード完了（自動保存済み）
          </>
        ) : pdfStatus === 'error' ? (
          <>
            <Download className="h-4 w-4" aria-hidden="true" />
            失敗しました。もう一度押してください
          </>
        ) : (
          <>
            <Download className="h-4 w-4" aria-hidden="true" />
            {showPatternComparison && multiQuantityQuotesLength > 0
              ? `全パターンPDFダウンロード（${multiQuantityQuotesLength}パターン・自動保存）`
              : 'PDFダウンロード（自動保存）'}
          </>
        )}
      </Button>

      {/* 未認証ユーザー向け会員登録促進メッセージ */}
      {!userId && (
        <div className="mt-6 w-full rounded-container border border-border-medium bg-warning-muted p-4">
          <p className="font-semibold text-on-warning-muted">この見積もりを保存するには、会員登録が必要です</p>
          <p className="mt-1 text-sm text-on-warning-muted">
            会員登録（無料）をすると、見積もりの履歴を保存・管理できます。専任の担当者から、ご連絡することもできます。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/auth/register?redirect=/quote-simulator" className={buttonVariants({ variant: 'primary' })}>
              今すぐ会員登録
            </Link>
            <Link href="/auth/signin?redirect=/quote-simulator" className={buttonVariants({ variant: 'secondary' })}>
              ログイン
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
