<!-- Parent: ../AGENTS.md -->

# src/app/ - Next.js App Router

**Purpose:** Next.js App Router pages and API routes using the Pages & Files filesystem-based routing convention.

## Directory Structure

```
src/app/
├── layout.tsx              # Root layout with global providers
├── page.tsx                # Homepage (landing page)
├── sitemap.ts              # Dynamic sitemap generation
├── globals.css             # Global styles
│
├── about/                  # About page
├── admin/                  # Admin dashboard & pages
├── api/                    # API routes (REST endpoints)
├── archives/               # Archives page
├── auth/                   # Authentication pages
├── catalog/                # Product catalog
├── contact/                # Contact form
├── csr/                    # CSR page
├── guide/                  # Design guides
├── industry/               # Industry-specific pages
├── inquiry/                # Detailed inquiry form
├── legal/                  # Legal pages
├── member/                 # Member dashboard & pages
├── news/                   # News page
├── pricing/                # Pricing page
├── privacy/                # Privacy policy
├── quote-simulator/        # Quote simulator
├── samples/                # Sample requests
├── service/                # Service pages
└── terms/                  # Terms of service
```

## Key Files

### Root Layout (`layout.tsx`)
- Global app wrapper with providers:
  - `ThemeProvider` - Dark/light mode support
  - `AuthProvider` - Supabase authentication
  - `LanguageProvider` - i18n support
  - `HeaderWrapper` - Site navigation
  - `BreadcrumbList` - SEO breadcrumbs
  - `Footer` - Site footer
- SEO metadata (OpenGraph, Twitter Cards)
- Font configuration (Geist Sans, Geist Mono)
- Performance optimizations (preconnect, dns-prefetch)

### Homepage (`page.tsx`)
- Server Component with dynamic data fetching
- SEO structured data (OrganizationSchema, FAQSchema)
- Components: HeroSection, ProductShowcaseSection, ManufacturingProcessShowcase
- Dynamic announcements from Supabase

### Sitemap (`sitemap.ts`)
- Dynamic sitemap generation
- Static routes with changeFrequency and priority
- Dynamic product URLs from product catalog
- hreflang support for multi-language (ja, en)

## Subdirectories

### `/admin` - Admin Dashboard
**Layout:** `admin/layout.tsx` - Admin layout with navigation and notification center

**Pages:**
- `admin/dashboard/page.tsx` - Admin dashboard with statistics
- `admin/quotations/page.tsx` - Quotation management
- `admin/orders/page.tsx` - Order management
- `admin/customers/page.tsx` - Customer management
- `admin/production/page.tsx` - Production tracking
- `admin/inventory/page.tsx` - Inventory management
- `admin/shipments/page.tsx` - Shipment management
- `admin/contracts/page.tsx` - Contract management
- `admin/coupons/page.tsx` - Coupon management
- `admin/approvals/page.tsx` - Member approval queue
- `admin/settings/page.tsx` - Admin settings

**Loader:** `admin/loader.ts` - Server-side data fetching with RBAC auth checks

### `/api` - API Routes
**Pattern:** REST endpoints using `route.ts` files

**Key endpoints:**
- `api/auth/*` - Authentication (signin, signout, register, verify-email)
- `api/admin/*` - Admin operations (quotations, orders, production, inventory)
- `api/member/*` - Member operations (quotations, orders, documents, notifications)
- `api/shipments/*` - Shipping operations
- `api/signature/*` - Electronic signature integration
- `api/products/*` - Product catalog
- `api/quotes/*` - Quotation PDF generation
- `api/contract/*` - Contract PDF generation
- `api/samples/*` - Sample requests

**Auth pattern:** Uses `@supabase/ssr` for server-side auth with cookie-based sessions

### `/member` - Member Dashboard
**Layout:** `member/layout.tsx` - Member layout with sidebar navigation

**Pages:**
- `member/dashboard/page.tsx` - Member dashboard with stats
- `member/quotations/page.tsx` - Quotation list
- `member/quotations/[id]/page.tsx` - Quotation detail
- `member/orders/page.tsx` - Order list
- `member/orders/[id]/page.tsx` - Order detail
- `member/deliveries/page.tsx` - Delivery tracking
- `member/profile/page.tsx` - Profile management
- `member/settings/page.tsx` - Account settings

### `/catalog` - Product Catalog
- `catalog/page.tsx` - Product catalog with CartProvider
- `catalog/[slug]/page.tsx` - Dynamic product detail pages
  - Uses `generateStaticParams()` for static generation
  - SEO metadata per product
  - Client component for interactivity

### `/auth` - Authentication
- `auth/signin/page.tsx` - Sign in page
- `auth/register/page.tsx` - Registration page
- `auth/pending/page.tsx` - Pending approval page
- `auth/error/page.tsx` - Auth error page
- `auth/forgot-password/page.tsx` - Password reset request
- `auth/reset-password/page.tsx` - Password reset form
- `auth/suspended/page.tsx` - Account suspended page

### `/guide` - Design Guides
**Layout:** `guide/layout.tsx` - Sidebar navigation for guides

**Pages:**
- `guide/page.tsx` - Guide index
- `guide/color/page.tsx` - Color guide
- `guide/size/page.tsx` - Size guide
- `guide/image/page.tsx` - Image specifications
- `guide/shirohan/page.tsx` - White plate guide
- `guide/environmentaldisplay/page.tsx` - Environmental labeling

### `/industry` - Industry Pages
- `industry/cosmetics/page.tsx` - Cosmetics packaging
- `industry/electronics/page.tsx` - Electronics packaging
- `industry/food-manufacturing/page.tsx` - Food packaging
- `industry/pharmaceutical/page.tsx` - Pharmaceutical packaging

### Static Pages
- `about/page.tsx` - Company overview
- `contact/page.tsx` - Contact form
- `quote-simulator/page.tsx` - Quote calculator
- `samples/page.tsx` - Sample request form
- `archives/page.tsx` - Archives
- `csr/page.tsx` - Corporate social responsibility
- `news/page.tsx` - News/updates
- `pricing/page.tsx` - Pricing information
- `service/page.tsx` - Service descriptions
- `legal/page.tsx` - Legal information
- `privacy/page.tsx` - Privacy policy
- `terms/page.tsx` - Terms of service

## App Router Patterns

### Server Components (Default)
- All pages are Server Components by default
- Use async/await for data fetching
- Direct database access (no API calls needed)

### Client Components
- Mark with `'use client'` directive
- Used for interactivity (forms, modals, state)
- Example: `CatalogClient`, `ProductDetailClient`

### Data Fetching
```typescript
// Parallel data fetching with Promise.all
const [stats, orders] = await Promise.all([
  getStats(userId),
  getOrders(userId)
])
```

### Dynamic Routes
- Use `[param]` directory naming
- Access via `params` prop (Promise-based in Next.js 15+)
- Example: `slug` in `catalog/[slug]/page.tsx`

### Static Generation
```typescript
// generateStaticParams for build-time generation
export async function generateStaticParams() {
  return products.map(p => ({ slug: p.id }))
}
```

### Loading States
```typescript
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <AsyncComponent />
    </Suspense>
  )
}
```

### Metadata Generation
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: 'Page Title',
    description: 'Page description',
    openGraph: { /* ... */ }
  }
}
```

## For AI Agents

### When Working with App Routes

1. **Server Components (pages):** Default to Server Components, only use Client Components when necessary for interactivity
2. **Data Fetching:** Fetch data directly in Server Components, use loader files for complex queries
3. **API Routes:** Follow REST conventions, use Zod for validation, implement rate limiting for auth endpoints
4. **Authentication:** Use `@supabase/ssr` for server-side auth, `requireAuth()` helper for protected pages
5. **Error Handling:** Use `notFound()` for 404s, `redirect()` for auth failures, try/catch for data fetch errors
6. **Performance:** Use `Promise.all()` for parallel fetches, implement proper caching strategies
7. **SEO:** Always include metadata, use structured data for rich snippets

### Common Patterns

- **Protected Page:** Wrap async data fetching in try/catch, redirect to signin on auth error
- **Form Handling:** Use Server Actions or API routes with Zod validation
- **File Uploads:** Handle in API routes, validate file types/sizes, store in Supabase Storage
- **PDF Generation:** Use `@react-pdf/renderer`, generate server-side for performance
- **Real-time Updates:** Use SWR in Client Components for polling/mutations

### Dependencies

- `next@^16.1.4` - Next.js framework
- `react@^19.2.3` - React library
- `@supabase/ssr@^0.8.0` - Server-side Supabase auth
- `@supabase/supabase-js@^2.89.0` - Supabase client
- `swr@^2.3.8` - Client-side data fetching
- `framer-motion@^12.23.24` - Animations
- `zod@^3.25.76` - Schema validation
