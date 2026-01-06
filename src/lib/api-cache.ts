/**
 * API Response Caching Utility
 *
 * APIレスポンスキャッシュユーティリティ
 *
 * Simple in-memory cache for API responses with TTL support
 * Helps reduce database load and improve response times for frequently accessed data
 */

// ============================================================
// Types
// ============================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  key?: string; // Custom cache key
}

// ============================================================
// Cache Store
// ============================================================

class APICache {
  private cache: Map<string, CacheEntry<unknown>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Generate cache key from request parameters
   */
  private generateKey(
    route: string,
    params?: Record<string, string | number | boolean | null | undefined>
  ): string {
    const paramString = params
      ? Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => `${key}=${value}`)
          .join('&')
      : '';

    return paramString ? `${route}?${paramString}` : route;
  }

  /**
   * Get cached data
   */
  get<T>(route: string, params?: Record<string, unknown>): T | null {
    const key = this.generateKey(route, params as Record<string, string>);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data
   */
  set<T>(
    route: string,
    data: T,
    options?: CacheOptions,
    params?: Record<string, unknown>
  ): void {
    const key = options?.key || this.generateKey(route, params as Record<string, string>);
    const ttl = options?.ttl || this.defaultTTL;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Invalidate cache entry
   */
  invalidate(route: string, params?: Record<string, unknown>): void {
    const key = this.generateKey(route, params as Record<string, string>);
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// ============================================================
// Singleton Instance
// ============================================================

const apiCache = new APICache();

// ============================================================
// Helper Functions
// ============================================================

/**
 * Cache decorator for API route handlers
 * Automatically caches successful GET responses
 */
export function withCache<T>(
  handler: () => Promise<T>,
  route: string,
  options?: CacheOptions
): Promise<T> {
  // Try to get from cache first
  const cached = apiCache.get<T>(route);
  if (cached !== null) {
    return Promise.resolve(cached);
  }

  // Execute handler and cache result
  return handler().then((data) => {
    apiCache.set(route, data, options);
    return data;
  });
}

/**
 * Invalidate cache after a mutation
 */
export function invalidateCache(
  route: string,
  params?: Record<string, unknown>
): void {
  apiCache.invalidate(route, params);
}

/**
 * Invalidate all caches matching a pattern
 */
export function invalidateCachePattern(pattern: string): void {
  apiCache.invalidatePattern(pattern);
}

/**
 * Get cache for a specific route
 */
export function getCached<T>(
  route: string,
  params?: Record<string, unknown>
): T | null {
  return apiCache.get<T>(route, params);
}

/**
 * Set cache for a specific route
 */
export function setCached<T>(
  route: string,
  data: T,
  options?: CacheOptions,
  params?: Record<string, unknown>
): void {
  apiCache.set(route, data, options, params);
}

/**
 * Clear all caches
 */
export function clearCache(): void {
  apiCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return apiCache.getStats();
}

// ============================================================
// Exports
// ============================================================

export default apiCache;
