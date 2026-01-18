# Member Pages - Quick Selector Reference

A concise guide for the most commonly used selectors in member pages.

---

## Dashboard (`/member/dashboard`)

### Page Elements
```typescript
// Heading
'h1:has-text("ようこそ")'

// Stats Cards (5 cards)
'a[href="/member/orders"]'      // 新規注文
'a[href="/member/quotations"]'   // 見積依頼
'a[href="/member/samples"]'      // サンプル依頼
'a[href="/member/inquiries"]'    // お問い合わせ
'a[href="/member/contracts"]'    // 契約

// Quick Actions
'h2:has-text("クイックアクション")'
'a[href="/member/quotations"] >> text="見積作成"'
'a[href="/member/orders"] >> text="注文一覧"'

// Section Headings
'h2:has-text("新規注文")'
'h2:has-text("見積依頼")'
'h2:has-text("お知らせ")'
```

---

## Orders (`/member/orders`)

### Page Elements
```typescript
// Header
'h1:has-text("注文一覧")'
'button:has-text("+新規見積")'

// Search & Filters
'input[placeholder="注文番号・見積番号で検索..."]'
'button:has-text("すべて")'
'button:has-text("保留中")'
'button:has-text("処理中")'
'button:has-text("発送済み")'

// Order Card
'.card.p-6.hover\\:shadow-sm'  // Card container
'.font-medium.text-text-primary'  // Order number
'button:has-text("詳細を見る")'  // View button

// Results
/\\d+ 件の注文/  // Results counter
```

---

## Quotations (`/member/quotations`)

### Page Elements
```typescript
// Header
'h1:has-text("見積依頼")'
'button:has-text("↻ 更新")'
'button:has-text("+新規見積")'

// Status Filters
'button:has-text("すべて")'
'button:has-text("ドラフト")'
'button:has-text("送信済み")'
'button:has-text("承認済み")'
'button:has-text("却下")'

// Quotation Card
'.card.p-6.hover\\:shadow-sm'  // Card container
'.font-medium.text-text-primary'  // Quote number
'button:has-text("詳細を見る")'  // View Details
'button:has-text("PDFダウンロード")'  // Download PDF
'button:has-text("削除")'  // Delete (DRAFT only)
'button:has-text("注文に変換")'  // Convert (APPROVED only)
'button:has-text("発注する")'  // Order item
```

---

## Profile (`/member/profile`)

### Page Elements
```typescript
// Header
'h1:has-text("マイページ")'
'a[href="/member/edit"] >> button:has-text("編集")'

// Profile Card
'.w-16.h-16.rounded-full.bg-gradient-to-br'  // Avatar
'h2:has-text(/^.*様$/)'  // User name
'p:has-text(/@/)'  // Email

// Sections
'h2:has-text("認証情報")'
'h2:has-text("連絡先")'
'h2:has-text("会社情報")'  // Conditional
'h2:has-text("住所")'
'h2:has-text("商品種別")'
'h2:has-text("その他")'

// Input Fields (disabled)
'input[label="メールアドレス"][disabled]'
'input[label="姓（漢字）"][disabled]'
'input[label="会社電話番号"][disabled]'
'input[label="郵便番号"][disabled]'

// Action Buttons
'button:has-text("会員情報を編集")'
'button:has-text("パスワード変更")'
```

---

## Settings (`/member/settings`)

### Page Elements
```typescript
// Header
'h1:has-text("設定")'

// Sections
'h2:has-text("アカウント情報")'
'h2:has-text("通知設定")'
'h2:has-text("セキュリティ設定")'
'h2:has-text("アカウント削除")'

// Notification Toggles
':has-text("見積更新通知")'
':has-text("注文更新通知")'
':has-text("配送通知")'
':has-text("生産進捗通知")'
':has-text("マーケティングメール")'

// Security
':has-text("ログイン通知")'
':has-text("セキュリティアラート")'
'button:has-text("パスワード変更")'

// Actions
'button:has-text("変更を保存")'
'button:has-text("ログアウト")'
'button:has-text("アカウントを削除")'

// Navigation
'a[href="/member/profile"]:has-text("← プロフィールへ")'
```

---

## Common Patterns

### Loading States
```typescript
'text=読み込み中...'
'text=注文一覧を読み込み中...'
'text=見積依頼を読み込み中...'
'text=ダッシュボードを読み込み中...'

// Wait for loading to complete
await page.waitForSelector('text=読み込み中...', { state: 'hidden' });
```

### Empty States
```typescript
'text="新規注文はありません"'
'text="見積依頼はありません"'
'text="注文がありません"'
'text="見積依頼がありません"'
```

### Status Badges
```typescript
// Order Status
'span:has-text("保留中")'
'span:has-text("データ受領")'
'span:has-text("処理中")'
'span:has-text("製造中")'
'span:has-text("発送済み")'
'span:has-text("配達済み")'
'span:has-text("キャンセル済み")'

// Quotation Status
'.badge:has-text("ドラフト")'
'.badge:has-text("送信済み")'
'.badge:has-text("承認済み")'
'.badge:has-text("却下")'
'.badge:has-text("期限切れ")'
```

### Buttons
```typescript
'button:has-text("保存中...")'
'button:has-text("削除中...")'
'button:has-text("確認中...")'
'button:has-text("PDF作成中...")'
'button:disabled'
```

### Cards
```typescript
'.card'
'.card.p-6'
'.card.p-4'
'.card.hover\\:shadow-sm'
'.card.border-error-200'  // Danger zone
```

---

## Regex Patterns

### Dynamic Numbers
```typescript
/\\d+ 件の注文/
/\\d+回/
/\\d+ 点/
```

### User Names
```typescript
/^.*様$/  // Matches "山田様", "鈴木様", etc.
```

### Email
```typescript
/@/  // Simple email check
```

---

## Helper Functions

### Wait for Page Load
```typescript
async function waitForLoading(page: Page) {
  await page.waitForSelector('text=読み込み中...', { state: 'hidden' });
}
```

### Navigate and Wait
```typescript
async function gotoMemberPage(page: Page, path: string) {
  await page.goto(`http://localhost:3000${path}`);
  await waitForLoading(page);
}
```

### Check Element Exists
```typescript
const element = page.locator('selector');
const count = await element.count();
if (count > 0) {
  // Element exists
}
```

---

## Testing Examples

### Test Dashboard
```typescript
test('dashboard loads', async ({ page }) => {
  await page.goto('http://localhost:3000/member/dashboard');
  await page.waitForSelector('text=読み込み中...', { state: 'hidden' });
  await expect(page.locator('h1:has-text("ようこそ")')).toBeVisible();
});
```

### Test Orders Page
```typescript
test('orders page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/member/orders');
  await expect(page.locator('h1:has-text("注文一覧")')).toBeVisible();
  await expect(page.locator('button:has-text("すべて")')).toBeVisible();
});
```

### Test Profile Page
```typescript
test('profile displays user info', async ({ page }) => {
  await page.goto('http://localhost:3000/member/profile');
  await expect(page.locator('h1:has-text("マイページ")')).toBeVisible();
  await expect(page.locator('input[label="メールアドレス"]')).toBeVisible();
});
```

---

## Navigation Links

### Common Destinations
```typescript
'/member/dashboard'      // Dashboard
'/member/orders'         // Orders list
'/member/orders/:id'     // Order detail
'/member/quotations'     // Quotations list
'/member/quotations/:id' // Quotation detail
'/member/profile'        // Profile page
'/member/settings'       // Settings page
'/member/edit'           // Edit profile
'/member/samples'        // Samples list
'/quote-simulator'       // Create quote
'/auth/reset-password'   // Reset password
```

---

## DEV_MODE Setup

```typescript
// Enable DEV_MODE for testing
test.beforeEach(async ({ page }) => {
  await page.context().addInitScript(() => {
    localStorage.setItem('DEV_MODE', 'true');
  });
});
```

---

## Important Notes

1. **Japanese Text**: All text is in Japanese - use exact matches or regex
2. **Conditional Elements**: Some sections may not be visible (e.g., company info for individuals)
3. **Loading States**: Always wait for loading to complete before assertions
4. **Disabled Inputs**: Profile page inputs are disabled (read-only)
5. **Dynamic Content**: Use regex for numbers and dates
6. **Empty States**: Handle cases where data doesn't exist
7. **Status Badges**: Colors indicate different statuses
8. **Card Layout**: Use grid selectors for stats cards
9. **Hover Effects**: Cards have hover states (`.hover\:shadow-sm`)
10. **DEV_MODE**: Required for testing without authentication

---

## File Paths

- **Full Guide**: `MEMBER_PAGE_SELECTORS.md`
- **Test File**: `tests/member-pages-selectors-test.spec.ts`
- **Quick Reference**: `MEMBER_SELECTORS_QUICK_REFERENCE.md` (this file)

---

## Status Labels

### Order Status
| English | Japanese |
|---------|----------|
| pending | 保留中 |
| data_received | データ受領 |
| processing | 処理中 |
| manufacturing | 製造中 |
| shipped | 発送済み |
| delivered | 配達済み |
| cancelled | キャンセル済み |

### Quotation Status
| English | Japanese |
|---------|----------|
| DRAFT | ドラフト |
| SENT | 送信済み |
| APPROVED | 承認済み |
| REJECTED | 却下 |
| EXPIRED | 期限切れ |
| CONVERTED | 注文変換済み |

---

Last Updated: 2025-01-14
Generated from: Component code analysis
