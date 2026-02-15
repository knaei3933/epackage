import { test, expect } from '@playwright/test';

/**
 * Test Authentication Flow with Playwright
 *
 * Test Scenario:
 * 1. Navigate to http://localhost:3000/auth/signin
 * 2. Fill in email: arwg22@gmail.com
 * 3. Fill in password: Test1234!
 * 4. Click the login button
 * 5. Wait for navigation to dashboard
 * 6. Verify the dashboard loads successfully (URL should be http://localhost:3000/member/dashboard)
 * 7. Check for any 401 errors in console or network
 * 8. Take a screenshot of the final state
 *
 * Expected Outcome:
 * - Login should succeed
 * - User should be redirected to dashboard
 * - No 401 errors should occur
 * - Dashboard should display user data
 */

test.describe('Authentication Flow Test', () => {
  const BASE_URL = 'http://localhost:3000';
  const TEST_EMAIL = 'arwg22@gmail.com';
  const TEST_PASSWORD = 'Test1234!';

  test('should login successfully and redirect to member dashboard', async ({ page }) => {
    console.log('\n=== Authentication Flow Test Started ===\n');

    // Track console errors
    const consoleErrors: string[] = [];
    const network401Errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        consoleErrors.push(text);
        console.log(`[Console Error]: ${text}`);
      }
    });

    // Track network requests for 401 errors
    page.on('response', response => {
      if (response.status() === 401) {
        const url = response.url();
        network401Errors.push(url);
        console.log(`[401 Error]: ${url}`);
      }
    });

    // Step 1: Navigate to signin page
    console.log('Step 1: Navigating to signin page...');
    await page.goto(`${BASE_URL}/auth/signin`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    console.log(`✓ Page loaded: ${page.url()}`);

    // Step 2: Fill in email
    console.log('Step 2: Filling in email...');
    await page.fill('input[type="email"]', TEST_EMAIL);
    console.log(`✓ Email entered: ${TEST_EMAIL}`);

    // Step 3: Fill in password
    console.log('Step 3: Filling in password...');
    await page.fill('input[type="password"]', TEST_PASSWORD);
    console.log('✓ Password entered');

    // Step 4: Click the login button
    console.log('Step 4: Clicking login button...');
    await page.click('button[type="submit"]');
    console.log('✓ Login button clicked');

    // Step 5: Wait for navigation to dashboard
    console.log('Step 5: Waiting for navigation to dashboard...');
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000); // Additional wait for redirect

    // Step 6: Verify the dashboard loads successfully
    console.log('Step 6: Verifying dashboard URL...');
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    // Check if we're on the member dashboard
    const isOnDashboard = currentUrl.includes('/member/dashboard');
    const isOnSignin = currentUrl.includes('/auth/signin');

    if (isOnDashboard) {
      console.log('✓ Successfully redirected to member dashboard');
    } else if (isOnSignin) {
      console.log('✗ Login failed - still on signin page');
    } else {
      console.log(`⚠ Unexpected redirect to: ${currentUrl}`);
    }

    // Step 7: Check for 401 errors
    console.log('\nStep 7: Checking for 401 errors...');
    console.log(`Console errors found: ${consoleErrors.length}`);
    console.log(`Network 401 errors found: ${network401Errors.length}`);

    if (consoleErrors.length > 0) {
      console.log('\nConsole Errors:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    }

    if (network401Errors.length > 0) {
      console.log('\nNetwork 401 Errors:');
      network401Errors.forEach(url => console.log(`  - ${url}`));
    }

    // Step 8: Take screenshot of final state
    console.log('\nStep 8: Taking screenshot...');
    await page.screenshot({
      path: 'test-results/screenshots/auth-flow-final-state.png',
      fullPage: true
    });
    console.log('✓ Screenshot saved');

    // Verify cookies were set
    const cookies = await page.context().cookies();
    const authCookies = cookies.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );
    console.log(`\nAuth cookies found: ${authCookies.length}`);

    if (authCookies.length > 0) {
      console.log('✓ Authentication cookies are set');
      authCookies.forEach(cookie => {
        console.log(`  - ${cookie.name}: domain=${cookie.domain}, secure=${cookie.secure}`);
      });
    } else {
      console.log('✗ No authentication cookies found');
    }

    // Test assertions
    console.log('\n=== Test Assertions ===');

    // Assert login succeeded
    expect(isOnDashboard).toBeTruthy();
    console.log('✓ Assertion passed: User is on dashboard');

    // Assert no 401 errors
    expect(network401Errors.length).toBe(0);
    console.log('✓ Assertion passed: No 401 errors in network requests');

    // Assert auth cookies are set
    expect(authCookies.length).toBeGreaterThan(0);
    console.log('✓ Assertion passed: Authentication cookies are set');

    console.log('\n=== Authentication Flow Test Completed ===\n');
  });
});
