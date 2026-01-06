/**
 * Order Summary Card Component
 * 注文サマリーカード
 *
 * Displays a summary of an order including status, progress, and key details
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { type PortalOrder } from '@/types/portal';
import { getOrderStatusLabel, getOrderStatusColor, formatCurrency, formatDate } from '@/types/portal';
import { cn } from '@/lib/utils';

interface OrderSummaryCardProps {
  order: PortalOrder;
  onClick?: () => void;
}

export function OrderSummaryCard({ order, onClick }: OrderSummaryCardProps) {
  const statusLabel = getOrderStatusLabel(order.status, 'ja');
  const statusColor = getOrderStatusColor(order.status);

  const CardWrapper = onClick ? 'button' : Link;
  const wrapperProps = onClick
    ? { onClick, className: 'w-full text-left' }
    : { href: `/portal/orders/${order.id}`, className: 'w-full block' };

  return (
    <CardWrapper {...(wrapperProps as any)}>
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all">
        {/* Order Number and Status */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {order.orderNumber}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              作成日: {formatDate(order.created_at, 'ja')}
            </p>
          </div>
          <span className={cn('px-3 py-1 text-xs font-medium rounded-full border', statusColor)}>
            {statusLabel}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
            <span>進捗</span>
            <span>{order.progress_percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${order.progress_percentage}%` }}
            />
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">合計金額:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>

          {order.estimatedDeliveryDate && (
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">納品予定日:</span>
              <span className="text-slate-900 dark:text-white">
                {formatDate(order.estimatedDeliveryDate, 'ja')}
              </span>
            </div>
          )}

          {order.shippingAddress && (
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">配送先:</span>
              <span className="text-slate-900 dark:text-white truncate max-w-[200px]">
                {order.shippingAddress.prefecture} {order.shippingAddress.city}
              </span>
            </div>
          )}
        </div>

        {/* Action Arrow */}
        <div className="mt-4 flex items-center justify-end text-sm text-blue-600 dark:text-blue-400">
          詳細を見る
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </CardWrapper>
  );
}
