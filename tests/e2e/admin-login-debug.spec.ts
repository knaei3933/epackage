/**
 * Admin Login Debug Test
 *
 * 管理者ログインのデバッグテスト
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS } from './test-data';

test.describe('管理者ログインデバッグ', () => {
  test('DEBUG-001: ログイン後にCookieが設定されるか確認', async ({ page }) => {
    // コンテキストをクリアして新しいセッションで開始
    const context = page.context();
    await context.clearCookies();

    // ログインページへ移動
    await page.goto('/auth/signin');

    // フォームに入力
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);

    // 送信前にクッキーを確認
    const cookiesBefore = await context.cookies();
    console.log('送信前のクッキー:', cookiesBefore.length);

    // フォーム送信
    const responsePromise = page.waitForResponse(resp => resp.url().includes('/api/auth/signin'));
    await page.click('button[type="submit"]');

    // APIレスポンスを取得
    const response = await responsePromise;
    const responseText = await response.text();
    console.log('APIレスポンス:', responseText.substring(0, 200));

    // 5秒待機してリダイレクトを待つ
    await page.waitForTimeout(5000);

    // 送信後のクッキーを確認
    const cookiesAfter = await context.cookies();
    console.log('送信後のクッキー数:', cookiesAfter.length);
    console.log('送信後のクッキー:', cookiesAfter.map(c => ({
      name: c.name,
      value: c.value ? c.value.substring(0, 20) + '...' : 'empty',
      domain: c.domain,
      path: c.path,
      httpOnly: c.httpOnly,
      secure: c.secure
    })));

    // 現在のURLを確認
    console.log('現在のURL:', page.url());
  });

  test('DEBUG-002: ダッシュボードへ直接移動して認証状態を確認', async ({ page }) => {
    // コンテキストをクリア
    const context = page.context();
    await context.clearCookies();

    // まずログイン
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');

    // ログイン処理完了を待機
    await page.waitForTimeout(3000);

    // ダッシュボードへ移動
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // ページタイトルまたはURLを確認
    console.log('ダッシュボードURL:', page.url());

    // ログインページにリダイレクトされていないことを確認
    expect(page.url()).not.toContain('/auth/signin');

    // ダッシュボードのコンテンツが表示されることを確認
    const bodyText = await page.textContent('body');
    console.log('ページテキスト（先頭100文字）:', bodyText?.substring(0, 100));
  });
});
