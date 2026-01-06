/**
 * Performance Dashboard Component
 *
 * パフォーマンスダッシュボードコンポーネント
 *
 * Visualizes API performance metrics including slow queries,
 * response times, and query statistics
 */

'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';

// ============================================================
// Types
// ============================================================

interface PerformanceMetrics {
  summary: {
    totalQueries: number;
    slowQueries: number;
    slowQueryPercentage: string;
    averageDuration: string;
    p50: string;
    p95: string;
    p99: string;
    maxDuration: number;
    minDuration: number;
  };
  slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: string;
    params?: Record<string, unknown>;
  }>;
  period: {
    start: string;
    end: string;
  };
}

interface PerformanceDashboardProps {
  className?: string;
}

// ============================================================
// Component
// ============================================================

export default function PerformanceDashboard({ className = '' }: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>('1h');

  // Fetch performance metrics
  const fetchMetrics = async (selectedPeriod: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/performance/metrics?period=${selectedPeriod}`);

      if (!response.ok) {
        throw new Error('Failed to fetch performance metrics');
      }

      const data = await response.json();
      setMetrics(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Clear metrics
  const clearMetrics = async () => {
    if (!confirm('すべてのパフォーマンス指標をクリアしますか？')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/performance/metrics', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear metrics');
      }

      setMetrics(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Fetch metrics on mount and period change
  useEffect(() => {
    fetchMetrics(period);
  }, [period]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMetrics(period);
    }, 30000);

    return () => clearInterval(interval);
  }, [period]);

  // Format duration
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP');
  };

  // Render loading state
  if (loading && !metrics) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !metrics) {
    return (
      <div className={`p-6 ${className}`}>
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="text-red-600">エラー: {error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">パフォーマンスダッシュボード</h2>
          <p className="text-sm text-gray-600 mt-1">APIパフォーマンスの監視と分析</p>
        </div>
        <div className="flex gap-2">
          {/* Period selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">過去1時間</option>
            <option value="24h">過去24時間</option>
            <option value="7d">過去7日間</option>
            <option value="30d">過去30日間</option>
          </select>
          <button
            onClick={() => fetchMetrics(period)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            更新
          </button>
          <button
            onClick={clearMetrics}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            クリア
          </button>
        </div>
      </div>

      {metrics && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-gray-600">総クエリ数</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {metrics.summary.totalQueries.toLocaleString()}
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-gray-600">スロークエリ</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {metrics.summary.slowQueries.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.summary.slowQueryPercentage}%
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-gray-600">平均応答時間</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatDuration(parseFloat(metrics.summary.averageDuration))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="text-sm text-gray-600">P95 応答時間</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatDuration(parseFloat(metrics.summary.p95))}
              </div>
            </Card>
          </div>

          {/* Response Time Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">応答時間分布</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">P50 (中央値)</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatDuration(parseFloat(metrics.summary.p50))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">P95 (95パーセンタイル)</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatDuration(parseFloat(metrics.summary.p95))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">P99 (99パーセンタイル)</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatDuration(parseFloat(metrics.summary.p99))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">最大値</div>
                <div className="text-lg font-semibold text-red-600">
                  {formatDuration(metrics.summary.maxDuration)}
                </div>
              </div>
            </div>
          </Card>

          {/* Slow Queries Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">スロークエリ詳細</h3>
            {metrics.slowQueries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                スロークエリはありません
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-700">クエリ</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">応答時間</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-700">タイムスタンプ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.slowQueries.map((query, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {query.query}
                          </code>
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-red-600 font-medium">
                            {formatDuration(query.duration)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-600">
                          {formatTimestamp(query.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
