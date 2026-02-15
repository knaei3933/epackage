# Performance Modules API Documentation

## APIレスポンスキャッシュ / API Response Caching

### Module: `src/lib/api-cache.ts`

In-memory LRU cache with TTL (Time-To-Live) support for API responses. Helps reduce database load and improve response times.

---

## API Cache Module

### Class: `APICache`

#### Constructor

```typescript
constructor(defaultTTL: number = 5 * 60 * 1000)
```

Creates a new API cache instance with default TTL.

**Parameters:**
- `defaultTTL` (optional): Default time-to-live in milliseconds (default: 5 minutes)

**Example:**
```typescript
import apiCache from '@/lib/api-cache';

// Default 5 minute TTL
const cache = new APICache();

// Custom 10 minute TTL
const cache = new APICache(10 * 60 * 1000);
```

---

### Methods

#### `get<T>(route, params?)`

Retrieve cached data for a route.

**Signature:**
```typescript
get<T>(
  route: string,
  params?: Record<string, unknown>
): T | null
```

**Parameters:**
- `route`: API route path (e.g., `/api/quotations`)
- `params`: Query parameters for cache key generation

**Returns:** Cached data or `null` if not found/expired

**Example:**
```typescript
// Simple route
const data = apiCache.get<Quotation[]>('/api/quotations');

// With parameters
const userQuotations = apiCache.get<Quotation[]>('/api/quotations', {
  user_id: '123',
  status: 'pending'
});
```

---

#### `set<T>(route, data, options?, params?)`

Store data in cache.

**Signature:**
```typescript
set<T>(
  route: string,
  data: T,
  options?: CacheOptions,
  params?: Record<string, unknown>
): void
```

**Parameters:**
- `route`: API route path
- `data`: Data to cache
- `options`: Cache options (see below)
- `params`: Query parameters for cache key

**CacheOptions:**
```typescript
interface CacheOptions {
  ttl?: number;        // Custom TTL in milliseconds
  key?: string;        // Custom cache key
}
```

**Example:**
```typescript
// Default TTL
apiCache.set('/api/products', products);

// Custom 1 hour TTL
apiCache.set('/api/products', products, { ttl: 60 * 60 * 1000 });

// Custom cache key
apiCache.set('/api/products', products, {
  key: 'products:catalog:v1'
});
```

---

#### `invalidate(route, params?)`

Remove specific cache entry.

**Signature:**
```typescript
invalidate(
  route: string,
  params?: Record<string, unknown>
): void
```

**Example:**
```typescript
// Invalidate specific route
apiCache.invalidate('/api/quotations');

// Invalidate with params
apiCache.invalidate('/api/quotations', { user_id: '123' });
```

---

#### `invalidatePattern(pattern)`

Remove all cache entries matching a regex pattern.

**Signature:**
```typescript
invalidatePattern(pattern: string): void
```

**Example:**
```typescript
// Invalidate all quotation-related caches
apiCache.invalidatePattern('/api/quotations.*');

// Invalidate all user caches
apiCache.invalidatePattern('/api/users/.*');
```

---

#### `clear()`

Remove all cache entries.

**Signature:**
```typescript
clear(): void
```

**Example:**
```typescript
apiCache.clear();
```

---

#### `getStats()`

Get cache statistics.

**Signature:**
```typescript
getStats(): {
  size: number;
  keys: string[];
}
```

**Returns:** Object with cache size and list of keys

**Example:**
```typescript
const stats = apiCache.getStats();
console.log(`Cache size: ${stats.size}`);
console.log('Cached routes:', stats.keys);
```

---

## Helper Functions

### `withCache<T>(handler, route, options?)`

Decorator for API route handlers. Automatically caches successful GET responses.

**Signature:**
```typescript
function withCache<T>(
  handler: () => Promise<T>,
  route: string,
  options?: CacheOptions
): Promise<T>
```

**Example:**
```typescript
import { withCache } from '@/lib/api-cache';

export async function GET(request: Request) {
  return withCache(async () => {
    // Your API logic here
    const data = await fetchQuotations();
    return Response.json(data);
  }, '/api/quotations');
}
```

---

### `getCached<T>(route, params?)`

Convenience function to get cached data.

**Signature:**
```typescript
function getCached<T>(
  route: string,
  params?: Record<string, unknown>
): T | null
```

---

### `setCached<T>(route, data, options?, params?)`

Convenience function to set cached data.

**Signature:**
```typescript
function setCached<T>(
  route: string,
  data: T,
  options?: CacheOptions,
  params?: Record<string, unknown>
): void
```

---

### `invalidateCache(route, params?)`

Convenience function to invalidate cache entry.

**Signature:**
```typescript
function invalidateCache(
  route: string,
  params?: Record<string, unknown>
): void
```

---

### `invalidateCachePattern(pattern)`

Convenience function to invalidate cache by pattern.

**Signature:**
```typescript
function invalidateCachePattern(pattern: string): void
```

---

### `clearCache()`

Convenience function to clear all caches.

**Signature:**
```typescript
function clearCache(): void
```

---

### `getCacheStats()`

Convenience function to get cache statistics.

**Signature:**
```typescript
function getCacheStats(): {
  size: number;
  keys: string[];
}
```

---

## Usage Examples

### Basic Caching

```typescript
import { getCached, setCached } from '@/lib/api-cache';

// Try to get from cache first
let products = getCached<Product[]>('/api/products');

if (!products) {
  // Cache miss - fetch from database
  products = await db.products.findMany();

  // Store in cache for 5 minutes
  setCached('/api/products', products);
}
```

### API Route with Cache

```typescript
import { withCache, invalidateCache } from '@/lib/api-cache';

// GET with cache
export async function GET() {
  return withCache(async () => {
    const quotations = await db.quotations.findMany();
    return Response.json(quotations);
  }, '/api/quotations', { ttl: 10 * 60 * 1000 }); // 10 minutes
}

// POST invalidates cache
export async function POST(request: Request) {
  const data = await request.json();
  const quotation = await db.quotations.create({ data });

  // Invalidate cache
  invalidateCache('/api/quotations');

  return Response.json(quotation);
}
```

### Selective Invalidation

```typescript
import { invalidateCache, invalidateCachePattern } from '@/lib/api-cache';

// After creating a quotation
await createQuotation(data);
invalidateCache('/api/quotations');

// After updating a user
await updateUserProfile(userId, data);
invalidateCachePattern(`/api/users/${userId}.*`);

// After bulk operations
await syncProducts();
invalidateCachePattern('/api/products.*');
```

---

## Optimized Data Fetching

### Module: `src/hooks/use-optimized-fetch.ts`

Enhanced SWR integration with caching, deduplication, and performance optimizations.

---

## Hooks

### `useOptimizedFetch<T>(key, options?)`

Main data fetching hook with automatic caching and revalidation.

**Signature:**
```typescript
function useOptimizedFetch<T>(
  key: Key | null,
  options?: FetchOptions
): SWRResponse<T>
```

**Parameters:**
- `key`: Cache key (usually URL) or `null` to pause fetching
- `options`: Fetch options (see below)

**FetchOptions:**
```typescript
interface FetchOptions extends SWRConfiguration {
  cacheKey?: string;          // Custom cache key
  refreshInterval?: number;   // Revalidation interval (ms)
  dedupingInterval?: number;  // Deduplication interval (ms, default: 2000)
  fallbackData?: T;          // Fallback data while loading
  fetcher?: (url: string) => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}
```

**Returns:** SWR response object with `data`, `error`, `isLoading`, `mutate`, etc.

**Example:**
```typescript
import { useOptimizedFetch } from '@/hooks/use-optimized-fetch';

// Basic usage
function QuotationsList() {
  const { data, error, isLoading } = useOptimizedFetch<Quotation[]>(
    '/api/quotations'
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{data.map(q => <QuotationCard key={q.id} data={q} />)}</div>;
}

// With options
function Dashboard() {
  const { data } = useOptimizedFetch<DashboardData>('/api/dashboard', {
    refreshInterval: 30000,      // Refresh every 30 seconds
    dedupingInterval: 5000,      // Deduplicate within 5 seconds
    fallbackData: DEFAULT_DATA,
    onError: (error) => {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard');
    }
  });

  return <DashboardView data={data} />;
}
```

---

### `useFetchWithTimeout<T>(key, timeout?, options?)`

Fetch data with timeout support.

**Signature:**
```typescript
function useFetchWithTimeout<T>(
  key: Key | null,
  timeout?: number,
  options?: SWRConfiguration
): SWRResponse<T>
```

**Parameters:**
- `key`: Cache key
- `timeout`: Timeout in milliseconds (default: 10000)
- `options`: SWR options

**Example:**
```typescript
const { data, error } = useFetchWithTimeout<ReportData>(
  '/api/reports/monthly',
  15000 // 15 second timeout
);

if (error?.name === 'AbortError') {
  return <div>Request timeout. Please try again.</div>;
}
```

---

### `useBatchFetch<T>(keys, options?)`

Fetch multiple items in parallel with batching.

**Signature:**
```typescript
function useBatchFetch<T>(
  keys: Key[],
  options?: SWRConfiguration
): SWRResponse<T[]>
```

**Example:**
```typescript
function ProductGrid({ productIds }: { productIds: string[] }) {
  const keys = productIds.map(id => `/api/products/${id}`);
  const { data: products } = useBatchFetch<Product>(keys);

  return (
    <div>
      {products?.map(p => p && <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

---

### `useInfiniteFetch<T>(key, getPage, options?)`

Infinite scroll data fetching.

**Signature:**
```typescript
function useInfiniteFetch<T>(
  key: Key | null,
  getPage: (pageIndex: number, previousPageData: T[] | null) => T[] | null,
  options?: SWRConfiguration
): InfiniteFetchResult<T>
```

**Returns:**
```typescript
{
  data: T[][];
  error: Error;
  isLoadingInitialData: boolean;
  isLoadingMore: boolean;
  isEmpty: boolean;
  isReachingEnd: boolean;
  size: number;
  setSize: (size: number) => void;
}
```

**Example:**
```typescript
function InfiniteQuotationsList() {
  const { data, isLoadingMore, isReachingEnd, setSize } = useInfiniteFetch<Quotation>(
    '/api/quotations',
    (index, previousData) => {
      if (previousData && !previousData.length) return null; // No more data
      return `/api/quotations?page=${index + 1}&limit=20`;
    }
  );

  return (
    <div>
      {data?.flat().map(q => <QuotationCard key={q.id} quotation={q} />)}
      {!isReachingEnd && (
        <button onClick={() => setSize(s => s + 1)}>
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

---

## Utility Functions

### `prefetchData<T>(key, data?)`

Prefetch data for faster navigation.

**Signature:**
```typescript
function prefetchData<T>(key: Key, data?: T): Promise<void>
```

**Example:**
```typescript
import { prefetchData } from '@/hooks/use-optimized-fetch';

// In navigation handler
function handleNavigateToQuotation(id: string) {
  // Prefetch quotation data
  prefetchData(`/api/quotations/${id}`);

  // Navigate immediately
  router.push(`/quotations/${id}`);
}

// Prefetch with data
prefetchData('/api/dashboard', cachedDashboardData);
```

---

### `prefetchMultiple(keys)`

Prefetch multiple keys in parallel.

**Signature:**
```typescript
function prefetchMultiple(keys: Key[]): Promise<void>
```

**Example:**
```typescript
import { prefetchMultiple } from '@/hooks/use-optimized-fetch';

// Prefetch dashboard data on hover
function DashboardLink() {
  return (
    <Link
      href="/dashboard"
      onMouseEnter={() => {
        prefetchMultiple([
          '/api/dashboard/stats',
          '/api/dashboard/quotations',
          '/api/dashboard/orders'
        ]);
      }}
    >
      Dashboard
    </Link>
  );
}
```

---

### `clearCache(key)`

Clear cache for specific key.

**Signature:**
```typescript
function clearCache(key: Key): Promise<void>
```

---

### `clearAllCache()`

Clear entire SWR cache.

**Signature:**
```typescript
function clearAllCache(): Promise<void>
```

**Example:**
```typescript
import { clearCache, clearAllCache } from '@/hooks/use-optimized-fetch';

// After logout
async function handleLogout() {
  await clearAllCache();
  router.push('/login');
}

// After updating a resource
async function updateQuotation(id: string, data: Partial<Quotation>) {
  await fetch(`/api/quotations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });

  // Clear cache for this quotation
  await clearCache(`/api/quotations/${id}`);
}
```

---

### `revalidate(key)`

Revalidate data for a specific key.

**Signature:**
```typescript
function revalidate(key: Key): Promise<void>
```

**Example:**
```typescript
import { revalidate } from '@/hooks/use-optimized-fetch';

// After WebSocket update
socket.on('quotation_updated', (quotation) => {
  // Revalidate to get fresh data
  revalidate(`/api/quotations/${quotation.id}`);
});
```

---

## Lazy Loading Utilities

### Module: `src/lib/lazy-load.tsx`

Utilities for lazy loading components with loading states and error boundaries.

---

## Loading Components

### `DefaultLoadingSpinner`

Simple loading spinner component.

**Example:**
```typescript
import { DefaultLoadingSpinner } from '@/lib/lazy-load';

<DefaultLoadingSpinner />
```

---

### `DefaultLoadingSkeleton`

Skeleton loading placeholder.

**Example:**
```typescript
import { DefaultLoadingSkeleton } from '@/lib/lazy-load';

<DefaultLoadingSkeleton />
```

---

### `FullPageLoading`

Full page loading state with message.

**Example:**
```typescript
import { FullPageLoading } from '@/lib/lazy-load';

<FullPageLoading />
```

---

## Component Utilities

### `createLazyComponent<T>(importFn, options?)`

Create a lazy loaded component with loading state.

**Signature:**
```typescript
function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: LazyLoadOptions
): LazyExoticComponent<T>
```

**LazyLoadOptions:**
```typescript
interface LazyLoadOptions {
  fallback?: React.ReactNode;
  ssr?: boolean;
}
```

**Example:**
```typescript
import { createLazyComponent } from '@/lib/lazy-load';

const HeavyChart = createLazyComponent(
  () => import('@/components/HeavyChart'),
  {
    fallback: <DefaultLoadingSpinner />,
    ssr: false
  }
);

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  );
}
```

---

### `lazyWithFallback<T>(importFn, options?)`

Create a lazy loaded component with Suspense wrapper.

**Signature:**
```typescript
function lazyWithFallback<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: LazyLoadOptions
): ComponentType<any>
```

**Example:**
```typescript
import { lazyWithFallback } from '@/lib/lazy-load';

const RichTextEditor = lazyWithFallback(
  () => import('@/components/RichTextEditor'),
  {
    fallback: <DefaultLoadingSkeleton />
  }
);

// Use without Suspense wrapper
function Editor() {
  return <RichTextEditor />;
}
```

---

### `createDynamicComponent<T>(importFn, options?)`

Create a dynamically imported component for Next.js.

**Signature:**
```typescript
function createDynamicComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options?: DynamicImportOptions
): ComponentType<any>
```

**DynamicImportOptions:**
```typescript
interface DynamicImportOptions {
  loading?: ComponentType;
  ssr?: boolean;
}
```

**Example:**
```typescript
import { createDynamicComponent } from '@/lib/lazy-load';

const PdfViewer = createDynamicComponent(
  () => import('@/components/PdfViewer'),
  {
    loading: DefaultLoadingSpinner,
    ssr: false // Don't render on server
  }
);
```

---

### `withLazyLoad<P>(Component, fallback?)`

HOC to wrap component with lazy loading.

**Signature:**
```typescript
function withLazyLoad<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
): ComponentType<P>
```

**Example:**
```typescript
import { withLazyLoad } from '@/lib/lazy-load';

const HeavyReport = withLazyLoad(ReportComponent);

function ReportsPage() {
  return <HeavyReport data={reportData} />;
}
```

---

### `splitRoute<P>(importFn, fallback?)`

HOC for code splitting at route level.

**Signature:**
```typescript
function splitRoute<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
): ComponentType<P>
```

**Example:**
```typescript
import { splitRoute } from '@/lib/lazy-load';

const AdminDashboard = splitRoute(
  () => import('@/app/admin/dashboard/page'),
  <FullPageLoading />
);

// Use in routing
```

---

## Image Lazy Loading

### `createLazyImage(src, options?)`

Create an image lazy loading wrapper.

**Signature:**
```typescript
function createLazyImage(
  src: string,
  options?: {
    alt?: string;
    className?: string;
    placeholder?: string;
  }
): (props: React.ImgHTMLAttributes<HTMLImageElement>) => JSX.Element
```

**Example:**
```typescript
import { createLazyImage } from '@/lib/lazy-load';

const LazyProductImage = createLazyImage('/images/product.jpg', {
  alt: 'Product Image',
  className: 'w-full h-auto',
  placeholder: '/images/placeholder.jpg'
});

function ProductCard() {
  return <LazyProductImage />;
}
```

---

### `LazyIntersectionImage`

Intersection Observer based lazy image component.

**Signature:**
```typescript
function LazyIntersectionImage(
  props: React.ImgHTMLAttributes<HTMLImageElement> & {
    placeholder?: string;
  }
): JSX.Element
```

**Example:**
```typescript
import { LazyIntersectionImage } from '@/lib/lazy-load';

function ProductGallery({ images }: { images: string[] }) {
  return (
    <div>
      {images.map(src => (
        <LazyIntersectionImage
          key={src}
          src={src}
          alt="Product"
          placeholder="/images/placeholder.jpg"
          className="w-full h-auto"
        />
      ))}
    </div>
  );
}
```

---

## Predefined Lazy Components

The following pre-configured lazy components are available:

```typescript
import {
  LazyAdminDashboard,
  LazyChart,
  LazyPdfGenerator,
  LazyRichTextEditor
} from '@/lib/lazy-load';

// Use directly
<LazyAdminDashboard />
<LazyChart data={chartData} />
<LazyPdfGenerator quotation={quotation} />
<LazyRichTextEditor content={content} />
```

---

## Performance Tips

### 1. Cache Duration Guidelines

| Data Type | Recommended TTL | Reason |
|-----------|----------------|--------|
| User profile | 5-15 minutes | Changes infrequently |
| Product catalog | 30-60 minutes | Relatively static |
| Quotations list | 1-5 minutes | Can change frequently |
| Dashboard stats | 30-60 seconds | Near real-time needed |
| System settings | 1 hour + | Very static |

### 2. Deduplication Intervals

| Use Case | Dedup Interval |
|----------|----------------|
| Rapid user actions | 500ms - 1s |
| Normal navigation | 2s - 5s |
| Background refresh | 10s - 30s |

### 3. Lazy Loading Priorities

| Priority | Components to Lazy Load | Impact |
|----------|------------------------|--------|
| High | Charts, PDF generators, Rich text editors | 40-60% bundle reduction |
| Medium | Admin dashboard, Reports | 20-30% bundle reduction |
| Low | Small UI components | < 10% bundle reduction |

### 4. Image Loading

- Use `loading="lazy"` for below-fold images
- Use `LazyIntersectionImage` for better control
- Provide low-quality placeholders for better UX

---

**Last Updated:** 2026-01-03
**Modules:** api-cache, use-optimized-fetch, lazy-load
**Version:** 1.0
