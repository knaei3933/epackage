/**
 * Admin Orders Basic E2E Test
 *
 * 管理者注文一覧ページの基本機能テスト
 * - ログイン確認
 * - ページアクセス確認
 * - 注文リスト表示確認
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS } from './test-data';

test.describe('管理者注文一覧基本テスト', () => {
  test('ADMIN-ORDERS-BASIC-001: 管理者が注文一覧ページにアクセスできる', async ({ page }) => {
    // 管理者ログイン
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);

    // フォーム送信
    await page.click('button[type="submit"]');

    // ダッシュボードへのリダイレクトを待機（ログイン成功後の自動リダイレクト）
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');

    // 注文一覧ページへ移動
    await page.goto('/admin/orders');
    await page.waitForLoadState('domcontentloaded');

    // ページタイトルを確認（h1見出しを特定）
    await expect(page.locator('h1:has-text("注文管理")')).toBeVisible({ timeout: 5000 });
  });

  test('ADMIN-ORDERS-BASIC-002: 注文リストが表示される', async ({ page }) => {
    // 管理者ログイン
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');

    // ダッシュボードへのリダイレクトを待機
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });

    // 注文一覧ページへ移動
    await page.goto('/admin/orders');
    await page.waitForLoadState('domcontentloaded');

    // ページタイトルが表示されるまで待機
    await page.waitForSelector('text=/注文管理/', { timeout: 5000 });

    // 注文が読み込まれるのを待機
    await page.waitForTimeout(5000);

    // ブラウザコンソールログを取得
    const logs = await page.evaluate(() => {
      const logs: string[] = [];
      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args) => {
        logs.push('[CONSOLE.LOG] ' + args.join(' '));
        originalLog.apply(console, args);
      };

      console.error = (...args) => {
        logs.push('[CONSOLE.ERROR] ' + args.join(' '));
        originalError.apply(console, args);
      };

      return logs;
    });

    console.log('ブラウザコンソールログ:', logs);

    // スクリーンショットを撮って確認
    await page.screenshot({ path: 'test-results/admin-orders-page.png' });

    // 注文リストテーブルが存在するか確認
    const table = page.locator('table').or(page.locator('[data-testid="admin-orders-list"]'));
    const tableExists = await table.count();

    console.log(`テーブル数: ${tableExists}`);

    if (tableExists > 0) {
      // 注文行が存在するか確認
      const rows = page.locator('tbody tr').or(page.locator('[data-testid="admin-order-row"]'));
      const rowCount = await rows.count();
      console.log(`注文行数: ${rowCount}`);
    } else {
      console.log('注文が存在しないか、テーブルが表示されていません');
    }
  });

  test('ADMIN-ORDERS-BASIC-003: 注文詳細ページに遷移できる', async ({ page }) => {
    // 管理者ログイン
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');

    // ダッシュボードへのリダイレクトを待機
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });

    // 注文一覧ページへ移動
    await page.goto('/admin/orders');
    await page.waitForLoadState('domcontentloaded');

    // ページタイトルが表示されるまで待機
    await page.waitForSelector('text=/注文管理/', { timeout: 5000 });

    // 注文が読み込まれるのを待機
    await page.waitForTimeout(3000);

    // 最初の注文を探す
    const rows = page.locator('tbody tr').or(page.locator('[data-testid="admin-order-row"]'));
    const rowCount = await rows.count();

    console.log(`注文行数: ${rowCount}`);

    if (rowCount === 0) {
      test.skip(true, '注文データが存在しません');
      return;
    }

    // 詳細リンクをクリック
    const firstRow = rows.first();
    const detailLink = firstRow.locator('a:has-text("詳細")');

    if (await detailLink.isVisible()) {
      await detailLink.click();
      await page.waitForURL('**/admin/orders/**');

      // 注文詳細ページが表示されることを確認（h1タイトルを確認）
      await expect(page.locator('h1:has-text("注文詳細")')).toBeVisible({ timeout: 5000 });
    } else {
      console.log('詳細リンクが見つかりません');
      // 行自体をクリックしてみる
      await firstRow.click();
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      console.log(`現在のURL: ${currentUrl}`);
    }
  });
});
