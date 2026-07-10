/**
 * Line Items section for QuotationDetailClient
 */

'use client';

import { CheckCircle, Check } from 'lucide-react';
import { Card } from '@/components/ui';
import { formatPrice } from '@/utils/formatters';

interface LineItemsProps {
  quotation: any;
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;
  canConvert: boolean;
  subtotal: number;
  taxAmount: number;
  displayTotalAmount: number;
}

export function LineItems({ quotation, selectedItemId, setSelectedItemId, canConvert, subtotal, taxAmount, displayTotalAmount }: LineItemsProps) {
  return (
    <>
      {/* Line Items */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">品目明細</h2>
          {/* Phase 2 fix: selection hint when multiple patterns exist */}
          {canConvert && quotation.items && quotation.items.length > 1 && (
            <span className={`text-sm font-medium ${selectedItemId ? 'text-green-700' : 'text-amber-700'}`}>
              {selectedItemId ? '✓ 注文する数量を選択済み' : '※ 注文する数量を1つ選択してください'}
            </span>
          )}
        </div>
        <div className="space-y-4">
          {quotation.items?.map((item: any, index: number) => {
            // Phase 2 fix: selectable pattern row. When the quotation is orderable (APPROVED),
            // the user must pick exactly one quantity pattern. Visual feedback is unmistakable:
            // selected = blue border + filled blue radio + check badge; unselected = neutral + outline radio.
            const isSelectable = canConvert;
            const isSelected = selectedItemId === item.id;
            const rowBase = 'rounded-xl p-5 flex items-center justify-between transition-all duration-150 relative';
            const rowState = isSelected
              ? 'border-2 border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-200'
              : isSelectable
                ? 'border-2 border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer'
                : 'border border-border-secondary';
            return (
              <div
                key={item.id}
                role={isSelectable ? 'button' : undefined}
                tabIndex={isSelectable ? 0 : undefined}
                aria-pressed={isSelectable ? isSelected : undefined}
                onClick={isSelectable ? () => setSelectedItemId(item.id) : undefined}
                onKeyDown={isSelectable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedItemId(item.id); } } : undefined}
                className={`${rowBase} ${rowState}`}
              >
                {/* Selection indicator (radio-style) - left side for clear visibility */}
                {isSelectable && (
                  <div className="flex items-center gap-3 pr-4">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-400 bg-white'}`}>
                      {isSelected && <Check className="w-5 h-5 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                )}
                {/* Selected badge - top right */}
                {isSelectable && isSelected && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-sm">
                      選択中
                    </span>
                  </div>
                )}
                {/* SKU Name and Quantity */}
                <div className="flex-1 pr-8">
                  <h3 className="text-base font-semibold text-text-primary">
                    {item.productName || `SKU ${index + 1}`}
                  </h3>
                  <p className="text-sm text-text-muted mt-1">
                    数量: {item.quantity.toLocaleString()}個 × {formatPrice(item.unitPrice || 0)}円
                  </p>
                  {item.specifications?.sku_quantities && item.specifications.sku_quantities.length > 1 && (() => {
                    // SKU別明細の計算（枚数 × 単価 = 金額）
                    const skuQuantities = item.specifications.sku_quantities;
                    const unitPrice = item.unitPrice || 0;
                    const totalQty = skuQuantities.reduce((sum: number, q: number) => sum + q, 0);
                    const totalPrice = skuQuantities.reduce(
                      (sum: number, q: number) => sum + q * unitPrice,
                      0
                    );

                    return (
                      <div className="bg-purple-50 p-3 rounded-lg mt-4">
                        <p className="font-medium text-purple-700">SKU分割: {skuQuantities.length}種類</p>
                        <div className="mt-2 space-y-1">
                          {skuQuantities.map((qty: number, idx: number) => {
                            // 各SKUの金額 = 数量 × 単価
                            const skuAmount = qty * unitPrice;
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-sm text-purple-600"
                              >
                                <span>SKU {idx + 1}</span>
                                <span>
                                  {qty.toLocaleString()}個 × ¥{formatPrice(unitPrice)} = ¥{formatPrice(skuAmount)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex items-center justify-between text-xs font-medium text-purple-700 mt-2 pt-2 border-t border-purple-200">
                          <span>合計</span>
                          <span>
                            {totalQty.toLocaleString()}個 / ¥{formatPrice(totalPrice)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Item Total */}
                <div className="text-right pr-8">
                  <p className="text-lg font-semibold text-text-primary">
                    ¥{formatPrice(item.totalPrice || item.unitPrice * item.quantity || 0)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-border-secondary space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">小計</span>
            <span className="text-text-primary">¥{formatPrice(subtotal || 0)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">消費税 (10%)</span>
            <span className="text-text-primary">¥{formatPrice(taxAmount || 0)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span className="text-text-primary">合計 (税込)</span>
            <span className="text-primary text-xl">
              ¥{formatPrice(displayTotalAmount)}
            </span>
          </div>
        </div>
      </Card>

    </>
  );
}
