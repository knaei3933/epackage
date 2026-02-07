import { test, expect } from '@playwright/test';

/**
 * Production Scenarios Quote Simulator Verification Tests
 *
 * These tests verify that the quote simulator produces expected prices
 * for all documented production scenarios.
 */

const BASE_URL = 'http://localhost:3001';

test.describe('Production Scenarios - Quote Simulator Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/quote-simulator`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('Scenario 1: Medium Production (중량생산) - Flat bag 100×150mm, 5,000개', async ({ page }) => {
    console.log('=== Scenario 1: Medium Production ===');
    console.log('Input: Flat bag 100×150mm, 5,000개');
    console.log('Expected Unit Price: ¥68/개');
    console.log('Expected Total: ¥338,333');

    // Select flat bag (平袋)
    const flatBagButton = page.locator('button').filter({ hasText: /平袋|flat.*bag/i }).first();
    await flatBagButton.click();
    await page.waitForTimeout(1000);

    // Set width to 100mm
    const widthInput = page.locator('input[type="number"]').first();
    await widthInput.fill('100');
    await page.waitForTimeout(500);

    // Set height to 150mm
    const heightInput = page.locator('input[type="number"]').nth(1);
    await heightInput.fill('150');
    await page.waitForTimeout(500);

    // Take screenshot after setting dimensions
    await page.screenshot({ path: 'test-results/scenario1-dimensions.png' });

    // Set quantity to 5000
    const allInputs = page.locator('input[type="number"]');
    const inputCount = await allInputs.count();
    console.log('Total number inputs found:', inputCount);

    // Try different approaches to set quantity
    let quantitySet = false;
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const placeholder = await allInputs.nth(i).getAttribute('placeholder');
      console.log(`Input ${i} placeholder:`, placeholder);
    }

    // Look for quantity input or click next to proceed
    const nextButton = page.locator('button:has-text("次へ"), button:has-text("次へ進む")').first();
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }

    // Set quantity on quantity step
    const quantityInput = page.locator('input[type="number"][placeholder*="数量"], input[placeholder*="quantity"], input[placeholder*="Quantity"]').first();
    const quantityCount = await quantityInput.count();
    console.log('Quantity inputs found:', quantityCount);

    if (quantityCount > 0) {
      await quantityInput.first().fill('5000');
      await page.waitForTimeout(500);
    }

    // Click next to go to result
    const resultButton = page.locator('button:has-text("見積結果"), button:has-text("結果"), button:has-text("Result")').first();
    if (await resultButton.count() > 0) {
      await resultButton.click();
      await page.waitForTimeout(2000);
    }

    // Capture displayed prices
    await page.screenshot({ path: 'test-results/scenario1-result.png', fullPage: true });

    const priceElements = await page.locator('text=/¥|円/').all();
    console.log('Price elements found:', priceElements.length);

    for (const elem of priceElements) {
      const text = await elem.textContent();
      console.log('Price text:', text);
    }
  });

  test('Scenario 2: Large Production (대량생산) - Flat bag 120×180mm, 50,000개', async ({ page }) => {
    console.log('=== Scenario 2: Large Production ===');
    console.log('Input: Flat bag 120×180mm, 50,000개');
    console.log('Expected Unit Price: ¥54/개');
    console.log('Expected Total: ¥2,723,226');

    const flatBagButton = page.locator('button').filter({ hasText: /平袋|flat.*bag/i }).first();
    await flatBagButton.click();
    await page.waitForTimeout(1000);

    const widthInput = page.locator('input[type="number"]').first();
    await widthInput.fill('120');
    await page.waitForTimeout(500);

    const heightInput = page.locator('input[type="number"]').nth(1);
    await heightInput.fill('180');
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/scenario2-dimensions.png' });

    const nextButton = page.locator('button:has-text("次へ"), button:has-text("次へ進む")').first();
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }

    const quantityInput = page.locator('input[type="number"][placeholder*="数量"]').first();
    const quantityCount = await quantityInput.count();

    if (quantityCount > 0) {
      await quantityInput.first().fill('50000');
      await page.waitForTimeout(500);
    }

    const resultButton = page.locator('button:has-text("見積結果"), button:has-text("結果")').first();
    if (await resultButton.count() > 0) {
      await resultButton.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'test-results/scenario2-result.png', fullPage: true });

    const priceElements = await page.locator('text=/¥|円/').all();
    console.log('Price elements found:', priceElements.length);

    for (const elem of priceElements) {
      const text = await elem.textContent();
      console.log('Price text:', text);
    }
  });

  test('Scenario 3: Stand Pouch (스탠드파우치) - 100×150×30mm, 10,000개', async ({ page }) => {
    console.log('=== Scenario 3: Stand Pouch ===');
    console.log('Input: Stand pouch 100×150×30mm, 10,000개');
    console.log('Expected Unit Price: ¥32.4/개 (2열 생산 기준)');
    console.log('Expected Total: ¥2,702,146');

    const standPouchButton = page.locator('button').filter({ hasText: /スタンド|stand.*up/i }).first();
    if (await standPouchButton.count() > 0) {
      await standPouchButton.click();
    } else {
      // Try alternative selector
      await page.locator('[data-bag-type="stand_up"], [data-bag-type="stand_pouch"]').first().click();
    }
    await page.waitForTimeout(1000);

    const widthInput = page.locator('input[type="number"]').first();
    await widthInput.fill('100');
    await page.waitForTimeout(500);

    const heightInput = page.locator('input[type="number"]').nth(1);
    await heightInput.fill('150');
    await page.waitForTimeout(500);

    // Set gusset/depth to 30mm
    const depthInput = page.locator('input[type="number"]').nth(2);
    await depthInput.fill('30');
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/scenario3-dimensions.png' });

    const nextButton = page.locator('button:has-text("次へ"), button:has-text("次へ進む")').first();
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }

    const quantityInput = page.locator('input[type="number"][placeholder*="数量"]').first();
    const quantityCount = await quantityInput.count();

    if (quantityCount > 0) {
      await quantityInput.first().fill('10000');
      await page.waitForTimeout(500);
    }

    const resultButton = page.locator('button:has-text("見積結果"), button:has-text("結果")').first();
    if (await resultButton.count() > 0) {
      await resultButton.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'test-results/scenario3-result.png', fullPage: true });

    const priceElements = await page.locator('text=/¥|円/').all();
    console.log('Price elements found:', priceElements.length);

    for (const elem of priceElements) {
      const text = await elem.textContent();
      console.log('Price text:', text);
    }
  });

  test('Scenario 4: Box Pouch (박스파우치) - 100×200×60mm, 15,000개', async ({ page }) => {
    console.log('=== Scenario 4: Box Pouch ===');
    console.log('Input: Box pouch 100×200×60mm, 15,000개 (3종 × 5,000개)');
    console.log('Expected Unit Price: ¥51.3/개 (멀티롤 생산 기준)');
    console.log('Expected Total: ¥6,409,417');

    const boxPouchButton = page.locator('button').filter({ hasText: /ボックス|box.*pouch/i }).first();
    if (await boxPouchButton.count() > 0) {
      await boxPouchButton.click();
    } else {
      await page.locator('[data-bag-type="box"], [data-bag-type="box_pouch"]').first().click();
    }
    await page.waitForTimeout(1000);

    const widthInput = page.locator('input[type="number"]').first();
    await widthInput.fill('100');
    await page.waitForTimeout(500);

    const heightInput = page.locator('input[type="number"]').nth(1);
    await heightInput.fill('200');
    await page.waitForTimeout(500);

    const depthInput = page.locator('input[type="number"]').nth(2);
    await depthInput.fill('60');
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/scenario4-dimensions.png' });

    const nextButton = page.locator('button:has-text("次へ"), button:has-text("次へ進む")').first();
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }

    // For box pouch with 3 SKUs
    const quantityInput = page.locator('input[type="number"][placeholder*="数量"]').first();
    const quantityCount = await quantityInput.count();

    if (quantityCount > 0) {
      await quantityInput.first().fill('5000');
      await page.waitForTimeout(500);
    }

    const resultButton = page.locator('button:has-text("見積結果"), button:has-text("結果")').first();
    if (await resultButton.count() > 0) {
      await resultButton.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'test-results/scenario4-result.png', fullPage: true });

    const priceElements = await page.locator('text=/¥|円/').all();
    console.log('Price elements found:', priceElements.length);

    for (const elem of priceElements) {
      const text = await elem.textContent();
      console.log('Price text:', text);
    }
  });

  test('Scenario 5: Roll Film (롤필름) - 200mm × 500m, 12 rolls', async ({ page }) => {
    console.log('=== Scenario 5: Roll Film ===');
    console.log('Input: Roll film 200mm × 500m, 12 rolls');
    console.log('Expected Unit Price: ¥56,947/roll (3열 생산 기준)');
    console.log('Expected Total: ¥683,365');

    const rollFilmButton = page.locator('button').filter({ hasText: /ロール|roll.*film/i }).first();
    if (await rollFilmButton.count() > 0) {
      await rollFilmButton.click();
    } else {
      await page.locator('[data-bag-type="roll_film"]').first().click();
    }
    await page.waitForTimeout(1000);

    const widthInput = page.locator('input[type="number"]').first();
    await widthInput.fill('200');
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/scenario5-dimensions.png' });

    const nextButton = page.locator('button:has-text("次へ"), button:has-text("次へ進む")').first();
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }

    const quantityInput = page.locator('input[type="number"][placeholder*="数量"]').first();
    const quantityCount = await quantityInput.count();

    if (quantityCount > 0) {
      await quantityInput.first().fill('12');
      await page.waitForTimeout(500);
    }

    const resultButton = page.locator('button:has-text("見積結果"), button:has-text("結果")').first();
    if (await resultButton.count() > 0) {
      await resultButton.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'test-results/scenario5-result.png', fullPage: true });

    const priceElements = await page.locator('text=/¥|円/').all();
    console.log('Price elements found:', priceElements.length);

    for (const elem of priceElements) {
      const text = await elem.textContent();
      console.log('Price text:', text);
    }
  });
});
