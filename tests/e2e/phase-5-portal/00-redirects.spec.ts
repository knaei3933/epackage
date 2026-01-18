import { test, expect } from '@playwright/test';

/**
 * Phase 5: Portal → Admin/Customers Redirect Tests
 *
 * 독립 실행 가능: ✅
 * 선행 조건: 없음 (공개 페이지)
 *
 * Migrated: /portal/* → /admin/customers/*
 * Redirect Type: 301 Permanent Redirect (SEO friendly)
 */

test.describe('Portal → Admin/Customers 301 Redirects', () => {
  test('TC-5.0.1: should redirect /portal to /admin/customers', async ({ page }) => {
    await page.goto('/portal');
    await expect(page).toHaveURL(/\/admin\/customers$/);
  });

  test('TC-5.0.2: should redirect /portal/orders to /admin/customers/orders', async ({ page }) => {
    await page.goto('/portal/orders');
    await expect(page).toHaveURL(/\/admin\/customers\/orders$/);
  });

  test('TC-5.0.3: should redirect /portal/orders/[id] to /admin/customers/orders/[id]', async ({ page }) => {
    await page.goto('/portal/orders/test-order-123');
    await expect(page).toHaveURL(/\/admin\/customers\/orders\/test-order-123$/);
  });

  test('TC-5.0.4: should redirect /portal/documents to /admin/customers/documents', async ({ page }) => {
    await page.goto('/portal/documents');
    await expect(page).toHaveURL(/\/admin\/customers\/documents$/);
  });

  test('TC-5.0.5: should redirect /portal/profile to /admin/customers/profile', async ({ page }) => {
    await page.goto('/portal/profile');
    await expect(page).toHaveURL(/\/admin\/customers\/profile$/);
  });

  test('TC-5.0.6: should redirect /portal/support to /admin/customers/support', async ({ page }) => {
    await page.goto('/portal/support');
    await expect(page).toHaveURL(/\/admin\/customers\/support$/);
  });

  test('TC-5.0.7: should preserve query parameters', async ({ page }) => {
    await page.goto('/portal/orders?status=pending&page=2');
    const url = page.url();
    expect(url).toContain('/admin/customers/orders');
    expect(url).toContain('status=pending');
    expect(url).toContain('page=2');
  });

  test('TC-5.0.8: should preserve hash fragments', async ({ page }) => {
    await page.goto('/portal#section');
    const url = page.url();
    expect(url).toContain('/admin/customers');
    expect(url).toContain('#section');
  });

  test('TC-5.0.9: should return 301 status for SEO', async ({ page }) => {
    const response = await page.request.get('/portal');
    expect(response.status()).toBe(301);
  });

  test('TC-5.0.10: should return 301 status for subpages', async ({ page }) => {
    const response = await page.request.get('/portal/orders');
    expect(response.status()).toBe(301);
  });

  test('TC-5.0.11: should redirect trailing slash correctly', async ({ page }) => {
    await page.goto('/portal/');
    await expect(page).toHaveURL(/\/admin\/customers\/?$/);
  });

  test('TC-5.0.12: should redirect multiple slashes correctly', async ({ page }) => {
    await page.goto('/portal//orders');
    await expect(page).toHaveURL(/\/admin\/customers\/orders/);
  });

  test('TC-5.0.13: should handle complex query parameters', async ({ page }) => {
    await page.goto('/portal/documents?type=quotation&sort=desc&limit=10');
    const url = page.url();
    expect(url).toContain('/admin/customers/documents');
    expect(url).toContain('type=quotation');
    expect(url).toContain('sort=desc');
    expect(url).toContain('limit=10');
  });

  test('TC-5.0.14: should not affect other routes', async ({ page }) => {
    // These should NOT redirect
    await page.goto('/member/orders');
    await expect(page).toHaveURL(/\/member\/orders/);

    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.goto('/catalog');
    await expect(page).toHaveURL(/\/catalog/);
  });

  test('TC-5.0.15: should handle encoded query parameters', async ({ page }) => {
    await page.goto('/portal/orders?search=%E3%83%86%E3%82%B9%E3%83%88');
    const url = page.url();
    expect(url).toContain('/admin/customers/orders');
    expect(url).toContain('search=');
    expect(url).toContain('%E3%83%86%E3%82%B9%E3%83%88');
  });

  test('TC-5.0.16: should preserve multiple query parameters correctly', async ({ page }) => {
    await page.goto('/portal/orders?status=shipped&sort=date&direction=asc');
    const url = page.url();
    expect(url).toContain('/admin/customers/orders');
    expect(url).toContain('status=shipped');
    expect(url).toContain('sort=date');
    expect(url).toContain('direction=asc');
  });

  test('TC-5.0.17: should handle redirect with authentication', async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"], input[type="email"]', 'test-member@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Wait for redirect after login
    await page.waitForTimeout(2000);

    // Now try to access portal (should redirect to admin/customers)
    await page.goto('/portal');
    await expect(page).toHaveURL(/\/admin\/customers/);
  });

  test('TC-5.0.18: should handle deep nested routes', async ({ page }) => {
    await page.goto('/portal/orders/test-order-123/documents');
    await expect(page).toHaveURL(/\/admin\/customers\/orders\/test-order-123\/documents/);
  });

  test('TC-5.0.19: should handle URL with port correctly', async ({ page }) => {
    await page.goto('/portal?debug=true');
    const url = page.url();
    expect(url).toContain('/admin/customers');
    expect(url).toContain('debug=true');
  });

  test('TC-5.0.20: should not double encode on redirect', async ({ page }) => {
    const encodedText = encodeURIComponent('テスト注文');
    await page.goto(`/portal/orders?search=${encodedText}`);
    const url = page.url();
    expect(url).toContain('/admin/customers/orders');
    // Should only be encoded once
    const searchParam = new URL(url).searchParams.get('search');
    expect(searchParam).toBe('テスト注文');
  });
});
