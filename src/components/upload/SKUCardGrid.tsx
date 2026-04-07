/**
 * SKU Card Grid Component
 *
 * 複数SKUをグリッド表示するコンポーネント
 */

'use client';

import React from 'react';
import { SKUUploadCard } from './SKUUploadCard';
import type { SKUUploadState } from '@/lib/sku-upload-state';

interface SKUCardGridProps {
  skuStates: SKUUploadState[];
  selectedSkuId: string | null;
  isUploading: boolean;
  onSelectSku: (skuId: string) => void;
  formatSkuDisplayName: (productName: string, quantity: number) => string;
  orderItems: Array<{ id: string; quantity: number }>;
}

export function SKUCardGrid({
  skuStates,
  selectedSkuId,
  isUploading,
  onSelectSku,
  formatSkuDisplayName,
  orderItems,
}: SKUCardGridProps) {
  if (skuStates.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        SKU情報がありません
      </div>
    );
  }

  // 単一SKUの場合は表示しない（自動選択のため）
  if (skuStates.length === 1) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">
          SKU選択
        </h3>
        <span className="text-sm text-gray-500">
          {skuStates.filter(s => s.isUploaded).length} / {skuStates.length} 完了
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {skuStates.map((skuState) => {
          const item = orderItems.find(i => i.id === skuState.orderItemId);
          return (
            <SKUUploadCard
              key={skuState.orderItemId}
              skuState={skuState}
              isSelected={selectedSkuId === skuState.orderItemId}
              isUploading={isUploading}
              onSelect={() => onSelectSku(skuState.orderItemId)}
              formatSkuDisplayName={formatSkuDisplayName}
              quantity={item?.quantity || 0}
            />
          );
        })}
      </div>
    </div>
  );
}
