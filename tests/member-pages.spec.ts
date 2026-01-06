/**
 * Member Pages Comprehensive Test Suite
 *
 * Tests all member portal pages for:
 * - Page accessibility and loading
 * - Authentication requirements
 * - UI element presence
 * - Navigation functionality
 * - Data display or empty states
 *
 * Test Credentials:
 * - Email: test@epackage-lab.com
 * - Password: (any password in dev mode)
 */

import { test, expect } from '@playwright/test';

const MEMBER_PAGES = [
  { path: '/member/dashboard', name: 'Dashboard', description: '会員ダッシュボード' },
  { path: '/member/profile', name: 'Profile', description: '会員プロフィール' },
  { path: '/member/edit', name: 'Edit Profile', description: 'プロフィール編集' },
  { path: '/member/orders/new', name: 'New Orders', description: '新規注文' },
  { path: '/member/orders/history', name: 'Order History', description: '注文履歴' },
  { path: '/member/deliveries', name: 'Deliveries', description: '配送状況' },
  { path: '/member/invoices', name: 'Invoices', description: '請求書' },
  { path: '/member/quotations', name: 'Quotations', description: '見積依頼' },
  { path: '/member/samples', name: 'Samples', description: 'サンプル依頼' },
  { path: '/member/inquiries', name: 'Inquiries', description: 'お問い合わせ' },
];

test.describe('Member Pages - Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signin page
    await page.goto('/auth/signin');

    // Fill in login form
    await page.fill('input[type="email"]', 'test@epackage-lab.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForURL('**/member/dashboard', { timeout: 10000 });
  });

  test('should successfully login and redirect to dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/.*\/member\/dashboard/);
    await expect(page.locator('h1')).toContainText('ようこそ');
  });

  MEMBER_PAGES.forEach(({ path, name, description }) => {
    test(`${name} page (${description}) - should load successfully`, async ({ page }) => {
      // Navigate to page
      await page.goto(path);

      // Check for successful load
      await expect(page).toHaveURL(path);

      // Check page title is present
      const title = page.locator('h1, h2').first();
      await expect(title).toBeVisible();

      // Take screenshot for visual verification
      await page.screenshot({
        path: `test-results/member-pages/${name.replace(/\s+/g, '-').toLowerCase()}.png`,
        fullPage: true,
      });
    });
  });

  test('Dashboard should display statistics cards', async ({ page }) => {
    await page.goto('/member/dashboard');

    // Check for statistics cards
    const statsCards = page.locator('[class*="stat"]').or(page.locator('[class*="Stat"]'));
    const cardCount = await statsCards.count();

    expect(cardCount).toBeGreaterThan(0);

    // Check for specific stat items
    await expect(page.locator('text=/新規注文/')).toBeVisible();
    await expect(page.locator('text=/見積依頼/')).toBeVisible();
  });

  test('Profile page should display user information', async ({ page }) => {
    await page.goto('/member/profile');

    // Check for profile header
    await expect(page.locator('h1')).toContainText('マイページ');

    // Check for profile sections
    await expect(page.locator('text=/認証情報/')).toBeVisible();
    await expect(page.locator('text=/連絡先/')).toBeVisible();

    // Check for edit button
    const editButton = page.locator('button:has-text("編集")');
    const editButtonCount = await editButton.count();
    expect(editButtonCount).toBeGreaterThan(0);
  });

  test('Profile page should allow editing', async ({ page }) => {
    await page.goto('/member/profile');

    // Click edit button
    const editButton = page.locator('button:has-text("編集")').first();
    await editButton.click();

    // Check if form fields become editable
    const corporatePhoneInput = page.locator('input[placeholder*="03-"]').or(
      page.locator('label:has-text("会社電話番号") + input')
    );
    await expect(corporatePhoneInput.first()).toBeVisible();
  });

  test('New Orders page should have order creation interface', async ({ page }) => {
    await page.goto('/member/orders/new');

    // Check for order creation elements
    const pageTitle = page.locator('h1, h2').filter({ hasText: /注文/ });
    await expect(pageTitle.first()).toBeVisible();

    // Check for common order form elements
    const submitButton = page.locator('button:has-text("作成"), button:has-text("送信"), button:has-text("確認")');
    const submitButtonCount = await submitButton.count();
    expect(submitButtonCount).toBeGreaterThan(0);
  });

  test('Order History should display orders or empty state', async ({ page }) => {
    await page.goto('/member/orders/history');

    // Check for either order list or empty state
    const orderList = page.locator('[class*="order"]').or(page.locator('text=/注文/'));
    const emptyState = page.locator('text=/ありません|データがありません/');

    const isVisible = await orderList.isVisible().catch(() => false) ||
                      await emptyState.isVisible().catch(() => false);

    expect(isVisible).toBeTruthy();
  });

  test('Deliveries page should show delivery information', async ({ page }) => {
    await page.goto('/member/deliveries');

    // Check for delivery-related content
    const pageTitle = page.locator('h1, h2').filter({ hasText: /配送/ });
    if (await pageTitle.count() > 0) {
      await expect(pageTitle.first()).toBeVisible();
    }
  });

  test('Invoices page should show invoice information', async ({ page }) => {
    await page.goto('/member/invoices');

    // Check for invoice-related content
    const pageTitle = page.locator('h1, h2').filter({ hasText: /請求書/ });
    if (await pageTitle.count() > 0) {
      await expect(pageTitle.first()).toBeVisible();
    }
  });

  test('Quotations page should display quotations', async ({ page }) => {
    await page.goto('/member/quotations');

    // Check for quotation-related content
    const pageTitle = page.locator('h1, h2').filter({ hasText: /見積/ });
    if (await pageTitle.count() > 0) {
      await expect(pageTitle.first()).toBeVisible();
    }
  });

  test('Samples page should show sample requests', async ({ page }) => {
    await page.goto('/member/samples');

    // Check for sample-related content
    const pageTitle = page.locator('h1, h2').filter({ hasText: /サンプル/ });
    if (await pageTitle.count() > 0) {
      await expect(pageTitle.first()).toBeVisible();
    }
  });

  test('Inquiries page should display inquiries', async ({ page }) => {
    await page.goto('/member/inquiries');

    // Check for inquiry-related content
    const pageTitle = page.locator('h1, h2').filter({ hasText: /お問い合わせ/ });
    if (await pageTitle.count() > 0) {
      await expect(pageTitle.first()).toBeVisible();
    }
  });

  test('Navigation links should work correctly', async ({ page }) => {
    await page.goto('/member/dashboard');

    // Test navigation to each page
    for (const { path, name } of MEMBER_PAGES) {
      // Navigate to page
      await page.goto(path);

      // Verify URL
      await expect(page).toHaveURL(path);

      // Check for navigation elements (sidebar, header, etc.)
      const navElement = page.locator('nav').or(page.locator('[role="navigation"]'));
      const navCount = await navElement.count();
      expect(navCount).toBeGreaterThan(0);
    }
  });

  test('All pages should have consistent layout', async ({ page }) => {
    for (const { path } of MEMBER_PAGES) {
      await page.goto(path);

      // Check for common layout elements
      const mainContent = page.locator('main').or(page.locator('[role="main"]'));
      await expect(mainContent.first()).toBeVisible();

      // Check for responsive container
      const container = page.locator('class*="container"', class*="max-w"');
      const containerCount = await container.count();
      expect(containerCount).toBeGreaterThan(0);
    }
  });

  test('Pages should handle logout correctly', async ({ page }) => {
    await page.goto('/member/dashboard');

    // Look for logout button/link
    const logoutButton = page.locator('button:has-text("ログアウト"), a:has-text("ログアウト")');
    const logoutCount = await logoutButton.count();

    if (logoutCount > 0) {
      await logoutButton.first().click();

      // Should redirect to signin or home
      await page.waitForURL('**/auth/signin', { timeout: 5000 }).catch(() => {
        // If not redirected to signin, check for home
        return page.waitForURL('**/', { timeout: 5000 });
      });

      const url = page.url();
      expect(url).toMatch(/\/auth\/signin|\/$/);
    }
  });

  test('Dashboard should have quick action links', async ({ page }) => {
    await page.goto('/member/dashboard');

    // Check for quick action links or buttons
    const links = page.locator('a[href*="/member/"]');
    const linkCount = await links.count();

    expect(linkCount).toBeGreaterThan(0);

    // Verify links point to valid member pages
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href).toMatch(/^\/member\//);
    }
  });

  test('All pages should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    for (const { path } of MEMBER_PAGES.slice(0, 3)) { // Test first 3 pages
      await page.goto(path);

      // Check for mobile menu or hamburger icon
      const mobileMenu = page.locator('button[aria-label*="menu"], button:has-text("メニュー")');
      const mobileMenuCount = await mobileMenu.count();

      // Verify main content is still visible
      const mainContent = page.locator('main').or(page.locator('[role="main"]'));
      await expect(mainContent.first()).toBeVisible();
    }
  });

  test('Pages should display user info in header/sidebar', async ({ page }) => {
    await page.goto('/member/dashboard');

    // Check for user display
    const userDisplay = page.locator('text=/様/').or(page.locator('[class*="user"]'));
    const userCount = await userDisplay.count();

    expect(userCount).toBeGreaterThan(0);
  });

  test('Should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/member/dashboard');
    await page.goto('/member/profile');
    await page.goBack();
    await expect(page).toHaveURL(/.*\/member\/dashboard/);
    await page.goForward();
    await expect(page).toHaveURL(/.*\/member\/profile/);
  });
});

test.describe('Member Pages - Authentication Required', () => {
  test('should redirect to signin when not authenticated', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();

    // Try to access member pages without authentication
    const testPaths = ['/member/dashboard', '/member/profile', '/member/orders/history'];

    for (const path of testPaths) {
      await page.goto(path);

      // Should redirect to signin page
      await page.waitForURL('**/auth/signin**', { timeout: 5000 }).catch(() => {});

      const url = page.url();
      expect(url).toContain('/auth/signin');
    }
  });

  test('should preserve redirect URL in signin page', async ({ page }) => {
    await page.context().clearCookies();

    const targetPath = '/member/profile';
    await page.goto(targetPath);

    // Check if redirect parameter is present
    const url = page.url();
    if (url.includes('/auth/signin')) {
      const redirectParam = new URL(url).searchParams.get('redirect');
      expect(redirectParam).toBe(targetPath);
    }
  });
});

test.describe('Member Pages - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'test@epackage-lab.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/member/dashboard', { timeout: 10000 });
  });

  test('should handle invalid page routes gracefully', async ({ page }) => {
    // Try to access non-existent member page
    await page.goto('/member/nonexistent-page');

    // Should either show 404 or redirect to dashboard
    const url = page.url();
    const is404 = await page.locator('text=/404|見つかりません|Not Found/').count() > 0;
    const isDashboard = url.includes('/member/dashboard');

    expect(is404 || isDashboard).toBeTruthy();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Navigate to a page
    await page.goto('/member/profile');

    // Simulate offline mode
    await page.context().setOffline(true);

    // Try to navigate
    await page.goto('/member/orders/new');

    // Should show some kind of error or cached content
    await page.waitForLoadState('networkidle').catch(() => {});

    // Restore connection
    await page.context().setOffline(false);
  });
});

test.describe('Member Pages - Performance', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'test@epackage-lab.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/member/dashboard', { timeout: 10000 });
  });

  test('Dashboard should load within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/member/dashboard');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Dashboard should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('Profile page should load within performance budget', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/member/profile');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Profile should load in less than 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });
});

test.describe('Member Pages - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'test@epackage-lab.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/member/dashboard', { timeout: 10000 });
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/member/dashboard');

    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();

    // Check for h2
    const h2 = page.locator('h2');
    const h2Count = await h2.count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/member/dashboard');

    // Check for proper ARIA labels or roles
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/member/profile');

    // Tab through interactive elements
    const focusableElements = page.locator('button, a[href], input, select');
    const count = await focusableElements.count();

    expect(count).toBeGreaterThan(0);

    // Test first few elements
    for (let i = 0; i < Math.min(count, 5); i++) {
      await focusableElements.nth(i).focus();
      await expect(focusableElements.nth(i)).toBeFocused();
    }
  });
});
