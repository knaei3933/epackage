/**
 * useQuoteValidation Hook
 *
 * Extracts validation logic from ImprovedQuotingWizard component.
 * Provides step completion validation and field-level validation.
 */

import { useMemo, useCallback } from 'react';
import { useQuoteState } from '@/contexts/QuoteContext';
import { checkStepComplete, getPostProcessingLimitStatusForState } from '@/contexts/QuoteContext';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StepValidation {
  stepId: string;
  isComplete: boolean;
  validation: ValidationResult;
}

export interface QuoteValidationState {
  specs: StepValidation;
  quantity: StepValidation;
  postProcessing: StepValidation;
  delivery: StepValidation;
  allStepsValid: boolean;
}

/**
 * Hook for validating quote state and step completion
 */
export function useQuoteValidation() {
  const state = useQuoteState();

  /**
   * Validate basic specifications (specs step)
   */
  const validateSpecs = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!state.bagTypeId) {
      errors.push('袋タイプを選択してください');
    }

    if (!state.materialId) {
      errors.push('素材を選択してください');
    }

    // Size validation
    if (!state.width || state.width < 50) {
      errors.push('幅は50mm以上で指定してください');
    }

    if (!state.height || state.height < 50) {
      errors.push('高さは50mm以上で指定してください');
    }

    // Depth is only required for certain bag types
    const needsDepth = state.bagTypeId !== 'flat_3_side' && state.bagTypeId !== 'roll_film';
    if (needsDepth && (state.depth === undefined || state.depth < 0)) {
      errors.push('マチを指定してください');
    }

    // Thickness validation for certain materials
    const materialsRequiringThickness = ['pet_al', 'pet_vmpet', 'pet_ldpe', 'pet_ny_al'];
    if (materialsRequiringThickness.includes(state.materialId) && !state.thicknessSelection) {
      errors.push('厚さを選択してください');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [state.bagTypeId, state.materialId, state.width, state.height, state.depth, state.thicknessSelection]);

  /**
   * Validate quantity and printing (quantity step)
   */
  const validateQuantity = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if at least one quantity is specified
    if (!state.quantity || state.quantity <= 0) {
      errors.push('数量を指定してください');
    }

    // Multi-quantity validation
    if (state.quantities.length === 0) {
      errors.push('少なくとも1つの数量を指定してください');
    }

    // Check for duplicate quantities
    const uniqueQuantities = new Set(state.quantities);
    if (uniqueQuantities.size !== state.quantities.length) {
      warnings.push('重複する数量があります');
    }

    // Printing options validation
    if (state.isUVPrinting && state.printingColors === 0) {
      errors.push('UV印刷を選択する場合は印刷色数を指定してください');
    }

    // Check for reasonable printing color range
    if (state.printingColors !== undefined && (state.printingColors < 0 || state.printingColors > 12)) {
      errors.push('印刷色数は0〜12の範囲で指定してください');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [state.quantity, state.quantities, state.isUVPrinting, state.printingColors]);

  /**
   * Validate post-processing options
   */
  const validatePostProcessing = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const limitStatus = getPostProcessingLimitStatusForState(state);

    // Check if too many post-processing options are selected
    if (limitStatus.isAtLimit && limitStatus.remainingSlots === 0) {
      warnings.push(`後加工オプションは最大${limitStatus.selectedItems.length}個までです`);
    }

    // Validate mutually exclusive options
    const zipperOptions = state.postProcessingOptions?.filter(id => id.startsWith('zipper-')) || [];
    if (zipperOptions.length > 1) {
      errors.push('ジッパーのオプションは1つのみ選択できます');
    }

    const finishOptions = state.postProcessingOptions?.filter(id => id === 'glossy' || id === 'matte') || [];
    if (finishOptions.length > 1) {
      errors.push('光沢仕上げとマット仕上げは同時に選択できません');
    }

    const cornerOptions = state.postProcessingOptions?.filter(id => id.startsWith('corner-')) || [];
    if (cornerOptions.length > 1) {
      errors.push('角丸と角直角は同時に選択できません');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [state.postProcessingOptions]);

  /**
   * Validate delivery options
   */
  const validateDelivery = useCallback((): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!state.deliveryLocation) {
      errors.push('配送先を選択してください');
    }

    if (!state.urgency) {
      errors.push('納期を選択してください');
    }

    // Warn about express delivery
    if (state.urgency === 'express' && state.quantity > 10000) {
      warnings.push('大口注文の特急納期には別途お見積もりが必要な場合があります');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [state.deliveryLocation, state.urgency, state.quantity]);

  /**
   * Get validation for all steps
   */
  const stepValidations = useMemo<QuoteValidationState>(() => {
    const specsValidation = validateSpecs();
    const quantityValidation = validateQuantity();
    const postProcessingValidation = validatePostProcessing();
    const deliveryValidation = validateDelivery();

    return {
      specs: {
        stepId: 'specs',
        isComplete: checkStepComplete(state, 'specs'),
        validation: specsValidation
      },
      quantity: {
        stepId: 'quantity',
        isComplete: checkStepComplete(state, 'quantity'),
        validation: quantityValidation
      },
      postProcessing: {
        stepId: 'post-processing',
        isComplete: checkStepComplete(state, 'post-processing'),
        validation: postProcessingValidation
      },
      delivery: {
        stepId: 'delivery',
        isComplete: checkStepComplete(state, 'delivery'),
        validation: deliveryValidation
      },
      allStepsValid: [
        specsValidation.isValid,
        quantityValidation.isValid,
        postProcessingValidation.isValid,
        deliveryValidation.isValid
      ].every(Boolean)
    };
  }, [
    state,
    validateSpecs,
    validateQuantity,
    validatePostProcessing,
    validateDelivery
  ]);

  /**
   * Check if a specific step is valid
   */
  const isStepValid = useCallback((stepId: string): boolean => {
    switch (stepId) {
      case 'specs':
        return stepValidations.specs.validation.isValid;
      case 'quantity':
        return stepValidations.quantity.validation.isValid;
      case 'post-processing':
        return stepValidations.postProcessing.validation.isValid;
      case 'delivery':
        return stepValidations.delivery.validation.isValid;
      default:
        return false;
    }
  }, [stepValidations]);

  /**
   * Check if a specific step is complete
   */
  const isStepComplete = useCallback((stepId: string): boolean => {
    return checkStepComplete(state, stepId);
  }, [state]);

  /**
   * Get errors for a specific step
   */
  const getStepErrors = useCallback((stepId: string): string[] => {
    switch (stepId) {
      case 'specs':
        return stepValidations.specs.validation.errors;
      case 'quantity':
        return stepValidations.quantity.validation.errors;
      case 'post-processing':
        return stepValidations.postProcessing.validation.errors;
      case 'delivery':
        return stepValidations.delivery.validation.errors;
      default:
        return [];
    }
  }, [stepValidations]);

  /**
   * Get warnings for a specific step
   */
  const getStepWarnings = useCallback((stepId: string): string[] => {
    switch (stepId) {
      case 'specs':
        return stepValidations.specs.validation.warnings;
      case 'quantity':
        return stepValidations.quantity.validation.warnings;
      case 'post-processing':
        return stepValidations.postProcessing.validation.warnings;
      case 'delivery':
        return stepValidations.delivery.validation.warnings;
      default:
        return [];
    }
  }, [stepValidations]);

  return {
    stepValidations,
    isStepValid,
    isStepComplete,
    getStepErrors,
    getStepWarnings,
    validateSpecs,
    validateQuantity,
    validatePostProcessing,
    validateDelivery
  };
}
