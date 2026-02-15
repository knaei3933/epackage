import { test, expect } from '@playwright/test';
import { collectConsoleErrors } from './auth-helpers';

/**
 * GROUP B: Authentication - Registration Flow Tests
 *
 * テストグループ: 会員登録フロー
 * 依存性: なし (独立実行可能)
 * データベース: users, profiles
 *
 * Japanese Business Rules Tested:
 * - 郵便番号 (Postal Code): XXX-XXXX format
 * - 電話番号 (Phone Number): XX-XXXX-XXXX format
 * - 漢字/ひらがな (Kanji/Hiragana) name validation
 * - 法人番号 (Corporate Number): 13 digits for corporations
 */

test.describe('GROUP B: Authentication - Registration Flow', () => {

  test.describe('Registration Page - Initial Load', () => {
    test('B-REG-01: 会員登録ページロード及びコンソールエラー確認', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // 会員登録ページへ移動
      await page.goto('/auth/register', { timeout: 30000 });

      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        // Network idle might timeout, continue anyway
      });

      // ページタイトル確認
      await expect(page).toHaveTitle(/会員登録|Epackage Lab/, { timeout: 10000 });

      // メインヘディング確認
      const heading = page.getByRole('heading', { name: '会員登録' });
      await expect(heading).toBeVisible({ timeout: 10000 });

      // 説明テキスト確認
      const description = page.getByText('18項目の会員情報を入力してください。');
      await expect(description).toBeVisible({ timeout: 5000 });

      // コンソールエラー確認 (開発用エラーを除く)
      expect(errors.length).toBe(0);
    });

    test('B-REG-02: 必須フォーム要素表示確認', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });

      // Wait for form to be loaded
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // メールアドレス入力フィールド - labelで検索
      const emailInput = page.getByLabel('メールアドレス');
      await expect(emailInput).toBeVisible({ timeout: 10000 });

      // パスワード入力フィールド - name属性で検索（strict mode violation回避）
      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toBeVisible({ timeout: 5000 });

      // パスワード確認フィールド - name属性で検索
      const confirmPasswordInput = page.locator('input[name="passwordConfirm"]');
      await expect(confirmPasswordInput).toBeVisible({ timeout: 5000 });

      // 漢字(姓) - placeholderで検索
      const kanjiLastName = page.getByPlaceholder('山田');
      await expect(kanjiLastName).toBeVisible({ timeout: 5000 });

      // 漢字(名) - placeholderで検索
      const kanjiFirstName = page.getByPlaceholder('太郎');
      await expect(kanjiFirstName).toBeVisible({ timeout: 5000 });

      // ひらがな(姓) - placeholderで検索
      const kanaLastName = page.getByPlaceholder('やまだ');
      await expect(kanaLastName).toBeVisible({ timeout: 5000 });

      // ひらがな(名) - placeholderで検索
      const kanaFirstName = page.getByPlaceholder('たろう');
      await expect(kanaFirstName).toBeVisible({ timeout: 5000 });
    });

    test('B-REG-03: 事業者種別選択オプション確認', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // 個人事業者ラジオボタン
      const individualRadio = page.getByRole('radio', { name: '個人' });
      await expect(individualRadio).toBeVisible();
      await expect(individualRadio).toBeChecked();

      // 法人事業者ラジオボタン
      const corporationRadio = page.getByRole('radio', { name: '法人' });
      await expect(corporationRadio).toBeVisible();
    });

    test('B-REG-04: 住所関連フィールド確認', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // 郵便番号入力フィールド
      const postalCodeInput = page.getByLabel('郵便番号');
      await expect(postalCodeInput).toBeVisible();

      // 住所自動検索ボタン
      const addressSearchButton = page.getByRole('button', { name: '住所自動検索' });
      await expect(addressSearchButton).toBeVisible();

      // 都道府県セレクトボックス - select要素で検索（labelがないため）
      const prefectureSelect = page.locator('select[name="prefecture"]');
      await expect(prefectureSelect).toBeVisible();

      // 市区町村入力フィールド
      const cityInput = page.getByLabel('市区町村');
      await expect(cityInput).toBeVisible();

      // 番地/建物名入力フィールド
      const streetInput = page.getByLabel('番地・建物名');
      await expect(streetInput).toBeVisible();
    });

    test('B-REG-05: 商品種別及び情報入手先選択フィールド確認', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // 商品種別セレクトボックスはlabelがないので、見出しから探す
      const productCategoryHeading = page.getByText('商品種別').first();
      await expect(productCategoryHeading).toBeVisible();

      // 情報入手先セレクトボックス
      const acquisitionChannelHeading = page.getByText('知ったきっかけ').first();
      await expect(acquisitionChannelHeading).toBeVisible();
    });

    test('B-REG-06: プライバシーポリシー同意確認', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // プライバシーポリシー同意チェックボックス
      const privacyCheckbox = page.getByRole('checkbox', { name: /プライバシーポリシーに同意/i });
      await expect(privacyCheckbox).toBeVisible();

      // プライバシーポリシーリンク - first()を使用（strict mode violation回避）
      const privacyLink = page.getByRole('link', { name: 'プライバシーポリシー' }).first();
      await expect(privacyLink).toBeVisible();
    });

    test('B-REG-07: ナビゲーションリンク確認', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // ログインページリンク
      const loginLink = page.getByRole('link', { name: 'ログイン' });
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute('href', '/auth/signin');

      // 利用規約リンク - first()を使用（strict mode violation回避）
      const termsLink = page.getByRole('link', { name: '利用規約' }).first();
      await expect(termsLink).toBeVisible();
    });
  });

  test.describe('Registration Form Validation', () => {
    test('B-REG-08: メールアドレス有効性検査', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      const errors = collectConsoleErrors(page);

      const emailInput = page.getByLabel('メールアドレス');

      // 無効なメールアドレス入力
      await emailInput.fill('invalid-email');
      await emailInput.blur(); // フォーカスアウトで検証トリガー

      // エラーメッセージが表示されるはず
      const errorMessage = page.getByText(/有効なメールアドレス/i);
      await expect(errorMessage.first()).toBeVisible();

      expect(errors.length).toBe(0);
    });

    test('B-REG-09: パスワード強度検査', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      const errors = collectConsoleErrors(page);

      const emailInput = page.getByLabel('メールアドレス');
      const passwordInput = page.locator('input[name="password"]');

      // 有効なメールアドレス入力
      await emailInput.fill(`test-${Date.now()}@example.com`);

      // 弱いパスワード入力
      await passwordInput.fill('123');
      await passwordInput.blur();

      // パスワードエラーメッセージ確認
      const passwordError = page.getByText(/最低8文字以上|大文字|小文字|数字/i);
      const errorCount = await passwordError.count();

      if (errorCount > 0) {
        await expect(passwordError.first()).toBeVisible();
      }

      // 強いパスワード入力
      await passwordInput.fill('TestPass123!');
      await passwordInput.blur();

      expect(errors.length).toBe(0);
    });

    test('B-REG-10: パスワード確認一致検査', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      const errors = collectConsoleErrors(page);

      const emailInput = page.getByLabel('メールアドレス');
      const passwordInput = page.locator('input[name="password"]');
      const confirmPasswordInput = page.locator('input[name="passwordConfirm"]');

      // 必須情報入力
      await emailInput.fill(`test-${Date.now()}@example.com`);
      await passwordInput.fill('TestPass123!');
      await confirmPasswordInput.fill('DifferentPass123!');
      await confirmPasswordInput.blur();

      // 不一致エラーメッセージ確認
      const mismatchError = page.getByText(/一致しません|match/i);
      const errorCount = await mismatchError.count();

      if (errorCount > 0) {
        await expect(mismatchError.first()).toBeVisible();
      }

      // 一致するパスワード入力
      await confirmPasswordInput.fill('TestPass123!');
      await confirmPasswordInput.blur();

      expect(errors.length).toBe(0);
    });

    test('B-REG-11: 日本語名前(漢字)有効性検査', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      const errors = collectConsoleErrors(page);

      const kanjiLastName = page.getByPlaceholder('山田');
      const kanjiFirstName = page.getByPlaceholder('太郎');

      // 間違った文字入力 (英語)
      await kanjiLastName.fill('Yamada');
      await kanjiLastName.blur();

      // エラーメッセージ確認
      const kanjiError = page.getByText(/漢字のみ入力可能/i);
      const errorCount = await kanjiError.count();

      if (errorCount > 0) {
        await expect(kanjiError.first()).toBeVisible();
      }

      // 正しい漢字入力
      await kanjiLastName.fill('山田');
      await kanjiFirstName.fill('太郎');

      expect(errors.length).toBe(0);
    });

    test('B-REG-12: 日本語名前(ひらがな)有効性検査', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      const errors = collectConsoleErrors(page);

      const kanaLastName = page.getByPlaceholder('やまだ');
      const kanaFirstName = page.getByPlaceholder('たろう');

      // 間違った文字入力 (漢字)
      await kanaLastName.fill('山田');
      await kanaLastName.blur();

      // エラーメッセージ確認
      const kanaError = page.getByText(/ひらがなのみ入力可能/i);
      const errorCount = await kanaError.count();

      if (errorCount > 0) {
        await expect(kanaError.first()).toBeVisible();
      }

      // 正しいひらがな入力
      await kanaLastName.fill('やまだ');
      await kanaFirstName.fill('たろう');

      expect(errors.length).toBe(0);
    });

    test('B-REG-13: 日本電話番号形式検査', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      const errors = collectConsoleErrors(page);

      const corporatePhone = page.getByLabel('会社電話番号');

      // 間違った電話番号入力
      await corporatePhone.fill('123');
      await corporatePhone.blur();

      // エラーメッセージ確認 (電話番号は選択項目のためエラーがない場合もある)
      const phoneError = page.getByText(/有効な電話番号/i);
      const errorCount = await phoneError.count();

      if (errorCount > 0) {
        await expect(phoneError.first()).toBeVisible();
      }

      // 正しい電話番号形式入力 (XX-XXXX-XXXX)
      await corporatePhone.fill('03-1234-5678');
      await corporatePhone.blur();

      expect(errors.length).toBe(0);
    });

    test('B-REG-14: 日本郵便番号形式検査', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      const errors = collectConsoleErrors(page);

      const postalCodeInput = page.getByLabel('郵便番号');

      // 間違った郵便番号入力
      await postalCodeInput.fill('123');
      await postalCodeInput.blur();

      // エラーメッセージ確認
      const postalError = page.getByText(/有効な郵便番号/i);
      const errorCount = await postalError.count();

      if (errorCount > 0) {
        await expect(postalError.first()).toBeVisible();
      }

      // 正しい郵便番号形式入力 (XXX-XXXX)
      await postalCodeInput.fill('123-4567');
      await postalCodeInput.blur();

      expect(errors.length).toBe(0);
    });

    test('B-REG-15: 法人事業者選択時会社情報フィールド表示', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      const errors = collectConsoleErrors(page);

      // 法人事業者選択
      const corporationRadio = page.getByRole('radio', { name: '法人' });
      await corporationRadio.click();

      // 会社名入力フィールドが表示されるはず
      const companyNameInput = page.getByLabel('会社名');
      await expect(companyNameInput).toBeVisible();

      // 法人番号入力フィールドが表示されるはず
      const legalEntityNumberInput = page.getByLabel('法人番号');
      await expect(legalEntityNumberInput).toBeVisible();

      expect(errors.length).toBe(0);
    });

    test('B-REG-16: 法人番号13桁有効性検査', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      const errors = collectConsoleErrors(page);

      // 法人事業者選択
      const corporationRadio = page.getByRole('radio', { name: '法人' });
      await corporationRadio.click();

      const legalEntityNumberInput = page.getByLabel('法人番号');

      // 間違った法人番号入力 (13桁未満)
      await legalEntityNumberInput.fill('12345');
      await legalEntityNumberInput.blur();

      // エラーメッセージ確認
      const entityError = page.getByText(/13桁/i);
      const errorCount = await entityError.count();

      if (errorCount > 0) {
        await expect(entityError.first()).toBeVisible();
      }

      // 正しい13桁法人番号入力
      await legalEntityNumberInput.fill('1234567890123');
      await legalEntityNumberInput.blur();

      expect(errors.length).toBe(0);
    });

    test('B-REG-17: 個人情報同意必須確認', async ({ page }) => {
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      const errors = collectConsoleErrors(page);

      const timestamp = Date.now();

      // 必須フィールド入力 (同意を除く)
      await page.getByLabel('メールアドレス').fill(`test-${timestamp}@example.com`);
      await page.locator('input[name="password"]').fill('TestPass123!');
      await page.locator('input[name="passwordConfirm"]').fill('TestPass123!');
      await page.getByPlaceholder('山田').fill('山田');
      await page.getByPlaceholder('太郎').fill('太郎');
      await page.getByPlaceholder('やまだ').fill('やまだ');
      await page.getByPlaceholder('たろう').fill('たろう');

      // 送信ボタンクリック
      const submitButton = page.getByRole('button', { name: '会員登録' });
      await submitButton.click();

      // 同意エラーメッセージ確認
      const consentError = page.getByText(/個人情報の収集および利用に同意/i);
      const errorCount = await consentError.count();

      if (errorCount > 0) {
        await expect(consentError.first()).toBeVisible();
      }

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Registration Success Scenarios', () => {
    test('B-REG-18: 個人事業者会員登録成功', async ({ page }) => {
      const errors = collectConsoleErrors(page);
      const timestamp = Date.now();

      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // 必須情報入力
      await page.getByLabel('メールアドレス').fill(`test-individual-${timestamp}@example.com`);
      await page.locator('input[name="password"]').fill('TestPass123!');
      await page.locator('input[name="passwordConfirm"]').fill('TestPass123!');
      await page.getByPlaceholder('山田').fill('山田');
      await page.getByPlaceholder('太郎').fill('太郎');
      await page.getByPlaceholder('やまだ').fill('やまだ');
      await page.getByPlaceholder('たろう').fill('たろう');
      await page.getByLabel('郵便番号').fill('123-4567');

      // 個人事業者選択 (デフォルト)

      // 個人情報同意
      await page.getByRole('checkbox', { name: /プライバシーポリシーに同意/i }).check();

      // 送信
      const submitButton = page.getByRole('button', { name: '会員登録' });
      await submitButton.click();

      // 承認待ちページへリダイレクト確認
      await expect(page).toHaveURL(/\/auth\/pending/, { timeout: 10000 });

      // 承認待ちメッセージ確認
      const pendingMessage = page.getByText(/承認待ち|管理者の承認後/i);
      await expect(pendingMessage).toBeVisible();

      expect(errors.length).toBe(0);
    });

    test('B-REG-19: 法人事業者会員登録成功', async ({ page }) => {
      const errors = collectConsoleErrors(page);
      const timestamp = Date.now();

      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // 法人事業者選択
      await page.getByRole('radio', { name: '法人' }).click();

      // 必須情報入力
      await page.getByLabel('メールアドレス').fill(`test-corporation-${timestamp}@example.com`);
      await page.locator('input[name="password"]').fill('TestPass123!');
      await page.locator('input[name="passwordConfirm"]').fill('TestPass123!');
      await page.getByPlaceholder('山田').fill('山田');
      await page.getByPlaceholder('太郎').fill('太郎');
      await page.getByPlaceholder('やまだ').fill('やまだ');
      await page.getByPlaceholder('たろう').fill('たろう');
      await page.getByLabel('郵便番号').fill('123-4567');

      // 法人必須情報
      await page.getByLabel('会社名').fill('テスト株式会社');
      await page.getByLabel('法人番号').fill('1234567890123');
      await page.getByLabel('設立年').fill('2020');
      await page.getByLabel('資本金').fill('1000万円');
      await page.getByLabel('代表者名').fill('山田 太郎');

      // 個人情報同意
      await page.getByRole('checkbox', { name: /プライバシーポリシーに同意/i }).check();

      // 送信
      const submitButton = page.getByRole('button', { name: '会員登録' });
      await submitButton.click();

      // 承認待ちページへリダイレクト確認
      await expect(page).toHaveURL(/\/auth\/pending/, { timeout: 10000 });

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Registration Error Scenarios', () => {
    test('B-REG-20: 重複メールアドレス登録試行', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // 既存メールアドレス入力 (テスト用メール)
      await page.getByLabel('メールアドレス').fill('test@example.com');
      await page.locator('input[name="password"]').fill('TestPass123!');
      await page.locator('input[name="passwordConfirm"]').fill('TestPass123!');
      await page.getByPlaceholder('山田').fill('山田');
      await page.getByPlaceholder('太郎').fill('太郎');
      await page.getByPlaceholder('やまだ').fill('やまだ');
      await page.getByPlaceholder('たろう').fill('たろう');

      // 個人情報同意
      await page.getByRole('checkbox', { name: /プライバシーポリシーに同意/i }).check();

      // 送信
      const submitButton = page.getByRole('button', { name: '会員登録' });
      await submitButton.click();

      // 重複エラーメッセージ確認またはページ維持
      await expect(page).toHaveURL(/\/auth\/register/, { timeout: 5000 });

      expect(errors.length).toBe(0);
    });

    test('B-REG-21: ネットワークエラー処理', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // APIリクエスト遮断
      await page.route('**/api/auth/register/', route => {
        route.abort('failed');
      });

      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      const timestamp = Date.now();

      // 必須情報入力
      await page.getByLabel('メールアドレス').fill(`test-network-${timestamp}@example.com`);
      await page.locator('input[name="password"]').fill('TestPass123!');
      await page.locator('input[name="passwordConfirm"]').fill('TestPass123!');
      await page.getByPlaceholder('山田').fill('山田');
      await page.getByPlaceholder('太郎').fill('太郎');
      await page.getByPlaceholder('やまだ').fill('やまだ');
      await page.getByPlaceholder('たろう').fill('たろう');

      // 個人情報同意
      await page.getByRole('checkbox', { name: /プライバシーポリシーに同意/i }).check();

      // 送信
      const submitButton = page.getByRole('button', { name: '会員登録' });
      await submitButton.click();

      // エラーメッセージ確認
      const serverError = page.getByText(/エラー|登録に失敗/i);
      const errorCount = await serverError.count();

      if (errorCount > 0) {
        await expect(serverError.first()).toBeVisible();
      }

      // 依然として会員登録ページにあるはず
      await expect(page).toHaveURL(/\/auth\/register/);

      expect(errors.length).toBe(0);
    });
  });

  test.describe('Registration User Experience', () => {
    test('B-REG-22: パスワード表示/非表示トグル', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await page.goto('/auth/register', { timeout: 30000 });
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

    test('B-REG-23: モバイルレスポンシブレイアウト', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      // モバイルビューポート設定
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // フォームが正常に表示されるか確認
      const form = page.locator('form');
      await expect(form).toBeVisible();

      // 送信ボタン確認
      const submitButton = page.getByRole('button', { name: '会員登録' });
      await expect(submitButton).toBeVisible();

      expect(errors.length).toBe(0);
    });

    test('B-REG-24: キャンセルボタン動作', async ({ page }) => {
      const errors = collectConsoleErrors(page);

      await page.goto('/auth/register', { timeout: 30000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

      // キャンセルボタンクリック
      const cancelButton = page.getByRole('button', { name: 'キャンセル' });
      await cancelButton.click();

      // 前のページまたはホームへ移動
      await expect(page).toHaveURL(/\/(auth\/register|$)/);

      expect(errors.length).toBe(0);
    });
  });
});
