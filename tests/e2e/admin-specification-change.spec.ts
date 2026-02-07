/**
 * Admin Specification Change E2E Tests
 *
 * 管理者用仕様変更機能のE2Eテスト
 * - 管理者ログイン
 * - 注文詳細ページへのアクセス
 * - 仕様変更モーダルの操作
 * - 価格再計算の確認
 * - 顧客通知の検証
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, QUOTATION_DATA, formatYen } from './test-data';

// =====================================================
// Test Setup
// =====================================================

test.beforeEach(async ({ page }) => {
  // 管理者ログインページへアクセス
  await page.goto('/auth/signin');

  // ログインフォームに入力
  await page.fill('input[type="email"]', TEST_USERS.admin.email);
  await page.fill('input[type="password"]', TEST_USERS.admin.password);

  // ログインボタンをクリック
  await page.click('button[type="submit"]');

  // ログイン後の処理を待機
  await page.waitForTimeout(2000);

  // ダッシュボードへ遷移
  await page.goto('/admin/dashboard');
  await page.waitForLoadState('domcontentloaded');
});

// =====================================================
// Test Cases
// =====================================================

test.describe('管理者仕様変更機能', () => {
  test('ADMIN-SPEC-001: 管理者が注文詳細ページで仕様変更ボタンを表示できる', async ({ page }) => {
    // 注文一覧ページへ移動
    await page.goto('/admin/orders');
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

    // 注文リストが読み込まれるのを待機
    await page.waitForTimeout(3000);

    // テーブルまたは注文リストを待機
    const orderTable = page.locator('[data-testid="admin-orders-list"] tbody tr').or(page.locator('[class*="order"]'));
    const count = await orderTable.count();

    // 注文が存在するか確認
    if (count === 0) {
      test.skip(true, '注文データが存在しません');
    }

    // 最初の注文の詳細リンクをクリック
    await orderTable.first().locator('a:has-text("詳細")').click();

    // 注文詳細ページが表示されるのを待機
    await page.waitForURL('**/admin/orders/**');

    // 商品明細セクションが表示されることを確認
    await expect(page.locator('text=/商品明細|注文アイテム|Order Items/')).toBeVisible();

    // 仕様変更ボタンが表示されることを確認
    await expect(page.locator('button:has-text("仕様変更")')).toBeVisible();
  });

  test('ADMIN-SPEC-002: 仕様変更モーダルが正しく表示される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/admin/orders');

    await page.waitForSelector('[data-testid="admin-order-row"]', { timeout: 10000 });
    const firstOrder = page.locator('[data-testid="admin-order-row"]').first();
    await firstOrder.locator('a:has-text("詳細")').click();

    await page.waitForURL('**/admin/orders/**');

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様変更")');

    // モーダルが表示されることを確認
    await expect(page.locator('[data-testid="specification-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="spec-modal-title"]')).toBeVisible();

    // 現在の仕様が表示されることを確認
    await expect(page.locator('[data-testid="spec-width-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="spec-height-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="spec-depth-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="spec-material-select"]')).toBeVisible();
  });

  test('ADMIN-SPEC-003: サイズ変更で価格が再計算される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/admin/orders');

    await page.waitForSelector('[data-testid="admin-order-row"]', { timeout: 10000 });
    const firstOrder = page.locator('[data-testid="admin-order-row"]').first();
    await firstOrder.locator('a:has-text("詳細")').click();

    await page.waitForURL('**/admin/orders/**');

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様変更")');

    // モーダルが表示されるのを待機
    await page.waitForSelector('[data-testid="specification-modal"]');

    // 現在の幅の値を取得
    const widthInput = page.locator('[data-testid="spec-width-input"]');
    const originalWidth = await widthInput.inputValue();

    // 幅を変更（+10mm）
    const newWidth = parseInt(originalWidth || '200') + 10;
    await widthInput.fill(String(newWidth));

    // 価格差額が計算されるのを待機
    await page.waitForSelector('text=/価格差額|金額/', { timeout: 5000 });

    // 価格差額セクションが表示されることを確認
    await expect(page.locator('text=/元の金額|新しい金額/')).toBeVisible();
    await expect(page.locator('text=/差額:/')).toBeVisible();

    // 差額がプラスであることを確認（サイズ増加）
    const priceDiffText = await page.locator('text=/差額:/').textContent();
    expect(priceDiffText).toContain('+');
  });

  test('ADMIN-SPEC-004: 仕様変更確定で新しい見積が作成される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/admin/orders');

    await page.waitForSelector('[data-testid="admin-order-row"]', { timeout: 10000 });
    const firstOrder = page.locator('[data-testid="admin-order-row"]').first();
    await firstOrder.locator('a:has-text("詳細")').click();

    await page.waitForURL('**/admin/orders/**');

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様変更")');

    // モーダルが表示されるのを待機
    await page.waitForSelector('[data-testid="specification-modal"]');

    // 変更理由を入力
    await page.fill('[data-testid="spec-change-reason"]', 'E2Eテストによる仕様変更');

    // 幅を変更
    const widthInput = page.locator('[data-testid="spec-width-input"]');
    const originalWidth = await widthInput.inputValue();
    const newWidth = parseInt(originalWidth || '200') + 10;
    await widthInput.fill(String(newWidth));

    // 価格差額が計算されるのを待機
    await page.waitForSelector('text=/価格差額|金額/', { timeout: 5000 });

    // 変更確定ボタンをクリック
    await page.click('button:has-text("変更を確定")');

    // 成功メッセージが表示されることを確認
    await expect(page.locator('text=/仕様変更を完了しました|変更が保存されました/')).toBeVisible({ timeout: 10000 });

    // モーダルが閉じることを確認
    await expect(page.locator('[data-testid="specification-modal"]')).not.toBeVisible();

    // 仕様変更履歴が更新されることを確認
    await expect(page.locator('text=/仕様変更履歴|変更履歴/')).toBeVisible();
  });

  test('ADMIN-SPEC-005: 顧客に通知が送信される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/admin/orders');

    await page.waitForSelector('[data-testid="admin-order-row"]', { timeout: 10000 });
    const firstOrder = page.locator('[data-testid="admin-order-row"]').first();
    await firstOrder.locator('a:has-text("詳細")').click();

    await page.waitForURL('**/admin/orders/**');

    // 通知アイコンを確認（変更前）
    const notificationIconBefore = page.locator('[data-testid="notification-icon"]');
    const badgeCountBefore = await notificationIconBefore.locator('[data-testid="notification-badge"]').count();

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様変更")');

    await page.waitForSelector('[data-testid="specification-modal"]');

    // 変更理由を入力
    await page.fill('[data-testid="spec-change-reason"]', 'E2Eテストによる仕様変更（通知確認）');

    // 幅を変更
    const widthInput = page.locator('[data-testid="spec-width-input"]');
    const originalWidth = await widthInput.inputValue();
    const newWidth = parseInt(originalWidth || '200') + 10;
    await widthInput.fill(String(newWidth));

    // 価格差額が計算されるのを待機
    await page.waitForSelector('text=/価格差額|金額/', { timeout: 5000 });

    // 変更確定ボタンをクリック
    await page.click('button:has-text("変更を確定")');

    // 成功メッセージを待機
    await page.waitForSelector('text=/仕様変更を完了しました|変更が保存されました/', { timeout: 10000 });

    // 別タブで顧客ページを開いて通知を確認
    const customerPage = await page.context().newPage();
    await customerPage.goto('/member/dashboard');

    // 顧客ログイン（必要に応じて）
    const currentUrl = customerPage.url();
    if (currentUrl.includes('/signin')) {
      await customerPage.fill('input[name="email"]', TEST_USERS.member.email);
      await customerPage.fill('input[name="password"]', TEST_USERS.member.password);
      await customerPage.click('button[type="submit"]');
      await customerPage.waitForURL('**/member/dashboard');
    }

    // 通知を確認
    await customerPage.waitForSelector('[data-testid="notification-icon"]', { timeout: 10000 });
    await customerPage.click('[data-testid="notification-icon"]');

    // 仕様変更通知が表示されることを確認
    await expect(customerPage.locator('text=/仕様変更のお知らせ|仕様が変更されました/')).toBeVisible({ timeout: 5000 });

    await customerPage.close();
  });

  test('ADMIN-SPEC-006: キャンセルで変更が破棄される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/admin/orders');

    await page.waitForSelector('[data-testid="admin-order-row"]', { timeout: 10000 });
    const firstOrder = page.locator('[data-testid="admin-order-row"]').first();
    await firstOrder.locator('a:has-text("詳細")').click();

    await page.waitForURL('**/admin/orders/**');

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様変更")');

    await page.waitForSelector('[data-testid="specification-modal"]');

    // 幅を変更
    const widthInput = page.locator('[data-testid="spec-width-input"]');
    await widthInput.fill('999');

    // 価格差額が計算されるのを待機
    await page.waitForSelector('text=/価格差額|金額/', { timeout: 5000 });

    // キャンセルボタンをクリック
    await page.click('button:has-text("キャンセル")');

    // モーダルが閉じることを確認
    await expect(page.locator('[data-testid="specification-modal"]')).not.toBeVisible();

    // 注文詳細ページに戻っていることを確認
    await expect(page.locator('text=/商品明細|注文アイテム/')).toBeVisible();

    // 変更が保存されていないことを確認（ページをリロード）
    await page.reload();
    await page.waitForSelector('[data-testid="order-items"]');

    // 仕様変更ボタンを再度クリックして元の値が維持されていることを確認
    await page.click('button:has-text("仕様変更")');
    await page.waitForSelector('[data-testid="specification-modal"]');

    // 幅が999でないことを確認
    const widthInputAfter = page.locator('input[placeholder*="幅"]').first();
    const widthValue = await widthInputAfter.inputValue();
    expect(widthValue).not.toBe('999');
  });

  test('ADMIN-SPEC-007: 素材変更で価格が再計算される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/admin/orders');

    await page.waitForSelector('[data-testid="admin-order-row"]', { timeout: 10000 });
    const firstOrder = page.locator('[data-testid="admin-order-row"]').first();
    await firstOrder.locator('a:has-text("詳細")').click();

    await page.waitForURL('**/admin/orders/**');

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様変更")');

    await page.waitForSelector('[data-testid="specification-modal"]');

    // 現在の素材を取得
    const materialSelect = page.locator('[data-testid="spec-material-select"]');
    const originalMaterial = await materialSelect.inputValue();

    // 異なる素材を選択
    await materialSelect.selectOption({ index: 1 });

    // 価格差額が計算されるのを待機
    await page.waitForSelector('text=/価格差額|金額/', { timeout: 5000 });

    // 価格差額が表示されることを確認
    await expect(page.locator('text=/差額:/')).toBeVisible();
  });

  test('ADMIN-SPEC-008: 後加工オプション変更で価格が再計算される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/admin/orders');

    await page.waitForSelector('[data-testid="admin-order-row"]', { timeout: 10000 });
    const firstOrder = page.locator('[data-testid="admin-order-row"]').first();
    await firstOrder.locator('a:has-text("詳細")').click();

    await page.waitForURL('**/admin/orders/**');

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様変更")');

    await page.waitForSelector('[data-testid="specification-modal"]');

    // ジッパーオプションをオンにする
    const zipperCheckbox = page.locator('input[type="checkbox"]').first();
    await zipperCheckbox.check();

    // 価格差額が計算されるのを待機
    await page.waitForSelector('text=/価格差額|金額/', { timeout: 5000 });

    // 価格差額が表示されることを確認
    await expect(page.locator('text=/差額:/')).toBeVisible();

    // 差額がプラスであることを確認（オプション追加）
    const priceDiffText = await page.locator('text=/差額:/').textContent();
    expect(priceDiffText).toContain('+');
  });
});

// =====================================================
// Test Cleanup
// =====================================================

test.afterEach(async ({ page }) => {
  // テスト終了後にログアウト
  await page.goto('/admin/signout');
});
