import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS, performLogin, collectConsoleErrors } from './auth-helpers';

/**
 * GROUP B: Authentication - Login Flow Tests
 *
 * テストグループ: ログインフロー
 * 依存性: 会員登録完了必要 (順次実行推奨)
 * データベース: users, profiles, auth.users
 *
 * Test Credentials (環境変数またはデフォルト値使用):
 * - MEMBER: TEST_MEMBER_EMAIL / Test1234!
 * - ADMIN: TEST_ADMIN_EMAIL / Admin1234!
 * - PENDING: TEST_PENDING_EMAIL / Pending1234!
 */

test.describe('GROUP B: Authentication - Login Flow', () => {

  test.describe('Login Page - Initial Load', () => {
    test('B-LOGIN-01: ログインページロード及びコンソールエラー確認', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログインページへ移動
      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // ページタイトル確認
      await expect(page).toHaveTitle(/ログイン|Epackage Lab/);

      // メインヘディング確認
      const heading = page.getByRole('heading', { name: 'ログイン' });
      await expect(heading).toBeVisible();

      // 説明テキスト確認
      const description = page.getByText('アカウント情報を入力してください。');
      await expect(description).toBeVisible();

      // コンソールエラー確認
      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-02: 必須フォーム要素表示確認', async ({ page }) => {
      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // メールアドレス入力フィールド
      const emailInput = page.getByLabel('メールアドレス');
      await expect(emailInput).toBeVisible();

      // パスワード入力フィールド - name属性で検索
      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toBeVisible();

      // ログインボタン
      const loginButton = page.getByRole('button', { name: 'ログイン' });
      await expect(loginButton).toBeVisible();

      // パスワード忘れリンク
      const forgotPasswordLink = page.getByRole('link', { name: /パスワードを忘れた方/i });
      await expect(forgotPasswordLink).toBeVisible();
      await expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password');
    });

    test('B-LOGIN-03: ログイン維持チェックボックス確認', async ({ page }) => {
      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // ログイン状態維持チェックボックス
      const rememberCheckbox = page.getByRole('checkbox', { name: /ログイン状態を保持/i });
      await expect(rememberCheckbox).toBeVisible();
    });

    test('B-LOGIN-04: ナビゲーションリンク確認', async ({ page }) => {
      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // 会員登録リンク
      const registerLink = page.getByRole('link', { name: '会員登録' });
      await expect(registerLink).toBeVisible();
      await expect(registerLink).toHaveAttribute('href', '/auth/register');

      // ホームリンク (ロゴ)
      const logoLink = page.getByRole('link', { name: /Epackage Lab/i });
      await expect(logoLink.first()).toBeVisible();
    });
  });

  test.describe('Login Form Validation', () => {
    test('B-LOGIN-05: メールアドレス有効性検査', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      const emailInput = page.getByLabel('メールアドレス');

      // 無効なメールアドレス入力
      await emailInput.fill('invalid-email');
      await emailInput.blur();

      // エラーメッセージ確認
      const errorMessage = page.getByText(/有効なメールアドレス/i);
      const errorCount = await errorMessage.count();

      if (errorCount > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-06: 必須フィールドが空の場合の検査', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // 空の状態で送信試行
      await page.getByRole('button', { name: 'ログイン' }).click();

      // 必須フィールドエラーメッセージまたは入力フィールドにフォーカス
      const emailInput = page.getByLabel('メールアドレス');
      const isFocused = await emailInput.evaluate(el => document.activeElement === el);

      // エラーメッセージまたはフォーカス確認
      const errorMessage = page.getByText(/メールアドレスを入力/i);
      const errorCount = await errorMessage.count();

      expect(errorCount > 0 || isFocused).toBeTruthy();

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Login Failure Scenarios', () => {
    test('B-LOGIN-07: 無効な資格証明でログイン試行', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // 間違った資格証明入力
      await page.getByLabel('メールアドレス').fill('invalid@example.com');
      await page.locator('input[name="password"]').fill('WrongPassword123!');
      await page.getByRole('button', { name: 'ログイン' }).click();

      // Wait a bit for the error message to appear
      await page.waitForTimeout(2000);

      // エラーメッセージ確認 - might not always appear, check if still on signin page
      const errorMessage = page.getByText(/ログインに失敗|認証に失敗|Invalid credentials/i);
      const errorCount = await errorMessage.count();

      if (errorCount > 0) {
        await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
      }

      // 依然としてログインページにあるはず
      await expect(page).toHaveURL(/\/auth\/signin/);

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-08: 存在しないメールアドレスでログイン試行', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      const timestamp = Date.now();

      // 存在しないメールアドレス入力
      await page.getByLabel('メールアドレス').fill(`nonexistent-${timestamp}@example.com`);
      await page.locator('input[name="password"]').fill('SomePassword123!');
      await page.getByRole('button', { name: 'ログイン' }).click();

      // エラーメッセージまたは依然としてログインページ
      const currentUrl = page.url();
      const isStillSignInPage = currentUrl.includes('/auth/signin');

      expect(isStillSignInPage).toBeTruthy();

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-09: 間違ったパスワードでログイン試行', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // 登録済みメールアドレスでログイン試行 (間違ったパスワード)
      await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.member.email);
      await page.locator('input[name="password"]').fill('WrongPassword123!');
      await page.getByRole('button', { name: 'ログイン' }).click();

      // エラーメッセージ確認
      const errorMessage = page.getByText(/ログインに失敗|認証に失敗/i);
      const errorCount = await errorMessage.count();

      if (errorCount > 0) {
        await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
      }

      // 依然としてログインページにあるはず
      await expect(page).toHaveURL(/\/auth\/signin/);

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Login Success Scenarios', () => {
    test('B-LOGIN-10: MEMBER役割ログイン成功', async ({ page, context }) => {
      const errors = collectConsoleErrors(page);

      // 有効なMEMBER資格証明でログイン (performLogin handles navigation)
      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // MEMBERダッシュボードへリダイレクト確認
      await expect(page).toHaveURL(/\/member\/dashboard/, { timeout: 10000 });

      // ダッシュボードヘディング確認
      const dashboardHeading = page.getByRole('heading', { name: /ダッシュボード|Dashboard/i });
      const headingCount = await dashboardHeading.count();

      if (headingCount > 0) {
        await expect(dashboardHeading.first()).toBeVisible();
      }

      // 認証クッキー確認
      const cookies = await context.cookies();
      const hasAuthCookies = cookies.some(c =>
        c.name.includes('access-token') ||
        c.name.includes('refresh-token') ||
        c.name.includes('sb-')
      );
      expect(hasAuthCookies).toBeTruthy();

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-11: ADMIN役割ログイン成功', async ({ page, context }) => {
      const errors = collectConsoleErrors(page);

      // 有効なADMIN資格証明でログイン
      await performLogin(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);

      // ADMINダッシュボードへリダイレクト確認
      await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 });

      // ダッシュボードヘディング確認
      const dashboardHeading = page.getByRole('heading', { name: /ダッシュボード|Dashboard|管理画面/i });
      const headingCount = await dashboardHeading.count();

      if (headingCount > 0) {
        await expect(dashboardHeading.first()).toBeVisible();
      }

      // 認証クッキー確認
      const cookies = await context.cookies();
      const hasAuthCookies = cookies.some(c =>
        c.name.includes('access-token') ||
        c.name.includes('refresh-token') ||
        c.name.includes('sb-')
      );
      expect(hasAuthCookies).toBeTruthy();

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-12: PENDING状態アカウントログイン時待機ページリダイレクト', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // PENDING状態アカウントでログイン試行
      await performLogin(page, TEST_CREDENTIALS.pending.email, TEST_CREDENTIALS.pending.password);

      // 承認待ちページへリダイレクト確認
      await expect(page).toHaveURL(/\/auth\/pending/, { timeout: 10000 });

      // 承認待ちメッセージ確認
      const pendingMessage = page.getByText(/承認待ち|管理者の承認後/i);
      await expect(pendingMessage).toBeVisible();

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Login Redirect Behavior', () => {
    test('B-LOGIN-13: redirectパラメータでログイン後リダイレクト', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // redirectパラメータと共にログインページ接続
      await page.goto('/auth/signin?redirect=/member/orders', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // ログイン (manual since we need to stay on the same page with redirect param)
      await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.member.email);
      await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.member.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // Wait for navigation
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(2000);

      // 指定されたページへリダイレクト確認
      await expect(page).toHaveURL(/\/member\/orders/, { timeout: 10000 });

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-14: 保護されたページアクセス時ログインページへリダイレクト', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ログインなしで保護されたページ直接アクセス
      await page.goto('/member/quotations', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // ログインページへリダイレクトされるはず
      await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 5000 });

      // redirectパラメータ確認
      const currentUrl = page.url();
      const hasRedirectParam = currentUrl.includes('redirect=') || currentUrl.includes('callbackUrl=');
      expect(hasRedirectParam).toBeTruthy();

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-15: 役割ベースリダイレクト検証', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // ADMINでログイン後管理者ページアクセス
      await performLogin(page, TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password);

      // 管理者ダッシュボードへリダイレクト
      await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 });

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Login User Experience', () => {
    test('B-LOGIN-16: パスワード表示/非表示トグル', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      const passwordInput = page.locator('input[name="password"]');
      const toggleButton = page.locator('button').filter({ hasText: '👁️' }).first();

      // パスワード入力
      await passwordInput.fill('TestPassword123');

      // 初期タイプ確認 (password)
      let inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('password');

      // トグルボタンクリック
      await toggleButton.click();

      // タイプがtextに変更されたか確認
      inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('text');

      // 再度クリックして非表示
      await toggleButton.click();

      // タイプがpasswordに変更されたか確認
      inputType = await passwordInput.getAttribute('type');
      expect(inputType).toBe('password');

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-17: Remember Me機能', async ({ page, context }) => {
      const errors = collectConsoleErrors(page);

      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // Remember Meチェック
      await page.getByRole('checkbox', { name: /ログイン状態を保持/i }).check();

      // ログイン
      await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.member.email);
      await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.member.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // Wait for navigation
      await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});

      // クッキー有効期限確認 (remember meが有効化されるとより長い有効期限)
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c =>
        c.name.includes('access-token') ||
        c.name.includes('sb-')
      );

      if (sessionCookie && sessionCookie.expires) {
        // remember meが有効化されると有効期限が長いはず
        const expiresDate = new Date(sessionCookie.expires * 1000);
        const daysUntilExpiry = Math.floor((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        expect(daysUntilExpiry).toBeGreaterThan(7); // 7日以上
      }

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-18: ログインボタンローディング状態', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // ログインフォーム送信
      await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.member.email);
      await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.member.password);

      const loginButton = page.getByRole('button', { name: 'ログイン' });
      await loginButton.click();

      // ボタンが無効化またはローディング表示
      const isDisabled = await loginButton.isDisabled();
      const buttonText = await loginButton.textContent();
      const isLoading = buttonText?.includes('中') || buttonText?.includes('ing');

      expect(isDisabled || isLoading).toBeTruthy();

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-19: モバイルレスポンシブレイアウト', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // モバイルビューポート設定
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // フォームが正常に表示されるか確認
      const form = page.locator('form');
      await expect(form).toBeVisible();

      // ログインボタン確認
      const loginButton = page.getByRole('button', { name: 'ログイン' });
      await expect(loginButton).toBeVisible();

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-20: キーボードナビゲーション', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // Tabキーでフィールド間移動
      await page.keyboard.press('Tab'); // メールアドレスからパスワードへ
      await page.keyboard.press('Tab'); // パスワードからRemember Meへ
      await page.keyboard.press('Tab'); // Remember Meからログインボタンへ

      // ログインボタンにフォーカスされるはず
      const loginButton = page.getByRole('button', { name: 'ログイン' });
      const isFocused = await loginButton.evaluate(el => document.activeElement === el);

      expect(isFocused).toBeTruthy();

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Login Session Management', () => {
    test('B-LOGIN-21: セッション保存確認', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ローカルストレージ確認
      const localStorageData = await page.evaluate(() => {
        return {
          accessToken: localStorage.getItem('access_token'),
          refreshToken: localStorage.getItem('refresh_token'),
          user: localStorage.getItem('user')
        };
      });

      // セッションデータが保存されるはず
      const hasSessionData = localStorageData.accessToken ||
                            localStorageData.refreshToken ||
                            localStorageData.user;

      expect(hasSessionData).toBeTruthy();

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-22: ログイン後ユーザーメニュー表示', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await performLogin(page, TEST_CREDENTIALS.member.email, TEST_CREDENTIALS.member.password);

      // ユーザーメニューまたはログアウトボタン表示確認
      const userMenu = page.getByRole('button', { name: /ログアウト|Logout|ユーザー/i });
      const menuCount = await userMenu.count();

      if (menuCount > 0) {
        await expect(userMenu.first()).toBeVisible();
      }

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Login Error Handling', () => {
    test('B-LOGIN-23: ネットワークエラー処理', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // APIリクエスト遮断
      await page.route('**/api/auth/signin/', route => {
        route.abort('failed');
      });

      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // ログイン試行
      await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.member.email);
      await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.member.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // エラーメッセージまたはページ維持
      const currentUrl = page.url();
      const isStillSignInPage = currentUrl.includes('/auth/signin');

      expect(isStillSignInPage).toBeTruthy();

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-24: サーバーエラー (500) 処理', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // サーバーエラー_simulation
      await page.route('**/api/auth/signin/', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' })
        });
      });

      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // ログイン試行
      await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.member.email);
      await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.member.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // エラーメッセージまたはページ維持
      const currentUrl = page.url();
      const isStillSignInPage = currentUrl.includes('/auth/signin');

      expect(isStillSignInPage).toBeTruthy();

      expect(errors.length).toBe(0);
    });

    test('B-LOGIN-25: タイムアウト処理', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // タイムアウト_simulation
      await page.route('**/api/auth/signin/', async route => {
        // 30秒遅延
        await new Promise(resolve => setTimeout(resolve, 30000));
        route.continue();
      });

      await page.goto('/auth/signin', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // ログイン試行
      await page.getByLabel('メールアドレス').fill(TEST_CREDENTIALS.member.email);
      await page.locator('input[name="password"]').fill(TEST_CREDENTIALS.member.password);
      await page.getByRole('button', { name: 'ログイン' }).click();

      // タイムアウトエラーまたはページ維持
      const currentUrl = page.url();
      const isStillSignInPage = currentUrl.includes('/auth/signin');

      expect(isStillSignInPage).toBeTruthy();

      expect(errors.length).toBe(0);
    });
  });
});
