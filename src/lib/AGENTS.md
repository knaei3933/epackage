<!-- Parent: ../AGENTS.md -->

# src/lib/ - Core Business Logic & Utility Libraries

## Purpose

This directory contains the core business logic, utility functions, and service integrations for the ePackage Lab platform. It handles pricing calculations, PDF generation, email services, Supabase database operations, authentication, shipping, and other essential backend functionality.

## Directory Structure

```
src/lib/
├── __tests__/              # Shared test utilities
├── ai/                     # AI-powered file parsing and spec extraction
├── ai-parser/              # AI parser for document processing
├── email/                  # Email templates and services
│   ├── templates/          # Individual email templates
│   └── __tests__/          # Email service tests
├── excel/                  # Excel generation and export
│   ├── __tests__/          # Excel export tests
│   └── EXCEL_EXPORT_USAGE.md
├── file-converter/         # File format conversion utilities
├── file-validator/         # File validation and ingestion
│   └── __tests__/
├── notifications/          # Notification system
│   ├── __tests__/
│   ├── batch.ts            # Batch notification operations
│   ├── history.ts          # Notification history
│   ├── index.ts            # Main notification exports
│   ├── optimization.ts     # Notification optimization
│   ├── preferences.ts      # User notification preferences
│   ├── push.ts             # Push notification service
│   └── sms.ts              # SMS notification service
├── pdf/                    # PDF generation utilities
│   ├── __tests__/
│   ├── contractPdfGenerator.ts
│   └── specSheetPdfGenerator.ts
├── pricing/                # Pricing calculation engines
│   ├── PriceCalculationEngine.ts
│   ├── test-engine.ts
│   └── types.ts
├── pricing_new/            # New pricing implementation (legacy)
├── rbac/                   # Role-based access control
├── seo/                    # SEO utilities
├── signature/              # Digital signature integration
├── state-machine/          # State machine utilities
│
├── account-deletion.ts      # Account deletion workflow
├── admin-notifications.ts   # Admin notification system
├── admin-notifications-integration.ts
├── analytics.ts             # Analytics tracking
├── animations.tsx           # Framer motion animations
├── api-auth.ts              # API authentication utilities
├── api-cache.ts             # API caching layer
├── api-error-handler.ts     # API error handling
├── api-fetch.ts             # Fetch wrapper utilities
├── api-middleware.ts        # API route middleware (auth, RBAC)
├── archive-data.ts          # Archive data management
├── array-helpers.ts         # Array utility functions
├── audit-logger.ts          # Audit logging service
├── auth-client.ts           # Client-side auth utilities
├── auth-fetcher.ts          # Auth fetch wrapper
├── auth-helpers.ts          # Server-side auth helpers
├── b2b-db.ts                # B2B database helpers
├── cache.ts                 # Caching utilities
├── catalogUtils.ts          # Product catalog utilities
├── customer-notifications.ts # Customer notification system
├── dashboard.ts             # Dashboard data queries (100KB+)
├── delivery-estimator.ts    # Delivery time estimation
├── delivery-note.ts         # Delivery note generation
├── dev-mode.ts              # Development mode utilities
├── downloadManager.ts       # File download management
├── email.ts                 # Main email service (64KB)
├── email-order.ts           # Order email notifications
├── email-templates.ts       # Email template renderer (188KB)
├── email-templates.examples.ts
├── email-templates-b2b.ts   # B2B email templates
├── ems-tracking.ts          # EMS shipment tracking
├── env-validation.ts        # Environment variable validation
├── excel-generator.ts       # Excel generation wrapper
├── fetchCache.ts            # Fetch caching
├── film-cost-calculator.ts  # Film cost calculation engine
├── gusset-data.ts           # Gusset pocket data
├── i18n.ts                  # Internationalization
├── image-optimization.ts    # Image optimization utilities
├── ip-validator.ts          # IP address validation
├── lazy-load.tsx            # Lazy loading components
├── logger.ts                # Logging utilities
├── material-width-selector.ts # Material width selection
├── mobile-optimization.ts   # Mobile optimization utilities
├── monitoring.ts            # Application monitoring
├── multi-quantity-calculator.ts # Multi-quantity pricing
├── network-optimizer.ts     # Network request optimization
├── payment.ts               # Payment processing
├── pdf-contracts.ts         # PDF contract generation
├── pdf-contracts-enhanced.ts
├── pdf-generator.ts         # Main PDF generator (100KB+)
├── pdf-generator.ts.backup
├── performance-monitor.ts   # Performance monitoring
├── pouch-cost-calculator.ts # Pouch cost calculation (68KB)
├── pricing.ts               # Legacy pricing utilities
├── pricing-engine.ts        # Pricing calculation engine
├── pricing.test.ts          # Pricing tests
├── product-content-helpers.ts # Product content helpers
├── product-data.ts          # Product data definitions (33KB)
├── production-actions.ts    # Production workflow actions
├── production-estimator.ts  # Production time estimation
├── products.ts              # Product utilities
├── quotation-api.ts         # Quotation API helpers
├── rate-limiter.ts          # API rate limiting
├── roll-film-utils.ts       # Roll film utilities
├── shipment-tracking-service.ts # Shipment tracking
├── shipping-carriers.ts     # Shipping carrier integrations
├── signature-integration.ts # Signature integration
├── sql-helpers.ts           # SQL query helpers
├── storage.ts               # Storage utilities
├── supabase.ts              # Supabase client (server-side)
├── supabase-authenticated.ts # Authenticated Supabase client
├── supabase-browser.ts      # Browser Supabase client
├── supabase-mcp.ts          # Supabase MCP integration
├── supabase-sql.ts          # Supabase SQL helpers
├── supabase-ssr.ts          # Supabase SSR utilities
├── test-pricing.ts          # Pricing test utilities
├── timestamp-service.ts     # Timestamp service
├── transaction.ts           # Transaction utilities
├── type-guards.ts           # TypeScript type guards
├── typography.ts            # Typography utilities
├── unified-notifications.ts # Unified notification system
├── unified-pricing-engine.ts # Unified pricing engine (92KB)
├── unified-pricing-engine.test.ts
└── utils.ts                 # General utilities
```

## Key Components

### Pricing & Cost Calculation

| File | Purpose |
|------|---------|
| `unified-pricing-engine.ts` | **Main pricing engine** - Handles all quote calculations with film cost, pouch cost, processing options, discounts |
| `pouch-cost-calculator.ts` | Pouch-specific cost calculation with material layers and loss rates |
| `film-cost-calculator.ts` | Film material cost calculation based on layers and dimensions |
| `pricing-engine.ts` | Legacy pricing calculation engine |
| `material-width-selector.ts` | Determines optimal material width (540mm/740mm) |
| `multi-quantity-calculator.ts` | Multi-quantity pricing comparison |

### PDF Generation

| File | Purpose |
|------|---------|
| `pdf-generator.ts` | **Main PDF generator** - Quotes, invoices, contracts (Japanese fonts, business formatting) |
| `pdf/contractPdfGenerator.ts` | Contract-specific PDF generation |
| `pdf/specSheetPdfGenerator.ts` | Spec sheet PDF generation |
| `pdf-generator.ts.backup` | Backup of previous PDF generator version |

### Email Services

| File | Purpose |
|------|---------|
| `email.ts` | **Main email service** - Development (Ethereal) and production (SendGrid/SES) |
| `email-templates.ts` | **Email template renderer** - Japanese business email templates |
| `email/` directory | Modular email service with templates for each notification type |
| `email-order.ts` | Order status email notifications |

### Database & Authentication

| File | Purpose |
|------|---------|
| `supabase.ts` | **Supabase client** - Server-side database client |
| `supabase-ssr.ts` | Supabase SSR utilities for Next.js |
| `supabase-mcp.ts` | Supabase MCP (Model Context Protocol) integration |
| `auth-helpers.ts` | **Server-side auth helpers** - JWT verification, role checking |
| `api-middleware.ts` | **API middleware** - Authentication wrapper for API routes |
| `api-auth.ts` | API authentication utilities |

### Dashboard & Business Logic

| File | Purpose |
|------|---------|
| `dashboard.ts` | **Dashboard queries** - Orders, quotations, samples, inquiries (100KB+) |
| `production-actions.ts` | Production workflow stage management |
| `shipping-carriers.ts` | Japanese carrier integrations (Yamato, Sagawa, Japan Post) |
| `quotation-api.ts` | Quotation API helpers |
| `archive-data.ts` | Archive data management |

### AI & File Processing

| Directory/File | Purpose |
|----------------|---------|
| `ai/` | AI-powered file parsing and spec extraction |
| `ai-parser/` | AI parser with confidence scoring |
| `file-validator/` | File validation and ingestion utilities |
| `file-converter/` | File format conversion |

### Notifications

| Directory/File | Purpose |
|----------------|---------|
| `notifications/` | Complete notification system with batch, push, SMS support |
| `admin-notifications.ts` | Admin notification management |
| `customer-notifications.ts` | Customer notification management |

### Excel Export

| Directory/File | Purpose |
|----------------|---------|
| `excel/` | Excel generation and export utilities |
| `excel/excelDataMapper.ts` | Maps quotation data to Excel format |
| `excel/pdfConverter.tsx` | PDF to Excel conversion |
| `excel/clientPdfGenerator.tsx` | Client-side PDF generation |

## For AI Agents

### Library Patterns

When working with this directory:

1. **Pricing Calculations**: Use `unified-pricing-engine.ts` for all pricing operations. It includes:
   - Film cost calculation
   - Pouch cost calculation
   - Processing options pricing
   - Discount application
   - Development logging

2. **Database Operations**: Use appropriate Supabase client:
   - `supabase.ts` - Server-side operations
   - `supabase-ssr.ts` - SSR operations in Next.js
   - `supabase-authenticated.ts` - Authenticated operations

3. **Authentication**: Always use `api-middleware.ts` `withAuth()` wrapper for API routes

4. **PDF Generation**: Use `pdf-generator.ts` for document generation. Supports:
   - Japanese fonts (Noto Sans JP)
   - Business formatting
   - Multiple document types (quotes, invoices, contracts)

5. **Email**: Use `email-templates.ts` `renderEmailTemplate()` for consistent email formatting

6. **Notifications**: Use files in `notifications/` directory for all notification operations

### Dependencies

Key external dependencies:

```json
{
  "@supabase/supabase-js": "^2.89.0",
  "@supabase/auth-helpers-nextjs": "^0.10.0",
  "@supabase/ssr": "^0.8.0",
  "jspdf": "latest",
  "html2canvas": "latest",
  "nodemailer": "latest",
  "@sendgrid/mail": "^8.1.6",
  "dompurify": "latest",
  "sanitize-html": "latest",
  "zod": "latest"
}
```

### Environment Variables

Required environment variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Email
FROM_EMAIL
ADMIN_EMAIL
SENDGRID_API_KEY
# or AWS SES credentials

# Shipping Carriers
YAMATO_API_KEY
SAGAWA_API_KEY
JP_POST_API_KEY
SEINO_API_KEY

# Development
NODE_ENV=development
ENABLE_DEV_MOCK_AUTH=true  # For mock auth testing
```

### Common Tasks

**Calculate Quote Price:**
```typescript
import { calculateUnifiedQuote } from '@/lib/unified-pricing-engine';

const result = await calculateUnifiedQuote({
  bagTypeId: 'standup_pouch',
  materialId: 'pet_al_pet',
  width: 130,
  height: 130,
  depth: 30,
  quantity: 1000,
  thicknessSelection: 'medium',
  postProcessingOptions: ['zipper', 'notch'],
  // ... other params
});
```

**Generate PDF:**
```typescript
import { generateQuotationPdf } from '@/lib/pdf-generator';

const pdfBuffer = await generateQuotationPdf(quotationData);
```

**Send Email:**
```typescript
import { renderEmailTemplate } from '@/lib/email-templates';

const { subject, body } = renderEmailTemplate('quote_created', data);
```

**Authenticated API Route:**
```typescript
import { withAuth } from '@/lib/api-middleware';

export const POST = withAuth(async (req, session, profile) => {
  // Authenticated handler logic
  return NextResponse.json({ success: true });
}, {
  requireRole: 'ADMIN',
  requireStatus: 'ACTIVE'
});
```

## Testing

- Unit tests: `__tests__/` directories within subdirectories
- Pricing tests: `unified-pricing-engine.test.ts`, `pricing.test.ts`
- Email tests: `email/__tests__/`
- Excel tests: `excel/__tests__/`
- PDF tests: `pdf/__tests__/`

Run tests with:
```bash
npm test                    # All tests
npm run test:unit          # Unit tests only
npm run test:api           # API tests
```

## Important Notes

1. **Japanese Language Support**: PDF generator and email templates support Japanese fonts and business formatting
2. **Role-Based Access**: Use `api-middleware.ts` for authentication and authorization
3. **Development Mode**: `dev-mode.ts` provides mock authentication and testing utilities
4. **Type Safety**: Most files export TypeScript types for their data structures
5. **Error Handling**: Use `api-error-handler.ts` for consistent error responses
6. **Audit Logging**: `audit-logger.ts` tracks all important operations
7. **Performance**: Many functions use caching via `unstable_cache` from Next.js
