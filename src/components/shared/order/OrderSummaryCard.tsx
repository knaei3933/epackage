/**
 * Shared Order Summary Card Component
 * 共用注文サマリーカードコンポーネント
 *
 * Displays a summary of an order including status, progress, and key details
 * Used in both Portal and Member/Admin dashboards
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// =====================================================
// Types
// =====================================================

export type OrderStatus =
  | 'PENDING'
  | 'QUOTATION'
  | 'DATA_RECEIVED'
  | 'WORK_ORDER'
  | 'CONTRACT_SENT'
  | 'CONTRACT_SIGNED'
  | 'PRODUCTION'
  | 'STOCK_IN'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderAddress {
  prefecture: string;
  city: string;
  addressLine1?: string;
  addressLine2?: string;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price?: number;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  created_at: string;
  totalAmount: number;
  progress_percentage: number;
  estimatedDeliveryDate?: string;
  shippingAddress?: OrderAddress;
  items?: OrderItem[];
}

export interface OrderSummaryCardProps {
  order: OrderSummary;
  onClick?: () => void;
  detailPath?: string;
  locale?: 'ja' | 'en';
  className?: string;
}

// =====================================================
// Constants
// =====================================================

const ORDER_STATUS_LABELS: Record<OrderStatus, { ja: string; en: string }> = {
  PENDING: { ja: '保留中', en: 'Pending' },
  QUOTATION: { ja: '見積作成中', en: 'Quotation' },
  DATA_RECEIVED: { ja: 'データ受領', en: 'Data Received' },
  WORK_ORDER: { ja: '作業指示書', en: 'Work Order' },
  CONTRACT_SENT: { ja: '契約送付済', en: 'Contract Sent' },
  CONTRACT_SIGNED: { ja: '契約締結', en: 'Contract Signed' },
  PRODUCTION: { ja: '製造中', en: 'In Production' },
  STOCK_IN: { ja: '検品済', en: 'Stock In' },
  SHIPPED: { ja: '発送済', en: 'Shipped' },
  DELIVERED: { ja: '配達済', en: 'Delivered' },
  CANCELLED: { ja: 'キャンセル', en: 'Cancelled' },
};

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
  QUOTATION: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
  DATA_RECEIVED: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700',
  WORK_ORDER: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700',
  CONTRACT_SENT: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-700',
  CONTRACT_SIGNED: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
  PRODUCTION: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700',
  STOCK_IN: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-700',
  SHIPPED: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-700',
  DELIVERED: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
};

// =====================================================
// Helper Functions
// =====================================================

function getOrderStatusLabel(status: OrderStatus, locale: 'ja' | 'en' = 'ja'): string {
  return ORDER_STATUS_LABELS[status]?.[locale] || status;
}

function getOrderStatusColor(status: OrderStatus): string {
  return ORDER_STATUS_COLORS[status] || ORDER_STATUS_COLORS.PENDING;
}

function formatCurrency(amount: number): string {
  return `${amount.toLocaleString()}円`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// =====================================================
// Component
// =====================================================

export function OrderSummaryCard({
  order,
  onClick,
  detailPath = `/member/orders/${order.id}`,
  locale = 'ja',
  className
}: OrderSummaryCardProps) {
  const statusLabel = getOrderStatusLabel(order.status, locale);
  const statusColor = getOrderStatusColor(order.status);
  const labels = locale === 'ja' ? {
    createdAt: '作成日',
    progress: '進捗',
    totalAmount: '合計金額',
    estimatedDelivery: '納品予定日',
    destination: '配送先',
    viewDetails: '詳細を見る'
  } : {
    createdAt: 'Created',
    progress: 'Progress',
    totalAmount: 'Total',
    estimatedDelivery: 'Est. Delivery',
    destination: 'Destination',
    viewDetails: 'View Details'
  };

  const CardWrapper = onClick ? 'button' : Link;
  const wrapperProps = onClick
    ? { onClick, className: 'w-full text-left' }
    : { href: detailPath, className: 'w-full block' };

  return (
    <CardWrapper {...(wrapperProps as any)}>
      <div className={cn(
        'bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700',
        'p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700',
        'transition-all',
        className
      )}>
        {/* Order Number and Status */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {order.orderNumber}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {labels.createdAt}: {formatDate(order.created_at)}
            </p>
          </div>
          <span className={cn('px-3 py-1 text-xs font-medium rounded-full border', statusColor)}>
            {statusLabel}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
            <span>{labels.progress}</span>
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
            <span className="text-slate-600 dark:text-slate-400">{labels.totalAmount}:</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>

          {order.estimatedDeliveryDate && (
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{labels.estimatedDelivery}:</span>
              <span className="text-slate-900 dark:text-white">
                {formatDate(order.estimatedDeliveryDate)}
              </span>
            </div>
          )}

          {order.shippingAddress && (
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-400">{labels.destination}:</span>
              <span className="text-slate-900 dark:text-white truncate max-w-[200px]">
                {order.shippingAddress.prefecture} {order.shippingAddress.city}
              </span>
            </div>
          )}
        </div>

        {/* Action Arrow */}
        <div className="mt-4 flex items-center justify-end text-sm text-blue-600 dark:text-blue-400">
          {labels.viewDetails}
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </CardWrapper>
  );
}

export default OrderSummaryCard;
