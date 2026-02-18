/**
 * Order Items Summary Component
 *
 * 注文商品明細サマリーコンポーネント
 * - 商品明細をコンパクトに表示
 * - 仕様・オプションも見やすく整理
 *
 * @client
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { ChevronDown, ChevronUp, Package, Building2, Tag, X } from 'lucide-react';
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

// 安全な数値フォーマット関数
function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return value.toLocaleString();
}

// Adminページ（snake_case）とMemberページ（camelCase）のプロパティ名の違いを吸収
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

function getMaterialName(materialId: string): string {
  // 기본 매핑은 유지 (fallback용)
  const names: Record<string, string> = {
    pet_al: 'PET/AL (アルミ箔ラミネート)',
    pet_pe: 'PET/PE',
    cpp: 'CPP (未延伸ポリプロピレン)',
    lldpe: 'LLDPE (直鎖状低密度ポリエチレン)',
  };
  return names[materialId] || materialId || '-';
}

function getPrintingName(type: string, colors?: number): string {
  const typeNames: Record<string, string> = {
    digital: 'デジタル印刷',
    gravure: 'グラビア印刷',
  };
  const typeName = typeNames[type] || type || '-';
  // 色数は常にフルカラー表示
  return typeName;
}

function getPostProcessingName(option: string): string {
  // processingOptionsConfigから日本語ラベルを取得
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
// Order Item Row Component
// =====================================================

interface OrderItemRowProps {
  item: any;
}

function OrderItemRow({ item }: OrderItemRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // camelCaseとsnake_caseの両方に対応
  const productName = getItemValue(item, 'productName', 'product_name') || '-';
  const quantity = getItemValue(item, 'quantity', 'quantity') || 0;
  const unitPrice = getItemValue(item, 'unitPrice', 'unit_price') || 0;
  const totalPrice = getItemValue(item, 'totalPrice', 'total_price') || 0;

  return (
    <div className="border-b border-border-secondary last:border-b-0">
      {/* Main row */}
      <div
        className={cn(
          "py-3 px-4 transition-colors",
          isExpanded && "bg-muted/10"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-primary truncate">{productName}</p>
            <div className="flex items-center gap-3 mt-1 text-sm text-text-muted">
              <span>数量: {formatNumber(quantity)}</span>
              <span>単価: {formatNumber(unitPrice)}円</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-text-primary">
              {formatNumber(totalPrice)}円
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded specifications */}
      {isExpanded && item.specifications && Object.keys(item.specifications).length > 0 && (
        <div className="px-4 pb-3 bg-muted/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {item.specifications.bagTypeId && (
              <SpecItem label="タイプ" value={getBagTypeName(item.specifications.bagTypeId)} />
            )}
            {item.specifications.materialId && item.specifications.thicknessSelection && (() => {
              const matSpec = getMaterialSpecification(item.specifications.materialId, item.specifications.thicknessSelection);
              const weightRange = (() => {
                const options = MATERIAL_THICKNESS_OPTIONS[item.specifications.materialId];
                if (!options) return null;
                const thickness = options.find(opt => opt.id === item.specifications.thicknessSelection);
                return thickness?.weightRange || null;
              })();
              return (
                <>
                  {matSpec && (
                    <SpecItem
                      label="素材"
                      value={<span className="text-blue-700">{matSpec}</span>}
                    />
                  )}
                  {weightRange && (
                    <SpecItem label="重量" value={weightRange} />
                  )}
                </>
              );
            })()}
            {item.specifications.dimensions && (
              <SpecItem label="サイズ" value={item.specifications.dimensions} />
            )}
            {(item.specifications.printingType || item.specifications.printingColors !== undefined) && (
              <SpecItem
                label="印刷"
                value={getPrintingName(
                  item.specifications.printingType,
                  item.specifications.printingColors
                )}
              />
            )}
            <SpecItem label="色数" value="フルカラー" />
            {item.specifications.urgency && (
              <SpecItem label="納期" value={getUrgencyName(item.specifications.urgency)} />
            )}
            {item.specifications.deliveryLocation && (
              <SpecItem label="配送先" value={getDeliveryLocationName(item.specifications.deliveryLocation)} />
            )}
          </div>

          {/* 後加工 (簡素化 - カンマ区切り) */}
          {item.specifications.postProcessingOptions && item.specifications.postProcessingOptions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border-secondary text-sm">
              <div className="flex items-baseline gap-2">
                <span className="text-text-muted flex-shrink-0">後加工:</span>
                <span className="text-text-primary">
                  {item.specifications.postProcessingOptions.map((opt: string) => getPostProcessingName(opt)).join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Main Component
// =====================================================

export function OrderItemsSummary({ order, quotationId, onCouponApplied }: OrderItemsSummaryProps) {
  // 은행 정보 상태
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);

  // クーポン関連の状態
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // 은행 정보 가져오기
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

  // 既に適用されたクーポンがある場合は表示
  useEffect(() => {
    if (order.appliedCoupon) {
      setAppliedCoupon(order.appliedCoupon);
      setDiscountAmount(order.discountAmount || 0);
    }
  }, [order]);

  // クーポン適用ハンドラー
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
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ couponCode: couponCode.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setAppliedCoupon(data.coupon);
        setDiscountAmount(data.discountAmount);
        setCouponCode('');

        // 親コンポーネントに更新を通知
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

  // camelCaseとsnake_caseの両方に対応
  const subtotal = getOrderValue(order, 'subtotal', 'subtotal');
  const taxAmount = getOrderValue(order, 'taxAmount', 'tax_amount');
  const totalAmount = getOrderValue(order, 'totalAmount', 'total_amount');
  const originalTotal = subtotal ? subtotal + (taxAmount || 0) : totalAmount;
  const finalTotal = discountAmount > 0 ? originalTotal - discountAmount : totalAmount;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Package className="w-5 h-5" />
          商品明細
        </h2>
        <span className="text-sm text-text-muted">
          {order.items?.length || 0}点
        </span>
      </div>

      {/* Items list */}
      <div className="divide-y divide-border-secondary border-y border-border-secondary mb-4">
        {order.items?.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </div>

      {/* Total */}
      <div className="space-y-2 pt-4">
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

      {/* 振込先銀行口座 - コンパクト版 */}
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
