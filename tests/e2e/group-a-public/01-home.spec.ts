import { test, expect } from '@playwright/test';

/**
 * GROUP A: 公開ページテスト
 * A-1: ホームページ（3テスト）
 *
 * 独立実行可能: ✅
 * 認証不要
 * 並列戦略: 完全並列実行可能
 *
 * テスト対象:
 * - / - トップページ
 * - /about - 会社概要
 * - /news - ニュース
 */

test.describe('GROUP A-1: ホームページ（完全並列）', () => {
  test('TC-PUBLIC-001: トップページ読み込み', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // 既知の安全なエラーをフィルタリング
        if (!text.includes('favicon') && !text.includes('404') && !text.includes('Ads')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/', {
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
    const h1 = page.locator('h1');
    const h1Count = await h1.count();

    if (h1Count > 0) {
      await expect(h1.first()).toBeVisible({ timeout: 5000 });
    } else {
      const mainContent = page.locator('main');
      await expect(mainContent.first()).toBeVisible({ timeout: 5000 });
    }

    // 404でないことを確認
    const response = await page.goto('/');
    expect(response?.status()).not.toBe(404);
  });

  test('TC-PUBLIC-002: 会社概要ページ', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/about', {
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

    // ページタイトル確認
    const currentUrl = page.url();
    expect(currentUrl).toContain('/about');

    // 会社概要コンテンツ確認
    const hasAboutContent = await page.getByText(/会社|about|会社概要/i).count() > 0;
    expect(hasAboutContent).toBeTruthy();
  });

  test('TC-PUBLIC-003: ニュースページ', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/news', {
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
    expect(currentUrl).toContain('/news');

    // ニュースコンテンツまたは空状態確認
    const hasNewsContent = await page.locator('main, article, .news-item').count() > 0;
    expect(hasNewsContent).toBeTruthy();
  });
});
