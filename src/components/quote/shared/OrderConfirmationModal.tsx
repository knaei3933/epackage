/**
 * Order Confirmation Modal
 *
 * 注文確認モーダル
 *
 * Modal for confirming order creation from quotation items
 * Displays product details, pricing, and collects customer notes
 */

'use client';

import { useState, useCallback } from 'react';
import { X, Package, Calendar, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, Button } from '@/components/ui';
import type { Quotation, QuotationItem } from '@/types/dashboard';

// ============================================================
// Types
// ============================================================

export interface OrderConfirmationData {
  quotationId: string;
  quotationItemId: string;
  requestedDeliveryDate?: string;
  customerNotes?: string;
}

export interface OrderConfirmationResponse {
  success: boolean;
  order?: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
  };
  redirectUrl?: string;
  message: string;
  error?: string;
}

export interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation;
  quotationItem: QuotationItem;
  onConfirm: (data: OrderConfirmationData) => Promise<OrderConfirmationResponse>;
}

// ============================================================
// Component
// ============================================================

export function OrderConfirmationModal({
  isOpen,
  onClose,
  quotation,
  quotationItem,
  onConfirm,
}: OrderConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<OrderConfirmationResponse | null>(null);
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Reset state when modal opens
  const handleOpen = useCallback(() => {
    setResult(null);
    setRequestedDeliveryDate('');
    setCustomerNotes('');
  }, []);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Handle confirm
  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await onConfirm({
        quotationId: quotation.id,
        quotationItemId: quotationItem.id,
        requestedDeliveryDate: requestedDeliveryDate || undefined,
        customerNotes: customerNotes || undefined,
      });

      setResult(response);

      // If successful, redirect after a short delay
      if (response.success && response.redirectUrl) {
        setTimeout(() => {
          window.location.href = response.redirectUrl!;
        }, 1500);
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : '注文の作成に失敗しました',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [quotation, quotationItem, requestedDeliveryDate, customerNotes, onConfirm]);

  // Calculate estimated delivery (default: 1 month from now)
  const estimatedDelivery = new Date();
  estimatedDelivery.setMonth(estimatedDelivery.getMonth() + 1);

  // Parse specifications for display
  const specs = quotationItem.specifications as Record<string, unknown> | undefined;
  const dimensions = specs?.dimensions as string | undefined;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-50 transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            'bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transition-all duration-200',
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-secondary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  注文の確認
                </h2>
                <p className="text-sm text-text-muted">
                  {quotation.quotationNumber}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                'hover:bg-bg-secondary text-text-muted hover:text-text-primary',
                isSubmitting && 'opacity-50 cursor-not-allowed'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {result?.success ? (
              // Success State
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  注文を作成しました
                </h3>
                <p className="text-text-muted mb-4">
                  注文番号: {result.order?.orderNumber}
                </p>
                <p className="text-sm text-text-muted">
                  リダイレクト中...
                </p>
              </div>
            ) : (
              // Form Content
              <div className="space-y-6">
                {/* Product Details */}
                <div>
                  <h3 className="text-sm font-medium text-text-muted mb-3">
                    製品情報
                  </h3>
                  <Card className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">製品名</span>
                      <span className="font-medium text-text-primary">
                        {quotationItem.productName}
                      </span>
                    </div>
                    {dimensions && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted">サイズ</span>
                        <span className="text-text-primary">{dimensions}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">数量</span>
                      <span className="text-text-primary">
                        {quotationItem.quantity.toLocaleString()}個
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">単価</span>
                      <span className="text-text-primary">
                        {quotationItem.unitPrice.toLocaleString()}円
                      </span>
                    </div>
                    <div className="h-px bg-border-secondary my-2" />
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text-primary">合計</span>
                      <span className="text-lg font-semibold text-primary">
                        {quotationItem.totalPrice.toLocaleString()}円
                      </span>
                    </div>
                  </Card>
                </div>

                {/* Requested Delivery Date */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                    <Calendar className="w-4 h-4" />
                    ご希望の納期（任意）
                  </label>
                  <input
                    type="date"
                    value={requestedDeliveryDate}
                    onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary"
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    通常: 校了から約1ヶ月
                  </p>
                </div>

                {/* Customer Notes */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                    <MessageSquare className="w-4 h-4" />
                    備考（任意）
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="特別なご要望がございましたらご記入ください"
                    rows={3}
                    className="w-full px-4 py-2 border border-border-secondary rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-primary resize-none"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Error Message */}
                {result?.error && !result.success && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{result.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {!result?.success && (
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border-secondary">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className={cn(
                  'min-w-[120px]',
                  isSubmitting && 'opacity-80 cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    処理中...
                  </>
                ) : (
                  '注文を作成'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================
// Default Export
// ============================================================

export default OrderConfirmationModal;
