/**
 * Optimized Data Fetching Hook
 *
 * 最適化されたデータフェッチフック
 *
 * Enhanced SWR integration with caching, deduplication, and performance optimizations
 */

import useSWR, { SWRConfiguration, Key } from 'swr';

// ============================================================
// Types
// ============================================================

interface FetchOptions extends SWRConfiguration {
  // Custom cache key
  cacheKey?: string;
  // Minimum interval for revalidation (ms)
  refreshInterval?: number;
  // Deduplication interval (ms)
  dedupingInterval?: number;
}

// ============================================================
// Fetcher with Error Handling
// ============================================================

/**
 * Enhanced fetcher with automatic retry and error handling
 */
async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    // Add cache control header
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`);
    (error as any).status = response.status;
    (error as any).response = response;
    throw error;
  }

  return response.json();
}

/**
 * Fetcher with timeout support
 */
async function fetcherWithTimeout<T>(
  url: string,
  timeout: number = 10000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      (error as any).response = response;
      throw error;
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ============================================================
// Custom Hooks
// ============================================================

/**
 * Optimized data fetching hook
 * - Automatic caching
 * - Deduplication
 * - Revalidation on focus
 * - Error retry
 */
export function useOptimizedFetch<T>(
  key: Key | null,
  options?: FetchOptions
) {
  const config: SWRConfiguration = {
    // Revalidate on window focus
    revalidateOnFocus: true,
    // Revalidate on reconnect
    revalidateOnReconnect: true,
    // Retry on error
    shouldRetryOnError: true,
    // Error retry count
    errorRetryCount: 3,
    // Error retry interval
    errorRetryInterval: 5000,
    // Deduplication interval (default: 2 seconds)
    dedupingInterval: options?.dedupingInterval || 2000,
    // Refresh interval if provided
    refreshInterval: options?.refreshInterval,
    // Keep data when key changes
    keepPreviousData: true,
    // Loading timeout
    loadingTimeout: 10000,
    // Fallback data
    fallbackData: options?.fallbackData,
    // Custom fetcher
    fetcher: options?.fetcher || fetcher,
    // onSuccess callback
    onSuccess: options?.onSuccess,
    // onError callback
    onError: options?.onError,
  };

  return useSWR<T>(key, config);
}

/**
 * Fetch data with timeout
 */
export function useFetchWithTimeout<T>(
  key: Key | null,
  timeout?: number,
  options?: SWRConfiguration
) {
  const config: SWRConfiguration = {
    ...options,
    fetcher: (url: string) => fetcherWithTimeout<T>(url, timeout),
  };

  return useSWR<T>(key, config);
}

/**
 * Fetch multiple items in parallel with batching
 */
export function useBatchFetch<T>(
  keys: Key[],
  options?: SWRConfiguration
) {
  const config: SWRConfiguration = {
    ...options,
    // Batch fetch requests
    fetcher: async (urls: string) => {
      // If single URL, fetch normally
      if (typeof urls === 'string') {
        return fetcher<T>(urls);
      }

      // If array of URLs, fetch in parallel
      if (Array.isArray(urls)) {
        const results = await Promise.allSettled(
          urls.map((url) => fetcher<T>(url))
        );

        return results.map((result) =>
          result.status === 'fulfilled' ? result.value : null
        );
      }

      throw new Error('Invalid fetcher input');
    },
  };

  return useSWR<T[]>(keys.length > 0 ? keys : null, config);
}

/**
 * Infinite scroll data fetching
 */
export function useInfiniteFetch<T>(
  key: Key | null,
  getPage: (pageIndex: number, previousPageData: T[] | null) => T[] | null,
  options?: SWRConfiguration
) {
  const { data, error, isValidating, size, setSize } = useSWRInfinite<T[]>(
    key,
    getPage,
    {
      revalidateFirstPage: false,
      revalidateAllPages: false,
      ...options,
    }
  );

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isValidating && (data && data.length) === size;
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length < 10);

  return {
    data,
    error,
    isLoadingInitialData,
    isLoadingMore,
    isEmpty,
    isReachingEnd,
    size,
    setSize,
  };
}

// Import SWR infinite for the hook above
import useSWRInfinite from 'swr/infinite';

// ============================================================
// Prefetching Utilities
// ============================================================

/**
 * Prefetch data for faster navigation
 */
export async function prefetchData<T>(key: Key, data?: T): Promise<void> {
  // Import mutate here to avoid circular dependency
  const { mutate } = await import('swr');
  return mutate(key, data, false);
}

/**
 * Prefetch multiple keys
 */
export async function prefetchMultiple(keys: Key[]): Promise<void> {
  const { mutate } = await import('swr');

  await Promise.all(
    keys.map((key) => {
      if (typeof key === 'string') {
        return fetcher(key).then((data) => mutate(key, data, false));
      }
      return Promise.resolve();
    })
  );
}

// ============================================================
// Cache Management
// ============================================================

/**
 * Clear cache for specific key
 */
export async function clearCache(key: Key): Promise<void> {
  const { mutate } = await import('swr');
  return mutate(key, undefined, false);
}

/**
 * Clear entire cache
 */
export async function clearAllCache(): Promise<void> {
  const { cache } = await import('swr/_internal');
  cache.clear();
}

/**
 * Revalidate data
 */
export async function revalidate(key: Key): Promise<void> {
  const { mutate } = await import('swr');
  return mutate(key);
}

// ============================================================
// Export Default Fetcher
// ============================================================

export { fetcher };
export default useOptimizedFetch;
