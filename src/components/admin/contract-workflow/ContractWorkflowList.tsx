import { Card, Badge } from '@/components/ui';
import { Contract } from '@/types/admin';

interface ContractWorkflowListProps {
  contracts: Contract[];
  onSelectContract: (contract: Contract) => void;
  onRefresh: () => void;
}

export function ContractWorkflowList({ contracts, onSelectContract, onRefresh }: ContractWorkflowListProps) {
  function getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PENDING_SIGNATURE': return 'warning';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': '下書き',
      'SENT': '送付済み',
      'PENDING_SIGNATURE': '署名待ち',
      'CUSTOMER_SIGNED': '顧客署名済み',
      'ADMIN_SIGNED': '管理者署名済み',
      'SIGNED': '署名済み',
      'ACTIVE': '有効中',
      'COMPLETED': '完了',
      'CANCELLED': 'キャンセル'
    };
    return labels[status] || status;
  }

  function isExpiring(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">契約一覧</h2>
          <button
            onClick={onRefresh}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            更新
          </button>
        </div>

        <div className="space-y-3">
          {contracts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              契約がありません
            </div>
          ) : (
            contracts.map((contract) => (
              <div
                key={contract.id}
                onClick={() => onSelectContract(contract)}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{contract.contractNumber}</p>
                      <Badge variant={getStatusVariant(contract.status)}>
                        {getStatusLabel(contract.status)}
                      </Badge>
                      {isExpiring(contract.expiresAt) && (
                        <span className="text-xs text-red-600">⚠️ 期限切れ</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{contract.customerName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      注文番号: {contract.orderId}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {contract.sentAt && (
                      <p>送付: {new Date(contract.sentAt).toLocaleDateString('ja-JP')}</p>
                    )}
                    {contract.expiresAt && (
                      <p className={isExpiring(contract.expiresAt) ? 'text-red-600' : ''}>
                        有効期限: {new Date(contract.expiresAt).toLocaleDateString('ja-JP')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
