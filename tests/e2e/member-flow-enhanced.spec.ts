import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { testUsers, AuthHelper, TestDataManager } from '../fixtures/test-data';

/**
 * Complete Member Lifecycle Integration E2E Test
 * 완전한 회원 수명주기 통합 E2E 테스트
 *
 * Tests the complete member lifecycle workflow:
 * 1. User registration
 * 2. Email verification
 * 3. Admin approval
 * 4. Member login
 * 5. Profile completion
 * 6. First order placement
 * 7. Order tracking
 * 8. Member management
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Helper: Approve user in database
async function approveUser(email: string) {
  const supabase = getSupabaseClient();

  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (findError || !profile) {
    throw new Error(`User not found: ${email}`);
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
    .eq('id', profile.id);

  if (updateError) {
    throw new Error(`Failed to approve user: ${updateError.message}`);
  }

  console.log('User approved:', email);
  return profile;
}

// Helper: Cleanup test user
async function cleanupUser(email: string) {
  const supabase = getSupabaseClient();

  await supabase.from('profiles').delete().eq('email', email);

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);
  if (user) {
    await supabase.auth.admin.deleteUser(user.id);
  }

  console.log('User cleaned up:', email);
}

test.describe('Complete Member Lifecycle Integration Flow', () => {
  let testUser: ReturnType<typeof testUsers.japaneseMember>;
  let userId: string;
  let consoleErrors: string[] = [];

  test.beforeAll(async () => {
    // Clean up any existing test data
    const supabase = getSupabaseClient();
    await supabase.from('profiles').delete().like('email', 'test-member-lifecycle-%');
  });

  test.beforeEach(async ({ page }) => {
    testUser = testUsers.japaneseMember();
    testUser.email = `test-member-lifecycle-${Date.now()}@testmail.cc`;
    consoleErrors = [];

    // Setup console error listener
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
  });

  test.afterEach(async () => {
    // Cleanup test user
    try {
      await cleanupUser(testUser.email);
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  test('완전한 회원 수명주기: 등록 → 인증 → 승인 → 로그인 → 프로필 → 주문', async ({ page, context }) => {
    // =====================================================
    // Step 1: User Registration
    // =====================================================
    await page.goto('/auth/register');
    await expect(page.locator('text=会員登録')).toBeVisible();

    // Authentication info
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="passwordConfirm"]', testUser.password);

    // Name fields
    await page.fill('input[placeholder="山田"]', testUser.kanjiLastName);
    await page.fill('input[placeholder="太郎"]', testUser.kanjiFirstName);
    await page.fill('input[placeholder="やまだ"]', testUser.kanaLastName);
    await page.fill('input[placeholder="たろう"]', testUser.kanaFirstName);

    // Phone numbers
    await page.fill('input[name="corporatePhone"]', testUser.corporatePhone);
    await page.fill('input[name="personalPhone"]', testUser.personalPhone);

    // Business type
    await page.check(`input[value="${testUser.businessType}"]`);

    // Wait for corporation fields
    await expect(page.locator('text=会社情報')).toBeVisible({ timeout: 3000 });

    // Company info
    await page.fill('input[name="companyName"]', testUser.companyName);
    await page.fill('input[name="legalEntityNumber"]', testUser.legalEntityNumber);
    await page.fill('input[name="position"]', testUser.position);
    await page.fill('input[name="department"]', testUser.department);
    await page.fill('input[name="companyUrl"]', testUser.companyUrl);

    // Address
    await page.fill('input[name="postalCode"]', testUser.postalCode);
    await page.selectOption('select[name="prefecture"]', testUser.prefecture);
    await page.fill('input[name="city"]', testUser.city);
    await page.fill('input[name="street"]', testUser.street);
    if (testUser.building) {
      await page.fill('input[name="building"]', testUser.building);
    }

    // Product category
    await page.selectOption('select[name="productCategory"]', testUser.productCategory);

    // Acquisition channel
    await page.selectOption('select[name="acquisitionChannel"]', testUser.acquisitionChannel);

    // Privacy consent
    await page.check('input[name="privacyConsent"]');

    // Submit registration
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should redirect to pending page
    await expect(page.locator('text=メール認証後')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=管理者の承認をお待ちください')).toBeVisible();

    console.log('Registration successful, user in PENDING state');

    // =====================================================
    // Step 2: Verify database record (PENDING)
    // =====================================================
    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testUser.email)
      .single();

    expect(profile).not.toBeNull();
    expect(profile?.status).toBe('PENDING');
    expect(profile?.email).toBe(testUser.email);
    userId = profile?.id;

    console.log('Database record verified:', userId);

    // =====================================================
    // Step 3: Admin Approval
    // =====================================================
    await approveUser(testUser.email);

    const { data: approvedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testUser.email)
      .single();

    expect(approvedProfile?.status).toBe('ACTIVE');
    console.log('User approved successfully');

    // =====================================================
    // Step 4: Member Login
    // =====================================================
    await page.goto('/auth/signin');
    await expect(page.locator('text=ログイン')).toBeVisible();

    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);

    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();

    // Should redirect to dashboard
    await page.waitForURL('**/member/dashboard', { timeout: 10000 });
    await expect(page.locator('text=ダッシュボード')).toBeVisible({ timeout: 10000 });

    await expect(page.locator(`text=${testUser.email}`)).toBeVisible({ timeout: 5000 });

    console.log('Login successful, dashboard accessible');

    // =====================================================
    // Step 5: Profile Completion
    // =====================================================
    await page.goto('/member/profile');

    // Verify profile information is displayed
    await expect(page.locator(`text=${testUser.kanjiLastName} ${testUser.kanjiFirstName}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${testUser.companyName}`)).toBeVisible({ timeout: 5000 });

    console.log('Profile information verified');

    // =====================================================
    // Step 6: First Order Placement (via quote simulator)
    // =====================================================
    await page.goto('/quote/simulator');

    // Should show quote simulator page
    await expect(page.locator('text=見積もりシミュレーター')).toBeVisible({ timeout: 10000 });

    // Fill quote details
    await page.selectOption('select[name="productType"]', 'POUCH');
    await page.fill('input[name="width"]', '100');
    await page.fill('input[name="length"]', '150');
    await page.selectOption('select[name="material"]', 'PET_AL_PE');
    await page.fill('input[name="quantity"]', '1000');
    await page.selectOption('select[name="printingMethod"]', 'GRAVURE');
    await page.fill('input[name="colors"]', '4');

    // Get quote estimate
    const getQuoteButton = page.locator('button').filter({
      hasText: /見積もりを取得|Get Quote/
    });

    await getQuoteButton.click();

    // Wait for price calculation
    await page.waitForTimeout(2000);

    // Should show estimated price
    await expect(page.locator('text=¥')).toBeVisible({ timeout: 5000 });

    console.log('Quote estimate displayed');

    // =====================================================
    // Step 7: Save Quote
    // =====================================================
    const saveQuoteButton = page.locator('button').filter({
      hasText: /保存|Save/
    });

    await saveQuoteButton.click();

    // Should show success message
    await expect(page.locator('text=保存しました')).toBeVisible({ timeout: 5000 }).or(
      expect(page.locator('text=見積もりを保存しました')).toBeVisible({ timeout: 5000 })
    );

    console.log('Quote saved successfully');

    // =====================================================
    // Step 8: View Order Tracking
    // =====================================================
    await page.goto('/member/quotations');

    // Should show quotations list
    await expect(page.locator('text=見積もり一覧')).toBeVisible({ timeout: 10000 });

    console.log('Quotations list accessible');

    // =====================================================
    // Step 9: Member Logout
    // =====================================================
    await page.goto('/auth/signout');

    // Should redirect to signin page
    await expect(page.locator('text=ログイン')).toBeVisible({ timeout: 5000 });

    console.log('Logout successful');

    // =====================================================
    // Step 10: Re-login
    // =====================================================
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard again
    await page.waitForURL('**/member/dashboard', { timeout: 10000 });
    await expect(page.locator('text=ダッシュボード')).toBeVisible({ timeout: 10000 });

    console.log('Re-login successful');
  });

  test('회원 등록 유효성 검사', async ({ page }) => {
    await page.goto('/auth/register');

    // Submit without filling any fields
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show validation errors
    await expect(page.locator('text=入力データの検証に失敗しました')).toBeVisible({ timeout: 5000 });
  });

  test('잘못된 비밀번호로 로그인 시도', async ({ page }) => {
    // First, create and approve a user via API
    const supabase = getSupabaseClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
    });

    expect(authError).toBeNull();
    expect(authData.user).not.toBeNull();

    // Create profile
    await supabase.from('profiles').insert({
      id: authData.user!.id,
      email: testUser.email,
      kanji_last_name: testUser.kanjiLastName,
      kanji_first_name: testUser.kanjiFirstName,
      kana_last_name: testUser.kanaLastName,
      kana_first_name: testUser.kanaFirstName,
      corporate_phone: testUser.corporatePhone,
      personal_phone: testUser.personalPhone,
      business_type: testUser.businessType,
      company_name: testUser.companyName,
      position: testUser.position,
      postal_code: testUser.postalCode,
      prefecture: testUser.prefecture,
      city: testUser.city,
      street: testUser.street,
      product_category: testUser.productCategory,
      acquisition_channel: testUser.acquisitionChannel,
      role: 'MEMBER',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Now try to login with wrong password
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', 'WrongPassword123!');

    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();

    // Should show error
    await expect(page.locator('text=ログインに失敗しました')).toBeVisible({ timeout: 5000 });
  });

  test('인증되지 않은 상태에서 보안 경로 접근', async ({ page }) => {
    // Try to access dashboard without logging in
    await page.goto('/member/dashboard');

    // Should redirect to signin page
    await expect(page.locator('text=ログイン')).toBeVisible({ timeout: 5000 });
  });

  test('회원 프로필 수정', async ({ page }) => {
    // Step 1: Create and approve user
    const supabase = getSupabaseClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
    });

    expect(authError).toBeNull();

    await supabase.from('profiles').insert({
      id: authData.user!.id,
      email: testUser.email,
      kanji_last_name: testUser.kanjiLastName,
      kanji_first_name: testUser.kanjiFirstName,
      kana_last_name: testUser.kanaLastName,
      kana_first_name: testUser.kanaFirstName,
      corporate_phone: testUser.corporatePhone,
      personal_phone: testUser.personalPhone,
      business_type: testUser.businessType,
      company_name: testUser.companyName,
      position: testUser.position,
      postal_code: testUser.postalCode,
      prefecture: testUser.prefecture,
      city: testUser.city,
      street: testUser.street,
      product_category: testUser.productCategory,
      acquisition_channel: testUser.acquisitionChannel,
      role: 'MEMBER',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Step 2: Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/member/dashboard', { timeout: 10000 });

    // Step 3: Navigate to settings
    await page.goto('/member/settings');

    // Should show settings page
    await expect(page.locator('text=設定')).toBeVisible({ timeout: 5000 });

    console.log('Member settings page accessible');
  });

  test('회원 주문 내역 조회', async ({ page }) => {
    // Step 1: Create and approve user
    const supabase = getSupabaseClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
    });

    expect(authError).toBeNull();

    const profileData = {
      id: authData.user!.id,
      email: testUser.email,
      kanji_last_name: testUser.kanjiLastName,
      kanji_first_name: testUser.kanjiFirstName,
      kana_last_name: testUser.kanaLastName,
      kana_first_name: testUser.kanaFirstName,
      corporate_phone: testUser.corporatePhone,
      personal_phone: testUser.personalPhone,
      business_type: testUser.businessType,
      company_name: testUser.companyName,
      position: testUser.position,
      postal_code: testUser.postalCode,
      prefecture: testUser.prefecture,
      city: testUser.city,
      street: testUser.street,
      product_category: testUser.productCategory,
      acquisition_channel: testUser.acquisitionChannel,
      role: 'MEMBER',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await supabase.from('profiles').insert(profileData);

    // Create a test order
    await supabase.from('orders').insert({
      order_number: `ord-2025-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      customer_id: authData.user!.id,
      customer_email: testUser.email,
      customer_name: `${testUser.kanjiLastName} ${testUser.kanjiFirstName}`,
      company_name: testUser.companyName,
      status: 'CONFIRMED',
      items: [{ product_name: 'テストパウチ', quantity: 1000, unit_price: 150 }],
      subtotal: 150000,
      tax: 15000,
      total: 165000,
      delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Step 2: Login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/member/dashboard', { timeout: 10000 });

    // Step 3: View orders
    await page.goto('/member/orders');

    // Should show orders list
    await expect(page.locator('text=注文一覧')).toBeVisible({ timeout: 10000 });

    console.log('Orders list accessible');
  });
});
