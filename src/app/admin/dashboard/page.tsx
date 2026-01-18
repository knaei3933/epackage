'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import { OrderStatus } from '@/types/database';
import {
  OrderStatisticsWidget,
  RecentActivityWidget,
  QuickActionsWidget,
  AlertsWidget
} from '@/components/admin/dashboard-widgets';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader';
import { AlertCircle, TrendingUp, Package, FileText, Activity } from 'lucide-react';

// データフェッチャー - エラーハンドリング強化 + DEV_MODE対応
const fetcher = async (url: string) => {
  try {
    // DEV_MODE用ヘッダーの設定
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // DEV_MODEの場合はヘッダーを追加
    if (typeof window !== 'undefined') {
      const devUserId = localStorage.getItem('dev-mock-user-id');
      if (devUserId) {
        headers['x-dev-mode'] = 'true';
        headers['x-user-id'] = devUserId;
      }
    }

    const response = await fetch(url, {
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // API エラーレスポンスのチェック
    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    throw error;
  }
};

// デフォルト統計データ（フォールバック用）
const defaultStats = {
  ordersByStatus: [],
  monthlyRevenue: [],
  pendingQuotations: 0,
  activeProduction: 0,
  todayShipments: 0,
  totalOrders: 0,
  totalRevenue: 0,
  recentQuotations: []
};

export default function AdminDashboardPage() {
  const [realtimeOrders, setRealtimeOrders] = useState<any[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [period, setPeriod] = useState(30); // 期間フィルター (日)

  // SWRによるデータフェッチ - エラーハンドリングオプション追加
  const { data: orderStats, error, isLoading, isValidating, mutate } = useSWR(
    `/api/admin/dashboard/statistics?period=${period}`,
    fetcher,
    {
      refreshInterval: 30000, // 30秒ごとに更新
      revalidateOnFocus: true,
      shouldRetryOnError: false, // 自動再試行無効化 (手動再試行ボタン提供)
      errorRetryCount: 3,
      onError: (err) => {
        console.error('SWR Error:', err);
      }
    }
  );

  // リアルタイム注文更新の購読
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload: any) => {
          setRealtimeOrders((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(channel);
    };
  }, [supabase]);

  // 手動リトライハンドラー
  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    try {
      await mutate();
    } finally {
      setIsRetrying(false);
    }
  };

  // ローディング状態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  // エラー状態 - 詳細なエラーUI
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* エラーアラート */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  ダッシュボードデータの読み込みエラー
                </h3>
                <p className="text-red-700 mb-4">
                  {error instanceof Error ? error.message : '不明なエラーが発生しました'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isRetrying ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        再試行中...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        再試行
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    ページを再読み込み
                  </button>
                </div>
                {retryCount > 0 && (
                  <p className="text-xs text-red-600 mt-3">
                    リトライ回数: {retryCount}回
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* フォールバックUI - デグレードした状態でダッシュボードを表示 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-yellow-700">
                一部のデータを表示できません。最新情報は手動で更新してください。
              </p>
            </div>
          </div>

          {/* フォールバックコンテンツ */}
          <div className="space-y-6">
            <OrderStatisticsWidget statistics={defaultStats} error={error.message} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentActivityWidget orders={[]} />
              </div>
              <div className="space-y-6">
                <QuickActionsWidget />
                <AlertsWidget />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー - 更新表示器追加 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              管理ダッシュボード
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              システム統計およびリアルタイム監視
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* 期間フィルター */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">期間:</label>
              <select
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">最近7日</option>
                <option value="30">最近30日</option>
                <option value="90">最近90日</option>
              </select>
            </div>

            {isValidating && (
              <div className="flex items-center text-sm text-blue-600">
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                更新中...
              </div>
            )}
            <div className="text-sm text-gray-500">
              最終更新: {new Date().toLocaleString('ja-JP')}
            </div>
          </div>
        </div>

        {/* 注文統計ウィジェット */}
        <OrderStatisticsWidget statistics={orderStats} />

        {/* 詳細統計カード (追加) */}
        {orderStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 見積統計 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">見積コンバージョン率</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {orderStats.quotations?.conversionRate || 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {orderStats.quotations?.approved || 0} / {orderStats.quotations?.total || 0} 承認
                  </p>
                </div>
                <FileText className="h-10 w-10 text-blue-500" />
              </div>
            </div>

            {/* サンプル依頼 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">サンプル依頼</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {orderStats.samples?.total || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {orderStats.samples?.processing || 0} 処理中
                  </p>
                </div>
                <Package className="h-10 w-10 text-purple-500" />
              </div>
            </div>

            {/* 生産統計 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">平均生産期間</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {orderStats.production?.avgDays || 0}日
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {orderStats.production?.completed || 0} 完了
                  </p>
                </div>
                <Activity className="h-10 w-10 text-green-500" />
              </div>
            </div>

            {/* 配送統計 */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">本日配送</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {orderStats.shipments?.today || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {orderStats.shipments?.inTransit || 0} 配送中
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* メインコンテンツグリッド */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 最近のアクティビティ */}
          <div className="lg:col-span-2">
            <RecentActivityWidget orders={realtimeOrders} />
          </div>

          {/* クイックアクションとアラート */}
          <div className="space-y-6">
            <QuickActionsWidget />
            <AlertsWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
