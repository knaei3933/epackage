<!-- Parent: ../../AGENTS.md -->

# src/app/admin/quotations/ - Admin Quotation Management

**Purpose:** Admin quotation management - view, approve, reject, and manage customer quotations.

## Directory Structure

```
admin/quotations/
├── page.tsx                      # Admin quotations page (Server Component)
├── AdminQuotationsClient.tsx     # Client component for interactive features
└── [id]/
    └── page.tsx                  # Quotation detail page (if exists)
```

## Key Files

### Admin Quotations Page (`page.tsx`)
- **Server Component** with RBAC authentication
- Uses `requireAdminAuth()` with permission: `quotation:read`
- Suspense boundary for async data loading
- Status-based filtering

```typescript
// RBAC authentication pattern
authContext = await requireAdminAuth(['quotation:read']);
```

### Admin Client Component (`AdminQuotationsClient.tsx`)
- Client component for interactive operations:
  - Status filtering (all, draft, sent, approved, rejected, expired)
  - Quotation detail modal
  - Approval/rejection actions
  - PDF download (using stored pdf_url from member downloads)
  - Cost breakdown viewing

## For AI Agents

### Admin Quotation Patterns

When working with admin quotation pages:

1. **RBAC Authentication**:
   - Always use `requireAdminAuth()` with specific permissions
   - Available permissions: `quotation:read`, `quotation:write`, `quotation:approve`
   - Auth context includes: userId, role, userName, isDevMode

2. **Status Management**:
   - DRAFT: New quotation, pending admin review
   - SENT: Sent to customer, awaiting response
   - APPROVED: Approved by admin, customer can convert to order
   - REJECTED: Rejected by admin
   - EXPIRED: Past valid_until date
   - CONVERTED: Already converted to order

3. **PDF Download Pattern**:
   ```typescript
   // Use stored pdf_url from Supabase Storage
   // (Saved by member when they download PDF)
   if (quotation.pdf_url) {
     window.open(quotation.pdf_url, '_blank');
   }
   ```

4. **Approval Actions**:
   - Approve: Sets status to APPROVED, enables customer order conversion
   - Reject: Sets status to REJECTED, requires rejection reason
   - Both actions trigger notification to customer

5. **Cost Breakdown**:
   - Display detailed cost calculation breakdown
   - Shows: base cost, material cost, printing cost, post-processing cost
   - Helps admin verify pricing accuracy

### Common Tasks

- **Add new permission**: Update `requireAdminAuth()` call with new permission string
- **Modify status workflow**: Update status options and transition logic
- **Add bulk actions**: Implement multi-select and batch operations
- **Custom PDF for admin**: Create separate PDF template with admin notes

### Dependencies

- `@supabase/supabase-js@^2.89.0` - Database client
- `swr@^2.3.8` - Client-side data fetching
- `lucide-react` - Icons

### Related Files

- `src/app/admin/loader.ts` - Admin authentication helper
- `src/app/api/admin/quotations/route.ts` - Admin quotation API
- `src/lib/admin-notifications.ts` - Admin notification system
- `src/types/dashboard.ts` - Quotation type definitions

### API Endpoints Used

- `GET /api/admin/quotations` - List quotations with filtering
- `GET /api/admin/quotations/[id]` - Get quotation details
- `POST /api/admin/quotations/[id]/approve` - Approve quotation
- `POST /api/admin/quotations/[id]/reject` - Reject quotation
- `GET /api/admin/quotations/[id]/cost-breakdown` - Get cost breakdown
