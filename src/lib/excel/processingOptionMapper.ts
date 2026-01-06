/**
 * Processing Option Mapper
 * Maps database processing options to Excel quotation format
 */

import { ProcessingOptionConfig } from '@/components/quote/processingConfig'
import { OptionalProcessing, ProcessingOptionMapping } from './excelQuotationTypes'

// ============================================================
// Option Mapping Configuration
// ============================================================

/**
 * Maps database processing option IDs to Excel quotation options
 * 8 options total in the format: チャック (zipper), ノッチ (notch), etc.
 */
export const PROCESSING_OPTION_MAP: ProcessingOptionMapping[] = [
  // 1. Zipper (チャック)
  {
    dbOptionId: 'zipper-yes',
    excelOptionKey: 'ziplock',
    displayName: 'チャック',
    displayValue: (enabled: boolean) => enabled ? '○' : '-'
  },

  // 2. Notch (ノッチ)
  {
    dbOptionId: 'notch-yes',
    excelOptionKey: 'notch',
    displayName: 'ノッチ',
    displayValue: (enabled: boolean) => enabled ? '○' : '-'
  },

  // 3. Hanging Hole (吊り下げ穴)
  {
    dbOptionId: 'hang-hole-6mm',
    excelOptionKey: 'hangingHole',
    displayName: '吊り下げ穴',
    displayValue: (enabled: boolean) => enabled ? '○' : '-'
  },

  // 4. Corner Round (角加工)
  {
    dbOptionId: 'corner-round',
    excelOptionKey: 'cornerRound',
    displayName: '角加工',
    displayValue: (enabled: boolean) => enabled ? '○' : '-'
  },

  // 5. Gas Vent Valve (ガス抜きバルブ)
  {
    dbOptionId: 'valve-yes',
    excelOptionKey: 'gasVent',
    displayName: 'ガス抜きバルブ',
    displayValue: (enabled: boolean) => enabled ? '○' : '-'
  },

  // 6. Easy Cut (Easy Cut)
  {
    dbOptionId: 'tear-notch',
    excelOptionKey: 'easyCut',
    displayName: 'Easy Cut',
    displayValue: (enabled: boolean) => enabled ? '○' : '-'
  },

  // 7. Die Cut/Embossing (型抜き)
  {
    dbOptionId: 'die-cut-window',
    excelOptionKey: 'embossing',
    displayName: '型抜き',
    displayValue: (enabled: boolean) => enabled ? '○' : '-'
  }
]

// ============================================================
// Mapping Functions
// ============================================================

/**
 * Convert database processing option IDs to Excel format
 * @param selectedOptionIds - Array of selected processing option IDs from database
 * @returns OptionalProcessing object compatible with Excel template
 */
export function mapProcessingOptionsToExcel(
  selectedOptionIds: string[]
): OptionalProcessing {
  const result: OptionalProcessing = {
    ziplock: false,
    notch: false,
    hangingHole: false,
    cornerRound: false,
    gasVent: false,
    easyCut: false,
    embossing: false
  }

  // Map each selected option
  selectedOptionIds.forEach(optionId => {
    const mapping = PROCESSING_OPTION_MAP.find(
      map => optionId.includes(map.dbOptionId) || map.dbOptionId.includes(optionId)
    )

    if (mapping) {
      result[mapping.excelOptionKey] = true
    }
  })

  return result
}

/**
 * Convert Excel processing options to display format
 * @param options - OptionalProcessing object
 * @returns Array of {name, value} pairs for Excel display
 */
export function formatProcessingOptionsForDisplay(
  options: OptionalProcessing
): Array<{ name: string; value: string }> {
  return PROCESSING_OPTION_MAP.map(mapping => {
    const enabled = options[mapping.excelOptionKey] || false
    return {
      name: mapping.displayName,
      value: mapping.displayValue(enabled)
    }
  })
}

/**
 * Get processing option details by database ID
 * @param optionId - Database option ID
 * @returns Processing option mapping or undefined
 */
export function getProcessingOptionMapping(
  optionId: string
): ProcessingOptionMapping | undefined {
  return PROCESSING_OPTION_MAP.find(
    map => optionId.includes(map.dbOptionId) || map.dbOptionId.includes(optionId)
  )
}

/**
 * Check if a specific processing option is enabled
 * @param options - OptionalProcessing object
 * @param optionKey - Key to check
 * @returns Boolean indicating if option is enabled
 */
export function isProcessingOptionEnabled(
  options: OptionalProcessing,
  optionKey: keyof OptionalProcessing
): boolean {
  return options[optionKey] === true
}

/**
 * Get all enabled processing options
 * @param options - OptionalProcessing object
 * @returns Array of enabled option mappings
 */
export function getEnabledProcessingOptions(
  options: OptionalProcessing
): ProcessingOptionMapping[] {
  return PROCESSING_OPTION_MAP.filter(mapping => {
    return options[mapping.excelOptionKey] === true
  })
}

/**
 * Get count of enabled processing options
 * @param options - OptionalProcessing object
 * @returns Number of enabled options
 */
export function getProcessingOptionsCount(options: OptionalProcessing): number {
  return Object.values(options).filter(Boolean).length
}

// ============================================================
// Price Impact Calculator
// ============================================================

/**
 * Calculate total price multiplier from processing options
 * @param selectedOptionIds - Array of selected processing option IDs
 * @param allProcessingOptions - All available processing option configs
 * @returns Total multiplier and details
 */
export function calculateProcessingPriceImpact(
  selectedOptionIds: string[],
  allProcessingOptions: ProcessingOptionConfig[]
): {
  totalMultiplier: number
  breakdown: Array<{
    optionId: string
    name: string
    nameJa: string
    multiplier: number
  }>
  processingTime: string
  minimumQuantity: number
} {
  const breakdown = selectedOptionIds.map(optionId => {
    const option = allProcessingOptions.find(opt => opt.id === optionId)
    return {
      optionId,
      name: option?.name || 'Unknown',
      nameJa: option?.nameJa || '不明',
      multiplier: option?.priceMultiplier || 1.0
    }
  })

  const totalMultiplier = breakdown.reduce(
    (product, item) => product * item.multiplier,
    1.0
  )

  // Get maximum processing time and minimum quantity
  const maxProcessingDays = Math.max(
    ...selectedOptionIds.map(id => {
      const option = allProcessingOptions.find(opt => opt.id === id)
      const match = option?.processingTime.match(/\d+/)
      return match ? parseInt(match[0]) : 0
    }),
    0
  )

  const maxMinimumQuantity = Math.max(
    ...selectedOptionIds.map(id => {
      const option = allProcessingOptions.find(opt => opt.id === id)
      return option?.minimumQuantity || 500
    }),
    500
  )

  return {
    totalMultiplier: Math.round(totalMultiplier * 1000) / 1000,
    breakdown,
    processingTime: maxProcessingDays > 0
      ? `+${maxProcessingDays} business days`
      : 'Standard production time',
    minimumQuantity: maxMinimumQuantity
  }
}

// ============================================================
// Format Converters
// ============================================================

/**
 * Convert processing options to Japanese text description
 * @param options - OptionalProcessing object
 * @returns Japanese description string
 */
export function formatProcessingOptionsJapanese(
  options: OptionalProcessing
): string {
  const enabledOptions = getEnabledProcessingOptions(options)
  const names = enabledOptions.map(map => map.displayName)
  return names.length > 0 ? names.join('、') : 'なし'
}

/**
 * Convert processing options to English description
 * @param options - OptionalProcessing object
 * @returns English description string
 */
export function formatProcessingOptionsEnglish(
  options: OptionalProcessing
): string {
  const enabledOptions = getEnabledProcessingOptions(options)

  const englishMap: Record<string, string> = {
    ziplock: 'Zipper',
    notch: 'Notch',
    hangingHole: 'Hang Hole',
    cornerRound: 'Corner Round',
    gasVent: 'Gas Vent',
    easyCut: 'Easy Cut',
    embossing: 'Die Cut'
  }

  const names = enabledOptions.map(
    map => englishMap[map.excelOptionKey] || map.displayName
  )

  return names.length > 0 ? names.join(', ') : 'None'
}

// ============================================================
// Validation
// ============================================================

/**
 * Validate processing option compatibility
 * @param selectedOptionIds - Array of selected option IDs
 * @param allProcessingOptions - All available processing configs
 * @returns Validation result with conflicts
 */
export function validateProcessingOptionsCompatibility(
  selectedOptionIds: string[],
  allProcessingOptions: ProcessingOptionConfig[]
): {
  valid: boolean
  conflicts: Array<{
    option1: string
    option2: string
    reason: string
  }>
} {
  const conflicts: Array<{ option1: string; option2: string; reason: string }> = []

  // Check for conflicting options
  // Example: Can't have both zipper-yes and zipper-no
  const zipperOptions = selectedOptionIds.filter(id => id.includes('zipper'))
  if (zipperOptions.length > 1) {
    conflicts.push({
      option1: zipperOptions[0],
      option2: zipperOptions[1],
      reason: 'Cannot select multiple zipper options'
    })
  }

  return {
    valid: conflicts.length === 0,
    conflicts
  }
}

/**
 * Ensure at least one processing option is selected if required
 * @param options - OptionalProcessing object
 * @param requireAtLeastOne - Whether at least one option is required
 * @returns Validation result
 */
export function validateProcessingOptionsRequired(
  options: OptionalProcessing,
  requireAtLeastOne: boolean = false
): {
  valid: boolean
  message?: string
} {
  const count = getProcessingOptionsCount(options)

  if (requireAtLeastOne && count === 0) {
    return {
      valid: false,
      message: 'At least one processing option is required'
    }
  }

  return { valid: true }
}
