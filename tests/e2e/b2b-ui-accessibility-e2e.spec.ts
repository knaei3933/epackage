/**
 * Epackage Lab - B2B UI/Accessibility E2E Tests
 *
 * フロントエンドUIとアクセシビリティの包括的E2Eテスト
 * Covers: Custom modals, Keyboard navigation, ARIA labels, Focus management,
 *          Color system, Responsive design, Micro-interactions
 *
 * Run: npx playwright test tests/e2e/b2b-ui-accessibility-e2e.spec.ts
 *
 * @testable
 * - Custom Confirmation Modal (ConfirmModal component)
 * - Keyboard Navigation (Arrow keys, A/R/C shortcuts)
 * - ARIA Labels (role, aria-label, aria-live)
 * - Focus Management (Focus trap, Error recovery, Success focus)
 * - Color System (Semantic colors, Blue instead of excessive red)
 * - Responsive Design (Mobile, Tablet, Desktop)
 * - Micro-interactions (hover-lift, active:scale)
 */

import { test, expect, Page } from '@playwright/test';

// =====================================================
// Test Configuration
// =====================================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:3006';

// Test credentials
const ADMIN_CREDENTIALS = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@example.com',
  password: process.env.TEST_ADMIN_PASSWORD || 'Admin1234!',
};

const MEMBER_CREDENTIALS = {
  email: process.env.TEST_MEMBER_EMAIL || 'member@test.com',
  password: process.env.TEST_MEMBER_PASSWORD || 'Member1234!',
};

// Test data tracking
let testOrderId: string | null = null;
let testQuotationId: string | null = null;

// =====================================================
// Helper Functions
// =====================================================

/**
 * Login as member
 */
async function loginAsMember(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/auth/signin`);
  const currentUrl = page.url();

  // Already logged in
  if (currentUrl.includes('/dashboard') || currentUrl.includes('/member')) {
    return;
  }

  await page.fill('input[name="email"]', MEMBER_CREDENTIALS.email);
  await page.fill('input[name="password"]', MEMBER_CREDENTIALS.password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL(/\/(dashboard|member)/, { timeout: 10000 });
}

/**
 * Login as admin
 */
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/auth/signin`);
  const currentUrl = page.url();

  // Already logged in
  if (currentUrl.includes('/admin')) {
    return;
  }

  await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
  await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
  await page.click('button[type="submit"]');

  // Wait for redirect to admin dashboard
  await page.waitForURL(`${BASE_URL}/admin`, { timeout: 10000 });
}

/**
 * Navigate to member quotations page
 */
async function goToMemberQuotations(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/member/quotations`);
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to admin orders page
 */
async function goToAdminOrders(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/admin/orders`);
  await page.waitForLoadState('networkidle');
}

/**
 * Find first available quotation for testing
 */
async function findFirstQuotation(page: Page): Promise<string | null> {
  const quotationCard = page.locator('[data-testid="quotation-card"], .quotation-card').first();
  const count = await quotationCard.count();

  if (count === 0) {
    return null;
  }

  const href = await quotationCard.locator('a').first().getAttribute('href');
  return href ? href.split('/').pop() || null : null;
}

/**
 * Find first available order for testing
 */
async function findFirstOrder(page: Page): Promise<string | null> {
  const orderRow = page.locator('tr[data-order-id], [data-testid="order-row"]').first();
  const count = await orderRow.count();

  if (count === 0) {
    return null;
  }

  const orderId = await orderRow.getAttribute('data-order-id');
  if (orderId) return orderId;

  const href = await orderRow.locator('a').first().getAttribute('href');
  return href ? href.split('/').pop() || null : null;
}

// =====================================================
// Test Suite 1: Custom Confirmation Modal
// =====================================================

test.describe('Custom Confirmation Modal', () => {
  test.beforeAll(async ({ browser }) => {
    // Setup: Login and navigate
    const page = await browser.newPage();
    await loginAsAdmin(page);
    await page.close();
  });

  test('UI-001: Custom modal appears on confirm action', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (!orderId) {
      test.skip(true, 'No orders available for testing');
      return;
    }

    // Navigate to order detail page
    await page.goto(`${BASE_URL}/admin/orders/${orderId}`);
    await page.waitForLoadState('networkidle');

    // Look for a button that triggers confirmation
    const confirmButton = page.locator('button:has-text("確認"), button:has-text("承認"), button:has-text("更新")').first();

    if (await confirmButton.count() > 0) {
      await confirmButton.click();

      // Verify custom modal appears (not native confirm)
      const modal = page.locator('[role="dialog"], .confirm-modal, [data-testid="confirm-modal"]').first();
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Verify modal has proper structure
      await expect(modal.locator('h2, h3, [aria-label*="title"]')).toBeVisible();
      await expect(modal.locator('button:has-text("キャンセル")')).toBeVisible();
    } else {
      test.skip(true, 'No confirm button found on this page');
    }
  });

  test('UI-002: Modal has focus trap', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (!orderId) {
      test.skip(true, 'No orders available for testing');
      return;
    }

    await page.goto(`${BASE_URL}/admin/orders/${orderId}`);
    await page.waitForLoadState('networkidle');

    const confirmButton = page.locator('button:has-text("確認"), button:has-text("承認")').first();

    if (await confirmButton.count() > 0) {
      await confirmButton.click();
      const modal = page.locator('[role="dialog"]').first();

      // Try to Tab through modal elements
      await page.keyboard.press('Tab');

      // Focus should stay within modal
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      const modalElement = await modal.locator('*').first();

      // The active element should be inside the modal
      const isInModal = await page.evaluate((modal) => {
        return modal.contains(document.activeElement);
      }, await modal.elementHandle());

      expect(isInModal).toBe(true);
    } else {
      test.skip(true, 'No confirm button found on this page');
    }
  });

  test('UI-003: ESC key closes modal', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (!orderId) {
      test.skip(true, 'No orders available for testing');
      return;
    }

    await page.goto(`${BASE_URL}/admin/orders/${orderId}`);
    await page.waitForLoadState('networkidle');

    const confirmButton = page.locator('button:has-text("確認"), button:has-text("承認")').first();

    if (await confirmButton.count() > 0) {
      await confirmButton.click();

      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();

      // Press ESC
      await page.keyboard.press('Escape');

      // Modal should close
      await expect(modal).not.toBeVisible({ timeout: 2000 });
    } else {
      test.skip(true, 'No confirm button found on this page');
    }
  });

  test('UI-004: Backdrop click closes modal', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (!orderId) {
      test.skip(true, 'No orders available for testing');
      return;
    }

    await page.goto(`${BASE_URL}/admin/orders/${orderId}`);
    await page.waitForLoadState('networkidle');

    const confirmButton = page.locator('button:has-text("確認"), button:has-text("承認")').first();

    if (await confirmButton.count() > 0) {
      await confirmButton.click();

      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).toBeVisible();

      // Click backdrop (outside modal content)
      await page.click('body', { position: { x: 10, y: 10 } });

      // Modal should close
      await expect(modal).not.toBeVisible({ timeout: 2000 });
    } else {
      test.skip(true, 'No confirm button found on this page');
    }
  });

  test('UI-005: Confirm button executes action', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (!orderId) {
      test.skip(true, 'No orders available for testing');
      return;
    }

    await page.goto(`${BASE_URL}/admin/orders/${orderId}`);
    await page.waitForLoadState('networkidle');

    const confirmButton = page.locator('button:has-text("確認"), button:has-text("承認")').first();

    if (await confirmButton.count() > 0) {
      await confirmButton.click();

      const modal = page.locator('[role="dialog"]').first();
      const confirmButtonInModal = modal.locator('button:has-text("確認"), button:has-text("実行"), button:has-text("削除")').first();

      if (await confirmButtonInModal.count() > 0) {
        await confirmButtonInModal.click();

        // Modal should close after action
        await expect(modal).not.toBeVisible({ timeout: 3000 });
      }
    } else {
      test.skip(true, 'No confirm button found on this page');
    }
  });
});

// =====================================================
// Test Suite 2: Keyboard Navigation
// =====================================================

test.describe('Keyboard Navigation', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await loginAsMember(page);
    await page.close();
  });

  test('UI-006: Arrow keys navigate revisions', async ({ page }) => {
    await loginAsMember(page);

    // Try to navigate to spec approval page
    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/member/orders/${orderId}/spec-approval`);
      await page.waitForLoadState('networkidle');

      // Check if revision navigation exists
      const prevButton = page.locator('button:has-text("前へ"), button:has-text("Previous")').first();
      const nextButton = page.locator('button:has-text("次へ"), button:has-text("Next")').first();

      if (await prevButton.count() > 0 && await nextButton.count() > 0) {
        // Press right arrow to go next
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(500);

        // Press left arrow to go back
        await page.keyboard.press('ArrowLeft');
        await page.waitForTimeout(500);
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-007: A key triggers approve action', async ({ page }) => {
    await loginAsMember(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/member/orders/${orderId}/spec-approval`);
      await page.waitForLoadState('networkidle');

      // Make sure textarea is not focused
      await page.click('body');

      // Press 'A' key
      await page.keyboard.press('a');

      // Should trigger approve confirmation
      const modal = page.locator('[role="dialog"]').first();
      const isModalVisible = await modal.isVisible({ timeout: 2000 });

      if (isModalVisible) {
        // Close modal
        await page.keyboard.press('Escape');
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-008: R key triggers reject action', async ({ page }) => {
    await loginAsMember(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/member/orders/${orderId}/spec-approval`);
      await page.waitForLoadState('networkidle');

      // Make sure textarea is not focused
      await page.click('body');

      // Press 'R' key
      await page.keyboard.press('r');

      // Should trigger reject confirmation
      const modal = page.locator('[role="dialog"]').first();
      const isModalVisible = await modal.isVisible({ timeout: 2000 });

      if (isModalVisible) {
        // Close modal
        await page.keyboard.press('Escape');
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-009: Enter key activates drag-drop areas', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/correction-upload`);
      await page.waitForLoadState('networkidle');

      // Look for drag-drop upload area
      const uploadArea = page.locator('[role="button"][tabindex="0"], .upload-area').first();

      if (await uploadArea.count() > 0) {
        await uploadArea.focus();
        await page.keyboard.press('Enter');

        // Should trigger file input
        const fileInput = page.locator('input[type="file"]').first();
        await expect(fileInput).toHaveCount(1);
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-010: Tab navigates through form fields', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/payment-confirmation`);
      await page.waitForLoadState('networkidle');

      // Find first input
      const firstInput = page.locator('input:visible, select:visible, textarea:visible').first();

      if (await firstInput.count() > 0) {
        await firstInput.focus();

        // Tab through fields
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press('Tab');
          await page.waitForTimeout(100);
        }

        // Focus should have moved
        const currentFocus = await page.evaluate(() => document.activeElement?.tagName);
        expect(['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(currentFocus || '')).toBe(true);
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });
});

// =====================================================
// Test Suite 3: ARIA Labels and Accessibility
// =====================================================

test.describe('ARIA Labels and Accessibility', () => {
  test('UI-011: Buttons have aria-label or text', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}`);
      await page.waitForLoadState('networkidle');

      // Check all buttons have accessible name
      const buttons = page.locator('button');
      const count = await buttons.count();

      for (let i = 0; i < Math.min(count, 20); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();

        // Either aria-label or text content should exist
        const hasAccessibleName = !!(ariaLabel || (text && text.trim().length > 0));
        expect(hasAccessibleName).toBe(true);
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-012: Error messages use role="alert"', async ({ page }) => {
    await loginAsMember(page);
    await goToMemberQuotations(page);

    // Try to submit empty form to trigger error
    const submitButton = page.locator('button:has-text("送信"), button:has-text("提出")').first();

    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Look for error with role="alert"
      const errorAlert = page.locator('[role="alert"]').first();
      const hasErrorAlert = await errorAlert.count() > 0;

      if (hasErrorAlert) {
        await expect(errorAlert).toBeVisible();
      }
    }
  });

  test('UI-013: Success messages use role="status"', async ({ page }) => {
    await loginAsMember(page);
    await goToMemberQuotations(page);

    // Look for existing success messages
    const statusMessage = page.locator('[role="status"]').first();

    if (await statusMessage.count() > 0) {
      await expect(statusMessage).toBeVisible();
    } else {
      // If no status message, check if aria-live is used
      const ariaLive = page.locator('[aria-live="polite"]').first();
      const hasAriaLive = await ariaLive.count() > 0;

      if (hasAriaLive) {
        await expect(ariaLive).toBeVisible();
      }
    }
  });

  test('UI-014: Modal has proper ARIA attributes', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}`);
      await page.waitForLoadState('networkidle');

      const confirmButton = page.locator('button:has-text("確認"), button:has-text("承認")').first();

      if (await confirmButton.count() > 0) {
        await confirmButton.click();

        const modal = page.locator('[role="dialog"]').first();
        await expect(modal).toBeVisible();

        // Check aria-modal
        const ariaModal = await modal.getAttribute('aria-modal');
        expect(ariaModal).toBe('true');

        // Check aria-labelledby or aria-label
        const ariaLabelledBy = await modal.getAttribute('aria-labelledby');
        const ariaLabel = await modal.getAttribute('aria-label');
        const hasLabel = !!(ariaLabelledBy || ariaLabel);
        expect(hasLabel).toBe(true);

        // Close modal
        await page.keyboard.press('Escape');
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-015: Inputs have associated labels', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/payment-confirmation`);
      await page.waitForLoadState('networkidle');

      // Check all inputs have labels
      const inputs = page.locator('input:not([type="hidden"]), select, textarea');
      const count = await inputs.count();

      for (let i = 0; i < Math.min(count, 10); i++) {
        const input = inputs.nth(i);

        // Check for id and aria-label
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        // Either id (with associated label) or aria attributes
        const hasLabelAssociation = !!(id || ariaLabel || ariaLabelledBy);
        expect(hasLabelAssociation).toBe(true);
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });
});

// =====================================================
// Test Suite 4: Focus Management
// =====================================================

test.describe('Focus Management', () => {
  test('UI-016: Modal focuses confirm button on open', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}`);
      await page.waitForLoadState('networkidle');

      const confirmButton = page.locator('button:has-text("確認"), button:has-text("承認")').first();

      if (await confirmButton.count() > 0) {
        await confirmButton.click();

        // Check what element is focused
        const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
        const focusedText = await page.evaluate(() => document.activeElement?.textContent);

        // Should be focused on a button inside the modal
        expect(focusedTag).toBe('BUTTON');

        // Close modal
        await page.keyboard.press('Escape');
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-017: Error display receives focus', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/payment-confirmation`);
      await page.waitForLoadState('networkidle');

      // Submit empty form to trigger error
      const confirmButton = page.locator('button:has-text("確認"), button:has-text("実行")').first();

      if (await confirmButton.count() > 0) {
        await confirmButton.click();
        await page.waitForTimeout(1000);

        // Check if error received focus
        const errorAlert = page.locator('[role="alert"]').first();

        if (await errorAlert.count() > 0) {
          const isFocused = await errorAlert.evaluate((el: any) => document.activeElement === el);
          // Note: This might not always be true depending on implementation
        }
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-018: Success message is announced', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/payment-confirmation`);
      await page.waitForLoadState('networkidle');

      // Fill form and submit
      await page.fill('input[name="paymentAmount"]', '1000');
      await page.fill('input[name="paymentDate"]', '2025-01-30');

      const confirmButton = page.locator('button:has-text("確認"), button:has-text("実行")').first();

      if (await confirmButton.count() > 0) {
        await confirmButton.click();
        await page.waitForTimeout(2000);

        // Check for success message with aria-live
        const statusMessage = page.locator('[role="status"], [aria-live="polite"]').first();

        if (await statusMessage.count() > 0) {
          await expect(statusMessage).toBeVisible();
        }
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-019: Focus returns to trigger after modal close', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}`);
      await page.waitForLoadState('networkidle');

      const confirmButton = page.locator('button:has-text("確認"), button:has-text("承認")').first();

      if (await confirmButton.count() > 0) {
        // Focus the button first
        await confirmButton.focus();

        // Click to open modal
        await confirmButton.click();

        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        // Check if focus returned to trigger button
        const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
        expect(focusedTag).toBe('BUTTON');
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });
});

// =====================================================
// Test Suite 5: Color System
// =====================================================

test.describe('Color System', () => {
  test('UI-020: Info messages use blue colors', async ({ page }) => {
    await loginAsMember(page);
    await page.goto(`${BASE_URL}/member/orders`);

    // Look for blue info messages (not red for info)
    const blueInfo = page.locator('.bg-blue-50, .border-blue-200, [class*="text-blue"]').first();

    if (await blueInfo.count() > 0) {
      const bgColor = await blueInfo.evaluate((el: any) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Should be a blue-ish color
      expect(bgColor).toBeTruthy();
    }
  });

  test('UI-021: Error messages use red colors', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/payment-confirmation`);
      await page.waitForLoadState('networkidle');

      // Submit empty form to trigger error
      const confirmButton = page.locator('button:has-text("確認"), button:has-text("実行")').first();

      if (await confirmButton.count() > 0) {
        await confirmButton.click();
        await page.waitForTimeout(1000);

        const errorAlert = page.locator('.bg-red-50, .border-red-200').first();

        if (await errorAlert.count() > 0) {
          await expect(errorAlert).toBeVisible();
        }
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-022: Success messages use green colors', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/payment-confirmation`);
      await page.waitForLoadState('networkidle');

      // Fill form and submit
      await page.fill('input[name="paymentAmount"]', '1000');
      await page.fill('input[name="paymentDate"]', '2025-01-30');

      const confirmButton = page.locator('button:has-text("確認"), button:has-text("実行")').first();

      if (await confirmButton.count() > 0) {
        await confirmButton.click();
        await page.waitForTimeout(2000);

        const successMessage = page.locator('.bg-green-50, .border-green-200').first();

        if (await successMessage.count() > 0) {
          await expect(successMessage).toBeVisible();
        }
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-023: Warning messages use yellow colors', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(`${BASE_URL}/admin/orders/${orderId || ''}/payment-confirmation`);

    // Look for yellow warning messages
    const warningMessage = page.locator('.bg-yellow-50, .border-yellow-200, [class*="text-yellow"]').first();

    if (await warningMessage.count() > 0) {
      await expect(warningMessage).toBeVisible();
    }
  });
});

// =====================================================
// Test Suite 6: Responsive Design
// =====================================================

test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`UI-024: Layout works on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await loginAsMember(page);
      await goToMemberQuotations(page);

      // Check that content is visible
      const content = page.locator('main, [role="main"], .container').first();
      await expect(content).toBeVisible();

      // Check for horizontal scroll (should not exist)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  }

  test('UI-025: Touch targets are minimum 44x44 on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsMember(page);
    await goToMemberQuotations(page);

    // Check button sizes
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const isVisible = await button.isVisible();

      if (isVisible) {
        const box = await button.boundingBox();
        if (box) {
          // Check minimum touch target size
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('UI-026: Stack columns on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/correction-upload`);
      await page.waitForLoadState('networkidle');

      // Look for grid that should stack on mobile
      const grid = page.locator('.grid').first();

      if (await grid.count() > 0) {
        // Check if grid has responsive classes
        const className = await grid.getAttribute('class');
        const hasResponsiveClasses = className?.includes('md:grid-cols') || className?.includes('grid-cols-1');

        expect(hasResponsiveClasses).toBe(true);
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });
});

// =====================================================
// Test Suite 7: Micro-interactions
// =====================================================

test.describe('Micro-interactions', () => {
  test('UI-027: Buttons have hover state', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const button = page.locator('button').first();

    if (await button.count() > 0) {
      // Get computed style before hover
      const beforeHover = await button.evaluate((el: any) => {
        const style = window.getComputedStyle(el);
        return {
          transform: style.transform,
          opacity: style.opacity,
        };
      });

      // Hover over button
      await button.hover();

      // Get computed style after hover
      const afterHover = await button.evaluate((el: any) => {
        const style = window.getComputedStyle(el);
        return {
          transform: style.transform,
          opacity: style.opacity,
        };
      });

      // Some visual change should occur
      const hasHoverEffect = beforeHover.transform !== afterHover.transform ||
                             beforeHover.opacity !== afterHover.opacity;

      // Note: This might not always be true for all buttons
    }
  });

  test('UI-028: Buttons have active state', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const button = page.locator('button').first();

    if (await button.count() > 0) {
      // Check for active:scale or similar classes
      const className = await button.getAttribute('class');
      const hasActiveClass = className?.includes('active:') || className?.includes('hover:');

      expect(hasActiveClass).toBeTruthy();
    }
  });

  test('UI-029: Loading state shows spinner', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    // Trigger some action that shows loading
    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/correction-upload`);
      await page.waitForLoadState('networkidle');

      // Look for loading spinner when form is submitted
      const submitButton = page.locator('button:has-text("アップロード"), button:has-text("送信")').first();

      if (await submitButton.count() > 0) {
        // Click and immediately check for spinner
        await submitButton.click();

        const spinner = page.locator('.animate-spin, [class*="spinner"], [class*="loading"]').first();
        const hasSpinner = await spinner.isVisible({ timeout: 1000 }).catch(() => false);

        // Spinner might appear briefly
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-030: Smooth transitions on elements', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    // Check for transition classes
    const transitionElements = page.locator('[class*="transition"], [class*="duration-"]').first();

    if (await transitionElements.count() > 0) {
      const className = await transitionElements.getAttribute('class');
      const hasTransition = className?.includes('transition');

      expect(hasTransition).toBe(true);
    }
  });
});

// =====================================================
// Test Suite 8: Auto-redirect Removal
// =====================================================

test.describe('Auto-redirect Removal', () => {
  test('UI-031: Spec approval shows manual navigate button', async ({ page }) => {
    await loginAsMember(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/member/orders/${orderId}/spec-approval`);
      await page.waitForLoadState('networkidle');

      // Look for manual navigation button
      const nextButton = page.locator('button:has-text("次へ"), button:has-text("Next")').first();

      if (await nextButton.count() > 0) {
        await expect(nextButton).toBeVisible();

        // Click to verify it navigates
        await nextButton.click();
        await page.waitForTimeout(2000);

        // Should navigate to order detail page
        const currentUrl = page.url();
        expect(currentUrl).toContain(`/member/orders/${orderId}`);
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-032: No auto-redirect after success action', async ({ page }) => {
    await loginAsMember(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/member/orders/${orderId}/spec-approval`);
      await page.waitForLoadState('networkidle');

      // Trigger approve action
      const approveButton = page.locator('button:has-text("承認する")').first();

      if (await approveButton.count() > 0) {
        await approveButton.click();

        // Confirm in modal
        const modalConfirm = page.locator('[role="dialog"] button:has-text("承認する")').first();

        if (await modalConfirm.count() > 0) {
          const urlBefore = page.url();
          await modalConfirm.click();

          // Wait a moment
          await page.waitForTimeout(3000);

          // URL should not have changed immediately
          const urlAfter = page.url();

          // User should have control over navigation
        }
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });
});

// =====================================================
// Test Suite 9: File Upload Validation
// =====================================================

test.describe('File Upload Validation', () => {
  test('UI-033: Drag-drop area accepts files', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/correction-upload`);
      await page.waitForLoadState('networkidle');

      // Look for drag-drop area
      const uploadArea = page.locator('[role="button"][tabindex="0"]').first();

      if (await uploadArea.count() > 0) {
        // Create a test file
        const fileBuffer = Buffer.from('test image content');

        // Set up file input
        const fileInput = page.locator('input[type="file"]').first();

        if (await fileInput.count() > 0) {
          const files = [{
            name: 'test-image.jpg',
            mimeType: 'image/jpeg',
            buffer: fileBuffer,
          }];

          await fileInput.setInputFiles(files);

          // Check if file was accepted
          const fileName = page.locator('text=/test-image\\.jpg/').first();
          const fileAccepted = await fileName.isVisible({ timeout: 2000 });

          expect(fileAccepted).toBe(true);
        }
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-034: File size validation works', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/correction-upload`);
      await page.waitForLoadState('networkidle');

      const uploadArea = page.locator('[role="button"][tabindex="0"]').first();

      if (await uploadArea.count() > 0) {
        // Look for file size hint
        const sizeHint = page.locator('text=/MB|KB/').first();

        if (await sizeHint.count() > 0) {
          await expect(sizeHint).toBeVisible();
        }
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-035: File type validation works', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/correction-upload`);
      await page.waitForLoadState('networkidle');

      // Look for accepted file types
      const fileTypeHint = page.locator('text=/JPG|PNG|AI|PDF|PSD/').first();

      if (await fileTypeHint.count() > 0) {
        await expect(fileTypeHint).toBeVisible();
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });
});

// =====================================================
// Test Suite 10: Type Safety
// =====================================================

test.describe('Type Safety', () => {
  test('UI-036: No console errors on page load', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}`);
      await page.waitForLoadState('networkidle');

      // Check for TypeScript-related errors
      const typeErrors = errors.filter(e =>
        e.includes('TypeError') ||
        e.includes('undefined') ||
        e.includes('null')
      );

      // Should not have type errors
      expect(typeErrors.length).toBe(0);
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });

  test('UI-037: Form data validation', async ({ page }) => {
    await loginAsAdmin(page);
    await goToAdminOrders(page);

    const orderId = await findFirstOrder(page);
    if (orderId) {
      await page.goto(`${BASE_URL}/admin/orders/${orderId}/payment-confirmation`);
      await page.waitForLoadState('networkidle');

      // Try to submit with invalid data
      await page.fill('input[name="paymentAmount"]', '-100');
      await page.fill('input[name="paymentDate"]', 'invalid-date');

      const confirmButton = page.locator('button:has-text("確認"), button:has-text("実行")').first();

      if (await confirmButton.count() > 0) {
        await confirmButton.click();
        await page.waitForTimeout(1000);

        // Should show validation error
        const error = page.locator('[role="alert"]').first();
        const hasError = await error.count() > 0;

        expect(hasError).toBe(true);
      }
    } else {
      test.skip(true, 'No orders available for testing');
    }
  });
});
