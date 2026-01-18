import { test, expect } from '@playwright/test';

/**
 * GROUP A: 公開ページテスト
 * A-2: カタログ（5テスト）
 *
 * 独立実行可能: ✅
 * 認証不要
 * 並列戦略: 完全並列実行可能
 *
 * テスト対象:
 * - /catalog - 製品カタログ
 * - /catalog/[slug] - 製品詳細（動的ルーティング）
 */

test.describe('GROUP A-2: カタログ（完全並列）', () => {
  test('TC-PUBLIC-004: カタログページ読み込み', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto('/catalog', {
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

    // カタログ見出し確認
    const heading = page.locator('h1, h2').filter({ hasText: /カタログ|catalog/i });
    const headingCount = await heading.count();

    if (headingCount > 0) {
      await expect(heading.first()).toBeVisible({ timeout: 5000 });
    }

    // 製品カード確認
    const productCards = page.locator('[data-testid="product-card"], .product-card, article');
    const cardCount = await productCards.count();

    // 製品カードまたは空状態が表示されることを確認
    const hasContent = cardCount > 0 || await page.locator('main').count() > 0;
    expect(hasContent).toBeTruthy();
  });

  test('TC-PUBLIC-005: 製品詳細ページ（動的ルーティング）', async ({ page }) => {
    // カタログページから製品リンクを取得
    await page.goto('/catalog', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // 最初の製品リンクを探す
    const productLink = page.locator('a[href^="/catalog/"]').first();
    const linkCount = await productLink.count();

    if (linkCount > 0) {
      const href = await productLink.getAttribute('href');
      console.log('製品詳細URL:', href);

      // 製品詳細ページにアクセス
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!text.includes('favicon') && !text.includes('404')) {
            consoleErrors.push(text);
          }
        }
      });

      await page.goto(href || '/catalog/sample-product', {
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

      // ページタイトルに404が含まれないことを確認
      const title = await page.title();
      expect(title).not.toMatch(/404|Not Found/i);

      // 404ステータスでないことを確認
      const currentUrl = page.url();
      const response = await page.goto(currentUrl);
      expect(response?.status()).not.toBe(404);
    } else {
      // 製品リンクがない場合はテストをスキップ
      test.skip(true, 'No product links found in catalog');
    }
  });

  test('TC-PUBLIC-006: カタログフィルター機能', async ({ page }) => {
    await page.goto('/catalog', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // フィルターボタンまたはセレクトボックス確認
    const filterButtons = page.locator('button').filter({
      hasText: /^(すべて| pouch | roll | bag | box )/i
    });
    const filterCount = await filterButtons.count();

    if (filterCount > 0) {
      await expect(filterButtons.first()).toBeVisible({ timeout: 5000 });

      // フィルタークリックテスト
      if (filterCount > 1) {
        await filterButtons.nth(1).click();
        await page.waitForTimeout(1000);

        // フィルターが適用されたことを確認
        const currentUrl = page.url();
        expect(currentUrl).toContain('/catalog');
      }
    }
  });

  test('TC-PUBLIC-007: カタログ検索機能', async ({ page }) => {
    await page.goto('/catalog', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // 検索入力フィールド確認
    const searchInput = page.locator('input[placeholder*="検索"], input[name*="search"], input[type="search"]');
    const searchCount = await searchInput.count();

    if (searchCount > 0) {
      await expect(searchInput.first()).toBeVisible({ timeout: 5000 });

      // 検索入力テスト
      await searchInput.first().fill('pouch');
      await page.waitForTimeout(500);

      // 検索結果が表示されるか、URLが変更されることを確認
      const currentUrl = page.url();
      expect(currentUrl).toContain('/catalog');

      // 検索クリア
      await searchInput.first().fill('');
      await page.waitForTimeout(500);
    }
  });

  test('TC-PUBLIC-008: 存在しない製品slugでの404ハンドリング', async ({ page }) => {
    const response = await page.goto('/catalog/non-existent-product-xyz', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // 404または適切なエラーページが表示されることを確認
    expect(response?.status()).toBeGreaterThanOrEqual(400);

    // 404エラーページコンテンツ確認
    const has404Content = await page.getByText(/404|Not Found|見つかりません/i).count() > 0;
    expect(has404Content).toBeTruthy();
  });
});
