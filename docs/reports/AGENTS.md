<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-08 | Updated: 2026-02-08 -->

# docs/reports/ - Project Reports and Analysis Directory

## Purpose

Centralized repository for detailed analysis reports, cost calculation guides, workflow reviews, and historical implementation summaries. Contains multilingual documentation (English, Japanese, Korean) covering business logic, pricing calculations, and system architecture analysis.

## Key Files

| File | Description | Language |
|------|-------------|----------|
| `workflow-review-2025-01-30.md` | B2B 12-stage workflow implementation status and review | Japanese |
| `calcultae/00-README.md` | Pouch cost calculation guide overview (index) | Japanese |
| `calcultae/01-용어_및_기본개념.md` | Basic terminology and concepts | Korean |
| `calcultae/02-필름폭_계산공식.md` | Film width calculation formulas | Korean |
| `calcultae/03-열수_판정_및_원반선정.md` | Column count judgment and roll selection | Korean |
| `calcultae/04-미터수_및_원가_계산.md` | Meter length and cost calculation | Korean |
| `calcultae/05-가공비용_계산.md` | Processing cost calculation | Korean |
| `calcultae/06-마진_및_최종가격.md` | Margin and final pricing | Korean |
| `calcultae/07-SKU_및_병렬생산.md` | SKU concept and parallel production | Korean |
| `calcultae/08-비즈니스_시나리오_모음.md` | Business scenario index | Korean |

## Subdirectories

### `calcultae/` - Pouch Cost Calculation Guide

**Purpose**: Comprehensive guide for pouch and roll film cost calculations

**Structure**:
- Main guide files (01-07): Step-by-step calculation methodology
- `시나리오_상세/` (Scenarios): Detailed calculation scenarios with examples

**Main Files**:
| File | Content |
|------|---------|
| `00-README.md` | Guide overview and quick start |
| `01-용어_및_기본개념.md` | Basic variables (H, W, G, Q) definitions |
| `02-필름폭_계산공식.md` | Film width formulas for all pouch types |
| `03-열수_판정_및_원반선정.md` | 2-column auto-detection logic |
| `04-미터수_및_원가_계산.md` | Theoretical meter length and material cost |
| `05-가공비용_계산.md` | Printing, lamination, slitting, bag-making costs |
| `06-마진_및_최종가격.md` | Customs, shipping, margin, final pricing |
| `07-SKU_및_병렬생산.md` | SKU-based costing and parallel production |
| `08-비즈니스_시나리오_모음.md` | Index to `시나리오_상세/` folder scenarios |

**시나리오_상세/ (Detailed Scenarios)**:
- `01-기본_평백_예시.md` - Basic flat pouch example
- `02-소량생산_시나리오.md` - Small quantity production scenario
- `03-중량생산_시나리오.md` - Medium quantity production scenario
- `04-대량생산_시나리오.md` - Large quantity production scenario
- `05-스탠드파우치_시나리오.md` - Stand-up pouch scenario
- `06-박스파우치_시나리오.md` - Box pouch scenario
- `07-롤필름_시나리오.md` - Roll film scenario
- `08-파우치타입별_비교.md` - Pouch type comparison
- `09-할인효과_분석.md` - Discount effect analysis
- `10-더블업_전략.md` - Double-up strategy
- `11-실제견적_시뮬레이션_및_결론.md` - Actual quotation simulation and conclusions

**Key Formulas**:

```
Final Price (JPY) = (Base Cost × 1.4 × 0.12 + Customs + Shipping) × 1.2

Where:
- × 1.4 = Manufacturer margin 40%
- × 0.12 = Exchange rate (JPY conversion)
- × 0.05 = Customs duty 5% (calculated in JPY)
- Shipping = 15,358 JPY (excluded from margin calculation)
- × 1.2 = Seller margin 20%
```

**Common Rules (All Product Types)**:
| Item | Value | Description |
|------|-------|-------------|
| **Printing Cost** | Always **1m** | Independent of film width |
| **Loss** | **400m fixed/group** | Per SKU group with same pitch/width |
| **Lamination Unit (AL)** | 75 KRW/m | With aluminum material |
| **Lamination Unit (no AL)** | 65 KRW/m | Without aluminum |
| **Shipping** | 127,980 KRW/box | Max 29kg/box |

---

### `tjfrP/` - Product Analysis Reports

**Purpose**: Product-specific analysis and calculation documentation

**Subdirectories**:
- `old/` - Legacy product analysis documents

**Key Files** (in old/):
- `POUCH_FORMULAS.md` - Pouch formula definitions
- `原価計算.md` - Cost calculation details (Japanese)
- `설계도.md` - Design diagrams (Korean)
- `가공단가.md` - Processing unit prices (Korean)
- `중량별무게.md` - Weight by thickness (Korean)
- `필름 계산.md` - Film calculations (Korean)
- `계산예시.md` - Calculation examples (Korean)
- `SUPABASE_MCP_TOOLS_COMPLETE.md` - Supabase MCP tools documentation
- `WORKFLOW_GAP_ANALYSIS.md` - Workflow gap analysis
- `CROSS_REFERENCE_INDICES.md` - Cross-reference indices

---

### `old/` - Historical Reports

**Purpose**: Archived reports from previous development phases and implementations

**Report Categories**:

**Code Review & Audit**:
- `CODE_REVIEW_REPORT.md` - Code quality assessment
- `COMPREHENSIVE_CODE_REVIEW_REPORT.md` - Complete code review
- `COMPREHENSIVE_AUDIT_FINAL_REPORT.md` - Final audit report
- `VALIDATION_REPORT_20260102.md` - January 2026 validation
- `REVIEW_REPORT_2026-01-03.md` - January 2026 review

**Security**:
- `SECURITY_SCAN_REPORT.md` - Security scan results
- `SECURITY_AUDIT_REPORT_2026-01-02.md` - Security audit
- `SERVICE_ROLE_KEY_AUDIT.md` - Service role key audit
- `SECURITY_FIX_GETUSER_AUTHENTICATION.md` - Auth fixes
- `SECURITY_FIX_GETUSER_VULNERABILITY.md` - Vulnerability fixes

**Database & API**:
- `DATABASE_ARCHITECTURE_ANALYSIS.md` - DB architecture analysis
- `DATABASE_SCHEMA_AUDIT_REPORT_2026-01-04.md` - Schema audit
- `DATABASE_SCHEMA_VERIFICATION_REPORT.md` - Schema verification
- `DATABASE_INTEGRATION_AUDIT_REPORT.md` - Integration audit
- `API_AUDIT_REPORT_2026-01-04.md` - API audit
- `API_ENDPOINTS_VERIFICATION_REPORT.md` - Endpoint verification
- `API_QUICK_SUMMARY.md` - API summary
- `api-middleware-usage.md` - Middleware usage

**Performance**:
- `PERFORMANCE_ANALYSIS_REPORT.md` - Performance analysis

**Testing**:
- `FINAL_TEST_REPORT.md` - Final test report
- `E2E_TEST_FIX_SUMMARY_2026-01-04.md` - E2E test fixes
- `E2E_VALIDATION_REPORT_2026-01-04.md` - E2E validation
- `CATALOG_E2E_TEST_REPORT.md` - Catalog E2E tests
- `B2B_PAGES_TEST_REPORT.md` - B2B pages tests
- `B2B_BUTTON_AUDIT_REPORT.md` - Button audit
- `MANUAL_TESTING_CHECKLIST.md` - Testing checklist

**Implementation Summaries** (TASK-XXX series):
- Multiple task implementation summaries (TASK-070 through TASK_102)
- Feature completion reports
- Visual guides and verification reports

**System Verification**:
- `FULL_SYSTEM_VERIFICATION_REPORT.md` - Complete system verification
- `COMPLETE_SYSTEM_VERIFICATION_FINAL_REPORT.md` - Final verification
- `REAL_SYSTEM_VERIFICATION_FINAL_REPORT.md` - Real system verification
- `ULTIMATE_VERIFICATION_SUMMARY.md` - Ultimate verification summary
- `ADMIN_DASHBOARD_VERIFICATION_REPORT.md` - Admin dashboard
- `MEMBER_PORTAL_VERIFICATION_REPORT.md` - Member portal

**Deployment & Fixes**:
- `DEPLOYMENT_PREPARATION.md` - Deployment prep
- `NEXTJS_16_COOKIES_FIX_PART4.md` - Next.js 16 cookie fixes
- `SUPABASE_COOKIE_FIX_SUMMARY.md` - Supabase cookie fixes
- `PGRST200_FIX_SUMMARY.md` - PGRST error fixes
- `CONSOLE_ERRORS_AUDIT_FINAL_REPORT.md` - Console errors audit
- `CONSOLE_ERRORS_FIX_SUMMARY.md` - Console errors fix

**Feature Documentation**:
- `QUOTATION_SYSTEM_GUIDE.md` - Quotation system guide
- `ADMIN_NOTIFICATIONS_SYSTEM.md` - Admin notifications
- `SAMPLE_REQUEST_IMPLEMENTATION_REPORT.md` - Sample requests
- `CATALOG_FILTERING_IMPLEMENTATION_REPORT.md` - Catalog filtering
- `ACCOUNT_DELETION_DATA_CLEANUP_REPORT.md` - Account deletion

**Public Pages**:
- `PUBLIC_PAGES_IMPLEMENTATION_REPORT.md` - Public pages implementation
- `PUBLIC_PAGES_COMPLETION_SUMMARY.md` - Public pages completion
- `PUBLIC_PAGES_FUNCTIONALITY_AUDIT.md` - Public pages audit
- `PUBLIC_PAGES_QUICK_REFERENCE.md` - Public pages reference
- `PUBLIC_PAGES_ABOUT_PRIVACY_TERMS.md` - About/Privacy/Terms pages
- `HOMEPAGE_REVIEW_LOGIN_GUIDE.md` - Homepage login guide

**Workflow**:
- `B2B_WORKFLOW_FRONTEND_REVIEW.md` - B2B workflow frontend review
- `workflow-review-2025-01-30.md` - Workflow review (moved to parent)

---

## For AI Agents

### Working in This Directory

**Documentation Languages**:
- Primary: Korean (비즈니스 문서, 원가 계산)
- Secondary: Japanese (ワークフロー, ビジネス文書)
- Tertiary: English (technical reports, summaries)

**Key Documentation Patterns**:
- Cost calculation in step-by-step guides (`calcultae/`)
- Workflow analysis in status review format (`workflow-review-*.md`)
- Historical audits in report format (`old/*_REPORT.md`)
- Product formulas in technical reference format (`tjfrP/old/`)

### Common Workflows

**Cost Calculation Reference**:
1. Start with `calcultae/00-README.md` for overview
2. Reference specific calculation files (02-07) for formulas
3. Check `시나리오_상세/` for practical examples
4. Apply final pricing formula from `06-마진_및_최종가격.md`

**Workflow Status Check**:
1. Read `workflow-review-2025-01-30.md` for current implementation status
2. Check 12-stage workflow table for stage completion
3. Review API route connection diagrams
4. Identify next implementation tasks

**Historical Analysis**:
1. Search `old/` directory by date or topic
2. Check security reports for vulnerability history
3. Review implementation summaries for feature evolution
4. Use verification reports for regression testing

**Product Formula Lookup**:
1. Check `tjfrP/old/POUCH_FORMULAS.md` for formula definitions
2. Reference `calcultae/02-필름폭_계산공식.md` for width calculations
3. Use scenario files for validation examples

### Dependencies

**Internal Dependencies**:
- `src/lib/pricing/` - Pricing implementation logic
- `src/lib/unified-pricing-engine.ts` - Unified pricing calculations
- `src/lib/pouch-cost-calculator.ts` - Pouch-specific calculations
- `src/lib/film-cost-calculator.ts` - Film cost calculations
- `src/types/database.ts` - Database type definitions

**External Dependencies**:
- Supabase: Database schema and pricing tables
- Next.js 16: API routes for pricing calculations
- React: Pricing component implementations

**Related Documentation**:
- `../api/` - API specifications for pricing endpoints
- `../current/PRD_BUSINESS_v5.0.md` - Business requirements
- `../current/TASK_TECHNICAL_v5.0.md` - Technical implementation
- `../references/` - Reference materials and design docs

### Cost Calculation Implementation Reference

**Pricing Engine Location**: `src/lib/unified-pricing-engine.ts`

**Key Constants** (from calcultae guide):
```typescript
const MANUFACTURER_MARGIN = 1.4;      // 40%
const EXCHANGE_RATE = 0.12;           // KRW to JPY
const CUSTOMS_DUTY = 0.05;            // 5%
const SELLER_MARGIN = 1.2;            // 20%
const SHIPPING_COST_JPY = 15358;      // Fixed shipping
const LOSS_METERS = 400;              // Fixed loss per group
const PRINTING_BASE_METERS = 1;       // Always 1m for printing
```

**Film Width Formulas** (from 02-필름폭_계산공식.md):
```typescript
// Flat Pouch (3-side seal)
const flatPouch1Col = (H: number) => (H * 2) + 41;
const flatPouch2Col = (H: number) => (H * 4) + 71;

// Stand-up Pouch
const standupPouch1Col = (H: number, G: number) => (H * 2) + G + 35;
const standupPouch2Col = (H: number, G: number) => (H * 4) + G + 40;

//合掌袋 (T-seal)
const gasshoBag = (W: number) => (W * 2) + 22;

// Box Pouch (M-seal)
const boxPouch = (W: number, G: number) => ((G + W) * 2) + 32;
```

---

## Maintenance Notes

**Document Lifecycle**:
- `calcultae/` - Active cost calculation reference
- `tjfrP/` - Product analysis (stable reference)
- `old/` - Historical archive (read-only)
- `workflow-review-*.md` - Periodic workflow status updates

**Update Guidelines**:
- Cost calculation changes → update `calcultae/` files
- Workflow changes → create new `workflow-review-YYYY-MM-DD.md`
- New analysis → add to `old/` with date prefix
- Product changes → update `tjfrP/old/` formula files

**Multi-language Coordination**:
- Korean docs: Production processes and cost calculations
- Japanese docs: Workflow status and business requirements
- English docs: Technical summaries and implementation reports

---

**Last Updated**: 2026-02-08
**Document Version**: 1.0
**Total Files**: 150+ markdown documents (including old/ subdirectory)
