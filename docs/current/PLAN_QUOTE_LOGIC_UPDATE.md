# Quote Simulator Implementation Plan based on '계산가이드'

This plan outlines the steps to strictly implement the logic defined in `docs/reports/tjfrP/계산가이드` into the `quote-simulator`.

## 1. Analysis & Discrepancies

The current implementation in `src/lib/pouch-cost-calculator.ts` and `src/lib/film-cost-calculator.ts` deviates from the strict guide in the following ways:

| Feature | Guide Logic | Current Code Logic | Action |
| :--- | :--- | :--- | :--- |
| **Currency Flow** | Calculate entirely in **KRW** first, convert to **JPY** at the very end. | Converts to JPY early (after base cost), then adds duty/delivery in JPY. | **Refactor**: Defer JPY conversion to the final step. |
| **Margin Chain** | `Base` → `Mfg Price (×1.4)` → `Duty (×1.05)` → `+ Shipping` → `Seller Price (×1.2)` | `Base` → `Duty` → `+ Shipping` (Missing Mfg/Seller margins in the main flow). | **Implement**: Strict 5-step price buildup. |
| **Shipping Cost** | **127,980 KRW** / box (Max **29kg**) | ~16,800 JPY / roll (Max 30kg) | **Update**: Use exact KRW rate and 29kg limit. |
| **Matte Print** | `Width(m) × 20 KRW × Meters` | `Width(m) × 20 KRW × Meters` (Logic exists but needs verification). | **Verify**: Ensure it's active. |
| **Film Width** | Strict formulas based on Pouch Type (H vs W). | Implemented but needs cross-check against `02-필름폭_계산공식.md`. | **Audit**: Check formulas for all types (Flat, Stand, Box, T-shape). |

## 2. Implementation Steps

### Phase 1: Core Logic Refactoring (Backend/Library)

1.  **Update Constants**:
    - Update `src/lib/pouch-cost-calculator.ts` definitions to include exact KRW rates for shipping, minimum costs, and margin multipliers.
2.  **Refactor `calculateCostBreakdown`**:
    - Rewrite this function to follow the "Guide Flow":
        ```typescript
        const manufacturingPrice = baseCostKRW * 1.4;
        const duty = manufacturingPrice * 0.05;
        const importCost = (manufacturingPrice + duty) + shippingCostKRW;
        const finalPriceKRW = importCost * 1.2;
        const finalPriceJPY = finalPriceKRW * 0.12;
        ```
3.  **Refactor Shipping Calculation**:
    - Implement `Math.ceil(totalWeight / 29)` for box count.
    - Cost = `boxCount * 127980`.
4.  **Refactor Film Cost Integration**:
    - Ensure `FilmCostCalculator` returns raw KRW components so `PouchCostCalculator` can apply the margins correctly. currently `FilmCostCalculator` might be doing too much "final pricing". We might need a `calculateRawCostKRW` method.

### Phase 2: Verification (Test Script)

1.  **Create Scenario Test**:
    - Create `src/lib/__tests__/guide-scenarios.test.ts`.
    - Implement the "Flat Pouch 10,000 count" scenario from `01-기본_평백_예시.md` as a test case.
    - **Goal**: The calculated `finalPriceJPY` must match **31.4 JPY** (or extremely close due to rounding) and the breakdown must match the guide.

### Phase 3: UI Integration

1.  **Review `ImprovedQuotingWizard`**:
    - Ensure it passes the correct parameters (post-processing options, matte finish, etc.) to the calculator.
2.  **Update Cost Breakdown Display**:
    - The UI should ideally show the breakdown if in "Debug/Admin" mode, but for users, it just shows the Unit Price.
    - Ensure the "Unit Price" displayed comes from the `finalPriceJPY`.

### Phase 4: PDF & Validation

1.  **PDF Generation**:
    - Check `src/lib/pdf-generator.ts`.
    - Ensure the PDF receives the *final* calculated values, not re-calculating them with different logic.

## 3. Execution Plan

1.  **Review**: Read `src/lib/pouch-cost-calculator.ts` one last time to map exactly where to change.
2.  **Implement**: Modify `src/lib/pouch-cost-calculator.ts`.
3.  **Verify**: Run the test script.
4.  **Final Review**: Check against `09-다양한_시나리오_계산예시.md`.

---

**Next Action**: Start "Phase 1: Core Logic Refactoring".
