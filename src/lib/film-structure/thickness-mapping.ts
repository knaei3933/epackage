/**
 * LLDPE base thickness mapping for thickness selection
 * Extracted from QuoteContext.tsx
 */

/**
 * Get LLDPE base thickness for thickness selection
 * @param thicknessSelection - Thickness selection key (e.g., 'light_50', 'standard_70', 'heavy_90')
 * @returns Base thickness in microns (μm)
 */
export function getLLDPEBaseThickness(thicknessSelection: string = 'standard_70'): number {
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

  return lldpeBaseThickness[thicknessSelection] ?? 70;
}
