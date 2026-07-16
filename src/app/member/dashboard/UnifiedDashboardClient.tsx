'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { RefreshCw } from 'lucide-react';
import type { UnifiedDashboardStats } from '@/lib/dashboard';
import { PinnedNextAction, NextActionList, EmptyState } from '@/components/dashboard';
import { fetcher } from '@/hooks/use-optimized-fetch';

// =====================================================
// Types
// =====================================================

export interface UnifiedDashboardClientProps {
  initialStats: UnifiedDashboardStats;
  userId: string;
  userName: string;
}

// =====================================================
// Main Component
// =====================================================

export function UnifiedDashboardClient({
  initialStats,
  userId,
  userName,
}: UnifiedDashboardClientProps) {
  const router = useRouter();
  const [period, setPeriod] = useState(30);

  // SWRで統計データを自動更新
  // Include userId as query param for client-side auth fallback
  const { data: stats, error, isValidating, mutate } = useSWR<UnifiedDashboardStats>(
    `/api/member/dashboard/unified-stats?period=${period}&userId=${userId}`,
    fetcher,
   {
     fallbackData: initialStats,
     refreshInterval: 60000, // 60秒自動更新（負荷低減）
     revalidateOnFocus: false, // タブフォーカス時のリフェッチ暴発を防止
     shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  // 表示用統計データの変換
  //見積の total も実データ（quotations.total）から供給・L109 のモック計算は廃止
  const displayStats = useMemo(() => {
    const s = stats || initialStats;
    return {
      totalOrders: s.totalOrders,
      pendingOrders: s.pendingOrders,
      pendingQuotations: s.pendingQuotations || 0,
      totalQuotations: s.quotations?.total || 0,
      totalSamples: s.samples?.total || 0,
      processingSamples: s.samples?.processing || 0,
      totalInquiries: s.inquiries?.total || 0,
      respondedInquiries: s.inquiries?.responded || 0,
      totalContracts: s.contracts?.total || 0,
      signedContracts: s.contracts?.signed || 0,
      pendingContracts: s.contracts?.pending || 0,
    };
  }, [stats, initialStats]);

  // 次の行動の有無（空状態切り替え用）
  const nextActions = stats?.nextActions ?? [];

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            ようこそ、{userName}様
          </h1>
          <p className="text-text-muted mt-1">
            マイページの概要をご確認いただけます。
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
              <option value={7}>最近7日</option>
              <option value={30}>最近30日</option>
              <option value={90}>最近90日</option>
            </select>
          </div>
          {isValidating && (
            <div className="flex items-center text-sm text-blue-600">
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              更新中...
            </div>
          )}
        </div>
      </div>

      {/* 最優先の次の行動（ヘッダー直下・ピン留め） */}
      {stats?.pinnedNextAction && (
        <PinnedNextAction action={stats.pinnedNextAction} />
      )}

      {/* 統計カード（数字 ＋ 次のステップ導線） */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardStatsCard
          title="新規注文"
          count={displayStats.pendingOrders}
          total={displayStats.totalOrders}
          href="/member/orders"
          icon="📦"
          color="blue"
          subTitle={
            displayStats.pendingOrders > 0
              ? `${displayStats.pendingOrders}件の未処理を確認`
              : '注文一覧を見る'
          }
        />
        <DashboardStatsCard
          title="見積依頼"
          count={displayStats.pendingQuotations}
          total={displayStats.totalQuotations}
          href="/member/quotations"
          icon="📁"
          color="green"
          subTitle={
            displayStats.pendingQuotations > 0
              ? `${displayStats.pendingQuotations}件の承認待ちを確認`
              : '見積一覧を見る'
          }
        />
        <DashboardStatsCard
          title="サンプル依頼"
          count={displayStats.processingSamples}
          total={displayStats.totalSamples}
          href="/member/samples"
          icon="📝"
          color="orange"
          subTitle={
            displayStats.processingSamples > 0
              ? `${displayStats.processingSamples}件の処理中を確認`
              : 'サンプル一覧を見る'
          }
        />
        <DashboardStatsCard
          title="お問い合わせ"
          count={displayStats.respondedInquiries}
          total={displayStats.totalInquiries}
          href="/member/inquiries"
          icon="💬"
          color="purple"
          subTitle="問い合わせを確認"
        />
        <DashboardStatsCard
          title="契約"
          count={displayStats.signedContracts}
          total={displayStats.totalContracts}
          href="/member/contracts"
          icon="📋"
          color="indigo"
          subTitle={
            displayStats.totalContracts - displayStats.signedContracts > 0
              ? `${displayStats.totalContracts - displayStats.signedContracts}件の未署名を確認`
              : '契約一覧を見る'
          }
        />
      </div>

      {/* 次の行動リスト（統計カード下・空状態は開始案内） */}
      {nextActions.length === 0 ? (
        <EmptyState
          title="次の行動はありません"
          description="未処理の見積・注文・通知はありません。新しい見積依頼やサンプル申請から始めましょう。"
          icon={<span className="text-4xl" aria-hidden="true">✅</span>}
          action={{
            label: '見積依頼を作成',
            onClick: () => { router.push('/member/quotations/request'); }
          }}
        />
      ) : (
        <NextActionList actions={nextActions} />
      )}

      {/* クイックアクション（新規作成系に特化・一覧の重複を整理） */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="見積依頼"
            description="新しい見積もり"
            icon="📁"
            href="/member/quotations/request"
            color="green"
          />
          <QuickActionCard
            title="注文作成"
            description="新しい注文"
            icon="📦"
            href="/member/orders/new"
            color="blue"
          />
          <QuickActionCard
            title="サンプル申請"
            description="サンプル依頼"
            icon="📝"
            href="/member/samples"
            color="purple"
          />
          <QuickActionCard
            title="お問い合わせ"
            description="質問・相談"
            icon="💬"
            href="/member/inquiries"
            color="indigo"
          />
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-800 dark:text-red-400">
            データの取得に失敗しました。もうしばらくお待ちください。
          </p>
        </div>
      )}
    </div>
  );
}

// =====================================================
// Sub Components
// =====================================================

interface DashboardStatsCardProps {
  title: string;
  count: number;
  total: number;
  href: string;
  icon: string;
  color: string;
  subTitle?: string;
}

function DashboardStatsCard({
  title,
  count,
  total,
  href,
  icon,
  color,
  subTitle,
}: DashboardStatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20',
    green: 'bg-green-100 dark:bg-green-900/20',
    orange: 'bg-orange-100 dark:bg-orange-900/20',
    purple: 'bg-purple-100 dark:bg-purple-900/20',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/20',
  };

  return (
    <a href={href} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {count}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              合計: {total}
            </p>
            {subTitle && (
              <p className="text-xs text-primary mt-1 font-medium">
                {subTitle}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </div>
    </a>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

function QuickActionCard({
  title,
  description,
  icon,
  href,
  color,
}: QuickActionCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20',
    green: 'bg-green-100 dark:bg-green-900/20',
    orange: 'bg-orange-100 dark:bg-orange-900/20',
    purple: 'bg-purple-100 dark:bg-purple-900/20',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/20',
  };

  return (
    <a href={href} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <h3 className="font-medium text-text-primary text-sm">{title}</h3>
            <p className="text-xs text-text-muted">{description}</p>
          </div>
        </div>
      </div>
    </a>
  );
}
