'use client';

import { Card, Badge, Button } from '@/components/ui';
import { Mail, Download, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { formatDateJa } from '@/utils/formatters';
import { useState } from 'react';
import type { Quotation } from '@/types/quotation';
import { formatPrice } from '@/utils/formatters';
import { formatProductDisplayName } from '@/lib/product-display-name';
import { MemberSpecificationDisplay } from '@/components/member/quotations/MemberSpecificationDisplay';
import { PostProcessingPreview } from '@/components/quote-simulator/PostProcessingPreview';
import { convertToPreviewOptions } from '@/constants/product-type-config';
import { normalizeStatus, STATUS_LABELS } from './quotation-utils';
import { extractCostDataForQuotation } from '@/lib/cost-extraction';

interface AdminQuotationListProps {
  quotations: Quotation[];
  selectedQuotation: Quotation | null;
  onSelectQuotation: (quotation: Quotation) => void;
  onSendEmail: (quotation: Quotation) => void;
  statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'default' }>;
}

export function AdminQuotationList({
  quotations,
  selectedQuotation,
  onSelectQuotation,
  onSendEmail,
}: AdminQuotationListProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const calcCost = (quotation: Quotation): { totalCost: number; margin: number } => {
    const items = quotation.items || [];
    const subtotal = quotation.subtotal_amount || (quotation.total_amount ? quotation.total_amount / 1.1 : 0);
    const { totalManufacturerCost, totalMargin } = extractCostDataForQuotation(items, subtotal);
    return { totalCost: totalManufacturerCost, margin: totalMargin };
  };

  if (quotations.length === 0) {
    return (
      <Card className="p-8 text-center text-gray-500">
        <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p>該当する見積もりがありません</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {quotations.map((quotation) => {
        const normalizedStatus = normalizeStatus(quotation.status);
        const isExpanded = expandedItems[quotation.id] || false;
        const isSelected = selectedQuotation?.id === quotation.id;
        const { totalCost, margin } = calcCost(quotation);
        const subtotal = quotation.subtotal_amount || (quotation.total_amount ? quotation.total_amount / 1.1 : 0);

        const firstItem = quotation.items?.[0];
        const firstSpecs = firstItem?.breakdown?.specifications || firstItem?.specifications || {};
        const displayName = formatProductDisplayName(firstSpecs, firstItem?.product_name || 'カスタム製品');

        return (
          <Card
            key={quotation.id}
            className={`overflow-hidden cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
          >
            {/* Quote header row */}
            <div
              onClick={() => onSelectQuotation(quotation)}
              className="px-4 py-3"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-gray-900">{quotation.quotation_number}</span>
                  <Badge variant={STATUS_LABELS[normalizedStatus]?.variant || 'default'}>
                    {STATUS_LABELS[normalizedStatus]?.label || normalizedStatus}
                  </Badge>
                  <span className="text-xs text-gray-500">{formatDateJa(quotation.created_at)}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">¥{formatPrice(quotation.total_amount)}</span>
                  <span className="text-xs text-gray-400 ml-1">(税込)</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-700">{displayName}</span>
                  <span className="text-gray-500">{quotation.customer_name}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  {totalCost > 0 && (
                    <>
                      <span>原価: ¥{formatPrice(Math.round(totalCost))}</span>
                      <Badge variant={margin > 30 ? 'success' : margin > 15 ? 'warning' : 'error'} size="sm">
                        利益率 {margin.toFixed(1)}%
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Expand/collapse button */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(quotation.id); }}
              className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-gray-500 hover:bg-gray-50 border-t border-gray-100"
            >
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {isExpanded ? '閉じる' : '詳細を見る'}
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="px-4 pb-3 space-y-3 bg-gray-50/50">
                {/* Product specifications (once) */}
                {firstItem && (() => {
                  const specs = firstItem.breakdown?.specifications || firstItem.specifications;
                  return specs && (
                    <div className="pt-2">
                      <MemberSpecificationDisplay item={{ specifications: specs }} />
                    </div>
                  );
                })()}

                {/* Post-processing inline */}
                {firstSpecs?.postProcessingOptions?.length > 0 && (
                  <PostProcessingPreview
                    selectedOptions={convertToPreviewOptions(firstSpecs.postProcessingOptions)}
                    inline={true}
                  />
                )}

                {/* Quantity pattern table */}
                {quotation.items && quotation.items.length > 0 && (
                  <div className="border-t border-gray-200 pt-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-200">
                          <th className="text-right font-medium py-1.5 pr-2 w-20">数量</th>
                          <th className="text-right font-medium py-1.5 px-2 w-24">単価</th>
                          <th className="text-right font-medium py-1.5 pl-2 w-28">金額</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotation.items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-1.5 pr-2 text-right text-gray-600 tabular-nums">{item.quantity.toLocaleString()}</td>
                            <td className="py-1.5 px-2 text-right text-gray-600 tabular-nums">¥{formatPrice(item.unit_price)}</td>
                            <td className="py-1.5 pl-2 text-right text-gray-900 font-medium tabular-nums">¥{formatPrice(item.total_price || item.unit_price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Cost summary */}
                {totalCost > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">売上(税抜)</span>
                      <span className="font-medium text-gray-900">¥{formatPrice(Math.round(subtotal))}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">原価合計</span>
                      <span className="font-medium text-gray-900">¥{formatPrice(Math.round(totalCost))}</span>
                    </div>
                    <div className="flex justify-between text-xs border-t pt-1">
                      <span className="text-gray-500">粗利</span>
                      <span className="font-medium text-gray-900">¥{formatPrice(Math.round(subtotal - totalCost))}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">利益率</span>
                      <span className="font-bold text-blue-600">{margin.toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {quotation.pdf_url && (
                    <a
                      href={quotation.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </a>
                  )}
                  {quotation.customer_email && (
                    <Button size="sm" variant="outline" onClick={() => onSendEmail(quotation)}>
                      <Mail className="w-3.5 h-3.5 mr-1" />
                      メール
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
