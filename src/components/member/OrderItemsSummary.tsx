/**
 * Order Items Summary Component
 *
 * 注文商品明細サマリーコンポーネント
 * - 製品仕様を共通表示
 * - SKUごとに「数量 × 単価」を表示
 *
 * @client
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Package, Building2, Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order, AppliedCoupon } from '@/types/dashboard';
import { getMaterialSpecification, MATERIAL_THICKNESS_OPTIONS } from '@/lib/unified-pricing-engine';
import { processingOptionsConfig } from '@/components/quote/shared/processingConfig';

// =====================================================
// Types
// =====================================================

interface OrderItemsSummaryProps {
  order: Order;
  quotationId?: string;
  onCouponApplied?: (updatedOrder: Order) => void;
}

interface BankInfo {
  bankName: string;
  branchName?: string;
  accountType?: string;
  accountNumber: string;
  accountHolder: string;
}

interface InvoiceResponse {
  success: boolean;
  invoice?: {
    bankInfo?: BankInfo;
  };
  error?: string;
}

// =====================================================
// Helper Functions
// =====================================================

function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString();
}

function getOrderValue(order: any, camelCaseKey: string, snakeCaseKey: string): any {
  return order[camelCaseKey] ?? order[snakeCaseKey];
}

function getItemValue(item: any, camelCaseKey: string, snakeCaseKey: string): any {
  return item[camelCaseKey] ?? item[snakeCaseKey];
}

function getBagTypeName(bagTypeId: string): string {
  const names: Record<string, string> = {
    flat_pouch: '平袋',
    flat_3_side: '合掌袋',
    stand_up: 'スタンドパウチ',
    gazette: 'ガゼットパウチ',
    roll_film: 'ロールフィルム',
    spout_pouch: 'スパウトパウチ',
    zipper_pouch: 'チャック付袋',
  };
  return names[bagTypeId] || bagTypeId || '-';
}

function getPrintingName(type: string): string {
  const typeNames: Record<string, string> = {
    digital: 'デジタル印刷',
    gravure: 'グラビア印刷',
  };
  return typeNames[type] || type || '-';
}

function getPostProcessingName(option: string): string {
  const config = processingOptionsConfig.find(opt => opt.id === option);
  return config?.nameJa || option;
}

function getUrgencyName(urgency: string): string {
  const names: Record<string, string> = {
    standard: '標準',
    urgent: '至急',
  };
  return names[urgency] || urgency || '-';
}

function getDeliveryLocationName(location: string): string {
  const names: Record<string, string> = {
    domestic: '国内',
    international: '海外',
  };
  return names[location] || location || '-';
}

function getSpoutPositionLabel(value: string): string {
  const labels: Record<string, string> = {
    'top-left': '左上',
    'top-center': '上中央',
    'top-right': '右上',
  };
  return labels[value] || value || '-';
}

function getSealWidthLabel(value: string): string {
  const labels: Record<string, string> = {
    '5mm': '5mm',
    '7.5mm': '7.5mm',
    '10mm': '10mm',
  };
  return labels[value] || value || '-';
}

// =====================================================
// Product Name Generator
// =====================================================

/**
 * 仕様情報から適切な商品名を生成
 */
function generateProductName(specifications: any): string {
  if (!specifications || Object.keys(specifications).length === 0) {
    return 'カスタム製品';
  }

  const parts: string[] = [];

  // タイプ（袋の種類）
  if (specifications.bagTypeId) {
    const typeMap: Record<string, string> = {
      flat_pouch: '平袋',
      flat_3_side: '合掌袋',
      stand_up: 'スタンドパウチ',
      gazette: 'ガゼットパウチ',
      roll_film: 'ロールフィルム',
      spout_pouch: 'スパウトパウチ',
      zipper_pouch: 'チャック付袋',
    };
    parts.push(typeMap[specifications.bagTypeId] || '');
  }

  // 素材構成（最上位レベル）
  if (specifications.materialId) {
    const materialMap: Record<string, string> = {
      pet_al: 'PET/AL',
      pet_pe: 'PET/PE',
      cpp: 'CPP',
      lldpe: 'LLDPE',
    };
    parts.push(materialMap[specifications.materialId] || '');
  }

  // シール幅
  if (specifications.sealWidth) {
    parts.push(getSealWidthLabel(specifications.sealWidth));
  }

  // その他オプション
  if (specifications.doubleSided) {
    parts.push('両面印刷');
  }

  return parts.length > 0 ? parts.join('・') : 'カスタム製品';
}

// =====================================================
// Spec Item Component
// =====================================================

interface SpecItemProps {
  label: string;
  value: string | React.ReactNode;
}

function SpecItem({ label, value }: SpecItemProps) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="text-text-muted flex-shrink-0">{label}:</span>
      <span className="text-text-primary">{value}</span>
    </div>
  );
}

// =====================================================
// Specifications Display Component
// =====================================================

interface SpecificationsDisplayProps {
  specifications: any;
}

function SpecificationsDisplay({ specifications }: SpecificationsDisplayProps) {
  if (!specifications || Object.keys(specifications).length === 0) {
    return null;
  }

  const matSpec = specifications.materialId && specifications.thicknessSelection
    ? getMaterialSpecification(specifications.materialId, specifications.thicknessSelection)
    : null;

  let weightRange = null;
  if (specifications.materialId) {
    const options = MATERIAL_THICKNESS_OPTIONS[specifications.materialId];
    if (options) {
      const thickness = options.find(opt => opt.id === specifications.thicknessSelection);
      weightRange = thickness?.weightRange || null;
    }
  }

  return (
    <div className="p-4 bg-muted/20 rounded-lg mb-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">製品仕様</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
        {specifications.bagTypeId && (
          <SpecItem label="タイプ" value={getBagTypeName(specifications.bagTypeId)} />
        )}
        {matSpec && (
          <SpecItem
            label="素材"
            value={<span className="text-blue-700">{matSpec}</span>}
          />
        )}
        {weightRange && (
          <SpecItem label="重量" value={weightRange} />
        )}
        {specifications.dimensions && (
          <SpecItem label="サイズ" value={specifications.dimensions} />
        )}
        {(specifications.printingType || specifications.printingColors !== undefined) && (
          <SpecItem label="印刷" value={getPrintingName(specifications.printingType)} />
        )}
        <SpecItem label="色数" value="フルカラー" />
        {specifications.urgency && (
          <SpecItem label="納期" value={getUrgencyName(specifications.urgency)} />
        )}
        {specifications.deliveryLocation && (
          <SpecItem label="配送先" value={getDeliveryLocationName(specifications.deliveryLocation)} />
        )}
        {specifications.bagTypeId === 'spout_pouch' && (
          <>
            {specifications.spoutSize && (
              <SpecItem label="スパウトサイズ" value={`${specifications.spoutSize}mm`} />
            )}
            {specifications.spoutPosition && (
              <SpecItem label="スパウト位置" value={getSpoutPositionLabel(specifications.spoutPosition)} />
            )}
          </>
        )}
        {specifications.sealWidth && (
          <SpecItem label="シール幅" value={getSealWidthLabel(specifications.sealWidth)} />
        )}
        {specifications.doubleSided === true && (
          <SpecItem label="両面印刷" value="あり" />
        )}
      </div>

      {/* 素材4層構成 */}
      {specifications.filmLayers && specifications.filmLayers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border-secondary">
          <div className="text-xs text-text-muted mb-2">素材構成（4層）:</div>
          <div className="flex flex-wrap gap-2">
            {specifications.filmLayers.map((layer: any, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-background border border-border-secondary rounded text-xs"
              >
                <span className="font-medium">{layer.materialId || '-'}</span>
                <span className="text-text-muted ml-1">{layer.thickness ? `${layer.thickness}μ` : ''}</span>
              </span>
            ))}
          </div>
          {specifications.specification && (
            <div className="mt-2 text-xs text-text-primary">
              {specifications.specification}
            </div>
          )}
        </div>
      )}

      {/* 後加工 */}
      {specifications.postProcessingOptions && specifications.postProcessingOptions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border-secondary">
          <div className="text-xs text-text-muted mb-2">後加工:</div>
          <div className="flex flex-wrap gap-2">
            {specifications.postProcessingOptions.map((opt: string) => {
              const config = processingOptionsConfig.find(c => c.id === opt);
              return (
                <span
                  key={opt}
                  className="px-2 py-1 bg-bg-primary rounded text-xs border border-border-secondary"
                  title={config?.descriptionJa || opt}
                >
                  {config?.nameJa || getPostProcessingName(opt)}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// Main Component
// =====================================================

export function OrderItemsSummary({ order, quotationId, onCouponApplied }: OrderItemsSummaryProps) {
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (!quotationId) return;

    async function fetchBankInfo() {
      try {
        const response = await fetch(`/api/member/quotations/${quotationId}/invoice`, {
          method: 'POST',
          credentials: 'include',
        });

        if (response.ok) {
          const data: InvoiceResponse = await response.json();
          if (data.success && data.invoice?.bankInfo) {
            setBankInfo(data.invoice.bankInfo);
          }
        }
      } catch (err) {
        console.error('Error fetching bank info:', err);
      }
    }

    fetchBankInfo();
  }, [quotationId]);

  useEffect(() => {
    if (order.appliedCoupon) {
      setAppliedCoupon(order.appliedCoupon);
      setDiscountAmount(order.discountAmount || 0);
    }
  }, [order]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('クーポンコードを入力してください');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const response = await fetch(`/api/member/orders/${order.id}/apply-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setAppliedCoupon(data.coupon);
        setDiscountAmount(data.discountAmount);
        setCouponCode('');

        if (onCouponApplied) {
          const updatedOrder = {
            ...order,
            couponId: data.coupon.id,
            discountAmount: data.discountAmount,
            discountType: data.coupon.type,
            appliedCoupon: data.coupon,
            totalAmount: data.discountedTotal,
          };
          onCouponApplied(updatedOrder);
        }
      } else {
        setCouponError(data.error || 'クーポンの適用に失敗しました');
      }
    } catch (err) {
      console.error('Error applying coupon:', err);
      setCouponError('エラーが発生しました。もう一度お試しください');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const subtotal = getOrderValue(order, 'subtotal', 'subtotal');
  const taxAmount = getOrderValue(order, 'taxAmount', 'tax_amount');
  const totalAmount = getOrderValue(order, 'totalAmount', 'total_amount');
  const originalTotal = subtotal ? subtotal + (taxAmount || 0) : totalAmount;
  const finalTotal = discountAmount > 0 ? originalTotal - discountAmount : totalAmount;

  const items = order.items || [];
  const specifications = items.length > 0 ? items[0].specifications : null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Package className="w-5 h-5" />
          商品明細
        </h2>
        <span className="text-sm text-text-muted">
          {items.length} SKU
        </span>
      </div>

      {/* 製品仕様（共通） */}
      <SpecificationsDisplay specifications={specifications} />

      {/* SKU明細 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary mb-2">SKU明細</h3>
        <div className="border border-border-secondary rounded-lg overflow-hidden">
          {items.map((item: any, index: number) => {
            const rawProductName = getItemValue(item, 'productName', 'product_name');
            const itemSpecs = item.specifications || specifications;
            const productName = (rawProductName === 'カスタム製品' || !rawProductName) && itemSpecs
              ? generateProductName(itemSpecs)
              : rawProductName || `SKU ${index + 1}`;
            const quantity = getItemValue(item, 'quantity', 'quantity') || 0;
            const unitPrice = getItemValue(item, 'unitPrice', 'unit_price') || 0;
            const totalPrice = getItemValue(item, 'totalPrice', 'total_price') || 0;
            const skuLabel = `SKU ${index + 1}`;

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between p-3 text-sm",
                  index < items.length - 1 && "border-b border-border-secondary"
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-text-muted font-medium min-w-[60px]">{skuLabel}</span>
                  <span className="text-text-primary">{productName}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-text-muted">
                    {formatNumber(quantity)}個 × {formatNumber(unitPrice)}円
                  </span>
                  <span className="font-semibold text-text-primary">
                    {formatNumber(totalPrice)}円
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 合計 */}
      <div className="space-y-2 pt-4 border-t border-border-secondary">
        {subtotal !== undefined && subtotal !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">小計</span>
            <span className="text-text-primary">
              {formatNumber(subtotal)}円
            </span>
          </div>
        )}
        {taxAmount !== undefined && taxAmount !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">消費税 (10%)</span>
            <span className="text-text-primary">
              {formatNumber(taxAmount)}円
            </span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              クーポン割引
            </span>
            <span className="font-medium">
              -{formatNumber(discountAmount)}円
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-border-secondary">
          <span className="text-text-primary">合計</span>
          <span className="text-text-primary">
            {formatNumber(finalTotal)}円
          </span>
        </div>
      </div>

      {/* クーポンセクション */}
      {!appliedCoupon && ['PENDING', 'QUOTATION', 'DATA_RECEIVED'].includes(order.status) && (
        <div className="mt-4 pt-4 border-t border-border-secondary">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-primary">クーポンコード</h3>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponError(null);
              }}
              placeholder="クーポンコードを入力"
              className={cn(
                "flex-1 px-3 py-2 text-sm border rounded-md",
                "focus:outline-none focus:ring-2 focus:ring-primary",
                couponError && "border-red-500"
              )}
              disabled={isApplyingCoupon}
            />
            <button
              onClick={handleApplyCoupon}
              disabled={isApplyingCoupon || !couponCode.trim()}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md",
                "bg-primary text-white",
                "hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-colors"
              )}
            >
              {isApplyingCoupon ? '適用中...' : '適用'}
            </button>
          </div>
          {couponError && (
            <p className="mt-2 text-sm text-red-600">{couponError}</p>
          )}
        </div>
      )}

      {/* 適用済みクーポン表示 */}
      {appliedCoupon && (
        <div className="mt-4 pt-4 border-t border-border-secondary">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  {appliedCoupon.name}
                </p>
                <p className="text-xs text-green-700">
                  {appliedCoupon.type === 'percentage'
                    ? `${appliedCoupon.value}%割引`
                    : appliedCoupon.type === 'fixed_amount'
                    ? `${formatNumber(appliedCoupon.value)}円引き`
                    : '送料無料'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setAppliedCoupon(null);
                setDiscountAmount(0);
              }}
              className="p-1 text-green-600 hover:bg-green-100 rounded"
              title="クーポンを削除"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 振込先銀行口座 */}
      {bankInfo && (
        <div className="mt-4 pt-4 border-t border-border-secondary">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-text-muted" />
            <h3 className="text-sm font-semibold text-text-primary">振込先銀行口座</h3>
          </div>
          <div className="text-xs text-text-muted leading-relaxed">
            {bankInfo.bankName}
            {bankInfo.branchName && <span> {bankInfo.branchName}</span>}
            {bankInfo.accountType && <span> {bankInfo.accountType}</span>}
            <span> 口座：{bankInfo.accountNumber}</span>
            <span> 名義：{bankInfo.accountHolder}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
