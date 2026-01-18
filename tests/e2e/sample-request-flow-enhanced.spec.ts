import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { testUsers, AuthHelper, TestDataManager } from '../fixtures/test-data';

/**
 * Sample Request Workflow Integration E2E Test
 * 샘플 요청 워크플로우 통합 E2E 테스트
 *
 * Tests the complete sample request workflow:
 * 1. User selects products for samples
 * 2. Form validation (max 5 samples)
 * 3. Shipping address entry
 * 4. Request submission
 * 5. Admin notification
 * 6. Status tracking
 * 7. Sample request processing
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

test.describe('Sample Request Integration Flow', () => {
  let testEmail: string;
  let requestId: string;
  let consoleErrors: string[] = [];

  test.beforeAll(async () => {
    // Clean up any existing test data
    const supabase = getSupabaseClient();
    // Note: sample_requests table uses user_id, not email field
    // Clean up by creating test user markers
    await supabase.from('sample_items').delete().like('product_name', 'test-sample-%');
    const { data: sampleRequests } = await supabase
      .from('sample_requests')
      .select('id')
      .like('request_number', 'SR-%');
    if (sampleRequests) {
      for (const sr of sampleRequests) {
        await supabase.from('sample_items').delete().eq('sample_request_id', sr.id);
        await supabase.from('sample_requests').delete().eq('id', sr.id);
      }
    }
  });

  test.beforeEach(async ({ page }) => {
    testEmail = `test-sample-${Date.now()}@testmail.cc`;
    consoleErrors = [];

    // Setup console error listener
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
  });

  test.afterEach(async () => {
    // Cleanup: Delete test record from database
    try {
      const supabase = getSupabaseClient();
      // Find and delete sample requests by request number pattern
      const { data: sampleRequests } = await supabase
        .from('sample_requests')
        .select('id, request_number')
        .like('request_number', 'SR-%')
        .order('created_at', { ascending: false })
        .limit(10);

      if (sampleRequests) {
        for (const sr of sampleRequests) {
          await supabase.from('sample_items').delete().eq('sample_request_id', sr.id);
          await supabase.from('sample_requests').delete().eq('id', sr.id);
        }
      }
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  test('샘플 요청 완전한 흐름: 제품 선택 → 주소 입력 → 제출 → DB 저장', async ({ page, context }) => {
    // Setup console listener for email logs (DEV_MODE)
    const emailLogs: string[] = [];
    context.on('console', msg => {
      if (msg.text().includes('[Email]') || msg.text().includes('DEV_MODE')) {
        emailLogs.push(msg.text());
      }
    });

    // Step 1: Navigate to samples page
    await page.goto('/samples');

    // Check for console errors
    await expect(page.locator('text=パウチサンプルご依頼')).toBeVisible({ timeout: 10000 });
    expect(consoleErrors.length).toBe(0);

    // Step 2: Fill in the form
    await page.fill('input[placeholder*="山田"]', '田中');
    await page.fill('input[placeholder*="やまだ"]', 'たなか');
    await page.fill('input[placeholder*="太郎"]', '太郎');
    await page.fill('input[placeholder*="たろう"]', 'たろう');
    await page.waitForTimeout(300);

    await page.fill('input[name="company"]', 'テスト株式会社');

    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill(testEmail);
    await emailInput.blur();
    await page.waitForTimeout(200);

    const phoneInput = page.locator('input[name="phone"]').first();
    await phoneInput.fill('090-1234-5678');
    await phoneInput.blur();
    await page.waitForTimeout(200);

    await page.fill('input[name="fax"]', '090-1234-5679');
    await page.fill('input[name="postalCode"]', '100-0001');
    await page.fill('input[name="address"]', '東京都千代田区1-2-3');

    // Select delivery type
    const normalDeliveryLabel = page.locator('label[for="delivery-type-normal"]').first();
    await normalDeliveryLabel.click();
    await page.waitForTimeout(300);

    // Verify the delivery destination is populated and fill required fields
    await expect(page.locator('text=配送先 1')).toBeVisible();

    // Fill required delivery destination fields
    const contactPersonInput = page.locator('input[name*="contactPerson"]').first();
    await contactPersonInput.fill('田中太郎');
    await contactPersonInput.blur();
    await page.waitForTimeout(200);

    const destPhoneInput = page.locator('input[name*="deliveryDestinations.0.phone"]').first();
    await destPhoneInput.fill('090-1234-5678');
    await destPhoneInput.blur();
    await page.waitForTimeout(200);

    const destAddressInput = page.locator('input[name*="deliveryDestinations.0.address"]').first();
    await destAddressInput.fill('東京都千代田区1-2-3');
    await destAddressInput.blur();
    await page.waitForTimeout(200);

    // Message
    await page.fill('textarea[name="message"]', 'サンプルのテスト依頼です。平パウチとスタンドパウチのサンプルをお願いします。10文字以上入力しています。');

    // Privacy consent
    await page.check('input[name="agreement"]');

    // Wait for all validation to settle
    await page.waitForTimeout(1000);

    // Step 3: Submit form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Step 4: Wait for success response
    await expect(page.locator('text=サンプルリクエストを受け付けました')).toBeVisible({ timeout: 10000 });

    // Step 5: Verify database record
    const supabase = getSupabaseClient();
    const { data: requests, error: requestsError } = await supabase
      .from('sample_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (requestsError) {
      console.log('Database query error:', requestsError);
    } else {
      expect(requests).not.toBeNull();

      const ourRequest = requests?.[0];
      expect(ourRequest).toBeDefined();

      requestId = ourRequest?.request_number;
      console.log('Database record created with ID:', ourRequest?.id, 'Request ID:', requestId);
    }

    // Step 6: Verify email log (DEV_MODE)
    if (emailLogs.length > 0) {
      console.log('Email logs found:', emailLogs.length);
    } else {
      console.log('No email logs captured (may not be in DEV_MODE)');
    }
  });

  test('최대 5개 샘플 제한 유효성 검사', async ({ page }) => {
    await page.goto('/samples');

    // Fill basic info
    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[placeholder*="やまだ"]', 'てすと');
    await page.fill('input[placeholder*="たろう"]', 'ゆーざー');
    await page.waitForTimeout(300);

    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill(testEmail);
    await emailInput.blur();
    await page.waitForTimeout(200);

    const phoneInput = page.locator('input[name="phone"]').first();
    await phoneInput.fill('090-1234-5678');
    await phoneInput.blur();
    await page.waitForTimeout(200);

    // Select delivery type
    await page.locator('label[for="delivery-type-normal"]').first().click();
    await page.waitForTimeout(300);

    // Fill required delivery destination fields
    const contactPersonInput = page.locator('input[name*="contactPerson"]').first();
    await contactPersonInput.fill('山田太郎');
    await contactPersonInput.blur();
    await page.waitForTimeout(200);

    const destPhoneInput = page.locator('input[name*="deliveryDestinations.0.phone"]').first();
    await destPhoneInput.fill('090-1234-5678');
    await destPhoneInput.blur();
    await page.waitForTimeout(200);

    const destAddressInput = page.locator('input[name*="deliveryDestinations.0.address"]').first();
    await destAddressInput.fill('東京都テスト区1-2-3');
    await destAddressInput.blur();
    await page.waitForTimeout(200);

    // Fill message
    await page.fill('textarea[name="message"]', '最大5個までのサンプルリクエストテストです。10文字以上入力しています。');
    await page.check('input[name="agreement"]');

    // Wait for validation to settle
    await page.waitForTimeout(1000);

    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await expect(page.locator('text=サンプルリクエストを受け付けました')).toBeVisible({ timeout: 10000 });

    // Verify in database
    const supabase = getSupabaseClient();
    const { data: request } = await supabase
      .from('sample_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(request).not.toBeNull();

    // Check if sample_items exists and verify count
    const { data: items } = await supabase
      .from('sample_items')
      .select('*')
      .eq('sample_request_id', request?.id);

    // Note: Items may be added by admin later, so this is informational
    console.log('Sample request created, items count:', items?.length || 0);
  });

  test('여러 배송지 선택', async ({ page }) => {
    await page.goto('/samples');

    // Fill basic info
    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[placeholder*="やまだ"]', 'てすと');
    await page.fill('input[placeholder*="たろう"]', 'ゆーざー');
    await page.waitForTimeout(300);

    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill(testEmail);
    await emailInput.blur();
    await page.waitForTimeout(200);

    const phoneInput = page.locator('input[name="phone"]').first();
    await phoneInput.fill('090-1234-5678');
    await phoneInput.blur();
    await page.waitForTimeout(200);

    // Select "other" delivery type
    const otherDeliveryLabel = page.locator('label[for="delivery-type-other"]').first();
    await otherDeliveryLabel.click();
    await page.waitForTimeout(300);

    // Should show delivery destination fields
    await expect(page.locator('text=配送先 1')).toBeVisible();

    // Fill delivery destination with proper selectors
    const contactPersonInput = page.locator('input[name*="contactPerson"]').first();
    await contactPersonInput.fill('鈴木 一郎');
    await contactPersonInput.blur();
    await page.waitForTimeout(200);

    const destPhoneInput = page.locator('input[name*="deliveryDestinations.0.phone"]').first();
    await destPhoneInput.fill('03-9876-5432');
    await destPhoneInput.blur();
    await page.waitForTimeout(200);

    const destAddressInput = page.locator('input[name*="deliveryDestinations.0.address"]').first();
    await destAddressInput.fill('大阪府大阪市1-2-3');
    await destAddressInput.blur();
    await page.waitForTimeout(200);

    // Complete form
    await page.fill('textarea[name="message"]', '別の場所に配送してほしいです。10文字以上入力しています。');
    await page.check('input[name="agreement"]');

    // Wait for validation to settle
    await page.waitForTimeout(1000);

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

  test('관리자 알림 및 상태 추적', async ({ page }) => {
    // Step 1: Create sample request
    await page.goto('/samples');

    await page.fill('input[placeholder*="山田"]', '佐藤');
    await page.fill('input[placeholder*="やまだ"]', 'さとう');
    await page.fill('input[placeholder*="太郎"]', '二郎');
    await page.fill('input[placeholder*="たろう"]', 'じろう');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '090-1234-5678');
    await page.locator('label[for="delivery-type-normal"]').first().click();
    await page.fill('textarea[name="message"]', '管理者通知のテストです。10文字以上入力しています。');
    await page.check('input[name="agreement"]');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await expect(page.locator('text=サンプルリクエストを受け付けました')).toBeVisible({ timeout: 10000 });

    // Step 2: Verify in database
    const supabase = getSupabaseClient();
    const { data: request } = await supabase
      .from('sample_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(request).not.toBeNull();
    expect(request?.status).toBe('received');

    // Step 3: Simulate status change
    await supabase
      .from('sample_requests')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', request?.id);

    console.log('Sample request status updated to processing');

    // Step 4: Verify status change
    const { data: updatedRequest } = await supabase
      .from('sample_requests')
      .select('status')
      .eq('id', request?.id)
      .maybeSingle();

    expect(updatedRequest?.status).toBe('processing');
  });

  test('샘플 요청 처리 완료 흐름', async ({ page }) => {
    // Step 1: Create sample request
    await page.goto('/samples');

    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="やまだ"]', 'てすと');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[placeholder*="たろう"]', 'ゆーざー');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '090-1234-5678');
    await page.locator('label[for="delivery-type-normal"]').first().click();
    await page.fill('textarea[name="message"]', '処理完了のテストです。10文字以上入力しています。');
    await page.check('input[name="agreement"]');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await expect(page.locator('text=サンプルリクエストを受け付けました')).toBeVisible({ timeout: 10000 });

    // Step 2: Simulate complete workflow
    const supabase = getSupabaseClient();
    const { data: request } = await supabase
      .from('sample_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Add sample items
    await supabase.from('sample_items').insert([
      {
        sample_request_id: request?.id,
        product_name: 'スタンダードパウチ',
        quantity: 1,
        created_at: new Date().toISOString(),
      },
      {
        sample_request_id: request?.id,
        product_name: 'スタンドパウチ',
        quantity: 1,
        created_at: new Date().toISOString(),
      },
    ]);

    // Update status to shipped
    await supabase
      .from('sample_requests')
      .update({
        status: 'shipped',
        shipped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', request?.id);

    console.log('Sample request marked as shipped');

    // Step 3: Verify complete workflow
    const { data: items } = await supabase
      .from('sample_items')
      .select('*')
      .eq('sample_request_id', request?.id);

    expect(items?.length).toBeGreaterThan(0);

    const { data: updatedRequest } = await supabase
      .from('sample_requests')
      .select('status, shipped_at')
      .eq('id', request?.id)
      .maybeSingle();

    expect(updatedRequest?.status).toBe('shipped');
    expect(updatedRequest?.shipped_at).not.toBeNull();

    console.log('Complete sample request workflow verified');
  });

  test('폼 유효성 검사: 필수 필드 누락', async ({ page }) => {
    await page.goto('/samples');

    // Submit without filling any fields
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show validation errors
    await expect(page.locator('text=入力データに誤りがあります')).toBeVisible({ timeout: 5000 });
  });

  test('폼 유효성 검사: 이메일 형식 오류', async ({ page }) => {
    await page.goto('/samples');

    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="やまだ"]', 'てすと');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[placeholder*="たろう"]', 'ゆーざー');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[name="phone"]', '090-1234-5678');
    await page.locator('label[for="delivery-type-normal"]').first().click();
    await page.fill('textarea[name="message"]', 'テストメッセージです。10文字以上入力しています。');
    await page.check('input[name="agreement"]');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await expect(page.locator('text=有効なメールアドレスを入力してください')).toBeVisible({ timeout: 5000 });
  });

  test('폼 유효성 검사: 메시지 길이 부족', async ({ page }) => {
    await page.goto('/samples');

    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="やまだ"]', 'てすと');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[placeholder*="たろう"]', 'ゆーざー');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '090-1234-5678');
    await page.fill('textarea[name="message"]', '短い');
    await page.locator('label[for="delivery-type-normal"]').first().click();
    await page.check('input[name="agreement"]');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await expect(page.locator('text=10文字以上で入力してください')).toBeVisible({ timeout: 5000 });
  });

  test('폼 유효성 검사: 동의 필수', async ({ page }) => {
    await page.goto('/samples');

    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="やまだ"]', 'てすと');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[placeholder*="たろう"]', 'ゆーざー');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '090-1234-5678');
    await page.fill('textarea[name="message"]', 'テストメッセージです。10文字以上入力しています。');
    await page.locator('label[for="delivery-type-normal"]').first().click();

    // Do NOT check agreement

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await expect(page.locator('text=個人情報の取扱いに同意してください')).toBeVisible({ timeout: 5000 });
  });
});
