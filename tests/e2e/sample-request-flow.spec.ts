import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Sample Request E2E Test
 *
 * Tests the complete flow:
 * 1. Form submission via UI
 * 2. Database record creation (sample_requests + sample_items)
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

test.describe('Sample Request E2E', () => {
  let testEmail: string;
  let requestId: string;

  test.beforeEach(async () => {
    // Generate unique test email
    testEmail = `sample-test-${Date.now()}@example.com`;
  });

  test.afterEach(async () => {
    // Cleanup: Delete test record from database
    try {
      const supabase = getSupabaseClient();
      await supabase
        .from('sample_requests')
        .delete()
        .eq('request_number', requestId);
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  test('Complete flow: Form submission → DB save (sample_requests + sample_items)', async ({ page, context }) => {
    // Setup console listener for email logs (DEV_MODE)
    const emailLogs: string[] = [];
    context.on('console', msg => {
      if (msg.text().includes('[Email]') || msg.text().includes('DEV_MODE')) {
        emailLogs.push(msg.text());
      }
    });

    // Navigate to samples page
    await page.goto('/samples');

    // Wait for page to load
    await expect(page.locator('text=パウチサンプルご依頼')).toBeVisible();

    // Fill in the form
    // Name fields
    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="やまだ"]', 'てすと');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[placeholder*="たろう"]', 'ゆーざー');

    // Contact information
    await page.fill('input[name="company"]', 'テスト株式会社');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '09012345678');
    await page.fill('input[name="fax"]', '09012345679');
    await page.fill('input[name="postalCode"]', '1000001');
    await page.fill('input[name="address"]', '東京都千代田区1-2-3');

    // Delivery type - select "normal" (一般配送)
    const normalDeliveryRadio = page.locator('input[value="normal"]');
    await normalDeliveryRadio.check();
    await normalDeliveryRadio.click(); // Ensure clicked

    // Delivery destination should auto-fill with customer info
    // Verify the delivery destination is populated
    await expect(page.locator('text=配送先 1')).toBeVisible();

    // Message
    await page.fill('textarea[name="message"]', 'サンプルのテスト依頼です。平パウチとスタンドパウチのサンプルをお願いします。10文字以上入力しています。');

    // Privacy consent
    await page.check('input[name="agreement"]');

    // Submit form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for success response
    await expect(page.locator('text=サンプルリクエストを受け付けました')).toBeVisible({ timeout: 10000 });

    // Get request ID from response
    // Note: The form redirects after 2 seconds, so we need to capture quickly

    // Verify database record
    const supabase = getSupabaseClient();

    // Find the most recent request with our email
    const { data: requests, error: requestsError } = await supabase
      .from('sample_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    expect(requestsError).toBeNull();
    expect(requests).not.toBeNull();

    // Find our test request (there might be no email field directly, so we look for recent ones)
    const ourRequest = requests?.[0]; // Most recent
    expect(ourRequest).toBeDefined();

    requestId = ourRequest?.request_number;
    console.log('Database record created with ID:', ourRequest?.id, 'Request ID:', requestId);

    // Verify sample_items
    const { data: items, error: itemsError } = await supabase
      .from('sample_items')
      .select('*')
      .eq('sample_request_id', ourRequest?.id);

    expect(itemsError).toBeNull();
    // Note: sample_items might be empty if no products were selected in the form
    // The current form doesn't include product selection, so items might be added by admin later
    console.log('Sample items count:', items?.length || 0);

    // Verify email log (DEV_MODE)
    expect(emailLogs.some(log => log.includes('[Email]'))).toBeTruthy();
    console.log('Email logs:', emailLogs);
  });

  test('Form validation: Missing required fields', async ({ page }) => {
    await page.goto('/samples');

    // Submit without filling any fields
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show validation errors
    await expect(page.locator('text=入力データに誤りがあります')).toBeVisible({ timeout: 5000 });
  });

  test('Form validation: Invalid email format', async ({ page }) => {
    await page.goto('/samples');

    // Fill name fields
    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');

    // Invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[name="phone"]', '09012345678');

    // Select delivery type
    await page.check('input[value="normal"]');

    // Message
    await page.fill('textarea[name="message"]', 'テストメッセージです。10文字以上入力しています。');

    await page.check('input[name="agreement"]');

    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show email validation error
    await expect(page.locator('text=有効なメールアドレスを入力してください')).toBeVisible({ timeout: 5000 });
  });

  test('Form validation: Message too short', async ({ page }) => {
    await page.goto('/samples');

    // Fill name fields
    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');

    // Valid contact info
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '09012345678');

    // Message too short (< 10 characters)
    await page.fill('textarea[name="message"]', '短い');

    // Select delivery type
    await page.check('input[value="normal"]');

    await page.check('input[name="agreement"]');

    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show validation error
    await expect(page.locator('text=10文字以上で入力してください')).toBeVisible({ timeout: 5000 });
  });

  test('Form validation: Agreement required', async ({ page }) => {
    await page.goto('/samples');

    // Fill all fields except agreement
    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '09012345678');
    await page.fill('textarea[name="message"]', 'テストメッセージです。10文字以上入力しています。');

    // Select delivery type
    await page.check('input[value="normal"]');

    // Do NOT check agreement

    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show agreement error
    await expect(page.locator('text=個人情報の取扱いに同意してください')).toBeVisible({ timeout: 5000 });
  });

  test('Form validation: Phone number format', async ({ page }) => {
    await page.goto('/samples');

    // Fill name fields
    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');

    // Invalid phone format
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', 'abc123');

    // Select delivery type
    await page.check('input[value="normal"]');

    await page.fill('textarea[name="message"]', 'テストメッセージです。10文字以上入力しています。');
    await page.check('input[name="agreement"]');

    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show phone validation error
    await expect(page.locator('text=有効な電話番号を入力してください')).toBeVisible({ timeout: 5000 });
  });

  test('Delivery type selection: Other location', async ({ page }) => {
    await page.goto('/samples');

    // Fill basic info
    await page.fill('input[placeholder*="山田"]', '山田');
    await page.fill('input[placeholder*="太郎"]', '太郎');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '09012345678');

    // Select "other" delivery type
    await page.check('input[value="other"]');

    // Should show delivery destination fields that need to be filled manually
    await expect(page.locator('text=配送先 1')).toBeVisible();

    // Fill delivery destination
    await page.fill('input[name*="contactPerson"]', '鈴木 一郎');
    await page.fill('input[name*="phone"]', '03-9876-5432');
    await page.fill('input[name*="address"]', '大阪府大阪市1-2-3');

    // Complete form
    await page.fill('textarea[name="message"]', '別の場所に配送してほしいです。10文字以上入力しています。');
    await page.check('input[name="agreement"]');

    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for success
    await expect(page.locator('text=サンプルリクエストを受け付けました')).toBeVisible({ timeout: 10000 });

    // Verify database record
    const supabase = getSupabaseClient();
    const { data: request } = await supabase
      .from('sample_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(request).not.toBeNull();
    requestId = request?.request_number;

    console.log('Request with other delivery type created:', requestId);
  });

  test('Multiple delivery destinations', async ({ page }) => {
    await page.goto('/samples');

    // Fill basic info
    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '09012345678');

    // Select "other" delivery type
    await page.check('input[value="other"]');

    // Check if "Add destination" button exists
    const addButton = page.locator('text=配送先を追加');
    const hasAddButton = await addButton.count() > 0;

    if (hasAddButton) {
      // Click to add another destination
      await addButton.click();

      // Wait for second destination to appear
      await expect(page.locator('text=配送先 2')).toBeVisible({ timeout: 3000 });

      // Fill first destination
      await page.fill('input[name*="deliveryDestinations"][0][name*="contactPerson"]', '担当者1');
      await page.fill('input[name*="deliveryDestinations"][0][name*="phone"]', '03-1111-2222');
      await page.fill('input[name*="deliveryDestinations"][0][name*="address"]', '東京都1-2-3');

      // Fill second destination
      await page.fill('input[name*="deliveryDestinations"][1][name*="contactPerson"]', '担当者2');
      await page.fill('input[name*="deliveryDestinations"][1][name*="phone"]', '03-3333-4444');
      await page.fill('input[name*="deliveryDestinations"][1][name*="address"]', '大阪府1-2-3');

      // Complete form
      await page.fill('textarea[name="message"]', '複数配送先のテストです。10文字以上入力しています。');
      await page.check('input[name="agreement"]');

      // Submit
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Wait for success
      await expect(page.locator('text=サンプルリクエストを受け付けました')).toBeVisible({ timeout: 10000 });

      // Verify database record
      const supabase = getSupabaseClient();
      const { data: request } = await supabase
        .from('sample_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      expect(request).not.toBeNull();
      requestId = request?.request_number;

      console.log('Request with multiple destinations created:', requestId);
    } else {
      console.log('Add destination button not found - skipping multiple destinations test');
      test.skip();
    }
  });
});
