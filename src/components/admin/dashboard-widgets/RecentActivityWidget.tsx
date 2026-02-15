import { Card, Badge } from '@/components/ui';
import { RecentActivity } from '@/types/admin';
import { ORDER_STATUS_LABELS } from '@/types/order-status';

interface RecentActivityWidgetProps {
  orders: any[];
}

/**
 * RecentActivityWidget - 최근 활동 위젯
 *
 * 목업 데이터 제거됨 - 이제 실제 API 데이터만 표시
 * 데이터가 없으면 Empty State 표시
 */
export function RecentActivityWidget({ orders = [] }: RecentActivityWidgetProps) {
  // 실제 데이터만 사용 (목업 데이터 제거)
  const activities = orders;

  function getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
    if (status === 'COMPLETED' || status === 'DELIVERED' || status === 'STOCK_IN') return 'success';
    if (status === 'PENDING' || status === 'QUOTATION') return 'warning';
    if (status === 'CANCELLED') return 'error';
    return 'default';
  }

  function getStatusLabel(status: string): string {
    // 소문자를 대문자로 변환하여 ORDER_STATUS_LABELS 사용
    const upperStatus = status.toUpperCase().replace(/-/g, '_') as keyof typeof ORDER_STATUS_LABELS;
    if (upperStatus in ORDER_STATUS_LABELS) {
      return ORDER_STATUS_LABELS[upperStatus].ja;
    }
    // 레거시 소문자 상태값에 대한 대응
    const legacyLabels: Record<string, string> = {
      'pending': '受付待',
      'processing': '処理中',
      'manufacturing': '製造中',
      'ready': '発送待',
      'shipped': '発送完了',
      'delivered': '配達完了',
      'cancelled': 'キャンセル',
      'in_production': '製造中',
      'stock_in': '入庫済',
      'completed': '完了'
    };
    return legacyLabels[status] || status;
  }

  function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'order': '注文',
      'quotation': '見積',
      'production': '生産',
      'shipment': '出荷'
    };
    return labels[type] || type;
  }

  function getTimeAgo(timestamp: string): string {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    return `${days}日前`;
  }

  const todayShipmentsCount = activities.filter(a => a.type === 'shipment').length;

  // Empty State component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">アクティビティがありません</h3>
      <p className="text-sm text-gray-500 text-center">
新しい注文や見積依頼がここに表示されます
      </p>
    </div>
  );

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">最近のアクティビティ</h3>

        <div className="mt-4 space-y-4">
          {/* 데이터가 없으면 Empty State 표시 */}
          {activities.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* 본日の出荷サマリー */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">本日の出荷</p>
                    <p className="text-xs text-blue-600">完了した出荷件数</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{todayShipmentsCount}</p>
                </div>
              </div>

              {/* アクティビティリスト */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">最新アクティビティ</h4>
                <div className="space-y-3">
                  {activities.slice(0, 6).map((activity: any) => (
                    <div key={activity.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                            {getTypeLabel(activity.type)}
                          </span>
                          <span className="text-xs text-gray-500">{getTimeAgo(activity.createdAt)}</span>
                        </div>
                        <p className="font-medium text-gray-900 mt-1 truncate">{activity.customerName || '顧客名'}</p>
                        <p className="text-sm text-gray-500 truncate">{activity.productName || '商品名'}</p>
                      </div>
                      <Badge variant={getStatusVariant(activity.status)}>
                        {getStatusLabel(activity.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* 統計サマリー */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">{activities.filter(a => a.type === 'order').length}</p>
                  <p className="text-xs text-gray-500">新規注文</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">{activities.filter(a => a.type === 'quotation').length}</p>
                  <p className="text-xs text-gray-500">見積依頼</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">{activities.filter(a => a.type === 'production').length}</p>
                  <p className="text-xs text-gray-500">生産中</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">{activities.filter(a => a.status === 'PENDING').length}</p>
                  <p className="text-xs text-gray-500">保留中</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
