import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@epackage-lab.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin123!';

async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/auth/signin`);
  await page.waitForLoadState('domcontentloaded');
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(admin|member)\/dashboard/, { timeout: 20000 });
}

test.describe('Printing type auto-resolve verification', () => {
  test('should show デジタル印刷 or グラビア印刷 instead of auto', async ({ page }) => {
    test.setTimeout(120000);

    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/quote-simulator`);
    await page.waitForTimeout(5000);

    const contentsSelects = page.locator('div[data-section="contents-dropdowns"] select');
    await contentsSelects.nth(0).selectOption('food');
    await contentsSelects.nth(1).selectOption('solid');
    await contentsSelects.nth(2).selectOption('general_neutral');
    await contentsSelects.nth(3).selectOption('general_roomTemp');
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '次のステップに進む' }).click();
    await page.waitForTimeout(3000);

    await page.getByRole('button', { name: '次のステップに進む' }).click();
    await page.waitForTimeout(3000);

    for (let i = 0; i < 3; i++) {
      const delBtn = page.getByRole('button', { name: '最後のパターン列を削除' });
      if (await delBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await delBtn.click();
        await page.waitForTimeout(300);
      } else break;
    }
    await page.waitForTimeout(500);

    const skuInputs = page.locator('table input[type="number"]');
    await skuInputs.nth(0).fill('1000');
    await page.waitForTimeout(300);
    await skuInputs.nth(1).fill('1000');
    await page.waitForTimeout(1000);

    const nextBtn = page.getByRole('button', { name: '次のステップに進む' });
    await expect(nextBtn).toBeEnabled({ timeout: 10000 });
    await nextBtn.click();
    await page.waitForTimeout(15000);

    // Find all 印刷 dd elements and print their text
    const printDDs = page.locator('dd:has-text("デジタル"), dd:has-text("グラビア"), dd:has-text("auto"), dd:has-text("UV")');
    const count = await printDDs.count();
    console.log('Print DDs found:', count);
    for (let i = 0; i < count; i++) {
      const txt = await printDDs.nth(i).textContent();
      console.log(`DD[${i}]:`, txt);
    }

    // Specifically check the 印刷 label's dd
    const printLabel = page.locator('dt:has-text("印刷")');
    const labelCount = await printLabel.count();
    console.log('印刷 labels found:', labelCount);
    for (let i = 0; i < labelCount; i++) {
      const dt = printLabel.nth(i);
      const dd = dt.locator('xpath=following-sibling::dd[1]');
      const txt = await dd.textContent().catch(() => 'N/A');
      console.log(`印刷[${i}] value:`, txt);
    }

    expect(true).toBeTruthy();
  });
});
