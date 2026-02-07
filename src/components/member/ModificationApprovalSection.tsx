/**
 * Modification Approval Section Component
 *
 * 管理者修正承認セクション
 * - MODIFICATION_REQUESTED ステータスの注文に表示
 * - 修正内容の比較表示
 * - 承認/拒否ボタン
 *
 * @client
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/dashboard';

interface ModificationApprovalSectionProps {
  order: Order;
  onApprovalComplete?: () => void;
}

export function ModificationApprovalSection({
  order,
  onApprovalComplete
}: ModificationApprovalSectionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [reason, setReason] = useState('');

  // MODIFICATION_REQUESTED ステータスの場合のみ表示
  if (order.status !== 'MODIFICATION_REQUESTED') {
    return null;
  }

  const handleApproval = async (action: 'approved' | 'rejected') => {
    setIsProcessing(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/member/orders/${order.id}/approve-modification`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reason: action === 'rejected' ? reason : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: action === 'approved'
            ? '修正内容を承認しました。製造工程に進みます。'
            : '修正内容を拒否しました。管理者に通知されました。'
        });
        setTimeout(() => {
          onApprovalComplete?.();
        }, 1500);
      } else {
        setMessage({
          type: 'error',
          text: result.error || '処理に失敗しました'
        });
      }
    } catch (error) {
      console.error('Failed to process approval:', error);
      setMessage({
        type: 'error',
        text: '処理中にエラーが発生しました'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            修正承認待ち
          </h3>
          <p className="text-sm text-text-muted">
            管理者が注文内容を修正しました。以下の変更内容をご確認の上、承認または拒否を選択してください。
          </p>
        </div>
      </div>

      {/* 修正理由 */}
      {order.modification_reason && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
          <div className="text-xs font-medium text-orange-900 mb-1">修正理由:</div>
          <div className="text-sm text-orange-800">{order.modification_reason}</div>
        </div>
      )}

      {/* メッセージ */}
      {message && (
        <div className={cn(
          "mb-4 p-3 rounded text-sm",
          message.type === 'success'
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-red-50 text-red-800 border border-red-200"
        )}>
          {message.text}
        </div>
      )}

      {/* 注文内容の比較表示 */}
      <div className="mb-4 p-4 bg-muted/10 border border-border-secondary rounded">
        <div className="text-sm font-medium text-text-primary mb-3">修正後の注文内容:</div>
        <div className="space-y-2">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="text-sm">
              <div className="font-medium">{item.product_name || item.productName}</div>
              <div className="text-text-muted text-xs mt-1">
                数量: {item.quantity} | 単価: ¥{item.unit_price?.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 拒否理由入力 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-text-primary mb-2">
          拒否理由（任意）
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="拒否する場合、理由をご記入ください"
          className="w-full px-3 py-2 border border-border-secondary rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          rows={2}
        />
      </div>

      {/* アクションボタン */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleApproval('approved')}
          disabled={isProcessing}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors",
            "bg-green-600 text-white hover:bg-green-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <Check className="w-4 h-4" />
          {isProcessing ? '処理中...' : '修正内容を承認'}
        </button>
        <button
          onClick={() => handleApproval('rejected')}
          disabled={isProcessing}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors",
            "bg-red-600 text-white hover:bg-red-700",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <X className="w-4 h-4" />
          {isProcessing ? '処理中...' : '修正内容を拒否'}
        </button>
      </div>
    </Card>
  );
}
