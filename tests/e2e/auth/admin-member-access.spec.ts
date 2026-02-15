import { test, expect } from '@playwright/test';

/**
 * Test Suite: Admin User Access to Member Pages
 *
 * Purpose: Verify that admin users can access member pages after middleware auth header fix
 *
 * Context:
 * - /api/auth/session now prioritizes middleware headers
 * - Middleware sets auth headers for /api/auth/session
 *
 * Test User: admin@epackage-lab.com / Admin123!
 */

test.describe('Admin Member Page Access', () => {
  let consoleLogs: string[] = [];
  let pageErrors: Error[] = [];

  test.beforeEach(async ({ page }) => {
    consoleLogs = [];
    pageErrors = [];

    // Capture console logs
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(`[${msg.type()}] ${text}`);
      if (msg.type() === 'error') {
        console.error('Console error:', text);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      pageErrors.push(error);
      console.error('Page error:', error.message);
    });
  });

  test('should allow admin to access member pages', async ({ page, context }) => {

    // Step 1: Navigate to base URL
    console.log('\n=== Step 1: Navigate to base URL ===');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    await page.screenshot({ path: 'test-results/admin-step1-homepage.png' });
    expect(currentUrl).toContain('localhost:3000');

    // Step 2: Navigate to signin page
    console.log('\n=== Step 2: Navigate to signin page ===');
    await page.goto('http://localhost:3000/auth/signin');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/admin-step2-signin.png' });
    await expect(page).toHaveURL(/\/auth\/signin/);

    // Step 3: Login with admin credentials
    console.log('\n=== Step 3: Login with admin credentials ===');
    await page.fill('input[type="email"]', 'admin@epackage-lab.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.screenshot({ path: 'test-results/admin-step3-filled.png' });

    await Promise.all([
      page.waitForURL(/\/admin\/dashboard/),
      page.click('button[type="submit"]')
    ]);

    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/admin-step3-loggedin.png' });
    console.log('Login successful, current URL:', page.url());

    // Verify we're on admin dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Step 4: Verify admin dashboard loaded
    console.log('\n=== Step 4: Verify admin dashboard ===');
    const dashboardVisible = await page.locator('text=管理ダッシュボード').isVisible().catch(() => false);
    console.log('Dashboard visible:', dashboardVisible);
    await page.screenshot({ path: 'test-results/admin-step4-dashboard.png' });

    // Check for console errors after login
    console.log('\n=== Console logs after login ===');
    const loginErrors = consoleLogs.filter(log => log.includes('[error]'));
    if (loginErrors.length > 0) {
      console.log('Errors found:', loginErrors);
    }

    // Step 5: Open user menu and click "見積もり履歴"
    console.log('\n=== Step 5: Navigate to quotations from menu ===');

    // Try to find and click user menu button
    const userMenuButton = page.locator('button:has-text("管理者"), [aria-label*="user"], [aria-label*="menu"], .user-menu-btn').first();
    await userMenuButton.click().catch(() => {
      console.log('User menu button not found, trying alternative selectors');
    });

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/admin-step5-menu-open.png' });

    // Look for "見積もり履歴" link
    const quotationsLink = page.locator('a:has-text("見積もり履歴"), a[href*="/member/quotations"]').first();
    const linkExists = await quotationsLink.isVisible().catch(() => false);
    console.log('Quotations link visible:', linkExists);

    if (linkExists) {
      await quotationsLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/admin-step5-after-menu-click.png' });
    }

    // Step 6: Direct navigation to /member/quotations
    console.log('\n=== Step 6: Direct access to /member/quotations ===');
    await page.goto('http://localhost:3000/member/quotations');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const quotationsUrl = page.url();
    console.log('Current URL after /member/quotations navigation:', quotationsUrl);
    await page.screenshot({ path: 'test-results/admin-step6-quotations-page.png' });

    // Verify we can access the page (not redirected to signin)
    const isOnQuotationsPage = quotationsUrl.includes('/member/quotations');
    const isNotRedirected = !quotationsUrl.includes('/auth/signin');

    console.log('On quotations page:', isOnQuotationsPage);
    console.log('Not redirected to signin:', isNotRedirected);

    expect(isNotRedirected).toBeTruthy();

    // Step 7: Direct access to /member/orders/history
    console.log('\n=== Step 7: Direct access to /member/orders/history ===');
    await page.goto('http://localhost:3000/member/orders/history');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const ordersUrl = page.url();
    console.log('Current URL after /member/orders/history navigation:', ordersUrl);
    await page.screenshot({ path: 'test-results/admin-step7-orders-page.png' });

    // Verify authentication maintained
    const isOnOrdersPage = ordersUrl.includes('/member/orders');
    const stillAuthenticated = !ordersUrl.includes('/auth/signin');

    console.log('On orders history page:', isOnOrdersPage);
    console.log('Authentication maintained:', stillAuthenticated);

    expect(stillAuthenticated).toBeTruthy();

    // Final checks
    console.log('\n=== Final Verification ===');
    console.log('Total console logs:', consoleLogs.length);
    console.log('Total page errors:', pageErrors.length);
    console.log('Console errors:', consoleLogs.filter(l => l.includes('[error]')));

    // Check session in localStorage or cookies
    const cookies = await context.cookies();
    console.log('Cookies found:', cookies.map(c => c.name));

    await page.screenshot({ path: 'test-results/admin-final-state.png' });

    // Assertions
    expect(pageErrors.length).toBe(0);
    expect(isOnQuotationsPage || isOnOrdersPage).toBeTruthy();
  });

  test('should maintain session across multiple page navigations', async ({ page }) => {
    console.log('\n=== Session Persistence Test ===');

    // Login
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[type="email"]', 'admin@epackage-lab.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/admin\/dashboard/);

    // Navigate to multiple member pages
    const testPaths = [
      '/member/quotations',
      '/member/orders/history',
      '/member/quotations', // Go back to verify session still valid
      '/member/dashboard'
    ];

    for (const path of testPaths) {
      console.log(`\nNavigating to ${path}`);
      await page.goto(`http://localhost:3000${path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('/auth/signin');

      console.log(`Path: ${path}`);
      console.log(`Current URL: ${currentUrl}`);
      console.log(`Redirected to signin: ${isRedirected}`);

      await page.screenshot({ path: `test-results/session-persistence${path.replace(/\//g, '-')}.png` });

      expect(isRedirected).toBeFalsy();
    }

    console.log('\nSession persistence test completed');
  });
});
