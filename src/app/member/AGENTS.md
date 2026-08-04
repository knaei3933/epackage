<!-- Parent: ../../AGENTS.md -->

# Member Portal Directory

## Purpose
Member/customer portal pages for authenticated users. This directory contains all customer-facing dashboard, order management, quotation, and account management functionality.

## Directory Structure

```
member/
├── billing-addresses/    # Billing address management
├── contracts/            # Contract management (signed contracts)
├── dashboard/            # Member dashboard home (stats, overview)
├── deliveries/           # Delivery address management
├── edit/                 # 廃止（/profile へリダイレクト・後方互換）
├── inquiries/            # Customer inquiries/messages
├── invoices/             # Invoice management
├── layout.tsx            # Member portal layout (with sidebar)
├── notifications/        # Notification center
├── orders/               # Order management
│   ├── [id]/            # Order detail pages
│   ├── history/         # Order history
│   ├── new/             # New order creation
│   └── reorder/         # Reorder from history
├── profile/              # プロフィール表示 + 連絡先インライン編集
├── quotations/           # Quotation management
│   └── [id]/            # Quotation detail pages
├── samples/              # Sample requests
└── settings/             # Account settings
```

## Key Files

### Layout & Navigation
- **`layout.tsx`** - Member portal layout with sidebar navigation, authentication check, error boundary

### Dashboard
- **`dashboard/page.tsx`** - Main member dashboard with statistics cards, recent activity, announcements
  - Server component for initial data fetch (SSR)
  - Client component (`UnifiedDashboardClient`) for SWR auto-refresh
  - Shows: orders, quotations, samples, inquiries, notifications

### Orders
- **`orders/page.tsx`** - Unified orders list with tabs (active/history/reorder)
  - Search, filter, sort functionality
  - Progress tracking with progress bars
  - Status-based filtering (10-step workflow)
- **`orders/[id]/page.tsx`** - Order detail page
  - Order information accordion
  - Design workflow section
  - File upload for data receipt
  - Modification approval workflow
  - Status guidance messages per workflow state

### Quotations
- **`quotations/page.tsx`** - Server component fetching quotations with pagination
- **`quotations/[id]/page.tsx`** - Quotation detail with PDF download, conversion to order

### Address Management
- **`billing-addresses/page.tsx`** - Billing address CRUD
- **`deliveries/page.tsx`** - Delivery address CRUD

## Member Page Patterns

### Authentication Flow
All member pages require authentication. Use this pattern:

```typescript
// Server Component Pattern
import { requireAuth } from '@/lib/dashboard';
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await requireAuth(); // Redirects to /auth/signin if not auth
  // ... fetch data using user.id
}
```

```typescript
// Client Component Pattern
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin?redirect=/member/current-page');
    }
  }, [user, isLoading, router]);
}
```

### Data Fetching Patterns

#### Server-Side (Recommended)
```typescript
import { getOrders, getQuotations } from '@/lib/dashboard';

const orders = await getOrders(userId);
const quotations = await getQuotations(userId);
```

#### Client-Side with SWR
```typescript
import useSWR from 'swr';

const { data, error, isLoading } = useSWR(
  user?.id ? `/api/member/orders` : null,
  fetcher
);
```

### Order Status Workflow

The system uses a 10-step workflow:

1. `DATA_UPLOAD_PENDING` - Data receipt waiting
2. `DATA_UPLOADED` - Data received
3. `CORRECTION_IN_PROGRESS` - Correction work in progress
4. `CORRECTION_COMPLETED` - Correction completed
5. `CUSTOMER_APPROVAL_PENDING` - Customer approval waiting
6. `PRODUCTION` - In production
7. `READY_TO_SHIP` - Ready for shipment
8. `SHIPPED` - Shipped
9. `DELIVERED` - Delivered
10. `CANCELLED` - Cancelled

Active statuses (1-7) show in "Processing" tab.
History statuses (8-10) show in "History" tab.

### Status-Based UI Messages

Each order status shows appropriate guidance:

```typescript
{order.status === 'CUSTOMER_APPROVAL_PENDING' && (
  <div className="bg-orange-50 border-orange-300">
    📋 教正データの承認待ちです
  </div>
)}
```

## Components Used

### From `@/components/dashboard`
- `SidebarNavigation` - Left sidebar with menu items
- `DashboardHeader` - Top header with user info
- `DashboardStatsCard` - Statistics display card
- `AnnouncementCard` - Announcements display
- `EmptyState` - Empty state placeholder

### From `@/components/member`
- `OrderInfoAccordion` - Collapsible order information
- `OrderAddressInfo` - Delivery/billing address display
- `OrderItemsSummary` - Order items summary
- `DesignWorkflowSection` - Design revision workflow UI
- `ModificationApprovalSection` - Admin modification approval
- `AddressSelectModal` - Address selection modal

### From `@/components/orders`
- `OrderStatusBadge` - Status badge with locale support
- `OrderStatusTimeline` - Visual timeline of order progress
- `OrderActions` - Order action buttons
- `OrderCommentsSection` - Comments and communication
- `CustomerApprovalSection` - Customer approval UI

### From `@/components/ui`
- `Card`, `Button`, `Input` - Base UI components
- `FullPageSpinner` - Full-page loading state
- `PageLoadingState` - Page-level loading state

## Dependencies

### Libraries
- `next/navigation` - Next.js navigation (useRouter, useParams, redirect)
- `date-fns` - Date formatting with Japanese locale
- `swr` - Client-side data fetching and caching
- `lucide-react` - Icons

### Internal Libraries
- `@/lib/dashboard` - Dashboard data fetching functions
- `@/lib/supabase` - Supabase client creation
- `@/contexts/AuthContext` - Authentication context
- `@/types/dashboard` - TypeScript types for dashboard data
- `@/constants/enToJa` - English to Japanese translations

### API Routes
- `/api/member/orders` - Order CRUD operations
- `/api/member/quotations` - Quotation CRUD operations
- `/api/member/documents` - Document download logging
- `/api/member/addresses/*` - Address management
- `/api/member/notifications/*` - Notification management

## Menu Items

Defined in `@/components/dashboard/menuItems.ts`:

| ID | Label | Icon | Route |
|----|-------|------|-------|
| dashboard | マイページトップ | Home | /member/dashboard |
| samples | サンプル依頼 | Package | /member/samples |
| inquiries | お問い合わせ | MessageSquare | /member/inquiries |
| quotations | 見積管理 | FileText | /member/quotations |
| orders | 注文 | ShoppingCart | /member/orders (with submenu) |
| deliveries | 納品先管理 | Truck | /member/deliveries |
| billing-addresses | 請求先管理 | Receipt | /member/billing-addresses |
| invoices | 請求書 | FileText | /member/invoices |
| contracts | 契約管理 | FileCheck | /member/contracts |
| profile | プロフィール | User | /member/profile |
| settings | 設定 | Settings | /member/settings |

## For AI Agents

### When Adding New Member Pages

1. **Add to menuItems.ts** - Include in sidebar navigation
2. **Use authentication pattern** - Server: `requireAuth()` or Client: `useAuth()`
3. **Set `dynamic = 'force-dynamic'`** - For authenticated pages
4. **Add to types** - Update `@/types/dashboard.ts` if needed
5. **Create API route** - Add to `/api/member/` if data operations needed
6. **Test navigation** - Verify sidebar menu link works

### Common Patterns

#### Page with Server-Side Data
```typescript
import { requireAuth } from '@/lib/dashboard';
import { getYourData } from '@/lib/dashboard';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await requireAuth();
  const data = await getYourData(user.id);
  return <YourComponent data={data} />;
}
```

#### Page with Client-Side Data
```typescript
'use client';
import { useAuth } from '@/contexts/AuthContext';
import useSWR from 'swr';

export default function Page() {
  const { user } = useAuth();
  const { data } = useSWR(user?.id ? `/api/member/your-endpoint` : null);
  // ...
}
```

#### Hybrid (SSR + SWR)
```typescript
// page.tsx (Server Component)
import { getYourDataServer } from './loader';
import YourClient from './YourClient';

export default async function Page() {
  const user = await requireAuth();
  const initialData = await getYourDataServer(user.id);
  return <YourClient initialData={initialData} userId={user.id} />;
}
```

## Related Documentation
- Parent: [../../AGENTS.md](../../AGENTS.md)
- Dashboard Library: [../../lib/dashboard.ts](../../lib/dashboard.ts)
- Dashboard Types: [../../types/dashboard.ts](../../types/dashboard.ts)
- API Routes: [../../api/member/](../../api/member/)
