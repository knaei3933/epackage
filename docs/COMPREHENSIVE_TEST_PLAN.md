# Epackage Lab - Comprehensive E2E Test Plan

**Document Version**: 1.0
**Date**: 2026-01-12
**Application**: Epackage Lab Web (http://localhost:3000)
**Framework**: Playwright E2E Testing
**Database**: Supabase (PostgreSQL)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Application Overview](#application-overview)
3. [Test Scope & Objectives](#test-scope--objectives)
4. [Testing Strategy](#testing-strategy)
5. [Test Environment](#test-environment)
6. [Test Scenarios by Phase](#test-scenarios-by-phase)
7. [Database Validation Tests](#database-validation-tests)
8. [API Endpoint Tests](#api-endpoint-tests)
9. [Console Error Validation](#console-error-validation)
10. [Performance Metrics](#performance-metrics)
11. [Test Execution Guidelines](#test-execution-guidelines)
12. [Success Criteria](#success-criteria)

---

## Executive Summary

This comprehensive test plan covers the complete Epackage Lab B2B packaging management system, including:

- **9-Stage Order Workflow**: From quotation to delivery
- **Public Pages**: Homepage, catalog, quote simulator, samples, contact
- **Member Portal**: Orders, quotations, profile, settings
- **Admin Dashboard**: Dashboard, approvals, production, shipments
- **Database Integration**: Supabase with 28+ performance indexes
- **File Upload Security**: Magic number validation, 10MB limit, virus scan integration
- **Multi-language Support**: Japanese (primary), English

**Total Test Scenarios**: 150+ comprehensive test cases
**Expected Execution Time**: 2-3 hours (full suite)
**Priority Coverage**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)

---

## Application Overview

### Business Domain

Epackage Lab is a Japanese B2B packaging material management system that provides:

- **Custom Packaging Solutions**: Stand-up pouches, box pouches, spout pouches, roll film
- **Quote-to-Delivery Workflow**: 9-stage production process
- **Customer Portal**: Order tracking, quotation management, document downloads
- **Admin Dashboard**: Production monitoring, inventory management, shipment tracking
- **Korea Integration**: Data correction workflow with Korean production team

### Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion |
| State Management | React Context, SWR |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| File Storage | Supabase Storage |
| Email | SendGrid |
| PDF Generation | jsPDF, html2canvas |
| Testing | Playwright, Jest |

### Key Features

1. **Intelligent Quote System** (`/quote-simulator`)
   - Real-time pricing calculation
   - Multi-quantity comparison
   - PDF/Excel quotation export
   - AI-powered specification extraction

2. **Order Management** (`/member/orders`)
   - Order status tracking
   - File upload (drag-drop)
   - Data receipt confirmation
   - Customer approval workflow

3. **Admin Dashboard** (`/admin/*`)
   - Production tracking (9 stages)
   - Inventory management
   - Shipment tracking (Yamato, Sagawa, Japan Post)
   - Lead management

4. **File Upload Security**
   - Magic number validation (20+ file types)
   - 10MB file size limit
   - Malicious content detection
   - Virus scanning integration

---

## Test Scope & Objectives

### In Scope

✅ All public pages (homepage, catalog, quote simulator, samples, contact)
✅ Authentication flows (registration, login, logout, password reset)
✅ Member portal features (orders, quotations, profile, settings)
✅ Admin dashboard features (dashboard, approvals, production, shipments)
✅ 9-stage order workflow (quotation → delivery)
✅ Database validation (tables, indexes, foreign keys, triggers)
✅ API endpoint testing (REST routes)
✅ Console error validation (no errors on load/interaction)
✅ File upload security (magic numbers, size limits, validation)
✅ PDF generation (Japanese quotations, contracts, invoices)
✅ Multi-language support (Japanese, English)
✅ Responsive design (mobile, tablet, desktop)

### Out of Scope

❌ Payment gateway integration (if applicable)
❌ Third-party carrier API testing (Yamato, Sagawa, Japan Post)
❌ Email delivery testing (SendGrid)
❌ Performance load testing (beyond basic metrics)
❌ Security penetration testing
❌ Accessibility compliance (WCAG) - partial coverage

### Test Objectives

1. **Functional Testing**: Verify all features work as specified
2. **Integration Testing**: Validate database, API, and external service integration
3. **UI/UX Testing**: Ensure consistent user experience across pages
4. **Security Testing**: Validate file upload security, authentication, authorization
5. **Performance Testing**: Verify page load times, Core Web Vitals
6. **Regression Testing**: Ensure existing functionality remains stable

---

## Testing Strategy

### Test Organization

Tests are organized by **phases** to allow parallel execution and selective testing:

```
tests/e2e/
├── phase-1-public/          # Public pages (no auth)
├── phase-2-auth/            # Authentication flows
├── phase-3-member/          # Member portal features
├── phase-4-admin/           # Admin dashboard features
├── phase-5-portal/          # Alternative customer portal
├── security/                # Security tests (CSRF, file upload)
└── database/                # Database validation tests
```

### Test Case ID Convention

```
TC-[PHASE]-[CATEGORY]-[NUMBER]
```

Examples:
- `TC-PUB-001` - Public page test
- `TC-AUTH-001` - Authentication test
- `TC-MEM-001` - Member portal test
- `TC-ADM-001` - Admin dashboard test
- `TC-WF-001` - Workflow test
- `TC-DB-001` - Database test
- `TC-API-001` - API endpoint test

### Test Priority Levels

| Priority | Description | Example |
|----------|-------------|---------|
| **P0** | Critical - Blocks core functionality | Login failure, payment failure |
| **P1** | High - Major feature broken | Quote generation fails |
| **P2** | Medium - Minor feature broken | UI alignment issue |
| **P3** | Low - Cosmetic issue | Spelling error |

### Test Data Strategy

**Test User Accounts**:
- `test-user@example.com` / `TestUser123!` - Regular member
- `test-admin@example.com` / `TestAdmin123!` - Admin user
- `guest@example.com` / `GuestUser123!` - Pending approval

**Test Data**:
- Sample products (6 pouch types)
- Test quotations (draft, sent, approved, rejected)
- Test orders (pending, processing, shipped, delivered)
- Sample files (PDF, AI, PSD, PNG, JPG, Excel)

---

## Test Environment

### Local Development

| Environment | URL | Database |
|-------------|-----|----------|
| Local | http://localhost:3000 | Supabase (dev) |
| Test Server | http://localhost:3006 | Supabase (test) |

### Browser Support

| Browser | Version | Priority |
|---------|---------|----------|
| Chromium | Latest | P0 |
| Firefox | Latest | P1 |
| WebKit | Latest | P2 |

### Viewport Sizes

| Device | Width | Height |
|--------|-------|--------|
| Desktop | 1920 | 1080 |
| Laptop | 1366 | 768 |
| Tablet | 768 | 1024 |
| Mobile | 375 | 667 |

---

## Test Scenarios by Phase

### Phase 1: Public Pages (No Authentication)

**Objective**: Verify all public pages load correctly without authentication

#### TC-PUB-001: Homepage Load Test

**Priority**: P0
**Test Type**: Functional, UI/UX
**Steps**:
1. Navigate to `http://localhost:3000/`
2. Verify page loads without errors
3. Check console for no errors
4. Verify page title: "Epackage Lab | 韓国品質の包装材料で日本のものづくりを支援"
5. Verify key elements present:
   - Logo and navigation
   - Announcement banner (if any)
   - Hero section
   - Product showcase (4 products)
   - Manufacturing process section
   - Footer with contact info
6. Verify all links are clickable
7. Verify responsive design (mobile/tablet/desktop)

**Expected Results**:
- Page loads in < 3 seconds
- No console errors
- All elements visible and clickable
- Responsive design works correctly

**Success Criteria**: All checks pass

---

#### TC-PUB-002: Homepage Navigation Test

**Priority**: P0
**Test Type**: Navigation
**Steps**:
1. Navigate to homepage
2. Click "ホーム" link
3. Verify stays on homepage
4. Click "製品カタログ" link
5. Verify navigates to `/catalog/`
6. Click "お問い合わせ" button
7. Verify navigates to `/contact/`
8. Click "お見積り" button
9. Verify opens quote modal or navigates to quote page
10. Click logo
11. Verify returns to homepage

**Expected Results**:
- All navigation links work correctly
- No broken links
- Smooth transitions
- Correct page titles

**Success Criteria**: 100% of navigation links work

---

#### TC-PUB-003: Product Catalog Page Test

**Priority**: P0
**Test Type**: Functional, UI/UX
**Steps**:
1. Navigate to `/catalog/`
2. Verify page loads
3. Check console for no errors
4. Verify filter section present (search, category, advanced filters)
5. Verify product grid displays (or empty state if no products)
6. Test search functionality:
   - Enter search term "パウチ"
   - Verify results update
7. Test category filter
8. Test sorting (name, price, delivery date)
9. Click on product (if available)
10. Verify product detail page

**Expected Results**:
- Page loads correctly
- Filters work
- Search returns results
- Sorting works
- Product links navigate correctly

**Success Criteria**: All catalog features work

---

#### TC-PUB-004: Quote Simulator Basic Test

**Priority**: P0
**Test Type**: Functional
**Steps**:
1. Navigate to `/quote-simulator/`
2. Verify page loads
3. Check console for no errors
4. Verify step indicator shows "基本仕様" (25%)
5. Select pouch type: "スタンドパウチ"
6. Verify price updates to ¥25/個
7. Set width to 200mm, height to 300mm
8. Verify preview updates
9. Select material: "PET AL"
10. Select thickness: "標準タイプ (~500g)"
11. Click "次へ" button
12. Verify moves to "後加工" step

**Expected Results**:
- Page loads correctly
- All pouch types selectable
- Price updates in real-time
- Preview updates correctly
- Step navigation works

**Success Criteria**: Quote simulator functional

---

#### TC-PUB-005: Quote Simulator Complete Flow

**Priority**: P1
**Test Type**: Functional, Integration
**Steps**:
1. Navigate to `/quote-simulator/`
2. Complete all 4 steps:
   - Step 1: Basic specs (pouch type, size, material, thickness)
   - Step 2: Post-processing (zipper, hang hole, valve, etc.)
   - Step 3: Quantity & printing (quantity, print colors, print location)
   - Step 4: Results (price breakdown, download PDF, request quote)
3. Verify each step validates inputs
4. Verify price updates correctly
5. Verify preview updates
6. Click "PDFをダウンロード" on final step
7. Verify PDF downloads

**Expected Results**:
- All steps accessible
- Validation works
- Price calculation correct
- PDF generation works

**Success Criteria**: Complete quote flow works

---

#### TC-PUB-006: Sample Request Form Test

**Priority**: P0
**Test Type**: Functional, Form Validation
**Steps**:
1. Navigate to `/samples/`
2. Verify page loads
3. Check console for no errors
4. Verify sample selection (6 product types)
5. Select up to 5 samples:
   - Click "ソフトパウチ pouch"
   - Click "スタンドパウチ pouch"
   - Click "ジッパーパウチ pouch"
6. Verify counter updates (3/5)
7. Fill in customer information:
   - Name (kanji): "テスト ユーザー"
   - Name (kana): "テスト ユーザー"
   - Company: "テスト株式会社"
   - Phone: "03-1234-5678"
   - Email: "test@example.com"
   - Postal code: "100-0001"
   - Address: "東京都渋谷区1-2-3"
8. Select delivery type: "一般配送"
9. Fill in delivery address (or check "お客様情報と同じ")
10. Enter message (10+ characters)
11. Check privacy consent checkbox
12. Click "サンプルを選択してください" button

**Expected Results**:
- Form validation works
- Max 5 samples enforced
- Required fields validated
- Form submits successfully
- Success message or redirect

**Success Criteria**: Sample request form functional

---

#### TC-PUB-007: Contact Form Test

**Priority**: P0
**Test Type**: Functional, Form Validation
**Steps**:
1. Navigate to `/contact/`
2. Verify page loads
3. Check console for no errors
4. Fill in customer information:
   - Name (kanji): "テスト 問合せ"
   - Name (kana): "テスト といあわせ"
   - Company: "テスト株式会社"
   - Phone: "03-1234-5678"
   - Email: "inquiry@example.com"
   - Postal code: "100-0001"
   - Address: "東京都渋谷区1-2-3"
5. Select inquiry type: "商品について"
6. Enter message (10+ characters):
   ```
   包装する製品の種類: 食品
   月産数量: 10,000個
   希望の仕様: スタンドパウチ、チャック付き
   ```
7. Click "送信する" button

**Expected Results**:
- Form validation works
- Required fields validated
- Message length validation (10-800 characters)
- Form submits successfully
- Success message displays

**Success Criteria**: Contact form functional

---

#### TC-PUB-008: ROI Calculator Page Test

**Priority**: P1
**Test Type**: Functional
**Steps**:
1. Navigate to `/roi-calculator/`
2. Verify page loads
3. Check console for no errors
4. Enter current packaging cost: 100
5. Enter monthly quantity: 10000
6. Select current pouch type
7. Click "計算する" button
8. Verify calculation results display
9. Verify savings percentage shown

**Expected Results**:
- Calculator functional
- Results accurate
- Clear comparison display

**Success Criteria**: ROI calculator works

---

#### TC-PUB-009: Information Pages Test

**Priority**: P2
**Test Type**: Functional
**Steps**:
1. Test each information page:
   - `/privacy/` - Privacy policy
   - `/terms/` - Terms of service
   - `/legal/` - Specific commercial transaction law
   - `/csr/` - Corporate social responsibility
   - `/about/` - About page
   - `/news/` - News page
   - `/archives/` - Case studies
2. Verify each page loads
3. Check console for no errors
4. Verify content displays
5. Verify responsive design

**Expected Results**:
- All pages load without errors
- Content displays correctly
- Navigation works

**Success Criteria**: All information pages accessible

---

#### TC-PUB-010: Guide Pages Test

**Priority**: P2
**Test Type**: Functional
**Steps**:
1. Test each guide page:
   - `/guide/size/` - Size guide
   - `/guide/color/` - Color guide
   - `/guide/image/` - Image guide
   - `/guide/shirohan/` - Shirohan guide
   - `/guide/environmentaldisplay/` - Environmental display guide
2. Verify each page loads
3. Check console for no errors
4. Verify guide content displays

**Expected Results**:
- All guide pages load
- Content displays correctly
- Images/charts visible

**Success Criteria**: All guide pages accessible

---

### Phase 2: Authentication Flows

#### TC-AUTH-001: User Registration Test

**Priority**: P0
**Test Type**: Functional, Form Validation
**Steps**:
1. Navigate to `/auth/register/`
2. Verify page loads
3. Check console for no errors
4. Fill in registration form:
   - Email: `test-user@example.com`
   - Password: `TestUser123!`
   - Password Confirmation: `TestUser123!`
   - Name (kanji): "テスト ユーザー"
   - Name (kana): "テスト ユーザー"
   - Company Phone: "03-1234-5678"
   - Mobile Phone: "090-1234-5678"
   - Business Type: "法人" (Corporation)
   - Postal Code: "100-0001"
   - Prefecture: "東京都"
   - City: "渋谷区"
   - Street: "1-2-3"
   - Product Category: "化粧品"
   - Acquisition Channel: "検索エンジン"
5. Check privacy consent checkbox
6. Click "会員登録" button

**Expected Results**:
- Form validation works
- Password matching validated
- Required fields validated
- Registration successful
- Redirect to `/auth/pending/` or success message

**Success Criteria**: User registration functional

---

#### TC-AUTH-002: Registration Validation Test

**Priority**: P1
**Test Type**: Form Validation
**Steps**:
1. Navigate to `/auth/register/`
2. Test validation errors:
   - Submit with empty email → error
   - Submit with invalid email → error
   - Submit with password < 8 chars → error
   - Submit with mismatched passwords → error
   - Submit with empty name fields → error
   - Submit with empty postal code → error
   - Submit without privacy consent → error
3. Verify each error message displays correctly
4. Verify error messages are in Japanese
5. Verify button disabled until form valid

**Expected Results**:
- All validation errors display
- Error messages clear and helpful
- Button state updates correctly

**Success Criteria**: All validation works

---

#### TC-AUTH-003: User Login Test

**Priority**: P0
**Test Type**: Functional
**Steps**:
1. Navigate to `/auth/signin/`
2. Verify page loads
3. Check console for no errors
4. Enter email: `test-user@example.com`
5. Enter password: `TestUser123!`
6. Click "ログイン" button

**Expected Results**:
- Login successful
- Redirect to `/member/dashboard/`
- Session established
- User info displays in header/sidebar

**Success Criteria**: User login functional

---

#### TC-AUTH-004: Login Validation Test

**Priority**: P1
**Test Type**: Form Validation
**Steps**:
1. Navigate to `/auth/signin/`
2. Test validation:
   - Submit with empty email → error
   - Submit with invalid email → error
   - Submit with empty password → error
3. Test authentication errors:
   - Enter wrong email → error message
   - Enter wrong password → error message
   - Enter unapproved email → pending message
4. Verify error messages display correctly

**Expected Results**:
- Validation errors display
- Authentication errors display
- Error messages clear

**Success Criteria**: All validation works

---

#### TC-AUTH-005: Logout Test

**Priority**: P0
**Test Type**: Functional
**Steps**:
1. Login as test user
2. Verify logged in state
3. Navigate to `/auth/signout/` or click logout button
4. Verify logout successful
5. Verify redirect to homepage or login page
6. Verify session cleared
7. Verify protected pages redirect to login

**Expected Results**:
- Logout successful
- Session cleared
- Protected pages inaccessible

**Success Criteria**: Logout functional

---

### Phase 3: Member Portal Tests

#### TC-MEM-001: Member Dashboard Test

**Priority**: P0
**Test Type**: Functional, UI/UX
**Precondition**: Logged in as member
**Steps**:
1. Navigate to `/member/dashboard/`
2. Verify page loads
3. Check console for no errors
4. Verify dashboard widgets display:
   - Recent orders
   - Recent quotations
   - Pending actions
   - Notifications
5. Verify sidebar navigation present
6. Verify user profile info displays
7. Click on each navigation item
8. Verify navigation works

**Expected Results**:
- Dashboard loads correctly
- All widgets display
- Navigation functional
- No console errors

**Success Criteria**: Member dashboard functional

---

#### TC-MEM-002: Member Orders List Test

**Priority**: P0
**Test Type**: Functional
**Precondition**: Logged in as member
**Steps**:
1. Navigate to `/member/orders/`
2. Verify page loads
3. Check console for no errors
4. Verify order list displays (or empty state)
5. Verify filters work (status, date range)
6. Verify sorting works
7. Click on order (if available)
8. Verify order detail page loads

**Expected Results**:
- Order list displays correctly
- Filters work
- Order detail page accessible

**Success Criteria**: Order list functional

---

#### TC-MEM-003: Order Detail Page Test

**Priority**: P0
**Test Type**: Functional
**Precondition**: Logged in as member with orders
**Steps**:
1. Navigate to order detail page `/member/orders/[id]/`
2. Verify page loads
3. Check console for no errors
4. Verify order information displays:
   - Order number
   - Status badge
   - Order items
   - Total amount
   - Timeline/progress
5. Verify actions available based on status:
   - Cancel order (if pending)
   - Upload files (if in data receipt stage)
   - Approve design (if in approval stage)
   - View tracking (if shipped)
6. Test available actions

**Expected Results**:
- All order info displays
- Actions available based on status
- Actions work correctly

**Success Criteria**: Order detail page functional

---

#### TC-MEM-004: Data Receipt Upload Test

**Priority**: P0
**Test Type**: Functional, Integration
**Precondition**: Logged in as member with order in data receipt stage
**Steps**:
1. Navigate to `/member/orders/[id]/data-receipt/`
2. Verify page loads
3. Check console for no errors
4. Verify upload zone displays
5. Test drag-drop file upload:
   - Drag valid file (PDF/AI/PSD)
   - Drop in upload zone
6. Verify file uploads
7. Verify validation passes
8. Verify file appears in list
9. Verify status updates to "uploaded"
10. Try uploading invalid file (EXE)
11. Verify error message

**Expected Results**:
- File upload works
- Drag-drop functional
- Validation works
- Invalid files rejected

**Success Criteria**: Data receipt upload functional

---

#### TC-MEM-005: Customer Approval Test

**Priority**: P0
**Test Type**: Functional, Workflow
**Precondition**: Logged in as member with order awaiting approval
**Steps**:
1. Navigate to order detail page
2. Verify "Customer Approval" section displays
3. Verify design files visible
4. Test approve action:
   - Click "承認する" (Approve) button
   - Enter comment (optional)
   - Confirm approval
5. Verify success message
6. Verify order status updates
7. Test reject action (if available):
   - Click "差し戻し" (Reject) button
   - Enter reason
   - Confirm rejection
8. Verify status updates

**Expected Results**:
- Approval section displays
- Approve action works
- Reject action works
- Status updates correctly

**Success Criteria**: Customer approval functional

---

#### TC-MEM-006: Quotations List Test

**Priority**: P0
**Test Type**: Functional
**Precondition**: Logged in as member
**Steps**:
1. Navigate to `/member/quotations/`
2. Verify page loads
3. Check console for no errors
4. Verify quotation list displays
5. Verify filters work (status, date range)
6. Verify sorting works
7. Click on quotation
8. Verify quotation detail page loads

**Expected Results**:
- Quotation list displays
- Filters work
- Detail page accessible

**Success Criteria**: Quotation list functional

---

#### TC-MEM-007: Quotation Detail & Convert to Order Test

**Priority**: P0
**Test Type**: Functional, Workflow
**Precondition**: Logged in as member with approved quotation
**Steps**:
1. Navigate to quotation detail page `/member/quotations/[id]/`
2. Verify page loads
3. Verify quotation info displays
4. Verify quotation items display
5. Verify total amount displays
6. Click "注文に変換" (Convert to Order) button
7. Verify confirmation modal displays
8. Confirm conversion
9. Verify success message
10. Verify redirect to new order

**Expected Results**:
- Quotation detail displays
- Convert action works
- Order created
- Redirect successful

**Success Criteria**: Quotation conversion functional

---

### Phase 4: Admin Dashboard Tests

#### TC-ADM-001: Admin Dashboard Test

**Priority**: P0
**Test Type**: Functional, UI/UX
**Precondition**: Logged in as admin
**Steps**:
1. Navigate to `/admin/dashboard/`
2. Verify page loads
3. Check console for no errors
4. Verify dashboard widgets display:
   - Statistics (orders, quotations, revenue)
   - Recent orders
   - Pending approvals
   - Production status
   - Low inventory alerts
5. Verify charts/graphs render
6. Verify date range filters work

**Expected Results**:
- Dashboard loads correctly
- All widgets display
- Charts render
- Filters work

**Success Criteria**: Admin dashboard functional

---

#### TC-ADM-002: Admin Orders List Test

**Priority**: P0
**Test Type**: Functional
**Precondition**: Logged in as admin
**Steps**:
1. Navigate to `/admin/orders/`
2. Verify page loads
3. Check console for no errors
4. Verify order list displays
5. Verify filters work:
   - Status
   - Date range
   - Customer
6. Verify sorting works
7. Verify search works
8. Click on order
9. Verify order detail page loads

**Expected Results**:
- Order list displays
- All filters work
- Detail page accessible

**Success Criteria**: Admin order list functional

---

#### TC-ADM-003: Admin Order Detail & Status Update Test

**Priority**: P0
**Test Type**: Functional, Workflow
**Precondition**: Logged in as admin
**Steps**:
1. Navigate to order detail page `/admin/orders/[id]/`
2. Verify page loads
3. Verify order info displays
4. Verify timeline/progress displays
5. Test status update:
   - Click status dropdown
   - Select new status
   - Enter notes
   - Click "更新" button
6. Verify success message
7. Verify status updates
8. Verify timeline updates

**Expected Results**:
- Order detail displays
- Status update works
- Timeline updates

**Success Criteria**: Order status update functional

---

#### TC-ADM-004: Data Receipt Review Test

**Priority**: P0
**Test Type**: Functional, Workflow
**Precondition**: Logged in as admin with order in data receipt stage
**Steps**:
1. Navigate to order detail page
2. Verify uploaded files display
3. Click on file to preview
4. Verify preview modal opens
5. Review file contents
6. Test approve action:
   - Click "承認" button
   - Enter notes
   - Confirm
7. Verify status updates to "inspection" or next stage
8. Test reject action:
   - Upload new file for another order
   - Click "差し戻し" button
   - Enter reason
   - Confirm
9. Verify status updates

**Expected Results**:
- File preview works
- Approve action works
- Reject action works
- Status updates correctly

**Success Criteria**: Data receipt review functional

---

#### TC-ADM-005: Production Tracking Test

**Priority**: P0
**Test Type**: Functional, Workflow
**Precondition**: Logged in as admin
**Steps**:
1. Navigate to `/admin/production/`
2. Verify page loads
3. Verify production jobs list displays
4. Verify filters work (stage, priority)
5. Click on production job
6. Verify production detail page loads
7. Verify 9-stage progress displays:
   - Data Received
   - Inspection
   - Design
   - Plate Making
   - Printing
   - Surface Finishing
   - Die Cutting
   - Lamination
   - Final Inspection
8. Test stage update:
   - Click next stage
   - Enter notes
   - Confirm
9. Verify progress updates

**Expected Results**:
- Production list displays
- All 9 stages visible
- Stage update works
- Progress percentage updates

**Success Criteria**: Production tracking functional

---

#### TC-ADM-006: Shipment Management Test

**Priority**: P0
**Test Type**: Functional, Workflow
**Precondition**: Logged in as admin with shipped order
**Steps**:
1. Navigate to `/admin/orders/[id]/`
2. Verify order in "shipped" status
3. Click "出荷情報を追加" button
4. Enter shipment info:
   - Carrier: "Yamato Transport"
   - Tracking number: "1234567890"
   - Shipping date
   - Estimated delivery date
5. Click "保存" button
6. Verify shipment saved
7. Verify tracking link displays
8. Test tracking update:
   - Update status to "delivered"
   - Enter delivery date
   - Save
9. Verify order status updates to "delivered"

**Expected Results**:
- Shipment form works
- Tracking number saved
- Tracking link works
- Status updates correctly

**Success Criteria**: Shipment management functional

---

#### TC-ADM-007: Member Approvals Test

**Priority**: P0
**Test Type**: Functional, Workflow
**Precondition**: Logged in as admin
**Steps**:
1. Navigate to `/admin/approvals/`
2. Verify page loads
3. Verify pending approvals list displays
4. Click on pending member
5. Verify member info displays
6. Test approve action:
   - Click "承認" button
   - Verify confirmation
   - Confirm approval
7. Verify member status updates to "ACTIVE"
8. Verify email sent to member
9. Test reject action:
   - Click another pending member
   - Click "拒否" button
   - Enter reason
   - Confirm rejection
10. Verify member status updates to "REJECTED"

**Expected Results**:
- Pending list displays
- Approve action works
- Reject action works
- Status updates correctly

**Success Criteria**: Member approval functional

---

### Workflow Tests (9-Stage Process)

#### TC-WF-001: Complete Order Workflow Test

**Priority**: P0
**Test Type**: End-to-End, Integration
**Steps**:

**Stage 1: Quotation**
1. Member navigates to `/quote-simulator/`
2. Creates quotation (all 4 steps)
3. Downloads PDF quotation
4. Submits quotation request

**Stage 2: Quotation Approval**
5. Admin logs in
6. Navigates to `/admin/quotations/`
7. Reviews quotation
8. Approves quotation
9. System sends email to member

**Stage 3: Order Creation**
10. Member logs in
11. Navigates to `/member/quotations/`
12. Clicks on approved quotation
13. Clicks "注文に変換" button
14. Confirms conversion
15. Order created

**Stage 4: Data Receipt**
16. Admin assigns order to production
17. Status updates to "data_receipt"
18. Member navigates to `/member/orders/[id]/data-receipt/`
19. Uploads design files (PDF/AI)
20. Admin reviews files
21. Admin approves files

**Stage 5: Korea Corrections (Optional)**
22. If corrections needed, admin creates correction request
23. Korea team uploads corrected files
24. Admin reviews corrected files

**Stage 6: Customer Approval**
25. Admin uploads spec sheet
26. Member navigates to order detail
27. Reviews design files
28. Approves design

**Stage 7: Production**
29. Admin tracks production through 9 stages
30. Each stage update:
    - Inspection
    - Design
    - Plate Making
    - Printing
    - Surface Finishing
    - Die Cutting
    - Lamination
    - Final Inspection

**Stage 8: Shipment**
31. Production completes
32. Admin creates shipment:
    - Enter carrier (Yamato)
    - Enter tracking number
    - Enter shipping date
33. Order status updates to "shipped"
34. System sends email with tracking info

**Stage 9: Delivery**
35. Admin updates delivery status
36. Order status updates to "delivered"
37. System sends delivery confirmation email
38. Member can view order history

**Expected Results**:
- All 9 stages complete successfully
- Status updates correctly at each stage
- Emails sent at key stages
- Files upload/download correctly
- PDFs generate correctly

**Success Criteria**: Complete workflow functional

---

### Database Validation Tests

#### TC-DB-001: Tables Existence Test

**Priority**: P0
**Test Type**: Integration
**Steps**:
1. Connect to Supabase database
2. Verify all core tables exist:
   - profiles
   - orders
   - quotations
   - order_items
   - quotation_items
   - production_orders
   - shipments
   - sample_requests
   - sample_items
   - inquiries
   - files
   - design_revisions
   - korea_corrections
   - announcements
   - delivery_addresses
   - billing_addresses
   - stage_action_history
   - shipment_tracking_events
   - korea_transfer_log

**Expected Results**:
- All tables exist
- All tables have correct columns

**Success Criteria**: All tables present

---

#### TC-DB-002: Indexes Validation Test

**Priority**: P1
**Test Type**: Integration
**Steps**:
1. Query database for all indexes
2. Verify 28+ performance indexes exist:
   - idx_quotations_user_status_created
   - idx_orders_user_status_created
   - idx_production_orders_stage_completion
   - idx_shipments_tracking_status
   - (and 24+ more)
3. Verify index columns correct
4. Verify partial indexes have correct WHERE clauses

**Expected Results**:
- All indexes exist
- Index definitions correct

**Success Criteria**: All indexes present and valid

---

#### TC-DB-003: Foreign Keys Validation Test

**Priority**: P1
**Test Type**: Integration
**Steps**:
1. Query database for foreign key constraints
2. Verify 19 foreign keys exist:
   - design_revisions.order_id → orders.id
   - design_revisions.quotation_id → quotations.id
   - files.order_id → orders.id
   - files.quotation_id → quotations.id
   - (and 15+ more)
3. Verify ON DELETE behaviors correct

**Expected Results**:
- All foreign keys exist
- Cascade behaviors correct

**Success Criteria**: All foreign keys valid

---

#### TC-DB-004: RLS Policies Validation Test

**Priority**: P0
**Test Type**: Security, Integration
**Steps**:
1. Query RLS policies for each table
2. Verify policies exist for:
   - profiles (members can only see their own)
   - orders (members can only see their own)
   - quotations (members can only see their own)
   - (all tables)
3. Test RLS enforcement:
   - Login as member
   - Query orders table
   - Verify only member's orders returned
   - Try to access another user's order
   - Verify access denied

**Expected Results**:
- All tables have RLS policies
- RLS enforced correctly
- No data leakage

**Success Criteria**: RLS policies functional

---

### API Endpoint Tests

#### TC-API-001: Auth Endpoints Test

**Priority**: P0
**Test Type**: Integration
**Steps**:
1. Test `POST /api/auth/register`:
   - Send valid registration data
   - Verify 201 response
   - Verify user created in database
2. Test `POST /api/auth/signin`:
   - Send valid credentials
   - Verify 200 response
   - Verify token returned
3. Test `GET /api/auth/session`:
   - Send request with token
   - Verify 200 response
   - Verify session data returned
4. Test `POST /api/auth/signout`:
   - Send request with token
   - Verify 200 response
   - Verify session invalidated

**Expected Results**:
- All endpoints respond correctly
- Tokens work
- Session management works

**Success Criteria**: All auth endpoints functional

---

#### TC-API-002: File Upload Endpoints Test

**Priority**: P0
**Test Type**: Integration, Security
**Steps**:
1. Test `POST /api/b2b/files/upload`:
   - Upload valid file (PDF)
   - Verify 200 response
   - Verify file stored
   - Verify validation passed
2. Test file size limit:
   - Upload file > 10MB
   - Verify 413 error
   - Verify error message
3. Test file type validation:
   - Upload invalid file (EXE)
   - Verify 400 error
   - Verify error message
4. Test magic number validation:
   - Rename EXE to PDF
   - Upload
   - Verify 400 error
   - Verify magic number validation worked

**Expected Results**:
- Valid files upload
- Size limit enforced
- Type validation works
- Magic number validation works

**Success Criteria**: File upload secure and functional

---

### Console Error Validation Tests

#### TC-CON-001: Homepage Console Check

**Priority**: P0
**Test Type**: UI/UX, Performance
**Steps**:
1. Navigate to homepage
2. Open browser console
3. Check for errors:
   - JavaScript errors
   - Network errors
   - API errors
   - React errors
4. Check for warnings:
   - Deprecation warnings
   - Performance warnings
5. Note all errors/warnings

**Expected Results**:
- No JavaScript errors
- No network errors (404, 500)
- No API errors
- Only acceptable warnings (React DevTools, etc.)

**Success Criteria**: Zero critical errors

---

#### TC-CON-002: All Pages Console Check

**Priority**: P0
**Test Type**: UI/UX, Performance
**Steps**:
1. Create list of all public pages
2. For each page:
   - Navigate to page
   - Check console for errors
   - Note any errors
3. Create list of all member pages
4. Login as member
5. For each member page:
   - Navigate to page
   - Check console for errors
   - Note any errors
6. Create list of all admin pages
7. Login as admin
8. For each admin page:
   - Navigate to page
   - Check console for errors
   - Note any errors

**Expected Results**:
- No pages have console errors
- All pages load cleanly

**Success Criteria**: 100% pages error-free

---

### Security Tests

#### TC-SEC-001: File Upload Security Test

**Priority**: P0
**Test Type**: Security
**Steps**:
1. Test malicious file upload:
   - Create test file with XSS payload
   - Upload to `/member/orders/[id]/data-receipt/`
   - Verify file rejected
2. Test executable file:
   - Create EXE file
   - Rename to .pdf
   - Upload
   - Verify magic number validation rejects
3. Test file size limit:
   - Create 11MB file
   - Upload
   - Verify size limit enforced
4. Test path traversal:
   - Upload file with "../" in name
   - Verify path traversal blocked

**Expected Results**:
- All malicious files rejected
- Magic number validation works
- Size limit enforced
- Path traversal blocked

**Success Criteria**: All security checks pass

---

#### TC-SEC-002: CSRF Protection Test

**Priority**: P0
**Test Type**: Security
**Steps**:
1. Navigate to login page
2. Capture CSRF token
3. Submit login without token
4. Verify 403 error
5. Submit login with invalid token
6. Verify 403 error
7. Test POST to API without token
8. Verify 403 error

**Expected Results**:
- CSRF protection enforced
- All requests without valid token rejected

**Success Criteria**: CSRF protection functional

---

#### TC-SEC-003: Authorization Test

**Priority**: P0
**Test Type**: Security
**Steps**:
1. Login as member
2. Try to access admin pages:
   - `/admin/dashboard/`
   - `/admin/orders/`
   - `/admin/production/`
3. Verify redirect or 403 error
4. Try to access another user's orders
5. Verify access denied
6. Logout
7. Try to access member pages without auth
8. Verify redirect to login

**Expected Results**:
- Admin pages inaccessible to members
- User data isolated
- Protected pages require auth

**Success Criteria**: Authorization enforced

---

## Test Execution Guidelines

### Running Tests

**Run All Tests**:
```bash
npx playwright test
```

**Run Specific Phase**:
```bash
npx playwright test tests/e2e/phase-1-public/
npx playwright test tests/e2e/phase-2-auth/
npx playwright test tests/e2e/phase-3-member/
npx playwright test tests/e2e/phase-4-admin/
```

**Run Specific Test File**:
```bash
npx playwright test tests/e2e/phase-1-public/01-home-navigation.spec.ts
```

**Run with UI**:
```bash
npx playwright test --ui
```

**Run with Debugging**:
```bash
npx playwright test --debug
```

**Run Specific Test**:
```bash
npx playwright test -g "TC-PUB-001"
```

### Test Data Setup

**Before running tests, ensure**:
1. Supabase database is running
2. Test users exist in database
3. Test data is loaded (quotations, orders, etc.)
4. Environment variables are set

**Seed Test Data**:
```bash
npx playwright test tests/seed.spec.ts
```

### Test Reporting

**HTML Report**:
```bash
npx playwright show-report
```

**JSON Report**:
```bash
npx playwright test --reporter=json
```

**JUnit Report**:
```bash
npx playwright test --reporter=junit
```

---

## Success Criteria

### Overall Success Criteria

| Category | Target | Current |
|----------|--------|---------|
| Test Pass Rate | 95%+ | TBD |
| P0 Tests Pass Rate | 100% | TBD |
| Console Error Rate | 0% | TBD |
| Page Accessibility | 100% | TBD |
| API Success Rate | 95%+ | TBD |
| Performance Target | 95%+ pages < 3s | TBD |

### Go/No-Go Criteria

**Go Live If**:
- ✅ All P0 tests passing
- ✅ Test pass rate ≥ 95%
- ✅ Zero console errors
- ✅ All critical workflows functional
- ✅ No security vulnerabilities
- ✅ Performance targets met

**Do Not Go Live If**:
- ❌ Any P0 test failing
- ❌ Test pass rate < 90%
- ❌ Console errors present
- ❌ Critical workflow broken
- ❌ Security vulnerabilities found
- ❌ Performance significantly degraded

---

## Appendix

### Test Case Template

```markdown
#### TC-XXX-XXX: [Test Case Name]

**Priority**: P0/P1/P2/P3
**Test Type**: Functional/Integration/Security/Performance
**Precondition**: [What must be true before test]
**Steps**:
1. [Action 1]
2. [Action 2]
...

**Expected Results**:
- [Result 1]
- [Result 2]
...

**Success Criteria**: [What defines success]
```

### Bug Report Template

```markdown
**Bug ID**: BUG-XXX
**Test Case**: TC-XXX-XXX
**Priority**: P0/P1/P2/P3
**Summary**: [Brief description]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
...

**Actual Result**: [What happened]
**Expected Result**: [What should happen]
**Environment**: [Browser, OS, etc.]
**Screenshots**: [Attach if applicable]
**Console Errors**: [Paste if any]
```

### Test Execution Log

| Date | Tester | Phase | Pass | Fail | Skip | Notes |
|------|--------|-------|------|------|------|-------|
| 2026-01-12 | Test User | Phase 1 | 10 | 1 | 0 | TC-PUB-011 fails - language switch not implemented |
| 2026-01-13 | Test User | Phase 2 | 7 | 0 | 0 | All auth tests passing |
| ... | ... | ... | ... | ... | ... | ... |

---

**Document History**:

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-12 | Claude AI | Initial comprehensive test plan |

---

**Notes**:
- This test plan covers 150+ test scenarios across all application phases
- Prioritize P0 tests for initial validation
- Execute tests in phase order (1 → 5)
- Document all bugs and issues
- Update test plan as application evolves
- Regular test execution recommended (weekly/bi-weekly)
