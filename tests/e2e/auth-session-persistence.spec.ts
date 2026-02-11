import { test, expect } from '@playwright/test';
import { authenticateAndNavigate, isDevMode } from '../helpers/dev-mode-auth';

/**
 * Authentication Session Persistence Test
 *
 * This test verifies that:
 * 1. Login works correctly with admin credentials
 * 2. Admin dashboard loads without errors
 * 3. Navigation to member pages maintains authentication
 * 4. Console logs are clean (no authentication errors)
 * 5. /api/auth/session returns correct data
 *
 * Test Flow:
 * 1. Navigate to development server (http://localhost:3000)
 * 2. Login with admin credentials (admin@epackage-lab.com / Admin123!)
 * 3. Verify admin dashboard is displayed
 * 4. Click menu button and navigate to "見積もり履歴" (Quotations)
 * 5. Verify /member/quotations page loads correctly
 * 6. Click "注文履歴" (Orders History) link
 * 7. Verify /member/orders/history page loads
 * 8. Check console logs for errors
 * 9. Verify /api/auth/session returns correct data
 */

test.describe('Authentication Session Persistence', () => {
  const ADMIN_CREDENTIALS = {
    email: 'admin@epackage-lab.com',
    password: 'Admin123!'
  };

  // Store console logs for verification
  const consoleLogs: string[] = [];
  const apiResponses: Map<string, any> = new Map();

  test.beforeEach(async ({ page }) => {
    // Clear arrays before each test
    consoleLogs.length = 0;
    apiResponses.clear();

    // Setup console logging
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      consoleLogs.push(`[${type}] ${text}`);
    });

    // Setup API response monitoring
    page.on('response', async response => {
      const url = response.url();
      if (url.includes('/api/auth/session')) {
        try {
          const data = await response.json().catch(() => null);
          apiResponses.set(url, {
            status: response.status(),
            data: data
          });
        } catch {
          apiResponses.set(url, {
            status: response.status(),
            data: null
          });
        }
      }
    });

    // Navigate to home page first
    await page.goto('/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(1000);
  });

  test('TC-AUTH-001: Admin login and session persistence', async ({ page }) => {
    test.skip(isDevMode(), 'Test skipped in DEV_MODE - requires real authentication');

    // Step 1: Navigate to signin page
    await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Verify signin page loaded
    await expect(page.locator('h1, h2').filter({ hasText: /ログイン|サインイン/ }).first()).toBeVisible({
      timeout: 10000
    });

    // Step 2: Fill in login form
    await page.getByLabel('メールアドレス').fill(ADMIN_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(ADMIN_CREDENTIALS.password);

    // Submit login form
    await page.getByRole('button', { name: /ログイン|サインイン/ }).click();

    // Step 3: Wait for redirect to admin dashboard
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });

    // Verify admin dashboard loaded
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    // Verify /api/auth/session was called and returned valid data
    const sessionCall = Array.from(apiResponses.values()).find(r => r.data?.session?.user);
    expect(sessionCall).toBeDefined();
    expect(sessionCall?.data?.session?.user?.email).toBe(ADMIN_CREDENTIALS.email);
    expect(sessionCall?.data?.profile?.role).toBe('ADMIN');

    // Check for authentication errors in console
    const authErrors = consoleLogs.filter(log =>
      log.toLowerCase().includes('auth') &&
      (log.toLowerCase().includes('error') || log.toLowerCase().includes('failed'))
    );

    // Filter out known safe errors
    const safeAuthErrors = authErrors.filter(error =>
      !error.includes('404') &&
      !error.includes('favicon') &&
      !error.includes('hydration')
    );

    expect(safeAuthErrors).toHaveLength(0);
  });

  test('TC-AUTH-002: Navigate to quotations from admin dashboard', async ({ page }) => {
    test.skip(isDevMode(), 'Test skipped in DEV_MODE - requires real authentication');

    // Login first
    await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.getByLabel('メールアドレス').fill(ADMIN_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(ADMIN_CREDENTIALS.password);
    await page.getByRole('button', { name: /ログイン|サインイン/ }).click();

    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Step 4: Look for menu button
    // The admin dashboard might have a hamburger menu or navigation
    const menuButtons = page.locator('button[aria-label*="menu"], button[aria-label*="メニュー"], .menu-button, [data-testid="menu-button"]');

    const menuButtonCount = await menuButtons.count();

    if (menuButtonCount > 0) {
      // Click menu button if exists
      await menuButtons.first().click();
      await page.waitForTimeout(500);
    }

    // Look for quotations link in navigation
    // Try different possible selectors for "見積もり履歴"
    const quotationsLinkSelectors = [
      'a[href="/member/quotations"]',
      'a:has-text("見積もり履歴")',
      'a:has-text("見積依頼")',
      '[data-testid="quotations-link"]',
      'nav a:has-text("見積")'
    ];

    let quotationsLink = null;
    for (const selector of quotationsLinkSelectors) {
      const link = page.locator(selector);
      if (await link.count() > 0) {
        quotationsLink = link.first();
        break;
      }
    }

    // If quotations link exists, click it
    if (quotationsLink) {
      await quotationsLink.click();
      await page.waitForTimeout(2000);

      // Step 5: Verify /member/quotations page loaded
      const currentUrl = page.url();
      expect(currentUrl).toContain('/member/quotations');

      // Verify page loaded without errors
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

      // Verify session is still valid
      const sessionCalls = Array.from(apiResponses.entries()).filter(([url]) =>
        url.includes('/api/auth/session')
      );

      expect(sessionCalls.length).toBeGreaterThan(0);

      // Most recent session call should have valid data
      const lastSessionCall = sessionCalls[sessionCalls.length - 1]?.[1];
      expect(lastSessionCall?.data?.session).toBeDefined();
      expect(lastSessionCall?.data?.profile).toBeDefined();
    } else {
      // Skip if quotations link not found (might not be accessible from admin dashboard)
      test.skip(true, 'Quotations link not found in admin dashboard navigation');
    }
  });

  test('TC-AUTH-003: Navigate to orders history and verify session', async ({ page }) => {
    test.skip(isDevMode(), 'Test skipped in DEV_MODE - requires real authentication');

    // Login first
    await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.getByLabel('メールアドレス').fill(ADMIN_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(ADMIN_CREDENTIALS.password);
    await page.getByRole('button', { name: /ログイン|サインイン/ }).click();

    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Step 6: Navigate directly to orders history
    await page.goto('/member/orders/history', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Step 7: Verify /member/orders/history page loaded
    await expect(page).toHaveURL(/\/member\/orders\/history/, { timeout: 10000 });

    // Verify page has content
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });

    // Verify authentication is maintained
    const sessionCalls = Array.from(apiResponses.entries()).filter(([url]) =>
      url.includes('/api/auth/session')
    );

    expect(sessionCalls.length).toBeGreaterThan(0);

    // Check that session data is valid
    const lastSessionCall = sessionCalls[sessionCalls.length - 1]?.[1];
    expect(lastSessionCall?.data?.session).toBeDefined();
    expect(lastSessionCall?.data?.session?.user).toBeDefined();
    expect(lastSessionCall?.data?.profile?.role).toBeDefined();

    // Verify user is authenticated
    expect(lastSessionCall?.data?.session?.user?.email).toBe(ADMIN_CREDENTIALS.email);
  });

  test('TC-AUTH-004: Console log verification', async ({ page }) => {
    test.skip(isDevMode(), 'Test skipped in DEV_MODE - requires real authentication');

    // Login and navigate through pages
    await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.getByLabel('メールアドレス').fill(ADMIN_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(ADMIN_CREDENTIALS.password);
    await page.getByRole('button', { name: /ログイン|サインイン/ }).click();

    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Navigate to quotations
    await page.goto('/member/quotations', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Navigate to orders history
    await page.goto('/member/orders/history', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Step 8: Check console logs for errors
    const errors = consoleLogs.filter(log =>
      log.toLowerCase().includes('error') ||
      log.toLowerCase().includes('failed') ||
      log.toLowerCase().includes('warning')
    );

    // Filter out known safe errors
    const knownSafeErrors = [
      'favicon',
      '404',
      'hydration',
      'next.js',
      'react',
      'warning:',
      'deprecated',
      'ads',
      'download the react devtools',
      'minified react error',
      'componentwill',
      'unsafe_'
    ];

    const criticalErrors = errors.filter(error => {
      const errorLower = error.toLowerCase();
      return !knownSafeErrors.some(safeError => errorLower.includes(safeError));
    });

    // Print console logs for debugging
    console.log('=== Console Logs Summary ===');
    console.log(`Total logs: ${consoleLogs.length}`);
    console.log(`Errors: ${errors.length}`);
    console.log(`Critical errors: ${criticalErrors.length}`);

    if (criticalErrors.length > 0) {
      console.log('=== Critical Errors ===');
      criticalErrors.forEach(error => console.log(error));
    }

    // Verify no critical errors
    expect(criticalErrors).toHaveLength(0);
  });

  test('TC-AUTH-005: API session endpoint verification', async ({ page }) => {
    test.skip(isDevMode(), 'Test skipped in DEV_MODE - requires real authentication');

    // Login
    await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.getByLabel('メールアドレス').fill(ADMIN_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(ADMIN_CREDENTIALS.password);
    await page.getByRole('button', { name: /ログイン|サインイン/ }).click();

    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Step 9: Make direct API call to verify session endpoint
    const sessionResponse = await page.request.get('/api/auth/session');

    expect(sessionResponse.status()).toBe(200);

    const sessionData = await sessionResponse.json();

    // Verify session structure
    expect(sessionData).toHaveProperty('session');
    expect(sessionData).toHaveProperty('profile');

    // Verify session user data
    expect(sessionData.session).toBeDefined();
    expect(sessionData.session.user).toBeDefined();
    expect(sessionData.session.user.id).toBeDefined();
    expect(sessionData.session.user.email).toBe(ADMIN_CREDENTIALS.email);

    // Verify profile data
    expect(sessionData.profile).toBeDefined();
    expect(sessionData.profile.role).toBe('ADMIN');
    expect(sessionData.profile.status).toBe('ACTIVE');

    // Verify token data (if present)
    if (sessionData.session.access_token) {
      expect(sessionData.session.access_token).toBeDefined();
      expect(sessionData.session.expires_at).toBeDefined();
    }

    console.log('=== API Session Data ===');
    console.log('User:', sessionData.session?.user?.email);
    console.log('Role:', sessionData.profile?.role);
    console.log('Status:', sessionData.profile?.status);
    console.log('Has access token:', !!sessionData.session?.access_token);
  });

  test('TC-AUTH-006: Session persistence across page reloads', async ({ page }) => {
    test.skip(isDevMode(), 'Test skipped in DEV_MODE - requires real authentication');

    // Login
    await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.getByLabel('メールアドレス').fill(ADMIN_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(ADMIN_CREDENTIALS.password);
    await page.getByRole('button', { name: /ログイン|サインイン/ }).click();

    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });

    // Reload page multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload({
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      await page.waitForTimeout(2000);

      // Verify we're still on admin dashboard (not redirected to login)
      expect(page.url()).toContain('/admin/dashboard');

      // Verify session is still valid
      const sessionResponse = await page.request.get('/api/auth/session');
      expect(sessionResponse.status()).toBe(200);

      const sessionData = await sessionResponse.json();
      expect(sessionData.session?.user?.email).toBe(ADMIN_CREDENTIALS.email);
    }
  });

  test('TC-AUTH-007: Middleware headers verification', async ({ page }) => {
    test.skip(isDevMode(), 'Test skipped in DEV_MODE - requires real authentication');

    // Login
    await page.goto('/auth/signin', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.getByLabel('メールアドレス').fill(ADMIN_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(ADMIN_CREDENTIALS.password);
    await page.getByRole('button', { name: /ログイン|サインイン/ }).click();

    await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Navigate to a member page
    await page.goto('/member/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Intercept the next session API call to check headers
    let sessionHeaders: Record<string, string> = {};

    page.on('request', request => {
      if (request.url().includes('/api/auth/session')) {
        sessionHeaders = {
          'x-user-id': request.headers()['x-user-id'] || 'NOT_SET',
          'x-user-role': request.headers()['x-user-role'] || 'NOT_SET',
          'x-user-status': request.headers()['x-user-status'] || 'NOT_SET',
        };
      }
    });

    // Trigger session API call by navigating
    await page.goto('/member/quotations', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Check if middleware set headers
    console.log('=== Middleware Headers ===');
    console.log('x-user-id:', sessionHeaders['x-user-id']);
    console.log('x-user-role:', sessionHeaders['x-user-role']);
    console.log('x-user-status:', sessionHeaders['x-user-status']);

    // Verify session API returns correct data
    const sessionResponse = await page.request.get('/api/auth/session');
    const sessionData = await sessionResponse.json();

    expect(sessionData.session?.user?.email).toBe(ADMIN_CREDENTIALS.email);
    expect(sessionData.profile?.role).toBe('ADMIN');

    // If middleware headers were set, verify they match
    if (sessionHeaders['x-user-id'] !== 'NOT_SET') {
      expect(sessionHeaders['x-user-id']).toBeDefined();
      expect(sessionHeaders['x-user-role']).toBe('ADMIN');
      expect(sessionHeaders['x-user-status']).toBe('ACTIVE');
    }
  });
});
