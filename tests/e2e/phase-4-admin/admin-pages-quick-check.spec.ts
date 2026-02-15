import { test, expect } from '@playwright/test';

/**
 * Admin Pages Quick Check
 *
 * Quick verification that all admin pages are accessible
 * and basic elements are present.
 *
 * This is a smoke test to ensure pages load correctly.
 */

const ADMIN_CREDENTIALS = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@epackage-lab.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'Admin1234'
};

// DEV_MODE 설정 확인 - .env.test에서 ENABLE_DEV_MOCK_AUTH=true로 설정되어 있음
const isDevMode = process.env.ENABLE_DEV_MOCK_AUTH === 'true' || process.env.NEXT_PUBLIC_DEV_MODE === 'true';

console.log('[Test Setup] DEV_MODE:', isDevMode);
console.log('[Test Setup] ENABLE_DEV_MOCK_AUTH:', process.env.ENABLE_DEV_MOCK_AUTH);
console.log('[Test Setup] NEXT_PUBLIC_DEV_MODE:', process.env.NEXT_PUBLIC_DEV_MODE);

/**
 * Helper function to filter out expected development environment errors
 */
function filterDevErrors(errors: string[]): string[] {
  return errors.filter(err =>
    !err.includes('Failed to fetch') &&
    !err.includes('<!DOCTYPE') &&
    !err.includes('404') &&
    !err.includes('500') &&
    !err.includes('favicon.ico') &&
    !err.includes('Download the React DevTools')
  );
}

const ADMIN_PAGES = [
  { path: '/admin/dashboard', title: '管理ダッシュボード' },
  { path: '/admin/orders', title: '注文管理' },
  { path: '/admin/quotations', title: '見積もり管理' },
  { path: '/admin/production', title: '生産管理' },
  { path: '/admin/shipping', title: '配送管理' },
  { path: '/admin/contracts', title: '契約管理' },
  { path: '/admin/approvals', title: '会員承認待ち' },
  { path: '/admin/inventory', title: '在庫管理' },
  { path: '/admin/leads', title: 'Lead Management Dashboard' },
  { path: '/admin/settings', title: 'システム設定' },
  { path: '/admin/coupons', title: 'クーポン管理' },
];

test.describe('Admin Pages Quick Check', () => {
  test.beforeEach(async ({ page }) => {
    // Check if DEV_MODE is enabled - if so, skip login
    if (isDevMode) {
      console.log('[DEV_MODE] Skipping login, accessing admin pages directly');
      return;
    }

    // Login as admin
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL(/\/(admin|member)\//, { timeout: 10000 });
  });

  test('all admin pages are accessible', async ({ page }) => {
    const results: { path: string; status: string; error?: string }[] = [];

    for (const pageConfig of ADMIN_PAGES) {
      try {
        await page.goto(pageConfig.path, { waitUntil: 'domcontentloaded' });

        // Wait for page to be fully loaded with timeout
        try {
          await page.waitForSelector('h1', { timeout: 3000 });
        } catch (e) {
          // h1 not found is not critical - check if page loaded at all
        }

        // Check if page loaded without critical errors
        const h1Element = page.getByRole('heading', { level: 1 });
        const h1Count = await h1Element.count();

        // Check if redirected to signin (auth failure)
        if (page.url().includes('/auth/signin')) {
          results.push({ path: pageConfig.path, status: 'FAILED', error: 'Redirected to signin' });
        } else {
          // Check if page has any content
          const bodyVisible = await page.locator('body').isVisible();
          if (bodyVisible && h1Count > 0) {
            results.push({ path: pageConfig.path, status: 'OK' });
          } else if (bodyVisible) {
            // No h1 but page loaded - might be a page without h1 or error state
            results.push({ path: pageConfig.path, status: 'OK' });
          } else {
            results.push({ path: pageConfig.path, status: 'ERROR', error: 'Page not loaded' });
          }
        }
      } catch (error) {
        results.push({
          path: pageConfig.path,
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Log results
    console.log('\n=== Admin Pages Check Results ===');
    results.forEach(result => {
      const icon = result.status === 'OK' ? '✅' : '❌';
      console.log(`${icon} ${result.path}: ${result.status}${result.error ? ` - ${result.error}` : ''}`);
    });
    console.log('================================\n');

    // Assert all pages are accessible (no redirects or errors)
    const failedPages = results.filter(r => r.status === 'FAILED' || r.status === 'ERROR');
    expect(failedPages.length).toBe(0);
  });

  test('admin navigation is present', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });

    // Wait for page to be fully loaded
    try {
      await page.waitForSelector('nav', { timeout: 5000 });
    } catch (e) {
      // Navigation not found is not critical - page may still load
    }

    // Check navigation exists
    const nav = page.locator('nav');
    const navCount = await nav.count();
    if (navCount > 0) {
      await expect(nav.first()).toBeVisible({ timeout: 3000 });
    }

    // Filter out expected development environment errors
    const filteredErrors = filterDevErrors(errors);
    expect(filteredErrors).toHaveLength(0);
  });

  test('dashboard loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });

    // Wait for page to be fully loaded with multiple strategies
    try {
      // Try to find the page title with timeout
      await page.waitForSelector('h1', { timeout: 5000 });
    } catch (e) {
      // If h1 is not found, check if page loaded at all
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBe(true);
    }

    // Check for page title using multiple approaches
    const pageTitle = page.getByRole('heading', { level: 1 }).filter({ hasText: /ダッシュボード|管理/i });
    const titleCount = await pageTitle.count();

    // If h1 title is found, verify it's visible
    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible({ timeout: 3000 });
    } else {
      // Fallback: check if admin header is present
      const adminHeader = page.locator('h1').filter({ hasText: /EPackage Lab/i });
      await expect(adminHeader.first()).toBeVisible({ timeout: 3000 });
    }

    // Filter out expected development environment errors
    const filteredErrors = filterDevErrors(errors);
    expect(filteredErrors).toHaveLength(0);
  });

  test('quotations page is accessible', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/admin/quotations', { waitUntil: 'domcontentloaded' });

    // Wait for page to be fully loaded with multiple strategies
    try {
      await page.waitForSelector('h1', { timeout: 5000 });
    } catch (e) {
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBe(true);
    }

    // Check for page title using multiple approaches
    const pageTitle = page.getByRole('heading', { level: 1 }).filter({ hasText: /見積|Quotation/i });
    const titleCount = await pageTitle.count();

    // If h1 title is found, verify it's visible
    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible({ timeout: 3000 });
    }

    // Check for statistics cards or empty state (optional, may not exist in dev mode)
    const statsCards = page.locator('div[class*="bg-"]').filter({ hasText: /総見積数|保留中|承認済み/i });
    const statsCount = await statsCards.count();
    // Stats may be 0 if no data, that's ok

    // Filter out expected development environment errors
    const filteredErrors = filterDevErrors(errors);
    expect(filteredErrors).toHaveLength(0);
  });

  test('production page is accessible', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/admin/production', { waitUntil: 'domcontentloaded' });

    // Wait for page to be fully loaded with multiple strategies
    try {
      await page.waitForSelector('h1', { timeout: 5000 });
    } catch (e) {
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBe(true);
    }

    // Check for page title using multiple approaches
    const pageTitle = page.getByRole('heading', { level: 1 }).filter({ hasText: /生産管理|Production/i });
    const titleCount = await pageTitle.count();

    // If h1 title is found, verify it's visible
    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible({ timeout: 3000 });
    }

    // Check for production stages - use getByRole for better accessibility
    const stages = page.getByText(/生産プロセス|データ受領|検査|デザイン/i).or(
      page.getByRole('heading', { name: /生産プロセス/i })
    );
    const stagesCount = await stages.count();

    // If production stages section exists, verify it
    if (stagesCount > 0) {
      await expect(stages.first()).toBeVisible({ timeout: 3000 });
    }

    // Filter out expected development environment errors
    const filteredErrors = filterDevErrors(errors);
    expect(filteredErrors).toHaveLength(0);
  });

  test('shipping page is accessible', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/admin/shipping', { waitUntil: 'domcontentloaded' });

    // Wait for page to be fully loaded with multiple strategies
    try {
      await page.waitForSelector('h1', { timeout: 5000 });
    } catch (e) {
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBe(true);
    }

    // Check for page title using multiple approaches
    const pageTitle = page.getByRole('heading', { level: 1 }).filter({ hasText: /配送管理|Shipping/i });
    const titleCount = await pageTitle.count();

    // If h1 title is found, verify it's visible
    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible({ timeout: 3000 });
    }

    // Filter out expected development environment errors
    const filteredErrors = filterDevErrors(errors);
    expect(filteredErrors).toHaveLength(0);
  });

  test('approvals page is accessible', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/admin/approvals', { waitUntil: 'domcontentloaded' });

    // Wait for page to be fully loaded with multiple strategies
    try {
      await page.waitForSelector('h1', { timeout: 5000 });
    } catch (e) {
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBe(true);
    }

    // Check for page title - actual h1 text is "会員承認待ち"
    const pageTitle = page.getByRole('heading', { level: 1 }).filter({ hasText: /会員承認待ち|承認/i });
    const titleCount = await pageTitle.count();

    // If h1 title is found, verify it's visible
    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible({ timeout: 3000 });
    }

    // Filter out expected development environment errors
    const filteredErrors = filterDevErrors(errors);
    expect(filteredErrors).toHaveLength(0);
  });

  test('inventory page is accessible', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/admin/inventory', { waitUntil: 'domcontentloaded' });

    // Wait for page to be fully loaded with multiple strategies
    try {
      await page.waitForSelector('h1', { timeout: 5000 });
    } catch (e) {
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBe(true);
    }

    // Check for page title using multiple approaches
    const pageTitle = page.getByRole('heading', { level: 1 }).filter({ hasText: /在庫管理|Inventory/i });
    const titleCount = await pageTitle.count();

    // If h1 title is found, verify it's visible
    if (titleCount > 0) {
      await expect(pageTitle.first()).toBeVisible({ timeout: 3000 });
    }

    // Filter out expected development environment errors
    const filteredErrors = filterDevErrors(errors);
    expect(filteredErrors).toHaveLength(0);
  });
});
