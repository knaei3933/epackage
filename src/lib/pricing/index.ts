/**
 * Pricing Engine Module
 * 統一価格計算エンジンのメインエントリーポイント
 */

// Core
export { PricingEngine, pricingEngine } from './core/engine'
export type {
  PricingStrategy,
  CalculationParams,
  QuoteResult,
  ValidationResult,
  PriceBreakdown,
  FilmStructureLayer,
  MaterialCostConfig,
  ProcessingCostConfig,
  ThicknessOption,
} from './core/types'

// Constants
export {
  PRICING_CONSTANTS,
  MATERIAL_PRICES_KRW,
  POUCH_PROCESSING_COSTS_KRW,
  ZIPPER_SURCHARGE_KRW,
  PRINTING_COSTS,
  DELIVERY_COSTS,
  ROLL_FILM_CONSTANTS,
  DELIVERY_COST_BY_WEIGHT_KRW,
  PACKAGE_WEIGHT_LIMIT_KG,
  DELIVERY_SURCHARGE_RATE,
  POUCH_DELIVERY_CONSTANTS,
  MATERIAL_THICKNESS_OPTIONS,
  POST_PROCESSING_MULTIPLIERS,
} from './core/constants'

// Strategies
export { PouchStrategy } from './strategies/pouch-strategy'
export { RollFilmStrategy } from './strategies/roll-film-strategy'
export { BasePricingStrategy } from './strategies/base-strategy'
