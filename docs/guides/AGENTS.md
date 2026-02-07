<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-08 | Updated: 2026-02-08 -->

# docs/guides/ - Implementation Guides

## Purpose

Step-by-step implementation guides for Epackage Lab B2B e-commerce platform features. Contains practical documentation for developers implementing design systems, UI components, catalog functionality, and performance optimizations.

## Key Files

| File | Description |
|------|-------------|
| `DESIGN_SYSTEM.md` | Complete design system specifications with Tailwind CSS 4 setup, component APIs, color system, typography, and accessibility guidelines |
| `CATALOG_README.md` | Product catalog implementation guide with dynamic routing, search functionality, filtering, and multilingual support |
| `HERO_ENHANCEMENT_REPORT.md` | Hero section enhancement report with performance optimizations, image optimization, and business impact metrics |
| `IMPLEMENTATION_GUIDE.md` | Post-processing UI redesign implementation guide with modern UX patterns, accessibility, testing, and deployment strategies |

## Document Details

### DESIGN_SYSTEM.md

**Purpose**: Comprehensive design system documentation for Epackage Lab

**Key Sections**:
- Design system features (Tailwind CSS 4, dark mode, metallic design)
- UI components (Button, Input, Card, Badge, Selector)
- Layout system (Container, Grid, Flex)
- Installation and setup instructions
- Component APIs with TypeScript interfaces
- Color system (brand, semantic, neutral)
- Typography for Japanese/Korean
- Accessibility (WCAG 2.1 AA)
- Browser support
- Development guide

**Dependencies**:
- `class-variance-authority`: ^0.7.1
- `clsx`: ^2.1.1
- `lucide-react`: ^0.554.0
- `tailwind-merge`: ^3.4.0
- `@tailwindcss/postcss`: ^4
- `tailwindcss`: ^4

**Related Components**:
- `src/components/ui/` - UI component implementations
- `src/components/theme/ThemeProvider.tsx` - Theme management
- `tailwind.config.ts` - Theme configuration
- `src/app/globals.css` - CSS custom properties

---

### CATALOG_README.md

**Purpose**: Product catalog implementation guide (Japanese/English)

**Key Sections**:
- Implemented features (dynamic routing, search, filtering)
- 6 package types (Standard, Premium, Eco-Friendly, Luxury, Industrial, Custom)
- Technical specifications (Next.js 16, React 19, TypeScript)
- Component structure and file organization
- Data structure (PackageProduct, PackageFeatures, PackageSpecs)
- Performance optimizations (SSG, image optimization, memoization)
- Multilingual support (Japanese, English, Korean)
- SEO optimization
- Navigation integration
- Usage examples
- Future enhancements

**Related Components**:
- `src/app/catalog/page.tsx` - Main catalog page
- `src/app/catalog/[slug]/page.tsx` - Dynamic product detail page
- `src/components/catalog/` - Catalog components
- `src/contexts/CatalogContext.tsx` - Catalog state management
- `src/data/catalogData.ts` - Product data
- `src/lib/catalogUtils.ts` - Search/filter logic
- `src/types/catalog.ts` - Type definitions
- `src/locales/` - Translations (ja, en, ko)

---

### HERO_ENHANCEMENT_REPORT.md

**Purpose**: Hero section enhancement documentation with performance metrics

**Key Sections**:
- Project overview
- Completed enhancements (background images, messaging, CTAs, value propositions)
- Performance improvements (91% image size reduction)
- Design system updates (typography, colors, animations)
- Technical implementation (WebP optimization, performance monitoring)
- Business impact expected (conversion rate, UX improvements)
- Success metrics
- Deployment notes

**Performance Metrics**:
- Image optimization: 2.43MB → 0.22MB (91% reduction)
- LCP: < 2.5s (from ~3.8s)
- CLS: < 0.1 (from ~0.15)
- FID: < 100ms (from ~150ms)

**Expected Business Impact**:
- CTA Click Rate: +35%
- Bounce Rate: -20%
- Time on Page: +40%
- Sample Requests: +25%

**Related Files**:
- `src/app/page.tsx` - Hero section implementation
- `src/components/PerformanceMonitor.tsx` - Performance tracking
- `scripts/optimize-images.js` - Image optimization script
- `public/images/hero-*.webp` - Optimized background images

---

### IMPLEMENTATION_GUIDE.md

**Purpose**: Post-processing UI redesign implementation guide

**Key Sections**:
- Current problems addressed
- File structure
- Implementation steps (config, components, workflow)
- Usage examples (basic, full workflow)
- Styling and theming (CSS custom properties, breakpoints)
- Accessibility implementation (ARIA, keyboard navigation, focus management)
- Performance optimizations (lazy loading, memoization, virtual scrolling)
- Testing setup (unit, integration, E2E with Playwright)
- Deployment strategy (feature flags, A/B testing, full rollout)
- Monitoring and analytics
- Migration checklist

**Key Components**:
- `ModernPostProcessingSelector.tsx` - Category-based selector
- `InteractiveProductPreview.tsx` - Real-time preview
- `SmartRecommendations.tsx` - AI-powered suggestions
- `RedesignedPostProcessingWorkflow.tsx` - Complete workflow

**Issues Resolved**:
- Information overload (3-column → category-based)
- Poor categorization (technical → user-centric)
- Complex visual hierarchy (multiple controls → guided workflow)
- Selection complexity (no guidance → smart recommendations)
- Visual noise (cluttered → clean design)

---

## For AI Agents

### Working in This Directory

**Documentation Languages**:
- Primary: English (technical guides)
- Secondary: Japanese (ビジネス文書 in CATALOG_README.md)
- Tertiary: Korean (DESIGN_SYSTEM.md)

**Key Guide Patterns**:
- Design system specs in component API format
- Implementation guides with step-by-step instructions
- Enhancement reports with metrics and business impact
- Technical implementation with code examples

### Common Workflows

**UI Development**:
1. Check `DESIGN_SYSTEM.md` for component APIs and styling
2. Review `IMPLEMENTATION_GUIDE.md` for UX patterns
3. Reference `HERO_ENHANCEMENT_REPORT.md` for performance optimizations

**Feature Implementation**:
1. Read `IMPLEMENTATION_GUIDE.md` for step-by-step approach
2. Follow `DESIGN_SYSTEM.md` for component consistency
3. Check `CATALOG_README.md` for similar patterns

**Performance Optimization**:
1. Review `HERO_ENHANCEMENT_REPORT.md` for optimization techniques
2. Check `IMPLEMENTATION_GUIDE.md` for performance patterns
3. Follow `DESIGN_SYSTEM.md` for efficient component design

**Multilingual Features**:
1. Reference `CATALOG_README.md` for i18n patterns
2. Check `DESIGN_SYSTEM.md` for typography optimization

### Dependencies

**External Documentation**:
- Tailwind CSS 4: https://tailwindcss.com/docs
- Next.js 16: https://nextjs.org/docs
- React 19: https://react.dev
- Framer Motion: https://www.framer.com/motion/
- Sharp (image optimization): https://sharp.pixelplumbing.com/

**Internal Dependencies**:
- `src/components/ui/` - UI component implementations
- `src/components/quote/` - Quote system components
- `src/lib/` - Utility libraries
- `src/types/` - TypeScript type definitions
- `tailwind.config.ts` - Theme configuration
- `src/app/globals.css` - Global styles

---

## Maintenance Notes

**Document Lifecycle**:
- `DESIGN_SYSTEM.md` - Living document (update with component changes)
- `CATALOG_README.md` - Stable (update with major catalog features)
- `HERO_ENHANCEMENT_REPORT.md` - Snapshot (January 2025)
- `IMPLEMENTATION_GUIDE.md` - Reference (update with major UX changes)

**Update Guidelines**:
- New UI components → update `DESIGN_SYSTEM.md`
- New catalog features → update `CATALOG_README.md`
- Performance improvements → document enhancement reports
- UX changes → update `IMPLEMENTATION_GUIDE.md`

**Guide Organization**:
- Design patterns → `DESIGN_SYSTEM.md`
- Feature implementation → `IMPLEMENTATION_GUIDE.md`
- Reference implementations → `CATALOG_README.md`
- Enhancement reports → `HERO_ENHANCEMENT_REPORT.md`

---

**Last Updated**: 2026-02-08
**Document Version**: 1.0
**Total Files**: 4 implementation guides
