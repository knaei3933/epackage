# Group C (Member) E2E Tests - Fix Quick Start Guide

## What Was Fixed

The DEV_MODE authentication for Group C (Member) E2E tests was failing because server components weren't reading the user ID from headers set by middleware. This caused "missing required error components" errors even though cookies were correctly set.

## The Fix (One Line Summary)

Updated `getCurrentUserId()` in `src/lib/dashboard.ts` to check headers (set by middleware) BEFORE trying to read cookies via the `cookies()` API.

## Files Changed

1. **src/lib/dashboard.ts** - Fixed `getCurrentUserId()` to read headers first
2. **test-dev-mode-member-auth.js** - Verification script for manual testing
3. **run-group-c-tests.bat** - Windows batch script to run Group C tests
4. **run-group-c-tests.sh** - Linux/Mac shell script to run Group C tests

## Quick Verification

### Step 1: Start Dev Server

```bash
npm run dev
```

### Step 2: Run Verification Script (Optional)

In a separate terminal:

```bash
node test-dev-mode-member-auth.js
```

This will test the authentication flow and report success/failure.

### Step 3: Run Group C Tests

**Windows:**
```bash
run-group-c-tests.bat
```

**Linux/Mac:**
```bash
chmod +x run-group-c-tests.sh
./run-group-c-tests.sh
```

**Or run directly with Playwright:**
```bash
npx playwright test tests/e2e/group-c-member/ --workers=1
```

## Expected Results

Before fix:
- 36 passed, 24 failed
- "missing required error components, refreshing..." error

After fix:
- All 60 tests should pass
- No authentication errors
- Pages render with mock data

## How It Works

### Before the Fix

```
Playwright sets cookie → Navigate to page → Server component tries to read cookies() API → FAILS
```

### After the Fix

```
Playwright sets cookie → Navigate to page → Middleware reads cookie and sets headers → Server component reads headers → SUCCESS
```

## Technical Details

The fix changes the order of checks in `getCurrentUserId()`:

1. **NEW**: Check headers first (middleware sets `x-user-id` and `x-dev-mode`)
2. Client-side: Check `document.cookie`
3. Server-side fallback: Check `cookies()` API
4. Last resort: Generate mock ID

This ensures server components can authenticate users in DEV_MODE by reading headers from middleware, which is more reliable than trying to access cookies directly.

## Troubleshooting

### Tests Still Failing

1. **Check environment variables:**
   ```bash
   echo %ENABLE_DEV_MOCK_AUTH%  # Windows
   echo $ENABLE_DEV_MOCK_AUTH   # Linux/Mac
   ```
   Should be `true`

2. **Check dev server logs:**
   Look for `[DEV_MODE] Mock authentication bypass` message

3. **Check Playwright cookies:**
   Add this to your test to debug:
   ```javascript
   const cookies = await page.context().cookies();
   console.log('Cookies:', cookies);
   ```

4. **Run in headed mode:**
   ```bash
   npx playwright test tests/e2e/group-c-member/ --headed
   ```

### Cookie Not Being Set

Make sure the test helper is being called:
```javascript
import { setupDevModeAuth } from '../../helpers/dev-mode-auth';

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  await setupDevModeAuth(page);
  // ...
});
```

### Pages Not Rendering

Check browser console for errors:
```javascript
page.on('console', msg => {
  if (msg.type() === 'error') {
    console.log('Console error:', msg.text());
  }
});
```

## Related Documentation

- **GROUP_C_MEMBER_DEV_MODE_FIX.md** - Detailed technical analysis
- **GROUP_C_MEMBER_FIX_COMPLETE.md** - Complete fix documentation
- **src/lib/dashboard.ts** - Lines 168-263 contain the fix
- **src/middleware.ts** - Lines 376-406 show middleware logic
- **tests/helpers/dev-mode-auth.ts** - Test helper for DEV_MODE auth

## Test Files

- `tests/e2e/group-c-member/01-dashboard.spec.ts` - Dashboard tests
- `tests/e2e/group-c-member/02-orders.spec.ts` - Orders tests
- `tests/e2e/group-c-member/03-quotations.spec.ts` - Quotations tests
- `tests/e2e/group-c-member/04-profile.spec.ts` - Profile tests
- `tests/e2e/group-c-member/05-other.spec.ts` - Other member tests

## Success Criteria

- [ ] All 60 Group C tests pass
- [ ] No "missing required error components" errors
- [ ] Pages render with mock data
- [ ] Console shows `[getCurrentUserId] DEV_MODE: Found user ID from middleware headers`
- [ ] Middleware shows `[DEV_MODE] Mock authentication bypass` in logs

## Next Steps

1. Apply the fix (already done in `src/lib/dashboard.ts`)
2. Run verification script to confirm fix works
3. Run full Group C test suite
4. If all tests pass, the fix is complete!
5. If tests still fail, check troubleshooting section above

## Summary

This fix resolves the DEV_MODE authentication issue by ensuring server components read user IDs from headers set by middleware, rather than trying to access cookies directly. This aligns with Next.js's request processing model and ensures reliable authentication for E2E testing.

The fix is minimal (one function updated), safe (maintains backward compatibility with fallback logic), and effective (resolves the authentication failure issue).
