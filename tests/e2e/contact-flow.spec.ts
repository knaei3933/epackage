import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Contact Form E2E Test
 *
 * Tests the complete flow:
 * 1. Form submission via UI
 * 2. Database record creation
 * 3. Email sending (DEV_MODE: console log)
 */

// Supabase client for DB verification
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

test.describe('Contact Form E2E', () => {
  let testEmail: string;
  let requestId: string;

  test.beforeEach(async () => {
    // Generate unique test email
    testEmail = `test-${Date.now()}@example.com`;
  });

  test.afterEach(async () => {
    // Cleanup: Delete test record from database
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('inquiries')
        .delete()
        .eq('email', testEmail);
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  test('Complete flow: Form submission → DB save → Email log', async ({ page, context }) => {
    // Setup console listener for email logs (DEV_MODE)
    const emailLogs: string[] = [];
    context.on('console', msg => {
      if (msg.text().includes('[Email]') || msg.text().includes('DEV_MODE')) {
        emailLogs.push(msg.text());
      }
    });

    // Navigate to contact page
    await page.goto('/contact');

    // Wait for page to load
    await expect(page.locator('text=パウチ専門お問い合わせ')).toBeVisible();

    // Fill in the form
    // Name fields
    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="やまだ"]', 'てすと');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[placeholder*="たろう"]', 'ゆーざー');

    // Contact information
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '09012345678');

    // Company (optional)
    await page.fill('input[name="company"]', 'テスト株式会社');

    // Inquiry details
    await page.selectOption('select[name="inquiryType"]', 'technical');

    // Subject and message
    await page.fill('input[name="subject"]', 'E2Eテスト: お問い合わせ');
    await page.fill('textarea[name="message"]', 'これはE2Eテストからのテストメッセージです。10文字以上入力していることを確認してください。');

    // Urgency
    await page.selectOption('select[name="urgency"]', 'normal');

    // Privacy consent (required)
    await page.check('input[name="privacyConsent"]');

    // Submit form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for success response
    await expect(page.locator('text=お問い合わせを受け付けました')).toBeVisible({ timeout: 10000 });

    // Get request ID from success message or response
    const successMessage = await page.locator('text=/お問い合わせを受け付けました/').textContent();
    console.log('Success message:', successMessage);

    // Verify database record
    const supabase = getSupabaseClient();
    const { data: inquiry, error } = await supabase
      .from('inquiries')
      .select('*')
      .eq('email', testEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(error).toBeNull();
    expect(inquiry).not.toBeNull();

    // Verify stored data
    expect(inquiry?.customer_name).toBe('テスト ユーザー');
    expect(inquiry?.customer_name_kana).toBe('てすと ゆーざー');
    expect(inquiry?.email).toBe(testEmail);
    expect(inquiry?.phone).toBe('09012345678');
    expect(inquiry?.company_name).toBe('テスト株式会社');
    expect(inquiry?.type).toBe('technical');
    expect(inquiry?.subject).toBe('E2Eテスト: お問い合わせ');
    expect(inquiry?.message).toContain('E2Eテスト');
    expect(inquiry?.urgency).toBe('normal');
    expect(inquiry?.privacy_consent).toBe(true);
    expect(inquiry?.status).toBe('pending');

    requestId = inquiry?.request_number || inquiry?.inquiry_number;
    console.log('Database record created with ID:', inquiry?.id, 'Request ID:', requestId);

    // Verify email log (DEV_MODE)
    expect(emailLogs.some(log => log.includes('[Email]'))).toBeTruthy();
    expect(emailLogs.some(log => log.includes('DEV_MODE'))).toBeTruthy();

    console.log('Email logs:', emailLogs);

    // Additional verification: Check for both customer and admin email logs
    const customerEmailLog = emailLogs.find(log => log.includes(testEmail));
    const adminEmailLog = emailLogs.find(log => log.includes('admin@epackage-lab.com'));

    expect(customerEmailLog).toBeDefined();
    expect(adminEmailLog).toBeDefined();
  });

  test('Form validation: Missing required fields', async ({ page }) => {
    await page.goto('/contact');

    // Submit without filling any fields
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show validation errors
    await expect(page.locator('text=入力データに誤りがあります')).toBeVisible({ timeout: 5000 });
  });

  test('Form validation: Invalid email format', async ({ page }) => {
    await page.goto('/contact');

    // Fill name fields
    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');

    // Invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[name="phone"]', '09012345678');
    await page.fill('input[name="subject"]', 'テスト');
    await page.fill('textarea[name="message"]', 'テストメッセージです。10文字以上入力しています。');
    await page.check('input[name="privacyConsent"]');

    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show email validation error
    await expect(page.locator('text=有効なメールアドレスを入力してください')).toBeVisible({ timeout: 5000 });
  });

  test('Form validation: Message too short', async ({ page }) => {
    await page.goto('/contact');

    // Fill name fields
    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');

    // Valid contact info
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '09012345678');

    // Message too short (< 10 characters)
    await page.fill('textarea[name="message"]', '短い');

    await page.check('input[name="privacyConsent"]');

    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show validation error
    await expect(page.locator('text=10文字以上で入力してください')).toBeVisible({ timeout: 5000 });
  });

  test('Form validation: Privacy consent required', async ({ page }) => {
    await page.goto('/contact');

    // Fill all fields except privacy consent
    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '09012345678');
    await page.fill('textarea[name="message"]', 'テストメッセージです。10文字以上入力しています。');

    // Do NOT check privacy consent

    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show privacy consent error
    await expect(page.locator('text=プライバシーポリシーに同意してください')).toBeVisible({ timeout: 5000 });
  });

  test('Database verification: All fields stored correctly', async ({ page }) => {
    // Fill with all optional fields
    await page.goto('/contact');

    await page.fill('input[placeholder*="山田"]', '山田');
    await page.fill('input[placeholder*="やまだ"]', 'やまだ');
    await page.fill('input[placeholder*="太郎"]', '太郎');
    await page.fill('input[placeholder*="たろう"]', 'たろう');

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '03-1234-5678');
    await page.fill('input[name="fax"]', '03-1234-5679');
    await page.fill('input[name="company"]', 'テスト株式会社');

    // Address fields
    await page.fill('input[name="postalCode"]', '1000001');
    await page.selectOption('select[name="prefecture"]', '東京都');
    await page.fill('input[name="city"]', '千代田区');
    await page.fill('input[name="street"]', '千代田1-1-1');

    await page.selectOption('select[name="inquiryType"]', 'sales');
    await page.fill('input[name="subject"]', '資料請求');
    await page.fill('textarea[name="message"]', '製品資料をお送りいただけますでしょうか。よろしくお願いいたします。');

    await page.selectOption('select[name="urgency"]', 'high');
    await page.selectOption('select[name="preferredContact"]', 'email');
    await page.check('input[name="privacyConsent"]');

    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for success
    await expect(page.locator('text=お問い合わせを受け付けました')).toBeVisible({ timeout: 10000 });

    // Verify all fields in database
    const supabase = getSupabaseClient();
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('*')
      .eq('email', testEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(inquiry).not.toBeNull();

    // Verify all fields
    expect(inquiry?.customer_name).toBe('山田 太郎');
    expect(inquiry?.customer_name_kana).toBe('やまだ たろう');
    expect(inquiry?.email).toBe(testEmail);
    expect(inquiry?.phone).toBe('03-1234-5678');
    expect(inquiry?.fax).toBe('03-1234-5679');
    expect(inquiry?.company_name).toBe('テスト株式会社');
    expect(inquiry?.postal_code).toBe('1000001');
    expect(inquiry?.prefecture).toBe('東京都');
    expect(inquiry?.city).toBe('千代田区');
    expect(inquiry?.street).toBe('千代田1-1-1');
    expect(inquiry?.type).toBe('sales');
    expect(inquiry?.subject).toBe('資料請求');
    expect(inquiry?.message).toContain('製品資料');
    expect(inquiry?.urgency).toBe('high');
    expect(inquiry?.preferred_contact).toBe('email');
    expect(inquiry?.privacy_consent).toBe(true);
  });
});
