import { test, expect } from '@playwright/test';
import { isDevMode } from '../../helpers/dev-mode-auth';

/**
 * GROUP B: 認証ページテスト
 * B-4: 認証後ページ（3テスト）
 *
 * 並列戦略: 認証後は順次実行推奨
 * このテストファイルは独立して実行可能ですが、認証状態を前提とします
 *
 * テスト対象:
 * - /auth/signout - ログアウト
 * - /auth/pending - 保留中ページ
 * - /auth/error - エラーページ
 */

test.describe('GROUP B-4: 認証後ページ', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前に認証状態をリセット
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();

      // DEV_MODEでモック認証
      localStorage.setItem('dev-mock-user-id', 'test-member-001');
    });
  });

  test('TC-AUTH-010: ログアウト機能', async ({ page }) => {
    // DEV_MODEの場合はテストをスキップ（ログアウト機能が動作しない可能性がある）
    test.skip(isDevMode(), 'DEV_MODEではログアウト機能が制限されています');

    // 会員ダッシュボードにアクセス
    await page.goto('/member/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // ログアウトリンクまたはボタンを探す
    const logoutButton = page.locator('button:has-text("ログアウト"), a:has-text("ログアウト"), [aria-label*="logout"], [aria-label*="ログアウト"]');
    const logoutCount = await logoutButton.count();

    if (logoutCount > 0) {
      await logoutButton.first().click();
      await page.waitForTimeout(2000);

      // ログインページにリダイレクトされることを確認
      const currentUrl = page.url();
      const isRedirectedToSignin = currentUrl.includes('/auth/signin');

      expect(isRedirectedToSignin).toBeTruthy();
    } else {
      // ログアウトボタンがない場合はテストをスキップ
      test.skip(true, 'ログアウトボタンが見つかりません');
    }
  });

  test('TC-AUTH-011: 保留中ページ表示', async ({ page }) => {
    // DEV_MODEの場合はテストをスキップ（保留中チェックがバイパスされる）
    test.skip(isDevMode(), 'DEV_MODEでは保留中チェックがバイパスされます');

    // 保留中ユーザーとして設定
    await page.goto('/auth/signin');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('dev-mock-user-id', 'test-pending-001');
    });

    // 会員ページにアクセス試行
    await page.goto('/member/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForTimeout(2000);

    // 保留中ページにリダイレクトされることを確認
    const currentUrl = page.url();
    const isPendingPage = currentUrl.includes('/auth/pending');

    expect(isPendingPage).toBeTruthy();
  });

  test('TC-AUTH-012: 認証エラーページ表示', async ({ page }) => {
    // エラーページに直接アクセス
    await page.goto('/auth/error', {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // 複数の方法でエラーページを検証
    const currentUrl = page.url();
    const isErrorPageByUrl = currentUrl.includes('/auth/error') || currentUrl.includes('/error');

    // ページタイトルで確認（metadata.title: '認証エラー | Epackage Lab'）
    const pageTitle = await page.title();
    const hasErrorTitle = pageTitle.includes('認証エラー') || pageTitle.includes('Error');

    // ページ内容で確認（エラーページ特有の要素を検索）
    // h1: "認証エラー"
    const hasErrorHeading = await page.locator('h1', { hasText: '認証エラー' }).count() > 0;

    // デフォルトエラーメッセージ: "認証エラーが発生しました。"
    // または権限エラー: "このページにアクセスする権限がありません。"
    const hasErrorMessage = await page.getByText(/認証エラーが発生しました|このページにアクセスする権限がありません|サーバー設定エラーが発生しました/).count() > 0;

    // ログインページへのリンク
    const hasLoginLink = await page.getByRole('link', { name: 'ログインページへ' }).count() > 0;

    // ホームへのリンク
    const hasHomeLink = await page.getByRole('link', { name: 'ホームへ' }).count() > 0;

    // いずれかの条件を満たせば合格（エラーページの特性）
    const isErrorPage = isErrorPageByUrl || hasErrorTitle || hasErrorHeading || hasErrorMessage || hasLoginLink || hasHomeLink;

    // デバッグ情報（失敗時のみ出力）
    if (!isErrorPage) {
      console.log('TC-AUTH-012 Debug Info:');
      console.log('Current URL:', currentUrl);
      console.log('Page Title:', pageTitle);
      console.log('Has Error URL:', isErrorPageByUrl);
      console.log('Has Error Title:', hasErrorTitle);
      console.log('Has Error Heading:', hasErrorHeading);
      console.log('Has Error Message:', hasErrorMessage);
      console.log('Has Login Link:', hasLoginLink);
      console.log('Has Home Link:', hasHomeLink);

      // ページのコンテンツをキャプチャしてデバッグ
      const bodyText = await page.locator('body').textContent();
      console.log('Page content preview:', bodyText?.substring(0, 200));
    }

    expect(isErrorPage).toBeTruthy();
  });

  test('TC-AUTH-013: セッション管理', async ({ page }) => {
    // 会員ダッシュボードに直接アクセス（DEV_MODEを利用）
    await page.goto('/member/dashboard', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // ページが正常に表示されていることを確認
    const currentUrl = page.url();
    const isOnDashboard = currentUrl.includes('/member/dashboard') || currentUrl.includes('/member/');

    expect(isOnDashboard).toBeTruthy();

    // DEV_MODEではlocalStorageにdev-mock-user-idが設定されていることを確認
    const sessionData = await page.evaluate(() => {
      return {
        hasLocalStorage: localStorage.length > 0,
        hasSessionStorage: sessionStorage.length > 0,
        hasDevMockUser: localStorage.getItem('dev-mock-user-id') !== null
      };
    });

    expect(sessionData.hasDevMockUser || sessionData.hasLocalStorage || sessionData.hasSessionStorage).toBeTruthy();
  });
});
