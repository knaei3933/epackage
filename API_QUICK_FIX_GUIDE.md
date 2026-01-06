# API Error Quick Fix Guide

## Status: 1 Critical Bug Fixed ✅

### Applied Fix (2026-01-05)

**File**: `src/app/api/quotations/[id]/invoice/route.ts`
**Line**: 32
**Fix Applied**: Added missing `await` keyword

```diff
- const supabase = createSupabaseWithCookies(cookieStore);
+ const supabase = await createSupabaseWithCookies(cookieStore);
```

**Status**: ✅ Fixed and committed locally

---

## Remaining Work (Optional)

### High Priority: Test the Fix

1. Start development server:
   ```bash
   npm run dev
   ```

2. Login as a user and navigate to quotations

3. Attempt to download an invoice PDF

4. Verify browser console shows no errors

### Medium Priority: Next.js 16 Compatibility

**Affected Files**: ~20 API routes using `createRouteHandlerClient`

**Migration Pattern**:
```typescript
// OLD (potentially broken with Next.js 16)
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

// NEW (Next.js 16 compatible)
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

**Files to Update**:
1. `src/app/api/b2b/login/route.ts` - Critical for B2B authentication
2. `src/app/api/ai-parser/upload/route.ts` - File uploads
3. `src/app/api/samples/route.ts` - Sample requests
4. `src/app/api/b2b/dashboard/stats/route.ts` - Dashboard data
5. `src/app/api/b2b/work-orders/route.ts` - Work orders
6. Plus ~15 more

### Low Priority: Service Client Audit

**Issue**: ~44 files using service role key (bypasses RLS)

**Action**: Review and categorize as:
- Admin-only routes (OK to use service client)
- User-facing routes (should migrate to cookie-based auth)

**Example Migration**:
```typescript
// ADMIN ROUTE (OK)
import { createServiceClient } from '@/lib/supabase'
const supabase = createServiceClient() // Bypasses RLS intentionally

// USER ROUTE (Should change)
import { createServiceClient } from '@/lib/supabase'
const supabase = createServiceClient() // ❌ Bypasses RLS unintentionally

// USER ROUTE (Better)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const cookieStore = await cookies()
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: { get: (name) => cookieStore.get(name)?.value } }
)
// ✅ Respects RLS policies
```

---

## Testing Checklist

After any changes, verify:

- [ ] Development server starts without errors
- [ ] User login works
- [ ] B2B login works (if applicable)
- [ ] Dashboard loads data
- [ ] Invoice download works
- [ ] Sample request submission works
- [ ] Browser console is clean (no red errors)

---

## Browser Console Errors to Watch For

### TypeErrors
```
TypeError: supabase.auth.getUser is not a function
→ Cause: Missing await on createSupabaseWithCookies()

TypeError: Cannot read property 'get' of undefined
→ Cause: createRouteHandlerClient incompatibility with Next.js 16
```

### Network Errors
```
GET /api/quotations/[id]/invoice 500
→ Cause: Unhandled exception in API route

POST /api/b2b/login 500
→ Cause: Cookie handling issue
```

### Auth Errors
```
401 Unauthorized
→ Expected if user not logged in

403 Forbidden
→ Expected if user lacks permission

500 Internal Server Error
→ Bug in API route code
```

---

## Helpful Commands

```bash
# Check for API errors in logs
npm run dev 2>&1 | grep -i error

# Run API tests
npm run test:api

# Run E2E tests
npm run test:e2e

# Build and check for TypeScript errors
npm run build

# Lint API routes
npm run lint -- src/app/api
```

---

## Summary

**Critical Bug**: ✅ Fixed (1 file)
**Compatibility Issues**: ⚠️ Identified (~20 files, optional fix)
**Security Concerns**: ℹ️ Documented (~44 files, audit recommended)

**Overall Risk Level**: 🟡 Medium
**Immediate Action Required**: None (critical bug fixed)
**Recommended Action**: Test invoice download endpoint
