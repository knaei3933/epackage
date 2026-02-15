import { Card, Badge, Button } from '@/components/ui';

interface Contract {
  id: string;
  contractNumber: string;
  orderId: string;
  customerName: string;
  status: string;
  sentAt: string | null;
  customerSignedAt: string | null;
  adminSignedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface ContractTimelineProps {
  contract: Contract;
  onSendReminder: () => void;
}

export function ContractTimeline({ contract, onSendReminder }: ContractTimelineProps) {
  const steps = [
    {
      key: 'created',
      label: '作成',
      date: contract.createdAt,
      completed: true,
      icon: '📄'
    },
    {
      key: 'sent',
      label: '送付',
      date: contract.sentAt,
      completed: !!contract.sentAt,
      icon: '📧'
    },
    {
      key: 'customer_signed',
      label: '顧客署名',
      date: contract.customerSignedAt,
      completed: !!contract.customerSignedAt || ['CUSTOMER_SIGNED', 'ADMIN_SIGNED', 'SIGNED', 'ACTIVE', 'COMPLETED'].includes(contract.status),
      icon: '✍️'
    },
    {
      key: 'admin_signed',
      label: '管理者署名',
      date: contract.adminSignedAt,
      completed: !!contract.adminSignedAt || ['ADMIN_SIGNED', 'SIGNED', 'ACTIVE', 'COMPLETED'].includes(contract.status),
      icon: '✍️'
    },
    {
      key: 'active',
      label: '契約開始',
      date: contract.adminSignedAt,
      completed: contract.status === 'ACTIVE' || contract.status === 'COMPLETED' || contract.status === 'SIGNED',
      icon: '✅'
    }
  ];

  const currentStep = steps.findIndex((s) => !s.completed);

  function formatDate(date: string | null): string {
    if (!date) return '---';
    return new Date(date).toLocaleString('ja-JP');
  }

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">契約詳細</h3>

        {/* 契約情報サマリー */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">契約番号</p>
              <p className="font-medium text-gray-900">{contract.contractNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">ステータス</p>
              <Badge variant={contract.status === 'ACTIVE' ? 'success' : 'default'}>
                {contract.status}
              </Badge>
            </div>
            <div>
              <p className="text-gray-500">顧客名</p>
              <p className="font-medium text-gray-900">{contract.customerName}</p>
            </div>
            <div>
              <p className="text-gray-500">注文番号</p>
              <p className="font-medium text-gray-900">{contract.orderId}</p>
            </div>
          </div>
        </div>

        {/* タイムライン */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">進捗タイムライン</h4>
          {steps.map((step, index) => (
            <div key={step.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-full my-2 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="font-medium text-gray-900">{step.label}</p>
                <p className="text-sm text-gray-500">{formatDate(step.date)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* アクション */}
        <div className="mt-6 space-y-2">
          {['SENT', 'PENDING_SIGNATURE', 'CUSTOMER_SIGNED'].includes(contract.status) && (
            <Button
              onClick={onSendReminder}
              className="w-full"
              variant="outline"
            >
              リマインダー送信
            </Button>
          )}
          <Button className="w-full" variant="outline">
            契約書PDFを表示
          </Button>
          <Button className="w-full" variant="outline">
            タイムスタンプ証明書
          </Button>
        </div>
      </div>
    </Card>
  );
}
