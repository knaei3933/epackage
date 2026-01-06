/**
 * OrderStatusTimeline Component
 *
 * 注文ステータスタイムラインコンポーネント
 * - 注文のステータス変更履歴を時系列で表示
 * - 日本語UI
 * - レスポンシブデザイン
 */

import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { OrderStatusHistory } from '@/types/dashboard';
import { ORDER_STATUS_LABELS } from '@/types/order-status';

interface OrderStatusTimelineProps {
  statusHistory: OrderStatusHistory[];
  currentStatus: string;
}

const statusLabels: Record<string, string> = {
  PENDING: '登録待',
  QUOTATION: '見積作成',
  DATA_RECEIVED: 'データ入稿',
  WORK_ORDER: '作業標準書',
  CONTRACT_SENT: '契約書送付',
  CONTRACT_SIGNED: '契約署名完了',
  PRODUCTION: '製造中',
  STOCK_IN: '入庫完了',
  SHIPPED: '出荷完了',
  DELIVERED: '配送完了',
  CANCELLED: 'キャンセル',
};

/**
 * 注文ステータスタイムライン
 */
export function OrderStatusTimeline({
  statusHistory,
  currentStatus,
}: OrderStatusTimelineProps) {
  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        <p>ステータス履歴がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border-secondary" />

        {/* Timeline items */}
        <div className="space-y-6">
          {statusHistory.map((history, index) => (
            <div key={history.id} className="relative flex items-start gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    index === statusHistory.length - 1
                      ? 'bg-primary border-primary'
                      : 'bg-background border-border-tertiary'
                  }`}
                >
                  {index === statusHistory.length - 1 && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Timeline content */}
              <div className="flex-1 min-w-0 pb-6">
                <div className="bg-background-subtle border border-border-secondary rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-text-primary">
                          {statusLabels[history.toStatus] || history.toStatus}
                        </span>
                        {history.fromStatus && history.fromStatus !== history.toStatus && (
                          <span className="text-sm text-text-muted">
                            ({statusLabels[history.fromStatus] || history.fromStatus} から変更)
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-text-muted mb-2">
                        {formatDistanceToNow(new Date(history.changedAt), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </div>

                      {history.reason && (
                        <div className="text-sm text-text-secondary mt-2">
                          理由: {history.reason}
                        </div>
                      )}

                      <div className="text-xs text-text-muted mt-2">
                        変更者: {history.changedBy}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current status indicator */}
      {currentStatus && (
        <div className="mt-4 p-3 bg-primary-lighter border border-primary rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-text-primary">
              現在のステータス: {statusLabels[currentStatus] || currentStatus}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
