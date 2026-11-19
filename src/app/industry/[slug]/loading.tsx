/**
 * Loading skeleton for industry pages
 * 산업별 페이지 로딩 스켈레톤
 */

export default function IndustryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section */}
      <div className="mb-12">
        <div className="h-12 w-2/3 bg-bg-muted animate-pulse rounded mb-4" />
        <div className="h-6 w-1/2 bg-bg-muted animate-pulse rounded" />
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-bg-primary border border-border-medium rounded-container p-6">
            <div className="h-8 w-16 bg-bg-muted animate-pulse rounded-inner mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-bg-muted animate-pulse rounded" />
              <div className="h-4 w-full bg-bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* CTA section */}
      <div className="mt-12">
        <div className="bg-bg-primary border border-border-medium rounded-container p-8">
          <div className="h-6 w-48 bg-bg-muted animate-pulse rounded mb-4" />
          <div className="h-32 w-full bg-bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
