# Admin API Routes

<!-- Parent: ../../AGENTS.md -->

## Purpose

Admin API routes provide backend endpoints for administrative operations including user management, quotation management, order processing, notifications, inventory control, and system settings. All routes require ADMIN role authentication and use service role clients to bypass RLS when necessary.

## Key Files

### Core Route Handlers

| File | Purpose | Methods |
|------|---------|---------|
| `users/route.ts` | User management (list, update, delete) | GET, PATCH, DELETE |
| `quotations/route.ts` | Quotation management (list, update, delete) | GET, PATCH, DELETE |
| `orders/route.ts` | Order listing and filtering | GET |
| `notifications/route.ts` | Admin notification management | GET, POST |
| `settings/route.ts` | System settings management | GET, POST |

### Authentication & Middleware

| File | Purpose |
|------|---------|
| `../../lib/auth-helpers.ts` | Admin authentication verification (verifyAdminAuth) |
| `../../lib/api-middleware.ts` | API authentication middleware (withAuth, withAdmin) |
| `../../lib/supabase-ssr.ts` | Supabase SSR client creation |
| `../../lib/supabase.ts` | Service role client creation |

## Subdirectories

### `users/`
User management endpoints
- `route.ts` - Main user CRUD operations
- `pending/route.ts` - List pending users
- `approve/route.ts` - Batch approve users
- `reject/route.ts` - Reject user applications
- `[id]/approve/route.ts` - Approve specific user
- `[id]/addresses/route.ts` - Manage user addresses

### `quotations/`
Quotation management endpoints
- `route.ts` - List and manage quotations
- `[id]/route.ts` - Get/update specific quotation
- `[id]/cost-breakdown/route.ts` - Get detailed cost breakdown
- `[id]/export/route.ts` - Export quotation to PDF/Excel

### `orders/`
Order management endpoints
- `route.ts` - List all orders
- `[id]/route.ts` - Get order details
- `[id]/status/route.ts` - Update order status
- `[id]/items/route.ts` - Update order items
- `[id]/notes/route.ts` - Manage order notes
- `[id]/cancellation/route.ts` - Handle order cancellations
- `[id]/status-history/route.ts` - Get status change history
- `[id]/billing-address/route.ts` - Update billing address
- `[id]/delivery-address/route.ts` - Update delivery address
- `[id]/data-receipt/route.ts` - Handle data receipt uploads
- `[id]/send-to-korea/route.ts` - Send order data to Korea
- `[id]/correction/route.ts` - Handle specification corrections
- `bulk-status/route.ts` - Bulk status updates
- `statistics/route.ts` - Order statistics

### `notifications/`
Admin notification system
- `route.ts` - List notifications
- `create/route.ts` - Create new notification
- `[id]/route.ts` - Get/delete notification
- `[id]/read/route.ts` - Mark as read
- `unread-count/route.ts` - Get unread count

### `inventory/`
Inventory management
- `items/route.ts` - List inventory items
- `update/route.ts` - Update inventory quantities
- `adjust/route.ts` - Manual inventory adjustments
- `receipts/route.ts` - Record inventory receipts
- `record-entry/route.ts` - Record inventory entries
- `history/[productId]/route.ts` - Get product inventory history

### `production/`
Production management
- `jobs/route.ts` - List production jobs
- `jobs/[id]/route.ts` - Get/update production job
- `update-status/route.ts` - Update production status
- `[orderId]/route.ts` - Get order production details

### `contracts/`
Contract management
- `[contractId]/download/route.ts` - Download contract PDF
- `[contractId]/send-signature/route.ts` - Send for signature
- `workflow/route.ts` - Contract workflow actions
- `send-reminder/route.ts` - Send signature reminders
- `request-signature/route.ts` - Request signatures

### `settings/`
System configuration
- `route.ts` - System settings CRUD
- `[key]/route.ts` - Get/update specific setting
- `customer-markup/route.ts` - Customer markup rules
- `designer-emails/route.ts` - Designer email notifications

### `coupons/`
Coupon management
- `route.ts` - List and create coupons
- `[id]/route.ts` - Update/delete coupons

### `shipping/`
Shipping and delivery
- `shipments/route.ts` - List shipments
- `tracking/route.ts` - Tracking lookup
- `deliveries/complete/route.ts` - Mark deliveries complete

### `dashboard/`
Admin dashboard data
- `statistics/route.ts` - Dashboard statistics
- `unified-stats/route.ts` - Unified statistics endpoint

## For AI Agents

### Common Admin API Patterns

When working with admin API routes:

1. **Authentication First**: All routes must call `verifyAdminAuth(request)` or use `withAdminAuth` wrapper
2. **Service Role for Bypassing RLS**: Use `createServiceClient()` when you need to access all records
3. **SSR Client for User Context**: Use `createServerClient()` from `@supabase/ssr` for cookie-based auth
4. **Error Responses**: Use standardized error responses with appropriate status codes
5. **Logging**: Include console logs with `[API Name]` prefix for debugging

### Authentication Pattern

```typescript
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  // Step 1: Verify admin authentication
  const auth = await verifyAdminAuth(request);
  if (!auth) {
    return unauthorizedResponse();
  }

  // Step 2: Use service client for admin operations
  const supabase = createServiceClient();

  // Step 3: Execute admin logic
  // ...
}
```

### Response Format

**Success Response:**
```typescript
{
  success: true,
  data: { /* response data */ },
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

**Error Response:**
```typescript
{
  error: string,
  code?: string,
  details?: string
}
```

### Admin Role Types

- `ADMIN` - Full system access
- `OPERATOR` - Operations management
- `SALES` - Sales and quotations
- `ACCOUNTING` - Financial operations
- `PRODUCTION` - Production management

### Common Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status
- `sortBy` - Sort field (default: created_at)
- `sortOrder` - asc or desc (default: desc)
- `search` - Search query string

## Dependencies

### External Packages
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side rendering client
- `next/server` - Next.js API utilities
- `zod` - Schema validation

### Internal Libraries
- `@/lib/auth-helpers` - Authentication verification
- `@/lib/api-middleware` - API middleware
- `@/lib/supabase-ssr` - SSR client factory
- `@/lib/supabase` - Service role client factory
- `@/lib/admin-notifications` - Notification utilities
- `@/types/database` - Database type definitions
- `@/types/order-status` - Order status types

### Database Tables
- `profiles` - User profiles and roles
- `quotations` - Quotation records
- `orders` - Order records
- `unified_notifications` - Notification system
- `inventory` - Inventory management
- `inventory_transactions` - Inventory history
- `system_settings` - System configuration
- `coupons` - Coupon codes
- `production_jobs` - Production tracking
- `contracts` - Contract management

## Status Values (10-Step Workflow)

Quotation and Order statuses follow a 10-step workflow:
- `QUOTATION_PENDING` - Initial quotation state
- `QUOTATION_APPROVED` - Quotation approved by customer
- `PAYMENT_PENDING` - Waiting for payment
- `PAYMENT_CONFIRMED` - Payment received
- `DATA_SUBMISSION` - Customer submitting data
- `DATA_CONFIRMED` - Data verified
- `PRODUCTION_PENDING` - Ready for production
- `PRODUCTION_IN_PROGRESS` - Manufacturing
- `SHIPPING_PREP` - Preparing shipment
- `SHIPPED` - Order shipped
- `DELIVERED` - Order delivered
- `REJECTED` - Quotation/order rejected
- `CANCELLED` - Order cancelled
- `EXPIRED` - Quotation expired

## Security Notes

1. **Always verify authentication** before any database operations
2. **Use service role sparingly** - only when RLS must be bypassed
3. **Log all admin actions** for audit trails
4. **Validate all input** using Zod schemas
5. **DEV_MODE** supports development mock authentication with `x-dev-mode: true` header
