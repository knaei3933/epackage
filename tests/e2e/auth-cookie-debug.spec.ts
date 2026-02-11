/**
 * Authentication Cookie Debug Test
 *
 * This test debugs why authentication cookies are not being set or maintained
 * after login, causing redirect loops when accessing protected routes.
 *
 * Test Environment: http://localhost:3000
 * Test Account: arwg22@gmail.com / Test1234!
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Cookie Debug', () => {
  const TEST_EMAIL = 'arwg22@gmail.com';
  const TEST_PASSWORD = 'Test1234!';
  const BASE_URL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Clear all cookies and storage before each test
    await page.context().clearCookies();
    await page.goto(BASE_URL);
  });

  test('Scenario 1: Initial page load and form inspection', async ({ page }) => {
    console.log('\n=== SCENARIO 1: Initial Page Load and Form Inspection ===\n');

    // Navigate to signin page
    await page.goto(`${BASE_URL}/auth/signin`);

    // Take screenshot of initial state
    await page.screenshot({ path: 'debug-screenshots/01-initial-page-load.png' });

    // Log page title
    console.log('Page Title:', await page.title());

    // Find all form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');
    const loginLinks = page.getByText('ログイン');

    // Verify elements exist
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Count login-related elements
    const linkCount = await loginLinks.count();
    console.log(`Found ${linkCount} "ログイン" text elements`);
    console.log(`Submit button text: "${await submitButton.textContent()}"`);

    // Check for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    console.log('✅ Scenario 1 Complete: Page loaded successfully');
    console.log('Form elements identified and ready for testing\n');
  });

  test('Scenario 2: Login form submission and network capture', async ({ page }) => {
    console.log('\n=== SCENARIO 2: Login Form Submission ===\n');

    // Setup network monitoring
    const apiRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/api/auth/signin')) {
        console.log(`📤 API Request: ${request.method()} ${request.url()}`);
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
        });
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/auth/signin')) {
        console.log(`📥 API Response: ${response.status()} ${response.url()}`);
        const headers = response.headers();
        console.log('Response Headers:', JSON.stringify(headers, null, 2));

        const body = await response.text();
        console.log('Response Body:', body);

        apiRequests.push({
          status: response.status(),
          headers: headers,
          body: body,
        });

        // Check for Set-Cookie headers
        const setCookieHeaders = headers['set-cookie'];
        if (setCookieHeaders) {
          console.log('\n🍪 Set-Cookie Headers Found:');
          console.log(setCookieHeaders);
        } else {
          console.log('\n❌ CRITICAL: No Set-Cookie headers in response!');
        }
      }
    });

    // Navigate to signin and fill form
    await page.goto(`${BASE_URL}/auth/signin`);

    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    console.log(`Credentials entered: ${TEST_EMAIL}`);

    // Submit form
    console.log('Submitting login form...');
    await page.click('button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(2000);

    // Take screenshot after response
    await page.screenshot({ path: 'debug-screenshots/02-after-login.png' });

    console.log(`\nTotal API requests captured: ${apiRequests.length}`);
    console.log('✅ Scenario 2 Complete: Login submission captured\n');
  });

  test('Scenario 3: Cookie inspection after login', async ({ page }) => {
    console.log('\n=== SCENARIO 3: Cookie Inspection ===\n');

    // Perform login
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for cookies to be set
    await page.waitForTimeout(1500);

    // Get all cookies
    const cookies = await page.context().cookies();
    console.log(`\nTotal cookies found: ${cookies.length}`);

    // Filter for Supabase cookies
    const supabaseCookies = cookies.filter(cookie =>
      cookie.name.includes('sb-') ||
      cookie.name.includes('access-token') ||
      cookie.name.includes('refresh-token')
    );

    console.log(`\nSupabase-related cookies: ${supabaseCookies.length}`);

    if (supabaseCookies.length === 0) {
      console.log('\n❌ CRITICAL FAILURE: No Supabase cookies found!');
      console.log('All cookies:', JSON.stringify(cookies, null, 2));
    } else {
      console.log('\n🍪 Supabase Cookies Found:');
      supabaseCookies.forEach(cookie => {
        console.log(`\n  Name: ${cookie.name}`);
        console.log(`  Value: ${cookie.value.substring(0, 20)}...`);
        console.log(`  Domain: ${cookie.domain || '(not set)'}`);
        console.log(`  Path: ${cookie.path}`);
        console.log(`  httpOnly: ${cookie.httpOnly}`);
        console.log(`  secure: ${cookie.secure}`);
        console.log(`  sameSite: ${cookie.sameSite}`);
        console.log(`  expires: ${cookie.expires ? new Date(cookie.expires * 1000).toISOString() : 'session'}`);

        // Critical checks
        if (cookie.domain && cookie.domain !== 'localhost') {
          console.log(`  ⚠️  WARNING: Domain attribute may cause localhost rejection`);
        }
        if (cookie.secure === true) {
          console.log(`  ⚠️  WARNING: Secure flag may block cookies on HTTP`);
        }
        if (cookie.sameSite === 'strict') {
          console.log(`  ⚠️  WARNING: SameSite=strict may block navigation`);
        }
      });
    }

    // Check if cookies visible via JavaScript (should be empty for httpOnly)
    const jsCookies = await page.evaluate(() => document.cookie);
    console.log(`\nJavaScript-visible cookies: "${jsCookies}"`);

    if (supabaseCookies.length > 0 && jsCookies.includes('sb-access-token')) {
      console.log('❌ ERROR: httpOnly cookies should NOT be visible via JavaScript!');
    } else if (supabaseCookies.length > 0) {
      console.log('✅ httpOnly cookies correctly hidden from JavaScript');
    }

    await page.screenshot({ path: 'debug-screenshots/03-cookie-inspection.png' });
    console.log('\n✅ Scenario 3 Complete: Cookie inspection finished\n');
  });

  test('Scenario 4: Session verification', async ({ page }) => {
    console.log('\n=== SCENARIO 4: Session Verification ===\n');

    // Perform login
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for LoginForm timeout (100ms)
    await page.waitForTimeout(200);

    // Check session via browser console
    const sessionCheck = await page.evaluate(async () => {
      try {
        // Access Supabase from window
        const { createClient } = await import('@supabase/supabase-js');

        const client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: { session }, error } = await client.auth.getSession();

        return {
          success: !!session,
          userId: session?.user?.id,
          error: error?.message,
        };
      } catch (err: any) {
        return {
          success: false,
          error: err.message,
        };
      }
    });

    console.log('Session Check Result:', JSON.stringify(sessionCheck, null, 2));

    if (sessionCheck.success) {
      console.log(`✅ Session verified for user: ${sessionCheck.userId}`);
    } else {
      console.log(`❌ Session verification failed: ${sessionCheck.error}`);
    }

    await page.screenshot({ path: 'debug-screenshots/04-session-verification.png' });
    console.log('\n✅ Scenario 4 Complete: Session verification finished\n');
  });

  test('Scenario 5: Navigation to protected route', async ({ page }) => {
    console.log('\n=== SCENARIO 5: Navigation to Protected Route ===\n');

    // Perform login
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for login and redirect
    await page.waitForTimeout(2000);

    // Note current URL
    const currentUrl = page.url();
    console.log(`Current URL after login: ${currentUrl}`);

    // Try to navigate to protected route
    console.log('\nNavigating to /member/quotations...');

    // Monitor for redirects
    let redirectedToSignin = false;
    page.on('load', () => {
      const url = page.url();
      console.log(`Page loaded: ${url}`);
      if (url.includes('/auth/signin')) {
        redirectedToSignin = true;
      }
    });

    await page.goto(`${BASE_URL}/member/quotations`, { waitUntil: 'networkidle' });

    // Check final URL and status
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);

    // Check for auth errors in console
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ path: 'debug-screenshots/05-protected-route.png', fullPage: true });

    // Verify cookies still exist
    const cookiesAfterNav = await page.context().cookies();
    const supabaseCookiesAfterNav = cookiesAfterNav.filter(c =>
      c.name.includes('sb-')
    );

    console.log(`\nCookies after navigation: ${supabaseCookiesAfterNav.length}`);

    if (finalUrl.includes('/auth/signin')) {
      console.log('\n❌ CRITICAL FAILURE: Redirected to signin page!');
      console.log('This indicates authentication was not maintained across navigation');
    } else if (finalUrl.includes('/member/quotations')) {
      console.log('\n✅ SUCCESS: Navigation to protected route successful!');
      console.log('Authentication maintained across navigation');
    } else {
      console.log(`\n⚠️  WARNING: Unexpected URL: ${finalUrl}`);
    }

    console.log('\n✅ Scenario 5 Complete: Protected route navigation tested\n');
  });

  test('Scenario 6: Full authentication flow with detailed logging', async ({ page }) => {
    console.log('\n=== SCENARIO 6: Full Authentication Flow ===\n');

    // Step 1: Clear state
    await page.context().clearCookies();
    console.log('1. Cookies cleared');

    // Step 2: Navigate to signin
    await page.goto(`${BASE_URL}/auth/signin`);
    console.log('2. Navigated to signin page');

    // Step 3: Fill credentials
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    console.log('3. Credentials entered');

    // Step 4: Submit and monitor
    const loginPromise = page.click('button[type="submit"]');
    console.log('4. Login button clicked');

    // Wait for response
    await loginPromise;
    await page.waitForTimeout(500);
    console.log('5. Login response received');

    // Step 5: Check cookies
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(c => c.name.includes('sb-'));
    console.log(`6. Cookies found: ${authCookies.length}`);

    if (authCookies.length === 0) {
      console.log('❌ NO COOKIES SET - This is the root cause!');
    } else {
      console.log('✅ Cookies set successfully');

      // Log each cookie's critical attributes
      authCookies.forEach(c => {
        console.log(`   - ${c.name}:`);
        console.log(`     Domain: ${c.domain || '(none)'}`);
        console.log(`     Secure: ${c.secure}`);
        console.log(`     SameSite: ${c.sameSite}`);
      });
    }

    // Step 6: Try to access protected route
    console.log('7. Attempting to access /member/quotations...');
    await page.goto(`${BASE_URL}/member/quotations`, { waitUntil: 'networkidle' });

    const finalUrl = page.url();
    console.log(`8. Final URL: ${finalUrl}`);

    if (finalUrl.includes('/auth/signin')) {
      console.log('❌ REDIRECTED TO SIGNIN - Authentication failed');
    } else {
      console.log('✅ AUTHENTICATION SUCCESSFUL');
    }

    await page.screenshot({ path: 'debug-screenshots/06-full-flow.png' });
    console.log('\n✅ Scenario 6 Complete: Full authentication flow tested\n');
  });

  test('Scenario 7: Cookie attribute test matrix', async ({ page }) => {
    console.log('\n=== SCENARIO 7: Cookie Attribute Testing ===\n');
    console.log('This scenario tests different cookie configurations');
    console.log('Requires server-side modifications to test each variant\n');

    // Note: This test requires server-side changes to modify cookie settings
    // Documenting expected behaviors:

    const testCases = [
      { name: 'No domain, secure=false, sameSite=lax', expected: 'PASS' },
      { name: 'Domain=localhost, secure=false', expected: 'FAIL - localhost rejected' },
      { name: 'No domain, secure=true', expected: 'FAIL - requires HTTPS' },
      { name: 'No domain, sameSite=strict', expected: 'MAY FAIL - blocks navigation' },
    ];

    console.log('Test Cases:');
    testCases.forEach((tc, i) => {
      console.log(`${i + 1}. ${tc.name}`);
      console.log(`   Expected: ${tc.expected}\n`);
    });

    console.log('To execute these tests, modify /src/app/api/auth/signin/route.ts');
    console.log('to use different cookie options, then rerun this test.\n');

    console.log('✅ Scenario 7 Complete: Test matrix documented\n');
  });

  test('Scenario 8: Cross-page cookie persistence', async ({ page }) => {
    console.log('\n=== SCENARIO 8: Cross-Page Cookie Persistence ===\n');

    // Login
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const testPaths = [
      '/member/dashboard',
      '/member/quotations',
      '/member/orders',
      '/',
      '/catalog',
    ];

    console.log('Testing navigation across multiple pages...\n');

    for (const path of testPaths) {
      const url = `${BASE_URL}${path}`;
      console.log(`Navigating to: ${path}`);

      await page.goto(url, { waitUntil: 'networkidle' });

      // Check cookies
      const cookies = await page.context().cookies();
      const authCookies = cookies.filter(c => c.name.includes('sb-'));

      console.log(`  Cookies present: ${authCookies.length}`);
      console.log(`  Final URL: ${page.url()}`);

      if (authCookies.length === 0) {
        console.log(`  ❌ Cookies lost on ${path}`);
      } else {
        console.log(`  ✅ Cookies maintained`);
      }
    }

    // Return to protected page
    await page.goto(`${BASE_URL}/member/quotations`);
    const finalUrl = page.url();

    console.log(`\nFinal navigation to protected route: ${finalUrl}`);

    if (finalUrl.includes('/auth/signin')) {
      console.log('❌ Authentication not maintained across navigation');
    } else {
      console.log('✅ Authentication maintained throughout navigation');
    }

    await page.screenshot({ path: 'debug-screenshots/08-cross-page.png' });
    console.log('\n✅ Scenario 8 Complete: Cross-page persistence tested\n');
  });

  test('Scenario 9: Browser refresh test', async ({ page }) => {
    console.log('\n=== SCENARIO 9: Browser Refresh Test ===\n');

    // Login and navigate to protected page
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Go to protected page
    await page.goto(`${BASE_URL}/member/quotations`);
    const urlBeforeRefresh = page.url();
    console.log(`URL before refresh: ${urlBeforeRefresh}`);

    // Check cookies before refresh
    const cookiesBefore = await page.context().cookies();
    const authCookiesBefore = cookiesBefore.filter(c => c.name.includes('sb-'));
    console.log(`Cookies before refresh: ${authCookiesBefore.length}`);

    // Refresh the page
    console.log('\nRefreshing page...');
    await page.reload({ waitUntil: 'networkidle' });

    // Check state after refresh
    const urlAfterRefresh = page.url();
    console.log(`URL after refresh: ${urlAfterRefresh}`);

    const cookiesAfter = await page.context().cookies();
    const authCookiesAfter = cookiesAfter.filter(c => c.name.includes('sb-'));
    console.log(`Cookies after refresh: ${authCookiesAfter.length}`);

    if (urlAfterRefresh.includes('/auth/signin')) {
      console.log('❌ Redirected to signin after refresh');
    } else if (urlBeforeRefresh === urlAfterRefresh && authCookiesAfter.length > 0) {
      console.log('✅ Authentication maintained after refresh');
    } else {
      console.log('⚠️ Unexpected behavior after refresh');
    }

    await page.screenshot({ path: 'debug-screenshots/09-refresh-test.png' });
    console.log('\n✅ Scenario 9 Complete: Refresh test finished\n');
  });

  test('Scenario 10: Cookie expiry verification', async ({ page }) => {
    console.log('\n=== SCENARIO 10: Cookie Expiry Verification ===\n');

    // Login
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Get cookies with expiry info
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(c => c.name.includes('sb-'));

    console.log('\nCookie Expiry Information:\n');

    const now = Math.floor(Date.now() / 1000);

    authCookies.forEach(cookie => {
      console.log(`Cookie: ${cookie.name}`);

      if (cookie.expires) {
        const expiresDate = new Date(cookie.expires * 1000);
        const secondsUntilExpiry = cookie.expires - now;
        const hoursUntilExpiry = (secondsUntilExpiry / 3600).toFixed(1);

        console.log(`  Expires: ${expiresDate.toISOString()}`);
        console.log(`  Time until expiry: ${hoursUntilExpiry} hours`);

        // Check expected values
        if (cookie.name.includes('access-token')) {
          const expected = 24; // 24 hours
          const actual = parseFloat(hoursUntilExpiry);
          if (Math.abs(actual - expected) < 1) {
            console.log(`  ✅ Matches expected ~${expected} hours`);
          } else {
            console.log(`  ⚠️ Expected ~${expected} hours, got ${actual}`);
          }
        }

        if (cookie.name.includes('refresh-token')) {
          const expected = 30 * 24; // 30 days
          const actual = parseFloat(hoursUntilExpiry);
          if (Math.abs(actual - expected) < 24) {
            console.log(`  ✅ Matches expected ~${expected} hours (${expected / 24} days)`);
          } else {
            console.log(`  ⚠️ Expected ~${expected} hours, got ${actual}`);
          }
        }
      } else {
        console.log('  Expires: Session cookie (expires when browser closes)');
      }

      console.log('');
    });

    await page.screenshot({ path: 'debug-screenshots/10-expiry-test.png' });
    console.log('✅ Scenario 10 Complete: Expiry verification finished\n');
  });
});

test.afterAll(async () => {
  console.log('\n' + '='.repeat(60));
  console.log('ALL DEBUG TESTS COMPLETED');
  console.log('='.repeat(60));
  console.log('\nReview the screenshots in: debug-screenshots/');
  console.log('Review console output above for detailed findings\n');
});
