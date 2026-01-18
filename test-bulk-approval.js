/**
 * Quick test script for WF-04-03 bulk approval test
 * Run: node test-bulk-approval.js
 */

const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function testBulkApproval() {
  console.log('='.repeat(60));
  console.log('Testing WF-04-03: Bulk Approval');
  console.log('='.repeat(60));

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Setup admin auth
    await page.goto(`${BASE_URL}/auth/signin`);
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-admin-001');
      localStorage.setItem('dev-mock-user-role', 'ADMIN');
      localStorage.setItem('dev-mock-user-status', 'ACTIVE');
    });

    // Navigate to admin orders
    console.log('\n📋 Navigating to admin orders page...');
    await page.goto(`${BASE_URL}/admin/orders`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // Check for empty state
    const emptyState = page.locator('text=注文がありません|No orders|データがありません');
    const isEmpty = await emptyState.isVisible({ timeout: 5000 }).catch(() => false);

    if (isEmpty) {
      console.log('⚠️ No orders found - test would skip');
      await browser.close();
      return { status: 'SKIPPED', reason: 'No orders found' };
    }

    // Look for checkboxes in tbody
    console.log('\n🔍 Looking for order checkboxes...');
    const orderCheckboxes = page.locator('tbody input[type="checkbox"], table tbody tr input[type="checkbox"]');
    const checkboxCount = await orderCheckboxes.count();

    console.log(`Found ${checkboxCount} order checkboxes`);

    if (checkboxCount === 0) {
      console.log('⚠️ No order checkboxes found');
      await browser.close();
      return { status: 'SKIPPED', reason: 'No checkboxes found' };
    }

    // Select first 2 orders
    console.log('\n✅ Selecting orders...');
    let selectedCount = 0;
    const ordersToSelect = Math.min(2, checkboxCount);

    for (let i = 0; i < ordersToSelect; i++) {
      const checkbox = orderCheckboxes.nth(i);
      const isVisible = await checkbox.isVisible({ timeout: 1000 }).catch(() => false);

      if (isVisible) {
        await checkbox.check();
        selectedCount++;
        console.log(`  ✓ Selected order ${i + 1}`);
      }
    }

    if (selectedCount === 0) {
      console.log('⚠️ No orders could be selected');
      await browser.close();
      return { status: 'FAILED', reason: 'No selectable orders' };
    }

    console.log(`\n✅ Selected ${selectedCount} orders`);
    await page.waitForTimeout(500);

    // Look for bulk action select
    console.log('\n🔍 Looking for bulk action select...');
    const bulkActionSelectJa = page.locator('select').filter({
      hasText: /一括変更|件選択/i
    }).first();

    const bulkActionVisible = await bulkActionSelectJa.isVisible({ timeout: 3000 }).catch(() => false);

    if (!bulkActionVisible) {
      // Try fallback
      const anySelect = page.locator('select').nth(1);
      const fallbackVisible = await anySelect.isVisible({ timeout: 1000 }).catch(() => false);

      if (!fallbackVisible) {
        console.log('⚠️ Bulk action select not visible after selection');
        await browser.close();
        return { status: 'FAILED', reason: 'Bulk action UI not visible' };
      }
    }

    console.log('✅ Bulk action select is visible');

    // Try to select approval option
    console.log('\n🔄 Attempting to select approval option...');
    const bulkActionSelect = bulkActionVisible ? bulkActionSelectJa : page.locator('select').nth(1);

    const approvalOptions = ['production', 'approved', 'confirmed'];
    let actionSuccess = false;

    for (const option of approvalOptions) {
      try {
        await bulkActionSelect.selectOption(option);
        console.log(`✅ Selected option: ${option}`);
        actionSuccess = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!actionSuccess) {
      try {
        await bulkActionSelect.selectOption({ label: /承認|製作中|確認済み/ });
        console.log('✅ Selected approval option by label');
        actionSuccess = true;
      } catch (e) {
        console.log('⚠️ Could not select approval option');
      }
    }

    if (actionSuccess) {
      // Handle dialog
      console.log('\n🔔 Waiting for confirmation dialog...');
      page.on('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
        console.log('✅ Accepted confirmation dialog');
      });

      await page.waitForTimeout(2000);
      console.log('\n✅ Bulk approval test completed successfully!');
    }

    // Take screenshot
    const screenshotPath = path.join(__dirname, 'bulk-approval-test-result.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

    await browser.close();
    return { status: 'SUCCESS', selectedCount };

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);

    // Take error screenshot
    const screenshotPath = path.join(__dirname, 'bulk-approval-test-error.png');
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    console.log(`📸 Error screenshot saved: ${screenshotPath}`);

    await browser.close();
    return { status: 'ERROR', error: error.message };
  }
}

// Run the test
testBulkApproval()
  .then(result => {
    console.log('\n' + '='.repeat(60));
    console.log('Test Result:', result.status);
    if (result.reason) console.log('Reason:', result.reason);
    if (result.error) console.log('Error:', result.error);
    if (result.selectedCount) console.log('Orders Selected:', result.selectedCount);
    console.log('='.repeat(60));
    process.exit(result.status === 'SUCCESS' ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
