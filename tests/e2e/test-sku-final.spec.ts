import { test, expect } from '@playwright/test';

test('SKU quantity final test - 2 SKUs x 2000 each', async ({ page }) => {
  // Navigate to quote simulator
  await page.goto('http://localhost:3004/quote-simulator');

  // Wait for page to load
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  console.log('Step 1: Fill basic specs');

  // Fill bag type
  await page.selectOption('select[id="bagType"]', 'flat_3_side');
  await page.fill('input[name="width"]', '100');
  await page.fill('input[name="height"]', '160');

  // Click Next to go to post-processing
  await page.click('button:has-text("次へ")');
  await page.waitForTimeout(1000);

  console.log('Step 2: Skip post-processing');
  await page.click('button:has-text("次へ")');
  await page.waitForTimeout(1000);

  console.log('Step 3: Add SKUs and set quantities');

  // Add one more SKU (should be 2 total)
  const addButton = page.locator('button:has-text("SKU追加")').first();
  await addButton.click();
  await page.waitForTimeout(500);

  // Now set both SKUs to 2000
  const quantityInputs = page.locator('input[type="number"]');
  const count = await quantityInputs.count();

  console.log('Number of quantity inputs:', count);

  for (let i = 0; i < Math.min(count, 2); i++) {
    await quantityInputs.nth(i).fill('2000');
    console.log(`Set input ${i} to 2000`);
  }

  await page.waitForTimeout(1000);

  console.log('Step 4: Click Next to calculate');

  // Click Next button
  const nextButton = page.locator('button:has-text("次へ"), button:has-text("見積計算")').first();
  await nextButton.click();
  await page.waitForTimeout(3000);

  console.log('Step 5: Check result page');

  // Check for SKU display
  const pageContent = await page.content();

  // Print key sections
  console.log('=== Page content analysis ===');

  if (pageContent.includes('SKU別数量')) {
    console.log('✓ Found "SKU別数量"');
  } else {
    console.log('✗ Missing "SKU別数量"');
  }

  if (pageContent.includes('2種類')) {
    console.log('✓ Found "2種類"');
  } else {
    console.log('✗ Missing "2種類"');
  }

  if (pageContent.includes('2,000個') || pageContent.includes('2000個')) {
    console.log('✓ Found "2000個"');
  } else {
    console.log('✗ Missing "2000個"');
  }

  if (pageContent.includes('4,000個') || pageContent.includes('4000個')) {
    console.log('✓ Found total "4000個"');
  } else {
    console.log('✗ Missing total "4000個"');
  }

  // Take screenshot
  await page.screenshot({ path: 'test-sku-final-result.png', fullPage: true });
  console.log('Screenshot saved to test-sku-final-result.png');

  // Final assertion
  expect(pageContent).toContain('SKU別数量');
});
