import { Card } from '@/components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DashboardStatistics } from '@/types/admin';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { ORDER_STATUS_LABELS } from '@/types/order-status';

interface OrderStatisticsWidgetProps {
  statistics?: DashboardStatistics & {
    recentQuotations?: Array<{
      quotation_number: string;
      customer_name: string;
      customer_email: string;
      status: string;
      total_amount: number;
      created_at: string;
    }>;
  };
  error?: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function OrderStatisticsWidget({ statistics, error }: OrderStatisticsWidgetProps) {
  const defaultStats: DashboardStatistics = {
    ordersByStatus: [],
    monthlyRevenue: [],
    pendingQuotations: 0,
    activeProduction: 0,
    todayShipments: 0,
    totalOrders: 0,
    totalRevenue: 0
  };

  const stats = statistics || defaultStats;

  // エラー表示用カード
  const ErrorCard = ({ title }: { title: string }) => (
    <Card className="p-6 border-red-200 bg-red-50">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <div className="flex items-center mt-2">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-sm text-red-600">読み込み失敗</span>
        </div>
      </div>
    </Card>
  );

  // ステータス別注文データのチャート用変換
  const statusChartData = stats.ordersByStatus?.map(item => ({
    name: item.status,
    value: item.count,
    label: getStatusLabel(item.status)
  })) || [];

  // 月別売上データのフォーマット
  const revenueChartData = stats.monthlyRevenue?.map(item => ({
    name: item.month,
    売上: item.amount
  })) || [];

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
      'stock_in': '入庫済'
    };
    return legacyLabels[status] || status;
  }

  function formatCurrency(amount?: number | null): string {
    if (amount == null) return '¥0';
    return `¥${amount.toLocaleString('ja-JP')}`;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 総注文数 */}
      {error ? <ErrorCard title="総注文数" /> : (
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-600">総注文数</span>
            <span className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</span>
            <span className="text-xs text-gray-500 mt-1">過去30日間</span>
          </div>
        </Card>
      )}

      {/* 総売上 */}
      {error ? <ErrorCard title="総売上" /> : (
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-600">総売上</span>
            <span className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(stats.totalRevenue)}</span>
            <span className="text-xs text-gray-500 mt-1">過去30日間</span>
          </div>
        </Card>
      )}

      {/* 保留中の見積もり */}
      {error ? <ErrorCard title="保留中見積もり" /> : (
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-600">保留中見積もり</span>
            <span className="text-3xl font-bold text-orange-600 mt-2">{stats.pendingQuotations}</span>
            <span className="text-xs text-gray-500 mt-1">アクションが必要</span>
          </div>
        </Card>
      )}

      {/* 進行中の生産ジョブ */}
      {error ? <ErrorCard title="生産ジョブ" /> : (
        <Card className="p-6">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-600">生産ジョブ</span>
            <span className="text-3xl font-bold text-blue-600 mt-2">{stats.activeProduction}</span>
            <span className="text-xs text-gray-500 mt-1">進行中</span>
          </div>
        </Card>
      )}

      {/* ステータス別注文チャート */}
      {statusChartData.length > 0 && (
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">ステータス別注文</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 月別売上チャート */}
      {revenueChartData.length > 0 && (
        <Card className="p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">月別売上</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="売上" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 最新見積もりリスト */}
      {stats.recentQuotations && stats.recentQuotations.length > 0 && (
        <Card className="p-6 md:col-span-4 lg:col-span-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">最新見積もり要求</h3>
            <Link
              href="/admin/quotations"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              すべて見る →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">見積番号</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">顧客名</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">日付</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentQuotations.map((quote) => (
                  <tr key={quote.quotation_number} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{quote.quotation_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div>{quote.customer_name}</div>
                      <div className="text-xs text-gray-400">{quote.customer_email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        quote.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quote.status === 'draft' ? '下書き' :
                         quote.status === 'sent' ? '送付済み' :
                         quote.status === 'approved' ? '承認済み' : quote.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {quote.total_amount ? formatCurrency(quote.total_amount) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(quote.created_at).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
