import { test, expect } from '@playwright/test';

test('Simulation Wizard Flow', async ({ page }) => {
    console.log('Starting test...');
    // 1. Navigate to Simulation Page
    await page.goto('/simulation');
    console.log('Navigated to /simulation');
    await expect(page).toHaveTitle(/見積り/);
    console.log('Title verified');

    // 2. Step 1: Bag Selection
    // Select "Flat Bag (3-side Seal)"
    await page.click('text=平袋（三方シール）');
    console.log('Clicked Bag Type');

    // Enter Dimensions
    await page.fill('input[placeholder="50-500"]', '100'); // Width
    await page.fill('input[placeholder="50-1000"]', '200'); // Height
    console.log('Filled Dimensions');

    // Select Material Genre (Custom Select)
    // Click the trigger for "Material Genre"
    await page.locator('div:has(label:has-text("素材ジャンル")) [role="combobox"]').click();
    console.log('Clicked Material Genre Dropdown');
    // Select an option (e.g., OPP+アルミ箔)
    await page.click('div[role="option"]:has-text("OPP+アルミ箔")');
    console.log('Selected Material Genre');

    // Open Surface Material Dropdown
    await page.locator('div:has(label:has-text("表面仕上げ")) [role="combobox"]').click();
    console.log('Clicked Surface Material Dropdown');
    // Select Matte
    await page.click('div[role="option"]:has-text("マットOPP")');
    console.log('Selected Surface Material');

    // Open Composition Dropdown
    await page.locator('div:has(label:has-text("構成詳細")) [role="combobox"]').click();
    console.log('Clicked Composition Dropdown');
    // Select first option
    await page.locator('div[role="option"]').first().click();
    console.log('Selected Composition');

    // Click Next
    await page.click('button:has-text("次へ")');
    console.log('Clicked Next');

    // 3. Step 2: Quantity & Options
    // Wait for Step 2
    await expect(page.locator('text=数量・納期')).toBeVisible();
    console.log('Step 2 Visible');

    // Add a quantity
    await page.fill('input[placeholder="例: 1000"]', '1000');
    console.log('Filled Quantity');

    // Click Next
    await page.click('button:has-text("次へ")');
    console.log('Clicked Next (Step 2)');

    // 4. Step 3: Results
    // Wait for Results
    await expect(page.locator('text=見積り結果')).toBeVisible();
    console.log('Results Visible');

    // Verify Price Calculation (1000 units -> 177 JPY/unit)
    // We look for the price in the table
    await expect(page.locator('text=177.0')).toBeVisible();
    await expect(page.locator('text=177,000')).toBeVisible();
    console.log('Price Verified');
});
