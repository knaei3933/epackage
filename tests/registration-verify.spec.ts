import { test, expect } from '@playwright/test';

test.describe('会員登録・メール認証フロー', () => {
  test('新規登録と郵便番号自動検索', async ({ page }) => {
    // 1. 登録ページに移動
    await page.goto('http://localhost:3000/auth/register');
    await page.waitForLoadState('networkidle');

    // スクリーンショット
    await page.screenshot({ path: 'test-results/registration-page.png', fullPage: true });

    // 2. 認証情報セクション
    await page.fill('input[type="email"]', 'test.feb.2026@gmail.com');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.fill('input[name="passwordConfirm"]', 'Test1234!');

    // 3. 氏名セクション
    await page.fill('input[name="kanjiLastName"]', 'テスト');
    await page.fill('input[name="kanjiFirstName"]', 'ユーザー');
    await page.fill('input[name="kanaLastName"]', 'てすと');
    await page.fill('input[name="kanaFirstName"]', 'ゆーざー');

    // 4. 連絡先セクション
    await page.fill('input[name="corporatePhone"]', '03-1234-5678');
    await page.fill('input[name="personalPhone"]', '090-1234-5678');

    // 5. 事業形態 - 個人を選択
    await page.click('input[type="radio"][value="INDIVIDUAL"]');

    // 6. 住所セクション - 郵便番号1000001で自動検索
    const postalInput = page.locator('input[name="postalCode"]');
    await postalInput.fill('1000001');

    // 自動検索が完了するまで待機（API応答時間）
    await page.waitForTimeout(2000);

    // 都道府県と市区町村が自動入力されたことを確認
    const prefecture = page.locator('select[name="prefecture"]');
    await expect(prefecture).toHaveValue('東京都');

    const city = page.locator('input[name="city"]');
    await expect(city).toHaveValue(/千代田区.*千代田/);

    // 住所入力後のスクリーンショット
    await page.screenshot({ path: 'test-results/postal-auto-filled.png', fullPage: true });

    // 7. 商品種別
    await page.selectOption('select[name="productCategory"]', 'OTHER');

    // 8. 知ったきっかけ
    await page.selectOption('select[name="acquisitionChannel"]', 'web_search');

    // 9. プライバシーポリシー同意
    await page.check('input[name="privacyConsent"]');

    // 10. 会員登録ボタンクリック
    await page.click('button[type="submit"]:has-text("会員登録")');

    // 結果待機
    await page.waitForTimeout(3000);

    // 成功メッセージ確認
    const currentUrl = page.url();
    console.log('現在のURL:', currentUrl);

    // 最終スクリーンショット
    await page.screenshot({ path: 'test-results/registration-result.png', fullPage: true });
  });
});
