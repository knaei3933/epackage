/**
 * E2E: /admin/samples list + reprint button (E1/E2/E3 in test spec)
 *
 * Requires admin credentials in env:
 *   ADMIN_EMAIL / ADMIN_PASSWORD (skipped when absent, like member-pages.spec.ts)
 *   BASE_URL must not be production (global-setup guard).
 */

import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const hasCreds = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);

async function loginAsAdmin(page: Page) {
  await page.goto('/auth/signin?redirect=/admin/samples');
  await page.fill('input[name="email"]', ADMIN_EMAIL!);
  await page.fill('input[name="password"]', ADMIN_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/samples**', { timeout: 15000 });
}

test.describe('admin samples page', () => {
  test.skip(!hasCreds, 'ADMIN_EMAIL/ADMIN_PASSWORD not set');

  test('E1: list renders sample request rows', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('h1')).toContainText('サンプル依頼');
    const rows = page.locator('tbody tr');
    // ページは常にテーブル or 空状態をレンダリングする
    await expect(
      rows.first().or(page.getByText('サンプル依頼はまだありません'))
    ).toBeVisible();
  });

  test('E2: reprint button calls API and shows toast', async ({ page }) => {
    await loginAsAdmin(page);
    const row = page.locator('tbody tr').first();
    const rowExists = await row.isVisible().catch(() => false);
    test.skip(!rowExists, 'no sample requests in test environment');

    const apiPromise = page.waitForResponse(
      (r) => r.url().includes('/api/admin/samples/') && r.request().method() === 'POST'
    );
    await page.locator('[data-testid^="reprint-"]').first().click();
    const res = await apiPromise;
    expect([200, 404]).toContain(res.status());
    await expect(page.locator('[role="status"]')).toBeVisible();
  });

  test('E3: non-admin is redirected away', async ({ page }) => {
    test.fixme(!hasCreds, 'member-level negative case requires separate member creds');
    // 管理者セッションなしで直接アクセス → サインインへリダイレクト
    await page.goto('/admin/samples');
    await expect(page).toHaveURL(/auth\/signin/);
  });
});
