/**
 * Member Quotations Loading Component
 */

export default function QuotationsLoading() {
  return (
    <div className="space-y-4">
      {/* Table Header Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-8 w-1/3 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-4 border-b">
              <div className="h-12 w-12 bg-gray-200 animate-pulse rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-1/3 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
