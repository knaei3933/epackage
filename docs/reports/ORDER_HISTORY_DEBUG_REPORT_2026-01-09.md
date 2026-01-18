# Order History Page Debug Report

**Date**: 2026-01-09
**Issue**: Console error on `/member/orders/history/` page
**Status**: FIXED ✓

---

## Root Cause Analysis

### Error Details
- **Error Code**: PostgreSQL 42703 (undefined_column)
- **Location**: `src/lib/dashboard.ts` line 621 (before fix)
- **Component**: `OrderHistoryContent` in `/member/orders/history/page.tsx`

### Root Cause
The `getOrders()` function was receiving `sortBy: 'createdAt'` (camelCase) from the page component and passing it directly to Supabase's `.order()` method without converting it to the database column name format (snake_case).

**Database column**: `created_at`
**Code was using**: `createdAt`

This caused PostgreSQL to throw an error:
```
Error: {code: "42703", details: Null, hint: ..., message: ...}
```

### Evidence

1. **Page component calling with camelCase**:
   ```typescript
   // src/app/member/orders/history/page.tsx:37
   const { data: orders, total } = await getOrders(
     {},
     { page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }
   );
   ```

2. **Database using snake_case**:
   ```sql
   -- Schema verification
   SELECT column_name FROM information_schema.columns
   WHERE table_name = 'orders';
   -- Result: created_at, updated_at, order_number, etc.
   ```

3. **Function not converting column names**:
   ```typescript
   // BEFORE (line 618-621)
   const sortBy = pagination?.sortBy || 'created_at';
   const sortOrder = pagination?.sortOrder || 'desc';
   query = query.order(sortBy, { ascending: sortOrder === 'asc' });
   ```

---

## Fix Applied

### Implementation

**File**: `C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\src\lib\dashboard.ts`

**Change**: Added column name mapping to convert camelCase to snake_case

```typescript
// AFTER (lines 618-628)
// Sorting - convert camelCase to snake_case for database columns
const sortByMap: Record<string, string> = {
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'orderNumber': 'order_number',
  'totalAmount': 'total_amount',
  'status': 'status',
};
const sortBy = sortByMap[pagination?.sortBy || 'createdAt'] || 'created_at';
const sortOrder = pagination?.sortOrder || 'desc';
query = query.order(sortBy, { ascending: sortOrder === 'asc' });
```

### Test Results

**Unit Test**: `scripts/test-orders-history-fix.ts`
```
Testing sortBy parameter mapping:
==================================================
✓ Test 1: PASSED
  Input: createdAt
  Output: created_at

✓ Test 2: PASSED
  Input: updatedAt
  Output: updated_at

✓ Test 3: PASSED
  Input: orderNumber
  Output: order_number

✓ Test 4: PASSED
  Input: totalAmount
  Output: total_amount

✓ Test 5: PASSED
  Input: status
  Output: status

✓ Test 6: PASSED
  Input: undefined
  Output: created_at

Results: 6 passed, 0 failed
```

---

## Files Modified

1. **`src/lib/dashboard.ts`** (lines 618-628)
   - Added `sortByMap` to convert camelCase to snake_case
   - Updated `sortBy` assignment to use the mapping

2. **`scripts/test-orders-history-fix.ts`** (new file)
   - Created test script to verify the fix
   - Tests all supported sortBy parameters

---

## Related Code Analysis

### Other Files Using `sortBy: 'createdAt'`

The following files also use `sortBy: 'createdAt'` but are **NOT affected** by this issue:

1. **`src/app/member/orders/reorder/page.tsx:41`**
   - Uses `getOrders()` - now fixed by our change ✓

2. **`src/app/member/orders/new/page.tsx:39`**
   - Uses `getOrders()` - now fixed by our change ✓

3. **`src/components/dashboard/OrderList.tsx:110`**
   - Does client-side sorting only - no database query ✓

4. **`src/app/api/admin/users/route.ts:126`**
   - Admin API - expects snake_case from query params ✓

5. **`src/app/api/admin/quotations/route.ts:118`**
   - Admin API - expects snake_case from query params ✓

---

## Verification Steps

### Manual Testing
1. Navigate to `http://localhost:3000/member/orders/history/`
2. Open browser console
3. Verify no PostgreSQL errors appear
4. Verify orders are displayed correctly
5. Test sorting functionality

### Expected Behavior
- ✓ No console errors
- ✓ Orders load successfully
- ✓ Sorting works by date, order number, etc.
- ✓ Pagination works correctly

---

## Prevention Recommendations

1. **Type Safety**: Create a strict type for `PaginationParams['sortBy']` that only allows valid values
2. **Utility Function**: Create a reusable `camelToSnake()` utility function
3. **Documentation**: Document the expected column name format in function JSDoc comments
4. **Testing**: Add integration tests for pagination and sorting

### Example Utility Function
```typescript
// src/lib/utils/string.ts
export function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Usage in getOrders()
const sortBy = camelToSnakeCase(pagination?.sortBy || 'createdAt');
```

---

## Summary

**Issue**: Column name mismatch (camelCase vs snake_case)
**Fix**: Added mapping to convert camelCase to snake_case
**Impact**: Fixed order history page and prevented similar issues in reorder/new order pages
**Status**: RESOLVED ✓

---

**Report Generated**: 2026-01-09
**Tested By**: Claude Code Debugger Agent
