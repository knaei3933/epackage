'use client';

import { Card, Badge } from '@/components/ui';
import { Mail } from 'lucide-react';
import { formatDateJa } from '@/utils/formatters';
import type { Quotation } from '@/types/quotation';

interface AdminQuotationListProps {
  quotations: Quotation[];
  selectedQuotation: Quotation | null;
  onSelectQuotation: (quotation: Quotation) => void;
  onSendEmail: (quotation: Quotation) => void;
  statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }>;
}

/**
 * AdminQuotationList - 管理者用見積リストコンポーネント
 */
export function AdminQuotationList({
  quotations,
  selectedQuotation,
  onSelectQuotation,
  onSendEmail,
  statusLabels,
}: AdminQuotationListProps) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">見積もり一覧</h2>
      <div className="space-y-3">
        {quotations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            見積もりがありません
          </div>
        ) : (
          quotations.map((quotation) => (
            <div
              key={quotation.id}
              className={`p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors ${
                selectedQuotation?.id === quotation.id ? 'bg-blue-50 border-blue-300' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onSelectQuotation(quotation)}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{quotation.quotation_number}</p>
                    <Badge variant={statusLabels[quotation.status]?.variant || 'default'}>
                      {statusLabels[quotation.status]?.label || quotation.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{quotation.company_name || quotation.customer_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{quotation.customer_email}</p>
                  {(quotation.corporate_phone || quotation.personal_phone) && (
                    <p className="text-xs text-gray-500 mt-1">
                      電話: {quotation.corporate_phone || quotation.personal_phone}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      ¥{quotation.subtotal_amount?.toLocaleString() || quotation.total_amount?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateJa(quotation.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendEmail(quotation);
                    }}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                    title="メール送信"
                  >
                    <Mail className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
