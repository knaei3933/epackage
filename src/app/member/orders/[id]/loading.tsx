/**
 * Order Detail Loading Component
 *
 * 注文詳細ページのローディングスケルトン。
 * FullPageSpinner の全画面フラッシュを避け、完成形のレイアウト骨格を
 * animate-pulse な灰バーで予約することで初回ロード時のガタつきを防ぐ。
 * パターンは src/app/member/quotations/loading.tsx ・ dashboard/loading.tsx に準拠。
 */

export default function MemberOrderDetailLoading() {
  return (
    <div className="space-y-6">
      {/* ページヘッダー Skeleton */}
      <div className="flex items-start justify-between">
        <div>
          <div className="h-8 w-40 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-4 w-56 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="h-7 w-24 bg-gray-200 animate-pulse rounded-full" />
      </div>

      {/* 注文情報 Card Skeleton（4カラム骨格） */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b-2 border-gray-100">
                <div className="h-5 w-5 bg-gray-200 animate-pulse rounded" />
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-5/6 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 商品明細 Card Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-6" />
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100">
              <div className="h-16 w-16 bg-gray-200 animate-pulse rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-1/4 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>

      {/* デザインワークフロー Card Skeleton（ステップ2つ分） */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <div className="h-7 w-48 bg-gray-200 animate-pulse rounded mb-2" />
          <div className="h-4 w-72 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="h-2 w-full bg-gray-200 animate-pulse rounded-full" />
        </div>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div className="p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-1/4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-10 w-32 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* お問い合わせ枠 Card Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="space-y-3">
          <div className="h-16 w-2/3 bg-gray-200 animate-pulse rounded-lg" />
          <div className="h-16 w-1/2 bg-gray-200 animate-pulse rounded-lg ml-auto" />
        </div>
        <div className="mt-4 h-10 w-full bg-gray-200 animate-pulse rounded" />
      </div>
    </div>
  );
}
