import { test, expect } from '@playwright/test';

/**
 * GROUP A: 公開ページテスト
 * A-3: 見積ツール（4テスト）
 *
 * 独立実行可能: ✅
 * 認証不要
 * 並列戦略: 完全並列実行可能
 *
 * テスト対象:
 * - /quote-simulator - 見積シミュレーター
 * - /smart-quote - スマート見積
 * - /roi-calculator - ROI計算機（/quote-simulatorへリダイレクト）
 */

test.describe('GROUP A-3: 見積ツール（完全並列）', () => {
  test('TC-PUBLIC-009: 見積シミュレーターページ読み込み', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/quote-simulator', {
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

    // 見積ツールコンポーネントがマウントされていることを確認
    const h1 = page.locator('h1');
    const h1Count = await h1.count();

    if (h1Count > 0) {
      await expect(h1.first()).toBeVisible({ timeout: 5000 });
    } else {
      const mainContent = page.locator('main');
      await expect(mainContent.first()).toBeVisible({ timeout: 5000 });
    }

    // Reactコンポーネントがマウントされていることを確認
    const hasReactRoot = await page.locator('#__next').count();
    expect(hasReactRoot).toBe(1);
  });

  test('TC-PUBLIC-010: ROI計算機から見積シミュレーターへのリダイレクト', async ({ page }) => {
    await page.goto('/roi-calculator', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // クライアントサイドで /quote-simulator にリダイレクトされることを確認
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('/quote-simulator');

    expect(isRedirected).toBeTruthy();
  });

  test('TC-PUBLIC-011: スマート見積ページ', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/smart-quote', {
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
    expect(currentUrl).toContain('/smart-quote');

    // 見積フォームコンポーネント確認
    const hasQuoteForm = await page.locator('form, button:has-text("見積"), button:has-text("申請")').count() > 0;
    expect(hasQuoteForm).toBeTruthy();
  });

  test('TC-PUBLIC-012: 見積ステップUI確認', async ({ page }) => {
    await page.goto('/quote-simulator', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(3000);

    // ステップインジケーターまたは進行状況バー確認
    const stepIndicator = page.locator('[role="progressbar"], .step-indicator, .progress-bar');
    const stepCount = await stepIndicator.count();

    // ステップインジケーターがある場合、表示を確認
    if (stepCount > 0) {
      await expect(stepIndicator.first()).toBeVisible({ timeout: 5000 });
    }

    // 製品選択または基本情報入力エリア確認
    const hasPouchTypeSelector = await page.locator('button:has-text("Pouch"), button:has-text("Roll")').count() > 0;
    const hasBasicInfoForm = await page.locator('input[name*="size"], input[name*="quantity"]').count() > 0;

    expect(hasPouchTypeSelector || hasBasicInfoForm).toBeTruthy();
  });
});
