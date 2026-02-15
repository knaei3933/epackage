/**
 * OrderStatusTimeline Component
 *
 * 注文ステータスタイムラインコンポーネント
 * - 注文のステータス変更履歴を時系列で表示
 * - 日本語UI
 * - コンパクトなレイアウト
 */

'use client';

import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { ja } from 'date-fns/locale';
import type { OrderStatusHistory } from '@/types/dashboard';
import { ORDER_STATUS_LABELS } from '@/types/order-status';

interface OrderStatusTimelineProps {
  statusHistory: OrderStatusHistory[];
  currentStatus: string;
}

// 안전한 날짜 변환 헬퍼 함수
function safeFormatDistanceToNow(dateValue: any): string {
  if (!dateValue) return '不明';

  let date: Date;
  try {
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      return '不明';
    }

    if (isNaN(date.getTime())) {
      return '不明';
    }

    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: ja,
    });
  } catch {
    return '不明';
  }
}

// UUID 형식 확인 → "システム"로 변환
function formatChangedBy(changedBy: string): string {
  // UUID 형식이면 "システム"로 표시
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(changedBy)) {
    return 'システム';
  }
  return changedBy || 'システム';
}

// reason 필드 영어 → 일본어 변환
function formatReason(reason: string | null | undefined): string {
  if (!reason) return '';

  const reasonMap: Record<string, string> = {
    'Initial status': '初期ステータス',
    'Initial status (backfilled)': '初期ステータス（バックフィル）',
    'Status updated automatically': 'ステータス自動更新',
    'Payment completed': '支払い完了',
    'File uploaded': 'ファイルアップロード完了',
    'Data received': 'データ受領',
    'Contract signed': '契約署名完了',
    'Production started': '製造開始',
    'Stock in completed': '入庫完了',
    'Shipped': '出荷完了',
    'Delivered': '配送完了',
    'Cancelled by customer': '顧客によるキャンセル',
    'Cancelled by admin': '管理者によるキャンセル',
  };

  // 정확히 일치하는 경우 먼저 확인
  if (reasonMap[reason]) {
    return reasonMap[reason];
  }

  // 부분 일치로 확인 (대소문자 무시)
  const lowerReason = reason.toLowerCase();
  for (const [key, value] of Object.entries(reasonMap)) {
    if (key.toLowerCase() === lowerReason) {
      return value;
    }
  }

  // 변환할 수 없는 경우 원본 반환
  return reason;
}

// 중앙 집중식 스테이터스 라벨 (order-status.ts 사용)
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
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
  return labels[status?.toUpperCase()] || status || '不明';
};

/**
 * 注文ステータスタイムライン
 */
export function OrderStatusTimeline({
  statusHistory,
  currentStatus,
}: OrderStatusTimelineProps) {
  // 접기/펼치기 상태
  const [isExpanded, setIsExpanded] = useState(false);

  // snake_case → camelCase 변환 헬퍼
  const normalizeHistory = (item: any): OrderStatusHistory => ({
    id: item.id,
    orderId: item.order_id,
    fromStatus: item.from_status || '',
    toStatus: item.to_status,
    changedBy: item.changed_by || 'システム',
    changedAt: item.changed_at || item.createdAt,
    reason: item.reason,
    createdAt: item.created_at || item.createdAt,
  });

  const normalizedHistory = statusHistory.map(normalizeHistory);

  // 3개 초과 시 접기/펼치기
  const SHOW_LIMIT = 3;
  const shouldShowToggle = normalizedHistory.length > SHOW_LIMIT;
  const visibleItems = isExpanded ? normalizedHistory : normalizedHistory.slice(0, SHOW_LIMIT);

  if (!statusHistory || statusHistory.length === 0) {
    return (
      <div className="text-center py-4 text-text-muted text-sm">
        <p>ステータス履歴がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-border-secondary" />

        {/* Timeline items */}
        <div className="space-y-3">
          {visibleItems.map((history, index) => (
            <div key={history.id} className="relative flex items-start gap-3">
              {/* Timeline dot */}
              <div className="relative z-10 flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                    history.id === normalizedHistory[normalizedHistory.length - 1]?.id
                      ? 'bg-primary border-primary'
                      : 'bg-background border-border-tertiary'
                  }`}
                >
                  {history.id === normalizedHistory[normalizedHistory.length - 1]?.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Timeline content - 컴팩트한 레이아웃 */}
              <div className="flex-1 min-w-0 pb-2">
                <div className="bg-background border border-border-secondary rounded px-3 py-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* 스테이터스 라벨 */}
                    <span className="text-sm font-medium text-text-primary">
                      {getStatusLabel(history.toStatus)}
                    </span>

                    {/* 상대 시간 */}
                    <span className="text-xs text-text-muted">
                      {safeFormatDistanceToNow(history.changedAt)}
                    </span>
                  </div>

                  {/* 이유와 변경자를 한 줄에 컴팩트하게 표시 */}
                  {(history.reason || history.changedBy) && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
                      {history.reason && (
                        <span>理由: {formatReason(history.reason)}</span>
                      )}
                      {history.reason && history.changedBy && (
                        <span className="text-border-secondary">|</span>
                      )}
                      {history.changedBy && (
                        <span>変更者: {formatChangedBy(history.changedBy)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 접기/펼치기 버튼 */}
      {shouldShowToggle && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 px-3 py-2 text-sm font-medium text-primary border border-primary/30 rounded hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
        >
          {isExpanded ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              折りたたむ ({normalizedHistory.length}件中{SHOW_LIMIT}件表示)
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              すべて表示 ({normalizedHistory.length - SHOW_LIMIT}件追加)
            </>
          )}
        </button>
      )}

      {/* Current status indicator - 컴팩트하게 */}
      {currentStatus && (
        <div className="mt-2 px-3 py-2 bg-primary-lighter/30 border border-primary/30 rounded text-sm">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="font-medium text-text-primary">
              現在: {getStatusLabel(currentStatus)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
