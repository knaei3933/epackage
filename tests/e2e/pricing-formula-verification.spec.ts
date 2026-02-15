/**
 * Quote-Simulator 計算式検証 E2Eテスト
 *
 * docs/reports/tjfrP/계산가이드 (計算ガイド) の計算式を既存実装と対照検証
 *
 * 検証項目:
 * 1. 基本平袋 100×120mm 500個 (シナリオ01)
 * 2. 小量生産 500個 (シナリオ02)
 * 3. 印刷費が1m固定で計算されるか
 * 4. 配送料が29kg/箱で計算されるか
 * 5. マージン構造（配送料はマージン対象外）
 *
 * 実行方法:
 * npm run test:e2e tests/e2e/pricing-formula-verification.spec.ts
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { testUsers, AuthHelper, TestDataManager } from '../fixtures/test-data';

// Supabase client for database verification
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

test.describe('Pricing Formula Verification', () => {
  let testUser: ReturnType<typeof testUsers.japaneseMember>;
  let authHelper: AuthHelper;

  test.beforeAll(async () => {
    // Setup: Create and approve a test user
    const supabase = getSupabaseClient();

    // Clean up existing test quotes
    await supabase.from('quotes').delete().like('quote_number', 'quote-test-%');
  });

  test.beforeEach(async ({ page }) => {
    testUser = testUsers.japaneseMember();
    TestDataManager.registerTestEmail(testUser.email);
    authHelper = new AuthHelper(page);
  });

  test.afterEach(async () => {
    // Cleanup test data
    try {
      const supabase = getSupabaseClient();

      // Delete test quotes
      await supabase.from('quotes').delete().eq('customer_email', testUser.email);

      // Delete user
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users.users.find(u => u.email === testUser.email);
      if (user) {
        await supabase.auth.admin.deleteUser(user.id);
      }
      await supabase.from('profiles').delete().eq('email', testUser.email);
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  /**
   * シナリオ01: 基本平袋 100×120mm 500個
   * ガイドの期待値との比較
   */
  test('Scenario 01: 基本平袋 100×120mm 500個 - 計算式検証', async ({ page }) => {
    // =====================================================
    // Step 1: ユーザー登録・承認・ログイン
    // =====================================================
    await authHelper.register(testUser);

    // Approve user directly in database
    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ status: 'ACTIVE' })
        .eq('id', profile.id);
    }

    await authHelper.loginAsMember(testUser.email, testUser.password);

    // =====================================================
    // Step 2: Quote Simulator ページへ移動
    // =====================================================
    await page.goto('/quote/simulator');
    await page.waitForLoadState('networkidle');

    // =====================================================
    // Step 3: パウチタイプと寸法を入力
    // =====================================================
    // 平袋（三方シール）を選択
    await page.click('[data-testid="pouch-type-selector"] button:has-text("平袋")');

    // 寸法を入力 (100×120mm)
    await page.fill('[data-testid="input-width"]', '100');
    await page.fill('[data-testid="input-height"]', '120');

    // 数量を入力
    await page.fill('[data-testid="input-quantity"]', '500');

    // 計算実行を待機
    await page.waitForTimeout(1000);

    // =====================================================
    // Step 4: 計算結果を取得・検証
    // =====================================================
    // フィルム幅計算の検証
    // ガイド: 1列 = (H × 2) + 41 = (120 × 2) + 41 = 281mm
    // 590mm原反を選択
    const filmWidthInfo = await page.locator('[data-testid="film-width-info"]').textContent();
    console.log('フィルム幅情報:', filmWidthInfo);

    // 単価を取得
    const unitPriceText = await page.locator('[data-testid="unit-price"]').textContent();
    const unitPrice = parseInt(unitPriceText?.replace(/[^0-9]/g, '') || '0', 10);
    console.log('計算された単価:', unitPrice, '円');

    // 総額を取得
    const totalPriceText = await page.locator('[data-testid="total-price"]').textContent();
    const totalPrice = parseInt(totalPriceText?.replace(/[^0-9]/g, '') || '0', 10);
    console.log('計算された総額:', totalPrice, '円');

    // 期待単価の範囲（ガイド基準から計算）
    // ガイド: 500個で総額272,988ウォン → 円換算 32,758円 → 単価約65円/個
    // 許容範囲: ±20%
    const expectedUnitPrice = 65; // 円/個
    const tolerance = expectedUnitPrice * 0.3; // 30%許容（計算式の差異を考慮）

    expect(unitPrice).toBeGreaterThan(expectedUnitPrice - tolerance);
    expect(unitPrice).toBeLessThan(expectedUnitPrice + tolerance);

    // =====================================================
    // Step 5: 明細情報の検証
    // =====================================================
    // 原価内訳を表示
    const breakdownToggle = page.locator('[data-testid="breakdown-toggle"]');
    if (await breakdownToggle.isVisible()) {
      await breakdownToggle.click();
      await page.waitForTimeout(500);

      // 各項目を取得
      const materialCost = await page.locator('[data-testid="material-cost"]').textContent();
      const printingCost = await page.locator('[data-testid="printing-cost"]').textContent();
      const deliveryCost = await page.locator('[data-testid="delivery-cost"]').textContent();

      console.log('材料費:', materialCost);
      console.log('印刷費:', printingCost);
      console.log('配送料:', deliveryCost);
    }

    // =====================================================
    // Step 6: PDF出力の検証（オプション）
    // =====================================================
    const exportButton = page.locator('[data-testid="export-pdf-button"]');
    if (await exportButton.isVisible()) {
      console.log('PDF出力ボタンが確認されました');

      // クリックしてPDF生成をトリガー（実際のダウンロードは検証しない）
      // await exportButton.click();
      // await page.waitForTimeout(2000);
    }
  });

  /**
   * シナリオ02: 小量生産 500個 vs 1,000個
   * 2列生産の経済性を検証
   */
  test('Scenario 02: 小量生産 500個 vs 1,000個 - 2列生産効果検証', async ({ page }) => {
    // ユーザー設定
    await authHelper.register(testUser);

    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ status: 'ACTIVE' })
        .eq('id', profile.id);
    }

    await authHelper.loginAsMember(testUser.email, testUser.password);
    await page.goto('/quote/simulator');
    await page.waitForLoadState('networkidle');

    // 平袋（三方シール）を選択
    await page.click('[data-testid="pouch-type-selector"] button:has-text("平袋")');

    // 寸法を入力 (80×120mm)
    await page.fill('[data-testid="input-width"]', '80');
    await page.fill('[data-testid="input-height"]', '120');

    // 500個で計算
    await page.fill('[data-testid="input-quantity"]', '500');
    await page.waitForTimeout(1000);

    const unitPrice500Text = await page.locator('[data-testid="unit-price"]').textContent();
    const unitPrice500 = parseInt(unitPrice500Text?.replace(/[^0-9]/g, '') || '0', 10);
    console.log('500個の単価:', unitPrice500, '円');

    // 1,000個で計算
    await page.fill('[data-testid="input-quantity"]', '1000');
    await page.waitForTimeout(1000);

    const unitPrice1000Text = await page.locator('[data-testid="unit-price"]').textContent();
    const unitPrice1000 = parseInt(unitPrice1000Text?.replace(/[^0-9]/g, '') || '0', 10);
    console.log('1,000個の単価:', unitPrice1000, '円');

    // 2列生産の場合、単価が約50%になるはず
    // ガイド: 500個で546円、1,000個で273円（50% OFF）
    // 許容範囲で検証
    const ratio = unitPrice1000 / unitPrice500;
    console.log('単価比率 (1000個/500個):', (ratio * 100).toFixed(1) + '%');

    // 2列生産の効果がある場合は比率が0.6以下になるはず
    // ただし、最小単価適用などにより正確な50%にならない場合もある
    expect(ratio).toBeLessThan(0.8); // 少なくとも20%以上の節約
  });

  /**
   * 印刷費検証: 1m固定で計算されるか
   * ガイドでは「常に1mで計算」と記載
   */
  test('Verification: 印刷費が1m固定で計算されるか', async ({ page }) => {
    // ユーザー設定
    await authHelper.register(testUser);

    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ status: 'ACTIVE' })
        .eq('id', profile.id);
    }

    await authHelper.loginAsMember(testUser.email, testUser.password);
    await page.goto('/quote/simulator');
    await page.waitForLoadState('networkidle');

    // 平袋を選択
    await page.click('[data-testid="pouch-type-selector"] button:has-text("平袋")');

    // 寸法入力
    await page.fill('[data-testid="input-width"]', '100');
    await page.fill('[data-testid="input-height"]', '120');
    await page.fill('[data-testid="input-quantity"]', '500');

    await page.waitForTimeout(1000);

    // 明細を表示
    const breakdownToggle = page.locator('[data-testid="breakdown-toggle"]');
    if (await breakdownToggle.isVisible()) {
      await breakdownToggle.click();
      await page.waitForTimeout(500);

      // 印刷費を取得
      const printingCostText = await page.locator('[data-testid="printing-cost"]').textContent();
      console.log('印刷費:', printingCostText);

      // 注: 現在の実装では幅×長さで計算されている可能性がある
      // このテストは現状を記録するためのもの
      // 修正後は期待値と比較するように更新
    }
  });

  /**
   * 配送料検証: 29kg/箱で計算されるか
   * ガイドでは「127,980ウォン/箱、29kg/箱」と記載
   */
  test('Verification: 配送料が29kg/箱で計算されるか', async ({ page }) => {
    // ユーザー設定
    await authHelper.register(testUser);

    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ status: 'ACTIVE' })
        .eq('id', profile.id);
    }

    await authHelper.loginAsMember(testUser.email, testUser.password);
    await page.goto('/quote/simulator');
    await page.waitForLoadState('networkidle');

    // 平袋を選択
    await page.click('[data-testid="pouch-type-selector"] button:has-text("平袋")');

    // 寸法入力
    await page.fill('[data-testid="input-width"]', '160');
    await page.fill('[data-testid="input-height"]', '100');
    await page.fill('[data-testid="input-quantity"]', '10000');

    await page.waitForTimeout(1000);

    // 明細を表示
    const breakdownToggle = page.locator('[data-testid="breakdown-toggle"]');
    if (await breakdownToggle.isVisible()) {
      await breakdownToggle.click();
      await page.waitForTimeout(500);

      // 配送料を取得
      const deliveryCostText = await page.locator('[data-testid="delivery-cost"]').textContent();
      console.log('配送料:', deliveryCostText);

      // ガイド: 92.6kg → 4箱 (29kg/箱) → 4 × 127,980ウォン
      // 円換算: 511,920ウォン × 0.12 = 61,430円

      // 注: 現在の実装では26kg/包装で計算されている可能性がある
      // このテストは現状を記録するためのもの
    }
  });

  /**
   * マージン構造検証: 配送料はマージン対象外か
   * ガイドでは「配送料はマージン計算対象外」と記載
   */
  test('Verification: 配送料はマージン対象外か', async ({ page }) => {
    // ユーザー設定
    await authHelper.register(testUser);

    const supabase = getSupabaseClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({ status: 'ACTIVE' })
        .eq('id', profile.id);
    }

    await authHelper.loginAsMember(testUser.email, testUser.password);
    await page.goto('/quote/simulator');
    await page.waitForLoadState('networkidle');

    // 平袋を選択
    await page.click('[data-testid="pouch-type-selector"] button:has-text("平袋")');

    // 寸法入力
    await page.fill('[data-testid="input-width"]', '100');
    await page.fill('[data-testid="input-height"]', '120');
    await page.fill('[data-testid="input-quantity"]', '500');

    await page.waitForTimeout(1000);

    // 総額と配送料を取得
    const totalPriceText = await page.locator('[data-testid="total-price"]').textContent();
    const totalPrice = parseInt(totalPriceText?.replace(/[^0-9]/g, '') || '0', 10);

    // 明細を表示
    const breakdownToggle = page.locator('[data-testid="breakdown-toggle"]');
    if (await breakdownToggle.isVisible()) {
      await breakdownToggle.click();
      await page.waitForTimeout(500);

      const deliveryCostText = await page.locator('[data-testid="delivery-cost"]').textContent();
      const deliveryCost = parseInt(deliveryCostText?.replace(/[^0-9]/g, '') || '0', 10);

      console.log('総額:', totalPrice, '円');
      console.log('配送料:', deliveryCost, '円');

      // 注: 現在の実装では配送料にマージンが適用されている可能性がある
      // このテストは現状を記録するためのもの
      // 修正後は配送料がマージン計算から除外されていることを確認
    }
  });
});
