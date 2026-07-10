/**
 * Order List Section for OrdersClient
 */

'use client';

import { Card, Button, Badge } from '@/components/ui';
import { Package, Truck, Eye, RefreshCw, ChevronRight } from 'lucide-react';
import { formatPrice, formatDate } from '@/utils/formatters';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { PostProcessingPreview } from '@/components/quote-simulator/PostProcessingPreview';
import { MemberSpecificationDisplay } from '@/components/member/quotations/MemberSpecificationDisplay';
import { MEMBER_STATUS_LABELS, MEMBER_STATUS_VARIANTS, convertToPreviewOptions } from '@/constants/product-type-config';
import { safeMap } from '@/lib/array-helpers';
import { formatProductDisplayName } from '@/lib/product-display-name';
import { useRouter } from 'next/navigation';
import { OrderStatusBadge } from '@/components/orders';

function StatusBadge({ status }: { status: string }) {
  return <OrderStatusBadge status={status} locale="ja" />;
}

function ProgressBar({ progress }: { progress: number | string }) {
  const numProgress = typeof progress === 'string' ? parseInt(progress) : progress;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, numProgress))}%` }} />
    </div>
  );
}

interface OrderListSectionProps {
  filteredOrders: any[];
  orders: any[];
  activeTab: string;
  onNavigate: (path: string) => void;
  setFilters: (filters: any) => void;
  filters: any;
}

function extractQuotationItems(quotations: any): any[] {
  if (!quotations) return [];
  if (Array.isArray(quotations)) return quotations;
  if (quotations.items) return quotations.items;
  return [];
}

export function OrderListSection({ filteredOrders, orders, activeTab, onNavigate, setFilters, filters }: OrderListSectionProps) {
  const router = useRouter();
  return (
    <>
      {/* Order List or Reorder Grid */}
      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-text-muted">
            {orders.length === 0
              ? '注文がありません'
              : '検索条件に一致する注文がありません'}
          </p>
          {activeTab === 'reorder' && (
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => router.push('/catalog')}
            >
              商品カタログを見る
            </Button>
          )}
          {activeTab !== 'reorder' && (
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => {
                setFilters({ searchTerm: '', dateRange: 'all', sortBy: 'date', sortOrder: 'desc' });
              }}
            >
              フィルターをクリア
            </Button>
          )}
        </Card>
      ) : activeTab === 'reorder' ? (
        // Reorder Grid
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="font-medium text-text-primary">
                      {order.order_number || order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} />
                    {(order.quotation_number || order.quotationNumber) && (
                      <>
                        <span className="text-text-muted">|</span>
                        <a
                          href={`/member/quotations?search=${order.quotation_number || order.quotationNumber}`}
                          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          見積: {order.quotation_number || order.quotationNumber}
                        </a>
                      </>
                    )}
                  </div>

                  <div className="text-xs text-text-muted mb-3">
                    {order.created_at || order.createdAt ? (
                      formatDistanceToNow(new Date(order.created_at || order.createdAt), {
                        addSuffix: true,
                        locale: ja,
                      })
                    ) : (
                      '作成日不明'
                    )}
                  </div>

                  {(() => {
                    const quotationItemsList = extractQuotationItems(order.quotations);
                    const firstQuotationItem = quotationItemsList[0];
                    const firstItem = (order.items || [])[0];
                    const specs = firstQuotationItem?.specifications || firstItem?.specifications;

                    return (
                      <div className="space-y-2 mb-4">
                        {/* 製品仕様サマリー（1回のみ） */}
                        {specs && (
                          <div className="border border-border-secondary rounded-lg p-3 bg-bg-secondary/30">
                            <MemberSpecificationDisplay item={{ specifications: specs }} />
                            {/* 後加工プレビュー（インライン） */}
                            {specs.postProcessingOptions && specs.postProcessingOptions.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-border-secondary">
                                <PostProcessingPreview
                                  selectedOptions={convertToPreviewOptions(specs.postProcessingOptions)}
                                  inline={true}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 数量別価格表 */}
                        <table className="w-full text-sm border border-border-secondary rounded-lg overflow-hidden">
                          <thead>
                            <tr className="text-xs text-text-muted border-b border-border-secondary bg-bg-secondary/30">
                              <th className="text-left font-medium py-1.5 px-3">品目</th>
                              <th className="text-right font-medium py-1.5 px-2 w-20">数量</th>
                              <th className="text-right font-medium py-1.5 px-2 w-24">単価</th>
                              <th className="text-right font-medium py-1.5 pl-2 w-28">金額</th>
                            </tr>
                          </thead>
                          <tbody>
                            {safeMap((order.items || []), (item: any, itemIndex: number) => {
                              const qi = quotationItemsList[itemIndex];
                              const itemSpecs = qi?.specifications || item.specifications || {};
                              const displayName = formatProductDisplayName(itemSpecs, item.product_name || item.productName || 'カスタム製品');

                              return (
                                <tr key={item.id} className="border-b border-border-secondary/50 last:border-0">
                                  <td className="py-1.5 px-3 text-sm font-medium text-text-primary">{displayName}</td>
                                  <td className="py-1.5 px-2 text-right text-text-muted tabular-nums">{item.quantity}個</td>
                                  <td className="py-1.5 px-2 text-right text-text-muted tabular-nums">
                                    ¥{(item.unit_price || item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                  </td>
                                  <td className="py-1.5 pl-2 text-right text-text-primary font-semibold tabular-nums">
                                    {(item.total_price || (item.unit_price || item.unitPrice) * item.quantity).toLocaleString()}円
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  <div className="text-lg font-semibold text-text-primary">
                    合計: {(order.total_amount || order.totalAmount || 0).toLocaleString()}円
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => router.push(`/quote-simulator?orderId=${order.id}`)}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  再注文する
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Standard Order List
        <div className="space-y-4" data-testid="member-orders-list">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6 hover:shadow-sm transition-shadow" data-testid="member-order-row">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-medium text-text-primary">
                      {order.order_number || order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>

                  {(order.quotation_number || order.quotationNumber) && (
                    <p className="text-sm text-text-muted mb-2">
                      見積番号: {order.quotation_number || order.quotationNumber}
                    </p>
                  )}

                  {/* Progress bar */}
                  {order.progress_percentage != null && (
                    <div className="mb-3">
                      <ProgressBar progress={Number(order.progress_percentage)} />
                      <p className="text-xs text-text-muted mt-1">進捗: {order.progress_percentage}%</p>
                    </div>
                  )}

                  {(() => {
                    const quotationItemsList = extractQuotationItems(order.quotations);
                    const firstQuotationItem = quotationItemsList[0];
                    const firstItem = (order.items || [])[0];
                    const specs = firstQuotationItem?.specifications || firstItem?.specifications;

                    return (
                      <div className="space-y-2 mb-3">
                        {/* 製品仕様サマリー（1回のみ） */}
                        {specs && (
                          <div className="border border-border-secondary rounded-lg p-3 bg-bg-secondary/30">
                            <MemberSpecificationDisplay item={{ specifications: specs }} />
                            {/* 後加工プレビュー（インライン） */}
                            {specs.postProcessingOptions && specs.postProcessingOptions.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-border-secondary">
                                <PostProcessingPreview
                                  selectedOptions={convertToPreviewOptions(specs.postProcessingOptions)}
                                  inline={true}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* 数量別価格表 */}
                        <table className="w-full text-sm border border-border-secondary rounded-lg overflow-hidden">
                          <thead>
                            <tr className="text-xs text-text-muted border-b border-border-secondary bg-bg-secondary/30">
                              <th className="text-left font-medium py-1.5 px-3">品目</th>
                              <th className="text-right font-medium py-1.5 px-2 w-20">数量</th>
                              <th className="text-right font-medium py-1.5 px-2 w-24">単価</th>
                              <th className="text-right font-medium py-1.5 pl-2 w-28">金額</th>
                            </tr>
                          </thead>
                          <tbody>
                            {safeMap((order.items || []), (item: any, itemIndex: number) => {
                              const qi = quotationItemsList[itemIndex];
                              const itemSpecs = qi?.specifications || item.specifications || {};
                              const displayName = formatProductDisplayName(itemSpecs, item.product_name || item.productName || 'カスタム製品');

                              return (
                                <tr key={item.id} className="border-b border-border-secondary/50 last:border-0">
                                  <td className="py-1.5 px-3 text-sm font-medium text-text-primary">{displayName}</td>
                                  <td className="py-1.5 px-2 text-right text-text-muted tabular-nums">{item.quantity}個</td>
                                  <td className="py-1.5 px-2 text-right text-text-muted tabular-nums">
                                    ¥{(item.unit_price || item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                  </td>
                                  <td className="py-1.5 pl-2 text-right text-text-primary font-semibold tabular-nums">
                                    {(item.total_price || (item.unit_price || item.unitPrice) * item.quantity).toLocaleString()}円
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}

                  <div className="text-lg font-semibold text-text-primary">
                    合計: {(order.total_amount || order.totalAmount || 0).toLocaleString()}円
                  </div>

                  {/* Shipment tracking info */}
                  {order.shipments?.tracking_number && (
                    <div className="text-xs text-text-muted mt-2">
                      配送: {order.shipments.carrier_name} - {order.shipments.tracking_number}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-text-muted mb-2">
                    {order.created_at || order.createdAt ? (
                      formatDistanceToNow(new Date(order.created_at || order.createdAt), {
                        addSuffix: true,
                        locale: ja,
                      })
                    ) : (
                      '作成日不明'
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/member/orders/${order.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    詳細を見る
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
