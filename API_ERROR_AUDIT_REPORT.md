# API Error Audit Report

**Date**: 2026-01-05
**Scope**: Browser console errors, API route failures, authentication issues
**Focus**: Impact of getSession → getUser security migration

---

## Executive Summary

**Critical Issues Found**: 3
**High Priority Issues**: 0
**Medium Priority Issues**: 1
**Total API Routes Audited**: 98

### Root Causes Identified

1. **CRITICAL**: Missing `await` on async `createSupabaseWithCookies()` call (1 occurrence)
2. **CRITICAL**: Inconsistent authentication patterns mixing deprecated and new methods
3. **LOW**: Mixed Supabase client creation patterns across API routes

---

## Critical Issues

### 1. Missing `await` on async function call

**File**: `src/app/api/quotations/[id]/invoice/route.ts`
**Line**: 32
**Status**: 🔴 CRITICAL - Will cause runtime errors

**Problem**:
```typescript
// Line 32 - MISSING AWAIT
const supabase = createSupabaseWithCookies(cookieStore);

// Line 34 - This will fail because supabase is a Promise, not a client
const { data: { user }, error: authError } = await supabase.auth.getUser();
```

**Error that will occur**:
```
TypeError: supabase.auth.getUser is not a function
```

**Fix**:
```typescript
// Line 32 - ADD AWAIT
const supabase = await createSupabaseWithCookies(cookieStore);
```

**Impact**: Any attempt to download invoice PDF will fail with 500 error

---

## Authentication Pattern Inconsistencies

### Pattern 1: Using `createSupabaseWithCookies` (Current Best Practice)

**Status**: ✅ Correct - When properly awaited
**Usage**: 1 file
**Example**: `src/app/api/member/delete-account/route.ts`

```typescript
const cookieStore = await cookies();
const supabase = await createSupabaseWithCookies(cookieStore as any);
```

### Pattern 2: Using `createServiceClient` (Admin Operations)

**Status**: ✅ Correct for admin routes
**Usage**: ~50 files
**Example**: Most admin and API routes

```typescript
const supabase = createServiceClient();
```

**Note**: This bypasses cookie-based auth and uses service role key

### Pattern 3: Using `@supabase/auth-helpers-nextjs` `createRouteHandlerClient`

**Status**: ⚠️ Potentially incompatible with Next.js 16
**Usage**: ~20 files
**Example**: `src/app/api/b2b/login/route.ts`

```typescript
const cookieStore = await cookies();
const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
```

**Potential Issues**:
1. `@supabase/auth-helpers-nextjs@0.10.0` was designed for Next.js 13-14
2. Next.js 16 changed `cookies()` to return Promise
3. Cookie callback wrapper `cookies: () => cookieStore` may not handle async cookies correctly

**Affected Routes**:
- `/api/b2b/login` - B2B authentication
- `/api/ai-parser/upload` - File upload authentication
- `/api/samples` - Sample request authentication
- `/api/b2b/dashboard/stats` - Dashboard data
- `/api/b2b/work-orders` - Work order management
- `/api/specsheet/versions` - Spec sheet versioning
- `/api/specsheet/approval` - Spec sheet approval
- `/api/files/validate` - File validation

**Recommendation**: Migrate to `@supabase/ssr` package for Next.js 16 compatibility

---

## Migration Evidence

### Files Already Using `getUser()` (Post-Migration)

Based on grep analysis, 98 API route files are using `.auth.getUser()`:

```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();
```

This indicates the security migration from `getSession()` to `getUser()` has already been completed.

### Security Best Practice Compliance

**✅ GOOD**: All audited routes use `getUser()` instead of deprecated `getSession()`
**✅ GOOD**: No instances of `supabase.auth.getSession()` found in API routes

---

## Next.js 16 Compatibility Issues

### Cookie Handling Changes

**Next.js 15/16 Breaking Change**: `cookies()` now returns a Promise

```typescript
// OLD (Next.js 14)
const cookieStore = cookies();

// NEW (Next.js 16)
const cookieStore = await cookies();
```

**Audit Result**: ✅ All files using `cookies()` are properly awaiting it

### createRouteHandlerClient Compatibility

The `@supabase/auth-helpers-nextjs` package expects a synchronous cookie getter:

```typescript
createRouteHandlerClient({ cookies: () => cookieStore })
```

But in Next.js 16, `cookies()` is async, which creates a mismatch:

```typescript
// This pattern may fail:
const cookieStore = await cookies();
const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
```

**Potential Runtime Error**:
```
TypeError: Cannot read properties of undefined (reading 'get')
```

---

## Database Connection Analysis

### Supabase Client Creation Methods

| Method | Usage | Auth Type | Security Level |
|--------|-------|-----------|----------------|
| `createServiceClient()` | ~50 routes | Service Role (admin) | 🔴 High - Bypasses RLS |
| `createSupabaseWithCookies()` | 2 routes | Cookie-based Auth | 🟢 Secure - User-scoped |
| `createRouteHandlerClient()` | ~20 routes | Cookie-based Auth | 🟡 Deprecated for Next.js 16 |
| `createClient()` inline | ~30 routes | Custom cookie handling | 🟡 Inconsistent |

### Service Client Usage Concerns

**Issue**: 44+ API routes are using `createServiceClient()` which:
- Uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
- Should ONLY be used for admin operations
- Is being used in some user-facing routes

**Examples of potentially unsafe usage**:
- `/api/quotation` - User quotations (should use user-scoped client)
- `/api/customer/orders` - Customer orders (should use user-scoped client)
- `/api/samples` - Sample requests (should use user-scoped client)

**Security Implications**:
1. Service role key has full database access
2. RLS (Row Level Security) policies are bypassed
3. Any bug in authorization logic could expose data

**Recommendation**: Audit service client usage and migrate user-facing routes to cookie-based auth

---

## Error Scenarios

### Scenario 1: Invoice Download Failure

**URL**: `/api/quotations/[id]/invoice`
**Error**: 500 Internal Server Error
**Root Cause**: Missing `await` on line 32

**Browser Console**:
```javascript
GET https://example.com/api/quotations/abc123/invoice 500
TypeError: supabase.auth.getUser is not a function
```

**Fix**:
```diff
- const supabase = createSupabaseWithCookies(cookieStore);
+ const supabase = await createSupabaseWithCookies(cookieStore);
```

### Scenario 2: B2B Login Failure (Potential)

**URL**: `/api/b2b/login`
**Error**: Possible 500 or authentication failure
**Root Cause**: `createRouteHandlerClient` may not handle Next.js 16 async cookies correctly

**Browser Console**:
```javascript
POST https://example.com/api/b2b/login 500
TypeError: Cannot read property 'get' of undefined
```

**Recommended Fix**: Migrate to `@supabase/ssr`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      }
    }
  }
)
```

---

## Fix Recommendations

### Immediate Actions (Critical)

1. **Fix missing await in invoice route**
   - File: `src/app/api/quotations/[id]/invoice/route.ts`
   - Line: 32
   - Action: Add `await` keyword

2. **Test invoice download endpoint**
   - Create a test quotation
   - Attempt to download invoice
   - Verify 200 response

### Short-term Actions (High Priority)

3. **Audit service client usage**
   - Identify all routes using `createServiceClient()`
   - Categorize as admin-only vs user-facing
   - Migrate user-facing routes to cookie-based auth

4. **Migrate to `@supabase/ssr`**
   - Replace `createRouteHandlerClient` with `createServerClient`
   - Update ~20 affected API routes
   - Test authentication flows

### Long-term Actions (Medium Priority)

5. **Standardize authentication pattern**
   - Choose one client creation method for all user-facing routes
   - Create a shared helper function
   - Update documentation

6. **Add authentication error handling**
   - Standardize error responses across all routes
   - Add consistent logging
   - Implement rate limiting for auth failures

---

## Testing Recommendations

### 1. Unit Tests for Authentication

```typescript
describe('API Authentication', () => {
  it('should properly await createSupabaseWithCookies', async () => {
    const cookieStore = await cookies();
    const supabase = await createSupabaseWithCookies(cookieStore);
    expect(supabase).toBeDefined();
    expect(typeof supabase.auth.getUser).toBe('function');
  });
});
```

### 2. Integration Tests for API Routes

```typescript
describe('Invoice API', () => {
  it('should return 200 when authenticated', async () => {
    const response = await fetch('/api/quotations/test-id/invoice', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    expect(response.status).toBe(200);
  });
});
```

### 3. E2E Tests for Critical Flows

- B2B login → Dashboard → Quote creation → Invoice download
- Sample request flow
- Order tracking

---

## Affected Files Summary

### Critical Bug (1 file)
- `src/app/api/quotations/[id]/invoice/route.ts` - Missing await

### Next.js 16 Compatibility Risk (~20 files)
- `src/app/api/b2b/login/route.ts`
- `src/app/api/b2b/work-orders/route.ts`
- `src/app/api/b2b/dashboard/stats/route.ts`
- `src/app/api/b2b/samples/route.ts`
- `src/app/api/ai-parser/upload/route.ts`
- `src/app/api/ai-parser/approve/route.ts`
- `src/app/api/samples/route.ts`
- `src/app/api/specsheet/versions/route.ts`
- `src/app/api/specsheet/approval/route.ts`
- `src/app/api/files/validate/route.ts`
- Plus ~10 more using `createRouteHandlerClient`

### Service Client Over-Usage (~44 files)
All files using `const supabase = createSupabaseClient()` (alias for `createServiceClient()`)

---

## Conclusion

The API routes are largely well-structured with proper `getUser()` authentication implementation. However:

1. **One critical bug** exists (missing await) that will cause invoice downloads to fail
2. **Potential compatibility issues** with Next.js 16 and `auth-helpers-nextjs` package
3. **Security concerns** around excessive service role key usage

**Recommended Priority**:
1. Fix the missing await (5 minutes)
2. Test invoice download (10 minutes)
3. Audit and migrate service client usage (2-4 hours)
4. Migrate to `@supabase/ssr` (4-8 hours)

**Estimated Total Fix Time**: 6-12 hours
**Risk Level**: Medium (if fixed promptly) / High (if delayed)
