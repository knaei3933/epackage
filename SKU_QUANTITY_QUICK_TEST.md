# SKU Quantity Fix - Quick Test Guide

## 2-Minute Quick Test

### Test 1: Direct SKU Count (Fastest)

1. Go to: http://localhost:3000/quote-simulator
2. Fill in basic specs (any values work)
3. Click "Next" (skip post-processing)
4. **SKU・数量 step**:
   - Click "3種類" button
   - Click "全SKU: 5000" button (bulk apply)
   - Verify total shows: **"15000個"**
5. Click "Next"
6. ✅ **Verify Result**: Should show "SKU別数量 (3種類)" with each SKU at 5,000個

### Test 2: Copy SKU Button

1. Go to: http://localhost:3000/quote-simulator
2. Fill in basic specs
3. Click "Next" (skip post-processing)
4. **SKU・数量 step**:
   - Keep "1種類" selected
   - Enter "5000" for SKU 1
   - Click "SKU追加" button (next to SKU 1)
   - ✅ **Verify**: Toast shows "SKU 2を追加しました"
   - ✅ **Verify**: Total shows "10000個"
   - Click "SKU追加" button again
   - ✅ **Verify**: Toast shows "SKU 3を追加しました"
   - ✅ **Verify**: Total shows "15000個"
5. Click "Next"
6. ✅ **Verify Result**: Should show "SKU別数量 (3種類)" with all 3 SKUs at 5,000個

## Expected Console Logs

When the fix is working, you'll see:

```
[SET_SKU_COUNT] Quantities array already matches new count, preserving as-is
[handleNext] FINAL hasValidSKUData: true
[ResultStep] hasValidSKUData: true
```

## What You Should See

### ✅ Correct Output (After Fix)

```
注文内容の確認
数量・印刷
SKU別数量 (3種類):
• SKU 1: 5,000個
• SKU 2: 5,000個
• SKU 3: 5,000個
総数量: 15,000個
```

### ❌ Wrong Output (Bug Still Present)

```
注文内容の確認
数量・印刷
数量: 500個    ← WRONG! Should show SKU breakdown
```

## If It Fails

1. Open browser console (F12)
2. Look for error logs starting with `[SET_SKU_COUNT]` or `[copySKUToAddNew]`
3. Check:
   - Are quantities logged as `[5000, 5000, 5000]`?
   - Does `hasValidSKUData` show `true`?
   - Is `skuCount` equal to `3`?

4. Report issues with:
   - Screenshot of console logs
   - Screenshot of result page
   - Steps you took

## Success Criteria

- [ ] Total quantity shows correct sum (e.g., 15000個 for 3×5000)
- [ ] Result step shows "SKU別数量 (X種類)" header
- [ ] Each SKU listed with individual quantity
- [ ] Console logs show `hasValidSKUData: true`
- [ ] No error messages in console

## Files Modified (for reference)

- `src/contexts/QuoteContext.tsx`
- `src/components/quote/UnifiedSKUQuantityStep.tsx`
- `src/components/quote/ImprovedQuotingWizard.tsx`
- `src/components/quote/sections/ResultStep.tsx`

---

**Time to Test**: 2 minutes
**Difficulty**: Easy
**Prerequisites**: Dev server running (`npm run dev`)
