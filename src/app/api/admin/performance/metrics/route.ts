/**
 * Performance Metrics API
 *
 * パフォーマンス指標API
 * Provides performance monitoring data for admin dashboard
 *
 * @route GET /api/admin/performance/metrics
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getPerformanceMonitor } from '@/lib/performance-monitor';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

// GET /api/admin/performance/metrics - Get performance metrics
export async function GET(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '1h'; // 1h, 24h, 7d, 30d

    // Calculate time range
    const now = new Date();
    let startTime: Date;

    switch (period) {
      case '1h':
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now.getTime() - 60 * 60 * 1000);
    }

    // Get performance monitor instance
    const perfMonitor = getPerformanceMonitor();

    // Generate performance report
    const report = perfMonitor.generateReport(startTime, now);
    const stats = perfMonitor.getStats();

    // Calculate percentiles
    const durations = report.slowQueries.map(q => q.duration);
    const p50 = calculatePercentile(durations, 50);
    const p95 = calculatePercentile(durations, 95);
    const p99 = calculatePercentile(durations, 99);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalQueries: report.totalQueries,
          slowQueries: report.slowQueryCount,
          slowQueryPercentage: report.totalQueries > 0
            ? (report.slowQueryCount / report.totalQueries * 100).toFixed(2)
            : '0.00',
          averageDuration: report.averageDuration.toFixed(2),
          p50: p50.toFixed(2),
          p95: p95.toFixed(2),
          p99: p99.toFixed(2),
          maxDuration: stats.maxDuration,
          minDuration: stats.minDuration,
        },
        slowQueries: report.slowQueries.map(q => ({
          query: q.query,
          duration: q.duration,
          timestamp: q.timestamp,
          params: q.params,
        })),
        period: {
          start: startTime.toISOString(),
          end: now.toISOString(),
        },
      },
    });

  } catch (error) {
    console.error('Performance metrics API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}

/**
 * Calculate percentile
 */
function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;

  return sorted[Math.max(0, index)];
}

/**
 * DELETE /api/admin/performance/metrics - Clear performance metrics
 */
export async function DELETE(request: NextRequest) {
  try {
    // ✅ Verify admin authentication first
    const auth = await verifyAdminAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    // Clear performance metrics
    const { resetPerformanceMonitor } = await import('@/lib/performance-monitor');
    resetPerformanceMonitor();

    return NextResponse.json({
      success: true,
      message: 'パフォーマンス指標が初期化されました。'
    });

  } catch (error) {
    console.error('Performance metrics reset error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
