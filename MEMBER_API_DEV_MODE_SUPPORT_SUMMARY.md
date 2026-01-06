# Member API DEV_MODE Support Implementation Summary

## Overview
Updated all member API routes to support the `x-user-id` header from middleware as a fallback for DEV_MODE authentication, in addition to the normal cookie-based authentication.

## Problem Statement
Previously, member API routes only checked cookies for authentication. However, the middleware sets `x-user-id` and `x-dev-mode` headers when DEV_MODE is enabled. The API routes needed to support both authentication methods.

## Solution Pattern
Each API route now implements the following authentication pattern:

```typescript
// Check for DEV_MODE header from middleware
const devModeUserId = request.headers.get('x-user-id');
const isDevMode = request.headers.get('x-dev-mode') === 'true';

let userId: string;

if (isDevMode && devModeUserId) {
  // DEV_MODE: Use header from middleware
  console.log('[API Name] DEV_MODE: Using x-user-id header:', devModeUserId);
  userId = devModeUserId;
} else {
  // Normal auth: Use cookie-based auth
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user?.id) {
    return NextResponse.json(
      { error: '認証されていません。', errorEn: 'Authentication required' },
      { status: 401 }
    );
  }
  userId = user.id;
}
```

## Files Modified

### Core Member APIs
1. **`src/app/api/member/quotations/route.ts`**
   - POST (create quotation)
   - GET (list quotations)
   - Added DEV_MODE header support to both handlers

2. **`src/app/api/member/orders/route.ts`**
   - GET (list orders)
   - Added DEV_MODE header support

3. **`src/app/api/member/samples/route.ts`**
   - GET (list sample requests)
   - Updated `getUserIdFromRequest()` helper to log DEV_MODE usage

4. **`src/app/api/member/inquiries/route.ts`**
   - GET (list inquiries)
   - Updated `getUserIdFromRequest()` helper to log DEV_MODE usage

5. **`src/app/api/member/settings/route.ts`**
   - GET (get settings)
   - POST (update settings)
   - Updated `getUserIdFromRequest()` helper to check DEV_MODE header first before Bearer token

6. **`src/app/api/member/delete-account/route.ts`**
   - POST (delete account)
   - GET (get deletion summary)
   - Added DEV_MODE header support to both handlers

### Address Management APIs
7. **`src/app/api/member/addresses/billing/route.ts`**
   - GET (list billing addresses)
   - POST (create billing address)
   - Updated `getUserIdFromRequest()` helper

8. **`src/app/api/member/addresses/delivery/route.ts`**
   - GET (list delivery addresses)
   - POST (create delivery address)
   - Updated `getUserIdFromRequest()` helper

9. **`src/app/api/member/addresses/billing/[id]/route.ts`**
   - GET (get single billing address)
   - PUT (update billing address)
   - DELETE (delete billing address)
   - Updated `getUserIdFromRequest()` helper

10. **`src/app/api/member/addresses/delivery/[id]/route.ts`**
    - GET (get single delivery address)
    - PUT (update delivery address)
    - DELETE (delete delivery address)
    - Updated `getUserIdFromRequest()` helper

### Quotation Sub-routes
11. **`src/app/api/member/quotations/[id]/route.ts`**
    - GET (get quotation detail)
    - PATCH (update quotation)
    - DELETE (delete quotation)
    - Added new `getAuthenticatedUserId()` helper function that supports both auth methods
    - Deprecated old `createAuthenticatedClient()` helper

12. **`src/app/api/member/quotations/[id]/invoice/route.ts`**
    - POST (generate invoice PDF data)
    - Added DEV_MODE header support

13. **`src/app/api/member/quotations/[id]/confirm-payment/route.ts`**
    - POST (confirm payment)
    - Added DEV_MODE header support

### Order Sub-routes
14. **`src/app/api/member/orders/confirm/route.ts`**
    - POST (confirm order from quotation)
    - Added DEV_MODE header support

15. **`src/app/api/member/orders/[id]/production-data/route.ts`**
    - GET (get production data status)
    - Added DEV_MODE header support

## Total Files Modified: 15

## Authentication Flow

### Normal Mode (Production)
1. Middleware validates user session using Supabase auth
2. Middleware sets `x-user-id`, `x-user-role`, `x-user-status` headers
3. API route uses `supabase.auth.getUser()` from cookies
4. User ID extracted from session

### DEV_MODE (Development)
1. Middleware checks for `dev-mock-user-id` cookie
2. If found, sets `x-user-id`, `x-user-role`, `x-user-status`, `x-dev-mode` headers
3. API route detects `x-dev-mode: true` header
4. API route uses `x-user-id` header value directly
5. Skips cookie-based auth validation

## Debug Logging

All API routes now log DEV_MODE usage:
```
[API Name] DEV_MODE: Using x-user-id header: <user-id>
```

This makes it easy to verify DEV_MODE is working correctly in the development console.

## Security Considerations

- DEV_MODE is only enabled when `NODE_ENV === 'development'` AND `ENABLE_DEV_MOCK_AUTH === 'true'`
- The `x-dev-mode` header is set by server-side middleware only
- Client-side cannot forge DEV_MODE headers
- Production environment never uses DEV_MODE authentication

## Testing

To test DEV_MODE functionality:

1. Set environment variables:
   ```
   NODE_ENV=development
   ENABLE_DEV_MOCK_AUTH=true
   ```

2. Set mock user cookie (signin page should do this automatically in DEV_MODE):
   ```
   dev-mock-user-id=<valid-uuid-from-database>
   ```

3. Make API requests - they should log DEV_MODE usage in console

4. Verify API returns data for the mock user

## Backward Compatibility

All changes are backward compatible:
- Normal cookie-based authentication still works in all environments
- DEV_MODE header is only used when explicitly enabled
- No breaking changes to API contracts
- No changes required to client-side code

## Related Files

- `src/middleware.ts` - Sets DEV_MODE headers
- `.env.local` - DEV_MODE configuration
- `CLAUDE.md` - Project documentation

## Next Steps

- Test all API routes in DEV_MODE
- Verify production routes still work with normal authentication
- Monitor console logs for DEV_MODE usage
- Update API documentation if needed
