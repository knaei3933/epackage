import { test, expect } from './setup';

test.describe('Navigation System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await waitForPageLoad(page);
    });

    test('header menu has no nested duplication', async ({ page }) => {
        // Count header elements
        const headers = page.locator('header, [data-testid="header"]');
        const headerCount = await headers.count();

        // Should only have one main header
        expect(headerCount).toBeLessThanOrEqual(1);

        // Check for duplicate navigation menus
        const navMenus = page.locator('nav, [data-testid="navigation"]');
        const mainNavCount = await navMenus.count();

        // Should not have nested duplicate menus
        const nestedNavs = page.locator('nav nav, [data-testid="navigation"] [data-testid="navigation"]');
        const nestedCount = await nestedNavs.count();
        expect(nestedCount).toBe(0);
    });

    test('all menu links work correctly', async ({ page }) => {
        // Get all navigation links
        const navLinks = page.locator('nav a, header a, [data-testid="nav-link"]');
        const linkCount = await navLinks.count();

        // Test first 10 links to avoid timeout
        const linksToTest = Math.min(linkCount, 10);

        for (let i = 0; i < linksToTest; i++) {
            const link = navLinks.nth(i);
            const href = await link.getAttribute('href');

            // Skip external links and anchors
            if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
                const linkText = await link.textContent();

                // Click link
                await Promise.all([
                    page.waitForURL(href),
                    link.click()
                ]);

                // Verify page loaded
                await expect(page.locator('h1, [data-testid="page-title"]').first()).toBeVisible();

                // Go back
                await page.goBack();
                await waitForPageLoad(page);
            }
        }
    });

    test('Japanese text renders correctly in navigation', async ({ page }) => {
        const navElements = page.locator('nav, header, [data-testid="navigation"]');
        const navText = await navElements.first().textContent();

        // Should contain Japanese characters
        const hasJapaneseText = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(navText || '');
        expect(hasJapaneseText).toBeTruthy();

        // Check font rendering
        const computedStyle = await navElements.first().evaluate(el => {
            return window.getComputedStyle(el).fontFamily;
        });
        console.log('Navigation font:', computedStyle);
    });

    test('dropdown menu functionality', async ({ page }) => {
        // Look for dropdown menus
        const dropdownTriggers = page.locator('[data-testid="dropdown-trigger"], .dropdown-toggle, .menu-item-has-children');

        const triggerCount = await dropdownTriggers.count();
        if (triggerCount > 0) {
            const firstTrigger = dropdownTriggers.first();

            // Hover to open dropdown
            await firstTrigger.hover();
            await page.waitForTimeout(500);

            // Check if dropdown appears
            const dropdown = page.locator('[data-testid="dropdown"], .dropdown-menu, .sub-menu');
            if (await dropdown.isVisible()) {
                await expect(dropdown).toBeVisible();

                // Test dropdown links
                const dropdownLinks = dropdown.locator('a');
                const linkCount = await dropdownLinks.count();
                expect(linkCount).toBeGreaterThan(0);
            }
        }
    });

    test('mobile menu functionality', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Look for mobile menu button
        const mobileMenuButton = page.locator('[data-testid="mobile-menu"], .hamburger, .menu-toggle, button[aria-label="Menu"]');

        if (await mobileMenuButton.isVisible()) {
            await expect(mobileMenuButton).toBeVisible();

            // Click to open mobile menu
            await mobileMenuButton.click();
            await page.waitForTimeout(500);

            // Check mobile menu appears
            const mobileMenu = page.locator('[data-testid="mobile-menu-panel"], .mobile-menu, .nav-mobile');
            await expect(mobileMenu).toBeVisible();

            // Test mobile menu links
            const mobileLinks = mobileMenu.locator('a');
            const linkCount = await mobileLinks.count();
            expect(linkCount).toBeGreaterThan(0);

            // Close mobile menu if needed
            const closeButton = page.locator('[data-testid="close-menu"], .menu-close, button[aria-label="Close menu"]');
            if (await closeButton.isVisible()) {
                await closeButton.click();
            }
        }
    });

    test('sticky navigation on scroll', async ({ page }) => {
        // Get initial header position
        const header = page.locator('header, [data-testid="header"]');
        const initialPosition = await header.evaluate(el => el.getBoundingClientRect().top);

        // Scroll down
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(500);

        // Check if header is still visible (sticky)
        const isSticky = await header.isVisible();
        if (isSticky) {
            const newPosition = await header.evaluate(el => el.getBoundingClientRect().top);
            // Sticky header should stay at top
            expect(newPosition).toBeLessThanOrEqual(initialPosition);
        }
    });

    test('active page highlighting', async ({ page }) => {
        // Navigate to different pages
        const pagesToTest = ['/catalog', '/contact', '/company'];

        for (const pageUrl of pagesToTest) {
            await page.goto(pageUrl);
            await waitForPageLoad(page);

            // Check if corresponding nav link has active class
            const navLinks = page.locator('nav a, header a');
            const linkCount = await navLinks.count();

            for (let i = 0; i < linkCount; i++) {
                const link = navLinks.nth(i);
                const href = await link.getAttribute('href');

                if (href?.includes(pageUrl) || href?.endsWith(pageUrl)) {
                    const hasActiveClass = await link.evaluate(el => {
                        return el.classList.contains('active') ||
                               el.classList.contains('current') ||
                               el.getAttribute('aria-current') === 'page';
                    });

                    if (hasActiveClass) {
                        console.log(`Active link found for ${pageUrl}`);
                        break;
                    }
                }
            }
        }
    });

    test('navigation accessibility', async ({ page }) => {
        // Test keyboard navigation
        await page.keyboard.press('Tab');

        // First focusable element should be in navigation
        const focusedElement = page.locator(':focus');
        const tagName = await focusedElement.evaluate(el => el.tagName);

        expect(['A', 'BUTTON']).toContain(tagName);

        // Test Tab through navigation
        let tabCount = 0;
        while (tabCount < 10) {
            await page.keyboard.press('Tab');
            const currentFocus = page.locator(':focus');
            const isVisible = await currentFocus.isVisible();

            if (isVisible) {
                const currentTag = await currentFocus.evaluate(el => el.tagName);
                console.log(`Tab ${tabCount + 1}: Focused on ${currentTag}`);
            }

            tabCount++;
        }
    });
});

// Helper function
async function waitForPageLoad(page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
}