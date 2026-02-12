# Build Error Fix Report

## Issue
Vercel build was failing due to **module-level environment variable checks** in API routes. When Next.js runs the "Collecting page data" phase during build, environment variables like `NEXT_PUBLIC_SUPABASE_URL` are not available, causing `throw new Error('Missing Supabase environment variables')` to fail the build.

## Root Cause
The environment variable checks were placed at the **module level** (top of the file), which executes during module loading. During Vercel's build process, these environment variables don't exist yet, causing the build to fail.

## Solution
Move environment variable checks from module level to **inside route handler functions** (POST/GET/PATCH/DELETE), where they execute at request time when environment variables are available.

## Fix Pattern

**BEFORE:**
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, { ... });
}
```

**AFTER:**
```typescript
export async function POST(request: NextRequest) {
  // Get environment variables at request time
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase environment variables not configured' },
      { status: 500 }
    );
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, { ... });
}
```

## Files Fixed (9 files)
1. ✅ `src/app/api/admin/orders/[id]/shipping-info/route.ts`
2. ✅ `src/app/api/admin/orders/[id]/start-production/route.ts`
3. ✅ `src/app/api/admin/quotations/route.ts`
4. ✅ `src/app/api/profile/route.ts`
5. ✅ `src/app/api/profile/[id]/route.ts`
6. ✅ `src/app/api/orders/route.ts`
7. ✅ `src/app/api/orders/[id]/route.ts`
8. ✅ `src/app/api/quotation/route.ts`
9. ✅ `src/app/api/orders/[id]/status/route.ts`
10. ✅ `src/app/api/orders/[id]/cancel/route.ts`

## Files Still Needing Fix (17 files)
1. ❌ `src/app/api/quotations/save/route.ts`
2. ❌ `src/app/api/shipments/[id]/route.ts`
3. ❌ `src/app/api/quotations/guest-save/route.ts`
4. ❌ `src/app/api/cron/archive-orders/route.ts`
5. ❌ `src/app/api/admin/orders/bulk-status/route.ts`
6. ❌ `src/app/api/admin/orders/[id]/payment-confirmation/route.ts`
7. ❌ `src/app/api/admin/orders/[id]/send-to-korea/route.ts`
8. ❌ `src/app/api/admin/orders/[id]/delivery-note/route.ts`
9. ❌ `src/app/api/member/quotations/[id]/route.ts`
10. ❌ `src/app/api/member/orders/[id]/production-data/route.ts`
11. ❌ `src/app/api/member/quotations/[id]/invoice/route.ts`
12. ❌ `src/app/api/member/orders/[id]/spec-approval/route.ts`
13. ❌ `src/app/api/member/quotations/[id]/confirm-payment/route.ts`
14. ❌ `src/app/api/member/orders/[id]/data-receipt/route.ts`
15. ❌ `src/app/api/member/quotations/route.ts`
16. ❌ `src/app/api/member/orders/confirm/route.ts`
17. ❌ (possibly more)

## Notes
- Some files use helper functions like `createSupabaseClient()` - these need to be modified to include env checks inside the helper
- Files using `supabaseServiceKey` instead of `supabaseAnonKey` need similar treatment
- The module-level `const supabaseService = createClient(...)` pattern also needs to be moved to request time

## Verification
Run `npm run build` locally to verify the build passes without the "Missing Supabase environment variables" error during the "Collecting page data" phase.
