# Epackage Lab Website - Additional Requirements PRD

## Executive Summary

Based on the latest modification requirements, this PRD outlines critical updates needed to enhance the Epackage Lab website functionality, UX/UI, and business capabilities. These requirements focus on brand consistency, menu optimization, quote system integration, and customer experience improvements.

## Current Status Overview

### ✅ Previously Completed (100%):
- Brand color system (#5EB6AC, #2F333D) - 100% Complete
- Header navigation optimization - 100% Complete
- Post-processing preview functionality - 100% Complete
- Catalog download system - 100% Complete
- Data template functionality - 100% Complete
- File naming standardization - 100% Complete
- Hydration error fixes - 100% Complete

### 🔄 New Requirements (Need Implementation):
1. Brand Color Consistency Verification - 0% complete
2. Product Catalog Menu Refinements - 0% complete
3. Service Menu Header Duplication Fix - 0% complete
4. Quote System Integration & Enhancement - 0% complete
5. Post-Processing Preview Enhancement - 0% complete
6. Catalog Download System Enhancement - 0% complete

---

## Feature Requirements

### Priority 1: Brand Color System Verification

#### 1.1 Complete Brand Color Application
**Business Requirement**: Ensure consistent application of #5EB6AC (green) and #2F333D (navy) across all pages
**Current Status**: 0% Complete
**Priority**: High

**Technical Requirements**:
- Target Files: All components, globals.css, tailwind.config.ts
- Verify color consistency across all pages
- Ensure proper CSS variable usage
- Validate brand color application in dark mode

**Acceptance Criteria**:
- [ ] All pages consistently use brand colors #5EB6AC and #2F333D
- [ ] No remaining legacy colors in any component
- [ ] Color contrast meets accessibility standards
- [ ] Mobile responsive design maintains brand colors

---

### Priority 2: Product Catalog Menu Refinements

#### 2.1 Menu Item Naming and Structure Updates
**Business Requirement**: Refine product catalog dropdown menu with correct Japanese naming
**Current Status**: 0% Complete
**Priority**: High

**Specific Changes Required**:
- "スタンディングパウチ" → "スタンドパウチ" (Standing → Stand Pouch)
- "三方シール平袋" → "平袋" (Three-side Seal Flat → Flat Pouch)
- "チャック付き平袋" positioning: Move above other items
- Remove: "ソフトパウチ" (Soft Pouch), "特集しようパウチ" (Featured Pouch), "業界別ソリューション" (Industry Solutions)

**Technical Requirements**:
- Target Files: `/src/components/layout/Header.tsx`
- Update menu labels and ordering
- Remove specified menu items
- Ensure proper spacing and visual hierarchy

**Acceptance Criteria**:
- [ ] All Japanese menu names correctly updated
- [ ] Menu reordering implemented as specified
- [ ] Removed items completely eliminated from dropdown
- [ ] Mobile responsive menu works correctly
- [ ] No broken links or references

---

### Priority 3: Service Menu Header Duplication Fix

#### 3.1 Header Duplication Bug Resolution
**Business Requirement**: Fix duplicate header issue when clicking Service menu
**Current Status**: 0% Complete
**Priority**: High

**Problem Description**:
When users click the "サービス" (Service) menu button, two headers appear instead of one, causing UX confusion.

**Technical Requirements**:
- Target Files: `/src/components/layout/Header.tsx`, Service-related components
- Identify root cause of header duplication
- Fix rendering logic or state management issues
- Test all service menu interactions

**Acceptance Criteria**:
- [ ] Service menu click shows single header only
- [ ] All service pages display correctly
- [ ] Mobile responsive service menu works properly
- [ ] No console errors related to header rendering
- [ ] Cross-browser compatibility verified

---

### Priority 4: Quote System Integration & Enhancement

#### 4.1 Unified Quote System Implementation
**Business Requirement**: Consolidate quote functionality and enhance UX
**Current Status**: 0% Complete
**Priority**: High

**Requirements**:
- Merge quote-simulator/ design with roi-calculator/ functionality
- Implement both drag AND manual input for size settings
- Remove unit prices and setup fees from public display
- Create single, cohesive quote experience

**Technical Requirements**:
- Target Files: `/src/app/roi-calculator/`, `/src/app/quote-simulator/` (if exists)
- Unified quote interface with dual input methods
- Backend API modifications for price hiding
- Enhanced UX for size selection
- Mobile-responsive quote interface

**Acceptance Criteria**:
- [ ] Single unified quote system implemented
- [ ] Both drag and manual input available for all size parameters
- [ ] Unit prices and setup fees hidden from public users
- [ ] Admin users can access complete pricing (if applicable)
- [ ] Mobile-optimized quote interface
- [ ] Real-time quote calculations working properly

---

### Priority 5: Post-Processing Preview Enhancement

#### 5.1 Integrated Preview System
**Business Requirement**: Enhance post-processing preview integration in quote system
**Current Status**: 0% Complete
**Priority**: Medium

**Requirements**:
- Show visual previews when customers select processing options
- Use images from `/images/post-processing/` folder (14 processing types)
- Allow customers to understand processing results before and after selection
- Integrate seamlessly into quote workflow

**Technical Requirements**:
- Target Files: `/src/components/quote/PostProcessingPreview.tsx`
- Dynamic preview system based on selection
- Tooltip/modal display for processing options
- Performance optimization for real-time updates
- Image optimization for web performance

**Acceptance Criteria**:
- [ ] Visual previews appear for processing selections
- [ ] All 14 processing type images integrated
- [ ] Smooth interaction with tooltips/modals
- [ ] Mobile-responsive preview system
- [ ] Performance optimized (no lag on selection changes)

---

### Priority 6: Catalog Download System Enhancement

#### 6.1 PDF Download Functionality
**Business Requirement**: Enable customers to download company catalog from overview page
**Current Status**: 0% Complete
**Priority**: Medium

**Requirements**:
- Implement download for PDF catalog from `/images/catalog/` folder
- Add download button on company overview page
- Email capture for catalog download (lead generation)
- Download analytics tracking

**Technical Requirements**:
- Target Files: `/src/app/about/page.tsx`, `/src/app/api/catalog-download/`
- Large file download optimization
- Email validation before download
- Progress indicators for large file downloads
- Analytics integration for download tracking

**Acceptance Criteria**:
- [ ] Catalog download functional from company overview page
- [ ] Email capture implemented for lead generation
- [ ] Download progress indicators for large files
- [ ] Analytics tracking for download metrics
- [ ] Cross-browser compatibility verified

---

## Technical Implementation Strategy

### Phase 1: Critical Fixes (Week 1)
1. **Brand Color Consistency Verification** - Quick visual audit and fixes
2. **Product Catalog Menu Refinements** - Text changes and reordering
3. **Service Menu Header Duplication Fix** - Bug investigation and resolution

### Phase 2: Feature Enhancement (Week 2)
4. **Quote System Integration & Enhancement** - Complex system integration
5. **Post-Processing Preview Enhancement** - UX improvements with image integration
6. **Catalog Download System Enhancement** - File system integration

### Quality Assurance Requirements

### Testing Checklist:
- [ ] All brand colors applied consistently across pages
- [ ] Product catalog menu items correctly named and ordered
- [ ] Service menu header duplication resolved
- [ ] Quote system unified with dual input methods
- [ ] Post-processing previews working smoothly
- [ ] Catalog download functional with email capture

### Performance Testing:
- [ ] Page load speed testing (before/after changes)
- [ ] Quote system performance with dual input methods
- [ ] Mobile responsiveness testing across all new features
- [ ] Cross-browser compatibility validation
- [ ] Accessibility compliance testing (WCAG 2.1 AA)

### Security Testing:
- [ ] File download security validations
- [ ] Input sanitization for manual size inputs
- [ ] Rate limiting for catalog downloads
- [ ] Email validation and security

---

## Conclusion

This PRD outlines a comprehensive plan to implement the additional requirements for the Epackage Lab website. The focus is on enhancing user experience, ensuring brand consistency, and improving business functionality through systematic feature enhancement and bug fixes.

The phased approach ensures systematic completion with minimal risk, while the detailed acceptance criteria provide clear validation for each feature. Success will be measured through both technical performance metrics and business impact indicators.

**Expected Outcome**: Enhanced website functionality with improved UX, consistent branding, and integrated quote system capabilities.