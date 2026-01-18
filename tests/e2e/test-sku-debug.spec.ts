import { test, expect } from '@playwright/test';

test('SKU quantity debug test', async ({ page }) => {
  // Navigate to quote simulator
  await page.goto('http://localhost:3000/quote-simulator');

  // Wait for page to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  console.log('Step 1: Fill basic specs');

  // Fill basic specs (bag type, size, material)
  await page.selectOption('select[id="bagType"]', 'flat_3_side');
  await page.fill('input[name="width"]', '100');
  await page.fill('input[name="height"]', '160');

  // Click Next to go to post-processing
  await page.click('button:has-text("次へ")');
  await page.waitForTimeout(1000);

  console.log('Step 2: Skip post-processing');

  // Click Next to go to SKU-quantity step
  await page.click('button:has-text("次へ")');
  await page.waitForTimeout(1000);

  console.log('Step 3: Add SKUs and set quantities');

  // Check current state
  const skuCountBefore = await page.locator('input[name="skuCount"]').inputValue();
  console.log('SKU Count before:', skuCountBefore);

  // Add one more SKU (should be 2 total)
  await page.click('button:has-text("SKU追加")');
  await page.waitForTimeout(500);

  // Now set both SKUs to 2000
  const skuInputs = await page.locator('input[placeholder*="数量"]').all();
  console.log('Number of quantity inputs:', skuInputs.length);

  for (let i = 0; i < skuInputs.length; i++) {
    await skuInputs[i].fill('2000');
    console.log(`Set SKU ${i + 1} to 2000`);
  }

  await page.waitForTimeout(1000);

  // Check console logs for SKU state
  const logs = [];
  page.on('console', msg => {
    if (msg.text().includes('SKU') || msg.text().includes('sku')) {
      logs.push(msg.text());
      console.log('Browser console:', msg.text());
    }
  });

  console.log('Step 4: Click Next to calculate');

  // Click Next to calculate
  await page.click('button:has-text("見積計算")');
  await page.waitForTimeout(3000);

  console.log('Step 5: Check result page');

  // Check what's displayed in the order confirmation
  const pageContent = await page.content();

  // Look for SKU-related text
  if (pageContent.includes('SKU別数量')) {
    console.log('✓ Found "SKU別数量" text');
  } else {
    console.log('✗ "SKU別数量" text NOT found');
  }

  if (pageContent.includes('2種類')) {
    console.log('✓ Found "2種類" text');
  } else {
    console.log('✗ "2種類" text NOT found');
  }

  if (pageContent.includes('2,000個') || pageContent.includes('2000個')) {
    console.log('✓ Found "2000個" text');
  } else {
    console.log('✗ "2000個" text NOT found');
  }

  if (pageContent.includes('4,000個') || pageContent.includes('4000個')) {
    console.log('✓ Found "4000個" total text');
  } else {
    console.log('✗ "4000個" total text NOT found');
  }

  // Print relevant console logs
  console.log('=== Console logs containing SKU/quantities ===');
  logs.forEach(log => console.log(log));

  // Take screenshot
  await page.screenshot({ path: 'test-sku-debug-result.png', fullPage: true });
  console.log('Screenshot saved to test-sku-debug-result.png');

  // Wait to see result
  await page.waitForTimeout(5000);
});
