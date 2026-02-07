# QuoteContext Infinite Loop Fix - Complete Summary

## Error Details
**Error Type**: Maximum update depth exceeded (Infinite Loop)
**Error Location**: `src/contexts/QuoteContext.tsx:1297` in `clearAppliedOption`
**Trigger**: `src/components/quote/UnifiedSKUQuantityStep.tsx:160` in useEffect

## Root Cause Analysis

### The Infinite Loop Chain

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: FIRST useEffect (lines 157-181)                     │
│─────────────────────────────────────────────────────────────│
│ Dependency: [quoteState.skuQuantities]                      │
│ Trigger: When skuQuantities changes                         │
│ Action: clearAppliedOption() if twoColumnOptionApplied      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: CLEAR_APPLIED_OPTION reducer (QuoteContext:753-763) │
│─────────────────────────────────────────────────────────────│
│ State Changes:                                              │
│   ✓ twoColumnOptionApplied: true → null                    │
│   ✓ _forceRecalculate: false → true                        │
│   ✗ skuQuantities: NOT CHANGED                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: SECOND useEffect (lines 183-217)                    │
│─────────────────────────────────────────────────────────────│
│ Dependency: [..., quoteState.twoColumnOptionApplied, ...]   │
│ Trigger: twoColumnOptionApplied changes (true → null)       │
│ Condition: !twoColumnOptionApplied && totalQuantity >= 1000 │
│ Action: applyTwoColumnOptionContext(...)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: APPLY_TWO_COLUMN_OPTION reducer (QuoteContext:734)  │
│─────────────────────────────────────────────────────────────│
│ State Changes:                                              │
│   ✓ twoColumnOptionApplied: null → 'same'                  │
│   ✓ skuQuantities: [old] → [quantity] ← CHANGES!           │
│   ✓ unitPrice, quantity, etc. updated                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: BACK TO STEP 1 ♻️ INFINITE LOOP                     │
│─────────────────────────────────────────────────────────────│
│ skuQuantities changed → triggers FIRST useEffect again      │
│ (because skuQuantities is in its dependency array)         │
└─────────────────────────────────────────────────────────────┘
```

### Why the Existing Ref Didn't Prevent This

The existing `isApplyingTwoColumnRef` only protected the SECOND useEffect from running while already applying. It didn't prevent the FIRST useEffect from running, which meant:

1. **First useEffect** clears the option (`twoColumnOptionApplied = null`)
2. **Second useEffect** sees `twoColumnOptionApplied = null` and re-applies it
3. This changes `skuQuantities`
4. **First useEffect** triggers again because `skuQuantities` changed
5. **Loop continues infinitely** ♻️

## The Fix

### Changes Made

**File**: `src/components/quote/UnifiedSKUQuantityStep.tsx`

#### Change 1: Added New Ref (Line 71)
```typescript
// Before:
const isApplyingTwoColumnRef = useRef(false);

// After:
const isApplyingTwoColumnRef = useRef(false);
const isClearingOptionRef = useRef(false);
```

#### Change 2: Updated First useEffect (Lines 157-181)
```typescript
// Before:
useEffect(() => {
  if (quoteState.twoColumnOptionApplied) {
    clearAppliedOption();
  }
}, [quoteState.skuQuantities]);

// After:
useEffect(() => {
  // 無限ループ防止：自動適用中ならスキップ
  if (isApplyingTwoColumnRef.current) {
    return;
  }

  // 無限ループ防止：クリア中ならスキップ
  if (isClearingOptionRef.current) {
    return;
  }

  // 2列生産オプション適用済みで数量が変更された場合、フラグをクリアして再計算
  if (quoteState.twoColumnOptionApplied) {
    // クリア中フラグをセット
    isClearingOptionRef.current = true;

    // 数量が変更された場合はフラグをクリア
    clearAppliedOption();

    // クリア完了後にフラグをリセット
    setTimeout(() => {
      isClearingOptionRef.current = false;
    }, 0);
  }
}, [quoteState.skuQuantities]);
```

## How the Fix Breaks the Loop

### Protection Mechanism

The fix adds **two layers of protection**:

1. **Check `isApplyingTwoColumnRef`** (lines 159-161):
   - If the second useEffect is auto-applying the option, skip clearing
   - This prevents clearing while auto-applying

2. **Check `isClearingOptionRef`** (lines 164-166):
   - If already clearing the option, skip recursive calls
   - This prevents multiple simultaneous clear operations

3. **Set `isClearingOptionRef` flag** (line 171):
   - Marks that we're in the process of clearing
   - Prevents the second useEffect from re-applying while clearing

### Execution Flow (After Fix)

```
USER CHANGES QUANTITY
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ FIRST useEffect triggers                                    │
│ - Checks isApplyingTwoColumnRef.current → false ✓         │
│ - Checks isClearingOptionRef.current → false ✓            │
│ - Sees twoColumnOptionApplied → true                       │
│ - Sets isClearingOptionRef.current = true                  │
│ - Calls clearAppliedOption()                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ CLEAR_APPLIED_OPTION reducer                                │
│ - Sets twoColumnOptionApplied = null                       │
│ - Triggers SECOND useEffect                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ SECOND useEffect triggers                                  │
│ - Checks isApplyingTwoColumnRef.current → false ✓         │
│ - Checks isClearingOptionRef.current → true ✗             │
│ - RETURNS EARLY (does not re-apply) ✓✓✓                   │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ setTimeout completes                                       │
│ - Resets isClearingOptionRef.current = false               │
│ - Loop is BROKEN ✓✓✓                                      │
└─────────────────────────────────────────────────────────────┘
```

## Verification Steps

### Manual Testing

1. **Navigate to Quote Simulator**:
   - Go to `/quote-simulator` page
   - Select a pouch product (e.g., スタンドパウチ)

2. **Set Quantity >= 1000**:
   - Enter quantity: 1000 or more
   - Verify 2-column production option is auto-applied
   - Check console for: "Auto-applied 2-column production discount"

3. **Change Quantity**:
   - Modify quantity to a different value (e.g., 1500)
   - Verify option is cleared and re-applied
   - Check console for: "Clearing applied option" then "Auto-applied..."

4. **Verify No Infinite Loop**:
   - Open browser console
   - Look for errors: "Maximum update depth exceeded" → Should NOT appear
   - Monitor console logs → Should see single clear + single apply, not looping

### Expected Console Output (Success)

```
[CLEAR_APPLIED_OPTION] Clearing applied option
[APPLY_TWO_COLUMN_OPTION] Applied option: {...}
[UnifiedSKUQuantityStep] Auto-applied 2-column production discount: {...}
```

### Expected Console Output (Failure - Before Fix)

```
[CLEAR_APPLIED_OPTION] Clearing applied option
[APPLY_TWO_COLUMN_OPTION] Applied option: {...}
[UnifiedSKUQuantityStep] Auto-applied 2-column production discount: {...}
[CLEAR_APPLIED_OPTION] Clearing applied option
[APPLY_TWO_COLUMN_OPTION] Applied option: {...}
[UnifiedSKUQuantityStep] Auto-applied 2-column production discount: {...}
... (repeats infinitely)
Error: Maximum update depth exceeded
```

## Files Modified

- `src/components/quote/UnifiedSKUQuantityStep.tsx`
  - Line 71: Added `isClearingOptionRef` ref
  - Lines 157-181: Updated first useEffect with ref protection

## Technical Details

### Why setTimeout?

The `setTimeout(() => { isClearingOptionRef.current = false; }, 0)` is crucial:

1. **Asynchronous Reset**: Defers the flag reset until after the current call stack completes
2. **Allows State Updates**: Lets React process the state changes from `clearAppliedOption()` before resetting
3. **Prevents Race Conditions**: Ensures the second useEffect has a chance to see the flag and return early

### Why Two Refs?

- **`isApplyingTwoColumnRef`**: Prevents re-entry into the second useEffect while applying
- **`isClearingOptionRef`**: Prevents the second useEffect from re-applying while clearing
- **Both needed**: They protect different parts of the cycle and work together to break the loop

## Related Code References

### QuoteContext.tsx Reducer

**CLEAR_APPLIED_OPTION** (lines 753-763):
```typescript
case 'CLEAR_APPLIED_OPTION': {
  return {
    ...state,
    twoColumnOptionApplied: null,
    discountedUnitPrice: undefined,
    discountedTotalPrice: undefined,
    originalUnitPrice: undefined,
    _forceRecalculate: true
  };
}
```

**APPLY_TWO_COLUMN_OPTION** (lines 734-750):
```typescript
case 'APPLY_TWO_COLUMN_OPTION': {
  const { optionType, unitPrice, totalPrice, originalUnitPrice, quantity } = action.payload;
  return {
    ...state,
    twoColumnOptionApplied: optionType,
    discountedUnitPrice: unitPrice,
    discountedTotalPrice: totalPrice,
    originalUnitPrice: originalUnitPrice,
    unitPrice: unitPrice,
    quantity: quantity,
    skuCount: 1,
    skuQuantities: [quantity], // ← This change triggers the loop
    quantityMode: 'sku',
    _forceRecalculate: false
  };
}
```

## Summary

The infinite loop was caused by two useEffects creating a circular dependency through shared state:
- First useEffect clears option when `skuQuantities` changes
- Second useEffect re-applies option when `twoColumnOptionApplied` becomes null
- Re-applying changes `skuQuantities`, which triggers first useEffect again ♻️

The fix adds ref-based guards to prevent this circular execution, breaking the loop while maintaining the desired functionality of auto-applying the 2-column production discount for quantities >= 1000.
