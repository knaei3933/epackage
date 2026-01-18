import type { FilmStructureLayer } from './film-cost-calculator';

// Constants
const CORE_WEIGHT = 500; // Core weight (g)
const MAX_TOTAL_WEIGHT = 29000; // Maximum weight (g) - including core
const MAX_FILM_WEIGHT = MAX_TOTAL_WEIGHT - CORE_WEIGHT; // Maximum film weight (g)

// Material densities (g/cm³) - from docs/reports/tjfrP/필름 계산.md
const MATERIAL_DENSITIES: Record<string, number> = {
  'PET': 1.40,      // PET: 비중 1.4
  'AL': 2.71,       // AL: 비중 2.71
  'LLDPE': 0.92,    // LLDPE: 비중 0.92
  'LDPE': 0.92,     // LDPE: 비중 0.92 (same as LLDPE)
  'NY': 1.16,       // NY: 비중 1.16
  'VMPET': 1.40,    // VMPET: 비중 1.4
  'CPP': 0.91,
  'MPET': 1.40,
  'KRAFT': 0.80,    // Kraft paper density
  'PE': 0.92,       // PE density (for kraft-pe materials)
};

/**
 * Even distribution algorithm
 * Example: 1000m ÷ 3 = [334m, 333m, 333m]
 */
export function distributeLengthEvenly(
  totalLength: number,
  rollCount: number
): number[] {
  if (rollCount <= 0 || totalLength <= 0) return [];

  const baseLength = Math.floor(totalLength / rollCount);
  const remainder = totalLength % rollCount;

  const distribution = Array(rollCount).fill(baseLength);

  // Distribute remainder to first few rolls
  for (let i = 0; i < remainder; i++) {
    distribution[i] += 1;
  }

  return distribution;
}

/**
 * Calculate total film layer thickness
 */
export function calculateTotalThickness(
  layers: FilmStructureLayer[]
): number {
  return layers.reduce((sum, layer) => sum + layer.thickness, 0);
}

/**
 * Calculate average density (weighted average)
 */
export function calculateAverageDensity(
  layers: FilmStructureLayer[]
): number {
  if (layers.length === 0) return 1.5; // Default

  let totalThickness = 0;
  let weightedDensity = 0;

  for (const layer of layers) {
    const density = MATERIAL_DENSITIES[layer.materialId] || 1.5;
    totalThickness += layer.thickness;
    weightedDensity += layer.thickness * density;
  }

  return totalThickness > 0 ? weightedDensity / totalThickness : 1.5;
}

/**
 * Calculate roll weight - 계산 각 레이어별 중량 합산
 * 공식: 各レイヤー重量(g) = 層厚(mm) × 幅(m) × 長さ(m) × 比重
 * @param width Width (mm)
 * @param length Length (m)
 * @param layers Film layers
 * @returns Total weight (g), Film weight (g), Core weight (g)
 */
export function calculateRollWeight(
  width: number,
  length: number,
  layers: FilmStructureLayer[]
): {
  totalWeight: number;  // Total weight (g)
  filmWeight: number;   // Film weight (g)
  coreWeight: number;   // Core weight (g)
  layerWeights: Array<{ materialId: string; weight: number }>; // 각 레이어 중량
} {
  // 각 레이어별 중량 계산 (g)
  const layerWeights: Array<{ materialId: string; weight: number }> = [];
  let totalFilmWeightG = 0;

  for (const layer of layers) {
    const density = MATERIAL_DENSITIES[layer.materialId] || 1.0;
    // 두께를 mm로 변환 (μm → mm)
    const thicknessMm = layer.thickness / 1000;
    // 폭을 m로 변환
    const widthM = width / 1000;

    // 중량 (g) = 두께(mm) × 폭(m) × 길이(m) × 비중 × 1000
    const weightG = thicknessMm * widthM * length * density * 1000;

    layerWeights.push({ materialId: layer.materialId, weight: Math.round(weightG) });
    totalFilmWeightG += weightG;
  }

  return {
    totalWeight: Math.round(totalFilmWeightG) + CORE_WEIGHT,
    filmWeight: Math.round(totalFilmWeightG),
    coreWeight: CORE_WEIGHT,
    layerWeights
  };
}

/**
 * Calculate maximum length per roll - 29kg 제한 기준
 * @param width Width (mm)
 * @param layers Film layers
 * @returns Maximum length (m)
 */
export function calculateMaxRollLength(
  width: number,
  layers: FilmStructureLayer[]
): number {
  if (width <= 0 || layers.length === 0) {
    return 1000; // Default maximum
  }

  // 각 레이어별로 1m당 중량 계산
  const widthM = width / 1000; // mm → m
  let weightPerMeter = 0; // g/m

  for (const layer of layers) {
    const density = MATERIAL_DENSITIES[layer.materialId] || 1.0;
    const thicknessMm = layer.thickness / 1000; // μm → mm

    // 1m당 중량 (g/m) = 두께(mm) × 폭(m) × 1m × 비중 × 1000
    const weightPerMeterLayer = thicknessMm * widthM * 1 * density * 1000;
    weightPerMeter += weightPerMeterLayer;
  }

  // 최대 길이 (m) = (최대 필름 중량) / (1m당 중량)
  // 29kg - 0.5kg(지관) = 28.5kg = 28500g
  const maxLength = MAX_FILM_WEIGHT / weightPerMeter;

  return Math.floor(maxLength);
}

/**
 * Validate roll film parameters
 * @param totalLength Total length (m)
 * @param rollCount Number of rolls
 * @param width Width (mm)
 * @param layers Film layers
 * @returns Validation result
 */
export function validateRollFilmParams(
  totalLength: number,
  rollCount: number,
  width: number,
  layers: FilmStructureLayer[]
): {
  isValid: boolean;
  error?: string;
  warnings?: string[];
  maxRollLength?: number;
} {
  const MIN_LENGTH_PER_ROLL = 50; // Minimum 50m per roll
  const MAX_ROLLS = 50;
  const warnings: string[] = [];

  // Basic validation
  if (totalLength < MIN_LENGTH_PER_ROLL) {
    return { isValid: false, error: `最小${MIN_LENGTH_PER_ROLL}m以上` };
  }

  if (rollCount < 1 || rollCount > MAX_ROLLS) {
    return { isValid: false, error: `ロール数は1-${MAX_ROLLS}の範囲で` };
  }

  const lengthPerRoll = totalLength / rollCount;
  if (lengthPerRoll < MIN_LENGTH_PER_ROLL) {
    return { isValid: false, error: `1ロールあたり${MIN_LENGTH_PER_ROLL}m以上必要` };
  }

  // Weight validation
  const maxRollLength = calculateMaxRollLength(width, layers);

  if (lengthPerRoll > maxRollLength) {
    return {
      isValid: false,
      error: `1ロールあたり${Math.round(maxRollLength)}m以下にしてください（重量制限: 29kg）`,
      maxRollLength,
    };
  }

  // Warning: 25kg or more
  const weight = calculateRollWeight(width, lengthPerRoll, layers);
  if (weight.totalWeight > 25000) {
    warnings.push(`1ロールの重量が${Math.round(weight.totalWeight / 1000)}kgになります（制限: 29kg）`);
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
    maxRollLength,
  };
}

/**
 * Calculate shipping cost
 */
export function calculateRollFilmShippingCost(
  rollCount: number,
  baseCostPerRoll: number = 16800
): number {
  return rollCount * baseCostPerRoll;
}

/**
 * Get roll weight info for display
 */
export function getRollWeightInfo(
  width: number,
  length: number,
  layers: FilmStructureLayer[]
): {
  totalWeightKg: number;
  filmWeightKg: number;
  coreWeightKg: number;
  isOverLimit: boolean;
} {
  const weight = calculateRollWeight(width, length, layers);

  return {
    totalWeightKg: Math.round(weight.totalWeight) / 1000,
    filmWeightKg: Math.round(weight.filmWeight) / 1000,
    coreWeightKg: Math.round(weight.coreWeight) / 1000,
    isOverLimit: weight.totalWeight > MAX_TOTAL_WEIGHT,
  };
}
