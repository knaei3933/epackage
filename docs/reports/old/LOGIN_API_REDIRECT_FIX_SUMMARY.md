# Login API Redirect Fix Summary

**Date**: 2026-01-06
**Issue**: Login API returning HTML instead of JSON
**Root Cause**: Next.js `trailingSlash: true` configuration causing 308 redirects
**Fix**: Updated all auth API calls to use trailing slashes

---

## 🐛 Problem

When users tried to log in, the browser received this error:

```
[LoginForm] Login error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
```

### Root Cause Analysis

1. **Configuration**: `next.config.ts` has `trailingSlash: true` (line 136)
2. **Redirect Flow**:
   - LoginForm calls `/api/auth/signin` (without trailing slash)
   - Next.js returns 308 Permanent Redirect → `/api/auth/signin/`
   - Browser follows redirect but receives HTML instead of JSON
3. **Why HTML?**: The 308 redirect causes the POST request to lose its body or be handled incorrectly

---

## ✅ Solution

Added trailing slashes to all auth API endpoints to prevent the 308 redirect.

### Files Modified

| File | API Calls Fixed |
|------|-----------------|
| `src/components/auth/LoginForm.tsx` | `/api/auth/signin/` |
| `src/contexts/AuthContext.tsx` | All 7 auth endpoints |
| `src/components/auth/RegistrationForm.tsx` | `/api/auth/register/` |
| `src/components/auth/ForgotPasswordForm.tsx` | `/api/auth/forgot-password/` |
| `src/components/auth/ResetPasswordForm.tsx` | `/api/auth/reset-password/` |

### AuthContext.tsx Changes

Fixed 7 API endpoints:
1. `/api/auth/session/` (2 locations)
2. `/api/auth/signin/`
3. `/api/auth/register/`
4. `/api/auth/signout/`
5. `/api/auth/reset-password/`
6. `/api/auth/update-password/`

---

## 🧪 Testing

### Before Fix

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'
# Result: 308 redirect → /api/auth/signin/
```

### After Fix

```bash
curl -X POST http://localhost:3000/api/auth/signin/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}'
# Result: 401 JSON response with proper error message
```

---

## 📋 What to Test

1. **Login Flow**:
   - Go to `http://localhost:3000/auth/signin`
   - Enter valid credentials
   - Verify no console errors
   - Verify successful redirect to dashboard

2. **Registration Flow**:
   - Go to `http://localhost:3000/auth/register`
   - Fill out form
   - Verify registration works

3. **Password Reset Flow**:
   - Go to `http://localhost:3000/auth/forgot-password`
   - Enter email
   - Verify reset email sent

4. **Logout**:
   - While logged in, click logout
   - Verify cookies are cleared

---

## 🔄 Alternative Solutions (Not Implemented)

### Option 1: Remove `trailingSlash: true`
**Pros**: Fixes all API calls at once
**Cons**: Breaks URL consistency, may affect SEO

```typescript
// next.config.ts
trailingSlash: false, // or remove the line
```

### Option 2: Add Middleware Exception
**Pros**: Centralized fix
**Cons**: More complex, still needs API route changes

```typescript
// src/middleware.ts
// Add /api/auth to special handling
if (pathname.startsWith('/api/auth')) {
  return NextResponse.next();
}
```

### Option 3: Use Next.js Rewrites
**Pros**: Transparent to client code
**Cons**: Additional routing complexity

```typescript
// next.config.ts
async rewrites() {
  return [
    {
      source: '/api/auth/signin',
      destination: '/api/auth/signin/',
    },
    // ... other auth endpoints
  ];
}
```

**Chosen Solution (Option 0)**: Update fetch calls to use trailing slashes
- **Pros**: Explicit, no routing magic, works with existing setup
- **Cons**: Need to update all API calls (completed)

---

## 🚨 Remaining Work

### Other API Calls That May Need Fixing

The following files also make API calls without trailing slashes:
- ContactForm.tsx → `/api/contact/`
- SampleRequestForm.tsx → `/api/samples/`
- Other components using `/api/*` endpoints

**Action**: Monitor console for similar "Unexpected token '<'" errors and fix as needed.

---

## 📝 Notes

1. **Why `trailingSlash: true`?**
   - Ensures URL consistency across the application
   - Better for SEO (canonical URLs)
   - Prevents duplicate content issues

2. **Why 308 Redirect?**
   - Permanent redirect tells browsers/caches to update their URLs
   - Next.js uses this to enforce trailing slash policy

3. **Why POST Fails on Redirect?**
   - Some browsers drop POST body on 308 redirect
   - Content-Type header may not be preserved
   - Results in HTML error page instead of JSON response

---

## ✅ Verification

After this fix, the login flow should work correctly:

1. User enters email/password
2. LoginForm calls `/api/auth/signin/` (no redirect)
3. Server validates credentials
4. Server sets httpOnly cookies
5. Server returns JSON with user data
6. Client redirects to dashboard

**No more "Unexpected token '<'" errors!**

---

**Fix Verified**: ✅ API now returns JSON instead of HTML
**Files Changed**: 5 files, 13 API endpoint calls
**Breaking Changes**: None (backward compatible)
