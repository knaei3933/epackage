/**
 * Loss Calculator Utility
 * 材料に基づいたロス計算の共有ユーティリティ
 *
 * Loss breakdown:
 * - KRAFT: 700m (500m print + 100m slitter + 100m process)
 * - AL: 400m (standard loss)
 * - Other: 300m (basic loss)
 */

import type { FilmStructureLayer } from './film-cost-calculator';

/**
 * Calculate fixed loss meters based on material type
 *
 * Loss breakdown:
 * - KRAFT: 700m (500m print + 100m slitter + 100m process)
 * - AL: 400m (standard loss)
 * - Other: 300m (basic loss)
 *
 * @param layers - Array of film structure layers
 * @returns Loss meters to apply
 *
 * @example
 * ```ts
 * const layers = [{ materialId: 'PET' }, { materialId: 'AL' }, { materialId: 'LLDPE' }];
 * const loss = calculateLossMeters(layers); // returns 400 (AL present)
 *
 * const kraftLayers = [{ materialId: 'KRAFT' }, { materialId: 'LLDPE' }];
 * const kraftLoss = calculateLossMeters(kraftLayers); // returns 700 (KRAFT present)
 *
 * const basicLayers = [{ materialId: 'PET' }, { materialId: 'LLDPE' }];
 * const basicLoss = calculateLossMeters(basicLayers); // returns 300 (no special materials)
 * ```
 */
export function calculateLossMeters(layers: FilmStructureLayer[]): number {
  const hasAL = layers.some(layer => layer.materialId === 'AL');
  const hasKraft = layers.some(layer => layer.materialId === 'KRAFT');

  if (hasKraft) return 700;  // KRAFT: 500m + 100m + 100m
  if (hasAL) return 400;     // AL: standard loss
  return 300;                // Other materials
}
