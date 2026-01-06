'use client';

/**
 * 관리자 견적 에디터 (Admin Quotation Editor)
 * 관리자가 견적을 검토하고 가격을 계산/편집
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
      const response = await fetch(`/api/b2b/quotations/${quotationId}`, {
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
        setSaveStatus({ type: 'success', message: '저장되었습니다.' });
        if (onUpdate) {
          onUpdate(result.data);
        }
      } else {
        setSaveStatus({ type: 'error', message: result.error || '저장 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus({ type: 'error', message: '저장 중 오류가 발생했습니다.' });
    } finally {
      setIsSaving(false);
    }
  }, [quotationId, quotation, onUpdate]);

  // Send to customer
  const handleSendToCustomer = useCallback(async () => {
    if (!confirm('이 견적을 고객에게 송부하시겠습니까?')) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/b2b/quotations/${quotationId}/send`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus({ type: 'success', message: '고객에게 견적을 송부했습니다.' });
        if (onStatusChange) {
          onStatusChange('SENT');
        }
      } else {
        setSaveStatus({ type: 'error', message: result.error || '송부 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('Send error:', error);
      setSaveStatus({ type: 'error', message: '송부 중 오류가 발생했습니다.' });
    } finally {
      setIsSaving(false);
    }
  }, [quotationId, onStatusChange]);

  // Approve quotation
  const handleApprove = useCallback(async () => {
    if (!confirm('이 견적을 승인하시겠습니까?')) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/b2b/quotations/${quotationId}/approve`, {
        method: 'POST'
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus({ type: 'success', message: '견적이 승인되었습니다.' });
        if (onStatusChange) {
          onStatusChange('APPROVED');
        }
      } else {
        setSaveStatus({ type: 'error', message: result.error || '승인 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('Approve error:', error);
      setSaveStatus({ type: 'error', message: '승인 중 오류가 발생했습니다.' });
    } finally {
      setIsSaving(false);
    }
  }, [quotationId, onStatusChange]);

  // Reject quotation
  const handleReject = useCallback(async () => {
    const reason = prompt('거부 사유를 입력하세요:');
    if (!reason) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/b2b/quotations/${quotationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      const result = await response.json();

      if (result.success) {
        setSaveStatus({ type: 'success', message: '견적이 거부되었습니다.' });
        if (onStatusChange) {
          onStatusChange('REJECTED');
        }
      } else {
        setSaveStatus({ type: 'error', message: result.error || '거부 중 오류가 발생했습니다.' });
      }
    } catch (error) {
      console.error('Reject error:', error);
      setSaveStatus({ type: 'error', message: '거부 중 오류가 발생했습니다.' });
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
          <h1 className="text-2xl font-bold">견적 #{quotation.quotation_number}</h1>
          <p className="text-gray-600">
            {quotation.companies?.name || '개인 고객'} - {quotation.customer_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? '편집 모드' : '미리보기'}
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
                저장
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSendToCustomer}
                disabled={isSaving}
              >
                <Send className="w-4 h-4 mr-2" />
                송부
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
                승인
              </Button>

              <Button
                variant="brixa-gradient"
                size="sm"
                onClick={handleReject}
                disabled={isSaving}
              >
                <X className="w-4 h-4 mr-2" />
                거부
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
        <h2 className="text-lg font-semibold mb-4">견적 정보</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-600">상태</label>
            <p className="font-medium">{getStatusText(quotation.status)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">유효기간</label>
            <p className="font-medium">
              {quotation.valid_until
                ? new Date(quotation.valid_until).toLocaleDateString('ja-JP')
                : '-'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">생성일</label>
            <p className="font-medium">
              {new Date(quotation.created_at).toLocaleDateString('ja-JP')}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">고객 이메일</label>
            <p className="font-medium">{quotation.customer_email}</p>
          </div>
        </div>
      </Card>

      {/* Quotation Items */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">견적 항목</h2>

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
                      <p className="text-sm text-gray-600">코드: {item.product_code}</p>
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
                    <strong>사양:</strong> {formatSpecifications(item.specifications)}
                  </div>
                )}

                {item.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>메모:</strong> {item.notes}
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
        <h2 className="text-lg font-semibold mb-4">가격 내역</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>소계 (세전)</span>
            <span className="font-medium">¥{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>소비세 (10%)</span>
            <span className="font-medium">¥{tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg border-t pt-2">
            <span className="font-bold">합계</span>
            <span className="font-bold">¥{total.toLocaleString()}</span>
          </div>
        </div>
      </Card>

      {/* Admin Notes */}
      {!previewMode && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">관리자 메모 (내부용)</h2>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="관리자용 메모를 입력하세요..."
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
        <h3 className="font-medium">항목 {index + 1}</h3>
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
          <label className="block text-sm font-medium mb-1">제품명</label>
          <p className="font-medium">{item.product_name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">수량</label>
          <p className="font-medium">{item.quantity.toLocaleString()}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">단가</label>
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
          <label className="block text-sm font-medium mb-1">합계</label>
          <p className="font-bold">¥{item.total_price.toLocaleString()}</p>
        </div>
      </div>

      {isEditing && (
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">항목 메모</label>
          <Input
            type="text"
            value={item.notes || ''}
            onChange={(e) => onChange('notes', e.target.value || null)}
            placeholder="관리자용 메모..."
          />
        </div>
      )}
    </Card>
  );
}

// Helper functions
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'DRAFT': '드래프트',
    'SENT': '송부됨',
    'APPROVED': '승인됨',
    'REJECTED': '거부됨',
    'EXPIRED': '만료됨',
    'CONVERTED': '주문 전환'
  };
  return statusMap[status] || status;
}

function formatSpecifications(specs: Record<string, any>): string {
  const labels: Record<string, string> = {
    width: '폭',
    length: '길이',
    gusset: '마치',
    thickness: '두께',
    material: '재질'
  };

  return Object.entries(specs)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${labels[key] || key}: ${value}${key === 'width' || key === 'length' || key === 'gusset' || key === 'thickness' ? 'mm' : ''}`)
    .join(', ');
}
