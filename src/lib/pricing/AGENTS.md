# Pricing Engine Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

Pricing calculation engine for flexible packaging materials. Implements reverse-engineered Brixa pricing logic with support for multiple bag types, materials, printing options, and volume-based discounts.

## Directory Structure

```
pricing/
├── PriceCalculationEngine.ts    # Main calculation engine (NEW)
├── test-engine.ts                # Test utilities
└── AGENTS.md                     # This file
```

## Related Files (Parent Directory)

- `../pricing.ts` - Legacy pricing interface (deprecated)
- `../pricing-engine.ts` - Legacy PricingEngine class
- `../pricing_new/` - New pricing implementation (parallel)
- `../pricing_new/types.ts` - Type definitions
- `../pricing_new/engine.ts` - New engine implementation
- `../pricing_new/constants.ts` - Cost constants

## Key Components

### PriceCalculationEngine.ts

Main calculation class with caching and validation:

**Core Formula:**
```
Unit Price = (Base - VolumeDiscount - UserDiscount) + (SetupFee / Quantity)
Total Price = Unit Price * Quantity
```

**Base Price Components:**
- Bag Type Base Price (stand_up: 8.0, gusset: 15.0)
- Material Cost = BaseProcessingFee + (Area * MaterialRate)
- Printing Cost (per unit ink cost only)
- Feature Cost (zipper, corner cut, notch)

**Fixed Costs:**
- Fixed Setup Cost: 150,000 JPY
- Small Lot Surcharge: 0 (disabled)
- UV Printing Fixed: 77,800 JPY
- UV Printing Surcharge: 13,000 JPY (qty < 3000)

**Variable Costs:**
- Base Processing Fee: 0 JPY
- Material Rate: 0.0015 JPY/mm² (OPP+Al/Matte)
- Flat Processing Fee: 27.9 JPY/unit
- Standing Processing Fee: 26.4 JPY/unit

**Feature Costs (per unit):**
- Notch: 4.6 JPY
- Corner Cut: 4.6 JPY
- Zipper: 10.0 JPY

### Material Rates (from constants.ts)

| Material | Rate (JPY/mm²) |
|----------|----------------|
| OPP_Alu | 0.00051 |
| Kraft_PE | 0.00035 |
| Alu_Vapor | 0.00021 |
| PET | 0.00015 |

### Volume Discount Tiers

| Quantity | Discount Rate | Efficiency Factor |
|----------|---------------|-------------------|
| 1,000+ | 0% | 1.0 |
| 3,000+ | 5% | 1.05 |

## For AI Agents

### Pricing Patterns

**Material Cost Calculation:**
```typescript
areaMm2 = (width * height) + (depth ? width * depth * 2 : 0)
materialRate = BASE_RATE * materialMultiplier
variableCost = areaMm2 * materialRate
baseMaterialCost = baseProcessingFee + variableCost
```

**Printing Cost:**
- Plate Cost: Fixed (colors * PLATE_COST)
- Ink Cost: Per unit (area * multiplier * INK_COST)
- Labor Cost: Fixed (colors * LABOR_COST + quantityFee)
- Setup Cost: 3,500 JPY fixed

**User Tier Discounts:**
- Premium: +5%
- Enterprise: +10%
- Repeat Order: +2%

### Common Calculations

**Area Calculation:**
- Flat bags: `width * height`
- Gusset/Standup: `width * height + (width * depth * 2)`

**Volume Discount:**
```typescript
tier = discountTiers
  .filter(t => qty >= t.minQuantity && (!t.maxQuantity || qty <= t.maxQuantity))
  .sort((a,b) => b.minQuantity - a.minQuantity)[0]
discount = basePrice * tier.discountRate
```

### Validation Rules

- Width: 50-500mm
- Height: 50-500mm
- Quantity: 100-100,000 units
- Thickness: 10-500 microns

### Caching

Results cached for 5 minutes based on full input JSON.

## Dependencies

**External:**
- `zod` - Schema validation

**Internal:**
- `../pricing_new/types.ts` - Type definitions
- `../pricing_new/constants.ts` - Cost constants

## Usage Examples

```typescript
import { PriceCalculationEngine } from './pricing/PriceCalculationEngine';

const engine = new PriceCalculationEngine();

const result = await engine.calculatePrice({
  pattern: {
    bag: {
      bagTypeId: 'stand_up',
      materialCompositionId: 'pet_ny_al_pe',
      width: 130,
      height: 130,
      depth: 30
    },
    printing: {
      printColors: { front: 2, back: 0 },
      printCoverage: 'partial',
      printQuality: 'standard'
    },
    quantity: 5000
  },
  userTier: 'basic',
  isRepeatOrder: false
});

console.log(result.priceBreakdown.unitPrice);
console.log(result.priceBreakdown.totalPrice);
```

## Testing

Use `test-engine.ts` for unit tests covering:
- Material cost calculations
- Volume discount tiers
- Feature cost additions
- Validation edge cases

## Migration Notes

**Legacy → New:**
- `pricing.ts`: Simple calculate() method → Use `PriceCalculationEngine.calculatePrice()`
- `pricing-engine.ts`: Standalone class → Integrated into new architecture
- Fixed costs now separated from variable costs
- Caching added for performance

## Constants Reference

See `../pricing_new/constants.ts` for all fixed costs, material rates, and processing fees.
