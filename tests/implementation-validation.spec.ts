import { test, expect } from '@playwright/test';

/**
 * Comprehensive E2E tests for all implemented features from TaskMaster AI
 * Validates all the requirements from 수정사항.md implementation
 */

test.describe('TaskMaster Implementation Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('http://localhost:3000');
  });

  test('Homepage loads successfully with Japanese content', async ({ page }) => {
    // Test basic homepage functionality
    await expect(page).toHaveTitle(/Epackage Lab.*パッケージソリューション/);

    // Check for main Japanese content
    await expect(page.locator('h1')).toContainText('あなたの製品を');
    await expect(page.locator('h1')).toContainText('最適な包装で');
    await expect(page.locator('h1')).toContainText('輝かせる');

    // Check for Japanese localization in navigation
    await expect(page.locator('a[href="/"]')).toContainText('ホーム');
    await expect(page.locator('a[href="/catalog/"]')).toContainText('製品カタログ');
    await expect(page.locator('a[href="/quote-simulator/"]')).toContainText('お見積り');
  });

  test('Header background color consistency (Task 16)', async ({ page }) => {
    const header = page.locator('header');

    // Get initial background color
    const initialBgColor = await header.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Scroll down to trigger scroll effect
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(300); // Wait for transition

    // Get background color after scroll
    const scrolledBgColor = await header.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Background colors should be consistent (both should be solid white)
    expect(initialBgColor).toBe(scrolledBgColor);
    expect(initialBgColor).toBe('rgb(255, 255, 255)');

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
  });

  test('Footer layout restructure (horizontal single row)', async ({ page }) => {
    const footer = page.locator('footer');

    // Check footer is present and accessible
    await expect(footer).toBeVisible();

    // Check for company description in Japanese
    await expect(footer.locator('text=先進技術と卓越した品質で')).toBeVisible();

    // Check footer links are properly organized
    await expect(footer.locator('a[href="/about"]')).toBeVisible();
    await expect(footer.locator('a[href="/privacy"]')).toBeVisible();
    await expect(footer.locator('a[href="/terms"]')).toBeVisible();

    // Check contact information
    await expect(footer.locator('text=〒673-0846')).toBeVisible();
    await expect(footer.locator('text=080-6942-7235')).toBeVisible();
    await expect(footer.locator('text=info@package-lab.com')).toBeVisible();
  });

  test('Product catalog design template download functionality (Task 15)', async ({ page }) => {
    // Navigate to catalog page
    await page.click('a[href="/catalog/"]');
    await page.waitForLoadState('networkidle');

    // Check catalog page loads
    await expect(page).toHaveURL(/.*catalog/);

    // Look for product cards with download functionality
    const downloadButtons = page.locator('button:has-text("テンプレート"), button:has-text("AI"), button:has-text("ダウンロード")');

    if (await downloadButtons.count() > 0) {
      // Test download button click (should trigger file download)
      const firstDownloadButton = downloadButtons.first();
      await expect(firstDownloadButton).toBeVisible();

      // Note: Actual download testing would require handling file downloads
      // For now, we verify the button exists and is clickable
      await expect(firstDownloadButton).toBeEnabled();
    }
  });

  test('Design guide pages availability (Task 10)', async ({ page }) => {
    // Test main design guide entry point
    const designGuideLinks = page.locator('a[href*="/guide/"]');

    // Check if design guide pages are accessible
    if (await designGuideLinks.count() > 0) {
      await designGuideLinks.first().click();
      await page.waitForLoadState('networkidle');

      // Verify design guide content
      await expect(page.locator('h1, h2').first()).toBeVisible();
    }

    // Test specific design guide pages directly
    const designGuidePages = [
      '/guide/color',
      '/guide/size',
      '/guide/image',
      '/guide/shirohan',
      '/guide/environmentaldisplay'
    ];

    for (const guidePage of designGuidePages) {
      await page.goto(`http://localhost:3000${guidePage}`);
      await page.waitForLoadState('networkidle');

      // Each guide page should load without errors
      await expect(page.locator('body')).toBeVisible();

      // Should have Japanese content
      const hasJapaneseContent = await page.locator('text=ガイド, text=印刷, text=仕様').count() > 0;
      if (hasJapaneseContent) {
        await expect(page.locator('text=ガイド, text=印刷, text=仕様')).first().toBeVisible();
      }
    }
  });

  test('Japanese localization verification (Task 8)', async ({ page }) => {
    // Check for absence of Korean text in main content areas
    const koreanTextPattern = /[가-힣]/;

    // Test header aria-labels are in Japanese
    const languageButton = page.locator('button[aria-label*="言語"], button[aria-label*="言語"]');
    if (await languageButton.count() > 0) {
      const ariaLabel = await languageButton.getAttribute('aria-label');
      expect(ariaLabel).not.toMatch(koreanTextPattern);
    }

    // Test main content areas
    const mainContent = page.locator('main');
    const mainText = await mainContent.textContent();
    expect(mainText).not.toMatch(koreanTextPattern);

    // Check for Japanese-specific content
    await expect(page.locator('text=日本語')).toBeVisible();
    await expect(page.locator('text=食品包装')).toBeVisible();
    await expect(page.locator('text=JIS規格')).toBeVisible();
  });

  test('Catalog page functionality and product display', async ({ page }) => {
    // Navigate to catalog
    await page.click('a[href="/catalog/"]');
    await page.waitForLoadState('networkidle');

    // Check catalog page loads
    await expect(page).toHaveURL(/.*catalog/);

    // Look for product cards
    const productCards = page.locator('[data-testid*="product"], .bg-white.rounded-lg.shadow-md, .card');

    if (await productCards.count() > 0) {
      // Verify product cards have Japanese names
      const firstProductCard = productCards.first();
      await expect(firstProductCard).toBeVisible();

      // Check for Japanese product names and descriptions
      const productText = await firstProductCard.textContent();
      const hasJapaneseText = /[\u3040-\u309F\u30A0-\u30FF]/.test(productText || '');
      expect(hasJapaneseText).toBe(true);
    }
  });

  test('Navigation and routing functionality', async ({ page }) => {
    // Test main navigation links
    const navLinks = [
      { href: '/catalog/', text: '製品カタログ' },
      { href: '/archives/', text: '導入事例' },
      { href: '/quote-simulator/', text: 'お見積り' },
      { href: '/contact/', text: 'お問い合わせ' }
    ];

    for (const link of navLinks) {
      await page.click(`a[href="${link.href}"]`);
      await page.waitForLoadState('networkidle');

      // Verify navigation worked
      await expect(page).toHaveURL(new RegExp(`${link.href.replace('/', '\\/')}$`));

      // Verify page loaded without errors
      await expect(page.locator('body')).toBeVisible();

      // Return to home page for next test
      await page.goto('http://localhost:3000');
    }
  });

  test('Mobile responsiveness and mobile menu functionality', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check mobile menu button is visible
    const mobileMenuButton = page.locator('button[aria-label*="メニュー"]');
    await expect(mobileMenuButton).toBeVisible();

    // Test mobile menu toggle
    await mobileMenuButton.click();
    await page.waitForTimeout(300);

    // Check mobile menu is open
    const mobileMenu = page.locator('.mobile-menu, nav.md\\:hidden, [role="navigation"]:has([aria-expanded="true"])');

    // Check navigation items are visible in mobile menu
    await expect(page.locator('a[href="/catalog/"]')).toBeVisible();
    await expect(page.locator('a[href="/contact/"]')).toBeVisible();

    // Close mobile menu
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(300);
    }

    // Reset to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('Performance and accessibility checks', async ({ page }) => {
    // Check for basic accessibility attributes
    await expect(page.locator('h1')).toHaveCount(1); // Single main heading
    await expect(page.locator('main')).toBeVisible(); // Main landmark
    await expect(page.locator('footer')).toBeVisible(); // Footer landmark

    // Check for proper language attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('ja');

    // Check for alt text on important images
    const logoImage = page.locator('img[alt*="Epackage Lab"]');
    if (await logoImage.count() > 0) {
      await expect(logoImage.first()).toHaveAttribute('alt');
    }

    // Test basic performance (should load within reasonable time)
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart
      };
    });

    // These are generous thresholds for development environment
    expect(performanceMetrics.domContentLoaded).toBeLessThan(5000);
    expect(performanceMetrics.loadComplete).toBeLessThan(10000);
  });

  test('Contact and inquiry functionality', async ({ page }) => {
    // Test contact page
    await page.click('a[href="/contact/"]');
    await page.waitForLoadState('networkidle');

    // Verify contact page loaded
    await expect(page).toHaveURL(/.*contact/);

    // Check for contact form elements
    const formElements = [
      'input[name*="name"], input[type*="text"]',
      'input[type*="email"]',
      'textarea',
      'button[type*="submit"]'
    ];

    for (const selector of formElements) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        await expect(element.first()).toBeVisible();
      }
    }

    // Check for Japanese content in contact page
    await expect(page.locator('text=お問い合わせ')).toBeVisible();
  });
});

test.describe('API and Backend Functionality', () => {
  test('Design template download API endpoints', async ({ page, request }) => {
    // Test the API endpoint for design templates
    const apiResponse = await request.get('/api/download/templates/stand_up', {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // API should respond successfully
    expect(apiResponse.status()).toBe(200);

    // Response should contain template information
    const responseData = await apiResponse.json();
    expect(responseData).toHaveProperty('success');
    expect(responseData).toHaveProperty('templates');
  });

  test('Product catalog API', async ({ page, request }) => {
    // Test the products API endpoint
    const apiResponse = await request.get('/api/products?locale=ja&limit=5');

    // API should respond successfully
    expect(apiResponse.status()).toBe(200);

    // Response should contain product information
    const responseData = await apiResponse.json();
    expect(responseData).toHaveProperty('success');
    expect(responseData).toHaveProperty('products');

    // Products should have Japanese names if available
    if (responseData.success && responseData.products.length > 0) {
      const firstProduct = responseData.products[0];
      expect(firstProduct).toHaveProperty('name_ja');
    }
  });
});

test.describe('Error Handling and Edge Cases', () => {
  test('404 page handling', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('http://localhost:3000/non-existent-page');

    // Should handle 404 gracefully (either custom 404 or Next.js default)
    await expect(page.locator('body')).toBeVisible();
  });

  test('Image loading with fallbacks', async ({ page }) => {
    await page.goto('http://localhost:3000/catalog');
    await page.waitForLoadState('networkidle');

    // Check for product images
    const images = page.locator('img');

    for (let i = 0; i < Math.min(5, await images.count()); i++) {
      const img = images.nth(i);
      await img.scrollIntoViewIfNeeded();

      // Check if image loads or has appropriate fallback
      const hasError = await img.evaluate((el: HTMLImageElement) => el.naturalWidth === 0);

      if (hasError) {
        // Check for fallback content
        const parent = img.locator('..');
        await expect(parent.locator('.fallback, .placeholder, [data-fallback]')).toHaveCount(1);
      }
    }
  });
});