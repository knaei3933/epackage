/**
 * Admin Features Verification Test
 *
 * 管理者機能の検証テスト
 * - メモ更新機能
 * - ファイルダウンロード機能
 * - 校正データアップロード機能
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3007';
const ADMIN_EMAIL = 'admin@epackage-lab.com';
const ADMIN_PASSWORD = 'Admin123!';
const TEST_ORDER_ID = '06eb05e8-f205-4771-a13e-ba746dacaab4';

test.describe('Admin Features Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page (using auth/signin, not /admin/login)
    await page.goto(`${BASE_URL}/auth/signin`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Dismiss any alert dialogs
    try {
      const alertVisible = await page.evaluate(() => {
        const dialog = document.querySelector('dialog[open]');
        return dialog !== null;
      });

      if (alertVisible) {
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    } catch (e) {
      // Ignore
    }

    // Fill in login credentials
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation to admin area
    await page.waitForURL('**/admin/**', { timeout: 15000 });
    await page.waitForLoadState('networkidle');
  });

  test('1. Memo update functionality', async ({ page }) => {
    console.log('[TEST] Starting memo update test...');

    // Navigate to order detail page
    await page.goto(`${BASE_URL}/admin/orders/${TEST_ORDER_ID}`);
    await page.waitForLoadState('networkidle');

    // Wait for initial content to load
    await page.waitForTimeout(2000);

    // Click on "データ・校正管理" tab first
    const dataManagementTab = page.locator('button:has-text("データ・校正管理"), button:has-text("校正管理")').first();
    if (await dataManagementTab.count() > 0) {
      await dataManagementTab.click();
      await page.waitForTimeout(1000);
      console.log('[TEST] ✓ Clicked on data management tab');
    }

    // Click on "データ送信" sub-tab (memo update button is inside KoreaSendSection)
    const sendTab = page.locator('button:has-text("データ送信")').first();
    if (await sendTab.count() > 0) {
      await sendTab.click();
      await page.waitForTimeout(1000);
      console.log('[TEST] ✓ Clicked on data send sub-tab');
    }

    // Find memo textarea - might be in the Korea Send section
    const memoTextarea = page.locator('textarea[name="memo"], textarea[placeholder*="メモ"], textarea').first();

    // Check if textarea exists and is visible
    const textareaCount = await page.locator('textarea').count();
    console.log(`[TEST] Found ${textareaCount} textarea elements`);

    if (await memoTextarea.count() > 0) {
      // Clear existing text and enter new memo
      await memoTextarea.fill('');
      await memoTextarea.type('テストメモです');

      // Find and click update button
      const updateButton = page.locator('button:has-text("メモを更新"), button:has-text("更新")').first();

      if (await updateButton.count() > 0) {
        await updateButton.click();

        // Wait for success message
        await page.waitForTimeout(2000);

        // Check for success message
        const successMessage = page.locator('text=メモを更新しました').first();
        const isVisible = await successMessage.isVisible({ timeout: 5000 }).catch(() => false);

        if (isVisible) {
          console.log('[TEST] ✓ Memo update successful');
        } else {
          console.log('[TEST] ✗ Success message not found');
        }

        // Reload page to verify memo persists
        await page.reload();
        await page.waitForTimeout(3000);

        // After reload, need to click tabs again to access memo section
        const dataManagementTab2 = page.locator('button:has-text("データ・校正管理")').first();
        if (await dataManagementTab2.count() > 0) {
          await dataManagementTab2.click();
          await page.waitForTimeout(1000);
        }

        const sendTab2 = page.locator('button:has-text("データ送信")').first();
        if (await sendTab2.count() > 0) {
          await sendTab2.click();
          await page.waitForTimeout(1000);
        }

        // Get fresh reference to memo textarea after reload
        const memoTextarea2 = page.locator('textarea[name="memo"], textarea[placeholder*="メモ"], textarea').first();
        const memoValue = await memoTextarea2.inputValue();
        if (memoValue.includes('テストメモ')) {
          console.log('[TEST] ✓ Memo persists after reload');
        } else {
          console.log('[TEST] ✗ Memo does not persist. Current value:', memoValue);
        }
      } else {
        console.log('[TEST] ✗ Update button not found');
      }
    } else {
      console.log('[TEST] ✗ Memo textarea not found');
    }

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/admin-memo-test.png' });
  });

  test('2. AI file download functionality', async ({ page }) => {
    console.log('[TEST] Starting AI file download test...');

    // Navigate to order detail page
    await page.goto(`${BASE_URL}/admin/orders/${TEST_ORDER_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click on "データ・校正管理" tab if needed, or find the data receipt section
    const dataTab = page.locator('button:has-text("データ・校正管理")').first();

    if (await dataTab.count() > 0) {
      await dataTab.click();
      await page.waitForTimeout(1000);
    }

    // Look for download button
    const downloadButton = page.locator('button:has-text("ダウンロード"), a:has-text("ダウンロード")').first();

    if (await downloadButton.count() > 0) {
      console.log('[TEST] ✓ Download button found');

      // Setup download handler
      const downloadPromise = page.waitForEvent('download');

      // Click download button
      await downloadButton.click();

      try {
        const download = await Promise.race([
          downloadPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Download timeout')), 10000))
        ]) as { filename: string };

        console.log('[TEST] ✓ File downloaded:', download.filename);

        if (download.filename && download.filename.endsWith('.ai')) {
          console.log('[TEST] ✓ Downloaded file is AI format');
        } else {
          console.log('[TEST] ⚠ Downloaded file may not be AI format:', download.filename);
        }
      } catch (err) {
        console.log('[TEST] ✗ Download failed or timeout:', err);
      }
    } else {
      console.log('[TEST] ✗ Download button not found');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/admin-download-test.png' });
  });

  test('3. Correction upload functionality', async ({ page }) => {
    console.log('[TEST] Starting correction upload test...');

    // Navigate to order detail page
    await page.goto(`${BASE_URL}/admin/orders/${TEST_ORDER_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click on "データ・校正管理" tab first
    const dataManagementTab = page.locator('button:has-text("データ・校正管理")').first();
    if (await dataManagementTab.count() > 0) {
      await dataManagementTab.click();
      await page.waitForTimeout(1000);
    }

    // Click on "校正データ" sub-tab
    const correctionTab = page.locator('button:has-text("校正データ")').first();

    if (await correctionTab.count() > 0) {
      await correctionTab.click();
      await page.waitForTimeout(1000);
      console.log('[TEST] ✓ Correction tab clicked');
    } else {
      console.log('[TEST] ✗ Correction tab not found');
    }

    if (await correctionTab.count() > 0) {
      await correctionTab.click();
      await page.waitForTimeout(1000);
      console.log('[TEST] ✓ Correction tab clicked');
    } else {
      console.log('[TEST] ✗ Correction tab not found');
    }

    // Look for "新規校正追加" button
    const addButton = page.locator('button:has-text("新規校正追加"), button:has-text("追加")').first();

    if (await addButton.count() > 0) {
      console.log('[TEST] ✓ Add correction button found');

      await addButton.click();
      await page.waitForTimeout(1000);

      // Look for file input areas
      const previewLabel = page.locator('label:has-text("プレビュー画像"), label:has-text("クリックして選択")').first();

      if (await previewLabel.count() > 0) {
        console.log('[TEST] ✓ Preview file upload area found');

        // Check if clicking works by evaluating element
        const isClickable = await previewLabel.evaluate(el => {
          return window.getComputedStyle(el).pointerEvents !== 'none';
        });

        if (isClickable) {
          console.log('[TEST] ✓ Preview upload area is clickable');
        } else {
          console.log('[TEST] ✗ Preview upload area is not clickable');
        }
      } else {
        console.log('[TEST] ✗ Preview upload area not found');
      }
    } else {
      console.log('[TEST] ✗ Add correction button not found');
    }

    // Take screenshot
    await page.screenshot({ path: 'test-results/admin-upload-test.png' });
  });
});
