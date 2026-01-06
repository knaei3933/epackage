/**
 * Orders Page
 *
 * 注文一覧ページ
 * - 注文一覧表示
 * - ステータス管理
 * - 検索・フィルタリング・ソート (B2B integration)
 * - 進捗状況表示 (B2B integration)
 * - 見積書からのリンク
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Eye, Search, Filter, ChevronDown, Package, Truck, CheckCircle, Clock, FileText, XCircle } from 'lucide-react';
import type { OrderStatus } from '@/types/order-status';
import { safeMap } from '@/lib/array-helpers';

// =====================================================
// Types
// =====================================================

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
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
  progress_percentage?: number;
  shipments?: {
    tracking_number: string | null;
    carrier_name: string | null;
  } | null;
}

interface FilterState {
  status: OrderStatus | 'all';
  searchTerm: string;
  dateRange: 'all' | '7days' | '30days' | '90days';
  sortBy: 'date' | 'amount' | 'status';
  sortOrder: 'asc' | 'desc';
}

// =====================================================
// Constants
// =====================================================

// Enhanced status labels with icons (B2B integration)
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: '保留中', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock },
  data_received: { label: 'データ受領', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: FileText },
  processing: { label: '処理中', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
  manufacturing: { label: '製造中', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Package },
  quality_check: { label: '品質検査', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: CheckCircle },
  shipped: { label: '発送済み', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
  delivered: { label: '配達済み', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  cancelled: { label: 'キャンセル済み', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
  on_hold: { label: '一時停止', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', icon: Clock },
  completed: { label: '完了', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
};

// B2B workflow status mapping
const B2B_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: '登録待', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', icon: Clock },
  QUOTATION: { label: '見積作成', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: FileText },
  DATA_RECEIVED: { label: 'データ入稿', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: CheckCircle },
  WORK_ORDER: { label: '作業指示', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: FileText },
  CONTRACT_SENT: { label: '契約送付', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: FileText },
  CONTRACT_SIGNED: { label: '契約締結', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: CheckCircle },
  PRODUCTION: { label: '製造中', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Package },
  STOCK_IN: { label: '入庫済', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  SHIPPED: { label: '出荷済', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: Truck },
  DELIVERED: { label: '納品完了', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  CANCELLED: { label: 'キャンセル', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
};

const STATUS_FILTERS = [
  { value: 'all', label: 'すべて' },
  { value: 'pending', label: '保留中' },
  { value: 'data_received', label: 'データ受領' },
  { value: 'processing', label: '処理中' },
  { value: 'manufacturing', label: '製造中' },
  { value: 'shipped', label: '発送済み' },
  { value: 'delivered', label: '配達済み' },
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
// Helper Components
// =====================================================

// Status Badge with Icon (B2B integration)
function StatusBadge({ status }: { status: string }) {
  // Try B2B status first, then fall back to regular status
  const config = B2B_STATUS_CONFIG[status] || STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
}

// Progress Bar (B2B integration)
function ProgressBar({ progress }: { progress: number }) {
  if (typeof progress !== 'number') return null;

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

// =====================================================
// Page Component
// =====================================================

export default function OrdersPage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // B2B integration: Enhanced filters
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    searchTerm: '',
    dateRange: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Redirect to login if not authenticated after loading completes
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[OrdersPage] User not authenticated, redirecting to login');
      router.push('/auth/signin?redirect=/member/orders');
    }
  }, [authLoading, user, router]);

  const fetchOrders = async () => {
    if (authLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      if (!user?.id) {
        throw new Error('Not authenticated');
      }

      // API 호출
      const params = new URLSearchParams();
      if (filters.status !== 'all') {
        params.append('status', filters.status);
      }

      const response = await fetch(`/api/member/orders?${params}`, {
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
    // Only fetch when auth context is fully loaded
    if (!authLoading) {
      fetchOrders();
    }
  }, [filters.status, user?.id, authLoading]);

  // B2B integration: Apply filters and sorting
  useEffect(() => {
    let filtered = [...orders];

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
  }, [orders, filters]);

  // Show loading state while auth context is initializing
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-text-muted">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">注文一覧</h1>
          <p className="text-text-muted mt-1">注文の一覧とステータス確認</p>
        </div>
        <Button variant="primary" onClick={() => (window.location.href = '/quote-simulator')}>
          <span className="mr-2">+</span>新規見積
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {/* B2B integration: Enhanced filter controls */}
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
          {/* Status filters */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-text-muted mb-2 block">ステータス</label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters({ ...filters, status: option.value as OrderStatus | 'all' })}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filters.status === option.value
                      ? 'bg-primary text-white'
                      : 'bg-bg-secondary text-text-muted hover:bg-border-secondary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

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

      {/* Results count */}
      <div className="text-sm text-text-muted">
        {filteredOrders.length} 件の注文
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-text-muted">
            {orders.length === 0
              ? '注文がありません'
              : '検索条件に一致する注文がありません'}
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => {
              setFilters({ status: 'all', searchTerm: '', dateRange: 'all', sortBy: 'date', sortOrder: 'desc' });
            }}
          >
            フィルターをクリア
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-medium text-text-primary">
                      {order.order_number || order.orderNumber}
                    </span>
                    <StatusBadge status={order.status as string} />
                  </div>

                  {(order.quotation_number || order.quotationNumber) && (
                    <p className="text-sm text-text-muted mb-2">
                      見積番号: {order.quotation_number || order.quotationNumber}
                    </p>
                  )}

                  {/* B2B integration: Progress bar */}
                  {typeof order.progress_percentage === 'number' && (
                    <div className="mb-3">
                      <ProgressBar progress={order.progress_percentage} />
                      <p className="text-xs text-text-muted mt-1">進捗: {order.progress_percentage}%</p>
                    </div>
                  )}

                  <div className="text-sm text-text-muted space-y-1 mb-3">
                    {safeMap((order.items || []).slice(0, 3), (item: any) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span>{item.product_name || item.productName}</span>
                        <span className="text-border-secondary">x{item.quantity}</span>
                        <span>
                          {(item.total_price || (item.unit_price || item.unitPrice) * item.quantity).toLocaleString()}円
                        </span>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <p className="text-text-muted">
                        他 {order.items.length - 3} 点
                      </p>
                    )}
                  </div>

                  <div className="text-lg font-semibold text-text-primary">
                    合計: {(order.total_amount || order.totalAmount || 0).toLocaleString()}円
                  </div>

                  {/* B2B integration: Shipment tracking info */}
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
