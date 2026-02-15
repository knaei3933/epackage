<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-08 | Updated: 2026-02-08 -->

# src/ - Application Source Code

## Purpose
Main application source code directory for the EpackageLab B2B e-commerce platform. Contains all React components, pages, API routes, libraries, and business logic.

## Key Files

| File | Description |
|------|-------------|
| `middleware.ts` | Next.js middleware for authentication, CSRF protection, route protection |
| `app/layout.tsx` | Root layout with providers (Theme, Language, Auth) |
| `app/globals.css` | Global styles and Tailwind directives |
| `lib/supabase.ts` | Supabase client configuration |
| `lib/supabase-ssr.ts` | Supabase SSR helpers |
| `lib/unified-pricing-engine.ts` | Core pricing calculation engine |
| `contexts/AuthContext.tsx` | Authentication state management |
| `contexts/LanguageContext.tsx` | i18n language provider |
| `contexts/QuoteContext.tsx` | Quotation wizard state |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages and API routes |
| `components/` | React components (UI, features, layout) |
| `lib/` | Utility libraries, business logic, external services |
| `contexts/` | React Context providers |
| `hooks/` | Custom React hooks |
| `types/` | TypeScript type definitions |
| `utils/` | Utility functions |
| `constants/` | Application constants |
| `data/` | Static data (catalog, templates, etc.) |
| `locales/` | i18n translations (ja, en, ko) |
| `mocks/` | Mock data for testing |
| `styles/` | Additional style modules |
| `tests/` | Unit and integration tests |

## Directory Structure Detail

### `app/`
**Next.js 15 App Router structure**

- **Pages**: `page.tsx` files define routes
  - `/` - Homepage
  - `/catalog/*` - Product catalog
  - `/member/*` - Member dashboard (protected)
  - `/admin/*` - Admin dashboard (protected)
  - `/auth/*` - Authentication pages

- **API Routes**: `app/api/*/route.ts`
  - `/api/auth/*` - Authentication endpoints
  - `/api/member/*` - Member API (SSR authenticated)
  - `/api/admin/*` - Admin API (role-based access)
  - `/api/contact` - Contact form submissions
  - `/api/quotation` - Quotation PDF generation
  - `/api/shipments/*` - Shipping management

### `components/`
**React component library**

- `admin/` - Admin-specific components (dashboard, tables, widgets)
- `auth/` - Authentication forms (login, register)
- `catalog/` - Product catalog components (cards, filters, modals)
- `quote/` - Quotation wizard (multi-step form, preview, calculations)
- `orders/` - Order management components
- `contact/` - Contact form and inquiry components
- `layout/` - Header, Footer, Navigation
- `ui/` - Reusable UI components (buttons, inputs, cards)
- `dashboard/` - Dashboard-specific components
- `home/` - Homepage-specific components
- `industry/` - Industry solution pages

### `lib/`
**Business logic and utilities**

- `pricing/` - Pricing calculation engine
- `pdf/` - PDF generation (quotations, contracts, spec sheets)
- `email/` - Email templates and sending logic
- `excel/` - Excel export utilities
- `signature/` - Digital signature integration (Hanko)
- `ai/` - AI workflow integration
- `supabase-*.ts` - Supabase client configurations
- `quotation-api.ts` - Quotation API functions
- `production-actions.ts` - Production workflow actions
- `customer-notifications.ts` - Notification system

### `contexts/`
**React Context providers**

- `AuthContext.tsx` - Authentication state and methods
- `LanguageContext.tsx` - i18n language switching
- `QuoteContext.tsx` - Quotation wizard state management
- `CatalogContext.tsx` - Product catalog state
- `ComparisonContext.tsx` - Product comparison state
- `LoadingContext.tsx` - Global loading state

### `types/`
**TypeScript type definitions**

- `database.ts` - Supabase database types
- `auth.ts` - Authentication types
- `order-status.ts` - Order status enums and types
- `portal.ts` - Portal/B2B types
- `quote.ts` - Quotation types
- `catalog.ts` - Product catalog types
- `api.ts` - API request/response types

### `locales/`
**i18n translations**

- `ja.ts` - Japanese (default)
- `en.ts` - English
- `ko.ts` - Korean (partial)

## For AI Agents

### Working In This Directory

**Architecture Patterns:**
- **App Router**: Pages defined as `app/*/page.tsx`
- **Server Components**: Default, use `use client` directive for interactivity
- **API Routes**: `app/api/*/route.ts` with HTTP method handlers
- **Authentication**: Supabase Auth + Hanko (signatures)
- **Authorization**: Role-based (ADMIN, MEMBER) via middleware
- **State Management**: React Context API + SWR for server state
- **Forms**: React Hook Form + Zod validation

**Key Conventions:**
1. **File Naming**: `kebab-case` for files, `PascalCase` for components
2. **Exports**: Use `index.ts` files to expose public APIs
3. **Types**: Co-locate types with components or in `types/`
4. **API Routes**: Handle authentication via `api-auth.ts` middleware
5. **Database**: Use `supabase-authenticated.ts` for authenticated queries

**Protected Routes:**
- `/member/*` - Requires authenticated MEMBER with ACTIVE status
- `/admin/*` - Requires authenticated ADMIN (except /admin/customers allows ACTIVE MEMBER too)
- `/api/member/*` - Handles own auth via SSR headers
- `/api/admin/*` - Handles own auth with role verification

**Common Tasks:**
- **Add page**: Create `app/new-route/page.tsx`
- **Add API route**: Create `app/api/new-route/route.ts`
- **Add component**: Create in appropriate `components/*/` directory
- **Add type**: Add to `types/` or co-locate with component
- **i18n**: Add translations to all `locales/*.ts` files

**Development Workflow:**
```bash
# From project root
npm run dev           # Start dev server on port 3000
npm run build         # Production build
npm run lint          # ESLint check
npm run test          # Run tests
```

### Testing Requirements

- **Unit Tests**: `src/**/*.test.ts` or `src/**/*.spec.ts`
- **Integration Tests**: `tests/integration/`
- **E2E Tests**: `tests/e2e/` (Playwright)
- **Test Coverage**: Aim for >80%
- **All tests must pass** before committing

### Important Notes

1. **Middleware**: `middleware.ts` handles auth, CSRF, security headers - modify carefully
2. **Pricing**: Complex business logic in `lib/pricing/` - verify changes thoroughly
3. **PDF Generation**: Client-side generation via `jspdf` - test visually
4. **Email Templates**: Handle both Japanese and English
5. **Database**: Always use typed queries from `types/database.ts`

## Dependencies

### External (from package.json)

**Core Framework:**
- `next@^16.1.4` - React framework (App Router)
- `react@^19.2.3` - UI library
- `typescript@^5` - Type safety

**Authentication & Database:**
- `@supabase/supabase-js@^2.89.0` - Supabase client
- `@supabase/ssr@^0.8.0` - Server-side rendering
- `@supabase/auth-helpers-nextjs@^0.10.0` - Auth helpers

**PDF & Documents:**
- `jspdf@^3.0.4` - PDF generation
- `@react-pdf/renderer@^4.3.2` - React PDF components
- `pdf-lib@^1.17.1` - PDF manipulation
- `exceljs@^4.4.0` - Excel generation

**Forms & Validation:**
- `react-hook-form@^7.66.1` - Form management
- `@hookform/resolvers@^5.2.2` - Form validation
- `zod@^3.25.76` - Schema validation

**UI & Styling:**
- `tailwindcss@^3.4.18` - Utility-first CSS
- `framer-motion@^12.23.24` - Animations
- `lucide-react@^0.554.0` - Icons
- `@radix-ui/*` - Accessible UI primitives

**State & Data:**
- `swr@^2.3.8` - Data fetching
- `@tanstack/react-query@^5.90.16` - Query management

**Email & Communication:**
- `@sendgrid/mail@^8.1.6` - SendGrid email
- `resend@^6.6.0` - Resend email
- `nodemailer@^7.0.12` - Email sending

**Testing:**
- `@playwright/test@^1.56.1` - E2E testing
- `jest@^30.2.0` - Unit testing
- `@testing-library/react@^16.3.0` - React testing

### Internal Architecture

**Critical Dependencies:**
- `lib/pricing/` → `components/quote/` (pricing calculations)
- `contexts/` → `app/` (state providers)
- `types/database.ts` → All Supabase queries
- `lib/supabase-authenticated.ts` → Protected API routes

<!-- MANUAL: Add src-specific conventions, patterns, or warnings -->
