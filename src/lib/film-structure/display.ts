/**
 * Film layer display utilities
 * Extracted from QuoteContext.tsx (L1557-1562, L1471-1476)
 */

import type { FilmStructureLayer } from '@/lib/film-cost-calculator';

/**
 * Get film layer display text (e.g., "PET 12μ + AL 7μ + LLDPE 80μ")
 *
 * 単位バグ修正（計画 Step5）: 従来 `${thickness}m`（メートル）だったのを
 * 正しい単位 `${thickness}μ`（マイクロメートル）に修正。
 * また grammage を持つ層（Kraft 等）は `g/m²` で表示する分岐を追加。
 *
 * @param layers - Array of film structure layers
 * @returns Display string with layer materials and thicknesses
 */
export function getFilmLayerDisplay(layers: FilmStructureLayer[]): string {
  return layers.map(layer => {
    const materialName = layer.materialId;
    if (typeof layer.grammage === 'number') {
      return `${materialName} ${layer.grammage}g/m²`;
    }
    return `${materialName} ${layer.thickness}μ`;
  }).join(' + ');
}
