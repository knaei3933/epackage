/**
 * Performance Monitoring System
 *
 * 性能監視システム
 *
 * Tracks and logs slow database queries and API performance
 * Helps identify performance bottlenecks in the application
 */

// ============================================================
// Types
// ============================================================

export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  params?: Record<string, unknown>;
}

export interface PerformanceReport {
  slowQueries: QueryMetrics[];
  totalQueries: number;
  averageDuration: number;
  slowQueryCount: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface PerformanceOptions {
  slowQueryThreshold?: number; // milliseconds
  maxStoredQueries?: number;
  enableLogging?: boolean;
}

// ============================================================
// Performance Monitor Class
// ============================================================

class PerformanceMonitor {
  private queries: QueryMetrics[] = [];
  private slowQueryThreshold: number;
  private maxStoredQueries: number;
  private enableLogging: boolean;

  constructor(options: PerformanceOptions = {}) {
    this.slowQueryThreshold = options.slowQueryThreshold ?? 1000; // 1 second default
    this.maxStoredQueries = options.maxStoredQueries ?? 1000;
    this.enableLogging = options.enableLogging ?? true;
  }

  /**
   * Track a database query execution
   * @param query - SQL query or description
   * @param duration - Execution time in milliseconds
   * @param params - Optional query parameters
   */
  trackQuery(query: string, duration: number, params?: Record<string, unknown>): void {
    const metrics: QueryMetrics = {
      query: this.sanitizeQuery(query),
      duration,
      timestamp: new Date(),
      params,
    };

    // Store the query
    this.queries.push(metrics);

    // Log slow queries immediately
    if (duration > this.slowQueryThreshold && this.enableLogging) {
      this.logSlowQuery(metrics);
    }

    // Prevent memory leaks by limiting stored queries
    if (this.queries.length > this.maxStoredQueries) {
      this.queries.shift();
    }
  }

  /**
   * Generate a performance report for a time period
   * @param startTime - Start of reporting period
   * @param endTime - End of reporting period
   */
  generateReport(startTime?: Date, endTime?: Date): PerformanceReport {
    const start = startTime || new Date(0);
    const end = endTime || new Date();

    const periodQueries = this.queries.filter(
      q => q.timestamp >= start && q.timestamp <= end
    );

    const slowQueries = periodQueries.filter(
      q => q.duration > this.slowQueryThreshold
    );

    const totalDuration = periodQueries.reduce((sum, q) => sum + q.duration, 0);
    const averageDuration = periodQueries.length > 0
      ? totalDuration / periodQueries.length
      : 0;

    return {
      slowQueries,
      totalQueries: periodQueries.length,
      averageDuration,
      slowQueryCount: slowQueries.length,
      period: {
        start,
        end,
      },
    };
  }

  /**
   * Get all slow queries above threshold
   */
  getSlowQueries(): QueryMetrics[] {
    return this.queries.filter(q => q.duration > this.slowQueryThreshold);
  }

  /**
   * Clear all stored metrics
   */
  clear(): void {
    this.queries = [];
  }

  /**
   * Get current statistics
   */
  getStats(): {
    totalQueries: number;
    slowQueries: number;
    averageDuration: number;
    maxDuration: number;
    minDuration: number;
  } {
    if (this.queries.length === 0) {
      return {
        totalQueries: 0,
        slowQueries: 0,
        averageDuration: 0,
        maxDuration: 0,
        minDuration: 0,
      };
    }

    const durations = this.queries.map(q => q.duration);
    const total = durations.reduce((sum, d) => sum + d, 0);

    return {
      totalQueries: this.queries.length,
      slowQueries: this.getSlowQueries().length,
      averageDuration: total / this.queries.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
    };
  }

  // ============================================================
  // Private Methods
  // ============================================================

  /**
   * Log a slow query to console
   */
  private logSlowQuery(metrics: QueryMetrics): void {
    console.warn(`[PERFORMANCE] Slow Query Detected:
  Query: ${metrics.query}
  Duration: ${metrics.duration}ms (threshold: ${this.slowQueryThreshold}ms)
  Timestamp: ${metrics.timestamp.toISOString()}
  ${metrics.params ? `Params: ${JSON.stringify(metrics.params)}` : ''}`);
  }

  /**
   * Sanitize query for logging (remove sensitive data)
   */
  private sanitizeQuery(query: string): string {
    // Truncate very long queries
    if (query.length > 200) {
      return query.substring(0, 200) + '...';
    }
    return query;
  }
}

// ============================================================
// Singleton Instance
// ============================================================

let globalMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(options?: PerformanceOptions): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor(options);
  }
  return globalMonitor;

}

export function resetPerformanceMonitor(): void {
  if (globalMonitor) {
    globalMonitor.clear();
  }
  globalMonitor = null;
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Decorator to automatically track query performance
 */
export function trackQueryPerformance(
  monitor: PerformanceMonitor,
  queryDescription?: string
) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const startTime = Date.now();
      const query = queryDescription || `${String(propertyKey)}`;

      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;

        monitor.trackQuery(query, duration);
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        monitor.trackQuery(`${query} (FAILED)`, duration);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Wrapper function to track async operations
 */
export async function trackPerformance<T>(
  monitor: PerformanceMonitor,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = Date.now() - startTime;

    monitor.trackQuery(operation, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    monitor.trackQuery(`${operation} (FAILED)`, duration);
    throw error;
  }
}

// ============================================================
// Exports
// ============================================================

// Export both as default and named export for flexibility
export { PerformanceMonitor };
export default PerformanceMonitor;
