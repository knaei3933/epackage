# CatalogClient Console Error Reference

**Document**: Maps specific console errors to code locations in CatalogClient.tsx
**Date**: 2026-01-08

---

## Quick Reference Table

| Error Message | Location | Severity | Fix Line |
|--------------|----------|----------|----------|
| "Cannot read property 'length' of undefined" | Line 289 | HIGH | Add optional chaining |
| "Cannot read property 'length' of undefined" | Line 337 | HIGH | Add optional chaining |
| "Cannot read property 'flatMap' of undefined" | Line 197 | HIGH | Fix array validation |
| "Cannot read property 'map' of undefined" | Line 387 | HIGH | Add array check |
| "Cannot read property 'materials' of undefined" | Line 197 | MEDIUM | Fix flatMap callback |
| React Hook dependency warning | Lines 201-224 | MEDIUM | Add missing deps |
| React Hook dependency warning | Lines 227-239 | MEDIUM | Add missing deps |
| "Can't perform a React state update on an unmounted component" | Lines 65-95, 98-134 | MEDIUM | Add mounted check |
| "result.success is undefined" | Line 73 | LOW | Validate API response |
| "result.data is undefined" | Line 73 | LOW | Validate API response |

---

## Detailed Error Analysis

### Error 1: TypeError - Cannot read property 'length' of undefined

**Console Output**:
```
TypeError: Cannot read property 'length' of undefined
    at CatalogClient (CatalogClient.tsx:289:XX)
    at renderWithHooks
    ...
```

**When it occurs**:
- Initial render before API completes
- After API error if state gets set to undefined
- During rapid filter changes

**Stack trace locations**:
- **Line 289**: `{products.length}` in header
- **Line 337**: `{filteredProducts.length}` in results count
- **Line 327**: `filteredProducts.length` prop to AdvancedFilters

**Fix**:
```typescript
// Line 289
全 {products?.length || 0} 種類の製品

// Line 337
{isLoading ? '読み込み中...' : `${filteredProducts?.length || 0}件の製品`}

// Line 327
filteredProductsCount={filteredProducts?.length || 0}
```

---

### Error 2: TypeError - Cannot read property 'flatMap' of undefined

**Console Output**:
```
TypeError: Cannot read property 'flatMap' of undefined
    at CatalogClient (CatalogClient.tsx:197:XX)
```

**When it occurs**:
- When `products` state is undefined
- During initial render before fetch completes
- If API returns null instead of array

**Location**: Line 197

**Root Cause**:
```typescript
products.flatMap(product => product.materials || [])
// products could be undefined here
```

**Fix**:
```typescript
(products || []).flatMap(product => product?.materials || [])
// OR
(products && Array.isArray(products) ? products.flatMap(product => product?.materials || []) : [])
```

---

### Error 3: TypeError - Cannot read property 'map' of undefined

**Console Output**:
```
TypeError: Cannot read property 'map' of undefined
    at CatalogClient (CatalogClient.tsx:387:XX)
```

**When it occurs**:
- When `filteredProducts` becomes undefined
- During filter transitions
- After failed filter operations

**Locations**:
- **Line 387**: Grid view map
- **Line 398**: List view map

**Root Cause**:
```typescript
{filteredProducts && Array.isArray(filteredProducts) ? filteredProducts.map(...) : []}
// Check is present but inconsistent
```

**Fix**:
```typescript
// Add validation and filtering
{filteredProducts && Array.isArray(filteredProducts)
  ? filteredProducts
      .filter(p => p != null)
      .map((product, index) => ...)
  : []
}
```

---

### Error 4: React Hook Warning - Missing Dependency

**Console Output**:
```
Warning: React Hook useEffect has a missing dependency: 'filteredProducts'.
Either include it or remove the dependency array.
    at CatalogClient (CatalogClient.tsx:224:XX)
```

**When it occurs**:
- Every render in development mode
- React's exhaustive-deps ESLint rule

**Locations**:
- **Line 224**: Sorting useEffect
- **Line 239**: Filter change useEffect

**Root Cause**:
```typescript
useEffect(() => {
  // Uses filteredProducts but doesn't list it in deps
  let sorted = filteredProducts || []
  // ...
}, [filterState.sortBy])  // Missing filteredProducts
```

**Fix Options**:

Option 1: Add dependency (causes re-sort on every product change)
```typescript
}, [filterState.sortBy, filteredProducts])
```

Option 2: Use useMemo (recommended)
```typescript
const sortedProducts = useMemo(() => {
  if (!filteredProducts || !Array.isArray(filteredProducts)) return []
  return [...filteredProducts].sort((a, b) => {...})
}, [filteredProducts, filterState.sortBy])
```

---

### Error 5: Warning - Can't Perform State Update on Unmounted Component

**Console Output**:
```
Warning: Can't perform a React state update on an unmounted component.
This is a no-op, but it indicates a memory leak in your application.
To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
    in CatalogClient (at CatalogClient.tsx:XX)
```

**When it occurs**:
- User navigates away before API completes
- Rapid page navigation
- Component unmounts during fetch

**Locations**:
- **Line 74**: `setProducts(result.data)`
- **Line 75**: `setFilteredProducts(result.data)`
- **Line 76**: `setIsLoading(false)`
- **Line 90-91**: State updates in catch block
- **Line 120**: `setFilteredProducts(result.data)` in applyDBFilters

**Root Cause**:
```typescript
const fetchProducts = async () => {
  setIsLoading(true)
  try {
    // ... async operation that might complete after unmount
    setProducts(result.data)  // <-- Called after unmount
  }
}
```

**Fix**:
```typescript
useEffect(() => {
  let isMounted = true

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/products')
      const result = await response.json()

      if (isMounted && result.success) {
        setProducts(result.data)
        setFilteredProducts(result.data)
      }
    } finally {
      if (isMounted) {
        setIsLoading(false)
      }
    }
  }

  fetchProducts()

  return () => {
    isMounted = false
  }
}, [])
```

---

### Error 6: TypeError - Cannot read property 'materials' of undefined

**Console Output**:
```
TypeError: Cannot read property 'materials' of undefined
    at Array.flatMap (<anonymous>)
    at CatalogClient (CatalogClient.tsx:197:XX)
```

**When it occurs**:
- Array contains null/undefined products
- API returns malformed data
- Product objects missing required fields

**Location**: Line 197

**Root Cause**:
```typescript
products.flatMap(product => product.materials || [])
// If product is undefined, product.materials throws
```

**Fix**:
```typescript
products.flatMap(product => product?.materials || [])
// Add optional chaining
```

---

### Error 7: TypeError - Cannot read property 'success' of undefined

**Console Output**:
```
TypeError: Cannot read property 'success' of undefined
    at fetchProducts (CatalogClient.tsx:73:XX)
```

**When it occurs**:
- API returns non-JSON response
- API returns empty response
- JSON parsing fails silently

**Location**: Line 73

**Root Cause**:
```typescript
const result = await response.json()
if (result.success && result.data) {
  // result might be undefined if JSON fails
}
```

**Fix**:
```typescript
try {
  const result = await response.json()
  if (result?.success && result?.data) {
    setProducts(result.data)
    setFilteredProducts(result.data)
  }
} catch (parseError) {
  console.error('JSON parse error:', parseError)
}
```

---

### Error 8: Network/Fetch Errors

**Console Output**:
```
Failed to fetch products: TypeError: Failed to fetch
    at fetchProducts (CatalogClient.tsx:87:XX)
```

**When it occurs**:
- Network is offline
- API server is down
- CORS issues
- Invalid API URL

**Location**: Line 87 (catch block)

**Current Behavior**: Falls back to static data silently

**Issue**: User doesn't know API failed

**Fix**:
```typescript
catch (error) {
  console.error('Failed to fetch products:', error)

  // Add user notification
  if (typeof window !== 'undefined') {
    console.warn('Using fallback data due to API failure')
  }

  const safeProducts = getAllProducts(null, 'ja') as unknown as Product[]
  setProducts(safeProducts)
  setFilteredProducts(safeProducts)
}
```

---

### Error 9: Filter API Errors

**Console Output**:
```
DB filter error: TypeError: Failed to fetch
    at applyDBFilters (CatalogClient.tsx:128:XX)
```

**When it occurs**:
- Filter API endpoint fails
- Network issues during filtering
- Invalid filter parameters

**Location**: Line 128

**Current Behavior**: Falls back to client-side filtering

**Fix**: Already has fallback, but should add error notification

---

## Diagnostic Commands

### Check for Specific Errors in Browser Console

```javascript
// Check for undefined length errors
console.log('Products:', typeof products, Array.isArray(products))
console.log('Filtered products:', typeof filteredProducts, Array.isArray(filteredProducts))
console.log('Products length:', products?.length)
console.log('Filtered length:', filteredProducts?.length)

// Check for null products in array
console.log('Null products:', products?.filter(p => !p))
console.log('Invalid products:', products?.filter(p => !p?.id))

// Check API responses
fetch('/api/products')
  .then(r => r.json())
  .then(data => console.log('API response:', data))
  .catch(err => console.error('API error:', err))
```

### Monitor State Changes

```javascript
// Add to component for debugging
useEffect(() => {
  console.log('Products changed:', {
    productsLength: products?.length,
    filteredLength: filteredProducts?.length,
    isLoading,
    useDBFiltering
  })
}, [products, filteredProducts, isLoading, useDBFiltering])
```

---

## Common Error Scenarios

### Scenario 1: Page Load Race Condition

**Symptoms**:
- Brief flash of error on page load
- "Cannot read property 'length' of undefined"
- Resolves after a moment

**Cause**: Initial state has empty array, but some code paths set to undefined

**Fix**: Ensure useState initializes with empty array and never sets to undefined

### Scenario 2: Rapid Filter Changes

**Symptoms**:
- Errors when quickly changing filters
- State updates after unmount warnings
- Stale data display

**Cause**: Multiple concurrent filter operations

**Fix**: Add debouncing or cancel previous operations

### Scenario 3: API Failure

**Symptoms**:
- Silent fallback to static data
- No user feedback
- Inconsistent behavior

**Cause**: API errors caught but not communicated

**Fix**: Add error notifications and user feedback

### Scenario 4: Navigation During Fetch

**Symptoms**:
- Memory leak warnings
- State update after unmount
- Console errors after leaving page

**Cause**: Async operations complete after unmount

**Fix**: Track mounted status and prevent updates

---

## Prevention Checklist

### Before Deploying Changes

- [ ] All array accesses use optional chaining or null checks
- [ ] All useEffect hooks have correct dependencies
- [ ] All async operations track mounted status
- [ ] All API responses are validated before use
- [ ] Error notifications are added for user-facing failures
- [ ] Products are filtered to remove null/undefined before rendering
- [ ] Console has no warnings in development mode
- [ ] Tested with slow network (Chrome DevTools throttling)
- [ ] Tested with offline mode
- [ ] Tested rapid filter changes

### Monitoring in Production

```javascript
// Add error tracking
window.addEventListener('error', (event) => {
  if (event.message.includes('Cannot read property')) {
    // Log to error tracking service
    console.error('Runtime error:', {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      col: event.colno
    })
  }
})
```

---

## Related Files to Check

Based on the dependencies in CatalogClient.tsx, also check these files for similar issues:

1. **src/components/catalog/EnhancedProductCard.tsx**
   - Check for null product handling
   - Verify optional chaining on product properties

2. **src/components/catalog/ProductListItem.tsx**
   - Same checks as EnhancedProductCard

3. **src/components/catalog/AdvancedFilters.tsx**
   - Check if it handles undefined filteredProductsCount

4. **src/lib/product-data.ts**
   - Verify getAllProducts always returns valid array
   - Check for null values in returned products

5. **src/app/api/products/route.ts**
   - Verify API never returns null
   - Add error responses for all failure modes

---

## Quick Fix Summary

Copy-paste these fixes for immediate relief:

```typescript
// Fix 1: Add null checks to state initializers
const [products, setProducts] = useState<Product[]>([])
const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

// Fix 2: Safe array access helper
const safeProducts = products || []
const safeFilteredProducts = filteredProducts || []

// Fix 3: Safe length checks
products?.length ?? 0
filteredProducts?.length ?? 0

// Fix 4: Safe mapping
filteredProducts?.filter(p => p != null).map(product => ...)

// Fix 5: Mounted state pattern
useEffect(() => {
  let isMounted = true
  // ... async code
  return () => { isMounted = false }
}, [])

// Fix 6: Validate API responses
if (result?.success && Array.isArray(result?.data)) {
  setProducts(result.data)
}
```

---

**Last Updated**: 2026-01-08
**Document Version**: 1.0
**Maintained By**: Development Team
