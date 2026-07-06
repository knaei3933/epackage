/**
 * 統一製品表示名フォーマット
 *
 * 見積一覧・注文詳細・PDF等で同一フォーマットを使用し、表示揺れを防止する。
 *
 * フォーマット: {袋タイプJA}_{サイズ}_{厚さスペック}
 * 例: 三方シール平袋_100×120_PET 12μ + AL 7μ + PET 12μ + LLDPE 70μ
 *
 * specs 不足時は取得できた部分のみを「_」区切りで返す。
 * 全て不足時は fallback（デフォルト "カスタム製品"）を返す。
 */
import { translateBagType } from '@/constants/enToJa';
import { getMaterialSpecification } from '@/lib/unified-pricing-engine';
import { getFilmStructureLabel } from '@/constants/materialTypes';

export interface ProductDisplayNameSpecs {
  bagTypeId?: string;
  width?: number;
  height?: number;
  depth?: number;
  materialId?: string;
  thicknessSelection?: string;
  rollFilmSpecs?: {
    materialWidth?: number;
    totalLength?: number;
  };
}

/**
 * 仕様オブジェクトから統一製品表示名を生成する。
 *
 * @param specs 仕様情報（quotation_items.specifications または同等オブジェクト）
 * @param fallback 全パーツ欠落時のデフォルト名（省略時 "カスタム製品"）
 * @returns 統一フォーマットの製品表示名
 */
export function formatProductDisplayName(
  specs: ProductDisplayNameSpecs | Record<string, unknown> | null | undefined,
  fallback = 'カスタム製品'
): string {
  if (!specs || typeof specs !== 'object') return fallback;

  const s = specs as ProductDisplayNameSpecs;
  const parts: string[] = [];

  // 1. 袋タイプ（日本語）
  if (s.bagTypeId) {
    const bagLabel = translateBagType(s.bagTypeId);
    if (bagLabel && bagLabel !== s.bagTypeId) {
      parts.push(bagLabel);
    }
  }

  // 2. サイズ
  if (s.width != null && s.height != null) {
    let sizeStr = `${s.width}×${s.height}`;
    if (s.depth != null && Number(s.depth) > 0) {
      sizeStr += `×${s.depth}`;
    }
    parts.push(sizeStr);
  } else if (s.rollFilmSpecs?.materialWidth && s.rollFilmSpecs?.totalLength) {
    parts.push(`幅${s.rollFilmSpecs.materialWidth}×${s.rollFilmSpecs.totalLength}m`);
  }

  // 3. 厚さスペック（MATERIAL_THICKNESS_OPTIONS → getFilmStructureLabel フォールバック）
  if (s.materialId && s.thicknessSelection) {
    const spec = getMaterialSpecification(s.materialId, s.thicknessSelection);
    if (spec && spec !== '-' && spec !== s.materialId) {
      parts.push(spec);
    } else {
      const label = getFilmStructureLabel(s.materialId, s.thicknessSelection);
      if (label && label !== '-' && label !== s.materialId) {
        parts.push(label);
      }
    }
  } else if (s.materialId) {
    const label = getFilmStructureLabel(s.materialId, undefined);
    if (label && label !== '-' && label !== s.materialId) {
      parts.push(label);
    }
  }

  return parts.length > 0 ? parts.join('_') : fallback;
}

/**
 * 印刷方式を 'digital' / 'gravure' に解決する。
 *
 * DBには printingType='auto' で保存されたレガシーデータが存在する。
 * 'auto' の場合は cost_breakdown のグラビア指標（copperPlateCost > 0）で判定し、
 * 指標がなければデジタル（小ロット標準）とみなす。
 *
 * @param printingType DB格納値 ('digital' | 'gravure' | 'auto' | undefined)
 * @param costBreakdown 原価内訳（copperPlateCost の有無でグラビア判定）
 * @returns 'digital' | 'gravure'
 */
export function resolvePrintingType(
  printingType?: string,
  costBreakdown?: Record<string, unknown> | null
): 'digital' | 'gravure' {
  if (printingType === 'gravure') return 'gravure';
  if (printingType === 'digital') return 'digital';
  // 'auto' or undefined: resolve from cost data
  if (costBreakdown) {
    const copper = (costBreakdown as Record<string, number | null>).copperPlateCost;
    if (typeof copper === 'number' && copper > 0) return 'gravure';
  }
  return 'digital';
}

/**
 * 印刷方式の日本語表示ラベルを返す。
 * resolvePrintingType で解決した結果を表示用ラベルに変換。
 */
export function getPrintingLabelJa(
  printingType?: string,
  costBreakdown?: Record<string, unknown> | null
): string {
  const resolved = resolvePrintingType(printingType, costBreakdown);
  return resolved === 'gravure' ? 'グラビア印刷（フルカラー）' : 'デジタル印刷（フルカラー）';
}
