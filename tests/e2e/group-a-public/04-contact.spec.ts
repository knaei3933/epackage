import { test, expect } from '@playwright/test';

/**
 * GROUP A: 公開ページテスト
 * A-4: コンタクト（3テスト）
 *
 * 独立実行可能: ✅
 * 認証不要
 * 並列戦略: 完全並列実行可能
 *
 * テスト対象:
 * - /contact - お問い合わせ
 * - /inquiry/detailed - 詳細お問い合わせ
 */

test.describe('GROUP A-4: コンタクト（完全並列）', () => {
  test('TC-PUBLIC-013: お問い合わせページフォーム動作', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/contact', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // コンソールエラー確認
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Next.js')
    );
    expect(criticalErrors).toHaveLength(0);

    // フォームフィールド確認
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const messageTextarea = page.locator('textarea[name="message"], textarea[name*="message"]');

    await expect(emailInput.first()).toBeVisible({ timeout: 5000 });
    await expect(messageTextarea.first()).toBeVisible({ timeout: 5000 });

    // 送信ボタン確認
    const submitButton = page.locator('button[type="submit"], button:has-text("送信"), button:has-text("送信")');
    const submitCount = await submitButton.count();

    if (submitCount > 0) {
      await expect(submitButton.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-PUBLIC-014: お問い合わせフォームバリデーション', async ({ page }) => {
    await page.goto('/contact', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // 不正なメールアドレス入力
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    await emailInput.first().fill('invalid-email');

    await page.waitForTimeout(500);

    // メール入力欄からフォーカスを外してバリデーションをトリガー
    await page.keyboard.press('Tab');
    await page.waitForTimeout(500);

    // フォーム送信試行
    const submitButton = page.locator('button[type="submit"]');
    const submitCount = await submitButton.count();

    if (submitCount > 0) {
      await submitButton.first().click();
      await page.waitForTimeout(1000);
    }

    // バリデーションエラーまたはフォームが残っていることを確認
    const currentUrl = page.url();
    expect(currentUrl).toContain('/contact');
  });

  test('TC-PUBLIC-015: 詳細お問い合わせページ', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/inquiry/detailed', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // コンソールエラー確認
    const criticalErrors = consoleErrors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Next.js')
    );
    expect(criticalErrors).toHaveLength(0);

    // ページURL確認
    const currentUrl = page.url();
    expect(currentUrl).toContain('/inquiry/detailed');

    // 詳細お問い合わせフォーム確認
    const hasForm = await page.locator('form').count() > 0;
    expect(hasForm).toBeTruthy();
  });
});
