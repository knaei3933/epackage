<!-- Parent: ../../AGENTS.md -->
# Admin Portal

## Purpose
Admin portal pages for managing orders, quotations, customers, shipments, and system settings. Uses RBAC (Role-Based Access Control) with Server Component architecture for secure data access.

## Directory Structure

```
src/app/admin/
├── layout.tsx                    # Admin layout with navigation
├── loader.ts                     # RBAC authentication & data fetch helpers
├── dashboard/                    # Dashboard with statistics
├── orders/                       # Order management
│   ├── page.tsx                 # Order list with filters
│   ├── AdminOrdersClient.tsx    # Interactive client component
│   └── [id]/                    # Order detail pages
│       ├── page.tsx
│       ├── AdminOrderDetailClient.tsx
│       ├── correction-upload/
│       └── payment-confirmation/
├── quotations/                   # Quotation management
│   ├── page.tsx
│   └── AdminQuotationsClient.tsx
├── approvals/                    # Member approval workflow
│   ├── page.tsx
│   └── AdminApprovalsClient.tsx
├── contracts/                    # Contract management
│   ├── page.tsx
│   └── [id]/                    # Contract detail & signature
├── customers/                    # Customer management
│   ├── page.tsx
│   ├── documents/
│   ├── orders/
│   │   └── [id]/
│   ├── profile/
│   └── support/
├── shipments/                    # Shipment tracking
│   ├── page.tsx
│   └── [id]/
├── inventory/                    # Inventory management
├── production/                   # Production status
├── settings/                     # System settings
├── notifications/                # Admin notifications
├── coupons/                      # Coupon management
├── leads/                        # Lead management
└── shipping/                     # Shipping configuration
```

## Key Files

### Server Components (Pages)
- **dashboard/page.tsx** - Main dashboard with order/quotation stats
- **orders/page.tsx** - Order list with status filtering
- **quotations/page.tsx** - Quotation list management
- **approvals/page.tsx** - Pending member approvals
- **contracts/page.tsx** - Contract listing
- **shipments/page.tsx** - Shipment tracking

### Client Components
- **dashboard/AdminDashboardClient.tsx** - Dashboard interactive features
- **orders/AdminOrdersClient.tsx** - Order list filters & actions
- **quotations/AdminQuotationsClient.tsx** - Quotation list filters
- **approvals/AdminApprovalsClient.tsx** - Member approval actions

### Shared Components (`src/components/admin/`)
- **AdminNavigation.tsx** - Navigation menu with role-based display
- **AdminNotificationCenter.tsx** - Real-time notification center
- **AdminOrderItemsEditor.tsx** - Inline order item editing
- **ShipmentCard.tsx**, **ShipmentCreateModal.tsx**, **ShipmentEditModal.tsx**
- **ContractDownloadButton.tsx**, **ContractSignatureRequestButton.tsx**
- **ProductionProgressVisualizer.tsx**, **ProductionStatusUpdateButton.tsx**
- **TrackingTimeline.tsx** - Shipment tracking visualization

### Authentication & Authorization
- **loader.ts** - `requireAdminAuth()`, `fetchOrderStats()`, `fetchQuotationStats()`
- Uses `@/lib/rbac/rbac-helpers.ts` for RBAC context
- Roles: `admin`, `operator`, `sales`, `accounting`

## API Routes (`src/app/api/admin/`)

### Orders
- `orders/route.ts` - List/create orders
- `orders/[id]/status/route.ts` - Update order status
- `orders/[id]/items/route.ts` - Order item management
- `orders/[id]/notes/route.ts` - Order notes
- `orders/[id]/billing-address/route.ts` - Billing address updates
- `orders/[id]/delivery-address/route.ts` - Delivery address updates
- `orders/bulk-status/route.ts` - Bulk status updates
- `orders/statistics/route.ts` - Order statistics

### Quotations
- `quotations/route.ts` - List quotations
- `quotations/[id]/route.ts` - Quotation details
- `quotations/[id]/cost-breakdown/route.ts` - Cost breakdown
- `quotations/[id]/export/route.ts` - Export quotation

### Users & Approvals
- `users/route.ts` - User management
- `users/approve/route.ts` - Approve users
- `users/reject/route.ts` - Reject users
- `users/[id]/approve/route.ts` - Approve specific user
- `users/pending/route.ts` - List pending users
- `approve-member/route.ts` - Member approval

### Notifications
- `notifications/route.ts` - List notifications
- `notifications/create/route.ts` - Create notification
- `notifications/[id]/read/route.ts` - Mark read
- `notifications/unread-count/route.ts` - Unread count

### Shipments
- `shipments/route.ts` - List/create shipments
- `shipments/[id]/tracking/route.ts` - Update tracking

### Inventory
- `inventory/update/route.ts` - Update inventory
- `inventory/items/route.ts` - Inventory items
- `inventory/adjust/route.ts` - Adjust inventory
- `inventory/receipts/route.ts` - Stock receipts

### Production
- `production/update-status/route.ts` - Update production status
- `production/jobs/route.ts` - Production jobs
- `production/jobs/[id]/route.ts` - Job details

### Settings
- `settings/route.ts` - System settings
- `settings/[key]/route.ts` - Specific setting
- `settings/customer-markup/route.ts` - Customer markup rates

## For AI Agents

### Admin Page Pattern

When creating new admin pages:

1. **Server Component Structure** (`page.tsx`):
```typescript
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdminAuth } from '../loader';
import AdminXClient from './AdminXClient';

async function Content({ searchParams }) {
  // RBAC check with required permissions
  const authContext = await requireAdminAuth(['permission:read']);

  // Server-side data fetch
  const data = await fetchData();

  return <AdminXClient authContext={authContext} initialData={data} />;
}

export default async function Page({ searchParams }) {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
export const dynamic = 'force-dynamic';
```

2. **RBAC Permissions** (from `@/lib/rbac/rbac-helpers.ts`):
   - User: `user:read`, `user:write`, `user:approve`, `user:delete`
   - Order: `order:read`, `order:create`, `order:update`, `order:delete`, `order:approve`
   - Quotation: `quotation:read`, `quotation:create`, `quotation:update`, `quotation:delete`, `quotation:approve`
   - Production: `production:read`, `production:update`, `production:manage`
   - Inventory: `inventory:read`, `inventory:update`, `inventory:adjust`
   - Shipment: `shipment:read`, `shipment:create`, `shipment:update`
   - Contract: `contract:read`, `contract:sign`, `contract:approve`
   - Settings: `settings:read`, `settings:write`
   - Notification: `notification:read`, `notification:send`

3. **Client Component** (`AdminXClient.tsx`):
   - Receives `authContext` with role and permissions
   - Uses API routes for mutations
   - Implements filters, pagination, and actions

4. **API Route Pattern** (`src/app/api/admin/xxx/route.ts`):
```typescript
import { withRBAC } from '@/lib/rbac/rbac-helpers';

export const GET = withRBAC(async (req, ctx) => {
  // ctx contains userId, role, permissions, isDevMode
  const data = await fetchData();
  return NextResponse.json(data);
}, { permissions: ['xxx:read'] });
```

### Dependencies

**Internal:**
- `@/lib/rbac/rbac-helpers.ts` - RBAC context & permissions
- `@/lib/supabase.ts` - Supabase client
- `@/components/admin/*` - Shared admin components
- `@/components/ui/*` - UI components

**External:**
- `next/navigation` - redirect, usePathname
- `@supabase/ssr` - Server-side Supabase client
- `lucide-react` - Icons

### Role-Based Access

| Role | Permissions |
|------|-------------|
| **admin** | All permissions |
| **operator** | Orders, quotations, production, inventory, shipments |
| **sales** | Quotations, orders (read), customers (read) |
| **accounting** | Orders (read), quotations (read), finance |

### Common Tasks

- **Add new admin page**: Create `page.tsx` with `requireAdminAuth()`, add to `AdminNavigation.tsx`
- **Add permission**: Update `Permission` type in `@/lib/rbac/rbac-helpers.ts`
- **Add API route**: Use `withRBAC()` wrapper with required permissions
- **Filter by role**: Check `authContext.role` in client components
