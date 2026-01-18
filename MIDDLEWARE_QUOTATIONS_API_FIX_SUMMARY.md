# Middleware Redirect Loop Fix for /api/member/quotations

**Date:** 2026-01-13
**Issue:** Redirect loop when accessing `/api/member/quotations` API

## Problem Description

When accessing the quotations page at `/member/quotations`, the browser would show `net::ERR_TOO_MANY_REDIRECTS` error. The server logs showed no request to `/api/member/quotations`, indicating the redirect loop was happening in the middleware before the request could reach the API route.

### Root Cause

The `/api/member` exemption in the middleware was nested INSIDE the `/api` route block, which meant:

1. First, the middleware checked if the path starts with `/api`
2. Then it checked various other conditions (DEV_MODE, etc.)
3. Only then would it check for `/api/member` exemption

This ordering caused issues because:
- The middleware would authenticate `/member/quotations` page (which works)
- The page would then make a fetch request to `/api/member/quotations`
- The middleware would process this request through multiple checks
- The `/api/member` exemption was not being hit early enough
- This could cause redirect loops in certain edge cases

## Solution

**Move the `/api/member` exemption to the VERY BEGINNING of the middleware function, right after pathname extraction.**

### Changes Made to `src/middleware.ts`

#### Before (Line 291-296):
```typescript
if (pathname.startsWith('/api')) {
  // ... other checks ...

  // /api/member exemption was nested here
  if (pathname.startsWith('/api/member')) {
    return addSecurityHeaders(NextResponse.next());
  }
}
```

#### After (Line 238-279):
```typescript
// CRITICAL: API Route Exemptions - MUST BE FIRST CHECK
// These routes handle their own authentication and must bypass ALL middleware logic
// Check this BEFORE any other logic to prevent redirect loops
if (pathname.startsWith('/api/auth')) {
  return addSecurityHeaders(NextResponse.next());
}

// /api/member routes - pass through with authentication headers for API to use
if (pathname.startsWith('/api/member')) {
  // Extract user info and add to headers for the API route to use
  const supabase = createMiddlewareClient(request);
  const { data: { user }, error } = await supabase.auth.getUser();

  const response = NextResponse.next();

  if (user && !error) {
    const profile = await getUserProfile(supabase, user.id);
    response.headers.set('x-user-id', user.id);
    response.headers.set('x-user-role', profile?.role || 'MEMBER');
    response.headers.set('x-user-status', profile?.status || 'ACTIVE');
  }

  return addSecurityHeaders(response);
}
```

### Key Improvements

1. **Early Exemption**: `/api/member` routes are now exempted FIRST, before any other middleware logic
2. **Header Preservation**: The exemption still extracts and sets authentication headers (`x-user-id`, `x-user-role`, `x-user-status`) so the API routes can use them
3. **No Redirects**: Since this happens before any authentication checks, there's no possibility of redirect loops

## Testing

### Manual Testing Steps

1. Start dev server: `npm run dev` (runs on port 3000)
2. Navigate to `http://localhost:3000/auth/signin`
3. Login with: `member@test.com` / `Member1234!`
4. Navigate to `http://localhost:3000/member/quotations`
5. Verify:
   - Page loads without redirect loop errors
   - Quotations list displays (if user has quotations)
   - No `ERR_TOO_MANY_REDIRECTS` in browser console
   - Server logs show: `[Middleware] EARLY EXEMPTION for /api/member route: /api/member/quotations`

### Expected Server Logs

```
[Middleware] EXECUTING for path: /member/quotations
[Middleware] Path: /member/quotations
[Middleware] User found: true
[Middleware] EARLY EXEMPTION for /api/member route: /api/member/quotations
[Middleware] Added auth headers for /api/member: <user-id> MEMBER ACTIVE
```

### API Route Behavior

The `/api/member/quotations` route now:
1. Receives the request with `x-user-id` header already set by middleware
2. Extracts the user ID from the header (no Supabase auth calls in the API route)
3. Returns quotations data or 401 if no user header present

## Files Modified

- `src/middleware.ts` - Moved `/api/member` exemption to line 250-279 (first check after pathname extraction)

## Related Issues

- This fix also applies to any other `/api/member/*` routes that handle their own authentication
- The same pattern should be used for any future API routes that need custom authentication handling

## Verification

After the fix:
- `/member/quotations` page loads successfully
- `/api/member/quotations` API returns data (not redirects)
- No redirect loop errors in browser console
- Authentication headers are properly passed to API routes

## Future Considerations

1. Consider consolidating all API route exemptions into a single configuration array
2. Add unit tests for middleware to verify exemption order
3. Monitor server logs for any other routes that might need similar treatment
