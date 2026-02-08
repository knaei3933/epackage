# API Routes Analysis - Phase 5

## Current Status
- **Total Routes:** 234 files
- **Current Structure:** Deep nesting, scattered organization

## Current Route Categories

### 1. Admin Routes (80+ routes)
```
/admin/approve-member
/admin/contracts/[contractId]/{download,send-signature}
/admin/convert-to-order
/admin/coupons
/admin/dashboard/{statistics,unified-stats}
/admin/delivery/tracking/[orderId]
/admin/generate-work-order
/admin/inventory/{adjust,history/[productId],items,update,etc}
/admin/notifications/{create,[id]/read,[id],unread-count}
/admin/orders/[id]/{billing-address,cancellation,correction,etc}
/admin/production/{jobs/[id],update-status,[orderId]}
/admin/quotations/[id]
/admin/settings
/admin/shipments/[id]/tracking
/admin/users/{[id]/addresses,pending,reject,etc}
/admin/test-email
```

### 2. Member Routes (60+ routes)
```
/member/addresses/{billing/[id],delivery/[id]}
/member/ai-extraction/{approve,status,upload}
/member/auth/{resend-verification,verify-email}
/member/certificates/generate
/member/dashboard/{stats,unified-stats}
/member/documents/{[id]/download,history}
/member/files/{[id]/extract,upload}
/member/hanko/upload
/member/inquiries
/member/invites/{accept,send}
/member/invoices/[invoiceId]/download
/member/korea/{corrections/[id]/upload,send-data}
/member/notifications/{[id]/read,delete-all,mark-all-read}
/member/orders/[id]/{approvals,billing-address,comments,etc}
/member/quotations/[id]/{approve,confirm-payment,convert,export,invoice,save-pdf}
/member/samples
/member/settings
/member/shipments
/member/spec-sheets/[id]/{approve,generate,reject}
/member/status
/member/stock-in
/member/work-orders
```

### 3. Public Routes (20+ routes)
```
/auth/{forgot-password,register,reset-password,signin,signout,verify-email}
/contact
/contracts
/coupons/validate
/files/validate
/notifications/[id]/read
/payments/confirm
/quotation/pdf
/quotations/{guest-save,save}
/quotes/{excel,pdf}
/shipments/{tracking,create}
/samples/request
/signature/{cancel,status}
/specsheet/{approval,pdf,versions}
```

### 4. AI Routes (10+ routes)
```
/ai/{parse,review,specs}
/ai-parser/{approve,extract,reprocess,upload,validate}
/b2b/ai-extraction/upload
/b2b/files/upload
```

### 5. System Routes (30+ routes)
```
/analytics/vitals
/comparison/save
/contract/{pdf,timestamp,workflow}
/cron/archive-orders
/debug/auth
/dev/{apply-migration,set-admin}
/download/templates/{[category],excel,pdf}
/errors/log
/invoices
/orders/{cancel,confirm,create,receive,reorder,update}
/payments/confirm
/products/{categories,filter,search}
/profile/[id]
/quotation/pdf
/registry/{corporate-number,postal-code}
/revalidate
/settings
/shipments/{[id]/[trackingId]/label,schedule-pickup,track}
/supabase-mcp/execute
```

## Recommended Structure

```
src/app/api/
├── v1/                           # Version 1 API
│   ├── quotations/              # Quotations (public + member)
│   │   ├── [id]/
│   │   ├── guest-save
│   │   └── save
│   ├── orders/                  # Orders (public + member)
│   │   ├── [id]/
│   │   ├── cancel
│   │   ├── confirm
│   │   └── create
│   ├── inventory/               # Inventory management
│   │   ├── items
│   │   ├── adjust
│   │   └── history
│   ├── production/              # Production management
│   │   ├── jobs/[id]
│   │   └── update-status
│   ├── shipments/               # Shipping
│   │   ├── [id]/
│   │   ├── tracking
│   │   └── create
│   ├── admin/                   # Admin operations
│   │   ├── orders/
│   │   ├── quotations/
│   │   ├── inventory/
│   │   ├── users/
│   │   └── settings/
│   ├── member/                  # Member operations
│   │   ├── orders/
│   │   ├── quotations/
│   │   ├── documents/
│   │   └── settings
│   ├── auth/                    # Authentication
│   │   ├── signin
│   │   ├── signout
│   │   └── register
│   ├── public/                  # Public endpoints
│   │   ├── contact
│   │   ├── products
│   │   └── samples
│   └── ai/                      # AI operations
│       ├── parse
│       ├── review
│       └── specs
├── internal/                     # Internal/system endpoints
│   ├── dev/
│   ├── debug/
│   ├── cron/
│   └── supabase-mcp/
└── _health/                      # Health checks
    ├── revalidate
    └── status
```

## Implementation Plan

### Phase 5.1: Analysis & Documentation ✓
- [x] Route inventory completed
- [x] Categorization completed
- [x] Target structure defined

### Phase 5.2: Versioned API Structure (Recommended - LOW RISK)
**安全なアプローチン:** 既存ルートはそのまま維持し、新規ルートのみv1/に移行

1. Create `/api/v1/` directory structure
2. Create re-export routes that delegate to existing implementations
3. Maintain backward compatibility

Example:
```typescript
// api/v1/quotations/[id]/route.ts
export { GET, POST, PUT, DELETE } from '../../../../quotations/[id]/route'
```

### Phase 5.3: Full Migration (HIGH RISK - NOT RECOMMENDED)
- Move all 234 routes to new structure
- Update all import paths
- Risk of breaking existing integrations

## Recommendation

**SAFE APPROACH:** Phase 5.2 only
- Add versioned API structure without breaking existing routes
- Existing routes continue to work
- New v1 routes available for future use
- Minimal risk, maximum compatibility
