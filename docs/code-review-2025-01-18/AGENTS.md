# Code Review Documentation - Agent Guide

**Parent**: ../AGENTS.md

## Purpose

This directory contains comprehensive code review documentation from January 2025 for the EPackage Lab B2B e-commerce platform. The documentation provides a complete analysis of the codebase structure, security issues, optimization implementations, and development progress.

## Key Files

### Main Documentation
- **README.md** - Complete guide to the code review documentation structure
- **SUMMARY.md** - Executive summary with project overview, statistics, and latest changes

### Analysis Documents
- **api/routes-categorized.md** - 202 API routes categorized by functionality (auth, orders, quotations, admin, member, etc.)
- **components/structure.md** - 274 components organized by category with optimization status
- **database/supabase-analysis.md** - Supabase connection methods, authentication system, and database schema (52+ tables)
- **pages/structure.md** - 88 pages categorized as public, member, admin, and auth pages

### Historical Records (Deleted)
- **findings/gaps-and-recommendations.md** - Feature gaps and recommendations (archived)
- **verification/SECURITY_AND_MCP_COMPLETE.md** - Security verification results (archived)
- **implementation-plan.md** - Implementation planning document (archived)

## For AI Agents

### Context for Code Analysis

When analyzing this codebase, reference these documents for:

1. **API Route Analysis** (`api/routes-categorized.md`)
   - Total: 202 API routes (updated 2025-01-30)
   - Categories: Authentication (7), Orders (21), Quotations (7), Admin (51), Member (44), Contracts (9), Shipments (10), etc.
   - B2B workflow APIs added: Korea data transfer, correction management, payment confirmation, production start

2. **Component Architecture** (`components/structure.md`)
   - Total: 274 components
   - Optimization status: blurDataURL (10), loading.tsx (6), *Client.tsx (11)
   - Categories: Admin (30+), Auth (7), B2B (8+), Catalog (12), Orders (7), Archives (6)

3. **Database Schema** (`database/supabase-analysis.md`)
   - 52+ tables in public schema
   - Key tables: profiles, orders, quotations, products, contracts, shipments, notifications
   - Authentication: browser client, service client, cookie-based client, MCP wrapper
   - RLS policies and RBAC implementation

4. **Page Structure** (`pages/structure.md`)
   - Total: 88 pages
   - Public: 34 pages + 2 loading
   - Member: 23 pages + 2 loading
   - Admin: 25 pages + 1 loading
   - Auth: 8 pages

### Recent Implementations (2025-01-18 to 2025-01-30)

#### Completed Optimizations
- ✅ Next.js 16.1.4 upgrade with Turbopack
- ✅ Supabase integration refactored (Server/Client separation)
- ✅ RBAC Server Component implementation
- ✅ Vercel React Best Practices implementation
  - Bundle size optimization (lucide-react direct imports, PDF dynamic imports)
  - Rendering performance (blurDataURL for CLS, loading.tsx for streaming SSR)
  - Server-side performance (unstable_cache, revalidate API)
- ✅ PDF download functionality fixed (Blob URL approach)
- ✅ B2B workflow implementation (10 sprints complete)
- ✅ PRD integration v5.0 (business/technical separation)

#### Security Issues Addressed
- SQL injection vulnerability in `/api/supabase-mcp/execute/route.ts`
- Development mode authentication leak prevention
- Service role key management
- XSS vulnerabilities in type assertions

### Dependencies

#### Core Framework
- **Next.js**: 16.1.4 (App Router + Turbopack)
- **React**: 19
- **TypeScript**: 5.x

#### Database & Backend
- **Supabase**: PostgreSQL 17.6.1.063
- **@supabase/auth-helpers-nextjs**: Deprecated (migrated to custom SSR client)

#### UI & Styling
- **Tailwind CSS**: 3.x
- **Radix UI**: Multiple components
- **Framer Motion**: Motion library (61 files with static imports)
- **lucide-react**: Icons (111 files with direct imports)

#### Forms & Validation
- **React Hook Form**: Form management
- **Zod**: Schema validation

#### State Management
- **React Context**: Global state
- **SWR**: Data fetching
- **TanStack Query**: Server state

#### PDF Generation
- **jsPDF**: PDF creation
- **html2canvas**: HTML to canvas
- **DOMPurify**: XSS sanitization

### Code Quality Metrics

#### Statistics (2025-01-30)
- **Total Files**: 820+ TypeScript/TSX files
- **Code Lines**: ~50,000+ lines
- **API Routes**: 202 routes
- **Components**: 274 components
- **Pages**: 88 pages (including 6 loading pages)
- **Database Tables**: 52+ tables

#### Optimization Results
- Bundle size reduced (lucide-react direct imports, PDF dynamic imports)
- LCP/CLS improved (blurDataURL, loading.tsx)
- DB queries reduced 80% (unstable_cache)
- Test success rate: 71.4% (533/746)

### Known Issues & Recommendations

#### Critical Security Issues (from SUMMARY.md)
1. **SQL Injection Risk** - `/api/supabase-mcp/execute/route.ts`
2. **Development Mode Auth Leak** - `NODE_ENV` check insufficient
3. **Service Role Key Exposure** - Client-side leakage possible
4. **XSS Vulnerabilities** - Type assertions in `b2b-db.ts`

#### Warnings
- Error message information leakage
- Missing rate limiting
- Excessive type assertions (@ts-ignore)
- Incomplete API authentication/authorization

#### Recommendations
- Environment variable validation
- CSRF protection
- Security headers (HSTS, CSP, X-Frame-Options)
- Structured logging
- Query optimization (eliminate N+1)
- Image optimization (Next.js Image component)
- Code splitting (dynamic imports)
- Pagination standardization
- Type definition organization

## Usage Examples

### For Code Review Agents
```markdown
When reviewing API routes, reference:
- docs/code-review-2025-01-18/api/routes-categorized.md for route categorization
- docs/code-review-2025-01-18/database/supabase-analysis.md for authentication patterns
- docs/code-review-2025-01-18/SUMMARY.md for security issues and recommendations
```

### For Architecture Agents
```markdown
When analyzing component structure, reference:
- docs/code-review-2025-01-18/components/structure.md for component organization
- docs/code-review-2025-01-18/pages/structure.md for page layout
- docs/code-review-2025-01-18/README.md for documentation guide
```

### For Security Agents
```markdown
When performing security review, reference:
- docs/code-review-2025-01-18/SUMMARY.md for known vulnerabilities
- docs/code-review-2025-01-18/database/supabase-analysis.md for authentication security
- docs/code-review-2025-01-18/api/routes-categorized.md for API security patterns
```

### For Performance Agents
```markdown
When optimizing performance, reference:
- docs/code-review-2025-01-18/SUMMARY.md for implemented optimizations
- docs/code-review-2025-01-18/components/structure.md for blurDataURL and loading.tsx implementations
- docs/code-review-2025-01-18/database/supabase-analysis.md for caching strategies
```

## Maintenance Notes

- Last updated: 2025-01-30
- Documentation language: Japanese (primary), English (secondary)
- Review cycle: Continuous (updated with each major feature implementation)
- Archived files: Moved to parent directory or deleted (check git history)

---

**Generated**: 2025-01-30
**Maintained by**: Development Team
**Status**: Active Documentation
