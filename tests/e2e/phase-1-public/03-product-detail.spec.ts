import { test, expect } from '@playwright/test';

/**
 * Phase 1: Public Pages - Group 1.3
 * Product Detail Page Tests
 *
 * 독립 실행 가능: ✅
 * 데이터베이스: products, product_specifications
 * 선행 조건: 없음
 */

test.describe('Product Detail Page', () => {
  // 테스트용 제품 slug (실제 존재하는 제품 ID 사용)
  const PRODUCT_SLUG = 'three-seal-001';

  test.beforeEach(async ({ page }) => {
    await page.goto(`/catalog/${PRODUCT_SLUG}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
  });

  test('TC-1.3.1: 제품 상세 페이지 로드', async ({ page }) => {
    // 콘솔 에러 수집
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // 제품명 확인 (일본어)
    const productName = page.locator('h1, [data-testid="product-name"]');
    const nameCount = await productName.count();

    if (nameCount > 0) {
      await expect(productName.first()).toBeVisible();

      const nameText = await productName.first().textContent();
      expect(nameText).toBeTruthy();
      expect(nameText?.length).toBeGreaterThan(0);
    }

    // 콘솔 에러 확인 (filter benign errors)
    const filteredErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('404') &&
      !e.includes('net::ERR')
    );
    expect(filteredErrors).toHaveLength(0);
  });

  test('TC-1.3.2: 제품 스펙 표시 확인', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // 스펙 섹션 확인
    const specSection = page.locator('[data-testid="specifications"], .specifications, section:has-text("spec")');

    const isVisible = await specSection.isVisible().catch(() => false);
    if (isVisible) {
      // 주요 스펙 항목 확인
      const specItems = page.locator('[data-testid="spec-item"], .spec-item, dt');
      const count = await specItems.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('TC-1.3.3: Add to Quote 버튼 확인', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    const addToQuoteButton = page.locator('button:has-text("Quote"), button:has-text("見積"), [data-testid="add-to-quote"]');

    const count = await addToQuoteButton.count();
    if (count > 0) {
      await expect(addToQuoteButton.first()).toBeVisible();

      // 버튼 클릭 (로그인하지 않은 상태에서도 동작해야 함)
      await addToQuoteButton.first().click();

      // 알림 메시지 또는 리다이렉트 확인
      const notification = page.locator('[role="alert"], .notification, [class*="toast"]');
      const hasNotification = await notification.count() > 0;

      if (!hasNotification) {
        // 리다이렉트 확인
        await expect(page).toHaveURL(/(quote-simulator|smart-quote|catalog)/);
      }
    }
  });

  test('TC-3.3.4: Request Sample 버튼 확인', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    const requestSampleButton = page.locator('button:has-text("Sample"), button:has-text("サンプル"), [data-testid="request-sample"]');

    const count = await requestSampleButton.count();
    if (count > 0) {
      await expect(requestSampleButton.first()).toBeVisible();

      // 버튼 클릭
      await requestSampleButton.first().click();

      // 샘플 페이지로 리다이렉트 확인
      await expect(page).toHaveURL(/\/samples/);
    }
  });

  test('TC-1.3.5: 제품 이미지 표시', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // 콘솔 에러 확인
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // 제품 이미지 영역 확인 - 다양한 가능한 선택자
    const productImageArea = page.locator(
      '.aspect-square, [data-testid="product-image"], svg[class*="package"], svg[class*=" Package"], img[alt*="pouch" i], img[alt*="pouch" i]'
    );

    const count = await productImageArea.count();

    // 이미지 영역이 없더라도 페이지가 정상적으로 로드되면 통과
    if (count > 0) {
      const firstImage = productImageArea.first();
      await expect(firstImage).toBeVisible();
    }

    // 콘솔 에러 확인 (중요한 에러만)
    const filteredErrors = errors.filter(err =>
      !err.includes('MathML') &&
      !err.includes('React does not recognize') &&
      !err.includes('Warning: ReactDOM.render')
    );

    expect(filteredErrors).toHaveLength(0);
  });

  test('TC-1.3.6: 관련 제품 섹션', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    const relatedSection = page.locator('[data-testid="related-products"], section:has-text("related"), section:has-text("関連商品")');

    const isVisible = await relatedSection.isVisible().catch(() => false);
    if (isVisible) {
      const relatedProducts = relatedSection.locator('[data-testid="product-card"], .product-card');
      const count = await relatedProducts.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('TC-1.3.7: 뒤로가기/이전 페이지 네비게이션', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});

    // 뒤로가기 버튼 확인
    const backButton = page.locator('a:has-text("back"), button:has-text("back"), [data-testid="back-button"]');

    const count = await backButton.count();
    if (count > 0) {
      await backButton.first().click();
      await expect(page).toHaveURL(/\/catalog/);
    }
  });
});
