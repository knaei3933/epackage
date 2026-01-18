# Group C (Member) E2E Tests - DEV_MODE Cookie Fix

## Issue Summary

The Group C (Member) E2E tests were showing "missing required error components, refreshing..." error instead of rendering member pages properly. Despite cookies and localStorage being correctly set in the tests, server components were failing to authenticate users.

## Root Cause Analysis

### The Problem Flow

1. **Test Setup**: Playwright sets `dev-mock-user-id` cookie using `page.context().addCookies()`
2. **Page Navigation**: When navigating to `/member/dashboard`, the Next.js middleware runs first
3. **Middleware Logic**: The middleware correctly detects DEV_MODE and the cookie, then sets response headers:
   - `x-dev-mode: true`
   - `x-user-id: {cookie value}`
   - `x-user-role: MEMBER`
   - `x-user-status: ACTIVE`
4. **Server Component**: The dashboard page component calls `requireAuth()` → `getCurrentUser()` → `getCurrentUserId()`
5. **Bug**: `getCurrentUserId()` in DEV_MODE was trying to read from the `cookies()` API directly, but:
   - The `cookies()` API doesn't see cookies set via Playwright's browser context
   - The function wasn't checking headers that the middleware had already set
   - This caused authentication to fail and throw `AuthRequiredError`

### The Code Issue

In `src/lib/dashboard.ts`, the `getCurrentUserId()` function had this logic:

```typescript
if (isDevModeEnabled) {
  // Client-side: document.cookieから読み取り
  if (typeof document !== 'undefined') {
    // ... reads from document.cookie
  }

  // Server-side: cookies() API使用
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const mockUserIdCookie = cookieStore.get('dev-mock-user-id');
    // ... tries to read cookie
  }
}
```

The problem: The server-side `cookies()` API reads cookies from the incoming HTTP request, but Playwright's cookies set via `page.context().addCookies()` are only sent if the cookie domain and path match correctly. More importantly, the middleware had already processed the cookie and set it in headers, but the server component wasn't checking those headers.

## The Fix

Updated `getCurrentUserId()` to check headers FIRST before trying to read cookies:

```typescript
if (isDevModeEnabled) {
  // =====================================================
  // DEV_MODE: Check headers first (set by middleware)
  // =====================================================
  // Server-side: middlewareが設定したheadersから読み取り (最優先)
  if (typeof window === 'undefined') {
    try {
      const { headers } = await import('next/headers');
      const headersList = await headers();

      // Check for x-dev-mode header first (middleware sets this in DEV_MODE)
      const devModeHeader = headersList.get('x-dev-mode');
      if (devModeHeader === 'true') {
        const userId = headersList.get('x-user-id');
        if (userId && userId !== '00000000-0000-0000-0000-000000000000') {
          console.log('[getCurrentUserId] DEV_MODE: Found user ID from middleware headers:', userId);
          return userId;
        }
      }
    } catch (e) {
      console.warn('[getCurrentUserId] DEV_MODE: Could not read headers:', e);
    }
  }

  // Client-side: document.cookieから読み取り
  if (typeof document !== 'undefined') {
    // ... existing client-side logic
  }

  // Server-side: cookies() API使用 (fallback)
  if (typeof window === 'undefined') {
    // ... existing cookies() API logic
  }

  // ... rest of fallback logic
}
```

## Key Changes

1. **Priority Order**: Headers (from middleware) → Client cookies → Server cookies API → localStorage → Mock ID
2. **Header Check**: Added check for `x-dev-mode: true` header to ensure we only use middleware headers when in DEV_MODE
3. **Validation**: Exclude the empty UUID `00000000-0000-0000-0000-000000000000` which middleware uses as a fallback

## Why This Works

1. **Middleware runs first**: When a request comes in, Next.js middleware runs before server components
2. **Cookie is sent with request**: Playwright's cookies ARE sent with the HTTP request (that's how middleware reads them)
3. **Middleware sets headers**: The middleware reads the cookie and sets response headers
4. **Server components read headers**: The updated `getCurrentUserId()` now reads from headers that middleware set
5. **Fallback chain**: If headers aren't available, it falls back to the original cookie reading logic

## Files Modified

- `src/lib/dashboard.ts`: Updated `getCurrentUserId()` to check headers first in DEV_MODE

## Testing

The fix ensures that:

1. Member pages render correctly in DEV_MODE without authentication errors
2. Server components can read user ID from headers set by middleware
3. The authentication flow works: Cookie → Middleware → Headers → Server Component
4. Backward compatibility is maintained with fallback logic

## Expected Test Results

After this fix:
- All 24 failing Group C tests should pass
- No "missing required error components" errors
- Pages should render with proper mock data in DEV_MODE
- Cookie and localStorage should still be properly set in tests

## Related Code

- `src/middleware.ts`: Lines 376-406 handle DEV_MODE cookie reading and header setting
- `src/lib/dashboard.ts`: Lines 168-263 handle user ID retrieval in DEV_MODE
- `tests/helpers/dev-mode-auth.ts`: Lines 139-205 handle DEV_MODE authentication setup in tests
