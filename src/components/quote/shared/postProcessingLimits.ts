/**
 * Post-processing 5-item limitation system
 * Controls maximum selection and provides enhanced comparative analysis
 */

import type { ProcessingOptionConfig } from './processingConfig'

export const MAX_POST_PROCESSING_ITEMS = 5

export interface PostProcessingLimitState {
  selectedItems: string[]
  isAtLimit: boolean
  remainingSlots: number
  lastSelectedItem?: string
  attemptedSelection?: string
}

export interface PostProcessingComparison {
  items: Array<{
    id: string
    name: string
    nameJa: string
    category: string
    priceMultiplier: number
    processingTime: string
    processingTimeJa: string
    features: string[]
    benefits: string[]
    costImpact: number
    relativeImpact: number
  }>
  totalCostImpact: number
  combinedMultiplier: number
  recommendedPriority: string[]
}

export interface PostProcessingValidationError {
  type: 'limit_exceeded' | 'incompatible_selection' | 'replacement_needed'
  message: string
  messageJa: string
  suggestedAction: string
  suggestedActionJa: string
  itemsToRemove?: string[]
  itemsToAdd?: string[]
}

/**
 * Calculate remaining selection slots
 */
export function calculateRemainingSlots(selectedCount: number): number {
  return Math.max(0, MAX_POST_PROCESSING_ITEMS - selectedCount)
}

/**
 * Check if selection limit is reached
 */
export function isSelectionLimitReached(selectedCount: number): boolean {
  return selectedCount >= MAX_POST_PROCESSING_ITEMS
}

/**
 * Get limit validation error messages
 */
export function getLimitValidationError(
  selectedCount: number,
  attemptedItem?: string
): PostProcessingValidationError {
  const remainingSlots = calculateRemainingSlots(selectedCount)

  return {
    type: 'limit_exceeded',
    message: `Maximum ${MAX_POST_PROCESSING_ITEMS} post-processing options allowed. Please remove an item to add a new one.`,
    messageJa: `後加工オプションは最大${MAX_POST_PROCESSING_ITEMS}個まで選択可能です。新しい項目を追加するには、既存の項目を削除してください。`,
    suggestedAction: remainingSlots === 0
      ? 'Remove an existing selection to add this item'
      : `Only ${remainingSlots} more slot${remainingSlots === 1 ? '' : 's'} available`,
    suggestedActionJa: remainingSlots === 0
      ? '既存の選択を削除してこの項目を追加してください'
      : `残り${remainingSlots}個の選択が可能です`,
    itemsToRemove: [],
    itemsToAdd: attemptedItem ? [attemptedItem] : []
  }
}

/**
 * Generate replacement suggestions when limit is reached
 */
export function generateReplacementSuggestions(
  currentSelection: string[],
  attemptedItem: string,
  allOptions: ProcessingOptionConfig[]
): PostProcessingValidationError {
  // Sort current selection by price impact (lowest price first)
  const sortedSelection = [...currentSelection]
    .map(id => {
      const option = allOptions.find(opt => opt.id === id)
      return {
        id,
        priceImpact: option?.priceMultiplier ?? 1.0,
        option
      }
    })
    .sort((a, b) => a.priceImpact - b.priceImpact)

  const suggestedRemovals = sortedSelection.slice(0, 1).map(item => item.id)
  const attemptedInfo = allOptions.find(opt => opt.id === attemptedItem)

  return {
    type: 'replacement_needed',
    message: `To add "${attemptedInfo?.name || attemptedItem}", consider removing lower priority options.`,
    messageJa: `「${attemptedInfo?.nameJa || attemptedItem}」を追加するには、優先度の低いオプションの削除を検討してください。`,
    suggestedAction: `Replace ${suggestedRemovals.length} item${suggestedRemovals.length === 1 ? '' : 's'} to add this option`,
    suggestedActionJa: `このオプションを追加するために${suggestedRemovals.length}個の項目を交換してください`,
    itemsToRemove: suggestedRemovals,
    itemsToAdd: [attemptedItem]
  }
}

/**
 * Calculate comparative analysis for up to 5 items
 */
export function calculatePostProcessingComparison(
  selectedItems: Array<{
    id: string
    name: string
    nameJa: string
    category: string
    priceMultiplier: number
    processingTime: string
    processingTimeJa: string
    features: string[]
    benefits: string[]
  }>
): PostProcessingComparison {
  const items = selectedItems.map((item, index) => ({
    ...item,
    costImpact: (item.priceMultiplier - 1) * 100, // Percentage increase
    relativeImpact: item.features.length + item.benefits.length
  }))

  const totalCostImpact = items.reduce((sum, item) => sum + item.costImpact, 0)
  const combinedMultiplier = items.reduce((product, item) => product * item.priceMultiplier, 1)

  // Sort by priority (features + benefits)
  const recommendedPriority = items
    .sort((a, b) => b.relativeImpact - a.relativeImpact)
    .map(item => item.id)

  return {
    items,
    totalCostImpact,
    combinedMultiplier,
    recommendedPriority
  }
}

/**
 * Validate selection against business rules
 */
export function validatePostProcessingSelection(
  currentSelection: string[],
  attemptedItem: string,
  allOptions: ProcessingOptionConfig[]
): { isValid: boolean; error?: PostProcessingValidationError } {
  console.log('[validatePostProcessingSelection] Input:', {
    currentSelection,
    attemptedItem,
    allOptionsCount: allOptions.length
  });

  // Check limit
  if (isSelectionLimitReached(currentSelection.length)) {
    console.log('[validatePostProcessingSelection] Limit reached');
    return {
      isValid: false,
      error: generateReplacementSuggestions(currentSelection, attemptedItem, allOptions)
    }
  }

  // Check compatibility (if available)
  const attemptedOption = allOptions.find(opt => opt.id === attemptedItem)
  console.log('[validatePostProcessingSelection] attemptedOption:', attemptedOption);
  if (attemptedOption?.compatibleWith && attemptedOption.compatibleWith.length > 0) {
    const incompatibleItems = currentSelection.filter(selectedId => {
      const selectedOption = allOptions.find(opt => opt.id === selectedId)
      return selectedOption && !attemptedOption.compatibleWith?.includes(selectedOption.id)
    })

    if (incompatibleItems.length > 0) {
      return {
        isValid: false,
        error: {
          type: 'incompatible_selection',
          message: `This option is incompatible with ${incompatibleItems.length} selected item(s).`,
          messageJa: `このオプションは${incompatibleItems.length}個の選択された項目と互換性がありません。`,
          suggestedAction: 'Remove incompatible items to proceed',
          suggestedActionJa: '続行するには互換性のない項目を削除してください',
          itemsToRemove: incompatibleItems,
          itemsToAdd: [attemptedItem]
        }
      }
    }
  }

  // Check same category exclusion (동일 카테고리 상호 배제)
  // 예: glossy와 matte는 같은 surface-treatment 카테고리에 속하므로 하나만 선택 가능
  if (attemptedOption?.category) {
    console.log('[validatePostProcessingSelection] Checking category:', attemptedOption.category);
    const sameCategoryItems = currentSelection.filter(selectedId => {
      const selectedOption = allOptions.find(opt => opt.id === selectedId)
      return selectedOption && selectedOption.category === attemptedOption.category
    })
    console.log('[validatePostProcessingSelection] sameCategoryItems:', sameCategoryItems);

    if (sameCategoryItems.length > 0) {
      const categoryNames: Record<string, string> = {
        'surface-treatment': '表面処理',
        'opening-sealing': '開封/密閉機能',
        'shape-structure': '形状/構造',
        'functionality': '機能性'
      }

      const categoryJa = categoryNames[attemptedOption.category] || attemptedOption.category
      console.log('[validatePostProcessingSelection] Category conflict detected!');

      return {
        isValid: false,
        error: {
          type: 'incompatible_selection',
          message: `This option belongs to the "${attemptedOption.category}" category which is already selected. You can only select one option per category.`,
          messageJa: `このオプションは「${categoryJa}」カテゴリに属しており、すでに同じカテゴリのオプションが選択されています。各カテゴリから1つずつしか選択できません。`,
          suggestedAction: `Remove the existing option from ${attemptedOption.category} category to select this one`,
          suggestedActionJa: `既存の「${categoryJa}」オプションを削除してからこのオプションを選択してください`,
          itemsToRemove: sameCategoryItems,
          itemsToAdd: [attemptedItem]
        }
      }
    }
  }

  console.log('[validatePostProcessingSelection] Validation passed, returning isValid: true');
  return { isValid: true };
}

/**
 * Get visual feedback for selection state
 */
export function getSelectionVisualFeedback(selectedCount: number): {
  color: string
  bgColor: string
  borderColor: string
  status: 'optimal' | 'warning' | 'limit'
  message: string
  messageJa: string
} {
  if (selectedCount === 0) {
    return {
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      status: 'optimal',
      message: 'No items selected',
      messageJa: '選択された項目がありません'
    }
  }

  if (selectedCount < MAX_POST_PROCESSING_ITEMS) {
    return {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      status: 'optimal',
      message: `${selectedCount} of ${MAX_POST_PROCESSING_ITEMS} items selected`,
      messageJa: `${MAX_POST_PROCESSING_ITEMS}個中${selectedCount}個選択済み`
    }
  }

  if (selectedCount === MAX_POST_PROCESSING_ITEMS) {
    return {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      status: 'limit',
      message: `Maximum ${MAX_POST_PROCESSING_ITEMS} items selected`,
      messageJa: `最大${MAX_POST_PROCESSING_ITEMS}個選択済み`
    }
  }

  // This should not happen with proper validation
  return {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    status: 'warning',
    message: 'Selection exceeds limit',
    messageJa: '選択が制限を超えています'
  }
}