<!-- Parent: ../AGENTS.md -->
# src/components/quote/ Directory

## Purpose

Quote wizard and quotation system components for Epackage Lab's B2B packaging platform. This is the largest component module (40+ files) handling the complete quotation workflow from product specification to price calculation and PDF generation.

## Key Files

### Core Wizard Components
- **ImprovedQuotingWizard.tsx** - Main quote wizard orchestrator (43,000+ tokens, multi-step form)
- **UnifiedQuoteSystem.tsx** - Unified quote system with step-by-step workflow
- **QuoteWizard.tsx** - Alternative wizard implementation
- **InteractiveQuoteSystem.tsx** - Interactive drag-and-drop quote interface

### Step Components (sections/ subdirectory)
- **sections/SizeSpecification.tsx** - Bag dimension inputs (width, height, depth, sideWidth)
- **sections/PostProcessingStep.tsx** - Post-processing options selection with category constraints
- **sections/DeliveryStep.tsx** - Delivery address and options
- **sections/ResultStep.tsx** - Final quote results with PDF generation

### Selection Components
- **SKUSelectionStep.tsx** - SKU selection for multi-product quotes
- **MultiQuantityStep.tsx** - Multi-quantity input with comparison
- **UnifiedSKUQuantityStep.tsx** - Combined SKU/quantity selection
- **ConfigurationPanel.tsx** - Configuration options panel

### Post-Processing Components
- **EnhancedPostProcessingPreview.tsx** - Enhanced post-processing selector with filters
- **EnhancedPostProcessingSelector.tsx** - Advanced selection interface
- **PostProcessingGroups.tsx** - Grouped options by category
- **PostProcessingComparisonTable.tsx** - Comparison view for options
- **MobilePostProcessingSelector.tsx** - Mobile-optimized selector
- **processingConfig.ts** - Configuration for 30+ post-processing options

### Preview Components
- **RealTimePreviewEngine.tsx** - Real-time 3D preview with animations
- **EnvelopePreview.tsx** - Envelope visualization
- **MobileOptimizedPreview.tsx** - Mobile preview component
- **BeforeAfterPreview.tsx** - Before/after comparison
- **InteractiveProductPreview.tsx** - Interactive product preview

### Results & Analysis
- **PriceBreakdown.tsx** - Detailed cost breakdown
- **OrderSummarySection.tsx** - Order summary display
- **MultiQuantityComparisonTable.tsx** - Quantity comparison table
- **QuantityEfficiencyChart.tsx** - Visual efficiency analysis
- **EconomicQuantityProposal.tsx** - Optimal quantity recommendations
- **OptimalQuantityRecommender.tsx** - AI-powered quantity suggestions

### Utility Components
- **ErrorToast.tsx** - Error handling UI
- **BankInfoCard.tsx** - Payment information display
- **InvoiceDownloadButton.tsx** - Invoice PDF generation
- **DataImportStatusPanel.tsx** - Data import status
- **KeyboardShortcutsHint.tsx** - Keyboard shortcut hints
- **StatusIndicator.tsx** - Status display component
- **CurrentStateSummary.tsx** - Current state summary

## Directory Structure

```
quote/
├── sections/                    # Wizard step components
│   ├── SizeSpecification.tsx
│   ├── PostProcessingStep.tsx
│   ├── DeliveryStep.tsx
│   ├── ResultStep.tsx
│   ├── BasicInfoSection.tsx
│   └── MaterialSelection.tsx
├── __tests__/                   # Component tests
│   ├── BankInfoCard.test.tsx
│   ├── EnhancedPostProcessingPreview.test.tsx
│   └── MultiQuantityComparisonTable.test.tsx
├── ImprovedQuotingWizard.tsx    # Main wizard (43K+ tokens)
├── UnifiedQuoteSystem.tsx       # Unified system
├── processingConfig.ts          # Post-processing config
├── useKeyboardNavigation.ts     # Keyboard hook
└── [40+ other components]
```

## For AI Agents

### Quote Wizard Architecture

The quote system follows a multi-step wizard pattern:

```
Step 1: SizeSpecification
  - Bag type selection (flat_3_side, stand_up, box, spout_pouch, roll_film)
  - Dimensions: width, height, depth (gusset), sideWidth
  - Roll film: pitch, totalLength, rollCount

Step 2: Contents & Material
  - Product category (food, health_supplement, cosmetic, etc.)
  - Contents type (solid, powder, liquid)
  - Main ingredient classification
  - Distribution environment
  - Material selection with thickness options

Step 3: Post-Processing
  - Category-constrained selection (MAX 3 items total)
  - Categories: opening-sealing, surface-treatment, shape-structure, functionality
  - Zipper variants (5mm, 7.5mm, 10mm seal width)
  - Finish options (matte, glossy)
  - Shape modifications (round/square corners, notches, holes)

Step 4: Delivery
  - Delivery address form
  - Domestic/international options

Step 5: Results
  - Price calculation with multi-quantity comparison
  - PDF generation (spec sheet, quotation)
  - Minimum price policy (160,000 JPY)
```

### State Management

**QuoteContext** (`@/contexts/QuoteContext.tsx`):
- Global quote state with reducer pattern
- Handles bag type, material, dimensions, quantities
- Post-processing options with validation
- Roll film specific fields (pitch, length, roll count)
- SKU mode support (1-100 SKUs)

**Key State Fields**:
```typescript
interface QuoteState {
  bagTypeId: string
  materialId: string
  width, height, depth, sideWidth?: number
  quantities: number[]
  postProcessingOptions: string[]
  postProcessingMultiplier: number
  quantityMode: 'single' | 'sku'
  skuCount: number
  skuQuantities: number[]
  // Roll film
  pitch?: number
  totalLength?: number
  rollCount?: number
  materialWidth?: number
  // Contents
  productCategory?: string
  contentsType?: string
  mainIngredient?: string
  distributionEnvironment?: string
}
```

### Pricing Logic

**useQuoteCalculation** (`@/hooks/quote/useQuoteCalculation.ts`):
- Debounced price calculations
- Multi-quantity comparison
- Lead time estimates
- Minimum price policy enforcement

**unifiedPricingEngine** (`@/lib/unified-pricing-engine.ts`):
- Central pricing calculation
- Material multipliers
- Post-processing costs
- Quantity discount tiers (500, 1K, 3K, 5K, 10K, 20K, 50K)
- Ceiling rounding to 100 JPY

### Post-Processing System

**Category Constraints** (`processingConfig.ts`):
```typescript
type PostProcessingCategory =
  | 'opening-sealing'    // Zipper, valve
  | 'surface-treatment'  // Matte, glossy
  | 'shape-structure'    // Corners, notches, holes
  | 'functionality'      // Hang holes, etc.

// MAX 3 items total
// At most 1 per category (except shape-structure allows 2)
// Default values auto-selected per category
```

**Post-Processing Options** (30+ options):
- **Zipper**: zipper-no, zipper-yes (with 5mm/7.5mm/10mm seal width)
- **Finish**: matte-finish, glossy-finish
- **Corners**: round-corner, square-corner
- **Notch**: straight-notch, v-notch
- **Holes**: hole-punching, hang-hole
- **Valve**: valve-yes, valve-no
- **Opening**: top-opening, bottom-opening

### Component Patterns

**Form Handling**:
- react-hook-form for validation
- zod schemas for type-safe validation
- Controlled inputs with real-time updates

**Styling**:
- Tailwind CSS with custom variants
- Consistent spacing: `space-y-4`, `gap-4`
- Color tokens: `brixa-*`, `navy-*`
- Responsive: `md:`, `lg:` breakpoints

**Internationalization**:
- Japanese as primary language
- `nameJa`, `descriptionJa` fields
- Constants in `@/constants/enToJa.ts`

**Animation**:
- framer-motion for transitions
- MotionWrapper wrapper component
- AnimatePresence for step transitions

### Common Dependencies

```typescript
// UI Components
import { Button, Card, Modal } from '@/components/ui'
import { Badge } from '@/components/ui/Badge'

// Contexts
import { useQuoteState } from '@/contexts/QuoteContext'
import { useMultiQuantityQuote } from '@/contexts/MultiQuantityQuoteContext'

// Hooks
import { useQuoteCalculation } from '@/hooks/quote/useQuoteCalculation'

// Config
import { processingOptionsConfig } from './processingConfig'
import { getDefaultPostProcessingOptions } from './processingConfig'

// Types
import type { ProcessingOptionConfig } from './processingConfig'
import type { QuoteState } from '@/contexts/QuoteContext'
```

### Key Validation Rules

**Quantity Validation**:
- Minimum 500 pieces per quantity
- Maximum 100 SKUs
- Total quantity: 500-1,000,000

**Size Validation**:
- Width: 30-600mm
- Height: 30-800mm
- Depth (gusset): 0-300mm
- Side width (box/center seal): 10-100mm
- Roll film pitch: 0-1000mm

**Post-Processing Limits**:
- Maximum 3 items total
- Maximum 1 item per category (except shape-structure: 2)
- Category mutual exclusivity enforced

### Roll Film Special Handling

Roll film has unique fields and logic:
- **pitch**: Design repeat period (mm)
- **totalLength**: Total length (m)
- **rollCount**: Number of rolls
- **materialWidth**: Film width (540mm or 740mm)
- **distributedQuantities**: Auto-calculated per-roll lengths
- **2-column production**: Option to double quantity at same unit price

### Working with Quote Components

**When adding new post-processing options**:
1. Add to `processingConfig.ts` with proper categorization
2. Add images to `/public/images/post-processing/`
3. Set `isDefault: true` for category defaults
4. Update `postProcessingLimits.ts` if needed

**When modifying pricing logic**:
- Update `unifiedPricingEngine.ts` for calculations
- Update `useQuoteCalculation.ts` for hook logic
- Verify ceiling rounding (100 JPY units)
- Test minimum price policy (160,000 JPY)

**When adding wizard steps**:
1. Create component in `sections/`
2. Add step number to wizard
3. Update validation schema
4. Add navigation (Next/Back)
5. Update progress indicators

## Dependencies

### Internal
- `@/contexts/QuoteContext.tsx` - Global quote state
- `@/contexts/MultiQuantityQuoteContext.tsx` - Multi-quantity context
- `@/hooks/quote/useQuoteCalculation.ts` - Pricing calculations
- `@/lib/unified-pricing-engine.ts` - Central pricing logic
- `@/lib/film-cost-calculator.ts` - Film cost calculations
- `@/lib/material-width-selector.ts` - Material width logic
- `@/lib/gusset-data.ts` - Gusset size validation
- `@/lib/pdf-generator.ts` - PDF generation
- `@/lib/excel/excelDataMapper.ts` - Excel export
- `@/constants/enToJa.ts` - Translation constants
- `@/types/` - Type definitions

### External
- `react` - React core
- `react-hook-form` - Form handling
- `@hookform/resolvers` - Form validation resolvers
- `zod` - Schema validation
- `framer-motion` - Animations
- `lucide-react` - Icons
- `recharts` - Charts (QuantityEfficiencyChart)
- `jspdf` - PDF generation

## Related Files

- **../../contexts/QuoteContext.tsx** - Quote state management
- **../../hooks/quote/useQuoteCalculation.ts** - Calculation hook
- **../../lib/unified-pricing-engine.ts** - Pricing engine
- **../../lib/pdf-generator.ts** - PDF generation
- **../../constants/enToJa.ts** - Japanese translations
- **../../app/quote-simulator/page.tsx** - Quote simulator page
- **../../app/member/quotations/** - Member quotation pages
