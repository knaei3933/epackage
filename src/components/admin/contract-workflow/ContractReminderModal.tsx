import { useState } from 'react';
import { Card, Button } from '@/components/ui';

interface ContractReminderModalProps {
  contract: {
    id: string;
    contractNumber: string;
    customerName: string;
    customerEmail?: string;
  };
  onClose: () => void;
  onSent: () => void;
}

export function ContractReminderModal({ contract, onClose, onSent }: ContractReminderModalProps) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(
    `${contract.customerName}様\n\nお世話になっております。\n\n契約書への署名がまだ完了しておりません。\n\nつきましては、以下のリンクより署名手続きをお願いいたします。\n\n署名期限: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP')}\n\nご不明な点がございましたら、お気軽にお問い合わせください。`
  );

  const handleSend = async () => {
    setSending(true);
    try {
      const response = await fetch('/api/admin/contracts/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: contract.id,
          message
        })
      });

      if (response.ok) {
        onSent();
      } else {
        alert('送信に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            リマインダー送信
          </h3>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                契約番号: <span className="font-medium text-gray-900">{contract.contractNumber}</span>
              </p>
              <p className="text-sm text-gray-600">
                顧客名: <span className="font-medium text-gray-900">{contract.customerName}</span>
              </p>
              <p className="text-sm text-gray-600">
                メールアドレス: <span className="font-medium text-gray-900">{contract.customerEmail || '---'}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メッセージ内容
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={onClose}
                variant="outline"
                disabled={sending}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? '送信中...' : '送信'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
