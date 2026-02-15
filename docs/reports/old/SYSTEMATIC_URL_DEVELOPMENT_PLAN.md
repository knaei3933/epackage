# Systematic URL Development Plan - Epackage Lab
**Generated:** 2026-01-05
**Total Pages:** 82 pages
**Purpose:** Comprehensive verification and development of all website URLs

---

## Status Legend
- **TODO** - Not started
- **IN_PROGRESS** - Currently being worked on
- **DONE** - Completed and verified
- **BLOCKED** - Waiting for dependency
- **SKIP** - Intentionally skipped

---

## Priority 1: Authentication Flow (Critical)

### 1.1 Sign In Page
**URL:** `/auth/signin`
**Status:** TODO
**Dependencies:** None
**Estimated Time:** 2 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `profiles` table access for role/status lookup
  - [ ] Test query: `SELECT role, status FROM profiles WHERE id = ?`
  - [ ] Verify RLS policies allow authenticated reads
  - [ ] Test with admin user credentials
  - [ ] Test with member user credentials

- [ ] **API Endpoint**
  - [ ] Verify `POST /api/auth/signin` exists and responds
  - [ ] Test Supabase Auth.signInWithPassword() integration
  - [ ] Verify httpOnly cookie setting (sb-access-token, sb-refresh-token)
  - [ ] Test error responses for invalid credentials
  - [ ] Verify profile lookup after successful auth

- [ ] **Button/Action Logic**
  - [ ] Test [로그인] button form submission
  - [ ] Verify role-based redirects:
    - [ ] ADMIN → `/admin/dashboard`
    - [ ] MEMBER → `/member/dashboard`
  - [ ] Test [비밀번호 찾기] → `/auth/forgot-password`
  - [ ] Test [회원가입] → `/auth/register`
  - [ ] Test server error message display

- [ ] **State Management**
  - [ ] Verify AuthContext.signIn() function
  - [ ] Test isSubmitting state during login
  - [ ] Test showPassword toggle
  - [ ] Test serverError state and display
  - [ ] Verify context updates after successful login

- [ ] **Form Processing**
  - [ ] Verify loginSchema (Zod) validation:
    - [ ] email format validation
    - [ ] password required validation
    - [ ] remember checkbox handling
  - [ ] Test form submission with credentials: 'include'
  - [ ] Verify React Hook Form integration

- [ ] **Console Error Detection**
  - [ ] Run browser console check during login flow
  - [ ] Fix any unhandled promise rejections
  - [ ] Fix any missing error boundaries
  - [ ] Check for Supabase client initialization errors
  - [ ] Verify no middleware route protection errors

---

### 1.2 Register Page
**URL:** `/auth/register`
**Status:** TODO
**Dependencies:** None
**Estimated Time:** 4 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `profiles` table insert permissions
  - [ ] Verify `auth.users` table access via Supabase Auth
  - [ ] Test profile creation with status: 'PENDING'
  - [ ] Verify 18-field data insertion
  - [ ] Test unique email constraint

- [ ] **API Endpoint**
  - [ ] Verify `POST /api/auth/register` endpoint
  - [ ] Test Supabase Auth.signUp() integration
  - [ ] Verify profile creation after auth signup
  - [ ] Test duplicate email handling
  - [ ] Verify default status assignment

- [ ] **Button/Action Logic**
  - [ ] Test [가입하기] button with 18-field form
  - [ ] Verify success message display
  - [ ] Verify redirect to login page after success
  - [ ] Test error message display for validation failures
  - [ ] Test form reset after successful submission

- [ ] **State Management**
  - [ ] Verify AuthContext.signUp() function
  - [ ] Test isSubmitting state during registration
  - [ ] Test form validation state
  - [ ] Verify password confirmation matching
  - [ ] Test multi-step form state (if applicable)

- [ ] **Form Processing**
  - [ ] Verify registrationSchema (Zod) - all 18 fields:
    - [ ] Names: kanjiLastName, kanjiFirstName (required)
    - [ ] Kana: kanaLastName, kanaFirstName (katakana validation)
    - [ ] Contact: email, corporatePhone, personalPhone
    - [ ] Business: businessType, companyName, legalEntityNumber, position, department
    - [ ] Address: postalCode, prefecture, city, street
    - [ ] Other: productCategory, acquisitionChannel
  - [ ] Test Japanese phone number validation
  - [ ] Test katakana validation for kana fields
  - [ ] Test postal code format validation

- [ ] **Console Error Detection**
  - [ ] Check console during form validation
  - [ ] Verify no Zod validation errors
  - [ ] Fix any unhandled form submission errors
  - [ ] Check for React Hook Form warnings
  - [ ] Verify no memory leaks in form state

---

### 1.3 Pending Approval Page
**URL:** `/auth/pending`
**Status:** TODO
**Dependencies:** Auth middleware
**Estimated Time:** 1 hour

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `profiles` table read access
  - [ ] Test status check query
  - [ ] Verify RLS policies for pending users

- [ ] **API Endpoint**
  - [ ] Verify no API calls needed (static page)
  - [ ] Test session validation on page load

- [ ] **Button/Action Logic**
  - [ ] Test [로그인페이지로] → `/auth/signin`
  - [ ] Test [홈으로] → `/`
  - [ ] Verify user cannot access other pages while pending

- [ ] **State Management**
  - [ ] Verify authentication state check
  - [ ] Test status display from profile
  - [ ] Verify page protection middleware

- [ ] **Form Processing**
  - [ ] None (static page)

- [ ] **Console Error Detection**
  - [ ] Check for middleware errors
  - [ ] Verify no unauthorized access warnings
  - [ ] Test page load with pending status

---

### 1.4 Sign Out Page
**URL:** `/auth/signout`
**Status:** TODO
**Dependencies:** Auth context
**Estimated Time:** 1 hour

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] None (client-side operation)

- [ ] **API Endpoint**
  - [ ] Verify `POST /api/auth/signout` endpoint
  - [ ] Test Supabase Auth session termination
  - [ ] Verify httpOnly cookie deletion
  - [ ] Test signout on page load

- [ ] **Button/Action Logic**
  - [ ] Verify automatic signout on page load
  - [ ] Test AuthContext.sign() function
  - [ ] Verify localStorage cleanup
  - [ ] Test 1.5s redirect to `/`

- [ ] **State Management**
  - [ ] Verify AuthContext state reset
  - [ ] Test cleanup of all auth-related state
  - [ ] Verify context updates

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Check for signout errors
  - [ ] Verify cleanup complete
  - [ ] Test redirect after signout

---

### 1.5 Suspended Account Page
**URL:** `/auth/suspended`
**Status:** TODO
**Dependencies:** Auth middleware
**Estimated Time:** 0.5 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify profile status check

- [ ] **API Endpoint**
  - [ ] None needed

- [ ] **Button/Action Logic**
  - [ ] Test [관리자에게 문의] mailto link
  - [ ] Test [홈으로] redirect

- [ ] **State Management**
  - [ ] Verify suspended status detection

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Verify no access beyond this page

---

### 1.6 Auth Error Page
**URL:** `/auth/error`
**Status:** TODO
**Dependencies:** None
**Estimated Time:** 0.5 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] None

- [ ] **API Endpoint**
  - [ ] None

- [ ] **Button/Action Logic**
  - [ ] Test navigation buttons

- [ ] **State Management**
  - [ ] Verify error parameter display

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Verify error logging

---

## Priority 2: Core Business Features

### 2.1 Member Dashboard
**URL:** `/member/dashboard`
**Status:** TODO
**Dependencies:** Authentication
**Estimated Time:** 4 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `profiles` table access
  - [ ] Verify `orders` table statistics query
  - [ ] Verify `quotations` table statistics query
  - [ ] Verify `sample_requests` table access
  - [ ] Verify `inquiries` table access
  - [ ] Verify `announcements` table access
  - [ ] Verify `contracts` table for B2B
  - [ ] Verify `admin_notifications` table access
  - [ ] Test getDashboardStats() function
  - [ ] Verify createServiceClient() initialization

- [ ] **API Endpoint**
  - [ ] Verify dashboard stats calculation
  - [ ] Test data aggregation queries
  - [ ] Verify error handling for missing data
  - [ ] Test response format

- [ ] **Button/Action Logic**
  - [ ] Test statistics card navigation
  - [ ] Test [모두 보기] buttons
  - [ ] Test [상세 보기] navigation
  - [ ] Verify navigation to specific sections

- [ ] **State Management**
  - [ ] Verify requireAuth() function
  - [ ] Test Server Component (RSC) rendering
  - [ ] Verify authentication check on page load
  - [ ] Test data refresh

- [ ] **Form Processing**
  - [ ] None (dashboard view)

- [ ] **Console Error Detection**
  - [ ] Check for Supabase client errors
  - [ ] Verify no missing data errors
  - [ ] Test with zero data scenario
  - [ ] Check for authentication errors

---

### 2.2 Member Orders List
**URL:** `/member/orders`
**Status:** TODO
**Dependencies:** Dashboard
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `orders` table access
  - [ ] Verify `order_items` table join
  - [ ] Verify `shipments` table join
  - [ ] Test filtering queries by status
  - [ ] Test search queries

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/member/orders?status={status}`
  - [ ] Test query parameters: status, searchTerm, dateRange, sortBy, sortOrder
  - [ ] Test pagination
  - [ ] Verify response format

- [ ] **Button/Action Logic**
  - [ ] Test [+새 견적] → `/quote-simulator`
  - [ ] Test [상세 보기] → `/member/orders/{id}`
  - [ ] Test status filters (all, pending, data_received, processing, manufacturing, shipped, delivered)
  - [ ] Test search functionality
  - [ ] Test date range filters (7일/30일/90일/전체)
  - [ ] Test sorting (날짜/금액순)

- [ ] **State Management**
  - [ ] Verify orders state management
  - [ ] Test filteredOrders state
  - [ ] Test filters state
  - [ ] Verify state updates on filter change

- [ ] **Form Processing**
  - [ ] Test search Input
  - [ ] Test Select dropdowns (dateRange, sortBy, sortOrder)
  - [ ] Verify form state persistence

- [ ] **Console Error Detection**
  - [ ] Check for query errors
  - [ ] Test with empty order list
  - [ ] Verify filter state management
  - [ ] Check for navigation errors

---

### 2.3 Member Orders Detail
**URL:** `/member/orders/[id]`
**Status:** TODO
**Dependencies:** Orders List
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `orders` table detail query
  - [ ] Verify `order_items` table join
  - [ ] Verify `delivery_addresses` table access
  - [ ] Verify `billing_addresses` table access
  - [ ] Verify `shipments` table join
  - [ ] Verify `production_logs` table access
  - [ ] Verify `files` table join
  - [ ] Verify `order_status_history` table join

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/member/orders/{id}`
  - [ ] Verify `GET /api/member/orders/{id}/production-data`
  - [ ] Test error handling for invalid order ID
  - [ ] Test response format

- [ ] **Button/Action Logic**
  - [ ] Test [뒤로가기] navigation
  - [ ] Test [PDF 다운로드] generation
  - [ ] Test [데이터 전송] for B2B
  - [ ] Test [재주문] functionality
  - [ ] Test [취소] button (if applicable)

- [ ] **State Management**
  - [ ] Verify order state
  - [ ] Test productionData state
  - [ ] Verify activeTab state for detail sections
  - [ ] Test state updates

- [ ] **Form Processing**
  - [ ] None (view-only)

- [ ] **Console Error Detection**
  - [ ] Check for ID parsing errors
  - [ ] Test with invalid order ID
  - [ ] Verify no missing data errors
  - [ ] Check PDF generation errors

---

### 2.4 Quotations List
**URL:** `/member/quotations`
**Status:** TODO
**Dependencies:** Dashboard
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `quotations` table access
  - [ ] Verify `quotation_items` table join
  - [ ] Test status filtering queries

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/member/quotations?status={status}`
  - [ ] Verify `DELETE /api/member/quotations/{id}`
  - [ ] Verify `POST /api/orders/create`
  - [ ] Test all endpoints

- [ ] **Button/Action Logic**
  - [ ] Test [+새 견적] → `/quote-simulator`
  - [ ] Test [상세 보기] → `/member/quotations/{id}`
  - [ ] Test [PDF 다운로드] with generateQuotePDF()
  - [ ] Test [발주하기] order creation modal
  - [ ] Test [삭제] for DRAFT quotations
  - [ ] Test [주문 변환] for APPROVED quotations

- [ ] **State Management**
  - [ ] Verify quotations state
  - [ ] Test selectedStatus state
  - [ ] Verify downloadingQuoteId state
  - [ ] Test showOrderModal state

- [ ] **Form Processing**
  - [ ] Test status filter buttons (radio group)
  - [ ] Verify filter state updates

- [ ] **Console Error Detection**
  - [ ] Check PDF generation errors
  - [ ] Test delete confirmation
  - [ ] Verify order creation flow
  - [ ] Check for state update errors

---

### 2.5 Quotations Detail
**URL:** `/member/quotations/[id]`
**Status:** TODO
**Dependencies:** Quotations List
**Estimated Time:** 2 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `quotations` detail query
  - [ ] Verify `quotation_items` join
  - [ ] Verify `orders` related data

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/member/quotations/{id}`
  - [ ] Test error handling

- [ ] **Button/Action Logic**
  - [ ] Test [뒤로가기]
  - [ ] Test [PDF 다운로드]
  - [ ] Test [주문 변환] → `/member/orders/new?quotationId={id}`
  - [ ] Test [발주하기] for individual items

- [ ] **State Management**
  - [ ] Verify quotation state
  - [ ] Test order state

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Test with invalid quotation ID
  - [ ] Verify navigation parameters

---

### 2.6 Samples Request
**URL:** `/samples`
**Status:** TODO
**Dependencies:** None (public)
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `sample_requests` table insert
  - [ ] Verify `sample_items` table insert (1-5 items)
  - [ ] Verify `products` table for product lookup
  - [ ] Verify `delivery_addresses` table insert (1-5 addresses)
  - [ ] Test sample limit constraint (max 5)

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/products` for product list
  - [ ] Verify `POST /api/samples/request`
  - [ ] Test max 5 samples enforcement
  - [ ] Test max 5 delivery addresses
  - [ ] Verify SendGrid email sending

- [ ] **Button/Action Logic**
  - [ ] Test [샘플 추가] (max 5)
  - [ ] Test [샘플 삭제]
  - [ ] Test [배송지 추가] (max 5)
  - [ ] Test [제출] → success → `/samples/thank-you`

- [ ] **State Management**
  - [ ] Verify items array state
  - [ ] Test addresses array state
  - [ ] Verify isSubmitting state

- [ ] **Form Processing**
  - [ ] Verify sampleRequestSchema (Zod):
    - [ ] items: 1-5 (product_id, quantity)
    - [ ] addresses: 1-5 (name, phone, postalCode, prefecture, city, street)
    - [ ] contactInfo: name, email, phone, company
  - [ ] Test form validation
  - [ ] Test Japanese address validation

- [ ] **Console Error Detection**
  - [ ] Test max sample limit
  - [ ] Test max address limit
  - [ ] Verify form validation errors
  - [ ] Check email sending errors

---

### 2.7 Contact Form
**URL:** `/contact`
**Status:** TODO
**Dependencies:** None (public)
**Estimated Time:** 2 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `inquiries` table insert
  - [ ] Verify `contact_submissions` table insert
  - [ ] Test data insertion

- [ ] **API Endpoint**
  - [ ] Verify `POST /api/contact`
  - [ ] Test rate limiting (10req/15min)
  - [ ] Verify SendGrid email (customer + admin)

- [ ] **Button/Action Logic**
  - [ ] Test [送信] submission
  - [ ] Test success redirect `/contact?success=true`
  - [ ] Test error message display

- [ ] **State Management**
  - [ ] Verify ContactForm state
  - [ ] Test isSubmitting state
  - [ ] Test serverError state

- [ ] **Form Processing**
  - [ ] Verify contactSchema (Zod):
    - [ ] name, email, phone, company
    - [ ] inquiryType, message
    - [ ] Japanese phone validation
  - [ ] Test file attachment (max 10MB)
  - [ ] Verify magic number validation

- [ ] **Console Error Detection**
  - [ ] Test rate limiting
  - [ ] Verify file validation
  - [ ] Check email sending errors

---

## Priority 3: Admin Functionality

### 3.1 Admin Dashboard
**URL:** `/admin/dashboard`
**Status:** TODO
**Dependencies:** Admin authentication
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `orders` table access
  - [ ] Verify `quotations` table access
  - [ ] Verify `sample_requests` table access
  - [ ] Verify `production_orders` table access
  - [ ] Verify `shipments` table access
  - [ ] Test statistics aggregation queries

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/admin/dashboard/statistics?period={days}`
  - [ ] Test period filters (7/30/90 days)
  - [ ] Verify response format

- [ ] **Button/Action Logic**
  - [ ] Test period filter buttons
  - [ ] Test [수동 재시도] on error
  - [ ] Test [페이지 새로고침]

- [ ] **State Management**
  - [ ] Verify SWR data fetching
  - [ ] Test Supabase Realtime updates
  - [ ] Verify error state handling

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Check Realtime connection errors
  - [ ] Test with zero statistics
  - [ ] Verify data refresh

---

### 3.2 Admin Orders
**URL:** `/admin/orders`
**Status:** TODO
**Dependencies:** Admin Dashboard
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `orders` table access
  - [ ] Verify `order_status_history` table
  - [ ] Test status filtering queries

- [ ] **API Endpoint**
  - [ ] Verify direct Supabase client usage
  - [ ] Test data fetching
  - [ ] Verify query optimization

- [ ] **Button/Action Logic**
  - [ ] Test [상태 필터]
  - [ ] Test [단일 상태 변경]
  - [ ] Test [대량 상태 변경]
  - [ ] Test [전체 선택]

- [ ] **State Management**
  - [ ] Verify orders state
  - [ ] Test selectedOrders state
  - [ ] Verify selectedStatus state

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Test batch status updates
  - [ ] Verify no transaction errors

---

### 3.3 Admin Production
**URL:** `/admin/production`
**Status:** TODO
**Dependencies:** Admin Dashboard
**Estimated Time:** 4 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `production_orders` table (9-stage process)
  - [ ] Verify current_stage values:
    - [ ] data_received, inspection, design, plate_making
    - [ ] printing, surface_finishing, die_cutting
    - [ ] lamination, final_inspection
  - [ ] Verify progress_percentage (0-100%)
  - [ ] Test stage progression queries

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/admin/production/jobs`
  - [ ] Verify `PATCH /api/admin/production/jobs`
  - [ ] Test status updates

- [ ] **Button/Action Logic**
  - [ ] Test [필터] by status/stage
  - [ ] Test [새로고침] with mutate()

- [ ] **State Management**
  - [ ] Verify SWR jobs data
  - [ ] Test Supabase Realtime updates
  - [ ] Verify stage transitions

- [ ] **Form Processing**
  - [ ] Test select filter

- [ ] **Console Error Detection**
  - [ ] Test stage transitions
  - [ ] Verify progress calculation
  - [ ] Check Realtime updates

---

### 3.4 Admin Production Detail
**URL:** `/admin/production/[id]`
**Status:** TODO
**Dependencies:** Admin Production
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `production_orders` detail query
  - [ ] Verify `production_stage_actions` table
  - [ ] Test stage history queries

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/admin/production-jobs/{id}`
  - [ ] Verify `PATCH /api/admin/production-jobs/{id}`
  - [ ] Test stage advance/rollback

- [ ] **Button/Action Logic**
  - [ ] Test [다음 스테이지] (handleAdvanceStage)
  - [ ] Test [이전 스테이지] (handleRollbackStage)
  - [ ] Test [새로고침]

- [ ] **State Management**
  - [ ] Verify productionJob state
  - [ ] Test orderDetails state
  - [ ] Verify stageHistory state

- [ ] **Form Processing**
  - [ ] Test rollback reason prompt

- [ ] **Console Error Detection**
  - [ ] Test stage transitions
  - [ ] Verify history recording
  - [ ] Check rollback validation

---

### 3.5 Admin Shipments
**URL:** `/admin/shipments`
**Status:** TODO
**Dependencies:** Admin Dashboard
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `shipments` table
  - [ ] Verify `shipment_tracking_events` table
  - [ ] Verify `orders` table join
  - [ ] Test tracking queries

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/shipments`
  - [ ] Verify `GET /api/shipments/create`
  - [ ] Verify `POST /api/shipments/create`
  - [ ] Verify `POST /api/shipments/{id}/track`
  - [ ] Verify `GET /api/shipments/{id}/label`

- [ ] **Button/Action Logic**
  - [ ] Test [탭 전환] (목록/준비 완료)
  - [ ] Test [필터] (status/carrier/search)
  - [ ] Test [추적 갱신]
  - [ ] Test [송장 다운로드]
  - [ ] Test [배송 생성]

- [ ] **State Management**
  - [ ] Verify shipments state
  - [ ] Test readyOrders state
  - [ ] Verify filters state
  - [ ] Test pagination state

- [ ] **Form Processing**
  - [ ] Test search input
  - [ ] Test select filters (status, carrier)

- [ ] **Console Error Detection**
  - [ ] Test carrier API integration
  - [ ] Verify tracking updates
  - [ ] Check PDF label generation

---

### 3.6 Admin Approvals
**URL:** `/admin/approvals`
**Status:** TODO
**Dependencies:** Admin Dashboard
**Estimated Time:** 2 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `profiles` table (status: PENDING)
  - [ ] Test pending members query

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/admin/approve-member`
  - [ ] Verify `POST /api/admin/approve-member`
  - [ ] Test approve/reject operations

- [ ] **Button/Action Logic**
  - [ ] Test [승인] button
  - [ ] Test [거부] with modal
  - [ ] Test [새로고침]

- [ ] **State Management**
  - [ ] Verify SWR pendingMembers data
  - [ ] Test rejectUserId state
  - [ ] Test rejectReason state
  - [ ] Verify isProcessing state

- [ ] **Form Processing**
  - [ ] Test reject reason textarea

- [ ] **Console Error Detection**
  - [ ] Test approval workflow
  - [ ] Verify email notifications
  - [ ] Check profile status updates

---

### 3.7 Admin Contracts
**URL:** `/admin/contracts`
**Status:** TODO
**Dependencies:** Admin Dashboard
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `contracts` table
  - [ ] Test status values:
    - [ ] DRAFT, SENT, PENDING_SIGNATURE, CUSTOMER_SIGNED
    - [ ] ADMIN_SIGNED, SIGNED, ACTIVE, COMPLETED, CANCELLED

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/admin/contracts/workflow?status={status}`

- [ ] **Button/Action Logic**
  - [ ] Test [필터] by status

- [ ] **State Management**
  - [ ] Verify SWR contracts data
  - [ ] Test Supabase Realtime updates

- [ ] **Form Processing**
  - [ ] Test select filter

- [ ] **Console Error Detection**
  - [ ] Verify status transitions
  - [ ] Check contract workflow

---

### 3.8 Admin Contracts Detail
**URL:** `/admin/contracts/[id]`
**Status:** TODO
**Dependencies:** Admin Contracts
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `contracts` detail query
  - [ ] Verify `orders` table join

- [ ] **API Endpoint**
  - [ ] Verify direct Supabase client
  - [ ] Verify `POST /api/admin/contracts/{contractId}/pdf`

- [ ] **Button/Action Logic**
  - [ ] Test [상태 변경]
  - [ ] Test [관리자 서명]
  - [ ] Test [유효화]
  - [ ] Test [PDF 재생성]
  - [ ] Test [미리보기]
  - [ ] Test [다운로드]

- [ ] **State Management**
  - [ ] Verify contract state
  - [ ] Test order state
  - [ ] Verify notes state
  - [ ] Test updating state

- [ ] **Form Processing**
  - [ ] Test notes textarea

- [ ] **Console Error Detection**
  - [ ] Test PDF generation
  - [ ] Verify signature workflow
  - [ ] Check status updates

---

### 3.9 Admin Inventory
**URL:** `/admin/inventory`
**Status:** TODO
**Dependencies:** Admin Dashboard
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `inventory` table
  - [ ] Verify fields:
    - [ ] quantity_on_hand, quantity_allocated, quantity_available
    - [ ] reorder_point, needs_reorder
  - [ ] Verify `inventory_transactions` table
  - [ ] Test inventory queries

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/admin/inventory/items`
  - [ ] Verify `GET /api/admin/inventory/history/{productId}`
  - [ ] Verify `POST /api/admin/inventory/adjust`

- [ ] **Button/Action Logic**
  - [ ] Test [필터] (warehouse/reorder needed)
  - [ ] Test [재고 조정] modal
  - [ ] Test [입고 기록]
  - [ ] Test [이동 내역]

- [ ] **State Management**
  - [ ] Verify SWR inventory data
  - [ ] Test Supabase Realtime updates

- [ ] **Form Processing**
  - [ ] Test inventory adjustment form (quantity + reason)

- [ ] **Console Error Detection**
  - [ ] Test inventory adjustments
  - [ ] Verify transaction recording
  - [ ] Check reorder calculations

---

## Priority 4: Portal Pages

### 4.1 Portal Dashboard
**URL:** `/portal`
**Status:** TODO
**Dependencies:** Authentication
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `profiles` table
  - [ ] Verify `orders` table
  - [ ] Verify `quotations` table
  - [ ] Verify `customer_notifications` table
  - [ ] Verify `production_logs` table
  - [ ] Test dashboard data queries

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/customer/dashboard`
  - [ ] Test response format
  - [ ] Verify error handling

- [ ] **Button/Action Logic**
  - [ ] Test [새 견적 의뢰] → `/quote-simulator`
  - [ ] Test [문의하기] → `/portal/support`
  - [ ] Test [제품 카탈로그] → `/catalog`
  - [ ] Test [모두 보기] → `/portal/orders`
  - [ ] Test statistics card navigation

- [ ] **State Management**
  - [ ] Verify Server Component (RSC) rendering
  - [ ] Test Cookie-based authentication
  - [ ] Verify requireAuth() function

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Check RSC rendering errors
  - [ ] Verify authentication check
  - [ ] Test data fetching

---

### 4.2 Portal Profile
**URL:** `/portal/profile`
**Status:** TODO
**Dependencies:** Portal Dashboard
**Estimated Time:** 2 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `profiles` table
  - [ ] Verify `companies` table
  - [ ] Test profile read/write

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/customer/profile`
  - [ ] Verify `PATCH /api/customer/profile`
  - [ ] Test profile updates

- [ ] **Button/Action Logic**
  - [ ] Test [취소] (window.location.reload())
  - [ ] Test [변경 사항 저장] Server Action
  - [ ] Test [로그아웃] → `/auth/signout`
  - [ ] Test [계정 삭제 요청] mailto

- [ ] **State Management**
  - [ ] Verify Server Action ('use server')
  - [ ] Test form state

- [ ] **Form Processing**
  - [ ] Test Server Action handleUpdate()
  - [ ] Verify editable fields:
    - [ ] corporate_phone, personal_phone, position
    - [ ] department, company_url
    - [ ] postalCode, prefecture, city, street, building
  - [ ] Verify read-only fields:
    - [ ] kanji/kana names, email
    - [ ] businessType, companyName, corporateNumber, industry

- [ ] **Console Error Detection**
  - [ ] Test Server Action execution
  - [ ] Verify field validation
  - [ ] Check update errors

---

### 4.3 Portal Orders
**URL:** `/portal/orders`
**Status:** TODO
**Dependencies:** Portal Dashboard
**Estimated Time:** 2 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `orders` table
  - [ ] Verify `companies` table
  - [ ] Verify `quotations` table
  - [ ] Verify `order_items` table
  - [ ] Test filtering queries

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/customer/orders?status=XXX&search=YYY`
  - [ ] Test query parameters

- [ ] **Button/Action Logic**
  - [ ] Test [새 견적 의뢰] → `/quote-simulator`
  - [ ] Test [상태 필터] → URL params
  - [ ] Test [검색 폼] → URL params
  - [ ] Test [클리어] → `/portal/orders`

- [ ] **State Management**
  - [ ] Verify URL searchParams
  - [ ] Test param updates

- [ ] **Form Processing**
  - [ ] Test GET search form

- [ ] **Console Error Detection**
  - [ ] Verify URL param handling
  - [ ] Test filter combinations

---

### 4.4 Portal Orders Detail
**URL:** `/portal/orders/[id]`
**Status:** TODO
**Dependencies:** Portal Orders
**Estimated Time:** 2 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `orders` detail query
  - [ ] Verify `companies`, `quotations`, `order_items`
  - [ ] Verify `production_logs`, `shipments`, `contracts`, `order_notes`

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/customer/orders/[id]`

- [ ] **Button/Action Logic**
  - [ ] Test [변경 요청] → conditional redirect
  - [ ] Test [문의하기] → `/portal/support`
  - [ ] Test [문서 확인] → `/portal/documents`

- [ ] **State Management**
  - [ ] Verify useParams usage
  - [ ] Test dynamic routing

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Test with invalid order ID
  - [ ] Verify related data loads

---

### 4.5 Portal Documents
**URL:** `/portal/documents`
**Status:** TODO
**Dependencies:** Portal Dashboard
**Estimated Time:** 2 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `quotations` table
  - [ ] Verify `contracts` table
  - [ ] Verify `files` table
  - [ ] Verify `profiles` table
  - [ ] Verify `orders` table
  - [ ] Test document type queries

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/customer/documents?type=XXX&order_id=YYY`
  - [ ] Test type filtering

- [ ] **Button/Action Logic**
  - [ ] Test [다운로드] links
  - [ ] Test [타입 필터] → URL params
  - [ ] Verify document type icons:
    - [ ] quote → 📄, contract → ✍️, invoice → 🧾
    - [ ] design → 🎨, shipping_label → 📦
    - [ ] spec_sheet → 📋, delivery_note → ✅

- [ ] **State Management**
  - [ ] Verify URL searchParams

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Test file downloads
  - [ ] Verify filter combinations

---

### 4.6 Portal Support
**URL:** `/portal/support`
**Status:** TODO
**Dependencies:** None
**Estimated Time:** 1 hour

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] None

- [ ] **API Endpoint**
  - [ ] None

- [ ] **Button/Action Logic**
  - [ ] Test [전화] tel: link
  - [ ] Verify email links:
    - [ ] orders@epackage-lab.com
    - [ ] technical@epackage-lab.com
    - [ ] billing@epackage-lab.com
    - [ ] support@epackage-lab.com
  - [ ] Test quick links:
    - [ ] `/portal/orders`, `/portal/documents`, `/samples`, `/quote-simulator`
  - [ ] Test guide links:
    - [ ] `/guide/size`, `/guide/color`, `/guide/environmentaldisplay`, `/guide/image`

- [ ] **State Management**
  - [ ] None

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Verify all links work
  - [ ] Check FAQ display

---

## Priority 5: Public Pages

### 5.1 Homepage
**URL:** `/`
**Status:** TODO
**Dependencies:** None
**Estimated Time:** 1 hour

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] None (static page)

- [ ] **API Endpoint**
  - [ ] None

- [ ] **Button/Action Logic**
  - [ ] Test [스마트 견적] → `/quote-simulator`
  - [ ] Test [샘플 요청] → `/samples`
  - [ ] Test [문의하기] → `/contact`
  - [ ] Test [제품 카탈로그] → `/catalog`
  - [ ] Test [회사 소개] → `/about`

- [ ] **State Management**
  - [ ] None (static Server Component)

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Check for navigation errors
  - [ ] Verify page load performance

---

### 5.2 Catalog Main
**URL:** `/catalog`
**Status:** TODO
**Dependencies:** None
**Estimated Time:** 3 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `products` table
  - [ ] Verify `categories` table
  - [ ] Verify `material_types` table
  - [ ] Test catalog queries

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/products`
  - [ ] Test query params: category, material_type, search, sort
  - [ ] Verify static data fallback

- [ ] **Button/Action Logic**
  - [ ] Test [카테고리 필터]
  - [ ] Test [검색] with debouncing
  - [ ] Test [정렬] (name/price)
  - [ ] Test [제품 카드] → `/catalog/[slug]`

- [ ] **State Management**
  - [ ] Verify products state
  - [ ] Test filters state
  - [ ] Verify loading state
  - [ ] Test useDebounce hook

- [ ] **Form Processing**
  - [ ] Test search input (debounced)
  - [ ] Test Select dropdowns

- [ ] **Console Error Detection**
  - [ ] Test with empty product list
  - [ ] Verify search debouncing
  - [ ] Check filter combinations

---

### 5.3 Catalog Detail
**URL:** `/catalog/[slug]`
**Status:** TODO
**Dependencies:** Catalog Main
**Estimated Time:** 2 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `products` detail query
  - [ ] Verify `product_images` table
  - [ ] Verify `product_specifications` table

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/products/[slug]`

- [ ] **Button/Action Logic**
  - [ ] Test [견적에 추가] → CartContext
  - [ ] Test [샘플 요청] → `/samples` (pre-selected)
  - [ ] Test [비교에 추가] → ComparisonContext
  - [ ] Test [문의하기] → `/contact` (pre-filled)

- [ ] **State Management**
  - [ ] Verify CartProvider
  - [ ] Test ComparisonProvider
  - [ ] Verify product state
  - [ ] Test selectedVariant state

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Test with invalid slug
  - [ ] Verify context updates

---

### 5.4 Service Pages (5 pages)
**URLs:** `/about`, `/service`, `/privacy`, `/terms`, `/legal`, `/csr`
**Status:** TODO
**Dependencies:** None
**Estimated Time:** 2 hours total

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] None (static pages)

- [ ] **API Endpoint**
  - [ ] None

- [ ] **Button/Action Logic**
  - [ ] Test all navigation buttons
  - [ ] Verify external links

- [ ] **State Management**
  - [ ] None

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Verify page loads
  - [ ] Check for broken links

---

### 5.5 Guide Pages (6 pages)
**URLs:** `/guide`, `/guide/color`, `/guide/size`, `/guide/image`, `/guide/shirohan`, `/guide/environmentaldisplay`
**Status:** TODO
**Dependencies:** None
**Estimated Time:** 1.5 hours total

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] None (static guides)

- [ ] **API Endpoint**
  - [ ] None

- [ ] **Button/Action Logic**
  - [ ] Test guide navigation links
  - [ ] Verify all internal links work

- [ ] **State Management**
  - [ ] None

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Check for navigation errors
  - [ ] Verify image loads

---

### 5.6 Industry Pages (4 pages)
**URLs:** `/industry/cosmetics`, `/industry/electronics`, `/industry/food-manufacturing`, `/industry/pharmaceutical`
**Status:** TODO
**Dependencies:** Catalog
**Estimated Time:** 2 hours total

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `products` table by category

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/products?category=XXX`

- [ ] **Button/Action Logic**
  - [ ] Test [제품 보기] → `/catalog`
  - [ ] Test [견적 요청] → `/quote-simulator`

- [ ] **State Management**
  - [ ] None

- [ ] **Form Processing**
  - [ ] None

- [ ] **Console Error Detection**
  - [ ] Verify category filtering
  - [ ] Test product display

---

### 5.7 Quote Simulator & Smart Quote
**URLs:** `/quote-simulator`, `/smart-quote`
**Status:** TODO
**Dependencies:** Products
**Estimated Time:** 4 hours

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify `products` table
  - [ ] Verify `quotations` table (logged in)

- [ ] **API Endpoint**
  - [ ] Verify `GET /api/products`
  - [ ] Verify `POST /api/quotations/submit` (logged in)

- [ ] **Button/Action Logic**
  - [ ] Test [제품 추가] → QuoteContext
  - [ ] Test [제품 삭제] → QuoteContext
  - [ ] Test [수량 변경] → QuoteContext
  - [ ] Test [PDF 다운로드] → generateQuotePDF()
  - [ ] Test [제출] → submit (logged in)

- [ ] **State Management**
  - [ ] Verify QuoteProvider
  - [ ] Test MultiQuantityQuoteProvider
  - [ ] Verify items state
  - [ ] Test customerInfo state

- [ ] **Form Processing**
  - [ ] Verify customerInfo schema:
    - [ ] name, email, phone, company
  - [ ] Test React Hook Form + Zod

- [ ] **Console Error Detection**
  - [ ] Test PDF generation
  - [ ] Verify form validation
  - [ ] Check context updates

---

### 5.8 Other Public Pages
**URLs:** `/pricing`, `/simulation`, `/roi-calculator`, `/archives`, `/compare`, `/compare/shared`, `/data-templates`, `/flow`, `/inquiry/detailed`, `/premium-content`, `/print`, `/news`, `/design-system`
**Status:** TODO
**Dependencies:** Various
**Estimated Time:** 6 hours total

#### Verification Tasks:
- [ ] **Database Connection**
  - [ ] Verify specific table connections per page
  - [ ] Test queries for dynamic content

- [ ] **API Endpoint**
  - [ ] Verify page-specific endpoints
  - [ ] Test API responses

- [ ] **Button/Action Logic**
  - [ ] Test all interactive elements
  - [ ] Verify navigation flows

- [ ] **State Management**
  - [ ] Verify page-specific state
  - [ ] Test context providers

- [ ] **Form Processing**
  - [ ] Test form validations
  - [ ] Verify submissions

- [ ] **Console Error Detection**
  - [ ] Comprehensive error check
  - [ ] Verify all functionality

---

## Summary Checklist

### Total Page Count by Priority
- **Priority 1 (Auth):** 6 pages - Estimated: 10 hours
- **Priority 2 (Core Business):** 7 pages - Estimated: 21 hours
- **Priority 3 (Admin):** 9 pages - Estimated: 24 hours
- **Priority 4 (Portal):** 6 pages - Estimated: 13 hours
- **Priority 5 (Public):** 37 pages - Estimated: 20.5 hours

**Total Estimated Time:** ~88.5 hours

### Verification Categories
Each page requires verification in 6 categories:
1. **Database Connection** - Table access, queries, RLS policies
2. **API Endpoint** - Endpoint existence, response format, error handling
3. **Button/Action Logic** - Navigation, form submissions, user interactions
4. **State Management** - Context providers, local state, data flow
5. **Form Processing** - Validation, submission, error handling
6. **Console Error Detection** - Browser console, error boundaries, logging

### Testing Tools Required
- [ ] Supabase dashboard for database queries
- [ ] Browser DevTools for console inspection
- [ ] Postman/Insomnia for API endpoint testing
- [ ] Playwright for E2E testing
- [ ] Jest for unit testing

### Dependencies Tracking
- Authentication flow must be completed first
- Admin pages depend on admin authentication
- Member/portal pages depend on member authentication
- Public pages have no dependencies

### Progress Tracking
Update status (TODO/IN_PROGRESS/DONE/BLOCKED/SKIP) as work progresses on each page.

---

**Document Version:** 1.0
**Last Updated:** 2026-01-05
**Next Review:** After completing Priority 1 tasks
