/**
 * Admin Dashboard Loading Component
 */

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-4" />
            <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 w-1/4 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 animate-pulse rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
