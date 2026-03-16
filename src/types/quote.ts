export interface PostProcessingOption {
  id: string
  name: string
  nameJa: string
  description: string
  descriptionJa: string
  cost: number
  setupCost?: number
  multiplier: number
  icon?: string
  category?: string
  applicableProducts: string[]
  features: string[]
  featuresJa: string[]
}

// Base specification interface for all quote types
interface BaseQuoteSpecs {
  bagTypeId: string;
  materialId: string;
  width: number;
  height: number;
  depth?: number;
  thicknessSelection: string;
  postProcessingOptions: string[];
}

// Spout pouch specifications
export interface SpoutPouchSpecs extends BaseQuoteSpecs {
  bagTypeId: 'spout_pouch';
  spoutSize: 9 | 15 | 18 | 22 | 28;
  spoutPosition: 'top-left' | 'top-center' | 'top-right';
  hasGusset?: boolean;
}

// Roll film specifications
export interface RollFilmSpecs extends BaseQuoteSpecs {
  bagTypeId: 'roll_film';
  pitch: number;
  totalLength: number;
  rollCount: number;
  materialWidth?: number;
  distributedQuantities?: number[];
}

// General pouch specifications
export interface PouchSpecs extends BaseQuoteSpecs {
  bagTypeId: 'flat_3_side' | 'stand_up' | 'gusset' | 'lap_seal';
  sideWidth?: number;
}

// Union type for all quote specifications
export type QuoteSpecs = SpoutPouchSpecs | RollFilmSpecs | PouchSpecs;

// Type guard functions
export function isSpoutPouch(specs: QuoteSpecs): specs is SpoutPouchSpecs {
  return specs.bagTypeId === 'spout_pouch';
}

export function isRollFilm(specs: QuoteSpecs): specs is RollFilmSpecs {
  return specs.bagTypeId === 'roll_film';
}