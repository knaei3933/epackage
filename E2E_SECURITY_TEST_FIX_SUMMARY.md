# E2E Security Test Fix Summary

**Date**: 2026-01-11
**Test Suite**: `tests/security/csrf.spec.ts`
**Status**: ✅ Fixed - All syntax errors resolved

## Root Cause Analysis

The E2E security tests were failing due to **three critical issues**:

### 1. Variable Naming Collision (Critical) 🚨
**Issue**: The test used `page` as both the loop variable and the Playwright fixture, causing a shadowing problem.

```typescript
// ❌ BEFORE - Variable collision
for (const page of pages) {
  test(`test`, async ({ page }) => {  // 'page' is now the config object, not Playwright's page fixture
    const response = await page.goto(`${BASE_URL}${page.path}`);  // Error: undefined.goto()
  });
}
```

**Error**: `Protocol error (Page.navigate): Cannot navigate to invalid URL` → `http://localhost:3000undefined`

**Fix**: Renamed loop variable to `routeConfig` to avoid collision:

```typescript
// ✅ AFTER - Fixed
for (const routeConfig of pages) {
  test(`test`, async ({ page }) => {  // 'page' is now Playwright's fixture
    const response = await page.goto(`${baseUrl}${routeConfig.path}`);  // Works correctly
  });
}
```

### 2. Incorrect API Routes ⚠️
**Issue**: Tests referenced non-existent B2B API routes that were removed during refactoring.

```typescript
// ❌ BEFORE - Non-existent routes
const apiEndpoints = [
  { path: '/api/b2b/orders', method: 'POST', name: 'B2B 주문 생성' },
  { path: '/api/b2b/contracts', method: 'POST', name: 'B2B 계약서 생성' },
];
```

**Fix**: Updated to use actual existing API routes:

```typescript
// ✅ AFTER - Existing routes
const apiEndpoints = [
  { path: '/api/member/orders', method: 'POST', name: '회원 주문 생성' },
  { path: '/api/contracts', method: 'POST', name: '계약서 생성' },
];
```

### 3. Hardcoded Base URL ⚠️
**Issue**: Test hardcoded `localhost:3000` but Playwright config uses port `3006`.

```typescript
// ❌ BEFORE - Hardcoded port
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
```

**Fix**: Use Playwright's `baseURL` fixture and helper function:

```typescript
// ✅ AFTER - Uses Playwright config
function getBaseUrl({ baseURL }: { baseURL?: string }): string {
  return baseURL || 'http://localhost:3006';
}

test('test', async ({ request, baseURL: configBaseUrl }) => {
  const baseUrl = getBaseUrl({ baseURL: configBaseUrl });
  // Use baseUrl in tests
});
```

### 4. TypeScript Type Errors 📝
**Issue**: `cookie.sameSite` type mismatch with string comparisons.

```typescript
// ❌ BEFORE - Type error
if (cookie.sameSite === 'none') {  // Type '"Strict" | "Lax"' has no overlap with '"none"'
  expect(cookie.secure).toBe(true);
}
```

**Fix**: Type assertion to string:

```typescript
// ✅ AFTER - Type-safe
const sameSite = cookie.sameSite as string;
if (sameSite === 'None' || sameSite === 'none') {
  expect(cookie.secure).toBe(true);
}
```

## Changes Made

### File: `tests/security/csrf.spec.ts`

| Line | Change Type | Description |
|------|-------------|-------------|
| 12 | Removed | Deleted hardcoded `BASE_URL` constant |
| 16-19 | Added | Added `getBaseUrl()` helper function |
| 94-138 | Modified | Fixed variable collision in CSP tests (page → routeConfig) |
| 151-383 | Modified | Added `baseURL` fixture to all request tests |
| 229-563 | Modified | Added `baseURL` fixture to all page/context tests |
| 346-348 | Modified | Updated API endpoints to existing routes |
| 555-562 | Modified | Fixed TypeScript type errors for SameSite cookies |

## Test Configuration

The tests are configured in `playwright.config.ts`:

```typescript
use: {
  baseURL: 'http://localhost:3006',  // Test server port
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

**Note**: The webServer configuration is commented out, so tests require the dev server to be running on port 3006.

## How to Run Tests

```bash
# Start dev server first
npm run dev  # Runs on port 3006

# In another terminal, run security tests
npx playwright test tests/security/csrf.spec.ts --project=chromium

# Run with detailed output
npx playwright test tests/security/csrf.spec.ts --reporter=line --project=chromium
```

## Verification

All TypeScript compilation errors resolved:

```bash
npx tsc --noEmit tests/security/csrf.spec.ts
# ✅ No errors
```

## Security Headers Being Tested

The tests verify the following security headers are properly set by `src/middleware.ts`:

1. **Content-Security-Policy** - CSP headers for XSS protection
2. **X-Frame-Options** - Clickjacking protection (DENY)
3. **X-Content-Type-Options** - MIME sniffing prevention (nosniff)
4. **X-XSS-Protection** - XSS filter (1; mode=block)
5. **Referrer-Policy** - Referrer header control
6. **Permissions-Policy** - Feature policy (camera, mic, geolocation disabled)
7. **Strict-Transport-Security** - HSTS for production

## Next Steps

1. ✅ **Code fixes complete** - All syntax errors resolved
2. 🔄 **Integration testing** - Run tests with dev server to verify functionality
3. 📊 **Coverage analysis** - Ensure all security headers are properly tested
4. 🚀 **CI/CD integration** - Ensure tests run in pipeline

## Related Files

- `src/middleware.ts` - Security headers implementation (lines 454-512)
- `playwright.config.ts` - Test configuration
- `tests/security/csrf.spec.ts` - Fixed test suite

## Test Coverage

The test suite covers:
- 37 security tests across 6 browser configurations
- CSP header validation on 6 public pages
- Cross-origin request blocking
- CSRF protection for forms and API endpoints
- Cookie security (Secure, SameSite, HttpOnly)
- Attack simulation (CSRF, clickjacking)

---

**Developer Note**: The variable naming collision issue (Issue #1) was a critical bug that would have caused ALL tests to fail regardless of the actual security header implementation. This has been fixed by renaming the loop variable to avoid shadowing the Playwright fixture.
