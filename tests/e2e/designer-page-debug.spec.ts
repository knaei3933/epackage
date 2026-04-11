import { test, expect } from '@playwright/test';

/**
 * Designer Page Debug Test
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const ORDER_ID = 'aef5bdc8-e0b0-4b42-bc41-a2bb9337349f';
const TOKEN = 'f9fd30b64c7c100cb327b5909c42f6e8d08f6310d45e37da169b0d9cfe233e0b';

test.describe('Designer Page Debug', () => {
  test('inspect designer page structure', async ({ page }) => {
    const designerUrl = `${BASE_URL}/designer-order/${TOKEN}`;
    console.log(`Designer URL: ${designerUrl}`);

    // Go to designer order page
    await page.goto(designerUrl);
    await page.waitForLoadState('networkidle');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/designer-page.png', fullPage: true });

    // Look for any file-related elements
    const fileElements = await page.locator('text=.pdf').all();
    console.log(`Found ${fileElements.length} PDF elements`);

    // Look for delete buttons
    const deleteButtons = await page.locator('button:has-text("削除")').all();
    console.log(`Found ${deleteButtons.length} delete buttons`);

    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Get page content (first 1000 chars)
    const bodyText = await page.locator('body').textContent();
    console.log(`Page content preview: ${bodyText?.substring(0, 500)}`);
  });
});
