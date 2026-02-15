/**
 * Admin Payment Confirmation Client Component
 *
 * 管理者入金確認クライアント
 * Handles:
 * - Display order amount and payment info
 * - Input payment amount and date
 * - Confirm payment
 * - Send notification to customer
 *
 * @client
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal, useConfirmModal } from '@/components/ui/ConfirmModal';
import { CheckCircle, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { adminFetch } from '@/lib/auth-client';
import type { Order } from '@/types/dashboard';

// =====================================================
// Props
// =====================================================

interface PaymentConfirmationClientProps {
  order: Order;
}

// =====================================================
// Main Component
// =====================================================

export function PaymentConfirmationClient({ order }: PaymentConfirmationClientProps) {
  const router = useRouter();

  // Custom Modal State
  const { isOpen: isConfirmModalOpen, openConfirmModal, closeConfirmModal, modalProps } = useConfirmModal();

  // Focus management
  const paymentAmountRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // State
  const [paymentAmount, setPaymentAmount] = useState(order.totalAmount || 0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [existingPayment, setExistingPayment] = useState<{
    payment_amount?: number;
    payment_confirmed_at?: string;
    payment_method?: string;
  } | null>(null);
  const [pendingAction, setPendingAction] = useState<'confirm' | 'update' | null>(null);

  // Focus error on error display
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus();
      // Announce to screen readers
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  // Load existing payment info
  useEffect(() => {
    loadPaymentInfo();
  }, [order.id]);

  const loadPaymentInfo = async () => {
    try {
      const response = await adminFetch(`/api/admin/orders/${order.id}/payment-confirmation`);
      if (response.ok) {
        const data = await response.json();
        if (data.payment) {
          setExistingPayment(data.payment);
          setPaymentAmount(data.payment.payment_amount || order.totalAmount);
          setPaymentDate(data.payment.payment_confirmed_at ?
            data.payment.payment_confirmed_at.split('T')[0] :
            new Date().toISOString().split('T')[0]
          );
          setPaymentMethod(data.payment.payment_method || 'bank_transfer');
        }
      }
    } catch (err) {
      console.error('Failed to load payment info:', err);
    }
  };

  // Clear success message after 3 seconds with cleanup
  useEffect(() => {
    if (!successMessage) return;

    const timer = setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // Confirm payment
  const handleConfirm = async () => {
    if (!paymentAmount || paymentAmount <= 0) {
      setError('入金額を入力してください');
      return;
    }

    if (!paymentDate) {
      setError('入金日を入力してください');
      return;
    }

    // Show custom modal instead of native confirm()
    if (existingPayment) {
      setPendingAction('update');
      openConfirmModal({
        title: '入金情報の更新',
        message: '既に入金確認済みです。更新しますか？',
        confirmLabel: '更新',
        cancelLabel: 'キャンセル',
        variant: 'warning',
        onConfirm: executeConfirm,
      });
    } else {
      setPendingAction('confirm');
      openConfirmModal({
        title: '入金確認',
        message: `入金額: ¥${paymentAmount.toLocaleString()}\nで確認します。よろしいですか？`,
        confirmLabel: '確認',
        cancelLabel: 'キャンセル',
        variant: 'info',
        onConfirm: executeConfirm,
      });
    }
  };

  // Execute payment confirmation
  const executeConfirm = async () => {
    setIsConfirming(true);
    setError(null);

    try {
      const response = await adminFetch(`/api/admin/orders/${order.id}/payment-confirmation`, {
        method: 'POST',
        body: JSON.stringify({
          paymentAmount,
          paymentDate,
          paymentMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '入金確認に失敗しました');
      }

      if (result.success) {
        setSuccessMessage('入金を確認しました。');
        loadPaymentInfo();
        // Focus confirm button after successful update
        setTimeout(() => {
          confirmButtonRef.current?.focus();
        }, 100);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div
          ref={errorRef}
          role="alert"
          aria-live="assertive"
          className="bg-red-50 border border-red-200 rounded-lg p-4"
          tabIndex={-1}
        >
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">エラー</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                // Return focus to input
                paymentAmountRef.current?.focus();
              }}
              className="text-red-600 hover:text-red-800"
              aria-label="エラーメッセージを閉じて入金額に戻る"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Display */}
      {successMessage && (
        <div role="status" aria-live="polite" className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Amount Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">注文金額</h3>
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">注文総額</p>
            <p className="text-2xl font-bold text-gray-900">
              ¥{(order.totalAmount || 0).toLocaleString()}
            </p>
          </div>
          <DollarSign className="w-12 h-12 text-blue-600" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">小計</p>
            <p className="font-medium text-gray-900">
              ¥{(order.subtotal || 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-600">消費税</p>
            <p className="font-medium text-gray-900">
              ¥{(order.taxAmount || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Existing Payment Status */}
      {existingPayment && (
        <Card className="p-6 border-green-200 bg-green-50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">入金確認済み</h3>
              <p className="text-sm text-green-700">
                ¥{existingPayment.payment_amount?.toLocaleString()} /
                {new Date(existingPayment.payment_confirmed_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Confirmation Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">入金確認</h3>

        {/* Payment Amount */}
        <div className="mb-4">
          <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700 mb-2">
            入金額 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden="true">¥</span>
            <input
              id="payment-amount"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="0.01"
              aria-label="入金額を入力"
              aria-describedby="payment-amount-hint"
            />
          </div>
          {paymentAmount < (order.totalAmount || 0) && (
            <p className="text-sm text-yellow-600 mt-1">
              ⚠️ 注文総額より少ないです（不足額: ¥{((order.totalAmount || 0) - paymentAmount).toLocaleString()}）
            </p>
          )}
          {paymentAmount > (order.totalAmount || 0) && (
            <p className="text-sm text-blue-600 mt-1">
              ℹ️ 注文総額より多いです（超過額: ¥{(paymentAmount - (order.totalAmount || 0)).toLocaleString()}）
            </p>
          )}
        </div>

        {/* Payment Date */}
        <div className="mb-4">
          <label htmlFor="payment-date" className="block text-sm font-medium text-gray-700 mb-2">
            入金日 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="入金日を選択"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-2">
            入金方法 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              aria-label="入金方法を選択"
            >
              <option value="bank_transfer">銀行振込</option>
              <option value="credit_card">クレジットカード</option>
              <option value="cash">現金</option>
              <option value="other">その他</option>
            </select>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={isConfirming}
            aria-label="キャンセルして前のページに戻る"
          >
            キャンセル
          </Button>
          <Button
            ref={confirmButtonRef}
            variant="primary"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 hover-lift active:scale-95 transition-all"
            aria-label={existingPayment ? '入金情報を更新' : '入金を確認'}
          >
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            {isConfirming ? '処理中...' : existingPayment ? '更新' : '入金確認'}
          </Button>
        </div>
      </Card>

      {/* Next Steps Info */}
      {!existingPayment && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">次のステップ</h3>
          <p className="text-sm text-blue-800">
            入金確認後、以下の条件が整うと製造を開始できます：
          </p>
          <ul className="mt-2 text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>✅ 入金確認</li>
            <li>✅ データ承認完了</li>
            <li>✅ 契約書署名</li>
          </ul>
        </Card>
      )}

      {/* Custom Confirm Modal */}
      {isConfirmModalOpen && modalProps && (
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={closeConfirmModal}
          {...modalProps}
        />
      )}
    </div>
  );
}
