# SKU Quantity Fix - Visual Diagram

## Before the Fix (BROKEN)

```
User clicks "SKU追加" button
│
├─ copySKUToAddNew(1) executes
│  │
│  ├─ setSKUCount(2)  ──────────────────┐
│  │                                       │
│  │  SET_SKU_COUNT reducer runs          │
│  │  ├─ Checks: length(1) < newCount(2)  │
│  │  ├─ Fills: [5000, 100]  ❌          │  WRONG! Fills with default
│  │  └─ Returns state                    │
│  │                                       │
│  ├─ setSKUQuantities([5000, 5000])  ───┤
│  │                                       │
│  │  SET_SKU_QUANTITIES reducer          │  Tries to fix but timing issue
│  │  ├─ Sets: [5000, 5000]               │
│  │  └─ Returns state                    │
│  │                                       │
│  └─ React batches both updates together  │
│     └─ But reducers run in order        │
│        └─ Race condition!               │
│                                          │
└─ Final state: INCONSISTENT  ❌          │
   skuCount: 2                            │
   skuQuantities: [5000, 100] or [5000, 5000] ❓
```

## After the Fix (WORKING)

```
User clicks "SKU追加" button
│
├─ copySKUToAddNew(1) executes
│  │
│  ├─ setSKUQuantities([5000, 5000])  ───┐
│  │                                       │
│  │  SET_SKU_QUANTITIES reducer          │
│  │  ├─ Sets: [5000, 5000]               │  Sets correct array first
│  │  └─ Returns state                    │  Array length = 2
│  │                                       │
│  ├─ setSKUCount(2)  ───────────────────┤
│  │                                       │
│  │  SET_SKU_COUNT reducer                │
│  │  ├─ Checks: length(2) === newCount(2)│
│  │  ├─ PRESERVES: [5000, 5000]  ✓       │  FIX: Don't modify if length matches!
│  │  └─ Returns state                    │
│  │                                       │
│  └─ React batches both updates together  │
│     └─ Reducers run in order            │
│        └─ No race condition! ✓          │
│                                          │
└─ Final state: CONSISTENT  ✓             │
   skuCount: 2                            │
   skuQuantities: [5000, 5000]            │
```

## Key Fix in SET_SKU_COUNT Reducer

```typescript
case 'SET_SKU_COUNT': {
  const newCount = action.payload;
  const currentQuantities = state.skuQuantities || [state.quantity];

  // 🔧 THE FIX: Check if array already matches new count
  if (currentQuantities.length === newCount) {
    // Preserve exact array - don't modify!
    return {
      ...state,
      skuCount: newCount,
      skuQuantities: currentQuantities,  // ✓ Keep as-is
      quantityMode: newCount > 1 ? 'sku' : state.quantityMode,
      useSKUCalculation: newCount > 1 ? true : state.useSKUCalculation
    };
  }

  // Only resize if lengths don't match
  // ... existing logic
}
```

## Test Scenario: 3 SKUs at 5000 Each

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────┐
│ INITIAL STATE                                               │
│ skuCount: 1                                                 │
│ skuQuantities: [5000]                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Click "3種類" button (set SKU count to 3)      │
├─────────────────────────────────────────────────────────────┤
│ setSKUCount(3) called                                       │
│                                                              │
│ SET_SKU_COUNT reducer:                                      │
│   - currentQuantities.length = 1                            │
│   - newCount = 3                                            │
│   - Lengths don't match, need to resize                     │
│   - lastValidQuantity = 5000                                │
│   - Fills: [5000, 5000, 5000]                               │
│                                                              │
│ Result:                                                      │
│   skuCount: 3                                               │
│   skuQuantities: [5000, 5000, 5000]  ✓                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ USER CLICKS NEXT → Result Step                              │
├─────────────────────────────────────────────────────────────┤
│ handleNext() executes:                                      │
│   - hasValidSKUData check:                                  │
│     * skuCount > 1: 3 > 1 ✓                                 │
│     * skuQuantities exists: true ✓                          │
│     * length === skuCount: 3 === 3 ✓                        │
│     * every(qty >= 100): true ✓                             │
│     * FINAL: true ✓                                         │
│   - useSKUMode = true                                       │
│   - totalQuantity = 15000                                   │
│                                                              │
│ ResultStep renders:                                         │
│   - hasValidSKUData: true ✓                                 │
│   - Displays: "SKU別数量 (3種類)"                           │
│   - SKU 1: 5,000個                                          │
│   - SKU 2: 5,000個                                          │
│   - SKU 3: 5,000個                                          │
│   - 総数量: 15,000個                                         │
└─────────────────────────────────────────────────────────────┘
```

## Debug Logs to Verify Fix

When you test this scenario, you should see these logs:

```
[SET_SKU_COUNT] Changing SKU count from 1 to 3
[SET_SKU_COUNT] Current quantities: [5000]
[SET_SKU_COUNT] Current quantities length: 1
[SET_SKU_COUNT] Last valid quantity to fill new SKUs: 5000
[SET_SKU_COUNT] New quantities: [5000, 5000, 5000]

[handleNext] hasValidSKUData Check:
[handleNext] - skuCount > 1: true (skuCount = 3)
[handleNext] - skuQuantities exists: true
[handleNext] - skuQuantities: [5000, 5000, 5000]
[handleNext] - Length check: 3 === 3: true
[handleNext] - Every check (all >= 100): true
[handleNext] - FINAL hasValidSKUData: true
[handleNext] SKU mode detected (via hasValidSKUData)

[ResultStep] SKU Mode Detection Debug:
[ResultStep] - state.skuCount: 3
[ResultStep] - state.skuQuantities: [5000, 5000, 5000]
[ResultStep] - state.skuQuantities.length: 3
[ResultStep] - Length check (=== skuCount): true
[ResultStep] - Every check (all >= 100): true
[ResultStep] - hasValidSKUData: true
```

## Summary of Changes

### Files Modified

1. **QuoteContext.tsx** - Added preservation logic in SET_SKU_COUNT reducer
2. **UnifiedSKUQuantityStep.tsx** - Reordered state updates in copySKUToAddNew
3. **ImprovedQuotingWizard.tsx** - Added debug logging
4. **ResultStep.tsx** - Added debug logging

### The Core Fix

The fix ensures that when `setSKUCount()` is called **after** `setSKUQuantities()` has already set the correct array length, the reducer **preserves** the array instead of modifying it.

This prevents the race condition where the reducer would fill missing positions with default values (100) before the quantities array was fully updated.
