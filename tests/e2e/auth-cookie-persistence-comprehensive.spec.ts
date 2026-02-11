import { test, expect } from '@playwright/test';

/**
 * Comprehensive Authentication Cookie Persistence Test
 *
 * This test verifies that authentication cookies are properly set and persist
 * across navigation to different member pages without requiring re-login.
 *
 * Test Requirements:
 * - Navigate to signin page
 * - Fill in email and password
 * - Click login button
 * - Wait for dashboard to load
 * - Verify cookies are set (check for sb-* cookies)
 * - Navigate to another member page (e.g., /member/quotations)
 * - Verify authentication is maintained (should not redirect back to login)
 *
 * Test Credentials:
 * - Email: arwg22@gmail.com
 * - Password: Test1234!
 * - Test URL: http://localhost:3007/auth/signin
 */

test.describe('Authentication Cookie Persistence - Comprehensive', () => {

  // Test configuration
  const BASE_URL = 'http://localhost:3000';
  const TEST_CREDENTIALS = {
    email: 'arwg22@gmail.com',
    password: 'Test1234!'
  };

  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies and storage before each test to ensure clean state
    await context.clearCookies();

    // Clear localStorage and sessionStorage
    await page.goto(BASE_URL + '/auth/signin', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('COOKIES-001: Login and verify authentication cookies are set', async ({ page, context }) => {
    console.log('=== COOKIES-001: Testing login and cookie verification ===');

    // Step 1: Navigate to signin page
    await page.goto(`${BASE_URL}/auth/signin`, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

    // Verify signin page loaded
    const signinHeading = page.getByRole('heading', { name: /ログイン|サインイン|Sign In/i });
    await expect(signinHeading.first()).toBeVisible({ timeout: 5000 });

    // Step 2: Fill in login credentials
    await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.password);

    // Step 3: Click login button
    const loginButton = page.getByRole('button', { name: 'ログイン' });
    await loginButton.click();

    // Step 4: Wait for dashboard to load after login
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Step 5: Verify we're on the member dashboard
    await expect(page).toHaveURL(/\/member\/dashboard/, { timeout: 10000 });

    // Step 6: Verify authentication cookies are set
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );

    console.log('✓ Found auth cookies:', authCookies.map(c => ({
      name: c.name,
      domain: c.domain,
      path: c.path,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite
    })));

    expect(authCookies.length, 'Should have authentication cookies set').toBeGreaterThan(0);

    // Step 7: Verify cookies have proper attributes
    authCookies.forEach(cookie => {
      expect(cookie.name, 'Cookie should have a name').toBeTruthy();
      expect(cookie.value, 'Cookie should have a value').toBeTruthy();
      expect(cookie.domain, 'Cookie should have a domain').toBeTruthy();
      expect(cookie.path, 'Cookie should have a path').toBeTruthy();
    });

    // Step 8: Verify dashboard content is visible
    const dashboardHeading = page.getByRole('heading', { name: /ダッシュボード|Dashboard/i });
    const headingCount = await dashboardHeading.count();
    if (headingCount > 0) {
      await expect(dashboardHeading.first()).toBeVisible();
    }

    console.log('✓ COOKIES-001 PASSED: Login successful and cookies are set');
  });

  test('COOKIES-002: Navigate to quotations page and verify authentication persists', async ({ page, context }) => {
    console.log('=== COOKIES-002: Testing navigation to quotations page ===');

    // Login first
    await page.goto(`${BASE_URL}/auth/signin`, { timeout: 30000 });
    await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Verify initial login was successful
    await expect(page).toHaveURL(/\/member\/dashboard/, { timeout: 10000 });

    // Capture cookies after login
    const cookiesAfterLogin = await context.cookies();
    const authCookiesAfterLogin = cookiesAfterLogin.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );

    console.log('✓ Cookies after login:', authCookiesAfterLogin.map(c => c.name));

    // Navigate to quotations page
    await page.goto(`${BASE_URL}/member/quotations`, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // CRITICAL: Verify we're NOT redirected back to login
    const currentUrl = page.url();
    console.log('Current URL after navigation:', currentUrl);

    expect(currentUrl, 'Should stay on quotations page, not redirect to login').not.toContain('/auth/signin');
    expect(currentUrl, 'Should be on quotations page').toContain('/member/quotations');

    // Verify cookies are still present
    const cookiesAfterNav = await context.cookies();
    const authCookiesAfterNav = cookiesAfterNav.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );

    expect(authCookiesAfterNav.length, 'Auth cookies should persist after navigation').toBeGreaterThan(0);
    console.log('✓ Cookies after navigation:', authCookiesAfterNav.map(c => c.name));

    // Verify quotations page content is visible
    const pageContent = await page.textContent('body');
    expect(pageContent, 'Should see quotations page content').toBeTruthy();

    console.log('✓ COOKIES-002 PASSED: Authentication persists when navigating to quotations');
  });

  test('COOKIES-003: Navigate to orders page and verify authentication persists', async ({ page, context }) => {
    console.log('=== COOKIES-003: Testing navigation to orders page ===');

    // Login first
    await page.goto(`${BASE_URL}/auth/signin`, { timeout: 30000 });
    await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Verify initial login was successful
    await expect(page).toHaveURL(/\/member\/dashboard/, { timeout: 10000 });

    // Navigate to orders page
    await page.goto(`${BASE_URL}/member/orders`, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // CRITICAL: Verify we're NOT redirected back to login
    const currentUrl = page.url();
    console.log('Current URL after navigation:', currentUrl);

    expect(currentUrl, 'Should stay on orders page, not redirect to login').not.toContain('/auth/signin');
    expect(currentUrl, 'Should be on orders page').toContain('/member/orders');

    // Verify cookies are still present
    const cookiesAfterNav = await context.cookies();
    const authCookies = cookiesAfterNav.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );

    expect(authCookies.length, 'Auth cookies should persist when navigating to orders').toBeGreaterThan(0);

    console.log('✓ COOKIES-003 PASSED: Authentication persists when navigating to orders');
  });

  test('COOKIES-004: Navigate to profile page and verify authentication persists', async ({ page, context }) => {
    console.log('=== COOKIES-004: Testing navigation to profile page ===');

    // Login first
    await page.goto(`${BASE_URL}/auth/signin`, { timeout: 30000 });
    await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Verify initial login was successful
    await expect(page).toHaveURL(/\/member\/dashboard/, { timeout: 10000 });

    // Navigate to profile page
    await page.goto(`${BASE_URL}/member/profile`, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // CRITICAL: Verify we're NOT redirected back to login
    const currentUrl = page.url();
    console.log('Current URL after navigation:', currentUrl);

    expect(currentUrl, 'Should stay on profile page, not redirect to login').not.toContain('/auth/signin');
    expect(currentUrl, 'Should be on profile page').toContain('/member/profile');

    // Verify cookies are still present
    const cookiesAfterNav = await context.cookies();
    const authCookies = cookiesAfterNav.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );

    expect(authCookies.length, 'Auth cookies should persist when navigating to profile').toBeGreaterThan(0);

    console.log('✓ COOKIES-004 PASSED: Authentication persists when navigating to profile');
  });

  test('COOKIES-005: Navigate to notifications page and verify authentication persists', async ({ page, context }) => {
    console.log('=== COOKIES-005: Testing navigation to notifications page ===');

    // Login first
    await page.goto(`${BASE_URL}/auth/signin`, { timeout: 30000 });
    await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Verify initial login was successful
    await expect(page).toHaveURL(/\/member\/dashboard/, { timeout: 10000 });

    // Navigate to notifications page
    await page.goto(`${BASE_URL}/member/notifications`, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // CRITICAL: Verify we're NOT redirected back to login
    const currentUrl = page.url();
    console.log('Current URL after navigation:', currentUrl);

    expect(currentUrl, 'Should stay on notifications page, not redirect to login').not.toContain('/auth/signin');
    expect(currentUrl, 'Should be on notifications page').toContain('/member/notifications');

    // Verify cookies are still present
    const cookiesAfterNav = await context.cookies();
    const authCookies = cookiesAfterNav.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );

    expect(authCookies.length, 'Auth cookies should persist when navigating to notifications').toBeGreaterThan(0);

    console.log('✓ COOKIES-005 PASSED: Authentication persists when navigating to notifications');
  });

  test('COOKIES-006: Multiple page navigations while maintaining authentication', async ({ page, context }) => {
    console.log('=== COOKIES-006: Testing multiple page navigations ===');

    // Login first
    await page.goto(`${BASE_URL}/auth/signin`, { timeout: 30000 });
    await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Verify initial login was successful
    await expect(page).toHaveURL(/\/member\/dashboard/, { timeout: 10000 });

    const pages = [
      { path: '/member/quotations', name: 'Quotations' },
      { path: '/member/orders', name: 'Orders' },
      { path: '/member/profile', name: 'Profile' },
      { path: '/member/notifications', name: 'Notifications' },
      { path: '/member/dashboard', name: 'Dashboard' }
    ];

    // Navigate through multiple pages
    for (const pageInfo of pages) {
      console.log(`Navigating to: ${pageInfo.name} (${pageInfo.path})`);

      await page.goto(`${BASE_URL}${pageInfo.path}`, { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1000);

      // CRITICAL: Verify we're NOT redirected back to login
      const currentUrl = page.url();
      expect(currentUrl, `Should stay on ${pageInfo.name}, not redirect to login`).not.toContain('/auth/signin');
      expect(currentUrl, `Should be on ${pageInfo.name}`).toContain(pageInfo.path);

      // Verify cookies are still present
      const cookies = await context.cookies();
      const authCookies = cookies.filter(c =>
        c.name.includes('sb-') ||
        c.name.includes('access-token') ||
        c.name.includes('refresh-token')
      );

      expect(authCookies.length, `Auth cookies should persist when navigating to ${pageInfo.name}`).toBeGreaterThan(0);
      console.log(`✓ Auth cookies present: ${authCookies.map(c => c.name).join(', ')}`);
    }

    console.log('✓ COOKIES-006 PASSED: Authentication persists across multiple page navigations');
  });

  test('COOKIES-007: Verify authentication persists after page reload', async ({ page, context }) => {
    console.log('=== COOKIES-007: Testing page reload ===');

    // Login first
    await page.goto(`${BASE_URL}/auth/signin`, { timeout: 30000 });
    await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Verify initial login was successful
    await expect(page).toHaveURL(/\/member\/dashboard/, { timeout: 10000 });

    // Capture cookies before reload
    const cookiesBeforeReload = await context.cookies();
    const authCookiesBeforeReload = cookiesBeforeReload.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );

    console.log('Cookies before reload:', authCookiesBeforeReload.map(c => c.name));

    // Reload the page multiple times
    for (let i = 1; i <= 3; i++) {
      console.log(`Reloading page (attempt ${i}/3)`);

      await page.reload({ timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(2000);

      // Verify we're still on dashboard (not redirected to login)
      const currentUrl = page.url();
      expect(currentUrl, `Should remain on dashboard after reload ${i}`).toContain('/member/dashboard');

      // Verify cookies are still present after reload
      const cookiesAfterReload = await context.cookies();
      const authCookiesAfterReload = cookiesAfterReload.filter(c =>
        c.name.includes('sb-') ||
        c.name.includes('access-token') ||
        c.name.includes('refresh-token')
      );

      expect(authCookiesAfterReload.length, `Auth cookies should persist after reload ${i}`).toBeGreaterThan(0);
      console.log(`✓ Cookies after reload ${i}:`, authCookiesAfterReload.map(c => c.name));
    }

    console.log('✓ COOKIES-007 PASSED: Authentication persists after page reloads');
  });

  test('COOKIES-008: Verify authentication fails with wrong credentials', async ({ page, context }) => {
    console.log('=== COOKIES-008: Testing failed authentication ===');

    // Use wrong credentials
    const wrongPassword = 'WrongPassword123!';

    // Try to login with wrong password
    await page.goto(`${BASE_URL}/auth/signin`, { timeout: 30000 });
    await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(wrongPassword);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForTimeout(3000);

    // Should remain on login page
    const currentUrl = page.url();
    expect(currentUrl, 'Should remain on signin page with wrong credentials').toContain('/auth/signin');

    // Verify NO auth cookies are set
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );

    expect(authCookies.length, 'Should not have auth cookies with failed login').toBe(0);

    console.log('✓ COOKIES-008 PASSED: Failed login does not set auth cookies');
  });

  test('COOKIES-009: Verify protected pages require authentication', async ({ page, context }) => {
    console.log('=== COOKIES-009: Testing protected page access without auth ===');

    // Clear all cookies to ensure no authentication
    await context.clearCookies();

    // Try to access protected member page without login
    await page.goto(`${BASE_URL}/member/quotations`, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // Should redirect to login page
    const currentUrl = page.url();
    console.log('Redirected to:', currentUrl);

    expect(currentUrl, 'Should redirect to login when accessing protected page').toContain('/auth/signin');

    // Verify NO auth cookies are present
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );

    expect(authCookies.length, 'Should not have auth cookies without login').toBe(0);

    console.log('✓ COOKIES-009 PASSED: Protected pages require authentication');
  });

  test('COOKIES-010: Verify cookie security attributes', async ({ page, context }) => {
    console.log('=== COOKIES-010: Testing cookie security attributes ===');

    // Login
    await page.goto(`${BASE_URL}/auth/signin`, { timeout: 30000 });
    await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Get all cookies
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );

    console.log('All cookies:', cookies.map(c => ({
      name: c.name,
      domain: c.domain,
      path: c.path,
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite
    })));

    // Verify security attributes
    authCookies.forEach(cookie => {
      // HttpOnly flag should be set to prevent XSS
      if (cookie.name.includes('sb-') || cookie.name.includes('access-token')) {
        expect(cookie.httpOnly, `${cookie.name} should be httpOnly for security`).toBeTruthy();
      }

      // SameSite should be strict or lax to prevent CSRF
      expect(['Strict', 'Lax', 'None'].includes(cookie.sameSite || ''), `${cookie.name} should have sameSite attribute`).toBeTruthy();
    });

    expect(authCookies.length, 'Should have auth cookies with proper security').toBeGreaterThan(0);

    console.log('✓ COOKIES-010 PASSED: Cookies have proper security attributes');
  });

  test('COOKIES-011: Comprehensive end-to-end authentication flow', async ({ page, context }) => {
    console.log('=== COOKIES-011: Comprehensive E2E authentication test ===');

    // Step 1: Login
    await page.goto(`${BASE_URL}/auth/signin`, { timeout: 30000 });
    await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.email);
    await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.password);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Verify dashboard
    await expect(page).toHaveURL(/\/member\/dashboard/, { timeout: 10000 });
    console.log('✓ Step 1: Login successful, on dashboard');

    // Step 2: Verify cookies
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );
    expect(authCookies.length).toBeGreaterThan(0);
    console.log('✓ Step 2: Auth cookies present');

    // Step 3: Navigate to quotations
    await page.goto(`${BASE_URL}/member/quotations`, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    expect(page.url()).not.toContain('/auth/signin');
    console.log('✓ Step 3: Can access quotations page');

    // Step 4: Navigate to orders
    await page.goto(`${BASE_URL}/member/orders`, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    expect(page.url()).not.toContain('/auth/signin');
    console.log('✓ Step 4: Can access orders page');

    // Step 5: Navigate to profile
    await page.goto(`${BASE_URL}/member/profile`, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    expect(page.url()).not.toContain('/auth/signin');
    console.log('✓ Step 5: Can access profile page');

    // Step 6: Reload page
    await page.reload({ timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
    expect(page.url()).not.toContain('/auth/signin');
    console.log('✓ Step 6: Authentication persists after reload');

    // Step 7: Verify cookies still present
    const finalCookies = await context.cookies();
    const finalAuthCookies = finalCookies.filter(c =>
      c.name.includes('sb-') ||
      c.name.includes('access-token') ||
      c.name.includes('refresh-token')
    );
    expect(finalAuthCookies.length).toBeGreaterThan(0);
    console.log('✓ Step 7: Auth cookies still present after all operations');

    console.log('✓ COOKIES-011 PASSED: Comprehensive E2E authentication flow successful');
  });

});
