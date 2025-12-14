'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  Star,
  BarChart3,
  ArrowUpDown
} from 'lucide-react';
import { UnifiedQuoteResult } from '@/lib/unified-pricing-engine';
import { QuantityComparison } from '@/types/multi-quantity';

interface QuantityQuote {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountRate: number;
  priceBreak: string;
  leadTimeDays: number;
  isValid: boolean;
}

interface MultiQuantityComparisonTableProps {
  quotes: QuantityQuote[];
  comparison: QuantityComparison | null;
  selectedQuantity: number | null;
  onQuantitySelect: (quantity: number) => void;
  isLoading?: boolean;
}

// Memoized motion components to prevent re-creation
const MotionTableRow = memo(motion.tr);
const MotionTableCell = memo(motion.td);

// Optimized currency formatter with memoization
const formatCurrency = useMemo(() => {
  const formatter = new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return (amount: number) => formatter.format(amount);
}, []);

// Memoized discount badge color function
const getDiscountBadgeColor = useCallback((discountRate: number) => {
  if (discountRate >= 30) return 'bg-purple-100 text-purple-800 border-purple-200';
  if (discountRate >= 20) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (discountRate >= 10) return 'bg-green-100 text-green-800 border-green-200';
  return 'bg-gray-100 text-gray-800 border-gray-200';
}, []);

// Memoized mobile card component
const MobileQuoteCard = memo(({
  quote,
  index,
  isSelected,
  isBestValue,
  onSelect,
  priceTrendIcon
}: {
  quote: QuantityQuote;
  index: number;
  isSelected: boolean;
  isBestValue: boolean;
  onSelect: () => void;
  priceTrendIcon: React.ReactNode;
}) => {
  return (
    <motion.div
      key={quote.quantity}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`border rounded-lg p-4 cursor-pointer transition-all touch-manipulation ${
        isSelected
          ? 'border-green-500 bg-green-50 shadow-md'
          : isBestValue
          ? 'border-yellow-400 bg-yellow-50 hover:shadow-md'
          : 'border-gray-200 hover:border-navy-300 hover:shadow-sm'
      }`}
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
    >
      {/* Quantity Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="text-lg font-bold text-gray-900">
            {quote.quantity.toLocaleString()}個
          </div>
          {isBestValue && (
            <Star className="w-4 h-4 text-yellow-500 ml-2" />
          )}
          {isSelected && (
            <Check className="w-4 h-4 text-green-600 ml-2" />
          )}
        </div>
        {priceTrendIcon}
      </div>

      {/* Price Information */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500">単価</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(quote.unitPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">合計</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(quote.totalPrice)}
          </p>
        </div>
      </div>

      {/* Discount Badge */}
      {quote.discountRate > 0 && (
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDiscountBadgeColor(quote.discountRate)}`}>
          {quote.discountRate}% 割引
        </div>
      )}

      {/* Additional Details */}
      <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-100">
        <div className="flex justify-between">
          <span>価格区分:</span>
          <span className="font-medium">{quote.priceBreak}</span>
        </div>
        <div className="flex justify-between">
          <span>納期:</span>
          <span className="font-medium">{quote.leadTimeDays}日</span>
        </div>
      </div>
    </motion.div>
  );
});

MobileQuoteCard.displayName = 'MobileQuoteCard';

// Memoized table row component
const DesktopQuoteRow = memo(({
  quote,
  index,
  isSelected,
  isBestValue,
  isExpanded,
  onSelect,
  onToggleExpand,
  priceTrendIcon
}: {
  quote: QuantityQuote;
  index: number;
  isSelected: boolean;
  isBestValue: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  priceTrendIcon: React.ReactNode;
}) => {
  return (
    <>
      <MotionTableRow
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.02 }}
        className={`cursor-pointer transition-colors ${
          isSelected
            ? 'bg-green-50 hover:bg-green-100'
            : isBestValue
            ? 'bg-yellow-50 hover:bg-yellow-100'
            : 'hover:bg-gray-50'
        }`}
        onClick={onSelect}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-900">
              {quote.quantity.toLocaleString()}
            </span>
            {isBestValue && (
              <Star className="w-4 h-4 text-yellow-500 ml-2" />
            )}
            {isSelected && (
              <Check className="w-4 h-4 text-green-600 ml-2" />
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 font-medium">
            {formatCurrency(quote.unitPrice)}
          </div>
          {priceTrendIcon}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-900 font-medium">
            {formatCurrency(quote.totalPrice)}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {quote.discountRate > 0 ? (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDiscountBadgeColor(quote.discountRate)}`}>
              {quote.discountRate}%
            </span>
          ) : (
            <span className="text-sm text-gray-500">-</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-900">
            {quote.priceBreak}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-900">
            {quote.leadTimeDays}日
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <button
            className={`inline-flex items-center px-3 py-1 border rounded-md text-xs font-medium transition-colors ${
              isSelected
                ? 'border-green-300 bg-green-200 text-green-800'
                : isBestValue
                ? 'border-yellow-300 bg-yellow-200 text-yellow-800'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {isSelected ? '選択中' : '選択'}
          </button>
        </td>
      </MotionTableRow>

      {/* Expanded Row Details */}
      <AnimatePresence>
        {isExpanded && (
          <MotionTableRow
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gray-50"
          >
            <td colSpan={7} className="px-6 py-4">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <span className="font-medium">単価効率:</span>
                    <p>{((1 / quote.unitPrice) * 10000).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="font-medium">コスト/個:</span>
                    <p>{formatCurrency(quote.unitPrice * 0.7)}</p>
                  </div>
                  <div>
                    <span className="font-medium">固定費:</span>
                    <p>{formatCurrency(quote.unitPrice * 0.3)}</p>
                  </div>
                  <div>
                    <span className="font-medium">利益率:</span>
                    <p>{Math.round((1 - 0.7) * 100)}%</p>
                  </div>
                </div>
              </div>
            </td>
          </MotionTableRow>
        )}
      </AnimatePresence>
    </>
  );
});

DesktopQuoteRow.displayName = 'DesktopQuoteRow';

export default function MultiQuantityComparisonTable({
  quotes,
  comparison,
  selectedQuantity,
  onQuantitySelect,
  isLoading = false
}: MultiQuantityComparisonTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof QuantityQuote;
    direction: 'asc' | 'desc';
  }>({
    key: 'quantity',
    direction: 'asc'
  });

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Optimized sorting with useMemo
  const sortedQuotes = useMemo(() => {
    if (!quotes.length) return [];

    return [...quotes].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [quotes, sortConfig]);

  // Optimized handlers with useCallback
  const handleSort = useCallback((key: keyof QuantityQuote) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const toggleRowExpansion = useCallback((quantity: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quantity)) {
        newSet.delete(quantity);
      } else {
        newSet.add(quantity);
      }
      return newSet;
    });
  }, []);

  // Memoized value indicators
  const getBestValueIndicator = useCallback((quantity: number) => {
    if (!comparison) return false;
    return comparison.bestValue.quantity === quantity;
  }, [comparison]);

  const getPriceTrendIcon = useCallback((quantity: number) => {
    if (!comparison || sortedQuotes.length < 2) return null;

    const currentIndex = sortedQuotes.findIndex(q => q.quantity === quantity);
    if (currentIndex === -1) return null;

    const currentPrice = sortedQuotes[currentIndex].unitPrice;
    let averagePrice = 0;

    if (currentIndex > 0 && currentIndex < sortedQuotes.length - 1) {
      averagePrice = (sortedQuotes[currentIndex - 1].unitPrice + sortedQuotes[currentIndex + 1].unitPrice) / 2;
    }

    if (currentPrice < averagePrice) {
      return <TrendingDown className="w-4 h-4 text-green-600" />;
    } else if (currentPrice > averagePrice) {
      return <TrendingUp className="w-4 h-4 text-red-600" />;
    }

    return <Minus className="w-4 h-4 text-gray-400" />;
  }, [comparison, sortedQuotes]);

  // Loading state with skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!quotes.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">比較データがありません</p>
          <p className="text-sm text-gray-500 mt-2">数量を選択して比較を開始してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-gradient-to-r from-navy-50 to-navy-100 px-6 py-4 border-b border-navy-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-navy-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            数量比較テーブル
          </h3>
          <div className="flex items-center space-x-2 text-sm text-navy-600">
            {comparison && (
              <>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="hidden sm:inline">最適価値: {comparison.bestValue.quantity.toLocaleString()}個</span>
                  <span className="sm:hidden">最適: {comparison.bestValue.quantity.toLocaleString()}</span>
                </div>
                <div className="h-4 w-px bg-navy-300" />
                <div className="flex items-center">
                  <span>最大節約: {comparison.bestValue.percentage}%</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="lg:hidden p-4 space-y-4">
        {sortedQuotes.map((quote, index) => (
          <MobileQuoteCard
            key={quote.quantity}
            quote={quote}
            index={index}
            isSelected={selectedQuantity === quote.quantity}
            isBestValue={getBestValueIndicator(quote.quantity)}
            onSelect={() => onQuantitySelect(quote.quantity)}
            priceTrendIcon={getPriceTrendIcon(quote.quantity)}
          />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('quantity')}
              >
                <div className="flex items-center">
                  数量
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('unitPrice')}
              >
                <div className="flex items-center">
                  単価
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('totalPrice')}
              >
                <div className="flex items-center">
                  合計価格
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                割引率
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                価格区分
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                納期
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                選択
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedQuotes.map((quote, index) => (
              <DesktopQuoteRow
                key={quote.quantity}
                quote={quote}
                index={index}
                isSelected={selectedQuantity === quote.quantity}
                isBestValue={getBestValueIndicator(quote.quantity)}
                isExpanded={expandedRows.has(quote.quantity)}
                onSelect={() => onQuantitySelect(quote.quantity)}
                onToggleExpand={() => toggleRowExpansion(quote.quantity)}
                priceTrendIcon={getPriceTrendIcon(quote.quantity)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {quotes.length}件の比較データ
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
              <span>最適価値</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>選択済み</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}