/**
 * Orders Client Component
 *
 * 注文一覧ページのクライアントコンポーネント
 * - タブで「処理中」「履歴」「再注文」を切り替え
 * - ステータス管理・検索・フィルタリング・ソート
 * - 進捗状況表示
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, Input, PageLoadingState } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Eye, Search, Filter, ChevronDown, Package, Truck, CheckCircle, Clock, FileText, XCircle, RefreshCw } from 'lucide-react';
import type { OrderStatus } from '@/types/order-status';
import { safeMap } from '@/lib/array-helpers';
import { OrderStatusBadge } from '@/components/orders';
import { BAG_TYPE_IMAGES } from '@/constants/product-type-config';
import { MemberSpecificationDisplay } from '@/components/member/quotations/MemberSpecificationDisplay';
import { PostProcessingPreview } from '@/components/quote-simulator/PostProcessingPreview';
import { convertToPreviewOptions, MEMBER_STATUS_LABELS, MEMBER_STATUS_VARIANTS } from '@/constants/product-type-config';
import { formatProductDisplayName } from '@/lib/product-display-name';

// =====================================================
// Types
// =====================================================

type TabType = 'active' | 'history' | 'reorder';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications?: {
    bagTypeId?: string;
    size?: string;
    material?: string;
    thickness?: string;
    printing?: string;
    width?: number;
    height?: number;
    depth?: number;
    sideWidth?: number;
    spoutSize?: number;
    spoutPosition?: string;
    [key: string]: any;
  } | null;
}

interface QuotationItem {
  id: string;
  specifications?: {
    bagTypeId?: string;
    size?: string;
    material?: string;
    thickness?: string;
    printing?: string;
    printingColors?: string;
    inkType?: string;
    width?: number;
    height?: number;
    depth?: number;
    sideWidth?: number;
    spoutSize?: number;
    spoutPosition?: string;
    contentType?: string;
    deliveryLocation?: string;
    urgency?: string;
    postProcessing?: {
      zipper?: boolean;
      zipperPosition?: string;
      finish?: 'matte' | 'glossy';
      notch?: boolean;
      punching?: boolean;
      hangHoleSize?: string;
      corner?: 'round' | 'square';
      opening?: 'top' | 'bottom';
      valve?: boolean;
      machiPrinting?: boolean;
    };
    [key: string]: any;
  } | null;
}

interface Order {
  id: string;
  order_number: string;
  orderNumber: string;
  status: OrderStatus | string;
  total_amount: number;
  totalAmount: number;
  created_at: string;
  createdAt: string;
  updated_at: string;
  quotation_number?: string;
  quotationNumber?: string;
  items?: OrderItem[];
  quotations?: {
    id: string;
    quotation_number?: string;
    quotation_items?: QuotationItem[] | { data: QuotationItem[] };
  } | null;
  progress_percentage?: number;
  shipments?: {
    tracking_number: string | null;
    carrier_name: string | null;
  } | null;
}

interface FilterState {
  searchTerm: string;
  dateRange: 'all' | '7days' | '30days' | '90days';
  sortBy: 'date' | 'amount' | 'status';
  sortOrder: 'asc' | 'desc';
}

interface OrdersClientProps {
  userId: string;
  userEmail?: string;
  userProfile?: {
    kanji_last_name?: string;
    kanji_first_name?: string;
    kana_last_name?: string;
    kana_first_name?: string;
    company_name?: string;
    corporate_phone?: string;
    personal_phone?: string;
    email?: string;
  };
}

// =====================================================
// Constants
// =====================================================

// 10단계 워크플로우 기반 상태 분류
const ACTIVE_STATUSES: (OrderStatus | string)[] = [
  'QUOTATION_PENDING',        // 견적 승인 대기
  'QUOTATION_APPROVED',       // 견적 승인
  'DATA_UPLOAD_PENDING',      // 데이터 입고 대기
  'DATA_UPLOADED',            // 데이터 입고 완료
  'MODIFICATION_REQUESTED',   // 관리자 수정 요청 (고객 승인 대기)
  'MODIFICATION_APPROVED',    // 수정 승인
  'MODIFICATION_REJECTED',    // 수정 거부
  'CORRECTION_IN_PROGRESS',   // 교정 작업중
  'CORRECTION_COMPLETED',     // 교정 완료
  'CUSTOMER_APPROVAL_PENDING', // 고객 승인 대기
  'PRODUCTION',               // 제조중
  'READY_TO_SHIP',            // 출하 예정
];

const HISTORY_STATUSES: (OrderStatus | string)[] = [
  'SHIPPED',                   // 출하 완료
  'CANCELLED',                 // 취소됨
];

const REORDER_STATUSES: (OrderStatus | string)[] = [
  'SHIPPED',                   // 출하 완료 재주문 가능
];

const DATE_RANGE_FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: '7days', label: '過去7日間' },
  { value: '30days', label: '過去30日間' },
  { value: '90days', label: '過去90日間' },
];

const SORT_OPTIONS = [
  { value: 'date-desc', label: '新しい順' },
  { value: 'date-asc', label: '古い順' },
  { value: 'amount-desc', label: '金額が高い順' },
  { value: 'amount-asc', label: '金額が低い順' },
];

// =====================================================
// Helper Functions
// =====================================================

/**
 * Extract quotation_items array from Supabase relation format
 * Supabase returns relations as { data: [...] } or directly as array
 */
function extractQuotationItems(quotations: Order['quotations']): QuotationItem[] {
  if (!quotations) return [];

  // Handle Supabase relation format: { data: [...] }
  if (Array.isArray(quotations.quotation_items)) {
    return quotations.quotation_items;
  }

  // Handle nested data format: { quotation_items: { data: [...] } }
  if (quotations.quotation_items && typeof quotations.quotation_items === 'object') {
    const items = (quotations.quotation_items as { data?: QuotationItem[] }).data;
    if (Array.isArray(items)) {
      return items;
    }
  }

  return [];
}

// =====================================================
// Helper Components
// =====================================================

// Status Badge with Icon
function StatusBadge({ status }: { status: string }) {
  return <OrderStatusBadge status={status} locale="ja" />;
}

// Progress Bar - 진척률에 따른 색상 변화
function ProgressBar({ progress }: { progress: number | string }) {
  const numericProgress = Number(progress);
  if (isNaN(numericProgress)) return null;

  const clampedProgress = Math.min(100, Math.max(0, numericProgress));

  // 진척률에 따른 색상 변화 (인라인 스타일 사용)
  let progressColor = '#ef4444'; // 0-30%: 빨간색 (red-500)
  if (clampedProgress > 30) progressColor = '#eab308'; // 30-60%: 노란색 (yellow-500)
  if (clampedProgress > 60) progressColor = '#3b82f6'; // 60-90%: 파란색 (blue-500)
  if (clampedProgress > 90) progressColor = '#22c55e'; // 90-100%: 초록색 (green-500)

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2 overflow-hidden">
      <div
        className="h-3 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${clampedProgress}%`, backgroundColor: progressColor }}
      />
    </div>
  );
}

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

function TabButton({ active, onClick, icon, label, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-bg-secondary text-text-muted hover:bg-border-secondary'
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          active ? 'bg-white/20' : 'bg-border-secondary'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// =====================================================
// Page Component
// =====================================================

function OrdersClientContent({ userId, userEmail, userProfile }: OrdersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab state from URL or default to 'active'
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tab = searchParams.get('tab');
    return (tab === 'active' || tab === 'history' || tab === 'reorder') ? tab : 'active';
  });

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // =====================================================
  // IMPORTANT: Authentication is handled by Server Component
  // =====================================================
  // The parent Server Component (page.tsx) uses requireAuth()
  // to verify authentication on the server-side before this
  // Client Component is rendered. This ensures cookies are
  // properly validated and the user is authenticated.
  //
  // No client-side redirect needed here - the server handles it.

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', activeTab);
    window.history.replaceState({}, '', url.toString());
  }, [activeTab]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // API呼び出し（全注文取得）
      const response = await fetch('/api/member/orders', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const { data } = await response.json();
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('注文の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  // Count orders by tab
  const activeCount = orders.filter(o => ACTIVE_STATUSES.includes(o.status)).length;
  const historyCount = orders.filter(o => HISTORY_STATUSES.includes(o.status)).length;
  const reorderCount = orders.filter(o => REORDER_STATUSES.includes(o.status)).length;

  // Apply filters based on active tab
  useEffect(() => {
    let filtered = [...orders];

    // Apply tab-based status filter
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(o => ACTIVE_STATUSES.includes(o.status));
        break;
      case 'history':
        filtered = filtered.filter(o => HISTORY_STATUSES.includes(o.status));
        break;
      case 'reorder':
        filtered = filtered.filter(o => REORDER_STATUSES.includes(o.status));
        break;
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.order_number?.toLowerCase().includes(searchLower) ||
          order.orderNumber?.toLowerCase().includes(searchLower) ||
          order.quotation_number?.toLowerCase().includes(searchLower) ||
          order.quotationNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const days = filters.dateRange === '7days' ? 7 : filters.dateRange === '30days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.created_at || order.createdAt);
        return orderDate >= cutoffDate;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          const dateA = new Date(a.created_at || a.createdAt);
          const dateB = new Date(b.created_at || b.createdAt);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'amount':
          const amountA = a.total_amount || a.totalAmount || 0;
          const amountB = b.total_amount || b.totalAmount || 0;
          comparison = amountA - amountB;
          break;
        case 'status':
          comparison = (a.status || '').localeCompare(b.status || '');
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredOrders(filtered);
  }, [orders, filters, activeTab]);

  // Show loading state (skeleton + spinner for better perceived performance)
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-5 w-1/3 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
            <div className="h-10 w-full bg-gray-100 rounded" />
          </Card>
        ))}
        <div className="flex items-center justify-center gap-2 text-sm text-text-muted py-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>注文一覧を読み込み中...</span>
        </div>
      </div>
    );
  }

  const pageTitle = activeTab === 'active' ? '処理中の注文' : activeTab === 'history' ? '注文履歴' : '再注文';
  const pageDescription = activeTab === 'active'
    ? '現在処理中の注文一覧'
    : activeTab === 'history'
    ? '全ての注文履歴'
    : '過去の注文から再注文';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{pageTitle}</h1>
          <p className="text-text-muted mt-1">{pageDescription}</p>
        </div>
        {activeTab !== 'reorder' && (
          <Button variant="primary" onClick={() => (window.location.href = '/quote-simulator')} data-testid="new-quotation-button">
            <span className="mr-2">+</span>新規見積
          </Button>
        )}
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {/* Tab Navigation */}
      <Card className="p-4">
        <div className="flex gap-2 flex-wrap">
          <TabButton
            active={activeTab === 'active'}
            onClick={() => setActiveTab('active')}
            icon={<Clock className="w-4 h-4" />}
            label="処理中"
            count={activeCount}
          />
          <TabButton
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            icon={<FileText className="w-4 h-4" />}
            label="履歴"
            count={historyCount}
          />
          <TabButton
            active={activeTab === 'reorder'}
            onClick={() => setActiveTab('reorder')}
            icon={<RefreshCw className="w-4 h-4" />}
            label="再注文"
            count={reorderCount}
          />
        </div>
      </Card>

      {/* Filter Controls (not for reorder tab) */}
      {activeTab !== 'reorder' && (
        <Card className="p-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              type="text"
              placeholder="注文番号・見積番号で検索..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Filter options row */}
          <div className="flex flex-wrap gap-4">
            {/* Date range filter */}
            <div>
              <label className="text-xs text-text-muted mb-2 block">期間</label>
              <div className="relative">
                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as FilterState['dateRange'] })}
                  className="appearance-none bg-bg-secondary border border-border-secondary rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {DATE_RANGE_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Sort options */}
            <div>
              <label className="text-xs text-text-muted mb-2 block">ソート</label>
              <div className="relative">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setFilters({ ...filters, sortBy: sortBy as FilterState['sortBy'], sortOrder: sortOrder as FilterState['sortOrder'] });
                  }}
                  className="appearance-none bg-bg-secondary border border-border-secondary rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results count */}
      <div className="text-sm text-text-muted">
        {filteredOrders.length} 件の注文
      </div>

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
    </div>
  );
}

// Suspense boundary for useSearchParams
export function OrdersClient(props: OrdersClientProps) {
  return (
    <Suspense fallback={<PageLoadingState isLoading={true} message="注文一覧を読み込み中..." />}>
      <OrdersClientContent {...props} />
    </Suspense>
  );
}

/**
 * Actual default export for Server Component to import
 */
export { OrdersClient as default };
