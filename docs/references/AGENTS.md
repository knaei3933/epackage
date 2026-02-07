<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-08 | Updated: 2026-02-08 -->

# docs/references/ - Reference Documentation Directory

## Purpose

Comprehensive reference documentation for the Epackage Lab B2B e-commerce platform. Contains technical specifications, design documents, implementation guides, security best practices, performance optimization strategies, and research materials for various system components.

## Key Files

| File | Description |
|------|-------------|
| `quote-system-integration-strategy.md` | Strategy for unifying quote simulator systems |
| `pdf-system-design.md` | PDF generation system architecture and specifications |
| `pdf-system-summary.md` | PDF system implementation summary |
| `pdf-api-specification.md` | PDF API endpoint specifications |
| `pdf-data-flow-and-storage.md` | PDF data flow and storage architecture |
| `excel-quotation-system-design.md` | Excel-based quotation system design |
| `quote-to-order-conversion.md` | Quote to order workflow conversion |
| `production-tracking-implementation.md` | Production tracking system implementation |
| `supabase-storage-setup.md` | Supabase storage configuration guide |
| `file-validation-system.md` | File upload validation system |
| `loading-error-handling.md` | Loading state and error handling patterns |
| `ADVANCED_FILTERING_GUIDE.md` | Advanced filtering implementation guide |

## Subdirectories

### `uiux-design/` - UI/UX Design Specifications

**Purpose**: B2B workflow UI/UX design documentation and component specifications

**Key Files**:
- `README.md` - Design overview and quick start guide
- `b2b-workflow-design.md` - Main B2B workflow design document (49KB)
- `component-specifications.md` - Detailed UI component specifications (40KB)
- `user-journey-map.md` - User journey mapping and personas (30KB)
- `design-system-guide.md` - Design system guidelines (18KB)
- `design-system-summary.md` - Design system summary (12KB)
- `visual-summary.md` - Visual design reference (75KB)

**10-Step B2B Workflow**:
1. Registration (/member/registration)
2. Quotation (/member/quotations/request)
3. Order (/member/orders/[id])
4. Data Entry (/member/orders/[id]/data-upload)
5. Work Order (/member/orders/[id]/work-order)
6. Contract (/admin/orders/[id]/contract)
7. Signing (/member/orders/[id]/contract)
8. Production (/member/orders/[id]/production)
9. Stock In (/admin/orders/[id]/stock)
10. Shipment (/member/orders/[id]/shipment)

**Component Priority**:
- **P0**: WorkflowTimeline, WorkflowStatusBadge
- **P1**: DocumentViewer, FileUploader
- **P2**: SignatureCanvas, ProductionTimeline
- **P3**: ShipmentTracker

**Technology Stack**:
- Framework: Next.js 16 (App Router)
- UI: React 19 + TypeScript + Tailwind CSS 4
- State: React Context + Zustand
- Forms: React Hook Form + Zod
- PDF: PDF.js (viewer), jsPDF (generation)
- Upload: React Dropzone + Supabase Storage

---

### `security/` - Security Best Practices

**Purpose**: Security guidelines and implementation patterns

**Key Files**:
- `SECURITY_BEST_PRACTICES.md` - Comprehensive security guide (19KB)

**Coverage Areas**:
1. File Upload Security
2. API Security
3. Authentication & Authorization
4. Data Validation
5. SQL Injection Prevention
6. XSS Prevention
7. CSRF Protection
8. Environment Variables
9. Dependency Security
10. Logging & Monitoring

**Core Principles**:
- Never trust file extensions - Use magic number validation
- Limit file sizes - Enforce maximum upload size
- Validate content - Scan for malicious patterns
- Block executables - Reject all executable file types
- Sanitize filenames - Remove special characters and paths

**Key Module**:
- Location: `src/lib/file-validator/security-validator.ts`

---

### `performance/` - Performance Optimization

**Purpose**: Performance optimization strategies and implementation guides

**Key Files**:
- `PERFORMANCE_OPTIMIZATION.md` - Performance optimization summary (5KB)
- `PERFORMANCE_OPTIMIZATION_GUIDE.md` - Detailed optimization guide (8KB)
- `PERFORMANCE_OPTIMIZATION_REPORT.md` - Performance optimization report (7KB)

**Implemented Optimizations**:

1. **SEO Enhancements**
   - metadataBase fix
   - Open Graph metadata
   - Structured Data (JSON-LD)
   - Dynamic robots.txt and sitemap.xml
   - Japanese SEO optimization

2. **Image Optimization**
   - WebP/AVIF support
   - Responsive images
   - Lazy loading (Intersection Observer)
   - Low-quality placeholders (blur-up)
   - Progressive enhancement

3. **Bundle Optimization**
   - Code splitting (dynamic imports)
   - Tree shaking
   - Bundle analyzer (@next/bundle-analyzer)
   - Critical CSS inlining
   - Dead code elimination

4. **Caching Strategy**
   - Service Worker (offline-first)
   - HTTP caching (1 year for static assets)
   - API response caching
   - Browser Cache-Control headers

5. **React Performance**
   - Memoization (React.memo, useMemo, useCallback)
   - Virtual scrolling
   - Debouncing (search/input)
   - Intersection Observer (lazy loading)

6. **Monitoring**
   - Web Vitals (RUM)
   - Performance dashboard
   - Error tracking

---

### `email-templates/` - Email Template Configuration

**Purpose**: Email template setup and provider configuration guides

**Key Files**:
- `EMAIL_TEMPLATES_JA.md` - Japanese email templates (16KB)
- `SENDGRID_DNS_SETUP.md` - SendGrid DNS configuration (12KB)
- `SENDGRID_SMTP_SETUP.md` - SendGrid SMTP setup (7KB)
- `SENDGRID_API_KEY_SETUP.md` - SendGrid API key setup (7KB)
- `SUPABASE_SMTP_SETUP.md` - Supabase SMTP configuration (4KB)
- `aws-ses-setup-guide.md` - AWS SES setup guide (6KB)

**Supported Providers**:
- SendGrid (primary)
- AWS SES (alternative)
- Supabase SMTP (built-in)

**Email Types**:
- Registration confirmation
- Quotation notifications
- Order status updates
- Shipment notifications
- Password reset
- System alerts

---

### `research/` - Research Documents

**Purpose**: Research and analysis documents for AI features and competitor analysis

**Key Files**:
- `ai-spec-extraction-system-design.md` - AI spec extraction system design (47KB)
- `brixa-flow-analysis.md` - Brixa competitor workflow analysis (17KB)
- `ai-extraction-system-design.md` - AI extraction system design (28KB)
- `ai-extraction-summary.md` - AI extraction summary (12KB)
- `ai-spec-extraction-implementation-summary.md` - AI spec extraction implementation summary (5KB)

**Research Areas**:
- AI-powered specification extraction from .ai/PDF files
- Competitor workflow analysis (Brixa)
- Automated quotation processing
- Document parsing and data extraction
- Machine learning model integration

---

## For AI Agents

### Working in This Directory

**Documentation Languages**:
- Primary: English (technical specifications)
- Secondary: Japanese (UI/UX design docs)
- Tertiary: Korean (not used in this directory)

**Key Documentation Patterns**:
- Design docs use Korean/Japanese mixed format (`uiux-design/`)
- Security docs follow bilingual format (English/Japanese)
- Performance docs in English with technical focus
- Research docs in English with Japanese business context

### Common Workflows

**UI Development**:
1. Read `uiux-design/README.md` for overview
2. Check `uiux-design/b2b-workflow-design.md` for workflow details
3. Reference `uiux-design/component-specifications.md` for component specs
4. Follow component priority (P0 → P3)

**Security Implementation**:
1. Read `security/SECURITY_BEST_PRACTICES.md` for guidelines
2. Implement file validation using `src/lib/file-validator/`
3. Follow security checklists for each feature

**Performance Optimization**:
1. Review `performance/PERFORMANCE_OPTIMIZATION.md` for current status
2. Check `performance/PERFORMANCE_OPTIMIZATION_GUIDE.md` for strategies
3. Implement optimizations following priority order

**PDF System Development**:
1. Read `pdf-system-design.md` for architecture
2. Check `pdf-api-specification.md` for endpoint details
3. Reference `pdf-data-flow-and-storage.md` for data flow

**Email System Setup**:
1. Choose provider (SendGrid/AWS SES/Supabase SMTP)
2. Follow corresponding setup guide in `email-templates/`
3. Configure templates in `src/lib/email/`

**Research Implementation**:
1. Read relevant research doc in `research/`
2. Check implementation summaries
3. Follow design documents for AI features

### Dependencies

**External Documentation**:
- Next.js 16: https://nextjs.org/docs
- React 19: https://react.dev
- Supabase: https://supabase.com/docs
- PDF.js: https://mozilla.github.io/pdf.js/
- jsPDF: https://github.com/parallax/jsPDF
- SendGrid: https://docs.sendgrid.com

**Internal Dependencies**:
- `src/lib/file-validator/` - File validation implementation
- `src/lib/pdf/` - PDF generation logic
- `src/lib/email/` - Email template implementations
- `src/components/` - UI components
- `src/types/` - TypeScript type definitions

---

## Maintenance Notes

**Document Lifecycle**:
- `uiux-design/` - Active (B2B workflow development)
- `security/` - Stable (best practices)
- `performance/` - Stable (implemented optimizations)
- `email-templates/` - Stable (provider configurations)
- `research/` - Reference (AI feature research)

**Update Guidelines**:
- UI changes → update `uiux-design/` documents
- Security issues → update `security/SECURITY_BEST_PRACTICES.md`
- Performance improvements → update `performance/` documents
- New providers → add setup guide to `email-templates/`
- AI research → add to `research/` directory

**Cross-Reference**:
- API specs: See `../api/` for detailed API documentation
- Database: See `../api/B2B_DATABASE_ERD.md` for database schema
- Implementation: See `../../src/` for code implementation
- Testing: See `../testing/` for test documentation

---

## Document Statistics

**Total Files**: 20+ markdown documents
**Total Size**: ~400KB
**Languages**: English (primary), Japanese (UI/UX), Korean (minimal)
**Last Updated**: 2026-02-08

---

**Quick Navigation**:
- [Parent Documentation](../AGENTS.md)
- [API Documentation](../api/README.md)
- [Testing Documentation](../testing/README.md)
- [Code Review Results](../code-review-2025-01-18/README.md)
