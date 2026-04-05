/**
 * QuotationCard Component
 *
 * 見積もりカードコンポーネント
 *
 * 見積もり一つを表示するカード
 * ステータスバッジ、仕様プレビュー、PDFダウンロード、詳細表示ボタンを含む
 *
 * @module components/quotations/QuotationCard
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { QuotationStatusBadge } from './StatusBadge';
import { SpecificationDisplay } from './SpecificationDisplay';
import { Download, FileText, Trash2, ChevronRight } from 'lucide-react';
import type { Quotation } from '@/types/entities';

export interface QuotationCardProps {
  /** 見積もりデータ */
  quotation: Quotation;
  /** 管理者モード */
  isAdmin?: boolean;
  /** PDFダウンロード中の見積もりID */
  downloadingQuoteId?: string | null;
  /** 削除中の見積もりID */
  deletingQuoteId?: string | null;
  /** PDFダウンロードハンドラー */
  onDownload?: (id: string) => void;
  /** 削除ハンドラー */
  onDelete?: (id: string) => void;
  /** 詳細表示ハンドラー */
  onViewDetails?: (quotation: Quotation) => void;
  /** 注文変換ハンドラー */
  onConvertToOrder?: (quotation: Quotation) => void;
  /** コンパクト表示 */
  compact?: boolean;
  /** ステータスメッセージを表示 */
  showStatusMessage?: boolean;
  /** 言語 */
  locale?: 'ja' | 'en';
}

/**
 * ステータスメッセージを取得
 */
function getStatusMessage(
  status: string,
  locale: 'ja' | 'en'
): { message: string; type: 'info' | 'success' | 'warning' | 'error' } | null {
  const messages: Record<string, { ja: string; en: string; type: 'info' | 'success' | 'warning' | 'error' }> = {
    'DRAFT': {
      ja: '現在、管理者による内容確認中です',
      en: 'Currently under review by administrator',
      type: 'info'
    },
    'QUOTATION_PENDING': {
      ja: '現在、管理者による内容確認中です',
      en: 'Currently under review by administrator',
      type: 'info'
    },
    'APPROVED': {
      ja: '管理者の承認が完了しました',
      en: 'Approved by administrator',
      type: 'success'
    },
    'QUOTATION_APPROVED': {
      ja: '管理者の承認が完了しました',
      en: 'Approved by administrator',
      type: 'success'
    },
    'REJECTED': {
      ja: 'この見積もりは拒否されました',
      en: 'This quotation has been rejected',
      type: 'error'
    },
    'EXPIRED': {
      ja: 'この見積もりの有効期限が切れています',
      en: 'This quotation has expired',
      type: 'warning'
    }
  };

  const statusUpper = status.toUpperCase();
  const msg = messages[statusUpper];

  if (!msg) return null;

  return {
    message: locale === 'ja' ? msg.ja : msg.en,
    type: msg.type
  };
}

/**
 * QuotationCard コンポーネント
 */
export function QuotationCard({
  quotation,
  isAdmin = false,
  downloadingQuoteId = null,
  deletingQuoteId = null,
  onDownload,
  onDelete,
  onViewDetails,
  onConvertToOrder,
  compact = false,
  showStatusMessage = true,
  locale = 'ja'
}: QuotationCardProps) {
  const statusMessage = showStatusMessage ? getStatusMessage(quotation.status, locale) : null;

  // タイトルエリア
  const renderHeader = () => (
    <div className="flex items-center gap-2 mb-2">
      <span className="font-medium text-text-primary">
        {quotation.quotation_number}
      </span>
      <QuotationStatusBadge
        status={quotation.status}
        size="sm"
        isAdmin={isAdmin}
      />
    </div>
  );

  // ステータスメッセージ
  const renderStatusMessage = () => {
    if (!statusMessage) return null;

    const colorClasses = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    };

    const icons = {
      info: '⏳',
      success: '✓',
      warning: '⚠',
      error: '✕'
    };

    return (
      <div className={`mb-3 p-3 border rounded-lg ${colorClasses[statusMessage.type]}`}>
        <div className="flex items-start gap-2">
          <span className="text-lg">{icons[statusMessage.type]}</span>
          <p className="text-sm font-medium">
            {statusMessage.message}
          </p>
        </div>
      </div>
    );
  };

  // 詳細情報
  const renderDetails = () => {
    if (compact) return null;

    return (
      <div className="space-y-3">
        {/* 有効期限 */}
        {quotation.valid_until && (
          <p className="text-sm text-text-muted">
            {locale === 'ja' ? '有効期限:' : 'Valid until:'}{' '}
            <span className="text-text-primary">
              {new Date(quotation.valid_until).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US')}
            </span>
          </p>
        )}

        {/* 金額 */}
        <p className="text-sm text-text-muted">
          {locale === 'ja' ? '合計金額:' : 'Total:'}{' '}
          <span className="text-text-primary font-semibold">
            ¥{quotation.total_amount?.toLocaleString() || quotation.subtotal?.toLocaleString() || 0}
            {locale === 'ja' ? '円' : ''}
          </span>
        </p>

        {/* 仕様プレビュー */}
        {quotation.items && quotation.items.length > 0 && (
          <div className="mt-3">
            <SpecificationDisplay
              item={quotation.items[0]}
              locale={locale}
              compact={true}
            />
          </div>
        )}
      </div>
    );
  };

  // アクションボタン
  const renderActions = () => (
    <div className="flex gap-2 mt-4">
      {/* PDFダウンロード */}
      {onDownload && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDownload(quotation.id)}
          disabled={downloadingQuoteId === quotation.id}
          className="group/btn"
        >
          <Download className={`w-4 h-4 mr-1.5 transition-transform ${
            downloadingQuoteId === quotation.id ? 'animate-spin' : 'group-hover/btn:scale-110'
          }`} />
          {downloadingQuoteId === quotation.id
            ? (locale === 'ja' ? 'PDF作成中...' : 'Creating PDF...')
            : (locale === 'ja' ? 'PDFダウンロード' : 'Download PDF')
          }
        </Button>
      )}

      {/* 詳細表示 */}
      {onViewDetails && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(quotation)}
          className="group/btn"
        >
          <FileText className="w-4 h-4 mr-1.5 group-hover/btn:scale-110" />
          {locale === 'ja' ? '詳細' : 'Details'}
          <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
        </Button>
      )}

      {/* 削除ボタン - DRAFT/QUOTATION_PENDING のみ */}
      {onDelete && (
        (quotation.status === 'DRAFT' || quotation.status === 'QUOTATION_PENDING') && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(quotation.id)}
            disabled={deletingQuoteId === quotation.id}
            className="group/btn"
          >
            <Trash2 className={`w-4 h-4 mr-1.5 transition-transform ${
              deletingQuoteId === quotation.id ? 'animate-pulse' : 'group-hover/btn:scale-110'
            }`} />
            {deletingQuoteId === quotation.id
              ? (locale === 'ja' ? '削除中...' : 'Deleting...')
              : (locale === 'ja' ? '削除' : 'Delete')
            }
          </Button>
        )
      )}

      {/* 注文変換ボタン - APPROVED/QUOTATION_APPROVED のみ */}
      {onConvertToOrder && isAdmin && (
        (quotation.status === 'APPROVED' || quotation.status === 'QUOTATION_APPROVED') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onConvertToOrder(quotation)}
            className="group/btn"
          >
            <ChevronRight className="w-4 h-4 mr-1.5 group-hover/btn:scale-110" />
            {locale === 'ja' ? '注文に変換' : 'Convert to Order'}
          </Button>
        )
      )}
    </div>
  );

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      {renderHeader()}
      {renderStatusMessage()}
      {renderDetails()}
      {renderActions()}
    </Card>
  );
}

export default QuotationCard;
