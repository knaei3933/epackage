# CatalogClient.tsx Runtime Error Analysis Report

**Date**: 2026-01-08
**Component**: `src/app/catalog/CatalogClient.tsx`
**Analysis Type**: Runtime Error Detection & Null Safety Analysis

---

## Executive Summary

**Critical Issues Found**: 12
**High Priority**: 5
**Medium Priority**: 4
**Low Priority**: 3

**Key Findings**:
- Multiple null/undefined access vulnerabilities in array operations
- useEffect dependency issues causing potential infinite loops
- Missing null checks in API response handling
- Memory leak risks from unmounted component state updates
- Incomplete error handling in filter operations

---

## 1. Critical Runtime Errors

### 1.1 Null/Undefined Array Access - Line 197

**Location**: `src/app/catalog/CatalogClient.tsx:197`

**Issue**:
```typescript
const availableMaterials = Array.from(new Set(
  (products && Array.isArray(products) ? products.flatMap(product => product.materials || []) : [])
))
```

**Problem**: While there's a check for `products` being an array, the code doesn't verify if `product.materials` is null/undefined before using `flatMap`. This could cause runtime errors if any product has `materials: null` or `materials: undefined`.

**Expected Behavior**: Should gracefully handle products with missing materials array.

**Actual Behavior**: If `product.materials` is null/undefined, the `|| []` fallback works, but the code is inconsistent with other similar operations.

**Fix**:
```typescript
const availableMaterials = Array.from(new Set(
  products.flatMap(product => product?.materials || [])
))
```

---

### 1.2 Sorting useEffect Dependency Issue - Lines 201-224

**Location**: `src/app/catalog/CatalogClient.tsx:201-224`

**Issue**:
```typescript
useEffect(() => {
  let sorted = filteredProducts && Array.isArray(filteredProducts) ? filteredProducts : []
  sorted = [...sorted].sort((a, b) => {
    // ... sorting logic
  })
  setFilteredProducts(sorted)
}, [filterState.sortBy]) // Missing filteredProducts dependency
```

**Problem**:
1. The useEffect reads `filteredProducts` but doesn't include it in dependencies
2. This violates React Hook exhaustive-deps rule
3. Sorting only triggers when `sortBy` changes, not when `filteredProducts` changes
4. Could cause stale closure issues

**Expected Behavior**: Should re-sort whenever `filteredProducts` or `sortBy` changes.

**Actual Behavior**: May use stale `filteredProducts` data or skip sorting when products are updated.

**Fix**:
```typescript
useEffect(() => {
  let sorted = filteredProducts && Array.isArray(filteredProducts) ? filteredProducts : []
  sorted = [...sorted].sort((a, b) => {
    // ... sorting logic
  })
  setFilteredProducts(sorted)
}, [filterState.sortBy, filteredProducts])
```

**OR** (if you want to avoid re-sorting on every product change):
```typescript
// Move sorting logic to a useMemo instead
const sortedProducts = useMemo(() => {
  let sorted = filteredProducts && Array.isArray(filteredProducts) ? filteredProducts : []
  return [...sorted].sort((a, b) => {
    // ... sorting logic
  })
}, [filteredProducts, filterState.sortBy])
```

---

### 1.3 Filter Change useEffect - Lines 227-239

**Location**: `src/app/catalog/CatalogClient.tsx:227-239`

**Issue**:
```typescript
useEffect(() => {
  if (!useDBFiltering) {
    applyClientSideFilters()
  }
}, [
  filterState.searchQuery,
  filterState.selectedCategory,
  filterState.materials,
  filterState.priceRange,
  filterState.features,
  filterState.applications,
  filterState.maxLeadTime
]) // Missing: useDBFiltering, products, applyClientSideFilters
```

**Problem**:
1. The effect depends on `products` (used in `applyClientSideFilters`) but doesn't include it in dependencies
2. Depends on `useDBFiltering` but doesn't include it
3. Depends on `applyClientSideFilters` function but doesn't include it
4. This violates React Hook rules and could cause stale closures

**Expected Behavior**: Should re-apply filters whenever products, filter state, or filtering mode changes.

**Actual Behavior**: May use stale product data or skip filtering when products are updated.

**Fix**:
```typescript
useEffect(() => {
  if (!useDBFiltering) {
    applyClientSideFilters()
  }
}, [
  useDBFiltering,
  products,
  filterState.searchQuery,
  filterState.selectedCategory,
  filterState.materials,
  filterState.priceRange,
  filterState.features,
  filterState.applications,
  filterState.maxLeadTime
])
```

---

### 1.4 Null Access in Product Count - Line 289

**Location**: `src/app/catalog/CatalogClient.tsx:289`

**Issue**:
```typescript
<div className="bg-white/30 backdrop-blur-sm rounded-lg px-6 py-3 text-lg font-semibold text-white">
  全 {products.length} 種類の製品
</div>
```

**Problem**: `products` could be undefined during initial render or if API fails before fallback. The `useState` initializes with empty array `[]`, but if there's any code path that sets it to undefined, this will crash.

**Expected Behavior**: Should show 0 or loading message if products is undefined.

**Actual Behavior**: Will throw "Cannot read property 'length' of undefined" if products is undefined.

**Fix**:
```typescript
<div className="bg-white/30 backdrop-blur-sm rounded-lg px-6 py-3 text-lg font-semibold text-white">
  全 {products?.length || 0} 種類の製品
</div>
```

---

### 1.5 Null Access in Filtered Product Count - Line 337

**Location**: `src/app/catalog/CatalogClient.tsx:337`

**Issue**:
```typescript
<p className="text-lg font-medium text-gray-900">
  {isLoading ? '読み込み中...' : `${filteredProducts.length}件の製品`}
</p>
```

**Problem**: Similar to line 289, `filteredProducts` could be undefined in some code paths.

**Expected Behavior**: Should handle undefined gracefully.

**Actual Behavior**: Will throw error if `filteredProducts` is undefined.

**Fix**:
```typescript
<p className="text-lg font-medium text-gray-900">
  {isLoading ? '読み込み中...' : `${filteredProducts?.length || 0}件の製品`}
</p>
```

---

## 2. API Error Handling Issues

### 2.1 Missing Error Response Handling - Lines 69-79

**Location**: `src/app/catalog/CatalogClient.tsx:69-79`

**Issue**:
```typescript
const response = await fetch('/api/products')
if (response.ok) {
  const result = await response.json()
  if (result.success && result.data) {
    setProducts(result.data)
    setFilteredProducts(result.data)
    setIsLoading(false)
    return
  }
}
// Falls through to static data
```

**Problem**:
1. If `response.ok` is false (404, 500, etc.), code silently falls back to static data
2. No error logging for HTTP errors
3. No user feedback that API failed
4. If `result.success` is false, also silently falls back
5. Doesn't handle malformed JSON (response.json() could fail)

**Expected Behavior**: Should log errors and inform user of API failure.

**Actual Behavior**: Silently uses static data with no indication of API failure.

**Fix**:
```typescript
const response = await fetch('/api/products')
if (response.ok) {
  try {
    const result = await response.json()
    if (result.success && result.data) {
      setProducts(result.data)
      setFilteredProducts(result.data)
      setIsLoading(false)
      return
    } else {
      console.warn('API returned unsuccessful response:', result)
    }
  } catch (parseError) {
    console.error('Failed to parse API response:', parseError)
  }
} else {
  console.error(`API request failed with status ${response.status}`)
}
```

---

### 2.2 DB Filter API Error Handling - Lines 117-123

**Location**: `src/app/catalog/CatalogClient.tsx:117-123`

**Issue**:
```typescript
if (response.ok) {
  const result = await response.json()
  if (result.success) {
    setFilteredProducts(result.data)
    return
  }
}
// Fallback to client-side filtering
applyClientSideFilters()
```

**Problem**:
1. No JSON parsing error handling
2. No validation that `result.data` is an array
3. Silent fallback if `result.success` is false
4. No error logging

**Expected Behavior**: Should handle JSON errors and validate response structure.

**Actual Behavior**: May crash if JSON parsing fails or if response structure is unexpected.

**Fix**:
```typescript
if (response.ok) {
  try {
    const result = await response.json()
    if (result.success && Array.isArray(result.data)) {
      setFilteredProducts(result.data)
      return
    } else {
      console.warn('DB filter API returned unsuccessful or invalid response:', result)
    }
  } catch (parseError) {
    console.error('Failed to parse filter API response:', parseError)
  }
}
// Fallback to client-side filtering
applyClientSideFilters()
```

---

### 2.3 Missing Validation in applyClientSideFilters - Line 138

**Location**: `src/app/catalog/CatalogClient.tsx:138`

**Issue**:
```typescript
const applyClientSideFilters = () => {
  let filtered = products  // Could be undefined
  // ... filtering operations
}
```

**Problem**:
1. No check if `products` is an array
2. No check if products is undefined/null
3. Assumes products is always available

**Expected Behavior**: Should validate products before filtering.

**Actual Behavior**: Will crash if products is undefined.

**Fix**:
```typescript
const applyClientSideFilters = () => {
  if (!products || !Array.isArray(products)) {
    setFilteredProducts([])
    setIsLoading(false)
    return
  }

  let filtered = products
  // ... rest of filtering logic
}
```

---

## 3. Memory Leak Risks

### 3.1 Unmounted Component State Updates - Lines 65-95

**Location**: `src/app/catalog/CatalogClient.tsx:65-95`

**Issue**:
```typescript
const fetchProducts = async () => {
  setIsLoading(true)
  try {
    // ... async operations
    setProducts(result.data)  // Could run after unmount
    setFilteredProducts(result.data)  // Could run after unmount
    setIsLoading(false)  // Could run after unmount
  } catch (error) {
    // ... error handling
    setProducts(safeProducts)  // Could run after unmount
    setFilteredProducts(safeProducts)  // Could run after unmount
  } finally {
    setIsLoading(false)  // Could run after unmount
  }
}
```

**Problem**:
1. No cleanup function to track if component is mounted
2. State updates could occur after component unmounts
3. React will warn about this in development
4. Memory leak if async operations complete after unmount

**Expected Behavior**: Should track mounted status and prevent updates after unmount.

**Actual Behavior**: May cause memory leaks and React warnings.

**Fix**:
```typescript
const fetchProducts = async () => {
  let isMounted = true
  setIsLoading(true)
  try {
    if (useDBFiltering) {
      const response = await fetch('/api/products')
      if (response.ok && isMounted) {
        const result = await response.json()
        if (result.success && result.data && isMounted) {
          setProducts(result.data)
          setFilteredProducts(result.data)
        }
      }
    }
    // ... rest of logic with isMounted checks
  } catch (error) {
    if (isMounted) {
      console.error('Failed to fetch products:', error)
      const safeProducts = getAllProducts(null, 'ja') as unknown as Product[]
      setProducts(safeProducts)
      setFilteredProducts(safeProducts)
    }
  } finally {
    if (isMounted) {
      setIsLoading(false)
    }
  }

  return () => { isMounted = false }
}
```

**OR** use useEffect with cleanup:
```typescript
useEffect(() => {
  let isMounted = true

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      // ... fetch logic with isMounted checks
    } finally {
      if (isMounted) {
        setIsLoading(false)
      }
    }
  }

  fetchProducts()

  return () => { isMounted = false }
}, [])
```

---

### 3.2 applyDBFilters Memory Leak - Lines 98-134

**Location**: `src/app/catalog/CatalogClient.tsx:98-134`

**Issue**: Same as above - no mounted state tracking in async function.

**Fix**: Same pattern as fetchProducts - track mounted status and prevent updates after unmount.

---

## 4. Type Safety Issues

### 4.1 Unsafe Type Casting - Lines 83, 89

**Location**: `src/app/catalog/CatalogClient.tsx:83, 89`

**Issue**:
```typescript
const safeProducts = getAllProducts(null, 'ja) as unknown as Product[]
```

**Problem**:
1. Uses `as unknown as Product[]` double cast
2. Bypasses TypeScript type checking
3. No runtime validation that returned data matches Product interface
4. Could cause runtime errors if shape doesn't match

**Expected Behavior**: Should validate or properly type the returned data.

**Actual Behavior**: Assumes data is correct without validation.

**Fix**:
```typescript
const rawProducts = getAllProducts(null, 'ja')
const safeProducts: Product[] = rawProducts.map(p => ({
  id: p.id || '',
  category: p.category || 'flat_3_side',
  name_ja: p.name_ja || '',
  name_en: p.name_en || '',
  description_ja: p.description_ja || '',
  description_en: p.description_en || '',
  materials: Array.isArray(p.materials) ? p.materials : [],
  pricing_formula: p.pricing_formula || {},
  min_order_quantity: p.min_order_quantity || 0,
  lead_time_days: p.lead_time_days || 0,
  sort_order: p.sort_order || 0,
  is_active: p.is_active !== false,
  // ... other fields with defaults
}))
```

---

### 4.2 Unsafe Property Access - Line 181

**Location**: `src/app/catalog/CatalogClient.tsx:181`

**Issue**:
```typescript
const baseCost = (p.pricing_formula as any)?.base_cost || 0
```

**Problem**:
1. Uses `as any` to bypass type checking
2. No validation that pricing_formula has base_cost property
3. Could be undefined, null, or not an object

**Expected Behavior**: Should safely access nested properties.

**Actual Behavior**: May fail if pricing_formula structure is unexpected.

**Fix**:
```typescript
const baseCost =
  (typeof p.pricing_formula === 'object' && p.pricing_formula !== null && 'base_cost' in p.pricing_formula)
    ? (p.pricing_formula as { base_cost?: number }).base_cost || 0
    : 0
```

---

## 5. Rendering Issues

### 5.1 Product Card Null Safety - Lines 387-394

**Location**: `src/app/catalog/CatalogClient.tsx:387-394`

**Issue**:
```typescript
{filteredProducts && Array.isArray(filteredProducts) ? filteredProducts.map((product, index) => (
  <EnhancedProductCard
    key={product?.id || index}
    product={product}  // Could be null/undefined
    index={index}
    onSelect={() => product && setSelectedProduct(product)}
  />
)) : []}
```

**Problem**:
1. Array is checked but individual products are not validated
2. `product` parameter could be null/undefined
3. `EnhancedProductCard` might receive invalid product data
4. Key uses `product?.id` but product itself is not null-checked

**Expected Behavior**: Should filter out invalid products before rendering.

**Actual Behavior**: May render invalid products or crash.

**Fix**:
```typescript
{filteredProducts && Array.isArray(filteredProducts)
  ? filteredProducts
      .filter(product => product != null && product.id)
      .map((product, index) => (
        <EnhancedProductCard
          key={product.id}
          product={product}
          index={index}
          onSelect={() => setSelectedProduct(product)}
        />
      ))
  : []
}
```

---

### 5.2 Product List Item Null Safety - Lines 398-405

**Location**: `src/app/catalog/CatalogClient.tsx:398-405`

**Issue**: Same as above - products are not validated before mapping.

**Fix**: Apply same filtering pattern as grid view.

---

### 5.3 No Results State - Line 410

**Location**: `src/app/catalog/CatalogClient.tsx:410`

**Issue**:
```typescript
{!isLoading && (!filteredProducts || filteredProducts.length === 0) && (
```

**Problem**:
1. Inconsistent with other checks - uses `!filteredProducts` here but not elsewhere
2. Could show "no results" when products are actually loading (timing issue)
3. Should check `Array.isArray()` consistently

**Expected Behavior**: Should consistently handle null/undefined arrays.

**Actual Behavior**: Inconsistent null checking could cause UI glitches.

**Fix**:
```typescript
{!isLoading && (!filteredProducts || !Array.isArray(filteredProducts) || filteredProducts.length === 0) && (
```

---

## 6. Additional Issues

### 6.1 Inconsistent Null Checks Throughout File

**Pattern**: Some places check `products && Array.isArray(products)` while others don't.

**Impact**: Unpredictable behavior - some operations safe, others crash.

**Recommendation**: Create helper functions for consistent array validation:

```typescript
const isValidProductArray = (arr: unknown): arr is Product[] => {
  return Array.isArray(arr)
}

const isValidProduct = (product: unknown): product is Product => {
  return product != null &&
         typeof product === 'object' &&
         'id' in product &&
         'name_ja' in product
}
```

---

### 6.2 Missing Error Boundaries

**Issue**: No error boundary component to catch rendering errors.

**Impact**: Entire catalog page could crash from single product error.

**Recommendation**: Wrap product rendering in error boundary:

```typescript
<ProductGridErrorBoundary fallback={<ErrorFallback />}>
  {filteredProducts.map(product => <EnhancedProductCard product={product} />)}
</ProductGridErrorBoundary>
```

---

### 6.3 Race Condition in fetchProducts

**Location**: Lines 61-63

**Issue**:
```typescript
useEffect(() => {
  fetchProducts()
}, [])  // Empty dependency array
```

**Problem**:
1. If `useDBFiltering` changes after mount, fetchProducts won't re-run
2. Component might use wrong filtering mode
3. No way to refresh products without page reload

**Expected Behavior**: Should re-fetch when filtering mode changes.

**Actual Behavior**: Stuck with initial filtering mode.

**Fix**:
```typescript
useEffect(() => {
  fetchProducts()
}, [useDBFiltering])  // Re-fetch when mode changes
```

---

## 7. Summary of Fixes

### High Priority (Fix Immediately)

1. **Add null checks to all array operations** (lines 197, 289, 337)
2. **Fix useEffect dependencies** (lines 201-224, 227-239)
3. **Add mounted state tracking** (fetchProducts, applyDBFilters)
4. **Validate API responses** before using data
5. **Filter invalid products before rendering**

### Medium Priority (Fix Soon)

6. **Remove unsafe type casts** and add runtime validation
7. **Add error logging** for API failures
8. **Implement error boundaries** for product rendering
9. **Fix race condition** in fetchProducts

### Low Priority (Nice to Have)

10. **Create helper functions** for consistent array validation
11. **Add user feedback** for API failures
12. **Implement retry logic** for failed API calls

---

## 8. Testing Recommendations

### Unit Tests Needed

1. Test with `products = undefined`
2. Test with `products = null`
3. Test with `products = []`
4. Test with products having `materials = null`
5. Test with API returning errors (404, 500)
6. Test with API returning malformed JSON
7. Test with API returning invalid data structure
8. Test component unmounting during async operations
9. Test rapid filter changes (race conditions)
10. Test with products missing optional fields

### Integration Tests Needed

1. Test full fetch → filter → render flow
2. Test API failure → fallback flow
3. Test filter mode switching
4. Test sorting with various data states
5. Test concurrent filter changes

---

## 9. Recommended Code Structure

### Create a Custom Hook

Extract product fetching logic into a custom hook:

```typescript
// hooks/useProducts.ts
export function useProducts(options: { useDBFiltering: boolean }) {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // ... implementation with proper error handling and cleanup

  return { products, filteredProducts, isLoading, error, refetch }
}
```

### Create Validation Utilities

```typescript
// lib/product-validation.ts
export function isValidProduct(product: unknown): product is Product {
  // Runtime validation
}

export function sanitizeProducts(products: unknown[]): Product[] {
  return products.filter(isValidProduct)
}
```

---

## 10. Conclusion

The CatalogClient component has multiple runtime error vulnerabilities that could cause:

- **Crashes**: Null/undefined access in critical paths
- **Memory Leaks**: Unmounted component updates
- **Inconsistent Behavior**: Race conditions and stale closures
- **Poor User Experience**: Silent failures with no feedback

**Estimated Fix Time**: 4-6 hours for all high and medium priority issues.

**Risk Level**: HIGH - These issues are likely causing production console errors and potentially crashing the catalog page in edge cases.

**Next Steps**:
1. Implement high-priority fixes immediately
2. Add comprehensive error logging
3. Create unit tests for edge cases
4. Monitor console errors after deployment
5. Consider gradual refactoring to custom hooks for better maintainability
