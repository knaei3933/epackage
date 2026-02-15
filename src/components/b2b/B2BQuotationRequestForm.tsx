'use client';

/**
 * B2B見積依頼フォーム (B2B Quotation Request Form)
 * 会員顧客向け見積依頼システム
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
      setSubmitStatus({ type: 'error', message: '会社を選択してください。' });
      return false;
    }

    for (const item of items) {
      if (!item.product_name.trim()) {
        setSubmitStatus({ type: 'error', message: 'すべての項目の製品名を入力してください。' });
        return false;
      }
      if (item.quantity <= 0) {
        setSubmitStatus({ type: 'error', message: '数量は0より大きい必要があります。' });
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
      // Prepare items for API - include all items with quantity patterns
      const apiItems = items
        .filter(item => item.product_name.trim() !== '' || item.selectedProduct)
        .map(item => ({
          product_id: item.product_code || null,
          product_name: item.product_name || item.selectedProduct?.name_ja || '未定義製品',
          quantity: item.quantity,
          unit_price: item.unit_price || 0,
          specifications: item.specifications || {},
        }));

      if (apiItems.length === 0) {
        setSubmitStatus({ type: 'error', message: '製品項目がありません。' });
        return;
      }

      // Get user profile for customer information
      const profileResponse = await fetch('/api/auth/session', {
        credentials: 'include',
      });

      let customerName = '未登録';
      let customerEmail = '';
      let customerPhone = '';

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const profile = profileData.profile;
        if (profile) {
          customerName = profile.kanji_last_name && profile.kanji_first_name
            ? `${profile.kanji_last_name} ${profile.kanji_first_name}`
            : (profile.company_name || '未登録');
          customerEmail = profile.email || '';
          customerPhone = profile.corporate_phone || profile.personal_phone || '';
        }
      }

      // Call actual API
      const response = await fetch('/api/member/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone || null,
          notes: customerNotes || null,
          valid_until: null, // Default validity period
          items: apiItems,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create quotation');
      }

      const { quotation } = await response.json();

      setSubmitStatus({
        type: 'success',
        message: action === 'submit'
          ? '見積依頼を受け付けました。'
          : '見積を一時保存しました。'
      });

      if (onSuccess) {
        onSuccess(quotation.id);
      } else {
        router.push(`/member/quotations/${quotation.id}`);
      }

    } catch (error) {
      console.error('Quotation submission error:', error);
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error
          ? error.message
          : '見積依頼中にエラーが発生しました。もう一度お試しください。'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [items, customerNotes, validateForm, onSuccess, router]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">B2B 見積依頼</h1>
        <p className="text-gray-600">
          製品仕様、数量、ファイルを含めた見積を依頼してください
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
          会社情報
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              会社選択 *
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              <option value="">会社を選択してください</option>
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
            見積項目
          </h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCSVImport(true)}
            >
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              CSV一括インポート
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
            >
              <Plus className="w-4 h-4 mr-1" />
              項目追加
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
          ファイル添付
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
                クリックしてファイルをアップロードまたはドラッグ&ドロップ
              </span>
              <span className="text-xs text-gray-500">
                AI, PDF, PSD, PNG, JPG, Excel (最大10個)
              </span>
            </label>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">アップロードされたファイル:</h3>
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
        <h2 className="text-xl font-semibold mb-4">メモ</h2>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          placeholder="見積に関する追加の要望やメモを入力してください..."
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
          キャンセル
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit('save')}
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          一時保存
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit('submit')}
          disabled={isSubmitting}
        >
          <Send className="w-4 h-4 mr-2" />
          見積依頼
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
        <h3 className="text-lg font-semibold">項目 {index + 1}</h3>

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
            直接入力
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
            SKU選択
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
              placeholder="製品を選択してください"
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
              製品名 *
            </label>
            <Input
              type="text"
              value={item.product_name}
              onChange={(e) => onChange(item.id, 'product_name', e.target.value)}
              placeholder="例: スタンドパウチ"
            />
          </div>
        )}

        {/* Product Code (only in manual mode) */}
        {inputMode === 'manual' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              製品コード
            </label>
            <Input
              type="text"
              value={item.product_code || ''}
              onChange={(e) => onChange(item.id, 'product_code', e.target.value || null)}
              placeholder="オプション"
            />
          </div>
        )}

        {/* Category (only in manual mode) */}
        {inputMode === 'manual' && (
          <div>
            <label className="block text-sm font-medium mb-2">
              カテゴリー
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={item.category || ''}
              onChange={(e) => onChange(item.id, 'category', e.target.value || null)}
            >
              <option value="">選択してください</option>
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
            数量 *
          </label>
          <Input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) => onChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
          />
          {item.selectedProduct && item.selectedProduct.min_order_quantity > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              最低注文数量: {item.selectedProduct.min_order_quantity.toLocaleString()}枚
            </p>
          )}
        </div>

        {/* Unit Price */}
        <div>
          <label className="block text-sm font-medium mb-2">
            単価 (オプション)
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={item.unit_price || ''}
            onChange={(e) => onChange(item.id, 'unit_price', parseFloat(e.target.value) || null)}
            placeholder="管理者が査定"
          />
        </div>

        {/* Specifications */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">
            製品仕様
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
                <label className="block text-xs mb-1">幅 (mm)</label>
                <Input
                  type="number"
                  placeholder="例: 200"
                  value={item.specifications.width || ''}
                  onChange={(e) => onSpecificationChange(item.id, 'width', parseInt(e.target.value) || null)}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">長さ (mm)</label>
                <Input
                  type="number"
                  placeholder="例: 300"
                  value={item.specifications.length || ''}
                  onChange={(e) => onSpecificationChange(item.id, 'length', parseInt(e.target.value) || null)}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">マチ (mm)</label>
                <Input
                  type="number"
                  placeholder="例: 100"
                  value={item.specifications.gusset || ''}
                  onChange={(e) => onSpecificationChange(item.id, 'gusset', parseInt(e.target.value) || null)}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">厚み (μm)</label>
                <Input
                  type="number"
                  placeholder="例: 100"
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
            項目メモ
          </label>
          <Input
            type="text"
            value={item.notes || ''}
            onChange={(e) => onChange(item.id, 'notes', e.target.value || null)}
            placeholder="この項目に関する追加メモ..."
          />
        </div>
      </div>
    </Card>
  );
}
