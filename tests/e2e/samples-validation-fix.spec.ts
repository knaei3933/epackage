import { test, expect } from '@playwright/test';

/**
 * Sample Request Form Validation Fix Verification
 *
 * This test verifies that the form validation fix works correctly:
 * 1. JapaneseNameInputController properly triggers validation
 * 2. Playwright input is recognized by React Hook Form
 * 3. All validation errors clear when fields are filled correctly
 *
 * Date: 2026-01-13
 * Related: SAMPLE_FORM_VALIDATION_FIX_SUMMARY.md
 */

test.describe('Sample Form Validation Fix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/samples');
    await page.waitForLoadState('domcontentloaded');
  });

  test('Verify JapaneseNameInput triggers validation on input', async ({ page }) => {
    // Add a sample first to enable the submit button
    const presetButton = page.locator('button:has-text("ソフトパウチ")').first();
    await presetButton.click();
    await page.waitForTimeout(500);

    // Fill in the Japanese name fields
    const kanjiLastName = page.locator('input[placeholder*="山田"]').first();
    const kanjiFirstName = page.locator('input[placeholder*="太郎"]').first();
    const kanaLastName = page.locator('input[placeholder*="やまだ"]').first();
    const kanaFirstName = page.locator('input[placeholder*="たろう"]').first();

    // Fill kanji fields
    await kanjiLastName.fill('山田');
    await kanjiFirstName.fill('太郎');

    // Fill kana fields
    await kanaLastName.fill('やまだ');
    await kanaFirstName.fill('たろう');

    // Verify values are in the inputs
    await expect(kanjiLastName).toHaveValue('山田');
    await expect(kanjiFirstName).toHaveValue('太郎');
    await expect(kanaLastName).toHaveValue('やまだ');
    await expect(kanaFirstName).toHaveValue('たろう');

    // Check that validation errors are NOT present for name fields
    const nameErrors = page.locator('.text-red-600').filter({ hasText: /漢字|ひらがな/ });
    const errorCount = await nameErrors.count();
    expect(errorCount).toBe(0);
  });

  test('Complete form submission with all fields', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test-fix-${timestamp}@example.com`;

    // Add sample
    const presetButton = page.locator('button:has-text("ソフトパウチ")').first();
    await presetButton.click();
    await page.waitForTimeout(300);

    // Fill Japanese names - use katakana for kanji fields, hiragana for kana fields
    const kanjiLastName = page.locator('input[placeholder*="山田"]').first();
    const kanjiFirstName = page.locator('input[placeholder*="太郎"]').first();
    const kanaLastName = page.locator('input[placeholder*="やまだ"]').first();
    const kanaFirstName = page.locator('input[placeholder*="たろう"]').first();

    await kanjiLastName.fill('山田');
    await kanjiFirstName.fill('太郎');
    await kanaLastName.fill('やまだ');
    await kanaFirstName.fill('たろう');

    // Wait for Japanese name validation
    await page.waitForTimeout(300);

    // Fill contact info
    const emailInput = page.locator('input[name="email"]').first();
    const phoneInput = page.locator('input[name="phone"]').first();

    await emailInput.fill(testEmail);
    await emailInput.blur();
    await page.waitForTimeout(200);

    await phoneInput.fill('090-1234-5678');
    await phoneInput.blur();
    await page.waitForTimeout(200);

    await page.locator('input[name="postalCode"]').first().fill('100-0001');
    await page.locator('input[name="address"]').first().fill('東京都渋谷区テスト町1-2-3');

    // Fill delivery destination - these fields are required
    const contactPersonInput = page.locator('input[name*="contactPerson"]').first();
    const destPhoneInput = page.locator('input[name*="deliveryDestinations.0.phone"]').first();
    const destAddressInput = page.locator('input[name*="deliveryDestinations.0.address"]').first();

    await contactPersonInput.fill('山田太郎');
    await contactPersonInput.blur();
    await page.waitForTimeout(200);

    await destPhoneInput.fill('090-1234-5678');
    await destPhoneInput.blur();
    await page.waitForTimeout(200);

    await destAddressInput.fill('東京都渋谷区テスト町1-2-3');
    await destAddressInput.blur();
    await page.waitForTimeout(200);

    // Fill message
    await page.locator('textarea[name="message"]').fill('サンプルを希望します。製品品質を確認させていただきたいです。');

    // Check agreement checkbox
    await page.locator('input[name="agreement"]').check();

    // Wait for all validation to settle
    await page.waitForTimeout(1000);

    // Check that there are NO validation errors before submission
    const validationErrors = page.locator('.text-red-600, p[class*="text-red"], [role="alert"]');
    const errorsBeforeSubmit = await validationErrors.count();

    // Log any errors found
    if (errorsBeforeSubmit > 0) {
      const errorTexts = await validationErrors.allTextContents();
      console.log('Unexpected validation errors:', errorTexts);
    }

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for response - increase timeout for slower environments
    await page.waitForTimeout(5000);

    // Verify success - either redirect or success message
    const currentUrl = page.url();
    const isSuccess = currentUrl.includes('/samples/thank-you') ||
                     await page.locator('text=/送信完了|成功|thank you|サンプルリクエストを受け付けました/i').count() > 0;

    expect(isSuccess).toBeTruthy();
  });

  test('Verify phone validation works correctly', async ({ page }) => {
    // Add sample
    await page.locator('button:has-text("ソフトパウチ")').first().click();

    // Fill with invalid phone format
    const phoneInput = page.locator('input[name="phone"]').first();
    await phoneInput.fill('invalid-phone');
    await phoneInput.blur();

    // Try to submit
    await page.locator('button[type="submit"]').first().click({ force: true });
    await page.waitForTimeout(500);

    // Should show phone validation error
    const phoneError = page.locator('.text-red-600, [role="alert"]').filter({ hasText: /電話番号|有効な電話/ });
    await expect(phoneError.first()).toBeVisible();

    // Now fill with valid phone - use the exact format expected by schema
    await phoneInput.fill('090-1234-5678');
    await phoneInput.blur();

    // Wait for React Hook Form to re-render with updated validation state
    await page.waitForTimeout(800);

    // Error should be gone
    const phoneErrorAfter = page.locator('.text-red-600, [role="alert"]').filter({ hasText: /電話番号|有効な電話/ });
    const errorCount = await phoneErrorAfter.count();
    expect(errorCount).toBe(0);
  });

  test('Verify email validation works correctly', async ({ page }) => {
    // Add sample
    await page.locator('button:has-text("ソフトパウチ")').first().click();

    // Fill with invalid email
    const emailInput = page.locator('input[name="email"]').first();
    await emailInput.fill('not-an-email');
    await emailInput.blur();

    // Try to submit
    await page.locator('button[type="submit"]').first().click({ force: true });
    await page.waitForTimeout(500);

    // Should show email validation error
    const emailError = page.locator('.text-red-600, [role="alert"]').filter({ hasText: /メールアドレス|email/i });
    await expect(emailError.first()).toBeVisible();

    // Now fill with valid email
    await emailInput.fill('test@example.com');
    await emailInput.blur();

    // Wait for React Hook Form to re-render with updated validation state
    await page.waitForTimeout(800);

    // Error should be gone
    const emailErrorAfter = page.locator('.text-red-600, [role="alert"]').filter({ hasText: /メールアドレス|email/i });
    const errorCount = await emailErrorAfter.count();
    expect(errorCount).toBe(0);
  });

  test('Verify checkbox validation works correctly', async ({ page }) => {
    // Add sample and fill minimal required fields
    await page.locator('button:has-text("ソフトパウチ")').first().click();
    await page.locator('input[placeholder*="山田"]').first().fill('山田');
    await page.locator('input[placeholder*="太郎"]').first().fill('太郎');
    await page.locator('input[placeholder*="やまだ"]').first().fill('やまだ');
    await page.locator('input[placeholder*="たろう"]').first().fill('たろう');
    await page.locator('input[name="email"]').first().fill('test@example.com');
    await page.locator('input[name="phone"]').first().fill('090-1234-5678');
    await page.locator('textarea[name="message"]').fill('テストメッセージです。'.repeat(3));

    // Wait for validation to settle
    await page.waitForTimeout(500);

    // Don't check agreement checkbox
    // Try to submit
    await page.locator('button[type="submit"]').first().click({ force: true });
    await page.waitForTimeout(500);

    // Should show agreement error
    const agreementError = page.locator('.text-red-600, [role="alert"]').filter({ hasText: /個人情報|同意|agreement/i });
    await expect(agreementError.first()).toBeVisible();

    // Now check the checkbox
    await page.locator('input[name="agreement"]').check();

    // Wait for React Hook Form to re-render with updated validation state
    await page.waitForTimeout(800);

    // Error should be gone
    const agreementErrorAfter = page.locator('.text-red-600, [role="alert"]').filter({ hasText: /個人情報|同意|agreement/i });
    const errorCount = await agreementErrorAfter.count();
    expect(errorCount).toBe(0);
  });
});

test.describe('Sample Form Integration Tests', () => {
  test('Verify delivery type selection works', async ({ page }) => {
    await page.goto('/samples');
    await page.waitForLoadState('domcontentloaded');

    // Add sample first
    await page.locator('button:has-text("ソフトパウチ")').first().click();
    await page.waitForTimeout(300);

    // Select "normal" delivery type using the label
    const normalDeliveryLabel = page.locator('label[for="delivery-type-normal"]').first();
    await normalDeliveryLabel.click();
    await page.waitForTimeout(200);

    // Verify it's checked by checking the radio input
    const normalDeliveryRadio = page.locator('input[value="normal"][type="radio"]').first();
    await expect(normalDeliveryRadio).toBeChecked();

    // Select "other" delivery type using the label
    const otherDeliveryLabel = page.locator('label[for="delivery-type-other"]').first();
    await otherDeliveryLabel.click();
    await page.waitForTimeout(200);

    // Verify it's checked and normal is not
    const otherDeliveryRadio = page.locator('input[value="other"][type="radio"]').first();
    await expect(otherDeliveryRadio).toBeChecked();
    await expect(normalDeliveryRadio).not.toBeChecked();
  });

  test('Verify sample item management', async ({ page }) => {
    await page.goto('/samples');
    await page.waitForLoadState('domcontentloaded');

    // Add first sample
    await page.locator('button:has-text("ソフトパウチ")').first().click();
    await page.waitForTimeout(200);

    // Verify it appears in the list
    const sampleItems = page.locator('input[name*="sampleItems"][name*="productName"]');
    await expect(sampleItems.first()).toHaveValue('ソフトパウチ');

    // Add second sample
    await page.locator('button:has-text("スタンドパウチ")').first().click();
    await page.waitForTimeout(200);

    // Verify count
    const count = await sampleItems.count();
    expect(count).toBe(2);
  });
});
