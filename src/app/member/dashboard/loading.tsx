/**
 * Member Dashboard Loading Component
 */

export default function MemberDashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Welcome Section Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Quick Stats Skeleton */}
      <div className="grid md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded mb-2" />
            <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Recent Orders Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-6 w-1/4 bg-gray-200 animate-pulse rounded mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gray-200 animate-pulse rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
