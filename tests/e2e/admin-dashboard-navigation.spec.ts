import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Navigation Test', () => {
  test.beforeEach(async ({ page }) => {
    // Set up console logging
    page.on('console', msg => {
      console.log(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.error(`[Page Error] ${error}`);
    });

    // Listen for failed requests
    page.on('requestfailed', request => {
      console.error(`[Request Failed] ${request.url()} - ${request.failure()?.errorText}`);
    });
  });

  test('Admin login and navigation test', async ({ page }) => {
    console.log('=== Step 1: Navigate to localhost:3000 ===');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-screenshots/01-homepage.png' });
    console.log('Homepage loaded successfully');

    console.log('=== Step 2: Login as admin ===');
    // Click login button
    await page.click('text=ログイン');
    await page.waitForLoadState('networkidle');

    // Fill in login form using more specific selectors
    // React Hook Form generates name attributes like "email" and "password"
    await page.fill('input[name="email"]', 'admin@epackage-lab.com');
    await page.fill('input[name="password"]', 'Admin123!');

    await page.screenshot({ path: 'test-screenshots/02-login-form.png' });

    // Submit login and wait for navigation to admin dashboard
    // The LoginForm uses setTimeout with window.location.href, so we need to wait for the URL change
    console.log('Submitting login form...');

    // First click the submit button
    await page.click('button[type="submit"]');

    // Wait for either success or error
    await page.waitForTimeout(2000);

    // Check current URL
    const currentUrl = page.url();
    console.log('Current URL after submit:', currentUrl);

    // If still on signin page, check for error messages
    if (currentUrl.includes('/auth/signin')) {
      console.log('Still on signin page, checking for errors...');

      // Check for error messages
      const errorSelector = '.text-error-600, .text-error-400, [role="alert"]';
      const errorVisible = await page.locator(errorSelector).count();
      if (errorVisible > 0) {
        const errorText = await page.locator(errorSelector).first().textContent();
        console.log('Error message found:', errorText);
      }

      // Take screenshot to see current state
      await page.screenshot({ path: 'test-screenshots/03a-still-on-signin.png' });
    }

    // Now wait for the URL to change to admin dashboard
    // The LoginForm uses setTimeout with 100ms delay before navigation
    console.log('Waiting for navigation to admin dashboard...');
    await page.waitForURL('**/admin/dashboard', { timeout: 15000 });

    console.log('Current URL after login:', page.url());
    await page.screenshot({ path: 'test-screenshots/03-after-login.png' });

    console.log('=== Step 3: Verify admin dashboard ===');
    // Check if we're on admin dashboard
    const url = page.url();
    expect(url).toContain('/admin/dashboard');

    // Check for dashboard elements
    const dashboardExists = await page.locator('text=ダッシュボード').count();
    console.log('Dashboard elements found:', dashboardExists);

    await page.screenshot({ path: 'test-screenshots/04-admin-dashboard.png' });
    console.log('Admin dashboard verified');

    console.log('=== Step 4: Navigate to member quotations page ===');
    // Admin should be able to access member pages
    // Navigate directly to /member/quotations
    console.log('Navigating to /member/quotations...');
    await page.goto('http://localhost:3002/member/quotations', { waitUntil: 'networkidle' });

    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'test-screenshots/05-member-quotations.png' });

    console.log('=== Step 5: Verify quotations page ===');
    // Verify we're on the quotations page
    expect(page.url()).toContain('/member/quotations');

    // Verify we're not on the signin page (admin can access member pages)
    const isSigninPage = page.url().includes('/auth/signin');
    expect(isSigninPage).toBe(false);

    console.log('✅ Admin can access /member/quotations without login redirect');

    console.log('=== Step 6: Navigate to member orders history ===');
    // Navigate to orders history
    console.log('Navigating to /member/orders...');
    await page.goto('http://localhost:3002/member/orders', { waitUntil: 'networkidle' });

    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'test-screenshots/06-member-orders.png' });

    console.log('=== Step 7: Verify authentication maintained ===');
    // Verify we're on the orders page and authentication is maintained
    expect(page.url()).toContain('/member/orders');

    // Verify we're not on the signin page
    const isSigninPage2 = page.url().includes('/auth/signin');
    expect(isSigninPage2).toBe(false);

    await page.screenshot({ path: 'test-screenshots/07-auth-verified.png' });
    console.log('✅ Admin can access member pages successfully!');
  });

  test('Check console logs and errors', async ({ page }) => {
    const consoleLogs: string[] = [];
    const pageErrors: Error[] = [];

    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', error => {
      pageErrors.push(error);
    });

    await page.goto('http://localhost:3002');
    await page.click('text=ログイン');
    await page.fill('input[type="email"]', 'admin@epackage-lab.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('\n=== Console Logs ===');
    consoleLogs.forEach(log => console.log(log));

    console.log('\n=== Page Errors ===');
    if (pageErrors.length > 0) {
      pageErrors.forEach(error => console.error(error));
      throw new Error(`Found ${pageErrors.length} page errors`);
    } else {
      console.log('No page errors detected');
    }
  });
});
