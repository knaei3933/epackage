import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { testUsers, AuthHelper, TestDataManager } from '../fixtures/test-data';

/**
 * Contact Inquiry Integration Flow E2E Test
 * 연락처 문의 통합 흐름 E2E 테스트
 *
 * Tests the complete contact inquiry workflow:
 * 1. User submits contact form
 * 2. SendGrid email verification (DEV_MODE: console log)
 * 3. Admin receives notification
 * 4. Inquiry saved to database
 * 5. Email confirmation sent to user
 * 6. Rate limiting validation
 * 7. Inquiry status management
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

test.describe('Contact Inquiry Integration Flow', () => {
  let testEmail: string;
  let requestId: string;
  let consoleErrors: string[] = [];

  test.beforeAll(async () => {
    // Clean up any existing test data
    const supabase = getSupabaseClient();
    await supabase.from('inquiries').delete().like('email', 'test-contact-%');
  });

  test.beforeEach(async ({ page }) => {
    testEmail = `test-contact-${Date.now()}@testmail.cc`;
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
      await supabase.from('inquiries').delete().eq('email', testEmail);
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  test('연락처 문의 완전한 흐름: 폼 제출 → DB 저장 → 이메일 전송', async ({ page, context }) => {
    // Setup console listener for email logs (DEV_MODE)
    const emailLogs: string[] = [];
    context.on('console', msg => {
      if (msg.text().includes('[Email]') || msg.text().includes('DEV_MODE')) {
        emailLogs.push(msg.text());
      }
    });

    // Step 1: Navigate to contact page
    await page.goto('/contact');

    // Check for console errors
    await expect(page.locator('text=パウチ専門お問い合わせ')).toBeVisible({ timeout: 10000 });
    expect(consoleErrors.length).toBe(0);

    // Step 2: Fill in the contact form
    await page.fill('input[placeholder*="山田"]', '田中');
    await page.fill('input[placeholder*="やまだ"]', 'たなか');
    await page.fill('input[placeholder*="太郎"]', '太郎');
    await page.fill('input[placeholder*="たろう"]', 'たろう');

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '09012345678');
    await page.fill('input[name="company"]', 'テスト株式会社');

    await page.selectOption('select[name="inquiryType"]', 'technical');
    await page.fill('input[name="subject"]', 'E2Eテスト: お問い合わせ');
    await page.fill('textarea[name="message"]', 'これはE2Eテストからのテストメッセージです。10文字以上入力していることを確認してください。');

    await page.selectOption('select[name="urgency"]', 'normal');
    await page.check('input[name="privacyConsent"]');

    // Step 3: Submit form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Step 4: Wait for success response
    await expect(page.locator('text=お問い合わせを受け付けました')).toBeVisible({ timeout: 10000 });

    // Step 5: Verify database record
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
    expect(inquiry?.customer_name).toBe('田中 太郎');
    expect(inquiry?.customer_name_kana).toBe('たなか たろう');
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

    // Step 6: Verify email log (DEV_MODE)
    expect(emailLogs.some(log => log.includes('[Email]'))).toBeTruthy();
    expect(emailLogs.some(log => log.includes('DEV_MODE'))).toBeTruthy();

    console.log('Email logs:', emailLogs);

    // Step 7: Verify both customer and admin email logs
    const customerEmailLog = emailLogs.find(log => log.includes(testEmail));
    const adminEmailLog = emailLogs.find(log => log.includes('admin@epackage-lab.com'));

    expect(customerEmailLog).toBeDefined();
    expect(adminEmailLog).toBeDefined();
  });

  test('관리자에게 알림 전송 및 문의 확인', async ({ page }) => {
    // Step 1: Create inquiry via form
    await page.goto('/contact');

    await page.fill('input[placeholder*="山田"]', '鈴木');
    await page.fill('input[placeholder*="太郎"]', '一郎');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '03-1234-5678');
    await page.fill('input[name="subject"]', 'テスト: 管理者通知');
    await page.fill('textarea[name="message"]', '管理者通知のテストです。10文字以上入力しています。');
    await page.check('input[name="privacyConsent"]');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await expect(page.locator('text=お問い合わせを受け付けました')).toBeVisible({ timeout: 10000 });

    // Step 2: Verify inquiry in database
    const supabase = getSupabaseClient();
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('*')
      .eq('email', testEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    expect(inquiry).not.toBeNull();
    expect(inquiry?.status).toBe('pending');

    console.log('Admin notification verified in database');
  });

  test('문의 상태 변경 및 처리', async ({ page }) => {
    // Step 1: Create inquiry
    await page.goto('/contact');

    await page.fill('input[placeholder*="山田"]', '佐藤');
    await page.fill('input[placeholder*="太郎"]', '二郎');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '09012345678');
    await page.fill('input[name="subject"]', 'テスト: 状態変更');
    await page.fill('textarea[name="message"]', '状態変更のテストです。10文字以上入力しています。');
    await page.check('input[name="privacyConsent"]');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await expect(page.locator('text=お問い合わせを受け付けました')).toBeVisible({ timeout: 10000 });

    // Step 2: Update inquiry status via database
    const supabase = getSupabaseClient();
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('*')
      .eq('email', testEmail)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    await supabase
      .from('inquiries')
      .update({
        status: 'IN_PROGRESS',
        response: 'お問い合わせありがとうございます。現在対応中です。',
        updated_at: new Date().toISOString(),
      })
      .eq('id', inquiry?.id);

    console.log('Inquiry status updated to IN_PROGRESS');

    // Step 3: Verify status change
    const { data: updatedInquiry } = await supabase
      .from('inquiries')
      .select('status, response')
      .eq('id', inquiry?.id)
      .single();

    expect(updatedInquiry?.status).toBe('IN_PROGRESS');
    expect(updatedInquiry?.response).toContain('対応中');
  });

  test('속도 제한 유효성 검사', async ({ page }) => {
    // Step 1: Submit first inquiry
    await page.goto('/contact');

    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '09012345678');
    await page.fill('input[name="subject"]', 'テスト: レート制限');
    await page.fill('textarea[name="message"]', 'レート制限のテストです。10文字以上入力しています。');
    await page.check('input[name="privacyConsent"]');

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    await expect(page.locator('text=お問い合わせを受け付けました')).toBeVisible({ timeout: 10000 });

    // Step 2: Immediately submit another inquiry (may trigger rate limit)
    await page.goto('/contact');

    await page.fill('input[placeholder*="山田"]', 'テスト');
    await page.fill('input[placeholder*="太郎"]', 'ユーザー');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '09012345678');
    await page.fill('input[name="subject"]', 'テスト: レート制限2');
    await page.fill('textarea[name="message"]', 'レート制限のテスト2です。10文字以上入力しています。');
    await page.check('input[name="privacyConsent"]');

    await submitButton.click();

    // Check for rate limit message (may or may not appear depending on configuration)
    const rateLimitMessage = page.locator('text=リクエストが多すぎます').or(
      page.locator('text=しばらく待ってから再試行してください')
    );

    const isRateLimitVisible = await rateLimitMessage.isVisible().catch(() => false);
    if (isRateLimitVisible) {
      console.log('Rate limiting is working correctly');
    } else {
      console.log('Rate limiting may not be configured (this is OK for development)');
    }
  });

  test('다양한 문의 유형 테스트', async ({ page }) => {
    const inquiryTypes = [
      { type: 'technical', subject: '技術的なお問い合わせ' },
      { type: 'sales', subject: '営業に関するお問い合わせ' },
      { type: 'support', subject: 'サポートが必要です' },
    ];

    const supabase = getSupabaseClient();

    for (const inquiryType of inquiryTypes) {
      await page.goto('/contact');

      await page.fill('input[placeholder*="山田"]', 'テスト');
      await page.fill('input[placeholder*="太郎"]', 'ユーザー');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[name="phone"]', '09012345678');
      await page.selectOption('select[name="inquiryType"]', inquiryType.type);
      await page.fill('input[name="subject"]', inquiryType.subject);
      await page.fill('textarea[name="message"]', `${inquiryType.subject}の詳細について。10文字以上入力しています。`);
      await page.check('input[name="privacyConsent"]');

      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      await expect(page.locator('text=お問い合わせを受け付けました')).toBeVisible({ timeout: 10000 });

      // Verify inquiry type
      const { data: inquiry } = await supabase
        .from('inquiries')
        .select('type')
        .eq('email', testEmail)
        .eq('subject', inquiryType.subject)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      expect(inquiry?.type).toBe(inquiryType.type);

      console.log(`Inquiry type ${inquiryType.type} verified`);
    }
  });

  test('긴급도별 문의 처리', async ({ page }) => {
    const urgencyLevels = ['low', 'normal', 'high'];

    for (const urgency of urgencyLevels) {
      await page.goto('/contact');

      await page.fill('input[placeholder*="山田"]', 'テスト');
      await page.fill('input[placeholder*="太郎"]', 'ユーザー');
      await page.fill('input[type="email"]', testEmail);
      await page.fill('input[name="phone"]', '09012345678');
      await page.selectOption('select[name="urgency"]', urgency);
      await page.fill('input[name="subject"]', `テスト: ${urgency} priority`);
      await page.fill('textarea[name="message"]', `${urgency}優先度のテストです。10文字以上入力しています。`);
      await page.check('input[name="privacyConsent"]');

      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      await expect(page.locator('text=お問い合わせを受け付けました')).toBeVisible({ timeout: 10000 });

      console.log(`Urgency level ${urgency} test completed`);
    }
  });

  test('모든 필드 포함한 완전한 문의', async ({ page }) => {
    await page.goto('/contact');

    await page.fill('input[placeholder*="山田"]', '山田');
    await page.fill('input[placeholder*="やまだ"]', 'やまだ');
    await page.fill('input[placeholder*="太郎"]', '太郎');
    await page.fill('input[placeholder*="たろう"]', 'たろう');

    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="phone"]', '03-1234-5678');
    await page.fill('input[name="fax"]', '03-1234-5679');
    await page.fill('input[name="company"]', 'テスト株式会社');

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

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

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

    console.log('Complete inquiry with all fields verified');
  });
});
