/**
 * useSpecsValidation Hook
 *
 * Extracted validation logic for specs step
 * 仕様ステップのバリデーションロジックを抽出
 */

import { useMemo, useCallback } from 'react';
import { useQuoteState } from '@/contexts/QuoteContext';
import { validateHeight as validateHeightUtil } from '@/types/quote-wizard';

export interface SpecsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SizeValidation {
  width: string;
  height: string;
  depth: string;
}

/**
 * Hook for validating specs step
 */
export function useSpecsValidation() {
  const state = useQuoteState();

  /**
   * Validate width
   */
  const validateWidth = useCallback((): string => {
    if (!state.width || state.width < 50) {
      return '幅は50mm以上で指定してください';
    }
    return '';
  }, [state.width]);

  /**
   * Validate height using utility function
   */
  const validateHeight = useCallback((): string => {
    if (!state.height || state.height < 50) {
      return '高さは50mm以上で指定してください';
    }

    const error = validateHeightUtil(state.height, state.bagTypeId, state.width, state.depth);
    if (error) {
      return error;
    }

    return '';
  }, [state.height, state.bagTypeId, state.width, state.depth]);

  /**
   * Validate depth (gusset)
   */
  const validateDepth = useCallback((): string => {
    const needsDepth = state.bagTypeId !== 'flat_3_side' && state.bagTypeId !== 'roll_film';
    if (needsDepth && (state.depth === undefined || state.depth < 0)) {
      return 'マチを指定してください';
    }
    return '';
  }, [state.bagTypeId, state.depth]);

  /**
   * Validate material selection
   */
  const validateMaterial = useCallback((): string => {
    if (!state.materialId) {
      return '素材を選択してください';
    }
    return '';
  }, [state.materialId]);

  /**
   * Validate thickness selection
   */
  const validateThickness = useCallback((): string => {
    const materialsRequiringThickness = ['pet_al', 'pet_vmpet', 'pet_ldpe', 'pet_ny_al', 'ny_lldpe', 'kraft_vmpet_lldpe', 'kraft_pet_lldpe'];
    if (materialsRequiringThickness.includes(state.materialId) && !state.thicknessSelection) {
      return '厚さを選択してください';
    }
    return '';
  }, [state.materialId, state.thicknessSelection]);

  /**
   * Get all size validation errors
   */
  const sizeValidation = useMemo<SizeValidation>(() => ({
    width: validateWidth(),
    height: validateHeight(),
    depth: validateDepth()
  }), [validateWidth, validateHeight, validateDepth]);

  /**
   * Get complete validation result
   */
  const validationResult = useMemo<SpecsValidationResult>(() => {
    const errors = [
      validateWidth(),
      validateHeight(),
      validateDepth(),
      validateMaterial(),
      validateThickness()
    ].filter(Boolean);

    return {
      isValid: errors.length === 0,
      errors,
      warnings: []
    };
  }, [validateWidth, validateHeight, validateDepth, validateMaterial, validateThickness]);

  /**
   * Check if specs step is complete
   */
  const isSpecsComplete = useMemo(() => {
    return validationResult.isValid;
  }, [validationResult.isValid]);

  return {
    validationResult,
    sizeValidation,
    isSpecsComplete,
    validateWidth,
    validateHeight,
    validateDepth,
    validateMaterial,
    validateThickness
  };
}
