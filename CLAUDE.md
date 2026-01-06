# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Claude Code Best Practices

### Slash Commands (`.claude/commands/`)
Use these slash commands for common workflows:
- `/commit` - Run lint & test, then create a commit
- `/test` - Run appropriate tests based on context
- `/lint` - Run ESLint and fix issues
- `/build` - Build the project and check for errors
- `/review` - Review code changes and provide feedback

### Subagents (`.claude/agents/`)
Use these agents for specialized tasks:
- `code-simplifier` - Simplify code without changing functionality
- `verify-app` - End-to-end testing of the application
- `code-reviewer` - Comprehensive code review
- `test-runner` - Run and analyze test results

### Automated Hooks
- **PostToolUse**: Auto-format code after Write/Edit operations
- **Stop Hook**: Run tests after session completion
- **PreToolUse**: Display message before code changes

### Working with Claude
1. **Start in Plan mode** for multi-step tasks (shift+tab twice)
2. **Use slash commands** to avoid repeated prompting
3. **Run the verify-app agent** after completing features
4. **Check permissions** are set before running commands
5. **Test your work** before marking tasks complete

## Project Overview

Epackage Lab Web is a comprehensive Japanese B2B packaging management system built with Next.js 16. It features customer portals, admin dashboards, quotation systems, and integrated workflow management for packaging materials.

## Development Commands

```bash
# Development
npm run dev                    # Start development server (localhost:3000)
npm run build                 # Production build
npm run start                 # Start production server
npm run lint                  # Run ESLint

# Analysis & Performance
npm run analyze               # Bundle size analysis (ANALYZE=true)
npm run lighthouse            # Run Lighthouse audit
npm run test:performance      # Build + Lighthouse audit

# Testing (Jest Unit + Playwright E2E)
npm run test                  # Run Jest unit tests
npm run test:e2e              # Run Playwright E2E tests
npm run test:e2e:ui           # Run E2E with UI
npx playwright test tests/contact.spec.ts  # Specific test file
```

## Architecture Overview

### Next.js 16 App Router with Route Groups

```
src/app/
├── (auth)/          # Authentication pages (signin, register, pending)
├── (public)/        # Public pages (home, catalog, service, guide/*)
├── admin/           # Admin dashboard (dashboard, approvals, production, shipments)
├── member/          # Member portal (orders, quotations, profile, settings)
├── portal/          # Alternative customer portal
├── b2b/             # B2B registration and login
├── auth/            # Auth routes (signout, error)
└── api/             # API routes
```

**Route groups (parentheses) don't affect URL structure** - they're for organization only.

### Core Business Systems

| System | Location | Purpose |
|--------|----------|---------|
| **Product Catalog** | `app/catalog/`, `app/guide/*` | Product browsing with Japanese specs |
| **Quote Simulation** | `app/quote-simulator/`, `app/smart-quote/` | Interactive pricing calculator |
| **Sample Requests** | `app/samples/` | Up to 5 samples per request |
| **Member Portal** | `app/member/` | Orders, quotations, invoices, deliveries |
| **Admin Dashboard** | `app/admin/` | Order management, production tracking, shipping |
| **B2B Registration** | `app/b2b/` | Customer onboarding workflow |

### Library Architecture (`src/lib/`)

**Key Libraries** (not exhaustive - explore as needed):

| Library | Purpose |
|---------|---------|
| `pdf-generator.ts` | Japanese quotation PDF (jsPDF + html2canvas) |
| `pricing/` | Multi-version pricing engines |
| `email/`, `email-templates.ts` | SendGrid integration with Japanese templates |
| `supabase.ts` | Database client |
| `ai-parser/` | AI-powered spec extraction from files |
| `file-validator/` | **File upload security** (magic numbers, 10MB limit, virus scan) |
| `api-cache.ts` | API response caching (LRU with TTL) |
| `excel/` | Excel quotation generation |
| `state-machine/` | Order approval workflow state machine |
| `shipping-carriers.ts` | Yamato, Sagawa, Japan Post integration |
| `notifications/` | Email/SMS notification service |

### Type System (`src/types/`)

Strongly-typed domain models for:
- Contracts, orders, quotations
- Production tracking, shipments
- AI parsing results
- Dashboard data
- State machine transitions

## Environment Configuration

### Required Variables (`.env.local`)

```bash
# SendGrid (Email)
SENDGRID_API_KEY=SG.xxxxx
ADMIN_EMAIL=admin@epackage-lab.com
FROM_EMAIL=noreply@epackage-lab.com

# Supabase (Database + Auth)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### Optional Integrations

```bash
# Carrier APIs
YAMATO_API_KEY=xxxxx
SAGAWA_API_KEY=xxxxx
JP_POST_API_KEY=xxxxx

# File Upload Security (Task #72)
VIRUS_SCAN_API_KEY=xxxxx        # Optional: Third-party virus scanning service
```

## Form Systems

### Validation Stack
- **React Hook Form** + **Zod** schemas
- Japanese business rules (郵便番号, 電話番号 patterns)
- Real-time validation with Japanese error messages

### Key Forms
- Contact inquiry (`/contact`) - Multiple inquiry types
- Sample request (`/samples`) - Max 5 samples, product catalog integration
- B2B registration (`/b2b/register`) - Multi-step approval workflow

## Design System

### UI Components (`src/components/ui/`)

Built with **Tailwind CSS 4** and **class-variance-authority**:
- Button, Input, Card, Grid/Flex layouts
- Japanese typography (Noto Sans JP)
- Dark mode support
- Metallic/premium design language

### Component Patterns
- Co-located with `index.ts` exports
- Variants using `cva()` for consistent styling
- Icon support via `lucide-react`

## Performance Configuration

### Next.js Optimizations (`next.config.ts`)

```typescript
reactCompiler: true              // React Compiler auto-memoization
optimizePackageImports: [...]     // For lucide-react, supabase, etc.
images: { formats: ['webp', 'avif'] }
```

### Caching Strategy
- Static assets: 1 year (immutable)
- Images: 1 day (must-revalidate)
- API: 5 minutes

### Performance Budgets
- JS Bundle: < 250KB
- Lighthouse: 90+ all categories
- LCP: < 2.5s, CLS: < 0.1

### Performance Modules (Task #77)

| Module | Location | Purpose |
|--------|----------|---------|
| **API Cache** | `src/lib/api-cache.ts` | In-memory LRU cache with TTL for API responses |
| **Optimized Fetch** | `src/hooks/use-optimized-fetch.ts` | Enhanced SWR hooks with cache optimization |
| **Lazy Loading** | `src/lib/lazy-load.tsx` | Component and image lazy loading utilities |

### Code Splitting Strategy

Webpack split into 7 optimized chunks:
1. **React** (priority 40) - Core React libraries
2. **Supabase** (priority 35) - Database and auth client
3. **Forms** (priority 30) - React Hook Form, Zod validation
4. **UI** (priority 28) - Reusable UI components
5. **DateUtils** (priority 26) - Date/fns utilities
6. **PDF** (priority 24) - PDF generation libraries
7. **Vendor** (priority 20) - Third-party dependencies

Expected 40-60% reduction in initial load time.

## PDF Generation

### Japanese Document System (`src/lib/pdf-generator.ts`)

Supports:
- **見積書** (Quotations) - `QuoteData`
- **契約書** (Contracts) - `ContractData`
- **請求書** (Invoices)

Features:
- Noto Sans JP font embedding
- Japanese era dates (令和)
- Consumption tax (10%)
- Company letterhead
- Digital signatures

## Testing Strategy

### E2E Testing (Playwright)
- Config: `playwright.config.ts`
- Test server: Port 3006
- Tests: `/tests` directory
- Coverage: Forms, catalog, member flows

### Unit Testing (Jest)
```bash
npm run test                  # All unit tests
npm run test:coverage         # With coverage
npm run test:watch            # Watch mode
```

## File Upload Security (Task #72)

### Security Validator Module

Location: `src/lib/file-validator/security-validator.ts`

**Features**:
- **Magic number validation** - File signature verification for 20+ file types
- **10MB file size limit** - Enforced by default (configurable)
- **Malicious content detection** - Pattern matching for XSS, SQL injection, path traversal, shell commands
- **Executable file blocking** - Windows EXE, Linux ELF, macOS Mach-O detection
- **Archive file handling** - ZIP, RAR, 7Z detection with strict mode option
- **Suspicious extension blocking** - 18 dangerous extensions (.exe, .bat, .sh, .dll, etc.)
- **Virus scanning integration** - Ready for third-party antivirus API

### Usage

```typescript
import { validateFileSecurity, quickValidateFile, fullValidateFile } from '@/lib/file-validator';

// Quick validation (no virus scan)
const result = await quickValidateFile(file);

// Full validation with virus scanning (requires API key)
const fullResult = await fullValidateFile(file, { apiKey: process.env.VIRUS_SCAN_API });

// Custom validation options
const customResult = await validateFileSecurity(file, {
  maxSize: 5 * 1024 * 1024,  // 5MB custom limit
  requireMagicNumber: true,   // Enforce valid file signatures
  strictMode: true,           // Treat archives as errors
  checkForViruses: false,     // Skip virus scanning
});
```

### Supported File Types

**Images**: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO
**Documents**: PDF, PSD, AI
**Office**: DOC, DOCX, XLS, XLSX, PPT, PPTX
**Archives**: ZIP, RAR, 7Z, TAR, GZ (blocked in strict mode)

### Security Test Suite

Location: `src/lib/file-validator/__tests__/security-validator.test.ts`

Comprehensive tests for:
- Magic number validation for all file types
- File size limit enforcement
- Malicious pattern detection (XSS, SQL injection, eval, etc.)
- Executable file blocking
- Suspicious extension detection
- Archive handling
- Type mismatch warnings
- Edge cases (empty files, tiny files, null bytes)

## Japanese Market Specifics

### Localization
- Primary language: Japanese (ja)
- Noto Sans JP font
- Business etiquette in emails
- Privacy law compliance (個人情報保護方針)

### SEO
- Tokyo CDN edge targeting
- Japanese keyword optimization
- Mobile 3G network optimization (< 2s load)
- Structured data for B2B

### Business Rules
- Sample request limit: 5 per request
- Japanese address format (〒XXX-XXXX)
- Fiscal year calculations (4月開始)
- Consumption tax handling (10%)

## Database Schema (Supabase)

**Current Schema**: `docs/current/architecture/database-schema-v2.md` (Updated 2026-01-03)

### Performance Indexes (Task #79)

**28 performance-critical indexes** added for query optimization:

- **Priority 1**: Core query patterns (5 indexes)
  - Quotation list queries, order dashboard, member recent activity
- **Priority 2**: N+1 query prevention (5 indexes)
  - Order items, quotation items, sample items, production jobs, shipments
- **Priority 3**: Monitoring & alerting (5 indexes)
  - Status tracking, time-based analytics, user activity
- **Priority 4**: Partial indexes (4 indexes)
  - Active quotations, pending orders, in-production jobs, active shipments
- **Covering indexes**: (2 indexes)
  - Admin dashboard widget with INCLUDE columns
- **Full-text search**: (1 index)
  - Product search with simple text configuration
- **Additional optimization**: (6 indexes)

### Database Structure

Key tables:
- `contact_submissions` - Contact form data
- `sample_requests` - Sample request tracking
- `quotations` - Quote history (with 28 performance indexes)
- `products` - Product catalog
- `orders` - Order management
- `production_jobs` - Production tracking
- `shipments` - Shipping tracking
- `users`, `profiles` - User management
- `approvals` - Approval workflow

**Constraints**: 19 foreign key relationships, 19 database triggers

## Development Workflow

1. **Feature branches**: `git checkout -b feature/your-feature`
2. **Development**: `npm run dev`
3. **Testing**: `npm run test:e2e && npm run lint`
4. **Build**: `npm run build:production`
5. **Performance**: `npm run lighthouse`

### Common Tasks

| Task | Command/Location |
|------|------------------|
| Add form field | Update Zod schema in form component |
| Add API endpoint | Create in `src/app/api/` |
| Add UI variant | Use `cva()` in `src/components/ui/` |
| Check bundle size | `npm run analyze` |
| Test email | Check SendGrid templates in `src/lib/email-templates.ts` |
| **Secure file upload** | Use `validateFileSecurity()` from `@/lib/file-validator` |
| **Cache API response** | Use `apiCache.get/set()` from `@/lib/api-cache` |
| **Optimize data fetch** | Use `useOptimizedFetch()` from `@/hooks/use-optimized-fetch` |

## Important Notes

- **Path aliases**: `@/*` → `./src/*`
- **TypeScript strict mode**: Enabled
- **Image optimization**: Enabled (WebP/AVIF auto-conversion)
- **File upload limit**: 10MB default (configurable via `validateFileSecurity()`)
- **Security headers**: Pre-configured in `next.config.ts`
- **SEO**: Dynamic robots.txt and sitemap.xml via API routes

## Deployment

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] Lighthouse scores > 90
- [ ] Environment variables set
- [ ] Supabase migrations applied
- [ ] SendGrid sender authenticated

### Platform: Vercel
```bash
vercel                          # Preview deployment
vercel --prod                   # Production
bash scripts/deploy-production.sh
```
