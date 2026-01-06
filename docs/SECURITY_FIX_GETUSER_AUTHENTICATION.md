# Security Fix: Replace getSession() with getUser()

**Date:** 2026-01-05
**Severity:** CRITICAL
**Status:** ✅ COMPLETED

## Vulnerability Summary

Supabase's `getSession()` method is vulnerable to token theft attacks because it only validates the JWT signature without verifying it against the database. This allows attackers to use stolen or expired tokens to gain unauthorized access.

The `getUser()` method provides stronger security by:
1. Validating JWT signature
2. Verifying token exists in the database
3. Checking token hasn't been revoked
4. Ensuring user account is still active

## Files Fixed

### 1. `src/app/api/debug/auth/route.ts`
**Changes:**
- Replaced `getSession()` with `getUser()`
- Updated response structure from `session` to `user`
- Removed `expiresAt` field (not available in user object)

**Before:**
```typescript
const { data: { session }, error: sessionError } = await supabase.auth.getSession();
return NextResponse.json({
  session: session ? {
    exists: true,
    userId: session.user?.id,
    email: session.user?.email,
    expiresAt: session.expires_at,
  } : { exists: false }
});
```

**After:**
```typescript
const { data: { user }, error: userError } = await supabase.auth.getUser();
return NextResponse.json({
  user: user ? {
    exists: true,
    userId: user.id,
    email: user.email,
  } : { exists: false }
});
```

### 2. `src/app/api/dev/set-admin/route.ts`
**Changes:**
- Replaced `getSession()` with `getUser()`
- Updated all references from `session.user.id` to `user.id`

**Before:**
```typescript
const { data: { session }, error: authError } = await supabase.auth.getSession();
if (authError || !session) {
  return NextResponse.json({ error: '認証されていません。' }, { status: 401 });
}
const { data: requesterProfile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', session.user.id)
  .single();
```

**After:**
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: '認証されていません。' }, { status: 401 });
}
const { data: requesterProfile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();
```

### 3. `src/app/api/quotation/route.ts`
**Changes:**
- Replaced `getSession()` with `getUser()` in both POST and GET handlers
- Updated all references from `session.user.id` to `user.id`

**Before:**
```typescript
const { data: { session }, error: sessionError } = await supabase.auth.getSession();
if (sessionError || !session) {
  return NextResponse.json({ error: 'ログインが必要です。' }, { status: 401 });
}
const { data: profile } = await supabase
  .from('profiles')
  .select('status')
  .eq('id', session.user.id)
  .single();
```

**After:**
```typescript
const { data: { user }, error: userError } = await supabase.auth.getUser();
if (userError || !user) {
  return NextResponse.json({ error: 'ログインが必要です。' }, { status: 401 });
}
const { data: profile } = await supabase
  .from('profiles')
  .select('status')
  .eq('id', user.id)
  .single();
```

## Security Impact

### Before Fix (VULNERABLE)
- ✗ Only validates JWT signature
- ✗ Doesn't check if token exists in database
- ✗ Doesn't verify token hasn't been revoked
- ✗ Allows stolen tokens to work indefinitely
- ✗ No protection against token replay attacks

### After Fix (SECURE)
- ✓ Validates JWT signature
- ✓ Verifies token exists in database
- ✓ Checks token hasn't been revoked
- ✓ Validates user account is active
- ✓ Protects against token replay attacks

## Testing Recommendations

1. **Test with valid token:** Verify normal authentication still works
2. **Test with expired token:** Should return 401 Unauthorized
3. **Test with revoked token:** Should return 401 Unauthorized
4. **Test with stolen token:** Should return 401 Unauthorized
5. **Test with deleted user:** Should return 401 Unauthorized

```bash
# Test authentication endpoint
curl http://localhost:3000/api/debug/auth \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test quotation creation
curl -X POST http://localhost:3000/api/quotation \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectName":"Test","productCategory":"OTHER","quantity":100}'
```

## Additional Notes

- The `getUser()` method is slightly slower than `getSession()` due to database lookup, but this is acceptable for the security improvement
- The response object changed from `session` to `user` - ensure any frontend code expecting `session` is updated
- The `expiresAt` field is no longer available in the debug auth response (user objects don't include token expiration)

## Related Documentation

- [Supabase Auth Security Best Practices](https://supabase.com/docs/guides/auth/server-side/behind-a-proxy)
- [Why getUser() is More Secure](https://supabase.com/docs/guides/auth/auth-helpers/nextjs#server-side-code)

## Build Status

✅ Security fixes compile successfully
⚠️ Note: There's an unrelated build error in `src/app/api/profile/[id]/route.ts` (variable naming conflict) that needs separate resolution
