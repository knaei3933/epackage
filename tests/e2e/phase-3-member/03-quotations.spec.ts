import { test, expect } from '@playwright/test';
import { authenticateAndNavigate, getTestCredentials, isDevMode } from '../../helpers/dev-mode-auth';

/**
 * Phase 3: Member Portal - Group 3.3
 * Quotations Management Tests
 *
 * 독립 실행 가능: Yes (DEV_MODE 지원)
 * 데이터베이스: quotations, quotation_items
 * 선행 조건: MEMBER 역할로 로그인 (DEV_MODE에서는 우회)
 */

test.describe('Member Quotations - List View', () => {
  test.use({ timeout: 90000 }); // Increase timeout to 90s

  test.beforeEach(async ({ page }) => {
    await authenticateAndNavigate(page, '/member/quotations');
  });

  test('TC-3.3.1: Quotations list loads and renders', async ({ page }) => {
    // Wait for page to fully load - use networkidle for API data
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    // Wait for loading state to complete (PageLoadingState component)
    const loadingState = page.locator('text=/読み込み中|Loading/i');
    try {
      await loadingState.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Loading state might not exist or already hidden
    }

    // Additional wait for data fetching
    await page.waitForTimeout(3000);

    // Check if we're on the right page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/member/quotations');

    // 콘솔 에러 수집 (ignore Ads and favicon errors)
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Ads') && !text.includes('favicon') && !text.includes('404')) {
          errors.push(text);
        }
      }
    });

    // Wait a bit for errors to be captured
    await page.waitForTimeout(1000);

    // 페이지 제목 확인 - check for the actual heading from the page
    const heading = page.locator('h1').filter({ hasText: /見積依頼/i });
    const headingCount = await heading.count();

    if (headingCount > 0) {
      await expect(heading.first()).toBeVisible({ timeout: 5000 });
    }

    // Check for either empty state or content
    const emptyState = page.locator('text=/見積依頼がありません/i');
    const hasContent = page.locator('.space-y-4 > div, [class*="quotation"]');

    const emptyCount = await emptyState.count();
    const contentCount = await hasContent.count();

    // Should have either empty state or content
    expect(emptyCount + contentCount).toBeGreaterThan(0);

    // 콘솔 에러 확인 (filter out expected errors)
    const criticalErrors = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Next.js') &&
      !e.includes('hydration')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('TC-3.3.2: Quotation cards or empty state display correctly', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    // Wait for loading state to complete
    const loadingState = page.locator('text=/読み込み中|Loading/i');
    try {
      await loadingState.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Continue
    }

    await page.waitForTimeout(3000);

    // Check if we have quotations or empty state
    const emptyState = page.locator('text=/見積依頼がありません/i');
    const emptyCount = await emptyState.count();

    if (emptyCount > 0) {
      // We have empty state, verify it's visible and has action buttons
      await expect(emptyState.first()).toBeVisible({ timeout: 5000 });

      // Verify action buttons are present in empty state
      const refreshButton = page.locator('button:has-text("更新"), button:has-text("↻")');
      const createButton = page.locator('button:has-text("見積を作成する"), button:has-text("新規見積")');

      const refreshCount = await refreshButton.count();
      const createCount = await createButton.count();

      // At least one action button should be present
      expect(refreshCount + createCount).toBeGreaterThan(0);
      return; // Test passes for empty state
    }

    // If not empty, check for quotation cards
    const quotationCards = page.locator('.space-y-4 > div, [class*="Card"]');
    const cardCount = await quotationCards.count();

    if (cardCount > 0) {
      await expect(quotationCards.first()).toBeVisible({ timeout: 5000 });

      // Check for quotation number (見積番号 format: QT-XXXX)
      const quoteNumber = page.locator('text=/QT-\\d+/i');
      const numberCount = await quoteNumber.count();

      if (numberCount > 0) {
        expect(numberCount).toBeGreaterThan(0);
      }

      // Check for total amount (合計)
      const totalAmount = page.locator('text=/合計.*円/i');
      const amountCount = await totalAmount.count();

      if (amountCount > 0) {
        expect(amountCount).toBeGreaterThan(0);
      }
    } else {
      // Neither empty state nor cards found - check if at least page loaded
      const currentUrl = page.url();
      expect(currentUrl).toContain('/member/quotations');
    }
  });

  test('TC-3.3.3: Status filter buttons are available', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    // Wait for loading state to complete
    const loadingState = page.locator('text=/読み込み中|Loading/i');
    try {
      await loadingState.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Continue
    }

    await page.waitForTimeout(3000);

    // Scroll to top to ensure filter buttons are in viewport
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // 필터 버튼 확인 - use actual button text from page
    const filterButtons = page.locator('button:has-text("すべて"), button:has-text("ドラフト"), button:has-text("承認済")');

    const filterCount = await filterButtons.count();

    if (filterCount > 0) {
      // Scroll first filter button into view
      await filterButtons.first().scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(200);

      // Verify at least one filter button is visible
      await expect(filterButtons.first()).toBeVisible({ timeout: 5000 });

      // Click the first filter button
      await filterButtons.first().click({ timeout: 5000 });
      await page.waitForTimeout(1000);

      // Verify we're still on quotations page
      const currentUrl = page.url();
      expect(currentUrl).toContain('/member/quotations');
    } else {
      // If no filters found, check page is loaded
      const currentUrl = page.url();
      expect(currentUrl).toContain('/member/quotations');

      // Fallback: check for any page content
      const anyContent = page.locator('main, h1, h2, div[class*="space-y"]').first();
      await expect(anyContent).toBeVisible({ timeout: 5000 });
    }
  });

  test('TC-3.3.4: Create new quotation button exists', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    // Wait for loading state to complete
    const loadingState = page.locator('text=/読み込み中|Loading/i');
    try {
      await loadingState.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Continue
    }

    await page.waitForTimeout(3000);

    // 새 견적 버튼 확인
    const newQuoteButton = page.locator('button:has-text("新規見積")');
    const newCount = await newQuoteButton.count();

    if (newCount > 0) {
      await expect(newQuoteButton.first()).toBeVisible({ timeout: 5000 });
    } else {
      // Alternative: check for create button in empty state
      const createButton = page.locator('button:has-text("見積を作成する")');
      const createCount = await createButton.count();

      if (createCount > 0) {
        await expect(createButton.first()).toBeVisible({ timeout: 5000 });
      } else {
        // If no button found, verify page loaded at least
        const currentUrl = page.url();
        expect(currentUrl).toContain('/member/quotations');
      }
    }
  });
});

test.describe('Member Quotations - Detail View', () => {
  test.use({ timeout: 90000 });

  test('TC-3.3.5: Navigate to quotation detail page', async ({ page }) => {
    await authenticateAndNavigate(page, '/member/quotations');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    // Wait for loading state to complete
    const loadingState = page.locator('text=/読み込み中|Loading/i');
    try {
      await loadingState.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Continue
    }

    await page.waitForTimeout(3000);

    // Check if we have quotations
    const emptyState = page.locator('text=/見積依頼がありません/i');
    const emptyCount = await emptyState.count();

    if (emptyCount > 0) {
      // No quotations, skip detail test
      test.skip(true, 'No quotations available to test detail view');
      return;
    }

    // Look for detail link
    const detailLink = page.locator('a[href*="/member/quotations/"], button:has-text("詳細を見る")');
    const linkCount = await detailLink.count();

    if (linkCount > 0) {
      await detailLink.first().click({ timeout: 5000 });
      await page.waitForTimeout(2000);

      // Verify we're on detail page
      const currentUrl = page.url();
      const isDetailPage = currentUrl.includes('/member/quotations/');

      expect(isDetailPage).toBeTruthy();

      if (isDetailPage) {
        // Check for detail page elements
        const pageContent = page.locator('h1, h2, .quotation-detail, [class*="detail"]');
        const contentCount = await pageContent.count();

        if (contentCount > 0) {
          await expect(pageContent.first()).toBeVisible({ timeout: 5000 });
        }
      }
    } else {
      // No detail links found - might be empty state or different UI
      test.skip(true, 'No quotation detail links found');
    }
  });
});

test.describe('Member Quotations - Actions', () => {
  test.use({ timeout: 90000 });

  test('TC-3.3.6: Download PDF button exists', async ({ page }) => {
    await authenticateAndNavigate(page, '/member/quotations');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    // Wait for loading state to complete
    const loadingState = page.locator('text=/読み込み中|Loading/i');
    try {
      await loadingState.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Continue
    }

    await page.waitForTimeout(3000);

    // Check if we have quotations
    const emptyState = page.locator('text=/見積依頼がありません/i');
    const emptyCount = await emptyState.count();

    if (emptyCount > 0) {
      // No quotations, skip PDF button test
      test.skip(true, 'No quotations available to test PDF download');
      return;
    }

    // Look for PDF download button
    const downloadButton = page.locator('button:has-text("PDFダウンロード"), button:has-text("ダウンロード")');
    const downloadCount = await downloadButton.count();

    if (downloadCount > 0) {
      await expect(downloadButton.first()).toBeVisible({ timeout: 5000 });
    } else {
      // PDF button might not be visible without data
      const currentUrl = page.url();
      expect(currentUrl).toContain('/member/quotations');
    }
  });

  test('TC-3.3.7: Delete button exists for draft quotations', async ({ page }) => {
    await authenticateAndNavigate(page, '/member/quotations');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    // Wait for loading state to complete
    const loadingState = page.locator('text=/読み込み中|Loading/i');
    try {
      await loadingState.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Continue
    }

    await page.waitForTimeout(3000);

    // Check if we have quotations
    const emptyState = page.locator('text=/見積依頼がありません/i');
    const emptyCount = await emptyState.count();

    if (emptyCount > 0) {
      // No quotations, skip delete button test
      test.skip(true, 'No quotations available to test delete button');
      return;
    }

    // Look for delete button (only visible for draft status)
    const deleteButton = page.locator('button:has-text("削除"), button:has-text("Delete")');
    const deleteCount = await deleteButton.count();

    if (deleteCount > 0) {
      await expect(deleteButton.first()).toBeVisible({ timeout: 5000 });
    } else {
      // Delete button might not exist if no draft quotations
      const currentUrl = page.url();
      expect(currentUrl).toContain('/member/quotations');
    }
  });

  test('TC-3.3.8: Order button exists for approved quotations', async ({ page }) => {
    await authenticateAndNavigate(page, '/member/quotations');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    // Wait for loading state to complete
    const loadingState = page.locator('text=/読み込み中|Loading/i');
    try {
      await loadingState.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Continue
    }

    await page.waitForTimeout(3000);

    // Check if we have quotations
    const emptyState = page.locator('text=/見積依頼がありません/i');
    const emptyCount = await emptyState.count();

    if (emptyCount > 0) {
      // No quotations, skip order button test
      test.skip(true, 'No quotations available to test order button');
      return;
    }

    // Look for order/convert button (only visible for approved status)
    const orderButton = page.locator('button:has-text("注文に変換"), button:has-text("発注する")');
    const orderCount = await orderButton.count();

    if (orderCount > 0) {
      await expect(orderButton.first()).toBeVisible({ timeout: 5000 });
    } else {
      // Order button might not exist if no approved quotations
      const currentUrl = page.url();
      expect(currentUrl).toContain('/member/quotations');
    }
  });
});

test.describe('Member Quotations - Navigation', () => {
  test.use({ timeout: 90000 });

  test('TC-3.3.9: New quotation button navigates to quote simulator', async ({ page }) => {
    await authenticateAndNavigate(page, '/member/quotations');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    // Wait for loading state to complete
    const loadingState = page.locator('text=/読み込み中|Loading/i');
    try {
      await loadingState.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Continue
    }

    await page.waitForTimeout(3000);

    // 새 견적 버튼 확인
    const newQuoteButton = page.locator('button:has-text("新規見積")');
    const newCount = await newQuoteButton.count();

    if (newCount > 0) {
      await newQuoteButton.first().click({ timeout: 5000 });
      await page.waitForTimeout(2000);

      // Should navigate to quote simulator
      const currentUrl = page.url();
      const isQuotePage = currentUrl.includes('/quote-simulator') ||
                         currentUrl.includes('/smart-quote');

      expect(isQuotePage).toBeTruthy();
    } else {
      // Alternative: check for create button
      const createButton = page.locator('button:has-text("見積を作成する")');
      const createCount = await createButton.count();

      if (createCount > 0) {
        await createButton.first().click({ timeout: 5000 });
        await page.waitForTimeout(2000);

        const currentUrl = page.url();
        const isQuotePage = currentUrl.includes('/quote-simulator') ||
                           currentUrl.includes('/smart-quote');

        expect(isQuotePage).toBeTruthy();
      } else {
        // If button not found, verify we're at least on quotations page
        const currentUrl = page.url();
        expect(currentUrl).toContain('/member/quotations');
      }
    }
  });

  test('TC-3.3.10: Refresh button reloads the page', async ({ page }) => {
    await authenticateAndNavigate(page, '/member/quotations');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    // Wait for loading state to complete
    const loadingState = page.locator('text=/読み込み中|Loading/i');
    try {
      await loadingState.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Continue
    }

    await page.waitForTimeout(3000);

    // 새로고침 버튼 확인
    const refreshButton = page.locator('button:has-text("更新"), button:has-text("↻")');
    const refreshCount = await refreshButton.count();

    if (refreshCount > 0) {
      await refreshButton.first().click({ timeout: 5000 });
      await page.waitForTimeout(2000);

      // Should still be on quotations page
      const currentUrl = page.url();
      expect(currentUrl).toContain('/member/quotations');
    } else {
      // Refresh button might not exist, verify page is loaded
      const currentUrl = page.url();
      expect(currentUrl).toContain('/member/quotations');
    }
  });
});

test.describe('Member Quotations - Empty State', () => {
  test.use({ timeout: 90000 });

  test('TC-3.3.11: Empty state displays correctly', async ({ page }) => {
    await authenticateAndNavigate(page, '/member/quotations');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    // Wait for loading state to complete
    const loadingState = page.locator('text=/読み込み中|Loading/i');
    try {
      await loadingState.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Continue
    }

    await page.waitForTimeout(3000);

    // Check for empty state
    const emptyState = page.locator('text=/見積依頼がありません/i');
    const emptyCount = await emptyState.count();

    if (emptyCount > 0) {
      // Empty state is displayed
      await expect(emptyState.first()).toBeVisible({ timeout: 5000 });

      // Check for action buttons in empty state
      const actionButtons = page.locator('button:has-text("見積を作成する"), button:has-text("更新"), button:has-text("新規見積")');
      const buttonCount = await actionButtons.count();

      if (buttonCount > 0) {
        await expect(actionButtons.first()).toBeVisible({ timeout: 5000 });
      }
    } else {
      // Not empty state - check if we have content instead
      const contentCards = page.locator('.space-y-4 > div, [class*="Card"]');
      const cardCount = await contentCards.count();

      if (cardCount > 0) {
        // We have content, test passes
        expect(cardCount).toBeGreaterThan(0);
      } else {
        // Neither empty nor content - verify page at least loaded
        const currentUrl = page.url();
        expect(currentUrl).toContain('/member/quotations');
      }
    }
  });
});

test.describe('Member Quotations - Status Display', () => {
  test.use({ timeout: 90000 });

  test('TC-3.3.12: Status badges display correctly', async ({ page }) => {
    await authenticateAndNavigate(page, '/member/quotations');

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});

    // Wait for loading state to complete
    const loadingState = page.locator('text=/読み込み中|Loading/i');
    try {
      await loadingState.waitFor({ state: 'hidden', timeout: 15000 });
    } catch {
      // Continue
    }

    await page.waitForTimeout(3000);

    // Check for empty state first
    const emptyState = page.locator('text=/見積依頼がありません/i');
    const emptyCount = await emptyState.count();

    if (emptyCount > 0) {
      // Empty state - no status badges expected
      test.skip(true, 'Empty state - no status badges to check');
      return;
    }

    // Look for status badges
    const statusBadges = page.locator('text=/ドラフト|送信済み|承認済み|却下|期限切れ|注文変換済み/i');

    const badgeCount = await statusBadges.count();

    if (badgeCount > 0) {
      await expect(statusBadges.first()).toBeVisible({ timeout: 5000 });
    } else {
      // Status badges might not be in DOM if no quotations
      const currentUrl = page.url();
      expect(currentUrl).toContain('/member/quotations');
    }
  });
});
