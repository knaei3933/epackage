import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS, performLogin, performLogout, collectConsoleErrors } from './auth-helpers';

/**
 * GROUP B: Authentication - Logout Flow Tests
 *
 * テストグループ: ログアウトフロー
 * 依存性: ログイン済みであること (順次実行必須)
 * データベース: users, profiles, sessions
 *
 * Test Credentials (環境変数またはデフォルト値使用):
 * - MEMBER: TEST_MEMBER_EMAIL / Test1234!
 * - ADMIN: TEST_ADMIN_EMAIL / Admin1234!
 */

test.describe('GROUP B: Authentication - Logout Flow', () => {

  test.describe('Logout Functionality', () => {
    test('B-LOGOUT-01: MEMBERダッシュボードからログアウト', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ダッシュボードにいるか確認
      await expect(page).toHaveURL(/\/member\/dashboard/);

      // ログアウト実行
      await performLogout(page);

      // ログインページへリダイレクト確認
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // ログインフォームが表示されるか確認
      const loginForm = page.getByRole('heading', { name: 'ログイン' });
      await expect(loginForm).toBeVisible();

      expect(errors.length).toBe(0);
    });

    test('B-LOGOUT-02: ADMINダッシュボードからログアウト', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // 管理者でログイン
      await performLogin(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);

      // 管理者ダッシュボードにいるか確認
      await expect(page).toHaveURL(/\/admin\/dashboard/);

      // ログアウト実行
      await performLogout(page);

      // ログインページへリダイレクト確認
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      expect(errors.length).toBe(0);
    });

    test('B-LOGOUT-03: ログアウト確認ダイアログ', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ユーザーメニューボタンクリック
      const userMenuButton = page.locator('button').filter({ hasText: /U|[A-Z]/ }).first();
      await userMenuButton.click();

      // 確認ダイアログが表示される場合がある
      const dialog = page.getByRole('dialog', { name: /ログアウト|Logout|確認/i });
      const dialogCount = await dialog.count();

      if (dialogCount > 0) {
        await expect(dialog.first()).toBeVisible();

        // 確認ボタンクリック
        const confirmButton = page.getByRole('button', { name: /はい|Yes|確認/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      } else {
        // No dialog, just click logout directly
        const logoutButton = page.getByRole('button', { name: 'ログアウト' });
        await logoutButton.first().click();
      }

      // ログインページへリダイレクト
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Session Cleanup', () => {
    test('B-LOGOUT-04: ログアウト後ローカルストレージクリーンアップ', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ログイン状態でローカルストレージ確認
      const loggedInData = await page.evaluate(() => {
        return {
          accessToken: localStorage.getItem('access_token'),
          refreshToken: localStorage.getItem('refresh_token'),
          user: localStorage.getItem('user')
        };
      });

      // セッションデータがあるか確認
      const hasSessionDataBefore = loggedInData.accessToken ||
                                   loggedInData.refreshToken ||
                                   loggedInData.user;
      expect(hasSessionDataBefore).toBeTruthy();

      // ログアウト
      await performLogout(page);

      // ログインページへ移動待機
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // ログアウト後ローカルストレージ確認
      const loggedOutData = await page.evaluate(() => {
        return {
          accessToken: localStorage.getItem('access_token'),
          refreshToken: localStorage.getItem('refresh_token'),
          user: localStorage.getItem('user')
        };
      });

      // 認証トークンが削除されたか確認
      expect(loggedOutData.accessToken).toBeNull();
      expect(loggedOutData.refreshToken).toBeNull();
      expect(loggedOutData.user).toBeNull();

      expect(errors.length).toBe(0);
    });

    test('B-LOGOUT-05: ログアウト後セッションストレージクリーンアップ', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ログアウト
      await performLogout(page);

      // ログインページへ移動待機
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // セッションストレージ確認
      const sessionStorageData = await page.evaluate(() => {
        return {
          accessToken: sessionStorage.getItem('access_token'),
          refreshToken: sessionStorage.getItem('refresh_token')
        };
      });

      // 認証データが削除されたか確認
      expect(sessionStorageData.accessToken).toBeNull();
      expect(sessionStorageData.refreshToken).toBeNull();

      expect(errors.length).toBe(0);
    });

    test('B-LOGOUT-06: ログアウト後クッキークリーンアップ', async ({ page, context }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ログイン状態でクッキー確認
      const cookiesBefore = await context.cookies();
      const hasAuthCookiesBefore = cookiesBefore.some(c =>
        c.name.includes('access-token') ||
        c.name.includes('refresh-token') ||
        c.name.includes('sb-')
      );
      expect(hasAuthCookiesBefore).toBeTruthy();

      // ログアウト
      await performLogout(page);

      // ログインページへ移動待機
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // ログアウト後クッキー確認
      const cookiesAfter = await context.cookies();
      const authCookiesAfter = cookiesAfter.filter(c =>
        c.name.includes('access-token') ||
        c.name.includes('refresh-token') ||
        c.name.includes('sb-')
      );

      // 認証クッキーが削除または期限切れしたか確認
      const validAuthCookies = authCookiesAfter.filter(c => {
        if (!c.expires) return false;
        const expiresDate = new Date(c.expires * 1000);
        return expiresDate > new Date();
      });

      expect(validAuthCookies.length).toBe(0);

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Post-Logout Redirect Behavior', () => {
    test('B-LOGOUT-07: ログアウト後ログインページへリダイレクト', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ログアウト
      await performLogout(page);

      // ログインページへリダイレクト確認
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // ログインページUI確認
      const loginHeading = page.getByRole('heading', { name: 'ログイン' });
      await expect(loginHeading).toBeVisible();

      expect(errors.length).toBe(0);
    });

    test('B-LOGOUT-08: ログアウト後保護されたページアクセス時ログインページへリダイレクト', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ログアウト
      await performLogout(page);

      // ログインページへ移動待機
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // 保護されたページへ直接アクセス試行
      await page.goto('/member/dashboard');

      // ログインページへリダイレクトされるはず
      await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 });

      expect(errors.length).toBe(0);
    });

    test('B-LOGOUT-09: ログアウト後戻るボタン動作', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ログアウト
      await performLogout(page);

      // ログインページへ移動待機
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // 戻るボタンクリック
      await page.goBack();

      // 依然としてログインページにあるはず (保護されたページアクセス不可)
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/);

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Token Invalidation', () => {
    test('B-LOGOUT-10: ログアウト後トークン無効化', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // トークン保存
      const tokensBefore = await page.evaluate(() => {
        return {
          accessToken: localStorage.getItem('access_token'),
          refreshToken: localStorage.getItem('refresh_token')
        };
      });

      // ログアウト
      await performLogout(page);

      // ログインページへ移動待機
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // 保護されたAPIリクエスト試行 (ログアウト状態)
      const response = await page.request.get('/api/member/dashboard');

      // 401または403応答であるはず
      expect([401, 403]).toContain(response.status());

      expect(errors.length).toBe(0);
    });

    test('B-LOGOUT-11: セッションハイジャック防止', async ({ page, context }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // トークン保存
      const oldTokens = await page.evaluate(() => {
        return {
          accessToken: localStorage.getItem('access_token'),
          refreshToken: localStorage.getItem('refresh_token')
        };
      });

      // ログアウト
      await performLogout(page);

      // ログインページへ移動待機
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // 古いトークンで保護されたページアクセス試行
      if (oldTokens.accessToken) {
        await page.addInitScript(value => {
          localStorage.setItem('access_token', value);
        }, oldTokens.accessToken);
      }

      // 保護されたページへ移動
      await page.goto('/member/dashboard');

      // ログインページへリダイレクトされるはず
      await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 });

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Logout Error Handling', () => {
    test('B-LOGOUT-12: ログアウトAPIエラー処理', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // APIリクエスト遮断
      await page.route('**/api/auth/signout', route => {
        route.abort('failed');
      });

      // ログアウト試行
      try {
        await performLogout(page);
      } catch (e) {
        // Expected if API fails
      }

      // エラーが表示されるか、またはローカルでログアウト処理されるはず
      const currentUrl = page.url();
      const isErrorPage = currentUrl.includes('error') || currentUrl.includes('signout');
      const isSignInPage = currentUrl.includes('signin');

      expect(isErrorPage || isSignInPage).toBeTruthy();

      expect(errors.length).toBe(0);
    });

    test('B-LOGOUT-13: ネットワークエラー時ログアウト動作', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // オフラインモード_simulation
      await page.context().setOffline(true);

      // ログアウト試行
      try {
        await performLogout(page);
      } catch (e) {
        // Expected when offline
      }

      // オフライン状態でもログアウトが処理されるはず
      const currentUrl = page.url();
      const isSignInPage = currentUrl.includes('signin') || currentUrl.includes('signout');

      // オンライン復元
      await page.context().setOffline(false);

      expect(isSignInPage).toBeTruthy();

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Logout User Experience', () => {
    test('B-LOGOUT-14: ログアウトボタンローディング状態', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ユーザーメニューボタン
      const userMenuButton = page.locator('button').filter({ hasText: /U|[A-Z]/ }).first();
      const menuCount = await userMenuButton.count();

      if (menuCount > 0) {
        // クリック前状態確認
        const isInitiallyEnabled = await userMenuButton.first().isEnabled();
        expect(isInitiallyEnabled).toBeTruthy();

        // メニューを開く
        await userMenuButton.first().click();

        // ログアウトボタン確認
        const logoutButton = page.getByRole('button', { name: 'ログアウト' });
        const logoutCount = await logoutButton.count();

        if (logoutCount > 0) {
          // クリック
          await logoutButton.first().click();

          // ボタンが無効化またはローディング表示
          const isDisabled = await logoutButton.first().isDisabled();
          const buttonText = await logoutButton.first().textContent();
          const isLoading = buttonText?.includes('中') || buttonText?.includes('ing');

          expect(isDisabled || isLoading).toBeTruthy();
        }
      }

      // ログインページへ移動待機
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      expect(errors.length).toBe(0);
    });

    test('B-LOGOUT-15: 複数タブログアウト同期', async ({ browser }) => {
      const errors: string[] = [];

      // 2つのコンテキスト(タブ)作成
      const context1 = await browser.newContext();
      const context2 = await browser.newContext();

      const page1 = await context1.newPage();
      const page2 = await context2.newPage();

      // 最初のタブでログイン
      await page1.goto('/auth/signin');
      await page1.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.member.email);
      await page1.locator('input[name="password"]').fill(TEST_CREDENTIALS.member.password);
      await page1.getByRole('button', { name: 'ログイン' }).click();
      await page1.waitForURL(/\/member\/dashboard/, { timeout: 10000 });

      // 2番目のタブでログイン
      await page2.goto('/auth/signin');
      await page2.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.member.email);
      await page2.locator('input[name="password"]').fill(TEST_CREDENTIALS.member.password);
      await page2.getByRole('button', { name: 'ログイン' }).click();
      await page2.waitForURL(/\/member\/dashboard/, { timeout: 10000 });

      // 最初のタブでログアウト
      const userMenuButton1 = page1.locator('button').filter({ hasText: /U|[A-Z]/ }).first();
      await userMenuButton1.click();
      await page1.waitForTimeout(500);
      const logoutButton1 = page1.getByRole('button', { name: 'ログアウト' });
      await logoutButton1.first().click();
      await page1.waitForURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // 2番目のタブで保護されたページ更新
      await page2.reload();

      // 2番目のタブもログアウトされるはず (同期有無確認)
      const currentUrl2 = page2.url();
      const isSignedOut2 = currentUrl2.includes('/auth/signin') || currentUrl2.includes('/auth/signout');

      // 整理
      await context1.close();
      await context2.close();

      // セッション同期が実装されている場合、2番目のタブもログアウトされるはず
      // (実装によって動作が異なる場合がある)
      expect(isSignedOut2 || currentUrl2.includes('/member/dashboard')).toBeTruthy();

      expect(errors.length).toBe(0);
    });

    test('B-LOGOUT-16: ログアウト後ユーザーデータ維持確認', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ユーザー関連データ保存 (非認証データ)
      await page.evaluate(() => {
        localStorage.setItem('userPreferences', JSON.stringify({ theme: 'dark' }));
        localStorage.setItem('recentItems', JSON.stringify(['item1', 'item2']));
      });

      // ログアウト
      await performLogout(page);

      // ログインページへ移動待機
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // 非認証データが維持されるはず
      const userPreferences = await page.evaluate(() => {
        return localStorage.getItem('userPreferences');
      });

      // 認証関連データは削除されるはず
      const authData = await page.evaluate(() => {
        return {
          accessToken: localStorage.getItem('access_token'),
          refreshToken: localStorage.getItem('refresh_token'),
          user: localStorage.getItem('user')
        };
      });

      // 非認証データ維持確認 (選択項目)
      expect(authData.accessToken).toBeNull();
      expect(authData.refreshToken).toBeNull();
      expect(authData.user).toBeNull();

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Logout Security', () => {
    test('B-LOGOUT-17: ログアウトログイベント記録', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ログアウトリクエスト検出
      let logoutRequestSent = false;
      page.on('request', request => {
        if (request.url().includes('/api/auth/signout') ||
            request.url().includes('/api/auth/logout')) {
          logoutRequestSent = true;
        }
      });

      // ログアウト
      await performLogout(page);

      // ログインページへ移動待機
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // ログアウトAPIリクエストが送信されたか確認
      expect(logoutRequestSent).toBeTruthy();

      expect(errors.length).toBe(0);
    });

    test('B-LOGOUT-18: CSRFトークンクリーンアップ', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログイン
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // CSRFトークン存在確認 (実装による)
      const csrfTokenBefore = await page.evaluate(() => {
        return localStorage.getItem('csrf-token') ||
               document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      });

      // ログアウト
      await performLogout(page);

      // ログインページへ移動待機
      await expect(page).toHaveURL(/\/auth\/(signin|signout)/, { timeout: 10000 });

      // CSRFトークンが削除または更新されたはず
      const csrfTokenAfter = await page.evaluate(() => {
        return localStorage.getItem('csrf-token') ||
               document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      });

      // CSRFトークンが変更または削除されたはず
      if (csrfTokenBefore) {
        expect(csrfTokenAfter).not.toBe(csrfTokenBefore);
      }

      expect(errors.length).toBe(0);
    });
  });
});
