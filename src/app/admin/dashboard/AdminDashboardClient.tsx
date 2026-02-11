'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase-browser';
import { OrderStatus } from '@/types/database';
import {
  OrderStatisticsWidget,
  RecentActivityWidget,
  QuickActionsWidget,
  AlertsWidget
} from '@/components/admin/dashboard-widgets';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader';
import { AlertCircle, TrendingUp, Package, FileText, Activity, BarChart3, Users, Zap, Clock, ArrowRight, Upload, Edit, UserCheck, Settings, Truck } from 'lucide-react';
import { Card } from '@/components/ui';

// データフェッチャー - エラーハンドリング強化
const fetcher = async (url: string) => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

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
    // エラーは静かに処理（SWRのonErrorコールバックで処理される）
    throw error;
  }
};

// デフォルト統計データ（フォールバック用）
const defaultStats = {
  ordersByStatus: [],
  monthlyRevenue: [],
  pendingQuotations: 0,
  todayShipments: 0,
  totalOrders: 0,
  totalRevenue: 0,
  recentQuotations: [],
  samples: { total: 0, processing: 0 },
  production: { avgDays: 0, completed: 0 },
  shipments: { today: 0, inTransit: 0 },
  activeCustomers: 0,
  quotations: { total: 0, approved: 0, conversionRate: 0 },
};

interface AuthContext {
  userId: string;
  role: 'admin' | 'operator' | 'sales' | 'accounting';
  userName: string;
}

interface AdminDashboardClientProps {
  authContext: AuthContext;
  initialOrderStats: any;
  initialQuotationStats: any;
  initialPeriod: number;
}

export default function AdminDashboardClient({
  authContext,
  initialOrderStats,
  initialQuotationStats,
  initialPeriod,
}: AdminDashboardClientProps) {
  const [realtimeOrders, setRealtimeOrders] = useState<any[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [period, setPeriod] = useState(initialPeriod); // 期間フィルター (日)

  // SWRによるデータフェッチ - 統合APIを使用
  const { data: orderStats, error, isLoading, isValidating, mutate } = useSWR(
    `/api/admin/dashboard/unified-stats?period=${period}`,
    fetcher,
    {
      refreshInterval: 30000, // 30秒ごとに更新
      revalidateOnFocus: true,
      shouldRetryOnError: false, // 自動再試行無効化 (手動再試行ボタン提供)
      errorRetryCount: 3,
      onError: (err) => {
        // エラーはUIで表示するため、コンソールには出力しない
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

  // ローディング状態 - Modern Design
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-accent to-bg-primary">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-brixa-400/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // エラー状態 - Modern Design
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-accent to-bg-primary">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 bg-error-400/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Modern Error Alert */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card variant="error" rounded="2xl" className="p-8">
              <div className="flex items-start gap-6">
                <motion.div
                  className="flex-shrink-0"
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <div className="w-16 h-16 bg-error-100 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-error-600" />
                  </div>
                </motion.div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-error-900 mb-2">
                      ダッシュボードデータの読み込みエラー
                    </h3>
                    <p className="text-error-700">
                      {error instanceof Error ? error.message : '不明なエラーが発生しました'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRetry}
                      disabled={isRetrying}
                      className="px-6 py-3 bg-error-600 text-white rounded-xl font-semibold hover:bg-error-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      {isRetrying ? (
                        <>
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          再試行中...
                        </>
                      ) : (
                        <>
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          再試行
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 bg-white text-error-600 border-2 border-error-300 rounded-xl font-semibold hover:bg-error-50 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      ページを再読み込み
                    </motion.button>
                  </div>

                  {retryCount > 0 && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-error-600 bg-error-50 inline-block px-3 py-1 rounded-lg"
                    >
                      リトライ回数: {retryCount}回
                    </motion.p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Warning Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card variant="warning" rounded="2xl" className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-warning-900">
                  一部のデータを表示できません。最新情報は手動で更新してください。
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Fallback Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
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
          </motion.div>
        </div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-accent to-bg-primary">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-brixa-400/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-brixa-secondary-400/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-8"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <motion.h1
                  className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-brixa-700 via-brixa-600 to-brixa-500 bg-clip-text text-transparent mb-2"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  管理ダッシュボード
                </motion.h1>
                <p className="text-base text-text-secondary flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-brixa-500 rounded-full animate-pulse"></span>
                  ようこそ、{authContext.userName}さん
                </p>
              </div>

              <motion.div
                className="flex flex-wrap items-center gap-3"
                variants={itemVariants}
              >
                {/* Period Filter - Modern Design */}
                <div className="relative group">
                  <select
                    value={period}
                    onChange={(e) => setPeriod(parseInt(e.target.value))}
                    className="appearance-none bg-white/90 backdrop-blur-sm border-2 border-brixa-200 text-text-primary px-5 py-2.5 pr-10 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-brixa-500 focus:border-brixa-500 transition-all duration-200 hover:border-brixa-300 hover:shadow-md cursor-pointer"
                  >
                    <option value="7">最近7日</option>
                    <option value="30">最近30日</option>
                    <option value="90">最近90日</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-brixa-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Update Indicator */}
                {isValidating && (
                  <motion.div
                    className="flex items-center gap-2 px-4 py-2.5 bg-brixa-50 border border-brixa-200 rounded-xl text-brixa-700 text-sm font-medium"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    更新中...
                  </motion.div>
                )}

                {/* Last Update Time */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-border-medium rounded-xl text-text-secondary text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{new Date().toLocaleString('ja-JP')}</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* KPI Cards - Premium Design (Status-based) */}
          <motion.div variants={itemVariants}>
            {orderStats && (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* 承認待ち (QUOTATION_PENDING + MODIFICATION_REQUESTED) */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <Link href="/admin/orders?status=QUOTATION_PENDING,MODIFICATION_REQUESTED" className="block">
                    <div className="absolute inset-0 bg-gradient-to-br from-warning-500 to-warning-700 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                    <div className="relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-warning-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5 text-warning-600" />
                        </div>
                        <span className="text-xs font-semibold text-warning-600 bg-warning-50 px-2 py-1 rounded-full animate-pulse">
                          要対応
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-text-secondary">承認待ち</p>
                        <p className="text-2xl font-extrabold text-text-primary">
                          {(orderStats.ordersByStatus?.find((s: any) => s.status === 'QUOTATION_PENDING')?.count || 0) +
                           (orderStats.ordersByStatus?.find((s: any) => s.status === 'MODIFICATION_REQUESTED')?.count || 0)}
                        </p>
                        <p className="text-xs text-text-tertiary">アクションが必要</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* データ入稿待ち (DATA_UPLOAD_PENDING) */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <Link href="/admin/orders?status=DATA_UPLOAD_PENDING" className="block">
                    <div className="absolute inset-0 bg-gradient-to-br from-info-500 to-info-700 rounded-2xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
                    <div className="relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-info-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-info-50 to-info-100 rounded-xl flex items-center justify-center">
                          <Upload className="h-5 w-5 text-info-600" />
                        </div>
                        <span className="text-xs font-semibold text-info-600 bg-info-50 px-2 py-1 rounded-full">
                          顧客待ち
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-text-secondary">データ入稿待ち</p>
                        <p className="text-2xl font-extrabold text-text-primary">
                          {orderStats.ordersByStatus?.find((s: any) => s.status === 'DATA_UPLOAD_PENDING')?.count || 0}
                        </p>
                        <p className="text-xs text-text-tertiary">顧客の対応待ち</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* 校正作業中 (CORRECTION_IN_PROGRESS) */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <Link href="/admin/orders?status=CORRECTION_IN_PROGRESS" className="block">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                    <div className="relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-purple-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center">
                          <Edit className="h-5 w-5 text-purple-600" />
                        </div>
                        <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                          作業中
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-text-secondary">校正作業中</p>
                        <p className="text-2xl font-extrabold text-text-primary">
                          {orderStats.ordersByStatus?.find((s: any) => s.status === 'CORRECTION_IN_PROGRESS')?.count || 0}
                        </p>
                        <p className="text-xs text-text-tertiary">デザイナー作業中</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* 顧客承認待ち (CUSTOMER_APPROVAL_PENDING) */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <Link href="/admin/orders?status=CUSTOMER_APPROVAL_PENDING" className="block">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
                    <div className="relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-yellow-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-yellow-600" />
                        </div>
                        <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                          確認待ち
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-text-secondary">顧客承認待ち</p>
                        <p className="text-2xl font-extrabold text-text-primary">
                          {orderStats.ordersByStatus?.find((s: any) => s.status === 'CUSTOMER_APPROVAL_PENDING')?.count || 0}
                        </p>
                        <p className="text-xs text-text-tertiary">顧客の確認待ち</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* 製造中 (PRODUCTION) */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <Link href="/admin/orders?status=PRODUCTION" className="block">
                    <div className="absolute inset-0 bg-gradient-to-br from-brixa-500 to-brixa-700 rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                    <div className="relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-brixa-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-brixa-50 to-brixa-100 rounded-xl flex items-center justify-center">
                          <Settings className="h-5 w-5 text-brixa-600" />
                        </div>
                        <span className="text-xs font-semibold text-brixa-600 bg-brixa-50 px-2 py-1 rounded-full">
                          進行中
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-text-secondary">製造中</p>
                        <p className="text-2xl font-extrabold text-text-primary">
                          {orderStats.ordersByStatus?.find((s: any) => s.status === 'PRODUCTION')?.count || 0}
                        </p>
                        <p className="text-xs text-text-tertiary">製造工程中</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                {/* 本日出荷 (SHIPPED - 今日分) */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group"
                >
                  <Link href="/admin/orders?status=SHIPPED" className="block">
                    <div className="absolute inset-0 bg-gradient-to-br from-success-500 to-success-700 rounded-2xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
                    <div className="relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-success-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-success-50 to-success-100 rounded-xl flex items-center justify-center">
                          <Truck className="h-5 w-5 text-success-600" />
                        </div>
                        <span className="text-xs font-semibold text-success-600 bg-success-50 px-2 py-1 rounded-full">
                          完了
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-text-secondary">本日出荷</p>
                        <p className="text-2xl font-extrabold text-text-primary">
                          {orderStats.todayShipments || 0}
                        </p>
                        <p className="text-xs text-text-tertiary">完了した注文</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Order Statistics Widget */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <OrderStatisticsWidget statistics={orderStats} />
        </motion.div>

        {/* Detailed Statistics Cards - Modern Grid */}
        {orderStats && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
          >
            {/* Quotation Approved */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="quick-actions-card rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-4 w-4 text-success-600" />
                    </div>
                    <span className="text-sm font-semibold text-text-secondary">見積承認済み</span>
                  </div>
                  <p className="text-3xl font-extrabold text-success-600 mb-1">
                    {orderStats.quotations?.approved || 0}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    全 {orderStats.quotations?.total || 0} 件中
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Conversion Rate */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="quick-actions-card rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-info-600" />
                    </div>
                    <span className="text-sm font-semibold text-text-secondary">コンバージョン率</span>
                  </div>
                  <p className="text-3xl font-extrabold text-info-600 mb-1">
                    {orderStats.quotations?.conversionRate || 0}%
                  </p>
                  <p className="text-xs text-text-tertiary">見積→注文転換</p>
                </div>
              </div>
            </motion.div>

            {/* Sample Requests */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="quick-actions-card rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-text-secondary">サンプル依頼</span>
                  </div>
                  <p className="text-3xl font-extrabold text-purple-600 mb-1">
                    {orderStats.samples?.total || 0}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {orderStats.samples?.processing || 0} 処理中
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Production Stats */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="quick-actions-card rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-brixa-100 rounded-lg flex items-center justify-center">
                      <Activity className="h-4 w-4 text-brixa-600" />
                    </div>
                    <span className="text-sm font-semibold text-text-secondary">平均生産期間</span>
                  </div>
                  <p className="text-3xl font-extrabold text-brixa-600 mb-1">
                    {orderStats.production?.avgDays || 0}
                    <span className="text-xl ml-1">日</span>
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {orderStats.production?.completed || 0} 完了
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Today Shipments */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="quick-actions-card rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-semibold text-text-secondary">本日配送</span>
                  </div>
                  <p className="text-3xl font-extrabold text-orange-600 mb-1">
                    {orderStats.shipments?.today || 0}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {orderStats.shipments?.inTransit || 0} 配送中
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Customers */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="quick-actions-card rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-brixa-secondary-100 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-brixa-secondary-600" />
                    </div>
                    <span className="text-sm font-semibold text-text-secondary">アクティブ顧客</span>
                  </div>
                  <p className="text-3xl font-extrabold text-brixa-secondary-600 mb-1">
                    {orderStats.activeCustomers || 0}
                  </p>
                  <p className="text-xs text-text-tertiary">過去30日間</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Recent Activity */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <RecentActivityWidget orders={realtimeOrders} />
          </motion.div>

          {/* Quick Actions and Alerts */}
          <motion.div variants={itemVariants} className="space-y-6">
            <QuickActionsWidget />
            <AlertsWidget />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
