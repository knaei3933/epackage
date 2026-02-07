/**
 * Member Specification Change E2E Tests
 *
 * 顧客用仕様変更機能のE2Eテスト
 * - 顧客ログイン
 * - 注文準備ページへのアクセス
 * - 仕様変更モーダルの操作
 * - 価格再計算の確認
 * - 管理者通知の検証
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, QUOTATION_DATA, formatYen } from './test-data';

// =====================================================
// Test Setup
// =====================================================

test.beforeEach(async ({ page }) => {
  // 顧客ログインページへアクセス
  await page.goto('/auth/signin');

  // ログインフォームに入力
  await page.fill('input[type="email"]', TEST_USERS.member.email);
  await page.fill('input[type="password"]', TEST_USERS.member.password);

  // ログインボタンをクリック
  await page.click('button[type="submit"]');

  // ログイン後の処理を待機
  await page.waitForTimeout(2000);

  // ダッシュボードへ遷移
  await page.goto('/member/dashboard');
  await page.waitForLoadState('domcontentloaded');
});

// =====================================================
// Test Cases
// =====================================================

test.describe('顧客仕様変更機能', () => {
  test('MEMBER-SPEC-001: 顧客が注文準備ページで仕様変更ボタンを表示できる', async ({ page }) => {
    // 注文一覧ページへ移動
    await page.goto('/member/orders');

    // 注文が表示されるのを待機
    await page.waitForSelector('[data-testid="member-order-row"]', { timeout: 10000 });

    // データ入稿済みの注文を探す
    const orders = page.locator('[data-testid="member-order-row"]');
    const count = await orders.count();

    let targetOrderFound = false;
    for (let i = 0; i < count; i++) {
      const order = orders.nth(i);
      const statusText = await order.locator('[data-testid="order-status"]').textContent();

      // データ入稿済みの注文を選択
      if (statusText?.includes('データ入稿') || statusText?.includes('data_received')) {
        await order.click();
        targetOrderFound = true;
        break;
      }
    }

    if (!targetOrderFound) {
      // データ入稿済みの注文がない場合は最初の注文を選択
      await orders.first().click();
    }

    // 注文詳細ページが表示されるのを待機
    await page.waitForURL('**/member/orders/**');

    // 注文準備ページへのリンクがあることを確認
    const preparationLink = page.locator('a:has-text("注文準備")');
    if (await preparationLink.isVisible()) {
      await preparationLink.click();
      await page.waitForURL('**/member/orders/**/preparation');
    }

    // 仕様変更ボタンが表示されることを確認
    await expect(page.locator('button:has-text("仕様")')).toBeVisible();
  });

  test('MEMBER-SPEC-002: 仕様変更モーダルが正しく表示される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/member/orders');

    await page.waitForSelector('[data-testid="member-order-row"]', { timeout: 10000 });

    const orders = page.locator('[data-testid="member-order-row"]');
    const count = await orders.count();

    let targetOrderFound = false;
    for (let i = 0; i < count; i++) {
      const order = orders.nth(i);
      const statusText = await order.locator('[data-testid="order-status"]').textContent();

      if (statusText?.includes('データ入稿') || statusText?.includes('data_received')) {
        await order.click();
        targetOrderFound = true;
        break;
      }
    }

    if (!targetOrderFound) {
      await orders.first().click();
    }

    await page.waitForURL('**/member/orders/**');

    // 注文準備ページへ
    const preparationLink = page.locator('a:has-text("注文準備")');
    if (await preparationLink.isVisible()) {
      await preparationLink.click();
      await page.waitForURL('**/member/orders/**/preparation');
    }

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様")');

    // モーダルが表示されることを確認
    await expect(page.locator('[data-testid="specification-modal"]')).toBeVisible();
    await expect(page.locator('text=/仕様変更/')).toBeVisible();

    // 現在の仕様が表示されることを確認
    await expect(page.locator('label:has-text("幅 (mm)")')).toBeVisible();
    await expect(page.locator('label:has-text("高さ (mm)")')).toBeVisible();
    await expect(page.locator('label:has-text("マチ (mm)")')).toBeVisible();
    await expect(page.locator('label:has-text("素材")')).toBeVisible();
  });

  test('MEMBER-SPEC-003: サイズ変更で価格が再計算される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/member/orders');

    await page.waitForSelector('[data-testid="member-order-row"]', { timeout: 10000 });
    const orders = page.locator('[data-testid="member-order-row"]');
    await orders.first().click();

    await page.waitForURL('**/member/orders/**');

    // 注文準備ページへ
    const preparationLink = page.locator('a:has-text("注文準備")');
    if (await preparationLink.isVisible()) {
      await preparationLink.click();
      await page.waitForURL('**/member/orders/**/preparation');
    }

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様")');

    // モーダルが表示されるのを待機
    await page.waitForSelector('[data-testid="specification-modal"]');

    // 現在の幅の値を取得
    const widthInput = page.locator('[data-testid="spec-width-input"]');
    const originalWidth = await widthInput.inputValue();

    // 幅を変更（+10mm）
    const newWidth = parseInt(originalWidth || '200') + 10;
    await widthInput.fill(String(newWidth));

    // 価格差額が計算されるのを待機
    await page.waitForSelector('text=/価格差額|金額/', { timeout: 10000 });

    // 価格差額セクションが表示されることを確認
    await expect(page.locator('text=/元の金額|新しい金額/')).toBeVisible();
    await expect(page.locator('text=/差額:/')).toBeVisible();

    // 差額がプラスであることを確認（サイズ増加）
    const priceDiffText = await page.locator('text=/差額:/').textContent();
    expect(priceDiffText).toContain('+');
  });

  test('MEMBER-SPEC-004: 仕様変更確定で新しい見積が作成される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/member/orders');

    await page.waitForSelector('[data-testid="member-order-row"]', { timeout: 10000 });
    const orders = page.locator('[data-testid="member-order-row"]');
    await orders.first().click();

    await page.waitForURL('**/member/orders/**');

    // 注文準備ページへ
    const preparationLink = page.locator('a:has-text("注文準備")');
    if (await preparationLink.isVisible()) {
      await preparationLink.click();
      await page.waitForURL('**/member/orders/**/preparation');
    }

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様")');

    // モーダルが表示されるのを待機
    await page.waitForSelector('[data-testid="specification-modal"]');

    // 変更理由を入力
    await page.fill('[data-testid="spec-change-reason"]', 'E2Eテストによる仕様変更（顧客）');

    // 幅を変更
    const widthInput = page.locator('[data-testid="spec-width-input"]');
    const originalWidth = await widthInput.inputValue();
    const newWidth = parseInt(originalWidth || '200') + 10;
    await widthInput.fill(String(newWidth));

    // 価格差額が計算されるのを待機
    await page.waitForSelector('text=/価格差額|金額/', { timeout: 10000 });

    // 変更確定ボタンをクリック
    await page.click('button:has-text("変更を確定")');

    // 成功メッセージが表示されることを確認
    await expect(page.locator('text=/仕様変更リクエストを送信しました|変更が保存されました/')).toBeVisible({ timeout: 10000 });

    // モーダルが閉じることを確認
    await expect(page.locator('[data-testid="specification-modal"]')).not.toBeVisible();
  });

  test('MEMBER-SPEC-005: 管理者に通知が送信される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/member/orders');

    await page.waitForSelector('[data-testid="member-order-row"]', { timeout: 10000 });
    const orders = page.locator('[data-testid="member-order-row"]');
    await orders.first().click();

    await page.waitForURL('**/member/orders/**');

    // 注文準備ページへ
    const preparationLink = page.locator('a:has-text("注文準備")');
    if (await preparationLink.isVisible()) {
      await preparationLink.click();
      await page.waitForURL('**/member/orders/**/preparation');
    }

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様")');

    await page.waitForSelector('[data-testid="specification-modal"]');

    // 変更理由を入力
    await page.fill('[data-testid="spec-change-reason"]', 'E2Eテストによる仕様変更（管理者通知確認）');

    // 幅を変更
    const widthInput = page.locator('[data-testid="spec-width-input"]');
    const originalWidth = await widthInput.inputValue();
    const newWidth = parseInt(originalWidth || '200') + 10;
    await widthInput.fill(String(newWidth));

    // 価格差額が計算されるのを待機
    await page.waitForSelector('text=/価格差額|金額/', { timeout: 10000 });

    // 変更確定ボタンをクリック
    await page.click('button:has-text("変更を確定")');

    // 成功メッセージを待機
    await page.waitForSelector('text=/仕様変更リクエストを送信しました|変更が保存されました/', { timeout: 10000 });

    // 別タブで管理者ページを開いて通知を確認
    const adminPage = await page.context().newPage();
    await adminPage.goto('/admin/signin');

    // 管理者ログイン
    await adminPage.fill('input[name="email"]', TEST_USERS.admin.email);
    await adminPage.fill('input[name="password"]', TEST_USERS.admin.password);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('**/admin/dashboard', { timeout: 10000 });

    // 通知を確認
    await adminPage.waitForSelector('[data-testid="notification-icon"]', { timeout: 10000 });
    await adminPage.click('[data-testid="notification-icon"]');

    // 仕様変更リクエスト通知が表示されることを確認
    await expect(adminPage.locator('text=/仕様変更リクエスト/')).toBeVisible({ timeout: 5000 });

    await adminPage.close();
  });

  test('MEMBER-SPEC-006: キャンセルで変更が破棄される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/member/orders');

    await page.waitForSelector('[data-testid="member-order-row"]', { timeout: 10000 });
    const orders = page.locator('[data-testid="member-order-row"]');
    await orders.first().click();

    await page.waitForURL('**/member/orders/**');

    // 注文準備ページへ
    const preparationLink = page.locator('a:has-text("注文準備")');
    if (await preparationLink.isVisible()) {
      await preparationLink.click();
      await page.waitForURL('**/member/orders/**/preparation');
    }

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様")');

    await page.waitForSelector('[data-testid="specification-modal"]');

    // 幅を変更
    const widthInput = page.locator('[data-testid="spec-width-input"]');
    await widthInput.fill('999');

    // 価格差額が計算されるのを待機
    await page.waitForSelector('text=/価格差額|金額/', { timeout: 10000 });

    // キャンセルボタンをクリック
    await page.click('button:has-text("キャンセル")');

    // モーダルが閉じることを確認
    await expect(page.locator('[data-testid="specification-modal"]')).not.toBeVisible();

    // 注文詳細ページに戻っていることを確認
    await expect(page.locator('text=/注文詳細|Order Details/')).toBeVisible();

    // 変更が保存されていないことを確認（ページをリロード）
    await page.reload();
    await page.waitForSelector('[data-testid="order-detail"]');

    // 仕様変更ボタンを再度クリックして元の値が維持されていることを確認
    await page.click('button:has-text("仕様")');
    await page.waitForSelector('[data-testid="specification-modal"]');

    // 幅が999でないことを確認
    const widthInputAfter = page.locator('input[placeholder*="幅"]').first();
    const widthValue = await widthInputAfter.inputValue();
    expect(widthValue).not.toBe('999');
  });

  test('MEMBER-SPEC-007: 素材変更で価格が再計算される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/member/orders');

    await page.waitForSelector('[data-testid="member-order-row"]', { timeout: 10000 });
    const orders = page.locator('[data-testid="member-order-row"]');
    await orders.first().click();

    await page.waitForURL('**/member/orders/**');

    // 注文準備ページへ
    const preparationLink = page.locator('a:has-text("注文準備")');
    if (await preparationLink.isVisible()) {
      await preparationLink.click();
      await page.waitForURL('**/member/orders/**/preparation');
    }

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様")');

    await page.waitForSelector('[data-testid="specification-modal"]');

    // 現在の素材を取得
    const materialSelect = page.locator('[data-testid="spec-material-select"]');
    const originalMaterial = await materialSelect.inputValue();

    // 異なる素材を選択
    await materialSelect.selectOption({ index: 1 });

    // 価格差額が計算されるのを待機
    await page.waitForSelector('text=/価格差額|金額/', { timeout: 10000 });

    // 価格差額が表示されることを確認
    await expect(page.locator('text=/差額:/')).toBeVisible();
  });

  test('MEMBER-SPEC-008: 後加工オプション変更で価格が再計算される', async ({ page }) => {
    // 注文詳細ページへ移動
    await page.goto('/member/orders');

    await page.waitForSelector('[data-testid="member-order-row"]', { timeout: 10000 });
    const orders = page.locator('[data-testid="member-order-row"]');
    await orders.first().click();

    await page.waitForURL('**/member/orders/**');

    // 注文準備ページへ
    const preparationLink = page.locator('a:has-text("注文準備")');
    if (await preparationLink.isVisible()) {
      await preparationLink.click();
      await page.waitForURL('**/member/orders/**/preparation');
    }

    // 仕様変更ボタンをクリック
    await page.click('button:has-text("仕様")');

    await page.waitForSelector('[data-testid="specification-modal"]');

    // ジッパーオプションをオンにする
    const zipperCheckbox = page.locator('input[type="checkbox"]').first();
    await zipperCheckbox.check();

    // 価格差額が計算されるのを待機
    await page.waitForSelector('text=/価格差額|金額/', { timeout: 10000 });

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
  await page.goto('/member/signout');
});
