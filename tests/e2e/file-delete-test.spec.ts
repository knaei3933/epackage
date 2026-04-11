import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * File Delete E2E Test
 *
 * ファイル削除機能のE2Eテスト
 * - ファイルのアップロード
 * - ファイルの削除
 * - データベースでの確認
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const MEMBER_EMAIL = process.env.TEST_MEMBER_EMAIL || 'admin@epackage-lab.com';
const MEMBER_PASSWORD = process.env.TEST_MEMBER_PASSWORD || 'Admin123!';
const ORDER_ID = 'aef5bdc8-e0b0-4b42-bc41-a2bb9337349f';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Supabase client for database verification
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

test.describe('File Delete Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="email"]', MEMBER_EMAIL);
    await page.fill('input[name="password"]', MEMBER_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/\/(admin|member)\/dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('should delete uploaded file from database and UI', async ({ page }) => {
    // Go to order detail page
    await page.goto(`${BASE_URL}/member/orders/${ORDER_ID}`);
    await page.waitForLoadState('networkidle');

    // Wait for file list to load
    await page.waitForTimeout(3000);

    // Get initial file count from database
    const { data: initialDbFiles, error: initialDbError } = await supabase
      .from('files')
      .select('id, original_filename')
      .eq('order_id', ORDER_ID);

    console.log(`Initial DB file count: ${initialDbFiles?.length || 0}`);
    console.log('Initial files:', initialDbFiles);

    if (!initialDbFiles || initialDbFiles.length === 0) {
      test.skip(true, 'No files found for testing. Please upload a file first.');
      return;
    }

    // Find file items by looking for PDF filename elements
    const fileElements = await page.locator('text=.pdf').all();
    console.log(`Found ${fileElements.length} PDF files in UI`);

    if (fileElements.length === 0) {
      test.skip(true, 'No file elements found in UI');
      return;
    }

    // Get the first file element
    const firstFileElement = fileElements[0];
    const fileName = await firstFileElement.textContent();
    console.log(`File to delete: ${fileName}`);

    // Find the delete button near the file (look for button with "削除" text)
    // The delete button is typically a button with trash icon or "削除" text
    const deleteButton = page.locator('button').filter({ hasText: /削除/ }).first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Confirm deletion in modal
    const confirmButton = page.locator('button:has-text("削除する")');
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    // Wait for success message
    await expect(page.locator('text=ファイルを削除しました')).toBeVisible({ timeout: 10000 });

    // Wait for UI to update
    await page.waitForTimeout(3000);

    // Verify file deleted from database
    const { data: finalDbFiles, error: finalDbError } = await supabase
      .from('files')
      .select('id, original_filename')
      .eq('order_id', ORDER_ID);

    console.log(`Final DB file count: ${finalDbFiles?.length || 0}`);
    console.log('Final files:', finalDbFiles);

    expect(finalDbFiles).toBeDefined();
    expect(finalDbFiles?.length).toBe(initialDbFiles.length - 1);

    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/after-delete.png' });
  });
});
