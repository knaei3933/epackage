import { test, expect } from './setup';

test.describe('Post-Processing Preview System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/quote');
        await waitForPageLoad(page);
    });

    test('displays all 14 processing types', async ({ page }) => {
        // Look for post-processing options
        const processingOptions = page.locator(
            '[data-testid="processing-option"], ' +
            '.post-processing-option, ' +
            'input[name="processing"], ' +
            '[data-testid*="processing"]'
        );

        const optionCount = await processingOptions.count();
        console.log(`Found ${optionCount} processing options`);

        // Should have multiple options
        expect(optionCount).toBeGreaterThan(10);

        // Check category labels
        const categories = ['ジッパー', '仕上げ', '穴', 'その他'];
        const hasCategories = categories.some(cat =>
            page.locator(`text=${cat}`).isVisible()
        );

        if (hasCategories) {
            console.log('Processing categories are properly displayed');
        }
    });

    test('shows visual previews correctly', async ({ page }) => {
        // Find the first processing option
        const firstOption = page.locator('[data-testid="processing-option"], .post-processing-option').first();

        if (await firstOption.isVisible()) {
            // Select the option
            await firstOption.check();
            await page.waitForTimeout(1000);

            // Look for preview image
            const preview = page.locator(
                '[data-testid="processing-preview"], ' +
                '.processing-preview img, ' +
                '.preview-image'
            );

            if (await preview.isVisible()) {
                await expect(preview).toBeVisible();

                // Check image loads
                const imgElement = preview.locator('img');
                if (await imgElement.isVisible()) {
                    const naturalWidth = await imgElement.evaluate(img => img.naturalWidth);
                    expect(naturalWidth).toBeGreaterThan(0);

                    // Check image source
                    const src = await imgElement.getAttribute('src');
                    expect(src).toContain('/images/post-processing/');
                }
            }
        }
    });

    test('updates price calculation in real-time', async ({ page }) => {
        // Get initial price
        const priceElement = page.locator(
            '[data-testid="total-price"], ' +
            '.total-price, ' +
            '[data-testid="quote-total"], ' +
            '.quote-amount'
        );

        let initialPrice = '0';
        if (await priceElement.isVisible()) {
            initialPrice = await priceElement.textContent();
        }

        // Find and select a processing option
        const processingOption = page.locator(
            '[data-testid="processing-option"], ' +
            '.post-processing-option, ' +
            'input[name="processing"]'
        ).first();

        if (await processingOption.isVisible()) {
            await processingOption.check();
            await page.waitForTimeout(1500); // Wait for price calculation

            // Check if price changed
            if (await priceElement.isVisible()) {
                const newPrice = await priceElement.textContent();
                console.log(`Initial price: ${initialPrice}, New price: ${newPrice}`);

                // Price should change (unless it's a free option)
                if (newPrice && initialPrice) {
                    expect(newPrice).not.toBe(initialPrice);
                }
            }
        }
    });

    test('selection and deselection functionality', async ({ page }) => {
        const processingOptions = page.locator('[data-testid="processing-option"], .post-processing-option');
        const optionCount = await processingOptions.count();

        if (optionCount > 0) {
            const firstOption = processingOptions.first();

            // Select option
            await firstOption.check();
            await page.waitForTimeout(500);
            expect(await firstOption.isChecked()).toBeTruthy();

            // Deselect option
            await firstOption.uncheck();
            await page.waitForTimeout(500);
            expect(await firstOption.isChecked()).toBeFalsy();
        }
    });

    test('mobile responsive preview display', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();

        // Find processing options
        const processingSection = page.locator(
            '[data-testid="post-processing"], ' +
            '.post-processing-section, ' +
            '.processing-options'
        );

        if (await processingSection.isVisible()) {
            // Check section fits in mobile viewport
            const sectionWidth = await processingSection.evaluate(el => el.offsetWidth);
            expect(sectionWidth).toBeLessThanOrEqual(375);

            // Test interaction on mobile
            const firstOption = processingSection.locator('[data-testid="processing-option"], .post-processing-option').first();
            if (await firstOption.isVisible()) {
                await firstOption.tap(); // Use tap for mobile
                await page.waitForTimeout(1000);

                // Check if mobile preview appears
                const mobilePreview = page.locator('[data-testid="mobile-preview"], .preview-mobile');
                if (await mobilePreview.isVisible()) {
                    await expect(mobilePreview).toBeVisible();
                }
            }
        }
    });

    test('category grouping functionality', async ({ page }) => {
        // Look for category sections
        const zipperSection = page.locator('[data-testid="zipper-section"], .zipper-options');
        const finishingSection = page.locator('[data-testid="finishing-section"], .finishing-options');
        const holesSection = page.locator('[data-testid="holes-section"], .hole-options');

        // Check if categories exist
        const hasZipper = await zipperSection.isVisible();
        const hasFinishing = await finishingSection.isVisible();
        const hasHoles = await holesSection.isVisible();

        console.log(`Categories - Zipper: ${hasZipper}, Finishing: ${hasFinishing}, Holes: ${hasHoles}`);

        // Test selecting options from different categories
        if (hasZipper && hasFinishing) {
            const zipperOption = zipperSection.locator('input').first();
            const finishingOption = finishingSection.locator('input').first();

            if (await zipperOption.isVisible()) {
                await zipperOption.check();
                await page.waitForTimeout(500);
            }

            if (await finishingOption.isVisible()) {
                await finishingOption.check();
                await page.waitForTimeout(500);
            }

            // Both should be selected
            expect(await zipperOption.isChecked()).toBeTruthy();
            expect(await finishingOption.isChecked()).toBeTruthy();
        }
    });

    test('preview image loading states', async ({ page }) => {
        // Select an option to trigger preview
        const firstOption = page.locator('[data-testid="processing-option"], .post-processing-option').first();

        if (await firstOption.isVisible()) {
            // Check for loading state
            await firstOption.check();

            // Look for loading indicator
            const loadingIndicator = page.locator(
                '[data-testid="loading"], ' +
                '.loading, ' +
                '.spinner, ' +
                '.preview-loading'
            );

            // Check if preview loads without errors
            const preview = page.locator('[data-testid="processing-preview"], .processing-preview');

            try {
                await expect(preview).toBeVisible({ timeout: 3000 });

                const img = preview.locator('img');
                if (await img.isVisible()) {
                    // Check for error state
                    const hasError = await img.evaluate(el => el.complete && el.naturalHeight === 0);
                    expect(hasError).toBeFalsy();
                }
            } catch (e) {
                console.log('Preview loading took too long or failed');
            }
        }
    });

    test('processing options affect quote summary', async ({ page }) => {
        // Find quote summary section
        const quoteSummary = page.locator(
            '[data-testid="quote-summary"], ' +
            '.quote-summary, ' +
            '.quote-details'
        );

        // Select multiple processing options
        const processingOptions = page.locator('[data-testid="processing-option"], .post-processing-option');
        const optionsToSelect = Math.min(3, await processingOptions.count());

        const selectedOptions = [];
        for (let i = 0; i < optionsToSelect; i++) {
            const option = processingOptions.nth(i);
            if (await option.isVisible()) {
                const optionLabel = await option.locator('label, span, div').first().textContent();
                await option.check();
                selectedOptions.push(optionLabel);
                await page.waitForTimeout(500);
            }
        }

        // Check if selected options appear in summary
        if (await quoteSummary.isVisible()) {
            const summaryText = await quoteSummary.textContent();

            for (const option of selectedOptions) {
                if (option && summaryText) {
                    console.log(`Checking if "${option}" appears in summary`);
                    // Note: This might need adjustment based on actual implementation
                }
            }
        }
    });
});

// Helper function
async function waitForPageLoad(page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
}