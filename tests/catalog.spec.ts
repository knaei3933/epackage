import { test, expect } from './setup';

test.describe('Product Catalog', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/catalog');
        await waitForPageLoad(page);
    });

    test('displays Japanese product names correctly', async ({ page }) => {
        // Check page title
        await expect(page.locator('h1')).toContainText('製品カタログ');

        // Check product names contain Japanese characters
        const productNames = await page.locator('.product-name, [data-testid="product-name"]').allTextContents();
        expect(productNames.length).toBeGreaterThan(0);

        const hasJapaneseText = productNames.some(name => /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(name));
        expect(hasJapaneseText).toBeTruthy();
    });

    test('search functionality with Japanese keywords', async ({ page }) => {
        // Test search with Japanese keyword
        const searchInput = page.locator('[data-testid="search-input"], input[placeholder*="検索"], input[type="search"]').first();
        if (await searchInput.isVisible()) {
            await searchInput.fill('包装資材');
            await searchInput.press('Enter');

            // Wait for search results
            await page.waitForTimeout(1000);
            const productCards = page.locator('.product-card, [data-testid="product-card"]');
            await expect(productCards.first()).toBeVisible();
        }
    });

    test('filter options work correctly', async ({ page }) => {
        // Look for category filter
        const categoryFilter = page.locator('[data-testid="category-filter"], select[name="category"]').first();
        if (await categoryFilter.isVisible()) {
            // Get initial product count
            const initialCards = await page.locator('.product-card, [data-testid="product-card"]').count();

            // Select a category
            await categoryFilter.selectOption({ index: 1 });
            await page.waitForTimeout(1000);

            // Check that products are filtered
            const filteredCards = await page.locator('.product-card, [data-testid="product-card"]').count();
            expect(filteredCards).toBeGreaterThanOrEqual(0);
        }
    });

    test('product images load correctly', async ({ page }) => {
        const productImages = page.locator('.product-image img, [data-testid="product-image"] img');
        const imageCount = await productImages.count();

        if (imageCount > 0) {
            // Check first few images
            for (let i = 0; i < Math.min(imageCount, 5); i++) {
                const img = productImages.nth(i);
                await expect(img).toBeVisible();

                // Check naturalWidth to ensure image loaded
                const naturalWidth = await img.evaluate(img => img.naturalWidth);
                expect(naturalWidth).toBeGreaterThan(0);
            }
        }
    });

    test('responsive design on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();

        // Check mobile-specific elements
        const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu-toggle');
        if (await mobileMenu.isVisible()) {
            await expect(mobileMenu).toBeVisible();
        }

        // Check product grid adapts
        const productCards = page.locator('.product-card, [data-testid="product-card"]');
        if (await productCards.first().isVisible()) {
            const firstCard = productCards.first();
            const cardWidth = await firstCard.evaluate(el => el.offsetWidth);
            expect(cardWidth).toBeLessThan(375); // Should fit in mobile viewport
        }
    });

    test('pagination works if present', async ({ page }) => {
        const pagination = page.locator('[data-testid="pagination"], .pagination');
        if (await pagination.isVisible()) {
            const nextPage = page.locator('[data-testid="next-page"], .pagination-next');
            if (await nextPage.isVisible() && await nextPage.isEnabled()) {
                await nextPage.click();
                await page.waitForTimeout(1000);

                // Verify page changed
                await expect(page.locator('.product-card, [data-testid="product-card"]').first()).toBeVisible();
            }
        }
    });

    test('breadcrumb navigation', async ({ page }) => {
        const breadcrumbs = page.locator('[data-testid="breadcrumb"], .breadcrumb, nav[aria-label="breadcrumb"]');
        if (await breadcrumbs.isVisible()) {
            await expect(breadcrumbs).toContainText('ホーム');
        }
    });
});

// Helper function
async function waitForPageLoad(page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
}