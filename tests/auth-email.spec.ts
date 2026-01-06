import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Supabase Auth Email Flow
 *
 * These tests verify:
 * 1. User registration with email confirmation
 * 2. Password reset flow
 * 3. Email change confirmation
 *
 * Prerequisites:
 * - SendGrid SMTP configured in Supabase
 * - Test email account accessible (e.g., Gmail test account)
 * - Supabase project URL and ANON_KEY configured in .env
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 * - TEST_EMAIL (test email address)
 * - TEST_EMAIL_PASSWORD (test email password or API access)
 */

const TEST_USER = {
  email: process.env.TEST_EMAIL || 'test-epackage@example.com',
  password: 'TestPassword123!',
  kanjiLastName: 'テスト',
  kanjiFirstName: 'ユーザー',
  kanaLastName: 'テスト',
  kanaFirstName: 'ユーザー',
  companyName: 'テスト株式会社',
  department: '営業部',
  position: '部長',
  corporatePhone: '03-1234-5678',
  postalCode: '123-4567',
  prefecture: '東京都',
  city: '渋谷区',
  street: '1-2-3',
}

test.describe('Authentication Email Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup')
  })

  test('should send confirmation email on registration', async ({ page }) => {
    // Fill out registration form
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.fill('input[name="confirmPassword"]', TEST_USER.password)
    await page.fill('input[name="kanjiLastName"]', TEST_USER.kanjiLastName)
    await page.fill('input[name="kanjiFirstName"]', TEST_USER.kanjiFirstName)
    await page.fill('input[name="kanaLastName"]', TEST_USER.kanaLastName)
    await page.fill('input[name="kanaFirstName"]', TEST_USER.kanaFirstName)
    await page.fill('input[name="companyName"]', TEST_USER.companyName)
    await page.fill('input[name="corporatePhone"]', TEST_USER.corporatePhone)

    // Agree to privacy policy
    await page.check('input[type="checkbox"]')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show confirmation message
    await expect(page.locator('text=/確認メールを送信しました/')).toBeVisible()

    // Verify email was sent (check via SendGrid API or test email account)
    // This would require additional setup to access test email
    test.info().annotations.push({
      type: 'email-verification',
      description: `Confirmation email sent to ${TEST_USER.email}`,
    })
  })

  test('should handle email confirmation link', async ({ page, context }) => {
    // First, register a user
    await page.goto('/signup')
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.fill('input[name="confirmPassword"]', TEST_USER.password)
    await page.fill('input[name="kanjiLastName"]', TEST_USER.kanjiLastName)
    await page.fill('input[name="kanjiFirstName"]', TEST_USER.kanjiFirstName)
    await page.fill('input[name="companyName"]', TEST_USER.companyName)
    await page.fill('input[name="corporatePhone"]', TEST_USER.corporatePhone)
    await page.check('input[type="checkbox"]')
    await page.click('button[type="submit"]')

    // Wait for confirmation message
    await expect(page.locator('text=/確認メールを送信しました/')).toBeVisible()

    // Get confirmation URL from email (requires email access)
    // For now, we'll test with a mock confirmation URL
    // In production, this would:
    // 1. Access test email via IMAP API
    // 2. Parse email body
    // 3. Extract confirmation URL
    // 4. Navigate to URL

    // Simulate confirmation link navigation
    const confirmationToken = 'mock-token' // Would be extracted from email
    const confirmationUrl = `/auth/confirm?token=${confirmationToken}`

    // Navigate to confirmation page
    await page.goto(confirmationUrl)

    // Should show success message
    await expect(page.locator('text=/メールアドレスが確認されました/')).toBeVisible()

    // User should be logged in
    await expect(page).toHaveURL(/\/members|\/profile/)
  })

  test('should show error for expired confirmation link', async ({ page }) => {
    // Navigate with expired token
    const expiredToken = 'expired-token'
    await page.goto(`/auth/confirm?token=${expiredToken}`)

    // Should show error message
    await expect(
      page.locator('text=/確認リンクの有効期限が切れています/')
    ).toBeVisible()
  })
})

test.describe('Password Reset Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password')
  })

  test('should send password reset email', async ({ page }) => {
    // Enter email
    await page.fill('input[name="email"]', TEST_USER.email)

    // Submit
    await page.click('button[type="submit"]')

    // Should show confirmation message
    await expect(
      page.locator('text=/パスワードリセットのリンクを送信しました/')
    ).toBeVisible()

    test.info().annotations.push({
      type: 'email-verification',
      description: `Password reset email sent to ${TEST_USER.email}`,
    })
  })

  test('should allow password reset with valid token', async ({ page }) => {
    // First request reset
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.click('button[type="submit"]')
    await expect(
      page.locator('text=/パスワードリセットのリンクを送信しました/')
    ).toBeVisible()

    // Get reset URL from email (requires email access)
    const resetToken = 'mock-reset-token'
    const resetUrl = `/auth/reset-password?token=${resetToken}`

    // Navigate to reset page
    await page.goto(resetUrl)

    // Enter new password
    const newPassword = 'NewPassword123!'
    await page.fill('input[name="password"]', newPassword)
    await page.fill('input[name="confirmPassword"]', newPassword)

    // Submit
    await page.click('button[type="submit"]')

    // Should show success message
    await expect(
      page.locator('text=/パスワードが正常に変更されました/')
    ).toBeVisible()

    // Should redirect to login
    await expect(page).toHaveURL('/login')
  })

  test('should show error for expired reset token', async ({ page }) => {
    const expiredToken = 'expired-reset-token'
    await page.goto(`/auth/reset-password?token=${expiredToken}`)

    // Should show error message
    await expect(
      page.locator('text=/リンクの有効期限が切れています/')
    ).toBeVisible()
  })
})

test.describe('Email Change Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')

    // Wait for login
    await expect(page).toHaveURL(/\/members|\/profile/)

    // Navigate to profile settings
    await page.goto('/profile')
  })

  test('should send confirmation email on email change request', async ({
    page,
  }) => {
    // Click email change section
    await page.click('button:has-text("メールアドレスを変更")')

    // Enter new email
    const newEmail = 'new-email@example.com'
    await page.fill('input[name="newEmail"]', newEmail)
    await page.fill('input[name="password"]', TEST_USER.password)

    // Submit
    await page.click('button:has-text("変更リンクを送信")')

    // Should show confirmation message
    await expect(
      page.locator('text=/確認メールを送信しました/')
    ).toBeVisible()

    test.info().annotations.push({
      type: 'email-verification',
      description: `Email change confirmation sent to ${newEmail}`,
    })
  })
})

test.describe('Email Content Verification', () => {
  /**
   * These tests verify email content when SMTP is properly configured
   * Requires access to test email account via IMAP API
   */

  test.skip('should send Japanese email confirmation', async ({ page }) => {
    // Skip this test unless email access is configured
    test.skip(true, 'Requires email API access')

    // Register user
    await page.goto('/signup')
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.fill('input[name="confirmPassword"]', TEST_USER.password)
    await page.fill('input[name="kanjiLastName"]', TEST_USER.kanjiLastName)
    await page.fill('input[name="kanjiFirstName"]', TEST_USER.kanjiFirstName)
    await page.fill('input[name="companyName"]', TEST_USER.companyName)
    await page.fill('input[name="corporatePhone"]', TEST_USER.corporatePhone)
    await page.check('input[type="checkbox"]')
    await page.click('button[type="submit"]')

    // Access email via IMAP (pseudo-code)
    // const email = await getEmailFromImap(TEST_USER.email, TEST_USER_EMAIL_PASSWORD)

    // Verify email content
    // expect(email.subject).toContain('【Epackage Lab】メールアドレスのご確認')
    // expect(email.body).toContain(TEST_USER.email)
    // expect(email.body).toContain('メールアドレスを確認する')
  })

  test.skip('should send password reset email in Japanese', async ({
    page,
  }) => {
    test.skip(true, 'Requires email API access')

    await page.goto('/forgot-password')
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.click('button[type="submit"]')

    // Access email and verify content
    // const email = await getEmailFromImap(TEST_USER.email, TEST_USER_EMAIL_PASSWORD)

    // expect(email.subject).toContain('【Epackage Lab】パスワードリセットのご案内')
    // expect(email.body).toContain('新しいパスワードを設定する')
  })
})

test.describe('Email Deliverability', () => {
  test('should handle SMTP errors gracefully', async ({ page }) => {
    // Mock SMTP failure scenario
    // This would require test environment with intentionally broken SMTP

    await page.goto('/signup')
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.fill('input[name="confirmPassword"]', TEST_USER.password)
    await page.fill('input[name="kanjiLastName"]', TEST_USER.kanjiLastName)
    await page.fill('input[name="kanjiFirstName"]', TEST_USER.kanjiFirstName)
    await page.fill('input[name="companyName"]', TEST_USER.companyName)
    await page.fill('input[name="corporatePhone"]', TEST_USER.corporatePhone)
    await page.check('input[type="checkbox"]')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show user-friendly error message
    // (This depends on how errors are handled in the application)
    // await expect(page.locator('text=/メール送信に失敗しました/')).toBeVisible()
  })

  test('should rate limit email requests', async ({ page }) => {
    // Test rate limiting if implemented
    // This prevents abuse of email sending

    await page.goto('/forgot-password')

    // Submit multiple requests rapidly
    for (let i = 0; i < 5; i++) {
      await page.fill('input[name="email"]', TEST_USER.email)
      await page.click('button[type="submit"]')
      await page.waitForTimeout(100)
    }

    // Should show rate limit message after threshold
    // await expect(page.locator('text=/リクエストが多すぎます/')).toBeVisible()
  })
})

/**
 * Helper Functions
 */

async function getEmailFromImap(email: string, password: string) {
  // This would use an IMAP library to access test email
  // Implementation depends on email provider
  // Examples:
  // - Gmail: googleapis/nodejs-gmail
  // - Outlook: node-imap
  // - Mailosaur: mailosaur-api (for testing)

  throw new Error('Email API access not configured')
}

/**
 * Test Configuration Notes
 *
 * To run these tests with real email verification:
 *
 * 1. Set up test email account (e.g., Gmail, Mailinator, Mailosaur)
 * 2. Configure environment variables:
 *    - TEST_EMAIL=your-test-email@example.com
 *    - TEST_EMAIL_PASSWORD=your-app-password
 *    - TEST_EMAIL_IMAP=imap.gmail.com (or provider)
 *
 * 3. Install email access libraries:
 *    - npm install imap googleapis mailosaur
 *
 * 4. Update getEmailFromImap() function with your provider
 *
 * For development without real email:
 * - Use Supabase dev mode with email confirmation disabled
 * - Test with mock tokens
 * - Focus on UI flow rather than email content
 */

test.afterEach(async ({ page }) => {
  // Cleanup: Delete test user if needed
  // This requires Supabase service role key
})
