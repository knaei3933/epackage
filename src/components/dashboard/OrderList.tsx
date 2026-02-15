'use client'

/**
 * Order List Component
 *
 * 注文一覧表示コンポーネント
 * - ステータスバッジ付き注文リスト
 * - 検索・フィルタ・ソート機能
 * - ページネーション
 * - PDFエクスポート機能
 */

import { useState } from 'react';
import { Card, Badge } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Order, OrderStatus, OrderFilters, PaginationParams } from '@/types/dashboard';
import { OrderStatusLabels } from '@/types/database';
import { OrderHistoryPDFButton } from '@/components/orders/OrderHistoryPDFButton';
import { safeMap } from '@/lib/array-helpers';

// =====================================================
// Types
// =====================================================

export interface OrderListProps {
  orders: Order[];
  total: number;
  pageSize?: number;
}

type SortOption = 'createdAt-desc' | 'createdAt-asc' | 'orderNumber-asc' | 'totalAmount-desc' | 'totalAmount-asc';

// =====================================================
// Helper Functions
// =====================================================

/**
 * Convert order status to uppercase for consistent handling
 * Handles both legacy (lowercase) and new (uppercase) formats
 */
function normalizeOrderStatus(status: string): OrderStatus {
  const upperStatus = status.toUpperCase() as OrderStatus;
  // Validate it's a valid OrderStatus
  const validStatuses: OrderStatus[] = [
    'PENDING', 'QUOTATION', 'DATA_RECEIVED', 'WORK_ORDER',
    'CONTRACT_SENT', 'CONTRACT_SIGNED', 'PRODUCTION', 'STOCK_IN',
    'SHIPPED', 'DELIVERED', 'CANCELLED'
  ];
  if (validStatuses.includes(upperStatus)) {
    return upperStatus;
  }
  // Fallback mapping for legacy values
  const legacyMap: Record<string, OrderStatus> = {
    'PENDING': 'PENDING',
    'PROCESSING': 'PRODUCTION',
    'MANUFACTURING': 'PRODUCTION',
    'READY': 'WORK_ORDER',
    'SHIPPED': 'SHIPPED',
    'DELIVERED': 'DELIVERED',
    'CANCELLED': 'CANCELLED',
  };
  return legacyMap[upperStatus] || 'PENDING';
}

/**
 * Get status display label from OrderStatusLabels
 */
function getStatusLabel(status: string): string {
  const normalized = normalizeOrderStatus(status);
  return OrderStatusLabels[normalized]?.ja || status;
}

/**
 * Get badge variant based on status
 */
function getStatusVariant(status: string): 'warning' | 'info' | 'success' | 'secondary' | 'error' | 'default' {
  const normalized = normalizeOrderStatus(status);
  const variantMap: Record<OrderStatus, 'warning' | 'info' | 'success' | 'secondary' | 'error' | 'default'> = {
    PENDING: 'warning',
    QUOTATION: 'info',
    DATA_RECEIVED: 'info',
    WORK_ORDER: 'secondary',
    CONTRACT_SENT: 'info',
    CONTRACT_SIGNED: 'success',
    PRODUCTION: 'info',
    STOCK_IN: 'secondary',
    SHIPPED: 'success',
    DELIVERED: 'default',
    CANCELLED: 'error',
  };
  return variantMap[normalized] || 'default';
}

const sortOptions = [
  { value: 'createdAt-desc', label: '新しい順' },
  { value: 'createdAt-asc', label: '古い順' },
  { value: 'orderNumber-asc', label: '注文番号順' },
  { value: 'totalAmount-desc', label: '金額が高い順' },
  { value: 'totalAmount-asc', label: '金額が安い順' },
];

// =====================================================
// Component
// =====================================================

export function OrderList({ orders, total, pageSize = 10 }: OrderListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('createdAt-desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique statuses from orders for filter buttons
  const uniqueStatuses = Array.from(new Set(orders.map(o => normalizeOrderStatus(o.status))));

  // フィルタリング
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === '' ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    const normalizedStatus = normalizeOrderStatus(order.status);
    const matchesStatus = selectedStatus === 'all' || normalizedStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // ソート
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const [field, order] = sortBy.split('-') as [keyof Order, 'asc' | 'desc'];

    if (field === 'orderNumber') {
      return order === 'asc'
        ? a.orderNumber.localeCompare(b.orderNumber)
        : b.orderNumber.localeCompare(a.orderNumber);
    }

    const aValue = a[field];
    const bValue = b[field];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return order === 'asc'
        ? new Date(aValue).getTime() - new Date(bValue).getTime()
        : new Date(bValue).getTime() - new Date(aValue).getTime();
    }

    return 0;
  });

  // ページネーション
  const totalPages = Math.ceil(sortedOrders.length / pageSize);
  const paginatedOrders = sortedOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* フィルターバー */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 検索 */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="注文番号または商品名で検索..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ maxWidth: '298px' }}
            />
          </div>

          {/* ステータスフィルター */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-bg-secondary text-text-muted hover:bg-border-secondary'
              }`}
            >
              すべて
            </button>
            {uniqueStatuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedStatus === status
                    ? 'bg-primary text-white'
                    : 'bg-bg-secondary text-text-muted hover:bg-border-secondary'
                }`}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>

          {/* ソート */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-border-secondary rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* アクションバー：結果件数 + PDFダウンロード */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-text-muted">
          {sortedOrders.length}件の注文（全{total}件中）
        </div>
        <OrderHistoryPDFButton
          orderIds={sortedOrders.map(order => order.id)}
          filename={`注文履歴_${new Date().toISOString().split('T')[0]}.pdf`}
        />
      </div>

      {/* 注文リスト */}
      {paginatedOrders.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-text-muted">注文が見つかりませんでした</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {paginatedOrders.map((order) => (
            <Card key={order.id} className="p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* 注文番号とステータス */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-text-primary">{order.orderNumber}</span>
                    <Badge variant={getStatusVariant(order.status)} size="sm">
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>

                  {/* 商品一覧 */}
                  <div className="text-sm text-text-muted space-y-1">
                    {safeMap(order.items, (item, index) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span>{item.productName}</span>
                        <span className="text-text-muted">x{item.quantity}</span>
                        {order.items && index < order.items.length - 1 && <span className="text-border-secondary">/</span>}
                      </div>
                    ))}
                  </div>

                  {/* 合計金額 */}
                  <div className="mt-2 text-sm font-medium text-text-primary">
                    合計: {order.totalAmount.toLocaleString()}円
                  </div>
                </div>

                {/* 注文日とアクション */}
                <div className="text-right shrink-0">
                  <div className="text-xs text-text-muted mb-2">
                    {formatDistanceToNow(new Date(order.createdAt), {
                      addSuffix: true,
                      locale: ja,
                    })}
                  </div>
                  <a
                    href={`/member/orders/${order.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    詳細を見る
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-border-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-secondary"
          >
            前へ
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 text-sm border border-border-secondary rounded-lg ${
                currentPage === page
                  ? 'bg-primary text-white border-primary'
                  : 'hover:bg-bg-secondary'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-border-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-secondary"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
