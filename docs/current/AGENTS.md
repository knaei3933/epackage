<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-08 | Updated: 2026-02-08 -->

# docs/current/ - Current Development Documentation

## Purpose

Active development documentation for Epackage Lab B2B e-commerce platform v5.0. Contains the latest business requirements (PRD), technical implementation plans (TASK), architecture specifications, implementation guides, and deployment documentation for the Japanese packaging materials manufacturing system.

## Key Files

| File | Description | Language |
|------|-------------|----------|
| `PRD_BUSINESS_v5.0.md` | Business requirements, market analysis, 12-stage B2B workflow, KPIs | Japanese |
| `TASK_TECHNICAL_v5.0.md` | Technical implementation roadmap, sprint plans, database schema, API specifications | Japanese |
| `TASK.md` | Task list based on PRD v2.1, phase-based development tracking | Korean |
| `DEV_MODE_REMOVAL_SUMMARY.md` | Documentation of dev mode removal from production builds | English |
| `DEV_MODE_HEADER_REMOVAL_SUMMARY.md` | Header removal summary for dev mode | English |

### PRD v5.0 Highlights

**Business Domain**:
- Industry: B2B packaging materials manufacturing
- Target: Cosmetic, food, pharmaceutical, electronics manufacturers
- Products: Stand-up pouches, tubes (flat/gusset), roll film, zipper bags

**Market Analysis (2024 Japan)**:
- Cosmetic packaging: ¥280B market (3.2% growth)
- Food packaging: ¥850B market (1.8% growth)
- Pharmaceutical packaging: ¥120B market (4.1% growth)
- Electronics packaging: ¥310B market (2.5% growth)

**12-Stage B2B Workflow**:
1. Quotation simulation (public)
2. Customer information entry (no registration)
3. Quotation issuance, membership invitation
4. Member registration, approval pending
5. Data download for submission
6. Data submission (customer)
7. Korean designer submission, correction request
8. Correction data completion notification
9. Customer approval (correction request loop)
10. Invoice issuance, payment pending
11. Manufacturing start (payment confirmation)
12. Purchase order submission, manufacturing
13. Delivery note submission, completion

### TASK v5.0 Highlights

**Codebase Statistics (2026-01-30)**:
- 194 API routes (+10 from documentation)
- 88 pages (-7 from documentation)
- 6 loading pages
- 274 components
- 11 *Client.tsx components (Next.js 16 optimization)

**Sprint Planning** (10 sprints):
- Sprint 0: Document updates
- Sprint 1: Order confirmation (1 day)
- Sprint 2: Data submission & Korea forwarding (2 days)
- Sprint 3: Correction data management (2 days)
- Sprint 4: Approval/rerequest loop (2 days)
- Sprint 5: Payment confirmation (1 day)
- Sprint 6: Manufacturing approval (payment + data) (1 day)
- Sprint 7: Korea PO email sending (1 day)
- Sprint 8: Tracking number & ETA input (1 day)
- Sprint 9: Delivery note auto-sending (1 day)
- Sprint 10: 3-month auto-archiving (1 day)

## Subdirectories

### `architecture/` - Architecture Design Documents

**Purpose**: System architecture, API design, component patterns, database schema

**Key Files**:
- `architecture.md` - Complete system architecture (frontend, backend, data flow, security)
- `api.md` - API routing structure, middleware, RESTful conventions
- `database-schema.md` - Database schema v1
- `database-schema-v2.md` - Database schema v2 with updates
- `component-design-patterns.md` - Component design patterns and best practices
- `technical-implementation-plan.md` - Technical implementation strategy
- `technical-implementation-strategy.md` - Implementation strategy details
- `api-examples.md` - API usage examples
- `announcements-sample-data.sql` - Sample data for announcements

**Technology Stack**:
- Frontend: Next.js 16, React 19, TypeScript 5.0+, Tailwind CSS 4
- Backend: Next.js API Routes, Supabase (Auth, Database, Storage, Realtime)
- DevOps: Vercel hosting, Playwright E2E testing, Jest unit testing

---

### `guides/` - Implementation Guides

**Purpose**: Step-by-step guides for deployment, testing, user workflows

**Key Files**:
- `deployment.md` - Deployment guide
- `contributing.md` - Contribution guidelines
- `TEST_EXECUTION_GUIDE.md` - Test execution procedures
- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist
- `DOCUSIGN_SETUP.md` - DocuSign integration setup
- `USER_GUIDE_ADMIN.md` - Admin user guide
- `USER_GUIDE_CUSTOMER.md` - Customer user guide
- `Frontend_Specifications_Japanese_Member_Form.md` - Japanese member form specs

**Subdirectory: `deployment/`**
- `README-DEPLOYMENT.md` - Deployment overview
- `README-SUPABASE.md` - Supabase setup guide
- `SUPABASE_SETUP.md` - Supabase configuration

---

### `implementation/` - Implementation Notes

**Purpose**: Implementation plans and strategies

**Key Files**:
- `IMPLEMENTATION_PLAN.md` - Brixa pricing engine implementation plan
  - Core engine implemented at `src/lib/pricing_new/engine.ts`
  - Fixed setup costs by bag type
  - Variable cost calculation
  - Small lot surcharges
  - UV printing cost structure

---

### `old/` - Deprecated Current Docs

**Purpose**: Previous versions of current documentation (archived for reference)

**Key Files**:
- `PRD.md` - Original PRD
- `PRD2-20260102.md` - PRD v2
- `PRD3-20260102.md` - PRD v3
- `PRD4-20260104.md` - PRD v4
- `prd5-2026-01-04.md` - PRD v5
- `LLD.md` - Original low-level design
- `SUPABASE_MCP_INTEGRATION_REVIEW.md` - Supabase MCP integration review

## For AI Agents

### Working in This Directory

**Documentation Languages**:
- Primary: Japanese (ビジネス文書 - PRD, TASK)
- Secondary: English (architecture, guides, implementation)
- Tertiary: Korean (TASK.md - legacy task list)

**Key Workflow Documents**:
- `PRD_BUSINESS_v5.0.md` - Business requirements, market analysis, workflow stages
- `TASK_TECHNICAL_v5.0.md` - Sprint plans, API specs, database schema, file structure
- `architecture/` - System design, API routes, component patterns
- `guides/` - Deployment, testing, user guides

### Common Workflows

**Feature Development**:
1. Read `PRD_BUSINESS_v5.0.md` for business requirements
2. Check `TASK_TECHNICAL_v5.0.md` for technical specs and sprint plans
3. Reference `architecture/` for system design patterns
4. Follow `guides/deployment.md` for deployment procedures

**API Development**:
1. Check `architecture/api.md` for API structure
2. Reference `TASK_TECHNICAL_v5.0.md` for new API routes (194 total)
3. Follow middleware patterns in `architecture/architecture.md`
4. Use `architecture/api-examples.md` for usage patterns

**Database Changes**:
1. Read `architecture/database-schema-v2.md` for current schema
2. Check `TASK_TECHNICAL_v5.0.md` section 3 for schema modifications
3. Review `old/SUPABASE_MCP_INTEGRATION_REVIEW.md` for integration notes

**UI/UX Development**:
1. Reference `architecture/component-design-patterns.md` for patterns
2. Check `architecture/architecture.md` for component organization
3. Follow `guides/Frontend_Specifications_Japanese_Member_Form.md` for Japanese forms

### Sprint Implementation

**When implementing sprints from TASK_TECHNICAL_v5.0**:
- Each sprint has specific files to create/modify
- Email templates are defined for each stage
- Database migrations are specified
- API endpoints are documented with request/response formats
- UI mockups are provided in text format

**Example: Sprint 2 (Data Submission & Korea Forwarding)**
1. Create: `src/app/member/orders/[id]/data-upload/page.tsx`
2. Create: `src/app/api/admin/orders/{id}/send-to-korea/route.ts`
3. Modify: `src/lib/ai-parser.ts` (existing)
4. Email template: Stage 6 design data submission format provided

### Dependencies

**External Documentation**:
- Next.js 16: https://nextjs.org/docs
- React 19: https://react.dev
- Supabase: https://supabase.com/docs
- DocuSign: https://developers.docusign.com
- Vercel: https://vercel.com/docs

**Internal Dependencies**:
- `../api/` - API specifications and B2B workflow docs
- `../code-review-2025-01-18/` - Code review results and known issues
- `../references/uiux-design/` - UI/UX design specifications
- `../reports/calcultae/` - Korean cost calculation guides
- `src/types/database.ts` - TypeScript type definitions
- `src/lib/` - Implementation libraries

### Security Considerations

**Known Vulnerabilities** (from PRD v5.0 section 6):
- SEC-001: Admin endpoint authentication bypass (P0)
- SEC-002: innerHTML XSS vulnerability (P0)
- SEC-003: Service role key misuse in 30 APIs (P0)
- PERF-001: N+1 query problem (P0)
- CODE-001: Context bug at line 951 (P0)

**Security Requirements**:
- SQL injection prevention: Target 100% (currently 60%)
- XSS prevention: Target 100% (currently 70%)
- Authentication/authorization: Target 100% (currently 60%)
- Admin privilege protection: Target 100% (currently 0%)

### Performance Targets

**Current vs Target**:
- AI quotation response: <2s ✅ achieved
- Page load (LCP): <2.5s ✅ ~2s current
- API response: <300ms 🔴 840ms current (64% improvement needed)
- DB queries/page: <3 🔴 15 current (80% reduction needed)

### Email Communication Structure

**Stage-based email flows** (from PRD v5.0):
- Stage 6: design@epackage-lab.com → info@epackage-lab.com (data submission)
- Stage 7: info@epackage-lab.com → design@epackage-lab.com (correction return)
- Stage 10: info@epackage-lab.com → info@epackage-lab.com (PO sending)

**Required Environment Variables**:
- `DESIGN_EMAIL`
- `KOREA_PARTNER_EMAIL`
- `SHIPPING_EMAIL`
- `DOCUSIGN_API_KEY`
- Shipping carrier API keys

---

## Maintenance Notes

**Document Lifecycle**:
- `PRD_BUSINESS_v5.0.md` - Active business requirements (review after Phase 1)
- `TASK_TECHNICAL_v5.0.md` - Active sprint plan (review after Sprint 0)
- `architecture/` - Stable reference (update on architectural changes)
- `guides/` - Stable procedures (update on process changes)
- `implementation/` - Active plans (update on implementation progress)
- `old/` - Archive only (no updates)

**Update Guidelines**:
- Business requirement changes → update `PRD_BUSINESS_v5.0.md`
- New features/sprints → add to `TASK_TECHNICAL_v5.0.md`
- API changes → update `architecture/api.md`
- Database changes → update `architecture/database-schema-v2.md`
- New deployment procedures → add to `guides/deployment.md`

**Multi-language Coordination**:
- Japanese docs (PRD, TASK v5.0) target Japanese market requirements
- Korean docs (TASK.md) cover legacy development perspective
- English docs (architecture, guides) serve as technical reference

**Version Control**:
- Current major version: 5.0
- Last major update: 2026-01-30
- Next review: After Sprint 0 completion

---

**Last Updated**: 2026-02-08
**Document Version**: 1.0
**Total Files**: 30+ markdown documents
