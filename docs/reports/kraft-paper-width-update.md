# Kraft Paper Width Update Report

**Date**: 2026-04-01
**Status**: Implemented
**Version**: 1.1

## Overview

This document describes the Kraft paper material width specification changes implemented in the pricing calculation system. Kraft paper materials use different width standards compared to conventional film materials.

---

## Kraft Paper Specifications

### Material Properties

| Property | Value | Notes |
|----------|-------|-------|
| **Grammage** | 80 g/m² | Uses grammage (weight per area), NOT thickness |
| **Density** | N/A | Not used for weight calculation |
| **Weight Formula** | `(grammage / 1000) × width(m) × length(m)` | g/m² → kg/m² conversion |

### Material IDs

Kraft paper is used in the following material combinations:
- `kraft_pe` - Kraft paper + PE
- `kraft_vmpet_lldpe` - Kraft paper + VMPET + LLDPE
- `kraft_pet_lldpe` - Kraft paper + PET + LLDPE

---

## Material Width Standards

### Kraft Paper Width Selection

| Product Width (mm) | Material Width (mm) | Printable Width (mm) | Description |
|-------------------|-------------------|---------------------|-------------|
| ≤ 760 | **780** | 760 | Small Kraft roll |
| > 760 | **1190** | 1170 | Large Kraft roll |

### Conventional Material Width (for comparison)

| Product Width (mm) | Material Width (mm) | Printable Width (mm) | Description |
|-------------------|---------------------|---------------------|-------------|
| ≤ 570 | 590 | 570 | Small roll |
| 571-740 | 760 | 740 | Large roll |

---

## Loss Calculation

### Kraft Paper Fixed Loss

**Total Loss: 700 meters**

Breakdown:
- Printing loss: 500m
- Slitter loss: 100m
- Processing loss: 100m

### Loss Comparison

| Material Type | Loss (m) | Notes |
|--------------|----------|-------|
| **KRAFT** | **700** | 500m print + 100m slitter + 100m process |
| AL | 400 | Standard aluminum loss |
| Other | 300 | Basic materials (PET, LLDPE, etc.) |

---

## Layer Width Logic

### Single Width Application

When Kraft paper is used in a multi-layer structure, **ALL layers use the same material width** determined by the Kraft paper width.

**Example**: For `kraft_vmpet_lldpe` with product width 600mm:
- Kraft layer: 780mm width
- VMPET layer: 780mm width (same as Kraft)
- LLDPE layer: 780mm width (same as Kraft)

This ensures proper lamination and processing compatibility.

---

## Affected Files

### Core Calculation Files

1. **`src/lib/material-width-selector.ts`**
   - `determineMaterialWidth()` - Width selection logic with Kraft detection
   - `AVAILABLE_MATERIAL_WIDTHS` - Width definition constants
   - Kraft material detection: `kraft_vmpet_lldpe`, `kraft_pet_lldpe`, `kraft_pe`

2. **`src/lib/loss-calculator.ts`**
   - `calculateLossMeters()` - Returns 700m for Kraft materials
   - Kraft detection based on layer material IDs

3. **`src/lib/common/film-calculations.ts`**
   - `getDefaultFilmLayers()` - Default layer definitions with Kraft grammage (80)
   - `getDefaultLayers()` - Alternative layer getter

### Pricing Engine Files

4. **`src/lib/unified-pricing-engine.ts`**
   - Weight calculation using grammage instead of density for Kraft
   - `determinedMaterialWidth` usage throughout
   - Lines 996-998, 2031-2033, 2068-2070, 2322-2324

5. **`src/lib/film-cost-calculator.ts`**
   - Film structure handling with Kraft layers
   - Cost calculation based on grammage

6. **`src/lib/pouch-cost-calculator.ts`**
   - Pouch-specific Kraft material handling

7. **`src/lib/cost-breakdown-helpers.ts`**
   - Cost breakdown display for Kraft materials

### Strategy Files

8. **`src/lib/pricing/strategies/base-strategy.ts`**
   - Base pricing strategy with Kraft support

9. **`src/lib/pricing/strategies/roll-film-strategy.ts`**
   - Roll film pricing with Kraft width logic

10. **`src/lib/pricing/strategies/pouch-strategy.ts`**
    - Pouch pricing with Kraft width logic

### Support Files

11. **`src/lib/film-structure/default-layers.ts`**
    - Default film structure definitions

12. **`src/lib/roll-film-utils.ts`**
    - Roll film utility functions

13. **`src/lib/pricing/core/constants.ts`**
    - Material cost constants

14. **`src/lib/pricing/validators/moq-validator.ts`**
    - MOQ validation with Kraft considerations

### Test Files

15. **`src/lib/__tests__/kraft-paper-calculation.test.ts`**
    - Kraft paper calculation tests

16. **`src/lib/unified-pricing-engine-kraft.test.ts`**
    - Integration tests for Kraft pricing

---

## Key Functions

### `determineMaterialWidth(productWidth, materialId)`

**Location**: `src/lib/material-width-selector.ts`

**Purpose**: Select appropriate material width based on product width and material type

**Logic**:
```typescript
if (isKraftMaterial) {
  if (productWidth <= 760) return 780;
  else return 1190;
}
// Conventional materials
if (productWidth <= 570) return 590;
else if (productWidth <= 740) return 760;
```

**Parameters**:
- `productWidth`: Product width in mm
- `materialId`: Optional material ID for Kraft detection

**Returns**: Material width (590 | 760 | 780 | 1190)

---

### `calculateLossMeters(layers)`

**Location**: `src/lib/loss-calculator.ts`

**Purpose**: Calculate fixed loss based on material types present

**Logic**:
```typescript
const hasKraft = layers.some(layer => layer.materialId === 'KRAFT');
if (hasKraft) return 700;
if (hasAL) return 400;
return 300;
```

**Parameters**:
- `layers`: Array of film structure layers

**Returns**: Loss meters (700 | 400 | 300)

---

## Implementation Notes

### Weight Calculation

For Kraft paper materials:
- **Do NOT use density**
- **Use grammage directly**: `(grammage / 1000) × width(m) × length(m)`
- Standard grammage: 80 g/m²

### Width Consistency

All layers in a Kraft-based structure share the same width:
- Determined by Kraft paper width selection rules
- Applied to ALL layers (Kraft, VMPET, PET, LLDPE, etc.)
- Ensures manufacturing compatibility

### Loss Application

Kraft materials receive 700m fixed loss:
- Higher than conventional materials (300m) and AL (400m)
- Reflects additional processing requirements for paper-based materials
- Applied once per quote if any layer contains Kraft

---

## Verification Checklist

- [x] Kraft grammage set to 80 g/m²
- [x] Width selection: 780mm (≤760mm product), 1190mm (>760mm product)
- [x] Fixed loss: 700m for Kraft materials
- [x] All layers use same width when Kraft is present
- [x] Weight calculation uses grammage, not density
- [x] Material IDs: `kraft_pe`, `kraft_vmpet_lldpe`, `kraft_pet_lldpe`

---

## Related Documentation

- `docs/reports/pricing-calculation-formula.md` - General pricing formula
- `src/lib/material-width-selector.ts` - Width selection implementation
- `src/lib/loss-calculator.ts` - Loss calculation implementation

---

## Change History

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-01 | 1.1 | Initial documentation of Kraft paper width specifications |

