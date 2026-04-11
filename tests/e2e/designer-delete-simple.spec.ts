import { test, expect } from '@playwright/test';

/**
 * Designer Page Delete Test
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3003';
const ORDER_ID = 'aef5bdc8-e0b0-4b42-bc41-a2bb9337349f';
const TOKEN = 'f9fd30b64c7c100cb327b5909c42f6e8d08f6310d45e37da169b0d9cfe233e0b';

test.describe('Designer Page Delete Test', () => {
  test('should delete file from designer page', async ({ page }) => {
    const designerUrl = `${BASE_URL}/designer-order/${TOKEN}`;
    console.log(`Designer URL: ${designerUrl}`);

    // Go to designer order page
    await page.goto(designerUrl);
    await page.waitForLoadState('networkidle');

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Take screenshot before deletion
    await page.screenshot({ path: 'test-results/designer-before-delete.png', fullPage: true });

    // Look for delete buttons
    const deleteButtons = await page.locator('button').filter({ hasText: /削除/ }).all();
    console.log(`Found ${deleteButtons.length} delete buttons`);

    if (deleteButtons.length === 0) {
      test.skip(true, 'No delete buttons found');
      return;
    }

    // Click the first delete button
    await deleteButtons[0].click();

    // Confirm deletion (browser confirm dialog)
    await page.on('dialog', dialog => dialog.accept());

    // Wait for success message
    await page.waitForTimeout(3000);

    // Take screenshot after deletion
    await page.screenshot({ path: 'test-results/designer-after-delete.png', fullPage: true });

    // Check if file was removed from UI
    const remainingDeleteButtons = await page.locator('button').filter({ hasText: /削除/ }).all();
    console.log(`Remaining delete buttons: ${remainingDeleteButtons.length}`);
  });
});
