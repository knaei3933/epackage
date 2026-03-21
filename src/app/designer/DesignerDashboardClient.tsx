/**
 * Designer Dashboard Client Component
 *
 * デザイナーダッシュボードクライアント
 * - 注文一覧表示
 * - ステータスフィルタリング
 * - インタラクティブ操作
 *
 * @client
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDateJa } from '@/utils/formatters';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Filter,
  User,
  Calendar,
  Package,
  Loader2,
} from 'lucide-react';

// =====================================================
// Types
// =====================================================

interface DesignerOrderItem {
  id: string;
  product_name: string;
  quantity: number;
}

interface DesignerOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: DesignerOrderItem[];
}

interface StatusCounts {
  all: number;
  correction_in_progress: number;
  customer_approval_pending: number;
}

interface DesignerDashboardClientProps {
  designerEmail: string;
  designerName?: string;
  initialOrders: DesignerOrder[];
  initialStatus: string;
  statusCounts: StatusCounts;
}

// =====================================================
// Constants
// =====================================================

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  CORRECTION_IN_PROGRESS: {
    label: '教正作業中',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock,
  },
  CUSTOMER_APPROVAL_PENDING: {
    label: '顧客承認待ち',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: AlertCircle,
  },
  APPROVED: {
    label: '承認済み',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
};

const FILTER_OPTIONS = [
  { value: 'all', label: '全て', icon: Filter },
  { value: 'CORRECTION_IN_PROGRESS', label: '教正作業中', icon: Clock },
  { value: 'CUSTOMER_APPROVAL_PENDING', label: '顧客承認待ち', icon: AlertCircle },
];

// =====================================================
// Main Component
// =====================================================

export function DesignerDashboardClient({
  designerEmail,
  designerName,
  initialOrders,
  initialStatus,
  statusCounts,
}: DesignerDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [orders, setOrders] = useState<DesignerOrder[]>(initialOrders);
  const [isLoading, setIsLoading] = useState(false);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  // Handle status filter change
  const handleStatusChange = async (status: string) => {
    setSelectedStatus(status);
    setIsLoading(true);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }

    router.push(`/designer?${params.toString()}`);

    // Fetch filtered orders
    try {
      const response = await fetch(`/api/designer/orders?status=${status}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    return STATUS_LABELS[status] || {
      label: status,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: AlertCircle,
    };
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              ようこそ、{designerName || 'デザイナー'}さん
            </h1>
            <p className="text-slate-600 flex items-center gap-2">
              <User className="w-4 h-4" />
              {designerEmail}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">現在の担当注文</p>
            <p className="text-3xl font-bold text-blue-600">{statusCounts.all}</p>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-sm font-medium text-slate-700 flex items-center gap-2 mr-2">
            <Filter className="w-4 h-4" />
            ステータス:
          </span>
          {FILTER_OPTIONS.map((option) => {
            const Icon = option.icon;
            const count = statusCounts[option.value.toLowerCase() as keyof StatusCounts] || 0;

            return (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200 whitespace-nowrap
                  ${selectedStatus === option.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{option.label}</span>
                <span className={`
                  px-2 py-0.5 rounded-full text-xs
                  ${selectedStatus === option.value
                    ? 'bg-white/20'
                    : 'bg-slate-200'
                  }
                `}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">読み込み中...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            注文がありません
          </h3>
          <p className="text-slate-600">
            {selectedStatus === 'all'
              ? '現在割り当てられている注文はありません。'
              : '選択したステータスの注文はありません。'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Link
                key={order.id}
                href={`/designer/orders/${order.id}`}
                className="group bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Order Number & Status */}
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {order.order_number}
                      </h3>
                      <span className={`
                        flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border
                        ${statusInfo.color}
                      `}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{order.customer_name}</span>
                        <span className="text-slate-400">({order.customer_email})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{formatDateJa(order.created_at)}</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    {order.items && order.items.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Package className="w-4 h-4 text-slate-400" />
                        <div className="flex flex-wrap gap-2">
                          {order.items.map((item, index) => (
                            <span
                              key={item.id}
                              className="bg-slate-100 px-2 py-1 rounded text-xs"
                            >
                              {item.product_name} x {item.quantity}
                              {index < order.items.length - 1 && ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amount & Action */}
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-900 mb-2">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                      <Eye className="w-4 h-4" />
                      詳細を見る
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
