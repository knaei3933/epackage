/**
 * Quote Components - Main exports
 *
 * Reorganized structure:
 * - wizards/ - Main wizard components
 * - steps/ - Wizard step components
 * - previews/ - Product preview components
 * - selectors/ - Selection UI components
 * - shared/ - Common utilities, configs, and UI components
 * - sections/ - Individual step sections (legacy, being phased out)
 */

// Wizards
export { QuoteWizard, ImprovedQuotingWizard, UnifiedQuoteSystem, InteractiveQuoteSystem } from './wizards'

// Steps
export { SKUSelectionStep, MultiQuantityStep, UnifiedSKUQuantityStep } from './steps'

// Previews
export { PostProcessingPreview, EnhancedPostProcessingPreview, AdvancedPostProcessingPreview } from './previews'
export { EnvelopePreview, InteractiveProductPreview, MobileOptimizedPreview } from './previews'
export { BeforeAfterPreview, RealTimePreviewEngine, ProcessingPreviewTrigger } from './previews'

// Selectors
export { ProductSelector, ConfigurationPanel } from './selectors'
export { ModernPostProcessingSelector, EnhancedPostProcessingSelector, MobilePostProcessingSelector } from './selectors'
export { PostProcessingSelectionCounter, QuantityOptionsGrid, EnhancedQuantityInput, QuantityPatternManager } from './selectors'
export type { QuantityOption } from './selectors'

// Shared - Config & Utilities
export { processingOptionsConfig, getDefaultPostProcessingOptions, calculatePostProcessingMultiplier } from './shared'
export { getProcessingOptionById, getProcessingOptionsByCategory, validateCategorySelection, PROCESSING_CATEGORIES } from './shared'
export type { ProcessingOptionConfig } from './shared'
export * from './shared/postProcessingLimits'
export * from './shared/previewUtils'
export * from './shared/useKeyboardNavigation'

// Shared - Price & Cost
export { PriceBreakdown, CostBreakdownPanel } from './shared'

// Shared - Summary & Status
export { OrderSummarySection, CurrentStateSummary, StatusIndicator } from './shared'

// Shared - UI Components
export { ResponsiveStepIndicators, KeyboardShortcutsHint, ErrorToast } from './shared'
export { OrderConfirmationModal, DetailedOptionModal, BankInfoCard, InvoiceDownloadButton, DataImportStatusPanel } from './shared'
export { DataTemplateGuide } from './shared'

// Shared - Analytics & Recommendations
export { QuantityEfficiencyChart, MultiQuantityComparisonTable, ParallelProductionOptions } from './shared'
export { EconomicQuantityProposal, OptimalQuantityRecommender } from './shared'
export type { ParallelProductionOption, EconomicQuantitySuggestionData } from './shared'

// Shared - Post-Processing Systems
export { PostProcessingGroups, NextGenPostProcessingSystem, RedesignedPostProcessingWorkflow } from './shared'
export { PostProcessingCostImpact, PostProcessingItemReplacement, PostProcessingComparisonTable } from './shared'
export { PostProcessingExport, SmartRecommendations, AIRecommendationEngine, UserExperienceEnhancements } from './shared'
