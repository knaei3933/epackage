# Missing Pages Documentation - url.md Additions

**Date**: 2026-01-07
**Task**: Document 20 missing pages in url.md
**Total Pages Added**: 20

---

## Summary of Added Pages

This document contains the documentation for 20 pages that were missing from the original url.md file. These pages should be inserted into the appropriate sections of url.md.

---

## 1. Public Pages (14 pages)

### Shopping & Comparison (3 pages)

#### `/cart` - Shopping Cart
- **File Location**: `src/app/cart/page.tsx`
- **Database Tables**: None (Context state management)
- **API Endpoints**:
  - `GET /api/products` - Product info lookup for price calculation
- **Button Flows**:
  - [Add to Cart] → CartContext.addItem()
  - [Update Quantity] → CartContext.updateQuantity()
  - [Remove Item] → CartContext.removeItem()
  - [Request Quote] → Redirect to `/roi-calculator/?fromCart=true`
  - [Clear Cart] → CartContext.clearCart()
- **State Management**: CartProvider (items, cart, isLoading)

#### `/compare` - Product Comparison
- **File Location**: `src/app/compare/page.tsx`
- **Database Tables**: None (Context state management)
- **API Endpoints**:
  - `GET /api/products` - Product info lookup
- **Button Flows**:
  - [Add to Comparison] → ComparisonContext.addItem() (max 4 items)
  - [Remove Item] → ComparisonContext.removeItem()
  - [Clear All] → ComparisonContext.clearAll()
  - [Request Quote] → `/quote-simulator` with selected products
- **State Management**: ComparisonProvider

#### `/compare/shared` - Shared Comparison Link
- **File Location**: `src/app/compare/shared/page.tsx`
- **Database Tables**: None
- **API Endpoints**: None
- **Button Flows**:
  - [Back to Compare] → `/compare`
- **Note**: Currently in maintenance mode

---

### Design & Templates (2 pages)

#### `/design-system` - Design System Guide
- **File Location**: `src/app/design-system/page.tsx`
- **Database Tables**: None
- **API Endpoints**: None
- **Features**:
  - UI component demos (Button, Input, Select, Badge, Card)
  - Typography & color palette showcase
- **State Management**: Local state for demo purposes

#### `/data-templates` - Design Template Downloads
- **File Location**: `src/app/data-templates/page.tsx`
- **Database Tables**:
  - `premium_downloads` - Download lead information
- **API Endpoints**:
  - `GET /api/download/templates/*` - Template file download
  - `POST /api/premium/download` - Lead information collection
- **Button Flows**:
  - [Download Template] → PremiumContentSection → Lead form → Save to DB → Download file
  - [Start Quote] → `/quote-simulator`
  - [Design Support] → `/contact`

---

### News & Information (2 pages)

#### `/news` - Packaging News
- **File Location**: `src/app/news/page.tsx`
- **Database Tables**: None (static content)
- **API Endpoints**: None
- **Features**:
  - NewsClient component - news list display
  - Category filtering
  - Search functionality

#### `/pricing` - Pricing Plans (Redirect)
- **File Location**: `src/app/pricing/page.tsx`
- **Database Tables**: None
- **API Endpoints**: None
- **Button Flows**:
  - Auto-redirect → `/roi-calculator/`

---

### Archive & Flow (2 pages)

#### `/archives` - Implementation Case Studies
- **File Location**: `src/app/archives/page.tsx`
- **Database Tables**: None (static content)
- **API Endpoints**: None
- **Features**:
  - ArchivePage component - success case list
  - Industry filtering (cosmetics, food, health food)
  - Image gallery

#### `/flow` - Manufacturing Process
- **File Location**: `src/app/flow/page.tsx`
- **Database Tables**: None
- **API Endpoints**: None
- **Button Flows**:
  - [Consultation Request] → `/contact`
  - [Quote Simulator] → `/quote-simulator`
- **Component**: ManufacturingProcessShowcase

---

### Premium Content (1 page)

#### `/premium-content` - Premium Content Library
- **File Location**: `src/app/premium-content/page.tsx`
- **Database Tables**:
  - `premium_downloads` - Download lead information
- **API Endpoints**:
  - `POST /api/premium/download` - Save lead info & download
- **Button Flows**:
  - [Download Premium Content] → PremiumContentSection → Lead form (name, email, company, industry, role) → POST to API → Save to DB → File download
  - [Free Consultation] → `/contact`
  - [Quote Simulation] → `/roi-calculator`
- **Features**: 5+ premium documents, ROI calculators, technical guides

---

### Print & Simulation (2 pages)

#### `/print` - Printing Technology
- **File Location**: `src/app/print/page.tsx`
- **Database Tables**: None
- **API Endpoints**: None
- **Button Flows**:
  - [Production Facility Tour] → `/contact`
  - [Product Catalog] → `/catalog`
  - [Sample Request] → `/samples`
- **Features**: FacilityCard, TechHighlight components showing production equipment

#### `/simulation` - Product Simulation
- **File Location**: `src/app/simulation/page.tsx`
- **Database Tables**:
  - `products` - Product information
- **API Endpoints**:
  - `GET /api/products/[slug]` - Product lookup
- **Features**:
  - SimulationWizard - simulation wizard
  - Real-time price calculation on option change
  - 3D preview (Three.js)
- **State Management**: SimulationProvider

---

### Detailed Inquiry (1 page)

#### `/inquiry/detailed` - Detailed Inquiry
- **File Location**: `src/app/inquiry/detailed/page.tsx`
- **Database Tables**:
  - `inquiries` - Inquiry history
  - `leads` - Lead information (lead scoring)
- **API Endpoints**:
  - `POST /api/inquiry/detailed` - Submit detailed inquiry
    - 5-step hearing form
    - Automatic lead score calculation
    - SendGrid email dispatch
- **Button Flows**:
  - [Submit Detailed Inquiry] → DetailedInquiryForm (5 steps) → Lead scoring (companySize, budget, timeline) → POST to API → DB save + email → Success message
- **Lead Response**:
  - Lead score 70+: Contact within 4 hours
  - Others: Contact within 24 hours

---

## 2. Auth Pages (1 page)

#### `/auth/signout` - Sign Out
- **File Location**: `src/app/auth/signout/page.tsx`
- **Database Tables**: None
- **API Endpoints**:
  - `POST /api/auth/signout` - Logout
    - Supabase Auth session termination
    - httpOnly cookie deletion
- **Button Flows**:
  - Auto-logout on page load
    - AuthContext.signOut()
    - localStorage deletion
    - Redirect to `/` after 1.5 seconds

---

## 3. Member Portal Pages (5 pages)

### Quotations (2 pages)

#### `/member/quotations/request` - B2B Quotation Request
- **File Location**: `src/app/member/quotations/request/page.tsx`
- **Database Tables**:
  - `companies` - User's companies
  - `quotations` - Quotation creation
  - `quotation_items` - Quotation line items
- **API Endpoints**:
  - `GET /api/member/companies` - Load user companies
  - `POST /api/member/quotations` - Create quotation
- **Button Flows**:
  - [Submit Quotation Request] → B2BQuotationRequestForm → Create quotation → Redirect to `/member/quotations/{id}`
- **State Management**: Local state (userId, companies, loading, error)

#### `/member/quotations/[id]/confirm` - Quotation Confirmation & Order
- **File Location**: `src/app/member/quotations/[id]/confirm/page.tsx`
- **Database Tables**:
  - `quotations` - Quotation details
  - `orders` - Order creation
  - `order_items` - Order line items
- **API Endpoints**:
  - `GET /api/member/quotations/[id]` - Fetch quotation details
  - `POST /api/member/orders/confirm` - Create order from quotation
- **Button Flows**:
  - [Confirm Order] → Validate quotation status (must be SENT) → Create order → Redirect to order confirmation
- **Note**: Only quotations with 'SENT' status can be confirmed

---

### Orders (3 pages)

#### `/member/orders/[id]/confirmation` - Order Confirmation Success
- **File Location**: `src/app/member/orders/[id]/confirmation/page.tsx`
- **Database Tables**:
  - `orders` - Order details
  - `order_items` - Order line items
- **API Endpoints**:
  - `GET /api/member/orders/[id]` - Fetch order details
- **Button Flows**:
  - Display order confirmation details
  - [View Order Details] → `/member/orders/{id}`
  - [Back to Orders] → `/member/orders`
- **Component**: OrderConfirmSuccessClient

#### `/member/orders/[id]/data-receipt` - Order Data Upload
- **File Location**: `src/app/member/orders/[id]/data-receipt/page.tsx`
- **Database Tables**:
  - `orders` - Order details
  - `files` - Uploaded files (production data, design files)
- **API Endpoints**:
  - `GET /api/member/orders/[id]` - Fetch order details
  - `POST /api/member/orders/[id]/files` - Upload production data files
- **Button Flows**:
  - [Upload Files] → DataReceiptUploadClient → File validation (security-validator) → Upload to storage → Save to DB
- **Features**:
  - Drag & drop interface
  - File validation (PDF, Excel, images, 10MB limit)
  - Upload allowed for: pending, processing, manufacturing orders
- **Security**: Uses `src/lib/file-validator/security-validator.ts`

#### `/member/orders/reorder` - Reorder from History
- **File Location**: `src/app/member/orders/reorder/page.tsx`
- **Database Tables**:
  - `orders` - Order history
- **API Endpoints**:
  - `GET /api/member/orders` - Fetch order history
- **Button Flows**:
  - [Reorder] → `/quote-simulator?orderId={id}` (pre-fill with previous order data)
- **Filters**: Only delivered/shipped orders shown
- **Component**: OrderList with reorderable orders

#### `/member/orders/history` - Order History
- **File Location**: `src/app/member/orders/history/page.tsx`
- **Database Tables**:
  - `orders` - All orders
- **API Endpoints**:
  - `GET /api/member/orders` - Fetch all orders
- **Button Flows**:
  - [View Details] → `/member/orders/{id}`
  - [Filter by Status] - Status filter buttons
  - [Search] - Search by order number
- **Features**:
  - Display all order history
  - Status, search, sort functionality
  - Pagination (100 orders per page)

---

## Database Tables Used by Missing Pages

1. **premium_downloads** - Premium content download leads
2. **leads** - Lead scoring & management
3. **inquiries** - Detailed inquiry submissions
4. **files** - Order data receipt uploads
5. **companies** - B2B company information

## API Endpoints Used by Missing Pages

### Public APIs
- `GET /api/download/templates/*` - Template file download
- `POST /api/premium/download` - Lead info collection
- `POST /api/inquiry/detailed` - Detailed inquiry submission

### Member APIs
- `POST /api/member/quotations` - Create quotation
- `POST /api/member/orders/confirm` - Confirm order from quotation
- `POST /api/member/orders/[id]/files` - Upload order data files

### Auth APIs
- `POST /api/auth/signout` - Logout

## Button Flows Summary

### Shopping Cart Flow
```
Catalog → Add to Cart → /cart → Review Items → Request Quote → /roi-calculator
```

### Product Comparison Flow
```
Catalog → Add to Compare → /compare → Review (max 4) → Request Quote → /quote-simulator
```

### Premium Content Download Flow
```
/premium-content → Select Content → Fill Lead Form → POST /api/premium/download → Save to DB → Download File
```

### Detailed Inquiry Flow
```
/inquiry/detailed → 5-Step Form → Lead Scoring → POST /api/inquiry/detailed → DB Save + Email → Priority Response
```

### B2B Quotation Flow
```
/member/quotations/request → Fill Form → Create Quotation → /member/quotations/[id]/confirm → Confirm → Create Order
```

### Order Data Upload Flow
```
/member/orders/[id] → [Upload Data] → /member/orders/[id]/data-receipt → Drag & Drop Files → Validate → Upload → Save to DB
```

## State Management

### Context Providers
1. **CartProvider** - Shopping cart state
2. **ComparisonProvider** - Product comparison state
3. **SimulationProvider** - Product simulation state
4. **PremiumContentSection** - Download form state

### Local State
- inputValue, selectValue, isLoading (design system)
- currentStep, formData, leadScore (detailed inquiry)
- selectedContent, isDownloading (premium content)

## Console Errors

**No console errors detected** in any of the 20 missing pages.

---

## Integration with Existing Systems

### CartContext Integration
- Used by: `/cart`, `/catalog`, `/catalog/[slug]`
- Provides: addItem, removeItem, updateQuantity, clearCart
- Storage: LocalStorage (client-side)

### ComparisonContext Integration
- Used by: `/compare`, `/catalog`, `/catalog/[slug]`
- Provides: addItem, removeItem, clearAll
- Max items: 4 products

### File Validator Integration
- Used by: `/member/orders/[id]/data-receipt`
- Module: `src/lib/file-validator/security-validator.ts`
- Features: Magic number validation, 10MB limit, virus scan ready

### Lead Scoring Integration
- Used by: `/inquiry/detailed`
- Factors: companySize, budget, timeline, industry
- Thresholds: 70+ (high priority), <70 (standard)

---

## Page Counts After Addition

| Category | Original | Added | Total |
|----------|---------|-------|-------|
| Public Pages | 37 | 14 | 51 |
| Auth Pages | 6 | 1 | 7 |
| Member Portal | 19 | 5 | 24 |
| **Total** | **62** | **20** | **82** |

---

## SEO & Metadata

All pages include proper Japanese metadata:
- Title tags with product/service names
- Description tags with keyword optimization
- OpenGraph tags for social sharing
- Canonical URLs

---

## Accessibility Features

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly

---

## Performance Optimizations

- Next.js Image component for images
- Static generation where possible
- Client-side code splitting
- Lazy loading for heavy components

---

**End of Documentation**

**Next Steps**: Insert these page documentations into the appropriate sections of url.md
