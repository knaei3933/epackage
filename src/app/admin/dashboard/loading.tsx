/**
 * Admin Dashboard Loading Component
 *
 * Next.js の自動 Suspense boundary 用スケルトン（同セグメントの page.tsx に対応）。
 * page.tsx 側の手動 <Suspense> は Next.js 標準機構（loading.tsx）との二重化回避のため削除済み。
 *
 * AdminDashboardClient（B1 後レイアウト）の構造に近似:
 * - ステータス別 KPI（セクション見出し + grid 3列×6枚）
 * - 詳細統計（セクション見出し + grid 3列）
 * - メインコンテンツ（RecentActivity + サイド）
 *
 * design tokens（bg-bg-primary / bg-border-light 等）を使用し、
 * ダークモード（class 戦略）では CSS 変数が自動切り替えされる。
 */

export default function DashboardLoading() {
  // KPI カードスケルトン（アイコン + バッジ + ラベル + 数値 + サブ）
  const KpiCardSkeleton = () => (
    <div className="bg-bg-primary rounded-2xl p-5 shadow-md border border-border-light">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-border-light rounded-xl animate-pulse" />
        <div className="h-5 w-16 bg-border-light rounded-full animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 bg-border-light animate-pulse rounded" />
        <div className="h-7 w-16 bg-border-light animate-pulse rounded" />
        <div className="h-3 w-20 bg-border-light animate-pulse rounded" />
      </div>
    </div>
  );

  // 詳細統計カードスケルトン（アイコン + ラベル + 数値 + サブ）
  const StatCardSkeleton = () => (
    <div className="bg-bg-primary rounded-2xl p-6 shadow-md border border-border-light">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-border-light rounded-lg animate-pulse" />
        <div className="h-4 w-28 bg-border-light animate-pulse rounded" />
      </div>
      <div className="h-8 w-20 bg-border-light animate-pulse rounded mb-1" />
      <div className="h-3 w-24 bg-border-light animate-pulse rounded" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-secondary via-bg-accent to-bg-primary">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ヘッダースケルトン（タイトル + 期間フィルター） */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <div className="h-9 w-64 bg-border-light animate-pulse rounded-lg" />
            <div className="h-4 w-48 bg-border-light animate-pulse rounded" />
          </div>
          <div className="h-10 w-40 bg-border-light animate-pulse rounded-xl" />
        </div>

        {/* ステータス別 KPI セクション */}
        <section className="space-y-4">
          {/* セクション見出し風（brixa 縦バー） */}
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-gradient-to-b from-brixa-500 to-brixa-700 rounded-full" />
            <div className="space-y-1.5">
              <div className="h-5 w-36 bg-border-light animate-pulse rounded" />
              <div className="h-3 w-52 bg-border-light animate-pulse rounded" />
            </div>
          </div>
          {/* KPI grid: B1 後レイアウト（lg:3列×2行=6枚） */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* 詳細統計セクション */}
        <section className="space-y-4">
          {/* セクション見出し風（navy 縦バー） */}
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-gradient-to-b from-navy-500 to-navy-700 rounded-full" />
            <div className="space-y-1.5">
              <div className="h-5 w-28 bg-border-light animate-pulse rounded" />
              <div className="h-3 w-56 bg-border-light animate-pulse rounded" />
            </div>
          </div>
          {/* 詳細統計 grid: lg:3列 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* メインコンテンツ風（RecentActivity + サイド） */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* RecentActivity 相当（2カラム幅） */}
          <div className="lg:col-span-2 bg-bg-primary rounded-2xl p-6 shadow-md border border-border-light">
            <div className="h-6 w-40 bg-border-light animate-pulse rounded mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-border-light animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-border-light animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-border-light animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* サイド（QuickActions + Alerts）相当 */}
          <div className="space-y-6">
            <div className="bg-bg-primary rounded-2xl p-6 shadow-md border border-border-light">
              <div className="h-5 w-28 bg-border-light animate-pulse rounded mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-border-light animate-pulse rounded-xl" />
                <div className="h-10 bg-border-light animate-pulse rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
