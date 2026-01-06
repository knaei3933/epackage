# Brixa Replica Pricing Logic Documentation

This document outlines the reverse-engineered pricing logic implemented in the Epackage Lab simulation system. The logic is derived from data analysis of the original Brixa system (Phases 1-5).

## 1. Core Pricing Formula

The unit price is calculated using the following formula:

$$
\text{Unit Price} = \left( \frac{\text{Setup Fee}}{\text{Quantity}} \right) + (\text{Material Rate} \times \text{Area}) + \text{Processing Fee} + \text{Offset}
$$

Where:
- **Setup Fee**: Fixed cost for printing plates and setup (amortized over quantity).
- **Material Rate**: Cost per square millimeter of the film, adjusted for surface and thickness.
- **Area**: Width $\times$ Height (in $mm^2$).
- **Processing Fee**: Cost per bag for forming (e.g., zipper, stand-up).
- **Offset**: A calibration constant derived from regression analysis.

---

## 2. Constants & Coefficients

### Base Constants
| Parameter | Value | Description |
| :--- | :--- | :--- |
| **Base Setup Fee** | 150,000 JPY | Standard setup fee for orders < 50,000 units. |
| **Base Material Rate** | 0.0015 JPY/$mm^2$ | Base rate for OPP+Al / Matte / PE40. |
| **Standard Offset** | -3.0 JPY | Calibration offset for standard orders. |

### Surface Finish Adjustments
Added to the Base Material Rate.
| Surface Type | Adder (JPY/$mm^2$) |
| :--- | :--- |
| Matte (Default) | +0.00000 |
| Gloss (Tsuyap) | +0.00006 |

### Thickness Adjustments (Composition)
Added to the Base Material Rate based on the PE layer thickness.
| Composition Code | PE Thickness | Adder (JPY/$mm^2$) |
| :--- | :--- | :--- |
| `comp_1` | PE40 | +0.00000 |
| `comp_2` | PE60 | +0.00016 |
| `comp_3` | PE80 | +0.00026 |
| `comp_4` | PE100 | +0.00036 |
| (Generic) | PE120 | +0.00046 |

### Processing Fees
Fixed cost added per unit based on bag shape and features.
| Bag Type | Fee (JPY/unit) | Notes |
| :--- | :--- | :--- |
| **Flat (3-side seal)** | 0 JPY | Base shape. |
| **Stand-up** | 8 JPY | Additional forming cost. |
| **Gusset** | 15 JPY | Approximate cost (to be refined). |
| *Zipper (Optional)* | +10-11 JPY | (Currently integrated into bag type logic if needed). |

---

## 3. High Volume Tier Logic (>= 50,000 units)

When the order quantity reaches **50,000 units**, the pricing model switches to a "High Volume" tier to match Brixa's behavior (observed in Phase 5 data).

| Parameter | Standard (< 50k) | High Volume (>= 50k) |
| :--- | :--- | :--- |
| **Setup Fee** | 150,000 JPY | **200,000 JPY** |
| **Material Rate** | Base Rate | Base Rate + **0.00008** |
| **Offset** | -3.0 JPY | **0.0 JPY** |

> **Note**: While the Setup Fee increases, the removal of the negative offset and slight rate adjustment results in a smoother price curve at very high volumes, preventing prices from dropping too aggressively.

---

## 4. Calculation Steps

1.  **Calculate Area**: $W \times H$
2.  **Determine Material Rate**:
    *   Start with `0.0015`.
    *   Add Surface Adder (if Gloss).
    *   Add Thickness Adder (based on composition).
3.  **Determine Processing Fee**: Lookup based on selected Bag Type.
4.  **Apply Volume Tier**: Check if Quantity >= 50,000 and select appropriate Setup Fee, Rate Modifier, and Offset.
5.  **Compute Raw Unit Price**: Apply the core formula.
6.  **Rounding**: Round up to the nearest 0.1 JPY (`Math.ceil(price * 10) / 10`).
7.  **Total Price**: `Math.floor(Unit Price * Quantity)`.

## 5. Source Code Reference

The logic is implemented in:
`src/lib/pricing.ts`

```typescript
// Example Snippet
const amortization = activeSetupFee / qty;
const materialCost = area * activeMaterialRate;
let unitPrice = amortization + materialCost + processingFee + activeOffset;
```
