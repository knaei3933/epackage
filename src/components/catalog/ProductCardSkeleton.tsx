/**
 * Product Card Skeleton Component
 * 제품 카드 로딩 스켈레톤
 */

export function ProductCardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow p-4">
          <div className="aspect-square bg-gray-200 animate-pulse rounded-lg mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
            <div className="h-6 w-1/4 bg-gray-200 animate-pulse rounded mt-4" />
          </div>
        </div>
      ))}
    </>
  );
}
