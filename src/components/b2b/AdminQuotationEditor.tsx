'use client';

/**
 * 管理者見積エディタ (Admin Quotation Editor)
 * 管理者が見積を検討し価格を計算/編集
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
  Save,
  Send,
  Calculator,
  FileText,
  Download,
  Check,
  X,
  AlertCircle,
  Edit2,
  Eye,
  Plus,
  Trash2
} from 'lucide-react';

// Types
interface QuotationItem {
  id: string;
  product_name: string;
  product_code: string | null;
  category: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  specifications: Record<string, any>;
  notes: string | null;
  display_order: number;
}

interface Quotation {
  id: string;
  quotation_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  admin_notes: string | null;
  valid_until: string | null;
  created_at: string;
  companies: {
    id: string;
    name: string;
    name_kana: string;
  } | null;
  quotation_items: QuotationItem[];
}

interface AdminQuotationEditorProps {
  quotationId: string;
  quotation: Quotation;
  onUpdate?: (updatedQuotation: Quotation) => void;
  onStatusChange?: (newStatus: string) => void;
  onGeneratePDF?: () => void;
}

export default function AdminQuotationEditor({
  quotationId,
  quotation: initialQuotation,
  onUpdate,
  onStatusChange,
  onGeneratePDF
}: AdminQuotationEditorProps) {
  const [quotation, setQuotation] = useState<Quotation>(initialQuotation);
  const [editingItems, setEditingItems] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [previewMode, setPreviewMode] = useState(false);

  // Update quotation when props change
  useEffect(() => {
    setQuotation(initialQuotation);
  }, [initialQuotation]);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const subtotal = quotation.quotation_items.reduce(
      (sum, item) => sum + (item.quantity * item.unit_price),
      0
    );
    const tax = subtotal * 0.10; // 10% Japanese consumption tax
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, [quotation.quotation_items]);

  const { subtotal, tax, total } = calculateTotals();

  // Update item field
  const handleItemChange = useCallback((itemId: string, field: keyof QuotationItem, value: any) => {
    setQuotation(prev => ({
      ...prev,
      quotation_items: prev.quotation_items.map(item => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          // Recalculate total_price if quantity or unit_price changed
          if (field === 'quantity' || field === 'unit_price') {
            updated.total_price = updated.quantity * updated.unit_price;
          }
          return updated;
        }
        return item;
      })
    }));
  }, []);

  // Toggle edit mode for item
  const toggleEditMode = useCallback((itemId: string) => {
    setEditingItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  }, []);

  // Save quotation
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const response = await fetch(`/api/member/quotations/${quotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_notes: quotation.admin_notes,
          items: quotation.quotation_items.map(item => ({
            id: item.id,
            unit_price: item.unit_price,
            notes: item.notes
          }))
        })
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus({ type: 'success', message: '保存されました。' });
        if (onUpdate) {
          onUpdate(result.data);
        }
      } else {
        setSaveStatus({ type: 'error', message: result.error || '保存中にエラーが発生しました。' });
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus({ type: 'error', message: '保存中にエラーが発生しました。' });
    } finally {
      setIsSaving(false);
    }
  }, [quotationId, quotation, onUpdate]);

  // Send to customer
  const handleSendToCustomer = useCallback(async () => {
    if (!confirm('この見積を顧客に送信しますか？')) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/member/quotations/${quotationId}/send`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus({ type: 'success', message: '顧客に見積を送信しました。' });
        if (onStatusChange) {
          onStatusChange('SENT');
        }
      } else {
        setSaveStatus({ type: 'error', message: result.error || '送信中にエラーが発生しました。' });
      }
    } catch (error) {
      console.error('Send error:', error);
      setSaveStatus({ type: 'error', message: '送信中にエラーが発生しました。' });
    } finally {
      setIsSaving(false);
    }
  }, [quotationId, onStatusChange]);

  // Approve quotation
  const handleApprove = useCallback(async () => {
    if (!confirm('この見積を承認しますか？')) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/member/quotations/${quotationId}/approve`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus({ type: 'success', message: '見積が承認されました。' });
        if (onStatusChange) {
          onStatusChange('APPROVED');
        }
      } else {
        setSaveStatus({ type: 'error', message: result.error || '承認中にエラーが発生しました。' });
      }
    } catch (error) {
      console.error('Approve error:', error);
      setSaveStatus({ type: 'error', message: '承認中にエラーが発生しました。' });
    } finally {
      setIsSaving(false);
    }
  }, [quotationId, onStatusChange]);

  // Reject quotation
  const handleReject = useCallback(async () => {
    const reason = prompt('拒否理由を入力してください:');
    if (!reason) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/member/quotations/${quotationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus({ type: 'success', message: '見積が拒否されました。' });
        if (onStatusChange) {
          onStatusChange('REJECTED');
        }
      } else {
        setSaveStatus({ type: 'error', message: result.error || '拒否中にエラーが発生しました。' });
      }
    } catch (error) {
      console.error('Reject error:', error);
      setSaveStatus({ type: 'error', message: '拒否中にエラーが発生しました。' });
    } finally {
      setIsSaving(false);
    }
  }, [quotationId, onStatusChange]);

  // Generate PDF
  const handleGeneratePDF = useCallback(() => {
    if (onGeneratePDF) {
      onGeneratePDF();
    }
  }, [onGeneratePDF]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">見積 #{quotation.quotation_number}</h1>
          <p className="text-gray-600">
            {quotation.companies?.name || '個人顧客'} - {quotation.customer_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? '編集モード' : 'プレビュー'}
          </Button>

          {quotation.status === 'DRAFT' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                保存
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSendToCustomer}
                disabled={isSaving}
              >
                <Send className="w-4 h-4 mr-2" />
                送信
              </Button>
            </>
          )}

          {quotation.status === 'SENT' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApprove}
                disabled={isSaving}
              >
                <Check className="w-4 h-4 mr-2" />
                承認
              </Button>

              <Button
                variant="brixa-gradient"
                size="sm"
                onClick={handleReject}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                拒否
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleGeneratePDF}
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {saveStatus.type && (
        <Card className={`p-4 ${
          saveStatus.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {saveStatus.type === 'success' ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {saveStatus.message}
            </span>
          </div>
        </Card>
      )}

      {/* Quotation Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">見積情報</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-600">ステータス</label>
            <p className="font-medium">{getStatusText(quotation.status)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">有効期限</label>
            <p className="font-medium">
              {quotation.valid_until
                ? new Date(quotation.valid_until).toLocaleDateString('ja-JP')
                : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">作成日</label>
            <p className="font-medium">
              {new Date(quotation.created_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">顧客メール</label>
            <p className="font-medium">{quotation.customer_email}</p>
          </div>
        </div>
      </Card>

      {/* Quotation Items */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">見積項目</h2>

        {previewMode ? (
          // Preview Mode
          <div className="space-y-4">
            {quotation.quotation_items.map((item, index) => (
              <div key={item.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {index + 1}. {item.product_name}
                    </h3>
                    {item.product_code && (
                      <p className="text-sm text-gray-600">コード: {item.product_code}</p>
                    )}
                    {item.category && (
                      <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs mt-1">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ¥{item.unit_price.toLocaleString()} × {item.quantity.toLocaleString()}
                    </p>
                    <p className="text-lg font-bold">
                      ¥{item.total_price.toLocaleString()}
                    </p>
                  </div>
                </div>

                {Object.keys(item.specifications || {}).length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>仕様:</strong> {formatSpecifications(item.specifications)}
                  </div>
                )}

                {item.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>メモ:</strong> {item.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            {quotation.quotation_items.map((item, index) => (
              <QuotationItemEditor
                key={item.id}
                item={item}
                index={index}
                isEditing={editingItems[item.id] || false}
                onToggleEdit={() => toggleEditMode(item.id)}
                onChange={(field, value) => handleItemChange(item.id, field, value)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Price Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">価格内訳</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>小計 (税抜)</span>
            <span className="font-medium">¥{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>消費税 (10%)</span>
            <span className="font-medium">¥{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg border-t pt-2">
            <span className="font-bold">合計</span>
            <span className="font-bold">¥{total.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Admin Notes */}
      {!previewMode && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">管理者メモ (内部用)</h2>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="管理者用メモを入力してください..."
            value={quotation.admin_notes || ''}
            onChange={(e) => setQuotation(prev => ({ ...prev, admin_notes: e.target.value }))}
          />
        </Card>
      )}
    </div>
  );
}

// Quotation Item Editor Component
interface QuotationItemEditorProps {
  item: QuotationItem;
  index: number;
  isEditing: boolean;
  onToggleEdit: () => void;
  onChange: (field: keyof QuotationItem, value: any) => void;
}

function QuotationItemEditor({
  item,
  index,
  isEditing,
  onToggleEdit,
  onChange
}: QuotationItemEditorProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-medium">項目 {index + 1}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleEdit}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">製品名</label>
          <p className="font-medium">{item.product_name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">数量</label>
          <p className="font-medium">{item.quantity.toLocaleString()}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">単価</label>
          {isEditing ? (
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.unit_price}
              onChange={(e) => onChange('unit_price', parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          ) : (
            <p className="font-medium">¥{item.unit_price.toLocaleString()}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">合計</label>
          <p className="font-bold">¥{item.total_price.toLocaleString()}</p>
        </div>
      </div>

      {isEditing && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">項目メモ</label>
          <Input
            type="text"
            value={item.notes || ''}
            onChange={(e) => onChange('notes', e.target.value || null)}
            placeholder="管理者用メモ..."
          />
        </div>
      )}
    </Card>
  );
}

// Helper functions
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'DRAFT': 'ドラフト',
    'SENT': '送信済み',
    'APPROVED': '承認済み',
    'REJECTED': '拒否',
    'EXPIRED': '期限切れ',
    'CONVERTED': '注文変換'
  };
  return statusMap[status] || status;
}

function formatSpecifications(specs: Record<string, any>): string {
  const labels: Record<string, string> = {
    width: '幅',
    length: '長さ',
    gusset: 'マチ',
    thickness: '厚み',
    material: '材質'
  };

  return Object.entries(specs)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${labels[key] || key}: ${value}${key === 'width' || key === 'length' || key === 'gusset' || key === 'thickness' ? 'mm' : ''}`)
    .join(', ');
}
