/**
 * Quote Components Types
 *
 * Shared type definitions for quote-related components
 * 見積もり関連コンポーネントの共有型定義
 */

import type { LucideIcon } from 'lucide-react';

// ============= Trust Indicators =============

export interface TrustIndicator {
  icon: LucideIcon;
  label: string;
}

// ============= Material Types =============

export interface MaterialCategory {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  colorClass: string;
  headerBg: string;
  textColor: string;
  badgeColor: string;
}

export interface MaterialThicknessOption {
  id: string;
  name: string;
  nameJa: string;
  specification: string;
  specificationEn: string;
  weightRange: string;
  multiplier: number;
}

export interface MaterialData {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  multiplier: number;
  features: string[];
  featuresJa: string[];
  recommendedFor: string;
  category: 'transparent' | 'high_barrier' | 'kraft';
  popular: boolean;
  ecoFriendly: boolean;
  rollFilmOnly?: boolean;
  minQuantityMeters?: number;
  thicknessOptions: MaterialThicknessOption[];
}

// ============= Bag Types =============

export interface BagTypeOption {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  basePrice: number;
  image: string;
}

// ============= Wizard Steps =============

export interface WizardStep {
  id: string;
  title: string;
  icon: any;
  description: string;
}

// ============= Validation =============

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

export interface StepValidation {
  stepId: string;
  isComplete: boolean;
  validation: ValidationResult;
}

// ============= Size Constraints =============

export interface SizeConstraints {
  minWidth: number;
  maxWidth?: number;
  minHeight: number;
  maxHeight?: number;
  widthLabel: string;
  widthHint: string;
  heightHint: string;
  maxExpandedSize?: number;
  expandedSizeHint?: string;
  maxWidthWithSide?: number;
  widthWithSideHint?: string;
  maxSideWidth?: number;
  sideWidthHint?: string;
}

// ============= Post Processing =============

export interface PostProcessingOption {
  id: string;
  name: string;
  nameJa: string;
  description: string;
  descriptionJa: string;
  price: number;
  category: 'opening' | 'finish' | 'corner' | 'other';
  incompatible?: string[];
  maxQuantity?: number;
}

// ============= Quote Result =============

export interface QuoteBreakdown {
  baseCost: number;
  materialCost: number;
  printingCost: number;
  postProcessingCost: number;
  setupCost: number;
  subtotal: number;
  discount: number;
  tax: number;
  totalPrice: number;
}

export interface QuoteResult {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  breakdown: QuoteBreakdown;
  leadTime: number;
  validUntil: Date;
}

// ============= Multi-Quantity =============

export interface QuantityQuote {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  priceBreak: string;
  discountRate: number;
  minimumPriceApplied: boolean;
}

// ============= Component Props =============

export interface BaseSectionProps {
  className?: string;
  showLabel?: boolean;
  required?: boolean;
}
