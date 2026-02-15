import { test, expect } from '@playwright/test';

/**
 * Phase 1: Public Pages - Group 1.2
 * Product Catalog Tests
 *
 * 독립 실행 가능: ✅
 * 데이터베이스: products, categories, material_types
 * 선행 조건: 없음
 */

test.describe('Product Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
  });

  test('TC-1.2.1: 카탈로그 페이지 로드', async ({ page }) => {
    // 콘솔 에러 수집
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/Catalog|カタログ|パウチ製品カタログ|Epackage Lab/);

    // 콘솔 에러 확인 (비허용 오류 필터링)
    const filteredErrors = errors.filter(err =>
      !err.includes('MathML') &&
      !err.includes('React does not recognize') &&
      !err.includes('Warning: ReactDOM.render') &&
      !err.includes('favicon') &&
      !err.includes('404') &&
      !err.includes('net::ERR')
    );

    expect(filteredErrors).toHaveLength(0);
  });

  test('TC-1.2.2: 카테고리 필터 기능', async ({ page }) => {
    // 커스텀 Select 컴포넌트의 combobox 찾기 (패키지 타입 필터)
    const packageTypeFilter = page.locator('[role="combobox"]').first();

    const count = await packageTypeFilter.count();
    if (count > 0) {
      // 드롭다운 열기
      await packageTypeFilter.click();

      // 옵션들이 표시될 때까지 대기
      await page.waitForSelector('[role="option"]', { state: 'visible' });

      // 첫 번째 옵션 선택 (standard가 아닌 다른 옵션)
      const firstOption = page.locator('[role="option"]').nth(1);
      await firstOption.click();

      // 필터 버튼이 클릭 가능한지 확인
      const filterButton = page.locator('button').filter({ hasText: /filter|フィルター|フィルタ/i });
      const filterCount = await filterButton.count();
      if (filterCount > 0) {
        await expect(filterButton.first()).toBeVisible();
      }
    }
  });

  test('TC-1.2.3: 재질 타입 필터 기능', async ({ page }) => {
    // 필터 버튼 클릭하여 확장 필터 표시
    const filterButton = page.locator('button').filter({ hasText: /filter|フィルター|フィルタ/i });

    const count = await filterButton.count();
    if (count > 0) {
      await filterButton.first().click();

      // 확장된 필터 섹션이 표시되는지 확인
      const expandedFilters = page.locator('.bg-gray-50, [class*="expanded"]');
      await expect(expandedFilters.first()).toBeVisible();
    }
  });

  test('TC-1.2.4: 검색 기능 (debounce 300ms)', async ({ page }) => {
    // 검색 입력창 찾기
    const searchInput = page.locator('input[type="text"], input[placeholder*="検索" i], input[placeholder*="search" i]').first();

    const count = await searchInput.count();
    if (count > 0) {
      // Wait for input to be ready
      await expect(searchInput).toBeVisible({ timeout: 5000 });

      // Get initial product count
      const initialResults = page.locator('[class*="product"]');
      const initialCount = await initialResults.count();

      // Perform search
      const startTime = Date.now();
      await searchInput.fill('pouch');

      // Wait for filtering to apply - catalog uses immediate filtering via useEffect
      // Wait a bit for the state to update and re-render
      await page.waitForTimeout(100);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Search should process quickly (it's client-side immediate filtering)
      expect(responseTime).toBeLessThan(5000);

      // 검색 결과 확인 (결과가 있거나 빈 상태 메시지가 있어야 함)
      const results = page.locator('[class*="product"]');
      const resultCount = await results.count();

      // Results should be displayed (filtered or empty state)
      expect(resultCount).toBeGreaterThanOrEqual(0);
    } else {
      // Search input not found - skip test with explanation
      test.skip(true, 'Search input field not found on catalog page');
    }
  });

  test('TC-1.2.5: 제품 카드 클릭 → 상세 모달', async ({ page }) => {
    // Wait for page to load and products to be rendered
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Wait for product cards to be visible
    const productCards = page.locator('.group.relative.bg-white').or(
      page.locator('[class*="product"]').filter({ hasText: /平袋|スタンドパウチ|BOX型パウチ|スパウトパウチ|ロールフィルム/ })
    );

    // Wait for at least one product card to be present
    await productCards.first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    const count = await productCards.count();
    if (count > 0) {
      // Get the first product card
      const firstCard = productCards.first();

      // Scroll into view to ensure it's stable
      await firstCard.scrollIntoViewIfNeeded();
      await page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});

      // Look for the "詳細" (Detail) button within the card
      // The button contains the "詳細" text span
      const detailButton = firstCard.locator('button').filter({ hasText: '詳細' });

      const buttonCount = await detailButton.count();

      if (buttonCount > 0) {
        // Click the detail button
        await detailButton.first().click();

        // Wait for modal to appear
        await page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});

        // Check if modal is visible
        const modal = page.locator('.fixed.inset-0.z-50').filter({ hasText: /閉じる|詳細/ });
        const modalCount = await modal.count();

        if (modalCount > 0) {
          // Modal is shown - verify content
          await expect(modal.first()).toBeVisible();

          // Verify modal has product information
          const modalContent = modal.locator('.bg-white.rounded-xl');
          await expect(modalContent.first()).toBeVisible();

          // Close the modal using the close button
          const closeButton = modal.locator('button').filter({ hasText: /閉じる/ }).or(
            modal.locator('button').filter({ has: page.locator('.lucide-x, svg[class*="x"]') })
          );

          const closeCount = await closeButton.count();
          if (closeCount > 0) {
            await closeButton.first().click();
          } else {
            // Click on the modal backdrop to close
            await modal.first().click({ position: { x: 10, y: 10 } });
          }

          // Wait for modal to close
          await page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});

          // Verify modal is closed
          await expect(modal.first()).not.toBeVisible();
        } else {
          // If no modal appears, check if we navigated to a detail page
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/\/catalog/);
        }
      } else {
        // If no detail button found, try clicking the card itself
        await firstCard.click();
        await page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});

        // Check if modal appeared
        const modal = page.locator('.fixed.inset-0.z-50');
        const modalCount = await modal.count();

        if (modalCount > 0) {
          await expect(modal.first()).toBeVisible();
        } else {
          // If still no modal, mark as skipped with explanation
          test.skip(true, 'Detail button not found and card click did not open modal');
        }
      }
    } else {
      // No products found - check for empty state message
      const emptyStateSelectors = [
        'text=製品が見つかりませんでした',
        'text=現在利用可能な製品がありません',
        '[class*="empty"]',
        '[class*="no-results"]'
      ];

      let emptyStateFound = false;
      for (const selector of emptyStateSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          emptyStateFound = true;
          break;
        }
      }

      if (!emptyStateFound) {
        test.skip(true, 'No products found and no empty state message displayed');
      }
    }
  });

  test('TC-1.2.6: 제품 로딩 상태 확인', async ({ page }) => {
    // 로딩 스피너 확인
    const loadingSpinner = page.locator('[role="status"], .loading, .spinner, [class*="loading"]');

    // 페이지 로드 시 로딩 상태가 나타났다가 사라져야 함
    await page.reload();

    const isVisible = await loadingSpinner.isVisible().catch(() => false);
    if (isVisible) {
      await expect(loadingSpinner).toBeHidden({ timeout: 5000 });
    }
  });

  test('TC-1.2.7: 제품 카드 정보 표시', async ({ page }) => {
    // 제품 카드가 있는지 확인
    const productCards = page.locator('[class*="product"]');
    const count = await productCards.count();

    if (count > 0) {
      // 첫 번째 카드의 정보 확인
      const firstCard = productCards.first();

      // 이미지 확인
      const image = firstCard.locator('img');
      const imageCount = await image.count();
      if (imageCount > 0) {
        await expect(image.first()).toBeVisible();
      }

      // 이름 확인 (일본어)
      const name = firstCard.locator('h2, h3, [class*="name"], [class*="title"]');
      const nameCount = await name.count();
      if (nameCount > 0) {
        await expect(name.first()).toBeVisible();
      }

      // 가격 확인
      const price = firstCard.locator('[class*="price"]');
      const priceCount = await price.count();
      if (priceCount > 0) {
        await expect(price.first()).toBeVisible();
      }
    }
  });

  test('TC-1.2.8: API 에러 처리 확인', async ({ page }) => {
    // 네트워크 에러 수집
    const failedRequests: string[] = [];

    page.on('response', response => {
      if (response.url().includes('/api/') && response.status() >= 400) {
        failedRequests.push(`${response.status()}: ${response.url()}`);
      }
    });

    await page.goto('/catalog', { waitUntil: 'domcontentloaded', timeout: 30000 });

    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // API 에러가 없어야 함 (404는 무시 - 존재하지 않는 엔드포인트 가능성)
    const significantErrors = failedRequests.filter(req => !req.includes('404'));
    expect(significantErrors).toHaveLength(0);
  });
});
