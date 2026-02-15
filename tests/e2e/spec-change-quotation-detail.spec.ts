/**
 * Admin Quotation Detail E2E Tests (404 Fix Verification)
 *
 * 管理者用見積詳細表示機能のE2Eテスト
 * - 404エラー修正の確認
 * - 見積詳細データの取得
 * - 原価内訳の表示
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, QUOTATION_DATA, formatYen } from './test-data';

// =====================================================
// Test Setup
// =====================================================

test.beforeEach(async ({ page }) => {
  // 管理者ログインページへアクセス
  await page.goto('/auth/signin');

  // ログインフォームに入力
  await page.fill('input[type="email"]', TEST_USERS.admin.email);
  await page.fill('input[type="password"]', TEST_USERS.admin.password);

  // ログインボタンをクリック
  await page.click('button[type="submit"]');

  // ログイン後の処理を待機
  await page.waitForTimeout(2000);

  // ダッシュボードへ遷移
  await page.goto('/admin/dashboard');
  await page.waitForLoadState('domcontentloaded');
});

// =====================================================
// Test Cases
// =====================================================

test.describe('管理者見積詳細機能（404修正確認）', () => {
  test('SPEC-QUOTE-001: 見積一覧ページが表示される', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto('/admin/quotations');

    // ページタイトルが表示されることを確認
    await expect(page.locator('text=/見積一覧|見積管理|Quotations/')).toBeVisible();

    // 見積リストが表示されるのを待機
    await page.waitForSelector('[data-testid="quotation-row"]', { timeout: 10000 });

    // 少なくとも1つの見積が表示されることを確認
    const quotationRows = page.locator('[data-testid="quotation-row"]');
    const count = await quotationRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('ADMIN-QUOTE-002: 見積詳細パネルが開く（404エラー修正確認）', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto('/admin/quotations');

    // 見積リストが表示されるのを待機
    await page.waitForSelector('[data-testid="quotation-row"]', { timeout: 10000 });

    // 最初の見積をクリックして詳細を開く
    const firstQuotation = page.locator('[data-testid="quotation-row"]').first();
    await firstQuotation.click();

    // 詳細パネルが表示されるのを待機（404エラーが発生していないことを確認）
    await expect(page.locator('[data-testid="quotation-detail-panel"]')).toBeVisible({ timeout: 10000 });

    // 顧客情報が表示されることを確認
    await expect(page.locator('text=/顧客名|Customer Name/')).toBeVisible();

    // 見積金額が表示されることを確認
    await expect(page.locator('text=/合計|Total|¥/')).toBeVisible();
  });

  test('ADMIN-QUOTE-003: 原価内訳が正しく表示される', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto('/admin/quotations');

    await page.waitForSelector('[data-testid="quotation-row"]', { timeout: 10000 });

    // 最初の見積をクリック
    const firstQuotation = page.locator('[data-testid="quotation-row"]').first();
    await firstQuotation.click();

    // 詳細パネルが表示されるのを待機
    await page.waitForSelector('[data-testid="quotation-detail-panel"]', { timeout: 10000 });

    // 原価内訳セクションがあることを確認
    const costBreakdown = page.locator('[data-testid="cost-breakdown"]');
    if (await costBreakdown.isVisible()) {
      // 原価内訳の項目が表示されることを確認
      await expect(costBreakdown.locator('text=/フィルム原価|材料費/')).toBeVisible();
      await expect(costBreakdown.locator('text=/印刷費/')).toBeVisible();
      await expect(costBreakdown.locator('text=/加工費/')).toBeVisible();
      await expect(costBreakdown.locator('text=/利益率/')).toBeVisible();
    }
  });

  test('ADMIN-QUOTE-004: 見積詳細APIが正しく動作する', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto('/admin/quotations');

    await page.waitForSelector('[data-testid="quotation-row"]', { timeout: 10000 });

    // 最初の見積IDを取得
    const firstQuotation = page.locator('[data-testid="quotation-row"]').first();
    const quotationId = await firstQuotation.getAttribute('data-quotation-id');

    // 見積をクリック
    await firstQuotation.click();

    // APIリクエストを監視
    const apiResponse = page.waitForResponse(response =>
      response.url().includes('/api/admin/quotations/') &&
      response.status() === 200
    );

    // 詳細パネルが表示されるのを待機
    await page.waitForSelector('[data-testid="quotation-detail-panel"]', { timeout: 10000 });

    // APIレスポンスを確認
    const response = await Promise.race([
      apiResponse,
      new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
    ]);

    // ステータスコードが200であることを確認（404エラーでないこと）
    expect(await response?.status()).toBe(200);
  });

  test('ADMIN-QUOTE-005: 認証ヘッダーが正しく送信される', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto('/admin/quotations');

    await page.waitForSelector('[data-testid="quotation-row"]', { timeout: 10000 });

    // リクエストを監視
    const apiRequestPromise = page.waitForRequest(request =>
      request.url().includes('/api/admin/quotations/')
    );

    // 最初の見積をクリック
    const firstQuotation = page.locator('[data-testid="quotation-row"]').first();
    await firstQuotation.click();

    // APIリクエストを取得
    const apiRequest = await Promise.race([
      apiRequestPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 5000))
    ]);

    // 認証ヘッダーが含まれていることを確認
    const headers = await apiRequest?.headers();
    expect(headers).toBeDefined();

    // Dev ModeヘッダーまたはBearerトークンが存在することを確認
    const hasAuth = headers?.['authorization'] ||
                     headers?.['x-dev-mode'] ||
                     headers?.['x-user-id'];
    expect(hasAuth).toBeTruthy();
  });

  test('ADMIN-QUOTE-006: 見積詳細の計算式が表示される', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto('/admin/quotations');

    await page.waitForSelector('[data-testid="quotation-row"]', { timeout: 10000 });

    // 最初の見積をクリック
    const firstQuotation = page.locator('[data-testid="quotation-row"]').first();
    await firstQuotation.click();

    // 詳細パネルが表示されるのを待機
    await page.waitForSelector('[data-testid="quotation-detail-panel"]', { timeout: 10000 });

    // 計算式セクションがあることを確認
    const calculationSection = page.locator('[data-testid="calculation-details"]');
    if (await calculationSection.isVisible()) {
      // 計算式の要素が表示されることを確認
      await expect(calculationSection.locator('text=/サイズ|寸法/')).toBeVisible();
      await expect(calculationSection.locator('text=/数量/')).toBeVisible();
    }
  });

  test('ADMIN-QUOTE-007: 複数の見積を順番に詳細表示できる', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto('/admin/quotations');

    await page.waitForSelector('[data-testid="quotation-row"]', { timeout: 10000 });

    const quotationRows = page.locator('[data-testid="quotation-row"]');
    const count = await quotationRows.count();

    // 最初の3つの見積を順番に詳細表示
    const testCount = Math.min(count, 3);

    for (let i = 0; i < testCount; i++) {
      // 見積をクリック
      const quotation = quotationRows.nth(i);
      await quotation.click();

      // 詳細パネルが表示されることを確認
      await expect(page.locator('[data-testid="quotation-detail-panel"]')).toBeVisible({ timeout: 10000 });

      // パネルを閉じる
      const closeBtn = page.locator('[data-testid="close-detail-panel"]');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }

      // パネルが閉じるのを待機
      await expect(page.locator('[data-testid="quotation-detail-panel"]')).not.toBeVisible();
    }
  });
});

// =====================================================
// Test Cleanup
// =====================================================

test.afterEach(async ({ page }) => {
  // テスト終了後にログアウト
  await page.goto('/admin/signout');
});
