<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-08 | Updated: 2026-02-08 -->

# docs/ - Project Documentation Directory

## Purpose

Centralized documentation repository for the Epackage Lab B2B e-commerce platform. Contains API specifications, design documents, code review results, testing documentation, implementation guides, and multilingual business requirements in Japanese and Korean.

## Key Files

| File | Description |
|------|-------------|
| `console.md` | Console debugging guide and error analysis |
| `vercel-deployment-guide.md` | Vercel platform deployment instructions |
| `vercel-free-deployment-guide.md` | Free tier deployment guide |
| `vercel-domain-dns-options.md` | Domain and DNS configuration for Vercel |
| `roll-film-pdf-issue-analysis.md` | PDF generation issue analysis for roll film products |
| `email-timing.md` | Email notification timing specifications |
| `教正アップロードフォームデバッグガイド.md` | Correction form upload debugging guide (Japanese) |
| `入稿ダウンロードアップロード問題分析.md` | Data upload/download issue analysis (Japanese) |
| `問題分析サマリー.md` | Issue analysis summary (Japanese) |
| `밑지.md` | Margin calculation documentation (Korean) |
| `수정사항.md` | Modification notes (Korean) |

## Subdirectories

### `api/` - API Documentation

**Purpose**: B2B workflow API specifications and database design

**Key Files**:
- `README.md` - API documentation index with quick reference
- `API_DESIGN_SUMMARY.md` - Overall API design summary
- `B2B_WORKFLOW_API_SPECIFICATION.md` - Detailed 10-step workflow API specs
- `B2B_DATABASE_ERD.md` - Database entity relationship diagrams
- `openapi-b2b-workflow.yaml` - OpenAPI 3.0 specification for Swagger UI
- `performance-modules.md` - Performance optimization modules
- `MEMBER_QUOTATIONS_AUTH_FIX.md` - Member quotations authentication fix
- `QUOTATION_SUBMIT_API.md` - Quotation submission API documentation

**10-Step Workflow**:
1. Registration → 2. Quotation → 3. Order → 4. Data Entry → 5. Work Order → 6. Contract → 7. Signing → 8. Production → 9. Stock In → 10. Shipment

---

### `archive/` - Historical Documentation

**Purpose**: Archived documents from previous versions (v1.0, v1.5) and legacy implementation docs

**Subdirectories**:
- `v1.0/` - Version 1.0 PRD, LLD, TASK documents
- `v1.5/` - Version 1.5 PRD, LLD, TASK documents
- `analysis/` - Market analysis and competitive research
- `legacy/` - Legacy implementation summaries

**Key Files**:
- `v1.0/PRD_EpackageLab_v1.0.md` - Original product requirements
- `v1.0/LLD_EpackageLab_v1.0.md` - Original low-level design
- `v1.0/TASK_EpackageLab_v1.0.md` - Original task breakdown
- `analysis/PRICING_LOGIC.md` - Pricing logic analysis
- `analysis/ANALYSIS_REPORT.md` - Comprehensive analysis report
- `analysis/修正事項.md` - Modification records (Japanese)
- `analysis/評価レポート_Brixa比較.md` - Brixa comparison evaluation (Japanese)

---

### `code-review-2025-01-18/` - Code Review Results

**Purpose**: Comprehensive code review conducted January 18-22, 2025

**Structure**:
- `README.md` - Review overview and navigation
- `SUMMARY.md` - Executive summary with statistics
- `pages/structure.md` - 88 pages categorized
- `api/routes-categorized.md` - 202 API routes analyzed
- `components/structure.md` - 274 components documented
- `database/supabase-analysis.md` - Supabase connection patterns
- `security/security-review.md` - Security vulnerabilities (4 critical, 4 high priority)

**Key Findings**:
- SQL injection vulnerabilities (critical)
- MCP API exposure without authentication (critical)
- Service key exposure risks (critical)
- 88 pages (95 with loading.tsx)
- 202 API routes
- 274 components
- 30+ database tables

**Optimizations Completed**:
- Bundle size: lucide-react direct imports (111 files)
- Rendering: blurDataURL (10 components), loading.tsx (5 files)
- Server: unstable_cache (80% DB query reduction)
- Code quality: @ts-ignore removal (39 instances)

---

### `current/` - Current Development Documents

**Purpose**: Active development documentation for v5.0

**Key Files**:
- `PRD_BUSINESS_v5.0.md` - Business requirements and market analysis
- `TASK_TECHNICAL_v5.0.md` - Technical implementation roadmap
- `TASK.md` - Current task list
- `DEV_MODE_REMOVAL_SUMMARY.md` - Dev mode removal documentation
- `DEV_MODE_HEADER_REMOVAL_SUMMARY.md` - Header removal summary

**Subdirectories**:
- `architecture/` - Architecture design documents
- `guides/` - Implementation guides
- `implementation/` - Implementation notes
- `old/` - Deprecated current docs

**PRD v5.0 Highlights**:
- 12-stage B2B workflow
- Market analysis: ¥156B total addressable market
- Korean/Japanese bilingual support
- AI-powered quotation system

---

### `guides/` - Implementation Guides

**Purpose**: Step-by-step implementation guides

**Key Files**:
- `CATALOG_README.md` - Catalog system documentation
- `DESIGN_SYSTEM.md` - Design system specifications
- `HERO_ENHANCEMENT_REPORT.md` - Hero section enhancements
- `IMPLEMENTATION_GUIDE.md` - General implementation guide

---

### `references/` - Reference Documentation

**Purpose**: Comprehensive reference materials for various systems

**Subdirectories**:
- `uiux-design/` - UI/UX design specifications
- `performance/` - Performance optimization guides
- `email-templates/` - Email template configurations
- `research/` - Research documents (AI extraction, Brixa flow)
- `security/` - Security best practices

**Key Files**:
- `uiux-design/README.md` - B2B workflow UI/UX overview
- `uiux-design/b2b-workflow-design.md` - Main design document
- `uiux-design/component-specifications.md` - UI component specs
- `uiux-design/user-journey-map.md` - User journey documentation
- `performance/PERFORMANCE_OPTIMIZATION.md` - Performance optimization guide
- `quote-system-integration-strategy.md` - Quote system integration
- `pdf-system-design.md` - PDF generation system design
- `excel-quotation-system-design.md` - Excel quotation system
- `security/SECURITY_BEST_PRACTICES.md` - Security guidelines

---

### `reports/` - Analysis Reports

**Purpose**: Detailed analysis reports (Korean)

**Subdirectories**:
- `calcultae/` - Pouch cost calculation guide (8 detailed files)
- `tjfrP/` - Product analysis reports
- `old/` - Deprecated reports

**calcultae/ Files**:
1. `00-README.md` - Guide overview
2. `01-용어_및_기본개념.md` - Basic terminology
3. `02-필름폭_계산공식.md` - Film width formulas
4. `03-열수_판정_및_원반선정.md` - Column count and roll selection
5. `04-미터수_및_원가_계산.md` - Meter length and cost calculation
6. `05-가공비용_계산.md` - Processing cost calculation
7. `06-마진_및_최종가격.md` - Margin and final pricing
8. `07-SKU_및_병렬생산.md` - SKU and parallel production
9. `08-비즈니스_시나리오_모음.md` - Business scenarios index

**Other Files**:
- `workflow-review-2025-01-30.md` - Workflow review report

---

### `testing/` - Testing Documentation

**Purpose**: E2E test plans and implementation summaries

**Key Files**:
- `e2e-test-implementation-summary.md` - E2E test implementation report
- `B2B_WORKFLOW_API_TEST_PLAN.md` - API test plan
- `B2B_WORKFLOW_API_TEST_SUMMARY.md` - API test summary

**Test Coverage**:
- 50+ test scenarios
- 20+ automated tests
- Page Object Model pattern
- Multi-browser support (Chrome, Firefox, Safari, Mobile)
- CI/CD integration ready

---

### `test-scenarios/` - Test Scenarios

**Purpose**: Playwright MCP test scenarios for manual/automated testing

**Structure**:
- `homepage/` - Guest user tests
- `member/` - Member page tests
- `admin/` - Admin page tests
- `integration/` - End-to-end workflow tests
- `runner/` - Test runner implementation

**Key Files**:
- `README.md` - Test scenario overview
- `runner/README.md` - Test runner documentation

**Test Categories**:
- Guest quotation creation
- Member order management
- Admin approval workflows
- Integration E2E tests

---

### `ui-improvements/` - UI Enhancement Documentation

**Purpose**: UI/UX improvement documentation and design guides

**Key Files**:
- `README.md` - Complete implementation summary
- `QUOTATIONS_BUTTON_DESIGN.md` - Button design specification
- `BUTTON_VISUAL_GUIDE.md` - Visual reference guide
- `BUTTON_DESIGN_한국어_요약.md` - Korean summary
- `BEFORE_AFTER_COMPARISON.md` - Before/after comparison
- `japanese-name-input-improvements.md` - Japanese name input enhancements

**Design Improvements**:
- Modern button design system
- Color theme consistency (Brixa variables)
- Micro-interactions (hover effects, animations)
- Enhanced accessibility (focus states, reduced motion)
- Zero performance degradation (GPU-accelerated)

---

## For AI Agents

### Working in This Directory

**Documentation Languages**:
- Primary: English (technical docs)
- Secondary: Japanese (ビジネス文書)
- Tertiary: Korean (한국어 문서)

**Key Documentation Patterns**:
- API specs in OpenAPI 3.0 format (`api/`)
- UI/UX design in component-spec format (`references/uiux-design/`)
- Cost calculation in step-by-step guides (`reports/calcultae/`)
- Test scenarios in Playwright format (`test-scenarios/`)

### Common Workflows

**API Development**:
1. Read `api/B2B_WORKFLOW_API_SPECIFICATION.md` for endpoint details
2. Check `api/B2B_DATABASE_ERD.md` for table relationships
3. Reference `api/openapi-b2b-workflow.yaml` for request/response formats

**UI Development**:
1. Check `references/uiux-design/component-specifications.md` for component specs
2. Review `ui-improvements/README.md` for design patterns
3. Follow `code-review-2025-01-18/components/structure.md` for existing components

**Bug Investigation**:
1. Check `console.md` for error patterns
2. Review relevant issue analysis files
3. Check `code-review-2025-01-18/` for known issues

**Feature Development**:
1. Read `current/PRD_BUSINESS_v5.0.md` for business requirements
2. Check `current/TASK_TECHNICAL_v5.0.md` for technical specs
3. Reference `references/` for implementation guides

### Dependencies

**External Documentation**:
- Next.js 16: https://nextjs.org/docs
- React 19: https://react.dev
- Supabase: https://supabase.com/docs
- Playwright: https://playwright.dev

**Internal Dependencies**:
- `src/types/database.ts` - TypeScript type definitions
- `src/lib/` - Implementation libraries
- `tests/` - Test implementations

---

## Maintenance Notes

**Document Lifecycle**:
- `current/` - Active development
- `api/` - Stable (v1.0)
- `references/` - Stable reference
- `archive/` - Historical only
- `code-review-2025-01-18/` - Snapshot (January 2025)

**Update Guidelines**:
- PRD changes → update `current/PRD_BUSINESS_v5.0.md`
- API changes → update `api/` files
- New features → add to `current/TASK_TECHNICAL_v5.0.md`
- UI changes → document in `ui-improvements/`

**Multi-language Coordination**:
- Japanese docs target Japanese market requirements
- Korean docs cover Korean production processes
- English docs serve as technical reference

---

**Last Updated**: 2026-02-08
**Document Version**: 1.0
**Total Files**: 100+ markdown documents
