# Epackage Lab - Quotation to Order Workflow E2E Test Plan

## Project Overview

**Project**: Epackage Lab (패키지 제조 홈페이지)
**Base URL**: http://localhost:3000
**Test Type**: End-to-End (E2E) Playwright Tests
**Target Workflow**: Quotation (견적) → Order (주문) → Data Receipt → Admin Review → Korea Corrections → Customer Approval → Shipment → Delivery Note

### Application Description
Epackage Lab is a B2B e-commerce platform for custom packaging manufacturing. The platform supports:
- **Quotation Management**: Customers can create, view, and manage quotations
- **Order Processing**: Convert approved quotations to orders
- **Data Submission**: Upload design files and specifications
- **Admin Review**: Administrators review and approve quotations/orders
- **Korean Workflow**: Specialized data correction and approval workflow
- **Shipment Tracking**: Track delivery status and manage shipments

### Test Users
| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@example.com | Admin1234! | Administrative operations |
| Member | member@test.com | Member1234! | Customer operations |

---

## Test Scenarios

### 1. Member User Authentication and Quotation Creation

#### 1.1 Member Login - Success Case
**Priority**: Critical
**Steps**:
1. Navigate to http://localhost:3000
2. Click "Login" or "サインイン" button in header
3. Verify redirection to `/auth/signin` or login modal
4. Enter email: `member@test.com`
5. Enter password: `Member1234!`
6. Click "ログイン" (Login) button
7. Wait for navigation and page load

**Expected Results**:
- User is successfully authenticated
- Redirected to dashboard or previous page
- User menu displays member name/email
- Session token is stored (if applicable)

**Assertions**:
- `expect(page.url()).toContain('dashboard')` or member area
- `await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()`
- No error messages displayed

#### 1.2 Member Login - Invalid Credentials
**Priority**: High
**Steps**:
1. Navigate to login page
2. Enter invalid email: `invalid@test.com`
3. Enter invalid password: `WrongPass123!`
4. Click login button

**Expected Results**:
- Login fails with appropriate error message
- Error message in Japanese or Korean (based on locale)
- User remains on login page
- No session created

**Assertions**:
- `await expect(page.locator('text=/認証に失敗しました|Invalid credentials/')).toBeVisible()`

---

### 2. Quotation Creation via Quote Simulator

#### 2.1 Create Quotation from Quote Simulator
**Priority**: Critical
**Seed**: N/A (Create new quotation)
**Steps**:
1. As logged-in member, navigate to `/quote-simulator` or click "新規見積" (New Quotation)
2. Wait for quote simulator component to load
3. Select product type (e.g., "Stand Up Pouch" / "スタンドパウチ")
4. Select material (e.g., "PET+AL" / "PET+アルミニウム")
5. Enter dimensions:
   - Width: 200
   - Height: 300
   - Depth: 80
6. Select quantity: 5000
7. Select post-processing options (if available):
   - Zipper: Yes
   - Notch: Yes
   - Hanging Hole: No
8. Click "見積を作成" (Create Quotation) or "計算する" (Calculate)
9. Wait for price calculation
10. Click "保存" (Save) or "見積を保存" (Save Quotation)
11. Wait for confirmation message

**Expected Results**:
- Price is calculated and displayed
- Quotation is saved to database
- Quotation number is generated (format: QUO-YYYY-XXXXX)
- Success message appears
- Redirected to quotation detail page

**Assertions**:
- `await expect(page.locator('[data-testid="quotation-number"]')).toContainText(/QUO-\d{4}-\d{5}/)`
- `await expect(page.locator('text=/見積を保存しました|Quotation saved/')).toBeVisible()`
- `expect(page.url()).toContain('/member/quotations/')`
- Total amount is greater than 0

#### 2.2 View Quotation List
**Priority**: High
**Steps**:
1. Navigate to `/member/quotations`
2. Wait for quotations list to load
3. Verify quotation list displays

**Expected Results**:
- List of user's quotations is displayed
- Each quotation shows:
  - Quotation number
  - Status badge (ドラフト/Draft, 送信済み/Sent, 承認済み/Approved, etc.)
  - Total amount
  - Creation date
  - Action buttons (詳細/View, PDFダウンロード/Download PDF, 削除/Delete, 発注する/Order)

**Assertions**:
- `await expect(page.locator('.quotation-card').first()).toBeVisible()`
- Quotation status badges are visible
- Amounts are formatted correctly (¥ or 円 symbol)

---

### 3. Quotation Detail and PDF Download

#### 3.1 View Quotation Detail
**Priority**: High
**Steps**:
1. From quotations list, click "詳細を見る" (View Details) on any quotation
2. Wait for detail page to load

**Expected Results**:
- Quotation detail page displays complete information:
  - Quotation number
  - Status badge
  - Creation date and valid until date
  - Customer information
  - Line items (product name, quantity, unit price, total price)
  - Specifications (size, material, printing, post-processing)
  - Subtotal, tax amount, total amount
  - Bank information
  - Action buttons

**Assertions**:
- `await expect(page.locator('h1:has-text("見積書詳細")')).toBeVisible()`
- `await expect(page.locator('.quotation-info')).toBeVisible()`
- `await expect(page.locator('.line-items')).toBeVisible()`
- Total amount matches calculation: `subtotal + tax`

#### 3.2 Download Quotation PDF
**Priority**: High
**Steps**:
1. On quotation detail page, click "PDFダウンロード" (Download PDF) button
2. Wait for PDF generation
3. Verify download starts

**Expected Results**:
- Button shows loading state ("PDF作成中..." or "Generating...")
- PDF file is downloaded
- Filename format: `{quotationNumber}.pdf`
- Download count is updated
- Download history is logged

**Assertions**:
- Download event is triggered
- File is downloaded with correct name
- `await expect(page.locator('text=/PDFダウンロード履歴|Download history/')).toBeVisible()`
- Download count increases by 1

#### 3.3 Delete Draft Quotation
**Priority**: Medium
**Steps**:
1. Create a new draft quotation (use test from 2.1)
2. View quotation detail
3. Click "削除" (Delete) button
4. Confirm deletion in modal/dialog
5. Wait for deletion to complete

**Expected Results**:
- Confirmation dialog appears
- After confirmation, quotation is deleted
- Redirected to quotations list
- Deleted quotation no longer appears in list
- Success message appears

**Assertions**:
- `await expect(page.locator('.confirmation-dialog')).toBeVisible()`
- After deletion, quotation not found in list
- `await expect(page.locator('text=/削除しました|Deleted/')).toBeVisible()`

---

### 4. Admin Quotation Review and Approval

#### 4.1 Admin Login
**Priority**: Critical
**Steps**:
1. Navigate to http://localhost:3000
2. Navigate to `/admin` or `/admin/quotations`
3. If redirected to login, enter admin credentials:
   - Email: `admin@example.com`
   - Password: `Admin1234!`
4. Click login button

**Expected Results**:
- Admin is authenticated
- Redirected to admin dashboard or quotations page
- Admin navigation menu is visible

**Assertions**:
- `expect(page.url()).toContain('/admin')`
- `await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible()`

#### 4.2 Admin View Quotations List
**Priority**: High
**Steps**:
1. As admin, navigate to `/admin/quotations`
2. Wait for quotations list to load

**Expected Results**:
- All customer quotations are displayed
- Statistics cards show:
  - Total quotations count
  - Pending count
  - Approved count
  - Rejected count
  - Converted count
- Status filter is available
- Each quotation card shows:
  - Quotation number
  - Customer name and email
  - Status badge
  - Total amount
  - Creation date

**Assertions**:
- `await expect(page.locator('.stats-card').first()).toBeVisible()`
- `await expect(page.locator('.quotation-card').first()).toBeVisible()`
- Statistics counts are non-negative integers

#### 4.3 Admin Approve Quotation
**Priority**: Critical
**Steps**:
1. On admin quotations page, filter by status: "保留中" (Pending)
2. Click on a pending quotation card
3. Quotation detail panel loads on the right
4. Review quotation details
5. Click "承認" (Approve) button
6. Wait for approval to process

**Expected Results**:
- Quotation status changes from "pending" to "approved"
- Status badge updates to green/success variant
- "承認" and "拒否" buttons are replaced with "注文に変換" (Convert to Order)
- Success message appears: "見積もりを承認しました"
- Quotations list refreshes

**Assertions**:
- `await expect(page.locator('.quotation-card').filter({ hasText: '承認済み' })).toBeVisible()`
- `await expect(page.locator('text=/承認しました|Approved/')).toBeVisible()`
- Status badge color changes to green

#### 4.4 Admin Reject Quotation
**Priority**: Medium
**Steps**:
1. Select a pending quotation
2. Click "拒否" (Reject) button
3. Wait for rejection to process

**Expected Results**:
- Quotation status changes to "rejected"
- Status badge shows red/error variant
- Success/warning message appears
- List refreshes

**Assertions**:
- `await expect(page.locator('.quotation-card').filter({ hasText: '却下' }).or(page.locator('.quotation-card').filter({ hasText: '拒否' }))).toBeVisible()`
- Status badge is red

---

### 5. Order Creation from Approved Quotation

#### 5.1 Convert Approved Quotation to Order (Member)
**Priority**: Critical
**Seed**: Approved quotation from step 4.3
**Steps**:
1. As member, navigate to `/member/quotations`
2. Filter or find approved quotation (status: "承認済み")
3. Click "注文に変換" (Convert to Order) button on quotation card
   OR click "詳細を見る" then "注文する" on detail page
4. Wait for order creation modal or redirect to `/member/orders/new?quotationId={id}`
5. Verify order information is pre-filled from quotation
6. Enter delivery destination information:
   - Delivery name: "テスト配送先" (Test Delivery)
   - Postal code: "100-0001"
   - Prefecture: "東京都" (Tokyo)
   - City: "千代田区"
   - Address: "丸の内1-1-1"
   - Building: "テストビル10F"
   - Phone: "03-1234-5678"
   - Contact person: "テスト担当者"
7. Enter billing information (if different from delivery):
   - Company name: "テスト株式会社"
   - Postal code: "100-0002"
   - Prefecture: "東京都"
   - City: "千代田区"
   - Address: "丸の内2-2-2"
   - Tax number: "1234567890123"
8. Review order summary
9. Click "注文を確定" (Confirm Order) or "注文を作成" (Create Order)
10. Wait for order creation to complete

**Expected Results**:
- Order creation modal or page loads with pre-filled quotation data
- Delivery and billing information form is displayed
- Order summary shows:
  - Items from quotation
  - Quantities
  - Unit prices
  - Subtotal, tax, total
- After confirmation:
  - Order is created in database
  - Order number is generated (format: ORD-YYYY-XXXXX)
  - Quotation status updates to "CONVERTED" or "注文変換済み"
  - Redirected to order detail page: `/member/orders/{id}`
  - Success message appears

**Assertions**:
- `await expect(page.locator('[data-testid="order-number"]')).toContainText(/ORD-\d{4}-\d{5}/)`
- `expect(page.url()).toContain('/member/orders/')`
- `await expect(page.locator('text=/注文を作成しました|Order created/')).toBeVisible()`
- Order total matches quotation total
- Quotation status is "CONVERTED" (verified by navigating back to quotations)

#### 5.2 View Order List
**Priority**: High
**Steps**:
1. Navigate to `/member/orders`
2. Wait for orders list to load

**Expected Results**:
- List of user's orders is displayed
- Each order shows:
  - Order number
  - Status badge with icon (登録待/Pending, データ入稿/Data Received, 製造中/Manufacturing, etc.)
  - Progress bar (if applicable)
  - Total amount
  - Creation date
  - Link to quotation number (if converted from quotation)
  - "詳細を見る" (View Details) button
- Filter options available:
  - Status filter
  - Date range filter (7 days, 30 days, 90 days, all)
  - Search by order/quotation number
  - Sort options (date, amount)

**Assertions**:
- `await expect(page.locator('.order-card').first()).toBeVisible()`
- Status badges are visible with correct colors
- Search and filter controls are functional

#### 5.3 View Order Detail
**Priority**: High
**Steps**:
1. From orders list, click "詳細を見る" on any order
2. Wait for order detail page to load

**Expected Results**:
- Order detail page displays:
  - Order number and status badge
  - Order information section:
    - Order date/time
    - Last updated
    - Shipped date (if applicable)
    - Delivered date (if applicable)
  - Customer information:
    - Order number
    - Customer name
    - Email
    - Phone
  - Line items table:
    - Product name
    - Quantity
    - Unit price
    - Specifications (size, material, printing, post-processing, thickness, zipper)
    - Total price
  - Pricing summary:
    - Subtotal
    - Tax amount (10%)
    - Total amount
  - Delivery address
  - Billing address (if different)
  - Status timeline
  - File upload section (for design files)
  - Comments section
  - Customer approval section (if applicable)
  - Action buttons

**Assertions**:
- `await expect(page.locator('h1:has-text("注文詳細")')).toBeVisible()`
- `await expect(page.locator('.order-info')).toBeVisible()`
- `await expect(page.locator('.line-items-table')).toBeVisible()`
- `await expect(page.locator('.delivery-address')).toBeVisible()`
- `await expect(page.locator('.status-timeline')).toBeVisible()`

---

### 6. Data Receipt - Design File Upload

#### 6.1 Upload Design Files (Member)
**Priority**: Critical
**Steps**:
1. On order detail page, locate "データ入稿" (Data Upload) or "OrderFileUploadSection"
2. Click "ファイルを選択" (Choose File) or drag-and-drop area
3. Select test design file (PDF, AI, PSD, etc.)
4. Wait for file upload to start
5. Wait for upload progress
6. Verify upload completes

**Expected Results**:
- File picker dialog opens
- Selected file name is displayed
- Upload progress bar appears
- File validation occurs:
  - File type check
  - File size check (max size limit)
  - Virus scan (if implemented)
- Upon success:
  - File appears in uploaded files list
  - File status: "アップロード完了" (Upload Complete)
  - Order status may update to "DATA_RECEIVED" or "データ入稿"
  - Success notification appears

**Assertions**:
- `await expect(page.locator('.file-upload-section')).toBeVisible()`
- `await expect(page.locator('.upload-progress')).toBeVisible()` during upload
- `await expect(page.locator('text=/アップロード完了|Upload complete/')).toBeVisible()`
- File is listed in uploaded files section
- Order status updates to "data_received" or equivalent

#### 6.2 Upload Multiple Files
**Priority**: Medium
**Steps**:
1. Upload first file as in step 6.1
2. Click "追加ファイルをアップロード" (Upload Additional File)
3. Select second file
4. Wait for upload to complete
5. Repeat for third file if needed

**Expected Results**:
- Multiple files can be uploaded
- All files appear in list
- Each file shows:
  - File name
  - File size
  - Upload date/time
  - Status
- Delete button available for each file

**Assertions**:
- `await expect(page.locator('.uploaded-file').nth(0)).toBeVisible()`
- `await expect(page.locator('.uploaded-file').nth(1)).toBeVisible()`
- Count of uploaded files matches number of uploads

#### 6.3 Delete Uploaded File
**Priority**: Low
**Steps**:
1. In uploaded files list, click "削除" (Delete) button on a file
2. Confirm deletion in dialog
3. Wait for deletion to complete

**Expected Results**:
- Confirmation dialog appears
- File is removed from list
- Success message appears

**Assertions**:
- File no longer appears in list
- `await expect(page.locator('text=/削除しました|File deleted/')).toBeVisible()`

---

### 7. Admin Order Review

#### 7.1 Admin View Orders List
**Priority**: High
**Steps**:
1. As admin, navigate to `/admin/orders`
2. Wait for orders list to load

**Expected Results**:
- All customer orders are displayed in table
- Table columns:
  - Checkbox (for bulk selection)
  - Order number
  - Customer name
  - Customer email
  - Status dropdown (editable)
  - Amount
  - Creation date
  - Action link (詳細/Details)
- Status filter dropdown is available
- Bulk action controls appear when orders are selected
- Total orders count is displayed

**Assertions**:
- `await expect(page.locator('table.orders-table')).toBeVisible()`
- `await expect(page.locator('tbody tr').first()).toBeVisible()`
- Total count matches number of table rows

#### 7.2 Admin Update Order Status
**Priority**: Critical
**Steps**:
1. Find an order with status "PENDING" or "登録待"
2. In the status dropdown column for that order, click dropdown
3. Select new status: "DATA_RECEIVED" or "データ入稿"
4. Wait for status update to complete

**Expected Results**:
- Status dropdown shows all available statuses
- After selection:
  - Status is updated in database
  - Status badge color changes
  - Success alert appears: "注文ステータスが変更されました"
  - Table refreshes automatically
- Email notification may be sent to customer (if implemented)

**Assertions**:
- `await expect(page.locator('.status-dropdown').nth(rowIndex)).toHaveValue('DATA_RECEIVED')`
- Status badge color corresponds to new status category
- `await expect(page.locator('text=/ステータスが変更されました|Status updated/')).toBeVisible()`

#### 7.3 Admin Bulk Update Order Status
**Priority**: Medium
**Steps**:
1. Check checkboxes for 2-3 orders
2. Verify "X件選択" (X selected) text appears
3. In bulk action dropdown, select target status (e.g., "PROCESSING")
4. Confirm bulk update in dialog
5. Wait for updates to complete

**Expected Results**:
- Selected orders are highlighted
- Bulk update dialog confirms number of orders
- All selected orders update to new status
- Success message appears: "一括ステータス変更が完了しました"
- Selection is cleared after update

**Assertions**:
- All previously selected orders now show new status
- Selection count returns to 0
- `await expect(page.locator('text=/一括変更が完了しました|Bulk update complete/')).toBeVisible()`

#### 7.4 Admin View Order Detail
**Priority**: High
**Steps**:
1. Click "詳細" link on any order
2. Navigate to `/admin/orders/{id}`
3. Wait for order detail to load

**Expected Results**:
- Admin order detail page displays comprehensive order information
- Additional admin-only features:
  - Internal notes section
  - Admin action buttons
  - Production status management
  - File management (view uploaded design files)
  - Customer communication history
  - Status history timeline

**Assertions**:
- `await expect(page.locator('h1:has-text("注文詳細")')).toBeVisible()`
- Admin-only sections are visible
- All order details are editable/viewable by admin

---

### 8. Korea Team Data Corrections

#### 8.1 Korea Team Access Order (Admin/Korea Role)
**Priority**: High
**Steps**:
1. As Korea team member (or admin), navigate to order detail page
2. Locate "Korean Data Corrections" section or "韓国データ入力"
3. Click to expand or navigate to corrections interface

**Expected Results**:
- Korea-specific data entry form is displayed
- Fields may include:
  - Korean product specifications
  - Material codes for Korean system
  - Production notes
  - Special instructions
- Previous corrections history is visible
- Save/Update button is available

**Assertions**:
- `await expect(page.locator('.korea-corrections-section')).toBeVisible()`
- Form fields are editable
- Save button is enabled

#### 8.2 Enter Korea Corrections
**Priority**: High
**Steps**:
1. Fill in Korea-specific fields:
   - Korean product code: "KP-001"
   - Material specification: "PET12/AL7/PE100"
   - Special instructions: "テスト用韓国仕様" (Test Korean specs)
2. Click "保存" (Save) or "更新" (Update)
3. Wait for save to complete

**Expected Results**:
- Data is validated for Korean system requirements
- Corrections are saved to database
- Last updated timestamp is refreshed
- Success message appears
- Corrections history shows new entry

**Assertions**:
- `await expect(page.locator('text=/保存しました|Saved/')).toBeVisible()`
- Entered values persist after page refresh
- History shows new entry with timestamp

---

### 9. Send for Design Approval

#### 9.1 Send Design to Customer for Approval
**Priority**: Critical
**Steps**:
1. On order detail (admin or member view), locate "承認待ちリクエスト" (Approval Request) section
2. Or use "Send for Signature" modal if implemented
3. Click "承認を依頼" (Request Approval) or "署名を依頼" (Request Signature)
4. Wait for approval request creation

**Expected Results**:
- Approval request is created in database
- Email notification is sent to customer
- Order status may update to "PENDING_APPROVAL" or similar
- Approval section shows:
  - Request date/time
  - Approval status: "待機中" (Pending)
  - Approve/Reject buttons (for customer)

**Assertions**:
- `await expect(page.locator('.approval-request-section')).toBeVisible()`
- `await expect(page.locator('text=/承認待ち|Pending approval/')).toBeVisible()`
- Approval request is in database

#### 9.2 Customer Approves Design
**Priority**: Critical
**Steps**:
1. As customer, navigate to order detail page
2. Locate "承認待ちリクエスト" section
3. Review design proof or specifications
4. Click "承認する" (Approve) button
5. Confirm approval in dialog if required
6. Wait for approval to process

**Expected Results**:
- Confirmation dialog appears (if required)
- After confirmation:
  - Approval status updates to "APPROVED" or "承認済み"
  - Approval timestamp is recorded
  - Order status may update to "PRODUCTION" or "製造中"
  - Success message appears
  - Notification sent to admin/Korea team

**Assertions**:
- `await expect(page.locator('.approval-status').filter({ hasText: '承認済み' })).toBeVisible()`
- `await expect(page.locator('text=/承認しました|Approved/')).toBeVisible()`
- Approval timestamp is visible

#### 9.3 Customer Rejects Design
**Priority**: Medium
**Steps**:
1. As customer, in approval section
2. Click "差し戻し" (Reject/Return) or "却下" (Reject) button
3. Enter rejection reason: "デザイン修正が必要" (Design revision needed)
4. Submit rejection

**Expected Results**:
- Rejection reason is captured
- Approval status updates to "REJECTED" or "差し戻し"
- Order status may revert to "DATA_RECEIVED"
- Admin is notified of rejection
- Reason is visible to admin

**Assertions**:
- `await expect(page.locator('.approval-status').filter({ hasText: '差し戻し' }).or(page.locator('.approval-status').filter({ hasText: '却下' }))).toBeVisible()`
- Rejection reason is displayed
- `await expect(page.locator('text=/差し戻しました|Rejected/')).toBeVisible()`

---

### 10. Shipment Information Entry

#### 10.1 Admin Enter Shipment Information
**Priority**: High
**Steps**:
1. As admin, on order detail or in shipments section
2. Locate "出荷情報入力" (Shipment Info Entry) or navigate to `/admin/shipments`
3. For the order, enter:
   - Carrier: "ヤマト運輸" (Yamato Transport) or select from dropdown
   - Tracking number: "1234567890123" (test tracking number)
   - Shipping date: Current date or select from date picker
4. Click "保存" (Save) or "出荷情報を更新" (Update Shipment Info)
5. Wait for save to complete

**Expected Results**:
- Shipment information is saved to database
- Order status updates to "SHIPPED" or "発送済み"
- Tracking information is visible on order detail
- Customer may receive notification with tracking info
- Shipment timestamp is recorded

**Assertions**:
- `await expect(page.locator('.shipment-info').filter({ hasText: '1234567890123' })).toBeVisible()`
- `await expect(page.locator('.order-status').filter({ hasText: '発送済み' }).or(page.locator('.order-status').filter({ hasText: '出荷済み' }))).toBeVisible()`
- Carrier name is displayed
- Shipping date is visible and correct

#### 10.2 View Shipment Tracking (Customer)
**Priority**: Medium
**Steps**:
1. As customer, navigate to order detail
2. Locate "配送情報" (Delivery Info) or "出荷情報" (Shipment Info) section
3. Click on tracking number link (if clickable)
4. Or view tracking timeline component

**Expected Results**:
- Shipment tracking section is visible
- Shows:
  - Carrier name
  - Tracking number (clickable link to carrier website)
  - Shipping date
  - Current status
  - Tracking timeline (if implemented)
- Timeline may show:
  - 集荷済み (Picked up)
  - 配送中 (In transit)
  - 配達完了 (Delivered)

**Assertions**:
- `await expect(page.locator('.shipment-tracking')).toBeVisible()`
- Tracking number is visible and clickable
- Carrier information is displayed
- Timeline component is visible (if implemented)

---

### 11. Delivery Note Generation

#### 11.1 Generate Delivery Note (納品書)
**Priority**: High
**Steps**:
1. As admin or member, on order detail for shipped/delivered order
2. Locate "納品書" (Delivery Note) or "Invoice" section
3. Click "納品書を発行" (Issue Delivery Note) or "ダウンロード" (Download)
4. Wait for PDF generation
5. Verify download

**Expected Results**:
- Delivery note PDF is generated
- PDF includes:
  - Order number
  - Delivery note number (if different)
  - Order date and delivery date
  - Customer information
  - Delivery address
  - Line items with quantities and prices
  - Total amount including tax
  - Company information and stamp area
- Download starts automatically
- Delivery note is logged in database
- Download history is updated

**Assertions**:
- Download event is triggered
- File is downloaded with name like `{orderNumber}-delivery-note.pdf` or `納品書-{orderNumber}.pdf`
- `await expect(page.locator('text=/納品書を発行しました|Delivery note issued/')).toBeVisible()`
- Delivery note appears in document history

---

### 12. Order Completion and Final Status

#### 12.1 Mark Order as Delivered
**Priority**: Medium
**Steps**:
1. As admin, on order detail or in orders list
2. Find shipped order
3. Update status to "DELIVERED" or "納品完了"
4. Wait for update

**Expected Results**:
- Order status changes to "DELIVERED"
- Status badge shows green/complete color
- Delivered timestamp is recorded
- Order appears in completed orders
- Customer may receive completion notification

**Assertions**:
- `await expect(page.locator('.order-status').filter({ hasText: '納品完了' }).or(page.locator('.order-status').filter({ hasText: '配達済み' }))).toBeVisible()`
- Delivered date is visible
- Order appears in completed filter

#### 12.2 View Completed Order (Customer)
**Priority**: Medium
**Steps**:
1. As customer, navigate to orders list
2. Filter by "納品完了" (Delivered) or "完了" (Completed)
3. Click on completed order
4. View final order summary

**Expected Results**:
- Order shows complete timeline
- All statuses from creation to delivery
- Final delivery information
- Option to reorder (if implemented)
- Option to download invoice/delivery note

**Assertions**:
- Timeline shows all status transitions
- Final status is "DELIVERED"
- All sections are visible and complete

---

## 13. Error Handling and Edge Cases

### 13.1 Duplicate Order Creation Attempt
**Priority**: Medium
**Steps**:
1. Create order from approved quotation (step 5.1)
2. Try to create another order from the same quotation
3. Navigate back to quotations list
4. Click "注文に変換" again on the same quotation

**Expected Results**:
- Error message appears: "既に注文されています" (Already ordered)
- Button is disabled or removed
- No duplicate order is created

**Assertions**:
- `await expect(page.locator('text=/既に注文されています|Already ordered/')).toBeVisible()`
- "注文に変換" button is disabled or not visible
- No new order appears in orders list

### 13.2 Upload Invalid File Type
**Priority**: Medium
**Steps**:
1. On order detail, attempt to upload file with invalid extension (e.g., .exe, .bat)
2. Select file
3. Wait for validation

**Expected Results**:
- File validation error appears
- File is rejected
- Error message: "無効なファイルタイプです" (Invalid file type) or similar
- No upload occurs

**Assertions**:
- `await expect(page.locator('text=/無効なファイルタイプ|Invalid file type/')).toBeVisible()`
- File does not appear in uploaded list

### 13.3 Exceed File Size Limit
**Priority**: Low
**Steps**:
1. Attempt to upload file larger than size limit (e.g., >50MB)
2. Wait for validation

**Expected Results**:
- File size validation error appears
- Error message shows max size limit
- Upload is blocked

**Assertions**:
- `await expect(page.locator('text=/ファイルサイズが大きすぎます|File too large/')).toBeVisible()`

### 13.4 Session Expiry During Order Creation
**Priority**: Medium
**Steps**:
1. Start order creation process
2. Simulate session expiry (clear cookies/localStorage)
3. Try to submit order

**Expected Results**:
- User is redirected to login page
- Message: "セッションが期限切れです" (Session expired)
- After login, user can resume or data is preserved

**Assertions**:
- `expect(page.url()).toContain('/auth/signin')`
- `await expect(page.locator('text=/セッションが期限切れ|Session expired/')).toBeVisible()`

---

## 14. Performance Tests

### 14.1 Load Quotation List Performance
**Priority**: Low
**Steps**:
1. Navigate to quotations list with 100+ quotations
2. Measure page load time
3. Measure render time

**Expected Results**:
- Page loads within 3 seconds
- List renders within 1 second
- No significant UI lag

**Assertions**:
- Load time < 3000ms
- Render time < 1000ms

### 14.2 PDF Generation Performance
**Priority**: Low
**Steps**:
1. Download PDF for quotation with many items (10+)
2. Measure generation time

**Expected Results**:
- PDF generation completes within 10 seconds
- Loading indicator is shown during generation

**Assertions**:
- Generation time < 10000ms
- Loading state is visible

---

## Test Data Requirements

### Users
- Admin user with admin permissions
- Member user with standard customer permissions
- Korea team user (if separate role)

### Quotations
- Draft quotation (for testing delete)
- Pending quotation (for testing approval)
- Approved quotation (for testing order conversion)
- Rejected quotation (for testing rejected state)
- Converted quotation (already has order)

### Orders
- Pending order (DATA_RECEIVED status)
- In-progress order (PROCESSING/MANUFACTURING)
- Shipped order (with tracking)
- Delivered order (completed)

### Files
- Valid design files: PDF, AI, PSD
- Invalid files for testing: .exe, .bat
- Large file for size limit testing
- Multiple files for bulk upload testing

---

## Test Environment Setup

### Prerequisites
1. **Application Server**:
   ```bash
   npm run dev
   # Application runs on http://localhost:3000
   ```

2. **Database**:
   - Supabase or PostgreSQL instance running
   - Test database seeded with initial data
   - Test users created

3. **Playwright Installation**:
   ```bash
   npm init playwright@latest
   npm install @playwright/test
   ```

### Configuration Files

**playwright.config.ts**:
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Page Object Model Structure

### Base Page Object
```typescript
// tests/pages/BasePage.ts
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async screenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
}
```

### Auth Page Object
```typescript
// tests/pages/AuthPage.ts
export class AuthPage extends BasePage {
  readonly loginButton = this.page.locator('button:has-text("ログイン")');
  readonly emailInput = this.page.locator('input[type="email"]');
  readonly passwordInput = this.page.locator('input[type="password"]');

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForURL(/dashboard|member/);
  }
}
```

### Quotation Page Object
```typescript
// tests/pages/QuotationPage.ts
export class QuotationPage extends BasePage {
  readonly quotationsList = this.page.locator('.quotation-card');
  readonly newQuotationButton = this.page.locator('button:has-text("新規見積")');
  readonly quotationNumber = this.page.locator('[data-testid="quotation-number"]');
  readonly pdfDownloadButton = this.page.locator('button:has-text("PDFダウンロード")');
  readonly deleteButton = this.page.locator('button:has-text("削除")');
  readonly convertToOrderButton = this.page.locator('button:has-text("注文に変換")');

  async goto() {
    await this.goto('/member/quotations');
  }

  async createQuotation() {
    await this.goto('/quote-simulator');
    // Implementation...
  }
}
```

### Order Page Object
```typescript
// tests/pages/OrderPage.ts
export class OrderPage extends BasePage {
  readonly ordersList = this.page.locator('.order-card');
  readonly orderNumber = this.page.locator('[data-testid="order-number"]');
  readonly uploadFileButton = this.page.locator('input[type="file"]');
  readonly approvalSection = this.page.locator('.approval-request-section');

  async goto() {
    await this.goto('/member/orders');
  }

  async uploadFile(filePath: string) {
    await this.uploadFileButton.setInputFiles(filePath);
    await this.page.waitForSelector('text=/アップロード完了/');
  }
}
```

### Admin Page Object
```typescript
// tests/pages/AdminPage.ts
export class AdminPage extends BasePage {
  readonly adminQuotationsLink = this.page.locator('a:has-text("見積もり管理")');
  readonly adminOrdersLink = this.page.locator('a:has-text("注文管理")');
  readonly approveButton = this.page.locator('button:has-text("承認")');
  readonly rejectButton = this.page.locator('button:has-text("拒否")');

  async gotoQuotations() {
    await this.goto('/admin/quotations');
  }

  async gotoOrders() {
    await this.goto('/admin/orders');
  }
}
```

---

## Test Implementation Examples

### Example 1: Complete Quotation to Order Workflow
```typescript
// tests/e2e/quotation-to-order.spec.ts
import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { QuotationPage } from '../pages/QuotationPage';
import { OrderPage } from '../pages/OrderPage';
import { AdminPage } from '../pages/AdminPage';

test.describe('Quotation to Order Workflow', () => {
  let authPage: AuthPage;
  let quotationPage: QuotationPage;
  let orderPage: OrderPage;
  let adminPage: AdminPage;
  let quotationNumber: string;
  let orderNumber: string;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    quotationPage = new QuotationPage(page);
    orderPage = new OrderPage(page);
    adminPage = new AdminPage(page);
  });

  test('complete workflow: create quotation → admin approval → order creation', async ({ page }) => {
    // 1. Member login
    await page.goto('/');
    await authPage.login('member@test.com', 'Member1234!');

    // 2. Create quotation
    await quotationPage.createQuotation();
    quotationNumber = await quotationPage.quotationNumber.textContent();
    expect(quotationNumber).toMatch(/QUO-\d{4}-\d{5}/);

    // 3. View quotation detail
    await quotationPage.gotoQuotations();
    await quotationPage.quotationsList.first().click();
    await expect(page).toHaveURL(/\/member\/quotations\/.+/);

    // 4. Download PDF
    const downloadPromise = page.waitForEvent('download');
    await quotationPage.pdfDownloadButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain(quotationNumber);

    // 5. Admin login and approve
    await authPage.login('admin@example.com', 'Admin1234!');
    await adminPage.gotoQuotations();
    await page.click(`text=${quotationNumber}`);
    await adminPage.approveButton.click();
    await expect(page.locator('text=/承認しました/')).toBeVisible();

    // 6. Member creates order
    await authPage.login('member@test.com', 'Member1234!');
    await quotationPage.gotoQuotations();
    await page.click(`text=${quotationNumber}`);
    await quotationPage.convertToOrderButton.click();
    await page.waitForURL(/\/member\/orders\/new/);

    // Fill delivery information
    await page.fill('[name="delivery_name"]', 'テスト配送先');
    await page.fill('[name="postal_code"]', '100-0001');
    await page.selectOption('[name="prefecture"]', '東京都');
    await page.fill('[name="city"]', '千代田区');
    await page.fill('[name="address"]', '丸の内1-1-1');

    // Submit order
    await page.click('button:has-text("注文を確定")');
    await expect(page.locator('text=/注文を作成しました/')).toBeVisible();

    // 7. Verify order
    orderNumber = await orderPage.orderNumber.textContent();
    expect(orderNumber).toMatch(/ORD-\d{4}-\d{5}/);
    await expect(page).toHaveURL(/\/member\/orders\/.+/);
  });
});
```

### Example 2: Data Upload and Approval
```typescript
// tests/e2e/data-upload-approval.spec.ts
import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/AuthPage';
import { OrderPage } from '../pages/OrderPage';

test.describe('Data Upload and Approval', () => {
  test('upload design files and approve order', async ({ page }) => {
    const authPage = new AuthPage(page);
    const orderPage = new OrderPage(page);

    // Login as member
    await page.goto('/');
    await authPage.login('member@test.com', 'Member1234!');

    // Navigate to order
    await orderPage.goto();
    await orderPage.ordersList.first().click();

    // Upload design file
    const fileInput = await orderPage.uploadFileButton;
    await fileInput.setInputFiles('test-files/design.pdf');
    await expect(page.locator('text=/アップロード完了/')).toBeVisible({ timeout: 10000 });

    // Wait for admin to change status
    // (Admin would do this in separate test)

    // Approve design
    await page.click('button:has-text("承認する")');
    await expect(page.locator('.approval-status').filter({ hasText: '承認済み' })).toBeVisible();
  });
});
```

---

## Success Criteria

### Functional Requirements
- All authentication flows work correctly
- Quotation can be created, viewed, and downloaded as PDF
- Admin can approve/reject quotations
- Orders can be created from approved quotations
- Design files can be uploaded and validated
- Admin can update order statuses
- Korea team can enter corrections
- Customers can approve designs
- Shipment information can be entered
- Delivery notes can be generated
- Orders can be completed

### Non-Functional Requirements
- Page load times < 3 seconds
- PDF generation < 10 seconds
- No console errors during tests
- Responsive design works on mobile
- Accessibility standards met (ARIA labels, keyboard navigation)
- Error messages are clear and actionable
- Data persists correctly across page refreshes

---

## Cleanup Procedures

### After Each Test
1. **Clear Test Data**:
   - Delete test quotations created during test
   - Delete test orders created during test
   - Remove uploaded files
   - Clear approval requests

2. **Reset Session**:
   - Clear cookies and localStorage
   - Logout all users

3. **Database Cleanup**:
   ```sql
   DELETE FROM quotations WHERE quote_number LIKE 'TEST-%';
   DELETE FROM orders WHERE order_number LIKE 'TEST-%';
   DELETE FROM document_logs WHERE quotation_id IN (SELECT id FROM quotations WHERE quote_number LIKE 'TEST-%');
   ```

### After Test Suite
1. **Generate Test Report**:
   ```bash
   npx playwright test --reporter=html
   ```

2. **Archive Screenshots and Videos**:
   - Move to test-results archive
   - Organize by test suite and date

3. **Reset Database**:
   - Restore database to clean state
   - Re-seed with initial test data

---

## Test Execution Commands

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test quotation-to-order.spec.ts
```

### Run Tests in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=webkit
npx playwright test --project=firefox
```

### Run Tests with UI (Debug Mode)
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode
```bash
npx playwright test --headed
```

### Run Tests and Show Browser
```bash
npx playwright test --debug
```

### Generate Test Report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

---

## Maintenance and Updates

### Regular Updates
1. **Update Selectors**: When UI changes, update page object selectors
2. **Add New Tests**: As features are added, create corresponding tests
3. **Update Test Data**: Refresh test data as application evolves
4. **Review Flaky Tests**: Identify and fix tests with inconsistent results

### Test Review Schedule
- **Weekly**: Review test failures and update tests
- **Monthly**: Review test coverage and add missing scenarios
- **Quarterly**: Major test suite refactoring and optimization

---

## Appendices

### A. Status Mapping Table
| Database Status | Japanese Label | Category | Color |
|-----------------|----------------|----------|-------|
| DRAFT | ドラフト | Initial | Gray |
| SENT | 送信済み | Initial | Blue |
| APPROVED | 承認済み | Active | Green |
| REJECTED | 却下 | Terminated | Red |
| EXPIRED | 期限切れ | Terminated | Yellow |
| CONVERTED | 注文変換済み | Final | Purple |
| PENDING | 登録待 | Initial | Gray |
| DATA_RECEIVED | データ入稿 | Active | Blue |
| PROCESSING | 処理中 | Active | Blue |
| MANUFACTURING | 製造中 | Production | Yellow |
| SHIPPED | 発送済み | Final | Blue |
| DELIVERED | 納品完了 | Final | Green |

### B. URL Routes
| Route | Description | Access |
|-------|-------------|--------|
| `/` | Home page | Public |
| `/auth/signin` | Login page | Public |
| `/quote-simulator` | Quote simulator | Member |
| `/member/quotations` | Quotations list | Member |
| `/member/quotations/{id}` | Quotation detail | Member |
| `/member/orders` | Orders list | Member |
| `/member/orders/{id}` | Order detail | Member |
| `/admin` | Admin dashboard | Admin |
| `/admin/quotations` | Admin quotations | Admin |
| `/admin/orders` | Admin orders | Admin |
| `/admin/orders/{id}` | Admin order detail | Admin |
| `/admin/shipments` | Shipments management | Admin |

### C. Test Data Values
```typescript
const testUsers = {
  admin: {
    email: 'admin@example.com',
    password: 'Admin1234!',
    role: 'admin'
  },
  member: {
    email: 'member@test.com',
    password: 'Member1234!',
    role: 'member'
  }
};

const testAddresses = {
  delivery: {
    name: 'テスト配送先',
    postalCode: '100-0001',
    prefecture: '東京都',
    city: '千代田区',
    address: '丸の内1-1-1',
    building: 'テストビル10F',
    phone: '03-1234-5678',
    contactPerson: 'テスト担当者'
  },
  billing: {
    companyName: 'テスト株式会社',
    postalCode: '100-0002',
    prefecture: '東京都',
    city: '千代田区',
    address: '丸の内2-2-2',
    taxNumber: '1234567890123'
  }
};

const testFiles = {
  valid: [
    'test-files/design.pdf',
    'test-files/design.ai',
    'test-files/design.psd'
  ],
  invalid: [
    'test-files/virus.exe',
    'test-files/script.bat'
  ],
  large: 'test-files/large-file.pdf' // >50MB
};
```

---

## Conclusion

This comprehensive test plan covers the entire quotation-to-order workflow for the Epackage Lab platform, from both member and admin perspectives. The test scenarios ensure:

1. **Complete Workflow Coverage**: From quotation creation to order completion
2. **User Role Testing**: Both member and admin workflows
3. **Error Handling**: Edge cases and validation scenarios
4. **Data Integrity**: Proper data flow and state management
5. **User Experience**: Smooth transitions and clear feedback

Tests should be executed regularly as part of the CI/CD pipeline to ensure platform stability and catch regressions early.

---

**Document Version**: 1.0
**Last Updated**: 2025-01-19
**Author**: Test Planning Team
**Status**: Ready for Implementation
