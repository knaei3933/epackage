/**
 * Film layer display utilities
 * Extracted from QuoteContext.tsx (L1557-1562, L1471-1476)
 */

import type { FilmStructureLayer } from '@/lib/film-cost-calculator';

/**
 * Get film layer display text (e.g., "PET 12m + AL 7m + LLDPE 80m")
 * @param layers - Array of film structure layers
 * @returns Display string with layer materials and thicknesses
 */
export function getFilmLayerDisplay(layers: FilmStructureLayer[]): string {
  return layers.map(layer => {
    const materialName = layer.materialId;
    return `${materialName} ${layer.thickness}m`;
  }).join(' + ');
}
