# Comprehensive E2E Test Scenarios - Phase 3: Admin Pages

**Document Version:** 1.0
**Date:** 2026-01-14
**Test Environment:** http://localhost:3000
**Test Accounts:**
- Admin: `admin@epackage-lab.com` / `Admin1234`
- Member: `test@epackage-lab.com` / `Test1234!`

---

## Table of Contents

1. [Admin Dashboard (/admin/dashboard)](#1-admin-dashboard-admindashboard)
2. [Admin Orders (/admin/orders)](#2-admin-orders-adminorders)
3. [Admin Order Detail (/admin/orders/[id])](#3-admin-order-detail-adminordersid)
4. [Admin Quotations (/admin/quotations)](#4-admin-quotations-adminquotations)
5. [Admin Approvals (/admin/approvals)](#5-admin-approvals-adminapprovals)
6. [Admin Production (/admin/production)](#6-admin-production-adminproduction)
7. [Admin Inventory (/admin/inventory)](#7-admin-inventory-admininventory)
8. [Admin Shipments (/admin/shipments)](#8-admin-shipments-adminshipments)
9. [Admin Contracts (/admin/contracts)](#9-admin-contracts-admincontracts)
10. [Admin Leads (/admin/leads)](#10-admin-leads-adminleads)
11. [Admin Settings (/admin/settings)](#11-admin-settings-adminsettings)

---

## Test Execution Guidelines

### Prerequisites
- User logged in as admin
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
- Record authentication/authorization errors

---

## 1. Admin Dashboard (/admin/dashboard)

### TC-ADM-001: Admin Dashboard Page Load

**Description:** 管理ダッシュボードが正しく読み込まれ、統計情報が表示されることを確認

**Preconditions:**
- User logged in as admin

**Test Steps:**
1. Login as `admin@epackage-lab.com`
2. Navigate to `http://localhost:3000/admin/dashboard`
3. Wait for page to fully load
4. Verify page title
5. Check console for errors
6. Verify dashboard sections

**Expected Results:**
- Page loads within 3 seconds
- Page title: "管理ダッシュボード | Epackage Lab"
- Period filter visible (7日, 30日, 90日)
- Statistics widgets displayed
- Recent activity widget visible
- Quick actions widget visible
- Alerts widget visible
- Real-time updates indicator visible
- No console errors

---

### TC-ADM-002: Dashboard Statistics Widget

**Description:** ダッシュボードの統計ウィジェットが正しく表示されることを確認

**Preconditions:**
- Admin dashboard loaded

**Test Steps:**
1. Check order statistics section
2. Verify total orders count
3. Verify monthly revenue
4. Verify pending quotations count
5. Verify active production count
6. Verify today shipments count

**Expected Results:**
- Total orders displayed with trend
- Monthly revenue with currency format
- Pending quotations count
- Active production jobs count
- Today's shipments count
- Statistics update based on period filter
- Visual indicators (up/down arrows) for trends
- No console errors

---

### TC-ADM-003: Dashboard Detailed Statistics Cards

**Description:** ダッシュボードの詳細統計カードが正しく表示されることを確認

**Preconditions:**
- Admin dashboard loaded

**Test Steps:**
1. Check quotation conversion rate card
2. Verify conversion percentage
3. Check sample requests card
4. Verify total and processing counts
5. Check production statistics card
6. Verify average production days
7. Check shipment statistics card
8. Verify today's shipments and in-transit

**Expected Results:**
- Quotation conversion rate displayed
- Sample requests with total and processing
- Average production days displayed
- Completed production count
- Today's shipments count
- In-transit shipments count
- All cards have appropriate icons
- Color coding consistent
- No console errors

---

### TC-ADM-004: Dashboard Period Filter

**Description:** ダッシュボードの期間フィルターが正しく動作することを確認

**Preconditions:**
- Admin dashboard loaded

**Test Steps:**
1. Locate period dropdown
2. Select "最近7日"
3. Verify statistics update
4. Select "最近30日"
5. Verify statistics update
6. Select "最近90日"
7. Verify statistics update

**Expected Results:**
- Period dropdown accessible
- All periods available
- Statistics update when period changes
- Loading indicator during update
- Updated timestamp displayed
- No console errors

---

### TC-ADM-005: Dashboard Recent Activity

**Description:** ダッシュボードの最近のアクティビティウィジェットが正しく表示されることを確認

**Preconditions:**
- Admin dashboard loaded

**Test Steps:**
1. Locate recent activity widget
2. Verify activity list displayed
3. Check activity items for:
   - Activity type
   - Description
   - Timestamp
4. Click on activity item
5. Verify navigation to related item

**Expected Results:**
- Recent activities displayed
- Activity types:
  - 新規注文
  - 見積作成
  - ステータス更新
  - ユーザー登録
- Timestamps formatted correctly
- Clickable items navigate to details
- Real-time updates appear
- No console errors

---

### TC-ADM-006: Dashboard Quick Actions

**Description:** ダッシュボードのクイックアクションが正しく動作することを確認

**Preconditions:**
- Admin dashboard loaded

**Test Steps:**
1. Locate quick actions widget
2. Click "新規注文作成"
3. Verify redirect
4. Return to dashboard
5. Click "見積管理"
6. Verify redirect
7. Click "生産管理"
8. Verify redirect

**Expected Results:**
- Quick actions visible:
  - 新規注文作成
  - 見積管理
  - 生産管理
  - 出荷管理
  - ユーザー管理
- All actions redirect correctly
- Icons display correctly
- No console errors

---

### TC-ADM-007: Dashboard Alerts

**Description:** ダッシュボードのアラートウィジェットが正しく表示されることを確認

**Preconditions:**
- Admin dashboard loaded
- Alerts exist

**Test Steps:**
1. Locate alerts widget
2. Verify alert list displayed
3. Check alert types:
   - 在庫不足
   - 期限切れ見積
   - 未対応問い合わせ
4. Click on alert
5. Verify navigation to related page

**Expected Results:**
- Active alerts displayed
- Alert types clearly indicated
- Priority alerts highlighted
- Click to view details
- Alert count badge visible
- No console errors

---

### TC-ADM-008: Dashboard Error Handling

**Description:** ダッシュボードのエラーハンドリングが正しく動作することを確認

**Preconditions:**
- Admin dashboard loaded

**Test Steps:**
1. Simulate API error (disconnect network)
2. Verify error state displayed
3. Click "再試行" button
4. Verify retry attempt
5. Check retry counter
6. Click "ページを再読み込み"

**Expected Results:**
- Error state shows clear message
- "再試行" button visible and functional
- Retry counter increments
- Loading state during retry
- "ページを再読み込み" button works
- Fallback UI shown during error
- No console errors

---

## 2. Admin Orders (/admin/orders)

### TC-ADM-010: Orders Page Load

**Description:** 管理者注文一覧ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as admin

**Test Steps:**
1. Navigate to `http://localhost:3000/admin/orders`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify orders table displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "注文管理 | Epackage Lab"
- Orders table/list displayed
- Filter controls visible
- Search bar visible
- Export button visible
- No console errors

---

### TC-ADM-011: Orders List Display

**Description:** 注文一覧が正しく表示されることを確認

**Preconditions:**
- Admin orders page loaded
- Orders exist in system

**Test Steps:**
1. Verify orders displayed in table
2. Check order columns:
   - 注文番号
   - 顧客名
   - ステータス
   - 金額
   - 注文日
   - アクション
3. Verify status badges
4. Verify action buttons
5. Check pagination

**Expected Results:**
- All orders displayed
- Table columns visible and labeled
- Status badges with colors
- Action buttons for each order:
  - 詳細
  - 編集 (if applicable)
  - 削除 (if applicable)
- Pagination controls visible
- No console errors

---

### TC-ADM-012: Orders Filtering

**Description:** 注文一覧のフィルター機能が正しく動作することを確認

**Preconditions:**
- Admin orders page loaded
- Multiple orders with different statuses

**Test Steps:**
1. Click status filter dropdown
2. Select "保留中"
3. Verify results
4. Select "処理中"
5. Verify results
6. Select "製造中"
7. Verify results
8. Select "発送済み"
9. Verify results
10. Select "すべて"

**Expected Results:**
- Status filter accessible
- All status options available
- Filter updates list
- Selected filter highlighted
- "すべて" shows all orders
- No console errors

---

### TC-ADM-013: Orders Search

**Description:** 注文一覧の検索機能が正しく動作することを確認

**Preconditions:**
- Admin orders page loaded

**Test Steps:**
1. Locate search bar
2. Enter order number
3. Verify results
4. Enter customer name
5. Verify results
6. Enter partial match
7. Verify results
8. Clear search

**Expected Results:**
- Search bar accessible
- Search by order number works
- Search by customer name works
- Partial matching supported
- Results update in real-time
- Clear search resets list
- No console errors

---

### TC-ADM-014: Orders Date Range Filter

**Description:** 注文一覧の日付範囲フィルターが正しく動作することを確認

**Preconditions:**
- Admin orders page loaded

**Test Steps:**
1. Locate date range picker
2. Select start date
3. Select end date
4. Apply filter
5. Verify results
6. Clear date range

**Expected Results:**
- Date range picker accessible
- Start and end dates selectable
- Apply button works
- Filter shows orders within range
- Clear resets filter
- No console errors

---

### TC-ADM-015: Orders Export

**Description:** 注文一覧をエクスポートできることを確認

**Preconditions:**
- Admin orders page loaded

**Test Steps:**
1. Click "エクスポート" button
2. Select export format (Excel/CSV)
3. Verify file download
4. Open downloaded file
5. Verify data completeness

**Expected Results:**
- "エクスポート" button visible
- Format options available
- File downloads with correct name
- Data includes all visible columns
- Date range filter respected
- No console errors

---

### TC-ADM-016: Orders Bulk Actions

**Description:** 注文一括操作機能が正しく動作することを確認

**Preconditions:**
- Admin orders page loaded
- Multiple orders exist

**Test Steps:**
1. Select multiple orders
2. Click "一括操作" dropdown
3. Select "ステータス更新"
4. Select new status
5. Confirm action
6. Verify all selected updated

**Expected Results:**
- Checkboxes for selection
- "一括操作" dropdown appears when items selected
- Bulk actions available:
  - ステータス更新
  - 削除
- Confirmation dialog for destructive actions
- All selected orders updated
- Success message displayed
- No console errors

---

## 3. Admin Order Detail (/admin/orders/[id])

### TC-ADM-020: Order Detail Page Load

**Description:** 注文詳細ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as admin
- Valid order ID exists

**Test Steps:**
1. Navigate to `http://localhost:3000/admin/orders/[order-id]`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify order details displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title includes order number
- Order details visible
- Order items displayed
- Customer information visible
- Status timeline visible
- No console errors

---

### TC-ADM-021: Order Detail Information

**Description:** 注文詳細情報が完全に表示されることを確認

**Preconditions:**
- Order detail page loaded

**Test Steps:**
1. Check order header section
2. Verify order information:
   - 注文番号
   - 注文日
   - ステータス
   - 合計金額
3. Check customer information:
   - 顧客名
   - 会社名
   - 連絡先
4. Check order items
5. Verify pricing breakdown

**Expected Results:**
- Order header complete
- Customer information complete
- Order items listed with:
  - 製品名
  - 数量
  - 単価
  - 小計
  - 仕様
- Pricing breakdown visible
- No console errors

---

### TC-ADM-022: Order Status Update

**Description:** 注文ステータスを更新できることを確認

**Preconditions:**
- Order detail page loaded

**Test Steps:**
1. Locate status update section
2. Click "ステータス更新" button
3. Select new status
4. Enter notes (optional)
5. Confirm update
6. Verify status changed

**Expected Results:**
- "ステータス更新" button visible
- Status dropdown shows available statuses
- Status transition follows workflow rules
- Notes field accepts text
- Confirmation required for critical changes
- Status updates immediately
- Timeline updated
- Customer notification triggered (if configured)
- No console errors

---

### TC-ADM-023: Order Customer Information

**Description:** 注文の顧客情報が正しく表示されることを確認

**Preconditions:**
- Order detail page loaded

**Test Steps:**
1. Check customer contact section
2. Verify customer details
3. Click "詳細" button
4. Verify redirect to customer profile
5. Check order history
6. Check customer notes

**Expected Results:**
- Customer contact section visible
- Customer details:
  - 氏名
  - 会社名
  - メールアドレス
  - 電話番号
  - 住所
- "詳細" button links to customer profile
- Order history section visible
- Notes section accessible
- No console errors

---

### TC-ADM-024: Order Production Management

**Description:** 注文の生産管理機能が正しく動作することを確認

**Preconditions:**
- Order detail page loaded
- Order in production status

**Test Steps:**
1. Locate production section
2. Check production job details
3. Verify production status
4. Update production progress
5. Add production notes
6. Upload production photos (if applicable)

**Expected Results:**
- Production section visible for applicable orders
- Production job details displayed:
  - ジョブ番号
  - ステータス
  - 進捗
  - 開始日
  - 完了予定日
- Progress bar visible
- Update progress works
- Notes can be added
- Photo upload functional
- No console errors

---

### TC-ADM-025: Order Shipment Management

**Description:** 注文の出荷管理機能が正しく動作することを確認

**Preconditions:**
- Order detail page loaded
- Order ready for shipment

**Test Steps:**
1. Locate shipment section
2. Click "出荷作成" button
3. Select carrier
4. Enter tracking number
5. Set shipping date
6. Confirm shipment creation
7. Verify shipment created

**Expected Results:**
- "出荷作成" button visible when status allows
- Shipment form includes:
  - 配送業者 (Carrier)
  - 追跡番号 (Tracking Number)
  - 出荷日 (Shipping Date)
- Carrier options:
  - ヤマト運輸
  - 佐川急便
  - 日本郵便
- Validation works
- Shipment created successfully
- Order status updates
- Customer notified
- No console errors

---

### TC-ADM-026: Order Documents

**Description:** 注文に関連するドキュメントを管理できることを確認

**Preconditions:**
- Order detail page loaded

**Test Steps:**
1. Locate documents section
2. Check existing documents
3. Upload new document
4. Enter document description
5. Verify document appears
6. Download document
7. Delete document (test)

**Expected Results:**
- Documents section visible
- Existing documents listed
- Upload functional:
  - File picker works
  - File validation (type, size)
  - Description field
- Download works for each document
- Delete with confirmation
- No console errors

---

### TC-ADM-027: Order Comments

**Description:** 注文コメント機能が正しく動作することを確認

**Preconditions:**
- Order detail page loaded

**Test Steps:**
1. Locate comments section
2. Check existing comments
3. Add new comment
4. Select comment visibility (internal/customer)
5. Submit comment
6. Verify comment appears
7. Check notification sent (if customer visible)

**Expected Results:**
- Comments section visible
- Existing comments displayed with:
  - Author name
  - Timestamp
  - Visibility badge
  - Message
- Comment input accepts text
- Visibility toggle works
- Submit adds comment immediately
- Customer notification for visible comments
- No console errors

---

### TC-ADM-028: Order Timeline

**Description:** 注文タイムラインが正しく表示されることを確認

**Preconditions:**
- Order detail page loaded
- Order has status history

**Test Steps:**
1. Locate timeline section
2. Verify all status changes shown
3. Check timeline items for:
   - Status
   - Date/time
   - Changed by
   - Notes
4. Verify chronological order
5. Check timeline icons

**Expected Results:**
- Timeline displays complete history
- Each timeline item includes:
  - Status name
  - Timestamp
  - User who made change
  - Notes (if any)
- Chronological order (newest first)
- Visual indicators for status types
- No console errors

---

## 4. Admin Quotations (/admin/quotations)

### TC-ADM-030: Quotations Page Load

**Description:** 管理者見積一覧ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as admin

**Test Steps:**
1. Navigate to `http://localhost:3000/admin/quotations`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify quotations list displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "見積管理 | Epackage Lab"
- Quotations list displayed
- Filter controls visible
- Search bar visible
- No console errors

---

### TC-ADM-031: Quotations List Display

**Description:** 見積一覧が正しく表示されることを確認

**Preconditions:**
- Admin quotations page loaded
- Quotations exist

**Test Steps:**
1. Verify quotations displayed
2. Check quotation information:
   - 見積番号
   - 顧客名
   - ステータス
   - 金額
   - 有効期限
   - 作成日
3. Verify status badges
4. Verify action buttons

**Expected Results:**
- All quotations displayed
- Information complete
- Status badges:
  - ドラフト
  - 送信済み
  - 承認済み
  - 却下
  - 期限切れ
- Action buttons:
  - 詳細
  - 編集
  - PDF
  - 削除
- No console errors

---

### TC-ADM-032: Quotation Approval

**Description:** 見積を承認または却下できることを確認

**Preconditions:**
- Admin quotations page loaded
- Pending quotations exist

**Test Steps:**
1. Locate pending quotation
2. Click "承認" button
3. Verify approval dialog
4. Enter approval notes
5. Confirm approval
6. Verify status updated
7. Test rejection flow similarly

**Expected Results:**
- "承認" button visible for pending
- "却下" button visible
- Approval/rejection dialog appears
- Notes field available
- Confirmation required
- Status updates immediately
- Customer notified
- Quotation moves to correct status
- No console errors

---

### TC-ADM-033: Quotation Conversion to Order

**Description:** 承認済み見積から注文を作成できることを確認

**Preconditions:**
- Admin quotations page loaded
- Approved quotation exists

**Test Steps:**
1. Locate approved quotation
2. Click "注文に変換" button
3. Verify order creation form
4. Review pre-filled data
5. Adjust if needed
6. Confirm order creation
7. Verify order created

**Expected Results:**
- "注文に変換" visible for approved
- Order creation form opens
- Form pre-filled with quotation data
- All quotation items included
- Customer information populated
- Confirm creates order
- Quotation marked as converted
- Redirect to new order
- No console errors

---

### TC-ADM-034: Quotation Editing

**Description:** 見積を編集できることを確認

**Preconditions:**
- Admin quotations page loaded
- Draft quotation exists

**Test Steps:**
1. Locate draft quotation
2. Click "編集" button
3. Verify edit form opens
4. Update pricing
5. Update specifications
6. Save changes
7. Verify quotation updated

**Expected Results:**
- "編集" button visible for draft
- Edit form accessible
- All fields editable
- Pricing can be adjusted
- Specifications can be modified
- Save persists changes
- Audit trail created
- No console errors

---

## 5. Admin Approvals (/admin/approvals)

### TC-ADM-040: Approvals Page Load

**Description:** 管理者承認ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as admin

**Test Steps:**
1. Navigate to `http://localhost:3000/admin/approvals`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify approvals list displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "承認待ち | Epackage Lab"
- Pending approvals displayed
- Filter controls visible
- Tabs for different approval types
- No console errors

---

### TC-ADM-041: User Registration Approvals

**Description:** ユーザー登録を承認できることを確認

**Preconditions:**
- Admin approvals page loaded
- Pending user registrations exist

**Test Steps:**
1. Click "ユーザー登録" tab
2. Locate pending registration
3. Review user details
4. Click "承認" button
5. Verify approval dialog
6. Confirm approval
7. Verify user activated

**Expected Results:**
- Pending registrations visible
- User details displayed:
  - 氏名
  - メール
  - 会社名
  - 登録日
- "承認" and "却下" buttons
- Review modal shows all details
- Approval activates user account
- Welcome email sent
- No console errors

---

### TC-ADM-042: Quotation Approvals

**Description:** 見積承認リクエストを処理できることを確認

**Preconditions:**
- Admin approvals page loaded
- Pending quotation approvals exist

**Test Steps:**
1. Click "見積" tab
2. Locate pending quotation
3. Review quotation details
4. Check customer requirements
5. Approve or reject
6. Enter reason
7. Confirm action

**Expected Results:**
- Pending quotations visible
- Quotation details displayed
- Customer requirements shown
- Approve/reject with reason
- Status updates immediately
- Customer notified
- No console errors

---

### TC-ADM-043: Bulk Approvals

**Description:** 一括承認機能が正しく動作することを確認

**Preconditions:**
- Admin approvals page loaded
- Multiple pending items exist

**Test Steps:**
1. Select multiple pending items
2. Click "一括承認" button
3. Verify confirmation dialog
4. Confirm bulk approval
5. Verify all items approved

**Expected Results:**
- Checkboxes for selection
- "一括承認" button appears when items selected
- Confirmation dialog shows count
- Confirm approves all selected
- Success message with count
- List updates
- No console errors

---

## 6. Admin Production (/admin/production)

### TC-ADM-050: Production Page Load

**Description:** 管理者生産管理ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as admin

**Test Steps:**
1. Navigate to `http://localhost:3000/admin/production`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify production jobs displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "生産管理 | Epackage Lab"
- Production jobs displayed
- Filter controls visible
- Status tabs visible
- No console errors

---

### TC-ADM-051: Production Jobs List

**Description:** 生産ジョブ一覧が正しく表示されることを確認

**Preconditions:**
- Production page loaded
- Production jobs exist

**Test Steps:**
1. Verify jobs displayed
2. Check job information:
   - ジョブ番号
   - 注文番号
   - 製品
   - 数量
   - ステータス
   - 進捗
   - 納期
3. Verify progress bars
4. Verify action buttons

**Expected Results:**
- All jobs displayed
- Job information complete
- Progress bars show percentage
- Status badges:
  - 待機中
  - 製造中
  - 品質検査中
  - 完了
- Action buttons for each job
- No console errors

---

### TC-ADM-052: Production Job Detail

**Description:** 生産ジョブ詳細が表示されることを確認

**Preconditions:**
- Production page loaded
- Job exists

**Test Steps:**
1. Click on a production job
2. Verify detail view opens
3. Check job specifications
4. Verify production steps
5. Check timeline
6. Verify progress updates

**Expected Results:**
- Detail view opens
- Job specifications displayed:
  - Product details
  - Quantity
  - Specifications
  - Materials
- Production steps checklist
- Timeline with timestamps
- Progress update section
- No console errors

---

### TC-ADM-053: Production Status Update

**Description:** 生産ステータスを更新できることを確認

**Preconditions:**
- Production job detail open

**Test Steps:**
1. Click "ステータス更新" button
2. Select new status
3. Update progress percentage
4. Enter production notes
5. Upload progress photo (optional)
6. Confirm update

**Expected Results:**
- Status update form accessible
- Status dropdown shows next valid statuses
- Progress slider/input works
- Notes field accepts text
- Photo upload functional
- Update saves immediately
- Timeline updated
- Customer may be notified
- No console errors

---

### TC-ADM-054: Production Quality Control

**Description:** 品質管理チェックを記録できることを確認

**Preconditions:**
- Production job in quality check status

**Test Steps:**
1. Locate quality control section
2. Check quality checklist
3. Complete each check item
4. Pass/fail each item
5. Enter notes for failures
6. Submit quality report

**Expected Results:**
- Quality control checklist visible
- Checklist items specific to product type
- Pass/fail toggles for each item
- Notes field for failures
- Photo upload for defects
- Submit saves report
- Job status updates based on results
- No console errors

---

## 7. Admin Inventory (/admin/inventory)

### TC-ADM-060: Inventory Page Load

**Description:** 管理者在庫ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as admin

**Test Steps:**
1. Navigate to `http://localhost:3000/admin/inventory`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify inventory displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "在庫管理 | Epackage Lab"
- Inventory items displayed
- Filter controls visible
- Search bar visible
- No console errors

---

### TC-ADM-061: Inventory List Display

**Description:** 在庫一覧が正しく表示されることを確認

**Preconditions:**
- Inventory page loaded
- Inventory items exist

**Test Steps:**
1. Verify inventory displayed
2. Check item information:
   - 商品名
   - SKU
   - カテゴリ
   - 在庫数
   - 予約済み
   - 利用可能
   - 状態
3. Verify stock level indicators
4. Verify action buttons

**Expected Results:**
- All inventory items displayed
- Stock levels color-coded:
  - 緑: 十分
  - 黄: 少なめ
  - 赤: 不足
- Low stock warnings
- Action buttons:
  - 編集
  - 入庫記録
  - 出庫記録
- No console errors

---

### TC-ADM-062: Stock In

**Description:** 入庫記録を追加できることを確認

**Preconditions:**
- Inventory page loaded

**Test Steps:**
1. Click "入庫記録" button
2. Select item or add new
3. Enter quantity
4. Select supplier
5. Enter notes
6. Submit record

**Expected Results:**
- "入庫記録" form opens
- Item searchable or addable
- Quantity input positive
- Supplier dropdown available
- Notes field optional
- Submit updates stock level
- Transaction recorded
- No console errors

---

### TC-ADM-063: Stock Out

**Description:** 出庫記録を追加できることを確認

**Preconditions:**
- Inventory page loaded
- Item has stock

**Test Steps:**
1. Click "出庫記録" button
2. Select item
3. Enter quantity
4. Select reason:
   - 注文
   - サンプル
   - その他
5. Enter reference (order number, etc.)
6. Submit record

**Expected Results:**
- "出庫記録" form opens
- Item selection required
- Quantity validated against available stock
- Reason dropdown provided
- Reference field context-aware
- Submit updates stock level
- Cannot exceed available stock
- No console errors

---

### TC-ADM-064: Low Stock Alerts

**Description:** 在庫不足アラートが正しく表示されることを確認

**Preconditions:**
- Inventory page loaded
- Items below threshold

**Test Steps:**
1. Check for low stock indicators
2. Verify alert section
3. Review low stock items
4. Check threshold settings
5. Create stock alert for item

**Expected Results:**
- Low stock items highlighted in red
- Alert section shows critical items
- Thresholds configurable per item
- Alert creation functional
- Email notifications available
- No console errors

---

## 8. Admin Shipments (/admin/shipments)

### TC-ADM-070: Shipments Page Load

**Description:** 管理者出荷ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as admin

**Test Steps:**
1. Navigate to `http://localhost:3000/admin/shipments`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify shipments displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "出荷管理 | Epackage Lab"
- Shipments list displayed
- Filter controls visible
- No console errors

---

### TC-ADM-071: Shipments List Display

**Description:** 出荷一覧が正しく表示されることを確認

**Preconditions:**
- Shipments page loaded
- Shipments exist

**Test Steps:**
1. Verify shipments displayed
2. Check shipment information:
   - 出荷番号
   - 注文番号
   - 顧客名
   - 配送業者
   - 追跡番号
   - 出荷日
   - 配送状況
3. Verify status badges
4. Verify tracking links

**Expected Results:**
- All shipments displayed
- Information complete
- Status badges:
  - 処理中
  - 配送中
  - 配達済み
  - 返品
- Tracking link opens carrier site
- Action buttons visible
- No console errors

---

### TC-ADM-072: Shipment Creation

**Description:** 新しい出荷を作成できることを確認

**Preconditions:**
- Shipments page loaded
- Order ready for shipment

**Test Steps:**
1. Click "出荷作成" button
2. Select order to ship
3. Verify order items
4. Select carrier
5. Enter tracking number
6. Set shipping date
7. Create shipping label (if available)
8. Confirm shipment

**Expected Results:**
- "出荷作成" form accessible
- Order selection shows ready orders
- Order items displayed for verification
- Carrier options available
- Tracking number required
- Shipping date defaults to today
- Label generation functional (if configured)
- Shipment created successfully
- Order status updated
- Customer notified
- No console errors

---

### TC-ADM-073: Shipment Tracking Update

**Description:** 配送追跡情報を更新できることを確認

**Preconditions:**
- Shipment exists
- In-transit status

**Test Steps:**
1. Locate shipment
2. Click "追跡更新" button
3. Verify carrier API checked
4. Update tracking status
5. Add delivery notes
6. Confirm update

**Expected Results:**
- "追跡更新" button visible
- Carrier API checked automatically
- Tracking status updated
- Delivery notes can be added
- Status changes to delivered if confirmed
- Customer notified of delivery
- No console errors

---

### TC-ADM-074: Shipment Completion

**Description:** 出荷を完了としてマークできることを確認

**Preconditions:**
- Shipment in delivered status

**Test Steps:**
1. Locate delivered shipment
2. Click "完了確認" button
3. Verify delivery details
4. Add delivery notes
5. Upload proof (signature/photo)
6. Confirm completion

**Expected Results:**
- "完了確認" button appears
- Delivery details displayed
- Notes field available
- Proof upload functional
- Confirm completes shipment
- Related order updated
- Payment triggered (if applicable)
- No console errors

---

## 9. Admin Contracts (/admin/contracts)

### TC-ADM-080: Contracts Page Load

**Description:** 管理者契約書ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as admin

**Test Steps:**
1. Navigate to `http://localhost:3000/admin/contracts`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify contracts displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "契約管理 | Epackage Lab"
- Contracts list displayed
- Filter controls visible
- No console errors

---

### TC-ADM-081: Contracts List Display

**Description:** 契約書一覧が正しく表示されることを確認

**Preconditions:**
- Contracts page loaded
- Contracts exist

**Test Steps:**
1. Verify contracts displayed
2. Check contract information:
   - 契約番号
   - 顧客名
   - ステータス
   - 作成日
   - 有効期限
3. Verify status badges
4. Verify signature status

**Expected Results:**
- All contracts displayed
- Status badges:
  - 保留中
  - 送付済み
  - 署名済み
  - 有効期限切れ
- Signature status shown
- Action buttons visible
- No console errors

---

### TC-ADM-082: Contract Creation

**Description:** 新しい契約書を作成できることを確認

**Preconditions:**
- Contracts page loaded
- Order or quotation exists

**Test Steps:**
1. Click "契約作成" button
2. Select related order/quotation
3. Verify pre-filled data
4. Review terms
5. Customize terms if needed
6. Generate contract
7. Send to customer

**Expected Results:**
- "契約作成" form accessible
- Order/quotation selection available
- Data pre-filled from selection
- Terms editable
- Generate creates contract PDF
- Send functionality works
- Contract saved to database
- No console errors

---

### TC-ADM-083: Contract Sending

**Description:** 契約書を顧客に送信できることを確認

**Preconditions:**
- Contract created and not sent

**Test Steps:**
1. Locate contract
2. Click "送信" button
3. Verify customer email
4. Add cover message
5. Send contract
6. Verify email sent
7. Check status updated

**Expected Results:**
- "送信" button visible for pending contracts
- Customer email pre-filled
- Cover message field available
- Send triggers email with contract PDF
- Email includes signing link
- Status updates to "送付済み"
- Tracking created
- No console errors

---

### TC-ADM-084: Contract Management

**Description:** 契約書を管理（期限延長、取消）できることを確認

**Preconditions:**
- Contract exists

**Test Steps:**
1. Click "管理" button
2. Select action:
   - 期限延長
   - 再送信
   - 取消
3. For extension: enter new date
4. For resend: add message
5. For cancel: enter reason
6. Confirm action

**Expected Results:**
- Management actions accessible
- Extension requires new date
- Resend requires message
- Cancel requires reason
- Confirmation dialog for each
- Action updates contract
- Customer notified
- Audit trail created
- No console errors

---

## 10. Admin Leads (/admin/leads)

### TC-ADM-090: Leads Page Load

**Description:** 管理者リードページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as admin

**Test Steps:**
1. Navigate to `http://localhost:3000/admin/leads`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify leads displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "リード管理 | Epackage Lab"
- Leads list displayed
- Filter controls visible
- Status tabs visible
- No console errors

---

### TC-ADM-091: Leads List Display

**Description:** リード一覧が正しく表示されることを確認

**Preconditions:**
- Leads page loaded
- Leads exist

**Test Steps:**
1. Verify leads displayed
2. Check lead information:
   - 氏名
   - 会社名
   - ソース
   - ステータス
   - 作成日
   - 担当者
3. Verify status badges
4. Verify action buttons

**Expected Results:**
- All leads displayed
- Status badges:
  - 新規
  - コンタクト済み
  - 商談中
  - 成約
  - 失注
- Source displayed
- Assigned user shown
- Action buttons visible
- No console errors

---

### TC-ADM-092: Lead Status Update

**Description:** リードステータスを更新できることを確認

**Preconditions:**
- Leads page loaded
- Lead exists

**Test Steps:**
1. Click on lead
2. Verify detail view
3. Click "ステータス更新"
4. Select new status
5. Add notes
6. Assign to user (if applicable)
7. Confirm update

**Expected Results:**
- Lead detail view accessible
- Status update form works
- All statuses available
- Notes field accepts text
- User assignment functional
- Update saves immediately
- Timeline updated
- No console errors

---

### TC-ADM-093: Lead Conversion

**Description:** リードを顧客に変換できることを確認

**Preconditions:**
- Lead in "商談中" status

**Test Steps:**
1. Locate lead
2. Click "成約" button
3. Verify conversion dialog
4. Select conversion type:
   - 会員登録
   - 注文作成
5. Enter conversion details
6. Confirm conversion

**Expected Results:**
- "成約" button visible for appropriate statuses
- Conversion dialog shows options
- Member registration creates account
- Order creation starts order flow
- Data pre-filled from lead
- Lead status updates to "成約"
- Conversion recorded
- No console errors

---

## 11. Admin Settings (/admin/settings)

### TC-ADM-100: Settings Page Load

**Description:** 管理者設定ページが正しく読み込まれることを確認

**Preconditions:**
- User logged in as admin

**Test Steps:**
1. Navigate to `http://localhost:3000/admin/settings`
2. Wait for page to fully load
3. Verify page title
4. Check console for errors
5. Verify settings sections displayed

**Expected Results:**
- Page loads within 3 seconds
- Page title: "設定 | Epackage Lab"
- Settings tabs/sections visible:
  - 一般
  - ユーザー管理
  - システム設定
  - 通知設定
- No console errors

---

### TC-ADM-101: General Settings

**Description:** 一般設定を変更できることを確認

**Preconditions:**
- Settings page loaded
- "一般" tab selected

**Test Steps:**
1. Review general settings
2. Update company information
3. Update contact email
4. Update default currency
5. Update time zone
6. Click "保存" button
7. Verify success message

**Expected Results:**
- All general settings accessible
- Company name editable
- Contact email editable
- Currency options available
- Timezone dropdown works
- Save persists changes
- Success message appears
- Settings apply immediately
- No console errors

---

### TC-ADM-102: User Management

**Description:** ユーザー管理機能が正しく動作することを確認

**Preconditions:**
- Settings page loaded
- "ユーザー管理" tab selected

**Test Steps:**
1. Verify users list displayed
2. Click "ユーザー追加" button
3. Fill user creation form
4. Select user role
5. Create user
6. Edit existing user
7. Change user role
8. Disable user account

**Expected Results:**
- All users displayed
- User creation form functional
- Roles available:
  - Admin
  - Member
  - Staff
- Edit user works
- Role changes require confirmation
- Disable account requires confirmation
- Changes persist
- No console errors

---

### TC-ADM-103: System Settings

**Description:** システム設定を変更できることを確認

**Preconditions:**
- Settings page loaded
- "システム設定" tab selected

**Test Steps:**
1. Review system settings
2. Update quotation validity period
3. Update tax rate
4. Configure email settings
5. Configure backup settings
6. Save changes

**Expected Results:**
- Quotation validity period editable
- Tax rate configurable
- Email settings:
  - SMTP configuration
  - From email
  - Reply-to
- Backup settings:
  - Frequency
  - Retention
- Save persists changes
- System may require restart for some settings
- No console errors

---

### TC-ADM-104: Notification Settings

**Description:** 通知設定を変更できることを確認

**Preconditions:**
- Settings page loaded
- "通知設定" tab selected

**Test Steps:**
1. Review notification settings
2. Configure email notifications
3. Configure SMS notifications
4. Configure notification triggers
5. Test notification sending
6. Save changes

**Expected Results:**
- Email notification toggles work
- SMS settings:
  - Enable/disable
  - API key configuration
- Notification triggers:
  - Order created
  - Order status changed
  - Quotation approved
  - Shipment delivered
- Test send works
- Save persists changes
- No console errors

---

## Cross-Page Tests

### TC-ADM-110: Admin Navigation

**Description:** 管理者ページ間のナビゲーションが正しく動作することを確認

**Preconditions:**
- Logged in as admin

**Test Steps:**
1. Navigate through admin pages
2. Test sidebar navigation
3. Test top navigation
4. Verify active page highlighted
5. Test breadcrumb navigation

**Expected Results:**
- All admin pages accessible via navigation
- Sidebar navigation complete
- Active page clearly indicated
- Breadcrumbs show path
- Navigation smooth and responsive
- No console errors

---

### TC-ADM-111: Admin Authentication Check

**Description:** すべての管理者ページで認証チェックが正しく動作することを確認

**Preconditions:**
- Not logged in

**Test Steps:**
1. Try to access /admin/dashboard
2. Verify redirect to signin
3. Try to access /admin/orders
4. Verify redirect to signin
5. Try to access /admin/quotations
6. Verify redirect to signin
7. Login as member
8. Try to access admin pages
9. Verify access denied

**Expected Results:**
- Unauthenticated access redirects to signin
- Non-admin users denied access
- Redirect URL includes return path
- Appropriate error message for non-admin
- No console errors

---

### TC-ADM-112: Admin Role Permissions

**Description:** 管理者ロールの権限が正しく適用されることを確認

**Preconditions:**
- Multiple admin roles exist

**Test Steps:**
1. Login as Super Admin
2. Verify all pages accessible
3. Test critical actions (delete, etc.)
4. Login as Staff Admin
5. Verify restricted pages
6. Test allowed actions
7. Verify restricted actions blocked

**Expected Results:**
- Super Admin has full access
- Staff Admin has restricted access
- Critical actions require higher permissions
- Appropriate warnings for restricted actions
- No console errors

---

### TC-ADM-113: Admin Session Management

**Description:** 管理者セッションが正しく管理されることを確認

**Preconditions:**
- Logged in as admin

**Test Steps:**
1. Check session timeout
2. Verify auto-logout after inactivity
3. Test concurrent session handling
4. Verify session persists across pages
5. Test logout functionality

**Expected Results:**
- Session timeout configured
- Auto-logout after timeout
- Concurrent sessions handled (single session enforced)
- Session maintained across refreshes
- Logout clears all session data
- Redirect to login after logout
- No console errors

---

### TC-ADM-114: Admin Audit Trail

**Description:** 管理者アクションの監査ログが記録されることを確認

**Preconditions:**
- Logged in as admin

**Test Steps:**
1. Perform admin action (update order)
2. Navigate to audit log
3. Verify action recorded
4. Check log details:
   - Action
   - User
   - Timestamp
   - Changes
5. Filter audit log

**Expected Results:**
- All critical actions logged
- Log includes:
  - Action type
  - Admin user
  - Timestamp
  - Entity affected
  - Changes made
- Audit log accessible
- Filtering works
- Export available
- No console errors

---

## Test Summary

### Test Coverage
- **Total Test Cases:** 114
- **Pages Covered:** 11 main admin pages + detail pages
- **Test Categories:**
  - Page Load & Render: 11 tests
  - List Display & Filtering: 20 tests
  - CRUD Operations: 30 tests
  - Status Management: 20 tests
  - Approval Workflows: 15 tests
  - Settings & Configuration: 10 tests
  - Authentication & Authorization: 8 tests

### Priority Matrix
- **P0 (Critical):** Dashboard, Orders, Quotations, Production
- **P1 (High):** Approvals, Shipments, Inventory
- **P2 (Medium):** Contracts, Leads, Settings

### Notes
- All tests require authenticated admin session
- Some tests require specific data states
- Admin permissions tested where applicable
- Audit trail verification for critical actions
- Each test is independent and can be run standalone

---

**End of Phase 3 Test Scenarios**
