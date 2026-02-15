# API Routes

<!-- Parent: ../../AGENTS.md -->

## Purpose

Next.js API Routes (App Router) for the B2B packaging quotation system. These server-side endpoints handle authentication, data persistence, business logic, and integrations with external services (Supabase, SendGrid, signature providers).

## Architecture Overview

```
src/app/api/
├── admin/          # Admin-only endpoints (RLS bypass)
├── auth/           # Authentication (signin, signup, email verification)
├── member/         # Member/customer endpoints (authenticated)
├── public/         # Public endpoints (contact, products, quotations)
├── integrations/   # External service webhooks (signature, tracking)
└── lib/            # Shared API utilities (middleware, helpers)
```

## Key Design Patterns

### Authentication Flow
1. **Middleware-first**: `src/middleware.ts` validates auth tokens before routes
2. **SSR Client**: Uses `@supabase/ssr` for Next.js 15+ compatibility
3. **Role-based access**: `ADMIN`, `OPERATOR`, `MEMBER` roles enforced at route level
4. **Dev mode mock**: `ENABLE_DEV_MOCK_AUTH` for local testing

### API Response Pattern
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
  details: {...} // development only
}
```

## Subdirectories

### `/api/admin/*`

Admin-only endpoints with RLS bypass via service role client.

- **`/api/admin/approve-member`** - Approve/reject pending member registrations
- **`/api/admin/contracts`** - Contract workflow management
- **`/api/admin/coupons`** - Coupon CRUD operations
- **`/api/admin/dashboard`** - Dashboard statistics and metrics
- **`/api/admin/inventory`** - Inventory management and history
- **`/api/admin/notifications`** - Admin notification center
- **`/api/admin/orders`** - Order management with statistics
- **`/api/admin/production`** - Production job tracking
- **`/api/admin/quotations`** - Quotation management (search, filter, update)
- **`/api/admin/settings`** - System settings and customer markup
- **`/api/admin/shipments`** - Shipping and delivery tracking
- **`/api/admin/users`** - User management (approve, reject, list)

**Authentication**: `verifyAdminAuth()` from `@/lib/auth-helpers`
**Database**: Service role client (`SUPABASE_SERVICE_ROLE_KEY`)

### `/api/auth/*`

Public authentication endpoints.

- **`/api/auth/signin`** - User login (email/password)
- **`/api/auth/signout`** - User logout
- **`/api/auth/register`** - New user registration
- **`/api/auth/verify-email`** - Email verification
- **`/api/auth/forgot-password`** - Password reset request
- **`/api/auth/reset-password`** - Password reset confirmation
- **`/api/auth/session`** - Get current session

**Dev Mode**: Set `ENABLE_DEV_MOCK_AUTH=true` for mock authentication

### `/api/member/*`

Authenticated member/customer endpoints.

- **`/api/member/addresses`** - Billing/delivery address CRUD
- **`/api/member/ai-extraction`** - AI-powered document extraction
- **`/api/member/certificates`** - Certificate generation
- **`/api/member/dashboard`** - Dashboard statistics
- **`/api/member/documents`** - Document upload and history
- **`/api/member/invoices`** - Invoice management
- **`/api/member/inquiries`** - Customer inquiries
- **`/api/member/notifications`** - User notifications
- **`/api/member/orders`** - Order management (list, create, detail)
- **`/api/member/quotations`** - Quotation management
- **`/api/member/samples`** - Sample requests
- **`/api/member/settings`** - User settings
- **`/api/member/shipments`** - Shipment tracking

**Authentication**: Cookie-based auth via `@supabase/ssr`

### `/api/quotations/*`

Quotation system endpoints.

- **`/api/quotations/save`** - Save quotation (public + authenticated)
- **`/api/quotation/pdf`** - Generate PDF from quotation data

**Public Access**: Supports guest quotations (requires login to save)

### `/api/contact/*`

- **`/api/contact`** - Contact form submission with SendGrid emails

**Rate Limiting**: 10 requests per 15 minutes

### `/api/products/*`

- **`/api/products`** - Product catalog
- **`/api/products/search`** - Product search
- **`/api/products/categories`** - Product categories

### `/api/shipments/*`

- **`/api/shipments`** - Shipment CRUD operations
- **`/api/shipments/[id]/track`** - Track individual shipment
- **`/api/shipments/[id]/label`** - Generate shipping labels
- **`/api/shipments/[id]/schedule-pickup`** - Schedule carrier pickup
- **`/api/shipments/bulk-create`** - Bulk shipment creation

### `/api/signature/*`

Digital signature integration (webhook-based).

- **`/api/signature/send`** - Send signature request
- **`/api/signature/webhook`** - Signature provider webhook
- **`/api/signature/status/[id]`** - Get signature status
- **`/api/signature/cancel`** - Cancel signature request
- **`/api/signature/local/save`** - Save locally signed document

### `/api/contract/*`

Contract management.

- **`/api/contract/pdf`** - Generate contract PDF
- **`/api/contract/timestamp`** - Contract timestamping
- **`/api/contract/timestamp/validate`** - Validate timestamp

### `/api/ai/*` & `/api/ai-parser/*`

AI-powered features.

- **`/api/ai/parse`** - AI document parsing
- **`/api/ai/specs`** - Spec sheet generation
- **`/api/ai/review`** - Document review
- **`/api/ai-parser/upload`** - Upload for AI extraction
- **`/api/ai-parser/extract`** - Extract data from document
- **`/api/ai-parser/approve`** - Approve extracted data
- **`/api/ai-parser/reprocess`** - Re-process document

### `/api/files/*`

File upload and validation.

- **`/api/files/validate`** - Validate uploaded files
- **`/api/b2b/files/upload`** - B2B file upload endpoint

### `/api/registry/*`

External registry lookups.

- **`/api/registry/postal-code`** - Japanese postal code lookup
- **`/api/registry/corporate-number`** - Corporate number validation

### `/api/samples/*`

Sample request management.

- **`/api/samples`** - Sample requests CRUD
- **`/api/samples/request`** - Submit sample request

## Key Files

### Route Handlers

- **`/api/auth/signin/route.ts`** - Login with mock auth support
- **`/api/member/orders/route.ts`** - Unified B2B + member orders with RPC transaction
- **`/api/admin/quotations/route.ts`** - Admin quotation management with 10-step workflow
- **`/api/quotations/save/route.ts`** - Quotation creation with items
- **`/api/contact/route.ts`** - Contact form with Zod validation

### Shared Utilities

- **`@/lib/supabase-ssr.ts`** - Next.js 15+ SSR client helpers
- **`@/lib/auth-helpers.ts`** - Admin auth verification
- **`@/lib/api-middleware.ts`** - API middleware (rate limiting, logging)
- **`@/lib/rate-limiter.ts`** - Rate limiting utilities

## For AI Agents

### When Modifying API Routes

1. **Authentication Check**
   - Admin routes: Use `verifyAdminAuth()` from `@/lib/auth-helpers`
   - Member routes: Use `getAuthenticatedUser()` from `@/lib/supabase-ssr`
   - Public routes: No auth required

2. **Response Format**
   ```typescript
   // Always return consistent structure
   return NextResponse.json({
     success: true,
     data: result,
     message: "Success message"
   });
   ```

3. **Error Handling**
   ```typescript
   // Log errors with context
   console.error('[RouteName] Error:', error);

   // Return user-friendly messages
   return NextResponse.json(
     { error: 'ユーザー向けエラーメッセージ' },
     { status: 400 }
   );
   ```

4. **Rate Limiting**
   - Use `withRateLimit()` wrapper for public endpoints
   - Create limiter instances: `const limiter = createApiRateLimiter()`

5. **Validation**
   - Use Zod schemas for input validation
   - Type-safe database operations with `Database['public']['Tables']['...']['Insert']`

6. **Transaction Safety**
   - Use Supabase RPC functions for multi-step operations
   - Manual rollback with try/catch for complex workflows

### Route Pattern Template

```typescript
/**
 * [Feature] API Route
 *
 * Description in Japanese and English
 * - METHOD /api/path - Description
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseSSRClient } from '@/lib/supabase-ssr';
import { z } from 'zod';

// Schema validation
const schema = z.object({
  field: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const { client: supabase } = createSupabaseSSRClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // Validate input
    const body = schema.parse(await request.json());

    // Business logic
    const { data, error } = await supabase
      .from('table')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: '操作が成功しました'
    });

  } catch (error) {
    console.error('[Route] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '無効な入力データ', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
```

## Dependencies

### Required

- `@supabase/ssr` - Next.js 15+ Supabase integration
- `@supabase/supabase-js` - Supabase client
- `next` - Next.js 15+ App Router
- `zod` - Schema validation

### Optional (feature-specific)

- `@sendgrid/mail` - Email sending
- `jspdf` - PDF generation
- `xlsx` - Excel export

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Auth
ENABLE_DEV_MOCK_AUTH=true  # Dev mode only

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=noreply@example.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Testing API Routes

```bash
# Test authentication
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test protected route
curl http://localhost:3000/api/member/orders \
  -H "Authorization: Bearer TOKEN"

# Test admin route
curl http://localhost:3000/api/admin/quotations \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"
```

## Common Issues

### Auth Errors
- **Issue**: `auth.uid() is null` in RLS policies
- **Fix**: Use service role client for admin endpoints

### Cookie Issues
- **Issue**: Cookies not setting in production
- **Fix**: Ensure `domain` is set only in production (localhost rejects domain attribute)

### Transaction Failures
- **Issue**: Partial data saved on error
- **Fix**: Use PostgreSQL RPC functions for ACID transactions

## Migration Notes

- **Before**: `@supabase/auth-helpers-nextjs` (deprecated)
- **After**: `@supabase/ssr` (Next.js 15+)
- **Helper**: Use `createSupabaseSSRClient()` from `@/lib/supabase-ssr`

## Performance Optimization

1. **Single Query with JOINs**: Fix N+1 query problem
2. **RPC Functions**: Use for complex multi-table operations
3. **Rate Limiting**: Prevent abuse on public endpoints
4. **Response Compression**: Enable Next.js compression
5. **Query Caching**: Cache static data (products, categories)

## Security Considerations

1. **RLS Policies**: All tables must have Row Level Security enabled
2. **Input Validation**: Use Zod schemas for all inputs
3. **Rate Limiting**: Apply to all public endpoints
4. **Admin Verification**: Always check role on admin routes
5. **Service Role**: Never expose service role key to client
6. **CORS**: Configure properly for external webhooks

## Future Enhancements

- [ ] API versioning (`/api/v2/...`)
- [ ] OpenAPI/Swagger documentation
- [ ] Request logging middleware
- [ ] Response caching strategy
- [ ] GraphQL API option
- [ ] Webhook signature verification
- [ ] API request batching
