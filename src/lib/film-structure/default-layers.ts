/**
 * Default film layers for material types
 * Extracted from QuoteContext.tsx (L139-221)
 */

import type { FilmStructureLayer } from '@/lib/film-cost-calculator';
import { getLLDPEBaseThickness } from './thickness-mapping';

/**
 * Get default film layers for a material ID and thickness selection
 * @param materialId - Material ID (e.g., 'pet_al', 'pet_vmpet', 'kp_pe')
 * @param thicknessSelection - Thickness selection (default: 'standard_70')
 * @returns Array of film structure layers
 */
export function getDefaultFilmLayers(
  materialId: string,
  thicknessSelection: string = 'standard_70'
): FilmStructureLayer[] {
  const lldpeThickness = getLLDPEBaseThickness(thicknessSelection);

  const layerMap: Record<string, (lldpe: number) => FilmStructureLayer[]> = {
    'pet_al': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_vmpet': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'VMPET', thickness: 12 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_ny': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'NY', thickness: 15 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_ny_al': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'NY', thickness: 16 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_ldpe': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'kp_pe': () => [
      { materialId: 'KP', thickness: 12 },
      { materialId: 'PE', thickness: 60 }
    ],
    'pet': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    'pet_al_pet': (lldpe: number) => [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    // NY+LLDPE: 2-layer structure
    'ny_lldpe': (lldpe: number) => [
      { materialId: 'NY', thickness: 15 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    // Kraft+VMPET+LLDPE: 3-layer structure (Kraft uses grammage)
    'kraft_vmpet_lldpe': (lldpe: number) => [
      { materialId: 'KRAFT', grammage: 80 },
      { materialId: 'VMPET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ],
    // Kraft+PET+LLDPE: 3-layer structure (Kraft uses grammage)
    'kraft_pet_lldpe': (lldpe: number) => [
      { materialId: 'KRAFT', grammage: 80 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: lldpe }
    ]
  };

  const layersFn = layerMap[materialId] || layerMap['pet_al'];
  return layersFn(lldpeThickness);
}
