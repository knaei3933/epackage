/**
 * Common film layer calculations for roll film weight estimation
 * Shared across QuoteContext and MultiQuantityQuoteContext
 */

import type { FilmStructureLayer } from '@/lib/film-cost-calculator';

/**
 * Get default film layers for roll film weight calculation
 * LLDPE thickness: 50, 70, 90, 100, 110μm
 */
export function getDefaultFilmLayers(
  materialId: string,
  thicknessSelection?: string
): FilmStructureLayer[] {
  const lldpeBaseThickness: Record<string, number> = {
    'light_50': 50,
    'standard_70': 70,
    'heavy_90': 90,
    'ultra_100': 100,
    'maximum_110': 110,
    // fallback mappings
    'light': 50,
    'medium': 70,
    'standard': 90,
    'heavy': 100,
    'ultra': 110
  };
  const baseLldpeThickness = lldpeBaseThickness[thicknessSelection || 'standard_70'] || 70;

  const defaultLayers: Record<string, FilmStructureLayer[]> = {
    'pet_al': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    'pet_vmpet': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'VMPET', thickness: 12 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    'pet_ldpe': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LDPE', thickness: 7 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    'pet_ny_al': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'NY', thickness: 15 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    'pet_transparent': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    'kraft_pe': [
      { materialId: 'KRAFT', grammage: 80 },
      { materialId: 'PE', thickness: 40 }
    ],
    'ny_lldpe': [
      { materialId: 'NY', thickness: 15 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    'kraft_vmpet_lldpe': [
      { materialId: 'KRAFT', grammage: 80 },
      { materialId: 'VMPET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    'kraft_pet_lldpe': [
      { materialId: 'KRAFT', grammage: 80 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ]
  };

  return defaultLayers[materialId] || defaultLayers['pet_al'];
}

/**
 * Get default film layers for a given material ID
 * @param materialId - Material ID (e.g., 'kraft_vmpet_lldpe', 'pet_al')
 * @param thicknessSelection - Thickness selection for LLDPE layer
 * @returns Array of film structure layers
 */
export function getDefaultLayers(
  materialId: string,
  thicknessSelection?: string
): FilmStructureLayer[] {
  const baseLldpeThickness = thicknessSelection
    ? { standard_50: 50, standard_70: 70, standard_90: 90, standard_100: 100, standard_110: 110 }[thicknessSelection] || 70
    : 70;

  const defaultLayers: Record<string, FilmStructureLayer[]> = {
    'pet_al': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'AL', thickness: 7 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    'pet_transparent': [
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    'kraft_pe': [
      { materialId: 'KRAFT', grammage: 80 },
      { materialId: 'PE', thickness: 40 }
    ],
    'ny_lldpe': [
      { materialId: 'NY', thickness: 15 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    'kraft_vmpet_lldpe': [
      { materialId: 'KRAFT', grammage: 80 },
      { materialId: 'VMPET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ],
    'kraft_pet_lldpe': [
      { materialId: 'KRAFT', grammage: 80 },
      { materialId: 'PET', thickness: 12 },
      { materialId: 'LLDPE', thickness: baseLldpeThickness }
    ]
  };

  return defaultLayers[materialId] || defaultLayers['pet_al'];
}
