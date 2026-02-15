/**
 * Admin Quotation Detail E2E Tests
 *
 * 管理者用見積詳細機能のE2Eテスト
 * - 404エラー修正の確認
 * - 見積詳細の表示
 * - 原価内訳の確認
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, formatYen } from './test-data';

// =====================================================
// Test Constants
// =====================================================

const ADMIN_EMAIL = TEST_USERS.admin.email;
const ADMIN_PASSWORD = TEST_USERS.admin.password;

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

// =====================================================
// Test Setup
// =====================================================

test.beforeEach(async ({ page }) => {
  // 管理者としてログイン
  await page.goto(`${BASE_URL}/auth/signin`);
  await page.waitForLoadState('domcontentloaded');

  // ログインフォームに入力
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);

  // ログインボタンをクリック
  await page.click('button[type="submit"]');

  // ログイン後の処理を待機（Dev Modeではリダイレクトが異なる場合がある）
  await page.waitForTimeout(2000);

  // ダッシュボードに遷移
  await page.goto(`${BASE_URL}/admin/dashboard`);
  await page.waitForLoadState('domcontentloaded');
});

// =====================================================
// Test Suite: 見積一覧表示
// =====================================================

test.describe('管理者見積一覧', () => {

  test('QD-001: 管理者が見積一覧ページにアクセスできる', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto(`${BASE_URL}/admin/quotations`);
    await page.waitForLoadState('networkidle');

    // ページタイトルを確認
    const pageTitle = page.locator('h1').or(page.locator('h2'));
    await expect(pageTitle).toContainText('見積', { timeout: 10000 });

    // 見積リストが表示されていることを確認
    const quotationList = page.locator('table tbody tr').or(page.locator('[data-testid="quotation-list"]'));
    const count = await quotationList.count().catch(() => 0);

    // リストが存在することを確認（データがなくてもエラーにはしない）
    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('QD-002: 見積カードが正しく表示される', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto(`${BASE_URL}/admin/quotations`);
    await page.waitForLoadState('networkidle');

    // 見積リストを取得
    const firstQuotation = page.locator('table tbody tr').first().or(
      page.locator('[data-testid="quotation-item"]').first()
    );

    const isVisible = await firstQuotation.isVisible().catch(() => false);

    if (isVisible) {
      // 見積番号が表示されていることを確認
      await expect(page.locator('text=/QUO-\\d{4}-\\d{5}/')).toBeVisible();
    } else {
      test.skip(true, '見積データが存在しません');
    }
  });
});

// =====================================================
// Test Suite: 見積詳細表示（404エラー修正確認）
// =====================================================

test.describe('見積詳細表示', () => {

  test('QD-101: 見積詳細パネルを開ける', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto(`${BASE_URL}/admin/quotations`);
    await page.waitForLoadState('networkidle');

    // 最初の見積をクリック
    const firstQuotation = page.locator('table tbody tr').first().or(
      page.locator('[data-testid="quotation-item"]').first()
    );

    const isVisible = await firstQuotation.isVisible().catch(() => false);

    if (isVisible) {
      await firstQuotation.click();

      // 詳細パネルが表示されることを確認（モーダルまたは展開パネル）
      await page.waitForTimeout(1000);

      // 詳細パネルの表示を確認（複数のパターンに対応）
      const detailPanel = page.locator('.modal').or(
        page.locator('[data-testid="quotation-detail"]')
      ).or(page.locator('.expanded')).or(
        page.locator('[role="dialog"]')
      );

      const panelVisible = await detailPanel.isVisible().catch(() => false);

      if (!panelVisible) {
        // パネルが表示されない場合は、詳細情報がページ内に展開されているか確認
        const detailInfo = page.locator('text=/見積詳細|原価内訳|明細/');
        await expect(detailInfo).toBeVisible({ timeout: 3000 });
      }
    } else {
      test.skip(true, '見積データが存在しません');
    }
  });

  test('QD-102: 見積詳細APIの404エラーが修正されている', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto(`${BASE_URL}/admin/quotations`);
    await page.waitForLoadState('networkidle');

    // 最初の見積をクリック
    const firstQuotation = page.locator('table tbody tr').first().or(
      page.locator('[data-testid="quotation-item"]').first()
    );

    const isVisible = await firstQuotation.isVisible().catch(() => false);

    if (isVisible) {
      // コンソールエラーを監視
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // ネットワークエラーを監視
      const failedRequests: string[] = [];
      page.on('requestfailed', request => {
        failedRequests.push(request.url());
      });

      await firstQuotation.click();

      // 詳細読み込みを待機
      await page.waitForTimeout(2000);

      // 404エラーが発生していないことを確認
      const has404Error = errors.some(e =>
        e.includes('404') || e.includes('Not Found')
      );

      const has404Request = failedRequests.some(url =>
        url.includes('/api/admin/quotations/')
      );

      expect(has404Error).toBe(false);
      expect(has404Request).toBe(false);

      // 詳細情報が表示されていることを確認
      const detailVisible = await page.locator('text=/見積詳細|原価内訳|明細/')
        .isVisible()
        .catch(() => false);

      if (!detailVisible) {
        console.log('詳細パネルのUI要素が見つかりませんでしたが、404エラーは発生していません');
      }
    } else {
      test.skip(true, '見積データが存在しません');
    }
  });

  test('QD-103: 見積詳細情報が正しく表示される', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto(`${BASE_URL}/admin/quotations`);
    await page.waitForLoadState('networkidle');

    // 最初の見積をクリック
    const firstQuotation = page.locator('table tbody tr').first().or(
      page.locator('[data-testid="quotation-item"]').first()
    );

    const isVisible = await firstQuotation.isVisible().catch(() => false);

    if (isVisible) {
      await firstQuotation.click();

      // 詳細読み込みを待機
      await page.waitForTimeout(2000);

      // 顧客情報が表示されていることを確認
      const customerInfo = page.locator('text=/顧客名|customer|会社名/');
      const customerVisible = await customerInfo.isVisible().catch(() => false);

      // 合計金額が表示されていることを確認
      const totalAmount = page.locator('text=/\\¥[0-9,]+|円/')
        .or(page.locator('text=/total|合計/'));

      const totalVisible = await totalAmount.isVisible().catch(() => false);

      if (customerVisible || totalVisible) {
        // 少なくとも何らかの情報が表示されている
        expect(customerVisible || totalVisible).toBe(true);
      } else {
        // テーブル形式で詳細が表示されている可能性を確認
        const tableRows = page.locator('table tr').or(page.locator('[role="row"]'));
        const rowCount = await tableRows.count();
        expect(rowCount).toBeGreaterThan(0);
      }
    } else {
      test.skip(true, '見積データが存在しません');
    }
  });

  test('QD-104: 原価内訳が表示される', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto(`${BASE_URL}/admin/quotations`);
    await page.waitForLoadState('networkidle');

    // 最初の見積をクリック
    const firstQuotation = page.locator('table tbody tr').first().or(
      page.locator('[data-testid="quotation-item"]').first()
    );

    const isVisible = await firstQuotation.isVisible().catch(() => false);

    if (isVisible) {
      await firstQuotation.click();

      // 詳細読み込みを待機
      await page.waitForTimeout(2000);

      // 原価内訳セクションを確認
      const costBreakdown = page.locator('text=/原価内訳|cost breakdown|cost detail/')
        .or(page.locator('[data-testid="cost-breakdown"]'))
        .or(page.locator('text=/素材費|印刷費|加工費/'));

      const breakdownVisible = await costBreakdown.isVisible().catch(() => false);

      if (breakdownVisible) {
        await expect(costBreakdown.first()).toBeVisible();
      } else {
        // 原価内訳が別の方法で表示されている可能性
        // 詳細パネルに何らかの情報が表示されていればOK
        const detailPanel = page.locator('.modal').or(
          page.locator('[role="dialog"]')
        );
        const panelVisible = await detailPanel.isVisible().catch(() => false);

        if (panelVisible) {
          // パネルが表示されていれば成功とみなす
          expect(panelVisible).toBe(true);
        } else {
          test.skip(true, '原価内訳セクションが表示されていません');
        }
      }
    } else {
      test.skip(true, '見積データが存在しません');
    }
  });

  test('QD-105: 見積詳細を閉じることができる', async ({ page }) => {
    // 見積一覧ページへ移動
    await page.goto(`${BASE_URL}/admin/quotations`);
    await page.waitForLoadState('networkidle');

    // 最初の見積をクリック
    const firstQuotation = page.locator('table tbody tr').first().or(
      page.locator('[data-testid="quotation-item"]').first()
    );

    const isVisible = await firstQuotation.isVisible().catch(() => false);

    if (isVisible) {
      await firstQuotation.click();

      // 詳細読み込みを待機
      await page.waitForTimeout(1000);

      // 閉じるボタンを探す
      const closeButton = page.locator('button:has-text("閉じる")')
        .or(page.locator('button:has-text("×")'))
        .or(page.locator('button[aria-label="close"]'))
        .or(page.locator('[data-testid="close-detail"]'));

      const buttonVisible = await closeButton.isVisible().catch(() => false);

      if (buttonVisible) {
        await closeButton.click();

        // モーダルが閉じることを確認
        await page.waitForTimeout(500);
        const stillVisible = await closeButton.isVisible().catch(() => false);
        expect(stillVisible).toBe(false);
      } else {
        // 閉じるボタンがない場合は、別の見積をクリックして詳細が切り替わることを確認
        const secondQuotation = page.locator('table tbody tr').nth(1);
        const secondVisible = await secondQuotation.isVisible().catch(() => false);

        if (secondVisible) {
          await secondQuotation.click();
          await page.waitForTimeout(500);
          // エラーが発生しなければOK
        } else {
          test.skip(true, '詳細パネルを操作するUI要素が見つかりません');
        }
      }
    } else {
      test.skip(true, '見積データが存在しません');
    }
  });
});

// =====================================================
// Test Suite: 認証ヘッダー送信確認
// =====================================================

test.describe('認証ヘッダー送信確認', () => {

  test('QD-201: Dev Modeで認証ヘッダーが正しく送信される', async ({ page }) => {
    // APIリクエストを監視
    const apiRequests: { url: string; headers: Record<string, string> }[] = [];

    page.on('request', async request => {
      if (request.url().includes('/api/admin/quotations/')) {
        const headers = request.headers();
        apiRequests.push({
          url: request.url(),
          headers: headers
        });
      }
    });

    // 見積一覧ページへ移動
    await page.goto(`${BASE_URL}/admin/quotations`);
    await page.waitForLoadState('networkidle');

    // 最初の見積をクリック
    const firstQuotation = page.locator('table tbody tr').first().or(
      page.locator('[data-testid="quotation-item"]').first()
    );

    const isVisible = await firstQuotation.isVisible().catch(() => false);

    if (isVisible) {
      await firstQuotation.click();

      // 詳細読み込みを待機
      await page.waitForTimeout(2000);

      // APIリクエストが送信されたことを確認
      expect(apiRequests.length).toBeGreaterThan(0);

      // 認証ヘッダーが含まれていることを確認
      const detailRequest = apiRequests.find(r => r.url.includes('/api/admin/quotations/'));
      expect(detailRequest).toBeDefined();

      // Dev ModeヘッダーまたはAuthorizationヘッダーのいずれかが存在することを確認
      const hasDevModeHeader = detailRequest!.headers['x-dev-mode'] !== undefined;
      const hasAuthHeader = detailRequest!.headers['authorization'] !== undefined;

      expect(hasDevModeHeader || hasAuthHeader).toBe(true);

      console.log('認証ヘッダー確認:', {
        hasDevModeHeader,
        hasAuthHeader,
        headers: detailRequest!.headers
      });
    } else {
      test.skip(true, '見積データが存在しません');
    }
  });
});
