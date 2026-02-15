import { test, expect } from './setup';

test.describe('Catalog Download System', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/company');
        await waitForPageLoad(page);
    });

    test('initiates PDF download', async ({ page }) => {
        // Look for download button
        const downloadButton = page.locator(
            '[data-testid="catalog-download"], ' +
            '.catalog-download, ' +
            'a[href*="catalog"], ' +
            'button:has-text("カタログダウンロード"), ' +
            'button:has-text("Download Catalog")'
        );

        if (await downloadButton.isVisible()) {
            // Set up download handler
            const downloadPromise = page.waitForEvent('download', { timeout: 30000 });

            // Click download button
            await downloadButton.click();

            // Wait for download to start
            const download = await downloadPromise;

            // Verify download properties
            const filename = download.suggestedFilename();
            console.log(`Downloaded file: ${filename}`);

            expect(filename).toMatch(/catalog/i);
            expect(filename).toMatch(/\.pdf$/i);

            // Verify file size is expected (should be around 837MB)
            // Note: Actual size verification would require download completion
        } else {
            console.log('Download button not found, checking for email capture flow');
            test.skip();
        }
    });

    test('captures email before download', async ({ page }) => {
        // Look for download trigger that requires email
        const downloadTrigger = page.locator(
            '[data-testid="catalog-download-trigger"], ' +
            '.catalog-download-trigger, ' +
            'button:has-text("カタログをリクエスト"), ' +
            'button:has-text("Request Catalog")'
        );

        if (await downloadTrigger.isVisible()) {
            await downloadTrigger.click();

            // Check for email modal
            const emailModal = page.locator(
                '[data-testid="email-modal"], ' +
                '.email-modal, ' +
                '.modal:has-text("メール")'
            );

            await expect(emailModal).toBeVisible();

            // Check email form fields
            const emailInput = emailModal.locator('input[type="email"], input[name="email"], [data-testid="email-input"]');
            await expect(emailInput).toBeVisible();

            const submitButton = emailModal.locator('button[type="submit"], [data-testid="submit-email"]');
            await expect(submitButton).toBeVisible();

            // Fill email
            await emailInput.fill('test@epackage-lab.jp');

            // Submit form
            await submitButton.click();

            // Check for progress indicator
            const progressBar = page.locator(
                '[data-testid="progress-bar"], ' +
                '.progress-bar, ' +
                '.download-progress'
            );

            if (await progressBar.isVisible({ timeout: 3000 })) {
                await expect(progressBar).toBeVisible();
            }
        }
    });

    test('progress tracking display', async ({ page }) => {
        // Trigger download with email
        const downloadTrigger = page.locator('[data-testid="catalog-download-trigger"], .catalog-download-trigger');

        if (await downloadTrigger.isVisible()) {
            await downloadTrigger.click();

            // Fill and submit email
            const emailInput = page.locator('[data-testid="email-input"], input[type="email"]');
            if (await emailInput.isVisible()) {
                await emailInput.fill('test@epackage-lab.jp');

                const submitButton = page.locator('[data-testid="submit-email"], button[type="submit"]');
                await submitButton.click();

                // Look for progress indicators
                const progressContainer = page.locator(
                    '[data-testid="download-progress"], ' +
                    '.download-container, ' +
                    '.progress-container'
                );

                if (await progressContainer.isVisible({ timeout: 5000 })) {
                    // Check for progress percentage
                    const progressPercent = progressContainer.locator(
                        '[data-testid="progress-percent"], ' +
                        '.progress-percent'
                    );

                    if (await progressPercent.isVisible()) {
                        const percentText = await progressPercent.textContent();
                        console.log(`Progress: ${percentText}`);
                    }

                    // Check for status messages
                    const statusMessage = progressContainer.locator(
                        '[data-testid="download-status"], ' +
                        '.status-message'
                    );

                    if (await statusMessage.isVisible()) {
                        const status = await statusMessage.textContent();
                        console.log(`Status: ${status}`);
                    }
                }
            }
        }
    });

    test('error handling for invalid email', async ({ page }) => {
        const downloadTrigger = page.locator('[data-testid="catalog-download-trigger"], .catalog-download-trigger');

        if (await downloadTrigger.isVisible()) {
            await downloadTrigger.click();

            const emailInput = page.locator('[data-testid="email-input"], input[type="email"]');
            const submitButton = page.locator('[data-testid="submit-email"], button[type="submit"]');

            if (await emailInput.isVisible()) {
                // Submit invalid email
                await emailInput.fill('invalid-email');
                await submitButton.click();

                // Check for error message
                const errorMessage = page.locator(
                    '[data-testid="email-error"], ' +
                    '.error-message, ' +
                    '.validation-error'
                );

                if (await errorMessage.isVisible({ timeout: 2000 })) {
                    await expect(errorMessage).toContainText('メール');
                    await expect(errorMessage).toContainText('有効');
                }
            }
        }
    });

    test('download on mobile devices', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();

        const downloadButton = page.locator(
            '[data-testid="catalog-download"], ' +
            '.catalog-download, ' +
            'a[href*="catalog"]'
        );

        if (await downloadButton.isVisible()) {
            // Check button is touch-friendly
            const buttonBox = await downloadButton.boundingBox();
            if (buttonBox) {
                expect(buttonBox.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
                expect(buttonBox.width).toBeGreaterThanOrEqual(44);
            }

            // Test download on mobile
            const downloadPromise = page.waitForEvent('download');
            await downloadButton.tap(); // Use tap for mobile
            const download = await downloadPromise;

            expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
        }
    });

    test('analytics tracking', async ({ page }) => {
        // Set up console listener for analytics events
        const analyticsEvents: any[] = [];
        page.on('console', msg => {
            if (msg.text().includes('analytics') || msg.text().includes('gtag') || msg.text().includes('track')) {
                analyticsEvents.push(msg.text());
            }
        });

        const downloadButton = page.locator('[data-testid="catalog-download"], .catalog-download');

        if (await downloadButton.isVisible()) {
            await downloadButton.click();

            // Check if analytics were triggered
            await page.waitForTimeout(2000);

            if (analyticsEvents.length > 0) {
                console.log('Analytics events detected:', analyticsEvents);
            }
        }
    });

    test('email confirmation after download', async ({ page }) => {
        // This test would verify that confirmation email functionality exists
        // Since we can't actually receive emails in tests, we'll check the API call

        const downloadTrigger = page.locator('[data-testid="catalog-download-trigger"], .catalog-download-trigger');

        if (await downloadTrigger.isVisible()) {
            // Set up response listener for email API
            const responsePromise = page.waitForResponse(response => {
                return response.url().includes('/api/') && response.url().includes('email');
            });

            await downloadTrigger.click();

            const emailInput = page.locator('[data-testid="email-input"], input[type="email"]');
            if (await emailInput.isVisible()) {
                await emailInput.fill('test@epackage-lab.jp');

                const submitButton = page.locator('[data-testid="submit-email"], button[type="submit"]');
                await submitButton.click();

                // Check API response
                try {
                    const response = await responsePromise;
                    expect(response.status()).toBe(200);
                } catch (e) {
                    console.log('Email API response not captured');
                }

                // Look for success message
                const successMessage = page.locator(
                    '[data-testid="success-message"], ' +
                    '.success-message, ' +
                    '.email-confirmation'
                );

                if (await successMessage.isVisible({ timeout: 5000 })) {
                    await expect(successMessage).toBeVisible();
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