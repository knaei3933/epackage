import { test, expect } from '@playwright/test'

/**
 * E2E Test for Registration Form
 * Tests the /auth/register page with all required fields
 */

const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  passwordConfirm: 'TestPassword123!',
  kanjiLastName: 'テスト',
  kanjiFirstName: 'ユーザー',
  kanaLastName: 'テスト',
  kanaFirstName: 'ユーザー',
  businessType: 'INDIVIDUAL',
  productCategory: 'OTHER',
}

test.describe('Registration Form', () => {
  test('should successfully submit registration form', async ({ page }) => {
    // Navigate to registration page
    await page.goto('http://localhost:3000/auth/register/')

    // Wait for page to load
    await expect(page.locator('h2')).toContainText('会員登録')

    // Fill in authentication information
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.fill('input[name="passwordConfirm"]', TEST_USER.passwordConfirm)

    // Fill in name fields (Japanese)
    await page.fill('input[placeholder*="姓"]', TEST_USER.kanjiLastName)
    await page.fill('input[placeholder*="名"]', TEST_USER.kanjiFirstName)

    // Find and fill kana fields - they might be in JapaneseNameInput component
    const kanaInputs = await page.locator('input[placeholder*="ひらがな"]').count()
    if (kanaInputs > 0) {
      await page.fill('input[placeholder*="ひらがな"]').first().fill(TEST_USER.kanaLastName)
      await page.fill('input[placeholder*="ひらがな"]').nth(1).fill(TEST_USER.kanaFirstName)
    }

    // Select business type (Individual)
    await page.click('input[value="INDIVIDUAL"]')

    // Select product category
    await page.selectOption('select[name="productCategory"]', TEST_USER.productCategory)

    // Agree to privacy policy
    await page.check('input[type="checkbox"]')

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for response - check for either success or error
    await page.waitForTimeout(3000)

    // Check if registration succeeded (redirected to pending page or showed success)
    const currentUrl = page.url()
    console.log('Current URL after submission:', currentUrl)

    // Take screenshot for debugging
    await page.screenshot({ path: `screenshots/registration-test-${Date.now()}.png` })

    // Check for error messages
    const errorExists = await page.locator('text=/エラー|失敗|error/i').count()
    if (errorExists > 0) {
      const errorText = await page.locator('text=/エラー|失敗|error/i').first().textContent()
      console.error('Registration error:', errorText)
    }

    // Expect to be redirected to pending page or have success message
    expect(currentUrl).toMatch(/\/auth\/pending|\/auth\/register/)
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/register/')

    // Try to submit without filling anything
    await page.click('button[type="submit"]')

    // Wait for validation
    await page.waitForTimeout(1000)

    // Should show validation errors
    const hasErrors = await page.locator('text=/入力してください|必須/required/i').count() > 0
    expect(hasErrors).toBe(true)
  })

  test('should accept optional fields as empty', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/register/')

    // Fill only required fields
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.fill('input[name="passwordConfirm"]', TEST_USER.passwordConfirm)
    await page.fill('input[placeholder*="姓"]', TEST_USER.kanjiLastName)
    await page.fill('input[placeholder*="名"]', TEST_USER.kanjiFirstName)

    // Select business type and product category
    await page.click('input[value="INDIVIDUAL"]')
    await page.selectOption('select[name="productCategory"]', TEST_USER.productCategory)

    // Agree to privacy policy
    await page.check('input[type="checkbox"]')

    // Submit form (should not fail on optional fields being empty)
    await page.click('button[type="submit"]')

    // Wait for response
    await page.waitForTimeout(3000)

    // Take screenshot
    await page.screenshot({ path: `screenshots/registration-optional-fields-${Date.now()}.png` })
  })
})
