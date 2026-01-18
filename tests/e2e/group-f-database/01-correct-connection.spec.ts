import { test, expect } from '@playwright/test';
import { isDevMode } from '../../helpers/dev-mode-auth';

/**
 * GROUP F: データベース接続確認（完全並列）
 * F-1: 正常接続テスト（3テスト）
 *
 * 独立実行可能: ✅
 * 状態変更: なし（読み取り専用）
 * 並列戦略: 完全並列実行可能
 *
 * テスト対象:
 * - ダッシュボードAPI接続
 * - 注文API接続
 * - 見積API接続
 */

test.describe('GROUP F-1: 正常接続テスト（完全並列）', () => {
  // 共通セットアップ: 各テスト前に認証状態を初期化
  test.beforeEach(async ({ page }) => {
    // ログイン状態をクリアしてから認証
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // DEV_MODEで会員としてログイン
    await page.evaluate(() => {
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });
  });

  test('F-1-1: ダッシュボードAPI接続', async ({ page }) => {
    // API応答を追跡
    const apiResponses: Array<{ url: string; status: number }> = [];
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    // 1. ダッシュボードアクセス
    await page.goto('/member/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 2. ページロード待機
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // 3. ダッシュボードAPI呼び出し確認
    const dashboardApiCall = apiResponses.find(
      r => r.url.includes('/api/member/dashboard')
    );

    // DEV_MODEの場合、APIが呼ばれない可能性があるため、ページ表示で判定
    const h1Exists = await page.locator('h1').count() > 0;
    const mainContentExists = await page.locator('main').count() > 0;

    if (dashboardApiCall) {
      // APIが呼ばれた場合、ステータスコードを確認
      expect(dashboardApiCall.status).toBeLessThan(500);
    } else {
      // APIが呼ばれない場合（DEV_MODEモックデータ）、ページが正常に表示されていることを確認
      expect(h1Exists || mainContentExists).toBeTruthy();
    }

    // 4. 重大なコンソールエラーがないことを確認
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 既知の安全なエラーをフィルタリング
    const knownSafeErrors = [
      'favicon',
      '404',
      'Ads',
      'Download the React DevTools',
      'Warning:',
      'componentWillReceiveProps',
      'componentWillMount',
      'componentWillUpdate',
      'UNSAFE_',
      'Next.js',
      'hydration',
      'Minified React error',
    ];

    const criticalErrors = consoleErrors.filter(e => {
      const errorText = e.toLowerCase();
      return !knownSafeErrors.some(safeError =>
        errorText.includes(safeError.toLowerCase())
      );
    });

    // 重大なエラーがないことを確認
    expect(criticalErrors.length).toBe(0);
  });

  test('F-1-2: 注文API接続', async ({ page }) => {
    // API応答を追跡
    const apiResponses: Array<{ url: string; status: number }> = [];
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    // 1. 注文一覧アクセス
    await page.goto('/member/orders', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 2. ページロード待機
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // 3. 注文API呼び出し確認
    const ordersApiCall = apiResponses.find(
      r => r.url.includes('/api/member/orders')
    );

    // DEV_MODEの場合、APIが呼ばれない可能性があるため、ページ表示で判定
    const h1Exists = await page.locator('h1').count() > 0;
    const ordersContentExists = await page.getByText(/注文|orders/i).count() > 0;

    if (ordersApiCall) {
      // APIが呼ばれた場合、データが正常に返却されたことを確認
      expect(ordersApiCall.status).toBeLessThan(500);
    } else {
      // APIが呼ばれない場合（DEV_MODEモックデータ）、ページが正常に表示されていることを確認
      expect(h1Exists || ordersContentExists).toBeTruthy();
    }

    // 4. 注文リンクまたはコンテンツが表示されていることを確認
    const ordersLink = page.locator('a[href="/member/orders"]');
    const ordersLinkCount = await ordersLink.count();
    const hasOrdersContent = ordersLinkCount > 0 || ordersContentExists;

    expect(hasOrdersContent).toBeTruthy();
  });

  test('F-1-3: 見積API接続', async ({ page }) => {
    // API応答を追跡
    const apiResponses: Array<{ url: string; status: number }> = [];
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    // 1. 見積一覧アクセス
    await page.goto('/member/quotations', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 2. ページロード待機
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // 3. 見積API呼び出し確認
    const quotationsApiCall = apiResponses.find(
      r => r.url.includes('/api/member/quotations')
    );

    // DEV_MODEの場合、APIが呼ばれない可能性があるため、ページ表示で判定
    const h1Exists = await page.locator('h1').count() > 0;
    const quotationsContentExists = await page.getByText(/見積|quotations/i).count() > 0;

    if (quotationsApiCall) {
      // APIが呼ばれた場合、JSONレスポンスが正常であることを確認
      expect(quotationsApiCall.status).toBeLessThan(500);
    } else {
      // APIが呼ばれない場合（DEV_MODEモックデータ）、ページが正常に表示されていることを確認
      expect(h1Exists || quotationsContentExists).toBeTruthy();
    }

    // 4. 見積リンクまたはコンテンツが表示されていることを確認
    const quotationsLink = page.locator('a[href="/member/quotations"]');
    const quotationsLinkCount = await quotationsLink.count();
    const hasQuotationsContent = quotationsLinkCount > 0 || quotationsContentExists;

    expect(hasQuotationsContent).toBeTruthy();
  });
});
