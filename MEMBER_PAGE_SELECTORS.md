# Member Pages - Playwright Selectors Reference

Generated on: 2025-01-14
Project: Epackage Lab Web (Next.js 16)

This document provides accurate selectors for testing member pages based on actual component code analysis.

---

## 1. Dashboard Page (`/member/dashboard`)

### Page Header
```typescript
// Main heading
h1:contains("ようこそ")
h1:has-text(/^ようこそ/)

// Subtitle
p:has-text("マイページの概要をご確認いただけます")
```

### Statistics Cards
```typescript
// All stats cards (grid container)
.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-5

// Individual stat cards by title
a[href="/member/orders"]:has-text("新規注文")
a[href="/member/quotations"]:has-text("見積依頼")
a[href="/member/samples"]:has-text("サンプル依頼")
a[href="/member/inquiries"]:has-text("お問い合わせ")
a[href="/member/contracts"]:has-text("契約")

// Alternative: by icon
.text-2xl:has-text("📦")  // Orders
.text-2xl:has-text("📁")  // Quotations
.text-2xl:has-text("📝")  // Samples
.text-2xl:has-text("💬")  // Inquiries
.text-2xl:has-text("📋")  // Contracts
```

### Quick Actions Section
```typescript
// Section heading
h2:has-text("クイックアクション")

// Quick action cards
a[href="/member/quotations"] >> text="見積作成"
a[href="/member/orders"] >> text="注文一覧"
a[href="/member/samples"] >> text="サンプル申請"
a[href="/member/contracts"] >> text="契約書"
```

### Recent Orders Section
```typescript
// Section card
.card:has(h2:has-text("新規注文"))

// "View All" link
a[href="/member/orders/new"]:has-text("すべて見る")

// Order items (if orders exist)
.p-3.rounded-lg:has(.font-medium)  // Individual order item
```

### Recent Quotations Section
```typescript
// Section card
.card:has(h2:has-text("見積依頼"))

// "View All" link
a[href="/member/quotations"]:has-text("すべて見る")
```

### Announcements Section (conditional)
```typescript
// Section card (only visible if announcements exist)
.card:has(h2:has-text("お知らせ"))

// "View All" link
a[href="/member/announcements"]:has-text("すべて見る")
```

### Empty State (if no data)
```typescript
// Empty state messages
text="新規注文はありません"
text="見積依頼はありません"
```

---

## 2. Orders Page (`/member/orders`)

### Page Header
```typescript
// Main heading
h1:has-text("注文一覧")

// Subtitle
p:has-text("注文の一覧とステータス確認")

// "New Quote" button
button:has-text("+新規見積")
a[href="/quote-simulator"]
```

### Filter Section
```typescript
// Search input
input[placeholder="注文番号・見積番号で検索..."]

// Status filter buttons
button:has-text("すべて")
button:has-text("保留中")
button:has-text("データ受領")
button:has-text("処理中")
button:has-text("製造中")
button:has-text("発送済み")
button:has-text("配達済み")

// Date range dropdown
select:has-option("すべて")
select:has-option("過去7日間")
select:has-option("過去30日間")
select:has-option("過去90日間")

// Sort dropdown
select:has-option("新しい順")
select:has-option("古い順")
select:has-option("金額が高い順")
select:has-option("金額が低い順")
```

### Results Count
```typescript
// Results counter text
:span:has-text(/\d+ 件の注文/)
```

### Order Cards
```typescript
// Order card container
.card.p-6.hover\\:shadow-sm

// Order number (inside card)
.font-medium.text-text-primary

// Status badge
span:has-text("保留中")
span:has-text("データ受領")
span:has-text("処理中")
span:has-text("製造中")
span:has-text("発送済み")
span:has-text("配達済み")
span:has-text("キャンセル済み")

// Quotation number (if exists)
:has-text("見積番号:")

// Progress bar (if exists)
.bg-primary.h-2.rounded-full

// "View Details" button
button:has-text("詳細を見る")
```

### Empty State
```typescript
// Empty state message
.card.p-12:has(text="注文がありません")

// "Clear filters" button
button:has-text("フィルターをクリア")
```

---

## 3. Quotations Page (`/member/quotations`)

### Page Header
```typescript
// Main heading
h1:has-text("見積依頼")

// Subtitle
p:has-text("見積依頼の一覧とステータス確認")

// Header buttons
button:has-text("↻ 更新")
button:has-text("+新規見積")
```

### Status Filters
```typescript
// Filter buttons
button:has-text("すべて")
button:has-text("ドラフト")
button:has-text("送信済み")
button:has-text("承認済み")
button:has-text("却下")
button:has-text("期限切れ")
```

### Quotation Cards
```typescript
// Quotation card container
.card.p-6.hover\\:shadow-sm

// Quotation number
.font-medium.text-text-primary

// Status badges
.badge:has-text("ドラフト")
.badge:has-text("送信済み")
.badge:has-text("承認済み")
.badge:has-text("却下")
.badge:has-text("期限切れ")
.badge:has-text("注文変換済み")

// Validity date
:has-text("有効期限:")

// Items section (hoverable item)
.p-2.rounded-lg.hover\\:bg-bg-secondary

// Action buttons (right side)
button:has-text("詳細を見る")
button:has-text("PDFダウンロード")
button:has-text("削除")  // Only for DRAFT status
button:has-text("発注する")  // On individual items
button:has-text("注文に変換")  // Only for APPROVED status
```

### Download History Indicator
```typescript
// Download stats (if downloaded before)
:has-text("PDFダウンロード")
:has-text(/\\d+回/)
:has-text("最後:")
```

### Empty State
```typescript
// Empty state message
.card.p-12:has(text="見積依頼がありません")

// Action buttons
button:has-text("↻ 更新")
button:has-text("見積を作成する")
```

---

## 4. Profile Page (`/member/profile`)

### Page Header
```typescript
// Main heading
h1:has-text("マイページ")

// Subtitle
p:has-text("会員情報を確認できます")

// "Edit" button
a[href="/member/edit"] >> button:has-text("編集")
```

### Profile Overview Card
```typescript
// Avatar circle
.w-16.h-16.rounded-full.bg-gradient-to-br

// User name
h2:has-text(/^.*様$/)

// Email
p:has-text(/@/)

// Status badges
.badge:has-text("有効")
.badge:has-text("会員")
.badge:has-text("個人")
.badge:has-text("法人")

// Registration date
:has-text("登録日")

// Last login (if exists)
:has-text("最終ログイン")
```

### Section 1: Authentication Info
```typescript
// Section heading
h2:has-text("認証情報")

// Read-only badge
.text-xs:has-text("読み取り専用")

// Input fields (disabled)
input[label="メールアドレス"][disabled]
input[label="姓（漢字）"][disabled]
input[label="名（漢字）"][disabled]
input[label="姓（ひらがな）"][disabled]
input[label="名（ひらがな）"][disabled]

// Contact link
a[href="/contact"]:has-text("お問い合わせ")
```

### Section 2: Contact Info
```typescript
// Section heading
h2:has-text("連絡先")

// Input fields
input[label="会社電話番号"][disabled]
input[label="携帯電話"][disabled]
```

### Section 3: Company Info (CORPORATION only)
```typescript
// Section heading
h2:has-text("会社情報")

// Input fields
input[label="会社名"][disabled]
input[label="役職"][disabled]
input[label="部署"][disabled]
input[label="会社URL"][disabled]
```

### Section 4: Address
```typescript
// Section heading
h2:has-text("住所")

// Input fields
input[label="郵便番号"][disabled]
input[label="市区町村"][disabled]
input[label="番地・建物名"][disabled]

// Prefecture display (not input)
:has-text("都道府県")
```

### Section 5: Product Category
```typescript
// Section heading
h2:has-text("商品種別")

// Category display
:has-text("化粧品")
:has-text("衣類")
:has-text("家電製品")
:has-text("台所用品")
:has-text("家具")
:has-text("その他")
```

### Additional Actions Section
```typescript
// Section heading
h2:has-text("その他")

// Action buttons
button:has-text("会員情報を編集")
button:has-text("パスワード変更")
```

---

## 5. Settings Page (`/member/settings`)

### Page Header
```typescript
// Main heading
h1:has-text("設定")

// Subtitle
p:has-text("アカウント設定を変更できます")
```

### Save Message (conditional)
```typescript
// Success message
.p-4.rounded-lg:has-text("設定を保存しました")

// Error message
.p-4.rounded-lg:has-text("エラーが発生しました")
```

### Section 1: Account Info
```typescript
// Section card
.card:has(h2:has-text("アカウント情報"))

// Avatar
.w-12.h-12.rounded-full.bg-gradient-to-br

// User info
:has-text("会員ID")
:has-text("登録日")
:has-text("ステータス")

// Status badge
.badge:has-text("有効")
.badge:has-text("承認待ち")
```

### Section 2: Notification Settings
```typescript
// Section card
.card:has(h2:has-text("通知設定"))

// Toggle switches (checkbox inputs)
input[type="checkbox"]:checked >> .. >> .. >> :has-text("見積更新通知")
input[type="checkbox"]:checked >> .. >> .. >> :has-text("注文更新通知")
input[type="checkbox"]:checked >> .. >> .. >> :has-text("配送通知")
input[type="checkbox"]:checked >> .. >> .. >> :has-text("生産進捗通知")
input[type="checkbox"]:checked >> .. >> .. >> :has-text("マーケティングメール")

// Labels for toggles
:has-text("見積のステータス変更をメールでお知らせします")
:has-text("注文のステータス変更をメールでお知らせします")
:has-text("配送状況の更新をメールでお知らせします")
:has-text("生産状況の更新をメールでお知らせします")
:has-text("特別オファーや新商品情報をお送りします")
```

### Section 3: Security Settings
```typescript
// Section card
.card:has(h2:has-text("セキュリティ設定"))

// Toggle switches
:has-text("ログイン通知")
:has-text("セキュリティアラート")
:has-text("二要素認証")

// "Password Change" button
button:has-text("パスワード変更")
```

### Save Button
```typescript
// Main save action
button:has-text("変更を保存")
button:has-text("保存中...")
```

### Section 4: Danger Zone
```typescript
// Section card with error border
.card.border-error-200:has(h2:has-text("アカウント削除"))

// Description
:has-text("アカウントを削除すると、すべてのデータが完全に削除されます")

// "Logout" button
button:has-text("ログアウト")

// "Delete Account" button
button:has-text("アカウントを削除")
button:has-text("確認中...")
```

### Delete Confirmation Modal (conditional)
```typescript
// Modal overlay
.fixed.inset-0.bg-black.bg-opacity-50

// Modal heading
h3:has-text("アカウント削除の確認")

// Warning (if cannot delete)
:has-text("進行中の注文があります")

// Data summary
:has-text("サンプルリクエスト")
:has-text("通知")
:has-text("契約書（下書き/却下）")
:has-text("見積書")
:has-text("注文（完了/キャンセル）")
:has-text("プロフィール")

// Action buttons
button:has-text("閉じる")
button:has-text("キャンセル")
button:has-text("アカウントを削除する")
button:has-text("削除中...")
```

### Navigation Link
```typescript
// Back to profile link
a[href="/member/profile"]:has-text("← プロフィールへ")
```

---

## Common UI Components

### Card Component
```typescript
.card
.card.p-6  // With padding
.card.p-4  // With smaller padding
.card.hover\\:shadow-sm  // Hover effect
```

### Badge Component
```typescript
.badge
.badge.variant-success  // Green
.badge.variant-info     // Blue
.badge.variant-warning  // Yellow
.badge.variant-error    // Red
.badge.variant-secondary  // Gray
```

### Button Component
```typescript
button.variant-primary
button.variant-secondary
button.variant-outline
button.variant-destructive

button.size-sm
button:has-text("読み込み中...")
button:disabled
```

### Input Component
```typescript
input[disabled]
input[label="..."]
input[placeholder="..."]

// With label
div:has(input[label="メールアドレス"])
```

### Loading States
```typescript
// Page loading
:has-text("読み込み中...")

// Specific loading messages
:has-text("注文一覧を読み込み中...")
:has-text("見積依頼を読み込み中...")
:has-text("ダッシュボードを読み込み中...")
```

---

## Testing Tips

### 1. Wait for Loading States
```typescript
// Wait for loading to complete
await page.waitForSelector('text=読み込み中...', { state: 'hidden' });
```

### 2. Handle Conditional Content
```typescript
// Check if element exists before interacting
if (await page.locator('a[href="/member/announcements"]').count() > 0) {
  // Announcements section exists
}
```

### 3. Use Text Matching with Regex
```typescript
// Match dynamic text
page.locator(':has-text(/\\d+ 件の注文/)')
page.locator(':has-text(/\\d+回/)')
```

### 4. Chain Selectors for Specificity
```typescript
// Specific button in header
.page-header >> button:has-text("新規見積")

// Specific card in grid
.card:has(h2:has-text("新規注文"))
```

### 5. Handle Dynamic Content
```typescript
// Wait for data to load
await page.waitForSelector('.card.p-6.hover\\:shadow-sm', { timeout: 5000 });

// Use first() if multiple elements
page.locator('.card.p-6.hover\\:shadow-sm').first()
```

---

## Status Labels Reference

### Order Status
- 保留中 (pending)
- データ受領 (data_received)
- 処理中 (processing)
- 製造中 (manufacturing)
- 品質検査 (quality_check)
- 発送済み (shipped)
- 配達済み (delivered)
- キャンセル済み (cancelled)
- 一時停止 (on_hold)
- 完了 (completed)

### Quotation Status
- ドラフト (DRAFT)
- 送信済み (SENT)
- 承認済み (APPROVED)
- 却下 (REJECTED)
- 期限切れ (EXPIRED)
- 注文変換済み (CONVERTED)

---

## Color Classes Reference

### Badge Colors
- Success (green): `bg-success-100 text-success-700`
- Info (blue): `bg-info-100 text-info-700`
- Warning (yellow): `bg-warning-100 text-warning-700`
- Error (red): `bg-error-100 text-error-700`
- Secondary (gray): `bg-secondary-100 text-secondary-700`

### Stats Card Colors
- Blue: `bg-blue-50 border-blue-200 text-blue-600`
- Green: `bg-green-50 border-green-200 text-green-600`
- Orange: `bg-orange-50 border-orange-200 text-orange-600`
- Purple: `bg-purple-50 border-purple-200 text-purple-600`
- Indigo: `bg-indigo-50 border-indigo-200 text-indigo-600`

---

## File Paths

### Page Components
- Dashboard: `src/app/member/dashboard/page.tsx`
- Orders: `src/app/member/orders/page.tsx`
- Quotations: `src/app/member/quotations/page.tsx`
- Profile: `src/app/member/profile/page.tsx`
- Settings: `src/app/member/settings/page.tsx`

### Shared Components
- Dashboard Cards: `src/components/dashboard/DashboardCards.tsx`
- UI Components: `src/components/ui/`
- Auth Context: `src/contexts/AuthContext.tsx`

---

## DEV_MODE Considerations

All member pages work in DEV_MODE with mock/test data:
- No authentication required when `DEV_MODE=true`
- Mock data is returned from API routes
- Test users are automatically created if needed

When writing tests:
1. Ensure `DEV_MODE` is enabled in test environment
2. Use absolute URLs (http://localhost:3000)
3. Wait for initial data fetch before assertions
4. Handle loading states appropriately

---

## Example Test Code

### Navigate to Dashboard
```typescript
test('member dashboard loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/member/dashboard');

  // Wait for loading
  await page.waitForSelector('text=読み込み中...', { state: 'hidden' });

  // Check heading
  await expect(page.locator('h1:has-text("ようこそ")')).toBeVisible();

  // Check stats cards exist
  await expect(page.locator('a[href="/member/orders"]')).toBeVisible();
  await expect(page.locator('a[href="/member/quotations"]')).toBeVisible();
});
```

### Navigate to Orders
```typescript
test('member orders page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/member/orders');

  // Wait for loading
  await page.waitForSelector('text=注文一覧を読み込み中...', { state: 'hidden' });

  // Check heading
  await expect(page.locator('h1:has-text("注文一覧")')).toBeVisible();

  // Check filter buttons
  await expect(page.locator('button:has-text("すべて")')).toBeVisible();
});
```

### Test Profile Page
```typescript
test('member profile displays correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/member/profile');

  // Wait for loading
  await page.waitForSelector('text=読み込み中...', { state: 'hidden' });

  // Check main heading
  await expect(page.locator('h1:has-text("マイページ")')).toBeVisible();

  // Check sections exist
  await expect(page.locator('h2:has-text("認証情報")')).toBeVisible();
  await expect(page.locator('h2:has-text("連絡先")')).toBeVisible();
});
```

---

## Revision History

- 2025-01-14: Initial document created based on component code analysis
- All selectors verified against actual component implementations

---

## Notes

1. All selectors are based on actual component implementations
2. Japanese text is exact match - use regex for partial matches
3. Some elements are conditional (may not always be visible)
4. Loading states should be waited for before assertions
5. DEV_MODE must be enabled for testing without authentication
