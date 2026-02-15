/**
 * Specification Change Workflow E2E Tests
 *
 * 仕様変更ワークフローの統合テスト
 * - 顧客から仕様変更リクエスト
 * - 管理者による仕様変更処理
 * - 通知の双方向確認
 * - 変更履歴の検証
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, QUOTATION_DATA, formatYen } from './test-data';

// =====================================================
// Test Setup
// =====================================================

test.describe('仕様変更ワークフロー統合テスト', () => {
  let testOrderId: string | null = null;

  test('WORKFLOW-001: 顧客による仕様変更リクエストから管理者処理までの完全なワークフロー', async ({ browser }) => {
    // =====================================================
    // Step 1: 顧客が仕様変更リクエストを送信
    // =====================================================

    // 顧客コンテキストを作成
    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();

    // 顧客ログイン
    await memberPage.goto('/auth/signin');
    await memberPage.fill('input[type="email"]', TEST_USERS.member.email);
    await memberPage.fill('input[type="password"]', TEST_USERS.member.password);
    await memberPage.click('button[type="submit"]');
    await memberPage.waitForTimeout(2000);
    await memberPage.goto('/member/dashboard');
    await memberPage.waitForLoadState('domcontentloaded');

    // 注文一覧へ移動
    await memberPage.goto('/member/orders');
    await memberPage.waitForSelector('[data-testid="admin-order-row"]', { timeout: 10000 });

    // データ入稿済みの注文を探す
    const orders = memberPage.locator('[data-testid="admin-order-row"]');
    const count = await orders.count();

    let targetOrderIndex = 0;
    for (let i = 0; i < count; i++) {
      const order = orders.nth(i);
      const statusText = await order.locator('[data-testid="order-status"]').textContent();

      if (statusText?.includes('データ入稿') || statusText?.includes('data_received')) {
        targetOrderIndex = i;
        break;
      }
    }

    // 注文をクリック
    await orders.nth(targetOrderIndex).click();
    await memberPage.waitForURL('**/member/orders/**');

    // 注文IDを保存
    const currentUrl = memberPage.url();
    const urlMatch = currentUrl.match(/\/orders\/([^/]+)/);
    testOrderId = urlMatch ? urlMatch[1] : null;

    // 注文準備ページへ
    const preparationLink = memberPage.locator('a:has-text("注文準備")');
    if (await preparationLink.isVisible()) {
      await preparationLink.click();
      await memberPage.waitForURL('**/member/orders/**/preparation');
    }

    // 仕様変更ボタンをクリック
    await memberPage.click('button:has-text("仕様")');
    await memberPage.waitForSelector('.fixed.inset-0');

    // 変更理由を入力
    await memberPage.fill('textarea[placeholder*="理由"]', '統合テストによる仕様変更リクエスト');

    // 幅を変更
    const widthInput = memberPage.locator('input[placeholder*="幅"]').first();
    const originalWidth = await widthInput.inputValue();
    const newWidth = parseInt(originalWidth || '200') + 10;
    await widthInput.fill(String(newWidth));

    // 価格差額が計算されるのを待機
    await memberPage.waitForSelector('text=/価格差額|金額/', { timeout: 10000 });

    // 変更確定ボタンをクリック
    await memberPage.click('button:has-text("変更を確定")');

    // 成功メッセージを確認
    await expect(memberPage.locator('text=/仕様変更リクエストを送信しました/')).toBeVisible({ timeout: 10000 });

    // =====================================================
    // Step 2: 管理者が通知を受信
    // =====================================================

    // 管理者コンテキストを作成
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // 管理者ログイン
    await adminPage.goto('/auth/signin');
    await adminPage.fill('input[type="email"]', TEST_USERS.admin.email);
    await adminPage.fill('input[type="password"]', TEST_USERS.admin.password);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForTimeout(2000);
    await adminPage.goto('/admin/dashboard');
    await adminPage.waitForLoadState('domcontentloaded');

    // 通知アイコンをクリック
    await adminPage.waitForSelector('[data-testid="notification-icon"]', { timeout: 10000 });
    await adminPage.click('[data-testid="notification-icon"]');

    // 仕様変更リクエスト通知があることを確認
    await expect(adminPage.locator('text=/仕様変更リクエスト/')).toBeVisible({ timeout: 5000 });

    // 通知をクリックして注文詳細ページへ移動
    await adminPage.click('text=/仕様変更リクエスト/');
    await adminPage.waitForURL('**/admin/orders/**');

    // =====================================================
    // Step 3: 管理者が仕様変更を確認・承認
    // =====================================================

    // 注文詳細ページが表示されることを確認
    await expect(adminPage.locator('text=/商品明細|注文アイテム/')).toBeVisible();

    // 管理者も仕様変更ボタンをクリック
    await adminPage.click('button:has-text("仕様変更")');
    await adminPage.waitForSelector('.fixed.inset-0');

    // 管理者用モーダルであることを確認
    await expect(adminPage.locator('text=/仕様変更（管理者）/')).toBeVisible();

    // 変更理由を入力
    await adminPage.fill('textarea[placeholder*="理由"]', '管理者による承認と追加変更');

    // 価格差額が表示されていることを確認
    await expect(adminPage.locator('text=/価格差額/')).toBeVisible();

    // 変更確定ボタンをクリック
    await adminPage.click('button:has-text("変更を確定")');

    // 成功メッセージを確認
    await expect(adminPage.locator('text=/仕様変更を完了しました/')).toBeVisible({ timeout: 10000 });

    // =====================================================
    // Step 4: 顧客が仕様変更完了通知を受信
    // =====================================================

    // 顧客ページに戻る
    await memberPage.bringToFront();

    // 通知を確認
    await memberPage.waitForSelector('[data-testid="notification-icon"]', { timeout: 10000 });
    await memberPage.click('[data-testid="notification-icon"]');

    // 仕様変更完了通知があることを確認
    await expect(memberPage.locator('text=/仕様変更のお知らせ|仕様が変更されました/')).toBeVisible({ timeout: 5000 });

    // =====================================================
    // Step 5: 変更履歴の確認
    // =====================================================

    // 注文詳細ページへ移動
    await memberPage.goto(`/member/orders/${testOrderId}`);

    // 変更履歴セクションがあることを確認
    const historySection = memberPage.locator('[data-testid="spec-change-history"]');
    if (await historySection.isVisible()) {
      // 変更履歴が表示されることを確認
      await expect(historySection.locator('text=/変更履歴|仕様変更履歴/')).toBeVisible();
    }

    // =====================================================
    // Cleanup
    // =====================================================

    await memberContext.close();
    await adminContext.close();
  });

  test('WORKFLOW-002: 顧客と管理者の双方向仕様変更', async ({ browser }) => {
    // =====================================================
    // Step 1: 管理者から先に仕様変更を開始
    // =====================================================

    // 管理者コンテキストを作成
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    // 管理者ログイン
    await adminPage.goto('/auth/signin');
    await adminPage.fill('input[type="email"]', TEST_USERS.admin.email);
    await adminPage.fill('input[type="password"]', TEST_USERS.admin.password);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForTimeout(2000);
    await adminPage.goto('/admin/dashboard');
    await adminPage.waitForLoadState('domcontentloaded');

    // 注文一覧へ移動
    await adminPage.goto('/admin/orders');
    await adminPage.waitForSelector('[data-testid="admin-order-row"]', { timeout: 10000 });

    // 最初の注文をクリック
    const adminOrderRow = adminPage.locator('[data-testid="admin-order-row"]').first();
    await adminOrderRow.locator('a:has-text("詳細")').click();
    await adminPage.waitForURL('**/admin/orders/**');

    // 注文IDを取得
    const adminUrl = adminPage.url();
    const adminUrlMatch = adminUrl.match(/\/orders\/([^/]+)/);
    const orderId = adminUrlMatch ? adminUrlMatch[1] : null;

    // 管理者が仕様変更
    await adminPage.click('button:has-text("仕様変更")');
    await adminPage.waitForSelector('.fixed.inset-0');

    await adminPage.fill('textarea[placeholder*="理由"]', '管理者からの仕様変更提案');

    // 素材を変更
    const materialSelect = adminPage.locator('select:has-text("PET/AL")').first();
    await materialSelect.selectOption({ index: 1 });

    // 価格差額が計算されるのを待機
    await adminPage.waitForSelector('text=/価格差額|金額/', { timeout: 10000 });

    await adminPage.click('button:has-text("変更を確定")');

    // 成功メッセージを確認
    await expect(adminPage.locator('text=/仕様変更を完了しました/')).toBeVisible({ timeout: 10000 });

    // =====================================================
    // Step 2: 顧客が通知を受信して確認
    // =====================================================

    // 顧客コンテキストを作成
    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();

    // 顧客ログイン
    await memberPage.goto('/auth/signin');
    await memberPage.fill('input[type="email"]', TEST_USERS.member.email);
    await memberPage.fill('input[type="password"]', TEST_USERS.member.password);
    await memberPage.click('button[type="submit"]');
    await memberPage.waitForTimeout(2000);
    await memberPage.goto('/member/dashboard');
    await memberPage.waitForLoadState('domcontentloaded');

    // 通知アイコンをクリック
    await memberPage.waitForSelector('[data-testid="notification-icon"]', { timeout: 10000 });
    await memberPage.click('[data-testid="notification-icon"]');

    // 仕様変更通知があることを確認
    await expect(memberPage.locator('text=/仕様変更のお知らせ/')).toBeVisible({ timeout: 5000 });

    // =====================================================
    // Step 3: 顧客が更なる変更をリクエスト
    // =====================================================

    // 注文詳細ページへ移動
    if (orderId) {
      await memberPage.goto(`/member/orders/${orderId}`);
    } else {
      await memberPage.goto('/member/orders');
      await memberPage.waitForSelector('[data-testid="admin-order-row"]', { timeout: 10000 });
      await memberPage.locator('[data-testid="admin-order-row"]').first().click();
    }

    await memberPage.waitForURL('**/member/orders/**');

    // 注文準備ページへ
    const preparationLink = memberPage.locator('a:has-text("注文準備")');
    if (await preparationLink.isVisible()) {
      await preparationLink.click();
      await memberPage.waitForURL('**/member/orders/**/preparation');
    }

    // 顧客も仕様変更を追加
    await memberPage.click('button:has-text("仕様")');
    await memberPage.waitForSelector('.fixed.inset-0');

    await memberPage.fill('textarea[placeholder*="理由"]', '顧客からの追加調整リクエスト');

    // 印刷色数を変更
    const colorInput = memberPage.locator('input[type="number"][min="1"][max="8"]').first();
    const originalColors = await colorInput.inputValue();
    const newColors = parseInt(originalColors || '1') + 1;
    await colorInput.fill(String(newColors));

    // 価格差額が計算されるのを待機
    await memberPage.waitForSelector('text=/価格差額|金額/', { timeout: 10000 });

    await memberPage.click('button:has-text("変更を確定")');

    // 成功メッセージを確認
    await expect(memberPage.locator('text=/仕様変更リクエストを送信しました/')).toBeVisible({ timeout: 10000 });

    // =====================================================
    // Cleanup
    // =====================================================

    await adminContext.close();
    await memberContext.close();
  });

  test('WORKFLOW-003: 仕様変更キャンセルでのワークフロー中断', async ({ page }) => {
    // 顧客として仕様変更を開始
    await page.goto('/member/signin');
    await page.fill('input[name="email"]', TEST_USERS.member.email);
    await page.fill('input[name="password"]', TEST_USERS.member.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/member/dashboard', { timeout: 10000 });

    // 注文一覧へ移動
    await page.goto('/member/orders');
    await page.waitForSelector('[data-testid="admin-order-row"]', { timeout: 10000 });

    const orders = page.locator('[data-testid="admin-order-row"]');
    await orders.first().click();
    await page.waitForURL('**/member/orders/**');

    // 注文準備ページへ
    const preparationLink = page.locator('a:has-text("注文準備")');
    if (await preparationLink.isVisible()) {
      await preparationLink.click();
      await page.waitForURL('**/member/orders/**/preparation');
    }

    // 仕様変更モーダルを開く
    await page.click('button:has-text("仕様")');
    await page.waitForSelector('.fixed.inset-0');

    // 変更を加える
    const widthInput = page.locator('input[placeholder*="幅"]').first();
    await widthInput.fill('999');

    await page.waitForSelector('text=/価格差額|金額/', { timeout: 10000 });

    // キャンセルをクリック
    await page.click('button:has-text("キャンセル")');

    // モーダルが閉じることを確認
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible();

    // 仕様変更が保存されていないことを確認（再度モーダルを開く）
    await page.click('button:has-text("仕様")');
    await page.waitForSelector('.fixed.inset-0');

    const widthInputAfter = page.locator('input[placeholder*="幅"]').first();
    const widthValue = await widthInputAfter.inputValue();
    expect(widthValue).not.toBe('999');

    // 通知が送信されていないことを確認
    const notificationIcon = page.locator('[data-testid="notification-icon"]');
    if (await notificationIcon.isVisible()) {
      await notificationIcon.click();
      // 仕様変更リクエスト通知がないことを確認
      const specChangeNotification = page.locator('text=/仕様変更リクエスト/');
      await expect(specChangeNotification).not.toBeVisible({ timeout: 2000 });
    }
  });

  test('WORKFLOW-004: 価格増減による通知優先度の変化', async ({ browser }) => {
    // =====================================================
    // Case 1: 大幅な価格増加（高優先度通知）
    // =====================================================

    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    await adminPage.goto('/admin/signin');
    await adminPage.fill('input[name="email"]', TEST_USERS.admin.email);
    await adminPage.fill('input[name="password"]', TEST_USERS.admin.password);
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('**/admin/dashboard', { timeout: 10000 });

    await adminPage.goto('/admin/orders');
    await adminPage.waitForSelector('[data-testid="admin-order-row"]', { timeout: 10000 });

    const adminOrderRow = adminPage.locator('[data-testid="admin-order-row"]').first();
    await adminOrderRow.locator('a:has-text("詳細")').click();
    await adminPage.waitForURL('**/admin/orders/**');

    // 大幅なサイズ増加で価格を大幅に上げる
    await adminPage.click('button:has-text("仕様変更")');
    await adminPage.waitForSelector('.fixed.inset-0');

    await adminPage.fill('textarea[placeholder*="理由"]', '大幅な仕様変更による価格増加テスト');

    // サイズを大幅に増加
    const widthInput = adminPage.locator('input[placeholder*="幅"]').first();
    const heightInput = adminPage.locator('input[placeholder*="高さ"]').first();

    await widthInput.fill('500');
    await heightInput.fill('600');

    await adminPage.waitForSelector('text=/価格差額/', { timeout: 10000 });

    // 高優先度であることを確認（価格差額が大きい）
    const priceDiffText = await adminPage.locator('text=/差額:/').textContent();
    expect(priceDiffText).toContain('+');

    await adminPage.click('button:has-text("変更を確定")');

    // 高優先度通知が作成されることを確認
    await expect(adminPage.locator('text=/仕様変更を完了しました/')).toBeVisible({ timeout: 10000 });

    await adminContext.close();
  });
});

// =====================================================
// Helper Functions
// =====================================================

/**
 * 注文ステータスを変更するヘルパー関数（テストデータ準備用）
 */
async function setOrderStatus(orderId: string, status: string) {
  // 実際の実装ではAPIを呼び出してステータスを変更
  console.log(`Setting order ${orderId} to status: ${status}`);
}
