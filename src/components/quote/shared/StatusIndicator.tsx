'use client';

import React from 'react';
import { Package, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * 現在のSKU数量設定の状態をコンパクトに表示
 *
 * Features:
 * - SKU数の表示
 * - 見積価格と単価の表示
 */
export interface StatusIndicatorProps {
  skuCount: number;
  totalQuantity: number;
  estimatedPrice?: number;
  isRollFilm?: boolean;
}

export function StatusIndicator({
  skuCount,
  totalQuantity,
  estimatedPrice,
  isRollFilm = false
}: StatusIndicatorProps) {
  const unit = isRollFilm ? 'm' : '個';

  // 単価計算（総数量で割る）
  const unitPrice = estimatedPrice && totalQuantity > 0 ? estimatedPrice / totalQuantity : 0;
  const roundedUnitPrice = Math.round(unitPrice);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-lg p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-6">
        {/* SKU数 */}
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-blue-600" />
          <div>
            <div className="text-sm text-gray-600">SKU数</div>
            <div className="text-2xl font-bold text-gray-900">
              {skuCount}種類
            </div>
            {totalQuantity > 0 && (
              <div className="text-sm text-gray-700 mt-1">
                総数量: {totalQuantity.toLocaleString()}{unit}
              </div>
            )}
          </div>
        </div>

        {/* 見積価格と単価 - 数量が入力されていない場合は表示しない */}
        {totalQuantity > 0 && estimatedPrice !== undefined && estimatedPrice > 0 && (
          <div className="text-right flex-1">
            <div className="text-sm text-gray-600 mb-1">見積価格</div>
            {(() => {
              const roundedPrice = Math.round(estimatedPrice / 100) * 100;
              return (
                <div className="text-3xl font-bold text-gray-900">
                  ¥{roundedPrice.toLocaleString()}
                </div>
              );
            })()}
            <div className="text-sm text-gray-600 mt-1">
              単価: ¥{roundedUnitPrice.toLocaleString()}/{unit}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
