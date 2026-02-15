import { Card, Badge } from '@/components/ui';
import { useState, useEffect } from 'react';

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  count: number;
  action?: string;
  actionHref?: string;
}

/**
 * AlertsWidget - 알림 위젯
 *
 * 목업 데이터 제거됨 - 이제 실제 API 데이터만 표시
 * 데이터가 없으면 Empty State 표시
 */
export function AlertsWidget() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // API 호출로アラートを取得
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/admin/alerts')
        if (response.ok) {
          const data = await response.json()
          setAlerts(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
  }, [])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '🔴';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getAlertTextColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  const handleDismiss = (id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">アラート</h3>
          <span className="text-xs text-gray-500">{alerts.length}件の通知</span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <p>読み込み中...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">すべて順調です</h3>
              <p className="text-sm text-gray-500 text-center">
現在、確認が必要なアラートはありません
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getAlertBgColor(alert.type)} hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-xl">{getAlertIcon(alert.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${getAlertTextColor(alert.type)} truncate`}>
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500">{alert.count}件</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.action && (
                    <button
                      onClick={() => (window.location.href = alert.actionHref || '#')}
                      className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      {alert.action}
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 通知設定リンク */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-700 w-full text-center">
            通知設定を管理 →
          </button>
        </div>
      </div>
    </Card>
  );
}
