/**
 * SKU Selector Component
 *
 * SKU選択コンポーネント
 * - 製品カタログからSKUを選択
 * - 検索、フィルタリング機能
 * - カテゴリ別表示
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, Package, AlertCircle } from 'lucide-react';
import type { Product } from '@/types/database';

// ============================================================
// Types
// ============================================================

type MaterialType = 'PET' | 'AL' | 'CPP' | 'PE' | 'NY' | 'PAPER' | 'OTHER';

interface SKUSelectorProps {
  value?: string;
  onChange: (product: Product | null) => void;
  category?: Product['category'];
  materialType?: MaterialType;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}

interface CategoryLabel {
  value: Product['category'];
  label: string;
  labelEn: string;
}

// ============================================================
// Constants
// ============================================================

const CATEGORY_LABELS: CategoryLabel[] = [
  { value: 'flat_3_side', label: '三方シール袋', labelEn: 'Three-Side Seal' },
  { value: 'stand_up', label: 'スタンドアップパウチ', labelEn: 'Stand-Up Pouch' },
  { value: 'gusset', label: 'ガゼット袋', labelEn: 'Gusset Pouch' },
  { value: 'flat_with_zip', label: 'チャック付き平袋', labelEn: 'Flat with Zipper' },
  { value: 'box', label: 'ボックスパウチ', labelEn: 'Box Pouch' },
  { value: 'spout_pouch', label: 'スパウトパウチ', labelEn: 'Spout Pouch' },
  { value: 'roll_film', label: 'ロールフィルム', labelEn: 'Roll Film' },
  { value: 'special', label: '特形状パウチ', labelEn: 'Special Shape' },
];

const MATERIAL_LABELS: Record<MaterialType, string> = {
  PET: 'PET (ポリエステル)',
  AL: 'AL (アルミニウム)',
  CPP: 'CPP (未延伸ポリプロピレン)',
  PE: 'PE (ポリエチレン)',
  NY: 'NY (ナイロン)',
  PAPER: '紙',
  OTHER: 'その他',
};

// ============================================================
// Component
// ============================================================

export function SKUSelector({
  value,
  onChange,
  category,
  materialType,
  disabled = false,
  error,
  placeholder = '製品を選択してください',
  className = '',
}: SKUSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Product['category'] | undefined>(category);

  // Fetch products
  const fetchProducts = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (materialType) params.append('material_type', materialType);
      params.append('is_active', 'true');
      params.append('sort_by', 'sort_order');
      params.append('sort_order', 'asc');
      params.append('limit', '50');

      const response = await fetch(`/api/b2b/products?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, materialType]);

  // Initial fetch and fetch on filter change
  useEffect(() => {
    fetchProducts(searchTerm);
  }, [fetchProducts, selectedCategory, materialType]);

  // Set initial selected product
  useEffect(() => {
    if (value && products.length > 0) {
      const product = products.find(p => p.id === value);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [value, products]);

  // Handle product selection
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    onChange(product);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle clear selection
  const handleClear = () => {
    setSelectedProduct(null);
    onChange(null);
    setSearchTerm('');
  };

  // Filter products by search term
  const filteredProducts = products.filter(product =>
    product.name_ja.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      {/* Selected Product Display */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          製品選択 <span className="text-red-500">*</span>
        </label>

        {!selectedProduct ? (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              w-full flex items-center justify-between px-4 py-3
              bg-white border border-gray-300 rounded-lg
              text-left text-gray-700
              hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              transition-colors
              ${error ? 'border-red-500' : ''}
            `}
          >
            <span className="text-gray-400">{placeholder}</span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
        ) : (
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Package className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{selectedProduct.name_ja}</p>
                  <p className="text-sm text-gray-600">{selectedProduct.name_en}</p>
                  <p className="text-xs text-gray-500 mt-1">SKU: {selectedProduct.id}</p>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={disabled}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white rounded border">
                  {CATEGORY_LABELS.find(c => c.value === selectedProduct.category)?.label}
                </span>
                {selectedProduct.materials.slice(0, 2).map(material => (
                  <span key={material} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 rounded">
                    {MATERIAL_LABELS[material as MaterialType]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !selectedProduct && (
        <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="製品名またはSKUで検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="p-2 border-b border-gray-200 flex gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory(undefined)}
              className={`
                px-3 py-1.5 text-sm whitespace-nowrap rounded-lg transition-colors
                ${!selectedCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              すべて
            </button>
            {CATEGORY_LABELS.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`
                  px-3 py-1.5 text-sm whitespace-nowrap rounded-lg transition-colors
                  ${selectedCategory === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Package className="w-12 h-12 mb-2 text-gray-300" />
                <p className="text-sm">製品が見つかりません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{product.name_ja}</p>
                        <p className="text-sm text-gray-600">{product.name_en}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            {CATEGORY_LABELS.find(c => c.value === product.category)?.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            SKU: {product.id}
                          </span>
                          <span className="text-xs text-gray-500">
                            最小発注量: {product.min_order_quantity.toLocaleString()}枚
                          </span>
                        </div>
                        {product.description_ja && (
                          <p className="mt-1 text-xs text-gray-500 line-clamp-1">
                            {product.description_ja}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SKU Display Component (for showing selected product)
// ============================================================

interface SKUDisplayProps {
  product: Product;
  onEdit?: () => void;
  className?: string;
}

export function SKUDisplay({ product, onEdit, className = '' }: SKUDisplayProps) {
  return (
    <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <Package className="w-6 h-6 text-blue-600 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-gray-900">{product.name_ja}</h4>
              <p className="text-sm text-gray-600">{product.name_en}</p>
            </div>
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                変更
              </button>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">SKU:</span>
              <span className="ml-1 font-mono">{product.id}</span>
            </div>
            <div>
              <span className="text-gray-600">カテゴリ:</span>
              <span className="ml-1">
                {CATEGORY_LABELS.find(c => c.value === product.category)?.label}
              </span>
            </div>
            <div>
              <span className="text-gray-600">最小発注量:</span>
              <span className="ml-1">{product.min_order_quantity.toLocaleString()}枚</span>
            </div>
            <div>
              <span className="text-gray-600">リードタイム:</span>
              <span className="ml-1">{product.lead_time_days}日</span>
            </div>
          </div>

          {product.materials && product.materials.length > 0 && (
            <div className="mt-3">
              <span className="text-sm text-gray-600">素材:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {product.materials.map(material => (
                  <span
                    key={material}
                    className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 rounded"
                  >
                    {MATERIAL_LABELS[material as MaterialType]}
                  </span>
                ))}
              </div>
            </div>
          )}

          {product.specifications && (
            <div className="mt-3 p-3 bg-white rounded border">
              <h5 className="text-sm font-medium text-gray-900 mb-2">仕様</h5>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-gray-600">{key}:</dt>
                    <dd className="text-gray-900">
                      {Array.isArray(value) ? value.join(', ') : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
