'use client';

/**
 * Dashboard Card Components
 *
 * ダッシュボード用カードコンポーネント
 * - 統計カード
 * - お知らせカード
 * - 最近の注文・見積・サンプルカード
 */

import { Card } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Order, Quotation, DashboardSampleRequest, Inquiry, Announcement } from '@/types/dashboard';

// =====================================================
// Dashboard Stats Card
// =====================================================

export interface DashboardStatsCardProps {
  title: string;
  count: number;
  total: number;
  href: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'indigo';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-600 dark:text-green-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-600 dark:text-orange-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-600 dark:text-purple-400',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
};

export function DashboardStatsCard({
  title,
  count,
  total,
  href,
  icon,
  color,
}: DashboardStatsCardProps) {
  const classes = colorClasses[color];

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        window.location.href = href;
      }}
      className="block cursor-pointer"
    >
      <Card className={`p-4 ${classes.bg} ${classes.border} border hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-muted">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${classes.text}`}>
              {count}
              <span className="text-sm font-normal text-text-muted ml-1">
                / {total}
              </span>
            </p>
          </div>
          <span className="text-2xl">{icon}</span>
        </div>
      </Card>
    </a>
  );
}

// =====================================================
// Announcement Card
// =====================================================

export interface AnnouncementCardProps {
  announcements: Announcement[];
}

const categoryLabels = {
  maintenance: 'メンテナンス',
  update: 'アップデート',
  notice: 'お知らせ',
  promotion: 'キャンペーン',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-red-100 text-red-700',
};

export function AnnouncementCard({ announcements }: AnnouncementCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">お知らせ</h2>
        <a
          href="/member/announcements"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/member/announcements';
          }}
          className="text-sm text-primary hover:underline cursor-pointer"
        >
          すべて見る
        </a>
      </div>
      <div className="space-y-3">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="p-3 rounded-lg border border-border-secondary hover:bg-bg-secondary transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    priorityColors[announcement.priority]
                  }`}>
                    {announcement.priority === 'high' && '重要'}
                    {announcement.priority === 'medium' && '通常'}
                    {announcement.priority === 'low' && 'その他'}
                  </span>
                  <span className="text-xs text-text-muted">
                    {categoryLabels[announcement.category]}
                  </span>
                </div>
                <h3 className="font-medium text-text-primary">{announcement.title}</h3>
                <p className="text-sm text-text-muted mt-1 line-clamp-2">
                  {announcement.content}
                </p>
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {(() => {
                  const publishedDate = new Date(announcement.publishedAt);
                  // Validate date before formatting
                  if (isNaN(publishedDate.getTime())) {
                    return '日付不明';
                  }
                  return formatDistanceToNow(publishedDate, {
                    addSuffix: true,
                    locale: ja,
                  });
                })()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// =====================================================
// Recent Orders Card
// =====================================================

export interface RecentOrdersCardProps {
  orders: Order[];
}

const orderStatusLabels = {
  pending: '受付待',
  processing: '処理中',
  manufacturing: '製造中',
  ready: '発送待',
  shipped: '発送完了',
  delivered: '配送完了',
  cancelled: 'キャンセル',
};

const orderStatusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  manufacturing: 'bg-indigo-100 text-indigo-700',
  ready: 'bg-purple-100 text-purple-700',
  shipped: 'bg-green-100 text-green-700',
  delivered: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function RecentOrdersCard({ orders }: RecentOrdersCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">新規注文</h2>
        <a
          href="/member/orders/new"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/member/orders/new';
          }}
          className="text-sm text-primary hover:underline cursor-pointer"
        >
          すべて見る
        </a>
      </div>
      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-3 rounded-lg border border-border-secondary hover:bg-bg-secondary transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-text-primary">
                    {order.orderNumber}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${orderStatusColors[order.status.toLowerCase() as keyof typeof orderStatusColors]}`}>
                    {orderStatusLabels[order.status.toLowerCase() as keyof typeof orderStatusLabels]}
                  </span>
                </div>
                <p className="text-sm text-text-muted">
                  {order.totalAmount.toLocaleString()}円
                </p>
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {formatDistanceToNow(new Date(order.createdAt), {
                  addSuffix: true,
                  locale: ja,
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// =====================================================
// Recent Quotations Card
// =====================================================

export interface RecentQuotationsCardProps {
  quotations: Quotation[];
}

const quotationStatusLabels = {
  draft: '作成中',
  sent: '送信済',
  approved: '承認済',
  rejected: '却下',
  expired: '期限切れ',
};

const quotationStatusColors = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired: 'bg-orange-100 text-orange-700',
};

export function RecentQuotationsCard({ quotations }: RecentQuotationsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">見積依頼</h2>
        <a
          href="/member/quotations"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/member/quotations';
          }}
          className="text-sm text-primary hover:underline cursor-pointer"
        >
          すべて見る
        </a>
      </div>
      <div className="space-y-3">
        {quotations.map((quotation) => (
          <div
            key={quotation.id}
            className="p-3 rounded-lg border border-border-secondary hover:bg-bg-secondary transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-text-primary">
                    {quotation.quotationNumber}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${quotationStatusColors[quotation.status]}`}>
                    {quotationStatusLabels[quotation.status]}
                  </span>
                </div>
                <p className="text-sm text-text-muted">
                  {quotation.totalAmount.toLocaleString()}円
                </p>
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {formatDistanceToNow(new Date(quotation.createdAt), {
                  addSuffix: true,
                  locale: ja,
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// =====================================================
// Recent Samples Card
// =====================================================

export interface RecentSamplesCardProps {
  samples: DashboardSampleRequest[];
}

const sampleStatusLabels = {
  received: '受付済',
  processing: '処理中',
  shipped: '発送済',
  delivered: '配送完了',
  cancelled: 'キャンセル',
};

const sampleStatusColors = {
  received: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function RecentSamplesCard({ samples }: RecentSamplesCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-primary">サンプル依頼</h2>
        <a
          href="/member/samples"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = '/member/samples';
          }}
          className="text-sm text-primary hover:underline cursor-pointer"
        >
          すべて見る
        </a>
      </div>
      <div className="space-y-3">
        {samples.map((sample) => (
          <div
            key={sample.id}
            className="p-3 rounded-lg border border-border-secondary hover:bg-bg-secondary transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-text-primary">
                    {sample.requestNumber}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${sampleStatusColors[sample.status]}`}>
                    {sampleStatusLabels[sample.status]}
                  </span>
                </div>
                <p className="text-sm text-text-muted">
                  {sample.samples.length}点
                </p>
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap">
                {formatDistanceToNow(new Date(sample.createdAt), {
                  addSuffix: true,
                  locale: ja,
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
