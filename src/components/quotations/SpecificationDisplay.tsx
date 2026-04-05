/**
 * SpecificationDisplay Component
 *
 * 製品仕様表示コンポーネント
 *
 * 見積もりの製品仕様を一貫して表示する
 * PostProcessingPreview を内包
 *
 * @module components/quotations/SpecificationDisplay
 */

'use client';

import React from 'react';
import { PostProcessingPreview } from '@/components/quote/previews/PostProcessingPreview';
import { convertToPreviewOptions } from '@/constants/product-type-config';
import type { QuotationItem } from '@/types/entities';

export interface SpecificationDisplayProps {
  /** 見積もりアイテム */
  item: QuotationItem;
  /** 言語 */
  locale?: 'ja' | 'en';
  /** コンパクト表示 */
  compact?: boolean;
  /** 後加工プレビューを表示 */
  showPostProcessing?: boolean;
}

/**
 * 素材タイプの日本語翻訳
 */
function translateMaterialType(materialId: string): string | null {
  const materialMap: Record<string, string> = {
    'pet_al': 'PET/AL (アルミ箔ラミネート)',
    'pet_ny_al': 'PET/NY/AL',
    'pet_pe': 'PET/PE (透明ラミネート)',
    'pet_ldpe': 'PET/LLDPE',
    'opp_cpp': 'OPP/CPP',
    'ny_pe': 'NY/PE',
    'kpet_al_pe': 'K-PET/AL/PE',
  };
  return materialMap[materialId] || null;
}

/**
 * SpecificationDisplay コンポーネント
 */
export function SpecificationDisplay({
  item,
  locale = 'ja',
  compact = false,
  showPostProcessing = false
}: SpecificationDisplayProps) {
  const specs = item.specifications as any || {};

  // 日本語翻訳マップ
  const productCategoryMap: Record<string, string> = {
    'food': '食品',
    'pet_food': 'ペットフード',
    'pharmaceuticals': '医薬品',
    'cosmetics': '化粧品',
    'chemicals': '化学品',
    'electronics': '電子部品',
    'agricultural': '農業資材',
    'other': 'その他',
  };

  const contentsTypeMap: Record<string, string> = {
    'solid': '固形物',
    'liquid': '液体',
    'powder': '粉末',
    'granule': '粒状',
    'paste': 'ペースト状',
    'gas_flushed': 'ガス充填',
    'other': 'その他',
  };

  const distributionEnvironmentMap: Record<string, string> = {
    'general_roomTemp': '一般（常温）',
    'light_oxygen_sensitive': '光・酸素敏感',
    'refrigerated': '冷蔵',
    'high_temp_sterilized': '高温殺菌',
    'other': 'その他',
  };

  // 素材の日本語表示
  const materialFallback: Record<string, string> = {
    'pet_al': 'PET/AL (アルミ箔ラミネート)',
    'pet_ny_al': 'PET/NY/AL',
    'pet_pe': 'PET/PE (透明ラミネート)',
    'pet_ldpe': 'PET/LLDPE',
  };

  const materialJa = translateMaterialType(specs.materialId) || materialFallback[specs.materialId] || specs.materialId || '-';

  // サイズ表示
  let sizeDisplay = '-';
  if (specs.size) {
    sizeDisplay = specs.size;
  } else if (specs.dimensions) {
    sizeDisplay = specs.dimensions;
  } else if (specs.width || specs.height || specs.depth) {
    const parts = [];
    if (specs.width) parts.push(`幅: ${specs.width}mm`);
    if (specs.sideWidth) parts.push(`マチ: ${specs.sideWidth}mm`);
    if (specs.height) parts.push(`高さ: ${specs.height}mm`);
    if (specs.depth) parts.push(`奥行: ${specs.depth}mm`);
    sizeDisplay = parts.join('、');
  }

  // 印刷情報
  const printingDisplay = specs.printing || specs.printing_display || '-';
  const colorsDisplay = specs.colors || '-';

  // 後加工オプション
  const postProcessingOptions = specs.post_processing || specs.post_processing_display || [];

  // 納期・配送
  const deliveryJa = specs.deliveryLocation === 'domestic' ? '国内' : specs.deliveryLocation === 'international' ? '海外' : '-';
  const urgencyJa = specs.urgency === 'standard' ? '標準' : specs.urgency === 'express' ? '急ぎ' : '-';

  // コンパクト表示
  if (compact) {
    return (
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">素材:</span>
          <span className="font-medium">{materialJa}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">サイズ:</span>
          <span className="font-medium">{sizeDisplay}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">印刷:</span>
          <span className="font-medium">{printingDisplay}</span>
        </div>
      </div>
    );
  }

  // 詳細表示
  return (
    <div className="space-y-4">
      {/* 基本情報 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-text-muted mb-2">製品タイプ</h4>
          <p className="text-text-primary">{specs.bag_type_display || specs.bagTypeId || '-'}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-text-muted mb-2">素材</h4>
          <p className="text-text-primary">{materialJa}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-text-muted mb-2">サイズ</h4>
          <p className="text-text-primary">{sizeDisplay}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-text-muted mb-2">印刷</h4>
          <p className="text-text-primary">{printingDisplay} {colorsDisplay !== '-' && `(${colorsDisplay}色)`}</p>
        </div>
      </div>

      {/* 内容物情報 */}
      {specs.productCategory && (
        <div>
          <h4 className="text-sm font-medium text-text-muted mb-2">内容物</h4>
          <p className="text-text-primary">
            {[
              specs.productCategory ? productCategoryMap[specs.productCategory] : null,
              specs.contentsType ? contentsTypeMap[specs.contentsType] : null,
              specs.distributionEnvironment ? distributionEnvironmentMap[specs.distributionEnvironment] : null,
            ].filter(Boolean).join('、') || '-'}
          </p>
        </div>
      )}

      {/* 後加工オプション */}
      {showPostProcessing && postProcessingOptions.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-text-muted mb-2">後加工オプション</h4>
          <div className="space-y-2">
            {postProcessingOptions.map((option: string, index: number) => (
              <span key={index} className="inline-block bg-bg-secondary px-2 py-1 rounded text-sm mr-2 mb-2">
                {option}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 納期・配送 */}
      {(specs.deliveryLocation || specs.urgency) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-text-muted mb-2">配送先</h4>
            <p className="text-text-primary">{deliveryJa}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-text-muted mb-2">納期</h4>
            <p className="text-text-primary">{urgencyJa}</p>
          </div>
        </div>
      )}

      {/* 後加工プレビュー（オプション） */}
      {showPostProcessing && specs.bagTypeId && postProcessingOptions.length > 0 && (
        <div className="mt-4">
          <PostProcessingPreview
            selectedProductType={specs.bagTypeId}
            selectedOptions={postProcessingOptions}
            onOptionsChange={() => {}}
            onPriceUpdate={() => {}}
            language={locale}
          />
        </div>
      )}
    </div>
  );
}

export default SpecificationDisplay;
