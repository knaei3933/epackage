import { test, expect } from '@playwright/test'

/**
 * Manual Registration Test - Runs in visible browser
 * Watch the browser fill out the registration form automatically
 */

test.describe('Manual Registration Test', () => {
  test('fill and submit registration form', async ({ page }) => {
    // Navigate to registration page
    await page.goto('http://localhost:3000/auth/register/')

    // Wait for page to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    console.log('Page loaded, filling out form...')

    // Fill in authentication information
    await page.fill('input[name="email"]', `manual-test-${Date.now()}@example.com`)
    await page.fill('input[name="password"]', 'TestPassword123!')
    await page.fill('input[name="passwordConfirm"]', 'TestPassword123!')

    console.log('Filled auth info')

    // Fill in Japanese name fields using JapaneseNameInput component placeholders
    // Kanji fields
    await page.fill('input[placeholder="山田"]', '山田')
    await page.fill('input[placeholder="太郎"]', '太郎')

    console.log('Filled kanji names')

    // Kana (hiragana) fields
    await page.fill('input[placeholder="やまだ"]', 'やまだ')
    await page.fill('input[placeholder="たろう"]', 'たろう')

    console.log('Filled kana names')

    // Select business type - Individual (個人)
    await page.check('input[value="INDIVIDUAL"]')

    // Select product category
    await page.selectOption('select[name="productCategory"]', 'OTHER')

    // Agree to privacy policy
    await page.check('input[type="checkbox"]')

    console.log('Filled all required fields')

    // Wait a bit to see the filled form
    await page.waitForTimeout(2000)

    // Take screenshot before submit
    await page.screenshot({
      path: `screenshots/manual-registration-before-submit-${Date.now()}.png`,
      fullPage: true
    })

    // Submit form
    console.log('Submitting form...')
    await page.click('button[type="submit"]')

    // Wait for response
    await page.waitForTimeout(5000)

    // Check result
    const currentUrl = page.url()
    console.log('Current URL after submission:', currentUrl)

    // Take screenshot after submit
    await page.screenshot({
      path: `screenshots/manual-registration-after-submit-${Date.now()}.png`,
      fullPage: true
    })

    // Check for success or error messages
    const pageText = await page.textContent('body')
    console.log('Page contains success:', pageText?.includes('成功') || pageText?.includes('完了'))

    // Keep browser open for 5 seconds to see the result
    await page.waitForTimeout(5000)
  })
})
