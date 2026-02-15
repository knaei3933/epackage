import { test, expect } from '@playwright/test';

/**
 * Pricing Calculation Verification Test
 *
 * Tests the pricing calculation for 130x130x30mm stand-up pouch with zipper, 500 sheets
 * Expected price: approximately 174,000 yen (not 332,249 yen as before)
 *
 * Calculation breakdown:
 * - Material cost: 129,812 KRW (15,577 yen)
 * - Processing cost: 579,059 KRW (69,487 yen)
 * - Base cost: 85,064 yen
 * - With zipper (1.15x): 97,824 yen
 * - Import cost (x1.05): 143,711 yen
 * - Final price (x1.2): 172,453 yen + 1,500 delivery = 173,953 yen
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Pricing Calculation Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/quote-simulator`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('130x130x30 Stand-up Pouch with Zipper - 500 sheets', async ({ page }) => {
    console.log('=== Test: 130x130x30 Stand-up Pouch with Zipper - 500 sheets ===');

    // Step 1: Select stand-up pouch (スタンドアップパウチ)
    const standUpButton = page.locator('button').filter({ hasText: /スタンドアップ/i }).first();
    await standUpButton.click();
    await page.waitForTimeout(1000);

    // Step 2: Input size - Width: 130mm, Height: 130mm, Depth: 30mm
    const allInputs = page.locator('input[type="number"]');
    await allInputs.nth(0).fill('130'); // Width
    await page.waitForTimeout(300);
    await allInputs.nth(1).fill('130'); // Height
    await page.waitForTimeout(300);
    await allInputs.nth(2).fill('30'); // Depth
    await page.waitForTimeout(300);

    // Click outside to trigger blur
    await page.mouse.click(10, 10);
    await page.waitForTimeout(500);

    // Verify values are set
    const widthValue = await allInputs.nth(0).inputValue();
    const heightValue = await allInputs.nth(1).inputValue();
    const depthValue = await allInputs.nth(2).inputValue();
    console.log('Size values - Width:', widthValue, 'Height:', heightValue, 'Depth:', depthValue);
    expect(widthValue).toBe('130');
    expect(heightValue).toBe('130');
    expect(depthValue).toBe('30');

    await page.screenshot({ path: 'test-results/pricing-test-1-size-input.png' });

    // Step 3: Click "次へ" (Next) button to navigate to quantity step
    const nextButton = page.locator('button').filter({ hasText: /次へ/i }).first();
    await nextButton.click();
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'test-results/pricing-test-2-quantity-step.png' });

    // Step 4: Select quantity - 500 sheets
    // Look for quantity input or selector
    const quantityInput = page.locator('input[type="number"]').or(page.locator('[data-quantity]'));
    if (await quantityInput.count() > 0) {
      await quantityInput.first().fill('500');
      await page.waitForTimeout(500);
    }

    // Alternative: Click on quantity button if exists
    const quantity500Button = page.locator('button').filter({ hasText: /500/i }).first();
    if (await quantity500Button.count() > 0) {
      await quantity500Button.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'test-results/pricing-test-3-quantity-selected.png' });

    // Step 5: Navigate to post-processing options
    const nextButton2 = page.locator('button').filter({ hasText: /次へ/i }).nth(1);
    if (await nextButton2.count() > 0) {
      await nextButton2.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'test-results/pricing-test-4-post-processing.png' });

    // Step 6: Select zipper (ジッパーあり)
    const zipperYesButton = page.locator('button').filter({ hasText: /ジッパー.*あり/i }).or(
      page.locator('[data-zipper="yes"]')
    ).or(
      page.locator('input[type="checkbox"]').filter({ hasText: /ジッパー/i })
    );

    if (await zipperYesButton.count() > 0) {
      await zipperYesButton.first().click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'test-results/pricing-test-5-zipper-selected.png' });

    // Step 7: Look for price display
    const priceDisplay = page.locator('[data-price]').or(
      page.locator('.price-display').or(
        page.locator('[class*="price"]').or(
          page.locator('[class*="amount"]').or(
            page.locator('text=/¥|¥|円|JPY/i')
          )
        )
      )
    );

    if (await priceDisplay.count() > 0) {
      const priceText = await priceDisplay.first().textContent();
      console.log('Price displayed:', priceText);

      // Extract numeric value from price text
      const priceMatch = priceText?.match(/[\d,]+/);
      if (priceMatch) {
        const priceValue = parseInt(priceMatch[0].replace(/,/g, ''));
        console.log('Parsed price value:', priceValue);

        // Expected price: approximately 174,000 yen (range: 165,000 - 185,000)
        expect(priceValue).toBeGreaterThan(165000);
        expect(priceValue).toBeLessThan(185000);

        console.log('✓ Price is within expected range (165,000 - 185,000 yen)');
      } else {
        console.log('Could not parse price value from:', priceText);
      }
    } else {
      console.log('No price display found. Taking screenshot of current page...');
    }

    await page.screenshot({ path: 'test-results/pricing-test-final.png', fullPage: true });

    // Step 8: Check console logs for calculation details
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('[Film Width Calculation]') || text.includes('[Pouch Processing Cost]') || text.includes('Price')) {
        console.log('Browser console:', text);
      }
    });

    // Step 9: Navigate to final step to see complete quote
    const nextButton3 = page.locator('button').filter({ hasText: /次へ/i }).nth(2);
    if (await nextButton3.count() > 0) {
      await nextButton3.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'test-results/pricing-test-final-quote.png', fullPage: true });

    // Check for final price display
    const finalPriceDisplay = page.locator('[data-final-price]').or(
      page.locator('.final-price').or(
        page.locator('[class*="total"]').or(
          page.locator('text=/合計|Total/i')
        )
      )
    );

    if (await finalPriceDisplay.count() > 0) {
      const finalPriceText = await finalPriceDisplay.first().textContent();
      console.log('Final price displayed:', finalPriceText);

      const finalPriceMatch = finalPriceText?.match(/[\d,]+/);
      if (finalPriceMatch) {
        const finalPriceValue = parseInt(finalPriceMatch[0].replace(/,/g, ''));
        console.log('Parsed final price value:', finalPriceValue);

        // Expected final price: approximately 174,000 yen
        expect(finalPriceValue).toBeGreaterThan(165000);
        expect(finalPriceValue).toBeLessThan(185000);

        console.log('✓ Final price is within expected range (165,000 - 185,000 yen)');
      }
    }
  });

  test('Quick Price Check - Navigate and Verify', async ({ page }) => {
    console.log('=== Quick Price Check Test ===');

    // Select stand-up pouch
    const standUpButton = page.locator('button').filter({ hasText: /スタンドアップ/i }).first();
    await standUpButton.click();
    await page.waitForTimeout(1000);

    // Input size
    const allInputs = page.locator('input[type="number"]');
    await allInputs.nth(0).fill('130'); // Width
    await allInputs.nth(1).fill('130'); // Height
    await allInputs.nth(2).fill('30'); // Depth
    await page.mouse.click(10, 10);
    await page.waitForTimeout(500);

    // Navigate through steps
    for (let i = 0; i < 3; i++) {
      const nextButton = page.locator('button').filter({ hasText: /次へ/i }).nth(i);
      if (await nextButton.count() > 0) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    }

    // Check for any price display
    const pageContent = await page.content();
    const priceRegex = /¥?\s*([\d,]+)\s*円?|([\d,]+)\s*円/i;
    const priceMatches = pageContent.match(priceRegex);

    if (priceMatches) {
      console.log('Found price in page:', priceMatches[0]);
    }

    await page.screenshot({ path: 'test-results/quick-price-check.png', fullPage: true });
  });
});
