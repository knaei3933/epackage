# Member API Routes

<!-- Parent: ../AGENTS.md -->

## Purpose

Authenticated member/customer API endpoints for the B2B packaging quotation system. These routes provide protected access to user-specific data including orders, quotations, notifications, documents, addresses, and dashboard statistics.

## Architecture Overview

```
src/app/api/member/
├── orders/              # Order management (list, detail, create)
├── quotations/          # Quotation management (list, detail, convert)
├── notifications/       # User notifications and read status
├── addresses/           # Billing and delivery addresses
├── documents/           # Document management and download
├── dashboard/           # Dashboard statistics and summary data
├── invoices/            # Invoice management
├── shipments/           # Shipment tracking
├── ai-extraction/       # AI-powered document extraction
├── korea/               # Korea-specific features (corrections, data send)
├── auth/                # Member auth utilities (resend verification, etc)
├── certificates/        # Certificate generation
├── spec-sheets/         # Spec sheet generation and approval
├── files/               # File upload and extraction
├── hanko/               # Hanko (stamp) upload
├── samples/             # Sample request management
├── stock-in/            # Stock in operations
├── work-orders/         # Work order management
├── invites/             # Member invitation system
├── inquiries/           # Customer inquiries
├── settings/            # User settings
├── delete-account/      # Account deletion
└── status/              # Status endpoints
```

## Authentication Pattern

All member routes use **cookie-based authentication** via `@supabase/ssr`:

```typescript
// Get authenticated user from middleware headers
const userId = request.headers.get('x-user-id');

// Or use SSR client
const cookieStore = await cookies();
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: { get(name) { return cookieStore.get(name)?.value } } }
);

const { data: { user } } = await supabase.auth.getUser();
```

**Middleware sets headers:** The Next.js middleware validates auth tokens and sets `x-user-id` header before routes execute.

## Key Design Patterns

### Response Format

```typescript
// Success response
{
  success: true,
  data: {...},
  message: "操作が成功しました"
}

// Error response
{
  error: "エラーメッセージ",
  errorEn: "Error message in English",
  code: "ERROR_CODE",
  details: {...} // development only
}
```

### Authorization

All routes enforce **user ownership**:

```typescript
// Extra security - ensure user owns the resource
.eq('user_id', userId)

// RLS policies also enforce this at database level
```

### Progress Calculation

Orders use a predefined status order for progress percentages:

```typescript
const STATUS_ORDER = [
  'PENDING', 'QUOTATION_PENDING', 'QUOTATION',
  'QUOTATION_APPROVED', 'DATA_UPLOAD_PENDING',
  'DATA_RECEIVED', 'CORRECTION_IN_PROGRESS',
  'CUSTOMER_APPROVAL_PENDING', 'SPEC_APPROVED',
  'WORK_ORDER', 'CONTRACT_SENT', 'CONTRACT_SIGNED',
  'PRODUCTION', 'STOCK_IN', 'SHIPPED', 'DELIVERED'
];

const progressPercentage = Math.round(
  ((currentIndex + 1) / STATUS_ORDER.length) * 100
);
```

## Subdirectories

### `/api/member/orders/*`

Order management endpoints.

- **`GET /api/member/orders`** - List orders with filtering and pagination
  - Query params: `status`, `state`, `search`, `startDate`, `endDate`, `limit`, `offset`
  - Role-based: Admins see all, members see only their own
  - Returns: orders with progress percentage, quotations, order_items

- **`POST /api/member/orders`** - Create order from quotation (admin/operator only)
  - Uses RPC function `create_order_from_quotation` for ACID transaction
  - Creates order, order_items, updates quotation status, creates status history

- **`GET /api/member/orders/[id]`** - Get detailed order information
  - Includes: production stages, shipment info, documents, notes
  - Calculates progress percentage

- **`POST /api/member/orders/[id]`** - Add customer note to order

- **`GET /api/member/orders/[id]/comments`** - Get order comments
- **`POST /api/member/orders/[id]/comments`** - Add comment

- **`GET /api/member/orders/[id]/production-data`** - Production stage data
- **`GET /api/member/orders/[id]/production-logs`** - Production logs

- **`POST /api/member/orders/[id]/tracking`** - Update tracking info

- **`GET /api/member/orders/[id]/data-receipt`** - Data receipt files
- **`POST /api/member/orders/[id]/data-receipt`** - Upload data receipt

- **`GET /api/member/orders/[id]/approvals`** - Get approval requests
- **`POST /api/member/orders/[id]/approvals/[requestId]`** - Respond to approval

- **`POST /api/member/orders/[id]/request-cancellation`** - Request cancellation

- **`POST /api/member/orders/[id]/approve-modification`** - Approve modification

- **`POST /api/member/orders/confirm`** - Confirm order

- **`POST /api/member/orders/[id]/spec-approval`** - Approve specifications

- **`POST /api/member/orders/[id]/specification-change`** - Request spec change

- **`GET /api/member/orders/[id]/status-history`** - Status history

- **`POST /api/member/orders/[id]/design-revisions`** - Design revisions

- **`GET /api/member/orders/[id]/billing-address`** - Get billing address
- **`GET /api/member/orders/[id]/delivery-address`** - Get delivery address

**Key Features:**
- N+1 query fix: Single query with JOINs for quotations and order_items
- Transaction-safe order creation via PostgreSQL RPC
- Progress calculation based on status workflow

### `/api/member/quotations/*`

Quotation management endpoints.

- **`GET /api/member/quotations`** - List quotations with filtering
  - Query params: `status`, `limit`, `offset`
  - Returns quotations with items

- **`POST /api/member/quotations`** - Create new quotation
  - 100-yen ceiling rounding (反り上げ) for pricing
  - Default status: `QUOTATION_PENDING` (10-step workflow)
  - Inserts quotation + quotation_items with rollback on error

- **`GET /api/member/quotations/[id]`** - Get quotation detail
  - Authorization check: user must own the quotation

- **`DELETE /api/member/quotations/[id]`** - Delete draft quotation

- **`POST /api/member/quotations/[id]/approve`** - Approve quotation

- **`POST /api/member/quotations/[id]/confirm-payment`** - Confirm payment

- **`POST /api/member/quotations/[id]/convert`** - Convert to order

- **`GET /api/member/quotations/[id]/export`** - Export quotation

- **`GET /api/member/quotations/[id]/invoice`** - Generate invoice

- **`POST /api/member/quotations/[id]/save-pdf`** - Save PDF

**Key Features:**
- Price calculation with 100-yen rounding
- Support for B2B mode (company_id) and member mode (user_id)
- Total cost breakdown tracking

### `/api/member/notifications/*`

Notification management endpoints.

- **`GET /api/member/notifications`** - Get user notifications (limit: 50)
- **`POST /api/member/notifications`** - Create notification

- **`GET /api/member/notifications/[id]`** - Get notification detail
- **`DELETE /api/member/notifications/[id]`** - Delete notification

- **`POST /api/member/notifications/[id]/read`** - Mark as read

- **`POST /api/member/notifications/mark-all-read`** - Mark all as read
- **`DELETE /api/member/notifications/delete-all`** - Delete all

**Helper:** Uses `requireAuth()` from `@/lib/dashboard`

### `/api/member/addresses/*`

Address management endpoints.

#### Billing Addresses (`/api/member/addresses/billing/*`)

- **`GET /api/member/addresses/billing`** - List billing addresses
  - Sorted: `is_default` first, then `created_at` desc
  - Transforms snake_case to camelCase

- **`POST /api/member/addresses/billing`** - Create billing address
  - Validation with Zod schema
  - Unsets other defaults when setting new default

- **`GET /api/member/addresses/billing/[id]`** - Get specific address
- **`PUT /api/member/addresses/billing/[id]`** - Update address
- **`DELETE /api/member/addresses/billing/[id]`** - Delete address

**Validation Schema:**
```typescript
{
  companyName: string (required),
  postalCode: /^\d{3}-?\d{4}$/,
  prefecture: string (required),
  city: string (required),
  address: string (required),
  building: string (optional),
  taxNumber: string (optional),
  email: email (optional),
  phone: string (optional),
  isDefault: boolean (optional)
}
```

#### Delivery Addresses (`/api/member/addresses/delivery/*`)

- **`GET /api/member/addresses/delivery`** - List delivery addresses
- **`POST /api/member/addresses/delivery`** - Create delivery address
- **`GET /api/member/addresses/delivery/[id]`** - Get specific address
- **`PUT /api/member/addresses/delivery/[id]`** - Update address
- **`DELETE /api/member/addresses/delivery/[id]`** - Delete address

### `/api/member/documents/*`

Document management endpoints.

- **`GET /api/member/documents`** - List downloadable documents
  - Parallel fetch of quotations, contracts, files (N+1 fix)
  - Types: quote, contract, design, spec_sheet
  - Query params: `type`, `order_id`, `limit`, `offset`

- **`POST /api/member/documents/log`** - Log document access
  - Uses RPC `log_document_access`

- **`GET /api/member/documents/[id]/download`** - Download document
- **`GET /api/member/documents/history`** - Document access history

**Document Types:**
- `quote` - Quotation PDFs
- `contract` - Contract PDFs
- `design` - AI design files
- `spec_sheet` - Spec sheet documents

### `/api/member/dashboard/*`

Dashboard statistics endpoints.

- **`GET /api/member/dashboard`** - Complete dashboard data
  - Order statistics (total, pending, in production, shipped)
  - Recent orders
  - Unread notifications count
  - Upcoming deliveries
  - Order summary by status

- **`GET /api/member/dashboard/stats`** - Quick stats
- **`GET /api/member/dashboard/unified-stats`** - Unified statistics

**Fallback Pattern:** Uses direct queries if RPC functions fail.

### `/api/member/invoices/*`

Invoice management endpoints.

- **`GET /api/member/invoices`** - List invoices
- **`GET /api/member/invoices/[invoiceId]/download`** - Download invoice

### `/api/member/shipments/*`

Shipment tracking endpoints.

- **`GET /api/member/shipments`** - List shipments
- **`POST /api/member/shipments`** - Create shipment

### `/api/member/ai-extraction/*`

AI-powered document extraction.

- **`POST /api/member/ai-extraction/upload`** - Upload document for extraction
- **`GET /api/member/ai-extraction/status`** - Get extraction status
- **`POST /api/member/ai-extraction/approve`** - Approve extracted data

### `/api/member/korea/*`

Korea-specific features.

- **`GET /api/member/korea/corrections`** - List corrections
- **`POST /api/member/korea/corrections/[id]/upload`** - Upload correction file
- **`POST /api/member/korea/send-data`** - Send data to Korea system

### `/api/member/auth/*`

Member authentication utilities.

- **`POST /api/member/auth/resend-verification`** - Resend verification email
- **`POST /api/member/auth/verify-email`** - Verify email address

### `/api/member/certificates/*`

Certificate generation.

- **`POST /api/member/certificates/generate`** - Generate certificate

### `/api/member/spec-sheets/*`

Spec sheet management.

- **`POST /api/member/spec-sheets/generate`** - Generate spec sheet
- **`POST /api/member/spec-sheets/[id]/approve`** - Approve spec sheet
- **`POST /api/member/spec-sheets/[id]/reject`** - Reject spec sheet

### `/api/member/files/*`

File management.

- **`POST /api/member/files/upload`** - Upload file
- **`POST /api/member/files/[id]/extract`** - Extract data from file

### `/api/member/hanko/*`

Hanko (stamp) upload.

- **`POST /api/member/hanko/upload`** - Upload hanko image

### `/api/member/samples/*`

Sample request management.

- **`GET /api/member/samples`** - List sample requests
- **`POST /api/member/samples`** - Create sample request

### `/api/member/stock-in/*`

Stock in operations.

- **`POST /api/member/stock-in`** - Record stock in

### `/api/member/work-orders/*`

Work order management.

- **`GET /api/member/work-orders`** - List work orders
- **`POST /api/member/work-orders`** - Create work order

### `/api/member/invites/*`

Member invitation system.

- **`POST /api/member/invites/send`** - Send invitation
- **`POST /api/member/invites/accept`** - Accept invitation

### `/api/member/inquiries/*`

Customer inquiries.

- **`GET /api/member/inquiries`** - List inquiries
- **`POST /api/member/inquiries`** - Submit inquiry

### `/api/member/settings/*`

User settings.

- **`GET /api/member/settings`** - Get user settings
- **`PUT /api/member/settings`** - Update settings

### `/api/member/delete-account/*`

Account deletion.

- **`POST /api/member/delete-account`** - Request account deletion

### `/api/member/status/*`

Status endpoints.

- **`GET /api/member/status`** - Get user status

## Key Files

### Route Handlers

- **`orders/route.ts`** - Order list/create with N+1 query fix
- **`orders/[id]/route.ts`** - Order detail with production stages
- **`quotations/route.ts`** - Quotation list/create with 100-yen rounding
- **`quotations/[id]/route.ts`** - Quotation detail/delete
- **`notifications/route.ts`** - Notification list with auth helper
- **`addresses/billing/route.ts`** - Billing addresses with Zod validation
- **`dashboard/route.ts`** - Dashboard stats with RPC fallback
- **`documents/route.ts`** - Document list with parallel fetch

### Shared Utilities

- **`@/lib/supabase-ssr.ts`** - Next.js 15+ SSR client helpers
- **`@/lib/dashboard.ts`** - Dashboard helpers (`requireAuth`)
- **`@/lib/supabase.ts`** - Service client for privileged operations
- **`@/lib/performance-monitor.ts`** - API performance tracking

## For AI Agents

### When Modifying Member Routes

1. **Authentication**
   - Use `x-user-id` header from middleware OR
   - Use `createServerClient()` from `@supabase/ssr` with `getUser()`
   - Always verify user ownership: `.eq('user_id', userId)`

2. **Response Format**
   ```typescript
   return NextResponse.json({
     success: true,
     data: result,
     message: '操作が成功しました'
   });
   ```

3. **Error Handling**
   ```typescript
   console.error('[RouteName] Error:', error);
   return NextResponse.json(
     { error: 'ユーザー向けエラーメッセージ', errorEn: 'English message' },
     { status: 400 }
   );
   ```

4. **N+1 Query Prevention**
   - Use single query with JOINs for related data
   - Use `Promise.all()` for parallel independent queries
   - Use RPC functions for complex multi-table operations

5. **Validation**
   - Use Zod schemas for input validation
   - Transform snake_case to camelCase for frontend

6. **Transaction Safety**
   - Use RPC functions for multi-step operations
   - Manual rollback for insert cascades

### Member Route Template

```typescript
/**
 * [Feature] API Route
 *
 * Description in Japanese and English
 * - METHOD /api/member/path - Description
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証されていません。', errorEn: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Validate input
    const body = await request.json();
    // Add Zod validation here

    // Business logic with ownership check
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', userId) // Ownership check
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: '操作が成功しました'
    });

  } catch (error) {
    console.error('[Route] Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。', errorEn: 'Server error' },
      { status: 500 }
    );
  }
}
```

## Dependencies

### Required

- `@supabase/ssr` - Next.js 15+ Supabase SSR integration
- `@supabase/supabase-js` - Supabase client
- `next` - Next.js 15+ App Router
- `zod` - Schema validation

### Optional (feature-specific)

- `@supabase/functions-js` - Edge function invocation
- `jspdf` - PDF generation

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Common Issues

### Auth Errors
- **Issue**: `user_id` is null
- **Fix**: Ensure middleware sets `x-user-id` header OR use `createServerClient()` with `getUser()`

### Cookie Issues
- **Issue**: Cookies not setting in production
- **Fix**: Use `@supabase/ssr` with proper cookie handling

### N+1 Queries
- **Issue**: Slow order/quotation list loading
- **Fix**: Use single query with JOINs or `Promise.all()` for parallel fetches

### Transaction Failures
- **Issue**: Partial data saved on error
- **Fix**: Use PostgreSQL RPC functions for ACID transactions

## Migration Notes

- **Before**: `@supabase/auth-helpers-nextjs` (deprecated)
- **After**: `@supabase/ssr` (Next.js 15+)
- **Helper**: Use `createServerClient()` from `@supabase/ssr`

## Performance Optimization

1. **Single Query with JOINs**: Fix N+1 query problem
2. **Parallel Fetch**: Use `Promise.all()` for independent queries
3. **RPC Functions**: Use for complex multi-table operations
4. **Query Caching**: Cache static data where appropriate
5. **Performance Monitoring**: Track slow queries with `perfMonitor`

## Security Considerations

1. **RLS Policies**: All tables must have Row Level Security enabled
2. **Ownership Verification**: Always check `.eq('user_id', userId)`
3. **Input Validation**: Use Zod schemas for all inputs
4. **No Service Role**: Use anon key with RLS, never service role in member routes
5. **Error Messages**: Don't leak sensitive data in error responses
