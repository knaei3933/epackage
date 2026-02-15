/**
 * Product Detail Loading Component
 */

export default function ProductDetailLoading() {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Image Gallery Skeleton */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>

      {/* Product Info Skeleton */}
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* Price Skeleton */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded mb-4" />
          <div className="h-8 w-1/2 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* Specs Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded" />
              <div className="h-4 w-1/4 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>

        {/* Actions Skeleton */}
        <div className="flex gap-4">
          <div className="h-12 flex-1 bg-gray-200 animate-pulse rounded" />
          <div className="h-12 flex-1 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
