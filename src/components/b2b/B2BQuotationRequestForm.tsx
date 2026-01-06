'use client';

/**
 * B2B 견적 요청 폼 (B2B Quotation Request Form)
 * 회원 고객을 위한 견적 요청 시스템
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { SKUSelector, SKUDisplay } from './SKUSelector';
import { CSVBulkImport } from './CSVBulkImport';
import type { Product } from '@/types/database';
import {
  Plus,
  Trash2,
  Upload,
  FileText,
  Save,
  Send,
  AlertCircle,
  Check,
  Building2,
  Package,
  FileSpreadsheet,
  X
} from 'lucide-react';

// Types for quotation form
interface QuotationItem {
  id: string;
  product_name: string;
  product_code: string | null;
  category: string | null;
  quantity: number;
  unit_price: number | null;
  specifications: Record<string, any>;
  notes: string | null;
  selectedProduct?: Product | null;  // For SKU selection
  inputMode?: 'manual' | 'sku';      // Track input mode
}

interface CompanyInfo {
  id: string;
  name: string;
  name_kana: string;
  corporate_number: string;
}

interface B2BQuotationRequestFormProps {
  userId: string;
  companies: CompanyInfo[];
  onSuccess?: (quotationId: string) => void;
}

export default function B2BQuotationRequestForm({
  userId,
  companies = [],
  onSuccess
}: B2BQuotationRequestFormProps) {
  const router = useRouter();

  // Form state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [items, setItems] = useState<QuotationItem[]>([
    createEmptyItem()
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showCSVImport, setShowCSVImport] = useState(false);

  // Create empty quotation item
  function createEmptyItem(): QuotationItem {
    return {
      id: `item-${Date.now()}-${Math.random()}`,
      product_name: '',
      product_code: null,
      category: null,
      quantity: 1000,
      unit_price: null,
      specifications: {},
      notes: null,
      selectedProduct: null,
      inputMode: 'manual'
    };
  }

  // Add new item
  const handleAddItem = useCallback(() => {
    setItems(prev => [...prev, createEmptyItem()]);
  }, []);

  // Remove item
  const handleRemoveItem = useCallback((itemId: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== itemId));
    }
  }, [items.length]);

  // Update item field
  const handleItemChange = useCallback((itemId: string, field: keyof QuotationItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  }, []);

  // Update item specifications
  const handleSpecificationChange = useCallback((itemId: string, specKey: string, specValue: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          specifications: {
            ...item.specifications,
            [specKey]: specValue
          }
        };
      }
      return item;
    }));
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  }, []);

  // Remove uploaded file
  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle SKU selection
  const handleSKUSelect = useCallback((itemId: string, product: Product | null) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          product_name: product?.name_ja || '',
          product_code: product?.id || null,
          category: product?.category || null,
          selectedProduct: product,
          specifications: (product?.specifications || {}) as Record<string, any>,
          inputMode: product ? 'sku' : 'manual'
        };
      }
      return item;
    }));
  }, []);

  // Toggle input mode (manual/SKU)
  const handleToggleInputMode = useCallback((itemId: string, mode: 'manual' | 'sku') => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newItem = { ...item, inputMode: mode };
        if (mode === 'manual') {
          newItem.selectedProduct = null;
          newItem.product_name = '';
          newItem.product_code = null;
          newItem.category = null;
        }
        return newItem;
      }
      return item;
    }));
  }, []);

  // Handle CSV import
  const handleCSVImport = useCallback((importedItems: Omit<QuotationItem, 'id'>[]) => {
    const newItems = importedItems.map(item => ({
      ...item,
      id: `item-${Date.now()}-${Math.random()}`,
      selectedProduct: null,
      inputMode: 'manual' as const
    }));

    setItems(prev => {
      // Remove empty items and add imported items
      const nonEmptyItems = prev.filter(item =>
        item.product_name.trim() !== '' || item.selectedProduct
      );
      return [...nonEmptyItems, ...newItems];
    });

    setShowCSVImport(false);
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    if (!selectedCompanyId) {
      setSubmitStatus({ type: 'error', message: '회사를 선택해주세요.' });
      return false;
    }

    for (const item of items) {
      if (!item.product_name.trim()) {
        setSubmitStatus({ type: 'error', message: '모든 항목의 제품명을 입력해주세요.' });
        return false;
      }
      if (item.quantity <= 0) {
        setSubmitStatus({ type: 'error', message: '수량은 0보다 커야 합니다.' });
        return false;
      }
    }

    return true;
  }, [selectedCompanyId, items]);

  // Submit quotation request
  const handleSubmit = useCallback(async (action: 'save' | 'submit') => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // TODO: Implement actual API call
      // const response = await fetch('/api/b2b/quotations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     user_id: userId,
      //     company_id: selectedCompanyId,
      //     items,
      //     notes: customerNotes,
      //     files: uploadedFiles,
      //     status: action === 'submit' ? 'SENT' : 'DRAFT'
      //   })
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockQuotationId = `qt-${Date.now()}`;

      setSubmitStatus({
        type: 'success',
        message: action === 'submit'
          ? '견적 요청이 접수되었습니다.'
          : '견적이 임시 저장되었습니다.'
      });

      if (onSuccess) {
        onSuccess(mockQuotationId);
      } else if (action === 'submit') {
        router.push(`/member/quotations/${mockQuotationId}`);
      }

    } catch (error) {
      console.error('Quotation submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: '견적 요청 중 오류가 발생했습니다. 다시 시도해주세요.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, selectedCompanyId, items, customerNotes, uploadedFiles, validateForm, onSuccess, router]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">B2B 견적 요청</h1>
        <p className="text-gray-600">
          제품 사양, 수량, 파일을 포함한 견적을 요청하세요
        </p>
      </div>

      {/* Status Message */}
      {submitStatus.type && (
        <Card className={`p-4 ${
          submitStatus.type === 'success'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {submitStatus.type === 'success' ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {submitStatus.message}
            </span>
          </div>
        </Card>
      )}

      {/* Company Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          회사 정보
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              회사 선택 *
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              <option value="">회사를 선택하세요</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.name_kana})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Quotation Items */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            견적 항목
          </h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCSVImport(true)}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              CSV 일괄 가져오기
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
            >
              <Plus className="w-4 h-4 mr-1" />
              항목 추가
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {items.map((item, index) => (
            <QuotationItemCard
              key={item.id}
              item={item}
              index={index}
              canRemove={items.length > 1}
              onRemove={handleRemoveItem}
              onChange={handleItemChange}
              onSpecificationChange={handleSpecificationChange}
              onSKUSelect={handleSKUSelect}
              onToggleInputMode={handleToggleInputMode}
            />
          ))}
        </div>
      </Card>

      {/* File Upload */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          파일 첨부
        </h2>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept=".ai,.pdf,.psd,.png,.jpg,.jpeg,.xlsx,.xls"
              onChange={handleFileUpload}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <FileText className="w-12 h-12 text-gray-400" />
              <span className="text-sm text-gray-600">
                클릭하여 파일을 업로드하거나 드래그앤드롭
              </span>
              <span className="text-xs text-gray-500">
                AI, PDF, PSD, PNG, JPG, Excel (최대 10개)
              </span>
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">업로드된 파일:</h3>
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">메모</h2>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          placeholder="견적에 대한 추가 요청사항이나 메모를 입력하세요..."
          value={customerNotes}
          onChange={(e) => setCustomerNotes(e.target.value)}
        />
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          취소
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit('save')}
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          임시 저장
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit('submit')}
          disabled={isSubmitting}
        >
          <Send className="w-4 h-4 mr-2" />
          견적 요청
        </Button>
      </div>

      {/* CSV Import Modal */}
      {showCSVImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <CSVBulkImport
              onImport={handleCSVImport}
              onCancel={() => setShowCSVImport(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Quotation Item Card Component
interface QuotationItemCardProps {
  item: QuotationItem;
  index: number;
  canRemove: boolean;
  onRemove: (itemId: string) => void;
  onChange: (itemId: string, field: keyof QuotationItem, value: any) => void;
  onSpecificationChange: (itemId: string, specKey: string, specValue: any) => void;
  onSKUSelect: (itemId: string, product: Product | null) => void;
  onToggleInputMode: (itemId: string, mode: 'manual' | 'sku') => void;
}

function QuotationItemCard({
  item,
  index,
  canRemove,
  onRemove,
  onChange,
  onSpecificationChange,
  onSKUSelect,
  onToggleInputMode
}: QuotationItemCardProps) {
  const inputMode = item.inputMode || 'manual';

  return (
    <Card className="p-6 relative">
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">항목 {index + 1}</h3>

        {/* Input Mode Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => onToggleInputMode(item.id, 'manual')}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-colors
              ${inputMode === 'manual'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            직접 입력
          </button>
          <button
            type="button"
            onClick={() => onToggleInputMode(item.id, 'sku')}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-colors
              ${inputMode === 'sku'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            SKU 선택
          </button>
        </div>
      </div>

      {/* SKU Mode */}
      {inputMode === 'sku' && (
        <div className="mb-4">
          {item.selectedProduct ? (
            <div className="relative">
              <SKUDisplay
                product={item.selectedProduct}
                onEdit={() => onSKUSelect(item.id, null)}
              />
            </div>
          ) : (
            <SKUSelector
              value={item.product_code || undefined}
              onChange={(product) => onSKUSelect(item.id, product)}
              category={item.category as "box" | "flat_3_side" | "stand_up" | "spout_pouch" | "roll_film" | "flat_with_zip" | "gusset" | "soft_pouch" | "special" | undefined}
              placeholder="제품을 선택하세요"
            />
          )}
        </div>
      )}

      {/* Manual Mode / Additional Fields */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${inputMode === 'sku' ? 'mt-4' : ''}`}>
        {/* Product Name (only in manual mode) */}
        {inputMode === 'manual' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              제품명 *
            </label>
            <Input
              type="text"
              value={item.product_name}
              onChange={(e) => onChange(item.id, 'product_name', e.target.value)}
              placeholder="예: 스탠드파우치"
            />
          </div>
        )}

        {/* Product Code (only in manual mode) */}
        {inputMode === 'manual' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              제품 코드
            </label>
            <Input
              type="text"
              value={item.product_code || ''}
              onChange={(e) => onChange(item.id, 'product_code', e.target.value || null)}
              placeholder="선택사항"
            />
          </div>
        )}

        {/* Category (only in manual mode) */}
        {inputMode === 'manual' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              카테고리
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={item.category || ''}
              onChange={(e) => onChange(item.id, 'category', e.target.value || null)}
            >
              <option value="">선택하세요</option>
              <option value="flat_3_side">三方シール袋</option>
              <option value="stand_up">スタンドアップパウチ</option>
              <option value="gusset">ガゼット袋</option>
              <option value="flat_with_zip">チャック付き平袋</option>
              <option value="box">ボックスパウチ</option>
              <option value="spout_pouch">スパウトパウチ</option>
              <option value="roll_film">ロールフィルム</option>
              <option value="special">特形状パウチ</option>
            </select>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-2">
            수량 *
          </label>
          <Input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => onChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
          />
          {item.selectedProduct && item.selectedProduct.min_order_quantity > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              최소 주문량: {item.selectedProduct.min_order_quantity.toLocaleString()}매
            </p>
          )}
        </div>

        {/* Unit Price */}
        <div>
          <label className="block text-sm font-medium mb-2">
            단가 (선택사항)
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.unit_price || ''}
            onChange={(e) => onChange(item.id, 'unit_price', parseFloat(e.target.value) || null)}
            placeholder="관리자가 산정"
          />
        </div>

        {/* Specifications */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            제품 사양
          </label>
          {inputMode === 'sku' && item.selectedProduct && item.selectedProduct.specifications ? (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {Object.entries(item.selectedProduct.specifications).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-gray-600">{key}:</dt>
                    <dd className="text-gray-900">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs mb-1">폭 (mm)</label>
                <Input
                  type="number"
                  placeholder="예: 200"
                  value={item.specifications.width || ''}
                  onChange={(e) => onSpecificationChange(item.id, 'width', parseInt(e.target.value) || null)}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">길이 (mm)</label>
                <Input
                  type="number"
                  placeholder="예: 300"
                  value={item.specifications.length || ''}
                  onChange={(e) => onSpecificationChange(item.id, 'length', parseInt(e.target.value) || null)}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">마치 (mm)</label>
                <Input
                  type="number"
                  placeholder="예: 100"
                  value={item.specifications.gusset || ''}
                  onChange={(e) => onSpecificationChange(item.id, 'gusset', parseInt(e.target.value) || null)}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">두께 (μm)</label>
                <Input
                  type="number"
                  placeholder="예: 100"
                  value={item.specifications.thickness || ''}
                  onChange={(e) => onSpecificationChange(item.id, 'thickness', parseInt(e.target.value) || null)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Item Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            항목 메모
          </label>
          <Input
            type="text"
            value={item.notes || ''}
            onChange={(e) => onChange(item.id, 'notes', e.target.value || null)}
            placeholder="이 항목에 대한 추가 메모..."
          />
        </div>
      </div>
    </Card>
  );
}
