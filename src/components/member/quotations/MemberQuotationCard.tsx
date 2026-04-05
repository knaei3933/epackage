'use client';

import { Card, Badge } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Download, Eye, Trash2, FileText } from 'lucide-react';
import { MEMBER_STATUS_LABELS, MEMBER_STATUS_VARIANTS } from '@/constants/product-type-config';
import { formatPrice } from '@/utils/formatters';
import type { Quotation } from '@/types/entities';
import { QuotationActions } from './QuotationActions';

interface MemberQuotationCardProps {
  quotation: Quotation;
  downloadStats: {
    count: number;
    lastDownloadedAt: string | null;
  } | undefined;
  onViewDetails: (quotation: Quotation) => void;
  onDownloadPDF: (quotation: Quotation) => void;
  onDelete: (quotation: Quotation) => void;
  downloadingQuoteId: string | null;
  deletingQuoteId: string | null;
}

/**
 * MemberQuotationCard - メンバー用見積カードコンポーネント
 */
export function MemberQuotationCard({
  quotation,
  downloadStats,
  onViewDetails,
  onDownloadPDF,
  onDelete,
  downloadingQuoteId,
  deletingQuoteId,
}: MemberQuotationCardProps) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-text-primary">
              {quotation.quotationNumber}
            </h3>
            <Badge variant={MEMBER_STATUS_VARIANTS[quotation.status] || 'default'}>
              {MEMBER_STATUS_LABELS[quotation.status] || quotation.status}
            </Badge>
          </div>

          <div className="space-y-1 text-sm text-text-muted">
            <p>作成日: {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString('ja-JP') : '-'}</p>
            <p>
              有効期限: {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('ja-JP') : '-'}
              {quotation.validUntil && (
                <span className="ml-2 text-xs">
                  ({formatDistanceToNow(new Date(quotation.validUntil), { locale: ja, addSuffix: true })})
                </span>
              )}
            </p>
            <p>金額: {formatPrice(quotation.totalAmount)}</p>
            {downloadStats && (
              <p className="text-xs">
                ダウンロード回数: {downloadStats.count}回
                {downloadStats.lastDownloadedAt && (
                  <span className="ml-2">
                    (最終: {new Date(downloadStats.lastDownloadedAt).toLocaleDateString('ja-JP')})
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        <QuotationActions
          quotation={quotation}
          onViewDetails={onViewDetails}
          onDownloadPDF={onDownloadPDF}
          onDelete={onDelete}
          downloadingQuoteId={downloadingQuoteId}
          deletingQuoteId={deletingQuoteId}
        />
      </div>
    </Card>
  );
}
