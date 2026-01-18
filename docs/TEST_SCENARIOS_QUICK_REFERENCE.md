# Test Scenarios - Quick Reference

**Version**: 1.0
**Generated**: 2026-01-11
**Full Test Plan**: `docs/COMPREHENSIVE_TEST_PLAN.md`

---

## Quick Test Checklist by Category

### A. Console Error Check (All Pages)

**For every page, do this**:
1. Open DevTools (F12)
2. Go to Console tab
3. Clear console
4. Navigate to page
5. Wait for full load
6. Check for red errors or yellow warnings
7. Record in report

**Pages Requiring Special Attention**:
- `/member/dashboard` - Known issue with undefined stats properties

---

### B. Public Pages (No Auth Required)

#### Home Page (/)
- [ ] Page loads in < 3 seconds
- [ ] No console errors
- [ ] "Products" button -> `/catalog`
- [ ] "Smart Quote" button -> `/quote-simulator`
- [ ] "Sample Request" button -> `/samples`
- [ ] "Contact" button -> `/contact`
- [ ] Footer links work
- [ ] No broken images (check Network tab)

#### Catalog (/catalog)
- [ ] Page loads
- [ ] No console errors
- [ ] Products display (or empty state)
- [ ] Category filter works
- [ ] Material type filter works
- [ ] Search works (debounce 300ms)
- [ ] Product card click -> product detail page
- [ ] Check Network tab for `/api/products` success

#### Product Detail (/catalog/[slug])
- [ ] Navigate to `/catalog/envelope-0` (or any product)
- [ ] No console errors
- [ ] Product name displays (Japanese)
- [ ] Specifications show
- [ ] Images load (no 404s)
- [ ] "Add to Quote" button works
- [ ] "Request Sample" button works

#### Quote Simulator (/quote-simulator)
- [ ] Page loads
- [ ] No console errors
- [ ] Select product type
- [ ] Select options
- [ ] Price updates real-time
- [ ] "Add to Quote" works
- [ ] "Download PDF" works (client-side)
- [ ] "Submit" works (if logged in)

#### Smart Quote (/smart-quote)
- [ ] Page loads
- [ ] No console errors
- [ ] Add product 1
- [ ] Add product 2
- [ ] Both items show in list
- [ ] Change quantity
- [ ] Total price updates
- [ ] Remove item
- [ ] Fill customer info
- [ ] "Save Quote" works (if logged in)
- [ ] "Download PDF" works

#### ROI Calculator (/roi-calculator)
- [ ] Page loads
- [ ] No console errors
- [ ] Enter costs
- [ ] Click "Calculate"
- [ ] Results display
- [ ] "Email Results" -> `/contact` with data

#### Sample Request (/samples)
- [ ] Page loads
- [ ] No console errors
- [ ] Add sample 1-5
- [ ] Error on 6th sample (max 5)
- [ ] Add address 1-5
- [ ] Error on 6th address (max 5)
- [ ] Fill contact info
- [ ] Validate form (blank fields)
- [ ] Submit succeeds
- [ ] Redirect to thank-you or success message

#### Contact Form (/contact)
- [ ] Page loads
- [ ] No console errors
- [ ] Select inquiry type
- [ ] Invalid email -> validation error
- [ ] Invalid phone -> validation error
- [ ] Fill all fields
- [ ] Submit succeeds
- [ ] Check Network: `/api/contact` 200 OK
- [ ] Success message or redirect

#### Industry Pages
- [ ] `/industry/cosmetics` - Loads, no errors
- [ ] `/industry/electronics` - Loads, no errors
- [ ] `/industry/food-manufacturing` - Loads, no errors
- [ ] `/industry/pharmaceutical` - Loads, no errors
- [ ] "View Products" -> `/catalog` with filter
- [ ] "Request Quote" -> `/quote-simulator`

#### Guide Pages
- [ ] `/guide` - Loads
- [ ] `/guide/color` - Loads
- [ ] `/guide/size` - Loads
- [ ] `/guide/image` - Loads
- [ ] `/guide/shirohan` - Loads
- [ ] `/guide/environmentaldisplay` - Loads
- [ ] No console errors on any

#### Info Pages
- [ ] `/about` - Loads
- [ ] `/service` - Loads
- [ ] `/privacy` - Loads
- [ ] `/terms` - Loads
- [ ] `/legal` - Loads
- [ ] `/csr` - Loads
- [ ] `/news` - Loads
- [ ] `/archives` - Loads
- [ ] `/portal` - Loads (auth required for content)
- [ ] No console errors

---

### C. Authentication Pages

#### Sign In (/auth/signin)
- [ ] Page loads
- [ ] No console errors
- [ ] **Test 1**: Valid member login -> `/member/dashboard`
- [ ] **Test 2**: Valid admin login -> `/admin/dashboard`
- [ ] **Test 3**: Invalid credentials -> error message
- [ ] **Test 4**: Pending account -> `/auth/pending`
- [ ] **Test 5**: Suspended account -> `/auth/suspended`
- [ ] Auth cookies set (check Application tab)
- [ ] Check Network: `/api/auth/signin` 200 OK

#### Register (/auth/register)
- [ ] Page loads
- [ ] No console errors
- [ ] All 18+ fields display
- [ ] **Test 1**: Blank submit -> validation errors
- [ ] **Test 2**: Invalid email -> validation error
- [ ] **Test 3**: Invalid phone -> validation error
- [ ] **Test 4**: Invalid postal code -> validation error
- [ ] **Test 5**: Valid individual registration -> success
- [ ] **Test 6**: Valid corporation registration -> success
- [ ] **Test 7**: Duplicate email -> error
- [ ] Check Network: `/api/auth/register` 200 OK
- [ ] Success message displays
- [ ] Status: PENDING (requires admin approval)

#### Sign Out (/auth/signout)
- [ ] Navigate to `/auth/signout`
- [ ] Auto-logout triggers
- [ ] Cookies deleted
- [ ] Redirect to `/`
- [ ] Try `/member/dashboard` -> redirect to signin

#### Forgot Password (/auth/forgot-password)
- [ ] Page loads
- [ ] No console errors
- [ ] Enter email
- [ ] Submit succeeds
- [ ] Success message displays

---

### D. Member Portal Pages (Auth Required: MEMBER)

**Prerequisites**: Login as member with ACTIVE status

#### Member Dashboard (/member/dashboard)
- [ ] Page loads
- [ ] **CHECK CONSOLE**: Known issue with undefined stats
- [ ] Statistics display (or zeros if no data)
- [ ] Announcements show
- [ ] Recent activity shows
- [ ] "View All Orders" -> `/member/orders`
- [ ] "View All Quotations" -> `/member/quotations`

#### Profile (/member/profile)
- [ ] Page loads
- [ ] No console errors
- [ ] Profile info displays
- [ ] "Edit Profile" button works
- [ ] "Change Password" button works

#### Edit Profile (/member/edit)
- [ ] Page loads
- [ ] Form pre-populated
- [ ] Update fields
- [ ] "Save Changes" -> success
- [ ] Changes reflected in database
- [ ] Change password workflow works

#### Settings (/member/settings)
- [ ] Page loads
- [ ] No console errors
- [ ] 8 notification toggles display
- [ ] Toggle and save -> persists
- [ ] Account deletion: 3-step process works
- [ ] Account deletion removes user

#### Orders List (/member/orders)
- [ ] Page loads
- [ ] No console errors
- [ ] Orders display (or empty state)
- [ ] Status filter works
- [ ] Search works
- [ ] Date filter works
- [ ] Sort works
- [ ] Click order -> detail page

#### Order Detail (/member/orders/[id])
- [ ] Page loads
- [ ] No console errors
- [ ] Order info displays
- [ ] Items list displays
- [ ] Production timeline shows (10 stages)
- [ ] Progress bar accurate
- [ ] "Download PDF" works
- [ ] "Reorder" works
- [ ] "Cancel" works (if pending)
- [ ] File upload works

#### Quotations List (/member/quotations)
- [ ] Page loads
- [ ] No console errors
- [ ] Quotations display
- [ ] Status filter works
- [ ] "PDF" button works
- [ ] "Delete" works (DRAFT only)
- [ ] "Create Order" works (APPROVED only)

#### Quotation Detail (/member/quotations/[id])
- [ ] Page loads
- [ ] No console errors
- [ ] Quote details display
- [ ] Line items show
- [ ] Totals accurate
- [ ] "Download PDF" works

#### New Order (/member/orders/new)
- [ ] Page loads
- [ ] No console errors
- [ ] Approved quotes list displays
- [ ] Select quote
- [ ] Select delivery address
- [ ] Select billing address
- [ ] "Create Order" -> success
- [ ] Redirect to new order

#### Contracts (/member/contracts)
- [ ] Page loads
- [ ] No console errors
- [ ] Contracts list displays
- [ ] Status badges show
- [ ] "View Details" works
- [ ] "Sign Contract" works (unsigned)
- [ ] "Download PDF" works

#### Samples (/member/samples)
- [ ] Page loads
- [ ] No console errors
- [ ] Sample requests list displays
- [ ] Status tracking shows
- [ ] Tracking info displays

#### Invoices (/member/invoices)
- [ ] Page loads
- [ ] No console errors
- [ ] Invoices list displays
- [ ] Payment status shows
- [ ] "Download PDF" works

#### Deliveries (/member/deliveries)
- [ ] Page loads
- [ ] No console errors
- [ ] Shipments list displays
- [ ] Tracking timeline shows

#### Inquiries (/member/inquiries)
- [ ] Page loads
- [ ] No console errors
- [ ] Inquiries list displays
- [ ] Responses show

---

### E. Admin Pages (Auth Required: ADMIN)

**Prerequisites**: Login as admin with ACTIVE status

#### Admin Dashboard (/admin/dashboard)
- [ ] Page loads
- [ ] No console errors
- [ ] Statistics cards display
- [ ] Period filter works (7/30/90 days)
- [ ] Stats update on filter change
- [ ] Recent orders show
- [ ] Pending approvals show
- [ ] Check Network: `/api/admin/dashboard/statistics` 200 OK

#### Orders Management (/admin/orders)
- [ ] Page loads
- [ ] No console errors
- [ ] All orders list displays
- [ ] Status filter works
- [ ] Single status change works
- [ ] Bulk status change works
- [ ] Select all works

#### Production Management (/admin/production)
- [ ] Page loads
- [ ] No console errors
- [ ] Production jobs list displays
- [ ] Stage filter works
- [ ] Current stage shows
- [ ] Progress percentage shows
- [ ] "Next Stage" works
- [ ] Progress updates correctly

#### Approvals (/admin/approvals)
- [ ] Page loads
- [ ] No console errors
- [ ] Pending users list displays
- [ ] User details show
- [ ] "Approve" -> status becomes ACTIVE
- [ ] Email sends to user
- [ ] "Reject" -> status becomes REJECTED
- [ ] Rejection reason recorded

#### Contracts Management (/admin/contracts)
- [ ] Page loads
- [ ] No console errors
- [ ] Contracts list displays
- [ ] Contract details show
- [ ] Workflow actions work

#### Inventory (/admin/inventory)
- [ ] Page loads
- [ ] No console errors
- [ ] Inventory list displays
- [ ] Stock levels accurate
- [ ] "Adjust Stock" works
- [ ] Transaction history records
- [ ] History tab displays

#### Leads (/admin/leads)
- [ ] Page loads
- [ ] No console errors
- [ ] Leads list displays
- [ ] Lead details show

#### Shipments (/admin/shipments)
- [ ] Page loads
- [ ] No console errors
- [ ] Shipments list displays
- [ ] "Create Shipment" works
- [ ] Carrier selection works
- [ ] Tracking records

---

### F. Portal Pages (Auth Required)

**Prerequisites**: Login as any user

#### Portal Home (/portal)
- [ ] Page loads
- [ ] No console errors
- [ ] Simplified dashboard displays
- [ ] Quick stats show
- [ ] Recent activity shows
- [ ] Notifications display
- [ ] "Request Quote" -> `/quote-simulator`
- [ ] "Contact Support" -> `/contact`
- [ ] "View Products" -> `/catalog`
- [ ] "View All Orders" -> `/portal/orders`

#### Portal Profile (/portal/profile)
- [ ] Page loads
- [ ] No console errors
- [ ] Profile displays
- [ ] Edit works
- [ ] Simplified vs `/member/profile`

#### Portal Orders (/portal/orders)
- [ ] Page loads
- [ ] No console errors
- [ ] Orders list displays
- [ ] Simplified vs `/member/orders`
- [ ] Order detail works

---

### G. Database & API Health

**Supabase Connection**:
- [ ] Open DevTools Network tab
- [ ] Navigate to `/catalog`
- [ ] Look for Supabase queries
- [ ] Verify 200 OK responses
- [ ] No 500/503 errors
- [ ] Response data structure valid

**API Endpoints**:
- [ ] `/api/contact` - POST works
- [ ] `/api/samples/request` - POST works
- [ ] `/api/products` - GET works
- [ ] `/api/member/orders` - GET works (auth required)
- [ ] `/api/member/quotations` - GET works (auth required)
- [ ] `/api/auth/signin` - POST works
- [ ] `/api/auth/register` - POST works
- [ ] `/api/admin/dashboard/statistics` - GET works (admin)
- [ ] `/api/admin/users/approve` - POST works (admin)

**Rate Limiting**:
- [ ] Submit contact form 11 times rapidly
- [ ] 11th request should be rate limited (10req/15min)

---

### H. Security Tests

**Authentication**:
- [ ] Access `/member/*` without auth -> redirect to signin
- [ ] Access `/admin/*` without auth -> redirect to signin
- [ ] Access `/admin/*` as member -> forbidden/error
- [ ] Session expires correctly

**Input Validation**:
- [ ] SQL injection in forms -> rejected
- [ ] XSS in text fields -> rejected/sanitized
- [ ] Path traversal in uploads -> rejected

**File Upload**:
- [ ] Upload .exe file -> blocked
- [ ] Upload with `<script>` -> sanitized/blocked
- [ ] Upload >10MB -> rejected
- [ ] Upload with wrong extension -> magic number check

---

## Test Execution Summary

### Total Pages: 78

| Category | Count | Auth Required |
|----------|-------|---------------|
| Public Pages | 37 | No |
| Auth Pages | 6 | No (except /auth/signout) |
| Member Pages | 21 | Yes (MEMBER) |
| Admin Pages | 14 | Yes (ADMIN) |
| Portal Pages | 6 | Yes |
| **Total** | **78** | - |

### Critical Known Issues

1. **`/member/dashboard`** - Console error with undefined stats properties
   - Error: Cannot read property 'orders' of undefined
   - Status: Known workaround with safeGet()
   - Required fix: getDashboardStatsSafe() with complete defaults

---

## Quick Console Error Reference

### Common Errors to Look For

**Supabase Errors**:
- "Failed to fetch"
- "Supabase connection error"
- "Table does not exist"
- "Permission denied"

**React/Next.js Errors**:
- "Cannot read property 'X' of undefined"
- "X is not defined"
- "Warning: Each child in a list should have a unique 'key' prop"

**Network Errors**:
- "Failed to load resource: net::ERR_CONNECTION_REFUSED"
- "500 Internal Server Error"
- "503 Service Unavailable"
- "404 Not Found" (for assets/APIs)

---

## Bug Report Template

```markdown
## Bug Report

**Page**: [URL]
**Severity**: [Critical/Major/Minor]
**Description**: [What happened]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
**Expected**: [What should happen]
**Actual**: [What actually happened]
**Console Error**: [Paste error]
**Screenshot**: [Attach]
```

---

**End of Quick Reference**
