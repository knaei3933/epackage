'use client';

/**
 * B2B 顧客ポータルダッシュボード (Customer Portal Dashboard)
 * 注文、見積、サンプル依頼統合管理
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui';
import {
  FileText,
  Package,
  ClipboardCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Eye,
  Download,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import type { OrderStatus } from '@/types/database';
import { OrderStatusLabels } from '@/types/database';

// Types
interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalQuotations: number;
  pendingQuotations: number;
  totalSamples: number;
  processingSamples: number;
}

interface OrderSummary {
  id: string;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  total_amount: number;
  progress_percentage: number;
}

interface QuotationSummary {
  id: string;
  quotation_number: string;
  status: string;
  created_at: string;
  total_amount: number;
  valid_until: string;
}

interface SampleSummary {
  id: string;
  sample_number: string;
  status: string;
  created_at: string;
  product_count: number;
}

interface CustomerDashboardProps {
  userId: string;
}

type TabType = 'overview' | 'orders' | 'quotations' | 'samples';

export default function CustomerDashboard({ userId }: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [quotations, setQuotations] = useState<QuotationSummary[]>([]);
  const [samples, setSamples] = useState<SampleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load stats
      const statsResponse = await fetch('/api/member/dashboard/stats');
      const statsResult = await statsResponse.json();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // Load orders
      const ordersResponse = await fetch('/api/member/orders?limit=10');
      const ordersResult = await ordersResponse.json();
      if (ordersResult.success) {
        setOrders(ordersResult.data.orders || []);
      }

      // Load quotations
      const quotesResponse = await fetch('/api/member/quotations?limit=10');
      const quotesResult = await quotesResponse.json();
      if (quotesResult.success) {
        setQuotations(quotesResult.data.quotations || []);
      }

      // Load samples
      const samplesResponse = await fetch('/api/member/samples?limit=10');
      const samplesResult = await samplesResponse.json();
      if (samplesResult.success) {
        setSamples(samplesResult.data.samples || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  }, []);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  }, []);

  const getOrderStatusIcon = useCallback((status: OrderStatus) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'SHIPPED':
      case 'STOCK_IN':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'PRODUCTION':
        return <Clock className="w-5 h-5 text-orange-500 animate-pulse" />;
      case 'CONTRACT_SIGNED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  }, []);

  const getQuotationStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'SENT':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  }, []);

  const getSampleStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'SHIPPED':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'PROCESSING':
        return <Clock className="w-5 h-5 text-orange-500 animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  }, []);

  return (
    <LoadingState
      isLoading={loading}
      error={null}
      message="読み込み中..."
      fullScreen
    >
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">顧客ポータル</h1>
        <p className="text-gray-600">注文、見積、サンプル依頼を一箇所で管理</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          概要
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          注文
        </button>
        <button
          onClick={() => setActiveTab('quotations')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'quotations'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          見積
        </button>
        <button
          onClick={() => setActiveTab('samples')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'samples'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          サンプル
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">全注文</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalOrders}</p>
                </div>
                <Package className="w-10 h-10 text-blue-500" />
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                進行中: {stats.pendingOrders}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">完了注文</p>
                  <p className="text-2xl font-bold mt-1">{stats.completedOrders}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div className="mt-4 flex items-center text-sm text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                完了率: {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">見積依頼</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalQuotations}</p>
                </div>
                <FileText className="w-10 h-10 text-orange-500" />
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                待機中: {stats.pendingQuotations}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">サンプル依頼</p>
                  <p className="text-2xl font-bold mt-1">{stats.totalSamples}</p>
                </div>
                <ClipboardCheck className="w-10 h-10 text-purple-500" />
              </div>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                処理中: {stats.processingSamples}
              </div>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">最近の注文</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('orders')}
              >
                すべて表示
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getOrderStatusIcon(order.status)}
                    <div>
                      <p className="font-medium">{order.order_number}</p>
                      <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${order.progress_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{order.progress_percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-center text-gray-500 py-8">注文履歴がありません。</p>
              )}
            </div>
          </Card>

          {/* Recent Quotations */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">最近の見積</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('quotations')}
              >
                すべて表示
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="space-y-3">
              {quotations.slice(0, 5).map((quotation) => (
                <div
                  key={quotation.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getQuotationStatusIcon(quotation.status)}
                    <div>
                      <p className="font-medium">{quotation.quotation_number}</p>
                      <p className="text-sm text-gray-600">{formatDate(quotation.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(quotation.total_amount)}</p>
                    <p className="text-xs text-gray-600">
                      有効期限: {formatDate(quotation.valid_until)}
                    </p>
                  </div>
                </div>
              ))}
              {quotations.length === 0 && (
                <p className="text-center text-gray-500 py-8">見積履歴がありません。</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">注文履歴</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新規注文
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="注文番号で検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              フィルター
            </Button>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  {getOrderStatusIcon(order.status)}
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${order.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{order.progress_percentage}%</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/member/orders/${order.id}`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  詳細表示
                </Button>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-center text-gray-500 py-8">注文履歴がありません。</p>
            )}
          </div>
        </Card>
      )}

      {/* Quotations Tab */}
      {activeTab === 'quotations' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">見積履歴</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新規見積依頼
            </Button>
          </div>

          <div className="space-y-3">
            {quotations.map((quotation) => (
              <div
                key={quotation.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  {getQuotationStatusIcon(quotation.status)}
                  <div>
                    <p className="font-medium">{quotation.quotation_number}</p>
                    <p className="text-sm text-gray-600">{formatDate(quotation.created_at)}</p>
                    <p className="text-xs text-gray-500">
                      有効期限: {formatDate(quotation.valid_until)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">{formatCurrency(quotation.total_amount)}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/member/quotations/${quotation.id}`}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    詳細表示
                  </Button>
                </div>
              </div>
            ))}
            {quotations.length === 0 && (
              <p className="text-center text-gray-500 py-8">見積履歴がありません。</p>
            )}
          </div>
        </Card>
      )}

      {/* Samples Tab */}
      {activeTab === 'samples' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">サンプル依頼履歴</h2>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新規サンプル依頼
            </Button>
          </div>

          <div className="space-y-3">
            {samples.map((sample) => (
              <div
                key={sample.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  {getSampleStatusIcon(sample.status)}
                  <div>
                    <p className="font-medium">{sample.sample_number}</p>
                    <p className="text-sm text-gray-600">{formatDate(sample.created_at)}</p>
                    <p className="text-xs text-gray-500">
                      製品数: {sample.product_count}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/member/samples/${sample.id}`}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  詳細表示
                </Button>
              </div>
            ))}
            {samples.length === 0 && (
              <p className="text-center text-gray-500 py-8">サンプル依頼履歴がありません。</p>
            )}
          </div>
        </Card>
      )}
      </div>
    </LoadingState>
  );
}
