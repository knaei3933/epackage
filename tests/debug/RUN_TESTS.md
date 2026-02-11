# Quick Start Guide - Authentication Cookie Debug Tests

## Overview

This guide helps you execute the authentication cookie debug tests to identify why cookies aren't being set or maintained after login.

## Prerequisites

1. **Development server running:**
   ```bash
   npm run dev
   ```
   Ensure it's running on port 3007

2. **Test user account exists:**
   - Email: arwg22@gmail.com
   - Password: Test1234!

3. **Playwright installed:**
   ```bash
   npm install -D @playwright/test
   npx playwright install chromium
   ```

## Test Execution Options

### Option 1: Run All Tests (Recommended)
```bash
npx playwright test tests/debug/auth-cookie-debug.spec.ts
```

This will run all 10 scenarios sequentially and generate:
- Console output with detailed logs
- Screenshots in `debug-screenshots/` directory
- Test results with pass/fail status

### Option 2: Run Specific Scenarios

```bash
# Run only Scenario 1 (Page load inspection)
npx playwright test -g "Scenario 1"

# Run only Scenario 3 (Cookie inspection)
npx playwright test -g "Scenario 3"

# Run only Scenario 5 (Protected route navigation)
npx playwright test -g "Scenario 5"
```

### Option 3: Run with UI Mode (Interactive)
```bash
npx playwright test --ui tests/debug/auth-cookie-debug.spec.ts
```

This opens the Playwright UI where you can:
- Watch tests execute in real-time
- Inspect DOM elements
- View network requests
- Check cookies at any point
- Debug interactively

### Option 4: Run in Headed Mode (Watch Browser)
```bash
npx playwright test --headed tests/debug/auth-cookie-debug.spec.ts
```

You'll see the browser window and watch the tests execute.

## Understanding the Results

### Critical Success Indicators

✅ **Tests Pass If:**
1. Cookies are set after login (Scenario 3)
2. Session verification succeeds (Scenario 4)
3. Navigation to protected routes works (Scenario 5)
4. Authentication persists across pages (Scenario 8)

❌ **Tests Fail If:**
1. No cookies found after login (Scenario 3 fails)
2. Session verification returns null (Scenario 4 fails)
3. Redirected back to signin page (Scenario 5 fails)

### Screenshot Locations

After running tests, check these screenshots:
```
debug-screenshots/
├── 01-initial-page-load.png
├── 02-after-login.png
├── 03-cookie-inspection.png
├── 04-session-verification.png
├── 05-protected-route.png
├── 06-full-flow.png
├── 08-cross-page.png
├── 09-refresh-test.png
└── 10-expiry-test.png
```

### Console Output Analysis

Look for these key messages:

**Success:**
```
✅ Cookies set successfully
✅ Session verified for user: [user-id]
✅ SUCCESS: Navigation to protected route successful!
```

**Failure:**
```
❌ CRITICAL: No Set-Cookie headers in response!
❌ CRITICAL FAILURE: No Supabase cookies found!
❌ Session verification failed
❌ REDIRECTED TO SIGNIN - Authentication failed
```

## Quick Diagnosis Guide

### If Scenario 3 Fails (No Cookies Set)
**Problem:** API not setting cookies
**Check:**
- `/src/app/api/auth/signin/route.ts` line 140-154
- Cookie setting logic in `createSupabaseSSRClient()`
- Response headers in network tab

### If Scenario 3 Passes But Scenario 5 Fails
**Problem:** Cookies set but not sent/received
**Check:**
- Cookie attributes (domain, secure, sameSite)
- Cookie domain attribute for localhost
- Cookie secure flag in development

### If All Scenarios Pass
**Problem:** Environment-specific or intermittent issue
**Check:**
- Browser cache/storage
- Server restart required
- Different browser behavior

## Manual Debugging Steps

If automated tests are inconclusive:

1. **Open Browser DevTools:**
   - F12 or Right-click > Inspect

2. **Go to Application > Cookies:**
   - Login manually
   - Check if cookies appear
   - Inspect cookie attributes

3. **Go to Network Tab:**
   - Filter by "signin"
   - Check request headers
   - Check response headers for Set-Cookie

4. **Go to Console:**
   - Run: `document.cookie`
   - Should be empty (httpOnly cookies)
   - Check for JavaScript errors

## Next Steps After Testing

1. **Document Findings:**
   - Which scenarios passed/failed
   - Cookie attributes observed
   - Error messages in console

2. **Identify Root Cause:**
   - Use the decision tree in AUTH_COOKIE_DEBUG_TEST_PLAN.md
   - Match your findings to Outcome A, B, C, or D

3. **Apply Fix:**
   - Modify cookie configuration in `supabase-ssr.ts`
   - Update API route if needed
   - Test again

4. **Verify Resolution:**
   - All scenarios should pass
   - Manual login works
   - Protected routes accessible

## Common Issues and Solutions

### Issue: "No Set-Cookie headers"
**Solution:** Check API route response object - cookies may be lost when creating new response
**Fix:** Return `initialResponse` directly or copy cookies to new response

### Issue: "Cookies have domain attribute"
**Solution:** Remove domain attribute in development
**Fix:** Set `delete cookieOptions.domain` in `supabase-ssr.ts`

### Issue: "Cookies have secure=true on localhost"
**Solution:** Only set secure flag in production
**Fix:** Use `process.env.NODE_ENV === 'production'` check

### Issue: "SameSite=strict blocking navigation"
**Solution:** Use `sameSite: 'lax'` for development
**Fix:** Update cookie options in `supabase-ssr.ts`

## Support

For issues or questions:
1. Check `AUTH_COOKIE_DEBUG_TEST_PLAN.md` for detailed scenario documentation
2. Review code comments in `tests/debug/auth-cookie-debug.spec.ts`
3. Check server logs for authentication flow details
4. Review `/src/lib/supabase-ssr.ts` for cookie configuration

## Test Cleanup

To remove test artifacts:
```bash
# Remove screenshots
rm -rf debug-screenshots/

# Remove test results
rm -rf playwright-report/
rm -rf test-results/
```

---

**Last Updated:** 2026-02-09
**Test Version:** 1.0
