# Dev Mode Code Removal Summary

## Date
2026-02-01

## Objective
Remove Dev Mode related code from API route files to simplify authentication flow and improve production security.

## Files Modified

### 1. `src/app/api/member/korea/send-data/route.ts`
**Changes:**
- Removed `x-dev-mode` header check
- Removed `x-user-id` Dev Mode header check
- Simplified `getAuthenticatedUserId()` function to only check middleware and normal auth

**Before:**
```typescript
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const devModeUserId = request.headers.get('x-user-id');
  const isDevMode = request.headers.get('x-dev-mode') === 'true';

  if (isDevMode && devModeUserId) {
    console.log('[Korea Send Data] DEV_MODE: Using x-user-id header:', devModeUserId);
    return devModeUserId;
  }
  // ... rest of auth logic
}
```

**After:**
```typescript
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Korea Send Data] Using user ID from middleware:', userIdFromMiddleware);
    return userIdFromMiddleware;
  }
  // ... rest of auth logic
}
```

### 2. `src/app/api/member/orders/route.ts`
**Changes:**
- Removed `x-dev-mode` header check
- Removed Dev Mode conditional logic
- Simplified `getAuthenticatedUser()` function

**Before:**
```typescript
async function getAuthenticatedUser(request: NextRequest) {
  const devModeUserId = request.headers.get('x-user-id');
  const isDevMode = request.headers.get('x-dev-mode') === 'true';

  let userId: string;
  let user: any;
  let supabase: any;

  if (isDevMode && devModeUserId) {
    // DEV_MODE: Use header from middleware
    console.log('[Orders API] DEV_MODE: Using x-user-id header:', devModeUserId);
    userId = devModeUserId;
    user = { id: devModeUserId };
    const { client: supabaseClient } = createSupabaseSSRClient(request);
    supabase = supabaseClient;
  } else {
    // Normal auth: Use cookie-based auth
    // ... rest of logic
  }
}
```

**After:**
```typescript
async function getAuthenticatedUser(request: NextRequest) {
  // Normal auth: Use cookie-based auth
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let userId: string;
  let user: any;
  let supabase: any;

  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    // ... middleware logic
  } else {
    // Fallback to SSR client auth
    // ... normal auth logic
  }
}
```

### 3. `src/app/api/member/quotations/[id]/export/route.ts`
**Changes:**
- Removed `x-dev-mode` header check
- Removed Dev Mode conditional logic
- Simplified `getAuthenticatedUser()` function

**Before:**
```typescript
async function getAuthenticatedUser(request: NextRequest) {
  const devModeUserId = request.headers.get('x-user-id');
  const isDevMode = request.headers.get('x-dev-mode') === 'true';

  let userId: string;
  let user: any;

  if (isDevMode && devModeUserId) {
    console.log('[Quotation Export] DEV_MODE: Using x-user-id header:', devModeUserId);
    userId = devModeUserId;
    user = { id: devModeUserId, email: 'dev@example.com' };
  } else {
    // Normal auth logic
  }
}
```

**After:**
```typescript
async function getAuthenticatedUser(request: NextRequest) {
  // Normal auth: Use cookie-based auth with createSupabaseSSRClient
  const { client: supabase } = createSupabaseSSRClient(request);
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const userId = authUser.id;
  const user = authUser;
  console.log('[Quotation Export] Authenticated user:', userId);

  return { userId, user };
}
```

### 4. `src/app/api/member/hanko/upload/route.ts`
**Changes:**
- Removed `x-dev-mode` header check
- Removed `x-user-id` Dev Mode header check
- Simplified `getAuthenticatedUserId()` function

**Before:**
```typescript
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const devModeUserId = request.headers.get('x-user-id');
  const isDevMode = request.headers.get('x-dev-mode') === 'true';

  if (isDevMode && devModeUserId) {
    console.log('[Hanko Upload] DEV_MODE: Using x-user-id header:', devModeUserId);
    return devModeUserId;
  }
  // ... rest of auth logic
}
```

**After:**
```typescript
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Hanko Upload] Using user ID from middleware:', userIdFromMiddleware);
    return userIdFromMiddleware;
  }
  // ... rest of auth logic
}
```

### 5. `src/app/api/member/certificates/generate/route.ts`
**Changes:**
- Removed `x-dev-mode` header check
- Removed `x-user-id` Dev Mode header check
- Simplified `getAuthenticatedUserId()` function

**Before:**
```typescript
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const devModeUserId = request.headers.get('x-user-id');
  const isDevMode = request.headers.get('x-dev-mode') === 'true';

  if (isDevMode && devModeUserId) {
    console.log('[Certificate Generation] DEV_MODE: Using x-user-id header:', devModeUserId);
    return devModeUserId;
  }
  // ... rest of auth logic
}
```

**After:**
```typescript
async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  // Try to get user from middleware header first (more reliable)
  const userIdFromMiddleware = request.headers.get('x-user-id');
  const isFromMiddleware = request.headers.get('x-auth-from') === 'middleware';

  if (userIdFromMiddleware && isFromMiddleware) {
    console.log('[Certificate Generation] Using user ID from middleware:', userIdFromMiddleware);
    return userIdFromMiddleware;
  }
  // ... rest of auth logic
}
```

## Authentication Flow After Changes

All API routes now follow a consistent authentication pattern:

1. **Middleware Authentication (Priority):**
   - Checks for `x-user-id` header from middleware
   - Verifies `x-auth-from` header is set to 'middleware'
   - Uses this user ID if both headers are present

2. **Fallback Authentication:**
   - Creates Supabase SSR client
   - Uses cookie-based authentication
   - Retrieves user from session

## Benefits

1. **Improved Security:**
   - Removed bypass mechanism that could be exploited
   - All requests now require proper authentication

2. **Code Simplification:**
   - Removed conditional logic branching
   - Consistent authentication pattern across all routes
   - Easier to maintain and debug

3. **Production Readiness:**
   - No development-only code paths in production
   - Cleaner authentication flow
   - Better auditability

## Build Verification

Build completed successfully with no errors:
```
✓ Compiled successfully in 10.2s
✓ Generating static pages using 19 workers (218/218) in 1170.2ms
```

## Next Steps

1. Test all affected API routes to ensure authentication still works correctly
2. Verify middleware authentication is properly configured
3. Monitor for any authentication-related issues in production logs
4. Consider removing Dev Mode utility functions if no longer used elsewhere

## Related Files

- `src/middleware.ts` - Handles authentication and sets headers
- `src/lib/supabase-ssr.ts` - Supabase SSR client utility
- `src/lib/supabase-authenticated.ts` - Authenticated service client
