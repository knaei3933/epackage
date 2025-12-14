// Network performance optimization utilities

interface RequestConfig {
  url: string;
  options: RequestInit;
  cacheKey?: string;
  ttl?: number; // Time to live in milliseconds
  deduplicationKey?: string;
  retryCount?: number;
  retryDelay?: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
  etag?: string;
}

class NetworkOptimizer {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<any>>();
  private retryQueue: Map<string, RequestConfig[]> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxRetries = 3;
  private readonly maxCacheSize = 100;

  constructor() {
    // Clean expired cache entries every minute
    setInterval(() => this.cleanupCache(), 60 * 1000);
  }

  /**
   * Optimized fetch with caching, deduplication, and retry logic
   */
  async fetch(config: RequestConfig): Promise<any> {
    const {
      url,
      options,
      cacheKey = `${options.method || 'GET'}:${url}`,
      ttl = this.defaultTTL,
      deduplicationKey = cacheKey,
      retryCount = 0,
      retryDelay = 1000
    } = config;

    // Check cache for GET requests
    if ((!options.method || options.method === 'GET') && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (cached.expiresAt > Date.now()) {
        return cached.data;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    // Deduplicate identical requests
    if (this.pendingRequests.has(deduplicationKey)) {
      return this.pendingRequests.get(deduplicationKey);
    }

    const requestPromise = this.executeRequest(config, retryCount, retryDelay);
    this.pendingRequests.set(deduplicationKey, requestPromise);

    try {
      const result = await requestPromise;

      // Cache successful GET requests
      if ((!options.method || options.method === 'GET') && result) {
        this.setCache(cacheKey, result, ttl);
      }

      return result;
    } finally {
      this.pendingRequests.delete(deduplicationKey);
    }
  }

  private async executeRequest(
    config: RequestConfig,
    retryCount: number,
    retryDelay: number
  ): Promise<any> {
    const { url, options } = config;

    try {
      // Add performance monitoring headers
      const startTime = Date.now();
      const requestId = this.generateRequestId();

      const enhancedOptions = {
        ...options,
        headers: {
          ...options.headers,
          'X-Request-ID': requestId,
          'X-Client-Timestamp': startTime.toString(),
          'Cache-Control': 'no-cache'
        }
      };

      const response = await fetch(url, enhancedOptions);
      const endTime = Date.now();

      // Log performance metrics
      this.logPerformanceMetrics({
        url,
        requestId,
        duration: endTime - startTime,
        status: response.status,
        cached: false
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check for ETag for cache validation
      const etag = response.headers.get('ETag');

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      // Store ETag if available
      if (etag && config.cacheKey) {
        const cached = this.cache.get(config.cacheKey);
        if (cached) {
          cached.etag = etag;
        }
      }

      return data;

    } catch (error) {
      // Retry logic
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        console.warn(`Request failed, retrying (${retryCount + 1}/${this.maxRetries}):`, error);

        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, retryCount)));

        return this.executeRequest(config, retryCount + 1, retryDelay);
      }

      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors and 5xx server errors
    return error instanceof TypeError ||
           (error.message && error.message.includes('HTTP 5'));
  }

  /**
   * Batch multiple requests for parallel execution
   */
  async batch(requests: RequestConfig[]): Promise<any[]> {
    const batchId = this.generateRequestId();

    // Group requests by domain to optimize connection reuse
    const domainGroups = this.groupByDomain(requests);

    const results = await Promise.allSettled(
      Object.values(domainGroups).map(group =>
        Promise.all(group.map(config => this.fetch({ ...config, deduplicationKey: `${batchId}:${config.url}` })))
      )
    );

    // Flatten results
    return results.flatMap(result =>
      result.status === 'fulfilled' ? result.value : Promise.reject(result.reason)
    );
  }

  /**
   * Prefetch resources for better perceived performance
   */
  async prefetch(requests: RequestConfig[], priority: 'high' | 'low' = 'low'): Promise<void> {
    if ('requestIdleCallback' in window && priority === 'low') {
      requestIdleCallback(() => this.performPrefetch(requests));
    } else {
      this.performPrefetch(requests);
    }
  }

  private async performPrefetch(requests: RequestConfig[]): Promise<void> {
    try {
      await Promise.all(
        requests.map(config =>
          this.fetch({
            ...config,
            options: { ...config.options, priority: 'low' }
          }).catch(error => {
            // Silently fail prefetches
            console.debug('Prefetch failed:', config.url, error);
          })
        )
      );
    } catch (error) {
      console.debug('Prefetch batch failed:', error);
    }
  }

  /**
   * Cache management
   */
  private setCache(key: string, data: any, ttl: number): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    });
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      pendingRequests: this.pendingRequests.size
    };
  }

  /**
   * Utility functions
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private groupByDomain(requests: RequestConfig[]): Record<string, RequestConfig[]> {
    return requests.reduce((groups, request) => {
      const url = new URL(request.url, window.location.origin);
      const domain = url.hostname;

      if (!groups[domain]) {
        groups[domain] = [];
      }

      groups[domain].push(request);
      return groups;
    }, {} as Record<string, RequestConfig[]>);
  }

  private logPerformanceMetrics(metrics: {
    url: string;
    requestId: string;
    duration: number;
    status: number;
    cached: boolean;
  }): void {
    // Send to analytics service
    if ('performance' in window && 'measure' in window.performance) {
      const measureName = `fetch_${metrics.requestId}`;
      window.performance.mark(`fetchStart_${metrics.requestId}`, {
        startTime: performance.now() - metrics.duration
      });
      window.performance.mark(`fetchEnd_${metrics.requestId}`);
      window.performance.measure(measureName, `fetchStart_${metrics.requestId}`, `fetchEnd_${metrics.requestId}`);
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Network Performance:', {
        url: metrics.url,
        duration: `${metrics.duration}ms`,
        status: metrics.status,
        cached: metrics.cached
      });
    }
  }
}

// Export singleton instance
export const networkOptimizer = new NetworkOptimizer();

// Utility functions for common patterns
export async function fetchWithCache(url: string, options?: RequestInit, ttl?: number) {
  return networkOptimizer.fetch({
    url,
    options: options || {},
    ttl
  });
}

export async function batchFetch(urls: string[], options?: RequestInit) {
  return networkOptimizer.batch(
    urls.map(url => ({
      url,
      options: options || {}
    }))
  );
}

// API-specific fetch utilities for multi-quantity system
export const multiQuantityAPI = {
  async calculate(params: any) {
    return fetchWithCache('/api/quotes/multi-quantity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    }, 2 * 60 * 1000); // Cache for 2 minutes
  },

  async saveComparison(data: any) {
    return networkOptimizer.fetch({
      url: '/api/comparison/save',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      },
      deduplicationKey: `save_comparison_${Date.now()}` // Prevent deduplication for save operations
    });
  },

  async loadComparisons() {
    return fetchWithCache('/api/comparison/save', undefined, 60 * 1000); // Cache for 1 minute
  },

  async exportComparison(shareId: string, format: string) {
    return networkOptimizer.fetch({
      url: '/api/comparison/export',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareId, format })
      },
      deduplicationKey: `export_${shareId}_${format}_${Date.now()}`
    });
  }
};

// Progressive loading utilities
export class ProgressiveLoader {
  private loadedChunks = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  async loadChunk<T>(id: string, loader: () => Promise<T>): Promise<T> {
    if (this.loadedChunks.has(id)) {
      return this.loadedChunks.get(id) as T;
    }

    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id);
    }

    const promise = loader();
    this.loadingPromises.set(id, promise);

    try {
      const result = await promise;
      this.loadedChunks.set(id, result);
      return result;
    } finally {
      this.loadingPromises.delete(id);
    }
  }

  preloadChunks<T>(chunks: Array<{ id: string; loader: () => Promise<T> }>) {
    chunks.forEach(chunk => {
      this.loadChunk(chunk.id, chunk.loader).catch(() => {
        // Ignore preload errors
      });
    });
  }
}

export const progressiveLoader = new ProgressiveLoader();