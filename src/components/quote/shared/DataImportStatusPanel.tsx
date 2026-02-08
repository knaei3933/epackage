/**
 * Data Import Status Panel (Task 109)
 *
 * Shows:
 * - Payment confirmation status
 * - Data import status from customer
 * - Required modifications list
 * - Status timeline
 *
 * Location: In member quotation detail or order detail page
 */

'use client';

import { Card, Badge, Button } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { CheckCircle2, Clock, AlertCircle, FileText, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';

// =====================================================
// Types
// =====================================================

interface PaymentConfirmation {
  id: string;
  quotation_id: string;
  payment_method: string;
  payment_date: string;
  amount: number;
  reference_number: string | null;
  notes: string | null;
  confirmed_at: string;
}

interface ProductionDataItem {
  id: string;
  order_id: string;
  data_type: string;
  title: string;
  description: string | null;
  version: string;
  validation_status: 'pending' | 'valid' | 'invalid' | 'needs_revision';
  submitted_by_customer: boolean;
  received_at: string;
  validation_notes: string | null;
  validation_errors: Record<string, unknown> | null;
}

interface DataImportStatusResponse {
  payment: PaymentConfirmation | null;
  productionData: ProductionDataItem[];
  orderStatus: string;
  requiredModifications: string[];
}

// =====================================================
// Constants
// =====================================================

const DATA_TYPE_LABELS: Record<string, string> = {
  design_file: 'デザインデータ',
  specification: '仕様書',
  approval: '承認データ',
  material_data: '素材データ',
  layout_data: 'レイアウトデータ',
  color_data: 'カラーデータ',
  other: 'その他',
};

const VALIDATION_STATUS_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'secondary' }> = {
  pending: { label: '検証待ち', variant: 'secondary' },
  valid: { label: '検証済み', variant: 'success' },
  invalid: { label: '無効', variant: 'error' },
  needs_revision: { label: '修正必要', variant: 'warning' },
};

// =====================================================
// Component
// =====================================================

interface DataImportStatusPanelProps {
  quotationId: string;
  orderId?: string;
}

export function DataImportStatusPanel({ quotationId, orderId }: DataImportStatusPanelProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentConfirmation | null>(null);
  const [productionDataResponse, setProductionDataResponse] = useState<DataImportStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment confirmation status
  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/member/quotations/${quotationId}/confirm-payment`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch payment status');
        }
        const data = await response.json();
        setPaymentData(data.payment || null);
      } catch (err) {
        console.error('Failed to fetch payment status:', err);
        setError('支払確認状況の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [quotationId]);

  // Fetch production data status (if order exists)
  useEffect(() => {
    if (!orderId) return;

    const fetchProductionData = async () => {
      try {
        const response = await fetch(`/api/member/orders/${orderId}/production-data`, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch production data');
        }
        const data = await response.json();
        setProductionDataResponse(data);
      } catch (err) {
        console.error('Failed to fetch production data:', err);
      }
    };

    fetchProductionData();
  }, [orderId]);

  const productionData: ProductionDataItem[] = productionDataResponse?.data || [];
  const requiredModifications = productionDataResponse?.requiredModifications || [];

  const handlePaymentSuccess = () => {
    setShowConfirmModal(false);
    // Refetch payment status
    fetch(`/api/member/quotations/${quotationId}/confirm-payment`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => setPaymentData(data.payment || null))
      .catch(err => console.error('Failed to refetch payment status:', err));
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Confirmation Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            支払確認状況
          </h2>
          {paymentData ? (
            <Badge variant="success" size="md">
              確認済み
            </Badge>
          ) : (
            <Badge variant="warning" size="md">
              未確認
            </Badge>
          )}
        </div>

        {paymentData ? (
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-text-muted">支払方法</dt>
              <dd className="text-text-primary mt-1">{paymentData.payment_method}</dd>
            </div>
            <div>
              <dt className="text-text-muted">支払日</dt>
              <dd className="text-text-primary mt-1">
                {paymentData.payment_date ? new Date(paymentData.payment_date).toLocaleDateString('ja-JP') : '-'}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">金額</dt>
              <dd className="text-text-primary mt-1 font-semibold">
                {(paymentData.amount || 0).toLocaleString()}円
              </dd>
            </div>
            {paymentData.reference_number && (
              <div>
                <dt className="text-text-muted">照会番号</dt>
                <dd className="text-text-primary mt-1">{paymentData.reference_number}</dd>
              </div>
            )}
            {paymentData.notes && (
              <div className="md:col-span-2">
                <dt className="text-text-muted">備考</dt>
                <dd className="text-text-primary mt-1">{paymentData.notes}</dd>
              </div>
            )}
            <div className="md:col-span-2">
              <dt className="text-text-muted">確認日時</dt>
              <dd className="text-text-primary mt-1">
                {paymentData.confirmed_at ? new Date(paymentData.confirmed_at).toLocaleString('ja-JP') : '-'}
                <span className="text-text-muted ml-2">
                  {paymentData.confirmed_at && (
                    <>({formatDistanceToNow(new Date(paymentData.confirmed_at), { addSuffix: true, locale: ja })})</>
                  )}
                </span>
              </dd>
            </div>
          </dl>
        ) : (
          <div className="text-center py-4">
            <p className="text-text-muted mb-4">まだ支払いが確認されていません。</p>
            <Button
              variant="primary"
              onClick={() => setShowConfirmModal(true)}
              className="w-full md:w-auto"
            >
              <Upload className="w-4 h-4 mr-2" />
              支払いを確認する
            </Button>
          </div>
        )}
      </Card>

      {/* Data Import Status (only if order exists) */}
      {orderId && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5" />
            データ入稿状況
          </h2>

          {productionData.length === 0 ? (
            <div className="text-center py-4">
              <Clock className="w-12 h-12 text-text-muted mx-auto mb-2" />
              <p className="text-text-muted">まだデータが入稿されていません。</p>
            </div>
          ) : (
            <div className="space-y-3">
              {productionData.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-border-secondary rounded-lg hover:border-border-primary transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-text-primary">
                        {DATA_TYPE_LABELS[item.data_type] || item.data_type}
                      </h3>
                      <p className="text-sm text-text-primary mt-1">{item.title}</p>
                      {item.description && (
                        <p className="text-sm text-text-muted mt-1">{item.description}</p>
                      )}
                    </div>
                    <Badge variant={VALIDATION_STATUS_LABELS[item.validation_status]?.variant || 'secondary'} size="sm">
                      {VALIDATION_STATUS_LABELS[item.validation_status]?.label || item.validation_status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm text-text-muted mt-3 pt-3 border-t border-border-secondary">
                    <span>
                      受信日: {item.received_at ? new Date(item.received_at).toLocaleDateString('ja-JP') : '-'}
                    </span>
                    <span>v{item.version}</span>
                  </div>

                  {item.validation_notes && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">{item.validation_notes}</p>
                    </div>
                  )}

                  {item.validation_errors && Object.keys(item.validation_errors).length > 0 && (
                    <details className="mt-3">
                      <summary className="text-sm text-red-600 cursor-pointer hover:text-red-700">
                        検証エラーを表示
                      </summary>
                      <pre className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md text-xs overflow-auto">
                        {JSON.stringify(item.validation_errors, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Required Modifications */}
      {requiredModifications.length > 0 && (
        <Card className="p-6 border-l-4 border-warning">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-warning" />
            必要な修正事項
          </h2>

          <ul className="space-y-2">
            {requiredModifications.map((modification, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-warning font-semibold mt-0.5">{index + 1}.</span>
                <span className="text-text-primary">{modification}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 p-3 bg-warning-10 border border-warning-30 rounded-md">
            <p className="text-sm text-text-primary">
              上記の修正を行った後、再度データを提出してください。
            </p>
          </div>
        </Card>
      )}

      {/* Payment Confirmation Modal */}
      {showConfirmModal && (
        <PaymentConfirmationModal
          quotationId={quotationId}
          onClose={() => setShowConfirmModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

// =====================================================
// Payment Confirmation Modal
// =====================================================

interface PaymentConfirmationModalProps {
  quotationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function PaymentConfirmationModal({ quotationId, onClose, onSuccess }: PaymentConfirmationModalProps) {
  const [formData, setFormData] = useState({
    payment_method: 'bank_transfer' as const,
    payment_date: new Date().toISOString().split('T')[0],
    amount: '',
    reference_number: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.payment_date) {
      newErrors.payment_date = '支払日を入力してください';
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = '金額を正しく入力してください';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`/api/member/quotations/${quotationId}/confirm-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to confirm payment');
      }

      onSuccess();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : '支払いの確認に失敗しました' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            支払いを確認する
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                支払方法 *
              </label>
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                className="w-full px-3 py-2 border border-border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="bank_transfer">銀行振込</option>
                <option value="credit_card">クレジットカード</option>
                <option value="paypal">PayPal</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                支払日 *
              </label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full px-3 py-2 border border-border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.payment_date && (
                <p className="text-sm text-error mt-1">{errors.payment_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                金額 *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {errors.amount && (
                <p className="text-sm text-error mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                照会番号
              </label>
              <input
                type="text"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="取引IDなど"
                className="w-full px-3 py-2 border border-border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                備考
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="追加情報があれば入力してください"
                rows={3}
                className="w-full px-3 py-2 border border-border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {errors.submit && (
              <div className="p-3 bg-error-10 border border-error-30 rounded-md">
                <p className="text-sm text-error">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? '送信中...' : '確認する'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
