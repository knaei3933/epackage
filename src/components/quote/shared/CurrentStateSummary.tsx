'use client';

import React from 'react';
import { Package, FileText, Calculator, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { translateBagType, translateMaterialType } from '@/constants/enToJa';

/**
 * 仕様情報
 */
export interface SpecSummary {
  bagTypeId: string;
  materialId: string;
  width: number;
  height?: number;
  depth?: number;
  thicknessSelection?: string;
  pitch?: number;  // ロールフィルム用: ピッチ（デザインの繰り返し周期）
}

/**
 * 現在の状態サマリー表示コンポーネント
 *
 * Features:
 * - 仕様情報、SKU数、見積価格と単価を1箇所にまとめて表示
 * - コンパクトで見やすいレイアウト
 * - 設定完了状態の視覚的フィードバック
 */
export interface CurrentStateSummaryProps {
  specs: SpecSummary;
  totalQuantity: number;
  skuCount: number;
  estimatedPrice?: number;
  isRollFilm?: boolean;
  isComplete?: boolean;
}

export function CurrentStateSummary({
  specs,
  totalQuantity,
  skuCount,
  estimatedPrice,
  isRollFilm = false,
  isComplete = false
}: CurrentStateSummaryProps) {
  const unit = isRollFilm ? 'm' : '個';

  // 単価計算（総数量で割る）
  const unitPrice = estimatedPrice && totalQuantity > 0 ? estimatedPrice / totalQuantity : 0;
  const roundedUnitPrice = Math.round(unitPrice);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg border-2 shadow-sm ${
        isComplete
          ? 'border-green-300 bg-gradient-to-br from-green-50 to-white'
          : 'border-gray-200'
      } p-5`}
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <FileText className="w-5 h-5 text-gray-600" />
          )}
          <h3 className="text-base font-bold text-gray-900">
            現在の設定内容
          </h3>
        </div>
        {isComplete && (
          <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
            設定完了
          </span>
        )}
      </div>

      {/* 仕様情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
        {/* 左列: パウチタイプと素材 */}
        <div className="space-y-2">
          <div className="flex">
            <span className="text-xs text-gray-600 w-24 flex-shrink-0">タイプ:</span>
            <span className="text-sm font-medium text-gray-900">
              {translateBagType(specs.bagTypeId)}
            </span>
          </div>
          <div className="flex">
            <span className="text-xs text-gray-600 w-24 flex-shrink-0">素材:</span>
            <span className="text-sm font-medium text-gray-900">
              {translateMaterialType(specs.materialId)}
            </span>
          </div>
        </div>

        {/* 右列: サイズ情報 */}
        <div className="space-y-2">
          <div className="flex">
            <span className="text-xs text-gray-600 w-24 flex-shrink-0">サイズ:</span>
            <span className="text-sm font-medium text-gray-900">
              {specs.width}mm
              {specs.height && ` × ${specs.height}mm`}
              {specs.depth && specs.depth > 0 && ` × ${specs.depth}mm`}
              {specs.pitch && ` / ピッチ: ${specs.pitch}mm`}
            </span>
          </div>
          {specs.thicknessSelection && (
            <div className="flex">
              <span className="text-xs text-gray-600 w-24 flex-shrink-0">厚さ:</span>
              <span className="text-sm font-medium text-gray-900">
                {specs.thicknessSelection === 'light' && 'PET 12μ / AL 7μ / PET 12μ / LLDPE 50μ'}
                {specs.thicknessSelection === 'medium' && 'PET 12μ / AL 7μ / PET 12μ / LLDPE 70μ'}
                {specs.thicknessSelection === 'standard' && 'PET 12μ / AL 7μ / PET 12μ / LLDPE 70μ'}
                {specs.thicknessSelection === 'heavy' && 'PET 12μ / AL 7μ / PET 12μ / LLDPE 90μ'}
                {specs.thicknessSelection === 'ultra' && 'PET 12μ / AL 7μ / PET 12μ / LLDPE 100μ'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* SKU数と価格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* SKU数 */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Package className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <div className="text-xs text-gray-600">SKU数</div>
            <div className="text-2xl font-bold text-gray-900">
              {skuCount}種類
            </div>
            {totalQuantity > 0 && (
              <div className="text-xs text-gray-700 mt-1">
                総数量: {totalQuantity.toLocaleString()}{unit}
              </div>
            )}
          </div>
        </div>

        {/* 見積価格と単価 - 数量が入力されていない場合は表示しない */}
        {totalQuantity > 0 && estimatedPrice !== undefined && estimatedPrice > 0 && (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <Calculator className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-xs text-gray-600">見積価格</div>
              {(() => {
                const roundedPrice = Math.round(estimatedPrice / 100) * 100;
                return (
                  <div className="text-2xl font-bold text-green-600">
                    ¥{roundedPrice.toLocaleString()}
                  </div>
                );
              })()}
              <div className="text-xs text-gray-600 mt-1">
                単価: ¥{roundedUnitPrice.toLocaleString()}/{unit}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
