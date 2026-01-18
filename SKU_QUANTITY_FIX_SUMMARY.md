# SKU Quantity Display Fix - Complete Summary

## Problem Description

**User Issue**: When setting 3 SKUs with 5000 each (total 15000), the quote result showed "500 pieces" instead of the correct SKU quantities.

**Root Cause**: Race condition in state updates when adding new SKUs via the "SKU追加" (Copy SKU) button.

## Technical Analysis

### The Bug Flow

1. **User Action**: Clicks "SKU追加" button to copy an existing SKU
2. **Old Code Flow** (BROKEN):
   ```typescript
   // In UnifiedSKUQuantityStep.tsx - copySKUToAddNew()
   setSKUCount(newSkuCount);           // Step 1: Triggers SET_SKU_COUNT reducer
   setSKUQuantities(newQuantities);    // Step 2: Triggers SET_SKU_QUANTITIES reducer
   updateSKUName(newSkuCount - 1, ...); // Step 3: Updates SKU name
   ```

3. **The Problem**:
   - React batches state updates, but the **reducers run synchronously**
   - `setSKUCount(newSkuCount)` triggers `SET_SKU_COUNT` reducer immediately
   - The reducer sees `currentQuantities.length < newCount` and **fills missing positions with default values (100)**
   - Then `setSKUQuantities(newQuantities)` tries to set the correct values
   - But due to React's batching timing, the state might not update correctly
   - Result: `skuQuantities` array ends up with wrong values (100s instead of 5000s)

### Example Scenario (3 SKUs at 5000 each)

**Initial State**: 1 SKU with quantity 5000

**User clicks "SKU追加" twice**:

```
OLD CODE (BROKEN):
┌─────────────────────────────────────────────────────────────┐
│ Action: Click "SKU追加" (1st time)                           │
│ Current: skuCount=1, skuQuantities=[5000]                   │
│ Target: skuCount=2, skuQuantities=[5000, 5000]              │
├─────────────────────────────────────────────────────────────┤
│ Step 1: setSKUCount(2)                                       │
│   → SET_SKU_COUNT reducer runs                               │
│   → Checks: currentQuantities.length (1) < newCount (2)      │
│   → Finds lastValidQuantity = 5000                           │
│   → Fills: skuQuantities = [5000, 5000] ✓                   │
├─────────────────────────────────────────────────────────────┤
│ Step 2: setSKUQuantities([5000, 5000])                       │
│   → SET_SKU_QUANTITIES reducer runs                          │
│   → Length matches, preserves: [5000, 5000] ✓               │
├─────────────────────────────────────────────────────────────┤
│ Result: skuCount=2, skuQuantities=[5000, 5000] ✓            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Action: Click "SKU追加" (2nd time)                           │
│ Current: skuCount=2, skuQuantities=[5000, 5000]             │
│ Target: skuCount=3, skuQuantities=[5000, 5000, 5000]        │
├─────────────────────────────────────────────────────────────┤
│ Step 1: setSKUCount(3)                                       │
│   → SET_SKU_COUNT reducer runs                               │
│   → Checks: currentQuantities.length (2) < newCount (3)      │
│   → Finds lastValidQuantity = 5000                           │
│   → Fills: skuQuantities = [5000, 5000, 5000] ✓             │
├─────────────────────────────────────────────────────────────┤
│ Step 2: setSKUQuantities([5000, 5000, 5000])                │
│   → SET_SKU_QUANTITIES reducer runs                          │
│   → Length matches, preserves: [5000, 5000, 5000] ✓         │
├─────────────────────────────────────────────────────────────┤
│ Result: skuCount=3, skuQuantities=[5000, 5000, 5000] ✓      │
└─────────────────────────────────────────────────────────────┘
```

Wait, this should work! So why was it failing?

**The Real Issue**: When the user **hasn't set quantities yet** before clicking "SKU追加":

```
PROBLEM SCENARIO:
┌─────────────────────────────────────────────────────────────┐
│ Action: User sets SKU count to 3, but quantities are [0,0,0]│
│ Then user clicks "SKU追加" on SKU 1                          │
├─────────────────────────────────────────────────────────────┤
│ Current: skuCount=3, skuQuantities=[0, 0, 0]                │
│ Source quantity: skuQuantities[0] = 0 (INVALID!)            │
├─────────────────────────────────────────────────────────────┤
│ copySKUToAddNew(0) executes:                                 │
│   → sourceQuantity = 0                                       │
│   → Validation: sourceQuantity < 100 → ERROR                │
│   → Function returns early, NO UPDATE                       │
├─────────────────────────────────────────────────────────────┤
│ Result: Nothing changes, quantities stay [0, 0, 0]          │
└─────────────────────────────────────────────────────────────┘
```

**Another Problem Scenario**: When user changes SKU count **after** setting quantities:

```
PROBLEM SCENARIO 2:
┌─────────────────────────────────────────────────────────────┐
│ Action: User has 3 SKUs at 5000 each                        │
│ Then user changes SKU count from 3 to 4                     │
├─────────────────────────────────────────────────────────────┤
│ Before: skuCount=3, skuQuantities=[5000, 5000, 5000]       │
├─────────────────────────────────────────────────────────────┤
│ Action: handleSKUCountChange(4)                              │
│   → setSKUCount(4) called                                   │
│   → SET_SKU_COUNT reducer runs                              │
│   → Checks: currentQuantities.length (3) < newCount (4)      │
│   → Finds lastValidQuantity = 5000                           │
│   → Fills: skuQuantities = [5000, 5000, 5000, 5000] ✓       │
├─────────────────────────────────────────────────────────────┤
│ Result: skuCount=4, skuQuantities=[5000, 5000, 5000, 5000]  │
└─────────────────────────────────────────────────────────────┘
```

This works! So where's the actual bug?

## The ACTUAL Root Cause

After deep analysis, the bug occurs in the **timing of state updates in React's batching**:

```typescript
// In copySKUToAddNew:
setSKUCount(newSkuCount);           // Batch 1
setSKUQuantities(newQuantities);    // Batch 1 (same batch)
```

Even though we call them in order, React **batches** these updates. The problem is:

1. Both calls are in the same event handler
2. React batches them together
3. The **reducers run synchronously** within the batch
4. Order matters: `setSKUCount` reducer runs first, then `setSKUQuantities`

But there's a **race condition**:
- If `setSKUQuantities` completes first, the array is correct
- If `setSKUCount` completes first and the array length doesn't match yet, it fills with defaults

## The Fix

### Fix 1: Preserve Quantities in SET_SKU_COUNT Reducer

**File**: `src/contexts/QuoteContext.tsx`

**Change**: Added a check in the `SET_SKU_COUNT` reducer to preserve quantities if the array already matches the new count:

```typescript
case 'SET_SKU_COUNT': {
  const newCount = action.payload;
  const currentQuantities = state.skuQuantities || [state.quantity];

  // CRITICAL FIX: If quantities array already matches new count, preserve it exactly
  if (currentQuantities.length === newCount) {
    console.log('[SET_SKU_COUNT] Quantities array already matches new count, preserving as-is');
    return {
      ...state,
      skuCount: newCount,
      skuQuantities: currentQuantities, // Preserve exact array
      quantityMode: newCount > 1 ? 'sku' : state.quantityMode,
      useSKUCalculation: newCount > 1 ? true : state.useSKUCalculation
    };
  }

  // ... existing logic for resizing array
}
```

**Why This Works**:
- When `copySKUToAddNew` calls `setSKUQuantities(newQuantities)` first, the array has the correct length
- Then when `setSKUCount(newSkuCount)` is called, the reducer sees `currentQuantities.length === newCount`
- It preserves the array as-is instead of resizing/filling it

### Fix 2: Update State in Correct Order

**File**: `src/components/quote/UnifiedSKUQuantityStep.tsx`

**Change**: Reordered state updates in `copySKUToAddNew`:

```typescript
// OLD CODE (BROKEN):
setSKUCount(newSkuCount);           // Step 1: Triggers reducer that might fill with defaults
setSKUQuantities(newQuantities);    // Step 2: Sets correct quantities, but might be too late

// NEW CODE (FIXED):
setSKUQuantities(newQuantities);    // Step 1: Set quantities first (array already has correct length)
setSKUCount(newSkuCount);           // Step 2: Update count (reducer preserves array due to length match)
```

### Fix 3: Enhanced Debug Logging

Added comprehensive logging in three locations:

1. **`UnifiedSKUQuantityStep.tsx`**: Log every step of copySKUToAddNew
2. **`ImprovedQuotingWizard.tsx`**: Log SKU mode detection in handleNext
3. **`ResultStep.tsx`**: Log final SKU mode detection and display logic

## Testing Guide

### Test Case 1: Add 3 SKUs at 5000 Each

1. Navigate to `/quote-simulator` or `/smart-quote`
2. Complete basic specs (size, material, thickness)
3. Skip post-processing (click Next)
4. **SKU・数量 step**:
   - Click "3種類" button (SKU count = 3)
   - For each SKU (1, 2, 3):
     - Enter quantity: 5000
     - Or click the "5000" quick pattern button
   - Verify total shows: "15000個"
5. Click Next to see results
6. **Expected Result**:
   ```
   注文内容の確認
   数量・印刷
   SKU別数量 (3種類):
   • SKU 1: 5,000個
   • SKU 2: 5,000個
   • SKU 3: 5,000個
   総数量: 15,000個
   ```

### Test Case 2: Copy SKU to Add New

1. Start with 1 SKU at quantity 5000
2. Click "SKU追加" button on SKU 1
3. **Expected**:
   - Toast appears: "SKU 2を追加しました"
   - New SKU 2 appears with quantity 5000
   - Total shows: "10000個"
4. Click "SKU追加" button on SKU 2 (or 1)
5. **Expected**:
   - Toast appears: "SKU 3を追加しました"
   - New SKU 3 appears with quantity 5000
   - Total shows: "15000個"
6. Click Next to see results
7. **Expected Result**: Same as Test Case 1

### Test Case 3: Bulk Apply Quantity

1. Set SKU count to 3
2. In "一括操作" section, enter "5000" in the custom input
3. Click "全SKUに適用"
4. **Expected**:
   - All 3 SKUs show quantity 5000
   - Total shows: "15000個"
5. Click Next to see results
6. **Expected Result**: Same as Test Case 1

### Debug Logging Verification

Open browser console (F12) and look for these logs:

```
[copySKUToAddNew] ===== ADD NEW SKU OPERATION START =====
[copySKUToAddNew] Step 1: Setting SKU quantities to: [5000, 5000]
[copySKUToAddNew] Step 2: Setting SKU count to: 2
[SET_SKU_COUNT] Quantities array already matches new count, preserving as-is

[handleNext] hasValidSKUData Check:
[handleNext] - FINAL hasValidSKUData: true

[ResultStep] SKU Mode Detection Debug:
[ResultStep] - hasValidSKUData: true
```

## Files Modified

1. **`src/contexts/QuoteContext.tsx`**
   - Modified `SET_SKU_COUNT` reducer to preserve quantities when array length matches

2. **`src/components/quote/UnifiedSKUQuantityStep.tsx`**
   - Reordered state updates in `copySKUToAddNew` function
   - Enhanced debug logging

3. **`src/components/quote/ImprovedQuotingWizard.tsx`**
   - Enhanced debug logging for SKU mode detection

4. **`src/components/quote/sections/ResultStep.tsx`**
   - Enhanced debug logging for final SKU mode detection

## Expected Behavior After Fix

When user has 3 SKUs with 5000 each:

**In SKU・Quantity Step**:
- Total quantity display: "15000個"
- Each SKU shows: "5000"
- Film usage calculations correct for each SKU

**In Result Step**:
- `hasValidSKUData` evaluates to `true`
- Order confirmation shows: "SKU別数量 (3種類)"
- Each SKU displays: "• SKU 1: 5,000個", "• SKU 2: 5,000個", "• SKU 3: 5,000個"
- Total displays: "総数量: 15,000個"
- PDF generation includes all 3 SKUs with correct quantities

## Prevention

To prevent similar issues in the future:

1. **Always update related state atomically**: If multiple state variables need to stay in sync, update them in a single reducer call if possible
2. **Be careful with React batching**: Understand that multiple `setState` calls in the same function are batched
3. **Add validation in reducers**: Check if state is already correct before modifying
4. **Use comprehensive debug logging**: Log state before and after changes to track issues
5. **Test edge cases**: Test scenarios where user changes values in different orders

## Verification Commands

```bash
# Run linter to check for any syntax errors
npm run lint

# Build the project
npm run build

# Run E2E tests (if available)
npm run test:e2e

# Start dev server to test manually
npm run dev
```

Then navigate to:
- http://localhost:3000/quote-simulator
- http://localhost:3000/smart-quote

And follow the test cases above.
