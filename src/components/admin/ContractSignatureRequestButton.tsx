'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { SignatureStatusBadge } from './SignatureStatusBadge';

interface Contract {
  id: string;
  contractNumber: string;
  orderId: string;
  customerName: string;
  customerEmail?: string;
  status: string;
  sentAt: string | null;
  customerSignedAt: string | null;
  adminSignedAt: string | null;
  expiresAt: string | null;
}

interface ContractSignatureRequestButtonProps {
  contract: Contract;
  onRequestSent?: () => void;
}

export function ContractSignatureRequestButton({
  contract,
  onRequestSent,
}: ContractSignatureRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [method, setMethod] = useState<'email' | 'portal'>('email');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/contracts/request-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contract.id,
          method,
          message: message || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '署名リクエストの送信に失敗しました');
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setMessage('');
        onRequestSent?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // Determine if button should be shown based on contract status
  const canRequestSignature = ['DRAFT', 'SENT', 'EXPIRED'].includes(contract.status);

  if (!canRequestSignature) {
    return (
      <div className="flex items-center gap-2">
        <SignatureStatusBadge status={contract.status} />
        <span className="text-xs text-gray-500">
          {contract.customerSignedAt && `署名: ${new Date(contract.customerSignedAt).toLocaleDateString('ja-JP')}`}
        </span>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="w-full"
      >
        署名をリクエスト
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            契約署名リクエスト
          </h3>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">
              {contract.contractNumber}
            </p>
            <p className="text-xs text-gray-600">
              {contract.customerName}
              {contract.customerEmail && ` (${contract.customerEmail})`}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">署名リクエストを送信しました</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                送信方法
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'email' | 'portal')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="email">メール送信</option>
                <option value="portal">ポータル通知</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {method === 'email'
                  ? '顧客のメールアドレスに署名用リンクを送信します'
                  : 'カスタマーポータルに通知を表示します'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                追加メッセージ（任意）
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="署名についての補足事項があれば入力してください..."
                disabled={loading}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>注意:</strong> 署名リクエストを送信すると、契約書の有効期限が30日間に設定されます。
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                  setSuccess(false);
                  setMessage('');
                }}
                variant="outline"
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || success}
                className="min-w-[100px]"
              >
                {loading ? '送信中...' : success ? '完了' : '送信'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
