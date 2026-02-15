import { test, expect } from '@playwright/test';

/**
 * Improved Size Input UX Test for Quote Simulator
 *
 * Tests the auto-adjustment behavior for width and height inputs:
 * - Auto-adjustment to 5mm units on blur
 * - Minimum value enforcement (70mm)
 * - Display of adjustment messages
 * - No concatenation issues (like "70160")
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Quote Simulator - Improved Size Input UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/quote-simulator`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('Scenario 1: Width Input with 5mm Adjustment', async ({ page }) => {
    console.log('=== Test Scenario 1: Width Input with 5mm Adjustment ===');

    // Select flat bag (平袋)
    const flatBagButton = page.locator('button').filter({ hasText: /平袋/i }).first();
    if (await flatBagButton.count() > 0) {
      await flatBagButton.click();
      await page.waitForTimeout(1000);
    }

    // Find width input (幅)
    const widthInput = page.locator('input[aria-label="袋の幅 (mm)"]').first();
    if (await widthInput.count() === 0) {
      // Alternative selector
      const allInputs = page.locator('input[type="number"]');
      await allInputs.nth(0).fill('163');
      await page.waitForTimeout(500);
      await page.mouse.click(10, 10);
      await page.waitForTimeout(500);
      const finalValue = await allInputs.nth(0).inputValue();
      console.log('Final value:', finalValue);
      expect(finalValue).toBe('165');
    } else {
      await widthInput.fill('163');
      await page.waitForTimeout(500);
      await page.mouse.click(10, 10);
      await page.waitForTimeout(500);
      const finalValue = await widthInput.inputValue();
      console.log('Final value:', finalValue);
      expect(finalValue).toBe('165');
    }

    await page.screenshot({ path: 'test-results/scenario1-5mm-adjustment.png' });
    console.log('✓ Width adjusted from 163 to 165');
  });

  test('Scenario 2: Width Input Below Minimum', async ({ page }) => {
    console.log('=== Test Scenario 2: Width Input Below Minimum ===');

    const flatBagButton = page.locator('button').filter({ hasText: /平袋/i }).first();
    if (await flatBagButton.count() > 0) {
      await flatBagButton.click();
      await page.waitForTimeout(1000);
    }

    const allInputs = page.locator('input[type="number"]');
    await allInputs.nth(0).fill('');
    await allInputs.nth(0).fill('50');
    await page.waitForTimeout(500);
    await page.mouse.click(10, 10);
    await page.waitForTimeout(500);

    const finalValue = await allInputs.nth(0).inputValue();
    console.log('Final value:', finalValue);
    expect(finalValue).toBe('70');

    await page.screenshot({ path: 'test-results/scenario2-minimum-adjustment.png' });
    console.log('✓ Width adjusted from 50 to 70 (minimum)');
  });

  test('Scenario 3: Width Input Free Typing', async ({ page }) => {
    console.log('=== Test Scenario 3: Width Input Free Typing ===');

    const flatBagButton = page.locator('button').filter({ hasText: /平袋/i }).first();
    if (await flatBagButton.count() > 0) {
      await flatBagButton.click();
      await page.waitForTimeout(1000);
    }

    const allInputs = page.locator('input[type="number"]');
    await allInputs.nth(0).fill('160');
    await page.waitForTimeout(500);

    const currentValue = await allInputs.nth(0).inputValue();
    console.log('Current value:', currentValue);
    expect(currentValue).toBe('160');

    await page.screenshot({ path: 'test-results/scenario3-free-typing.png' });
    console.log('✓ Value 160 remains unchanged (no adjustment)');
  });

  test('Scenario 4: No Concatenation Issue', async ({ page }) => {
    console.log('=== Test Scenario 4: No Concatenation Issue ===');

    const flatBagButton = page.locator('button').filter({ hasText: /平袋/i }).first();
    if (await flatBagButton.count() > 0) {
      await flatBagButton.click();
      await page.waitForTimeout(1000);
    }

    const allInputs = page.locator('input[type="number"]');
    await allInputs.nth(0).fill('');
    await allInputs.nth(0).fill('200');
    await page.waitForTimeout(500);

    const currentValue = await allInputs.nth(0).inputValue();
    console.log('Current value:', currentValue);
    expect(currentValue).toBe('200');
    expect(currentValue).not.toBe('70200');

    await page.screenshot({ path: 'test-results/scenario4-no-concatenation.png' });
    console.log('✓ No concatenation issue - value is 200');
  });

  test('Scenario 5: Input Values Preserved When Navigating Back', async ({ page }) => {
    console.log('=== Test Scenario 5: Input Values Preserved When Navigating Back ===');

    // Select stand-up pouch (スタンドアップパウチ)
    const standUpButton = page.locator('button').filter({ hasText: /スタンドアップ/i }).first();
    if (await standUpButton.count() > 0) {
      await standUpButton.click();
      await page.waitForTimeout(1000);
    }

    // Input width: 100, height: 160
    const allInputs = page.locator('input[type="number"]');
    await allInputs.nth(0).fill('100'); // Width
    await page.waitForTimeout(300);
    await allInputs.nth(1).fill('160'); // Height
    await page.waitForTimeout(300);

    // Click outside to trigger blur
    await page.mouse.click(10, 10);
    await page.waitForTimeout(500);

    // Verify values are set
    let widthValue = await allInputs.nth(0).inputValue();
    let heightValue = await allInputs.nth(1).inputValue();
    console.log('Initial values - Width:', widthValue, 'Height:', heightValue);
    expect(widthValue).toBe('100');
    expect(heightValue).toBe('160');

    await page.screenshot({ path: 'test-results/scenario5-initial-values.png' });

    // Click "次へ" (Next) button to navigate to next step
    const nextButton = page.locator('button').filter({ hasText: /次へ/i }).first();
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: 'test-results/scenario5-next-step.png' });

    // Click "戻る" (Back) button to return to first step
    const backButton = page.locator('button').filter({ hasText: /戻る/i }).first();
    if (await backButton.count() > 0) {
      await backButton.click();
      await page.waitForTimeout(2000);
    }

    // Verify values are still there
    widthValue = await allInputs.nth(0).inputValue();
    heightValue = await allInputs.nth(1).inputValue();
    console.log('Values after navigation - Width:', widthValue, 'Height:', heightValue);
    expect(widthValue).toBe('100');
    expect(heightValue).toBe('160');

    await page.screenshot({ path: 'test-results/scenario5-values-preserved.png' });
    console.log('✓ Input values preserved when navigating back to first page');
  });
});
