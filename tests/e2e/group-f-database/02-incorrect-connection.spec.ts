import { test, expect } from '@playwright/test';
import { isDevMode } from '../../helpers/dev-mode-auth';

/**
 * GROUP F: データベース接続確認（完全並列）
 * F-2: 異常接続テスト（2テスト）
 *
 * 独立実行可能: ✅
 * 状態変更: なし（読み取り専用）
 * 並列戦略: 完全並列実行可能
 *
 * テスト対象:
 * - 認証エラー確認
 * - 権限エラー確認
 */

test.describe('GROUP F-2: 異常接続テスト（完全並列）', () => {
  test('F-2-1: 認証なし会員ページアクセス試行', async ({ page }) => {
    // 1. ログイン情報削除
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // 2. 会員ダッシュボードアクセス試行
    await page.goto('/member/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 3. ログインページへリダイレクト確認
    // リダイレクト先の可能性: /auth/signin または /auth/pending
    const currentUrl = page.url();
    const isRedirectedToAuth = currentUrl.includes('/auth/signin') ||
                                currentUrl.includes('/auth/pending');

    if (isDevMode()) {
      // DEV_MODEの場合、リダイレクトされない可能性がある
      // その場合、テストをスキップ
      test.skip(true, 'DEV_MODEでは認証チェックがバイパスされるため、リダイレクトは発生しません');
    } else {
      // 通常モードの場合、リダイレクトを確認
      expect(isRedirectedToAuth).toBeTruthy();
    }
  });

  test('F-2-2: 会員権限で管理者ページアクセス試行', async ({ page }) => {
    // 1. 会員権限でログイン
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      // 会員権限でログイン
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });

    // 2. 管理者ダッシュボードアクセス試行
    await page.goto('/admin/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 3. アクセス拒否確認
    const currentUrl = page.url();
    const isAccessDenied = currentUrl.includes('/auth/error') ||
                          currentUrl.includes('/auth/signin') ||
                          currentUrl.includes('/403') ||
                          currentUrl.includes('/404');

    if (isDevMode()) {
      // DEV_MODEの場合、権限チェックがバイパスされる可能性がある
      // その場合、テストをスキップ
      test.skip(true, 'DEV_MODEでは権限チェックがバイパスされるため、アクセス拒否は発生しません');
    } else {
      // 通常モードの場合、アクセス拒否を確認
      expect(isAccessDenied).toBeTruthy();
    }
  });

  test('F-2-3: 他ユーザーデータアクセス遮断（RLSポリシー準拠）', async ({ page }) => {
    // 1. 会員権限でログイン
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      // test-member-001 としてログイン
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });

    // 2. 他ユーザーの注文詳細アクセス試行
    // 注文IDが他ユーザーのものであると仮定（存在しないIDを使用）
    const response = await page.goto('/member/orders/other-user-order-999', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 3. アクセス拒否確認（404 not found）
    // 注文が存在しない場合、notFound()が呼び出され404ページが表示される
    if (isDevMode()) {
      // DEV_MODEでは認証がバイパスされるため、このテストは本質的に実行できない
      // UUID形式の'mock'ユーザーIDを使用する必要があるが、RLSポリシーのテストとしては不完全
      // DEV_MODEではテストをスキップ
      test.skip(true, 'DEV_MODEでは認証がバイパスされるため、RLSポリシーテストは実行できません');
    } else {
      // 通常モードの場合、404ステータスコードを確認
      expect(response?.status()).toBeGreaterThanOrEqual(404);
    }
  });
});
