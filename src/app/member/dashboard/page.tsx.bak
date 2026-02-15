/**
 * Member Dashboard Page
 *
 * 会員ダッシュボードメインページ
 * - 統計カード
 * - お知らせセクション
 * - 注文・見積・サンプルの最近のアクティビティ
 */

import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth, AuthRequiredError, getDashboardStats } from '@/lib/dashboard';
import {
  DashboardStatsCard,
  AnnouncementCard,
  EmptyState
} from '@/components/dashboard';
import { FullPageSpinner, Card } from '@/components/ui';

// =====================================================
// Helper Functions
// =====================================================

/**
 * 安全な日付フォーマット関数
 */
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '---';
  try {
    return new Date(date).toLocaleDateString('ja-JP');
  } catch {
    return '---';
  }
}

/**
 * 金額フォーマット関数
 */
function formatAmount(amount: number | null | undefined): string {
  if (amount == null) return '---';
  return `${amount.toLocaleString()}円`;
}

// =====================================================
// Safe Stats Access Helpers
// =====================================================

/**
 * 安全にstatsプロパティにアクセスするヘルパー関数
 */
function safeGet<T>(value: T | undefined | null, defaultValue: T): T {
  return value ?? defaultValue;
}

// =====================================================
// Components
// =====================================================

async function DashboardContent() {
  // Use requireAuth helper - works in both Dev Mode and Production
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      redirect('/auth/signin?redirect=/member/dashboard');
    }
    throw error;
  }

  // 統計情報を取得（getDashboardStats は DEV_MODE を自動処理）
  let stats;
  try {
    stats = await getDashboardStats();
  } catch (error) {
    console.error('[Dashboard] Failed to fetch stats:', error);
    // エラー時は空の統計情報を返す
    stats = {
      orders: { new: [], processing: [], total: 0 },
      quotations: { pending: [], total: 0 },
      samples: { pending: [], total: 0 },
      inquiries: { unread: [], total: 0 },
      announcements: [],
      contracts: { pending: [], signed: 0, total: 0 },
      notifications: [],
    };
  }

  // stats가 undefined인 경우 안전하게 처리
  if (!stats) {
    console.error('[Dashboard] stats is undefined, using default values');
    stats = {
      orders: { new: [], processing: [], total: 0 },
      quotations: { pending: [], total: 0 },
      samples: { pending: [], total: 0 },
      inquiries: { unread: [], total: 0 },
      announcements: [],
      contracts: { pending: [], signed: 0, total: 0 },
      notifications: [],
    };
  }

  // 안전하게 각 속성 추출
  const orders = safeGet(stats.orders, { new: [], processing: [], total: 0 });
  const quotations = safeGet(stats.quotations, { pending: [], total: 0 });
  const samples = safeGet(stats.samples, { pending: [], total: 0 });
  const inquiries = safeGet(stats.inquiries, { unread: [], total: 0 });
  const announcements = safeGet(stats.announcements, []);
  const contracts = safeGet(stats.contracts, { pending: [], signed: 0, total: 0 });
  const notifications = safeGet(stats.notifications, []);

  // ユーザー名の取得（Production mode）
  const userName = user.user_metadata?.kanji_last_name ||
                   user.user_metadata?.name_kanji ||
                   'テスト';

  return (
    <div className="space-y-6">
      {/* ページタイトル */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          ようこそ、{userName}様
        </h1>
        <p className="text-text-muted mt-1">
          マイページの概要をご確認いただけます。
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <DashboardStatsCard
          title="新規注文"
          count={safeGet(orders.processing, []).length}
          total={safeGet(orders.total, 0)}
          href="/member/orders"
          icon="📦"
          color="blue"
        />
        <DashboardStatsCard
          title="見積依頼"
          count={safeGet(quotations.pending, []).length}
          total={safeGet(quotations.total, 0)}
          href="/member/quotations"
          icon="📁"
          color="green"
        />
        <DashboardStatsCard
          title="サンプル依頼"
          count={safeGet(samples.pending, []).length}
          total={safeGet(samples.total, 0)}
          href="/member/samples"
          icon="📝"
          color="orange"
        />
        <DashboardStatsCard
          title="お問い合わせ"
          count={safeGet(inquiries.unread, []).length}
          total={safeGet(inquiries.total, 0)}
          href="/member/inquiries"
          icon="💬"
          color="purple"
        />
        {/* B2B integration: 契約 card */}
        <DashboardStatsCard
          title="契約"
          count={safeGet(contracts.signed, 0)}
          total={safeGet(contracts.total, 0)}
          href="/member/contracts"
          icon="📋"
          color="indigo"
        />
      </div>

      {/* クイックアクション (B2B integration) */}
      <div>
        <h2 className="text-lg font-semibold text-text-primary mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/member/quotations" className="block">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/20 p-2.5 rounded-lg">
                  <span className="text-2xl">📁</span>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary text-sm">見積作成</h3>
                  <p className="text-xs text-text-muted">新しい見積書</p>
                </div>
              </div>
            </Card>
          </a>

          <a href="/member/orders" className="block">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/20 p-2.5 rounded-lg">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary text-sm">注文一覧</h3>
                  <p className="text-xs text-text-muted">すべての注文</p>
                </div>
              </div>
            </Card>
          </a>

          <a href="/member/samples" className="block">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/20 p-2.5 rounded-lg">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary text-sm">サンプル申請</h3>
                  <p className="text-xs text-text-muted">サンプル依頼</p>
                </div>
              </div>
            </Card>
          </a>

          <a href="/member/contracts" className="block">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 dark:bg-indigo-900/20 p-2.5 rounded-lg">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h3 className="font-medium text-text-primary text-sm">契約書</h3>
                  <p className="text-xs text-text-muted">契約管理</p>
                </div>
              </div>
            </Card>
          </a>
        </div>
      </div>

      {/* お知らせセクション */}
      {safeGet(announcements, []).length > 0 && (
        <AnnouncementCard announcements={announcements} />
      )}

      {/* セクショングリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 新規注文 */}
        {safeGet(orders.new, []).length > 0 ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">新規注文</h2>
              <a href="/member/orders/new" className="text-sm text-primary hover:underline">
                すべて見る
              </a>
            </div>
            <div className="space-y-3">
              {safeGet(orders.new, []).slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-3 rounded-lg border border-border-secondary hover:bg-bg-secondary transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-text-muted">
                        {formatAmount(order.totalAmount)}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <EmptyState
              title="新規注文はありません"
              description="新しい注文を作成してください"
            />
          </Card>
        )}

        {/* 見積依頼 */}
        {safeGet(quotations.pending, []).length > 0 ? (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">見積依頼</h2>
              <a href="/member/quotations" className="text-sm text-primary hover:underline">
                すべて見る
              </a>
            </div>
            <div className="space-y-3">
              {safeGet(quotations.pending, []).slice(0, 5).map((quotation) => (
                <div
                  key={quotation.id}
                  className="p-3 rounded-lg border border-border-secondary hover:bg-bg-secondary transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">
                        {quotation.quotationNumber}
                      </p>
                      <p className="text-sm text-text-muted">
                        {formatAmount(quotation.totalAmount)}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted whitespace-nowrap">
                      {formatDate(quotation.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <EmptyState
              title="見積依頼はありません"
              description="新しい見積を作成してください"
            />
          </Card>
        )}
      </div>

      {/* サンプル依頼セクション */}
      {safeGet(samples.pending, []).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">サンプル依頼</h2>
            <a href="/member/samples" className="text-sm text-primary hover:underline">
              すべて見る
            </a>
          </div>
          <div className="space-y-3">
            {safeGet(samples.pending, []).slice(0, 5).map((sample) => (
              <div
                key={sample.id}
                className="p-3 rounded-lg border border-border-secondary hover:bg-bg-secondary transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {sample.requestNumber}
                    </p>
                    <p className="text-sm text-text-muted">
                      {sample.samples.length}点
                    </p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatDate(sample.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* お問い合わせセクション */}
      {safeGet(inquiries.unread, []).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">お問い合わせ</h2>
            <a href="/member/inquiries" className="text-sm text-primary hover:underline">
              すべて見る
            </a>
          </div>
          <div className="space-y-3">
            {safeGet(inquiries.unread, []).slice(0, 5).map((inquiry) => (
              <div
                key={inquiry.id}
                className="p-3 rounded-lg border border-border-secondary hover:bg-bg-secondary transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {inquiry.subject}
                    </p>
                    <p className="text-sm text-text-muted line-clamp-2">
                      {inquiry.message}
                    </p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatDate(inquiry.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 通知セクション (B2B integration) */}
      {safeGet(notifications, []).length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <h2 className="text-lg font-semibold text-text-primary">通知</h2>
              {!safeGet(notifications, []).some((n) => n.is_read) && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                  新着
                </span>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {safeGet(notifications, []).slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors ${
                  !notification.is_read
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    : 'border-border-secondary hover:bg-bg-secondary'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {notification.title}
                    </p>
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    {formatDate(notification.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// =====================================================
// Loading Component
// =====================================================

function DashboardLoading() {
  return <FullPageSpinner label="ダッシュボードを読み込み中..." />;
}

// =====================================================
// Page Component
// =====================================================

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

// =====================================================
// Server Component Metadata
// =====================================================

export const metadata = {
  title: 'マイページトップ | Epackage Lab',
  description: 'Epackage Lab会員ダッシュボードトップ',
};

// Force dynamic rendering for this authenticated page
export const dynamic = 'force-dynamic';
