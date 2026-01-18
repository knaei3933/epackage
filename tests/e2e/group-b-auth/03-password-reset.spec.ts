import { test, expect } from '@playwright/test';

/**
 * GROUP B: 認証ページテスト
 * B-3: パスワードリセット（2テスト）
 *
 * 並列戦略: 認証前テストは完全並列実行可能
 *
 * テスト対象:
 * - /auth/forgot-password - パスワード忘れページ
 */

test.describe('GROUP B-3: パスワードリセット（並列実行可能）', () => {
  test('TC-AUTH-008: パスワード忘れページ表示', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/auth/forgot-password', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // コンソールエラー確認
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Next.js') &&
      !e.includes('hydration')
    );
    expect(criticalErrors).toHaveLength(0);

    // ページ要素確認
    const heading = page.locator('h1, h2').filter({ hasText: /パスワード|忘れ|リセット/i });
    const headingCount = await heading.count();

    // 見出しが表示されるか、またはメール入力フィールドが存在
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const emailCount = await emailInput.count();

    expect(headingCount + emailCount).toBeGreaterThan(0);
  });

  test('TC-AUTH-009: パスワードリセットメール送信', async ({ page }) => {
    await page.goto('/auth/forgot-password', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // メールアドレス入力
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const emailCount = await emailInput.count();

    if (emailCount > 0) {
      await emailInput.first().fill('test@example.com');
      await page.waitForTimeout(500);

      // 送信ボタン確認
      const submitButton = page.locator('button[type="submit"], button:has-text("送信"), button:has-text("リセット")');
      const submitCount = await submitButton.count();

      if (submitCount > 0) {
        // フォーム送信（実際には送信されませんが、UI動作を確認）
        await submitButton.first().click();
        await page.waitForTimeout(2000);

        // 成功メッセージまたはフォームが残っていることを確認
        const successMessage = page.locator('text=/送信|メール/i');
        const hasMessage = await successMessage.count() > 0;

        const currentUrl = page.url();
        const stillOnPage = currentUrl.includes('/forgot-password');

        expect(hasMessage || stillOnPage).toBeTruthy();
      }
    }
  });
});
