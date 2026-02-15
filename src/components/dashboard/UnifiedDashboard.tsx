'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Package,
  FileText,
  Activity,
} from 'lucide-react';
import type { UnifiedDashboardStats } from '@/lib/dashboard';

// =====================================================
// Types
// =====================================================

export interface UnifiedDashboardProps {
  initialStats: UnifiedDashboardStats;
  userId: string;
  userRole: 'ADMIN' | 'MEMBER';
}

// =====================================================
// Sub Components
// =====================================================

interface PeriodSelectorProps {
  value: number;
  onChange: (period: number) => void;
}

function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600">期間:</label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value={7}>最近7日</option>
        <option value={30}>最近30日</option>
        <option value={90}>最近90日</option>
      </select>
    </div>
  );
}

interface DashboardStatsCardsProps {
  stats: UnifiedDashboardStats;
  isLoading?: boolean;
}

function DashboardStatsCards({ stats, isLoading }: DashboardStatsCardsProps) {
  const cards = [
    {
      title: '総注文数',
      value: stats.totalOrders,
      icon: Package,
      color: 'blue',
    },
    {
      title: '保留中の注文',
      value: stats.pendingOrders,
      icon: Activity,
      color: 'yellow',
    },
    {
      title: '総売上',
      value: `${stats.totalRevenue.toLocaleString()}円`,
      icon: TrendingUp,
      color: 'green',
    },
  ];

  if (stats.activeUsers > 0) {
    cards.push({
      title: 'アクティブユーザー',
      value: stats.activeUsers,
      icon: Activity,
      color: 'purple',
    });
  }

  if (stats.pendingQuotations !== undefined) {
    cards.push({
      title: '保留中の見積',
      value: stats.pendingQuotations,
      icon: FileText,
      color: 'orange',
    });
  }

  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className={`text-2xl font-bold mt-1 ${isLoading ? 'animate-pulse' : ''}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${colorClasses[card.color as keyof typeof colorClasses]}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface DashboardErrorFallbackProps {
  error: Error;
  onRetry: () => void;
}

function DashboardErrorFallback({ error, onRetry }: DashboardErrorFallbackProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div className="flex items-start">
        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
            ダッシュボードデータの読み込みエラー
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {error.message}
          </p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            再試行
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Main Component
// =====================================================

export function UnifiedDashboard({
  initialStats,
  userId,
  userRole,
}: UnifiedDashboardProps) {
  const [period, setPeriod] = useState(30);

  const { data: stats, error, isValidating, mutate } = useSWR<UnifiedDashboardStats>(
    `/api/${userRole.toLowerCase()}/dashboard/unified-stats?period=${period}`,
    async (url) => {
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    },
    {
      fallbackData: initialStats,
      refreshInterval: 30000, // 30秒自動更新
      revalidateOnFocus: true,
      shouldRetryOnError: false,
      errorRetryCount: 3,
    }
  );

  // エラー状態
  if (error) {
    return <DashboardErrorFallback error={error} onRetry={mutate} />;
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー - 期間フィルターと更新表示器 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {userRole === 'ADMIN' ? '管理ダッシュボード' : 'マイページ'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            統計およびリアルタイム監視
          </p>
        </div>
        <div className="flex items-center gap-4">
          <PeriodSelector value={period} onChange={setPeriod} />
          {isValidating && (
            <div className="flex items-center text-sm text-blue-600">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              更新中...
            </div>
          )}
        </div>
      </div>

      {/* 統計カード */}
      <DashboardStatsCards stats={stats || initialStats} isLoading={isValidating} />

      {/* 追加統計セクション（管理者用） */}
      {userRole === 'ADMIN' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.quotations && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">見積コンバージョン率</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {stats.quotations.conversionRate}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.quotations.approved} / {stats.quotations.total} 承認
                  </p>
                </div>
                <FileText className="h-10 w-10 text-blue-500" />
              </div>
            </div>
          )}

          {stats.samples && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">サンプル依頼</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {stats.samples.total}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.samples.processing} 処理中
                  </p>
                </div>
                <Package className="h-10 w-10 text-purple-500" />
              </div>
            </div>
          )}

          {stats.production && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">平均生産期間</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {stats.production.avgDays}日
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.production.completed} 完了
                  </p>
                </div>
                <Activity className="h-10 w-10 text-green-500" />
              </div>
            </div>
          )}

          {stats.shipments && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">本日配送</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {stats.shipments.today}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.shipments.inTransit} 配送中
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-500" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 会員用追加セクション */}
      {userRole === 'MEMBER' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.samples && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">サンプル依頼</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {stats.samples.total}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.samples.processing} 処理中
                  </p>
                </div>
                <Package className="h-10 w-10 text-purple-500" />
              </div>
            </div>
          )}

          {stats.contracts && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">契約状況</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {stats.contracts.signed}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stats.contracts.pending} 保留中
                  </p>
                </div>
                <FileText className="h-10 w-10 text-indigo-500" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
