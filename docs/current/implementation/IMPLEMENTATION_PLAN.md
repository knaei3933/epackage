# Brixa Pricing Engine Implementation Plan

## Overview
This document outlines the implementation of the Brixa-compatible pricing engine within the `epackage-lab-web` project. The engine has been reverse-engineered from the Brixa simulation site and implemented in `src/lib/pricing/PriceCalculationEngine.ts`.

## Current Status
- **Core Engine**: Implemented (`src/lib/pricing_new/engine.ts`).
- **Pricing Logic**:
  - **Fixed Setup Cost**: Differentiated by bag type (Flat: 22,800 JPY, Standing: 194,600 JPY).
  - **Variable Cost**: Material Area * Rate + Processing Fee.
  - **Surcharges**: Small lot surcharge (103,000 JPY) for < 3000 units (Flat Bags).
  - **UV Printing**: Implemented as a separate cost structure (Fixed: 77,800 JPY, Surcharge: 13,000 JPY).
- **Verification**:
  - Validated via `scripts/test-pricing-logic-standalone.js`.
  - Logic matches Brixa's output for tested scenarios.

## Key Components

### 1. PriceCalculationEngine
Located at `src/lib/pricing/PriceCalculationEngine.ts`.
- Handles the full calculation workflow.
- Separates Per-Unit (Material, Ink, Features) and Per-Order (Setup, Plate, Labor) costs.
- Applies margins and discounts.

### 2. Types
Located at `src/lib/pricing/types.ts`.
- Defines `QuotePatternSpecification`, `PriceBreakdown`, etc.
- Uses `number` for currency (Prisma `Decimal` removed for compatibility).

### 3. Configuration
Constants are currently hardcoded in `PriceCalculationEngine.ts` based on reverse engineering:
```typescript
    FIXED_SETUP_COST: 103800,
    MATERIAL_RATE_PER_MM2: 0.00051,
    OPTION_ZIPPER_COST: 10.0,
```

## Next Steps

### Phase 1: Database Integration (TODO)
- Move hardcoded constants to a database configuration table.
- Implement `getBagTypePricing`, `getMaterialPricing` to fetch from DB instead of mocks.

### Phase 2: Frontend Integration (DONE)
- Implemented `SmartQuotePage` at `/smart-quote`.
- Connected `PricingEngine` directly to the frontend component.
- Updated Homepage to link to the new quoting page.

### Phase 3: Refinement (IN PROGRESS)
- Resolve dev server dependency issues (`baseline-browser-mapping`).
- Conduct User Acceptance Testing (UAT) for the full quoting flow.

## Usage Example
```typescript
import { PriceCalculationEngine } from '@/lib/pricing/PriceCalculationEngine'

const engine = new PriceCalculationEngine()
const result = await engine.calculatePrice({
  pattern: myPattern,
  userTier: 'basic',
  isRepeatOrder: false
})
console.log(result.priceBreakdown.totalPrice)
```
