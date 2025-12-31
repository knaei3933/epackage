// Simulation system types based on brixa-replica

export type SimulationState = {
  orderType: 'new' | 'repeat';
  contentsType: 'solid' | 'liquid' | 'powder';
  bagType: 'flat_3_side' | 'stand_up' | 'gusset';
  width: number;
  height: number;
  materialGenre: string;
  surfaceMaterial: string;
  materialComposition: string;
  quantities: number[];
  deliveryDate?: Date;
};

export type SimulationContextType = {
  state: SimulationState;
  updateState: (updates: Partial<SimulationState>) => void;
  calculate: () => void;
  results: QuotationResult[] | null;
  isLoading: boolean;
  error: string | null;
};

// Constants for the simulation system
export const ORDER_TYPES = [
  { value: 'new', label: '新規注文' },
  { value: 'repeat', label: 'リピート注文' },
] as const;

export const CONTENTS_TYPES = [
  { value: 'solid', label: '固体' },
  { value: 'liquid', label: '液体' },
  { value: 'powder', label: '粉末' },
] as const;

export const BAG_TYPES = [
  { value: 'flat_3_side', label: '平袋（三方シール）' },
  { value: 'stand_up', label: 'スタンド袋' },
  { value: 'gusset', label: 'ガゼット袋' },
] as const;

export const MATERIAL_GENRES = [
  { value: 'opp_al', label: 'OPP+アルミ箔' },
  { value: 'pet_al', label: 'PET+アルミ箔' },
  { value: 'nylon_al', label: 'ナイロン+アルミ箔' },
] as const;

export const SURFACE_MATERIALS = [
  { value: 'gloss_opp', label: 'グロスOPP' },
  { value: 'matte_opp', label: 'マットOPP' },
] as const;

export const MATERIAL_COMPOSITIONS = [
  { value: 'comp_1', label: '【100g〜500g】OPP40/PET12/AL7/PE40' },
  { value: 'comp_2', label: '【500g〜1kg】OPP50/PET12/AL7/PE60' },
  { value: 'comp_3', label: '【1kg〜2kg】OPP60/PET15/AL9/PE80' },
  { value: 'comp_4', label: '【2kg〜5kg】OPP80/PET20/AL12/PE100' },
] as const;

export interface QuotationResult {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountFactor?: number;
}

// Extended types for enhanced simulation system
export interface QuantityPattern {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface PriceCalculation {
  basePrice: number;
  materialMultiplier: number;
  sizeMultiplier: number;
  quantityDiscount: number;
  totalPrice: number;
  unitPrice: number;
  calculatedAt: Date;
}

export interface SimulationValidationError {
  field: string;
  message: string;
}

export interface MaterialPricing {
  basePrice: number;
  features: string[];
  environmentalImpact: 'low' | 'medium' | 'high';
}

export interface BagTypePricing {
  basePrice: number;
  complexityMultiplier: number;
  minSize: Size;
  maxSize: Size;
}

export interface PricingRules {
  [key: string]: MaterialPricing;
}

// Enhanced simulation context type
export type EnhancedSimulationContextType = SimulationContextType & {
  validationErrors: SimulationValidationError[];
  isFormValid: boolean;
  currentStep: number;
  clearErrors: () => void;
  validateCurrentStep: () => boolean;
  nextStep: () => void;
  previousStep: () => void;
  resetForm: () => void;
  setOrderType: (orderType: 'new' | 'repeat') => void;
  setContentType: (contentsType: 'solid' | 'liquid' | 'powder') => void;
  setBagType: (bagType: 'flat_3_side' | 'stand_up' | 'gusset') => void;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setSize: (width: number, height: number) => void;
  setMaterialGenre: (materialGenre: string) => void;
  setSurfaceMaterial: (surfaceMaterial: string) => void;
  setMaterialComposition: (materialComposition: string) => void;
  setQuantities: (quantities: number[]) => void;
  setDeliveryDate: (deliveryDate: Date | undefined) => void;
};