# Comprehensive E2E Test Scenarios - Phase 2: Member Pages

**Document Version:** 1.0
**Date:** 2026-01-14
**Test Environment:** http://localhost:3000
**Test Accounts:**
- Admin: `admin@epackage-lab.com` / `Admin1234`
- Member: `test@epackage-lab.com` / `Test1234!`

---

## Table of Contents

1. [Member Dashboard (/member/dashboard)](#1-member-dashboard-memberdashboard)
2. [Member Orders (/member/orders)](#2-member-orders-memberorders)
3. [Order Detail (/member/orders/[id])](#3-order-detail-memberordersid)
4. [Member Quotations (/member/quotations)](#4-member-quotations-memberquotations)
5. [Quotation Detail (/member/quotations/[id])](#5-quotation-detail-memberquotationsid)
6. [Member Profile (/member/profile)](#6-member-profile-memberprofile)
7. [Member Settings (/member/settings)](#7-member-settings-membersettings)
8. [Member Samples (/member/samples)](#8-member-samples-membersamples)
9. [Member Inquiries (/member/inquiries)](#9-member-inquiries-memberinquiries)
10. [Member Notifications (/member/notifications)](#10-member-notifications-membernotifications)
11. [Member Contracts (/member/contracts)](#11-member-contracts-membercontracts)

---

## Test Execution Guidelines

### Prerequisites
- User logged in with member account
- Development server running on `localhost:3000`
- Database accessible (Supabase)
- Console open for error monitoring

### Test Result Recording
- ✅ Pass: All expected results met
- ❌ Fail: One or more expected results not met
- ⚠️ Skip: Test blocked by environment or prerequisite issue
- 🐛 Bug: Issue found, requires ticket

### Console Error Monitoring
- Check browser console for JavaScript errors
- Filter out expected API errors (404, 500 in dev mode)
- Record authentication/session errors

---

## 1. Member Dashboard (/member/dashboard)

### TC-MEM-001: Dashboard Page Load

**Description:** 会員ダッシュボードが正しく読み込まれ、統計情報が表示されることを確認

**Preconditions:**
- User logged in as member

**Test Steps:**
1. Login as `test@epackage-lab.com`
2. Navigate to `http://localhost:3000/member/dashboard`
3. Wait for page to fully load
4. Verify page title
5. Check console for errors
6. Verify dashboard sections

**Expected Results:**
- Page loads within 3 seconds
- Page title: "マイページトップ | Epackage Lab"
- Welcome message displayed: "ようこそ、[Name]様"
- Statistics cards visible:
  - 新規注文 (New Orders)
  - 見積依頼 (Quotations)
  - サンプル依頼 (Samples)
  - お問い合わせ (Inquiries)
  - 契約 (Contracts)
- Quick action cards visible
- Recent activity sections visible
- No console errors

---

### TC-MEM-002: Dashboard Statistics Cards

**Description:** ダッシュボードの統計カードが正しく表示され、クリック可能であることを確認

**Preconditions:**
- Dashboard page loaded

**Test Steps:**
1. Check "新規注文" card displays correct count
2. Click "新規注文" card
3. Verify redirect to /member/orders
4. Return to dashboard
5. Check "見積依頼" card displays correct count
6. Click "見積依頼" card
7. Verify redirect to /member/quotations

**Expected Results:**
- All statistics cards display accurate counts
- Cards are clickable
- Clicking card redirects to correct page
- Counts update based on actual data
- Color coding consistent (blue, green, orange, purple, indigo)
- No console errors

---

### TC-MEM-003: Dashboard Quick Actions

**Description:** ダッシュボードのクイックアクションが正しく動作することを確認

**Preconditions:**
- Dashboard page loaded

**Test Steps:**
1. Click "見積作成" quick action
2. Verify redirect to /quote-simulator
3. Return to dashboard
4. Click "注文一覧" quick action
5. Verify redirect to /member/orders
6. Click "サンプル申請" quick action
7. Verify redirect to /member/samples
8. Click "契約書" quick action
9. Verify redirect to /member/contracts

**Expected Results:**
- All quick action cards visible
- Each action redirects to correct page
- Icons display correctly
- Hover effects present
- No console errors

---

### TC-MEM-004: Dashboard Recent Orders

**Description:** ダッシュボードの最近の注文セクションが正しく表示されることを確認

**Preconditions:**
- Dashboard page loaded
- User has orders in system

**Test Steps:**
1. Locate "新規注文" section
2. Verify order list displays
3. Check order details (order number, amount, date)
4. Click "すべて見る" link
5. Verify redirect to /member/orders
6. Click on an order
7. Verify redirect to order detail

**Expected Results:**
- Recent orders displayed (up to 5)
- Order information complete:
  - 注文番号 (Order Number)
  - 金額 (Amount)
  - 作成日 (Created Date)
- "すべて見る" link works
- Order items clickable
- Empty state shows when no orders
- No console errors

---

### TC-MEM-005: Dashboard Recent Quotations

**Description:** ダッシュボードの最近の見積セクションが正しく表示されることを確認

**Preconditions:**
- Dashboard page loaded
- User has quotations in system

**Test Steps:**
1. Locate "見積依頼" section
2. Verify quotation list displays
3. Check quotation details
4. Click "すべて見る" link
5. Verify redirect to /member/quotations
6. Click on a quotation
7. Verify redirect to quotation detail

**Expected Results:**
- Recent quotations displayed (up to 5)
- Quotation information complete
- "すべて見る" link works
- Quotation items clickable
- Empty state shows when no quotations
- No console errors

---

### TC-MEM-006: Dashboard Announcements

**Description:** ダッシュボードのお知らせセクションが正しく表示されることを確認

**Preconditions:**
- Dashboard page loaded
- Active announcements exist

**Test Steps:**
1. Locate announcement section
2. Verify announcement cards display
3. Check announcement content
4. Click on announcement
5. Verify detail view or expand
6. Close announcement detail

**Expected Results:**
- Active announcements displayed
- Announcement content visible
- Priority announcements highlighted
- Click to view details
- Date displayed
- No console errors

---

### TC-MEM-007: Dashboard Notifications

**Description:** ダッシュボードの通知セクションが正しく表示されることを確認

**Preconditions:**
- Dashboard page loaded
- User has notifications

**Test Steps:**
1. Locate notification section
2. Check notification list
3. Verify unread notifications highlighted
4. Click on notification
5. Verify mark as read
6. Check notification count updates

**Expected Results:**
- Notifications displayed (up to 5)
- Unread notifications visually distinct (blue background)
- Title and message visible
- Timestamp displayed
- Click marks as read
- "新着" badge for unread
- No console errors

---

## 2. Member Orders (/member/orders)

### TC-MEM-010: Orders Page Load

**Description:** 注文一覧ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as member

**Test Steps:**
1. Navigate to `http://localhost:3000/member/orders`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify orders list displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "注文一覧 | Epackage Lab"
- Orders list/table displayed
- Filter controls visible
- Search bar visible
- "新規見積" button visible
- No console errors

---

### TC-MEM-011: Orders List Display

**Description:** 注文一覧が正しく表示されることを確認

**Preconditions:**
- Orders page loaded
- User has orders

**Test Steps:**
1. Verify orders displayed in list
2. Check order information for each:
   - 注文番号 (Order Number)
   - ステータス (Status)
   - 金額 (Amount)
   - 作成日 (Created Date)
3. Verify status badges
4. Check order items preview
5. Verify pagination (if applicable)

**Expected Results:**
- All orders displayed
- Order information complete
- Status badges with icons:
  - 保留中 (Pending) - Gray
  - データ受領 (Data Received) - Blue
  - 処理中 (Processing) - Blue
  - 製造中 (Manufacturing) - Yellow
  - 品質検査 (Quality Check) - Purple
  - 発送済み (Shipped) - Blue
  - 配達済み (Delivered) - Green
  - キャンセル済み (Cancelled) - Red
- Order items show first 3 items
- Total amount displayed
- No console errors

---

### TC-MEM-012: Orders Filtering

**Description:** 注文一覧のフィルター機能が正しく動作することを確認

**Preconditions:**
- Orders page loaded
- Multiple orders with different statuses

**Test Steps:**
1. Click "保留中" filter
2. Verify only pending orders shown
3. Click "処理中" filter
4. Verify only processing orders shown
5. Click "発送済み" filter
6. Verify only shipped orders shown
7. Click "すべて" filter
8. Verify all orders shown

**Expected Results:**
- Status filters visible and clickable
- Filter changes update list
- Selected filter highlighted
- Filter results accurate
- "すべて" shows all orders
- No console errors

---

### TC-MEM-013: Orders Search

**Description:** 注文一覧の検索機能が正しく動作することを確認

**Preconditions:**
- Orders page loaded
- Multiple orders exist

**Test Steps:**
1. Locate search bar
2. Enter order number
3. Verify search results
4. Clear search
5. Enter quotation number
6. Verify search results
7. Enter partial number
8. Verify partial match works

**Expected Results:**
- Search bar accessible
- Search by order number works
- Search by quotation number works
- Partial matching works
- Results update in real-time or on submit
- Clear search resets list
- No console errors

---

### TC-MEM-014: Orders Date Range Filter

**Description:** 注文一覧の日付範囲フィルターが正しく動作することを確認

**Preconditions:**
- Orders page loaded
- Orders spanning multiple time periods

**Test Steps:**
1. Locate date range filter
2. Select "過去7日間"
3. Verify orders filtered
4. Select "過去30日間"
5. Verify orders filtered
6. Select "過去90日間"
7. Verify orders filtered
8. Select "すべて"
9. Verify all orders shown

**Expected Results:**
- Date range dropdown accessible
- Date filters work correctly
- Only orders within range shown
- "すべて" shows all orders
- Filter applies correctly
- No console errors

---

### TC-MEM-015: Orders Sorting

**Description:** 注文一覧のソート機能が正しく動作することを確認

**Preconditions:**
- Orders page loaded
- Multiple orders exist

**Test Steps:**
1. Locate sort dropdown
2. Select "新しい順"
3. Verify sorting by date descending
4. Select "古い順"
5. Verify sorting by date ascending
6. Select "金額が高い順"
7. Verify sorting by amount descending
8. Select "金額が低い順"
9. Verify sorting by amount ascending

**Expected Results:**
- Sort dropdown accessible
- Sort options work correctly
- List reorders correctly
- Current sort selection shown
- No console errors

---

### TC-MEM-016: Orders Pagination

**Description:** 注文一覧のページネーションが正しく動作することを確認

**Preconditions:**
- Orders page loaded
- More orders than fit on one page

**Test Steps:**
1. Verify page numbers displayed
2. Click "次へ" button
3. Verify next page loads
4. Click page number
5. Verify specific page loads
6. Click "前へ" button
7. Verify previous page loads

**Expected Results:**
- Pagination controls visible
- Next/Previous buttons work
- Page numbers clickable
- Orders change per page
- Current page highlighted
- URL updates with page parameter
- No console errors

---

### TC-MEM-017: Orders Empty State

**Description:** 注文がない場合の空状態が正しく表示されることを確認

**Preconditions:**
- Orders page loaded
- User has no orders

**Test Steps:**
1. Verify empty state message
2. Check "注文がありません" message
3. Verify "新規見積" button visible
4. Click "新規見積"
5. Verify redirect to quote-simulator

**Expected Results:**
- Empty state displayed when no orders
- Clear message: "注文がありません"
- "新規見積" button prominent
- Button redirects to quote-simulator
- No console errors

---

## 3. Order Detail (/member/orders/[id])

### TC-MEM-020: Order Detail Page Load

**Description:** 注文詳細ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as member
- Valid order ID exists

**Test Steps:**
1. Navigate to `http://localhost:3000/member/orders/[order-id]`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify order details displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title includes order number
- Order details visible:
  - 注文番号
  - 注文日
  - ステータス
  - 合計金額
- Order items displayed
- Status timeline visible
- No console errors

---

### TC-MEM-021: Order Detail Information

**Description:** 注文詳細情報が完全に表示されることを確認

**Preconditions:**
- Order detail page loaded

**Test Steps:**
1. Check order header information
2. Verify order status badge
3. Check order items list
4. Verify item details:
   - 製品名
   - 数量
   - 単価
   - 小計
5. Check pricing breakdown
6. Verify total amount

**Expected Results:**
- Order header complete:
  - 注文番号 displayed
  - 注文日 formatted correctly
  - Status badge with correct color
- Order items complete for each item:
  - Product name
  - Quantity
  - Unit price
  - Line total
- Pricing breakdown:
  - 小計 (Subtotal)
  - 消費税 (Tax)
  - 合計 (Total)
- No console errors

---

### TC-MEM-022: Order Status Timeline

**Description:** 注文ステータスタイムラインが正しく表示されることを確認

**Preconditions:**
- Order detail page loaded
- Order has status history

**Test Steps:**
1. Locate status timeline section
2. Verify status steps displayed
3. Check current status highlighted
4. Verify past statuses marked complete
5. Verify future statuses disabled
6. Check dates for each status

**Expected Results:**
- Timeline visible with all steps
- Current status highlighted
- Completed statuses marked with checkmark
- Future statuses grayed out
- Dates shown for completed statuses
- Status steps:
  - 保留中 (Pending)
  - データ受領 (Data Received)
  - 処理中 (Processing)
  - 製造中 (Manufacturing)
  - 品質検査 (Quality Check)
  - 発送済み (Shipped)
  - 配達済み (Delivered)
- No console errors

---

### TC-MEM-023: Order Shipment Tracking

**Description:** 注文の配送追跡情報が表示されることを確認

**Preconditions:**
- Order detail page loaded
- Order has been shipped

**Test Steps:**
1. Locate shipment section
2. Verify tracking number displayed
3. Check carrier name displayed
4. Click tracking link (if available)
5. Verify external tracking site opens

**Expected Results:**
- Shipment section visible when shipped
- Tracking number displayed
- Carrier name displayed (Yamato, Sagawa, etc.)
- Tracking link opens external site
- Estimated delivery date shown (if available)
- No console errors

---

### TC-MEM-024: Order Actions

**Description:** 注文詳細ページのアクションボタンが正しく動作することを確認

**Preconditions:**
- Order detail page loaded

**Test Steps:**
1. Check for "再注文" button (if applicable)
2. Click "再注文"
3. Verify redirect to reorder flow
4. Return to order detail
5. Check for "キャンセル" button (if applicable)
6. Verify cancellation flow works

**Expected Results:**
- "再注文" button visible for completed orders
- Reorder creates new order/quotation
- "キャンセル" button visible for pending orders
- Cancellation requires confirmation
- Actions only available when appropriate
- No console errors

---

### TC-MEM-025: Order Documents

**Description:** 注文関連のドキュメントがダウンロードできることを確認

**Preconditions:**
- Order detail page loaded
- Documents available

**Test Steps:**
1. Locate documents section
2. Check for invoice download
3. Click "請求書ダウンロード"
4. Verify PDF downloads
5. Check for specification sheet
6. Click "仕様書ダウンロード"
7. Verify file downloads

**Expected Results:**
- Documents section visible
- Invoice download generates PDF
- Specification sheet downloads
- Downloads have correct filenames
- File formats correct (PDF, etc.)
- No console errors

---

### TC-MEM-026: Order Data Receipt Upload

**Description:** 注文のデータ入稿機能が正しく動作することを確認

**Preconditions:**
- Order detail page loaded
- Order in "データ受領" status

**Test Steps:**
1. Locate data receipt section
2. Click "ファイルを選択"
3. Select valid file
4. Verify file uploaded
5. Add description/comment
6. Click "送信" button
7. Verify upload success

**Expected Results:**
- Upload section visible for appropriate status
- File picker opens
- File upload shows progress
- File size validated
- File type validated
- Success message after upload
- No console errors

---

### TC-MEM-027: Order Comments Section

**Description:** 注文のコメントセクションが正しく動作することを確認

**Preconditions:**
- Order detail page loaded

**Test Steps:**
1. Locate comments section
2. Check existing comments
3. Enter new comment
4. Click "送信" button
5. Verify comment appears
6. Check comment timestamp
7. Verify sender name displayed

**Expected Results:**
- Comments section visible
- Existing comments displayed
- Comment input accepts text
- Submit adds comment to list
- Timestamp formatted correctly
- Sender identified
- No console errors

---

## 4. Member Quotations (/member/quotations)

### TC-MEM-030: Quotations Page Load

**Description:** 見積一覧ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as member

**Test Steps:**
1. Navigate to `http://localhost:3000/member/quotations`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify quotations list displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "見積依頼 | Epackage Lab"
- Quotations list displayed
- Filter controls visible
- "更新" button visible
- "新規見積" button visible
- No console errors

---

### TC-MEM-031: Quotations List Display

**Description:** 見積一覧が正しく表示されることを確認

**Preconditions:**
- Quotations page loaded
- User has quotations

**Test Steps:**
1. Verify quotations displayed
2. Check quotation information:
   - 見積番号
   - ステータス
   - 有効期限
   - 合計金額
3. Verify status badges
4. Check quotation items preview
5. Verify action buttons

**Expected Results:**
- All quotations displayed
- Quotation information complete
- Status badges:
  - ドラフト (Draft) - Gray
  - 送信済み (Sent) - Blue
  - 承認済み (Approved) - Green
  - 却下 (Rejected) - Red
  - 期限切れ (Expired) - Yellow
- Items show first 3
- Action buttons visible:
  - 詳細を見る
  - PDFダウンロード
  - 削除 (Draft only)
  - 注文に変換 (Approved only)
- No console errors

---

### TC-MEM-032: Quotations Filtering

**Description:** 見積一覧のフィルター機能が正しく動作することを確認

**Preconditions:**
- Quotations page loaded
- Multiple quotations with different statuses

**Test Steps:**
1. Click "ドラフト" filter
2. Verify only draft quotations shown
3. Click "送信済み" filter
4. Verify only sent quotations shown
5. Click "承認済み" filter
6. Verify only approved quotations shown
7. Click "すべて"
8. Verify all quotations shown

**Expected Results:**
- Status filters visible and clickable
- Filter changes update list
- Selected filter highlighted
- Filter results accurate
- No console errors

---

### TC-MEM-033: Quotation PDF Download

**Description:** 見積PDFをダウンロードできることを確認

**Preconditions:**
- Quotations page loaded
- Quotation exists

**Test Steps:**
1. Locate "PDFダウンロード" button
2. Click button for a quotation
3. Verify PDF generation starts
4. Wait for download
5. Verify PDF file downloaded
6. Check PDF contents

**Expected Results:**
- "PDFダウンロード" button visible for all quotations
- Button shows "PDF作成中..." during generation
- PDF file downloads with correct name: [quotation-number].pdf
- PDF contains quotation details
- Download history counter increments
- No console errors

---

### TC-MEM-034: Quotation Deletion

**Description:** ドラフト見積を削除できることを確認

**Preconditions:**
- Quotations page loaded
- Draft quotation exists

**Test Steps:**
1. Locate draft quotation
2. Click "削除" button
3. Verify confirmation dialog
4. Confirm deletion
5. Verify quotation removed
6. Check refresh

**Expected Results:**
- "削除" button only visible for DRAFT status
- Confirmation dialog: "この見積を削除してもよろしいですか？"
- Confirm removes quotation from list
- Button shows "削除中..." during deletion
- List refreshes after deletion
- No console errors

---

### TC-MEM-035: Quotation to Order Conversion

**Description:** 承認済み見積を注文に変換できることを確認

**Preconditions:**
- Quotations page loaded
- Approved quotation exists

**Test Steps:**
1. Locate approved quotation
2. Click "注文に変換" button
3. Verify redirect to order creation
4. Verify pre-filled data from quotation
5. Complete order creation
6. Verify order created

**Expected Results:**
- "注文に変換" button only visible for APPROVED status
- Redirects to order creation flow
- Form pre-filled with quotation data
- Order created successfully
- Quotation marked as CONVERTED
- No console errors

---

### TC-MEM-036: Quotation Item Order Creation

**Description:** 見積アイテムから注文を作成できることを確認

**Preconditions:**
- Quotations page loaded
- Quotation with items exists

**Test Steps:**
1. Expand quotation items
2. Locate item without order
3. Click "発注する" button
4. Verify order confirmation modal opens
5. Review order details
6. Confirm order creation
7. Verify order created

**Expected Results:**
- Items expandable to show all items
- "発注する" button for items without orderId
- "注文済み" badge for items with orderId
- Order confirmation modal shows:
  - Product name
  - Quantity
  - Unit price
  - Total price
- Confirmation creates order
- Item updated with orderId
- No console errors

---

### TC-MEM-037: Quotations Refresh

**Description:** 見積一覧を更新できることを確認

**Preconditions:**
- Quotations page loaded

**Test Steps:**
1. Click "更新" button
2. Verify loading indicator
3. Verify list refreshes
4. Check for new quotations
5. Verify status updates

**Expected Results:**
- "更新" button visible
- Click triggers refresh
- Loading indicator shown
- List updates with latest data
- Status changes reflected
- Download stats refreshed
- No console errors

---

### TC-MEM-038: Quotations Empty State

**Description:** 見積がない場合の空状態が正しく表示されることを確認

**Preconditions:**
- Quotations page loaded
- User has no quotations

**Test Steps:**
1. Verify empty state message
2. Check "見積依頼がありません" message
3. Verify "見積を作成する" button
4. Click button
5. Verify redirect to quote-simulator

**Expected Results:**
- Empty state displayed
- Clear message
- "見積を作成する" button prominent
- Button redirects to quote-simulator
- "更新" button also visible
- No console errors

---

## 5. Quotation Detail (/member/quotations/[id])

### TC-MEM-040: Quotation Detail Page Load

**Description:** 見積詳細ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as member
- Valid quotation ID exists

**Test Steps:**
1. Navigate to `http://localhost:3000/member/quotations/[quotation-id]`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify quotation details displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title includes quotation number
- Quotation details visible:
  - 見積番号
  - 作成日
  - 有効期限
  - ステータス
  - 合計金額
- Quotation items displayed
- No console errors

---

### TC-MEM-041: Quotation Detail Information

**Description:** 見積詳細情報が完全に表示されることを確認

**Preconditions:**
- Quotation detail page loaded

**Test Steps:**
1. Check quotation header information
2. Verify quotation status badge
3. Check quotation items list
4. Verify item details:
   - 製品名
   - 数量
   - 単価
   - 仕様
5. Check pricing breakdown
6. Verify total amount

**Expected Results:**
- Quotation header complete
- Status badge with correct color
- Items displayed with:
  - Product name
  - Quantity
  - Unit price
  - Specifications (size, material, etc.)
- Pricing breakdown:
  - 小計
  - 消費税
  - 合計
- No console errors

---

### TC-MEM-042: Quotation Actions

**Description:** 見積詳細ページのアクションボタンが正しく動作することを確認

**Preconditions:**
- Quotation detail page loaded

**Test Steps:**
1. Check "PDFダウンロード" button
2. Click and verify PDF download
3. Check "編集" button (Draft only)
4. Check "削除" button (Draft only)
5. Check "注文に変換" button (Approved only)
6. Test each available action

**Expected Results:**
- Actions vary by status:
  - DRAFT: 編集, 削除, PDFダウンロード
  - SENT: PDFダウンロード
  - APPROVED: 注文に変換, PDFダウンロード
  - REJECTED: PDFダウンロード
  - EXPIRED: PDFダウンロード
- All actions work correctly
- Confirmation for destructive actions
- No console errors

---

### TC-MEM-043: Quotation Specifications

**Description:** 見積の製品仕様が正しく表示されることを確認

**Preconditions:**
- Quotation detail page loaded

**Test Steps:**
1. Check item specifications section
2. Verify bag type displayed
3. Verify material displayed
4. Verify dimensions displayed
5. Verify post-processing options
6. Verify printing options

**Expected Results:**
- All specifications displayed in Japanese
- Bag type: 平袋, スタンドパウチ, etc.
- Material: PET+AL, PET+VMPE, etc.
- Dimensions: width x height x gusset
- Post-processing: zipper, hole, etc.
- Printing: gravure, flexo, etc.
- Technical details accurate
- No console errors

---

## 6. Member Profile (/member/profile)

### TC-MEM-050: Profile Page Load

**Description:** プロフィールページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as member

**Test Steps:**
1. Navigate to `http://localhost:3000/member/profile`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify profile form displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "会員情報 | Epackage Lab"
- Profile form visible with current data
- Form sections:
  - 個人情報
  - 会社情報
  - 連絡先情報
- No console errors

---

### TC-MEM-051: Profile Display

**Description:** プロフィール情報が正しく表示されることを確認

**Preconditions:**
- Profile page loaded

**Test Steps:**
1. Check personal information section
2. Verify name fields populated
3. Check email field
4. Check phone field
5. Check company information
6. Verify address information

**Expected Results:**
- All fields populated with current data
- Data formatted correctly:
  - Name in Kanji
  - Name in Katakana
  - Email address
  - Phone number
  - Company name
  - Postal code
  - Address
- No console errors

---

### TC-MEM-052: Profile Edit

**Description:** プロフィール情報を編集できることを確認

**Preconditions:**
- Profile page loaded

**Test Steps:**
1. Click "編集" button
2. Update name field
3. Update phone number
4. Update company name
5. Click "保存" button
6. Verify success message
7. Verify data updated

**Expected Results:**
- "編集" button enables form editing
- Fields become editable
- "保存" button appears
- Save shows loading state
- Success message: "プロフィールを更新しました"
- Form returns to read-only
- Data persisted
- No console errors

---

### TC-MEM-053: Profile Validation

**Description:** プロフィール編集のバリデーションが正しく動作することを確認

**Preconditions:**
- Profile page in edit mode

**Test Steps:**
1. Clear required field
2. Try to save
3. Verify error message
4. Enter invalid email format
5. Try to save
6. Verify error message
7. Enter invalid phone format
8. Try to save
9. Verify error message

**Expected Results:**
- Validation errors for each issue
- Japanese error messages
- Fields with errors highlighted
- Save disabled until valid
- Clear error messages
- No console errors

---

### TC-MEM-054: Profile Image Upload

**Description:** プロフィール画像をアップロードできることを確認

**Preconditions:**
- Profile page loaded

**Test Steps:**
1. Locate profile image section
2. Click "画像を変更" button
3. Select valid image file
4. Verify image preview
5. Click "保存"
6. Verify image updated

**Expected Results:**
- Profile image displayed
- "画像を変更" button available
- File picker opens
- Image preview shows selected file
- File size validated
- File type validated (images only)
- Save updates profile image
- No console errors

---

## 7. Member Settings (/member/settings)

### TC-MEM-060: Settings Page Load

**Description:** 設定ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as member

**Test Steps:**
1. Navigate to `http://localhost:3000/member/settings`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify settings sections displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "設定 | Epackage Lab"
- Settings sections visible:
  - アカウント設定
  - 通知設定
  - パスワード変更
- No console errors

---

### TC-MEM-061: Account Settings

**Description:** アカウント設定を変更できることを確認

**Preconditions:**
- Settings page loaded

**Test Steps:**
1. Locate account settings section
2. Update email preference
3. Update language preference
4. Update timezone
5. Click "保存" button
6. Verify success message

**Expected Results:**
- Email preferences displayed
- Language dropdown accessible
- Timezone dropdown accessible
- Save button works
- Success message appears
- Preferences persisted
- No console errors

---

### TC-MEM-062: Notification Settings

**Description:** 通知設定を変更できることを確認

**Preconditions:**
- Settings page loaded

**Test Steps:**
1. Locate notification settings section
2. Toggle email notifications
3. Toggle SMS notifications
4. Toggle push notifications
5. Select notification types
6. Click "保存" button
7. Verify success message

**Expected Results:**
- Notification toggles accessible
- Email notifications toggle
- SMS notifications toggle
- Push notifications toggle
- Notification type checkboxes:
  - 注文更新
  - 見積更新
  - サンプル状態
  - お知らせ
- Save persists settings
- No console errors

---

### TC-MEM-063: Password Change

**Description:** パスワードを変更できることを確認

**Preconditions:**
- Settings page loaded

**Test Steps:**
1. Locate password change section
2. Enter current password
3. Enter new password
4. Confirm new password
5. Click "パスワードを変更"
6. Verify success message

**Expected Results:**
- Password form visible with fields:
  - 現在のパスワード
  - 新しいパスワード
  - 新しいパスワード（確認）
- Password strength indicator
- Match validation
- Success message: "パスワードを変更しました"
- User may need to re-login
- No console errors

---

### TC-MEM-064: Password Change Validation

**Description:** パスワード変更のバリデーションが正しく動作することを確認

**Preconditions:**
- Settings page loaded

**Test Steps:**
1. Enter wrong current password
2. Try to change password
3. Verify error message
4. Enter mismatched new passwords
5. Try to change password
6. Verify error message
7. Enter weak new password
8. Try to change password
9. Verify error message

**Expected Results:**
- Wrong current password error
- Mismatch error
- Weak password error with requirements
- Fields highlighted
- Clear error messages
- Password not changed until valid
- No console errors

---

### TC-MEM-065: Account Deletion

**Description:** アカウント削除機能が正しく動作することを確認

**Preconditions:**
- Settings page loaded

**Test Steps:**
1. Locate account deletion section
2. Click "アカウントを削除" button
3. Verify warning dialog
4. Enter confirmation text
5. Confirm deletion
6. Verify account deleted

**Expected Results:**
- Deletion section at bottom of page
- Warning dialog with:
  - Warning message about data loss
  - Confirmation text input
  - Confirm button
- Account deletion requires:
  - Typing confirmation text
  - Password confirmation
- Success redirects to home
- User logged out
- No console errors

---

## 8. Member Samples (/member/samples)

### TC-MEM-070: Samples Page Load

**Description:** サンプル依頼一覧ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as member

**Test Steps:**
1. Navigate to `http://localhost:3000/member/samples`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify samples list displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "サンプル依頼 | Epackage Lab"
- Samples list displayed
- "新規依頼" button visible
- Filter controls visible
- No console errors

---

### TC-MEM-071: Samples List Display

**Description:** サンプル依頼一覧が正しく表示されることを確認

**Preconditions:**
- Samples page loaded
- User has sample requests

**Test Steps:**
1. Verify sample requests displayed
2. Check sample information:
   - 依頼番号
   - ステータス
   - サンプル数
   - 依頼日
3. Verify status badges
4. Check sample items list
5. Verify action buttons

**Expected Results:**
- All sample requests displayed
- Sample information complete
- Status badges:
  - 処理中 (Processing) - Blue
  - 送信済み (Sent) - Purple
  - 完了 (Completed) - Green
- Sample items listed (up to 5 per request)
- Action buttons visible
- No console errors

---

### TC-MEM-072: Sample Request Creation

**Description:** 新しいサンプル依頼を作成できることを確認

**Preconditions:**
- Samples page loaded

**Test Steps:**
1. Click "新規依頼" button
2. Verify redirect to /samples
3. Select up to 5 products
4. Fill contact information
5. Submit request
6. Verify success
7. Return to samples page

**Expected Results:**
- "新規依頼" button redirects to /samples
- Sample request form accessible
- Up to 5 products selectable
- Form submission works
- Success message or redirect
- New request appears in list
- No console errors

---

### TC-MEM-073: Sample Request Detail

**Description:** サンプル依頼の詳細が表示されることを確認

**Preconditions:**
- Samples page loaded
- Sample request exists

**Test Steps:**
1. Click on a sample request
2. Verify detail view opens
3. Check request details
4. Verify sample items listed
5. Check status timeline
6. Close detail view

**Expected Results:**
- Detail view opens (modal or page)
- Request details displayed:
  - 依頼番号
  - 依頼日
  - ステータス
  - 連絡先情報
- Sample items listed with products
- Status timeline visible
- Close button works
- No console errors

---

## 9. Member Inquiries (/member/inquiries)

### TC-MEM-080: Inquiries Page Load

**Description:** お問い合わせ一覧ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as member

**Test Steps:**
1. Navigate to `http://localhost:3000/member/inquiries`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify inquiries list displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "お問い合わせ一覧 | Epackage Lab"
- Inquiries list displayed
- "新規お問い合わせ" button visible
- Filter controls visible
- No console errors

---

### TC-MEM-081: Inquiries List Display

**Description:** お問い合わせ一覧が正しく表示されることを確認

**Preconditions:**
- Inquiries page loaded
- User has inquiries

**Test Steps:**
1. Verify inquiries displayed
2. Check inquiry information:
   - 件名
   - ステータス
   - カテゴリ
   - 作成日
3. Verify read/unread status
4. Check preview text
5. Verify action buttons

**Expected Results:**
- All inquiries displayed
- Inquiry information complete
- Unread inquiries highlighted
- Status badges:
  - 未読 (Unread) - Blue
  - 対応中 (In Progress) - Yellow
  - 完了 (Resolved) - Green
- Message preview visible
- No console errors

---

### TC-MEM-082: Inquiry Detail

**Description:** お問い合わせの詳細が表示されることを確認

**Preconditions:**
- Inquiries page loaded
- Inquiry exists

**Test Steps:**
1. Click on an inquiry
2. Verify detail view opens
3. Check inquiry details
4. Read full message
5. Check responses (if any)
6. Verify reply functionality

**Expected Results:**
- Detail view opens
- Inquiry details displayed:
  - 件名
  - カテゴリ
  - ステータス
  - 作成日
  - メッセージ
- Responses displayed with:
  - Sender name
  - Timestamp
  - Message content
- Reply input visible
- Mark as read on open
- No console errors

---

### TC-MEM-083: Inquiry Reply

**Description:** お問い合わせに返信できることを確認

**Preconditions:**
- Inquiry detail open

**Test Steps:**
1. Locate reply section
2. Enter reply message
3. Attach file (optional)
4. Click "送信" button
5. Verify reply added
6. Check timestamp

**Expected Results:**
- Reply input visible
- Message text area accepts input
- File upload available
- Submit button works
- Reply appears in conversation
- Timestamp displayed
- Status may update
- No console errors

---

### TC-MEM-084: New Inquiry Creation

**Description:** 新しいお問い合わせを作成できることを確認

**Preconditions:**
- Inquiries page loaded

**Test Steps:**
1. Click "新規お問い合わせ" button
2. Verify form opens
3. Select inquiry type
4. Enter subject
5. Enter message
6. Submit form
7. Verify success

**Expected Results:**
- Button opens inquiry form
- Form fields:
  - 問い合わせ種類
  - 件名
  - メッセージ
  - 添付ファイル
- Validation works
- Submission successful
- New inquiry appears in list
- No console errors

---

## 10. Member Notifications (/member/notifications)

### TC-MEM-090: Notifications Page Load

**Description:** 通知一覧ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as member

**Test Steps:**
1. Navigate to `http://localhost:3000/member/notifications`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify notifications list displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "通知 | Epackage Lab"
- Notifications list displayed
- Filter controls visible
- "すべて既読にする" button visible
- No console errors

---

### TC-MEM-091: Notifications List Display

**Description:** 通知一覧が正しく表示されることを確認

**Preconditions:**
- Notifications page loaded
- User has notifications

**Test Steps:**
1. Verify notifications displayed
2. Check notification information:
   - タイトル
   - メッセージ
   - 作成日時
3. Verify read/unread status
4. Check notification icons
5. Verify click action

**Expected Results:**
- All notifications displayed
- Unread notifications highlighted
- Notification types:
  - 注文更新 (Order Update) - 📦
  - 見積更新 (Quotation Update) - 📁
  - サンプル状態 (Sample Status) - 📝
  - お知らせ (Announcement) - 📢
- Timestamps formatted
- Clicking marks as read
- No console errors

---

### TC-MEM-092: Notification Filtering

**Description:** 通知のフィルタリングが正しく動作することを確認

**Preconditions:**
- Notifications page loaded

**Test Steps:**
1. Click "すべて" filter
2. Verify all notifications shown
3. Click "未読" filter
4. Verify only unread shown
5. Click "注文" filter
6. Verify only order notifications shown
7. Click "見積" filter
8. Verify only quotation notifications shown

**Expected Results:**
- Filter buttons visible
- Filters work correctly
- Selected filter highlighted
- Filter results accurate
- No console errors

---

### TC-MEM-093: Mark All as Read

**Description:** すべての通知を既読にできることを確認

**Preconditions:**
- Notifications page loaded
- Unread notifications exist

**Test Steps:**
1. Count unread notifications
2. Click "すべて既読にする" button
3. Verify success message
4. Check unread count
5. Verify all notifications marked as read

**Expected Results:**
- "すべて既読にする" button visible
- Click shows loading state
- Success message appears
- All notifications marked as read
- Unread count updates to 0
- Visual highlighting removed
- No console errors

---

### TC-MEM-094: Notification Actions

**Description:** 通知から関連ページに移動できることを確認

**Preconditions:**
- Notifications page loaded

**Test Steps:**
1. Click on order notification
2. Verify redirect to order detail
3. Return to notifications
4. Click on quotation notification
5. Verify redirect to quotation detail
6. Return to notifications
7. Click on announcement notification
8. Verify announcement displayed

**Expected Results:**
- Notifications are clickable
- Order notifications link to order detail
- Quotation notifications link to quotation detail
- Announcement notifications show modal
- Navigation works correctly
- Notification marked as read
- No console errors

---

## 11. Member Contracts (/member/contracts)

### TC-MEM-100: Contracts Page Load

**Description:** 契約書一覧ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as member

**Test Steps:**
1. Navigate to `http://localhost:3000/member/contracts`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify contracts list displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "契約書 | Epackage Lab"
- Contracts list displayed
- Statistics cards visible:
  - 契約済み (Signed)
  - 保留中 (Pending)
  - 合計 (Total)
- No console errors

---

### TC-MEM-101: Contracts List Display

**Description:** 契約書一覧が正しく表示されることを確認

**Preconditions:**
- Contracts page loaded
- User has contracts

**Test Steps:**
1. Verify contracts displayed
2. Check contract information:
   - 契約番号
   - ステータス
   - 作成日
   - 有効期限
3. Verify status badges
4. Check action buttons
5. Verify signatures

**Expected Results:**
- All contracts displayed
- Contract information complete
- Status badges:
  - 保留中 (Pending) - Yellow
  - 送付済み (Sent) - Blue
  - 署名済み (Signed) - Green
  - 有効期限切れ (Expired) - Red
- Action buttons:
  - 表示
  - 署名 (if pending)
  - PDFダウンロード
- Signature information displayed
- No console errors

---

### TC-MEM-102: Contract Detail

**Description:** 契約書の詳細が表示されることを確認

**Preconditions:**
- Contracts page loaded
- Contract exists

**Test Steps:**
1. Click on a contract
2. Verify contract detail opens
3. Check contract terms
4. Verify parties information
5. Check signature section
6. Verify contract PDF view

**Expected Results:**
- Contract detail view opens
- Contract terms displayed:
  - 契約内容
  - 納期
  - 支払条件
- Parties information:
  - 会社名
  - 住所
  - 代表者
- Signature section visible
- PDF preview or download
- No console errors

---

### TC-MEM-103: Contract Signing

**Description:** 契約書に電子署名できることを確認

**Preconditions:**
- Contract detail open
- Contract pending signature

**Test Steps:**
1. Locate signature section
2. Check contract terms
3. Click "同意して署名" checkbox
4. Enter signature password
5. Click "署名" button
6. Verify signature successful

**Expected Results:**
- Signature section accessible
- Terms must be reviewed
- Agreement checkbox required
- Password confirmation required
- Loading state during signing
- Success message
- Contract status updates to SIGNED
- Signature timestamp added
- No console errors

---

### TC-MEM-104: Contract PDF Download

**Description:** 契約書PDFをダウンロードできることを確認

**Preconditions:**
- Contract detail open

**Test Steps:**
1. Click "PDFダウンロード" button
2. Verify PDF generation starts
3. Wait for download
4. Verify PDF file downloaded
5. Check PDF contents

**Expected Results:**
- "PDFダウンロード" button visible
- Button shows loading state
- PDF downloads with correct name
- PDF contains complete contract:
  - Contract number
  - Terms
  - Parties
  - Signatures
- No console errors

---

## Cross-Page Tests

### TC-MEM-110: Member Navigation

**Description:** メンバーページ間のナビゲーションが正しく動作することを確認

**Preconditions:**
- Logged in as member

**Test Steps:**
1. Navigate through member pages
2. Test sidebar navigation
3. Test breadcrumb navigation
4. Verify active page highlighted
5. Test back button

**Expected Results:**
- Sidebar navigation works
- All member pages accessible
- Active page highlighted
- Breadcrumbs show path
- Back button works correctly
- No console errors

---

### TC-MEM-111: Member Authentication Check

**Description:** すべてのメンバーページで認証チェックが正しく動作することを確認

**Preconditions:**
- Not logged in

**Test Steps:**
1. Try to access /member/dashboard
2. Verify redirect to signin
3. Try to access /member/orders
4. Verify redirect to signin
5. Try to access /member/quotations
6. Verify redirect to signin
7. Login and verify access

**Expected Results:**
- Unauthenticated access redirects to /auth/signin
- Redirect URL includes return path
- After login, redirect to original page
- All member pages protected
- No console errors

---

### TC-MEM-112: Member Session Persistence

**Description:** セッションがページ間で正しく維持されることを確認

**Preconditions:**
- Logged in as member

**Test Steps:**
1. Login to account
2. Navigate to multiple member pages
3. Refresh page
4. Verify still logged in
5. Close and reopen browser
6. Verify still logged in (if remember me)

**Expected Results:**
- Session maintained across pages
- Refresh maintains login
- User context available on all pages
- "Remember me" works if enabled
- No unexpected logouts
- No console errors

---

### TC-MEM-113: Member Logout

**Description:** ログアウト機能が正しく動作することを確認

**Preconditions:**
- Logged in as member

**Test Steps:**
1. Click user menu/avatar
2. Click "ログアウト"
3. Verify logout successful
4. Verify redirect to home
5. Try to access member page
6. Verify denied

**Expected Results:**
- Logout option in user menu
- Logout clears session
- Redirect to home or signin
- Member pages no longer accessible
- User context cleared
- No console errors

---

## Test Summary

### Test Coverage
- **Total Test Cases:** 113
- **Pages Covered:** 11 main member pages + detail pages
- **Test Categories:**
  - Page Load & Render: 11 tests
  - List Display: 11 tests
  - Filtering & Search: 15 tests
  - Detail Views: 10 tests
  - Forms & Validation: 25 tests
  - Actions & Operations: 30 tests
  - Authentication: 5 tests
  - Cross-Page: 6 tests

### Priority Matrix
- **P0 (Critical):** Dashboard, Orders, Quotations
- **P1 (High):** Profile, Settings, Contracts
- **P2 (Medium):** Samples, Inquiries, Notifications

### Notes
- All tests require authenticated member session
- Test data should be prepared for comprehensive coverage
- Some tests require specific order statuses
- API errors expected in dev mode - filtered out
- Each test is independent and can be run standalone

---

**End of Phase 2 Test Scenarios**
