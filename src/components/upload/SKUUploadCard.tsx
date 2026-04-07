/**
 * SKU Upload Card Component
 *
 * 個別SKUのアップロード状態を表示するカードコンポーネント
 */

'use client';

import React from 'react';
import { CheckCircle2, Upload, FileText, Loader2 } from 'lucide-react';
import type { SKUUploadState } from '@/lib/sku-upload-state';

interface SKUUploadCardProps {
  skuState: SKUUploadState;
  isSelected: boolean;
  isUploading: boolean;
  onSelect: () => void;
  formatSkuDisplayName: (productName: string, quantity: number) => string;
  quantity: number;
}

export function SKUUploadCard({
  skuState,
  isSelected,
  isUploading,
  onSelect,
  formatSkuDisplayName,
  quantity,
}: SKUUploadCardProps) {
  const displayName = formatSkuDisplayName(skuState.skuName, quantity);

  return (
    <div
      role="button"
      tabIndex={isUploading || skuState.isUploaded ? -1 : 0}
      aria-disabled={isUploading || skuState.isUploaded}
      aria-pressed={isSelected}
      aria-label={`${displayName} - ${skuState.isUploaded ? 'アップロード済み' : '未アップロード'}`}
      onClick={() => !isUploading && !skuState.isUploaded && onSelect()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isUploading && !skuState.isUploaded) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`
        relative p-4 rounded-xl border-2 transition-all duration-200
        ${skuState.isUploaded
          ? 'border-green-300 bg-green-50 cursor-default'
          : isSelected
            ? 'border-blue-500 bg-blue-50 shadow-lg cursor-pointer'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md cursor-pointer'
        }
        ${isUploading && isSelected ? 'opacity-70' : ''}
      `}
    >
      {/* Upload Status Icon */}
      <div className="absolute top-3 right-3">
        {skuState.isUploaded ? (
          <CheckCircle2 className="w-6 h-6 text-green-600" />
        ) : isSelected ? (
          <Upload className="w-6 h-6 text-blue-600" />
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
        )}
      </div>

      {/* SKU Name */}
      <div className="pr-8">
        <h4 className="font-semibold text-gray-900 mb-1 truncate">
          {displayName}
        </h4>

        {skuState.isUploaded ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <FileText className="w-4 h-4" />
            <span className="truncate">{skuState.uploadedFileName}</span>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            クリックしてファイルを選択
          </p>
        )}
      </div>

      {/* Loading Overlay */}
      {isUploading && isSelected && (
        <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
}
