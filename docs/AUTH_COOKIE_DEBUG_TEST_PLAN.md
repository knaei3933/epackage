# Authentication Cookie Debug Test Plan
## Epackage Lab - Login Session Persistence Issue

**Test Date:** 2026-02-09
**Environment:** Development (localhost:3007)
**Test Tool:** Playwright MCP
**Priority:** CRITICAL - Users experiencing login redirect loops

---

## Executive Summary

This test plan investigates why authentication cookies are not being properly set or maintained after login, causing users to be redirected back to the signin page when accessing protected routes like `/member/quotations`.

### Known Issues
1. **Login succeeds** but cookies may not be set correctly
2. **Redirect loops** occur when navigating to protected pages
3. **Session verification** fails after successful login
4. **Cookie attributes** may be incompatible with localhost development

### Test Environment
- **URL:** http://localhost:3007
- **Test Account:** arwg22@gmail.com / Test1234!
- **Browser:** Chromium (via Playwright MCP)
- **Focus:** Cookie debugging and session persistence

---

## Application Architecture Overview

### Authentication Flow
```
1. User enters credentials in LoginForm (/auth/signin)
2. Form POSTs to /api/auth/signin/
3. API validates credentials via Supabase
4. API sets session cookies (sb-access-token, sb-refresh-token)
5. Client verifies session with getSession()
6. Client redirects to /member/dashboard or /admin/dashboard
7. Middleware validates session on protected routes
```

### Cookie Configuration
**Development Mode (localhost):**
- `sb-access-token`: httpOnly, secure=false, sameSite=lax, path=/, maxAge=86400
- `sb-refresh-token`: httpOnly, secure=false, sameSite=lax, path=/, maxAge=2592000
- **NO domain attribute** (localhost rejects explicit domain)

**Production Mode:**
- Same as development + `domain=.epackage-lab.com`

### Key Components
- **LoginForm.tsx:** Client component with session verification before redirect
- **/api/auth/signin/route.ts:** Server endpoint that sets cookies via Supabase SSR
- **supabase-ssr.ts:** Cookie adapter with localhost-compatible attributes
- **middleware.ts:** Route protection and session validation

---

## Test Scenarios

### Scenario 1: Initial Page Load and Form Inspection
**Purpose:** Verify signin page structure and identify form elements

**Steps:**
1. Navigate to `http://localhost:3007/auth/signin`
2. Take screenshot of initial page state
3. Inspect page structure and identify:
   - Email input field
   - Password input field
   - Login button (submit button)
   - Header navigation links
4. Log all form-related elements with their selectors
5. Check for any console errors on page load

**Expected Results:**
- Page loads without errors
- Login form is visible and interactive
- Two potential "ログイン" (Login) elements exist:
  - Header navigation link
  - Form submit button (primary target)

**Success Criteria:**
- Correct form elements identified
- Submit button selector determined
- No JavaScript errors on load

---

### Scenario 2: Login Form Submission
**Purpose:** Submit credentials and capture network activity

**Prerequisites:** Scenario 1 completed

**Steps:**
1. Fill email field: `arwg22@gmail.com`
2. Fill password field: `Test1234!`
3. Start network monitoring
4. Click the form submit button (NOT header link)
5. Wait for API response
6. Capture and log:
   - Request URL and method
   - Request payload
   - Response status code
   - Response headers (especially Set-Cookie headers)
   - Response body
7. Take screenshot after response received

**Expected Results:**
- POST request to `/api/auth/signin/` or `/api/auth/signin`
- Response status: 200 OK
- Response contains: `success: true`, user data, redirectUrl
- Set-Cookie headers present in response

**Critical Checks:**
- [ ] API endpoint called correctly
- [ ] Response includes success flag
- [ ] Response includes user object
- [ ] Response includes redirectUrl

---

### Scenario 3: Cookie Inspection After Login
**Purpose:** Verify cookies are actually set in browser

**Prerequisites:** Scenario 2 completed (successful login)

**Steps:**
1. Immediately after login response, inspect all browser cookies
2. Filter for Supabase-related cookies:
   - `sb-access-token`
   - `sb-refresh-token`
   - `sb-[project-url]-auth-token` (legacy format)
3. For each cookie found, log:
   - Name
   - Value (first 20 chars)
   - Domain
   - Path
   - httpOnly flag
   - secure flag
   - sameSite attribute
   - maxAge/expires
4. Take screenshot of DevTools Application > Cookies
5. Check if cookies are visible via JavaScript:
   ```javascript
   document.cookie
   ```
6. Verify httpOnly cookies are NOT accessible via JS (expected)

**Expected Results:**
- `sb-access-token` cookie exists
- `sb-refresh-token` cookie exists
- Cookies have correct attributes:
  - httpOnly: true
  - secure: false (development)
  - sameSite: lax
  - path: /
  - NO domain attribute (localhost)
  - maxAge: 86400 (access token)

**Critical Failure Points:**
- ❌ No cookies set = API not setting cookies correctly
- ❌ Cookies have domain attribute = localhost rejection
- ❌ Cookies have secure=true in development = not sent over HTTP
- ❌ Cookies have wrong path = not sent to all routes

---

### Scenario 4: Session Verification
**Purpose:** Verify Supabase client can read the cookies

**Prerequisites:** Scenario 3 completed (cookies confirmed set)

**Steps:**
1. Wait 100ms (matching LoginForm timeout)
2. Execute Supabase session check in browser console:
   ```javascript
   const { createClient } = supabase;
   const client = createClient(
     'NEXT_PUBLIC_SUPABASE_URL',
     'NEXT_PUBLIC_SUPABASE_ANON_KEY'
   );
   const { data: { session }, error } = await client.auth.getSession();
   console.log('Session:', session);
   console.log('Error:', error);
   ```
3. Log session object if exists
4. Log error if session retrieval fails
5. Check session.user object
6. Verify session.access_token exists

**Expected Results:**
- Session object exists
- session.user is populated
- session.access_token is valid JWT
- No errors in session retrieval

**Critical Checks:**
- [ ] Session successfully retrieved from cookies
- [ ] User ID matches logged-in user
- [ ] Access token is valid JWT format

---

### Scenario 5: Navigation to Protected Route
**Purpose:** Test if authentication persists across navigation

**Prerequisites:** Scenario 4 completed (session verified)

**Steps:**
1. Navigate to `http://localhost:3007/member/quotations`
2. Monitor network requests during navigation
3. Capture response status:
   - 200 OK (success - authenticated)
   - 307/308 redirect (redirect to signin)
   - 401/403 (auth failure)
4. Take screenshot of resulting page
5. Check final URL
6. Inspect cookies after navigation
7. Check browser console for errors

**Expected Results:**
- Page loads successfully (200 OK)
- User remains on `/member/quotations`
- No redirect to signin page
- Cookies still present in browser
- No authentication errors in console

**Critical Failure Modes:**
- ❌ Redirected to `/auth/signin` = middleware rejects session
- ❌ 401 Unauthorized = cookies not sent with request
- ❌ 403 Forbidden = user lacks permissions
- ❌ Cookies disappeared = cleared during navigation

---

### Scenario 6: Middleware Inspection
**Purpose:** Verify middleware correctly validates session

**Prerequisites:** Access to server logs or debugging mode

**Steps:**
1. Check server console logs during navigation
2. Look for middleware log messages:
   - `[Middleware] Processing request: /member/quotations`
   - `[Middleware] User found:`
   - `[Middleware] No valid session, redirecting`
3. Verify getUser() call in middleware succeeds
4. Check if request.headers contains cookies
5. Log all headers received by middleware

**Expected Results:**
- Middleware receives cookies in request headers
- getUser() successfully retrieves user
- No redirect triggered
- Request proceeds to /member/quotations page

**Critical Checks:**
- [ ] Cookies present in request headers
- [ ] Supabase client can read cookies from request
- [ ] User authentication successful in middleware

---

### Scenario 7: Cookie Attribute Debugging
**Purpose:** Test various cookie configurations

**Prerequisites:** Scenarios 1-6 completed, issue identified

**Test Matrix:**

| Test | Domain Attribute | Secure | SameSite | Expected Result |
|------|-----------------|--------|----------|-----------------|
| 7a | (not set) | false | lax | ✅ PASS - localhost compatible |
| 7b | localhost | false | lax | ❌ FAIL - explicit localhost rejected |
| 7c | 127.0.0.1 | false | lax | ❌ FAIL - IP rejected |
| 7d | .localhost | false | lax | ❌ FAIL - dot notation rejected |
| 7e | (not set) | true | lax | ❌ FAIL - secure requires HTTPS |
| 7f | (not set) | false | strict | ⚠️ MAY FAIL - strict may block navigation |
| 7g | (not set) | false | none | ⚠️ MAY FAIL - requires secure context |

**Steps for Each Test:**
1. Modify API route to set cookies with test configuration
2. Restart development server
3. Repeat Scenarios 2-5
4. Record results
5. Revert changes before next test

**Success Criteria:**
- Identify which cookie attributes work on localhost
- Document optimal configuration for development
- Verify production-compatible configuration

---

### Scenario 8: Cross-Page Cookie Persistence
**Purpose:** Verify cookies persist across different page paths

**Prerequisites:** Working login from previous scenarios

**Steps:**
1. Login successfully
2. Navigate to multiple paths in sequence:
   - `/member/dashboard`
   - `/member/quotations`
   - `/member/orders`
   - `/member/profile`
   - `/admin/dashboard` (if admin user)
3. After each navigation:
   - Verify cookies still exist
   - Check session is still valid
   - Confirm page loads without redirect
4. Test navigation back to non-protected pages:
   - `/`
   - `/catalog`
   - `/contact`
5. Return to protected page
6. Verify authentication maintained

**Expected Results:**
- Cookies persist across all navigations
- Session remains valid throughout
- No re-authentication required
- Smooth navigation between protected and public pages

---

### Scenario 9: Browser Refresh Test
**Purpose:** Ensure authentication survives page reload

**Prerequisites:** User logged in and on protected page

**Steps:**
1. Navigate to `/member/quotations`
2. Verify page loads successfully
3. Refresh page (F5 or Ctrl+R)
4. Wait for reload
5. Check final URL and page content
6. Verify cookies still exist
7. Check if user still authenticated

**Expected Results:**
- Page reloads successfully
- User remains on same page
- No redirect to signin
- Cookies persist across refresh
- Session still valid

---

### Scenario 10: Expiry and Session Duration
**Purpose:** Verify cookie expiry settings work correctly

**Prerequisites:** Working login with cookie inspection

**Steps:**
1. After login, inspect cookie expiry times
2. Log current timestamp vs cookie expiration
3. Verify access token expires in ~24 hours (86400 seconds)
4. Verify refresh token expires in ~30 days (2592000 seconds)
5. Test session after waiting (if time permits):
   - Short wait: 5 minutes
   - Check session still valid
6. Document actual vs expected expiry times

**Expected Results:**
- Access token maxAge: 86400 seconds (24 hours)
- Refresh token maxAge: 2592000 seconds (30 days)
- Session remains valid within expiry period
- Cookies expire at expected times

---

## Debugging Checklist

### Pre-Test Environment Setup
- [ ] Development server running on port 3007
- [ ] Database migrations applied
- [ ] Test user account exists (arwg22@gmail.com)
- [ ] Environment variables configured
- [ ] Playwright MCP connected and functional
- [ ] Browser DevTools accessible for inspection

### During Testing
- [ ] Network tab monitoring active
- [ ] Console logs captured
- [ ] Screenshots taken at key steps
- [ ] Cookie state logged at each stage
- [ ] Server logs monitored
- [ ] Request/response headers captured

### Post-Test Analysis
- [ ] All test results documented
- [ ] Screenshots reviewed and annotated
- [ ] Network logs analyzed
- [ ] Cookie attributes verified
- [ ] Root cause identified
- [ ] Fix recommendations prepared

---

## Expected Outcomes and Decision Tree

### Outcome A: Cookies Not Set (API Issue)
**Symptoms:**
- No Set-Cookie headers in response
- No cookies visible in browser after login
- Session verification fails immediately

**Root Causes:**
1. Supabase SSR client not setting cookies correctly
2. Cookie options incompatible with localhost
3. Response object not preserving cookies
4. Domain attribute blocking localhost cookies

**Next Steps:**
- Review `supabase-ssr.ts` cookie configuration
- Verify `createSupabaseSSRClient` implementation
- Test with explicit localhost cookie options
- Check response chain in API route

---

### Outcome B: Cookies Set But Not Sent (Cookie Attribute Issue)
**Symptoms:**
- Cookies visible in browser after login
- Cookies disappear on navigation
- Protected routes redirect to signin
- Server doesn't receive cookies in requests

**Root Causes:**
1. Domain attribute set (localhost rejects)
2. Secure flag set in development
3. SameSite=strict blocking navigation
4. Path attribute too restrictive
5. Cookie scope mismatch

**Next Steps:**
- Remove domain attribute in development
- Set secure=false for localhost
- Use sameSite=lax for development
- Ensure path=/ for full site access
- Test cookie attributes systematically

---

### Outcome C: Cookies Sent But Session Invalid (Middleware Issue)
**Symptoms:**
- Cookies present in browser
- Cookies sent with requests
- Middleware fails to validate session
- getUser() returns null

**Root Causes:**
1. Supabase client can't read cookies
2. Cookie name mismatch
3. Cookie value corrupted
4. Session expired on server
5. Middleware configuration issue

**Next Steps:**
- Verify cookie names match expected format
- Check Supabase client initialization in middleware
- Test session retrieval with browser client
- Review middleware authentication logic
- Check for cookie parsing errors

---

### Outcome D: Everything Works (Environment Issue)
**Symptoms:**
- All tests pass
- No issues found in current session
- Previous failures unexplained

**Root Causes:**
1. Previous state cached (clear cache needed)
2. Browser-specific issue
3. Race condition in timing
4. Intermittent network issue
5. Server restart required

**Next Steps:**
- Document successful configuration
- Test in different browsers
- Test after clearing all data
- Test with cold start
- Create reproduction steps for failures

---

## Test Execution Log

### Test Session 1
**Date/Time:** [To be filled]
**Tester:** [To be filled]
**Environment:** localhost:3007

#### Results Summary
- Scenario 1: [PASS/FAIL/SKIP] - Notes:
- Scenario 2: [PASS/FAIL/SKIP] - Notes:
- Scenario 3: [PASS/FAIL/SKIP] - Notes:
- Scenario 4: [PASS/FAIL/SKIP] - Notes:
- Scenario 5: [PASS/FAIL/SKIP] - Notes:
- Scenario 6: [PASS/FAIL/SKIP] - Notes:
- Scenario 7: [PASS/FAIL/SKIP] - Notes:
- Scenario 8: [PASS/FAIL/SKIP] - Notes:
- Scenario 9: [PASS/FAIL/SKIP] - Notes:
- Scenario 10: [PASS/FAIL/SKIP] - Notes:

#### Root Cause Identified
[Describe the actual root cause found during testing]

#### Recommended Fix
[Describe the fix needed to resolve the issue]

---

## Appendix: Code References

### Relevant Files
- `/src/app/auth/signin/page.tsx` - Signin page component
- `/src/components/auth/LoginForm.tsx` - Login form with session verification
- `/src/app/api/auth/signin/route.ts` - Login API endpoint
- `/src/lib/supabase-ssr.ts` - Cookie handling utilities
- `/src/middleware.ts` - Route protection middleware
- `/src/lib/auth-constants.ts` - Session configuration constants

### Key Functions
- `createSupabaseSSRClient()` - Creates SSR client with cookie adapter
- `signInWithPassword()` - Supabase authentication method
- `getSession()` - Session verification in browser
- `getAuthenticatedUser()` - Server-side user retrieval

### Cookie Configuration
```typescript
// Development (localhost)
const cookieOptions = {
  httpOnly: true,
  secure: false,  // HTTP, not HTTPS
  sameSite: 'lax',
  path: '/',
  maxAge: 86400,  // 24 hours
  // NO domain attribute - critical for localhost
};
```

---

## Success Metrics

### Test Completion Criteria
- All 10 scenarios executed
- Root cause identified with supporting evidence
- Screenshots captured for all critical steps
- Network logs analyzed
- Cookie attributes verified
- Fix recommendations documented

### Resolution Criteria
- User can login successfully
- Cookies are set correctly in browser
- Session persists across navigation
- Protected routes accessible without redirect
- Browser refresh maintains authentication
- Issue resolved in development environment

---

**Document Version:** 1.0
**Last Updated:** 2026-02-09
**Status:** Ready for Execution
