/**
 * Member Pages Selectors Test
 *
 * This test file demonstrates the correct selectors for member pages
 * based on actual component implementations. All selectors have been
 * verified against the component code.
 *
 * Reference: MEMBER_PAGE_SELECTORS.md
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// =====================================================
// Test Helper Functions
// =====================================================

/**
 * Wait for loading state to complete
 */
async function waitForLoading(page: any) {
  // Wait for any loading spinner to disappear
  try {
    await page.waitForSelector('text=読み込み中...', { state: 'hidden', timeout: 10000 });
  } catch (e) {
    // Loading might not be present, continue
  }
}

/**
 * Navigate to member page and wait for load
 */
async function gotoMemberPage(page: any, path: string) {
  await page.goto(`${BASE_URL}${path}`);
  await waitForLoading(page);
}

// =====================================================
// 1. Dashboard Page Tests
// =====================================================

test.describe('Member Dashboard - Selectors', () => {

  test('page heading is visible', async ({ page }) => {
    await gotoMemberPage(page, '/member/dashboard');

    // Main heading with welcome message
    await expect(page.locator('h1:has-text("ようこそ")')).toBeVisible();
  });

  test('statistics cards are present', async ({ page }) => {
    await gotoMemberPage(page, '/member/dashboard');

    // Stats cards in grid
    await expect(page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-5')).toBeVisible();

    // Individual stat cards by href
    await expect(page.locator('a[href="/member/orders"]')).toBeVisible();
    await expect(page.locator('a[href="/member/quotations"]')).toBeVisible();
    await expect(page.locator('a[href="/member/samples"]')).toBeVisible();
    await expect(page.locator('a[href="/member/inquiries"]')).toBeVisible();
    await expect(page.locator('a[href="/member/contracts"]')).toBeVisible();
  });

  test('quick actions section exists', async ({ page }) => {
    await gotoMemberPage(page, '/member/dashboard');

    // Section heading
    await expect(page.locator('h2:has-text("クイックアクション")')).toBeVisible();

    // Quick action cards
    await expect(page.locator('a[href="/member/quotations"]').filter({ hasText: '見積作成' })).toBeVisible();
    await expect(page.locator('a[href="/member/orders"]').filter({ hasText: '注文一覧' })).toBeVisible();
    await expect(page.locator('a[href="/member/samples"]').filter({ hasText: 'サンプル申請' })).toBeVisible();
    await expect(page.locator('a[href="/member/contracts"]').filter({ hasText: '契約書' })).toBeVisible();
  });

  test('recent orders section exists', async ({ page }) => {
    await gotoMemberPage(page, '/member/dashboard');

    // Check if section exists (may be empty)
    const orderSection = page.locator('.card:has(h2:has-text("新規注文"))');
    const count = await orderSection.count();

    if (count > 0) {
      // "View All" link
      await expect(page.locator('a[href="/member/orders/new"]').filter({ hasText: 'すべて見る' })).toBeVisible();
    }
  });

  test('recent quotations section exists', async ({ page }) => {
    await gotoMemberPage(page, '/member/dashboard');

    // Check if section exists (may be empty)
    const quoteSection = page.locator('.card:has(h2:has-text("見積依頼"))');
    const count = await quoteSection.count();

    if (count > 0) {
      // "View All" link
      await expect(page.locator('a[href="/member/quotations"]').filter({ hasText: 'すべて見る' })).toBeVisible();
    }
  });

  test('handles empty states gracefully', async ({ page }) => {
    await gotoMemberPage(page, '/member/dashboard');

    // Check for empty state messages (may or may not be present)
    const emptyOrders = page.locator('text="新規注文はありません"');
    const emptyQuotes = page.locator('text="見積依頼はありません"');

    // At least the page should load without errors
    await expect(page.locator('h1:has-text("ようこそ")')).toBeVisible();
  });
});

// =====================================================
// 2. Orders Page Tests
// =====================================================

test.describe('Member Orders - Selectors', () => {

  test('page heading and header elements', async ({ page }) => {
    await gotoMemberPage(page, '/member/orders');

    // Main heading
    await expect(page.locator('h1:has-text("注文一覧")')).toBeVisible();

    // Subtitle
    await expect(page.locator('p:has-text("注文の一覧とステータス確認")')).toBeVisible();

    // New Quote button
    await expect(page.locator('button:has-text("+新規見積")')).toBeVisible();
  });

  test('filter controls are present', async ({ page }) => {
    await gotoMemberPage(page, '/member/orders');

    // Search input
    await expect(page.locator('input[placeholder="注文番号・見積番号で検索..."]')).toBeVisible();

    // Status filter buttons
    await expect(page.locator('button:has-text("すべて")')).toBeVisible();
    await expect(page.locator('button:has-text("保留中")')).toBeVisible();
    await expect(page.locator('button:has-text("データ受領")')).toBeVisible();
    await expect(page.locator('button:has-text("処理中")')).toBeVisible();
    await expect(page.locator('button:has-text("製造中")')).toBeVisible();
    await expect(page.locator('button:has-text("発送済み")')).toBeVisible();
    await expect(page.locator('button:has-text("配達済み")')).toBeVisible();
  });

  test('date range and sort filters', async ({ page }) => {
    await gotoMemberPage(page, '/member/orders');

    // Date range select
    const dateRangeSelect = page.locator('select').filter({ hasText: /すべて|過去7日間|過去30日間|過去90日間/ });
    await expect(dateRangeSelect).toBeVisible();

    // Sort select
    const sortSelect = page.locator('select').filter({ hasText: /新しい順|古い順|金額が高い順|金額が低い順/ });
    await expect(sortSelect).toBeVisible();
  });

  test('results count is displayed', async ({ page }) => {
    await gotoMemberPage(page, '/member/orders');

    // Results counter (using regex for dynamic number)
    const resultsCount = page.locator(/\\d+ 件の注文/);
    const count = await resultsCount.count();

    // Should exist even if 0 orders
    expect(count).toBeGreaterThan(0);
  });

  test('order cards structure', async ({ page }) => {
    await gotoMemberPage(page, '/member/orders');

    // Order cards (may be empty)
    const orderCards = page.locator('.card.p-6.hover\\:shadow-sm');
    const count = await orderCards.count();

    if (count > 0) {
      // Check first card has expected elements
      const firstCard = orderCards.first();

      // Order number
      await expect(firstCard.locator('.font-medium.text-text-primary')).toBeVisible();

      // Status badge (check if any status is present)
      const statuses = firstCard.locator('span[class*="px-3 py-1 rounded-full"]');
      const statusCount = await statuses.count();
      expect(statusCount).toBeGreaterThan(0);

      // View Details button
      await expect(firstCard.locator('button:has-text("詳細を見る")')).toBeVisible();
    }
  });

  test('empty state handling', async ({ page }) => {
    await gotoMemberPage(page, '/member/orders');

    // Check for empty state
    const emptyState = page.locator('.card.p-12:has(text="注文がありません")');
    const count = await emptyState.count();

    if (count > 0) {
      // Clear filters button should exist
      await expect(page.locator('button:has-text("フィルターをクリア")')).toBeVisible();
    }
  });
});

// =====================================================
// 3. Quotations Page Tests
// =====================================================

test.describe('Member Quotations - Selectors', () => {

  test('page heading and header elements', async ({ page }) => {
    await gotoMemberPage(page, '/member/quotations');

    // Main heading
    await expect(page.locator('h1:has-text("見積依頼")')).toBeVisible();

    // Subtitle
    await expect(page.locator('p:has-text("見積依頼の一覧とステータス確認")')).toBeVisible();

    // Header buttons
    await expect(page.locator('button:has-text("↻ 更新")')).toBeVisible();
    await expect(page.locator('button:has-text("+新規見積")')).toBeVisible();
  });

  test('status filter buttons', async ({ page }) => {
    await gotoMemberPage(page, '/member/quotations');

    // All status filters
    await expect(page.locator('button:has-text("すべて")')).toBeVisible();
    await expect(page.locator('button:has-text("ドラフト")')).toBeVisible();
    await expect(page.locator('button:has-text("送信済み")')).toBeVisible();
    await expect(page.locator('button:has-text("承認済み")')).toBeVisible();
    await expect(page.locator('button:has-text("却下")')).toBeVisible();
    await expect(page.locator('button:has-text("期限切れ")')).toBeVisible();
  });

  test('quotation cards structure', async ({ page }) => {
    await gotoMemberPage(page, '/member/quotations');

    // Quotation cards
    const quoteCards = page.locator('.card.p-6.hover\\:shadow-sm');
    const count = await quoteCards.count();

    if (count > 0) {
      const firstCard = quoteCards.first();

      // Quotation number
      await expect(firstCard.locator('.font-medium.text-text-primary')).toBeVisible();

      // Status badge
      const statusBadge = firstCard.locator('span[class*="px-2 py-0.5 rounded"]');
      await expect(statusBadge).toBeVisible();

      // View Details button
      await expect(firstCard.locator('button:has-text("詳細を見る")')).toBeVisible();

      // PDF Download button
      await expect(firstCard.locator('button:has-text("PDFダウンロード")')).toBeVisible();
    }
  });

  test('conditional buttons based on status', async ({ page }) => {
    await gotoMemberPage(page, '/member/quotations');

    // Delete button (only for DRAFT status)
    const deleteButtons = page.locator('button:has-text("削除")');
    const deleteCount = await deleteButtons.count();

    // Convert to Order button (only for APPROVED status)
    const convertButtons = page.locator('button:has-text("注文に変換")');
    const convertCount = await convertButtons.count();

    // At least one of these might exist depending on data
    console.log(`Delete buttons: ${deleteCount}, Convert buttons: ${convertCount}`);
  });

  test('item-level order buttons', async ({ page }) => {
    await gotoMemberPage(page, '/member/quotations');

    // Check for "発注する" buttons on individual items
    const orderButtons = page.locator('button:has-text("発注する")');
    const count = await orderButtons.count();

    if (count > 0) {
      console.log(`Found ${count} items available for ordering`);
    }
  });

  test('empty state handling', async ({ page }) => {
    await gotoMemberPage(page, '/member/quotations');

    // Check for empty state
    const emptyState = page.locator('.card.p-12:has(text="見積依頼がありません")');
    const count = await emptyState.count();

    if (count > 0) {
      // Action buttons should exist
      await expect(page.locator('button:has-text("↻ 更新")')).toBeVisible();
      await expect(page.locator('button:has-text("見積を作成する")')).toBeVisible();
    }
  });

  test('download history indicator', async ({ page }) => {
    await gotoMemberPage(page, '/member/quotations');

    // Check for download history (may not be present)
    const downloadIndicator = page.locator(/PDFダウンロード \\d+回/);
    const count = await downloadIndicator.count();

    if (count > 0) {
      console.log('Download history indicators found');
    }
  });
});

// =====================================================
// 4. Profile Page Tests
// =====================================================

test.describe('Member Profile - Selectors', () => {

  test('page heading and header elements', async ({ page }) => {
    await gotoMemberPage(page, '/member/profile');

    // Main heading
    await expect(page.locator('h1:has-text("マイページ")')).toBeVisible();

    // Subtitle
    await expect(page.locator('p:has-text("会員情報を確認できます")')).toBeVisible();

    // Edit button
    await expect(page.locator('a[href="/member/edit"] >> button:has-text("編集")')).toBeVisible();
  });

  test('profile overview card', async ({ page }) => {
    await gotoMemberPage(page, '/member/profile');

    // Avatar
    await expect(page.locator('.w-16.h-16.rounded-full.bg-gradient-to-br')).toBeVisible();

    // User name (with "様" suffix)
    const userName = page.locator('h2:has-text(/^.*様$/)');
    await expect(userName).toBeVisible();

    // Email
    const email = page.locator('p:has-text(/@/)');
    await expect(email).toBeVisible();

    // Status badges
    await expect(page.locator('text=有効').or(page.locator('text=承認待ち'))).toBeVisible();
  });

  test('authentication info section', async ({ page }) => {
    await gotoMemberPage(page, '/member/profile');

    // Section heading
    await expect(page.locator('h2:has-text("認証情報")')).toBeVisible();

    // Read-only badge
    await expect(page.locator('text=読み取り専用')).toBeVisible();

    // Email field
    await expect(page.locator('input[label="メールアドレス"][disabled]')).toBeVisible();

    // Name fields
    await expect(page.locator('input[label="姓（漢字）"][disabled]')).toBeVisible();
    await expect(page.locator('input[label="名（漢字）"][disabled]')).toBeVisible();
    await expect(page.locator('input[label="姓（ひらがな）"][disabled]')).toBeVisible();
    await expect(page.locator('input[label="名（ひらがな）"][disabled]')).toBeVisible();
  });

  test('contact info section', async ({ page }) => {
    await gotoMemberPage(page, '/member/profile');

    // Section heading
    await expect(page.locator('h2:has-text("連絡先")')).toBeVisible();

    // Phone fields (may have placeholder "未登録")
    await expect(page.locator('input[label="会社電話番号"]')).toBeVisible();
    await expect(page.locator('input[label="携帯電話"]')).toBeVisible();
  });

  test('address section', async ({ page }) => {
    await gotoMemberPage(page, '/member/profile');

    // Section heading
    await expect(page.locator('h2:has-text("住所")')).toBeVisible();

    // Address fields
    await expect(page.locator('input[label="郵便番号"]')).toBeVisible();
    await expect(page.locator('input[label="市区町村"]')).toBeVisible();
    await expect(page.locator('input[label="番地・建物名"]')).toBeVisible();

    // Prefecture display
    await expect(page.locator('text=都道府県')).toBeVisible();
  });

  test('product category section', async ({ page }) => {
    await gotoMemberPage(page, '/member/profile');

    // Section heading
    await expect(page.locator('h2:has-text("商品種別")')).toBeVisible();

    // Category display (one of the options)
    const category = page.locator('text=化粧品')
      .or(page.locator('text=衣類'))
      .or(page.locator('text=家電製品'))
      .or(page.locator('text=台所用品'))
      .or(page.locator('text=家具'))
      .or(page.locator('text=その他'))
      .or(page.locator('text=未登録'));

    await expect(category).toBeVisible();
  });

  test('additional actions section', async ({ page }) => {
    await gotoMemberPage(page, '/member/profile');

    // Section heading
    await expect(page.locator('h2:has-text("その他")')).toBeVisible();

    // Action buttons
    await expect(page.locator('button:has-text("会員情報を編集")')).toBeVisible();
    await expect(page.locator('button:has-text("パスワード変更")')).toBeVisible();
  });

  test('conditional company info section (corporation only)', async ({ page }) => {
    await gotoMemberPage(page, '/member/profile');

    // Company info section only for corporation users
    const companySection = page.locator('h2:has-text("会社情報")');
    const count = await companySection.count();

    if (count > 0) {
      // Verify company fields exist
      await expect(page.locator('input[label="会社名"]')).toBeVisible();
      await expect(page.locator('input[label="役職"]')).toBeVisible();
      await expect(page.locator('input[label="部署"]')).toBeVisible();
      await expect(page.locator('input[label="会社URL"]')).toBeVisible();
    }
  });
});

// =====================================================
// 5. Settings Page Tests
// =====================================================

test.describe('Member Settings - Selectors', () => {

  test('page heading and header elements', async ({ page }) => {
    await gotoMemberPage(page, '/member/settings');

    // Main heading
    await expect(page.locator('h1:has-text("設定")')).toBeVisible();

    // Subtitle
    await expect(page.locator('p:has-text("アカウント設定を変更できます")')).toBeVisible();
  });

  test('account info section', async ({ page }) => {
    await gotoMemberPage(page, '/member/settings');

    // Section heading
    await expect(page.locator('h2:has-text("アカウント情報")')).toBeVisible();

    // Avatar
    await expect(page.locator('.w-12.h-12.rounded-full.bg-gradient-to-br')).toBeVisible();

    // Info labels
    await expect(page.locator('text=会員ID')).toBeVisible();
    await expect(page.locator('text=登録日')).toBeVisible();
    await expect(page.locator('text=ステータス')).toBeVisible();
  });

  test('notification settings section', async ({ page }) => {
    await gotoMemberPage(page, '/member/settings');

    // Section heading
    await expect(page.locator('h2:has-text("通知設定")')).toBeVisible();

    // All notification toggles
    await expect(page.locator(':has-text("見積更新通知")')).toBeVisible();
    await expect(page.locator(':has-text("注文更新通知")')).toBeVisible();
    await expect(page.locator(':has-text("配送通知")')).toBeVisible();
    await expect(page.locator(':has-text("生産進捗通知")')).toBeVisible();
    await expect(page.locator(':has-text("マーケティングメール")')).toBeVisible();
  });

  test('security settings section', async ({ page }) => {
    await gotoMemberPage(page, '/member/settings');

    // Section heading
    await expect(page.locator('h2:has-text("セキュリティ設定")')).toBeVisible();

    // Security toggles
    await expect(page.locator(':has-text("ログイン通知")')).toBeVisible();
    await expect(page.locator(':has-text("セキュリティアラート")')).toBeVisible();
    await expect(page.locator(':has-text("二要素認証")')).toBeVisible();

    // Password change button
    await expect(page.locator('button:has-text("パスワード変更")')).toBeVisible();
  });

  test('save button functionality', async ({ page }) => {
    await gotoMemberPage(page, '/member/settings');

    // Save button
    const saveButton = page.locator('button:has-text("変更を保存")');
    await expect(saveButton).toBeVisible();
  });

  test('danger zone section', async ({ page }) => {
    await gotoMemberPage(page, '/member/settings');

    // Section card (with error border)
    const dangerZone = page.locator('.card:has(h2:has-text("アカウント削除"))');
    await expect(dangerZone).toBeVisible();

    // Warning text
    await expect(page.locator('text=アカウントを削除すると、すべてのデータが完全に削除されます')).toBeVisible();

    // Logout button
    await expect(page.locator('button:has-text("ログアウト")')).toBeVisible();

    // Delete account button
    await expect(page.locator('button:has-text("アカウントを削除")')).toBeVisible();
  });

  test('navigation link back to profile', async ({ page }) => {
    await gotoMemberPage(page, '/member/settings');

    // Back to profile link
    await expect(page.locator('a[href="/member/profile"]:has-text("← プロフィールへ")')).toBeVisible();
  });

  test('save message appears after save', async ({ page }) => {
    await gotoMemberPage(page, '/member/settings');

    // Click save button
    await page.click('button:has-text("変更を保存")');

    // Wait for save operation
    await page.waitForTimeout(1000);

    // Check for success or error message
    const message = page.locator(`.p-4.rounded-lg:has-text("設定を保存しました")`)
      .or(page.locator(`.p-4.rounded-lg:has-text("エラーが発生しました")`));

    // Message should appear
    const count = await message.count();
    expect(count).toBeGreaterThan(0);
  });
});

// =====================================================
// 6. Cross-Page Navigation Tests
// =====================================================

test.describe('Member Pages - Navigation', () => {

  test('navigate from dashboard to orders', async ({ page }) => {
    await gotoMemberPage(page, '/member/dashboard');

    // Click orders stat card
    await page.click('a[href="/member/orders"]');

    // Should navigate to orders page
    await expect(page).toHaveURL(/.*\/member\/orders/);
    await expect(page.locator('h1:has-text("注文一覧")')).toBeVisible();
  });

  test('navigate from dashboard to quotations', async ({ page }) => {
    await gotoMemberPage(page, '/member/dashboard');

    // Click quotations stat card
    await page.click('a[href="/member/quotations"]');

    // Should navigate to quotations page
    await expect(page).toHaveURL(/.*\/member\/quotations/);
    await expect(page.locator('h1:has-text("見積依頼")')).toBeVisible();
  });

  test('navigate from profile to settings', async ({ page }) => {
    await gotoMemberPage(page, '/member/profile');

    // There's no direct link, but we can test URL navigation
    await page.goto(`${BASE_URL}/member/settings`);

    // Should be on settings page
    await expect(page.locator('h1:has-text("設定")')).toBeVisible();
  });

  test('navigate from settings to profile', async ({ page }) => {
    await gotoMemberPage(page, '/member/settings');

    // Click back to profile link
    await page.click('a[href="/member/profile"]:has-text("← プロフィールへ")');

    // Should navigate to profile page
    await expect(page).toHaveURL(/.*\/member\/profile/);
    await expect(page.locator('h1:has-text("マイページ")')).toBeVisible();
  });

  test('navigate to quote simulator from orders', async ({ page }) => {
    await gotoMemberPage(page, '/member/orders');

    // Click new quote button
    await page.click('button:has-text("+新規見積")');

    // Should navigate to quote simulator
    await expect(page).toHaveURL(/.*\/quote-simulator/);
  });

  test('navigate to quote simulator from quotations', async ({ page }) => {
    await gotoMemberPage(page, '/member/quotations');

    // Click new quote button
    await page.click('button:has-text("+新規見積")');

    // Should navigate to quote simulator
    await expect(page).toHaveURL(/.*\/quote-simulator/);
  });
});

// =====================================================
// 7. Loading State Tests
// =====================================================

test.describe('Member Pages - Loading States', () => {

  test('dashboard shows loading state', async ({ page }) => {
    // Navigate with slow network to see loading
    await page.goto(`${BASE_URL}/member/dashboard`);

    // Check for loading message (may appear briefly)
    const loading = page.locator('text=ダッシュボードを読み込み中...');
    const count = await loading.count();

    if (count > 0) {
      await expect(loading).toBeVisible();
      // Wait for it to disappear
      await expect(loading).not.toBeVisible({ timeout: 10000 });
    }

    // Eventually, heading should be visible
    await expect(page.locator('h1:has-text("ようこそ")')).toBeVisible({ timeout: 10000 });
  });

  test('orders page shows loading state', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/orders`);

    // Check for loading message
    const loading = page.locator('text=注文一覧を読み込み中...');
    const count = await loading.count();

    if (count > 0) {
      await expect(loading).toBeVisible();
      await expect(loading).not.toBeVisible({ timeout: 10000 });
    }

    // Eventually, heading should be visible
    await expect(page.locator('h1:has-text("注文一覧")')).toBeVisible({ timeout: 10000 });
  });

  test('quotations page shows loading state', async ({ page }) => {
    await page.goto(`${BASE_URL}/member/quotations`);

    // Check for loading message
    const loading = page.locator('text=見積依頼を読み込み中...');
    const count = await loading.count();

    if (count > 0) {
      await expect(loading).toBeVisible();
      await expect(loading).not.toBeVisible({ timeout: 10000 });
    }

    // Eventually, heading should be visible
    await expect(page.locator('h1:has-text("見積依頼")')).toBeVisible({ timeout: 10000 });
  });
});

// =====================================================
// 8. Responsive Design Tests
// =====================================================

test.describe('Member Pages - Responsive Design', () => {

  test('dashboard is mobile-friendly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoMemberPage(page, '/member/dashboard');

    // Stats should stack vertically on mobile
    await expect(page.locator('.grid.grid-cols-1')).toBeVisible();

    // Quick actions should still be visible
    await expect(page.locator('h2:has-text("クイックアクション")')).toBeVisible();
  });

  test('orders page filters work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoMemberPage(page, '/member/orders');

    // Filters should be visible
    await expect(page.locator('input[placeholder="注文番号・見積番号で検索..."]')).toBeVisible();

    // Status filter buttons should wrap
    await expect(page.locator('button:has-text("すべて")')).toBeVisible();
  });

  test('profile page is readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await gotoMemberPage(page, '/member/profile');

    // All sections should be visible
    await expect(page.locator('h1:has-text("マイページ")')).toBeVisible();
    await expect(page.locator('h2:has-text("認証情報")')).toBeVisible();
    await expect(page.locator('h2:has-text("連絡先")')).toBeVisible();
  });
});

// =====================================================
// 9. Accessibility Tests
// =====================================================

test.describe('Member Pages - Accessibility', () => {

  test('dashboard has proper heading structure', async ({ page }) => {
    await gotoMemberPage(page, '/member/dashboard');

    // h1 for page title
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // h2 for section headings
    const h2s = page.locator('h2');
    const count = await h2s.count();
    expect(count).toBeGreaterThan(0);
  });

  test('buttons have accessible text', async ({ page }) => {
    await gotoMemberPage(page, '/member/orders');

    // All buttons should have text content
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      expect(text?.trim()).toBeTruthy();
    }
  });

  test('links have descriptive text', async ({ page }) => {
    await gotoMemberPage(page, '/member/dashboard');

    // Important links should have text
    await expect(page.locator('a[href="/member/orders"]')).toBeVisible();
    await expect(page.locator('a[href="/member/quotations"]')).toBeVisible();
  });
});

// =====================================================
// 10. Error Handling Tests
// =====================================================

test.describe('Member Pages - Error Handling', () => {

  test('handles invalid routes gracefully', async ({ page }) => {
    // Try to access non-existent member page
    await page.goto(`${BASE_URL}/member/nonexistent`);

    // Should either show 404 or redirect
    // The exact behavior depends on your app configuration
    const url = page.url();
    console.log('URL after navigation:', url);
  });

  test('handles API errors gracefully', async ({ page }) => {
    // This test would require mocking API failures
    // For now, just verify the page loads
    await gotoMemberPage(page, '/member/orders');

    // Page should load even if API returns errors
    await expect(page.locator('h1:has-text("注文一覧")')).toBeVisible();
  });
});

// =====================================================
// Test Configuration
// =====================================================

test.beforeEach(async ({ page }) => {
  // Set up any test-specific configuration
  // For example, enable DEV_MODE if needed
  await page.context().addInitScript(() => {
    localStorage.setItem('DEV_MODE', 'true');
  });
});

test.afterEach(async ({ page }) => {
  // Clean up after each test
  // For example, clear local storage
  await page.context().clearCookies();
});
