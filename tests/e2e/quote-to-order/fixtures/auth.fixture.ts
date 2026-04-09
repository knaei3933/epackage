import { test as base } from '@playwright/test';

/**
 * Authentication Fixtures for E2E Testing
 *
 * Provides authenticated browser contexts for member and admin users.
 * Uses storageState to persist session cookies across tests.
 *
 * @example
 * ```ts
 * test('my test', async ({ memberSession }) => {
 *   const page = await memberSession.newPage();
 *   await page.goto('/member/dashboard');
 * });
 * ```
 */

// =====================================================
// Type Definitions
// =====================================================

type AuthFixtures = {
  memberSession: import('@playwright/test').BrowserContext;
  adminSession: import('@playwright/test').BrowserContext;
};

// =====================================================
// Member Session Fixture
// =====================================================

export const test = base.extend<AuthFixtures>({
  memberSession: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo',
    });

    const page = await context.newPage();

    // Get test member credentials from environment variables
    // Default to admin credentials for testing
    const memberEmail = process.env.TEST_MEMBER_EMAIL || 'admin@epackage-lab.com';
    const memberPassword = process.env.TEST_MEMBER_PASSWORD || 'Admin123!';

    console.log('[auth.fixture] Logging in member user:', memberEmail);

    // Navigate to login page
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    // Fill in login form
    await page.fill('input[name="email"]', memberEmail);
    await page.fill('input[name="password"]', memberPassword);

    // Submit login form
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Wait for redirect to dashboard (successful login)
    await page.waitForURL(/\/member\/dashboard/, { timeout: 10000 });

    console.log('[auth.fixture] Member login successful');

    // Save storage state (cookies, localStorage, sessionStorage)
    const storageState = await context.storageState();

    // Use the context for the test
    await use(context);

    // Cleanup
    await context.close();
  },

  // =====================================================
  // Admin Session Fixture
  // =====================================================

  adminSession: async ({ browser }, use) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      locale: 'ja-JP',
      timezoneId: 'Asia/Tokyo',
    });

    const page = await context.newPage();

    // Admin credentials (hardcoded for testing)
    const adminEmail = 'admin@epackage-lab.com';
    const adminPassword = 'Admin123!';

    console.log('[auth.fixture] Logging in admin user:', adminEmail);

    // Navigate to login page
    await page.goto('/auth/signin');
    await page.waitForLoadState('networkidle');

    // Fill in login form
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);

    // Submit login form
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Wait for redirect to admin dashboard (successful login)
    await page.waitForURL(/\/admin\/dashboard/, { timeout: 10000 });

    console.log('[auth.fixture] Admin login successful');

    // Save storage state (cookies, localStorage, sessionStorage)
    const storageState = await context.storageState();

    // Use the context for the test
    await use(context);

    // Cleanup
    await context.close();
  },
});

// =====================================================
// Export
// =====================================================

export const expect = test.expect;
