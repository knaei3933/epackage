import { test, expect } from '@playwright/test';

/**
 * File Delete Debug Test
 *
 * 削除機能のデバッグ用テスト - DOM構造の確認
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const MEMBER_EMAIL = process.env.TEST_MEMBER_EMAIL || 'admin@epackage-lab.com';
const MEMBER_PASSWORD = process.env.TEST_MEMBER_PASSWORD || 'Admin123!';
const ORDER_ID = 'aef5bdc8-e0b0-4b42-bc41-a2bb9337349f';

test.describe('File Delete Debug', () => {
  test('inspect file list structure', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="email"]', MEMBER_EMAIL);
    await page.fill('input[name="password"]', MEMBER_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/\/(admin|member)\/dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    // Go to order detail page
    await page.goto(`${BASE_URL}/member/orders/${ORDER_ID}`);
    await page.waitForLoadState('networkidle');

    // Wait for file list to load
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'order-page.png', fullPage: true });

    // Get HTML of file list section
    const fileSectionHTML = await page.locator('text=入稿データ').locator('..').locator('..').innerHTML();
    console.log('File section HTML:', fileSectionHTML);

    // Look for delete buttons
    const deleteButtons = await page.locator('button:has-text("削除")').all();
    console.log(`Found ${deleteButtons.length} delete buttons`);

    // Look for file items
    const fileItems = await page.locator('text=.pdf').all();
    console.log(`Found ${fileItems.length} PDF items`);

    // Try to find delete button near a file
    const firstDeleteButton = page.locator('button:has-text("削除")').first();
    if (await firstDeleteButton.isVisible()) {
      console.log('First delete button is visible');
      // Get parent structure
      const parentHTML = await firstDeleteButton.locator('..').innerHTML();
      console.log('Parent HTML:', parentHTML);
    }
  });
});
