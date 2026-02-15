import { Card, Button } from '@/components/ui';
import { useRouter } from 'next/navigation';

export function QuickActionsWidget() {
  const router = useRouter();

  const actions = [
    { label: '注文管理', href: '/admin/orders', icon: '📦', description: 'すべての注文を確認・管理' },
    { label: '承認待ち', href: '/admin/approvals', icon: '✅', description: '承認待ちのリクエストを処理' },
    { label: '生産管理', href: '/admin/production', icon: '🏭', description: '生産状況を確認・管理' },
    { label: '出荷処理', href: '/admin/shipments', icon: '🚚', description: '出荷・配送を処理' },
    { label: '契約管理', href: '/admin/contracts', icon: '📄', description: '契約書を管理' },
    { label: '在庫管理', href: '/admin/inventory', icon: '📊', description: '在庫状況を確認' }
  ];

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h3>
        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.href}
              onClick={() => router.push(action.href)}
              className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-colors group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{action.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 group-hover:text-blue-600">{action.label}</p>
                <p className="text-xs text-gray-500 truncate">{action.description}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
