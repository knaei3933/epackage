/**
 * Order Info Accordion Component
 *
 * 注文情報アコーディオンコンポーネント
 * - 3列グリッドで注文情報、顧客情報、ステータス履歴を表示
 * - モバイル: 1列、タブレット以上: 3列
 *
 * @client
 */

'use client';

import { Card } from '@/components/ui/Card';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';
import { OrderStatusBadge } from '@/components/orders';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Package,
  FileText,
} from 'lucide-react';
import type { Order } from '@/types/dashboard';

// =====================================================
// Types
// =====================================================

interface OrderInfoAccordionProps {
  order: Order;
  statusHistory: any[];
}

// =====================================================
// Helper Functions
// =====================================================

function isValidDate(date: any): date is string | number | Date {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime());
}

function formatDate(date: any, format: 'full' | 'relative' = 'full'): string {
  if (!isValidDate(date)) {
    return '不明';
  }
  const d = new Date(date);
  if (format === 'full') {
    return d.toLocaleString('ja-JP');
  }
  try {
    return formatDistanceToNow(d, { addSuffix: true, locale: ja });
  } catch {
    return d.toLocaleString('ja-JP');
  }
}

// =====================================================
// Main Component
// =====================================================

export function OrderInfoAccordion({ order, statusHistory }: OrderInfoAccordionProps) {
  return (
    <Card className="p-4">
      {/* 3列グリッドレイアウト: モバイル1列、タブレット以上3列 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* 列1: 注文情報 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border-secondary">
            <Calendar className="w-5 h-5 text-text-muted" />
            <h3 className="font-semibold text-text-primary">注文情報</h3>
            <OrderStatusBadge status={order.status} locale="ja" size="sm" className="ml-auto" />
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-text-muted flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4" />
                注文日時
              </dt>
              <dd className="text-text-primary ml-6">
                {formatDate(order.createdAt, 'full')}
                <span className="text-text-muted ml-2">
                  ({formatDate(order.createdAt, 'relative')})
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-text-muted flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" />
                最終更新
              </dt>
              <dd className="text-text-primary ml-6">
                {formatDate(order.updatedAt, 'full')}
              </dd>
            </div>
            {order.shippedAt && (
              <div>
                <dt className="text-text-muted flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4" />
                  発送日時
                </dt>
                <dd className="text-text-primary ml-6">
                  {formatDate(order.shippedAt, 'full')}
                </dd>
              </div>
            )}
            {order.deliveredAt && (
              <div>
                <dt className="text-text-muted flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4" />
                  配送完了日時
                </dt>
                <dd className="text-text-primary ml-6">
                  {formatDate(order.deliveredAt, 'full')}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* 列2: 顧客情報 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border-secondary">
            <User className="w-5 h-5 text-text-muted" />
            <h3 className="font-semibold text-text-primary">顧客情報</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-text-muted flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4" />
                注文番号
              </dt>
              <dd className="text-text-primary font-medium ml-6">
                {order.orderNumber}
              </dd>
            </div>
            {order.customer_name && (
              <div>
                <dt className="text-text-muted flex items-center gap-2 mb-1">
                  <User className="w-4 h-4" />
                  顧客名
                </dt>
                <dd className="text-text-primary ml-6">
                  {order.customer_name}
                </dd>
              </div>
            )}
            {order.customer_email && (
              <div>
                <dt className="text-text-muted flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" />
                  メールアドレス
                </dt>
                <dd className="text-text-primary ml-6 break-all">
                  {order.customer_email}
                </dd>
              </div>
            )}
            {order.customer_phone && (
              <div>
                <dt className="text-text-muted flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4" />
                  電話番号
                </dt>
                <dd className="text-text-primary ml-6">
                  {order.customer_phone}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* 列3: ステータス履歴 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border-secondary">
            <Clock className="w-5 h-5 text-text-muted" />
            <h3 className="font-semibold text-text-primary">ステータス履歴</h3>
            <span className="text-xs text-muted-foreground ml-auto">
              {statusHistory.length}件
            </span>
          </div>
          <div className="text-sm">
            <OrderStatusTimeline
              statusHistory={statusHistory}
              currentStatus={order.status}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
