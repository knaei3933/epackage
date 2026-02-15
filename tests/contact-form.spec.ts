import { test, expect } from '@playwright/test';

/**
 * Contact Form Tests
 * Tests the Japanese name input fields (Kanji/Kana)
 */

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
  });

  test('Contact page loads successfully', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('text=パウチ専門お問い合わせ')).toBeVisible();
  });

  test('Japanese name input fields are present', async ({ page }) => {
    // Check for surname (姓) fields
    await expect(page.locator('text=姓 / せい')).toBeVisible();
    await expect(page.locator('text=漢字 / 漢字')).toBeVisible();
    await expect(page.locator('text=ひらがな / ひらがな')).toBeVisible();

    // Check for given name (名) fields
    await expect(page.locator('text=名 / めい')).toBeVisible();
  });

  test('Can input Japanese characters in name fields', async ({ page }) => {
    // Find surname Kanji input
    const surnameKanjiInput = page.locator('input[placeholder*="山田"]').first();
    await surnameKanjiInput.fill('山田');

    // Find surname Kana input
    const surnameKanaInput = page.locator('input[placeholder*="やまだ"]').first();
    await surnameKanaInput.fill('やまだ');

    // Find given name Kanji input
    const givenNameKanjiInput = page.locator('input[placeholder*="太郎"]').first();
    await givenNameKanjiInput.fill('太郎');

    // Find given name Kana input
    const givenNameKanaInput = page.locator('input[placeholder*="たろう"]').first();
    await givenNameKanaInput.fill('たろう');

    // Verify values were entered
    await expect(surnameKanjiInput).toHaveValue('山田');
    await expect(surnameKanaInput).toHaveValue('やまだ');
  });

  test('Required fields show validation', async ({ page }) => {
    // Try to submit without filling required fields
    const submitButton = page.locator('button:has-text("送信"), button:has-text("パウチ専門家に相談する")').first();
    await submitButton.click();

    // Check for validation messages (email is required)
    await expect(page.locator('text=メールアドレスを入力してください')).toBeVisible();
  });

  test('Pouch type selection works', async ({ page }) => {
    // Check that pouch type options are visible
    await expect(page.locator('text=平袋')).toBeVisible();
    await expect(page.locator('text=スタンドパウチ')).toBeVisible();
    await expect(page.locator('text=BOX型パウチ')).toBeVisible();
  });

  test('Email and phone fields are present', async ({ page }) => {
    // Email field
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Phone field
    await expect(page.locator('text=電話番号')).toBeVisible();
  });
});

/**
 * Samples Form Tests
 */

test.describe('Samples Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/samples');
  });

  test('Samples page loads successfully', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('text=パウチ製品お問い合わせ')).toBeVisible();
  });

  test('Japanese name input fields are present on samples page', async ({ page }) => {
    // Check for surname (姓) fields
    await expect(page.locator('text=姓 / せい')).toBeVisible();
    await expect(page.locator('text=漢字 / 漢字')).toBeVisible();
    await expect(page.locator('text=ひらがな / ひらがな')).toBeVisible();

    // Check for given name (名) fields
    await expect(page.locator('text=名 / めい')).toBeVisible();
  });

  test('Privacy consent checkbox is present', async ({ page }) => {
    await expect(page.locator('text=個人情報保護方針')).toBeVisible();
  });

  test('Address field is required', async ({ page }) => {
    await expect(page.locator('text=住所 *')).toBeVisible();
  });
});
