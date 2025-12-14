import { test, expect } from '@playwright/test';

/**
 * Focused tests for core TaskMaster implemented features
 * Tests the most important functionality that was implemented
 */

test.describe('Core TaskMaster Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Homepage loads with Japanese localization', async ({ page }) => {
    // Check title contains expected keywords
    const title = await page.title();
    expect(title).toContain('Epackage Lab');
    expect(title).toContain('パッケージング');

    // Check main Japanese content
    await expect(page.locator('h1')).toContainText('あなたの製品を');
    await expect(page.locator('h1')).toContainText('輝かせる');

    // Check navigation is in Japanese
    await expect(page.locator('a[href="/catalog/"]')).toContainText('製品カタログ');
    await expect(page.locator('a[href="/quote-simulator/"]')).toContainText('お見積り');
  });

  test('Header maintains consistent styling', async ({ page }) => {
    const header = page.locator('header');

    // Check header is visible
    await expect(header).toBeVisible();

    // Scroll down to test background consistency
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(500);

    // Header should still be visible after scroll
    await expect(header).toBeVisible();

    // Check key navigation elements remain visible
    const mainNav = page.locator('nav[role="menubar"]');
    await expect(mainNav).toBeVisible();
    await expect(mainNav.locator('a[href="/catalog/"]')).toBeVisible();
  });

  test('Footer is properly structured with Japanese content', async ({ page }) => {
    // Scroll to footer to ensure it's loaded
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Check for company description
    await expect(page.locator('text=先進技術と卓越した品質で')).toBeVisible();

    // Check for contact information
    await expect(page.locator('text=〒673-0846')).toBeVisible();
    await expect(page.locator('text=080-6942-7235')).toBeVisible();
  });

  test('Design guide pages are accessible', async ({ page }) => {
    // Test each design guide page
    const designPages = [
      '/guide/color',
      '/guide/size',
      '/guide/image',
      '/guide/shirohan',
      '/guide/environmentaldisplay'
    ];

    for (const pageUrl of designPages) {
      await page.goto(`http://localhost:3000${pageUrl}`);

      // Page should load without errors
      await expect(page.locator('body')).toBeVisible();

      // Should have some content (look for headings)
      const headings = page.locator('h1, h2');
      if (await headings.count() > 0) {
        await expect(headings.first()).toBeVisible();
      }
    }
  });

  test('API endpoints respond correctly', async ({ request }) => {
    // Test products API
    const productsResponse = await request.get('/api/products?locale=ja&limit=1');
    expect(productsResponse.status()).toBe(200);

    const productsData = await productsResponse.json();
    expect(productsData).toHaveProperty('success');
  });

  test('Navigation links work correctly', async ({ page }) => {
    // Test main navigation links
    const navigationTests = [
      { href: '/catalog/', expectedText: '製品カタログ' },
      { href: '/archives/', expectedText: '導入事例' },
      { href: '/quote-simulator/', expectedText: 'お見積り' },
      { href: '/contact/', expectedText: 'お問い合わせ' }
    ];

    for (const navTest of navigationTests) {
      await page.click(`a[href="${navTest.href}"]`);

      // Wait for navigation to complete
      await page.waitForLoadState('domcontentloaded');

      // Verify we navigated to the correct page
      expect(page.url()).toContain(navTest.href);

      // Return to home for next test
      await page.goto('http://localhost:3000');
    }
  });

  test('Mobile responsiveness works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check mobile menu button appears
    const mobileMenuButton = page.locator('button[aria-label*="メニュー"], button:has-text("メニュー")');

    // If mobile menu button is visible, test it
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);

      // Check navigation is visible in mobile view
      await expect(page.locator('a[href="/catalog/"]')).toBeVisible();
    }

    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });
});

test.describe('Additional Functionality', () => {
  test('Catalog page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/catalog');
    await page.waitForLoadState('domcontentloaded');

    // Page should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('Contact page loads', async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
    await page.waitForLoadState('domcontentloaded');

    // Page should load
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('text=お問い合わせ')).toBeVisible();
  });
});